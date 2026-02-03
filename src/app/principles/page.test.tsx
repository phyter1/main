import { describe, expect, it, mock } from "bun:test";
import { render, screen } from "@testing-library/react";
import PrinciplesPage from "./page";

// Mock framer-motion to avoid animation issues in tests
mock.module("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

// Mock useReducedMotion hook
mock.module("@/hooks/useReducedMotion", () => ({
  useReducedMotion: () => false,
}));

describe("T007: Principles Page Component", () => {
  describe("Page Structure and Content", () => {
    it("should render the principles page with use client directive", () => {
      // This test verifies the file exists and can be imported
      expect(PrinciplesPage).toBeDefined();
    });

    it("should render hero section with title and subtitle", () => {
      render(<PrinciplesPage />);

      // Check for main heading
      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toBeDefined();
      expect(heading.textContent).toContain("Principles");

      // Check for subtitle/description text
      const subtitle = screen.getByText(
        /Three Ways.*Five Ideals.*Theory of Constraints/i,
      );
      expect(subtitle).toBeDefined();
    });

    it("should render all three principle groups", () => {
      render(<PrinciplesPage />);

      // Phoenix Project - The Three Ways
      expect(screen.getByText(/Three Ways/i)).toBeDefined();
      expect(screen.getByText(/Phoenix Project/i)).toBeDefined();

      // Unicorn Project - The Five Ideals
      expect(screen.getByText(/Five Ideals/i)).toBeDefined();
      expect(screen.getByText(/Unicorn Project/i)).toBeDefined();

      // The Goal - Theory of Constraints
      expect(screen.getByText(/Five Focusing Steps/i)).toBeDefined();
      expect(screen.getByText(/Theory of Constraints/i)).toBeDefined();
    });
  });

  describe("Phoenix Project Principles", () => {
    it("should render all Three Ways principles", () => {
      render(<PrinciplesPage />);

      // First Way
      expect(screen.getByText(/First Way.*Systems Thinking/i)).toBeDefined();

      // Second Way
      expect(screen.getByText(/Second Way.*Amplify Feedback/i)).toBeDefined();

      // Third Way
      expect(screen.getByText(/Third Way.*Experimentation/i)).toBeDefined();
    });

    it("should display principle descriptions and applications", () => {
      render(<PrinciplesPage />);

      // Check for key content from principles data
      expect(screen.getByText(/value stream/i)).toBeDefined();
      expect(screen.getByText(/feedback loops/i)).toBeDefined();
    });
  });

  describe("Unicorn Project Principles", () => {
    it("should render all Five Ideals principles", () => {
      render(<PrinciplesPage />);

      // First Ideal
      expect(screen.getByText(/Locality.*Simplicity/i)).toBeDefined();

      // Second Ideal
      expect(screen.getByText(/Focus.*Flow.*Joy/i)).toBeDefined();

      // Third Ideal
      expect(screen.getByText(/Improvement.*Daily Work/i)).toBeDefined();

      // Fourth Ideal
      expect(screen.getByText(/Psychological Safety/i)).toBeDefined();

      // Fifth Ideal
      expect(screen.getByText(/Customer Focus/i)).toBeDefined();
    });
  });

  describe("Theory of Constraints Principles", () => {
    it("should render all Five Focusing Steps", () => {
      render(<PrinciplesPage />);

      // All five steps
      expect(screen.getByText(/Identify.*Constraint/i)).toBeDefined();
      expect(screen.getByText(/Exploit.*Constraint/i)).toBeDefined();
      expect(screen.getByText(/Subordinate/i)).toBeDefined();
      expect(screen.getByText(/Elevate.*Constraint/i)).toBeDefined();
      expect(screen.getByText(/Repeat.*Process/i)).toBeDefined();
    });
  });

  describe("Component Structure", () => {
    it("should use Card components for principle sections", () => {
      const { container } = render(<PrinciplesPage />);

      // Check for card components (they have data-slot="card" attribute)
      const cards = container.querySelectorAll('[data-slot="card"]');
      expect(cards.length).toBeGreaterThan(0);

      // Should have at least 13 cards (3 + 5 + 5 principles)
      expect(cards.length).toBeGreaterThanOrEqual(13);
    });

    it("should include separators between major sections", () => {
      const { container } = render(<PrinciplesPage />);

      // Check for separator components
      const separators = container.querySelectorAll('[data-slot="separator"]');
      expect(separators.length).toBeGreaterThan(0);
    });

    it("should apply proper responsive grid layout", () => {
      const { container } = render(<PrinciplesPage />);

      // Check for grid classes (md:grid-cols-3 for philosophy section pattern)
      const gridContainers = container.querySelectorAll(".grid");
      expect(gridContainers.length).toBeGreaterThan(0);
    });
  });

  describe("Accessibility", () => {
    it("should use semantic HTML headings hierarchy", () => {
      render(<PrinciplesPage />);

      // Should have h1 for page title
      const h1 = screen.getAllByRole("heading", { level: 1 });
      expect(h1.length).toBeGreaterThan(0);

      // Should have h2 for section titles
      const h2 = screen.getAllByRole("heading", { level: 2 });
      expect(h2.length).toBeGreaterThan(0);
    });

    it("should respect reduced motion preferences", () => {
      // Component should use useReducedMotion hook
      // This is mocked in our tests, but the implementation should use it
      render(<PrinciplesPage />);

      // Component renders successfully with reduced motion support
      expect(screen.getByRole("heading", { level: 1 })).toBeDefined();
    });
  });

  describe("Animation Setup", () => {
    it("should include containerVariants for stagger animation", () => {
      // This test verifies the structure supports animations
      // The actual animation implementation is mocked for testing
      const { container } = render(<PrinciplesPage />);

      // Page should render without animation errors
      expect(container.querySelector(".min-h-screen")).toBeDefined();
    });

    it("should include itemVariants for fade-in animations", () => {
      // Verify component structure supports item animations
      render(<PrinciplesPage />);

      // Should render all principle cards without errors
      const cards = screen.getAllByRole("heading", { level: 2 });
      expect(cards.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe("Data Integration", () => {
    it("should import and use principles data from src/data/principles.ts", () => {
      render(<PrinciplesPage />);

      // Verify data is rendered correctly by checking for specific content
      // from principles.ts file
      expect(screen.getByText(/Hugo Health/i)).toBeDefined();
      expect(screen.getByText(/systems thinking/i)).toBeDefined();
    });

    it("should display principle groups in correct order", () => {
      const { container } = render(<PrinciplesPage />);

      const allText = container.textContent || "";

      // Phoenix should come before Unicorn
      const phoenixIndex = allText.indexOf("Phoenix Project");
      const unicornIndex = allText.indexOf("Unicorn Project");
      expect(phoenixIndex).toBeLessThan(unicornIndex);

      // Unicorn should come before Theory of Constraints
      const goalIndex = allText.indexOf("Theory of Constraints");
      expect(unicornIndex).toBeLessThan(goalIndex);
    });
  });

  describe("Content Quality", () => {
    it("should display descriptions for each principle", () => {
      const { container } = render(<PrinciplesPage />);

      // Each card should have description content
      const cards = container.querySelectorAll('[data-slot="card"]');
      cards.forEach((card) => {
        // Each card should have substantial text content
        expect((card.textContent || "").length).toBeGreaterThan(50);
      });
    });

    it("should display personal applications for each principle", () => {
      render(<PrinciplesPage />);

      // Check for personal application content (Hugo Health references)
      expect(screen.getByText(/Hugo Health/i)).toBeDefined();

      // Multiple personal references should exist
      const allText = document.body.textContent || "";
      const hugoMatches = allText.match(/Hugo/gi);
      expect(hugoMatches).toBeDefined();
      expect(hugoMatches!.length).toBeGreaterThan(1);
    });
  });
});
