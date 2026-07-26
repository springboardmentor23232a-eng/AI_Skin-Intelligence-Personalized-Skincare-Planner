import React from 'react';
import { cn } from '@/lib/utils';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  disabled = false,
  type = 'button',
  onClick,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-semibold hover:from-emerald-400 hover:to-teal-500 shadow-lg shadow-emerald-500/20 active:scale-[0.98]',
    secondary: 'bg-slate-800 text-slate-100 hover:bg-slate-700 border border-slate-700 hover:border-slate-600',
    outline: 'border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-400',
    ghost: 'text-slate-300 hover:text-white hover:bg-slate-800/60',
    danger: 'bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}
