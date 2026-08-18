import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { AssetImage, Button } from '../components/ui';
import { OrderSummary } from '../components/OrderSummary';
import { X, Minus, Plus } from 'lucide-react';
import { calculateOrderTotals, FREE_SHIPPING_THRESHOLD } from '../lib/cart';

export function Bag() {
  const { items, removeItem, updateQuantity } = useCart();
  
  useEffect(() => {
    let metaRobots = document.querySelector('meta[name="robots"]');
    if (!metaRobots) {
      metaRobots = document.createElement('meta');
      metaRobots.setAttribute('name', 'robots');
      document.head.appendChild(metaRobots);
    }
    metaRobots.setAttribute('content', 'noindex');

    document.title = "YOUR BAG — NEXTHOOD STUDIO";
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const { subtotal } = calculateOrderTotals(items, null);
  const awayFromFree = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progressPercent = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-32 pb-24 flex flex-col items-center justify-center text-center px-6">
        <h1 className="font-syne text-3xl md:text-5xl font-bold uppercase mb-4">Your Bag is Empty</h1>
        <p className="font-outfit text-sm tracking-widest text-brand-off-white/60 uppercase mb-8">Discover the latest from Nexthood Studio.</p>
        <Link to="/shop"><Button variant="primary">Shop the Collection</Button></Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-24">
      <div className="container mx-auto px-4 lg:px-12">
        <h1 className="font-syne text-3xl md:text-5xl font-bold uppercase tracking-wide mb-2">Your Bag</h1>
        <p className="font-outfit text-xs tracking-widest text-brand-off-white/60 uppercase mb-12">Your Selected Pieces.</p>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          {/* Left: Cart Items */}
          <div className="w-full lg:w-7/12 xl:w-2/3">
            <div className="hidden md:grid grid-cols-12 gap-4 pb-4 border-b border-brand-charcoal font-outfit text-xs tracking-widest uppercase text-brand-off-white/60">
              <div className="col-span-6">Product</div>
              <div className="col-span-3 text-center">Quantity</div>
              <div className="col-span-3 text-right">Total</div>
            </div>

            <div className="flex flex-col gap-6 md:gap-8 pt-6 md:pt-8">
              {items.map((item) => (
                <div key={item.id} className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 border-b border-brand-charcoal/50 pb-6 md:pb-8">
                  {/* Product Info */}
                  <div className="flex gap-4 md:col-span-6 md:w-1/2 shrink-0">
                    <Link to={`/products/${item.slug}`} className="w-24 h-32 md:w-32 md:h-40 bg-brand-charcoal shrink-0">
                      <AssetImage src={item.image} alt={item.name} productName={item.name} className="w-full h-full object-cover" />
                    </Link>
                    <div className="flex flex-col justify-center">
                      <Link to={`/products/${item.slug}`} className="font-syne font-bold uppercase text-sm md:text-base leading-tight hover:underline mb-1">
                        {item.name}
                      </Link>
                      <p className="font-outfit text-[10px] md:text-xs tracking-widest uppercase text-brand-off-white/60">
                        Size: {item.size}
                      </p>
                      <p className="font-outfit text-[10px] md:text-xs tracking-widest uppercase text-brand-off-white/40 mt-1">
                        SKU: {item.sku}
                      </p>
                      <button 
                        onClick={() => removeItem(item.id)} 
                        className="mt-4 text-brand-off-white/50 hover:text-brand-white text-xs tracking-widest uppercase underline underline-offset-4 self-start"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:w-1/2 gap-4">
                    {/* Quantity */}
                    <div className="flex items-center border border-brand-charcoal h-10 bg-brand-near-black w-28 md:mx-auto">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)} 
                        className="w-10 h-full flex items-center justify-center text-brand-off-white/60 hover:text-brand-white"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="flex-1 text-center font-outfit text-sm font-medium">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)} 
                        disabled={item.quantity >= item.stock}
                        className="w-10 h-full flex items-center justify-center text-brand-off-white/60 hover:text-brand-white disabled:opacity-30"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    {/* Total */}
                    <div className="font-outfit text-sm md:text-base font-medium text-right md:w-24">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="w-full lg:w-5/12 xl:w-1/3">
            <div className="bg-brand-charcoal/20 border border-brand-charcoal p-6 lg:p-8 sticky top-24">
              <h2 className="font-syne text-xl font-bold uppercase tracking-wide mb-6">Order Summary</h2>
              
              <div className="mb-6">
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

              <OrderSummary showPromo={true} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
