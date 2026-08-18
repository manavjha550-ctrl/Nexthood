const fs = require('fs');
const content = `
import express from 'express';
import { authMiddleware } from './auth.js';
import { getOrdersByUser, getOrder } from './db/repositories/orderRepository.js';

export const ordersRouter = express.Router();
ordersRouter.use(authMiddleware);

ordersRouter.get('/', async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const userOrders = await getOrdersByUser(user.id);
    // Format to match frontend expectations
    const formatted = userOrders.map(o => ({
      id: o.id,
      orderReference: o.order_reference,
      date: o.created_at,
      status: o.order_status,
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

    if (!order || order.user_id !== user.id) {
      return res.status(404).json({ error: 'ORDER NOT FOUND' });
    }

    res.json({
      id: order.id,
      orderReference: order.order_reference,
      date: order.created_at,
      status: order.order_status,
      paymentStatus: order.payment_status,
      subtotal: Number(order.subtotal),
      discount: Number(order.discount),
      shipping: Number(order.shipping),
      tax: Number(order.tax),
      total: Number(order.total),
      items: order.items.map((i: any) => ({
        id: i.id,
        productId: i.product_id,
        name: i.product_name,
        sku: i.product_sku,
        size: i.selected_size,
        color: i.selected_color,
        quantity: i.quantity,
        price: Number(i.unit_price),
        image: i.image_url
      })),
      shippingAddress: order.shippingAddress ? {
        fullName: order.shippingAddress.full_name,
        phone: order.shippingAddress.phone,
        addressLine: order.shippingAddress.address_line,
        city: order.shippingAddress.city,
        state: order.shippingAddress.state,
        pincode: order.shippingAddress.pincode,
        country: order.shippingAddress.country
      } : null,
      billingAddress: order.billingAddress ? {
        fullName: order.billingAddress.full_name,
        phone: order.billingAddress.phone,
        addressLine: order.billingAddress.address_line,
        city: order.billingAddress.city,
        state: order.billingAddress.state,
        pincode: order.billingAddress.pincode,
        country: order.billingAddress.country
      } : null
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});
`;
fs.writeFileSync('server/orders.ts', content);
