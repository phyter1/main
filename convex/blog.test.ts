import { beforeEach, describe, expect, it } from "bun:test";
import { ConvexTestingHelper } from "convex-helpers/testing";
import {
  createPost,
  deletePost,
  getFeaturedPosts,
  getPostBySlug,
  getPostsByTag,
  incrementViewCount,
  listPosts,
  publishPost,
  unpublishPost,
  updatePost,
  validateSlugUnique,
} from "./blog";
import schema from "./schema";

/**
 * Convex Blog Functions Tests
 *
 * Comprehensive test suite for both query (T006) and mutation (T007) functions.
 * Uses Convex testing helpers for isolated testing without deployment.
 */

describe("Blog Mutations (T007)", () => {
  let t: ConvexTestingHelper<typeof schema>;

  beforeEach(async () => {
    // Create fresh test environment for each test
    t = new ConvexTestingHelper(schema);
    await t.run(async (ctx) => {
      // Seed with a test category for foreign key relationships
      await ctx.db.insert("blogCategories", {
        name: "Technology",
        slug: "technology",
        description: "Tech posts",
        postCount: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    });
  });

  describe("createPost", () => {
    it("should create a draft post with all required fields", async () => {
      const postId = await t.mutation(createPost, {
        title: "Test Post",
        slug: "test-post",
        excerpt: "This is a test post excerpt",
        content: "# Test Post\n\nThis is the content",
        author: "Test Author",
        tags: ["test", "blog"],
        readingTimeMinutes: 5,
        seoMetadata: {
          metaTitle: "Test Post - Blog",
          metaDescription: "A test post for testing",
        },
      });

      expect(postId).toBeDefined();

      const post = await t.run(async (ctx) => await ctx.db.get(postId));
      expect(post).toBeDefined();
      expect(post?.status).toBe("draft");
      expect(post?.title).toBe("Test Post");
      expect(post?.slug).toBe("test-post");
      expect(post?.viewCount).toBe(0);
      expect(post?.featured).toBe(false);
      expect(post?.publishedAt).toBeUndefined();
      expect(post?.createdAt).toBeDefined();
      expect(post?.updatedAt).toBeDefined();
    });

    it("should reject duplicate slugs", async () => {
      // Create first post
      await t.mutation(createPost, {
        title: "First Post",
        slug: "duplicate-slug",
        excerpt: "First excerpt",
        content: "First content",
        author: "Author",
        tags: [],
        readingTimeMinutes: 1,
        seoMetadata: {},
      });

      // Try to create second post with same slug
      await expect(
        t.mutation(createPost, {
          title: "Second Post",
          slug: "duplicate-slug",
          excerpt: "Second excerpt",
          content: "Second content",
          author: "Author",
          tags: [],
          readingTimeMinutes: 1,
          seoMetadata: {},
        }),
      ).rejects.toThrow('Slug "duplicate-slug" is already in use');
    });

    it("should allow optional fields to be omitted", async () => {
      const postId = await t.mutation(createPost, {
        title: "Minimal Post",
        slug: "minimal-post",
        excerpt: "Minimal excerpt",
        content: "Minimal content",
        author: "Author",
        tags: [],
        readingTimeMinutes: 1,
        seoMetadata: {},
        // No coverImageUrl, categoryId, or featured
      });

      const post = await t.run(async (ctx) => await ctx.db.get(postId));
      expect(post?.coverImageUrl).toBeUndefined();
      expect(post?.categoryId).toBeUndefined();
      expect(post?.featured).toBe(false);
    });
  });

  describe("updatePost", () => {
    it("should update post fields", async () => {
      const postId = await t.mutation(createPost, {
        title: "Original Title",
        slug: "original-slug",
        excerpt: "Original excerpt",
        content: "Original content",
        author: "Original Author",
        tags: ["original"],
        readingTimeMinutes: 1,
        seoMetadata: {},
      });

      await t.mutation(updatePost, {
        id: postId,
        title: "Updated Title",
        excerpt: "Updated excerpt",
        tags: ["updated", "new"],
      });

      const post = await t.run(async (ctx) => await ctx.db.get(postId));
      expect(post?.title).toBe("Updated Title");
      expect(post?.excerpt).toBe("Updated excerpt");
      expect(post?.tags).toEqual(["updated", "new"]);
      expect(post?.slug).toBe("original-slug"); // Unchanged
      expect(post?.author).toBe("Original Author"); // Unchanged
    });

    it("should update the updatedAt timestamp", async () => {
      const postId = await t.mutation(createPost, {
        title: "Test Post",
        slug: "test-post",
        excerpt: "Excerpt",
        content: "Content",
        author: "Author",
        tags: [],
        readingTimeMinutes: 1,
        seoMetadata: {},
      });

      const originalPost = await t.run(async (ctx) => await ctx.db.get(postId));
      const originalUpdatedAt = originalPost?.updatedAt;

      // Wait a moment to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 10));

      await t.mutation(updatePost, {
        id: postId,
        title: "Updated Title",
      });

      const updatedPost = await t.run(async (ctx) => await ctx.db.get(postId));
      expect(updatedPost?.updatedAt).toBeGreaterThan(originalUpdatedAt || 0);
    });

    it("should validate slug uniqueness when updating", async () => {
      const post1Id = await t.mutation(createPost, {
        title: "Post 1",
        slug: "post-1",
        excerpt: "Excerpt 1",
        content: "Content 1",
        author: "Author",
        tags: [],
        readingTimeMinutes: 1,
        seoMetadata: {},
      });

      await t.mutation(createPost, {
        title: "Post 2",
        slug: "post-2",
        excerpt: "Excerpt 2",
        content: "Content 2",
        author: "Author",
        tags: [],
        readingTimeMinutes: 1,
        seoMetadata: {},
      });

      await expect(
        t.mutation(updatePost, {
          id: post1Id,
          slug: "post-2",
        }),
      ).rejects.toThrow('Slug "post-2" is already in use');
    });

    it("should allow updating to same slug (no change)", async () => {
      const postId = await t.mutation(createPost, {
        title: "Test Post",
        slug: "test-slug",
        excerpt: "Excerpt",
        content: "Content",
        author: "Author",
        tags: [],
        readingTimeMinutes: 1,
        seoMetadata: {},
      });

      await expect(
        t.mutation(updatePost, {
          id: postId,
          slug: "test-slug",
          title: "Updated Title",
        }),
      ).resolves.toBeDefined();
    });

    it("should throw error for non-existent post", async () => {
      const fakeId = "k979h1s7fzh5p12yh1s7fzh5p12y" as any;

      await expect(
        t.mutation(updatePost, {
          id: fakeId,
          title: "Updated Title",
        }),
      ).rejects.toThrow("Post not found");
    });
  });

  describe("publishPost", () => {
    it("should publish a draft post", async () => {
      const postId = await t.mutation(createPost, {
        title: "Draft Post",
        slug: "draft-post",
        excerpt: "Draft excerpt",
        content: "Draft content",
        author: "Author",
        tags: [],
        readingTimeMinutes: 1,
        seoMetadata: {},
      });

      await t.mutation(publishPost, { id: postId });

      const post = await t.run(async (ctx) => await ctx.db.get(postId));
      expect(post?.status).toBe("published");
      expect(post?.publishedAt).toBeDefined();
      expect(post?.publishedAt).toBeGreaterThan(0);
    });

    it("should set publishedAt timestamp on first publish", async () => {
      const postId = await t.mutation(createPost, {
        title: "Test Post",
        slug: "test-post",
        excerpt: "Excerpt",
        content: "Content",
        author: "Author",
        tags: [],
        readingTimeMinutes: 1,
        seoMetadata: {},
      });

      const beforePublish = await t.run(
        async (ctx) => await ctx.db.get(postId),
      );
      expect(beforePublish?.publishedAt).toBeUndefined();

      await t.mutation(publishPost, { id: postId });

      const afterPublish = await t.run(async (ctx) => await ctx.db.get(postId));
      expect(afterPublish?.publishedAt).toBeDefined();
    });

    it("should not allow publishing already published post", async () => {
      const postId = await t.mutation(createPost, {
        title: "Test Post",
        slug: "test-post",
        excerpt: "Excerpt",
        content: "Content",
        author: "Author",
        tags: [],
        readingTimeMinutes: 1,
        seoMetadata: {},
      });

      await t.mutation(publishPost, { id: postId });

      await expect(t.mutation(publishPost, { id: postId })).rejects.toThrow(
        "Post is already published",
      );
    });

    it("should not allow publishing archived post", async () => {
      const postId = await t.mutation(createPost, {
        title: "Test Post",
        slug: "test-post",
        excerpt: "Excerpt",
        content: "Content",
        author: "Author",
        tags: [],
        readingTimeMinutes: 1,
        seoMetadata: {},
      });

      await t.mutation(deletePost, { id: postId });

      await expect(t.mutation(publishPost, { id: postId })).rejects.toThrow(
        "Cannot publish archived post",
      );
    });
  });

  describe("unpublishPost", () => {
    it("should unpublish a published post", async () => {
      const postId = await t.mutation(createPost, {
        title: "Published Post",
        slug: "published-post",
        excerpt: "Excerpt",
        content: "Content",
        author: "Author",
        tags: [],
        readingTimeMinutes: 1,
        seoMetadata: {},
      });

      await t.mutation(publishPost, { id: postId });
      const published = await t.run(async (ctx) => await ctx.db.get(postId));
      const originalPublishedAt = published?.publishedAt;

      await t.mutation(unpublishPost, { id: postId });

      const unpublished = await t.run(async (ctx) => await ctx.db.get(postId));
      expect(unpublished?.status).toBe("draft");
      expect(unpublished?.publishedAt).toBe(originalPublishedAt); // Preserved
    });

    it("should not allow unpublishing draft post", async () => {
      const postId = await t.mutation(createPost, {
        title: "Draft Post",
        slug: "draft-post",
        excerpt: "Excerpt",
        content: "Content",
        author: "Author",
        tags: [],
        readingTimeMinutes: 1,
        seoMetadata: {},
      });

      await expect(t.mutation(unpublishPost, { id: postId })).rejects.toThrow(
        "Only published posts can be unpublished",
      );
    });
  });

  describe("deletePost", () => {
    it("should archive a draft post", async () => {
      const postId = await t.mutation(createPost, {
        title: "Draft Post",
        slug: "draft-post",
        excerpt: "Excerpt",
        content: "Content",
        author: "Author",
        tags: [],
        readingTimeMinutes: 1,
        seoMetadata: {},
      });

      await t.mutation(deletePost, { id: postId });

      const post = await t.run(async (ctx) => await ctx.db.get(postId));
      expect(post?.status).toBe("archived");
    });

    it("should archive a published post", async () => {
      const postId = await t.mutation(createPost, {
        title: "Published Post",
        slug: "published-post",
        excerpt: "Excerpt",
        content: "Content",
        author: "Author",
        tags: [],
        readingTimeMinutes: 1,
        seoMetadata: {},
      });

      await t.mutation(publishPost, { id: postId });
      await t.mutation(deletePost, { id: postId });

      const post = await t.run(async (ctx) => await ctx.db.get(postId));
      expect(post?.status).toBe("archived");
    });

    it("should not allow archiving already archived post", async () => {
      const postId = await t.mutation(createPost, {
        title: "Test Post",
        slug: "test-post",
        excerpt: "Excerpt",
        content: "Content",
        author: "Author",
        tags: [],
        readingTimeMinutes: 1,
        seoMetadata: {},
      });

      await t.mutation(deletePost, { id: postId });

      await expect(t.mutation(deletePost, { id: postId })).rejects.toThrow(
        "Post is already archived",
      );
    });
  });

  describe("incrementViewCount", () => {
    it("should increment view count by 1", async () => {
      const postId = await t.mutation(createPost, {
        title: "Test Post",
        slug: "test-post",
        excerpt: "Excerpt",
        content: "Content",
        author: "Author",
        tags: [],
        readingTimeMinutes: 1,
        seoMetadata: {},
      });

      const initialPost = await t.run(async (ctx) => await ctx.db.get(postId));
      expect(initialPost?.viewCount).toBe(0);

      await t.mutation(incrementViewCount, { id: postId });

      const afterFirstView = await t.run(
        async (ctx) => await ctx.db.get(postId),
      );
      expect(afterFirstView?.viewCount).toBe(1);

      await t.mutation(incrementViewCount, { id: postId });

      const afterSecondView = await t.run(
        async (ctx) => await ctx.db.get(postId),
      );
      expect(afterSecondView?.viewCount).toBe(2);
    });

    it("should return new view count", async () => {
      const postId = await t.mutation(createPost, {
        title: "Test Post",
        slug: "test-post",
        excerpt: "Excerpt",
        content: "Content",
        author: "Author",
        tags: [],
        readingTimeMinutes: 1,
        seoMetadata: {},
      });

      const newCount = await t.mutation(incrementViewCount, { id: postId });
      expect(newCount).toBe(1);

      const newCount2 = await t.mutation(incrementViewCount, { id: postId });
      expect(newCount2).toBe(2);
    });

    it("should throw error for non-existent post", async () => {
      const fakeId = "k979h1s7fzh5p12yh1s7fzh5p12y" as any;

      await expect(
        t.mutation(incrementViewCount, { id: fakeId }),
      ).rejects.toThrow("Post not found");
    });
  });

  describe("validateSlugUnique", () => {
    it("should return true for available slug", async () => {
      const isUnique = await t.query(validateSlugUnique, {
        slug: "unique-slug",
      });

      expect(isUnique).toBe(true);
    });

    it("should return false for used slug", async () => {
      await t.mutation(createPost, {
        title: "Existing Post",
        slug: "existing-slug",
        excerpt: "Excerpt",
        content: "Content",
        author: "Author",
        tags: [],
        readingTimeMinutes: 1,
        seoMetadata: {},
      });

      const isUnique = await t.query(validateSlugUnique, {
        slug: "existing-slug",
      });

      expect(isUnique).toBe(false);
    });

    it("should return true when slug matches excluded post", async () => {
      const postId = await t.mutation(createPost, {
        title: "Test Post",
        slug: "test-slug",
        excerpt: "Excerpt",
        content: "Content",
        author: "Author",
        tags: [],
        readingTimeMinutes: 1,
        seoMetadata: {},
      });

      const isUnique = await t.query(validateSlugUnique, {
        slug: "test-slug",
        excludePostId: postId,
      });

      expect(isUnique).toBe(true);
    });
  });
});

describe("Blog Queries (T006)", () => {
  let t: ConvexTestingHelper<typeof schema>;

  beforeEach(async () => {
    t = new ConvexTestingHelper(schema);
  });

  describe("listPosts", () => {
    it("should return empty array when no posts exist", async () => {
      const result = await t.query(listPosts, {});

      expect(result.posts).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.hasMore).toBe(false);
    });

    it("should list all posts by default", async () => {
      await t.mutation(createPost, {
        title: "Post 1",
        slug: "post-1",
        excerpt: "Excerpt 1",
        content: "Content 1",
        author: "Author",
        tags: [],
        readingTimeMinutes: 1,
        seoMetadata: {},
      });

      await t.mutation(createPost, {
        title: "Post 2",
        slug: "post-2",
        excerpt: "Excerpt 2",
        content: "Content 2",
        author: "Author",
        tags: [],
        readingTimeMinutes: 1,
        seoMetadata: {},
      });

      const result = await t.query(listPosts, {});

      expect(result.posts.length).toBe(2);
      expect(result.total).toBe(2);
    });

    it("should filter by status", async () => {
      const draftId = await t.mutation(createPost, {
        title: "Draft Post",
        slug: "draft-post",
        excerpt: "Draft excerpt",
        content: "Draft content",
        author: "Author",
        tags: [],
        readingTimeMinutes: 1,
        seoMetadata: {},
      });

      const publishedId = await t.mutation(createPost, {
        title: "Published Post",
        slug: "published-post",
        excerpt: "Published excerpt",
        content: "Published content",
        author: "Author",
        tags: [],
        readingTimeMinutes: 1,
        seoMetadata: {},
      });

      await t.mutation(publishPost, { id: publishedId });

      const draftResult = await t.query(listPosts, { status: "draft" });
      expect(draftResult.posts.length).toBe(1);
      expect(draftResult.posts[0]._id).toBe(draftId);

      const publishedResult = await t.query(listPosts, { status: "published" });
      expect(publishedResult.posts.length).toBe(1);
      expect(publishedResult.posts[0]._id).toBe(publishedId);
    });

    it("should apply pagination", async () => {
      // Create 5 posts
      for (let i = 0; i < 5; i++) {
        await t.mutation(createPost, {
          title: `Post ${i}`,
          slug: `post-${i}`,
          excerpt: `Excerpt ${i}`,
          content: `Content ${i}`,
          author: "Author",
          tags: [],
          readingTimeMinutes: 1,
          seoMetadata: {},
        });
      }

      const page1 = await t.query(listPosts, { limit: 2, offset: 0 });
      expect(page1.posts.length).toBe(2);
      expect(page1.total).toBe(5);
      expect(page1.hasMore).toBe(true);

      const page2 = await t.query(listPosts, { limit: 2, offset: 2 });
      expect(page2.posts.length).toBe(2);
      expect(page2.total).toBe(5);
      expect(page2.hasMore).toBe(true);

      const page3 = await t.query(listPosts, { limit: 2, offset: 4 });
      expect(page3.posts.length).toBe(1);
      expect(page3.total).toBe(5);
      expect(page3.hasMore).toBe(false);
    });
  });

  describe("getPostBySlug", () => {
    it("should return post by slug", async () => {
      await t.mutation(createPost, {
        title: "Test Post",
        slug: "test-post",
        excerpt: "Test excerpt",
        content: "Test content",
        author: "Test Author",
        tags: ["test"],
        readingTimeMinutes: 3,
        seoMetadata: {},
      });

      const post = await t.query(getPostBySlug, { slug: "test-post" });

      expect(post).toBeDefined();
      expect(post?.title).toBe("Test Post");
      expect(post?.slug).toBe("test-post");
      expect(post?.author).toBe("Test Author");
    });

    it("should return null for non-existent slug", async () => {
      const post = await t.query(getPostBySlug, { slug: "non-existent" });
      expect(post).toBeNull();
    });
  });

  describe("getFeaturedPosts", () => {
    it("should return only featured published posts", async () => {
      const featuredPublished = await t.mutation(createPost, {
        title: "Featured Published",
        slug: "featured-published",
        excerpt: "Excerpt",
        content: "Content",
        author: "Author",
        tags: [],
        readingTimeMinutes: 1,
        featured: true,
        seoMetadata: {},
      });
      await t.mutation(publishPost, { id: featuredPublished });

      await t.mutation(createPost, {
        title: "Featured Draft",
        slug: "featured-draft",
        excerpt: "Excerpt",
        content: "Content",
        author: "Author",
        tags: [],
        readingTimeMinutes: 1,
        featured: true,
        seoMetadata: {},
      });

      await t.mutation(createPost, {
        title: "Not Featured",
        slug: "not-featured",
        excerpt: "Excerpt",
        content: "Content",
        author: "Author",
        tags: [],
        readingTimeMinutes: 1,
        featured: false,
        seoMetadata: {},
      });

      const featured = await t.query(getFeaturedPosts, {});

      expect(featured.length).toBe(1);
      expect(featured[0]._id).toBe(featuredPublished);
    });
  });

  describe("getPostsByTag", () => {
    it("should return posts with specified tag", async () => {
      const post1 = await t.mutation(createPost, {
        title: "React Post",
        slug: "react-post",
        excerpt: "Excerpt",
        content: "Content",
        author: "Author",
        tags: ["react", "javascript"],
        readingTimeMinutes: 1,
        seoMetadata: {},
      });

      await t.mutation(createPost, {
        title: "Vue Post",
        slug: "vue-post",
        excerpt: "Excerpt",
        content: "Content",
        author: "Author",
        tags: ["vue", "javascript"],
        readingTimeMinutes: 1,
        seoMetadata: {},
      });

      await t.mutation(publishPost, { id: post1 });

      const reactPosts = await t.query(getPostsByTag, { tag: "react" });

      expect(reactPosts.length).toBe(1);
      expect(reactPosts[0]._id).toBe(post1);

      const jsPosts = await t.query(getPostsByTag, { tag: "javascript" });
      expect(jsPosts.length).toBe(1); // Only published posts
    });
  });
});
