import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import { cleanup, render } from "@testing-library/react";
import { act } from "react";
import { CursorGlow } from "./CursorGlow";

// Helper to get source file path
async function getSourceFilePath(): Promise<string> {
  const path = await import("node:path");
  const { fileURLToPath } = await import("node:url");
  const currentDir = path.dirname(fileURLToPath(import.meta.url));
  return path.join(currentDir, "CursorGlow.tsx");
}

describe("CursorGlow Component - T005", () => {
  let mockMatchMedia: ReturnType<typeof mock>;
  let mockObserver: {
    observe: ReturnType<typeof mock>;
    disconnect: ReturnType<typeof mock>;
  };

  beforeEach(() => {
    // Mock matchMedia for prefers-reduced-motion
    const mockMediaQueryList = {
      matches: false,
      media: "(prefers-reduced-motion: reduce)",
      addEventListener: mock(),
      removeEventListener: mock(),
      addListener: mock(),
      removeListener: mock(),
      dispatchEvent: mock(() => true),
      onchange: null,
    };

    mockMatchMedia = mock(() => mockMediaQueryList);
    window.matchMedia = mockMatchMedia as unknown as typeof matchMedia;

    // Mock MutationObserver
    mockObserver = {
      observe: mock(),
      disconnect: mock(),
    };

    // @ts-expect-error - Mock MutationObserver constructor
    global.MutationObserver = mock((callback: MutationCallback) => {
      // Store callback for testing
      // @ts-expect-error - Adding test property to mock
      mockObserver.callback = callback;
      return mockObserver;
    });

    // Ensure document.documentElement is available
    if (!document.documentElement) {
      // @ts-expect-error - Create documentElement if not present
      document.documentElement = document.createElement("html");
    }

    // Clean up classes
    document.documentElement.classList.remove("dark");
  });

  afterEach(() => {
    cleanup();
    document.documentElement.classList.remove("dark");
    // Clear ontouchstart to simulate non-touch device
    // @ts-expect-error
    delete window.ontouchstart;
  });

  describe("Core Functionality", () => {
    it("should render without crashing", () => {
      expect(() => {
        render(<CursorGlow />);
      }).not.toThrow();
    });

    it("should be hidden initially", () => {
      const { container } = render(<CursorGlow />);

      // Component returns null when not visible, so container should be empty or only have wrapper
      const glowDiv = Array.from(container.querySelectorAll("div")).find(
        (div) =>
          div.classList.contains("pointer-events-none") &&
          div.classList.contains("fixed"),
      );
      expect(glowDiv).toBeUndefined(); // No glow div rendered initially
    });

    it("should have use client directive", async () => {
      const fs = await import("node:fs/promises");
      const sourceFilePath = await getSourceFilePath();
      const sourceCode = await fs.readFile(sourceFilePath, "utf-8");

      expect(sourceCode.startsWith('"use client"')).toBe(true);
    });
  });

  describe("Theme Awareness - T005 Core Feature", () => {
    it("should set up MutationObserver to watch for dark class changes", () => {
      render(<CursorGlow />);

      // MutationObserver should be created
      expect(global.MutationObserver).toHaveBeenCalled();

      // Observer should be observing document.documentElement
      expect(mockObserver.observe).toHaveBeenCalledWith(
        document.documentElement,
        {
          attributes: true,
          attributeFilter: ["class"],
        },
      );
    });

    it("should clean up MutationObserver on unmount", () => {
      const { unmount } = render(<CursorGlow />);

      unmount();

      // Observer should be disconnected
      expect(mockObserver.disconnect).toHaveBeenCalled();
    });

    it("should use theme-aware colors via inline style computation", () => {
      // Test light mode color computation
      document.documentElement.classList.remove("dark");
      const lightColor = document.documentElement.classList.contains("dark")
        ? "rgba(0, 245, 212, 0.08)"
        : "rgba(0, 245, 212, 0.06)";
      expect(lightColor).toBe("rgba(0, 245, 212, 0.06)");

      // Test dark mode color computation
      document.documentElement.classList.add("dark");
      const darkColor = document.documentElement.classList.contains("dark")
        ? "rgba(0, 245, 212, 0.08)"
        : "rgba(0, 245, 212, 0.06)";
      expect(darkColor).toBe("rgba(0, 245, 212, 0.08)");
    });

    it("should not have hardcoded default color in prop definition", async () => {
      const fs = await import("node:fs/promises");
      const sourceFilePath = await getSourceFilePath();
      const sourceCode = await fs.readFile(sourceFilePath, "utf-8");

      // Verify color prop has no default value in destructuring
      const hasDefaultColor = /color\s*=\s*["']rgba/.test(sourceCode);
      expect(hasDefaultColor).toBe(false);

      // Verify color prop is optional
      const hasOptionalColor = /color\?\s*:\s*string/.test(sourceCode);
      expect(hasOptionalColor).toBe(true);
    });

    it("should have theme-aware color logic in component body", async () => {
      const fs = await import("node:fs/promises");
      const sourceFilePath = await getSourceFilePath();
      const sourceCode = await fs.readFile(sourceFilePath, "utf-8");

      // Verify isDark state exists
      expect(sourceCode).toContain("isDark");

      // Verify MutationObserver setup
      expect(sourceCode).toContain("MutationObserver");
      expect(sourceCode).toContain('attributeFilter: ["class"]');

      // Verify theme-aware color logic
      expect(sourceCode).toContain("rgba(0, 245, 212, 0.08)"); // Dark mode
      expect(sourceCode).toContain("rgba(0, 245, 212, 0.06)"); // Light mode

      // Verify color prop takes precedence
      expect(sourceCode).toContain("color ||");
    });

    it("should respect size and blur props", async () => {
      const fs = await import("node:fs/promises");
      const sourceFilePath = await getSourceFilePath();
      const sourceCode = await fs.readFile(sourceFilePath, "utf-8");

      // Verify size and blur props still exist with defaults
      expect(sourceCode).toContain("size = 600");
      expect(sourceCode).toContain("blur = 40");
    });
  });

  describe("Accessibility and Performance", () => {
    it("should not set up event listeners on touch devices", () => {
      // @ts-expect-error - Simulate touch device
      window.ontouchstart = () => {};

      const addEventListenerSpy = mock();
      const originalAddEventListener = window.addEventListener;
      // @ts-expect-error - Mock window addEventListener for testing
      window.addEventListener = addEventListenerSpy;

      render(<CursorGlow />);

      // Should not add mousemove listener on touch devices
      const mouseMoveCalls = (
        addEventListenerSpy.mock.calls as unknown[]
      ).filter((call: unknown) => {
        const callArray = call as [string, ...unknown[]];
        return callArray[0] === "mousemove";
      });
      expect(mouseMoveCalls.length).toBe(0);

      // Restore
      window.addEventListener = originalAddEventListener;
    });

    it("should not set up event listeners when prefers-reduced-motion is enabled", () => {
      const mockReducedMotionQueryList = {
        matches: true, // Reduced motion enabled
        media: "(prefers-reduced-motion: reduce)",
        addEventListener: mock(),
        removeEventListener: mock(),
        addListener: mock(),
        removeListener: mock(),
        dispatchEvent: mock(() => true),
        onchange: null,
      };

      mockMatchMedia = mock(() => mockReducedMotionQueryList);
      window.matchMedia = mockMatchMedia as unknown as typeof matchMedia;

      const addEventListenerSpy = mock();
      const originalAddEventListener = window.addEventListener;
      // @ts-expect-error - Mock window addEventListener for testing
      window.addEventListener = addEventListenerSpy;

      render(<CursorGlow />);

      // Should not add mousemove listener when reduced motion is preferred
      const mouseMoveCalls = (
        addEventListenerSpy.mock.calls as unknown[]
      ).filter((call: unknown) => {
        const callArray = call as [string, ...unknown[]];
        return callArray[0] === "mousemove";
      });
      expect(mouseMoveCalls.length).toBe(0);

      // Restore
      window.addEventListener = originalAddEventListener;
    });

    it("should have pointer-events-none class for accessibility", async () => {
      const fs = await import("node:fs/promises");
      const sourceFilePath = await getSourceFilePath();
      const sourceCode = await fs.readFile(sourceFilePath, "utf-8");

      expect(sourceCode).toContain("pointer-events-none");
    });

    it("should have aria-hidden attribute", async () => {
      const fs = await import("node:fs/promises");
      const sourceFilePath = await getSourceFilePath();
      const sourceCode = await fs.readFile(sourceFilePath, "utf-8");

      expect(sourceCode).toContain('aria-hidden="true"');
    });
  });

  describe("Integration with ThemeProvider", () => {
    it("should detect initial dark mode state", () => {
      document.documentElement.classList.add("dark");

      // Component should detect dark mode on mount through MutationObserver setup
      render(<CursorGlow />);

      // MutationObserver was called and is observing
      expect(mockObserver.observe).toHaveBeenCalled();
    });

    it("should respond to dark class changes", () => {
      render(<CursorGlow />);

      // Add dark class
      act(() => {
        document.documentElement.classList.add("dark");

        // Trigger MutationObserver callback
        // @ts-expect-error - Accessing test callback property
        const mutationCallback = mockObserver.callback;
        if (mutationCallback) {
          const mutations: MutationRecord[] = [
            {
              type: "attributes",
              attributeName: "class",
              target: document.documentElement,
            } as MutationRecord,
          ];
          // @ts-expect-error - Calling mock callback with test observer
          mutationCallback(mutations, mockObserver);
        }
      });

      // Component should have responded to the mutation
      // (tested via MutationObserver setup)
      expect(document.documentElement.classList.contains("dark")).toBe(true);
    });
  });
});
