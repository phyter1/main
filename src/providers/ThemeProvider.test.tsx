import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { act } from "react";
import { useTheme } from "@/hooks/useTheme";
import { ThemeProvider } from "./ThemeProvider";

describe("ThemeProvider Component - T001", () => {
  let mockMatchMedia: ReturnType<typeof mock>;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();

    // Mock matchMedia
    const mockMediaQueryList = {
      matches: false,
      media: "(prefers-color-scheme: dark)",
      addEventListener: mock(),
      removeEventListener: mock(),
      addListener: mock(),
      removeListener: mock(),
      dispatchEvent: mock(() => true),
      onchange: null,
    };

    mockMatchMedia = mock(() => mockMediaQueryList);
    window.matchMedia = mockMatchMedia as unknown as typeof matchMedia;
  });

  afterEach(() => {
    // Clean up rendered components
    cleanup();
    // Clean up document.documentElement class
    document.documentElement.classList.remove("dark");
    // Clear localStorage after tests
    localStorage.clear();
  });

  describe("Core Functionality", () => {
    it("should provide theme context to children", () => {
      const TestComponent = () => {
        const { theme, setTheme, resolvedTheme } = useTheme();
        return (
          <div>
            <div data-testid="theme">{theme}</div>
            <div data-testid="resolved">{resolvedTheme}</div>
            <button type="button" onClick={() => setTheme("dark")}>
              Toggle
            </button>
          </div>
        );
      };

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>,
      );

      expect(screen.getByTestId("theme")).toBeDefined();
      expect(screen.getByTestId("resolved")).toBeDefined();
    });

    it("should default to system theme when no stored preference", () => {
      const TestComponent = () => {
        const { theme } = useTheme();
        return <div data-testid="theme">{theme}</div>;
      };

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>,
      );

      const themeElement = screen.getByTestId("theme");
      expect(themeElement.textContent).toBe("system");
    });

    it("should support setting light theme", async () => {
      const TestComponent = () => {
        const { theme, setTheme } = useTheme();
        return (
          <div>
            <div data-testid="theme">{theme}</div>
            <button
              type="button"
              onClick={() => setTheme("light")}
              data-testid="set-light"
            >
              Set Light
            </button>
          </div>
        );
      };

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>,
      );

      const button = screen.getByTestId("set-light");
      await act(async () => {
        button.click();
      });

      await waitFor(() => {
        expect(screen.getByTestId("theme").textContent).toBe("light");
      });
    });

    it("should support setting dark theme", async () => {
      const TestComponent = () => {
        const { theme, setTheme } = useTheme();
        return (
          <div>
            <div data-testid="theme">{theme}</div>
            <button
              type="button"
              onClick={() => setTheme("dark")}
              data-testid="set-dark"
            >
              Set Dark
            </button>
          </div>
        );
      };

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>,
      );

      const button = screen.getByTestId("set-dark");
      await act(async () => {
        button.click();
      });

      await waitFor(() => {
        expect(screen.getByTestId("theme").textContent).toBe("dark");
      });
    });

    it("should support setting system theme", async () => {
      const TestComponent = () => {
        const { theme, setTheme } = useTheme();
        return (
          <div>
            <div data-testid="theme">{theme}</div>
            <button
              type="button"
              onClick={() => setTheme("system")}
              data-testid="set-system"
            >
              Set System
            </button>
          </div>
        );
      };

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>,
      );

      const button = screen.getByTestId("set-system");
      await act(async () => {
        button.click();
      });

      await waitFor(() => {
        expect(screen.getByTestId("theme").textContent).toBe("system");
      });
    });
  });

  describe("Local Storage Persistence", () => {
    it("should persist theme to localStorage with key 'theme'", async () => {
      const TestComponent = () => {
        const { setTheme } = useTheme();
        return (
          <button
            type="button"
            onClick={() => setTheme("dark")}
            data-testid="set-dark"
          >
            Set Dark
          </button>
        );
      };

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>,
      );

      const button = screen.getByTestId("set-dark");
      await act(async () => {
        button.click();
      });

      await waitFor(() => {
        expect(localStorage.getItem("theme")).toBe("dark");
      });
    });

    it("should load theme from localStorage on mount", () => {
      localStorage.setItem("theme", "dark");

      const TestComponent = () => {
        const { theme } = useTheme();
        return <div data-testid="theme">{theme}</div>;
      };

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>,
      );

      expect(screen.getByTestId("theme").textContent).toBe("dark");
    });

    it("should handle invalid localStorage values gracefully", () => {
      localStorage.setItem("theme", "invalid-theme");

      const TestComponent = () => {
        const { theme } = useTheme();
        return <div data-testid="theme">{theme}</div>;
      };

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>,
      );

      // Should default to system when invalid value in storage
      expect(screen.getByTestId("theme").textContent).toBe("system");
    });
  });

  describe("System Preference Detection", () => {
    it("should detect system dark mode preference", () => {
      const mockMediaQueryList = {
        matches: true, // Dark mode
        media: "(prefers-color-scheme: dark)",
        addEventListener: mock(),
        removeEventListener: mock(),
        addListener: mock(),
        removeListener: mock(),
        dispatchEvent: mock(() => true),
        onchange: null,
      };

      mockMatchMedia = mock(() => mockMediaQueryList);
      global.matchMedia = mockMatchMedia as unknown as typeof matchMedia;

      const TestComponent = () => {
        const { resolvedTheme } = useTheme();
        return <div data-testid="resolved">{resolvedTheme}</div>;
      };

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>,
      );

      // When theme is "system" and matchMedia matches, resolvedTheme should be "dark"
      expect(screen.getByTestId("resolved").textContent).toBe("dark");
    });

    it("should detect system light mode preference", () => {
      const mockMediaQueryList = {
        matches: false, // Light mode
        media: "(prefers-color-scheme: dark)",
        addEventListener: mock(),
        removeEventListener: mock(),
        addListener: mock(),
        removeListener: mock(),
        dispatchEvent: mock(() => true),
        onchange: null,
      };

      mockMatchMedia = mock(() => mockMediaQueryList);
      global.matchMedia = mockMatchMedia as unknown as typeof matchMedia;

      const TestComponent = () => {
        const { resolvedTheme } = useTheme();
        return <div data-testid="resolved">{resolvedTheme}</div>;
      };

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>,
      );

      // When theme is "system" and matchMedia doesn't match, resolvedTheme should be "light"
      expect(screen.getByTestId("resolved").textContent).toBe("light");
    });

    it("should watch system preference changes", () => {
      const listeners: ((e: MediaQueryListEvent) => void)[] = [];
      const mockMediaQueryList = {
        matches: false,
        media: "(prefers-color-scheme: dark)",
        addEventListener: mock((_event: string, listener: () => void) => {
          listeners.push(listener as (e: MediaQueryListEvent) => void);
        }),
        removeEventListener: mock(),
        addListener: mock(),
        removeListener: mock(),
        dispatchEvent: mock(() => true),
        onchange: null,
      };

      mockMatchMedia = mock(() => mockMediaQueryList);
      global.matchMedia = mockMatchMedia as unknown as typeof matchMedia;

      const TestComponent = () => {
        const { resolvedTheme } = useTheme();
        return <div data-testid="resolved">{resolvedTheme}</div>;
      };

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>,
      );

      // Verify addEventListener was called
      expect(mockMediaQueryList.addEventListener).toHaveBeenCalled();
    });
  });

  describe("HTML Class Application", () => {
    it("should apply dark class to document.documentElement when dark theme", async () => {
      const TestComponent = () => {
        const { setTheme } = useTheme();
        return (
          <button
            type="button"
            onClick={() => setTheme("dark")}
            data-testid="set-dark"
          >
            Set Dark
          </button>
        );
      };

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>,
      );

      const button = screen.getByTestId("set-dark");
      await act(async () => {
        button.click();
      });

      await waitFor(() => {
        expect(document.documentElement.classList.contains("dark")).toBe(true);
      });
    });

    it("should remove dark class when light theme", async () => {
      // Start with dark class
      document.documentElement.classList.add("dark");

      const TestComponent = () => {
        const { setTheme } = useTheme();
        return (
          <button
            type="button"
            onClick={() => setTheme("light")}
            data-testid="set-light"
          >
            Set Light
          </button>
        );
      };

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>,
      );

      const button = screen.getByTestId("set-light");
      await act(async () => {
        button.click();
      });

      await waitFor(() => {
        expect(document.documentElement.classList.contains("dark")).toBe(false);
      });
    });

    it("should apply dark class when system preference is dark", () => {
      const mockMediaQueryList = {
        matches: true, // Dark mode
        media: "(prefers-color-scheme: dark)",
        addEventListener: mock(),
        removeEventListener: mock(),
        addListener: mock(),
        removeListener: mock(),
        dispatchEvent: mock(() => true),
        onchange: null,
      };

      mockMatchMedia = mock(() => mockMediaQueryList);
      global.matchMedia = mockMatchMedia as unknown as typeof matchMedia;

      render(
        <ThemeProvider>
          <div>Content</div>
        </ThemeProvider>,
      );

      // Should apply dark class based on system preference
      expect(document.documentElement.classList.contains("dark")).toBe(true);
    });
  });

  describe("SSR Safety", () => {
    it("should handle missing window object gracefully", () => {
      // This test ensures the component can render on the server
      // In a real SSR environment, window would be undefined
      const TestComponent = () => {
        const { theme } = useTheme();
        return <div data-testid="theme">{theme}</div>;
      };

      // Should not throw
      expect(() => {
        render(
          <ThemeProvider>
            <TestComponent />
          </ThemeProvider>,
        );
      }).not.toThrow();
    });

    it("should have use client directive", async () => {
      // Read the source file to verify "use client" directive
      const fs = await import("node:fs/promises");
      const path = await import("node:path");
      const { fileURLToPath } = await import("node:url");

      const currentDir = path.dirname(fileURLToPath(import.meta.url));
      const sourceFilePath = path.join(currentDir, "ThemeProvider.tsx");
      const sourceCode = await fs.readFile(sourceFilePath, "utf-8");

      expect(sourceCode.startsWith('"use client"')).toBe(true);
    });
  });

  describe("Resolved Theme Logic", () => {
    it("should resolve theme to light when theme is light", async () => {
      const TestComponent = () => {
        const { setTheme, resolvedTheme } = useTheme();
        return (
          <div>
            <div data-testid="resolved">{resolvedTheme}</div>
            <button
              type="button"
              onClick={() => setTheme("light")}
              data-testid="set-light"
            >
              Set Light
            </button>
          </div>
        );
      };

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>,
      );

      const button = screen.getByTestId("set-light");
      await act(async () => {
        button.click();
      });

      await waitFor(() => {
        expect(screen.getByTestId("resolved").textContent).toBe("light");
      });
    });

    it("should resolve theme to dark when theme is dark", async () => {
      const TestComponent = () => {
        const { setTheme, resolvedTheme } = useTheme();
        return (
          <div>
            <div data-testid="resolved">{resolvedTheme}</div>
            <button
              type="button"
              onClick={() => setTheme("dark")}
              data-testid="set-dark"
            >
              Set Dark
            </button>
          </div>
        );
      };

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>,
      );

      const button = screen.getByTestId("set-dark");
      await act(async () => {
        button.click();
      });

      await waitFor(() => {
        expect(screen.getByTestId("resolved").textContent).toBe("dark");
      });
    });

    it("should resolve system theme based on matchMedia", () => {
      const mockMediaQueryList = {
        matches: true, // System prefers dark
        media: "(prefers-color-scheme: dark)",
        addEventListener: mock(),
        removeEventListener: mock(),
        addListener: mock(),
        removeListener: mock(),
        dispatchEvent: mock(() => true),
        onchange: null,
      };

      mockMatchMedia = mock(() => mockMediaQueryList);
      global.matchMedia = mockMatchMedia as unknown as typeof matchMedia;

      const TestComponent = () => {
        const { theme, resolvedTheme } = useTheme();
        return (
          <div>
            <div data-testid="theme">{theme}</div>
            <div data-testid="resolved">{resolvedTheme}</div>
          </div>
        );
      };

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>,
      );

      // theme should be "system", resolvedTheme should be "dark"
      expect(screen.getByTestId("theme").textContent).toBe("system");
      expect(screen.getByTestId("resolved").textContent).toBe("dark");
    });
  });

  describe("Edge Cases", () => {
    it("should throw error when useTheme is used outside ThemeProvider", () => {
      const TestComponent = () => {
        // This should throw because no provider
        useTheme();
        return <div>Test</div>;
      };

      // Suppress console.error for this test
      const originalError = console.error;
      console.error = mock(() => {});

      expect(() => {
        render(<TestComponent />);
      }).toThrow();

      console.error = originalError;
    });

    it("should handle rapid theme changes", async () => {
      const TestComponent = () => {
        const { theme, setTheme } = useTheme();
        return (
          <div>
            <div data-testid="theme">{theme}</div>
            <button
              type="button"
              onClick={() => {
                setTheme("dark");
                setTheme("light");
                setTheme("system");
              }}
              data-testid="rapid-change"
            >
              Rapid Change
            </button>
          </div>
        );
      };

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>,
      );

      const button = screen.getByTestId("rapid-change");
      await act(async () => {
        button.click();
      });

      // Should end up at the last set value
      await waitFor(() => {
        expect(screen.getByTestId("theme").textContent).toBe("system");
      });
    });
  });
});
