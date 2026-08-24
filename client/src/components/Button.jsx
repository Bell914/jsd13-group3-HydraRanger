import React from 'react';

export const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  className = '',
  icon: Icon = null,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-4 py-2.5',
    lg: 'text-base px-6 py-3.5'
  };

  const variantClasses = {
    primary: 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/35 hover:opacity-95 active:scale-[0.98]',
    secondary: 'bg-slate-800/80 hover:bg-slate-700 text-slate-100 border border-slate-700/80 active:scale-[0.98]',
    outline: 'bg-transparent text-emerald-400 border border-emerald-500/50 hover:bg-emerald-500/10 active:scale-[0.98]',
    danger: 'bg-rose-500/15 text-rose-400 border border-rose-500/30 hover:bg-rose-500/25 active:scale-[0.98]',
    ghost: 'bg-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
  };

  const iconSizes = {
    sm: 14,
    md: 18,
    lg: 20
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${sizeClasses[size] || sizeClasses.md} ${variantClasses[variant] || variantClasses.primary} ${className}`}
      {...props}
    >
      {Icon && <Icon size={iconSizes[size] || 18} className="shrink-0" />}
      {children}
    </button>
  );
};
