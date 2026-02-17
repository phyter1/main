import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AISuggestionBadge } from "./AISuggestionBadge";

describe("T004: AISuggestionBadge component", () => {
  describe("Rendering", () => {
    it("should render robot emoji badge", () => {
      render(<AISuggestionBadge onClick={() => {}} />);

      const badge = screen.getByText("🤖");
      expect(badge).toBeDefined();
    });

    it("should render with shadcn/ui Badge component", () => {
      render(<AISuggestionBadge onClick={() => {}} />);

      const badge = screen.getByText("🤖");
      expect(badge.getAttribute("data-slot")).toBe("badge");
    });

    it("should show tooltip on hover", () => {
      render(<AISuggestionBadge onClick={() => {}} />);

      const badge = screen.getByText("🤖");

      // Tooltip text set via title attribute (visible in browser on hover)
      expect(badge.getAttribute("title")).toBe("AI Suggested");
    });
  });

  describe("Click handling", () => {
    it("should call onClick when badge is clicked", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(<AISuggestionBadge onClick={handleClick} />);

      const badge = screen.getByText("🤖");
      await user.click(badge);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("should trigger overlay display on click", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(<AISuggestionBadge onClick={handleClick} />);

      const badge = screen.getByText("🤖");
      await user.click(badge);

      expect(handleClick).toHaveBeenCalled();
    });
  });

  describe("Keyboard accessibility", () => {
    it("should have proper ARIA label", () => {
      render(<AISuggestionBadge onClick={() => {}} />);

      const badge = screen.getByLabelText("AI suggestion - click to review");
      expect(badge).toBeDefined();
    });

    it("should trigger onClick when Enter key is pressed", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(<AISuggestionBadge onClick={handleClick} />);

      const badge = screen.getByLabelText("AI suggestion - click to review");
      badge.focus();

      await user.keyboard("{Enter}");

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("should trigger onClick when Space key is pressed", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(<AISuggestionBadge onClick={handleClick} />);

      const badge = screen.getByLabelText("AI suggestion - click to review");
      badge.focus();

      await user.keyboard(" ");

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("should be focusable via Tab key", async () => {
      const user = userEvent.setup();

      render(<AISuggestionBadge onClick={() => {}} />);

      const badge = screen.getByLabelText("AI suggestion - click to review");

      // Tab to focus
      await user.tab();

      expect(badge).toBe(document.activeElement);
    });

    it("should have tabIndex of 0 for keyboard navigation", () => {
      render(<AISuggestionBadge onClick={() => {}} />);

      const badge = screen.getByLabelText("AI suggestion - click to review");
      expect(badge.getAttribute("tabindex")).toBe("0");
    });
  });

  describe("Styling and conventions", () => {
    it("should follow new-york style conventions", () => {
      render(<AISuggestionBadge onClick={() => {}} />);

      const badge = screen.getByText("🤖");
      const classes = badge.className;

      // Should use shadcn/ui badge styling
      expect(classes).toContain("inline-flex");
      expect(classes).toContain("items-center");
    });

    it("should have cursor-pointer styling for clickability", () => {
      render(<AISuggestionBadge onClick={() => {}} />);

      const badge = screen.getByLabelText("AI suggestion - click to review");
      expect(badge.className).toContain("cursor-pointer");
    });

    it("should have hover effect styling", () => {
      render(<AISuggestionBadge onClick={() => {}} />);

      const badge = screen.getByLabelText("AI suggestion - click to review");
      expect(badge.className).toContain("hover:");
    });
  });

  describe("Props validation", () => {
    it("should accept onClick prop", () => {
      const handleClick = vi.fn();

      render(<AISuggestionBadge onClick={handleClick} />);

      // Should not throw error
      expect(screen.getByText("🤖")).toBeDefined();
    });

    it("should accept optional className prop", () => {
      render(<AISuggestionBadge onClick={() => {}} className="custom-class" />);

      const badge = screen.getByText("🤖");
      expect(badge.className).toContain("custom-class");
    });
  });

  describe("Integration with overlay", () => {
    it("should serve as trigger for overlay display", async () => {
      const user = userEvent.setup();
      let overlayVisible = false;

      const handleClick = () => {
        overlayVisible = true;
      };

      render(<AISuggestionBadge onClick={handleClick} />);

      const badge = screen.getByText("🤖");
      await user.click(badge);

      expect(overlayVisible).toBe(true);
    });
  });
});
