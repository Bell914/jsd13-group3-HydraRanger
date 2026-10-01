import React from "react";

const sizeClasses = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3.5 text-base",
};

const variantClasses = {
  primary:
    "bg-primary text-white shadow-md shadow-primary/15 hover:bg-primary-hover hover:shadow-lg",
  secondary:
    "border border-secondary bg-secondary text-white shadow-sm hover:bg-secondary-hover",
  accent:
    "bg-accent text-white shadow-md shadow-accent/15 hover:bg-accent-hover hover:shadow-lg",
  surface:
    "border border-occasion-border bg-surface text-primary shadow-sm hover:border-primary hover:bg-background",
  outline:
    "border border-primary bg-transparent text-primary hover:bg-primary hover:text-white",
  danger: "bg-accent text-white shadow-sm hover:bg-accent-hover",
  ghost: "bg-transparent text-secondary hover:bg-primary/8 hover:text-primary",
};

const iconSizes = { sm: 14, md: 18, lg: 20 };

export const Button = ({
  as: Component = "button",
  children,
  type = "button",
  variant = "primary",
  size = "md",
  onClick,
  disabled = false,
  loading = false,
  loadingText = "Loading...",
  fullWidth = false,
  className = "",
  icon: Icon = null,
  ...props
}) => {
  const unavailable = disabled || loading;

  const handleClick = (event) => {
    if (unavailable && Component !== "button") {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };

  return (
    <Component
      {...(Component === "button" ? { type, disabled: unavailable } : {})}
      onClick={handleClick}
      aria-busy={loading || undefined}
      {...(Component !== "button" && unavailable
        ? { "aria-disabled": true, tabIndex: -1 }
        : {})}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold select-none transition duration-200 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-accent/45 focus-visible:ring-offset-2 active:translate-y-px disabled:pointer-events-none disabled:translate-y-0 disabled:cursor-not-allowed disabled:border-disabled disabled:bg-disabled disabled:text-secondary/70 disabled:shadow-none ${
        sizeClasses[size] || sizeClasses.md
      } ${variantClasses[variant] || variantClasses.primary} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      {loading ? (
        <span
          className="h-[1em] w-[1em] animate-spin rounded-full border-2 border-current border-r-transparent"
          aria-hidden="true"
        />
      ) : (
        Icon && <Icon size={iconSizes[size] || 18} className="shrink-0" aria-hidden="true" />
      )}
      {loading ? loadingText : children}
    </Component>
  );
};
