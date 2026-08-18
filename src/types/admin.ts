export interface AdminOrderSummary {
  id: string;
  orderReference: string;
  userId: string | null;
  total: string | number;
  orderStatus: string;
  paymentStatus: string;
  createdAt: string;
}

export interface AdminOrderItem {
  id: string;
  productName: string;
  selectedSize: string | null;
  selectedColor: string | null;
  quantity: number;
  unitPrice: string | number;
  imageUrl: string | null;
}

export interface AdminAddress {
  fullName: string;
  phone: string | null;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
}

export interface AdminOrderDetail extends AdminOrderSummary {
  subtotal: string | number;
  discount: string | number;
  shipping: string | number;
  items: AdminOrderItem[];
  shippingAddress?: AdminAddress;
  billingAddress?: AdminAddress;
}

export interface AdminCoupon {
  id: string;
  code: string;
  type: string;
  value: string | number;
  usageLimit: number | null;
  usageCount: number;
  active: boolean;
}

export interface AdminActivityLog {
  id: string;
  adminUserId: string | null;
  adminName: string | null;
  action: string;
  entity: string | null;
  entityId: string | null;
  timestamp: string;
}

export interface AdminCustomerOrder {
  id: string;
  createdAt: string;
  orderStatus: string;
  paymentStatus: string;
  total: string | number;
}

export interface AdminCustomerDetail {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  createdAt: string;
  orders: number;
  lifetimeSpend: number;
  orderHistory: AdminCustomerOrder[];
}
import type { Product } from '../data/products';

export interface AdminProduct extends Product {
  status: string;
}

export interface AdminCustomer {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  createdAt: string;
  orders: number;
  lifetimeSpend: number;
}

export interface AdminMetrics {
  totalRevenue: number;
  totalOrders: number;
  customersCount: number;
  activeProducts?: number;
  avgOrderValue?: number;
  recentOrders?: Array<{ id: string; date: string; status: string; total: number }>;
}
