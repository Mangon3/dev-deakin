"use client";

import { createContext, useCallback, useContext, useSyncExternalStore } from "react";

const STORAGE_KEY = "3lancer.theme";

export type Theme = "light" | "dark" | "system";

type ThemeValue = {
  theme: Theme;
  setTheme: (next: Theme) => void;
};

const ThemeContext = createContext<ThemeValue | null>(null);

// The stored preference lives in localStorage, an external store, so it is
// subscribed to rather than mirrored into React state inside an effect.
const listeners = new Set<() => void>();

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);

  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function read(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY);

  return stored === "light" || stored === "dark" ? stored : "system";
}

// The server cannot know the preference, so it renders the system default
function readOnServer(): Theme {
  return "system";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(subscribe, read, readOnServer);

  const setTheme = useCallback((next: Theme) => {
    if (next === "system") localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, next);

    // data-theme overrides the prefers-color-scheme media query
    if (next === "system") document.documentElement.removeAttribute("data-theme");
    else document.documentElement.setAttribute("data-theme", next);

    listeners.forEach((listener) => listener());
  }, []);

  return (
    <ThemeContext value={{ theme, setTheme }}>{children}</ThemeContext>
  );
}

export function useTheme(): ThemeValue {
  const value = useContext(ThemeContext);

  if (!value) throw new Error("useTheme must be used inside a ThemeProvider.");

  return value;
}

// Applied before paint so a dark mode user never sees a light flash
export const THEME_SCRIPT = `
try {
  var t = localStorage.getItem("${STORAGE_KEY}");
  if (t === "light" || t === "dark") document.documentElement.setAttribute("data-theme", t);
} catch (e) {}
`;
