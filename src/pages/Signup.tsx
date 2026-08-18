import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/ui';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

export function Signup() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState('');
  
  const { setUser, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const returnTo = new URLSearchParams(location.search).get('returnTo') || '/account';

  useEffect(() => {
    document.title = "CREATE ACCOUNT — NEXTHOOD STUDIO";
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const val = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({ ...prev, phone: val }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (generalError) setGeneralError('');
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Required';
    if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Valid email required';
    if (formData.phone && !/^\d{10}$/.test(formData.phone)) newErrors.phone = 'Valid 10-digit number required';
    if (formData.password.length < 6) newErrors.password = 'Minimum 6 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords must match';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsSubmitting(true);
    
    try {
      const user = await authService.register(formData.fullName, formData.email, formData.password, formData.phone);
      setUser(user);
      navigate(returnTo);
    } catch (err: any) {
      setGeneralError(err.message || 'REGISTRATION FAILED.');
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
        <h1 className="font-syne text-3xl md:text-4xl font-bold uppercase mb-8 text-center tracking-wide">Create Account</h1>
        
        {generalError && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 font-outfit text-xs font-medium uppercase tracking-widest p-4 mb-6 text-center">
            {generalError}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <input 
              name="fullName"
              placeholder="FULL NAME" 
              value={formData.fullName}
              onChange={handleChange}
              className={`w-full bg-transparent border-b ${errors.fullName ? 'border-red-500' : 'border-brand-charcoal'} py-3 font-outfit text-sm placeholder:text-brand-off-white/40 focus:outline-none focus:border-brand-white transition-colors`}
            />
            {errors.fullName && <span className="text-red-500 text-[10px] uppercase tracking-widest mt-1 block">{errors.fullName}</span>}
          </div>
          <div>
            <input 
              type="email"
              name="email"
              placeholder="EMAIL" 
              value={formData.email}
              onChange={handleChange}
              className={`w-full bg-transparent border-b ${errors.email ? 'border-red-500' : 'border-brand-charcoal'} py-3 font-outfit text-sm placeholder:text-brand-off-white/40 focus:outline-none focus:border-brand-white transition-colors`}
            />
            {errors.email && <span className="text-red-500 text-[10px] uppercase tracking-widest mt-1 block">{errors.email}</span>}
          </div>
          <div>
            <input 
              type="tel"
              name="phone"
              placeholder="PHONE (OPTIONAL)" 
              value={formData.phone}
              onChange={handleChange}
              className={`w-full bg-transparent border-b ${errors.phone ? 'border-red-500' : 'border-brand-charcoal'} py-3 font-outfit text-sm placeholder:text-brand-off-white/40 focus:outline-none focus:border-brand-white transition-colors`}
            />
            {errors.phone && <span className="text-red-500 text-[10px] uppercase tracking-widest mt-1 block">{errors.phone}</span>}
          </div>
          <div className="relative">
            <input 
              type={showPassword ? 'text' : 'password'} 
              name="password"
              placeholder="PASSWORD (MIN 6 CHARACTERS)" 
              value={formData.password}
              onChange={handleChange}
              className={`w-full bg-transparent border-b ${errors.password ? 'border-red-500' : 'border-brand-charcoal'} py-3 font-outfit text-sm placeholder:text-brand-off-white/40 focus:outline-none focus:border-brand-white transition-colors pr-10`}
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-0 top-1/2 -translate-y-1/2 text-brand-off-white/50 hover:text-brand-white transition-colors p-2"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
            {errors.password && <span className="text-red-500 text-[10px] uppercase tracking-widest mt-1 block">{errors.password}</span>}
          </div>
          <div>
            <input 
              type={showPassword ? 'text' : 'password'} 
              name="confirmPassword"
              placeholder="CONFIRM PASSWORD" 
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full bg-transparent border-b ${errors.confirmPassword ? 'border-red-500' : 'border-brand-charcoal'} py-3 font-outfit text-sm placeholder:text-brand-off-white/40 focus:outline-none focus:border-brand-white transition-colors`}
            />
            {errors.confirmPassword && <span className="text-red-500 text-[10px] uppercase tracking-widest mt-1 block">{errors.confirmPassword}</span>}
          </div>
          
          <Button type="submit" variant="primary" className="w-full h-14 mt-4" disabled={isSubmitting}>
            {isSubmitting ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
          </Button>
        </form>
        
        <div className="mt-8 flex justify-center font-outfit text-xs tracking-widest uppercase">
          <Link to={`/login?returnTo=${encodeURIComponent(returnTo)}`} className="text-brand-off-white/60 hover:text-brand-white transition-colors underline underline-offset-4">
            Already have an account? Login
          </Link>
        </div>
      </div>
    </div>
  );
}
