import express from 'express';
import crypto from 'crypto';
import { authMiddleware, requireAdmin } from './auth.js';
import {
  getProducts, getProductBySlug, createProduct, updateProduct, deleteProduct
} from './db/repositories/productRepository.js';
import { getCategories, createCategory, updateCategory, deleteCategory, getCollections, createCollection, updateCollection, deleteCollection } from './db/repositories/catalogRepository.js';
import { getCoupons, createCoupon, updateCoupon, deleteCoupon } from './db/repositories/couponRepository.js';
import { getAllOrders, getOrder, updateOrderStatus } from './db/repositories/orderRepository.js';
import { getActivityLogs, logActivity } from './db/repositories/activityRepository.js';
import { getSettings, updateSettings } from './db/repositories/settingsRepository.js';
import { db } from './db/client.js';
import { orders, users, products } from './db/schema.js';
import { eq, desc, count, sum } from 'drizzle-orm';

export const adminRouter = express.Router();

// Authorization depends on req.user, which is populated from the existing
// session cookie by authMiddleware. Keep this protection on the server rather
// than relying on the admin React route guard.
adminRouter.use(authMiddleware, requireAdmin);

adminRouter.get('/dashboard', async (req: any, res: any) => {
  try {
    const ordersRes = await db.select({ rev: sum(orders.total), cnt: count() }).from(orders).where(eq(orders.paymentStatus, 'PAID'));
    const custRes = await db.select({ cnt: count() }).from(users).where(eq(users.role, 'CUSTOMER'));
    const prodRes = await db.select({ cnt: count() }).from(products).where(eq(products.status, 'ACTIVE'));
    const recentRes = await db.select({ id: orders.id, orderStatus: orders.orderStatus, total: orders.total, createdAt: orders.createdAt }).from(orders).orderBy(desc(orders.createdAt)).limit(5);
    
    res.json({
      totalRevenue: Number(ordersRes[0]?.rev || 0),
      totalOrders: Number(ordersRes[0]?.cnt || 0),
      customersCount: Number(custRes[0]?.cnt || 0),
      activeProducts: Number(prodRes[0]?.cnt || 0),
      recentOrders: recentRes.map(r => ({
        id: r.id,
        date: r.createdAt,
        status: r.orderStatus,
        total: Number(r.total)
      }))
    });
  } catch(e) {
    res.status(500).json({error: 'Internal server error'});
  }
});

adminRouter.get('/products', async (req, res) => {
  try {
    const p = await getProducts(true);
    res.json(p);
  } catch(e) { res.status(500).json({error: 'Internal server error'}); }
});

adminRouter.get('/products/:id', async (req: any, res: any) => {
  try {
    const p = await db.select({ slug: products.slug }).from(products).where(eq(products.id, req.params.id));
    if (p.length === 0) return res.status(404).json({ error: 'Not found' });
    const product = await getProductBySlug(p[0].slug, true);
    res.json(product);
  } catch(e) { res.status(500).json({error: 'Internal server error'}); }
});

adminRouter.post('/products', async (req: any, res: any) => {
  try {
    const newProduct = await createProduct({ ...req.body, id: crypto.randomUUID() });
    await logActivity(req.user.id, 'PRODUCT CREATED', 'Product', newProduct.id);
    res.json(newProduct);
  } catch(e) { res.status(500).json({error: 'Internal server error'}); }
});

adminRouter.put('/products/:id', async (req: any, res: any) => {
  try {
    const updated = await updateProduct(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Not found' });
    await logActivity(req.user.id, 'PRODUCT UPDATED', 'Product', req.params.id);
    res.json(updated);
  } catch(e) { res.status(500).json({error: 'Internal server error'}); }
});

adminRouter.delete('/products/:id', async (req: any, res: any) => {
  try {
    await deleteProduct(req.params.id);
    await logActivity(req.user.id, 'PRODUCT ARCHIVED', 'Product', req.params.id);
    res.json({ success: true });
  } catch(e) { res.status(500).json({error: 'Internal server error'}); }
});

adminRouter.get('/orders', async (req, res) => {
  try {
    const p = await getAllOrders();
    res.json(p);
  } catch(e) { res.status(500).json({error: 'Internal server error'}); }
});

adminRouter.get('/orders/:id', async (req: any, res: any) => {
  try {
    const o = await getOrder(req.params.id);
    if (!o) return res.status(404).json({ error: 'Not found' });
    res.json(o);
  } catch(e) { res.status(500).json({error: 'Internal server error'}); }
});

adminRouter.put('/orders/:id', async (req: any, res: any) => {
  try {
    if (req.body.status) {
      await updateOrderStatus(req.params.id, req.body.status, req.user.id);
      await logActivity(req.user.id, 'ORDER STATUS UPDATED', 'Order', req.params.id);
    }
    res.json({ success: true });
  } catch(e) { res.status(500).json({error: 'Internal server error'}); }
});

adminRouter.get('/customers', async (req, res) => {
  try {
    const customers = await db.select({ id: users.id, fullName: users.fullName, email: users.email, createdAt: users.createdAt, phone: users.phone, status: users.role }).from(users).where(eq(users.role, 'CUSTOMER')).orderBy(desc(users.createdAt));
    const orderRows = await db.select({ userId: orders.userId, total: orders.total }).from(orders);
    const aggregates = new Map<string, { orders: number; lifetimeSpend: number }>();
    for (const row of orderRows) {
      if (!row.userId) continue;
      const current = aggregates.get(row.userId) || { orders: 0, lifetimeSpend: 0 };
      current.orders += 1;
      current.lifetimeSpend += Number(row.total);
      aggregates.set(row.userId, current);
    }
    res.json(customers.map(c => ({ ...c, ...(aggregates.get(c.id) || { orders: 0, lifetimeSpend: 0 }) })));
  } catch(e) { res.status(500).json({error: 'Internal server error'}); }
});

adminRouter.get('/customers/:id', async (req: any, res: any) => {
  try {
    const custRes = await db.select({ id: users.id, fullName: users.fullName, email: users.email, createdAt: users.createdAt, phone: users.phone, status: users.role }).from(users).where(eq(users.id, req.params.id));
    if (custRes.length === 0) return res.status(404).json({ error: 'Not found' });
    
    const customer = custRes[0];
    const orderHistory = await db.select({ id: orders.id, createdAt: orders.createdAt, orderStatus: orders.orderStatus, paymentStatus: orders.paymentStatus, total: orders.total }).from(orders).where(eq(orders.userId, req.params.id)).orderBy(desc(orders.createdAt));
    
    res.json({
      ...customer,
      orders: orderHistory.length,
      lifetimeSpend: orderHistory.reduce((acc, curr) => acc + Number(curr.total), 0),
      orderHistory: orderHistory.map(o => ({...o, total: Number(o.total)}))
    });
  } catch(e) { res.status(500).json({error: 'Internal server error'}); }
});

adminRouter.get('/categories', async (req, res) => {
  try {
    const cats = await getCategories();
    res.json(cats);
  } catch(e) { res.status(500).json({error: 'Internal server error'}); }
});

adminRouter.post('/categories', async (req: any, res: any) => {
  try {
    const c = await createCategory({ ...req.body, id: crypto.randomUUID() });
    await logActivity(req.user.id, 'CATEGORY CREATED', 'Category', c.id);
    res.json(c);
  } catch(e) { res.status(500).json({error: 'Internal server error'}); }
});

adminRouter.put('/categories/:id', async (req: any, res: any) => {
  try {
    const c = await updateCategory(req.params.id, req.body);
    if (!c) return res.status(404).json({ error: 'Not found' });
    await logActivity(req.user.id, 'CATEGORY UPDATED', 'Category', req.params.id);
    res.json(c);
  } catch(e) { res.status(400).json({ error: e instanceof Error ? e.message : 'Invalid category' }); }
});
adminRouter.delete('/categories/:id', async (req: any, res: any) => {
  await deleteCategory(req.params.id);
  await logActivity(req.user.id, 'CATEGORY ARCHIVED', 'Category', req.params.id);
  res.json({ success: true });
});

adminRouter.get('/collections', async (req, res) => {
  try {
    const cols = await getCollections();
    res.json(cols);
  } catch(e) { res.status(500).json({error: 'Internal server error'}); }
});

adminRouter.post('/collections', async (req: any, res: any) => {
  try {
    const c = await createCollection({ ...req.body, id: crypto.randomUUID() });
    await logActivity(req.user.id, 'COLLECTION CREATED', 'Collection', c.id);
    res.json(c);
  } catch(e) { res.status(500).json({error: 'Internal server error'}); }
});

adminRouter.put('/collections/:id', async (req: any, res: any) => {
  try {
    const c = await updateCollection(req.params.id, req.body);
    if (!c) return res.status(404).json({ error: 'Not found' });
    await logActivity(req.user.id, 'COLLECTION UPDATED', 'Collection', req.params.id);
    res.json(c);
  } catch(e) { res.status(400).json({ error: e instanceof Error ? e.message : 'Invalid collection' }); }
});
adminRouter.delete('/collections/:id', async (req: any, res: any) => {
  await deleteCollection(req.params.id);
  await logActivity(req.user.id, 'COLLECTION ARCHIVED', 'Collection', req.params.id);
  res.json({ success: true });
});

adminRouter.get('/coupons', async (req, res) => {
  try {
    const coupons = await getCoupons();
    res.json(coupons);
  } catch(e) { res.status(500).json({error: 'Internal server error'}); }
});

adminRouter.post('/coupons', async (req: any, res: any) => {
  try {
    const c = await createCoupon(req.body);
    await logActivity(req.user.id, 'COUPON CREATED', 'Coupon', c.id);
    res.json(c);
  } catch(e) { res.status(500).json({error: 'Internal server error'}); }
});

adminRouter.put('/coupons/:id', async (req: any, res: any) => {
  try {
    const c = await updateCoupon(req.params.id, req.body);
    if (!c) return res.status(404).json({ error: 'Not found' });
    await logActivity(req.user.id, 'COUPON UPDATED', 'Coupon', req.params.id);
    res.json(c);
  } catch(e) { res.status(400).json({ error: e instanceof Error ? e.message : 'Invalid coupon' }); }
});
adminRouter.delete('/coupons/:id', async (req: any, res: any) => {
  await deleteCoupon(req.params.id);
  await logActivity(req.user.id, 'COUPON DEACTIVATED', 'Coupon', req.params.id);
  res.json({ success: true });
});

adminRouter.get('/analytics', async (req, res) => {
  try {
    const ordersRes = await db.select({ rev: sum(orders.total), cnt: count() }).from(orders).where(eq(orders.paymentStatus, 'PAID'));
    const custRes = await db.select({ cnt: count() }).from(users).where(eq(users.role, 'CUSTOMER'));
    
    const totalOrders = Number(ordersRes[0]?.cnt || 0);
    const totalRevenue = Number(ordersRes[0]?.rev || 0);
    
    res.json({
      totalRevenue,
      totalOrders,
      customersCount: Number(custRes[0]?.cnt || 0),
      avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0
    });
  } catch(e) { res.status(500).json({error: 'Internal server error'}); }
});

adminRouter.get('/settings', async (req, res) => {
  try {
    const s = await getSettings();
    res.json({
      storeName: s?.storeName,
      supportEmail: s?.supportEmail,
      supportPhone: s?.supportPhone,
      legalName: s?.legalName,
      businessAddress: s?.businessAddress,
      country: s?.country,
      gstin: s?.gstin,
      businessHours: s?.businessHours,
      defaultShippingFee: Number(s?.defaultShippingFee || 0),
      freeShippingThreshold: Number(s?.freeShippingThreshold || 0),
      processingTime: s?.processingTime,
      deliveryEstimate: s?.deliveryEstimate,
      codEnabled: s?.codEnabled,
      announcementText: s?.announcementText,
      privacyPolicy: s?.privacyPolicy,
      terms: s?.terms,
      shippingPolicy: s?.shippingPolicy,
      returnsPolicy: s?.returnsPolicy,
      cancellationPolicy: s?.cancellationPolicy
    });
  } catch(e) { res.status(500).json({error: 'Internal server error'}); }
});

adminRouter.put('/settings', async (req: any, res: any) => {
  try {
    await updateSettings(req.body);
    await logActivity(req.user.id, 'SETTINGS UPDATED', 'Settings', 'global');
    res.json({ success: true });
  } catch(e) { res.status(500).json({error: 'Internal server error'}); }
});

adminRouter.get('/activity', async (req, res) => {
  try {
    const logs = await getActivityLogs();
    res.json(logs);
  } catch(e) { res.status(500).json({error: 'Internal server error'}); }
});
