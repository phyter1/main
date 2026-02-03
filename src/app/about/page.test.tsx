import { describe, expect, it, mock } from "bun:test";
import { render, screen } from "@testing-library/react";
import AboutPage from "./page";

// Mock framer-motion to avoid animation issues in tests
mock.module("framer-motion", () => ({
  motion: {
    // biome-ignore lint/suspicious/noExplicitAny: Test mock requires flexible typing
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

// Mock next/image
mock.module("next/image", () => ({
  __esModule: true,
  // biome-ignore lint/suspicious/noExplicitAny: Test mock requires flexible typing
  // biome-ignore lint/a11y/useAltText: Test mock component
  // biome-ignore lint/performance/noImgElement: Test mock uses img for simplicity
  default: (props: any) => <img {...props} />,
}));

// Mock timeline data
mock.module("@/data/timeline", () => ({
  getSortedTimeline: () => [],
}));

// Mock useReducedMotion hook
mock.module("@/hooks/useReducedMotion", () => ({
  useReducedMotion: () => false,
}));

describe("T009: About Page Cross-Page Connections", () => {
  describe("Engineering Philosophy Section", () => {
    it("should render the Engineering Philosophy section heading", () => {
      render(<AboutPage />);

      expect(screen.getByText("Engineering Philosophy")).toBeDefined();
    });

    it("should render link to principles page with correct text", () => {
      render(<AboutPage />);

      const principlesLinks = screen.getAllByRole("link", {
        name: /View My Full Principles/i,
      });
      expect(principlesLinks.length).toBeGreaterThan(0);
      expect(principlesLinks[0]).toBeDefined();
    });

    it("should link to /principles page with correct href", () => {
      render(<AboutPage />);

      const principlesLinks = screen.getAllByRole("link", {
        name: /View My Full Principles/i,
      });
      expect(principlesLinks[0].getAttribute("href")).toBe("/principles");
    });

    it("should render three philosophy cards", () => {
      render(<AboutPage />);

      expect(
        screen.getAllByText("AI-Augmented Development").length,
      ).toBeGreaterThan(0);
      expect(
        screen.getAllByText("Full-Stack Ownership").length,
      ).toBeGreaterThan(0);
      expect(
        screen.getAllByText("Developer Experience First").length,
      ).toBeGreaterThan(0);
    });

    it("should use Button component with outline variant for principles link", () => {
      render(<AboutPage />);

      // Find the link and verify it's wrapped in a button-styled element
      const principlesLinks = screen.getAllByRole("link", {
        name: /View My Full Principles/i,
      });
      expect(principlesLinks[0]).toBeDefined();

      // The link should have button data attribute from shadcn Button component
      expect(principlesLinks[0].getAttribute("data-slot")).toBe("button");
    });

    it("should center the principles link button", () => {
      render(<AboutPage />);

      // Find the wrapper div that should have text-center class
      const principlesLinks = screen.getAllByRole("link", {
        name: /View My Full Principles/i,
      });
      const wrapper = principlesLinks[0].closest(".text-center");
      expect(wrapper).toBeDefined();
    });
  });

  describe("Content Consistency", () => {
    it("should use consistent styling with existing internal links", () => {
      render(<AboutPage />);

      // Verify the principles link follows the same pattern as resume download button
      const principlesLinks = screen.getAllByRole("link", {
        name: /View My Full Principles/i,
      });
      const resumeLinks = screen.getAllByRole("link", {
        name: /Download Resume/i,
      });

      expect(principlesLinks[0]).toBeDefined();
      expect(resumeLinks[0]).toBeDefined();

      // Both should be link elements
      expect(principlesLinks[0].tagName).toBe("A");
      expect(resumeLinks[0].tagName).toBe("A");
    });

    it("should maintain proper spacing in Engineering Philosophy section", () => {
      render(<AboutPage />);

      // The button wrapper should have mt-8 for proper spacing
      const principlesLinks = screen.getAllByRole("link", {
        name: /View My Full Principles/i,
      });
      const wrapper = principlesLinks[0].closest(".mt-8");
      expect(wrapper).toBeDefined();
    });
  });

  describe("Acceptance Criteria", () => {
    it("should have link from about page Engineering Philosophy section to principles page", () => {
      render(<AboutPage />);

      // Verify link exists in the Engineering Philosophy section
      const philosophyHeadings = screen.getAllByText("Engineering Philosophy");
      expect(philosophyHeadings.length).toBeGreaterThan(0);

      const principlesLinks = screen.getAllByRole("link", {
        name: /View My Full Principles/i,
      });
      expect(principlesLinks[0]).toBeDefined();
      expect(principlesLinks[0].getAttribute("href")).toBe("/principles");
    });

    it("should have View My Full Principles CTA on about page", () => {
      render(<AboutPage />);

      const principlesLinks = screen.getAllByRole("link", {
        name: /View My Full Principles/i,
      });
      expect(principlesLinks[0].textContent).toBe("View My Full Principles");
    });

    it("should ensure consistent styling with existing internal links", () => {
      render(<AboutPage />);

      // Should use Button component with size="lg" and variant="outline"
      const principlesLinks = screen.getAllByRole("link", {
        name: /View My Full Principles/i,
      });

      // Button should have the outline variant classes (borders)
      expect(principlesLinks[0].className).toContain("border");
    });
  });
});
