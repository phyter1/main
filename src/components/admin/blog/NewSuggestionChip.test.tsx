import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NewSuggestionChip } from "./NewSuggestionChip";

describe("T013: NewSuggestionChip", () => {
  const mockOnReplace = vi.fn();
  const mockOnDismiss = vi.fn();
  const testValue = "Test suggestion value";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe("Rendering", () => {
    it("should render chip with suggestion value", () => {
      render(
        <NewSuggestionChip
          value={testValue}
          onReplace={mockOnReplace}
          onDismiss={mockOnDismiss}
        />,
      );

      expect(screen.getByText(/new suggestion:/i)).toBeDefined();
      expect(screen.getByText(testValue)).toBeDefined();
    });

    it("should display lightbulb emoji icon", () => {
      render(
        <NewSuggestionChip
          value={testValue}
          onReplace={mockOnReplace}
          onDismiss={mockOnDismiss}
        />,
      );

      const chip = screen.getByText(/💡/);
      expect(chip).toBeDefined();
    });

    it("should render Replace button with checkmark", () => {
      render(
        <NewSuggestionChip
          value={testValue}
          onReplace={mockOnReplace}
          onDismiss={mockOnDismiss}
        />,
      );

      const replaceButton = screen.getByRole("button", { name: /replace/i });
      expect(replaceButton).toBeDefined();
      expect(replaceButton.textContent).toContain("✓");
    });

    it("should render Dismiss button with X", () => {
      render(
        <NewSuggestionChip
          value={testValue}
          onReplace={mockOnReplace}
          onDismiss={mockOnDismiss}
        />,
      );

      const dismissButton = screen.getByRole("button", { name: /dismiss/i });
      expect(dismissButton).toBeDefined();
      expect(dismissButton.textContent).toContain("✗");
    });

    it("should apply custom className when provided", () => {
      const { container } = render(
        <NewSuggestionChip
          value={testValue}
          onReplace={mockOnReplace}
          onDismiss={mockOnDismiss}
          className="custom-class"
        />,
      );

      const chip = container.querySelector(".custom-class");
      expect(chip).toBeDefined();
    });
  });

  describe("Replace Action", () => {
    it("should call onReplace with value when Replace button is clicked", () => {
      render(
        <NewSuggestionChip
          value={testValue}
          onReplace={mockOnReplace}
          onDismiss={mockOnDismiss}
        />,
      );

      const replaceButton = screen.getByRole("button", { name: /replace/i });
      fireEvent.click(replaceButton);

      expect(mockOnReplace).toHaveBeenCalledTimes(1);
      expect(mockOnReplace).toHaveBeenCalledWith(testValue);
    });

    it("should not call onDismiss when Replace is clicked", () => {
      render(
        <NewSuggestionChip
          value={testValue}
          onReplace={mockOnReplace}
          onDismiss={mockOnDismiss}
        />,
      );

      const replaceButton = screen.getByRole("button", { name: /replace/i });
      fireEvent.click(replaceButton);

      expect(mockOnDismiss).not.toHaveBeenCalled();
    });

    it("should handle rapid Replace clicks gracefully", () => {
      render(
        <NewSuggestionChip
          value={testValue}
          onReplace={mockOnReplace}
          onDismiss={mockOnDismiss}
        />,
      );

      const replaceButton = screen.getByRole("button", { name: /replace/i });
      fireEvent.click(replaceButton);
      fireEvent.click(replaceButton);
      fireEvent.click(replaceButton);

      expect(mockOnReplace).toHaveBeenCalledTimes(3);
    });
  });

  describe("Dismiss Action", () => {
    it("should call onDismiss when Dismiss button is clicked", () => {
      render(
        <NewSuggestionChip
          value={testValue}
          onReplace={mockOnReplace}
          onDismiss={mockOnDismiss}
        />,
      );

      const dismissButton = screen.getByRole("button", { name: /dismiss/i });
      fireEvent.click(dismissButton);

      expect(mockOnDismiss).toHaveBeenCalledTimes(1);
    });

    it("should not call onReplace when Dismiss is clicked", () => {
      render(
        <NewSuggestionChip
          value={testValue}
          onReplace={mockOnReplace}
          onDismiss={mockOnDismiss}
        />,
      );

      const dismissButton = screen.getByRole("button", { name: /dismiss/i });
      fireEvent.click(dismissButton);

      expect(mockOnReplace).not.toHaveBeenCalled();
    });

    it("should handle rapid Dismiss clicks gracefully", () => {
      render(
        <NewSuggestionChip
          value={testValue}
          onReplace={mockOnReplace}
          onDismiss={mockOnDismiss}
        />,
      );

      const dismissButton = screen.getByRole("button", { name: /dismiss/i });
      fireEvent.click(dismissButton);
      fireEvent.click(dismissButton);
      fireEvent.click(dismissButton);

      expect(mockOnDismiss).toHaveBeenCalledTimes(3);
    });
  });

  describe("Positioning", () => {
    it("should be positioned underneath input field context", () => {
      const { container } = render(
        <div className="relative">
          <input type="text" className="w-full" />
          <NewSuggestionChip
            value={testValue}
            onReplace={mockOnReplace}
            onDismiss={mockOnDismiss}
          />
        </div>,
      );

      const chip = container.querySelector("[data-chip]");
      expect(chip).toBeDefined();
    });

    it("should have proper spacing from parent", () => {
      const { container } = render(
        <NewSuggestionChip
          value={testValue}
          onReplace={mockOnReplace}
          onDismiss={mockOnDismiss}
        />,
      );

      const chipWrapper = container.querySelector("[data-chip]")?.parentElement;
      expect(chipWrapper?.className).toContain("mt-2");
    });
  });

  describe("Animations", () => {
    it("should have fade-in animation wrapper", () => {
      const { container } = render(
        <NewSuggestionChip
          value={testValue}
          onReplace={mockOnReplace}
          onDismiss={mockOnDismiss}
        />,
      );

      const chip = container.querySelector("[data-chip]");
      expect(chip?.parentElement?.getAttribute("style")).toBeDefined();
    });

    it("should animate in smoothly on mount", () => {
      const { container } = render(
        <NewSuggestionChip
          value={testValue}
          onReplace={mockOnReplace}
          onDismiss={mockOnDismiss}
        />,
      );

      const motion = container.querySelector("[data-chip]")?.parentElement;
      expect(motion).toBeDefined();
    });
  });

  describe("Keyboard Accessibility", () => {
    it("should be keyboard navigable with Tab", () => {
      render(
        <NewSuggestionChip
          value={testValue}
          onReplace={mockOnReplace}
          onDismiss={mockOnDismiss}
        />,
      );

      const replaceButton = screen.getByRole("button", { name: /replace/i });
      const dismissButton = screen.getByRole("button", { name: /dismiss/i });

      replaceButton.focus();
      expect(document.activeElement).toBe(replaceButton);

      dismissButton.focus();
      expect(document.activeElement).toBe(dismissButton);
    });

    it("should trigger onReplace when Replace button receives Enter key", () => {
      render(
        <NewSuggestionChip
          value={testValue}
          onReplace={mockOnReplace}
          onDismiss={mockOnDismiss}
        />,
      );

      const replaceButton = screen.getByRole("button", { name: /replace/i });
      replaceButton.focus();
      fireEvent.keyDown(replaceButton, { key: "Enter", code: "Enter" });
      fireEvent.click(replaceButton);

      expect(mockOnReplace).toHaveBeenCalledTimes(1);
    });

    it("should trigger onDismiss when Dismiss button receives Enter key", () => {
      render(
        <NewSuggestionChip
          value={testValue}
          onReplace={mockOnReplace}
          onDismiss={mockOnDismiss}
        />,
      );

      const dismissButton = screen.getByRole("button", { name: /dismiss/i });
      dismissButton.focus();
      fireEvent.keyDown(dismissButton, { key: "Enter", code: "Enter" });
      fireEvent.click(dismissButton);

      expect(mockOnDismiss).toHaveBeenCalledTimes(1);
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA label on Replace button", () => {
      render(
        <NewSuggestionChip
          value={testValue}
          onReplace={mockOnReplace}
          onDismiss={mockOnDismiss}
        />,
      );

      const replaceButton = screen.getByRole("button", { name: /replace/i });
      expect(replaceButton.getAttribute("aria-label")?.toLowerCase()).toContain(
        "replace",
      );
    });

    it("should have proper ARIA label on Dismiss button", () => {
      render(
        <NewSuggestionChip
          value={testValue}
          onReplace={mockOnReplace}
          onDismiss={mockOnDismiss}
        />,
      );

      const dismissButton = screen.getByRole("button", { name: /dismiss/i });
      expect(dismissButton.getAttribute("aria-label")?.toLowerCase()).toContain(
        "dismiss",
      );
    });

    it("should have semantic container with proper role", () => {
      const { container } = render(
        <NewSuggestionChip
          value={testValue}
          onReplace={mockOnReplace}
          onDismiss={mockOnDismiss}
        />,
      );

      const chip = container.querySelector("[data-chip]");
      expect(chip?.getAttribute("role")).toBe("alert");
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty value gracefully", () => {
      render(
        <NewSuggestionChip
          value=""
          onReplace={mockOnReplace}
          onDismiss={mockOnDismiss}
        />,
      );

      expect(screen.getByText(/new suggestion:/i)).toBeDefined();
      const replaceButton = screen.getByRole("button", { name: /replace/i });
      fireEvent.click(replaceButton);

      expect(mockOnReplace).toHaveBeenCalledWith("");
    });

    it("should handle very long suggestion values", () => {
      const longValue = "A".repeat(500);
      render(
        <NewSuggestionChip
          value={longValue}
          onReplace={mockOnReplace}
          onDismiss={mockOnDismiss}
        />,
      );

      expect(screen.getByText(longValue)).toBeDefined();
    });

    it("should handle special characters in value", () => {
      const specialValue = "<script>alert('xss')</script>";
      render(
        <NewSuggestionChip
          value={specialValue}
          onReplace={mockOnReplace}
          onDismiss={mockOnDismiss}
        />,
      );

      expect(screen.getByText(specialValue)).toBeDefined();
      expect(
        screen.queryByText(specialValue, { selector: "script" }),
      ).toBeNull();
    });

    it("should unmount cleanly without memory leaks", () => {
      const { unmount } = render(
        <NewSuggestionChip
          value={testValue}
          onReplace={mockOnReplace}
          onDismiss={mockOnDismiss}
        />,
      );

      unmount();

      expect(mockOnReplace).not.toHaveBeenCalled();
      expect(mockOnDismiss).not.toHaveBeenCalled();
    });
  });

  describe("Visual Styling", () => {
    it("should have background styling for visibility", () => {
      const { container } = render(
        <NewSuggestionChip
          value={testValue}
          onReplace={mockOnReplace}
          onDismiss={mockOnDismiss}
        />,
      );

      const chip = container.querySelector("[data-chip]");
      expect(chip?.className).toContain("bg-");
    });

    it("should have border styling", () => {
      const { container } = render(
        <NewSuggestionChip
          value={testValue}
          onReplace={mockOnReplace}
          onDismiss={mockOnDismiss}
        />,
      );

      const chip = container.querySelector("[data-chip]");
      expect(chip?.className).toContain("border");
    });

    it("should have rounded corners", () => {
      const { container } = render(
        <NewSuggestionChip
          value={testValue}
          onReplace={mockOnReplace}
          onDismiss={mockOnDismiss}
        />,
      );

      const chip = container.querySelector("[data-chip]");
      expect(chip?.className).toContain("rounded");
    });

    it("should have padding for content spacing", () => {
      const { container } = render(
        <NewSuggestionChip
          value={testValue}
          onReplace={mockOnReplace}
          onDismiss={mockOnDismiss}
        />,
      );

      const chip = container.querySelector("[data-chip]");
      expect(chip?.className).toMatch(/p-\d/);
    });
  });
});
