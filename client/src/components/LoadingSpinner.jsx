import React from 'react';

export const LoadingSpinner = ({ size = 'md', message = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-9 h-9 border-3',
    lg: 'w-12 h-12 border-4'
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 gap-4">
      <div
        className={`${sizeClasses[size] || sizeClasses.md} rounded-full border-slate-700/60 border-t-emerald-500 animate-spin`}
      />
      {message && (
        <span className="text-sm font-medium text-slate-400 animate-pulse">
          {message}
        </span>
      )}
    </div>
  );
};
