import { render, screen } from "@testing-library/react";
import type React from "react";
import { describe, expect, it, vi } from "vitest";
import Home from "./page";

// Mock framer-motion to avoid animation issues in tests
vi.mock("framer-motion", () => ({
  motion: {
    section: ({ children, ...props }: React.PropsWithChildren<object>) => (
      <section {...props}>{children}</section>
    ),
    div: ({ children, ...props }: React.PropsWithChildren<object>) => (
      <div {...props}>{children}</div>
    ),
    h1: ({ children, ...props }: React.PropsWithChildren<object>) => (
      <h1 {...props}>{children}</h1>
    ),
    p: ({ children, ...props }: React.PropsWithChildren<object>) => (
      <p {...props}>{children}</p>
    ),
  },
}));

// Mock useReducedMotion hook
vi.mock("@/hooks/useReducedMotion", () => ({
  useReducedMotion: () => false,
}));

// Mock visual effects components
vi.mock("@/components/effects/CursorGlow", () => ({
  CursorGlow: () => <div data-testid="cursor-glow" />,
}));

vi.mock("@/components/effects/GrainOverlay", () => ({
  GrainOverlay: () => <div data-testid="grain-overlay" />,
}));

// Mock Hero component
vi.mock("@/components/sections/Hero", () => ({
  Hero: () => (
    <section data-testid="hero-section">
      <h1>Tech Lead AI-First Development</h1>
      <button type="button">View My Work</button>
      <button type="button">Let's Connect</button>
      <button type="button">Start Conversation</button>
      <button type="button">Analyze Fit</button>
    </section>
  ),
}));

// Mock FeaturedProjects component
vi.mock("@/components/sections/FeaturedProjects", () => ({
  FeaturedProjects: () => (
    <section data-testid="featured-projects">
      <h2>Featured Projects</h2>
      <p>A selection of recent work showcasing full-stack development</p>
      <button type="button">View All Projects</button>
    </section>
  ),
}));

// Mock PrinciplesPreview component
vi.mock("@/components/sections/PrinciplesPreview", () => ({
  PrinciplesPreview: () => (
    <section data-testid="principles-preview">
      <h2>Engineering Principles</h2>
      <p>Core principles from The Phoenix Project</p>
      <button type="button">Learn More</button>
    </section>
  ),
}));

describe("Home Page", () => {
  it("renders all main sections", () => {
    render(<Home />);

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
    const viewMyWorkButtons = screen.getAllByText("View My Work");
    expect(viewMyWorkButtons.length).toBeGreaterThan(0);

    const connectButtons = screen.getAllByText("Let's Connect");
    expect(connectButtons.length).toBeGreaterThan(0);

    // AI Feature CTAs
    const startConversationButtons = screen.getAllByText("Start Conversation");
    expect(startConversationButtons.length).toBeGreaterThan(0);

    const analyzeFitButtons = screen.getAllByText("Analyze Fit");
    expect(analyzeFitButtons.length).toBeGreaterThan(0);

    // Featured Projects CTA
    const viewAllButtons = screen.getAllByText("View All Projects");
    expect(viewAllButtons.length).toBeGreaterThan(0);

    // Principles CTA
    const learnMoreButtons = screen.getAllByText("Learn More");
    expect(learnMoreButtons.length).toBeGreaterThan(0);
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
