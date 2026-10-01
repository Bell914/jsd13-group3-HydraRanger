import React from "react";

export const Card = ({
  as,
  children,
  title,
  subtitle,
  icon: Icon = null,
  action = null,
  className = "",
  onClick = null,
  hoverable = false,
  ...props
}) => {
  const Component = as || (onClick ? "button" : "div");

  return (
    <Component
      {...(Component === "button" ? { type: "button" } : {})}
      className={`relative overflow-hidden rounded-2xl border border-occasion-border/65 bg-surface p-5 text-left shadow-[var(--shadow-surface)] transition duration-200 sm:p-6 ${
        hoverable ? "hover:-translate-y-1 hover:border-primary/55 hover:shadow-xl" : ""
      } ${onClick ? "w-full cursor-pointer focus-visible:ring-3 focus-visible:ring-accent/45 focus-visible:ring-offset-2" : ""} ${className}`}
      onClick={onClick || undefined}
      {...props}
    >
      {(title || Icon || action) && (
        <div className="mb-4 flex items-start justify-between gap-4 border-b border-occasion-border/45 pb-3">
          <div className="flex min-w-0 items-center gap-3">
            {Icon && (
              <div className="flex shrink-0 items-center justify-center rounded-xl border border-accent/25 bg-accent/10 p-2.5 text-accent">
                <Icon size={20} aria-hidden="true" />
              </div>
            )}
            <div className="min-w-0">
              {title && <h3 className="text-lg font-bold leading-snug text-primary">{title}</h3>}
              {subtitle && <p className="mt-0.5 text-sm font-medium text-secondary">{subtitle}</p>}
            </div>
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </Component>
  );
};
