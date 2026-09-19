import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const normalized = status.toLowerCase();

  let colorClasses = 'bg-gray-100 text-gray-800 border-gray-200';

  if (['active', 'completed', 'authorized', 'connected', 'settled', 'approved', 'healthy', 'on_track'].includes(normalized)) {
    colorClasses = 'bg-emerald-50 text-emerald-800 border-emerald-200';
  } else if (['in review', 'submitted', 'pending', 'pending renewal', 'in_progress', 'scheduled', 'syncing', 'medium'].includes(normalized)) {
    colorClasses = 'bg-amber-50 text-amber-900 border-amber-200';
  } else if (['repairing', 'assessment', 'claim number received', 'quote'].includes(normalized)) {
    colorClasses = 'bg-blue-50 text-blue-900 border-blue-200';
  } else if (['error', 'rejected', 'lapsed', 'cancelled', 'urgent', 'high', 'overdue', 'lagging', 'degraded', 'offline'].includes(normalized)) {
    colorClasses = 'bg-red-50 text-red-800 border-red-200';
  } else if (['low', 'conservative'].includes(normalized)) {
    colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border whitespace-nowrap ${sizeClasses} ${colorClasses}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70" />
      {status}
    </span>
  );
};
