import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/ui';
import { authService } from '../services/authService';
import { Eye, EyeOff } from 'lucide-react';

export function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const token = new URLSearchParams(location.search).get('token');

  useEffect(() => {
    document.title = "NEW PASSWORD — NEXTHOOD STUDIO";
    let metaRobots = document.querySelector('meta[name="robots"]');
    if (!metaRobots) {
      metaRobots = document.createElement('meta');
      metaRobots.setAttribute('name', 'robots');
      document.head.appendChild(metaRobots);
    }
    metaRobots.setAttribute('content', 'noindex');
    window.scrollTo(0, 0);
  }, []);

  if (!token) {
    return (
      <div className="min-h-screen pt-32 pb-24 flex flex-col items-center justify-center px-6 text-center">
        <h1 className="font-syne text-2xl font-bold uppercase mb-4">Invalid Link</h1>
        <p className="font-outfit text-sm text-brand-off-white/60 mb-8 uppercase tracking-widest">The password reset link is missing or invalid.</p>
        <Button variant="outline" onClick={() => navigate('/login')}>RETURN TO LOGIN</Button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('PASSWORD MUST BE AT LEAST 6 CHARACTERS.');
      return;
    }
    if (password !== confirmPassword) {
      setError('PASSWORDS DO NOT MATCH.');
      return;
    }
    
    setError('');
    setIsSubmitting(true);
    
    try {
      await authService.resetPassword(token, password);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'PASSWORD RESET FAILED.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen pt-32 pb-24 flex flex-col items-center justify-center px-6 text-center">
        <h1 className="font-syne text-3xl font-bold uppercase mb-4">Password Updated</h1>
        <p className="font-outfit text-sm text-brand-off-white/60 mb-8 uppercase tracking-widest">Your password has been successfully reset.</p>
        <Button variant="primary" onClick={() => navigate('/login')}>LOGIN NOW</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-24 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md">
        <h1 className="font-syne text-3xl md:text-4xl font-bold uppercase mb-8 text-center tracking-wide">New Password</h1>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 font-outfit text-xs font-medium uppercase tracking-widest p-4 mb-6 text-center">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="relative">
            <input 
              type={showPassword ? 'text' : 'password'} 
              placeholder="NEW PASSWORD (MIN 6 CHARACTERS)" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent border-b border-brand-charcoal py-3 font-outfit text-sm placeholder:text-brand-off-white/40 focus:outline-none focus:border-brand-white transition-colors pr-10"
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-0 top-1/2 -translate-y-1/2 text-brand-off-white/50 hover:text-brand-white transition-colors p-2"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <div>
            <input 
              type={showPassword ? 'text' : 'password'} 
              placeholder="CONFIRM NEW PASSWORD" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-transparent border-b border-brand-charcoal py-3 font-outfit text-sm placeholder:text-brand-off-white/40 focus:outline-none focus:border-brand-white transition-colors"
            />
          </div>
          
          <Button type="submit" variant="primary" className="w-full h-14 mt-4" disabled={isSubmitting}>
            {isSubmitting ? 'UPDATING...' : 'RESET PASSWORD'}
          </Button>
        </form>
      </div>
    </div>
  );
}
