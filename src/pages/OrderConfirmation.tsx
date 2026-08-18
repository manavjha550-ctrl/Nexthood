import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function OrderConfirmation() {
  const { user } = useAuth();
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'ORDER CONFIRMED — NEXTHOOD STUDIO';
    window.scrollTo(0, 0);
    if (!orderId) return;

    fetch(`/api/orders/${orderId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Order not found');
        return res.json();
      })
      .then(setOrder)
      .catch((err) => setError(err instanceof Error ? err.message : 'Unable to load order'))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-brand-black pt-32 pb-24 px-6">
      <div className="max-w-4xl mx-auto">
        {loading ? (
          <div className="text-center py-20 font-outfit text-xs uppercase tracking-widest text-brand-off-white/60">Loading order...</div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="font-outfit text-xs uppercase tracking-widest text-red-400 mb-6">{error}</p>
            <Link to="/account/orders" className="font-outfit text-xs uppercase tracking-widest underline underline-offset-4">View Orders</Link>
          </div>
        ) : (
          <div className="space-y-10">
            <div className="border border-brand-charcoal bg-brand-near-black p-8 md:p-12 text-center">
              <div className="mx-auto mb-6 w-12 h-12 rounded-full border border-green-400/50 text-green-400 flex items-center justify-center text-xl">✓</div>
              <p className="font-outfit text-[10px] uppercase tracking-[0.3em] text-brand-off-white/50 mb-3">NEXTHOOD STUDIO</p>
              <h1 className="font-syne text-3xl md:text-5xl font-bold uppercase tracking-tight mb-4">Order Confirmed</h1>
              <p className="font-outfit text-sm text-brand-off-white/60 max-w-xl mx-auto">Your order has been created successfully. Payment status and fulfillment status are shown below.</p>
              <div className="mt-8 flex flex-wrap justify-center gap-3 text-[10px] uppercase tracking-widest">
                <span className="px-3 py-2 border border-brand-charcoal">{order.orderReference}</span>
                <span className="px-3 py-2 border border-brand-charcoal">PAYMENT: {order.paymentStatus}</span>
                <span className="px-3 py-2 border border-brand-charcoal">STATUS: {order.status}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="border border-brand-charcoal bg-brand-near-black p-6">
                <h2 className="font-syne text-sm font-bold uppercase tracking-wide mb-5">Items</h2>
                <div className="space-y-5">
                  {order.items?.map((item: any) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-16 h-20 bg-brand-charcoal/30 shrink-0 overflow-hidden">
                        {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover mix-blend-lighten" />}
                      </div>
                      <div className="flex-1 flex justify-between gap-4">
                        <div>
                          <p className="font-syne text-sm font-bold uppercase">{item.name}</p>
                          <p className="font-outfit text-[10px] text-brand-off-white/50 uppercase tracking-widest mt-1">
                            {[item.size && `Size: ${item.size}`, item.color && `Color: ${item.color}`, `Qty: ${item.quantity}`].filter(Boolean).join(' · ')}
                          </p>
                        </div>
                        <p className="font-outfit text-sm">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-brand-charcoal bg-brand-near-black p-6">
                <h2 className="font-syne text-sm font-bold uppercase tracking-wide mb-5">Order Summary</h2>
                <div className="space-y-3 font-outfit text-sm">
                  <div className="flex justify-between text-brand-off-white/60"><span>Subtotal</span><span>₹{order.subtotal?.toLocaleString('en-IN')}</span></div>
                  <div className="flex justify-between text-brand-off-white/60"><span>Discount</span><span>-₹{order.discount?.toLocaleString('en-IN')}</span></div>
                  <div className="flex justify-between text-brand-off-white/60"><span>Shipping</span><span>{order.shipping === 0 ? 'FREE' : `₹${order.shipping?.toLocaleString('en-IN')}`}</span></div>
                  <div className="flex justify-between text-brand-off-white/60"><span>Tax</span><span>₹{order.tax?.toLocaleString('en-IN')}</span></div>
                  <div className="border-t border-brand-charcoal pt-4 mt-4 flex justify-between font-bold"><span>Total</span><span>₹{order.total?.toLocaleString('en-IN')}</span></div>
                </div>
              </div>
            </div>

            <div className="border border-brand-charcoal bg-brand-near-black p-6">
              <h2 className="font-syne text-sm font-bold uppercase tracking-wide mb-5">Shipping Address</h2>
              <div className="font-outfit text-sm text-brand-off-white/75 leading-relaxed">
                <p>{order.shippingAddress?.fullName}</p>
                <p>{order.shippingAddress?.addressLine}</p>
                <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.pincode}</p>
                <p className="text-brand-off-white/40 mt-2">{order.shippingAddress?.phone}</p>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              <Link to={`/account/orders/${order.id}`} className="px-6 py-3 border border-brand-white font-outfit text-xs font-bold uppercase tracking-widest hover:bg-brand-white hover:text-brand-black transition-colors">View Order</Link>
              <Link to="/account/orders" className="px-6 py-3 border border-brand-charcoal font-outfit text-xs font-bold uppercase tracking-widest hover:border-brand-white transition-colors">All Orders</Link>
              <Link to="/shop" className="px-6 py-3 bg-brand-white text-brand-black font-outfit text-xs font-bold uppercase tracking-widest hover:bg-brand-off-white transition-colors">Continue Shopping</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
