import React from 'react';

const variantStyles = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
  delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
  verified: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
  paid: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',

  warning: 'bg-amber-50 text-amber-700 border-amber-200/80',
  pending: 'bg-amber-50 text-amber-700 border-amber-200/80',
  processing: 'bg-amber-50 text-amber-700 border-amber-200/80',
  lowstock: 'bg-amber-50 text-amber-700 border-amber-200/80',

  info: 'bg-sky-50 text-sky-700 border-sky-200/80',
  shipped: 'bg-sky-50 text-sky-700 border-sky-200/80',
  confirmed: 'bg-sky-50 text-sky-700 border-sky-200/80',
  vip: 'bg-purple-50 text-purple-700 border-purple-200/80',

  danger: 'bg-rose-50 text-rose-700 border-rose-200/80',
  suspended: 'bg-rose-50 text-rose-700 border-rose-200/80',
  outstock: 'bg-rose-50 text-rose-700 border-rose-200/80',
  cancelled: 'bg-rose-50 text-rose-700 border-rose-200/80',
  rejected: 'bg-rose-50 text-rose-700 border-rose-200/80',

  neutral: 'bg-slate-100 text-slate-700 border-slate-200/80',
  draft: 'bg-slate-100 text-slate-600 border-slate-200/80',
  inactive: 'bg-slate-100 text-slate-600 border-slate-200/80'
};

export const Badge = ({ children, status = 'neutral', className = '' }) => {
  const normStatus = (status || '').toLowerCase().replace(/\s+/g, '');
  const style = variantStyles[normStatus] || variantStyles.neutral;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {children || status}
    </span>
  );
};

export default Badge;
