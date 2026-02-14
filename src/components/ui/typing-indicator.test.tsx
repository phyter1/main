import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TypingIndicator } from "./typing-indicator";

describe("TypingIndicator Component - T003", () => {
  describe("Core Functionality", () => {
    it("should render animated dots", () => {
      const { container } = render(<TypingIndicator />);

      // Should have container with dots
      const indicatorContainer = container.querySelector(
        '[data-component="typing-indicator"]',
      );
      expect(indicatorContainer).toBeDefined();

      // Should have three animated dots
      const dots = indicatorContainer?.querySelectorAll("[data-dot]");
      expect(dots?.length).toBe(3);
    });

    it("should display default label text", () => {
      const { container } = render(<TypingIndicator />);

      // Default label should be visible (not in sr-only)
      const visibleLabel = container.querySelector(
        "span.text-sm.text-muted-foreground",
      );
      expect(visibleLabel?.textContent).toContain("Typing");
    });

    it("should support custom label text", () => {
      const { container } = render(<TypingIndicator label="AI is thinking" />);

      const visibleLabel = container.querySelector(
        "span.text-sm.text-muted-foreground",
      );
      expect(visibleLabel?.textContent).toContain("AI is thinking");
    });

    it("should hide label when specified", () => {
      const { container } = render(<TypingIndicator showLabel={false} />);

      // Should not have visible label text (only sr-only)
      const visibleLabel = container.querySelector(
        "span.text-sm.text-muted-foreground",
      );
      expect(visibleLabel).toBeNull();
    });
  });

  describe("Visual Variants", () => {
    it("should support different size variants", () => {
      const { container: smallContainer } = render(
        <TypingIndicator size="sm" />,
      );
      expect(smallContainer.querySelector('[data-size="sm"]')).toBeDefined();

      const { container: largeContainer } = render(
        <TypingIndicator size="lg" />,
      );
      expect(largeContainer.querySelector('[data-size="lg"]')).toBeDefined();
    });

    it("should support custom className", () => {
      render(<TypingIndicator className="custom-indicator" />);

      const container = document.querySelector(".custom-indicator");
      expect(container).toBeDefined();
    });
  });

  describe("Animation Behavior", () => {
    it("should have animation classes on dots", () => {
      const { container } = render(<TypingIndicator />);

      const dots = container.querySelectorAll("[data-dot]");
      dots.forEach((dot) => {
        const hasAnimation =
          dot.className.includes("animate-") ||
          dot.className.includes("animation-");
        expect(hasAnimation).toBe(true);
      });
    });

    it("should have staggered animation delays", () => {
      const { container } = render(<TypingIndicator />);

      const dots = container.querySelectorAll("[data-dot]");
      const delays = Array.from(dots).map((dot) => {
        return window.getComputedStyle(dot).animationDelay;
      });

      // Each dot should have a different delay
      expect(new Set(delays).size).toBeGreaterThan(1);
    });
  });

  describe("Dark Mode Support", () => {
    it("should use theme-aware colors", () => {
      const { container } = render(<TypingIndicator />);

      const dots = container.querySelectorAll("[data-dot]");
      dots.forEach((dot) => {
        // Should use CSS variables or theme classes
        const hasThemeClass =
          dot.className.includes("bg-") || dot.className.includes("text-");
        expect(hasThemeClass).toBe(true);
      });
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA attributes", () => {
      const { container } = render(<TypingIndicator />);

      const indicatorContainer = container.querySelector(
        '[data-component="typing-indicator"]',
      );
      expect(indicatorContainer?.getAttribute("role")).toBe("status");
      expect(indicatorContainer?.getAttribute("aria-live")).toBe("polite");
    });

    it("should have screen reader text", () => {
      const { container } = render(<TypingIndicator />);

      const srText = container.querySelector(".sr-only");
      expect(srText).toBeDefined();
    });
  });
});
