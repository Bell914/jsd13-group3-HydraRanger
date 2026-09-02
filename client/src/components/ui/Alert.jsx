import React from "react";
import { AlertCircle, CheckCircle2, Info, TriangleAlert, X } from "lucide-react";

const variants = {
  info: { classes: "border-primary/30 bg-primary/8 text-primary", Icon: Info },
  success: { classes: "border-emerald-300 bg-emerald-50 text-emerald-900", Icon: CheckCircle2 },
  warning: { classes: "border-amber-300 bg-amber-50 text-amber-900", Icon: TriangleAlert },
  error: { classes: "border-accent/35 bg-accent/8 text-accent-hover", Icon: AlertCircle },
};

export const Alert = ({
  title,
  children,
  variant = "info",
  onDismiss,
  dismissLabel = "Dismiss message",
  className = "",
}) => {
  const config = variants[variant] || variants.info;
  const { Icon } = config;

  return (
    <div
      className={`flex items-start gap-3 rounded-xl border p-4 ${config.classes} ${className}`}
      role={variant === "error" ? "alert" : "status"}
    >
      <Icon size={20} className="mt-0.5 shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        {title && <p className="font-bold">{title}</p>}
        <div className={`text-sm ${title ? "mt-1" : ""}`}>{children}</div>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 rounded-lg p-1 hover:bg-black/5 focus-visible:ring-3 focus-visible:ring-current"
          aria-label={dismissLabel}
        >
          <X size={18} aria-hidden="true" />
        </button>
      )}
    </div>
  );
};
