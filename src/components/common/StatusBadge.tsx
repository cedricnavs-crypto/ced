import React from 'react';
import { TitleStatus, DefenseStatus } from '../../types';

interface StatusBadgeProps {
  status: TitleStatus | DefenseStatus | 'Active' | 'Inactive' | 'Available' | 'Occupied' | 'Unavailable' | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  let colorClasses = 'bg-slate-100 text-slate-700 border border-slate-200 font-medium';
  let dotColor = 'bg-slate-400';

  switch (status) {
    case 'Approved':
    case 'Active':
    case 'Available':
    case 'Completed':
      colorClasses = 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-medium';
      dotColor = 'bg-emerald-500';
      break;
    case 'Scheduled':
    case 'Upcoming':
      colorClasses = 'bg-blue-50 text-blue-700 border border-blue-200/80 font-medium';
      dotColor = 'bg-blue-500';
      break;
    case 'Ongoing':
      colorClasses = 'bg-indigo-50 text-indigo-700 border border-indigo-200/80 font-medium';
      dotColor = 'bg-indigo-500';
      break;
    case 'For Scheduling':
    case 'Pending':
    case 'Under Review':
    case 'Rescheduled':
      colorClasses = 'bg-amber-50 text-amber-700 border border-amber-200/80 font-medium';
      dotColor = 'bg-amber-500';
      break;
    case 'For Re-Defense':
    case 'Occupied':
      colorClasses = 'bg-orange-50 text-orange-800 border border-orange-200/80 font-medium';
      dotColor = 'bg-orange-500';
      break;
    case 'Rejected':
    case 'Cancelled':
    case 'Inactive':
    case 'Unavailable':
      colorClasses = 'bg-rose-50 text-rose-700 border border-rose-200/80 font-medium';
      dotColor = 'bg-rose-500';
      break;
    default:
      break;
  }

  return (
    <span
      className={`inline-flex items-center rounded-md font-medium tracking-tight whitespace-nowrap ${sizeClasses} ${colorClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${dotColor}`} aria-hidden="true" />
      {status}
    </span>
  );
};
