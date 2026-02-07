/**
 * Tag Archive Page Tests (T030)
 *
 * Tests for the tag archive page including:
 * - Tag header rendering
 * - Post filtering by tag
 * - BlogCard grid display
 * - Related tags section
 * - BlogSidebar integration
 * - Pagination functionality
 * - Dynamic metadata generation
 * - generateStaticParams for all tags
 */

import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import type { Metadata } from "next";
import type { BlogPost, BlogTag } from "@/types/blog";

// Mock BlogCard component
const mockBlogCard = mock(({ post }: { post: BlogPost }) => (
  <article data-testid={`blog-card-${post.slug}`}>
    <h3>{post.title}</h3>
  </article>
));

mock.module("@/components/blog/BlogCard", () => ({
  BlogCard: mockBlogCard,
}));

// Mock BlogSidebar component
const mockBlogSidebar = mock(() => (
  <aside data-testid="blog-sidebar">Sidebar</aside>
));

mock.module("@/components/blog/BlogSidebar", () => ({
  BlogSidebar: mockBlogSidebar,
}));

// Mock UI components
mock.module("@/components/ui/badge", () => ({
  Badge: ({ children, ...props }: any) => (
    <span data-badge {...props}>
      {children}
    </span>
  ),
}));

mock.module("@/components/ui/card", () => ({
  Card: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardContent: ({ children, ...props }: any) => (
    <div {...props}>{children}</div>
  ),
}));

// Test data
const mockTags: BlogTag[] = [
  {
    _id: "tag1",
    _creationTime: Date.now(),
    name: "React",
    slug: "react",
    postCount: 10,
  },
  {
    _id: "tag2",
    _creationTime: Date.now(),
    name: "TypeScript",
    slug: "typescript",
    postCount: 8,
  },
  {
    _id: "tag3",
    _creationTime: Date.now(),
    name: "JavaScript",
    slug: "javascript",
    postCount: 15,
  },
];

const createMockPost = (id: string, title: string, slug: string): BlogPost => ({
  _id: id,
  _creationTime: Date.now(),
  title,
  slug,
  excerpt: `Excerpt for ${title}`,
  content: "Content",
  status: "published",
  author: "Test Author",
  publishedAt: Date.now(),
  updatedAt: Date.now(),
  category: "Technology",
  tags: ["react"],
  featured: false,
  viewCount: 100,
  readingTime: 5,
  coverImage: "/test-image.jpg",
  seoMetadata: {
    metaTitle: title,
    metaDescription: `Excerpt for ${title}`,
  },
});

// Mock Convex client
let mockConvexQuery: ReturnType<typeof mock>;

mock.module("convex/browser", () => ({
  ConvexHttpClient: mock(function ConvexHttpClient() {
    return {
      query: mockConvexQuery,
    };
  }),
}));

// Mock Convex API
const mockApi = {
  blog: {
    getTags: "getTags",
    getPostsByTag: "getPostsByTag",
  },
};

mock.module("../../../../../convex/_generated/api", () => ({
  api: mockApi,
}));

describe("Tag Archive Page (T030)", () => {
  beforeEach(() => {
    mockConvexQuery = mock(async (queryName: string, _args?: any) => {
      if (queryName === mockApi.blog.getTags) {
        return mockTags;
      }
      if (queryName === mockApi.blog.getPostsByTag) {
        return [
          createMockPost("post1", "React Hooks Guide", "react-hooks-guide"),
          createMockPost("post2", "React Context API", "react-context-api"),
        ];
      }
      return [];
    });
  });

  afterEach(() => {
    cleanup();
    mock.restore();
  });

  describe("Server Component Rendering", () => {
    it("should render tag header with name", async () => {
      const { default: TagPage } = await import("./page");
      const params = Promise.resolve({ slug: "react" });

      const component = await TagPage({ params });
      render(component);

      expect(screen.getByText("React")).toBeDefined();
      expect(screen.getByTestId("tag-header")).toBeDefined();
    });

    it("should display post count", async () => {
      const { default: TagPage } = await import("./page");
      const params = Promise.resolve({ slug: "react" });

      const component = await TagPage({ params });
      render(component);

      const header = screen.getByTestId("tag-header");
      expect(header.textContent).toContain("2 posts tagged with React");
    });

    it("should render BlogCard for each post", async () => {
      const { default: TagPage } = await import("./page");
      const params = Promise.resolve({ slug: "react" });

      const component = await TagPage({ params });
      render(component);

      expect(screen.getByTestId("blog-card-react-hooks-guide")).toBeDefined();
      expect(screen.getByTestId("blog-card-react-context-api")).toBeDefined();
    });

    it("should render BlogSidebar", async () => {
      const { default: TagPage } = await import("./page");
      const params = Promise.resolve({ slug: "react" });

      const component = await TagPage({ params });
      render(component);

      expect(screen.getByTestId("blog-sidebar")).toBeDefined();
    });

    it("should display related tags excluding current", async () => {
      const { default: TagPage } = await import("./page");
      const params = Promise.resolve({ slug: "react" });

      const component = await TagPage({ params });
      render(component);

      const relatedSection = screen.getByTestId("related-tags");
      expect(relatedSection).toBeDefined();

      // Should show other tags
      expect(relatedSection.textContent).toContain("TypeScript");
      expect(relatedSection.textContent).toContain("JavaScript");
      // Should NOT show React
      const badgeText = relatedSection.querySelectorAll("[data-badge]");
      const reactBadge = Array.from(badgeText).find((el) =>
        el.textContent?.includes("React"),
      );
      expect(reactBadge).toBeUndefined();
    });

    it("should handle tag not found", async () => {
      const { default: TagPage } = await import("./page");
      const params = Promise.resolve({ slug: "nonexistent" });

      const component = await TagPage({ params });
      render(component);

      expect(screen.getByText("Tag Not Found")).toBeDefined();
      expect(screen.getByText(/doesn't exist/)).toBeDefined();
    });

    it("should display empty state when no posts", async () => {
      mockConvexQuery = mock(async (queryName: string) => {
        if (queryName === mockApi.blog.getTags) {
          return mockTags;
        }
        if (queryName === mockApi.blog.getPostsByTag) {
          return [];
        }
        return [];
      });

      const { default: TagPage } = await import("./page");
      const params = Promise.resolve({ slug: "react" });

      const component = await TagPage({ params });
      render(component);

      expect(screen.getByText(/No posts found with this tag/)).toBeDefined();
    });
  });

  describe("Pagination", () => {
    it("should display pagination controls for > 20 posts", async () => {
      const manyPosts = Array.from({ length: 25 }, (_, i) =>
        createMockPost(`post${i}`, `Post ${i + 1}`, `post-${i + 1}`),
      );

      mockConvexQuery = mock(async (queryName: string) => {
        if (queryName === mockApi.blog.getTags) {
          return mockTags;
        }
        if (queryName === mockApi.blog.getPostsByTag) {
          return manyPosts;
        }
        return [];
      });

      const { default: TagPage } = await import("./page");
      const params = Promise.resolve({ slug: "react" });

      const component = await TagPage({ params });
      render(component);

      expect(screen.getByTestId("pagination-controls")).toBeDefined();
      expect(screen.getByText("Next")).toBeDefined();
    });

    it("should show first 20 posts on page 1", async () => {
      const manyPosts = Array.from({ length: 25 }, (_, i) =>
        createMockPost(`post${i}`, `Post ${i + 1}`, `post-${i + 1}`),
      );

      mockConvexQuery = mock(async (queryName: string) => {
        if (queryName === mockApi.blog.getTags) {
          return mockTags;
        }
        if (queryName === mockApi.blog.getPostsByTag) {
          return manyPosts;
        }
        return [];
      });

      const { default: TagPage } = await import("./page");
      const params = Promise.resolve({ slug: "react" });

      const component = await TagPage({ params });
      render(component);

      // Should render 20 cards
      const cards = screen.getAllByTestId(/^blog-card-/);
      expect(cards.length).toBe(20);
    });

    it("should paginate to page 2", async () => {
      const manyPosts = Array.from({ length: 25 }, (_, i) =>
        createMockPost(`post${i}`, `Post ${i + 1}`, `post-${i + 1}`),
      );

      mockConvexQuery = mock(async (queryName: string) => {
        if (queryName === mockApi.blog.getTags) {
          return mockTags;
        }
        if (queryName === mockApi.blog.getPostsByTag) {
          return manyPosts;
        }
        return [];
      });

      const { default: TagPage } = await import("./page");
      const params = Promise.resolve({ slug: "react" });
      const searchParams = Promise.resolve({ page: "2" });

      const component = await TagPage({ params, searchParams });
      render(component);

      // Should render remaining 5 cards
      const cards = screen.getAllByTestId(/^blog-card-/);
      expect(cards.length).toBe(5);

      // Should show Previous button
      expect(screen.getByText("Previous")).toBeDefined();
    });
  });

  describe("Dynamic Metadata", () => {
    it("should generate metadata with tag name", async () => {
      const { generateMetadata } = await import("./page");
      const params = Promise.resolve({ slug: "react" });

      const metadata = (await generateMetadata({ params })) as Metadata;

      expect(metadata.title).toContain("React");
      expect(metadata.description).toContain("React");
      expect(metadata.description).toContain("10");
    });

    it("should include OpenGraph metadata", async () => {
      const { generateMetadata } = await import("./page");
      const params = Promise.resolve({ slug: "typescript" });

      const metadata = (await generateMetadata({ params })) as Metadata;

      expect(metadata.openGraph?.title).toContain("TypeScript");
      expect(metadata.openGraph?.type).toBe("website");
      expect(metadata.openGraph?.url).toBe("/blog/tag/typescript");
    });

    it("should include Twitter metadata", async () => {
      const { generateMetadata } = await import("./page");
      const params = Promise.resolve({ slug: "javascript" });

      const metadata = (await generateMetadata({ params })) as Metadata;

      expect(metadata.twitter?.card).toBe("summary");
      expect(metadata.twitter?.title).toContain("JavaScript");
    });

    it("should handle tag not found in metadata", async () => {
      const { generateMetadata } = await import("./page");
      const params = Promise.resolve({ slug: "nonexistent" });

      const metadata = (await generateMetadata({ params })) as Metadata;

      expect(metadata.title).toBe("Tag Not Found");
      expect(metadata.description).toContain("could not be found");
    });
  });

  describe("generateStaticParams", () => {
    it("should generate params for all tags", async () => {
      const { generateStaticParams } = await import("./page");
      const params = await generateStaticParams();

      expect(params).toHaveLength(3);
      expect(params).toEqual([
        { slug: "react" },
        { slug: "typescript" },
        { slug: "javascript" },
      ]);
    });

    it("should handle empty tags list", async () => {
      mockConvexQuery = mock(async () => []);

      const { generateStaticParams } = await import("./page");
      const params = await generateStaticParams();

      expect(params).toEqual([]);
    });
  });

  describe("ISR Configuration", () => {
    it("should export revalidate with 60-second interval", async () => {
      const module = await import("./page");
      expect(module.revalidate).toBe(60);
    });
  });
});
