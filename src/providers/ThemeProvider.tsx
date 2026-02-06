"use client";

import { createContext, type ReactNode, useEffect, useState } from "react";

export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: ResolvedTheme;
}

export const ThemeContext = createContext<ThemeContextValue | undefined>(
  undefined,
);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [systemPreference, setSystemPreference] =
    useState<ResolvedTheme>("light");

  // Load theme from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedTheme = localStorage.getItem("theme");
    if (
      storedTheme === "light" ||
      storedTheme === "dark" ||
      storedTheme === "system"
    ) {
      setThemeState(storedTheme);
    }
  }, []);

  // Watch system preference changes
  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    // Set initial value
    setSystemPreference(mediaQuery.matches ? "dark" : "light");

    // Listen for changes
    const listener = (e: MediaQueryListEvent) => {
      setSystemPreference(e.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", listener);

    return () => {
      mediaQuery.removeEventListener("change", listener);
    };
  }, []);

  // Calculate resolved theme
  const resolvedTheme: ResolvedTheme =
    theme === "system" ? systemPreference : theme;

  // Apply dark class to document.documentElement
  useEffect(() => {
    if (typeof window === "undefined") return;

    const root = document.documentElement;

    if (resolvedTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [resolvedTheme]);

  // Persist theme changes to localStorage
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);

    if (typeof window !== "undefined") {
      localStorage.setItem("theme", newTheme);
    }
  };

  const value: ThemeContextValue = {
    theme,
    setTheme,
    resolvedTheme,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
