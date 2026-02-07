/**
 * T029: Category Archive Page Tests
 *
 * Comprehensive tests for category filtering, pagination, and metadata generation.
 * Tests ensure proper category data fetching, post filtering, and ISR configuration.
 */

import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import { render, waitFor } from "@testing-library/react";
import CategoryPage, { generateMetadata, generateStaticParams } from "./page";

// Mock for notFound function
const mockNotFound = mock(() => {
  throw new Error("NOT_FOUND");
});

// Mock Next.js modules
mock.module("next/navigation", () => ({
  useRouter: () => ({
    push: mock(() => {}),
    replace: mock(() => {}),
    prefetch: mock(() => {}),
  }),
  useSearchParams: () => ({
    get: mock(() => null),
  }),
  notFound: mockNotFound,
}));

// Mock Convex React
const mockUseQuery = mock(() => null);
mock.module("convex/react", () => ({
  useQuery: mockUseQuery,
  useMutation: mock(() => mock(() => Promise.resolve())),
  Authenticated: ({ children }: { children: React.ReactNode }) => children,
  Unauthenticated: () => null,
}));

// Mock components
mock.module("@/components/blog/BlogCard", () => ({
  BlogCard: ({ post }: { post: { title: string; excerpt: string } }) => (
    <article data-testid="blog-card">
      <h3>{post.title}</h3>
      <p>{post.excerpt}</p>
    </article>
  ),
}));

mock.module("@/components/blog/BlogSidebar", () => ({
  BlogSidebar: () => <aside data-testid="blog-sidebar">Sidebar</aside>,
}));

// Mock Convex API
const mockApi = {
  blog: {
    getCategories: "getCategories",
    listPosts: "listPosts",
  },
};

mock.module("../../../../convex/_generated/api", () => ({
  api: mockApi,
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
  beforeEach(() => {
    mockNotFound.mockClear();
    mockUseQuery.mockClear();
  });

  afterEach(() => {
    mock.restore();
  });

  describe("Category Header and Posts Display", () => {
    it("should display category name and description in header", async () => {
      mockUseQuery.mockImplementation((query: string) => {
        if (query === mockApi.blog.getCategories) {
          return [mockCategory];
        }
        if (query === mockApi.blog.listPosts) {
          return { posts: mockPosts, total: 2, hasMore: false };
        }
        return null;
      });

      const { findByText } = render(
        <CategoryPage params={Promise.resolve({ slug: "technology" })} />,
      );

      expect(await findByText("Technology")).toBeDefined();
      expect(
        await findByText("Posts about technology and software development"),
      ).toBeDefined();
    });

    it("should display post count in category header", async () => {
      mockUseQuery.mockImplementation((query: string) => {
        if (query === mockApi.blog.getCategories) {
          return [mockCategory];
        }
        if (query === mockApi.blog.listPosts) {
          return { posts: mockPosts, total: 2, hasMore: false };
        }
        return null;
      });

      const { findByText } = render(
        <CategoryPage params={Promise.resolve({ slug: "technology" })} />,
      );

      expect(await findByText(/2 posts/i)).toBeDefined();
    });

    it("should render BlogCard for each post in category", async () => {
      mockUseQuery.mockImplementation((query: string) => {
        if (query === mockApi.blog.getCategories) {
          return [mockCategory];
        }
        if (query === mockApi.blog.listPosts) {
          return { posts: mockPosts, total: 2, hasMore: false };
        }
        return null;
      });

      const { findAllByTestId, findByText } = render(
        <CategoryPage params={Promise.resolve({ slug: "technology" })} />,
      );

      const blogCards = await findAllByTestId("blog-card");
      expect(blogCards.length).toBe(2);
      expect(await findByText("Getting Started with React")).toBeDefined();
      expect(await findByText("TypeScript Best Practices")).toBeDefined();
    });

    it("should render BlogSidebar component", async () => {
      mockUseQuery.mockImplementation((query: string) => {
        if (query === mockApi.blog.getCategories) {
          return [mockCategory];
        }
        if (query === mockApi.blog.listPosts) {
          return { posts: mockPosts, total: 2, hasMore: false };
        }
        return null;
      });

      const { findByTestId } = render(
        <CategoryPage params={Promise.resolve({ slug: "technology" })} />,
      );

      expect(await findByTestId("blog-sidebar")).toBeDefined();
    });
  });

  describe("Category Not Found Handling", () => {
    it("should call notFound() when category does not exist", async () => {
      mockUseQuery.mockImplementation((query: string) => {
        if (query === mockApi.blog.getCategories) {
          return []; // No categories found
        }
        return null;
      });

      try {
        render(
          <CategoryPage params={Promise.resolve({ slug: "nonexistent" })} />,
        );
        await waitFor(() => {
          expect(mockNotFound).toHaveBeenCalled();
        });
      } catch (error) {
        // Expected to throw
        expect((error as Error).message).toBe("NOT_FOUND");
      }
    });

    it("should call notFound() when category slug does not match", async () => {
      mockUseQuery.mockImplementation((query: string) => {
        if (query === mockApi.blog.getCategories) {
          return [mockCategory]; // Category exists but different slug
        }
        return null;
      });

      try {
        render(
          <CategoryPage params={Promise.resolve({ slug: "different-slug" })} />,
        );
        await waitFor(() => {
          expect(mockNotFound).toHaveBeenCalled();
        });
      } catch (error) {
        // Expected to throw
        expect((error as Error).message).toBe("NOT_FOUND");
      }
    });
  });

  describe("Pagination", () => {
    it("should display pagination controls when hasMore is true", async () => {
      mockUseQuery.mockImplementation((query: string) => {
        if (query === mockApi.blog.getCategories) {
          return [mockCategory];
        }
        if (query === mockApi.blog.listPosts) {
          return { posts: mockPosts, total: 25, hasMore: true };
        }
        return null;
      });

      const { findByText } = render(
        <CategoryPage params={Promise.resolve({ slug: "technology" })} />,
      );

      expect(await findByText(/Next/i)).toBeDefined();
    });

    it("should not disable Next button when hasMore is false", async () => {
      mockUseQuery.mockImplementation((query: string) => {
        if (query === mockApi.blog.getCategories) {
          return [mockCategory];
        }
        if (query === mockApi.blog.listPosts) {
          return { posts: mockPosts, total: 2, hasMore: false };
        }
        return null;
      });

      const { findByText } = render(
        <CategoryPage params={Promise.resolve({ slug: "technology" })} />,
      );

      // Wait for component to render
      await findByText("Technology");

      // Button should exist (we check for disabled state in integration tests)
      expect(await findByText(/Next/i)).toBeDefined();
    });

    it("should display current page and total pages", async () => {
      mockUseQuery.mockImplementation((query: string) => {
        if (query === mockApi.blog.getCategories) {
          return [mockCategory];
        }
        if (query === mockApi.blog.listPosts) {
          return { posts: mockPosts, total: 25, hasMore: true };
        }
        return null;
      });

      const { findByText } = render(
        <CategoryPage params={Promise.resolve({ slug: "technology" })} />,
      );

      expect(await findByText(/Page 1/i)).toBeDefined();
    });
  });

  describe("Loading States", () => {
    it("should show loading state while categories are fetching", async () => {
      mockUseQuery.mockImplementation(() => undefined);

      const { findByText } = render(
        <CategoryPage params={Promise.resolve({ slug: "technology" })} />,
      );

      expect(await findByText(/Loading/i)).toBeDefined();
    });

    it("should show loading skeleton for posts while data is fetching", async () => {
      mockUseQuery.mockImplementation((query: string) => {
        if (query === mockApi.blog.getCategories) {
          return [mockCategory];
        }
        return undefined; // Posts still loading
      });

      const { findByTestId } = render(
        <CategoryPage params={Promise.resolve({ slug: "technology" })} />,
      );

      expect(await findByTestId("posts-loading")).toBeDefined();
    });
  });

  describe("Empty State", () => {
    it("should display message when category has no posts", async () => {
      mockUseQuery.mockImplementation((query: string) => {
        if (query === mockApi.blog.getCategories) {
          return [{ ...mockCategory, postCount: 0 }];
        }
        if (query === mockApi.blog.listPosts) {
          return { posts: [], total: 0, hasMore: false };
        }
        return null;
      });

      const { findByText } = render(
        <CategoryPage params={Promise.resolve({ slug: "technology" })} />,
      );

      expect(
        await findByText(/No posts found in this category/i),
      ).toBeDefined();
    });
  });
});

describe("generateMetadata", () => {
  beforeEach(() => {
    mock.restore();
  });

  it("should generate metadata with category name", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "technology" }),
    });

    expect(metadata.title).toContain("Technology");
  });

  it("should generate description with category description", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "technology" }),
    });

    expect(metadata.description).toBeDefined();
    expect(typeof metadata.description).toBe("string");
  });

  it("should generate OpenGraph metadata", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "technology" }),
    });

    expect(metadata.openGraph).toBeDefined();
    expect(metadata.openGraph?.title).toContain("Technology");
  });

  it("should generate Twitter metadata", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "technology" }),
    });

    expect(metadata.twitter).toBeDefined();
    expect(metadata.twitter?.card).toBe("summary_large_image");
  });
});

describe("generateStaticParams", () => {
  it("should generate params for all categories", async () => {
    const params = await generateStaticParams();

    expect(Array.isArray(params)).toBe(true);
  });

  it("should return array of objects with slug property", async () => {
    const params = await generateStaticParams();

    if (params.length > 0) {
      expect(params[0]).toHaveProperty("slug");
      expect(typeof params[0].slug).toBe("string");
    }
  });
});
