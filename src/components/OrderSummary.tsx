import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { calculateOrderTotals } from '../lib/cart';
import { Button } from './ui';
import { Link } from 'react-router-dom';

interface OrderSummaryProps {
  showPromo?: boolean;
  onCheckout?: boolean;
}

export function OrderSummary({ showPromo = true, onCheckout = false }: OrderSummaryProps) {
  const { items, promoCode, applyPromo, removePromo, closeDrawer } = useCart();
  const { subtotal, discount, shipping, tax, total } = calculateOrderTotals(items, promoCode);
  
  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState<string | null>(null);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    const result = applyPromo(promoInput);
    if (!result.success) {
      setPromoError(result.error || 'INVALID PROMO CODE');
    } else {
      setPromoError(null);
      setPromoInput('');
    }
  };

  return (
    <div className="flex flex-col gap-4 font-outfit">
      {showPromo && (
        <div className="mb-4">
          {!promoCode ? (
            <form onSubmit={handleApplyPromo} className="flex gap-2">
              <input 
                type="text" 
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
                placeholder="PROMO CODE" 
                className="flex-1 bg-brand-charcoal border border-brand-charcoal px-3 py-2 text-xs uppercase tracking-widest text-brand-white focus:outline-none focus:border-brand-off-white"
              />
              <Button type="submit" variant="outline" className="px-4 py-2 h-auto text-[10px]">APPLY</Button>
            </form>
          ) : (
            <div className="flex items-center justify-between bg-brand-white/10 px-3 py-2 border border-brand-white/20 text-xs">
              <div className="flex gap-2 items-center">
                <span className="font-bold tracking-widest">{promoCode}</span>
                <span className="text-green-400">APPLIED</span>
              </div>
              <button onClick={removePromo} className="text-brand-off-white hover:text-brand-white uppercase text-[10px] tracking-widest underline underline-offset-2">
                REMOVE
              </button>
            </div>
          )}
          {promoError && <p className="text-red-400 text-[10px] uppercase tracking-widest mt-2">{promoError}</p>}
        </div>
      )}

      <div className="flex justify-between items-center text-sm">
        <span className="text-brand-off-white/70 uppercase tracking-wider">Subtotal</span>
        <span className="font-medium">₹{subtotal.toLocaleString('en-IN')}</span>
      </div>

      {discount > 0 && (
        <div className="flex justify-between items-center text-sm text-green-400">
          <span className="uppercase tracking-wider">Discount</span>
          <span className="font-medium">-₹{discount.toLocaleString('en-IN')}</span>
        </div>
      )}

      <div className="flex justify-between items-center text-sm">
        <span className="text-brand-off-white/70 uppercase tracking-wider">Shipping</span>
        <span className="font-medium">{shipping === 0 ? 'FREE' : `₹${shipping.toLocaleString('en-IN')}`}</span>
      </div>

      <div className="flex justify-between items-center text-sm">
        <span className="text-brand-off-white/70 uppercase tracking-wider">Tax (Included)</span>
        <span className="font-medium">₹{tax.toLocaleString('en-IN')}</span>
      </div>

      <div className="border-t border-brand-charcoal my-2"></div>

      <div className="flex justify-between items-center text-lg md:text-xl font-syne font-bold uppercase">
        <span>Total</span>
        <span>₹{total.toLocaleString('en-IN')}</span>
      </div>

      {!onCheckout && items.length > 0 && (
        <Link to="/checkout" className="mt-4 block" onClick={closeDrawer}>
          <Button variant="primary" className="w-full h-12 text-xs">
            PROCEED TO CHECKOUT
          </Button>
        </Link>
      )}
    </div>
  );
}
