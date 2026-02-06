import { render, screen } from "@testing-library/react";
import { describe, expect, it, mock } from "bun:test";
import Home from "./page";

// Mock framer-motion to avoid animation issues in tests
mock.module("framer-motion", () => ({
  motion: {
    section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  },
}));

// Mock useReducedMotion hook
mock.module("@/hooks/useReducedMotion", () => ({
  useReducedMotion: () => false,
}));

// Mock visual effects components
mock.module("@/components/effects/CursorGlow", () => ({
  CursorGlow: () => <div data-testid="cursor-glow" />,
}));

mock.module("@/components/effects/GrainOverlay", () => ({
  GrainOverlay: () => <div data-testid="grain-overlay" />,
}));

// Mock Hero component
mock.module("@/components/sections/Hero", () => ({
  Hero: () => (
    <section data-testid="hero-section">
      <h1>Tech Lead AI-First Development</h1>
      <button>View My Work</button>
      <button>Let's Connect</button>
    </section>
  ),
}));

// Mock FeaturedProjects component
mock.module("@/components/sections/FeaturedProjects", () => ({
  FeaturedProjects: () => (
    <section data-testid="featured-projects">
      <h2>Featured Projects</h2>
      <p>A selection of recent work showcasing full-stack development</p>
      <button>View All Projects</button>
    </section>
  ),
}));

// Mock PrinciplesPreview component
mock.module("@/components/sections/PrinciplesPreview", () => ({
  PrinciplesPreview: () => (
    <section data-testid="principles-preview">
      <h2>Engineering Principles</h2>
      <p>Core principles from The Phoenix Project</p>
      <button>Learn More</button>
    </section>
  ),
}));

describe("Home Page", () => {
  it("renders all main sections", () => {
    const { container } = render(<Home />);

    // Check for all test IDs
    expect(screen.getByTestId("grain-overlay")).toBeDefined();
    expect(screen.getByTestId("cursor-glow")).toBeDefined();
    expect(screen.getByTestId("hero-section")).toBeDefined();
    expect(screen.getByTestId("featured-projects")).toBeDefined();
    expect(screen.getByTestId("principles-preview")).toBeDefined();

    // Check for key text
    expect(screen.getByText("Tech Lead AI-First Development")).toBeDefined();
    expect(screen.getByText("Featured Projects")).toBeDefined();
    expect(screen.getByText("Engineering Principles")).toBeDefined();
  });

  it("renders all CTA buttons", () => {
    render(<Home />);

    // Hero CTAs
    expect(screen.getByText("View My Work")).toBeDefined();
    expect(screen.getByText("Let's Connect")).toBeDefined();

    // Featured Projects CTA
    expect(screen.getByText("View All Projects")).toBeDefined();

    // Principles CTA
    expect(screen.getByText("Learn More")).toBeDefined();
  });

  it("has proper semantic structure", () => {
    const { container } = render(<Home />);

    // Should have multiple sections
    const sections = container.querySelectorAll("section");
    expect(sections.length).toBeGreaterThanOrEqual(3);

    // Should have heading elements
    const headings = container.querySelectorAll("h1, h2");
    expect(headings.length).toBeGreaterThanOrEqual(3);
  });
});
