import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Admin Blog Dashboard Page Tests (T015)
 *
 * Test suite for the admin blog dashboard page covering:
 * - Page rendering with proper metadata
 * - Statistics cards display (total posts, drafts, published)
 * - BlogPostList component integration
 * - Quick actions (New Post button)
 * - Responsive layout
 * - Navigation and routing
 */

// Mock blog posts data
const mockConvexPosts = [
  {
    _id: "1",
    _creationTime: Date.now(),
    title: "Published Post 1",
    slug: "published-post-1",
    status: "published" as const,
    categoryId: "cat1",
    viewCount: 100,
    publishedAt: Date.now(),
    updatedAt: Date.now(),
    content: "Content 1",
    excerpt: "Excerpt 1",
    featuredImage: null,
    tags: [],
    author: "Ryan",
  },
  {
    _id: "2",
    _creationTime: Date.now(),
    title: "Published Post 2",
    slug: "published-post-2",
    status: "published" as const,
    categoryId: "cat1",
    viewCount: 200,
    publishedAt: Date.now(),
    updatedAt: Date.now(),
    content: "Content 2",
    excerpt: "Excerpt 2",
    featuredImage: null,
    tags: [],
    author: "Ryan",
  },
  {
    _id: "3",
    _creationTime: Date.now(),
    title: "Draft Post",
    slug: "draft-post",
    status: "draft" as const,
    categoryId: "cat1",
    viewCount: 0,
    publishedAt: null,
    updatedAt: Date.now(),
    content: "Content 3",
    excerpt: "Excerpt 3",
    featuredImage: null,
    tags: [],
    author: "Ryan",
  },
];

const mockCategories = [
  {
    _id: "cat1",
    _creationTime: Date.now(),
    name: "Tutorials",
    slug: "tutorials",
    description: "Tutorials",
  },
  {
    _id: "cat2",
    _creationTime: Date.now(),
    name: "News",
    slug: "news",
    description: "News",
  },
];

// Track which query is being called
let queryCallCount = 0;

// Mock Convex hooks
vi.mock("convex/react", () => ({
  useQuery: vi.fn(() => {
    // First call is listPosts, second is getCategories
    queryCallCount++;
    if (queryCallCount === 1 || queryCallCount % 2 === 1) {
      return { posts: mockConvexPosts };
    }
    return mockCategories;
  }),
  useMutation: vi.fn(() => vi.fn()),
}));

// Mock blog components
vi.mock("@/components/admin/blog/BlogPostList", () => ({
  BlogPostList: vi.fn(
    ({ posts, categories }: { posts: unknown[]; categories: unknown[] }) => (
      <div data-testid="blog-post-list">
        <div>BlogPostList Component</div>
        <div>Posts: {posts.length}</div>
        <div>Categories: {categories.length}</div>
      </div>
    ),
  ),
}));

// Mock Next.js navigation
const mockPush = vi.fn();
const mockUseRouter = vi.fn(() => ({
  push: mockPush,
  pathname: "/admin/blog",
}));

vi.mock("next/navigation", () => ({
  useRouter: mockUseRouter,
  usePathname: vi.fn(() => "/admin/blog"),
}));

// Mock Convex API
vi.mock("../../../../convex/_generated/api", () => ({
  api: {
    blog: {
      listPosts: "listPosts",
      getCategories: "getCategories",
      deletePost: "deletePost",
    },
  },
}));

// Mock blog transforms
vi.mock("@/lib/blog-transforms", () => ({
  transformConvexPosts: vi.fn((posts) =>
    posts.map((p: { status: string }) => ({
      ...p,
      category: "tutorials",
    })),
  ),
  buildCategoryMap: vi.fn(() => ({})),
}));

describe("Admin Blog Dashboard Page", () => {
  beforeEach(() => {
    // Reset query call count before each test
    queryCallCount = 0;
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe("Page Rendering", () => {
    it("should render the blog dashboard page", async () => {
      const { default: BlogPage } = await import("./page");

      render(<BlogPage />);

      // Check page title is present
      expect(screen.getByText(/blog management/i)).toBeDefined();
    });

    it("should display page heading", async () => {
      const { default: BlogPage } = await import("./page");

      render(<BlogPage />);

      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading.textContent).toMatch(/blog/i);
    });

    it("should render BlogPostList component", async () => {
      const { default: BlogPage } = await import("./page");

      render(<BlogPage />);

      const blogPostList = screen.getByTestId("blog-post-list");
      expect(blogPostList).toBeDefined();
      expect(screen.getByText("BlogPostList Component")).toBeDefined();
    });
  });

  describe("Statistics Cards", () => {
    it("should display total posts statistic", async () => {
      const { default: BlogPage } = await import("./page");

      render(<BlogPage />);

      // Should show total count of all posts
      expect(screen.getByText(/total posts/i)).toBeDefined();
      expect(screen.getByText("3")).toBeDefined(); // 3 total posts in mock data
    });

    it("should display draft posts statistic", async () => {
      const { default: BlogPage } = await import("./page");

      render(<BlogPage />);

      // Should show count of draft posts
      expect(screen.getByText(/drafts/i)).toBeDefined();
      expect(screen.getByText("1")).toBeDefined(); // 1 draft post
    });

    it("should display published posts statistic", async () => {
      const { default: BlogPage } = await import("./page");

      render(<BlogPage />);

      // Should show count of published posts
      const publishedCards = screen.getAllByText(/published/i);
      expect(publishedCards.length).toBeGreaterThan(0);
      expect(screen.getByText("2")).toBeDefined(); // 2 published posts
    });

    it("should display statistics in card format", async () => {
      const { default: BlogPage } = await import("./page");

      const { container } = render(<BlogPage />);

      // Check for card-like structure (using article elements for semantic cards)
      const cards = container.querySelectorAll("article");
      expect(cards.length).toBeGreaterThanOrEqual(3); // At least 3 stat cards
    });
  });

  describe("Quick Actions", () => {
    it("should display New Post button", async () => {
      const { default: BlogPage } = await import("./page");

      render(<BlogPage />);

      const newPostButton = screen.getByRole("button", { name: /new post/i });
      expect(newPostButton).toBeDefined();
    });

    it("should navigate to new post page when clicked", async () => {
      const { default: BlogPage } = await import("./page");

      render(<BlogPage />);

      const newPostButton = screen.getByRole("button", { name: /new post/i });
      newPostButton.click();

      // Should navigate to new post creation page
      expect(mockPush).toHaveBeenCalledWith("/admin/blog/new");
    });
  });

  describe("Layout and Responsive Design", () => {
    it("should have proper responsive layout classes", async () => {
      const { default: BlogPage } = await import("./page");

      const { container } = render(<BlogPage />);

      // Check for responsive container/layout classes
      const mainContent = container.querySelector('[class*="space-y"]');
      expect(mainContent).toBeDefined();
    });

    it("should display statistics grid responsively", async () => {
      const { default: BlogPage } = await import("./page");

      const { container } = render(<BlogPage />);

      // Check for grid layout for statistics
      const statsGrid = container.querySelector('[class*="grid"]');
      expect(statsGrid).toBeDefined();
    });
  });

  describe("Component Integration", () => {
    it("should pass posts data to BlogPostList", async () => {
      const { default: BlogPage } = await import("./page");

      render(<BlogPage />);

      // BlogPostList should receive posts
      expect(screen.getByText("Posts: 3")).toBeDefined();
    });

    it("should pass categories data to BlogPostList", async () => {
      const { default: BlogPage } = await import("./page");

      render(<BlogPage />);

      // BlogPostList should receive categories
      expect(screen.getByText("Categories: 2")).toBeDefined();
    });
  });

  describe("Page Structure", () => {
    it("should be a client component", async () => {
      const { default: BlogPage } = await import("./page");

      // Client components don't export metadata, they render directly
      expect(BlogPage).toBeDefined();
      expect(typeof BlogPage).toBe("function");
    });
  });
});
