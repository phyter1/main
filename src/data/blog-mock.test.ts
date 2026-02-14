import { describe, expect, it } from "vitest";
import {
  createMockBlogCategory,
  createMockBlogPost,
  createMockBlogTag,
  mockBlogCategories,
  mockBlogCategory,
  mockBlogPost,
  mockBlogPosts,
  mockBlogTag,
  mockBlogTags,
} from "./blog-mock";

describe("Blog Mock Data", () => {
  describe("mockBlogPost", () => {
    it("should have all required fields", () => {
      expect(mockBlogPost).toBeDefined();
      expect(mockBlogPost.title).toBeDefined();
      expect(mockBlogPost.slug).toBeDefined();
      expect(mockBlogPost.content).toBeDefined();
      expect(mockBlogPost.excerpt).toBeDefined();
      expect(mockBlogPost.status).toBeDefined();
      expect(mockBlogPost.author).toBeDefined();
      expect(mockBlogPost.coverImage).toBeDefined();
      expect(mockBlogPost.tags).toBeDefined();
      expect(mockBlogPost.category).toBeDefined();
      expect(mockBlogPost.readingTime).toBeDefined();
      expect(mockBlogPost.viewCount).toBeDefined();
      expect(mockBlogPost.featured).toBeDefined();
      expect(mockBlogPost.createdAt).toBeDefined();
      expect(mockBlogPost.updatedAt).toBeDefined();
    });

    it("should have valid status value", () => {
      expect(["draft", "published", "archived"]).toContain(mockBlogPost.status);
    });

    it("should have publishedAt when status is published", () => {
      if (mockBlogPost.status === "published") {
        expect(mockBlogPost.publishedAt).toBeDefined();
      }
    });

    it("should have valid SEO metadata structure", () => {
      expect(mockBlogPost.seoMetadata).toBeDefined();
      expect(mockBlogPost.seoMetadata.metaTitle).toBeDefined();
      expect(mockBlogPost.seoMetadata.metaDescription).toBeDefined();
      expect(mockBlogPost.seoMetadata.ogImage).toBeDefined();
    });

    it("should have array of tags", () => {
      expect(Array.isArray(mockBlogPost.tags)).toBe(true);
      expect(mockBlogPost.tags.length).toBeGreaterThan(0);
    });

    it("should have valid slug format (URL-safe)", () => {
      expect(mockBlogPost.slug).toMatch(/^[a-z0-9-]+$/);
    });

    it("should have positive reading time", () => {
      expect(mockBlogPost.readingTime).toBeGreaterThan(0);
    });

    it("should have non-negative view count", () => {
      expect(mockBlogPost.viewCount).toBeGreaterThanOrEqual(0);
    });

    it("should have valid timestamps", () => {
      expect(mockBlogPost.createdAt).toBeGreaterThan(0);
      expect(mockBlogPost.updatedAt).toBeGreaterThan(0);
      expect(mockBlogPost.updatedAt).toBeGreaterThanOrEqual(
        mockBlogPost.createdAt,
      );
    });
  });

  describe("mockBlogCategory", () => {
    it("should have all required fields", () => {
      expect(mockBlogCategory).toBeDefined();
      expect(mockBlogCategory.name).toBeDefined();
      expect(mockBlogCategory.slug).toBeDefined();
      expect(mockBlogCategory.description).toBeDefined();
      expect(mockBlogCategory.postCount).toBeDefined();
    });

    it("should have valid slug format", () => {
      expect(mockBlogCategory.slug).toMatch(/^[a-z0-9-]+$/);
    });

    it("should have non-negative post count", () => {
      expect(mockBlogCategory.postCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe("mockBlogTag", () => {
    it("should have all required fields", () => {
      expect(mockBlogTag).toBeDefined();
      expect(mockBlogTag.name).toBeDefined();
      expect(mockBlogTag.slug).toBeDefined();
      expect(mockBlogTag.postCount).toBeDefined();
    });

    it("should have valid slug format", () => {
      expect(mockBlogTag.slug).toMatch(/^[a-z0-9-]+$/);
    });

    it("should have non-negative post count", () => {
      expect(mockBlogTag.postCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe("mockBlogPosts array", () => {
    it("should have at least 5 posts", () => {
      expect(mockBlogPosts.length).toBeGreaterThanOrEqual(5);
    });

    it("should have varied statuses", () => {
      const statuses = mockBlogPosts.map((post) => post.status);
      const uniqueStatuses = new Set(statuses);
      expect(uniqueStatuses.size).toBeGreaterThan(1);
    });

    it("should have all posts with required fields", () => {
      for (const post of mockBlogPosts) {
        expect(post.title).toBeDefined();
        expect(post.slug).toBeDefined();
        expect(post.content).toBeDefined();
        expect(post.status).toBeDefined();
        expect(["draft", "published", "archived"]).toContain(post.status);
      }
    });

    it("should have unique slugs", () => {
      const slugs = mockBlogPosts.map((post) => post.slug);
      const uniqueSlugs = new Set(slugs);
      expect(uniqueSlugs.size).toBe(mockBlogPosts.length);
    });

    it("should have at least one featured post", () => {
      const featuredPosts = mockBlogPosts.filter((post) => post.featured);
      expect(featuredPosts.length).toBeGreaterThan(0);
    });

    it("should have at least one published post", () => {
      const publishedPosts = mockBlogPosts.filter(
        (post) => post.status === "published",
      );
      expect(publishedPosts.length).toBeGreaterThan(0);
    });

    it("should have publishedAt for all published posts", () => {
      const publishedPosts = mockBlogPosts.filter(
        (post) => post.status === "published",
      );
      for (const post of publishedPosts) {
        expect(post.publishedAt).toBeDefined();
        expect(post.publishedAt).toBeGreaterThan(0);
      }
    });
  });

  describe("mockBlogCategories array", () => {
    it("should have multiple categories", () => {
      expect(mockBlogCategories.length).toBeGreaterThanOrEqual(3);
    });

    it("should have unique slugs", () => {
      const slugs = mockBlogCategories.map((cat) => cat.slug);
      const uniqueSlugs = new Set(slugs);
      expect(uniqueSlugs.size).toBe(mockBlogCategories.length);
    });

    it("should have all categories with required fields", () => {
      for (const category of mockBlogCategories) {
        expect(category.name).toBeDefined();
        expect(category.slug).toBeDefined();
        expect(category.description).toBeDefined();
        expect(category.postCount).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe("mockBlogTags array", () => {
    it("should have multiple tags", () => {
      expect(mockBlogTags.length).toBeGreaterThanOrEqual(5);
    });

    it("should have unique slugs", () => {
      const slugs = mockBlogTags.map((tag) => tag.slug);
      const uniqueSlugs = new Set(slugs);
      expect(uniqueSlugs.size).toBe(mockBlogTags.length);
    });

    it("should have all tags with required fields", () => {
      for (const tag of mockBlogTags) {
        expect(tag.name).toBeDefined();
        expect(tag.slug).toBeDefined();
        expect(tag.postCount).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe("Helper Functions", () => {
    describe("createMockBlogPost", () => {
      it("should create a blog post with default values", () => {
        const post = createMockBlogPost();
        expect(post).toBeDefined();
        expect(post.title).toBeDefined();
        expect(post.slug).toBeDefined();
        expect(post.status).toBeDefined();
      });

      it("should allow overriding values", () => {
        const post = createMockBlogPost({
          title: "Custom Title",
          status: "draft",
          featured: true,
        });
        expect(post.title).toBe("Custom Title");
        expect(post.status).toBe("draft");
        expect(post.featured).toBe(true);
      });

      it("should generate unique slugs by default", () => {
        const post1 = createMockBlogPost();
        const post2 = createMockBlogPost();
        expect(post1.slug).not.toBe(post2.slug);
      });

      it("should not have publishedAt for draft posts", () => {
        const post = createMockBlogPost({ status: "draft" });
        expect(post.publishedAt).toBeUndefined();
      });

      it("should have publishedAt for published posts", () => {
        const post = createMockBlogPost({ status: "published" });
        expect(post.publishedAt).toBeDefined();
        expect(post.publishedAt).toBeGreaterThan(0);
      });
    });

    describe("createMockBlogCategory", () => {
      it("should create a category with default values", () => {
        const category = createMockBlogCategory();
        expect(category).toBeDefined();
        expect(category.name).toBeDefined();
        expect(category.slug).toBeDefined();
      });

      it("should allow overriding values", () => {
        const category = createMockBlogCategory({
          name: "Custom Category",
          postCount: 42,
        });
        expect(category.name).toBe("Custom Category");
        expect(category.postCount).toBe(42);
      });

      it("should generate unique slugs by default", () => {
        const cat1 = createMockBlogCategory();
        const cat2 = createMockBlogCategory();
        expect(cat1.slug).not.toBe(cat2.slug);
      });
    });

    describe("createMockBlogTag", () => {
      it("should create a tag with default values", () => {
        const tag = createMockBlogTag();
        expect(tag).toBeDefined();
        expect(tag.name).toBeDefined();
        expect(tag.slug).toBeDefined();
      });

      it("should allow overriding values", () => {
        const tag = createMockBlogTag({
          name: "Custom Tag",
          postCount: 7,
        });
        expect(tag.name).toBe("Custom Tag");
        expect(tag.postCount).toBe(7);
      });

      it("should generate unique slugs by default", () => {
        const tag1 = createMockBlogTag();
        const tag2 = createMockBlogTag();
        expect(tag1.slug).not.toBe(tag2.slug);
      });
    });
  });

  describe("Type Safety", () => {
    it("should match BlogPost type structure", () => {
      // This test validates the structure matches what Convex schema expects
      const post = mockBlogPost;

      // Required string fields
      const requiredStrings: string[] = [
        post.title,
        post.slug,
        post.content,
        post.excerpt,
        post.author,
        post.coverImage,
        post.category,
      ];
      for (const field of requiredStrings) {
        expect(typeof field).toBe("string");
      }

      // Required number fields
      expect(typeof post.readingTime).toBe("number");
      expect(typeof post.viewCount).toBe("number");
      expect(typeof post.createdAt).toBe("number");
      expect(typeof post.updatedAt).toBe("number");

      // Required boolean field
      expect(typeof post.featured).toBe("boolean");

      // Array field
      expect(Array.isArray(post.tags)).toBe(true);

      // Status enum
      expect(typeof post.status).toBe("string");

      // SEO metadata object
      expect(typeof post.seoMetadata).toBe("object");
      expect(typeof post.seoMetadata.metaTitle).toBe("string");
      expect(typeof post.seoMetadata.metaDescription).toBe("string");
      expect(typeof post.seoMetadata.ogImage).toBe("string");
    });

    it("should match BlogCategory type structure", () => {
      const category = mockBlogCategory;

      expect(typeof category.name).toBe("string");
      expect(typeof category.slug).toBe("string");
      expect(typeof category.description).toBe("string");
      expect(typeof category.postCount).toBe("number");
    });

    it("should match BlogTag type structure", () => {
      const tag = mockBlogTag;

      expect(typeof tag.name).toBe("string");
      expect(typeof tag.slug).toBe("string");
      expect(typeof tag.postCount).toBe("number");
    });
  });
});
