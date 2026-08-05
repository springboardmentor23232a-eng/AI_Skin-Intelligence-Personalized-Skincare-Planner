import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function StatCard({ title, value, icon: Icon, trend, color = 'brand' }) {
  const colorMaps = {
    brand: {
      bg: 'bg-brand-50',
      text: 'text-brand-600',
      border: 'border-brand-100',
      iconBg: 'bg-brand-100/80 text-brand-700'
    },
    accent: {
      bg: 'bg-accent-50',
      text: 'text-accent-600',
      border: 'border-accent-100',
      iconBg: 'bg-accent-100/80 text-accent-700'
    },
    red: {
      bg: 'bg-red-50',
      text: 'text-red-600',
      border: 'border-red-100',
      iconBg: 'bg-red-100/80 text-red-700'
    },
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      border: 'border-blue-100',
      iconBg: 'bg-blue-100/80 text-blue-700'
    }
  };

  const scheme = colorMaps[color] || colorMaps.brand;

  return (
    <div className={`glass-effect border ${scheme.border} p-6 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.01] flex items-center justify-between`}>
      <div className="space-y-2">
        <span className="text-xs font-display font-semibold uppercase tracking-wider text-brand-800">
          {title}
        </span>
        <div className="flex items-baseline gap-2">
          <span className="font-display text-2xl font-bold text-slate-900 tracking-tight">
            {value}
          </span>
          {trend && (
            <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
              trend.type === 'up' 
                ? 'bg-emerald-100 text-emerald-800' 
                : 'bg-rose-100 text-rose-800'
            }`}>
              {trend.type === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {trend.value}%
            </span>
          )}
        </div>
      </div>

      <div className={`p-3.5 rounded-xl ${scheme.iconBg}`}>
        <Icon className="w-5 h-5 shrink-0" />
      </div>
    </div>
  );
}
