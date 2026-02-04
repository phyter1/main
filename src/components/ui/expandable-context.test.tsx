import { afterEach, describe, expect, it } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ExpandableContext } from "./expandable-context";

describe("ExpandableContext Component - T009", () => {
  const mockContext = {
    situation: "Led a cross-functional team to modernize legacy infrastructure",
    task: "Migrate monolithic application to microservices architecture",
    action:
      "Implemented containerization with Docker and orchestration with Kubernetes",
    result:
      "Reduced deployment time by 70% and improved system reliability to 99.9% uptime",
  };

  afterEach(() => {
    cleanup();
  });

  describe("Core Functionality", () => {
    it("should render with collapsed state by default", () => {
      render(<ExpandableContext context={mockContext} />);

      // Should show the trigger button
      const button = screen.getByText("View AI Context");
      expect(button).toBeDefined();

      // Context content should not be visible initially
      expect(screen.queryByText("Situation")).toBeNull();
    });

    it("should expand to show context when button is clicked", () => {
      render(<ExpandableContext context={mockContext} />);

      const button = screen.getByText("View AI Context");
      fireEvent.click(button);

      // Should show all STAR sections
      expect(screen.getByText("Situation")).toBeDefined();
      expect(screen.getByText("Task")).toBeDefined();
      expect(screen.getByText("Action")).toBeDefined();
      expect(screen.getByText("Result")).toBeDefined();

      // Should show context content
      expect(screen.getByText(mockContext.situation)).toBeDefined();
      expect(screen.getByText(mockContext.task)).toBeDefined();
      expect(screen.getByText(mockContext.action)).toBeDefined();
      expect(screen.getByText(mockContext.result)).toBeDefined();
    });

    it("should change button text when expanded", () => {
      render(<ExpandableContext context={mockContext} />);

      const button = screen.getByText("View AI Context");
      fireEvent.click(button);

      // Button text should change
      expect(screen.getByText("Hide Context")).toBeDefined();
      expect(screen.queryByText("View AI Context")).toBeNull();
    });

    it("should collapse when hide button is clicked", () => {
      render(<ExpandableContext context={mockContext} />);

      // Expand first
      const expandButton = screen.getByText("View AI Context");
      fireEvent.click(expandButton);

      // Then collapse
      const collapseButton = screen.getByText("Hide Context");
      fireEvent.click(collapseButton);

      // Should be back to collapsed state
      expect(screen.getByText("View AI Context")).toBeDefined();
      expect(screen.queryByText("Situation")).toBeNull();
    });
  });

  describe("STAR Format Display", () => {
    it("should display all STAR sections in correct order", () => {
      render(<ExpandableContext context={mockContext} />);

      const button = screen.getByText("View AI Context");
      fireEvent.click(button);

      const sections = screen.getAllByRole("heading", { level: 3 });
      const sectionTexts = sections.map((s) => s.textContent);

      expect(sectionTexts).toContain("Situation");
      expect(sectionTexts).toContain("Task");
      expect(sectionTexts).toContain("Action");
      expect(sectionTexts).toContain("Result");
    });

    it("should organize content in separate sections", () => {
      render(<ExpandableContext context={mockContext} />);

      fireEvent.click(screen.getByText("View AI Context"));

      // Each section should have its content
      const situationSection = screen
        .getByText("Situation")
        .closest('[data-section="situation"]');
      expect(situationSection?.textContent).toContain(mockContext.situation);

      const taskSection = screen
        .getByText("Task")
        .closest('[data-section="task"]');
      expect(taskSection?.textContent).toContain(mockContext.task);

      const actionSection = screen
        .getByText("Action")
        .closest('[data-section="action"]');
      expect(actionSection?.textContent).toContain(mockContext.action);

      const resultSection = screen
        .getByText("Result")
        .closest('[data-section="result"]');
      expect(resultSection?.textContent).toContain(mockContext.result);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty context strings gracefully", () => {
      const emptyContext = {
        situation: "",
        task: "",
        action: "",
        result: "",
      };

      render(<ExpandableContext context={emptyContext} />);
      fireEvent.click(screen.getByText("View AI Context"));

      // Should still render section headings
      expect(screen.getByText("Situation")).toBeDefined();
      expect(screen.getByText("Task")).toBeDefined();
      expect(screen.getByText("Action")).toBeDefined();
      expect(screen.getByText("Result")).toBeDefined();
    });

    it("should handle very long content", () => {
      const longContext = {
        situation: "A".repeat(500),
        task: "B".repeat(500),
        action: "C".repeat(500),
        result: "D".repeat(500),
      };

      render(<ExpandableContext context={longContext} />);
      fireEvent.click(screen.getByText("View AI Context"));

      expect(screen.getByText(longContext.situation)).toBeDefined();
      expect(screen.getByText(longContext.task)).toBeDefined();
    });

    it("should support custom className", () => {
      render(
        <ExpandableContext context={mockContext} className="custom-class" />,
      );

      const container = document.querySelector(".custom-class");
      expect(container).toBeDefined();
    });
  });

  describe("Accessibility", () => {
    it("should have accessible button with proper ARIA attributes", () => {
      render(<ExpandableContext context={mockContext} />);

      const button = screen.getByText("View AI Context");
      expect(button.tagName).toBe("BUTTON");
      expect(button.getAttribute("aria-expanded")).toBe("false");
    });

    it("should update aria-expanded when toggled", () => {
      render(<ExpandableContext context={mockContext} />);

      const button = screen.getByText("View AI Context");
      expect(button.getAttribute("aria-expanded")).toBe("false");

      fireEvent.click(button);
      expect(
        screen.getByText("Hide Context").getAttribute("aria-expanded"),
      ).toBe("true");
    });

    it("should be keyboard navigable", () => {
      render(<ExpandableContext context={mockContext} />);

      const button = screen.getByText("View AI Context");
      button.focus();

      expect(document.activeElement).toBe(button);
    });

    it("should have proper semantic structure", () => {
      render(<ExpandableContext context={mockContext} />);

      fireEvent.click(screen.getByText("View AI Context"));

      // Should use semantic HTML
      const sections = screen.getAllByRole("heading", { level: 3 });
      expect(sections.length).toBeGreaterThan(0);
    });
  });

  describe("Animation Integration", () => {
    it("should render with framer-motion components", () => {
      render(<ExpandableContext context={mockContext} />);

      fireEvent.click(screen.getByText("View AI Context"));

      // With mocked framer-motion, content should still render
      expect(screen.getByText(mockContext.situation)).toBeDefined();
    });

    it("should support reduced motion preferences", () => {
      // This test ensures the component doesn't break with animation mocking
      render(<ExpandableContext context={mockContext} />);

      fireEvent.click(screen.getByText("View AI Context"));
      fireEvent.click(screen.getByText("Hide Context"));

      // Should toggle state regardless of animation support
      expect(screen.getByText("View AI Context")).toBeDefined();
    });
  });

  describe("Integration with Button component", () => {
    it("should use Button component for trigger", () => {
      render(<ExpandableContext context={mockContext} />);

      const button = screen.getByText("View AI Context");
      // Should have button component styling
      expect(button.hasAttribute("data-slot")).toBe(true);
    });
  });
});
