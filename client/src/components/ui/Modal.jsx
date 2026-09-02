import React, { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";

const sizes = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl" };
const focusableSelector =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export const Modal = ({
  open,
  onClose,
  title,
  children,
  footer,
  size = "md",
  closeLabel = "Close dialog",
  closeOnBackdrop = true,
}) => {
  const dialogRef = useRef(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return undefined;

    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const dialog = dialogRef.current;
    const focusable = dialog?.querySelectorAll(focusableSelector) || [];
    (focusable[0] || dialog)?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose?.();
        return;
      }

      if (event.key !== "Tab" || !dialog) return;
      const items = [...dialog.querySelectorAll(focusableSelector)];
      if (!items.length) {
        event.preventDefault();
        dialog.focus();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-primary/45 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (closeOnBackdrop && event.target === event.currentTarget) onClose?.();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`max-h-[min(90vh,48rem)] w-full overflow-y-auto rounded-2xl border border-occasion-border bg-surface shadow-2xl ${sizes[size] || sizes.md}`}
      >
        <div className="sticky top-0 flex items-center justify-between gap-4 border-b border-occasion-border/60 bg-surface px-5 py-4">
          <h2 id={titleId} className="text-xl font-bold text-primary">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="rounded-xl p-2 text-secondary transition hover:bg-background hover:text-primary focus-visible:ring-3 focus-visible:ring-accent/45"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <div className="px-5 py-5 text-secondary">{children}</div>
        {footer && (
          <div className="flex flex-wrap justify-end gap-3 border-t border-occasion-border/60 px-5 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
