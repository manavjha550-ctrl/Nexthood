import { db } from '../client.js';
import { orders, orderItems, orderAddresses, orderStatusEvents, products, productVariants } from '../schema.js';
import { eq, and, gte, sql } from 'drizzle-orm';

export interface OrderAddressInput {
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface OrderItemInput {
  productId: string;
  productName: string;
  productSku: string | null;
  selectedSize: string | null;
  selectedColor: string | null;
  quantity: number;
  unitPrice: number;
  imageUrl: string | null;
}

export interface CreateOrderInput {
  id: string;
  orderReference: string;
  userId: string | null;
  subtotal: number;
  discount: number;
  couponCode?: string | null;
  shipping: number;
  tax: number;
  total: number;
  items: OrderItemInput[];
  shippingAddress: OrderAddressInput;
  billingAddress: OrderAddressInput;
}

export async function createOrder(data: CreateOrderInput) {
  return await db.transaction(async (tx) => {
    // Insert order
    const orderResult = await tx.insert(orders).values({
      id: data.id,
      orderReference: data.orderReference,
      userId: data.userId,
      subtotal: String(data.subtotal),
      discount: String(data.discount),
      couponCode: data.couponCode || null,
      shipping: String(data.shipping),
      tax: String(data.tax),
      total: String(data.total),
      orderStatus: 'PENDING',
      paymentStatus: 'PENDING'
    }).returning();

    const order = orderResult[0];

    // Insert items and deduct stock
    for (const item of data.items) {
      await tx.insert(orderItems).values({
        orderId: data.id,
        productId: item.productId,
        productName: item.productName,
        productSku: item.productSku,
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor,
        quantity: item.quantity,
        unitPrice: String(item.unitPrice),
        imageUrl: item.imageUrl
      });

      // Deduct stock
      if (item.selectedSize || item.selectedColor) {
        let conditions = [eq(productVariants.productId, item.productId)];
        if (item.selectedSize) conditions.push(eq(productVariants.size, item.selectedSize));
        if (item.selectedColor) conditions.push(eq(productVariants.color, item.selectedColor));
        
        const variant = await tx.select().from(productVariants).where(and(...conditions));
        if (variant.length > 0) {
          const updated = await tx.update(productVariants)
            .set({ stock: variant[0].stock - item.quantity })
            .where(and(eq(productVariants.id, variant[0].id), gte(productVariants.stock, item.quantity)))
            .returning({ id: productVariants.id });
          if (!updated[0]) throw new Error(`Insufficient stock for ${item.productName}`);
        }
      } else {
        const product = await tx.select().from(products).where(eq(products.id, item.productId));
        if (product.length > 0) {
          const updated = await tx.update(products)
            .set({ stock: product[0].stock - item.quantity, updatedAt: new Date() })
            .where(and(eq(products.id, item.productId), gte(products.stock, item.quantity)))
            .returning({ id: products.id });
          if (!updated[0]) throw new Error(`Insufficient stock for ${item.productName}`);
        }
      }
    }

    // Insert addresses
    if (data.shippingAddress) {
      await tx.insert(orderAddresses).values({
        orderId: data.id,
        type: 'SHIPPING',
        fullName: data.shippingAddress.fullName,
        phone: data.shippingAddress.phone,
        addressLine: data.shippingAddress.addressLine,
        city: data.shippingAddress.city,
        state: data.shippingAddress.state,
        pincode: data.shippingAddress.pincode,
        country: data.shippingAddress.country || 'IN'
      });
    }

    if (data.billingAddress) {
      await tx.insert(orderAddresses).values({
        orderId: data.id,
        type: 'BILLING',
        fullName: data.billingAddress.fullName,
        phone: data.billingAddress.phone,
        addressLine: data.billingAddress.addressLine,
        city: data.billingAddress.city,
        state: data.billingAddress.state,
        pincode: data.billingAddress.pincode,
        country: data.billingAddress.country || 'IN'
      });
    }

    // Insert initial status event
    await tx.insert(orderStatusEvents).values({
      orderId: data.id,
      newStatus: 'PENDING',
      changedBy: data.userId ? 'CUSTOMER' : 'GUEST'
    });

    return order;
  });
}

export async function getOrder(id: string) {
  const result = await db.select().from(orders).where(eq(orders.id, id));
  if (result.length === 0) return null;
  const order = result[0];

  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id));
  const addresses = await db.select().from(orderAddresses).where(eq(orderAddresses.orderId, id));
  const statusEvents = await db.select().from(orderStatusEvents).where(eq(orderStatusEvents.orderId, id)).orderBy(orderStatusEvents.timestamp);

  return {
    ...order,
    items,
    shippingAddress: addresses.find(a => a.type === 'SHIPPING'),
    billingAddress: addresses.find(a => a.type === 'BILLING'),
    statusEvents
  };
}

export async function getOrdersByUser(userId: string) {
  return await db.select().from(orders).where(eq(orders.userId, userId));
}

export async function getAllOrders() {
  return await db.select().from(orders);
}

export async function updateOrderStatus(id: string, status: string, adminId: string) {
  await db.transaction(async (tx) => {
    const orderResult = await tx.select({ orderStatus: orders.orderStatus }).from(orders).where(eq(orders.id, id));
    if (orderResult.length === 0) throw new Error('Order not found');
    const prevStatus = orderResult[0].orderStatus;

    await tx.update(orders).set({ orderStatus: status, updatedAt: new Date() }).where(eq(orders.id, id));

    await tx.insert(orderStatusEvents).values({
      orderId: id,
      previousStatus: prevStatus,
      newStatus: status,
      changedBy: adminId
    });
  });
}


export async function restoreOrderStock(orderId: string) {
  return db.transaction(async (tx) => {
    const items = await tx.select().from(orderItems).where(eq(orderItems.orderId, orderId));
    for (const item of items) {
      if (item.selectedSize || item.selectedColor) {
        const conditions = [eq(productVariants.productId, item.productId || '')];
        if (item.selectedSize) conditions.push(eq(productVariants.size, item.selectedSize));
        if (item.selectedColor) conditions.push(eq(productVariants.color, item.selectedColor));
        const variant = await tx.select().from(productVariants).where(and(...conditions));
        if (variant[0]) {
          await tx.update(productVariants)
            .set({ stock: variant[0].stock + item.quantity })
            .where(eq(productVariants.id, variant[0].id));
        }
      } else if (item.productId) {
        await tx.update(products)
          .set({ stock: sql`${products.stock} + ${item.quantity}`, updatedAt: new Date() })
          .where(eq(products.id, item.productId));
      }
    }
  });
}
