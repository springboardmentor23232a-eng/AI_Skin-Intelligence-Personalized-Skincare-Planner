import React from 'react';
import { cn } from '@/lib/utils';

export function Badge({ children, variant = 'emerald', className, ...props }) {
  const variants = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    teal: 'bg-teal-500/10 text-teal-400 border-teal-500/30',
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    violet: 'bg-violet-500/10 text-violet-400 border-violet-500/30',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    slate: 'bg-slate-800 text-slate-300 border-slate-700',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border backdrop-blur-md',
        variants[variant] || variants.emerald,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
