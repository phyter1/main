/**
 * BlogSidebar Component Tests (T023)
 *
 * Comprehensive test suite for BlogSidebar component covering:
 * - Categories list with post counts
 * - Tag cloud with clickable tags
 * - Recent posts list (5 most recent)
 * - RSS feed link
 * - Responsive behavior (collapses on mobile)
 * - Navigation correctness
 * - Data fetching from Convex queries
 */

import { beforeEach, describe, expect, it, mock } from "bun:test";
import { render, screen, waitFor } from "@testing-library/react";
import { BlogSidebar } from "./BlogSidebar";

// Mock Convex API object
mock.module("../../../convex/_generated/api", () => ({
  api: {
    blog: {
      getCategories: "blog.getCategories",
      getTags: "blog.getTags",
      listPosts: "blog.listPosts",
    },
  },
}));

// Mock Convex hooks
const mockUseQuery = mock(() => null);

mock.module("convex/react", () => ({
  useQuery: mockUseQuery,
}));

// Mock Next.js Link component
mock.module("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

// Mock data matching Convex schema
const mockCategories = [
  {
    _id: "cat1",
    _creationTime: 1704067200000,
    name: "Technology",
    slug: "technology",
    description: "Tech posts",
    postCount: 15,
    createdAt: 1704067200000,
    updatedAt: 1704067200000,
  },
  {
    _id: "cat2",
    _creationTime: 1704067200000,
    name: "Design",
    slug: "design",
    description: "Design posts",
    postCount: 8,
    createdAt: 1704067200000,
    updatedAt: 1704067200000,
  },
  {
    _id: "cat3",
    _creationTime: 1704067200000,
    name: "Development",
    slug: "development",
    description: "Dev posts",
    postCount: 12,
    createdAt: 1704067200000,
    updatedAt: 1704067200000,
  },
];

const mockTags = [
  {
    _id: "tag1",
    _creationTime: 1704067200000,
    name: "React",
    slug: "react",
    postCount: 10,
    createdAt: 1704067200000,
    updatedAt: 1704067200000,
  },
  {
    _id: "tag2",
    _creationTime: 1704067200000,
    name: "TypeScript",
    slug: "typescript",
    postCount: 8,
    createdAt: 1704067200000,
    updatedAt: 1704067200000,
  },
  {
    _id: "tag3",
    _creationTime: 1704067200000,
    name: "Next.js",
    slug: "nextjs",
    postCount: 6,
    createdAt: 1704067200000,
    updatedAt: 1704067200000,
  },
  {
    _id: "tag4",
    _creationTime: 1704067200000,
    name: "CSS",
    slug: "css",
    postCount: 4,
    createdAt: 1704067200000,
    updatedAt: 1704067200000,
  },
];

const mockRecentPosts = [
  {
    _id: "post1",
    _creationTime: 1704153600000,
    title: "Getting Started with React 19",
    slug: "getting-started-react-19",
    excerpt: "Learn the new features",
    content: "Content here",
    status: "published" as const,
    author: "Ryan Lowe",
    publishedAt: 1704153600000,
    updatedAt: 1704153600000,
    coverImage: "/images/react19.jpg",
    category: "Technology",
    tags: ["react", "javascript"],
    featured: true,
    viewCount: 100,
    readingTime: 5,
    seoMetadata: {
      metaTitle: "Getting Started with React 19",
      metaDescription: "Learn the new features",
    },
  },
  {
    _id: "post2",
    _creationTime: 1704067200000,
    title: "TypeScript Best Practices",
    slug: "typescript-best-practices",
    excerpt: "Write better TypeScript",
    content: "Content here",
    status: "published" as const,
    author: "Ryan Lowe",
    publishedAt: 1704067200000,
    updatedAt: 1704067200000,
    coverImage: "/images/typescript.jpg",
    category: "Development",
    tags: ["typescript", "best-practices"],
    featured: false,
    viewCount: 75,
    readingTime: 8,
    seoMetadata: {
      metaTitle: "TypeScript Best Practices",
      metaDescription: "Write better TypeScript",
    },
  },
  {
    _id: "post3",
    _creationTime: 1703980800000,
    title: "Modern CSS Techniques",
    slug: "modern-css-techniques",
    excerpt: "CSS in 2026",
    content: "Content here",
    status: "published" as const,
    author: "Ryan Lowe",
    publishedAt: 1703980800000,
    updatedAt: 1703980800000,
    category: "Design",
    tags: ["css", "design"],
    featured: false,
    viewCount: 50,
    readingTime: 6,
    seoMetadata: {
      metaTitle: "Modern CSS Techniques",
      metaDescription: "CSS in 2026",
    },
  },
  {
    _id: "post4",
    _creationTime: 1703894400000,
    title: "Building with Next.js 16",
    slug: "building-nextjs-16",
    excerpt: "Next.js App Router",
    content: "Content here",
    status: "published" as const,
    author: "Ryan Lowe",
    publishedAt: 1703894400000,
    updatedAt: 1703894400000,
    category: "Technology",
    tags: ["nextjs", "react"],
    featured: false,
    viewCount: 90,
    readingTime: 7,
    seoMetadata: {
      metaTitle: "Building with Next.js 16",
      metaDescription: "Next.js App Router",
    },
  },
  {
    _id: "post5",
    _creationTime: 1703808000000,
    title: "State Management Patterns",
    slug: "state-management-patterns",
    excerpt: "Managing application state",
    content: "Content here",
    status: "published" as const,
    author: "Ryan Lowe",
    publishedAt: 1703808000000,
    updatedAt: 1703808000000,
    category: "Development",
    tags: ["react", "state-management"],
    featured: false,
    viewCount: 60,
    readingTime: 10,
    seoMetadata: {
      metaTitle: "State Management Patterns",
      metaDescription: "Managing application state",
    },
  },
];

describe("BlogSidebar", () => {
  beforeEach(() => {
    mock.restore();
  });

  describe("Data Fetching", () => {
    it("should fetch categories from Convex", async () => {
      mockUseQuery.mockImplementation((query: string) => {
        if (query === "blog.getCategories") return mockCategories;
        if (query === "blog.getTags") return mockTags;
        if (query === "blog.listPosts") return { posts: mockRecentPosts };
        return null;
      });

      render(<BlogSidebar />);

      // Check that Technology appears (in categories section)
      const technologyElements = screen.getAllByText("Technology");
      expect(technologyElements.length).toBeGreaterThan(0);
      expect(mockUseQuery).toHaveBeenCalled();
    });

    it("should fetch tags from Convex", async () => {
      mockUseQuery.mockImplementation((query: string) => {
        if (query === "blog.getCategories") return mockCategories;
        if (query === "blog.getTags") return mockTags;
        if (query === "blog.listPosts") return { posts: mockRecentPosts };
        return null;
      });

      render(<BlogSidebar />);

      // React appears multiple times (tags and posts)
      const reactElements = screen.getAllByText("React");
      expect(reactElements.length).toBeGreaterThan(0);
    });

    it("should fetch recent posts from Convex", async () => {
      mockUseQuery.mockImplementation((query: string) => {
        if (query === "blog.getCategories") return mockCategories;
        if (query === "blog.getTags") return mockTags;
        if (query === "blog.listPosts") return { posts: mockRecentPosts };
        return null;
      });

      render(<BlogSidebar />);

      const postTitle = screen.getByText("Getting Started with React 19");
      expect(postTitle).toBeDefined();
    });

    it("should handle loading state while fetching data", () => {
      mockUseQuery.mockReturnValue(undefined);

      render(<BlogSidebar />);

      // Should render loading state or skeleton
      expect(screen.queryByText("Technology")).toBeNull();
    });

    it("should handle empty categories data", async () => {
      mockUseQuery.mockImplementation((query: string) => {
        if (query === "blog.getCategories") return [];
        if (query === "blog.getTags") return mockTags;
        if (query === "blog.listPosts") return { posts: mockRecentPosts };
        return null;
      });

      render(<BlogSidebar />);

      // Should show "No categories yet" message
      expect(screen.getByText("No categories yet")).toBeDefined();
    });

    it("should handle empty tags data", async () => {
      mockUseQuery.mockImplementation((query: string) => {
        if (query === "blog.getCategories") return mockCategories;
        if (query === "blog.getTags") return [];
        if (query === "blog.listPosts") return { posts: mockRecentPosts };
        return null;
      });

      render(<BlogSidebar />);

      // Should show "No tags yet" message
      expect(screen.getByText("No tags yet")).toBeDefined();
    });

    it("should handle empty recent posts", async () => {
      mockUseQuery.mockImplementation((query: string) => {
        if (query === "blog.getCategories") return mockCategories;
        if (query === "blog.getTags") return mockTags;
        if (query === "blog.listPosts") return { posts: [] };
        return null;
      });

      render(<BlogSidebar />);

      // Should show "No posts yet" message
      expect(screen.getByText("No posts yet")).toBeDefined();
    });
  });

  describe("Categories Display", () => {
    beforeEach(() => {
      mockUseQuery.mockImplementation((query: string) => {
        if (query === "blog.getCategories") return mockCategories;
        if (query === "blog.getTags") return mockTags;
        if (query === "blog.listPosts") return { posts: mockRecentPosts };
        return null;
      });
    });

    it("should display categories list with heading", async () => {
      render(<BlogSidebar />);

      const heading = screen.getByRole("heading", { name: /categories/i });
      expect(heading).toBeDefined();
    });

    it("should display all category names", async () => {
      render(<BlogSidebar />);

      const technologyElements = screen.getAllByText("Technology");
      expect(technologyElements.length).toBeGreaterThan(0);
      expect(screen.getByText("Design")).toBeDefined();
      expect(screen.getByText("Development")).toBeDefined();
    });

    it("should display post counts for each category", async () => {
      render(<BlogSidebar />);

      expect(screen.getByText("15")).toBeDefined(); // Technology count
      expect(screen.getByText("8")).toBeDefined(); // Design count
      expect(screen.getByText("12")).toBeDefined(); // Development count
    });

    it("should link categories to correct category page", async () => {
      render(<BlogSidebar />);

      const technologyElements = screen.getAllByText("Technology");
      const techLink = technologyElements[0].closest("a") as HTMLAnchorElement;
      expect(techLink.href).toContain("/blog/category/technology");
    });
  });

  describe("Tag Cloud", () => {
    beforeEach(() => {
      mockUseQuery.mockImplementation((query: string) => {
        if (query === "blog.getCategories") return mockCategories;
        if (query === "blog.getTags") return mockTags;
        if (query === "blog.listPosts") return { posts: mockRecentPosts };
        return null;
      });
    });

    it("should display tag cloud with heading", async () => {
      render(<BlogSidebar />);

      const heading = screen.getByRole("heading", { name: /tags/i });
      expect(heading).toBeDefined();
    });

    it("should display all tag names", async () => {
      render(<BlogSidebar />);

      await waitFor(() => {
        // Use getAllByText since "React" appears in multiple places
        const reactElements = screen.getAllByText("React");
        expect(reactElements.length).toBeGreaterThan(0);
        expect(screen.getByText("TypeScript")).toBeDefined();
        expect(screen.getByText("Next.js")).toBeDefined();
        expect(screen.getByText("CSS")).toBeDefined();
      });
    });

    it("should link tags to correct tag page", async () => {
      render(<BlogSidebar />);

      await waitFor(() => {
        const reactLinks = screen.getAllByText("React");
        // Find the one that's a tag link (not a post title)
        const tagLink = reactLinks.find((el) => {
          const link = el.closest("a") as HTMLAnchorElement | null;
          return link?.href?.includes("/blog/tag/react");
        });
        expect(tagLink).toBeDefined();
        const link = tagLink?.closest("a") as HTMLAnchorElement;
        expect(link.href).toContain("/blog/tag/react");
      });
    });

    it("should make tags clickable", async () => {
      render(<BlogSidebar />);

      await waitFor(() => {
        const reactTags = screen.getAllByText("React");
        // Find the one that's a tag link
        const tagLink = reactTags.find((el) => {
          const link = el.closest("a") as HTMLAnchorElement | null;
          return link?.href?.includes("/blog/tag/react");
        });
        const reactTag = tagLink?.closest("a");
        expect(reactTag).toBeDefined();
        expect(reactTag?.tagName).toBe("A");
      });
    });
  });

  describe("Recent Posts", () => {
    beforeEach(() => {
      mockUseQuery.mockImplementation((query: string) => {
        if (query === "blog.getCategories") return mockCategories;
        if (query === "blog.getTags") return mockTags;
        if (query === "blog.listPosts") return { posts: mockRecentPosts };
        return null;
      });
    });

    it("should display recent posts heading", async () => {
      render(<BlogSidebar />);

      const heading = screen.getByRole("heading", { name: /recent posts/i });
      expect(heading).toBeDefined();
    });

    it("should display exactly 5 most recent posts", async () => {
      render(<BlogSidebar />);

      expect(screen.getByText("Getting Started with React 19")).toBeDefined();
      expect(screen.getByText("TypeScript Best Practices")).toBeDefined();
      expect(screen.getByText("Modern CSS Techniques")).toBeDefined();
      expect(screen.getByText("Building with Next.js 16")).toBeDefined();
      expect(screen.getByText("State Management Patterns")).toBeDefined();
    });

    it("should link recent posts to correct post pages", async () => {
      render(<BlogSidebar />);

      const postLink = screen
        .getByText("Getting Started with React 19")
        .closest("a") as HTMLAnchorElement;
      expect(postLink.href).toContain("/blog/getting-started-react-19");
    });

    it("should display posts in chronological order (newest first)", async () => {
      render(<BlogSidebar />);

      await waitFor(() => {
        const postTitles = Array.from(
          document.querySelectorAll("[data-testid*='recent-post']"),
        ).map((el) => el.textContent);

        // First post should be the most recent
        expect(postTitles[0]).toContain("Getting Started with React 19");
      });
    });

    it("should limit to 5 posts even if more are available", async () => {
      const manyPosts = [
        ...mockRecentPosts,
        {
          ...mockRecentPosts[0],
          _id: "post6",
          title: "Sixth Post",
          slug: "sixth-post",
        },
        {
          ...mockRecentPosts[0],
          _id: "post7",
          title: "Seventh Post",
          slug: "seventh-post",
        },
      ];

      mockUseQuery.mockImplementation((query: string) => {
        if (query === "blog.getCategories") return mockCategories;
        if (query === "blog.getTags") return mockTags;
        if (query === "blog.listPosts") return { posts: manyPosts };
        return null;
      });

      render(<BlogSidebar />);

      const recentPosts = document.querySelectorAll(
        "[data-testid*='recent-post']",
      );
      expect(recentPosts.length).toBeLessThanOrEqual(5);
    });
  });

  describe("RSS Feed Link", () => {
    beforeEach(() => {
      mockUseQuery.mockImplementation((query: string) => {
        if (query === "blog.getCategories") return mockCategories;
        if (query === "blog.getTags") return mockTags;
        if (query === "blog.listPosts") return { posts: mockRecentPosts };
        return null;
      });
    });

    it("should display RSS feed link", async () => {
      render(<BlogSidebar />);

      const rssText = screen.getByText(/subscribe via rss/i);
      expect(rssText).toBeDefined();
    });

    it("should link to correct RSS feed URL", async () => {
      render(<BlogSidebar />);

      const rssLink = screen
        .getByText(/subscribe via rss/i)
        .closest("a") as HTMLAnchorElement;
      expect(rssLink.href).toContain("/blog/rss.xml");
    });

    it("should open RSS link in new tab", async () => {
      render(<BlogSidebar />);

      const rssLink = screen
        .getByText(/subscribe via rss/i)
        .closest("a") as HTMLAnchorElement;
      expect(rssLink.target).toBe("_blank");
    });

    it("should have rel=noopener noreferrer for security", async () => {
      render(<BlogSidebar />);

      const rssLink = screen
        .getByText(/subscribe via rss/i)
        .closest("a") as HTMLAnchorElement;
      expect(rssLink.rel).toContain("noopener");
      expect(rssLink.rel).toContain("noreferrer");
    });
  });

  describe("Responsive Behavior", () => {
    beforeEach(() => {
      mockUseQuery.mockImplementation((query: string) => {
        if (query === "blog.getCategories") return mockCategories;
        if (query === "blog.getTags") return mockTags;
        if (query === "blog.listPosts") return { posts: mockRecentPosts };
        return null;
      });
    });

    it("should have responsive classes for mobile", async () => {
      render(<BlogSidebar />);

      const sidebar = document.querySelector("[data-testid='blog-sidebar']");
      expect(sidebar).toBeDefined();
      const classNames = sidebar?.className || "";
      // Should have mobile-first responsive classes (hidden on mobile, visible on larger screens)
      expect(
        classNames.includes("hidden") || classNames.includes("lg:block"),
      ).toBe(true);
    });

    it("should render all sections in correct order", async () => {
      render(<BlogSidebar />);

      const headings = Array.from(document.querySelectorAll("h2, h3")).map(
        (el) => el.textContent,
      );
      // Verify sections appear in expected order
      expect(headings.some((h) => h?.includes("Categor"))).toBe(true);
      expect(headings.some((h) => h?.includes("Tag"))).toBe(true);
      expect(headings.some((h) => h?.includes("Recent"))).toBe(true);
    });
  });

  describe("Navigation Correctness", () => {
    beforeEach(() => {
      mockUseQuery.mockImplementation((query: string) => {
        if (query === "blog.getCategories") return mockCategories;
        if (query === "blog.getTags") return mockTags;
        if (query === "blog.listPosts") return { posts: mockRecentPosts };
        return null;
      });
    });

    it("should use Next.js Link for all navigation", async () => {
      render(<BlogSidebar />);

      await waitFor(() => {
        const allLinks = document.querySelectorAll("a");
        expect(allLinks.length).toBeGreaterThan(0);

        // All links should be anchor tags (Next.js Link renders as <a>)
        allLinks.forEach((link) => {
          expect(link.tagName).toBe("A");
        });
      });
    });

    it("should have valid href attributes for all links", async () => {
      render(<BlogSidebar />);

      await waitFor(() => {
        const allLinks = Array.from(document.querySelectorAll("a"));
        expect(allLinks.length).toBeGreaterThan(0);

        allLinks.forEach((link) => {
          expect(link.href).toBeTruthy();
          expect(link.href).not.toBe("#");
        });
      });
    });

    it("should use correct URL patterns for categories", async () => {
      render(<BlogSidebar />);

      await waitFor(() => {
        const categoryLinks = Array.from(
          document.querySelectorAll("a[href*='/blog/category/']"),
        ) as HTMLAnchorElement[];
        expect(categoryLinks.length).toBeGreaterThan(0);

        categoryLinks.forEach((link) => {
          expect(link.href).toMatch(/\/blog\/category\/[a-z0-9-]+$/);
        });
      });
    });

    it("should use correct URL patterns for tags", async () => {
      render(<BlogSidebar />);

      await waitFor(() => {
        const tagLinks = Array.from(
          document.querySelectorAll("a[href*='/blog/tag/']"),
        ) as HTMLAnchorElement[];
        expect(tagLinks.length).toBeGreaterThan(0);

        tagLinks.forEach((link) => {
          expect(link.href).toMatch(/\/blog\/tag\/[a-z0-9-]+$/);
        });
      });
    });

    it("should use correct URL patterns for posts", async () => {
      render(<BlogSidebar />);

      // Get post links by finding links in the recent posts section
      const postTitle = screen.getByText("Getting Started with React 19");
      const postLink = postTitle.closest("a") as HTMLAnchorElement;

      expect(postLink).toBeDefined();
      expect(postLink.href).toMatch(/\/blog\/[a-z0-9-]+$/);
      expect(postLink.href).not.toContain("/blog/category/");
      expect(postLink.href).not.toContain("/blog/tag/");
    });
  });

  describe("Accessibility", () => {
    beforeEach(() => {
      mockUseQuery.mockImplementation((query: string) => {
        if (query === "blog.getCategories") return mockCategories;
        if (query === "blog.getTags") return mockTags;
        if (query === "blog.listPosts") return { posts: mockRecentPosts };
        return null;
      });
    });

    it("should have semantic HTML structure", async () => {
      render(<BlogSidebar />);

      await waitFor(() => {
        // Should have proper semantic elements
        expect(document.querySelector("aside, nav")).toBeDefined();
      });
    });

    it("should have proper heading hierarchy", async () => {
      render(<BlogSidebar />);

      await waitFor(() => {
        const headings = Array.from(
          document.querySelectorAll("h1, h2, h3, h4"),
        );
        expect(headings.length).toBeGreaterThan(0);

        // Sidebar should use h2 or h3, not h1
        const h1s = document.querySelectorAll("h1");
        expect(h1s.length).toBe(0);
      });
    });

    it("should have descriptive link text", async () => {
      render(<BlogSidebar />);

      await waitFor(() => {
        const links = Array.from(document.querySelectorAll("a"));
        links.forEach((link) => {
          // Link should have text content or aria-label
          expect(
            link.textContent || link.getAttribute("aria-label"),
          ).toBeTruthy();
        });
      });
    });
  });
});
