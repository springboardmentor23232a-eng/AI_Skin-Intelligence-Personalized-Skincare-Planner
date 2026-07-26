import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { cn } from '@/lib/utils';

export function StatCard({ title, value, change, trend = 'up', icon: Icon, badgeColor = 'emerald', description }) {
  const isPositive = trend === 'up';

  return (
    <GlassCard className="space-y-3 flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-slate-400 block">{title}</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{value}</span>
            {change && (
              <span
                className={cn(
                  'text-xs font-bold px-1.5 py-0.5 rounded-md border',
                  isPositive
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                )}
              >
                {isPositive ? '↑' : '↓'} {change}
              </span>
            )}
          </div>
        </div>

        {Icon && (
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border shrink-0", 
            badgeColor === 'emerald' && 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
            badgeColor === 'cyan' && 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
            badgeColor === 'teal' && 'bg-teal-500/10 border-teal-500/30 text-teal-400',
            badgeColor === 'violet' && 'bg-violet-500/10 border-violet-500/30 text-violet-400',
            badgeColor === 'amber' && 'bg-amber-500/10 border-amber-500/30 text-amber-400',
            badgeColor === 'rose' && 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          )}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {description && <p className="text-[11px] text-slate-400">{description}</p>}
    </GlassCard>
  );
}
