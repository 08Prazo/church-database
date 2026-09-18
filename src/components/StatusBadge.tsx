import React from 'react';
import { SoulStatus } from '../types';

interface StatusBadgeProps {
  status: SoulStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getStyles = () => {
    switch (status) {
      case 'New':
        return 'bg-sky-50 text-sky-700 border-sky-200/80';
      case 'Contacted':
        return 'bg-amber-50 text-amber-700 border-amber-200/80';
      case 'Follow-up':
        return 'bg-purple-50 text-purple-700 border-purple-200/80';
      case 'Joined Church':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getDotStyles = () => {
    switch (status) {
      case 'New':
        return 'bg-sky-500';
      case 'Contacted':
        return 'bg-amber-500';
      case 'Follow-up':
        return 'bg-purple-500';
      case 'Joined Church':
        return 'bg-emerald-500';
      default:
        return 'bg-slate-400';
    }
  };

  const sizeStyles = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${sizeStyles} ${getStyles()} whitespace-nowrap`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${getDotStyles()}`} />
      <span>{status}</span>
    </span>
  );
};
