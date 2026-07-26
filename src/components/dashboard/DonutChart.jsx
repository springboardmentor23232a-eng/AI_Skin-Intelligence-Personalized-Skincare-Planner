import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';

export function DonutChart({ title, badge, data = [] }) {
  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  const colors = ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#f43f5e', '#14b8a6'];

  let cumulativePercent = 0;

  return (
    <GlassCard className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="text-base font-bold text-white">{title}</h3>
        {badge && <Badge variant="cyan">{badge}</Badge>}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-2">
        {/* SVG Donut */}
        <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
            {data.map((item, idx) => {
              const percent = item.value / total;
              const strokeDasharray = `${percent * 314.15} ${314.15}`;
              const strokeDashoffset = -cumulativePercent * 314.15;
              cumulativePercent += percent;

              return (
                <circle
                  key={idx}
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke={item.color || colors[idx % colors.length]}
                  strokeWidth="14"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-700 hover:opacity-80"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-xl font-extrabold text-white">{total}</span>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Total</span>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-2 text-xs w-full">
          {data.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color || colors[idx % colors.length] }}
                ></span>
                <span className="text-slate-300 font-medium">{item.label}</span>
              </div>
              <span className="font-bold text-white">
                {item.value} ({Math.round((item.value / total) * 100)}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}
