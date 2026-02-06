import { describe, expect, it } from "bun:test";
import { render, screen } from "@testing-library/react";
import { AIFeatureCards } from "./AIFeatureCards";

describe("AIFeatureCards", () => {
  describe("Rendering", () => {
    it("should render both AI feature cards", () => {
      const { container } = render(<AIFeatureCards />);

      const cards = container.querySelectorAll('[data-slot="card"]');
      expect(cards.length).toBe(2);

      expect(screen.getByText("AI Assistant")).toBeDefined();
      expect(screen.getByText("Job Fit Analyzer")).toBeDefined();
    });

    it("should render chat assistant card with correct content", () => {
      render(<AIFeatureCards />);

      const chatDescriptions = screen.getAllByText(/Chat with an AI trained/i);
      expect(chatDescriptions.length).toBeGreaterThan(0);

      const chatButtons = screen.getAllByRole("link", {
        name: /Start Conversation/i,
      });
      expect(chatButtons.length).toBeGreaterThan(0);
      expect(chatButtons[0]?.getAttribute("href")).toBe("/chat");
    });

    it("should render job fit analyzer card with correct content", () => {
      render(<AIFeatureCards />);

      const fitDescriptions = screen.getAllByText(/Get an honest AI-powered/i);
      expect(fitDescriptions.length).toBeGreaterThan(0);

      const fitButtons = screen.getAllByRole("link", { name: /Analyze Fit/i });
      expect(fitButtons.length).toBeGreaterThan(0);
      expect(fitButtons[0]?.getAttribute("href")).toBe("/fit-assessment");
    });
  });

  describe("Vibrant Color Enhancements (T014)", () => {
    it("should apply accent-vibrant hover border classes to chat card", () => {
      const { container } = render(<AIFeatureCards />);

      const cards = container.querySelectorAll('[data-slot="card"]');
      const chatCard = cards[0]; // First card is chat

      expect(chatCard?.className).toContain("hover:border-accent-vibrant/60");
      expect(chatCard?.className).toContain("hover:shadow-xl");
      expect(chatCard?.className).toContain("hover:shadow-accent-vibrant/10");
    });

    it("should apply accent-vibrant hover border classes to fit analyzer card", () => {
      const { container } = render(<AIFeatureCards />);

      const cards = container.querySelectorAll('[data-slot="card"]');
      const fitCard = cards[1]; // Second card is fit analyzer

      expect(fitCard?.className).toContain("hover:border-accent-vibrant/60");
      expect(fitCard?.className).toContain("hover:shadow-xl");
      expect(fitCard?.className).toContain("hover:shadow-accent-vibrant/10");
    });

    it("should apply text-accent-vibrant to chat icon", () => {
      const { container } = render(<AIFeatureCards />);

      const cards = container.querySelectorAll('[data-slot="card"]');
      const chatCard = cards[0];
      const icon = chatCard?.querySelector("svg");

      expect(icon?.className).toContain("text-accent-vibrant");
      expect(icon?.className).toContain("group-hover:scale-110");
      expect(icon?.className).toContain("transition-transform");
      expect(icon?.className).toContain("duration-200");
    });

    it("should apply text-accent-vibrant to job fit icon", () => {
      const { container } = render(<AIFeatureCards />);

      const cards = container.querySelectorAll('[data-slot="card"]');
      const fitCard = cards[1];
      const icon = fitCard?.querySelector("svg");

      expect(icon?.className).toContain("text-accent-vibrant");
      expect(icon?.className).toContain("group-hover:scale-110");
      expect(icon?.className).toContain("transition-transform");
      expect(icon?.className).toContain("duration-200");
    });

    it("should use vibrant variant for chat button", () => {
      render(<AIFeatureCards />);

      const chatButtons = screen.getAllByRole("link", {
        name: /Start Conversation/i,
      });

      expect(chatButtons[0]?.getAttribute("data-variant")).toBe("vibrant");
    });

    it("should use vibrant variant for fit analyzer button", () => {
      render(<AIFeatureCards />);

      const fitButtons = screen.getAllByRole("link", { name: /Analyze Fit/i });

      expect(fitButtons[0]?.getAttribute("data-variant")).toBe("vibrant");
    });
  });

  describe("Responsive Layout", () => {
    it("should have responsive grid classes", () => {
      const { container } = render(<AIFeatureCards />);

      const gridContainer = container.querySelector(".grid");
      expect(gridContainer?.className).toContain("md:grid-cols-2");
      expect(gridContainer?.className).toContain("gap-4");
    });

    it("should have centered layout with max-width", () => {
      const { container } = render(<AIFeatureCards />);

      const gridContainer = container.querySelector(".grid");
      expect(gridContainer?.className).toContain("mx-auto");
      expect(gridContainer?.className).toContain("max-w-3xl");
    });
  });

  describe("Accessibility", () => {
    it("should have proper link semantics for chat button", () => {
      render(<AIFeatureCards />);

      const chatButtons = screen.getAllByRole("link", {
        name: /Start Conversation/i,
      });
      expect(chatButtons[0]?.tagName).toBe("A");
    });

    it("should have proper link semantics for fit analyzer button", () => {
      render(<AIFeatureCards />);

      const fitButtons = screen.getAllByRole("link", { name: /Analyze Fit/i });
      expect(fitButtons[0]?.tagName).toBe("A");
    });

    it("should have descriptive text for both cards", () => {
      render(<AIFeatureCards />);

      const chatDescriptions = screen.getAllByText(/Chat with an AI trained/i);
      expect(chatDescriptions.length).toBeGreaterThan(0);

      const fitDescriptions = screen.getAllByText(/Get an honest AI-powered/i);
      expect(fitDescriptions.length).toBeGreaterThan(0);
    });
  });

  describe("Animation Support", () => {
    it("should accept and apply motion variants", () => {
      const testVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
      };

      const { container } = render(<AIFeatureCards variants={testVariants} />);

      const motionDiv = container.firstChild;
      expect(motionDiv).toBeDefined();
    });

    it("should render without variants prop", () => {
      const { container } = render(<AIFeatureCards />);

      expect(container.firstChild).toBeDefined();
    });
  });
});
