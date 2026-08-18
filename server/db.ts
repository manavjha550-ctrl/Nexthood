import crypto from 'crypto';
import { catalog } from '../src/data/products.js';

export type Role = 'CUSTOMER' | 'ADMIN';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  passwordHash: string;
  salt: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  id: string;
  userId: string;
  expiresAt: number;
}

export interface Order {
  id: string;
  userId: string;
  date: string;
  status: string;
  paymentStatus: string;
  items: any[];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress: any;
  billingAddress: any;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  status: 'ACTIVE' | 'ARCHIVED';
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string;
  coverImage: string;
  status: 'ACTIVE' | 'ARCHIVED';
}

export interface Coupon {
  id: string;
  code: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING';
  value: number;
  minOrder: number;
  maxDiscount: number;
  usageLimit: number;
  usageCount: number;
  active: boolean;
  startDate: string;
  endDate: string;
}

export interface Settings {
  storeName: string;
  supportEmail: string;
  supportPhone: string;
  legalName: string;
  businessAddress: string;
  country: string;
  gstin: string;
  businessHours: string;
  defaultShippingFee: number;
  freeShippingThreshold: number;
  processingTime: string;
  deliveryEstimate: string;
  codEnabled: boolean;
  announcementText: string;
  privacyPolicy: string;
  terms: string;
  shippingPolicy: string;
  returnsPolicy: string;
  cancellationPolicy: string;
}

export interface Activity {
  id: string;
  timestamp: string;
  adminId: string;
  adminName: string;
  action: string;
  entity: string;
  entityId: string;
}

export const db = {
  users: [] as User[],
  sessions: [] as Session[],
  resetTokens: [] as { token: string; userId: string; expiresAt: number }[],
  orders: [] as Order[],
  products: [...catalog],
  categories: [
    { id: 'c1', name: 'T-Shirts', slug: 't-shirts', description: '', image: '', status: 'ACTIVE' as const },
    { id: 'c2', name: 'Long Sleeve', slug: 'long-sleeve', description: '', image: '', status: 'ACTIVE' as const }
  ] as Category[],
  collections: [
    { id: 'col1', name: 'Graphic Series', slug: 'graphic-series', description: '', coverImage: '', status: 'ACTIVE' as const }
  ] as Collection[],
  coupons: [] as Coupon[],
  settings: {
    storeName: 'NEXTHOOD STUDIO',
    supportEmail: 'support@nexthood.com',
    supportPhone: '',
    legalName: 'NEXTHOOD LLC',
    businessAddress: '',
    country: 'IN',
    gstin: '',
    businessHours: '',
    defaultShippingFee: 0,
    freeShippingThreshold: 0,
    processingTime: '1-2 business days',
    deliveryEstimate: '3-5 business days',
    codEnabled: false,
    announcementText: 'FREE SHIPPING ON ALL ORDERS',
    privacyPolicy: '',
    terms: '',
    shippingPolicy: '',
    returnsPolicy: '',
    cancellationPolicy: ''
  } as Settings,
  activity: [] as Activity[]
};

export function seedDemoAccount() {
  if (process.env.NODE_ENV !== 'production') {
    // Customer
    if (!db.users.find(u => u.email === 'vance@studio.com')) {
      const salt = crypto.randomBytes(16).toString('hex');
      const passwordHash = crypto.scryptSync('password123', salt, 64).toString('hex');
      db.users.push({
        id: crypto.randomUUID(),
        fullName: 'Vance Demo',
        email: 'vance@studio.com',
        passwordHash,
        salt,
        role: 'CUSTOMER',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    // Admin
    if (!db.users.find(u => u.email === 'admin@nexthood.local')) {
      const salt = crypto.randomBytes(16).toString('hex');
      const passwordHash = crypto.scryptSync('admin123', salt, 64).toString('hex');
      db.users.push({
        id: crypto.randomUUID(),
        fullName: 'Admin User',
        email: 'admin@nexthood.local',
        passwordHash,
        salt,
        role: 'ADMIN',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
  }
}

export function logActivity(adminId: string, adminName: string, action: string, entity: string, entityId: string) {
  db.activity.push({
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    adminId,
    adminName,
    action,
    entity,
    entityId
  });
}
