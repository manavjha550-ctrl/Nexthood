import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/ui';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { setUser, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const returnTo = new URLSearchParams(location.search).get('returnTo') || '/account';

  useEffect(() => {
    document.title = "LOGIN — NEXTHOOD STUDIO";
    let metaRobots = document.querySelector('meta[name="robots"]');
    if (!metaRobots) {
      metaRobots = document.createElement('meta');
      metaRobots.setAttribute('name', 'robots');
      document.head.appendChild(metaRobots);
    }
    metaRobots.setAttribute('content', 'noindex');
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate(returnTo, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, returnTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('PLEASE FILL IN ALL FIELDS.');
      return;
    }
    
    setError('');
    setIsSubmitting(true);
    
    try {
      const user = await authService.login(email, password);
      setUser(user);
      navigate(returnTo);
    } catch (err: any) {
      setError(err.message || 'INVALID EMAIL OR PASSWORD.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen pt-32 pb-24 flex items-center justify-center">Checking authentication...</div>;
  }

  return (
    <div className="min-h-screen pt-32 pb-24 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md">
        <h1 className="font-syne text-3xl md:text-4xl font-bold uppercase mb-8 text-center tracking-wide">Welcome Back</h1>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 font-outfit text-xs font-medium uppercase tracking-widest p-4 mb-6 text-center">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <input 
              type="email" 
              placeholder="EMAIL" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border-b border-brand-charcoal py-3 font-outfit text-sm placeholder:text-brand-off-white/40 focus:outline-none focus:border-brand-white transition-colors"
            />
          </div>
          <div className="relative">
            <input 
              type={showPassword ? 'text' : 'password'} 
              placeholder="PASSWORD" 
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
          
          <Button type="submit" variant="primary" className="w-full h-14 mt-4" disabled={isSubmitting}>
            {isSubmitting ? 'LOGGING IN...' : 'LOGIN'}
          </Button>
        </form>
        
        <div className="mt-8 flex flex-col items-center gap-4 font-outfit text-xs tracking-widest uppercase">
          <Link to="/forgot-password" className="text-brand-off-white/60 hover:text-brand-white transition-colors underline underline-offset-4">
            Forgot Password?
          </Link>
          <Link to={`/signup?returnTo=${encodeURIComponent(returnTo)}`} className="text-brand-off-white/60 hover:text-brand-white transition-colors underline underline-offset-4">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}
