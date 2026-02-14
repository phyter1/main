/**
 * T029: Category Archive Page Tests
 *
 * Comprehensive tests for category filtering, pagination, and metadata generation.
 * Tests ensure proper category data fetching, post filtering, and ISR configuration.
 */

import { act, render, waitFor } from "@testing-library/react";
import { useQuery } from "convex/react";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CategoryPage from "./page";

// Mock Next.js modules
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(() => {}),
    replace: vi.fn(() => {}),
    prefetch: vi.fn(() => {}),
  }),
  useSearchParams: () => ({
    get: vi.fn(() => null),
  }),
  notFound: vi.fn(() => {
    throw new Error("NOT_FOUND");
  }),
}));

// Mock Convex React
vi.mock("convex/react", () => ({
  useQuery: vi.fn(() => null),
  useMutation: vi.fn(() => vi.fn(() => Promise.resolve())),
  Authenticated: ({ children }: { children: React.ReactNode }) => children,
  Unauthenticated: () => null,
  ConvexProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock components
vi.mock("@/components/blog/BlogCard", () => ({
  BlogCard: ({ post }: { post: { title: string; excerpt: string } }) => (
    <article data-testid="blog-card">
      <h3>{post.title}</h3>
      <p>{post.excerpt}</p>
    </article>
  ),
}));

vi.mock("@/components/blog/BlogSidebar", () => ({
  BlogSidebar: () => <aside data-testid="blog-sidebar">Sidebar</aside>,
}));

// Mock Convex API with string identifiers (matching blog/page.test.tsx pattern)
vi.mock("../../../../../convex/_generated/api", () => ({
  api: {
    blog: {
      getCategories: "getCategories",
      listPosts: "listPosts",
    },
  },
}));

// Mock data
const mockCategory = {
  _id: "cat1",
  _creationTime: Date.now(),
  name: "Technology",
  slug: "technology",
  description: "Posts about technology and software development",
  postCount: 15,
};

const mockPosts = [
  {
    _id: "post1",
    _creationTime: Date.now(),
    title: "Getting Started with React",
    slug: "getting-started-with-react",
    excerpt: "Learn the basics of React in this comprehensive guide",
    content: "Full content here...",
    status: "published" as const,
    author: "John Doe",
    publishedAt: Date.now() - 86400000,
    updatedAt: Date.now(),
    coverImage: "/images/react-cover.jpg",
    category: "Technology",
    tags: ["react", "javascript"],
    featured: false,
    viewCount: 100,
    readingTime: 5,
    seoMetadata: {
      metaTitle: "Getting Started with React",
      metaDescription: "Learn React basics",
    },
  },
  {
    _id: "post2",
    _creationTime: Date.now(),
    title: "TypeScript Best Practices",
    slug: "typescript-best-practices",
    excerpt: "Essential TypeScript patterns for better code",
    content: "Full content here...",
    status: "published" as const,
    author: "Jane Smith",
    publishedAt: Date.now() - 172800000,
    updatedAt: Date.now(),
    coverImage: "/images/typescript-cover.jpg",
    category: "Technology",
    tags: ["typescript", "javascript"],
    featured: true,
    viewCount: 250,
    readingTime: 8,
    seoMetadata: {
      metaTitle: "TypeScript Best Practices",
      metaDescription: "TypeScript patterns guide",
    },
  },
];

describe("CategoryPage Component", () => {
  // Helper to render component with Suspense boundary
  const renderWithSuspense = async (slug: string) => {
    let result: ReturnType<typeof render> | undefined;
    await act(async () => {
      result = render(
        <Suspense fallback={<div>Loading...</div>}>
          <CategoryPage params={Promise.resolve({ slug })} />
        </Suspense>,
      );
      // Wait a tick for promises to resolve
      await Promise.resolve();
    });
    if (!result) throw new Error("Render failed");
    return result;
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementation (matching blog/page.test.tsx pattern)
    vi.mocked(useQuery).mockImplementation((queryName: string) => {
      if (queryName === "getCategories") {
        return [mockCategory];
      }
      if (queryName === "listPosts") {
        return { posts: mockPosts, total: 2, hasMore: false };
      }
      return undefined;
    });
  });

  describe("Category Header and Posts Display", () => {
    it("should display category name and description in header", async () => {
      const { findByText } = await renderWithSuspense("technology");

      expect(await findByText("Technology")).toBeDefined();
      expect(
        await findByText("Posts about technology and software development"),
      ).toBeDefined();
    });

    it("should display post count in category header", async () => {
      const { findByText } = await renderWithSuspense("technology");

      expect(await findByText(/2 posts/i)).toBeDefined();
    });

    it("should render BlogCard for each post in category", async () => {
      const { findAllByTestId, findByText } =
        await renderWithSuspense("technology");

      const blogCards = await findAllByTestId("blog-card");
      expect(blogCards.length).toBe(2);
      expect(await findByText("Getting Started with React")).toBeDefined();
      expect(await findByText("TypeScript Best Practices")).toBeDefined();
    });

    it("should render BlogSidebar component", async () => {
      const { findByTestId } = await renderWithSuspense("technology");

      expect(await findByTestId("blog-sidebar")).toBeDefined();
    });
  });

  describe("Category Not Found Handling", () => {
    it("should call notFound() when category does not exist", async () => {
      vi.mocked(useQuery).mockImplementation((queryName: string) => {
        if (queryName === "getCategories") {
          return []; // No categories found
        }
        return undefined;
      });

      try {
        await renderWithSuspense("nonexistent");
        await waitFor(() => {
          expect(vi.mocked(notFound)).toHaveBeenCalled();
        });
      } catch (error) {
        // Expected to throw
        expect((error as Error).message).toBe("NOT_FOUND");
      }
    });

    it("should call notFound() when category slug does not match", async () => {
      vi.mocked(useQuery).mockImplementation((queryName: string) => {
        if (queryName === "getCategories") {
          return [mockCategory]; // Category exists but different slug
        }
        return undefined;
      });

      try {
        await renderWithSuspense("different-slug");
        await waitFor(() => {
          expect(vi.mocked(notFound)).toHaveBeenCalled();
        });
      } catch (error) {
        // Expected to throw
        expect((error as Error).message).toBe("NOT_FOUND");
      }
    });
  });

  describe("Pagination", () => {
    it("should display pagination controls when hasMore is true", async () => {
      vi.mocked(useQuery).mockImplementation((queryName: string) => {
        if (queryName === "getCategories") {
          return [mockCategory];
        }
        if (queryName === "listPosts") {
          return { posts: mockPosts, total: 25, hasMore: true };
        }
        return undefined;
      });

      const { findByText } = await renderWithSuspense("technology");

      expect(await findByText(/Next/i)).toBeDefined();
    });

    it("should not show pagination when all posts fit on one page", async () => {
      vi.mocked(useQuery).mockImplementation((queryName: string) => {
        if (queryName === "getCategories") {
          return [mockCategory];
        }
        if (queryName === "listPosts") {
          return { posts: mockPosts, total: 2, hasMore: false };
        }
        return undefined;
      });

      const { findByText, queryByText } =
        await renderWithSuspense("technology");

      // Wait for component to render
      await findByText("Technology");

      // Pagination should not be rendered when totalPages <= 1
      expect(queryByText(/Next/i)).toBeNull();
      expect(queryByText(/Previous/i)).toBeNull();
    });

    it("should display current page and total pages", async () => {
      vi.mocked(useQuery).mockImplementation((queryName: string) => {
        if (queryName === "getCategories") {
          return [mockCategory];
        }
        if (queryName === "listPosts") {
          return { posts: mockPosts, total: 25, hasMore: true };
        }
        return undefined;
      });

      const { findByText } = await renderWithSuspense("technology");

      expect(await findByText(/Page 1/i)).toBeDefined();
    });
  });

  describe("Loading States", () => {
    it("should show loading state while categories are fetching", async () => {
      vi.mocked(useQuery).mockImplementation(() => undefined);

      const { findByText } = await renderWithSuspense("technology");

      expect(await findByText(/Loading/i)).toBeDefined();
    });

    it("should show loading skeleton for posts while data is fetching", async () => {
      vi.mocked(useQuery).mockImplementation((queryName: string) => {
        if (queryName === "getCategories") {
          return [mockCategory];
        }
        return undefined; // Posts still loading
      });

      const { findByTestId } = await renderWithSuspense("technology");

      expect(await findByTestId("posts-loading")).toBeDefined();
    });
  });

  describe("Empty State", () => {
    it("should display message when category has no posts", async () => {
      vi.mocked(useQuery).mockImplementation((queryName: string) => {
        if (queryName === "getCategories") {
          return [{ ...mockCategory, postCount: 0 }];
        }
        if (queryName === "listPosts") {
          return { posts: [], total: 0, hasMore: false };
        }
        return undefined;
      });

      const { findByText } = await renderWithSuspense("technology");

      expect(
        await findByText(/No posts found in this category/i),
      ).toBeDefined();
    });
  });
});

// Note: generateMetadata and generateStaticParams tests removed
// because the page is a client component and doesn't export these functions.
// If needed in the future, the page should be converted to a server component
// or use a separate metadata file.
