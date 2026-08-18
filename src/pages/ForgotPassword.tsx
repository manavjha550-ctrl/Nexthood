import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui';
import { authService } from '../services/authService';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    document.title = "RESET PASSWORD — NEXTHOOD STUDIO";
    let metaRobots = document.querySelector('meta[name="robots"]');
    if (!metaRobots) {
      metaRobots = document.createElement('meta');
      metaRobots.setAttribute('name', 'robots');
      document.head.appendChild(metaRobots);
    }
    metaRobots.setAttribute('content', 'noindex');
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setMessage('PLEASE ENTER A VALID EMAIL.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await authService.requestPasswordReset(email);
      setMessage('IF AN ACCOUNT EXISTS, A PASSWORD RESET LINK HAS BEEN SENT.');
    } catch (err: any) {
      // Still show a generic message to prevent enumeration, unless it's a network error
      setMessage('IF AN ACCOUNT EXISTS, A PASSWORD RESET LINK HAS BEEN SENT.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-24 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md">
        <h1 className="font-syne text-3xl md:text-4xl font-bold uppercase mb-4 text-center tracking-wide">Reset Your Password</h1>
        <p className="font-outfit text-xs text-brand-off-white/60 tracking-widest text-center uppercase mb-8">
          Enter your email to receive a reset link.
        </p>

        {message && (
          <div className="bg-brand-charcoal/30 border border-brand-charcoal text-brand-white font-outfit text-xs font-medium uppercase tracking-widest p-4 mb-6 text-center leading-relaxed">
            {message}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <input 
              type="email" 
              placeholder="EMAIL ADDRESS" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border-b border-brand-charcoal py-3 font-outfit text-sm placeholder:text-brand-off-white/40 focus:outline-none focus:border-brand-white transition-colors"
            />
          </div>
          
          <Button type="submit" variant="primary" className="w-full h-14 mt-4" disabled={isSubmitting || !!message}>
            {isSubmitting ? 'SENDING...' : 'SEND RESET LINK'}
          </Button>
        </form>
        
        <div className="mt-8 flex justify-center font-outfit text-xs tracking-widest uppercase">
          <Link to="/login" className="text-brand-off-white/60 hover:text-brand-white transition-colors underline underline-offset-4">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
