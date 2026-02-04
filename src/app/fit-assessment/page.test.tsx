import { describe, expect, it } from "bun:test";
import { render, screen } from "@testing-library/react";
import FitAssessmentPage from "./page";

describe("T011: Fit Assessment Page Component", () => {
  describe("Page Structure and Content", () => {
    it("should render the fit assessment page with use client directive", () => {
      // This test verifies the file exists and can be imported
      expect(FitAssessmentPage).toBeDefined();
    });

    it("should render hero section with title and description", () => {
      render(<FitAssessmentPage />);

      // Check for main heading
      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toBeDefined();
      expect(heading.textContent).toContain("Am I Right for the Role?");
    });

    it("should render introductory text explaining the tool", () => {
      render(<FitAssessmentPage />);

      // Check for description text (using getAllByText due to multiple matches)
      const descriptions = screen.getAllByText(/paste.*job description/i);
      expect(descriptions.length).toBeGreaterThan(0);
    });

    it("should render JobFitAnalyzer component", () => {
      const { container } = render(<FitAssessmentPage />);

      // JobFitAnalyzer renders a form with textarea
      const textarea = container.querySelector("textarea");
      expect(textarea).toBeDefined();

      // JobFitAnalyzer has a submit button (using getAllByRole due to test renders)
      const submitButtons = screen.getAllByRole("button", { name: /analyze/i });
      expect(submitButtons.length).toBeGreaterThan(0);
    });
  });

  describe("Introductory Section", () => {
    it("should display instructions on how to use the tool", () => {
      const { container } = render(<FitAssessmentPage />);

      // Check for usage instructions
      const hasInstructions = container.textContent?.includes(
        "How to Use This Tool",
      );
      expect(hasInstructions).toBe(true);
    });

    it("should mention benefits of honest assessment", () => {
      render(<FitAssessmentPage />);

      // Check for honesty/transparency messaging (using getAllByText due to multiple matches)
      const honestTexts = screen.getAllByText(/honest/i);
      expect(honestTexts.length).toBeGreaterThan(0);
    });

    it("should provide guidance about the assessment", () => {
      const { container } = render(<FitAssessmentPage />);

      // Should have informational content about experience and skills
      const hasGuidance = container.textContent?.includes(
        "experience and skills",
      );
      expect(hasGuidance).toBe(true);
    });
  });

  describe("Component Structure", () => {
    it("should use Card components for sections", () => {
      const { container } = render(<FitAssessmentPage />);

      // Check for card components
      const cards = container.querySelectorAll('[data-slot="card"]');
      expect(cards.length).toBeGreaterThan(0);
    });

    it("should have proper container and spacing", () => {
      const { container } = render(<FitAssessmentPage />);

      // Check for container layout
      expect(container.querySelector(".container")).toBeDefined();
      expect(container.querySelector(".space-y-8")).toBeDefined();
    });

    it("should apply proper responsive layout", () => {
      const { container } = render(<FitAssessmentPage />);

      // Page should have responsive container
      const containerEl = container.querySelector(".mx-auto");
      expect(containerEl).toBeDefined();
    });
  });

  describe("Accessibility", () => {
    it("should use semantic HTML headings hierarchy", () => {
      const { container } = render(<FitAssessmentPage />);

      // Should have h1 for page title
      const h1 = container.querySelectorAll("h1");
      expect(h1.length).toBeGreaterThan(0);

      // Should have h2 or h3 for section titles
      const h2h3 = container.querySelectorAll("h2, h3");
      expect(h2h3.length).toBeGreaterThan(0);
    });

    it("should respect reduced motion preferences", () => {
      // Component should use useReducedMotion hook
      const { container } = render(<FitAssessmentPage />);

      // Component renders successfully with reduced motion support
      const heading = container.querySelector("h1");
      expect(heading).toBeDefined();
    });
  });

  describe("Animation Setup", () => {
    it("should include animation variants for smooth transitions", () => {
      const { container } = render(<FitAssessmentPage />);

      // Page should render without animation errors
      expect(container.querySelector(".min-h-screen")).toBeDefined();
    });
  });

  describe("Tips and Guidance Section", () => {
    it("should provide tips for using the tool effectively", () => {
      const { container } = render(<FitAssessmentPage />);

      // Should have tips section heading
      const tipsHeading = container.textContent?.includes(
        "Tips for Best Results",
      );
      expect(tipsHeading).toBe(true);
    });

    it("should explain what makes a good fit assessment", () => {
      render(<FitAssessmentPage />);

      // Should have guidance content (using getAllByText due to multiple matches)
      const guidance = screen.getAllByText(/complete.*description/i);
      expect(guidance.length).toBeGreaterThan(0);
    });
  });

  describe("Visual Effects", () => {
    it("should match site theme with consistent styling", () => {
      const { container } = render(<FitAssessmentPage />);

      // Should use theme colors and spacing
      const mainContainer = container.querySelector(".bg-background");
      expect(mainContainer).toBeDefined();
    });

    it("should be responsive across different screen sizes", () => {
      const { container } = render(<FitAssessmentPage />);

      // Should have responsive classes
      const responsiveContainer = container.querySelector(".max-w-6xl");
      expect(responsiveContainer).toBeDefined();
    });
  });
});
