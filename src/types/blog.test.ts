import { describe, expect, it } from "vitest";
import type {
  BlogCategory,
  BlogPost,
  BlogStatus,
  BlogTag,
  SEOMetadata,
} from "./blog";

/**
 * Type Tests for Blog Types
 *
 * These tests validate the structure and type constraints of blog types.
 * TypeScript compilation itself validates most type correctness, but we
 * include runtime tests to ensure the types work as expected in practice.
 */

describe("BlogStatus Type", () => {
  it("should accept valid blog status values", () => {
    const draft: BlogStatus = "draft";
    const published: BlogStatus = "published";
    const archived: BlogStatus = "archived";

    expect(draft).toBe("draft");
    expect(published).toBe("published");
    expect(archived).toBe("archived");
  });

  it("should enforce type safety for blog status", () => {
    // This test validates TypeScript compilation
    // Invalid values would fail at compile time
    const statuses: BlogStatus[] = ["draft", "published", "archived"];
    expect(statuses).toHaveLength(3);
  });
});

describe("SEOMetadata Interface", () => {
  it("should accept valid SEO metadata", () => {
    const metadata: SEOMetadata = {
      metaTitle: "Test Blog Post",
      metaDescription: "This is a test blog post description",
      ogImage: "https://example.com/image.jpg",
      keywords: ["test", "blog", "typescript"],
    };

    expect(metadata.metaTitle).toBe("Test Blog Post");
    expect(metadata.metaDescription).toBe(
      "This is a test blog post description",
    );
    expect(metadata.ogImage).toBe("https://example.com/image.jpg");
    expect(metadata.keywords).toHaveLength(3);
  });

  it("should allow optional fields to be omitted", () => {
    const minimalMetadata: SEOMetadata = {
      metaTitle: "Test Post",
      metaDescription: "Test description",
    };

    expect(minimalMetadata.ogImage).toBeUndefined();
    expect(minimalMetadata.keywords).toBeUndefined();
  });

  it("should allow all optional fields", () => {
    const fullMetadata: SEOMetadata = {
      metaTitle: "Complete Post",
      metaDescription: "Complete description",
      ogImage: "https://example.com/og.jpg",
      keywords: ["complete", "metadata"],
      canonicalUrl: "https://example.com/canonical",
      author: "Test Author",
      publishedTime: "2026-02-06T12:00:00Z",
      modifiedTime: "2026-02-06T13:00:00Z",
    };

    expect(fullMetadata.canonicalUrl).toBe("https://example.com/canonical");
    expect(fullMetadata.author).toBe("Test Author");
    expect(fullMetadata.publishedTime).toBe("2026-02-06T12:00:00Z");
    expect(fullMetadata.modifiedTime).toBe("2026-02-06T13:00:00Z");
  });
});

describe("BlogCategory Interface", () => {
  it("should accept valid blog category", () => {
    const category: BlogCategory = {
      _id: "cat_123",
      _creationTime: 1707224400000,
      name: "Technology",
      slug: "technology",
      description: "Posts about technology and software development",
      postCount: 5,
    };

    expect(category.name).toBe("Technology");
    expect(category.slug).toBe("technology");
    expect(category.postCount).toBe(5);
  });

  it("should allow optional description", () => {
    const categoryWithoutDesc: BlogCategory = {
      _id: "cat_456",
      _creationTime: 1707224400000,
      name: "Design",
      slug: "design",
      postCount: 0,
    };

    expect(categoryWithoutDesc.description).toBeUndefined();
  });
});

describe("BlogTag Interface", () => {
  it("should accept valid blog tag", () => {
    const tag: BlogTag = {
      _id: "tag_789",
      _creationTime: 1707224400000,
      name: "React",
      slug: "react",
      postCount: 12,
    };

    expect(tag.name).toBe("React");
    expect(tag.slug).toBe("react");
    expect(tag.postCount).toBe(12);
  });

  it("should work with zero post count", () => {
    const newTag: BlogTag = {
      _id: "tag_new",
      _creationTime: 1707224400000,
      name: "New Tag",
      slug: "new-tag",
      postCount: 0,
    };

    expect(newTag.postCount).toBe(0);
  });
});

describe("BlogPost Interface", () => {
  it("should accept valid complete blog post", () => {
    const post: BlogPost = {
      _id: "post_abc",
      _creationTime: 1707224400000,
      title: "Test Blog Post",
      slug: "test-blog-post",
      excerpt: "This is a test excerpt",
      content: "# Test Content\n\nThis is test content.",
      status: "published",
      author: "Ryan Lowe",
      publishedAt: 1707224400000,
      updatedAt: 1707224500000,
      coverImage: "https://example.com/cover.jpg",
      category: "Technology",
      tags: ["React", "TypeScript", "Testing"],
      featured: true,
      viewCount: 100,
      readingTime: 5,
      seoMetadata: {
        metaTitle: "Test Blog Post - SEO Title",
        metaDescription: "SEO description for test blog post",
        ogImage: "https://example.com/og-image.jpg",
        keywords: ["test", "blog", "seo"],
      },
    };

    expect(post.title).toBe("Test Blog Post");
    expect(post.status).toBe("published");
    expect(post.tags).toHaveLength(3);
    expect(post.featured).toBe(true);
    expect(post.viewCount).toBe(100);
  });

  it("should accept minimal blog post", () => {
    const minimalPost: BlogPost = {
      _id: "post_min",
      _creationTime: 1707224400000,
      title: "Minimal Post",
      slug: "minimal-post",
      excerpt: "Minimal excerpt",
      content: "Minimal content",
      status: "draft",
      author: "Ryan Lowe",
      updatedAt: 1707224400000,
      category: "Uncategorized",
      tags: [],
      featured: false,
      viewCount: 0,
      readingTime: 1,
      seoMetadata: {
        metaTitle: "Minimal Post",
        metaDescription: "Minimal description",
      },
    };

    expect(minimalPost.publishedAt).toBeUndefined();
    expect(minimalPost.coverImage).toBeUndefined();
    expect(minimalPost.tags).toHaveLength(0);
  });

  it("should support draft status", () => {
    const draft: BlogPost = {
      _id: "post_draft",
      _creationTime: 1707224400000,
      title: "Draft Post",
      slug: "draft-post",
      excerpt: "Draft excerpt",
      content: "Draft content",
      status: "draft",
      author: "Ryan Lowe",
      updatedAt: 1707224400000,
      category: "Technology",
      tags: [],
      featured: false,
      viewCount: 0,
      readingTime: 2,
      seoMetadata: {
        metaTitle: "Draft Post",
        metaDescription: "Draft description",
      },
    };

    expect(draft.status).toBe("draft");
    expect(draft.publishedAt).toBeUndefined();
  });

  it("should support archived status", () => {
    const archived: BlogPost = {
      _id: "post_archived",
      _creationTime: 1707224400000,
      title: "Archived Post",
      slug: "archived-post",
      excerpt: "Archived excerpt",
      content: "Archived content",
      status: "archived",
      author: "Ryan Lowe",
      publishedAt: 1707224400000,
      updatedAt: 1707224500000,
      category: "Technology",
      tags: ["old"],
      featured: false,
      viewCount: 500,
      readingTime: 3,
      seoMetadata: {
        metaTitle: "Archived Post",
        metaDescription: "Archived description",
      },
    };

    expect(archived.status).toBe("archived");
    expect(archived.publishedAt).toBeDefined();
  });

  it("should support all blog statuses", () => {
    const statuses: BlogStatus[] = ["draft", "published", "archived"];

    statuses.forEach((status) => {
      const post: BlogPost = {
        _id: `post_${status}`,
        _creationTime: 1707224400000,
        title: `${status} Post`,
        slug: `${status}-post`,
        excerpt: `${status} excerpt`,
        content: `${status} content`,
        status,
        author: "Ryan Lowe",
        updatedAt: 1707224400000,
        category: "Test",
        tags: [],
        featured: false,
        viewCount: 0,
        readingTime: 1,
        seoMetadata: {
          metaTitle: `${status} Post`,
          metaDescription: `${status} description`,
        },
      };

      expect(post.status).toBe(status);
    });
  });

  it("should handle empty tags array", () => {
    const postWithoutTags: BlogPost = {
      _id: "post_notags",
      _creationTime: 1707224400000,
      title: "Post Without Tags",
      slug: "post-without-tags",
      excerpt: "No tags",
      content: "Content without tags",
      status: "published",
      author: "Ryan Lowe",
      publishedAt: 1707224400000,
      updatedAt: 1707224400000,
      category: "Technology",
      tags: [],
      featured: false,
      viewCount: 10,
      readingTime: 2,
      seoMetadata: {
        metaTitle: "Post Without Tags",
        metaDescription: "Post description without tags",
      },
    };

    expect(postWithoutTags.tags).toEqual([]);
    expect(postWithoutTags.tags).toHaveLength(0);
  });

  it("should handle multiple tags", () => {
    const postWithManyTags: BlogPost = {
      _id: "post_manytags",
      _creationTime: 1707224400000,
      title: "Post With Many Tags",
      slug: "post-with-many-tags",
      excerpt: "Many tags",
      content: "Content with many tags",
      status: "published",
      author: "Ryan Lowe",
      publishedAt: 1707224400000,
      updatedAt: 1707224400000,
      category: "Technology",
      tags: [
        "React",
        "TypeScript",
        "Testing",
        "TDD",
        "Best Practices",
        "Tutorial",
      ],
      featured: false,
      viewCount: 50,
      readingTime: 8,
      seoMetadata: {
        metaTitle: "Post With Many Tags",
        metaDescription: "Post with many tags description",
      },
    };

    expect(postWithManyTags.tags).toHaveLength(6);
    expect(postWithManyTags.tags).toContain("React");
    expect(postWithManyTags.tags).toContain("TypeScript");
  });

  it("should support view count tracking", () => {
    const popularPost: BlogPost = {
      _id: "post_popular",
      _creationTime: 1707224400000,
      title: "Popular Post",
      slug: "popular-post",
      excerpt: "Very popular",
      content: "Popular content",
      status: "published",
      author: "Ryan Lowe",
      publishedAt: 1707224400000,
      updatedAt: 1707224400000,
      category: "Technology",
      tags: ["popular"],
      featured: true,
      viewCount: 10000,
      readingTime: 10,
      seoMetadata: {
        metaTitle: "Popular Post",
        metaDescription: "A very popular post",
      },
    };

    expect(popularPost.viewCount).toBe(10000);
    expect(popularPost.featured).toBe(true);
  });

  it("should support reading time calculation", () => {
    const longPost: BlogPost = {
      _id: "post_long",
      _creationTime: 1707224400000,
      title: "Long Post",
      slug: "long-post",
      excerpt: "This is a long post",
      content: "Very long content...",
      status: "published",
      author: "Ryan Lowe",
      publishedAt: 1707224400000,
      updatedAt: 1707224400000,
      category: "Technology",
      tags: ["long-form"],
      featured: false,
      viewCount: 100,
      readingTime: 25,
      seoMetadata: {
        metaTitle: "Long Post",
        metaDescription: "A long form post",
      },
    };

    expect(longPost.readingTime).toBe(25);
  });
});

describe("Type Compilation", () => {
  it("should compile with all types exported", () => {
    // This test ensures all types are properly exported and can be imported
    const status: BlogStatus = "published";
    const metadata: SEOMetadata = {
      metaTitle: "Test",
      metaDescription: "Test description",
    };
    const category: BlogCategory = {
      _id: "cat_test",
      _creationTime: 1707224400000,
      name: "Test",
      slug: "test",
      postCount: 0,
    };
    const tag: BlogTag = {
      _id: "tag_test",
      _creationTime: 1707224400000,
      name: "Test",
      slug: "test",
      postCount: 0,
    };
    const post: BlogPost = {
      _id: "post_test",
      _creationTime: 1707224400000,
      title: "Test",
      slug: "test",
      excerpt: "Test",
      content: "Test",
      status: "draft",
      author: "Test",
      updatedAt: 1707224400000,
      category: "Test",
      tags: [],
      featured: false,
      viewCount: 0,
      readingTime: 1,
      seoMetadata: metadata,
    };

    expect(status).toBeDefined();
    expect(metadata).toBeDefined();
    expect(category).toBeDefined();
    expect(tag).toBeDefined();
    expect(post).toBeDefined();
  });
});
