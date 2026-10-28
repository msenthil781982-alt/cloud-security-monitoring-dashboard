import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert } from 'lucide-react';
import { Button } from '../common/Button';

export const RoleRoute = ({ requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (user?.role !== requiredRole) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border border-red-500/20 rounded-2xl bg-red-950/10 my-8">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-100">Access Restricted</h3>
        <p className="text-sm text-slate-400 max-w-md mt-1 mb-6">
          This module requires <strong>{requiredRole}</strong> role privileges. Your current role is <strong>{user?.role || 'Guest'}</strong>.
        </p>
        <Button variant="secondary" onClick={() => window.history.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  return <Outlet />;
};
