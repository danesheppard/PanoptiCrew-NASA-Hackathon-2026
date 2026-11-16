import { useEffect, useState, useSyncExternalStore } from "react";

export type Theme = "light" | "dark";

const THEME_KEY = "theme";
const themeListeners = new Set<() => void>();

// index.html sets data-theme before first paint, so the DOM attribute is the source of truth.
const getTheme = (): Theme =>
  document.documentElement.dataset.theme === "light" ? "light" : "dark";

const subscribeTheme = (listener: () => void) => {
  themeListeners.add(listener);
  return () => {
    themeListeners.delete(listener);
  };
};

/**
 * Reads the current theme and returns a function to flip it. The choice is
 * persisted; non-React consumers (deck.gl, three.js) re-read CSS variables
 * when a component using this hook re-renders.
 */
export function useTheme() {
  const theme = useSyncExternalStore(subscribeTheme, getTheme);
  const toggleTheme = () => {
    const next: Theme = theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // Storage may be unavailable; the theme still applies for this session.
    }
    themeListeners.forEach((listener) => listener());
  };
  return [theme, toggleTheme] as const;
}

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
