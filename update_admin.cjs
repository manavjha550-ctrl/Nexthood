const fs = require('fs');
const content = `
import express from 'express';
import crypto from 'crypto';
import { authMiddleware, requireAdmin } from './auth.js';
import { getProducts, getProductBySlug, createProduct, updateProduct, deleteProduct } from './db/repositories/productRepository.js';
import { getAllOrders, getOrder, updateOrderStatus } from './db/repositories/orderRepository.js';
import { getAllCustomers, getUserById } from './db/repositories/userRepository.js';
import { getCategories, createCategory, getCollections, createCollection } from './db/repositories/catalogRepository.js';
import { getAllCoupons, createCoupon } from './db/repositories/couponRepository.js';
import { getSettings, updateSettings } from './db/repositories/settingsRepository.js';
import { getActivityLogs, logActivity } from './db/repositories/activityRepository.js';
import { query } from './db/client.js';

export const adminRouter = express.Router();

adminRouter.use(authMiddleware);
adminRouter.use(requireAdmin);

adminRouter.get('/metrics', async (req, res) => {
  try {
    const ordersRes = await query('SELECT SUM(total) as rev, COUNT(*) as cnt FROM orders WHERE payment_status = $1', ['PAID']);
    const custRes = await query('SELECT COUNT(*) as cnt FROM users WHERE role = $1', ['CUSTOMER']);
    const prodRes = await query('SELECT COUNT(*) as cnt FROM products WHERE status = $1', ['ACTIVE']);
    const recentRes = await query('SELECT id, order_status, total, created_at FROM orders ORDER BY created_at DESC LIMIT 5');

    res.json({
      totalRevenue: Number(ordersRes.rows[0]?.rev || 0),
      totalOrders: Number(ordersRes.rows[0]?.cnt || 0),
      customersCount: Number(custRes.rows[0]?.cnt || 0),
      activeProducts: Number(prodRes.rows[0]?.cnt || 0),
      recentOrders: recentRes.rows.map(r => ({
        id: r.id,
        date: r.created_at,
        status: r.order_status,
        total: Number(r.total)
      }))
    });
  } catch(e) {
    res.status(500).json({error: 'Internal server error'});
  }
});

adminRouter.get('/products', async (req, res) => {
  try {
    const products = await getProducts(true);
    res.json(products);
  } catch(e) { res.status(500).json({error: 'Internal server error'}); }
});

adminRouter.get('/products/:id', async (req, res) => {
  try {
    const p = await query('SELECT slug FROM products WHERE id = $1', [req.params.id]);
    if (p.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    const product = await getProductBySlug(p.rows[0].slug, true);
    res.json(product);
  } catch(e) { res.status(500).json({error: 'Internal server error'}); }
});

adminRouter.post('/products', async (req, res) => {
  try {
    const newProduct = await createProduct({ ...req.body, id: crypto.randomUUID() });
    await logActivity(req.user.id, 'PRODUCT CREATED', 'Product', newProduct.id);
    res.json(newProduct);
  } catch(e) { res.status(500).json({error: 'Internal server error'}); }
});

adminRouter.put('/products/:id', async (req, res) => {
  try {
    const updated = await updateProduct(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Not found' });
    await logActivity(req.user.id, 'PRODUCT UPDATED', 'Product', req.params.id);
    res.json(updated);
  } catch(e) { res.status(500).json({error: 'Internal server error'}); }
});

adminRouter.delete('/products/:id', async (req, res) => {
  try {
    await deleteProduct(req.params.id);
    await logActivity(req.user.id, 'PRODUCT ARCHIVED', 'Product', req.params.id);
    res.json({ success: true });
  } catch(e) { res.status(500).json({error: 'Internal server error'}); }
});

adminRouter.get('/orders', async (req, res) => {
  try {
    const orders = await getAllOrders();
    res.json(orders);
  } catch(e) { res.status(500).json({error: 'Internal server error'}); }
});

adminRouter.get('/orders/:id', async (req, res) => {
  try {
    const o = await getOrder(req.params.id);
    if (!o) return res.status(404).json({ error: 'Not found' });
    res.json(o);
  } catch(e) { res.status(500).json({error: 'Internal server error'}); }
});

adminRouter.put('/orders/:id', async (req, res) => {
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
    const customers = await getAllCustomers();
    res.json(customers.map(c => ({
      id: c.id, fullName: c.full_name, email: c.email, phone: c.phone, createdAt: c.created_at
    })));
  } catch(e) { res.status(500).json({error: 'Internal server error'}); }
});

adminRouter.get('/customers/:id', async (req, res) => {
  try {
    const c = await getUserById(req.params.id);
    if (!c || c.role !== 'CUSTOMER') return res.status(404).json({ error: 'Not found' });
    res.json({ id: c.id, fullName: c.full_name, email: c.email, phone: c.phone, createdAt: c.created_at });
  } catch(e) { res.status(500).json({error: 'Internal server error'}); }
});

adminRouter.get('/categories', async (req, res) => {
  try {
    const cats = await getCategories();
    res.json(cats);
  } catch(e) { res.status(500).json({error: 'Internal server error'}); }
});

adminRouter.post('/categories', async (req, res) => {
  try {
    const c = await createCategory({ ...req.body, id: crypto.randomUUID() });
    await logActivity(req.user.id, 'CATEGORY CREATED', 'Category', c.id);
    res.json(c);
  } catch(e) { res.status(500).json({error: 'Internal server error'}); }
});

adminRouter.get('/collections', async (req, res) => {
  try {
    const cols = await getCollections();
    res.json(cols);
  } catch(e) { res.status(500).json({error: 'Internal server error'}); }
});

adminRouter.post('/collections', async (req, res) => {
  try {
    const c = await createCollection({ ...req.body, id: crypto.randomUUID() });
    await logActivity(req.user.id, 'COLLECTION CREATED', 'Collection', c.id);
    res.json(c);
  } catch(e) { res.status(500).json({error: 'Internal server error'}); }
});

adminRouter.get('/coupons', async (req, res) => {
  try {
    const coupons = await getAllCoupons();
    res.json(coupons);
  } catch(e) { res.status(500).json({error: 'Internal server error'}); }
});

adminRouter.post('/coupons', async (req, res) => {
  try {
    const c = await createCoupon(req.body);
    await logActivity(req.user.id, 'COUPON CREATED', 'Coupon', c.id);
    res.json(c);
  } catch(e) { res.status(500).json({error: 'Internal server error'}); }
});

adminRouter.get('/analytics', async (req, res) => {
  try {
    const ordersRes = await query('SELECT SUM(total) as rev, COUNT(*) as cnt FROM orders WHERE payment_status = $1', ['PAID']);
    const custRes = await query('SELECT COUNT(*) as cnt FROM users WHERE role = $1', ['CUSTOMER']);
    const totalOrders = Number(ordersRes.rows[0]?.cnt || 0);
    const totalRevenue = Number(ordersRes.rows[0]?.rev || 0);

    res.json({
      totalRevenue,
      totalOrders,
      customersCount: Number(custRes.rows[0]?.cnt || 0),
      avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0
    });
  } catch(e) { res.status(500).json({error: 'Internal server error'}); }
});

adminRouter.get('/settings', async (req, res) => {
  try {
    const s = await getSettings();
    res.json({
      storeName: s?.store_name,
      supportEmail: s?.support_email,
      supportPhone: s?.support_phone,
      legalName: s?.legal_name,
      businessAddress: s?.business_address,
      country: s?.country,
      gstin: s?.gstin,
      businessHours: s?.business_hours,
      defaultShippingFee: Number(s?.default_shipping_fee || 0),
      freeShippingThreshold: Number(s?.free_shipping_threshold || 0),
      processingTime: s?.processing_time,
      deliveryEstimate: s?.delivery_estimate,
      codEnabled: s?.cod_enabled,
      announcementText: s?.announcement_text,
      privacyPolicy: s?.privacy_policy,
      terms: s?.terms,
      shippingPolicy: s?.shipping_policy,
      returnsPolicy: s?.returns_policy,
      cancellationPolicy: s?.cancellation_policy
    });
  } catch(e) { res.status(500).json({error: 'Internal server error'}); }
});

adminRouter.put('/settings', async (req, res) => {
  try {
    const s = await updateSettings({
      store_name: req.body.storeName,
      support_email: req.body.supportEmail,
      support_phone: req.body.supportPhone,
      legal_name: req.body.legalName,
      business_address: req.body.businessAddress,
      country: req.body.country,
      gstin: req.body.gstin,
      business_hours: req.body.businessHours,
      default_shipping_fee: req.body.defaultShippingFee,
      free_shipping_threshold: req.body.freeShippingThreshold,
      processing_time: req.body.processingTime,
      delivery_estimate: req.body.deliveryEstimate,
      cod_enabled: req.body.codEnabled,
      announcement_text: req.body.announcementText,
    });
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
`;
fs.writeFileSync('server/admin.ts', content);
