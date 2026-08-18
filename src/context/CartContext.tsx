import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, PROMO_CODES } from '../lib/cart';

interface CartContextType {
  items: CartItem[];
  isDrawerOpen: boolean;
  promoCode: string | null;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  applyPromo: (code: string) => { success: boolean; error?: string };
  removePromo: () => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = 'nexthood_cart';
const PROMO_KEY = 'nexthood_promo';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from local storage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      }
      const storedPromo = localStorage.getItem(PROMO_KEY);
      if (storedPromo && PROMO_CODES[storedPromo]) {
        setPromoCode(storedPromo);
      }
    } catch (e) {
      console.error('Error loading cart state', e);
    }
    setIsInitialized(true);
  }, []);

  // Sync to local storage
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Error saving cart state', e);
    }
  }, [items, isInitialized]);

  const addItem = (newItem: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === newItem.id);
      if (existing) {
        return prev.map((i) =>
          i.id === newItem.id
            ? { ...i, quantity: Math.min(i.quantity + newItem.quantity, i.stock) }
            : i
        );
      }
      return [...prev, newItem];
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const updateQuantity = (id: string, qty: number) => {
    setItems((prev) =>
      prev.map((i) => {
        if (i.id === id) {
          const maxAllowed = i.stock;
          const validQty = Math.max(1, Math.min(qty, maxAllowed));
          return { ...i, quantity: validQty };
        }
        return i;
      })
    );
  };

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);
  const clearCart = () => setItems([]);

  const applyPromo = (code: string) => {
    const upperCode = code.trim().toUpperCase();
    if (PROMO_CODES[upperCode]) {
      setPromoCode(upperCode);
      localStorage.setItem(PROMO_KEY, upperCode);
      return { success: true };
    }
    return { success: false, error: 'INVALID PROMO CODE' };
  };

  const removePromo = () => {
    setPromoCode(null);
    localStorage.removeItem(PROMO_KEY);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        isDrawerOpen,
        promoCode,
        addItem,
        removeItem,
        updateQuantity,
        openDrawer,
        closeDrawer,
        applyPromo,
        removePromo,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
