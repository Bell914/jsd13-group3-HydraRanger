import React from 'react';

export const FormInput = ({
  id,
  label,
  required = false,
  className = '',
  inputClassName = '',
  ...inputProps
}) => {
  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={id}
          className="mb-1.5 block text-xs font-semibold text-primary"
        >
          {label}{required ? ' *' : ''}
        </label>
      )}
      <input
        id={id}
        required={required}
        className={`w-full rounded-xl border border-occasion-border bg-surface px-3.5 py-2.5 text-sm text-primary placeholder:text-secondary/70 transition focus:border-primary focus:outline-none focus:ring-3 focus:ring-accent/35 disabled:cursor-not-allowed disabled:bg-disabled/45 disabled:text-secondary/70 ${inputClassName}`}
        {...inputProps}
      />
    </div>
  );
};
