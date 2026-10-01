import React from "react";

export const FieldMessage = ({ id, error, helpText }) => {
  if (!error && !helpText) return null;

  return (
    <p
      id={id}
      className={`mt-1.5 text-xs ${error ? "font-semibold text-accent" : "text-secondary"}`}
    >
      {error || helpText}
    </p>
  );
};
