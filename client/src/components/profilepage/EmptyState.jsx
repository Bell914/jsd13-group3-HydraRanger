import React from 'react';

export const EmptyState = ({ title, description, actionText, onAction }) => (
  <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed border-occasion-border/60 rounded-xl text-center">
    <p className="text-primary font-semibold text-base">{title}</p>
    {description && <p className="text-secondary text-xs mt-1 max-w-sm">{description}</p>}
    {actionText && (
      <button
        onClick={onAction}
        className="mt-4 px-4 py-2 bg-accent text-white text-xs font-medium rounded-lg hover:bg-accent-hover transition-colors"
      >
        {actionText}
      </button>
    )}
  </div>
);