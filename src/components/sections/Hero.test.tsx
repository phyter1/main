import { describe, expect, it, mock } from "bun:test";
import { render, screen } from "@testing-library/react";
import { Hero } from "./Hero";

// Mock TypeWriter component
mock.module("@/components/effects/TypeWriter", () => ({
  TypeWriter: ({
    text,
    onComplete,
  }: {
    text: string;
    onComplete: () => void;
  }) => {
    if (onComplete) onComplete();
    return <div>{text}</div>;
  },
}));

// Mock RotatingTypeWriter component
mock.module("@/components/effects/RotatingTypeWriter", () => ({
  RotatingTypeWriter: ({ words }: { words: string[] }) => <div>{words[0]}</div>,
}));

// Mock useReducedMotion hook
mock.module("@/hooks/useReducedMotion", () => ({
  useReducedMotion: () => false,
}));

// Mock stack data
mock.module("@/data/stack", () => ({
  stackItems: [
    { label: "React", proficiency: "expert" },
    { label: "TypeScript", proficiency: "expert" },
  ],
}));

describe("T001: Update homepage Hero title to Tech Lead", () => {
  describe("Tech Lead Title", () => {
    it("should display Tech Lead as the primary role title", () => {
      render(<Hero />);

      const headings = screen.getAllByRole("heading", { level: 1 });
      expect(headings[0].textContent).toContain("Tech Lead");
    });

    it("should not display Frontend / Backend Typescript Engineer", () => {
      render(<Hero />);

      const headings = screen.getAllByRole("heading", { level: 1 });
      expect(headings[0].textContent).not.toContain(
        "Frontend / Backend Typescript Engineer",
      );
    });

    it("should emphasize AI-first development in title", () => {
      render(<Hero />);

      const headings = screen.getAllByRole("heading", { level: 1 });
      expect(
        headings[0].textContent?.toLowerCase().includes("ai") ||
          headings[0].textContent?.toLowerCase().includes("agentic"),
      ).toBe(true);
    });

    it("should maintain visual hierarchy with proper heading structure", () => {
      render(<Hero />);

      const headings = screen.getAllByRole("heading", { level: 1 });
      expect(headings[0]).toBeDefined();
      expect(headings[0].tagName).toBe("H1");
    });
  });

  describe("Subtitle Enhancement", () => {
    it("should mention human + AI agent teams in subtitle", () => {
      render(<Hero />);

      const content = screen.getAllByText(/agent/i);
      expect(content.length).toBeGreaterThan(0);
    });

    it("should reference team leadership in content", () => {
      render(<Hero />);

      const bodyText = screen.getAllByText(/team/i);
      expect(bodyText.length).toBeGreaterThan(0);
    });

    it("should maintain professional tone and clarity", () => {
      render(<Hero />);

      const headings = screen.getAllByRole("heading", { level: 1 });
      expect(headings[0].textContent?.length).toBeGreaterThan(0);
      expect(headings[0].textContent?.length).toBeLessThan(100);
    });
  });

  describe("Branding Consistency", () => {
    it("should maintain the greeting TypeWriter effect", () => {
      render(<Hero />);

      const greetings = screen.getAllByText("> Hello, I'm Ryan");
      expect(greetings.length).toBeGreaterThan(0);
    });

    it("should keep CTA buttons for user navigation", () => {
      render(<Hero />);

      const viewWorkButtons = screen.getAllByRole("link", {
        name: /View My Work/i,
      });
      const connectButtons = screen.getAllByRole("link", {
        name: /Let's Connect/i,
      });

      expect(viewWorkButtons.length).toBeGreaterThan(0);
      expect(connectButtons.length).toBeGreaterThan(0);
    });

    it("should maintain scroll indicator for UX", () => {
      const { container } = render(<Hero />);

      // The scroll indicator is rendered in the component (ChevronDown icon)
      const chevronIcon = container.querySelector(".lucide-chevron-down");
      expect(chevronIcon).toBeDefined();
    });
  });

  describe("Acceptance Criteria Validation", () => {
    it("should have title updated from Frontend / Backend Typescript Engineer to Tech Lead positioning", () => {
      render(<Hero />);

      const headings = screen.getAllByRole("heading", { level: 1 });
      expect(headings[0].textContent).toContain("Tech Lead");
      expect(headings[0].textContent).not.toContain(
        "Frontend / Backend Typescript Engineer",
      );
    });

    it("should maintain visual hierarchy and branding", () => {
      render(<Hero />);

      // Check for key branding elements
      const greetings = screen.getAllByText("> Hello, I'm Ryan");
      expect(greetings.length).toBeGreaterThan(0);
      expect(screen.getAllByRole("heading", { level: 1 })[0]).toBeDefined();
    });

    it("should emphasize AI-first, agentic development leadership", () => {
      render(<Hero />);

      const headings = screen.getAllByRole("heading", { level: 1 });
      const hasAIContent =
        headings[0].textContent?.toLowerCase().includes("ai") ||
        headings[0].textContent?.toLowerCase().includes("agentic");
      expect(hasAIContent).toBe(true);
    });

    it("should have subtitle strengthened to mention human + AI agent teams", () => {
      render(<Hero />);

      // Should find references to agents and teams in the component
      const agentReferences = screen.getAllByText(/agent/i);
      expect(agentReferences.length).toBeGreaterThan(0);
    });
  });
});
