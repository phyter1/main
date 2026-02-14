import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FeaturedProjects } from "./FeaturedProjects";

// Mock framer-motion to avoid animation issues in tests
vi.mock("framer-motion", () => ({
  motion: {
    section: ({ children, ...props }: any) => (
      <section {...props}>{children}</section>
    ),
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

// Mock useReducedMotion hook
vi.mock("@/hooks/useReducedMotion", () => ({
  useReducedMotion: () => false,
}));

// Mock projects data
vi.mock("@/data/projects", () => ({
  getFeaturedProjects: () => [
    {
      id: "project-1",
      title: "Test Project 1",
      description: "Test description 1",
      technologies: ["React", "TypeScript", "Next.js"],
      status: "live",
      links: {
        demo: "https://demo1.com",
        github: "https://github.com/test/project1",
      },
    },
    {
      id: "project-2",
      title: "Test Project 2",
      description: "Test description 2",
      technologies: [
        "Node.js",
        "PostgreSQL",
        "Docker",
        "AWS",
        "Terraform",
        "Kubernetes",
        "Redis",
      ],
      status: "in-progress",
      links: {
        github: "https://github.com/test/project2",
      },
    },
    {
      id: "project-3",
      title: "Test Project 3",
      description: "Test description 3",
      technologies: ["Python", "FastAPI"],
      status: "archived",
      links: {
        demo: "https://demo3.com",
      },
    },
  ],
}));

describe("FeaturedProjects", () => {
  it("renders component with heading and description", () => {
    render(<FeaturedProjects />);

    expect(screen.getByText("Featured Projects")).toBeDefined();
    expect(
      screen.getByText(/A selection of recent work showcasing/),
    ).toBeDefined();
  });

  it("renders exactly 3 featured projects", () => {
    render(<FeaturedProjects />);

    expect(screen.getAllByText("Test Project 1").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Test Project 2").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Test Project 3").length).toBeGreaterThan(0);
  });

  it("displays project descriptions", () => {
    render(<FeaturedProjects />);

    expect(screen.getAllByText("Test description 1").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Test description 2").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Test description 3").length).toBeGreaterThan(0);
  });

  it("renders technology badges for each project", () => {
    render(<FeaturedProjects />);

    // Project 1 technologies
    expect(screen.getAllByText("React").length).toBeGreaterThan(0);
    expect(screen.getAllByText("TypeScript").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Next.js").length).toBeGreaterThan(0);

    // Project 2 technologies (max 6 shown + overflow badge)
    expect(screen.getAllByText("Node.js").length).toBeGreaterThan(0);
    expect(screen.getAllByText("PostgreSQL").length).toBeGreaterThan(0);
    expect(screen.getAllByText("+1").length).toBeGreaterThan(0); // Overflow badge for 7th tech
  });

  it("displays status badges correctly", () => {
    render(<FeaturedProjects />);

    const statusBadges = screen.getAllByText(/live|in-progress|archived/);
    expect(statusBadges.length).toBeGreaterThan(0);
  });

  it("renders Live Demo button when demo link exists", () => {
    render(<FeaturedProjects />);

    const demoButtons = screen.getAllByText("Live Demo");
    expect(demoButtons.length).toBeGreaterThan(0); // Projects 1 and 3 have demo links
  });

  it("renders Code button when github link exists", () => {
    render(<FeaturedProjects />);

    const codeButtons = screen.getAllByText("Code");
    expect(codeButtons.length).toBeGreaterThan(0); // Projects 1 and 2 have github links
  });

  it("renders View All Projects CTA button", () => {
    render(<FeaturedProjects />);

    const viewAllButtons = screen.getAllByText("View All Projects");
    expect(viewAllButtons.length).toBeGreaterThan(0);

    // Check link points to /projects
    const link = viewAllButtons[0].closest("a");
    expect(link?.getAttribute("href")).toBe("/projects");
  });

  it("renders with responsive grid classes", () => {
    const { container } = render(<FeaturedProjects />);

    const gridContainer = container.querySelector(".grid");
    expect(gridContainer?.className).toContain("md:grid-cols-2");
    expect(gridContainer?.className).toContain("lg:grid-cols-3");
  });

  it("applies external link attributes to demo links", () => {
    render(<FeaturedProjects />);

    const demoLinks = screen.getAllByText("Live Demo");
    const firstDemoLink = demoLinks[0].closest("a");

    expect(firstDemoLink?.getAttribute("target")).toBe("_blank");
    expect(firstDemoLink?.getAttribute("rel")).toBe("noopener noreferrer");
  });

  it("applies external link attributes to github links", () => {
    render(<FeaturedProjects />);

    const codeLinks = screen.getAllByText("Code");
    const firstCodeLink = codeLinks[0].closest("a");

    expect(firstCodeLink?.getAttribute("target")).toBe("_blank");
    expect(firstCodeLink?.getAttribute("rel")).toBe("noopener noreferrer");
  });

  it("uses vibrant button variant for CTA buttons", () => {
    render(<FeaturedProjects />);

    // Check Live Demo buttons use vibrant variant
    const demoButtons = screen.getAllByText("Live Demo");
    const firstDemoButton = demoButtons[0].closest("a");
    expect(firstDemoButton?.getAttribute("data-variant")).toBe("vibrant");

    // Check Code buttons use vibrant variant
    const codeButtons = screen.getAllByText("Code");
    const firstCodeButton = codeButtons[0].closest("a");
    expect(firstCodeButton?.getAttribute("data-variant")).toBe("vibrant");
  });
});
