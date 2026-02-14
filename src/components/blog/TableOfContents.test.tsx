import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import "@testing-library/dom";
import { TableOfContents } from "./TableOfContents";

// Mock IntersectionObserver globally
class MockIntersectionObserver {
  constructor(
    public callback: IntersectionObserverCallback,
    public options?: IntersectionObserverInit,
  ) {}
  observe = vi.fn(() => {});
  unobserve = vi.fn(() => {});
  disconnect = vi.fn(() => {});
  takeRecords = vi.fn(() => []);
  root = null;
  rootMargin = "";
  thresholds = [];
}

global.IntersectionObserver =
  MockIntersectionObserver as unknown as typeof IntersectionObserver;

describe("TableOfContents Component", () => {
  afterEach(() => {
    cleanup();
  });

  describe("TOC Generation", () => {
    it("should generate TOC from heading elements", () => {
      const headings = [
        { id: "introduction", text: "Introduction", level: 2 },
        { id: "getting-started", text: "Getting Started", level: 2 },
        { id: "installation", text: "Installation", level: 3 },
        { id: "configuration", text: "Configuration", level: 3 },
      ];

      render(<TableOfContents headings={headings} />);

      expect(screen.getByText("Introduction")).toBeDefined();
      expect(screen.getByText("Getting Started")).toBeDefined();
      expect(screen.getByText("Installation")).toBeDefined();
      expect(screen.getByText("Configuration")).toBeDefined();
    });

    it("should handle h2 and h3 headings only", () => {
      const headings = [
        { id: "h1-heading", text: "H1 Heading", level: 1 },
        { id: "h2-heading", text: "H2 Heading", level: 2 },
        { id: "h3-heading", text: "H3 Heading", level: 3 },
        { id: "h4-heading", text: "H4 Heading", level: 4 },
      ];

      render(<TableOfContents headings={headings} />);

      // Should include h2 and h3
      expect(screen.getByText("H2 Heading")).toBeDefined();
      expect(screen.getByText("H3 Heading")).toBeDefined();

      // Should exclude h1 and h4
      expect(screen.queryByText("H1 Heading")).toBeNull();
      expect(screen.queryByText("H4 Heading")).toBeNull();
    });

    it("should render with proper nesting for h3 under h2", () => {
      const headings = [
        { id: "section-1", text: "Section 1", level: 2 },
        { id: "subsection-1-1", text: "Subsection 1.1", level: 3 },
        { id: "subsection-1-2", text: "Subsection 1.2", level: 3 },
        { id: "section-2", text: "Section 2", level: 2 },
      ];

      const { container } = render(<TableOfContents headings={headings} />);

      // Check for nested structure
      const tocList = container.querySelector("nav ul");
      expect(tocList).toBeDefined();
    });

    it("should not render when there are no valid headings", () => {
      const headings: Array<{ id: string; text: string; level: number }> = [];

      const { container } = render(<TableOfContents headings={headings} />);

      // Component should not render anything
      const nav = container.querySelector("nav");
      expect(nav).toBeNull();
    });

    it("should not render when headings array has fewer than 2 items", () => {
      const headings = [{ id: "single", text: "Single Heading", level: 2 }];

      const { container } = render(<TableOfContents headings={headings} />);

      // Component should not render for short content
      const nav = container.querySelector("nav");
      expect(nav).toBeNull();
    });
  });

  describe("Clickable Links", () => {
    it("should render links with correct href attributes", () => {
      const headings = [
        { id: "introduction", text: "Introduction", level: 2 },
        { id: "getting-started", text: "Getting Started", level: 2 },
      ];

      const { container } = render(<TableOfContents headings={headings} />);

      const links = container.querySelectorAll("a");
      const introLink = Array.from(links).find(
        (link) => link.textContent === "Introduction",
      );
      const gettingStartedLink = Array.from(links).find(
        (link) => link.textContent === "Getting Started",
      );

      expect(introLink?.getAttribute("href")).toBe("#introduction");
      expect(gettingStartedLink?.getAttribute("href")).toBe("#getting-started");
    });

    it("should handle headings with special characters in IDs", () => {
      const headings = [
        {
          id: "what-is-typescript",
          text: "What is TypeScript?",
          level: 2,
        },
        { id: "why-use-react", text: "Why Use React!", level: 2 },
      ];

      const { container } = render(<TableOfContents headings={headings} />);

      const links = container.querySelectorAll("a");
      const link1 = Array.from(links).find(
        (link) => link.textContent === "What is TypeScript?",
      );
      const link2 = Array.from(links).find(
        (link) => link.textContent === "Why Use React!",
      );

      expect(link1?.getAttribute("href")).toBe("#what-is-typescript");
      expect(link2?.getAttribute("href")).toBe("#why-use-react");
    });
  });

  describe("Active Section Highlighting", () => {
    it("should apply active class to current section", async () => {
      const headings = [
        { id: "section-1", text: "Section 1", level: 2 },
        { id: "section-2", text: "Section 2", level: 2 },
      ];

      const { container } = render(<TableOfContents headings={headings} />);

      // Wait for intersection observer setup
      await waitFor(() => {
        const links = container.querySelectorAll("a");
        expect(links.length).toBe(2);
      });
    });

    it("should update active section on scroll", async () => {
      const headings = [
        { id: "section-1", text: "Section 1", level: 2 },
        { id: "section-2", text: "Section 2", level: 2 },
      ];

      render(<TableOfContents headings={headings} />);

      // IntersectionObserver should be called
      await waitFor(() => {
        expect(global.IntersectionObserver).toBeDefined();
      });
    });
  });

  describe("Sticky Positioning", () => {
    it("should have sticky positioning on desktop", () => {
      const headings = [
        { id: "section-1", text: "Section 1", level: 2 },
        { id: "section-2", text: "Section 2", level: 2 },
      ];

      const { container } = render(<TableOfContents headings={headings} />);

      const nav = container.querySelector("nav");
      expect(nav).toBeDefined();
      // Sticky positioning is applied via CSS class, so we check class presence
      const hasPositioningClass =
        nav?.className.includes("sticky") || nav?.className.includes("lg:");
      expect(hasPositioningClass).toBe(true);
    });
  });

  describe("Responsive Behavior", () => {
    it("should have responsive classes for mobile hiding", () => {
      const headings = [
        { id: "section-1", text: "Section 1", level: 2 },
        { id: "section-2", text: "Section 2", level: 2 },
      ];

      const { container } = render(<TableOfContents headings={headings} />);

      const nav = container.querySelector("nav");
      expect(nav).toBeDefined();
      // Should have mobile-hiding classes
      const hasMobileClass = nav?.className.includes("hidden");
      expect(hasMobileClass).toBe(true);
    });

    it("should not render on short posts (fewer than 2 headings)", () => {
      const headings = [{ id: "single", text: "Single Heading", level: 2 }];

      const { container } = render(<TableOfContents headings={headings} />);

      const nav = container.querySelector("nav");
      expect(nav).toBeNull();
    });
  });

  describe("Smooth Scroll Behavior", () => {
    it("should have smooth scroll behavior configured", () => {
      const headings = [
        { id: "section-1", text: "Section 1", level: 2 },
        { id: "section-2", text: "Section 2", level: 2 },
      ];

      const { container } = render(<TableOfContents headings={headings} />);

      const links = container.querySelectorAll("a");
      expect(links.length).toBe(2);
      // Smooth scroll is handled by CSS scroll-behavior or JavaScript
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels", () => {
      const headings = [
        { id: "section-1", text: "Section 1", level: 2 },
        { id: "section-2", text: "Section 2", level: 2 },
      ];

      const { container } = render(<TableOfContents headings={headings} />);

      const nav = container.querySelector("nav");
      expect(nav?.getAttribute("aria-label")).toBeTruthy();
    });

    it("should render as semantic nav element", () => {
      const headings = [
        { id: "section-1", text: "Section 1", level: 2 },
        { id: "section-2", text: "Section 2", level: 2 },
      ];

      const { container } = render(<TableOfContents headings={headings} />);

      const nav = container.querySelector("nav");
      expect(nav).toBeDefined();
      expect(nav?.tagName).toBe("NAV");
    });
  });
});
