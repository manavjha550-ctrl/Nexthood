import express from 'express';
import crypto from 'crypto';
import { and, eq } from 'drizzle-orm';
import { authMiddleware } from './auth.js';
import { db } from './db/client.js';
import { coupons, orders, payments } from './db/schema.js';
import { getOrder, restoreOrderStock } from './db/repositories/orderRepository.js';
import { incrementCouponUsageTx } from './db/repositories/couponRepository.js';

export const paymentRouter = express.Router();

function razorpayConfigured() {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

async function createRazorpayOrder(amount: number, receipt: string) {
  if (!razorpayConfigured()) throw new Error('Razorpay is not configured');
  const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64');
  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt,
      payment_capture: 1
    })
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Razorpay order creation failed: ${body}`);
  }
  return response.json() as Promise<{ id: string; amount: number; currency: string }>;
}

paymentRouter.post('/razorpay/create-order', authMiddleware, async (req: any, res: any) => {
  try {
    const order = await getOrder(req.body?.orderId);
    if (!order || (order.userId && order.userId !== req.user?.id)) return res.status(404).json({ error: 'Order not found' });
    if (order.paymentStatus === 'PAID') return res.status(409).json({ error: 'Order already paid' });

    const rpOrder = await createRazorpayOrder(Number(order.total), order.orderReference);
    await db.insert(payments).values({
      orderId: order.id,
      provider: 'RAZORPAY',
      providerOrderId: rpOrder.id,
      amount: String(order.total),
      currency: 'INR',
      status: 'CREATED'
    });
    res.json({
      keyId: process.env.RAZORPAY_KEY_ID,
      razorpayOrderId: rpOrder.id,
      amount: rpOrder.amount,
      currency: rpOrder.currency,
      orderId: order.id,
      orderReference: order.orderReference
    });
  } catch (e) {
    console.error(e);
    res.status(502).json({ error: e instanceof Error ? e.message : 'Unable to create payment order' });
  }
});

paymentRouter.post('/razorpay/verify', authMiddleware, async (req: any, res: any) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body || {};
    if (![razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId].every(Boolean)) {
      return res.status(400).json({ error: 'Invalid payment verification data' });
    }
    const order = await getOrder(orderId);
    if (!order || (order.userId && order.userId !== req.user?.id)) return res.status(404).json({ error: 'Order not found' });

    const paymentRows = await db.select().from(payments).where(and(eq(payments.orderId, orderId), eq(payments.providerOrderId, razorpay_order_id)));
    const payment = paymentRows[0];
    if (!payment) return res.status(400).json({ error: 'Payment record not found' });
    if (payment.status === 'CAPTURED' && payment.providerPaymentId === razorpay_payment_id) {
      return res.json({ success: true, orderId, alreadyVerified: true });
    }

    const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');
    if (expected !== razorpay_signature) return res.status(400).json({ error: 'Payment signature verification failed' });

    await db.transaction(async (tx) => {
      const currentPaymentRows = await tx.select({ status: payments.status, providerPaymentId: payments.providerPaymentId })
        .from(payments)
        .where(eq(payments.id, payment.id));
      const currentPayment = currentPaymentRows[0];
      if (!currentPayment) throw new Error('Payment record not found');
      if (currentPayment.status === 'CAPTURED') return;

      await tx.update(payments).set({
        providerPaymentId: razorpay_payment_id,
        signatureVerified: true,
        status: 'CAPTURED',
        updatedAt: new Date()
      }).where(eq(payments.id, payment.id));
      await tx.update(orders).set({
        paymentStatus: 'PAID',
        orderStatus: order.orderStatus === 'PENDING' ? 'CONFIRMED' : order.orderStatus,
        updatedAt: new Date()
      }).where(eq(orders.id, orderId));
      if (order.couponCode) {
        const coupon = await tx.select({ id: coupons.id }).from(coupons).where(eq(coupons.code, order.couponCode));
        if (coupon[0]) await incrementCouponUsageTx(tx, coupon[0].id);
      }
    });

    res.json({ success: true, orderId });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Payment verification failed' });
  }
});

paymentRouter.post('/razorpay/webhook', async (req: any, res: any) => {
  try {
    const signature = req.header('x-razorpay-signature');
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!signature || !secret) return res.status(401).json({ error: 'Webhook not configured' });

    const raw = req.rawBody || JSON.stringify(req.body);
    const expected = crypto.createHmac('sha256', secret).update(raw).digest('hex');
    if (expected !== signature) return res.status(400).json({ error: 'Invalid webhook signature' });

    const event = req.body?.event;
    const entity = req.body?.payload?.payment?.entity;
    const providerOrderId = entity?.order_id;
    const providerPaymentId = entity?.id;
    if (!providerOrderId) return res.json({ received: true });

    const paymentRows = await db.select().from(payments).where(eq(payments.providerOrderId, providerOrderId));
    const payment = paymentRows[0];
    if (!payment?.orderId) return res.json({ received: true });
    if (payment.status === 'CAPTURED' && (event === 'payment.captured' || event === 'order.paid')) return res.json({ received: true });

    if (event === 'payment.captured' || event === 'order.paid') {
      await db.transaction(async (tx) => {
        await tx.update(payments).set({
          providerPaymentId: providerPaymentId || payment.providerPaymentId,
          signatureVerified: true,
          status: 'CAPTURED',
          updatedAt: new Date()
        }).where(eq(payments.id, payment.id));
        await tx.update(orders).set({
          paymentStatus: 'PAID',
          orderStatus: 'CONFIRMED',
          updatedAt: new Date()
        }).where(eq(orders.id, payment.orderId!));
        const orderRow = await tx.select({ couponCode: orders.couponCode }).from(orders).where(eq(orders.id, payment.orderId!));
        if (orderRow[0]?.couponCode) {
          const coupon = await tx.select({ id: coupons.id }).from(coupons).where(eq(coupons.code, orderRow[0].couponCode));
          if (coupon[0]) await incrementCouponUsageTx(tx, coupon[0].id);
        }
      });
    } else if (event === 'payment.failed') {
      if (payment.status === 'FAILED' || payment.status === 'CAPTURED') return res.json({ received: true });
      const order = await getOrder(payment.orderId);
      if (order && order.paymentStatus !== 'PAID') {
        await restoreOrderStock(order.id);
        await db.transaction(async (tx) => {
          await tx.update(payments).set({
            providerPaymentId: providerPaymentId || payment.providerPaymentId,
            status: 'FAILED',
            updatedAt: new Date()
          }).where(eq(payments.id, payment.id));
          await tx.update(orders).set({
            paymentStatus: 'FAILED',
            orderStatus: 'CANCELLED',
            updatedAt: new Date()
          }).where(eq(orders.id, payment.orderId!));
        });
      }
    }

    res.json({ received: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});
