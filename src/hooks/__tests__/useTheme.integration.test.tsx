import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useTheme } from "@/hooks/useTheme";
import { ThemeProvider } from "@/providers/ThemeProvider";

describe("useTheme Integration Tests - T002", () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
    document.documentElement.classList.remove("dark");
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
    document.documentElement.classList.remove("dark");
  });

  it("should integrate with ThemeProvider and provide theme context", () => {
    const TestComponent = () => {
      const { theme, setTheme, resolvedTheme } = useTheme();
      return (
        <div>
          <div data-testid="theme">{theme}</div>
          <div data-testid="resolved">{resolvedTheme}</div>
          <div data-testid="setTheme-type">{typeof setTheme}</div>
        </div>
      );
    };

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
    );

    // Verify theme context is provided
    expect(screen.getByTestId("theme")).toBeDefined();
    expect(screen.getByTestId("resolved")).toBeDefined();
    expect(screen.getByTestId("setTheme-type").textContent).toBe("function");

    // Verify theme values are valid
    const theme = screen.getByTestId("theme").textContent;
    expect(["light", "dark", "system"]).toContain(theme);

    const resolved = screen.getByTestId("resolved").textContent;
    expect(["light", "dark"]).toContain(resolved);
  });

  it("should export correct TypeScript types", () => {
    const TestComponent = () => {
      const contextValue = useTheme();

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

      return <div data-testid="types-valid">OK</div>;
    };

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
    );

    expect(screen.getByTestId("types-valid")).toBeDefined();
  });
});
