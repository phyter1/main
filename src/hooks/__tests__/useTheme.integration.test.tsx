import { describe, expect, it } from "bun:test";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { useTheme } from "@/hooks/useTheme";
import { ThemeProvider } from "@/providers/ThemeProvider";

describe("useTheme Integration Tests - T002", () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <ThemeProvider>{children}</ThemeProvider>
  );

  it("should allow changing theme through setTheme function", async () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current.theme).toBe("system");

    act(() => {
      result.current.setTheme("dark");
    });

    await waitFor(() => {
      expect(result.current.theme).toBe("dark");
    });
  });

  it("should update resolvedTheme when theme changes", async () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    // Initial state
    const initialResolved = result.current.resolvedTheme;
    expect(["light", "dark"]).toContain(initialResolved);

    // Change to explicit dark
    act(() => {
      result.current.setTheme("dark");
    });

    await waitFor(() => {
      expect(result.current.resolvedTheme).toBe("dark");
    });

    // Change to explicit light
    act(() => {
      result.current.setTheme("light");
    });

    await waitFor(() => {
      expect(result.current.resolvedTheme).toBe("light");
    });
  });

  it("should handle multiple theme changes correctly", async () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    // Change theme multiple times
    act(() => {
      result.current.setTheme("dark");
    });

    await waitFor(() => {
      expect(result.current.theme).toBe("dark");
    });

    act(() => {
      result.current.setTheme("light");
    });

    await waitFor(() => {
      expect(result.current.theme).toBe("light");
    });

    act(() => {
      result.current.setTheme("system");
    });

    await waitFor(() => {
      expect(result.current.theme).toBe("system");
    });
  });

  it("should maintain theme state across re-renders", async () => {
    const { result, rerender } = renderHook(() => useTheme(), { wrapper });

    act(() => {
      result.current.setTheme("dark");
    });

    await waitFor(() => {
      expect(result.current.theme).toBe("dark");
    });

    // Force re-render
    rerender();

    // Theme should still be dark after re-render
    expect(result.current.theme).toBe("dark");
  });

  it("should export correct TypeScript types", () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    // Verify the structure matches the expected types
    const contextValue = result.current;

    // Test theme is one of the valid Theme values
    const theme: "light" | "dark" | "system" = contextValue.theme;
    expect(["light", "dark", "system"]).toContain(theme);

    // Test resolvedTheme is one of the valid ResolvedTheme values
    const resolvedTheme: "light" | "dark" = contextValue.resolvedTheme;
    expect(["light", "dark"]).toContain(resolvedTheme);

    // Test setTheme is callable with Theme values
    const setTheme: (theme: "light" | "dark" | "system") => void =
      contextValue.setTheme;
    expect(typeof setTheme).toBe("function");
  });
});
