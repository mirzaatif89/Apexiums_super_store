import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const StatCard = ({
  title,
  value,
  trend,
  trendValue,
  icon: Icon,
  description,
  accentColor = 'blue',
  onClick
}) => {
  const colorMap = {
    blue: { card: 'from-blue-50/90 via-white to-cyan-50/60 border-blue-100/90 hover:border-blue-200', icon: 'bg-blue-500 text-white shadow-blue-200', dot: 'bg-blue-400' },
    emerald: { card: 'from-emerald-50/90 via-white to-teal-50/60 border-emerald-100/90 hover:border-emerald-200', icon: 'bg-emerald-500 text-white shadow-emerald-200', dot: 'bg-emerald-400' },
    amber: { card: 'from-amber-50/90 via-white to-orange-50/60 border-amber-100/90 hover:border-amber-200', icon: 'bg-amber-500 text-white shadow-amber-200', dot: 'bg-amber-400' },
    purple: { card: 'from-purple-50/90 via-white to-fuchsia-50/60 border-purple-100/90 hover:border-purple-200', icon: 'bg-purple-500 text-white shadow-purple-200', dot: 'bg-purple-400' },
    rose: { card: 'from-rose-50/90 via-white to-pink-50/60 border-rose-100/90 hover:border-rose-200', icon: 'bg-rose-500 text-white shadow-rose-200', dot: 'bg-rose-400' },
    indigo: { card: 'from-indigo-50/90 via-white to-violet-50/60 border-indigo-100/90 hover:border-indigo-200', icon: 'bg-indigo-500 text-white shadow-indigo-200', dot: 'bg-indigo-400' }
  };

  const isPositive = trend === 'up';
  const colors = colorMap[accentColor] || colorMap.blue;

  return (
    <div
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 shadow-[0_4px_16px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(15,23,42,0.10)] ${colors.card} ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className={`absolute -right-8 -top-10 h-24 w-24 rounded-full opacity-10 blur-xl ${colors.dot}`} />
      <div className="relative flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500">
            <span className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />
            {title}
          </p>
          <h3 className="mt-2 text-xl font-bold tracking-tight text-slate-800 sm:text-[22px]">
            {value}
          </h3>
        </div>
        {Icon && (
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-lg transition-transform duration-300 group-hover:rotate-3 group-hover:scale-105 ${colors.icon}`}
          >
            <Icon size={21} strokeWidth={1.9} />
          </div>
        )}
      </div>

      {(trendValue || description) && (
        <div className="relative mt-3 flex items-center justify-between border-t border-white/80 pt-3 text-xs">
          {trendValue && (
            <span
              className={`inline-flex items-center gap-0.5 font-bold ${
                isPositive ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {trendValue}
            </span>
          )}
          {description && (
            <span className="text-slate-500 font-medium truncate ml-2">
              {description}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default StatCard;
