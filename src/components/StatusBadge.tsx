import React from 'react';
import { SoulStatus } from '../types';

interface StatusBadgeProps {
  status: SoulStatus;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const getBadgeStyle = (st: SoulStatus) => {
    switch (st) {
      case 'New':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Contacted':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Follow-up':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Joined Church':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getDotColor = (st: SoulStatus) => {
    switch (st) {
      case 'New':
        return 'bg-blue-500';
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

  return (
    <span
      id={`status-badge-${status.toLowerCase().replace(/\s+/g, '-')}`}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border whitespace-nowrap ${getBadgeStyle(
        status
      )} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${getDotColor(status)}`} />
      {status}
    </span>
  );
};
