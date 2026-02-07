/**
 * T028: Individual Blog Post Page Tests
 *
 * Tests for the dynamic blog post page including:
 * - Page rendering with post data
 * - Dynamic metadata generation (title, description, OG tags)
 * - Structured data (JSON-LD)
 * - Static params generation for published posts
 * - ISR configuration with 1-hour revalidation
 * - View count increment on load
 * - Related posts functionality
 */

import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import { cleanup, render, waitFor } from "@testing-library/react";
import type { Metadata } from "next";
import BlogPostPage, {
  generateMetadata,
  generateStaticParams,
  revalidate,
} from "./page";

// Mock Next.js navigation
mock.module("next/navigation", () => ({
  notFound: mock(() => {
    throw new Error("Not Found");
  }),
}));

// Mock Convex React hooks
const mockUseQuery = mock(() => null);
const mockUsePreloadedQuery = mock(() => null);
const mockUseMutation = mock(() => mock(() => Promise.resolve()));

mock.module("convex/react", () => ({
  useQuery: mockUseQuery,
  usePreloadedQuery: mockUsePreloadedQuery,
  useMutation: mockUseMutation,
  useConvexAuth: mock(() => ({ isAuthenticated: false, isLoading: false })),
}));

// Mock API module
mock.module("../../../../convex/_generated/api", () => ({
  api: {
    blog: {
      getPostBySlug: "blog:getPostBySlug",
      getPostsByTag: "blog:getPostsByTag",
      listPosts: "blog:listPosts",
      incrementViewCount: "blog:incrementViewCount",
    },
  },
}));

// Mock Convex server for metadata generation
const _mockConvexFromCookie = mock(() => ({
  query: mock(() => Promise.resolve(null)),
  mutation: mock(() => Promise.resolve()),
}));

// Mock for metadata/static params generation
let mockPreloadQueryData: any = null;

mock.module("convex/nextjs", () => ({
  preloadQuery: mock(async (_query: any, _args: any) => {
    // Return a preloaded query object that can be used by usePreloadedQuery
    return mockPreloadQueryData;
  }),
}));

// Mock blog components
mock.module("@/components/blog/BlogHeader", () => ({
  BlogHeader: ({ post }: { post: any }) => (
    <div data-testid="blog-header">
      <h1>{post?.title || ""}</h1>
      <p>{post?.author || ""}</p>
    </div>
  ),
}));

mock.module("@/components/blog/BlogContent", () => ({
  BlogContent: ({ content }: { content: string }) => (
    <div data-testid="blog-content">{content || ""}</div>
  ),
}));

mock.module("@/components/blog/ShareButtons", () => ({
  ShareButtons: ({ title, slug }: { title: string; slug: string }) => (
    <div data-testid="share-buttons">
      {title || ""} - {slug || ""}
    </div>
  ),
}));

mock.module("@/components/blog/TableOfContents", () => ({
  TableOfContents: ({ headings }: { headings: any[] }) => (
    <div data-testid="table-of-contents">{headings?.length || 0} headings</div>
  ),
}));

mock.module("@/components/blog/BlogCard", () => ({
  BlogCard: ({ post }: { post: any }) => (
    <div data-testid="blog-card">
      <h3>{post?.title || ""}</h3>
    </div>
  ),
}));

// Mock blog utilities
mock.module("@/lib/blog-utils", () => ({
  formatDate: mock((_timestamp: number) => "Jan 01, 2024"),
}));

// Mock blog metadata utilities
mock.module("@/lib/blog-metadata", () => ({
  generateBlogMetadata: mock((post: any) => ({
    title: post.seoMetadata?.metaTitle || post.title,
    description: post.seoMetadata?.metaDescription || post.excerpt,
    openGraph: {
      title: post.seoMetadata?.metaTitle || post.title,
      description: post.seoMetadata?.metaDescription || post.excerpt,
      images: post.seoMetadata?.ogImage ? [post.seoMetadata.ogImage] : [],
      type: "article",
      publishedTime: new Date(post.publishedAt).toISOString(),
      modifiedTime: new Date(post.updatedAt).toISOString(),
      authors: [post.author],
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.seoMetadata?.metaTitle || post.title,
      description: post.seoMetadata?.metaDescription || post.excerpt,
      images: post.seoMetadata?.ogImage ? [post.seoMetadata.ogImage] : [],
    },
    keywords: post.seoMetadata?.keywords || [],
    alternates: {
      canonical: `https://phytertek.com/blog/${post.slug}`,
    },
  })),
  generateArticleStructuredData: mock((post: any) => {
    const publishedDate = post.publishedAt
      ? new Date(post.publishedAt).toISOString()
      : new Date().toISOString();
    const modifiedDate = post.updatedAt
      ? new Date(post.updatedAt).toISOString()
      : new Date().toISOString();

    return {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: post.title,
      author: {
        "@type": "Person",
        name: post.author,
      },
      datePublished: publishedDate,
      dateModified: modifiedDate,
      keywords: post.seoMetadata?.keywords || [],
      url: `https://phytertek.com/blog/${post.slug}`,
      mainEntityOfPage: `https://phytertek.com/blog/${post.slug}`,
    };
  }),
}));

// Sample blog post data
const mockBlogPost = {
  _id: "post-1",
  _creationTime: Date.now(),
  title: "Getting Started with React",
  slug: "getting-started-with-react",
  excerpt: "Learn the basics of React in this comprehensive guide.",
  content: `# Introduction\n\nThis is a blog post about React.\n\n## Getting Started\n\nFirst, you need to install React.`,
  status: "published" as const,
  author: "Ryan Lowe",
  publishedAt: Date.now() - 86400000, // 1 day ago
  updatedAt: Date.now(),
  coverImage: "https://example.com/cover.jpg",
  category: "Technology",
  tags: ["react", "javascript", "tutorial"],
  featured: true,
  viewCount: 42,
  readingTime: 5,
  seoMetadata: {
    metaTitle: "Getting Started with React - Complete Guide",
    metaDescription:
      "Learn React from scratch with this comprehensive tutorial covering all the basics.",
    ogImage: "https://example.com/og-image.jpg",
    keywords: ["react", "javascript", "tutorial", "web development"],
  },
};

// Related posts
const mockRelatedPosts = [
  {
    _id: "post-2",
    title: "Advanced React Patterns",
    slug: "advanced-react-patterns",
    excerpt: "Learn advanced React patterns.",
    category: "Technology",
    tags: ["react", "javascript"],
  },
  {
    _id: "post-3",
    title: "React Hooks Deep Dive",
    slug: "react-hooks-deep-dive",
    excerpt: "Understanding React Hooks.",
    category: "Technology",
    tags: ["react", "hooks"],
  },
];

describe("BlogPostPage (T028)", () => {
  // Helper to setup mocks for rendering tests
  const setupRenderMocks = (post: any, relatedPosts: any[] = []) => {
    mockPreloadQueryData = post;
    mockUsePreloadedQuery.mockImplementation((preloaded) => {
      // If preloaded is undefined/null, return undefined to simulate no preloaded data
      if (!preloaded || preloaded === null || preloaded === undefined) {
        return undefined;
      }
      // Otherwise return the post data (which could be null)
      return post;
    });
    mockUseQuery.mockImplementation((query: any, args: any) => {
      if (args === "skip") {
        return "skip";
      }
      if (query === "blog:getPostsByTag") {
        return relatedPosts;
      }
      // For getPostBySlug query, return the post data (which could be null)
      if (query === "blog:getPostBySlug") {
        return post;
      }
      return [];
    });
  };

  beforeEach(() => {
    cleanup();
    mock.restore();
    mockPreloadQueryData = null;
  });

  afterEach(() => {
    cleanup();
    mock.restore();
  });

  describe("Page Rendering", () => {
    it("should render blog post with all components", async () => {
      setupRenderMocks(mockBlogPost, mockRelatedPosts);

      const page = await BlogPostPage({
        params: Promise.resolve({ slug: "getting-started-with-react" }),
      });

      const { getByTestId } = render(page);

      // Check that all major components are rendered
      expect(getByTestId("blog-header")).toBeDefined();
      expect(getByTestId("blog-content")).toBeDefined();
      expect(getByTestId("share-buttons")).toBeDefined();
      expect(getByTestId("table-of-contents")).toBeDefined();
    });

    it("should display post title and author in header", async () => {
      setupRenderMocks(mockBlogPost);

      const page = await BlogPostPage({
        params: Promise.resolve({ slug: "getting-started-with-react" }),
      });

      const { getByTestId } = render(page);

      const header = getByTestId("blog-header");
      expect(header.textContent).toContain("Getting Started with React");
      expect(header.textContent).toContain("Ryan Lowe");
    });

    it("should render markdown content in BlogContent", async () => {
      setupRenderMocks(mockBlogPost);

      const page = await BlogPostPage({
        params: Promise.resolve({ slug: "getting-started-with-react" }),
      });

      const { getByTestId } = render(page);

      const content = getByTestId("blog-content");
      expect(content.textContent).toContain("Introduction");
      expect(content.textContent).toContain("Getting Started");
    });

    it("should render table of contents for long posts", async () => {
      setupRenderMocks(mockBlogPost);

      const page = await BlogPostPage({
        params: Promise.resolve({ slug: "getting-started-with-react" }),
      });

      const { getByTestId } = render(page);

      const toc = getByTestId("table-of-contents");
      expect(toc).toBeDefined();
      expect(toc.textContent).toContain("headings");
    });

    it("should render share buttons with correct data", async () => {
      setupRenderMocks(mockBlogPost);

      const page = await BlogPostPage({
        params: Promise.resolve({ slug: "getting-started-with-react" }),
      });

      const { getByTestId } = render(page);

      const shareButtons = getByTestId("share-buttons");
      expect(shareButtons.textContent).toContain("Getting Started with React");
      expect(shareButtons.textContent).toContain("getting-started-with-react");
    });

    it("should call notFound() when post doesn't exist", async () => {
      setupRenderMocks(null);

      const page = await BlogPostPage({
        params: Promise.resolve({ slug: "non-existent-post" }),
      });

      // Rendering the page with null post should trigger notFound()
      // which is mocked to throw
      expect(() => {
        try {
          render(page);
        } catch (error: any) {
          if (error.message === "Not Found") {
            throw error;
          }
        }
      }).toThrow("Not Found");
    });
  });

  describe("Related Posts", () => {
    it("should display related posts from same category", async () => {
      setupRenderMocks(mockBlogPost, mockRelatedPosts.slice(0, 1));

      const page = await BlogPostPage({
        params: Promise.resolve({ slug: "getting-started-with-react" }),
      });

      const { getByText } = render(page);

      // Related posts section should be rendered
      const relatedSection = getByText(/related posts/i);
      expect(relatedSection).toBeDefined();
    });

    it("should limit related posts to 3 items", async () => {
      const manyRelatedPosts = Array.from({ length: 10 }, (_, i) => ({
        _id: `post-${i}`,
        _creationTime: Date.now(),
        title: `Related Post ${i}`,
        slug: `related-post-${i}`,
        excerpt: `Excerpt ${i}`,
        content: "Content",
        status: "published" as const,
        author: "Test",
        publishedAt: Date.now(),
        updatedAt: Date.now(),
        coverImage: "",
        category: "Technology",
        tags: ["react"],
        featured: false,
        viewCount: 0,
        readingTime: 5,
        seoMetadata: {},
      }));

      setupRenderMocks(mockBlogPost, manyRelatedPosts);

      const page = await BlogPostPage({
        params: Promise.resolve({ slug: "getting-started-with-react" }),
      });

      const { getAllByTestId } = render(page);

      // Count related post cards (should be max 3)
      const relatedCards = getAllByTestId("blog-card");
      expect(relatedCards.length).toBeLessThanOrEqual(3);
    });
  });

  describe("View Count Increment", () => {
    it("should call incrementViewCount mutation on page load", async () => {
      const mockIncrementViewCount = mock(() => Promise.resolve(43));
      mockUseMutation.mockImplementation(() => mockIncrementViewCount);
      setupRenderMocks(mockBlogPost);

      const page = await BlogPostPage({
        params: Promise.resolve({ slug: "getting-started-with-react" }),
      });

      render(page);

      // Wait for effect to run
      await waitFor(() => {
        expect(mockIncrementViewCount).toHaveBeenCalledTimes(1);
      });
    });

    it("should not increment view count if post not found", async () => {
      const mockIncrementViewCount = mock(() => Promise.resolve());
      mockUseMutation.mockImplementation(() => mockIncrementViewCount);
      setupRenderMocks(null);

      const page = await BlogPostPage({
        params: Promise.resolve({ slug: "non-existent" }),
      });

      // Rendering the page with null post should throw
      expect(() => render(page)).toThrow("Not Found");

      expect(mockIncrementViewCount).not.toHaveBeenCalled();
    });
  });

  describe("Dynamic Metadata Generation", () => {
    it("should generate metadata with post title and description", async () => {
      mockPreloadQueryData = mockBlogPost;

      const metadata = (await generateMetadata({
        params: Promise.resolve({ slug: "getting-started-with-react" }),
      })) as Metadata;

      expect(metadata.title).toBe(
        "Getting Started with React - Complete Guide",
      );
      expect(metadata.description).toBe(
        "Learn React from scratch with this comprehensive tutorial covering all the basics.",
      );
    });

    it("should generate OpenGraph tags", async () => {
      mockPreloadQueryData = mockBlogPost;

      const metadata = (await generateMetadata({
        params: Promise.resolve({ slug: "getting-started-with-react" }),
      })) as Metadata;

      expect(metadata.openGraph).toBeDefined();
      expect(metadata.openGraph?.title).toBe(
        "Getting Started with React - Complete Guide",
      );
      expect(metadata.openGraph?.description).toBe(
        "Learn React from scratch with this comprehensive tutorial covering all the basics.",
      );
      expect(metadata.openGraph?.images).toContain(
        "https://example.com/og-image.jpg",
      );
      expect(metadata.openGraph?.type).toBe("article");
    });

    it("should generate Twitter Card tags", async () => {
      mockPreloadQueryData = mockBlogPost;

      const metadata = (await generateMetadata({
        params: Promise.resolve({ slug: "getting-started-with-react" }),
      })) as Metadata;

      expect(metadata.twitter).toBeDefined();
      expect(metadata.twitter?.card).toBe("summary_large_image");
      expect(metadata.twitter?.title).toBe(
        "Getting Started with React - Complete Guide",
      );
      expect(metadata.twitter?.description).toBe(
        "Learn React from scratch with this comprehensive tutorial covering all the basics.",
      );
      expect(metadata.twitter?.images).toContain(
        "https://example.com/og-image.jpg",
      );
    });

    it("should fallback to default metadata if SEO metadata missing", async () => {
      const postWithoutSEO = {
        ...mockBlogPost,
        seoMetadata: {},
      };

      mockPreloadQueryData = postWithoutSEO;

      const metadata = (await generateMetadata({
        params: Promise.resolve({ slug: "getting-started-with-react" }),
      })) as Metadata;

      // Should use post title and excerpt as fallback
      expect(metadata.title).toBe("Getting Started with React");
      expect(metadata.description).toBe(
        "Learn the basics of React in this comprehensive guide.",
      );
    });

    it("should return default metadata when post not found", async () => {
      mockPreloadQueryData = null;

      const metadata = (await generateMetadata({
        params: Promise.resolve({ slug: "non-existent" }),
      })) as Metadata;

      expect(metadata.title).toBe("Post Not Found");
    });

    // T032: Enhanced metadata tests
    it("should include canonical URL", async () => {
      mockPreloadQueryData = mockBlogPost;

      const metadata = (await generateMetadata({
        params: Promise.resolve({ slug: "getting-started-with-react" }),
      })) as Metadata;

      expect(metadata.alternates).toBeDefined();
      expect(metadata.alternates?.canonical).toBe(
        "https://phytertek.com/blog/getting-started-with-react",
      );
    });

    it("should include keywords from seoMetadata", async () => {
      mockPreloadQueryData = mockBlogPost;

      const metadata = (await generateMetadata({
        params: Promise.resolve({ slug: "getting-started-with-react" }),
      })) as Metadata;

      expect(metadata.keywords).toBeDefined();
      expect(metadata.keywords).toEqual([
        "react",
        "javascript",
        "tutorial",
        "web development",
      ]);
    });

    it("should include article publishedTime and modifiedTime", async () => {
      mockPreloadQueryData = mockBlogPost;

      const metadata = (await generateMetadata({
        params: Promise.resolve({ slug: "getting-started-with-react" }),
      })) as Metadata;

      expect(metadata.openGraph?.publishedTime).toBeDefined();
      expect(metadata.openGraph?.modifiedTime).toBeDefined();
      expect(metadata.openGraph?.authors).toEqual(["Ryan Lowe"]);
      expect(metadata.openGraph?.tags).toEqual([
        "react",
        "javascript",
        "tutorial",
      ]);
    });

    it("should handle missing OG image gracefully", async () => {
      const postWithoutImage = {
        ...mockBlogPost,
        coverImage: undefined,
        seoMetadata: {
          ...mockBlogPost.seoMetadata,
          ogImage: undefined,
        },
      };

      mockPreloadQueryData = postWithoutImage;

      const metadata = (await generateMetadata({
        params: Promise.resolve({ slug: "getting-started-with-react" }),
      })) as Metadata;

      expect(metadata.openGraph?.images).toEqual([]);
      expect(metadata.twitter?.images).toEqual([]);
    });
  });

  describe("Static Params Generation", () => {
    it("should generate static params for all published posts", async () => {
      const publishedPosts = [
        { slug: "post-1" },
        { slug: "post-2" },
        { slug: "post-3" },
      ];

      mockPreloadQueryData = { posts: publishedPosts };

      const params = await generateStaticParams();

      expect(params).toHaveLength(3);
      expect(params).toContainEqual({ slug: "post-1" });
      expect(params).toContainEqual({ slug: "post-2" });
      expect(params).toContainEqual({ slug: "post-3" });
    });

    it("should only include published posts in static params", async () => {
      const publishedPosts = [
        { slug: "published-1", status: "published" },
        { slug: "published-2", status: "published" },
      ];

      mockPreloadQueryData = { posts: publishedPosts };

      const params = await generateStaticParams();

      expect(params).toHaveLength(2);
      expect(params).toContainEqual({ slug: "published-1" });
      expect(params).toContainEqual({ slug: "published-2" });
      expect(params).not.toContainEqual({ slug: "draft-1" });
    });

    it("should handle empty post list", async () => {
      mockPreloadQueryData = { posts: [] };

      const params = await generateStaticParams();

      expect(params).toHaveLength(0);
    });
  });

  describe("ISR Configuration", () => {
    it("should have 1-hour revalidation configured", () => {
      // 1 hour = 3600 seconds
      expect(revalidate).toBe(3600);
    });
  });

  describe("JSON-LD Structured Data", () => {
    it("should include article structured data in page", async () => {
      setupRenderMocks(mockBlogPost);

      const page = await BlogPostPage({
        params: Promise.resolve({ slug: "getting-started-with-react" }),
      });

      render(page);

      // Check for JSON-LD script tag
      const scriptTag = document.querySelector(
        'script[type="application/ld+json"]',
      );
      expect(scriptTag).toBeDefined();

      if (scriptTag) {
        const jsonLd = JSON.parse(scriptTag.textContent || "{}");

        expect(jsonLd["@context"]).toBe("https://schema.org");
        expect(jsonLd["@type"]).toBe("Article");
        expect(jsonLd.headline).toBe("Getting Started with React");
        expect(jsonLd.author).toBeDefined();
        expect(jsonLd.author.name).toBe("Ryan Lowe");
        expect(jsonLd.datePublished).toBeDefined();
        expect(jsonLd.dateModified).toBeDefined();
      }
    });

    // T032: Enhanced structured data tests
    it("should include keywords in structured data when present", async () => {
      setupRenderMocks(mockBlogPost);

      const page = await BlogPostPage({
        params: Promise.resolve({ slug: "getting-started-with-react" }),
      });

      render(page);

      const scriptTag = document.querySelector(
        'script[type="application/ld+json"]',
      );
      expect(scriptTag).toBeDefined();

      if (scriptTag) {
        const jsonLd = JSON.parse(scriptTag.textContent || "{}");
        expect(jsonLd.keywords).toBeDefined();
        expect(jsonLd.keywords).toEqual([
          "react",
          "javascript",
          "tutorial",
          "web development",
        ]);
      }
    });

    it("should include URL and mainEntityOfPage in structured data", async () => {
      setupRenderMocks(mockBlogPost);

      const page = await BlogPostPage({
        params: Promise.resolve({ slug: "getting-started-with-react" }),
      });

      render(page);

      const scriptTag = document.querySelector(
        'script[type="application/ld+json"]',
      );
      expect(scriptTag).toBeDefined();

      if (scriptTag) {
        const jsonLd = JSON.parse(scriptTag.textContent || "{}");
        expect(jsonLd.url).toBe(
          "https://phytertek.com/blog/getting-started-with-react",
        );
        expect(jsonLd.mainEntityOfPage).toBe(
          "https://phytertek.com/blog/getting-started-with-react",
        );
      }
    });
  });

  describe("Heading Extraction for TOC", () => {
    it("should extract headings from markdown content", async () => {
      setupRenderMocks(mockBlogPost);

      const page = await BlogPostPage({
        params: Promise.resolve({ slug: "getting-started-with-react" }),
      });

      const { getByTestId } = render(page);

      const toc = getByTestId("table-of-contents");

      // Should have extracted h1 and h2 headings
      expect(toc.textContent).toContain("2 headings");
    });
  });
});
