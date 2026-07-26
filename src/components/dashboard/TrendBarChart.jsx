import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';

export function TrendBarChart({ title, badge, data = [], height = 180 }) {
  const maxValue = Math.max(...data.map((d) => d.value || 0), 100);

  return (
    <GlassCard className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="text-base font-bold text-white">{title}</h3>
        {badge && <Badge variant="emerald">{badge}</Badge>}
      </div>

      <div style={{ height }} className="flex items-end gap-3 sm:gap-4 pt-6 pb-2 px-2 border-b border-slate-800/80">
        {data.map((item, idx) => {
          const heightPercent = Math.round((item.value / maxValue) * 100);
          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative">
              {/* Tooltip on hover */}
              <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 border border-slate-700 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg pointer-events-none z-10">
                {item.value}
              </div>

              <div
                className="w-full bg-gradient-to-t from-emerald-600/40 via-teal-500/70 to-emerald-400 rounded-t-xl transition-all duration-500 group-hover:brightness-125"
                style={{ height: `${heightPercent}%` }}
              ></div>
              <span className="text-[11px] text-slate-400 font-medium truncate max-w-full">{item.label}</span>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
