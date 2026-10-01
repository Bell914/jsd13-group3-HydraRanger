import React from "react";

const variants = {
  primary: "bg-primary/10 text-primary",
  accent: "bg-accent/10 text-accent",
  success: "bg-emerald-50 text-emerald-800",
  warning: "bg-amber-50 text-amber-800",
  danger: "bg-accent/10 text-accent",
  neutral: "bg-secondary/10 text-secondary",
};

const sizes = { sm: "px-2 py-0.5 text-xs", md: "px-2.5 py-1 text-xs", lg: "px-3 py-1.5 text-sm" };

export const Badge = ({ children, variant = "primary", size = "md", className = "" }) => (
  <span
    className={`inline-flex items-center rounded-full font-semibold ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
  >
    {children}
  </span>
);
