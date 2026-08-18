import React, { useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { X, Minus, Plus } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Link, useLocation } from 'react-router-dom';
import { calculateOrderTotals, FREE_SHIPPING_THRESHOLD } from '../lib/cart';
import { AssetImage, Button } from './ui';
import { OrderSummary } from './OrderSummary';

export function BagDrawer() {
  const { isDrawerOpen, closeDrawer, items, removeItem, updateQuantity } = useCart();
  const location = useLocation();

  // Close drawer on route change
  useEffect(() => {
    closeDrawer();
  }, [location.pathname]);

  // Lock body scroll when open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isDrawerOpen]);

  const { subtotal } = calculateOrderTotals(items, null);
  const awayFromFree = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progressPercent = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-brand-black/60 backdrop-blur-sm"
            onClick={closeDrawer}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-brand-near-black border-l border-brand-charcoal flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-brand-charcoal">
              <h2 className="font-syne text-xl font-bold uppercase tracking-wide">Your Bag ({items.length})</h2>
              <button onClick={closeDrawer} className="text-brand-off-white hover:text-brand-white p-1">
                <X size={24} strokeWidth={1} />
              </button>
            </div>

            {/* Free Shipping Progress */}
            <div className="p-4 bg-brand-charcoal/30 border-b border-brand-charcoal">
              <p className="font-outfit text-xs tracking-widest uppercase text-center mb-2 text-brand-off-white">
                {awayFromFree > 0 ? (
                  <>You are <span className="font-bold text-brand-white">₹{awayFromFree.toLocaleString('en-IN')}</span> away from free shipping</>
                ) : (
                  <span className="font-bold text-green-400">YOU QUALIFY FOR FREE SHIPPING</span>
                )}
              </p>
              <div className="w-full bg-brand-charcoal h-1 overflow-hidden">
                <div 
                  className="bg-brand-white h-full transition-all duration-500 ease-out" 
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 hide-scrollbar">
              {items.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <p className="font-syne text-xl font-bold uppercase mb-2">Your Bag is Empty.</p>
                  <p className="font-outfit text-xs tracking-widest text-brand-off-white/60 uppercase mb-8">Discover the latest from Nexthood Studio.</p>
                  <Link to="/shop" onClick={closeDrawer}>
                    <Button variant="outline" className="px-8 text-xs">Shop the Collection</Button>
                  </Link>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <Link to={`/products/${item.slug}`} className="w-24 h-32 bg-brand-charcoal shrink-0" onClick={closeDrawer}>
                      <AssetImage src={item.image} alt={item.name} productName={item.name} className="w-full h-full object-cover" />
                    </Link>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <Link to={`/products/${item.slug}`} className="font-syne font-bold uppercase text-sm leading-tight hover:underline" onClick={closeDrawer}>
                            {item.name}
                          </Link>
                          <button onClick={() => removeItem(item.id)} className="text-brand-off-white/50 hover:text-brand-white">
                            <X size={16} />
                          </button>
                        </div>
                        <p className="font-outfit text-[10px] tracking-widest uppercase text-brand-off-white/60 mt-1">
                          Size: {item.size} {item.color ? `| Color: ${item.color}` : ''}
                        </p>
                        <p className="font-outfit text-[10px] tracking-widest uppercase text-brand-off-white/40 mt-0.5">
                          SKU: {item.sku}
                        </p>
                      </div>
                      <div className="flex items-end justify-between mt-4">
                        {/* Quantity */}
                        <div className="flex items-center border border-brand-charcoal h-8 bg-brand-near-black w-24">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)} 
                            className="w-8 h-full flex items-center justify-center text-brand-off-white/60 hover:text-brand-white"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="flex-1 text-center font-outfit text-xs font-medium">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)} 
                            disabled={item.quantity >= item.stock}
                            className="w-8 h-full flex items-center justify-center text-brand-off-white/60 hover:text-brand-white disabled:opacity-30"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <p className="font-outfit text-sm font-medium">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 border-t border-brand-charcoal bg-brand-near-black">
                <div className="mb-4">
                  <div className="flex justify-between items-center text-lg md:text-xl font-syne font-bold uppercase mb-4">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <p className="font-outfit text-[10px] tracking-widest uppercase text-brand-off-white/60 text-center mb-4">
                    Shipping & discounts calculated at checkout.
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <Link to="/bag" onClick={closeDrawer} className="w-full">
                    <Button variant="outline" className="w-full h-12 text-xs">VIEW BAG</Button>
                  </Link>
                  <Link to="/checkout" onClick={closeDrawer} className="w-full">
                    <Button variant="primary" className="w-full h-12 text-xs">CHECKOUT</Button>
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
