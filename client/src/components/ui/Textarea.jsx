import React from "react";
import { FieldMessage } from "./FieldMessage.jsx";
import { controlBase, controlState, getDescribedBy } from "./styles.js";

export const Textarea = ({
  id,
  label,
  required = false,
  error = "",
  helpText = "",
  rows = 4,
  className = "",
  textareaClassName = "",
  ...props
}) => {
  const messageId = error ? `${id}-error` : helpText ? `${id}-help` : undefined;

  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-xs font-semibold text-primary">
          {label}
          {required ? " *" : ""}
        </label>
      )}
      <textarea
        {...props}
        id={id}
        rows={rows}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={getDescribedBy(props["aria-describedby"], messageId)}
        className={`${controlBase} resize-y ${controlState({ error: Boolean(error) })} ${textareaClassName}`}
      />
      <FieldMessage id={messageId} error={error} helpText={helpText} />
    </div>
  );
};
