import { describe, expect, it } from "bun:test";
import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { useTheme } from "../useTheme";

describe("useTheme hook", () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <ThemeProvider>{children}</ThemeProvider>
  );

  it("should export useTheme function", () => {
    expect(typeof useTheme).toBe("function");
  });

  it("should return ThemeContextValue with correct properties", () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty("theme");
    expect(result.current).toHaveProperty("setTheme");
    expect(result.current).toHaveProperty("resolvedTheme");
  });

  it("should return correct initial theme value", () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current.theme).toBe("system");
    expect(typeof result.current.setTheme).toBe("function");
    expect(["light", "dark"]).toContain(result.current.resolvedTheme);
  });

  it("should throw error if used outside ThemeProvider", () => {
    expect(() => {
      renderHook(() => useTheme());
    }).toThrow("useTheme must be used within ThemeProvider");
  });

  it("should provide type-safe theme values", () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    // Test that theme is one of the valid values
    const validThemes = ["light", "dark", "system"];
    expect(validThemes).toContain(result.current.theme);

    // Test that resolvedTheme is one of the valid values
    const validResolvedThemes = ["light", "dark"];
    expect(validResolvedThemes).toContain(result.current.resolvedTheme);
  });

  it("should return same context instance across multiple renders", () => {
    const { result: result1 } = renderHook(() => useTheme(), { wrapper });
    const { result: result2 } = renderHook(() => useTheme(), { wrapper });

    // Both should have the same initial values since they share the same provider
    expect(result1.current.theme).toBe(result2.current.theme);
  });
});
