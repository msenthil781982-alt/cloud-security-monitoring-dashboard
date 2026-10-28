import React from 'react';
import { getSeverityBadgeColor, getStatusBadgeColor } from '../../utils/formatters';

export const Badge = ({ children, variant = 'default', className = '' }) => {
  let styleClass = 'bg-slate-800 text-slate-300 border-slate-700';

  if (variant === 'severity') {
    styleClass = getSeverityBadgeColor(children);
  } else if (variant === 'status') {
    styleClass = getStatusBadgeColor(children);
  } else if (variant === 'cyan') {
    styleClass = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
  } else if (variant === 'emerald') {
    styleClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  } else if (variant === 'amber') {
    styleClass = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
  } else if (variant === 'red') {
    styleClass = 'bg-red-500/10 text-red-400 border-red-500/30';
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styleClass} ${className}`}
    >
      {children}
    </span>
  );
};
