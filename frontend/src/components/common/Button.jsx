import React from 'react';

export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  loading = false,
  disabled = false,
  className = '',
  ...props
}) {
  const baseStyle = 'w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none';
  
  const variants = {
    primary: 'btn-primary text-white shadow-sm hover:scale-[1.01] active:scale-[0.99] disabled:opacity-55 disabled:cursor-not-allowed disabled:scale-100',
    secondary: 'border border-brand-200 hover:bg-brand-50/50 text-brand-850 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-55 disabled:cursor-not-allowed disabled:scale-100 bg-white',
    text: 'text-brand-650 hover:text-brand-850 hover:underline px-0 py-0 w-auto bg-transparent shadow-none border-none cursor-pointer',
  };

  const currentStyle = variants[variant] || variants.primary;

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${baseStyle} ${currentStyle} ${className}`}
      {...props}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        children
      )}
    </button>
  );
}
