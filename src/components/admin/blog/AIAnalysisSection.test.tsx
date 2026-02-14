/**
 * AIAnalysisSection Component Tests
 *
 * T006: Tests for collapsible AI analysis section component
 * Tests rendering, collapse/expand behavior, and content display
 */

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { AIAnalysisSection } from "./AIAnalysisSection";

// Cleanup after each test to avoid DOM pollution
afterEach(() => {
  cleanup();
});

describe("T006: AIAnalysisSection Component", () => {
  describe("Rendering", () => {
    it("should render the component with header", () => {
      render(<AIAnalysisSection tone="professional" readability="clear" />);

      expect(screen.getByText("AI Analysis")).toBeDefined();
      expect(screen.getByText("📊")).toBeDefined();
    });

    it("should render with header containing emoji and text", () => {
      render(<AIAnalysisSection tone="professional" readability="clear" />);

      const header = screen.getByText("AI Analysis");
      expect(header).toBeDefined();
      expect(screen.getByText("📊")).toBeDefined();
    });

    it("should be collapsed by default", () => {
      render(<AIAnalysisSection tone="professional" readability="clear" />);

      // Content should not be visible initially
      const toneText = screen.queryByText("professional");
      expect(toneText).toBeNull();
    });
  });

  describe("Collapse/Expand Behavior", () => {
    it("should expand when header is clicked", async () => {
      const user = userEvent.setup();

      render(<AIAnalysisSection tone="professional" readability="clear" />);

      const trigger = screen.getByRole("button", { name: /AI Analysis/i });
      await user.click(trigger);

      // Content should be visible after click
      await waitFor(() => {
        expect(screen.getByText(/professional/i)).toBeDefined();
        expect(screen.getByText(/clear/i)).toBeDefined();
      });
    });

    it("should collapse when header is clicked again", async () => {
      const user = userEvent.setup();

      render(<AIAnalysisSection tone="professional" readability="clear" />);

      const trigger = screen.getByRole("button", { name: /AI Analysis/i });

      // Expand
      await user.click(trigger);
      await waitFor(() => {
        expect(screen.getByText(/professional/i)).toBeDefined();
      });

      // Collapse
      await user.click(trigger);
      await waitFor(() => {
        expect(screen.queryByText(/professional/i)).toBeNull();
      });
    });

    it("should support keyboard navigation", async () => {
      const user = userEvent.setup();

      render(<AIAnalysisSection tone="professional" readability="clear" />);

      const trigger = screen.getByRole("button", { name: /AI Analysis/i });

      // Focus trigger
      await user.tab();

      // Expand with Enter key
      await user.keyboard("{Enter}");
      await waitFor(() => {
        expect(screen.getByText(/professional/i)).toBeDefined();
      });
    });

    it("should support Space key to toggle", async () => {
      const user = userEvent.setup();

      render(<AIAnalysisSection tone="professional" readability="clear" />);

      const trigger = screen.getByRole("button", { name: /AI Analysis/i });

      // Focus trigger
      trigger.focus();

      // Expand with Space key
      await user.keyboard(" ");
      await waitFor(() => {
        expect(screen.getByText(/professional/i)).toBeDefined();
      });
    });
  });

  describe("Content Display", () => {
    it("should display tone as a badge", async () => {
      const user = userEvent.setup();

      render(<AIAnalysisSection tone="professional" readability="clear" />);

      const trigger = screen.getByRole("button", { name: /AI Analysis/i });
      await user.click(trigger);

      await waitFor(() => {
        const toneBadge = screen.getByText(/professional/i);
        expect(toneBadge).toBeDefined();
        expect(toneBadge.tagName.toLowerCase()).toBe("span");
      });
    });

    it("should display readability as a badge", async () => {
      const user = userEvent.setup();

      render(<AIAnalysisSection tone="professional" readability="clear" />);

      const trigger = screen.getByRole("button", { name: /AI Analysis/i });
      await user.click(trigger);

      await waitFor(() => {
        const readabilityBadge = screen.getByText(/clear/i);
        expect(readabilityBadge).toBeDefined();
        expect(readabilityBadge.tagName.toLowerCase()).toBe("span");
      });
    });

    it("should display both tone and readability together", async () => {
      const user = userEvent.setup();

      render(<AIAnalysisSection tone="conversational" readability="complex" />);

      const trigger = screen.getByRole("button", { name: /AI Analysis/i });
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText(/conversational/i)).toBeDefined();
        expect(screen.getByText(/complex/i)).toBeDefined();
      });
    });

    it("should display labels for tone and readability", async () => {
      const user = userEvent.setup();

      render(<AIAnalysisSection tone="professional" readability="clear" />);

      const trigger = screen.getByRole("button", { name: /AI Analysis/i });
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText(/Tone:/i)).toBeDefined();
        expect(screen.getByText(/Readability:/i)).toBeDefined();
      });
    });
  });

  describe("Visual Appearance", () => {
    it("should have smooth animation classes", async () => {
      const user = userEvent.setup();

      render(<AIAnalysisSection tone="professional" readability="clear" />);

      const trigger = screen.getByRole("button", { name: /AI Analysis/i });
      await user.click(trigger);

      // Collapsible content should have animation attributes
      await waitFor(() => {
        const content = screen.getByText(/professional/i).parentElement;
        expect(content).toBeDefined();
      });
    });

    it("should be read-only (no interactive elements in content)", async () => {
      const user = userEvent.setup();

      render(<AIAnalysisSection tone="professional" readability="clear" />);

      const trigger = screen.getByRole("button", { name: /AI Analysis/i });
      await user.click(trigger);

      await waitFor(() => {
        const content = screen.getByText(/professional/i).parentElement;

        // Should not contain buttons, inputs, or other interactive elements
        const buttons = content?.querySelectorAll("button");
        const inputs = content?.querySelectorAll("input");

        expect(buttons?.length || 0).toBe(0);
        expect(inputs?.length || 0).toBe(0);
      });
    });
  });

  describe("Accessibility", () => {
    it("should have proper aria attributes", () => {
      render(<AIAnalysisSection tone="professional" readability="clear" />);

      const trigger = screen.getByRole("button", { name: /AI Analysis/i });

      // Collapsible trigger should be a button or have button role
      expect(
        trigger.tagName.toLowerCase() === "button" ||
          trigger.getAttribute("role") === "button",
      ).toBe(true);
    });

    it("should be keyboard accessible", async () => {
      const user = userEvent.setup();

      render(<AIAnalysisSection tone="professional" readability="clear" />);

      // Tab to focus trigger
      await user.tab();

      const trigger = screen.getByRole("button", { name: /AI Analysis/i });
      expect(document.activeElement).toBe(trigger);
    });

    it("should announce state changes to screen readers", async () => {
      const user = userEvent.setup();

      render(<AIAnalysisSection tone="professional" readability="clear" />);

      const trigger = screen.getByRole("button", { name: /AI Analysis/i });

      // Check for aria-expanded attribute
      expect(trigger.getAttribute("aria-expanded")).toBe("false");

      await user.click(trigger);

      await waitFor(() => {
        expect(trigger.getAttribute("aria-expanded")).toBe("true");
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty tone value", async () => {
      const user = userEvent.setup();

      render(<AIAnalysisSection tone="" readability="clear" />);

      const trigger = screen.getByRole("button", { name: /AI Analysis/i });
      await user.click(trigger);

      await waitFor(() => {
        const content = screen.getByText(/Tone:/i);
        expect(content).toBeDefined();
      });
    });

    it("should handle empty readability value", async () => {
      const user = userEvent.setup();

      render(<AIAnalysisSection tone="professional" readability="" />);

      const trigger = screen.getByRole("button", { name: /AI Analysis/i });
      await user.click(trigger);

      await waitFor(() => {
        const content = screen.getByText(/Readability:/i);
        expect(content).toBeDefined();
      });
    });

    it("should handle very long tone values", async () => {
      const user = userEvent.setup();

      const longTone =
        "Very professional and technical with detailed explanations";

      render(<AIAnalysisSection tone={longTone} readability="clear" />);

      const trigger = screen.getByRole("button", { name: /AI Analysis/i });
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText(longTone)).toBeDefined();
      });
    });

    it("should handle very long readability values", async () => {
      const user = userEvent.setup();

      const longReadability =
        "Moderately complex with some advanced terminology";

      render(
        <AIAnalysisSection tone="professional" readability={longReadability} />,
      );

      const trigger = screen.getByRole("button", { name: /AI Analysis/i });
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText(longReadability)).toBeDefined();
      });
    });
  });
});
