import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { PromptDiff } from "./PromptDiff";

afterEach(() => {
  cleanup();
});

describe("PromptDiff", () => {
  describe("Core Functionality", () => {
    it("should render side-by-side comparison", () => {
      render(
        <PromptDiff
          original={"Line 1\nLine 2\nLine 3"}
          proposed={"Line 1\nLine 2 modified\nLine 3"}
        />,
      );

      expect(screen.getByText("Original Prompt")).toBeTruthy();
      expect(screen.getByText("Proposed Prompt")).toBeTruthy();
    });

    it("should display token counts when provided", () => {
      render(
        <PromptDiff
          original="Test prompt"
          proposed="Modified test prompt"
          originalTokenCount={10}
          proposedTokenCount={15}
        />,
      );

      expect(screen.getByText(/10 tokens/)).toBeTruthy();
      expect(screen.getByText(/15 tokens/)).toBeTruthy();
    });

    it("should display token count difference", () => {
      render(
        <PromptDiff
          original="Test prompt"
          proposed="Modified test prompt"
          originalTokenCount={100}
          proposedTokenCount={50}
        />,
      );

      expect(screen.getByText(/-50 tokens/)).toBeTruthy();
    });

    it("should display positive token count difference", () => {
      render(
        <PromptDiff
          original="Test prompt"
          proposed="Modified test prompt"
          originalTokenCount={50}
          proposedTokenCount={100}
        />,
      );

      expect(screen.getByText(/\+50 tokens/)).toBeTruthy();
    });
  });

  describe("Diff Highlighting", () => {
    it("should highlight added lines in green", () => {
      render(
        <PromptDiff
          original={"Line 1\nLine 2"}
          proposed={"Line 1\nLine 2\nLine 3 added"}
        />,
      );

      const addedLine = screen.getByText(/Line 3 added/);
      expect(addedLine).toBeTruthy();
      expect(addedLine.className).toContain("bg-success/20");
    });

    it("should highlight removed lines in red", () => {
      render(
        <PromptDiff
          original={"Line 1\nLine 2 removed\nLine 3"}
          proposed={"Line 1\nLine 3"}
        />,
      );

      const removedLine = screen.getByText(/Line 2 removed/);
      expect(removedLine).toBeTruthy();
      expect(removedLine.className).toContain("bg-destructive/20");
    });

    it("should highlight modified lines in yellow", () => {
      render(
        <PromptDiff original="Line 1 original" proposed="Line 1 modified" />,
      );

      const originalLine = screen.getByText(/Line 1 original/);
      const modifiedLine = screen.getByText(/Line 1 modified/);

      expect(originalLine.className).toContain("bg-warning/20");
      expect(modifiedLine.className).toContain("bg-warning/20");
    });

    it("should not highlight unchanged lines", () => {
      render(
        <PromptDiff
          original={"Unchanged line\nChanged line"}
          proposed={"Unchanged line\nModified line"}
        />,
      );

      const unchangedLines = screen.getAllByText("Unchanged line");
      expect(unchangedLines.length).toBe(2); // Should appear in both sides
      expect(unchangedLines[0].className).not.toContain("bg-");
      expect(unchangedLines[1].className).not.toContain("bg-");
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty original prompt", () => {
      render(<PromptDiff original="" proposed="New content" />);

      expect(screen.getByText("Original Prompt")).toBeTruthy();
      expect(screen.getByText("Proposed Prompt")).toBeTruthy();
      expect(screen.getByText(/New content/)).toBeTruthy();
    });

    it("should handle empty proposed prompt", () => {
      render(<PromptDiff original="Original content" proposed="" />);

      expect(screen.getByText(/Original content/)).toBeTruthy();
    });

    it("should handle identical prompts", () => {
      const { container } = render(
        <PromptDiff
          original="Same content"
          proposed="Same content"
          originalTokenCount={10}
          proposedTokenCount={10}
        />,
      );

      const sameContentElements = screen.getAllByText("Same content");
      expect(sameContentElements.length).toBe(2); // Appears in both sides

      // Check badge shows 0 tokens difference
      const badge = container.querySelector('[data-slot="badge"]');
      expect(badge?.textContent).toBe("0 tokens");
    });

    it("should handle single line prompts", () => {
      render(
        <PromptDiff original="Single line" proposed="Different single line" />,
      );

      expect(screen.getByText(/Single line/)).toBeTruthy();
      expect(screen.getByText(/Different single line/)).toBeTruthy();
    });

    it("should handle multi-line prompts with significant differences", () => {
      const original = "Line 1\nLine 2\nLine 3\nLine 4\nLine 5";
      const proposed = "Line 1\nNew Line 2\nLine 3 modified\nLine 5\nLine 6";

      render(<PromptDiff original={original} proposed={proposed} />);

      const line1Elements = screen.getAllByText("Line 1");
      expect(line1Elements.length).toBe(2); // Unchanged, appears in both

      // Check for exact matches to avoid regex overlap
      expect(screen.getByText("Line 2")).toBeTruthy();
      expect(screen.getByText("New Line 2")).toBeTruthy();
    });
  });

  describe("Responsive Layout", () => {
    it("should apply grid layout classes for side-by-side view", () => {
      const { container } = render(
        <PromptDiff original="Test" proposed="Test" />,
      );

      const gridContainer = container.querySelector(".grid");
      expect(gridContainer).toBeTruthy();
      expect(gridContainer?.className).toContain("md:grid-cols-2");
    });
  });

  describe("Token Count Display", () => {
    it("should handle missing token counts", () => {
      render(<PromptDiff original="Test" proposed="Test" />);

      const headers = screen.getAllByText(/Prompt/);
      expect(headers.length).toBeGreaterThan(0);
    });

    it("should handle zero token counts", () => {
      const { container } = render(
        <PromptDiff
          original=""
          proposed=""
          originalTokenCount={0}
          proposedTokenCount={0}
        />,
      );

      const tokenElements = screen.getAllByText(/0 tokens/);
      expect(tokenElements.length).toBe(3); // 2 in headers + 1 in badge

      // Verify badge shows difference of 0
      const badge = container.querySelector('[data-slot="badge"]');
      expect(badge?.textContent).toBe("0 tokens");
    });

    it("should calculate difference correctly for large numbers", () => {
      render(
        <PromptDiff
          original="Test"
          proposed="Test"
          originalTokenCount={5000}
          proposedTokenCount={3500}
        />,
      );

      expect(screen.getByText(/-1500 tokens/)).toBeTruthy();
    });
  });
});
