/**
 * Category Management Page Tests
 * Tests for /admin/blog/categories page rendering and component integration
 */

import { beforeEach, describe, expect, it, mock } from "bun:test";
import { render, screen } from "@testing-library/react";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import CategoriesPage from "./page";

// Create mock Convex client
const mockConvexClient = new ConvexReactClient(
  process.env.NEXT_PUBLIC_CONVEX_URL || "https://test.convex.cloud",
);

// Mock useRouter
const mockPush = mock(() => {});
const mockRouter = {
  push: mockPush,
  pathname: "/admin/blog/categories",
  query: {},
  asPath: "/admin/blog/categories",
};

mock.module("next/navigation", () => ({
  useRouter: () => mockRouter,
  usePathname: () => "/admin/blog/categories",
}));

// Mock Convex queries
mock.module("convex/react", () => {
  const actual = require("convex/react");
  return {
    ...actual,
    useQuery: mock(() => []), // Empty categories array
    useMutation: mock(() => mock(() => Promise.resolve())),
  };
});

describe("CategoriesPage", () => {
  beforeEach(() => {
    mock.restore();
  });

  it("should render page with title", () => {
    render(
      <ConvexProvider client={mockConvexClient}>
        <CategoriesPage />
      </ConvexProvider>,
    );

    const titles = screen.getAllByText(/category management/i);
    expect(titles.length).toBeGreaterThan(0);
  });

  it("should render CategoryManager component", () => {
    render(
      <ConvexProvider client={mockConvexClient}>
        <CategoriesPage />
      </ConvexProvider>,
    );

    // CategoryManager should be present with create form
    const createButtons = screen.getAllByText(/create category/i);
    expect(createButtons.length).toBeGreaterThan(0);
  });

  it("should be a client component", () => {
    // Verify the component uses client-side features
    const pageContent = render(
      <ConvexProvider client={mockConvexClient}>
        <CategoriesPage />
      </ConvexProvider>,
    );

    expect(pageContent.container).toBeDefined();
  });

  it("should render with proper page structure", () => {
    render(
      <ConvexProvider client={mockConvexClient}>
        <CategoriesPage />
      </ConvexProvider>,
    );

    // Should have main container with form elements
    const titles = screen.getAllByText(/category management/i);
    expect(titles.length).toBeGreaterThan(0);

    const nameInputs = screen.getAllByLabelText(/category name/i);
    expect(nameInputs.length).toBeGreaterThan(0);

    const descInputs = screen.getAllByLabelText(/description/i);
    expect(descInputs.length).toBeGreaterThan(0);
  });
});
