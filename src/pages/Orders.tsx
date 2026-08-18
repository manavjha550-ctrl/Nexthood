import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';

export function Orders() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = "ORDERS — NEXTHOOD STUDIO";
    let metaRobots = document.querySelector('meta[name="robots"]');
    if (!metaRobots) {
      metaRobots = document.createElement('meta');
      metaRobots.setAttribute('name', 'robots');
      document.head.appendChild(metaRobots);
    }
    metaRobots.setAttribute('content', 'noindex');
    window.scrollTo(0, 0);
    
    fetch('/api/orders')
      .then(async res => {
        if (!res.ok) throw new Error('Unable to load orders');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) setOrders(data);
      })
      .catch(err => setError(err instanceof Error ? err.message : 'Unable to load orders'))
      .finally(() => setLoading(false));
  }, []);

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
        <div className="w-full md:w-64 shrink-0 flex flex-col gap-8">
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
          <h2 className="font-syne text-xl font-bold uppercase mb-8 tracking-wide">Order History</h2>
          
          {loading ? (
            <p className="font-outfit text-sm text-brand-off-white/60 uppercase tracking-widest">Loading orders...</p>
          ) : error ? (
            <div className="bg-red-500/10 border border-red-500/40 text-red-400 font-outfit text-xs uppercase tracking-widest p-6 text-center">{error}</div>
          ) : orders.length === 0 ? (
            <div className="bg-brand-near-black border border-brand-charcoal p-8 text-center">
              <p className="font-outfit text-sm text-brand-off-white/60 uppercase tracking-widest mb-6">You haven't placed any orders yet.</p>
              <Link to="/shop" className="font-outfit text-xs font-bold tracking-widest uppercase underline underline-offset-4 hover:text-brand-off-white transition-colors">Explore the Collection</Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Desktop Header */}
              <div className="hidden md:grid grid-cols-5 gap-4 font-outfit text-[10px] tracking-widest uppercase text-brand-off-white/40 pb-4 border-b border-brand-charcoal">
                <div>Order</div>
                <div>Date</div>
                <div>Payment</div>
                <div>Fulfillment</div>
                <div className="text-right">Total</div>
              </div>
              
              {/* Order List */}
              {orders.map(order => (
                <Link key={order.id} to={`/account/orders/${order.id}`} className="group block bg-brand-near-black border border-brand-charcoal p-4 md:p-0 md:border-0 md:bg-transparent md:border-b md:border-brand-charcoal/50 md:pb-4 md:mb-2 hover:bg-brand-charcoal/10 transition-colors">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:items-center font-outfit text-sm">
                    <div>
                      <span className="md:hidden text-[10px] uppercase tracking-widest text-brand-off-white/40 block mb-1">Order</span>
                      <span className="font-bold uppercase tracking-wider group-hover:underline underline-offset-4">{order.orderReference || order.id}</span>
                    </div>
                    <div>
                      <span className="md:hidden text-[10px] uppercase tracking-widest text-brand-off-white/40 block mb-1">Date</span>
                      <span className="text-brand-off-white/80">{new Date(order.date).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="md:hidden text-[10px] uppercase tracking-widest text-brand-off-white/40 block mb-1">Payment</span>
                      <span className={`uppercase tracking-widest text-[10px] px-2 py-1 bg-brand-charcoal/50 inline-block ${order.paymentStatus === 'PAID' ? 'text-green-400' : 'text-brand-off-white'}`}>
                        {order.paymentStatus}
                      </span>
                    </div>
                    <div>
                      <span className="md:hidden text-[10px] uppercase tracking-widest text-brand-off-white/40 block mb-1">Status</span>
                      <span className="uppercase tracking-widest text-[10px] px-2 py-1 bg-brand-charcoal/50 inline-block text-brand-off-white">
                        {order.status}
                      </span>
                    </div>
                    <div className="md:text-right col-span-2 md:col-span-1 mt-2 md:mt-0 pt-4 md:pt-0 border-t border-brand-charcoal md:border-0 flex justify-between md:block">
                      <span className="md:hidden text-[10px] uppercase tracking-widest text-brand-off-white/40">Total</span>
                      <span className="font-medium">₹{order.total.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
