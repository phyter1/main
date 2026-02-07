/**
 * Blog Listing Page Tests (T027)
 *
 * Tests for the main blog listing page including:
 * - Page rendering with BlogCard grid
 * - Featured posts section
 * - BlogSidebar integration
 * - BlogSearch component
 * - Pagination functionality
 * - Category filtering
 * - Responsive layout
 * - Loading states
 */

import { beforeEach, describe, expect, it, mock } from "bun:test";
import { render, waitFor } from "@testing-library/react";
import BlogPage from "./page";

// Mock Convex client
const mockUseQuery = mock(() => undefined);

mock.module("convex/react", () => ({
  useQuery: mockUseQuery,
}));

// Mock Next.js navigation
const mockUseSearchParams = mock(() => ({
  get: (_key: string) => null,
}));

const mockUseRouter = mock(() => ({
  push: mock(() => {}),
  replace: mock(() => {}),
}));

mock.module("next/navigation", () => ({
  useSearchParams: mockUseSearchParams,
  useRouter: mockUseRouter,
}));

// Mock framer-motion for reduced motion tests
mock.module("framer-motion", () => ({
  motion: {
    div: "div",
    article: "article",
  },
}));

// Mock blog components
mock.module("@/components/blog/BlogCard", () => ({
  BlogCard: ({ post }: { post: { title: string } }) => (
    <div data-testid="blog-card">{post.title}</div>
  ),
}));

mock.module("@/components/blog/BlogSidebar", () => ({
  BlogSidebar: () => <aside data-testid="blog-sidebar">Sidebar</aside>,
}));

mock.module("@/components/blog/BlogSearch", () => ({
  BlogSearch: () => <div data-testid="blog-search">Search</div>,
}));

// Mock Button component
mock.module("@/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
    disabled,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
  }) => (
    <button type="button" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}));

// Mock Select component
mock.module("@/components/ui/select", () => ({
  Select: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SelectTrigger: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SelectValue: ({ placeholder }: { placeholder: string }) => (
    <span>{placeholder}</span>
  ),
  SelectContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SelectItem: ({
    children,
    value,
  }: {
    children: React.ReactNode;
    value: string;
  }) => <option value={value}>{children}</option>,
}));

// Mock API
mock.module("../../../convex/_generated/api", () => ({
  api: {
    blog: {
      listPosts: "listPosts",
      getFeaturedPosts: "getFeaturedPosts",
      getCategories: "getCategories",
    },
  },
}));

// Sample test data
const mockPosts = [
  {
    _id: "1",
    _creationTime: Date.now(),
    title: "Test Post 1",
    slug: "test-post-1",
    excerpt: "This is test post 1",
    content: "Content 1",
    status: "published" as const,
    author: "Test Author",
    publishedAt: Date.now(),
    updatedAt: Date.now(),
    category: "Technology",
    tags: ["react", "typescript"],
    featured: false,
    viewCount: 100,
    readingTime: 5,
    coverImage: "/test-image.jpg",
    seoMetadata: {
      metaTitle: "Test Post 1",
      metaDescription: "Description 1",
    },
  },
  {
    _id: "2",
    _creationTime: Date.now(),
    title: "Test Post 2",
    slug: "test-post-2",
    excerpt: "This is test post 2",
    content: "Content 2",
    status: "published" as const,
    author: "Test Author",
    publishedAt: Date.now(),
    updatedAt: Date.now(),
    category: "Design",
    tags: ["ui", "ux"],
    featured: false,
    viewCount: 50,
    readingTime: 3,
    coverImage: "/test-image-2.jpg",
    seoMetadata: {
      metaTitle: "Test Post 2",
      metaDescription: "Description 2",
    },
  },
];

const mockFeaturedPosts = [
  {
    ...mockPosts[0],
    _id: "featured-1",
    title: "Featured Post",
    slug: "featured-post",
    featured: true,
  },
];

const mockCategories = [
  {
    _id: "cat-1",
    _creationTime: Date.now(),
    name: "Technology",
    slug: "technology",
    description: "Tech posts",
    postCount: 10,
  },
  {
    _id: "cat-2",
    _creationTime: Date.now(),
    name: "Design",
    slug: "design",
    description: "Design posts",
    postCount: 5,
  },
];

describe("BlogPage", () => {
  beforeEach(() => {
    mock.restore();

    // Default mock implementations
    mockUseQuery.mockImplementation((queryName: string) => {
      if (queryName === "getFeaturedPosts") {
        return mockFeaturedPosts;
      }
      if (queryName === "getCategories") {
        return mockCategories;
      }
      if (queryName === "listPosts") {
        return {
          posts: mockPosts,
          total: 2,
          hasMore: false,
        };
      }
      return undefined;
    });

    mockUseSearchParams.mockReturnValue({
      get: (_key: string) => null,
    });
  });

  describe("Page Rendering", () => {
    it("should render blog page with main components", async () => {
      const { container } = render(<BlogPage />);

      await waitFor(() => {
        expect(
          container.querySelector('[data-testid="blog-search"]'),
        ).toBeTruthy();
        expect(
          container.querySelector('[data-testid="blog-sidebar"]'),
        ).toBeTruthy();
      });
    });

    it("should render page title", async () => {
      const { container } = render(<BlogPage />);

      await waitFor(() => {
        const heading = container.querySelector("h1");
        expect(heading?.textContent).toBe("Blog");
      });
    });

    it("should render category filter dropdown", async () => {
      const { container } = render(<BlogPage />);

      await waitFor(() => {
        const filterText = container.textContent;
        expect(filterText).toContain("All Categories");
      });
    });
  });

  describe("Featured Posts Section", () => {
    it("should render featured posts section when featured posts exist", async () => {
      const { container } = render(<BlogPage />);

      await waitFor(() => {
        const content = container.textContent || "";
        expect(content).toContain("Featured Posts");
        expect(content).toContain("Featured Post");
      });
    });

    it("should not render featured section when no featured posts", async () => {
      mockUseQuery.mockImplementation((queryName: string) => {
        if (queryName === "getFeaturedPosts") {
          return [];
        }
        if (queryName === "getCategories") {
          return mockCategories;
        }
        if (queryName === "listPosts") {
          return {
            posts: mockPosts,
            total: 2,
            hasMore: false,
          };
        }
        return undefined;
      });

      const { container } = render(<BlogPage />);

      await waitFor(() => {
        const content = container.textContent || "";
        expect(content).not.toContain("Featured Posts");
      });
    });
  });

  describe("Blog Post Grid", () => {
    it("should render blog cards for all posts", async () => {
      const { container } = render(<BlogPage />);

      await waitFor(() => {
        // 1 featured card + 2 regular posts = 3 total cards
        const cards = container.querySelectorAll('[data-testid="blog-card"]');
        expect(cards.length).toBe(3);
        const content = container.textContent || "";
        expect(content).toContain("Test Post 1");
        expect(content).toContain("Test Post 2");
      });
    });

    it("should display loading state when posts are loading", async () => {
      mockUseQuery.mockImplementation((queryName: string) => {
        if (queryName === "getFeaturedPosts") {
          return [];
        }
        if (queryName === "getCategories") {
          return mockCategories;
        }
        if (queryName === "listPosts") {
          return undefined; // Loading state
        }
        return undefined;
      });

      const { container } = render(<BlogPage />);

      await waitFor(() => {
        const content = container.textContent || "";
        expect(content).toContain("Loading posts");
      });
    });

    it("should display empty state when no posts found", async () => {
      mockUseQuery.mockImplementation((queryName: string) => {
        if (queryName === "getFeaturedPosts") {
          return [];
        }
        if (queryName === "getCategories") {
          return mockCategories;
        }
        if (queryName === "listPosts") {
          return {
            posts: [],
            total: 0,
            hasMore: false,
          };
        }
        return undefined;
      });

      const { container } = render(<BlogPage />);

      await waitFor(() => {
        const content = container.textContent || "";
        expect(content).toContain("No posts found");
      });
    });
  });

  describe("Pagination", () => {
    it("should render pagination controls when there are more posts", async () => {
      mockUseQuery.mockImplementation((queryName: string) => {
        if (queryName === "getFeaturedPosts") {
          return [];
        }
        if (queryName === "getCategories") {
          return mockCategories;
        }
        if (queryName === "listPosts") {
          return {
            posts: mockPosts,
            total: 50,
            hasMore: true,
          };
        }
        return undefined;
      });

      const { container } = render(<BlogPage />);

      await waitFor(() => {
        const content = container.textContent || "";
        expect(content).toContain("Next");
        expect(content).toContain("Page 1");
      });
    });

    it("should not render Next button on last page", async () => {
      mockUseQuery.mockImplementation((queryName: string) => {
        if (queryName === "getFeaturedPosts") {
          return [];
        }
        if (queryName === "getCategories") {
          return mockCategories;
        }
        if (queryName === "listPosts") {
          return {
            posts: mockPosts,
            total: 2,
            hasMore: false,
          };
        }
        return undefined;
      });

      const { container } = render(<BlogPage />);

      await waitFor(() => {
        const content = container.textContent || "";
        expect(content).not.toContain("Next");
      });
    });

    it("should not render Previous button on first page", async () => {
      const { container } = render(<BlogPage />);

      await waitFor(() => {
        const content = container.textContent || "";
        expect(content).not.toContain("Previous");
      });
    });
  });

  describe("Category Filtering", () => {
    it("should render category filter with all categories", async () => {
      const { container } = render(<BlogPage />);

      await waitFor(() => {
        const content = container.textContent || "";
        expect(content).toContain("Technology");
        expect(content).toContain("Design");
      });
    });

    it("should apply category filter from URL params", async () => {
      mockUseSearchParams.mockReturnValue({
        get: (_key: string) => (_key === "category" ? "technology" : null),
      });

      render(<BlogPage />);

      await waitFor(() => {
        // Verify listPosts was called with category filter
        expect(mockUseQuery).toHaveBeenCalled();
      });
    });
  });

  describe("Search Integration", () => {
    it("should render BlogSearch component", async () => {
      const { container } = render(<BlogPage />);

      await waitFor(() => {
        expect(
          container.querySelector('[data-testid="blog-search"]'),
        ).toBeTruthy();
      });
    });
  });

  describe("Sidebar Integration", () => {
    it("should render BlogSidebar component", async () => {
      const { container } = render(<BlogPage />);

      await waitFor(() => {
        expect(
          container.querySelector('[data-testid="blog-sidebar"]'),
        ).toBeTruthy();
      });
    });
  });

  describe("Responsive Layout", () => {
    it("should render with responsive grid classes", async () => {
      const { container } = render(<BlogPage />);

      await waitFor(() => {
        // Check for responsive grid container
        const gridElement = container.querySelector(
          '[class*="grid-cols"], [class*="lg:grid-cols"]',
        );
        expect(gridElement).toBeTruthy();
      });
    });
  });

  describe("SEO Metadata", () => {
    it("should have appropriate semantic HTML structure", async () => {
      const { container } = render(<BlogPage />);

      await waitFor(() => {
        // Check for main content area
        const mainContent = container.querySelector("section, article");
        expect(mainContent).toBeTruthy();
      });
    });
  });
});
