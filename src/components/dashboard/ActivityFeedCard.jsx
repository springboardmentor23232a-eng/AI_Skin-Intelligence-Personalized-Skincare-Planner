import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { Clock } from 'lucide-react';

export function ActivityFeedCard({ title = "Recent Platform Activity", activities = [] }) {
  return (
    <GlassCard className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-400" /> {title}
        </h3>
        <Badge variant="emerald">Live Stream</Badge>
      </div>

      <div className="space-y-3 text-xs">
        {activities.map((item, idx) => (
          <div key={idx} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start justify-between gap-3">
            <div className="space-y-0.5">
              <span className="font-semibold text-white block">{item.title}</span>
              <span className="text-slate-400 block">{item.description}</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono shrink-0">{item.time}</span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
