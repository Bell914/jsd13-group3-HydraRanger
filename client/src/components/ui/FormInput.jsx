import React from "react";
import { FieldMessage } from "./FieldMessage.jsx";
import { controlBase, controlState, getDescribedBy } from "./styles.js";

export const FormInput = ({
  id,
  label,
  required = false,
  error = "",
  helpText = "",
  className = "",
  inputClassName = "",
  ...inputProps
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
      <input
        {...inputProps}
        id={id}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={getDescribedBy(inputProps["aria-describedby"], messageId)}
        className={`${controlBase} ${controlState({ error: Boolean(error) })} ${inputClassName}`}
      />
      <FieldMessage id={messageId} error={error} helpText={helpText} />
    </div>
  );
};
