import React from 'react';

const Input = React.forwardRef(({
  label,
  error,
  type = 'text',
  className = '',
  rightElement,
  ...props
}, ref) => {
  return (
    <div className="w-full space-y-1.5 text-left font-sans">
      {label && (
        <label className="block text-xs font-display font-semibold uppercase tracking-wider text-brand-850">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={type}
          ref={ref}
          className={`w-full px-4 py-2.5 rounded-xl border text-sm text-brand-950 bg-white placeholder-brand-350 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all duration-200 hover:border-brand-350 ${
            error ? 'border-rose-300 focus:ring-rose-500/10 focus:border-rose-500 bg-rose-50/10' : 'border-brand-200'
          } ${className}`}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-500 hover:text-brand-800 cursor-pointer flex items-center justify-center">
            {rightElement}
          </div>
        )}
      </div>
      {error && (
        <p className="text-[10px] font-medium text-rose-600 animate-fade-in">
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
