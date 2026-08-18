import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui';
import { authService } from '../services/authService';

export function Account() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "ACCOUNT — NEXTHOOD STUDIO";
    let metaRobots = document.querySelector('meta[name="robots"]');
    if (!metaRobots) {
      metaRobots = document.createElement('meta');
      metaRobots.setAttribute('name', 'robots');
      document.head.appendChild(metaRobots);
    }
    metaRobots.setAttribute('content', 'noindex');
    window.scrollTo(0, 0);
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
            <Link to="/account" className="font-bold text-brand-white">Dashboard</Link>
            <Link to="/account/orders" className="text-brand-off-white/60 hover:text-brand-white transition-colors">Orders</Link>
            <Link to="/account/profile" className="text-brand-off-white/60 hover:text-brand-white transition-colors">Profile</Link>
            <button onClick={handleLogout} className="text-left text-brand-off-white/60 hover:text-brand-white transition-colors mt-4">Log Out</button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Orders Summary */}
            <div className="bg-brand-near-black border border-brand-charcoal p-8">
              <h2 className="font-syne text-xl font-bold uppercase mb-6 tracking-wide">Recent Orders</h2>
              <p className="font-outfit text-sm text-brand-off-white/60 leading-relaxed mb-6">
                View your recent purchases, track shipments, and request returns.
              </p>
              <Link to="/account/orders">
                <Button variant="outline" className="w-full text-xs">VIEW ORDERS</Button>
              </Link>
            </div>

            {/* Profile Summary */}
            <div className="bg-brand-near-black border border-brand-charcoal p-8">
              <h2 className="font-syne text-xl font-bold uppercase mb-6 tracking-wide">Profile Details</h2>
              <div className="font-outfit text-sm text-brand-off-white/80 leading-relaxed mb-6 space-y-2">
                <p><span className="text-brand-off-white/40 uppercase tracking-widest text-[10px]">Name:</span><br/>{user.fullName}</p>
                <p><span className="text-brand-off-white/40 uppercase tracking-widest text-[10px]">Email:</span><br/>{user.email}</p>
                {user.phone && <p><span className="text-brand-off-white/40 uppercase tracking-widest text-[10px]">Phone:</span><br/>{user.phone}</p>}
              </div>
              <Link to="/account/profile">
                <Button variant="outline" className="w-full text-xs">EDIT PROFILE</Button>
              </Link>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
