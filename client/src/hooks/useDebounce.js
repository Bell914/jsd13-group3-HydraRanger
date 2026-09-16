import { useState, useEffect } from "react";

/**
 * Custom hook to debounce a value
 * @param {*} value - The input value to debounce
 * @param {number} delay - Delay in milliseconds (default: 400ms)
 * @returns {*} debouncedValue
 */
export function useDebounce(value, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
