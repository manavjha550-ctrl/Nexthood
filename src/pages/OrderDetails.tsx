import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';

export function OrderDetails() {
  const { user, setUser } = useAuth();
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = `ORDER ${orderId} — NEXTHOOD STUDIO`;
    let metaRobots = document.querySelector('meta[name="robots"]');
    if (!metaRobots) {
      metaRobots = document.createElement('meta');
      metaRobots.setAttribute('name', 'robots');
      document.head.appendChild(metaRobots);
    }
    metaRobots.setAttribute('content', 'noindex');
    window.scrollTo(0, 0);
    
    fetch(`/api/orders/${orderId}`)
      .then(res => {
        if (!res.ok) throw new Error('Order not found');
        return res.json();
      })
      .then(data => {
        setOrder(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [orderId]);

  const handleLogout = async () => {
    try {
      await authService.logout();
      setUser(null);
      navigate('/');
    } catch (e) {
      console.error('Logout failed', e);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 container mx-auto">
      <div className="flex flex-col md:flex-row gap-12 lg:gap-16">
        
        {/* Sidebar */}
        <div className="w-full md:w-64 shrink-0 flex flex-col gap-8 hidden md:flex">
          <div>
            <h1 className="font-syne text-2xl font-bold uppercase mb-2">My Account</h1>
            <p className="font-outfit text-xs text-brand-off-white/60 tracking-widest uppercase">Welcome back, {user.fullName.split(' ')[0]}</p>
          </div>
          
          <nav className="flex flex-col gap-4 font-outfit text-sm tracking-widest uppercase">
            <Link to="/account" className="text-brand-off-white/60 hover:text-brand-white transition-colors">Dashboard</Link>
            <Link to="/account/orders" className="font-bold text-brand-white">Orders</Link>
            <Link to="/account/profile" className="text-brand-off-white/60 hover:text-brand-white transition-colors">Profile</Link>
            <button onClick={handleLogout} className="text-left text-brand-off-white/60 hover:text-brand-white transition-colors mt-4">Log Out</button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <Link to="/account/orders" className="font-outfit text-xs text-brand-off-white/60 hover:text-brand-white uppercase tracking-widest mb-6 inline-block underline underline-offset-4">
            ← BACK TO ORDERS
          </Link>
          
          <h2 className="font-syne text-xl md:text-2xl font-bold uppercase mb-8 tracking-wide">
            Order {order.orderReference || orderId}
          </h2>
          
          {loading ? (
            <p className="font-outfit text-sm text-brand-off-white/60 uppercase tracking-widest">Loading order details...</p>
          ) : error ? (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 font-outfit text-xs font-medium uppercase tracking-widest p-4 text-center">
              {error}
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-b border-brand-charcoal pb-8">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-brand-off-white/40 block mb-1">Date</span>
                  <span className="font-outfit text-sm text-brand-off-white/80">{new Date(order.date).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-brand-off-white/40 block mb-1">Total</span>
                  <span className="font-outfit text-sm font-medium">₹{order.total.toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-brand-off-white/40 block mb-1">Payment</span>
                  <span className={`font-outfit uppercase tracking-widest text-[10px] px-2 py-1 bg-brand-charcoal/50 inline-block ${order.paymentStatus === 'PAID' ? 'text-green-400' : 'text-brand-off-white'}`}>
                    {order.paymentStatus}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-brand-off-white/40 block mb-1">Status</span>
                  <span className="font-outfit uppercase tracking-widest text-[10px] px-2 py-1 bg-brand-charcoal/50 inline-block text-brand-off-white">
                    {order.status}
                  </span>
                </div>
              </div>

              {order.statusEvents?.length > 0 && (
                <div className="border-b border-brand-charcoal pb-8">
                  <h3 className="font-syne text-lg font-bold uppercase tracking-wide mb-6">Order Timeline</h3>
                  <div className="space-y-4">
                    {order.statusEvents.map((event: any) => (
                      <div key={event.id} className="flex items-start gap-4">
                        <div className="mt-1 w-2 h-2 rounded-full bg-brand-white shrink-0" />
                        <div>
                          <p className="font-outfit text-xs font-bold uppercase tracking-widest">{event.newStatus}</p>
                          <p className="font-outfit text-[10px] text-brand-off-white/40 uppercase tracking-widest mt-1">{new Date(event.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Items */}
              <div className="border-b border-brand-charcoal pb-8">
                <h3 className="font-syne text-lg font-bold uppercase tracking-wide mb-6">Items</h3>
                <div className="flex flex-col gap-6">
                  {order.items?.map((item: { id: string; productId: string; name: string; size: string | null; quantity: number; price: number; image: string | null }) => (
                    <div key={`${item.id}-${item.size}`} className="flex gap-4">
                      <div className="w-20 h-24 bg-brand-charcoal/30 flex-shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover mix-blend-lighten" />
                      </div>
                      <div className="flex-1 flex justify-between">
                        <div>
                          <Link to={`/products/${item.productId}`} className="font-syne font-bold uppercase tracking-wide text-sm hover:underline underline-offset-4">{item.name}</Link>
                          <p className="font-outfit text-xs text-brand-off-white/60 uppercase tracking-widest mt-1">Size: {item.size}</p>
                          <p className="font-outfit text-xs text-brand-off-white/60 uppercase tracking-widest mt-1">Qty: {item.quantity}</p>
                        </div>
                        <div className="font-outfit text-sm font-medium">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-brand-near-black border border-brand-charcoal p-6 space-y-8">
                  <div>
                    <h3 className="font-syne text-sm font-bold uppercase tracking-wide mb-4">Shipping Address</h3>
                    <div className="font-outfit text-sm text-brand-off-white/80 leading-relaxed">
                      <p>{order.shippingAddress?.fullName}</p>
                      <p>{order.shippingAddress?.addressLine}</p>
                      <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.pincode}</p>
                      <p className="mt-2 text-brand-off-white/40">{order.shippingAddress?.phone}</p>
                    </div>
                  </div>
                  {order.billingAddress && (
                    <div className="pt-6 border-t border-brand-charcoal">
                      <h3 className="font-syne text-sm font-bold uppercase tracking-wide mb-4">Billing Address</h3>
                      <div className="font-outfit text-sm text-brand-off-white/80 leading-relaxed">
                        <p>{order.billingAddress.fullName}</p>
                        <p>{order.billingAddress.addressLine}</p>
                        <p>{order.billingAddress.city}, {order.billingAddress.state} {order.billingAddress.pincode}</p>
                        <p className="mt-2 text-brand-off-white/40">{order.billingAddress.phone}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="bg-brand-near-black border border-brand-charcoal p-6 flex flex-col gap-3 font-outfit text-sm">
                  <div className="flex justify-between text-brand-off-white/60">
                    <span>Subtotal</span>
                    <span>₹{order.subtotal?.toLocaleString('en-IN')}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-green-400">
                      <span>Discount</span>
                      <span>-₹{order.discount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-brand-off-white/60">
                    <span>Shipping</span>
                    <span>{order.shipping === 0 ? 'FREE' : `₹${order.shipping.toLocaleString('en-IN')}`}</span>
                  </div>
                  <div className="flex justify-between text-brand-off-white/60">
                    <span>Tax</span>
                    <span>₹{order.tax?.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="pt-3 mt-3 border-t border-brand-charcoal flex justify-between font-bold text-base">
                    <span>Total</span>
                    <span>₹{order.total?.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
