/**
 * Blog Sitemap Tests (T033)
 *
 * Test suite for blog sitemap generation utility functions.
 * Validates URL generation, date formatting, and sitemap entry structure.
 */

import { beforeEach, describe, expect, it } from "vitest";
import type { BlogCategory, BlogPost, BlogTag } from "@/types/blog";
import {
  generateBlogSitemapEntries,
  generateCategoryUrl,
  generatePostUrl,
  generateTagUrl,
} from "./blog-sitemap";

describe("blog-sitemap", () => {
  const baseUrl = "https://ryn.phytertek.com";

  describe("generatePostUrl", () => {
    it("should generate correct post URL from slug", () => {
      const url = generatePostUrl("getting-started-with-react", baseUrl);
      expect(url).toBe(
        "https://ryn.phytertek.com/blog/getting-started-with-react",
      );
    });

    it("should handle slugs with special characters", () => {
      const url = generatePostUrl("ai-first-development-2024", baseUrl);
      expect(url).toBe(
        "https://ryn.phytertek.com/blog/ai-first-development-2024",
      );
    });

    it("should use default base URL if not provided", () => {
      const url = generatePostUrl("test-post");
      expect(url).toContain("/blog/test-post");
    });
  });

  describe("generateCategoryUrl", () => {
    it("should generate correct category URL from slug", () => {
      const url = generateCategoryUrl("technology", baseUrl);
      expect(url).toBe("https://ryn.phytertek.com/blog/category/technology");
    });

    it("should handle multi-word category slugs", () => {
      const url = generateCategoryUrl("ai-development", baseUrl);
      expect(url).toBe(
        "https://ryn.phytertek.com/blog/category/ai-development",
      );
    });

    it("should use default base URL if not provided", () => {
      const url = generateCategoryUrl("design");
      expect(url).toContain("/blog/category/design");
    });
  });

  describe("generateTagUrl", () => {
    it("should generate correct tag URL from slug", () => {
      const url = generateTagUrl("react", baseUrl);
      expect(url).toBe("https://ryn.phytertek.com/blog/tag/react");
    });

    it("should handle multi-word tag slugs", () => {
      const url = generateTagUrl("typescript-tips", baseUrl);
      expect(url).toBe("https://ryn.phytertek.com/blog/tag/typescript-tips");
    });

    it("should use default base URL if not provided", () => {
      const url = generateTagUrl("nextjs");
      expect(url).toContain("/blog/tag/nextjs");
    });
  });

  describe("generateBlogSitemapEntries", () => {
    let mockPosts: BlogPost[];
    let mockCategories: BlogCategory[];
    let mockTags: BlogTag[];

    beforeEach(() => {
      // Create mock blog posts
      mockPosts = [
        {
          _id: "post1" as any,
          _creationTime: Date.now(),
          title: "Getting Started with React",
          slug: "getting-started-with-react",
          excerpt: "Learn React basics",
          content: "Content here",
          status: "published",
          author: "Ryan Lowe",
          publishedAt: new Date("2024-01-15").getTime(),
          updatedAt: new Date("2024-01-20").getTime(),
          category: "technology",
          tags: ["react", "javascript"],
          featured: true,
          viewCount: 100,
          readingTime: 5,
          seoMetadata: {
            metaTitle: "Getting Started with React",
            metaDescription: "Learn React basics",
          },
        },
        {
          _id: "post2" as any,
          _creationTime: Date.now(),
          title: "TypeScript Best Practices",
          slug: "typescript-best-practices",
          excerpt: "Learn TypeScript",
          content: "Content here",
          status: "published",
          author: "Ryan Lowe",
          publishedAt: new Date("2024-02-01").getTime(),
          updatedAt: new Date("2024-02-05").getTime(),
          category: "programming",
          tags: ["typescript", "best-practices"],
          featured: false,
          viewCount: 50,
          readingTime: 8,
          seoMetadata: {
            metaTitle: "TypeScript Best Practices",
            metaDescription: "Learn TypeScript",
          },
        },
      ];

      // Create mock categories
      mockCategories = [
        {
          _id: "cat1" as any,
          _creationTime: Date.now(),
          name: "Technology",
          slug: "technology",
          description: "Tech posts",
          postCount: 5,
        },
        {
          _id: "cat2" as any,
          _creationTime: Date.now(),
          name: "Programming",
          slug: "programming",
          description: "Programming posts",
          postCount: 3,
        },
      ];

      // Create mock tags
      mockTags = [
        {
          _id: "tag1" as any,
          _creationTime: Date.now(),
          name: "React",
          slug: "react",
          postCount: 4,
        },
        {
          _id: "tag2" as any,
          _creationTime: Date.now(),
          name: "TypeScript",
          slug: "typescript",
          postCount: 6,
        },
      ];
    });

    it("should generate sitemap entries for all blog content", () => {
      const entries = generateBlogSitemapEntries({
        posts: mockPosts,
        categories: mockCategories,
        tags: mockTags,
        baseUrl,
      });

      // Should include: blog listing (1) + posts (2) + categories (2) + tags (2) = 7 entries
      expect(entries.length).toBe(7);
    });

    it("should include blog listing page with correct priority", () => {
      const entries = generateBlogSitemapEntries({
        posts: mockPosts,
        categories: mockCategories,
        tags: mockTags,
        baseUrl,
      });

      const listingEntry = entries.find((e) => e.url === `${baseUrl}/blog`);
      expect(listingEntry).toBeDefined();
      expect(listingEntry?.priority).toBe(0.9);
      expect(listingEntry?.changeFrequency).toBe("daily");
    });

    it("should include all published blog posts with correct priority", () => {
      const entries = generateBlogSitemapEntries({
        posts: mockPosts,
        categories: mockCategories,
        tags: mockTags,
        baseUrl,
      });

      const postEntries = entries.filter(
        (e) =>
          e.url.includes("/blog/") &&
          !e.url.includes("/category/") &&
          !e.url.includes("/tag/"),
      );
      expect(postEntries.length).toBe(2);

      for (const entry of postEntries) {
        expect(entry.priority).toBe(0.8);
        expect(entry.changeFrequency).toBe("monthly");
      }
    });

    it("should use publishedAt date for post lastModified", () => {
      const entries = generateBlogSitemapEntries({
        posts: mockPosts,
        categories: mockCategories,
        tags: mockTags,
        baseUrl,
      });

      const post1Entry = entries.find((e) =>
        e.url.includes("getting-started-with-react"),
      );
      expect(post1Entry).toBeDefined();
      expect(post1Entry?.lastModified).toBeInstanceOf(Date);
      expect(post1Entry?.lastModified.getTime()).toBe(mockPosts[0].publishedAt);
    });

    it("should include all category pages", () => {
      const entries = generateBlogSitemapEntries({
        posts: mockPosts,
        categories: mockCategories,
        tags: mockTags,
        baseUrl,
      });

      const categoryEntries = entries.filter((e) =>
        e.url.includes("/blog/category/"),
      );
      expect(categoryEntries.length).toBe(2);

      const techCategoryEntry = categoryEntries.find((e) =>
        e.url.includes("technology"),
      );
      expect(techCategoryEntry).toBeDefined();
      expect(techCategoryEntry?.priority).toBe(0.7);
      expect(techCategoryEntry?.changeFrequency).toBe("weekly");
    });

    it("should include all tag pages", () => {
      const entries = generateBlogSitemapEntries({
        posts: mockPosts,
        categories: mockCategories,
        tags: mockTags,
        baseUrl,
      });

      const tagEntries = entries.filter((e) => e.url.includes("/blog/tag/"));
      expect(tagEntries.length).toBe(2);

      const reactTagEntry = tagEntries.find((e) => e.url.includes("react"));
      expect(reactTagEntry).toBeDefined();
      expect(reactTagEntry?.priority).toBe(0.6);
      expect(reactTagEntry?.changeFrequency).toBe("weekly");
    });

    it("should handle empty posts array", () => {
      const entries = generateBlogSitemapEntries({
        posts: [],
        categories: mockCategories,
        tags: mockTags,
        baseUrl,
      });

      // Should still include listing, categories, and tags
      expect(entries.length).toBeGreaterThan(0);
      const listingEntry = entries.find((e) => e.url === `${baseUrl}/blog`);
      expect(listingEntry).toBeDefined();
    });

    it("should handle empty categories array", () => {
      const entries = generateBlogSitemapEntries({
        posts: mockPosts,
        categories: [],
        tags: mockTags,
        baseUrl,
      });

      const categoryEntries = entries.filter((e) =>
        e.url.includes("/blog/category/"),
      );
      expect(categoryEntries.length).toBe(0);
    });

    it("should handle empty tags array", () => {
      const entries = generateBlogSitemapEntries({
        posts: mockPosts,
        categories: mockCategories,
        tags: [],
        baseUrl,
      });

      const tagEntries = entries.filter((e) => e.url.includes("/blog/tag/"));
      expect(tagEntries.length).toBe(0);
    });

    it("should use updatedAt as fallback if publishedAt is missing", () => {
      const postWithoutPublishedAt = {
        ...mockPosts[0],
        publishedAt: undefined,
      };

      const entries = generateBlogSitemapEntries({
        posts: [postWithoutPublishedAt],
        categories: [],
        tags: [],
        baseUrl,
      });

      const postEntry = entries.find((e) =>
        e.url.includes("getting-started-with-react"),
      );
      expect(postEntry).toBeDefined();
      expect(postEntry?.lastModified.getTime()).toBe(
        postWithoutPublishedAt.updatedAt,
      );
    });

    it("should validate sitemap entry structure", () => {
      const entries = generateBlogSitemapEntries({
        posts: mockPosts,
        categories: mockCategories,
        tags: mockTags,
        baseUrl,
      });

      for (const entry of entries) {
        // Validate required fields
        expect(entry.url).toBeDefined();
        expect(typeof entry.url).toBe("string");
        expect(entry.url.startsWith("http")).toBe(true);

        expect(entry.lastModified).toBeInstanceOf(Date);
        expect(entry.changeFrequency).toBeDefined();
        expect(entry.priority).toBeDefined();
        expect(entry.priority).toBeGreaterThanOrEqual(0);
        expect(entry.priority).toBeLessThanOrEqual(1);
      }
    });

    it("should use correct changeFrequency for each type", () => {
      const entries = generateBlogSitemapEntries({
        posts: mockPosts,
        categories: mockCategories,
        tags: mockTags,
        baseUrl,
      });

      const listingEntry = entries.find((e) => e.url === `${baseUrl}/blog`);
      expect(listingEntry?.changeFrequency).toBe("daily");

      const postEntry = entries.find((e) =>
        e.url.includes("getting-started-with-react"),
      );
      expect(postEntry?.changeFrequency).toBe("monthly");

      const categoryEntry = entries.find((e) =>
        e.url.includes("/blog/category/"),
      );
      expect(categoryEntry?.changeFrequency).toBe("weekly");

      const tagEntry = entries.find((e) => e.url.includes("/blog/tag/"));
      expect(tagEntry?.changeFrequency).toBe("weekly");
    });
  });
});
