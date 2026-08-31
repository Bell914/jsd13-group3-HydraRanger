import React from 'react';

export const LoadingSpinner = ({
  size = 'md',
  message = 'Loading...',
  className = '',
  label = message || 'Loading'
}) => {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-9 h-9 border-3',
    lg: 'w-12 h-12 border-4'
  };

  return (
    <div
      className={`flex flex-col items-center justify-center py-12 px-4 gap-4 ${className}`}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div
        className={`${sizeClasses[size] || sizeClasses.md} animate-spin rounded-full border-secondary/25 border-t-accent`}
        aria-hidden="true"
      />
      {message && (
        <span className="animate-pulse text-sm font-medium text-secondary">
          {message}
        </span>
      )}
    </div>
  );
};
