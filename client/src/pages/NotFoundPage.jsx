import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Home } from 'lucide-react';
import { Button } from '../components/common/Button';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4 shadow-glow-cyan">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-white tracking-tight">404</h1>
      <h2 className="text-lg font-semibold text-slate-200 mt-1">Resource Endpoint Not Found</h2>
      <p className="text-xs text-slate-400 max-w-sm mt-2 mb-6">
        The security console route you requested does not exist or has been decommissioned by security policy.
      </p>
      <Button variant="primary" onClick={() => navigate('/')}>
        <Home className="w-4 h-4 mr-2" />
        <span>Return to Dashboard</span>
      </Button>
    </div>
  );
};
