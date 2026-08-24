import React from 'react';

export const Card = ({
  children,
  title,
  subtitle,
  icon: Icon = null,
  action = null,
  className = '',
  onClick = null,
  hoverable = false
}) => {
  return (
    <div
      className={`bg-slate-900/70 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden transition-all duration-200 ${
        hoverable ? 'hover:border-slate-700 hover:-translate-y-1 hover:shadow-2xl' : ''
      } ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {(title || Icon || action) && (
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/60">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                <Icon size={20} />
              </div>
            )}
            <div>
              {title && (
                <h3 className="text-lg font-bold text-slate-100 tracking-tight leading-snug">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
