import React from 'react';

const FormInput = ({ label, type = 'text', name, value, onChange, error, placeholder }) => {
  return (
    <div className="flex flex-col gap-1 mb-4 text-left">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border rounded-md outline-none transition-colors ${
          error ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500'
        }`}
      />
      {/* Inline Error Message */}
      {error && <span className="text-xs text-red-500 mt-0.5">{error}</span>}
    </div>
  );
};

export default FormInput;
