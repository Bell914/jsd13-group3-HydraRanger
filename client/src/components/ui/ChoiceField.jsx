import React from "react";
import { FieldMessage } from "./FieldMessage.jsx";
import { getDescribedBy } from "./styles.js";

export const ChoiceField = ({
  type,
  id,
  label,
  description = "",
  error = "",
  className = "",
  inputClassName = "",
  ...props
}) => {
  const messageId = error ? `${id}-error` : description ? `${id}-help` : undefined;

  return (
    <div className={className}>
      <label
        htmlFor={id}
        className={`flex items-start gap-3 rounded-xl border bg-surface p-3 transition ${
          error ? "border-accent" : "border-occasion-border hover:border-primary/65"
        } ${props.disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
      >
        <input
          {...props}
          id={id}
          type={type}
          aria-invalid={Boolean(error)}
          aria-describedby={getDescribedBy(props["aria-describedby"], messageId)}
          className={`mt-0.5 h-4 w-4 shrink-0 border-occasion-border text-accent accent-accent focus:ring-accent ${inputClassName}`}
        />
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-primary">{label}</span>
          {description && !error && (
            <span id={messageId} className="mt-0.5 block text-xs text-secondary">
              {description}
            </span>
          )}
        </span>
      </label>
      {error && <FieldMessage id={messageId} error={error} />}
    </div>
  );
};

export const Checkbox = (props) => <ChoiceField type="checkbox" {...props} />;
export const Radio = (props) => <ChoiceField type="radio" {...props} />;
