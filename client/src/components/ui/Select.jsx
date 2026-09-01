import React from "react";
import { FieldMessage } from "./FieldMessage.jsx";
import { controlBase, controlState, getDescribedBy } from "./styles.js";

export const Select = ({
  id,
  label,
  required = false,
  error = "",
  helpText = "",
  options = [],
  placeholder,
  className = "",
  selectClassName = "",
  children,
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
      <select
        {...props}
        id={id}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={getDescribedBy(props["aria-describedby"], messageId)}
        className={`${controlBase} ${controlState({ error: Boolean(error) })} ${selectClassName}`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {children || options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
      <FieldMessage id={messageId} error={error} helpText={helpText} />
    </div>
  );
};
