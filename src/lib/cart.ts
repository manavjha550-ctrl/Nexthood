export interface CartItem {
  id: string; // unique combo of productId + size
  productId: string;
  slug: string;
  name: string;
  sku: string;
  size: string;
  color?: string;
  image: string;
  price: number;
  compareAtPrice?: number;
  quantity: number;
  stock: number;
}

export const FREE_SHIPPING_THRESHOLD = 999;
export const BASE_SHIPPING = 100;

export const PROMO_CODES: Record<string, { type: 'percentage' | 'fixed' | 'shipping', value: number, minOrder?: number }> = {
  'NEXTHOOD10': { type: 'percentage', value: 10 },
  'STUDIO15': { type: 'percentage', value: 15 },
  'WELCOME20': { type: 'fixed', value: 200, minOrder: 1000 },
  'FREESHIP': { type: 'shipping', value: 0 },
};

export function calculateOrderTotals(cartItems: CartItem[], couponCode?: string | null) {
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  let discount = 0;
  let shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : BASE_SHIPPING;

  if (couponCode && PROMO_CODES[couponCode]) {
    const promo = PROMO_CODES[couponCode];
    if (!promo.minOrder || subtotal >= promo.minOrder) {
      if (promo.type === 'percentage') discount = Math.round(subtotal * (promo.value / 100));
      if (promo.type === 'fixed') discount = Math.min(subtotal, promo.value);
      if (promo.type === 'shipping') shipping = 0;
    }
  }

  if (cartItems.length === 0) shipping = 0;

  const tax = 0; // Included in MRP
  const total = subtotal - discount + shipping + tax;

  return { subtotal, discount, shipping, tax, total };
}
