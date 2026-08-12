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
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100'
  };

  const isPositive = trend === 'up';

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:border-slate-300' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {title}
          </p>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight mt-1.5">
            {value}
          </h3>
        </div>
        {Icon && (
          <div
            className={`p-3 rounded-xl border ${colorMap[accentColor] || colorMap.blue}`}
          >
            <Icon size={22} strokeWidth={2.2} />
          </div>
        )}
      </div>

      {(trendValue || description) && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
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
