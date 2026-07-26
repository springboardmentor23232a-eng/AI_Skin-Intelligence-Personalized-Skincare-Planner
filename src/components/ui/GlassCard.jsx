import React from 'react';
import { cn } from '@/lib/utils';

export function GlassCard({ children, className, hoverEffect = true, glow = false, ...props }) {
  return (
    <div
      className={cn(
        "relative rounded-2xl p-6 sm:p-7 transition-all duration-300 overflow-hidden",
        "bg-slate-900/50 backdrop-blur-2xl border border-slate-800/80 shadow-2xl",
        hoverEffect && "hover:border-emerald-500/40 hover:shadow-emerald-500/10 hover:-translate-y-1",
        glow && "before:absolute before:-inset-px before:rounded-2xl before:bg-gradient-to-br before:from-emerald-500/20 before:via-teal-500/10 before:to-cyan-500/20 before:-z-10",
        className
      )}
      {...props}
    >
      {/* Top subtle light accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />
      {children}
    </div>
  );
}
