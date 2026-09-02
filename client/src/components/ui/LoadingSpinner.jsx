import React from "react";

const sizes = { sm: "h-5 w-5 border-2", md: "h-9 w-9 border-3", lg: "h-12 w-12 border-4" };

export const LoadingSpinner = ({ size = "md", message = "Loading...", className = "", label }) => (
  <div
    className={`flex flex-col items-center justify-center gap-4 px-4 py-12 ${className}`}
    role="status"
    aria-live="polite"
    aria-label={label || message || "Loading"}
  >
    <div
      className={`${sizes[size] || sizes.md} animate-spin rounded-full border-secondary/25 border-t-accent`}
      aria-hidden="true"
    />
    {message && <span className="text-sm font-medium text-secondary">{message}</span>}
  </div>
);
