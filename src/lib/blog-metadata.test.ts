/**
 * Tests for blog metadata generation
 *
 * T032: Dynamic metadata generation for blog posts
 * Tests metadata generation, fallback behavior, and SEO compliance
 */

import { describe, expect, it } from "vitest";
import type { BlogPost } from "@/types/blog";
import {
  generateArticleStructuredData,
  generateBlogMetadata,
  generateCanonicalUrl,
} from "./blog-metadata";

describe("blog-metadata", () => {
  const mockBlogPost: BlogPost = {
    _id: "test-post-id",
    _creationTime: Date.now(),
    title: "Getting Started with TypeScript",
    slug: "getting-started-with-typescript",
    excerpt:
      "Learn TypeScript fundamentals and best practices for modern web development.",
    content: "# Getting Started\n\nTypeScript is amazing...",
    status: "published",
    author: "Ryan Lowe",
    publishedAt: 1704067200000, // 2024-01-01
    updatedAt: 1704153600000, // 2024-01-02
    coverImage: "https://example.com/cover.jpg",
    category: "Technology",
    tags: ["TypeScript", "Web Development", "Tutorial"],
    featured: true,
    viewCount: 100,
    readingTime: 5,
    seoMetadata: {
      metaTitle: "TypeScript Guide - Complete Tutorial",
      metaDescription:
        "Complete guide to TypeScript for modern web development with examples and best practices.",
      ogImage: "https://example.com/og-image.jpg",
      keywords: ["typescript", "javascript", "web development"],
      canonicalUrl:
        "https://phytertek.com/blog/getting-started-with-typescript",
      author: "Ryan Lowe",
      publishedTime: "2024-01-01T00:00:00.000Z",
      modifiedTime: "2024-01-02T00:00:00.000Z",
    },
  };

  describe("generateBlogMetadata", () => {
    it("should use seoMetadata fields when present", () => {
      const metadata = generateBlogMetadata(mockBlogPost);

      expect(metadata.title).toBe("TypeScript Guide - Complete Tutorial");
      expect(metadata.description).toBe(
        "Complete guide to TypeScript for modern web development with examples and best practices.",
      );
    });

    it("should fall back to post fields when seoMetadata is missing", () => {
      const postWithoutSEO: BlogPost = {
        ...mockBlogPost,
        seoMetadata: {
          metaTitle: "",
          metaDescription: "",
        },
      };

      const metadata = generateBlogMetadata(postWithoutSEO);

      expect(metadata.title).toBe("Getting Started with TypeScript");
      expect(metadata.description).toBe(
        "Learn TypeScript fundamentals and best practices for modern web development.",
      );
    });

    it("should generate OpenGraph tags", () => {
      const metadata = generateBlogMetadata(mockBlogPost);

      expect(metadata.openGraph).toBeDefined();
      expect(metadata.openGraph?.title).toBe(
        "TypeScript Guide - Complete Tutorial",
      );
      expect(metadata.openGraph?.description).toBe(
        "Complete guide to TypeScript for modern web development with examples and best practices.",
      );
      expect(metadata.openGraph?.type).toBe("article");
      expect(metadata.openGraph?.url).toBe(
        "https://phytertek.com/blog/getting-started-with-typescript",
      );
      expect(metadata.openGraph?.images).toEqual([
        "https://example.com/og-image.jpg",
      ]);
    });

    it("should include article OpenGraph metadata", () => {
      const metadata = generateBlogMetadata(mockBlogPost);

      expect(metadata.openGraph?.publishedTime).toBe(
        "2024-01-01T00:00:00.000Z",
      );
      expect(metadata.openGraph?.modifiedTime).toBe("2024-01-02T00:00:00.000Z");
      expect(metadata.openGraph?.authors).toEqual(["Ryan Lowe"]);
      expect(metadata.openGraph?.tags).toEqual([
        "TypeScript",
        "Web Development",
        "Tutorial",
      ]);
    });

    it("should generate Twitter Card tags", () => {
      const metadata = generateBlogMetadata(mockBlogPost);

      expect(metadata.twitter).toBeDefined();
      expect(metadata.twitter?.card).toBe("summary_large_image");
      expect(metadata.twitter?.title).toBe(
        "TypeScript Guide - Complete Tutorial",
      );
      expect(metadata.twitter?.description).toBe(
        "Complete guide to TypeScript for modern web development with examples and best practices.",
      );
      expect(metadata.twitter?.images).toEqual([
        "https://example.com/og-image.jpg",
      ]);
    });

    it("should handle missing cover image gracefully", () => {
      const postWithoutImage: BlogPost = {
        ...mockBlogPost,
        coverImage: undefined,
        seoMetadata: {
          ...mockBlogPost.seoMetadata,
          ogImage: undefined,
        },
      };

      const metadata = generateBlogMetadata(postWithoutImage);

      expect(metadata.openGraph?.images).toEqual([]);
      expect(metadata.twitter?.images).toEqual([]);
    });

    it("should fall back to coverImage when ogImage is missing", () => {
      const postWithCoverOnly: BlogPost = {
        ...mockBlogPost,
        seoMetadata: {
          ...mockBlogPost.seoMetadata,
          ogImage: undefined,
        },
      };

      const metadata = generateBlogMetadata(postWithCoverOnly);

      expect(metadata.openGraph?.images).toEqual([
        "https://example.com/cover.jpg",
      ]);
      expect(metadata.twitter?.images).toEqual([
        "https://example.com/cover.jpg",
      ]);
    });

    it("should include canonical URL", () => {
      const metadata = generateBlogMetadata(mockBlogPost);

      expect(metadata.alternates).toBeDefined();
      expect(metadata.alternates?.canonical).toBe(
        "https://phytertek.com/blog/getting-started-with-typescript",
      );
    });

    it("should generate canonical URL from slug when not in seoMetadata", () => {
      const postWithoutCanonical: BlogPost = {
        ...mockBlogPost,
        seoMetadata: {
          ...mockBlogPost.seoMetadata,
          canonicalUrl: undefined,
        },
      };

      const metadata = generateBlogMetadata(postWithoutCanonical);

      expect(metadata.alternates?.canonical).toBe(
        "https://phytertek.com/blog/getting-started-with-typescript",
      );
    });

    it("should include keywords when present", () => {
      const metadata = generateBlogMetadata(mockBlogPost);

      expect(metadata.keywords).toEqual([
        "typescript",
        "javascript",
        "web development",
      ]);
    });

    it("should handle missing keywords gracefully", () => {
      const postWithoutKeywords: BlogPost = {
        ...mockBlogPost,
        seoMetadata: {
          ...mockBlogPost.seoMetadata,
          keywords: undefined,
        },
      };

      const metadata = generateBlogMetadata(postWithoutKeywords);

      expect(metadata.keywords).toBeUndefined();
    });

    it("should handle unpublished posts gracefully", () => {
      const draftPost: BlogPost = {
        ...mockBlogPost,
        status: "draft",
        publishedAt: undefined,
        seoMetadata: {
          ...mockBlogPost.seoMetadata,
          publishedTime: undefined,
        },
      };

      const metadata = generateBlogMetadata(draftPost);

      expect(metadata.openGraph?.publishedTime).toBeUndefined();
    });
  });

  describe("generateArticleStructuredData", () => {
    it("should generate valid JSON-LD article structured data", () => {
      const structuredData = generateArticleStructuredData(mockBlogPost);

      expect(structuredData["@context"]).toBe("https://schema.org");
      expect(structuredData["@type"]).toBe("Article");
      expect(structuredData.headline).toBe("Getting Started with TypeScript");
      expect(structuredData.description).toBe(
        "Learn TypeScript fundamentals and best practices for modern web development.",
      );
    });

    it("should include author information", () => {
      const structuredData = generateArticleStructuredData(mockBlogPost);

      expect(structuredData.author).toBeDefined();
      expect(structuredData.author["@type"]).toBe("Person");
      expect(structuredData.author.name).toBe("Ryan Lowe");
    });

    it("should include published and modified dates", () => {
      const structuredData = generateArticleStructuredData(mockBlogPost);

      expect(structuredData.datePublished).toBe("2024-01-01T00:00:00.000Z");
      expect(structuredData.dateModified).toBe("2024-01-02T00:00:00.000Z");
    });

    it("should include image when present", () => {
      const structuredData = generateArticleStructuredData(mockBlogPost);

      expect(structuredData.image).toBe("https://example.com/cover.jpg");
    });

    it("should handle missing image gracefully", () => {
      const postWithoutImage: BlogPost = {
        ...mockBlogPost,
        coverImage: undefined,
      };

      const structuredData = generateArticleStructuredData(postWithoutImage);

      expect(structuredData.image).toBeUndefined();
    });

    it("should include keywords when present", () => {
      const structuredData = generateArticleStructuredData(mockBlogPost);

      expect(structuredData.keywords).toEqual([
        "typescript",
        "javascript",
        "web development",
      ]);
    });

    it("should handle unpublished posts gracefully", () => {
      const draftPost: BlogPost = {
        ...mockBlogPost,
        status: "draft",
        publishedAt: undefined,
      };

      const structuredData = generateArticleStructuredData(draftPost);

      expect(structuredData.datePublished).toBeUndefined();
    });

    it("should include article URL", () => {
      const structuredData = generateArticleStructuredData(mockBlogPost);

      expect(structuredData.url).toBe(
        "https://phytertek.com/blog/getting-started-with-typescript",
      );
      expect(structuredData.mainEntityOfPage).toBe(
        "https://phytertek.com/blog/getting-started-with-typescript",
      );
    });
  });

  describe("generateCanonicalUrl", () => {
    it("should use seoMetadata canonical URL when present", () => {
      const url = generateCanonicalUrl(mockBlogPost);

      expect(url).toBe(
        "https://phytertek.com/blog/getting-started-with-typescript",
      );
    });

    it("should generate canonical URL from slug when not in seoMetadata", () => {
      const postWithoutCanonical: BlogPost = {
        ...mockBlogPost,
        seoMetadata: {
          ...mockBlogPost.seoMetadata,
          canonicalUrl: undefined,
        },
      };

      const url = generateCanonicalUrl(postWithoutCanonical);

      expect(url).toBe(
        "https://phytertek.com/blog/getting-started-with-typescript",
      );
    });

    it("should handle slugs with special characters", () => {
      const postWithSpecialChars: BlogPost = {
        ...mockBlogPost,
        slug: "test-post-with-numbers-123",
        seoMetadata: {
          ...mockBlogPost.seoMetadata,
          canonicalUrl: undefined,
        },
      };

      const url = generateCanonicalUrl(postWithSpecialChars);

      expect(url).toBe("https://phytertek.com/blog/test-post-with-numbers-123");
    });
  });

  describe("edge cases and validation", () => {
    it("should handle empty seoMetadata object", () => {
      const postWithEmptySEO: BlogPost = {
        ...mockBlogPost,
        seoMetadata: {
          metaTitle: "",
          metaDescription: "",
        },
      };

      const metadata = generateBlogMetadata(postWithEmptySEO);

      expect(metadata.title).toBe("Getting Started with TypeScript");
      expect(metadata.description).toBe(
        "Learn TypeScript fundamentals and best practices for modern web development.",
      );
    });

    it("should handle posts with minimal data", () => {
      const minimalPost: BlogPost = {
        _id: "minimal-id",
        _creationTime: Date.now(),
        title: "Minimal Post",
        slug: "minimal-post",
        excerpt: "Short excerpt",
        content: "Content",
        status: "published",
        author: "Author",
        updatedAt: Date.now(),
        category: "General",
        tags: [],
        featured: false,
        viewCount: 0,
        readingTime: 1,
        seoMetadata: {
          metaTitle: "",
          metaDescription: "",
        },
      };

      const metadata = generateBlogMetadata(minimalPost);

      expect(metadata.title).toBe("Minimal Post");
      expect(metadata.description).toBe("Short excerpt");
      expect(metadata.openGraph?.images).toEqual([]);
    });

    it("should handle very long titles and descriptions appropriately", () => {
      const postWithLongText: BlogPost = {
        ...mockBlogPost,
        title: "A".repeat(200), // Very long title
        excerpt: "B".repeat(500), // Very long excerpt
      };

      const metadata = generateBlogMetadata(postWithLongText);

      expect(metadata.title).toBeDefined();
      expect(metadata.description).toBeDefined();
    });
  });
});
