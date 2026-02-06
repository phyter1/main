"use client";

import { useContext } from "react";
import { ThemeContext } from "@/providers/ThemeProvider";

// Re-export types for external use
export type {
  ResolvedTheme,
  Theme,
  ThemeContextValue,
} from "@/providers/ThemeProvider";

/**
 * useTheme - Custom hook for consuming theme context
 *
 * This hook provides access to the theme state and controls from ThemeProvider.
 * Must be used within a ThemeProvider component, otherwise throws an error.
 *
 * @returns ThemeContextValue containing theme, setTheme, and resolvedTheme
 * @throws Error if used outside ThemeProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { theme, setTheme, resolvedTheme } = useTheme();
 *
 *   return (
 *     <button onClick={() => setTheme("dark")}>
 *       Current: {theme} (resolved: {resolvedTheme})
 *     </button>
 *   );
 * }
 * ```
 */
export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
}
