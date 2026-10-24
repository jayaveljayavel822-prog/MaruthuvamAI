import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

export function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#fff0f3] via-[#fdeaf4] to-[#f6e6ff] text-pink-600 gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-pink-600" />
        <span className="text-sm font-semibold text-slate-700">Loading Maruthuvam.AI...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#fff0f3] via-[#fdeaf4] to-[#f6e6ff] text-pink-600 gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-pink-600" />
        <span className="text-sm font-semibold text-slate-700">Loading Maruthuvam.AI...</span>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
