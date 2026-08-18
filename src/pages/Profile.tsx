import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { Button } from '../components/ui';

export function Profile() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [message, setMessage] = useState({ type: '', text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);

  useEffect(() => {
    document.title = "PROFILE — NEXTHOOD STUDIO";
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

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.email.trim()) {
      setMessage({ type: 'error', text: 'NAME AND EMAIL ARE REQUIRED.' });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const updatedUser = await authService.updateProfile(formData.fullName, formData.email, formData.phone);
      setUser(updatedUser);
      setMessage({ type: 'success', text: 'PROFILE UPDATED SUCCESSFULLY.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'FAILED TO UPDATE PROFILE.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'NEW PASSWORD MUST BE AT LEAST 6 CHARACTERS.' });
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'PASSWORDS DO NOT MATCH.' });
      return;
    }
    
    setIsPasswordSubmitting(true);
    try {
      await authService.changePassword(passwordData.currentPassword, passwordData.newPassword);
      setMessage({ type: 'success', text: 'PASSWORD UPDATED SUCCESSFULLY.' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'FAILED TO UPDATE PASSWORD.' });
    } finally {
      setIsPasswordSubmitting(false);
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
            <Link to="/account/orders" className="text-brand-off-white/60 hover:text-brand-white transition-colors">Orders</Link>
            <Link to="/account/profile" className="font-bold text-brand-white">Profile</Link>
            <button onClick={handleLogout} className="text-left text-brand-off-white/60 hover:text-brand-white transition-colors mt-4">Log Out</button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 max-w-2xl">
          <h2 className="font-syne text-xl font-bold uppercase mb-8 tracking-wide">Profile Details</h2>
          
          {message.text && (
            <div className={`border font-outfit text-xs font-medium uppercase tracking-widest p-4 mb-8 text-center ${message.type === 'error' ? 'bg-red-500/10 border-red-500/50 text-red-500' : 'bg-green-500/10 border-green-500/50 text-green-400'}`}>
              {message.text}
            </div>
          )}

          <div className="bg-brand-near-black border border-brand-charcoal p-8 mb-8">
            <form onSubmit={handleProfileUpdate} className="flex flex-col gap-6">
              <div>
                <label className="block font-outfit text-[10px] uppercase tracking-widest text-brand-off-white/40 mb-2">Full Name</label>
                <input 
                  type="text" 
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  className="w-full bg-transparent border-b border-brand-charcoal py-2 font-outfit text-sm focus:outline-none focus:border-brand-white transition-colors"
                />
              </div>
              <div>
                <label className="block font-outfit text-[10px] uppercase tracking-widest text-brand-off-white/40 mb-2">Email Address</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full bg-transparent border-b border-brand-charcoal py-2 font-outfit text-sm focus:outline-none focus:border-brand-white transition-colors"
                />
              </div>
              <div>
                <label className="block font-outfit text-[10px] uppercase tracking-widest text-brand-off-white/40 mb-2">Phone Number</label>
                <input 
                  type="tel" 
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                  className="w-full bg-transparent border-b border-brand-charcoal py-2 font-outfit text-sm focus:outline-none focus:border-brand-white transition-colors"
                />
              </div>
              
              <Button type="submit" variant="primary" className="mt-4 self-start" disabled={isSubmitting}>
                {isSubmitting ? 'SAVING...' : 'SAVE CHANGES'}
              </Button>
            </form>
          </div>

          <h2 className="font-syne text-xl font-bold uppercase mb-8 tracking-wide">Change Password</h2>
          
          <div className="bg-brand-near-black border border-brand-charcoal p-8">
            <form onSubmit={handlePasswordUpdate} className="flex flex-col gap-6">
              <div>
                <label className="block font-outfit text-[10px] uppercase tracking-widest text-brand-off-white/40 mb-2">Current Password</label>
                <input 
                  type="password" 
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className="w-full bg-transparent border-b border-brand-charcoal py-2 font-outfit text-sm focus:outline-none focus:border-brand-white transition-colors"
                />
              </div>
              <div>
                <label className="block font-outfit text-[10px] uppercase tracking-widest text-brand-off-white/40 mb-2">New Password</label>
                <input 
                  type="password" 
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="w-full bg-transparent border-b border-brand-charcoal py-2 font-outfit text-sm focus:outline-none focus:border-brand-white transition-colors"
                />
              </div>
              <div>
                <label className="block font-outfit text-[10px] uppercase tracking-widest text-brand-off-white/40 mb-2">Confirm New Password</label>
                <input 
                  type="password" 
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full bg-transparent border-b border-brand-charcoal py-2 font-outfit text-sm focus:outline-none focus:border-brand-white transition-colors"
                />
              </div>
              
              <Button type="submit" variant="primary" className="mt-4 self-start" disabled={isPasswordSubmitting}>
                {isPasswordSubmitting ? 'UPDATING...' : 'UPDATE PASSWORD'}
              </Button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
