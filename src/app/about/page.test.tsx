import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AboutPage from "./page";

// Mock next/image
vi.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}));

// Mock timeline data
vi.mock("@/data/timeline", () => ({
  getSortedTimeline: () => [],
}));

// Mock SkillsMatrix component
vi.mock("@/components/sections/SkillsMatrix", () => ({
  SkillsMatrix: () => (
    <div data-testid="skills-matrix">
      <h3>Strong</h3>
      <h3>Moderate</h3>
      <h3>Gaps</h3>
    </div>
  ),
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
        screen.getAllByText("AI-First, Agentic Development").length,
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

  describe("T012: Skills & Expertise Section with SkillsMatrix", () => {
    it("should render the Skills & Expertise section heading", () => {
      render(<AboutPage />);

      const headings = screen.getAllByText("Skills & Expertise");
      expect(headings.length).toBeGreaterThan(0);
    });

    it("should have explanatory subheading about honest self-assessment", () => {
      render(<AboutPage />);

      const subheadings = screen.getAllByText(/honest self-assessment/i);
      expect(subheadings.length).toBeGreaterThan(0);
      expect(subheadings[0].textContent).toContain(
        "strengths and areas for growth",
      );
    });

    it("should render SkillsMatrix component", () => {
      render(<AboutPage />);

      const skillsMatrices = screen.getAllByTestId("skills-matrix");
      expect(skillsMatrices.length).toBeGreaterThan(0);
    });

    it("should have SkillsMatrix with all three columns", () => {
      render(<AboutPage />);

      const skillsMatrices = screen.getAllByTestId("skills-matrix");
      expect(skillsMatrices[0].textContent).toContain("Strong");
      expect(skillsMatrices[0].textContent).toContain("Moderate");
      expect(skillsMatrices[0].textContent).toContain("Gaps");
    });

    it("should center the Skills & Expertise heading", () => {
      render(<AboutPage />);

      const headings = screen.getAllByText("Skills & Expertise");
      expect(headings[0].className).toContain("text-center");
    });

    it("should position Skills & Expertise section before Career Timeline", () => {
      render(<AboutPage />);

      const skillsHeadings = screen.getAllByText("Skills & Expertise");
      const timelineHeadings = screen.getAllByText("Career Timeline");

      expect(skillsHeadings.length).toBeGreaterThan(0);
      expect(timelineHeadings.length).toBeGreaterThan(0);

      // Both should be h2 elements at the same heading level
      expect(skillsHeadings[0].tagName).toBe("H2");
      expect(timelineHeadings[0].tagName).toBe("H2");
    });

    it("should match existing page section styling", () => {
      render(<AboutPage />);

      const headings = screen.getAllByText("Skills & Expertise");
      const skillsHeading = headings[0];

      // Should use consistent heading styles
      expect(skillsHeading.className).toContain("text-3xl");
      expect(skillsHeading.className).toContain("font-bold");
      expect(skillsHeading.className).toContain("text-foreground");
    });

    it("should have proper spacing between sections", () => {
      render(<AboutPage />);

      const headings = screen.getAllByText("Skills & Expertise");
      const wrapper = headings[0].closest('[class*="mb-"]');

      expect(wrapper).toBeDefined();
    });
  });
});
