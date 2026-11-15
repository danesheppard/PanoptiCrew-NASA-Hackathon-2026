import { useEffect, useState } from "react";

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  sanitize: (stored: T) => T = (stored) => stored,
) {
  const [value, setValue] = useState((): T => {
    try {
      const stored = localStorage.getItem(key);
      return stored === null ? initialValue : sanitize(JSON.parse(stored) as T);
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage may be unavailable or full.
    }
  }, [key, value]);

  return [value, setValue] as const;
}
