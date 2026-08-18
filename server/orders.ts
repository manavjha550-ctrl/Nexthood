
import express from 'express';
import { authMiddleware } from './auth.js';
import { and, asc, desc, eq } from 'drizzle-orm';
import { db } from './db/client.js';
import { productImages, products, productVariants } from './db/schema.js';
import { createOrder, getOrdersByUser, getOrder, type CreateOrderInput, type OrderAddressInput, type OrderItemInput } from './db/repositories/orderRepository.js';
import { getSettings } from './db/repositories/settingsRepository.js';
import { validateCoupon } from './db/repositories/couponRepository.js';

export const ordersRouter = express.Router();

interface CheckoutItemPayload {
  productId?: unknown;
  quantity?: unknown;
  size?: unknown;
  color?: unknown;
}

interface CheckoutAddressPayload {
  fullName?: unknown;
  phone?: unknown;
  addressLine?: unknown;
  city?: unknown;
  state?: unknown;
  pincode?: unknown;
  country?: unknown;
}

interface CheckoutPayload {
  id?: unknown;
  orderReference?: unknown;
  email?: unknown;
  items?: unknown;
  shippingAddress?: CheckoutAddressPayload;
  billingAddress?: CheckoutAddressPayload;
  couponCode?: unknown;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isValidAddress(address: CheckoutAddressPayload | undefined): address is Required<CheckoutAddressPayload> {
  return Boolean(
    address &&
    isNonEmptyString(address.fullName) &&
    /^\d{10}$/.test(String(address.phone)) &&
    isNonEmptyString(address.addressLine) &&
    isNonEmptyString(address.city) &&
    isNonEmptyString(address.state) &&
    /^\d{6}$/.test(String(address.pincode))
  );
}

function toOrderAddress(address: Required<CheckoutAddressPayload>): OrderAddressInput {
  return {
    fullName: String(address.fullName).trim(),
    phone: String(address.phone),
    addressLine: String(address.addressLine).trim(),
    city: String(address.city).trim(),
    state: String(address.state).trim(),
    pincode: String(address.pincode),
    country: isNonEmptyString(address.country) ? address.country : 'IN'
  };
}

ordersRouter.use(authMiddleware);

ordersRouter.post('/checkout', async (req, res) => {
  try {
    const payload = req.body as CheckoutPayload;

    if (
      !isNonEmptyString(payload.id) ||
      !isNonEmptyString(payload.orderReference) ||
      !isNonEmptyString(payload.email) ||
      !/^\S+@\S+\.\S+$/.test(payload.email) ||
      !Array.isArray(payload.items) ||
      payload.items.length === 0 ||
      !isValidAddress(payload.shippingAddress) ||
      !isValidAddress(payload.billingAddress)
    ) {
      return res.status(400).json({ error: 'Invalid checkout data' });
    }

    const trustedItems: OrderItemInput[] = [];
    let subtotal = 0;

    for (const rawItem of payload.items as CheckoutItemPayload[]) {
      if (!isNonEmptyString(rawItem.productId) || !Number.isInteger(rawItem.quantity) || Number(rawItem.quantity) < 1) {
        return res.status(400).json({ error: 'Invalid cart item' });
      }

      const quantity = Number(rawItem.quantity);
      const productResult = await db
        .select({ id: products.id, name: products.name, sku: products.sku, price: products.price, stock: products.stock })
        .from(products)
        .where(and(eq(products.id, rawItem.productId), eq(products.status, 'ACTIVE')));
      const product = productResult[0];

      if (!product) {
        return res.status(400).json({ error: 'A product in your bag is no longer available' });
      }

      const variants = await db
        .select()
        .from(productVariants)
        .where(eq(productVariants.productId, product.id));
      const requestedSize = isNonEmptyString(rawItem.size) ? rawItem.size : null;
      const requestedColor = isNonEmptyString(rawItem.color) ? rawItem.color : null;
      const variant = variants.find((candidate) =>
        (!requestedSize || candidate.size === requestedSize) &&
        (!requestedColor || candidate.color === requestedColor)
      );

      if (variants.length > 0 && !variant) {
        return res.status(400).json({ error: `${product.name} is not available in the selected variant` });
      }

      const availableStock = variant ? variant.stock : product.stock;
      if (quantity > availableStock) {
        return res.status(400).json({ error: `${product.name} does not have enough stock` });
      }

      const imageResult = await db
        .select({ imageUrl: productImages.imageUrl })
        .from(productImages)
        .where(eq(productImages.productId, product.id))
        .orderBy(desc(productImages.isPrimary), asc(productImages.sortOrder))
        .limit(1);
      const unitPrice = Number(product.price);
      subtotal += unitPrice * quantity;
      trustedItems.push({
        productId: product.id,
        productName: product.name,
        productSku: variant?.sku || product.sku,
        selectedSize: requestedSize,
        selectedColor: requestedColor || variant?.color || null,
        quantity,
        unitPrice,
        imageUrl: imageResult[0]?.imageUrl || null
      });
    }

    const settings = await getSettings();
    const freeShippingThreshold = Number(settings?.freeShippingThreshold || 0);
    const defaultShippingFee = Number(settings?.defaultShippingFee || 0);
    let shipping = freeShippingThreshold > 0 && subtotal >= freeShippingThreshold ? 0 : defaultShippingFee;
    let discount = 0;
    let couponCode: string | null = null;
    if (isNonEmptyString(payload.couponCode)) {
      const couponResult = await validateCoupon(payload.couponCode, subtotal);
      if (!couponResult.valid) return res.status(400).json({ error: couponResult.error });
      couponCode = couponResult.coupon.code;
      discount = couponResult.discount;
      if (couponResult.coupon.type === 'FREE_SHIPPING') shipping = 0;
    }
    const total = Math.max(0, subtotal - discount + shipping);
    const orderData: CreateOrderInput = {
      id: payload.id,
      orderReference: payload.orderReference,
      userId: req.user?.id || null,
      subtotal,
      discount,
      couponCode,
      shipping,
      tax: 0,
      total,
      items: trustedItems,
      shippingAddress: toOrderAddress(payload.shippingAddress),
      billingAddress: toOrderAddress(payload.billingAddress)
    };
    const order = await createOrder(orderData);
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

ordersRouter.get('/', async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const userOrders = await getOrdersByUser(user.id);
    const formatted = userOrders
      .sort((a, b) => Number(new Date(b.createdAt || 0)) - Number(new Date(a.createdAt || 0)))
      .map(o => ({
        id: o.id,
        orderReference: o.orderReference,
        date: o.createdAt,
        status: o.orderStatus,
        paymentStatus: o.paymentStatus,
        total: Number(o.total)
      }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

ordersRouter.get('/:orderId', async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const order = await getOrder(req.params.orderId);

    if (!order || order.userId !== user.id) {
      return res.status(404).json({ error: 'ORDER NOT FOUND' });
    }

    res.json({
      id: order.id,
      orderReference: order.orderReference,
      date: order.createdAt,
      status: order.orderStatus,
      paymentStatus: order.paymentStatus,
      subtotal: Number(order.subtotal),
      discount: Number(order.discount),
      shipping: Number(order.shipping),
      tax: Number(order.tax),
      total: Number(order.total),
      items: order.items.map((i) => ({
        id: i.id,
        productId: i.productId,
        name: i.productName,
        sku: i.productSku,
        size: i.selectedSize,
        color: i.selectedColor,
        quantity: i.quantity,
        price: Number(i.unitPrice),
        image: i.imageUrl
      })),
      shippingAddress: order.shippingAddress ? {
        fullName: order.shippingAddress.fullName,
        phone: order.shippingAddress.phone,
        addressLine: order.shippingAddress.addressLine,
        city: order.shippingAddress.city,
        state: order.shippingAddress.state,
        pincode: order.shippingAddress.pincode,
        country: order.shippingAddress.country
      } : null,
      billingAddress: order.billingAddress ? {
        fullName: order.billingAddress.fullName,
        phone: order.billingAddress.phone,
        addressLine: order.billingAddress.addressLine,
        city: order.billingAddress.city,
        state: order.billingAddress.state,
        pincode: order.billingAddress.pincode,
        country: order.billingAddress.country
      } : null,
      statusEvents: order.statusEvents.map((event) => ({
        id: event.id,
        previousStatus: event.previousStatus,
        newStatus: event.newStatus,
        changedBy: event.changedBy,
        timestamp: event.timestamp
      }))
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});
