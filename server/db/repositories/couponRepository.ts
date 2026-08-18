import { db } from '../client.js';
import { coupons } from '../schema.js';
import { and, desc, eq, gte, lt, sql } from 'drizzle-orm';

export async function getCoupons() {
  return await db.select().from(coupons).orderBy(desc(coupons.createdAt));
}
export async function getCouponByCode(code: string) {
  const result = await db.select().from(coupons).where(eq(coupons.code, code.trim().toUpperCase()));
  return result[0];
}
export async function createCoupon(data: any) {
  const code = String(data.code || '').trim().toUpperCase();
  if (!code) throw new Error('Coupon code is required');
  const type = String(data.type || 'PERCENTAGE').toUpperCase();
  if (!['PERCENTAGE','FIXED','FREE_SHIPPING'].includes(type)) throw new Error('Invalid coupon type');
  const value = Number(data.value || 0);
  if (value < 0) throw new Error('Invalid coupon value');
  const result = await db.insert(coupons).values({
    code,
    type,
    value: String(value),
    minOrder: String(Math.max(0, Number(data.minOrder || 0))),
    maxDiscount: data.maxDiscount != null ? String(data.maxDiscount) : null,
    usageLimit: data.usageLimit ? Math.max(1, Number(data.usageLimit)) : null,
    active: data.active !== false,
    startDate: data.startDate ? new Date(data.startDate) : null,
    endDate: data.endDate ? new Date(data.endDate) : null
  }).returning();
  return result[0];
}
export async function updateCoupon(id: string, data: any) {
  const update: any = {};
  if (data.code !== undefined) update.code = String(data.code).trim().toUpperCase();
  if (data.type !== undefined) update.type = String(data.type).toUpperCase();
  if (data.value !== undefined) update.value = String(Number(data.value));
  if (data.minOrder !== undefined) update.minOrder = String(Math.max(0, Number(data.minOrder)));
  if (data.maxDiscount !== undefined) update.maxDiscount = data.maxDiscount == null || data.maxDiscount === '' ? null : String(data.maxDiscount);
  if (data.usageLimit !== undefined) update.usageLimit = data.usageLimit ? Number(data.usageLimit) : null;
  if (data.active !== undefined) update.active = Boolean(data.active);
  if (data.startDate !== undefined) update.startDate = data.startDate ? new Date(data.startDate) : null;
  if (data.endDate !== undefined) update.endDate = data.endDate ? new Date(data.endDate) : null;
  update.updatedAt = new Date();
  const result = await db.update(coupons).set(update).where(eq(coupons.id, id)).returning();
  return result[0];
}
export async function deleteCoupon(id: string) {
  return db.update(coupons).set({ active: false, updatedAt: new Date() }).where(eq(coupons.id, id));
}

export async function validateCoupon(code: string, subtotal: number) {
  const coupon = await getCouponByCode(code);
  if (!coupon || !coupon.active) return { valid: false, error: 'Invalid coupon code' } as const;
  const now = new Date();
  if (coupon.startDate && now < coupon.startDate) return { valid: false, error: 'Coupon is not active yet' } as const;
  if (coupon.endDate && now > coupon.endDate) return { valid: false, error: 'Coupon has expired' } as const;
  if (coupon.usageLimit != null && coupon.usageCount >= coupon.usageLimit) return { valid: false, error: 'Coupon usage limit reached' } as const;
  if (subtotal < Number(coupon.minOrder)) return { valid: false, error: `Minimum order value is ₹${Number(coupon.minOrder)}` } as const;

  let discount = 0;
  if (coupon.type === 'PERCENTAGE') discount = Math.round(subtotal * Number(coupon.value) / 100);
  else if (coupon.type === 'FIXED') discount = Math.min(subtotal, Number(coupon.value));
  else if (coupon.type === 'FREE_SHIPPING') discount = 0;
  if (coupon.maxDiscount != null) discount = Math.min(discount, Number(coupon.maxDiscount));
  return { valid: true, coupon, discount } as const;
}

export async function incrementCouponUsageTx(tx: any, id: string) {
  const result = await tx.update(coupons)
    .set({ usageCount: sql`${coupons.usageCount} + 1`, updatedAt: new Date() })
    .where(and(eq(coupons.id, id), sql`${coupons.usageLimit} IS NULL OR ${coupons.usageCount} < ${coupons.usageLimit}`))
    .returning({ id: coupons.id });
  if (!result[0]) throw new Error('Coupon usage limit reached');
}
