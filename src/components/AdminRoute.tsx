import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="min-h-screen bg-black flex items-center justify-center font-outfit text-sm uppercase tracking-widest text-brand-off-white/60">Loading Admin...</div>;
  }

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    // Optionally redirect to a 403 page or back to home
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
