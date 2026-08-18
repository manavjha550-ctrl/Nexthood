import { pgTable, text, varchar, timestamp, boolean, integer, decimal, uuid, bigint, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  phone: varchar('phone', { length: 50 }),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  salt: varchar('salt', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull().default('CUSTOMER'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
}, (table) => {
  return {
    emailIdx: index('idx_users_email').on(table.email)
  };
});

export const sessions = pgTable('sessions', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: bigint('expires_at', { mode: 'number' }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
}, (table) => {
  return {
    userIdIdx: index('idx_sessions_user_id').on(table.userId)
  };
});

export const passwordResetTokens = pgTable('password_reset_tokens', {
  token: varchar('token', { length: 255 }).primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: bigint('expires_at', { mode: 'number' }).notNull()
});

export const categories = pgTable('categories', {
  id: varchar('id', { length: 255 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).unique().notNull(),
  description: text('description'),
  image: varchar('image', { length: 255 }),
  status: varchar('status', { length: 50 }).notNull().default('ACTIVE'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});

export const collections = pgTable('collections', {
  id: varchar('id', { length: 255 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).unique().notNull(),
  description: text('description'),
  coverImage: varchar('cover_image', { length: 255 }),
  status: varchar('status', { length: 50 }).notNull().default('ACTIVE'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});

export const products = pgTable('products', {
  id: varchar('id', { length: 255 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).unique().notNull(),
  sku: varchar('sku', { length: 255 }).unique(),
  description: text('description'),
  categoryId: varchar('category_id', { length: 255 }).references(() => categories.id, { onDelete: 'set null' }),
  collectionId: varchar('collection_id', { length: 255 }).references(() => collections.id, { onDelete: 'set null' }),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  compareAtPrice: decimal('compare_at_price', { precision: 10, scale: 2 }),
  stock: integer('stock').notNull().default(0),
  status: varchar('status', { length: 50 }).notNull().default('ACTIVE'),
  featured: boolean('featured').default(false),
  newArrival: boolean('new_arrival').default(false),
  bestseller: boolean('bestseller').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
}, (table) => {
  return {
    slugIdx: index('idx_products_slug').on(table.slug),
    skuIdx: index('idx_products_sku').on(table.sku)
  };
});

export const productVariants = pgTable('product_variants', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: varchar('product_id', { length: 255 }).notNull().references(() => products.id, { onDelete: 'cascade' }),
  size: varchar('size', { length: 50 }),
  color: varchar('color', { length: 50 }),
  sku: varchar('sku', { length: 255 }).unique(),
  stock: integer('stock').notNull().default(0)
});

export const productImages = pgTable('product_images', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: varchar('product_id', { length: 255 }).notNull().references(() => products.id, { onDelete: 'cascade' }),
  imageUrl: varchar('image_url', { length: 255 }).notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  isPrimary: boolean('is_primary').default(false)
});

export const coupons = pgTable('coupons', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 100 }).unique().notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  value: decimal('value', { precision: 10, scale: 2 }).notNull(),
  minOrder: decimal('min_order', { precision: 10, scale: 2 }).notNull().default('0'),
  maxDiscount: decimal('max_discount', { precision: 10, scale: 2 }),
  usageLimit: integer('usage_limit'),
  usageCount: integer('usage_count').notNull().default(0),
  active: boolean('active').default(true),
  startDate: timestamp('start_date', { withTimezone: true }),
  endDate: timestamp('end_date', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
}, (table) => {
  return {
    codeIdx: index('idx_coupons_code').on(table.code)
  };
});

export const orders = pgTable('orders', {
  id: varchar('id', { length: 255 }).primaryKey(),
  orderReference: varchar('order_reference', { length: 255 }).unique().notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
  discount: decimal('discount', { precision: 10, scale: 2 }).notNull().default('0'),
  couponCode: varchar('coupon_code', { length: 100 }),
  shipping: decimal('shipping', { precision: 10, scale: 2 }).notNull().default('0'),
  tax: decimal('tax', { precision: 10, scale: 2 }).notNull().default('0'),
  total: decimal('total', { precision: 10, scale: 2 }).notNull(),
  orderStatus: varchar('order_status', { length: 50 }).notNull().default('PENDING'),
  paymentStatus: varchar('payment_status', { length: 50 }).notNull().default('PENDING'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
}, (table) => {
  return {
    userIdIdx: index('idx_orders_user_id').on(table.userId),
    orderStatusIdx: index('idx_orders_order_status').on(table.orderStatus)
  };
});

export const orderItems = pgTable('order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: varchar('order_id', { length: 255 }).notNull().references(() => orders.id, { onDelete: 'cascade' }),
  productId: varchar('product_id', { length: 255 }),
  productName: varchar('product_name', { length: 255 }).notNull(),
  productSku: varchar('product_sku', { length: 255 }),
  selectedSize: varchar('selected_size', { length: 50 }),
  selectedColor: varchar('selected_color', { length: 50 }),
  quantity: integer('quantity').notNull(),
  unitPrice: decimal('unit_price', { precision: 10, scale: 2 }).notNull(),
  imageUrl: varchar('image_url', { length: 255 })
});

export const orderAddresses = pgTable('order_addresses', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: varchar('order_id', { length: 255 }).notNull().references(() => orders.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 50 }).notNull(), // 'SHIPPING' or 'BILLING'
  fullName: varchar('full_name', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }),
  addressLine: varchar('address_line', { length: 255 }).notNull(),
  city: varchar('city', { length: 100 }).notNull(),
  state: varchar('state', { length: 100 }).notNull(),
  pincode: varchar('pincode', { length: 50 }).notNull(),
  country: varchar('country', { length: 100 }).notNull().default('IN')
});

export const orderStatusEvents = pgTable('order_status_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: varchar('order_id', { length: 255 }).notNull().references(() => orders.id, { onDelete: 'cascade' }),
  previousStatus: varchar('previous_status', { length: 50 }),
  newStatus: varchar('new_status', { length: 50 }).notNull(),
  changedBy: varchar('changed_by', { length: 255 }),
  timestamp: timestamp('timestamp', { withTimezone: true }).defaultNow()
});

export const storeSettings = pgTable('store_settings', {
  id: varchar('id', { length: 50 }).primaryKey().default('global'),
  storeName: varchar('store_name', { length: 255 }),
  supportEmail: varchar('support_email', { length: 255 }),
  supportPhone: varchar('support_phone', { length: 50 }),
  legalName: varchar('legal_name', { length: 255 }),
  businessAddress: text('business_address'),
  country: varchar('country', { length: 100 }),
  gstin: varchar('gstin', { length: 100 }),
  businessHours: varchar('business_hours', { length: 255 }),
  defaultShippingFee: decimal('default_shipping_fee', { precision: 10, scale: 2 }).default('0'),
  freeShippingThreshold: decimal('free_shipping_threshold', { precision: 10, scale: 2 }).default('0'),
  processingTime: varchar('processing_time', { length: 255 }),
  deliveryEstimate: varchar('delivery_estimate', { length: 255 }),
  codEnabled: boolean('cod_enabled').default(false),
  announcementText: varchar('announcement_text', { length: 255 }),
  privacyPolicy: text('privacy_policy'),
  terms: text('terms'),
  shippingPolicy: text('shipping_policy'),
  returnsPolicy: text('returns_policy'),
  cancellationPolicy: text('cancellation_policy'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});

export const adminActivityLogs = pgTable('admin_activity_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  adminUserId: uuid('admin_user_id').references(() => users.id, { onDelete: 'set null' }),
  action: varchar('action', { length: 255 }).notNull(),
  entity: varchar('entity', { length: 255 }),
  entityId: varchar('entity_id', { length: 255 }),
  timestamp: timestamp('timestamp', { withTimezone: true }).defaultNow()
});

export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: varchar('order_id', { length: 255 }).references(() => orders.id, { onDelete: 'cascade' }),
  provider: varchar('provider', { length: 50 }).notNull(),
  providerPaymentId: varchar('provider_payment_id', { length: 255 }),
  providerOrderId: varchar('provider_order_id', { length: 255 }),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 10 }).notNull().default('INR'),
  status: varchar('status', { length: 50 }).notNull().default('PENDING'),
  signatureVerified: boolean('signature_verified').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});
