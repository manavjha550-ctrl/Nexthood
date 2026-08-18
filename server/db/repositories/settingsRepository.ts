import { db } from '../client.js';
import { storeSettings } from '../schema.js';
import { eq } from 'drizzle-orm';

export async function getSettings() {
  const result = await db.select().from(storeSettings).where(eq(storeSettings.id, 'global'));
  return result[0];
}

export async function updateSettings(data: any) {
  const result = await db.update(storeSettings).set({
    storeName: data.store_name ?? data.storeName,
    supportEmail: data.support_email ?? data.supportEmail,
    supportPhone: data.support_phone ?? data.supportPhone,
    legalName: data.legal_name ?? data.legalName,
    businessAddress: data.business_address ?? data.businessAddress,
    country: data.country,
    gstin: data.gstin,
    businessHours: data.business_hours ?? data.businessHours,
    defaultShippingFee: data.default_shipping_fee ?? data.defaultShippingFee,
    freeShippingThreshold: data.free_shipping_threshold ?? data.freeShippingThreshold,
    processingTime: data.processing_time ?? data.processingTime,
    deliveryEstimate: data.delivery_estimate ?? data.deliveryEstimate,
    codEnabled: data.cod_enabled ?? data.codEnabled,
    announcementText: data.announcement_text ?? data.announcementText,
    updatedAt: new Date()
  }).where(eq(storeSettings.id, 'global')).returning();
  return result[0];
}
