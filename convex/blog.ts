import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Convex Blog Functions
 *
 * Complete implementation of blog system queries and mutations including:
 * - T006: Query functions for listing, filtering, and searching posts
 * - T007: Mutation functions for CRUD operations and view tracking
 */

// ============================================================================
// T006: QUERY FUNCTIONS
// ============================================================================

/**
 * List blog posts with optional filtering and pagination
 *
 * Supports filtering by status, category, and pagination.
 * Returns posts ordered by publishedAt (desc) for published posts,
 * or updatedAt (desc) for drafts.
 */
export const listPosts = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("published"),
        v.literal("archived"),
      ),
    ),
    category: v.optional(v.string()),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { status, category, limit = 20, offset = 0 } = args;

    let query = ctx.db.query("blogPosts");

    // Filter by status if provided
    if (status) {
      query = query.withIndex("by_status", (q) => q.eq("status", status));
    }

    // Collect all results
    let posts = await query.collect();

    // Filter by category if provided
    if (category) {
      posts = posts.filter((post) => post.categoryId === category);
    }

    // Sort by appropriate date field
    posts.sort((a, b) => {
      if (status === "published" && a.publishedAt && b.publishedAt) {
        return b.publishedAt - a.publishedAt;
      }
      return b.updatedAt - a.updatedAt;
    });

    // Apply pagination
    const paginatedPosts = posts.slice(offset, offset + limit);

    return {
      posts: paginatedPosts,
      total: posts.length,
      hasMore: offset + limit < posts.length,
    };
  },
});

/**
 * Get a single blog post by its slug
 *
 * Returns the full post data or null if not found.
 * Does NOT increment view count - use incrementViewCount separately.
 */
export const getPostBySlug = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db
      .query("blogPosts")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    return post || null;
  },
});

/**
 * Get featured published posts
 *
 * Returns all published posts marked as featured,
 * ordered by publishedAt (most recent first).
 */
export const getFeaturedPosts = query({
  args: {},
  handler: async (ctx) => {
    const posts = await ctx.db
      .query("blogPosts")
      .withIndex("by_featured", (q) =>
        q.eq("featured", true).eq("status", "published"),
      )
      .collect();

    // Sort by publishedAt descending
    return posts.sort((a, b) => {
      const aTime = a.publishedAt || 0;
      const bTime = b.publishedAt || 0;
      return bTime - aTime;
    });
  },
});

/**
 * Search blog posts using full-text search
 *
 * Searches post titles using Convex's search index.
 * Only searches published posts by default.
 */
export const searchPosts = query({
  args: {
    searchQuery: v.string(),
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("published"),
        v.literal("archived"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const { searchQuery, status = "published" } = args;

    const results = await ctx.db
      .query("blogPosts")
      .withSearchIndex("search_posts", (q) =>
        q.search("title", searchQuery).eq("status", status),
      )
      .collect();

    return results;
  },
});

/**
 * Get blog posts by tag
 *
 * Returns all posts that include the specified tag.
 * Only returns published posts by default.
 */
export const getPostsByTag = query({
  args: {
    tag: v.string(),
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("published"),
        v.literal("archived"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const { tag, status = "published" } = args;

    const allPosts = await ctx.db
      .query("blogPosts")
      .withIndex("by_status", (q) => q.eq("status", status))
      .collect();

    // Filter posts that include this tag
    const postsWithTag = allPosts.filter((post) => post.tags.includes(tag));

    // Sort by publishedAt descending for published posts
    if (status === "published") {
      postsWithTag.sort((a, b) => {
        const aTime = a.publishedAt || 0;
        const bTime = b.publishedAt || 0;
        return bTime - aTime;
      });
    }

    return postsWithTag;
  },
});

/**
 * Get all blog categories with post counts
 *
 * Returns all categories ordered by post count (descending).
 */
export const getCategories = query({
  args: {},
  handler: async (ctx) => {
    const categories = await ctx.db.query("blogCategories").collect();

    // Sort by post count descending
    return categories.sort((a, b) => b.postCount - a.postCount);
  },
});

/**
 * Get all blog tags with post counts
 *
 * Returns all tags ordered by post count (descending).
 */
export const getTags = query({
  args: {},
  handler: async (ctx) => {
    const tags = await ctx.db.query("blogTags").collect();

    // Sort by post count descending
    return tags.sort((a, b) => b.postCount - a.postCount);
  },
});

// ============================================================================
// T007: MUTATION FUNCTIONS
// ============================================================================

/**
 * Create a new blog post as a draft
 *
 * Validates all required fields and automatically:
 * - Sets status to "draft"
 * - Sets timestamps (createdAt, updatedAt)
 * - Validates slug uniqueness
 * - Sets default values for optional fields
 */
export const createPost = mutation({
  args: {
    title: v.string(),
    slug: v.string(),
    excerpt: v.string(),
    content: v.string(),
    coverImageUrl: v.optional(v.string()),
    categoryId: v.optional(v.id("blogCategories")),
    tags: v.array(v.string()),
    author: v.string(),
    readingTimeMinutes: v.number(),
    featured: v.optional(v.boolean()),
    seoMetadata: v.object({
      metaTitle: v.optional(v.string()),
      metaDescription: v.optional(v.string()),
      ogImage: v.optional(v.string()),
      keywords: v.optional(v.array(v.string())),
    }),
  },
  handler: async (ctx, args) => {
    // Validate slug uniqueness
    const existingPost = await ctx.db
      .query("blogPosts")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (existingPost) {
      throw new Error(`Slug "${args.slug}" is already in use`);
    }

    // Create post with default values
    const now = Date.now();
    const postId = await ctx.db.insert("blogPosts", {
      title: args.title,
      slug: args.slug,
      excerpt: args.excerpt,
      content: args.content,
      coverImageUrl: args.coverImageUrl,
      status: "draft",
      categoryId: args.categoryId,
      tags: args.tags,
      author: args.author,
      readingTimeMinutes: args.readingTimeMinutes,
      viewCount: 0,
      featured: args.featured || false,
      seoMetadata: args.seoMetadata,
      publishedAt: undefined,
      createdAt: now,
      updatedAt: now,
    });

    return postId;
  },
});

/**
 * Update an existing blog post
 *
 * Allows partial updates to most fields.
 * Automatically updates the updatedAt timestamp.
 * Cannot change status (use publishPost/unpublishPost instead).
 */
export const updatePost = mutation({
  args: {
    id: v.id("blogPosts"),
    title: v.optional(v.string()),
    slug: v.optional(v.string()),
    excerpt: v.optional(v.string()),
    content: v.optional(v.string()),
    coverImageUrl: v.optional(v.string()),
    categoryId: v.optional(v.id("blogCategories")),
    tags: v.optional(v.array(v.string())),
    author: v.optional(v.string()),
    readingTimeMinutes: v.optional(v.number()),
    featured: v.optional(v.boolean()),
    seoMetadata: v.optional(
      v.object({
        metaTitle: v.optional(v.string()),
        metaDescription: v.optional(v.string()),
        ogImage: v.optional(v.string()),
        keywords: v.optional(v.array(v.string())),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    // Check if post exists
    const existingPost = await ctx.db.get(id);
    if (!existingPost) {
      throw new Error("Post not found");
    }

    // If slug is being updated, validate uniqueness
    if (updates.slug && updates.slug !== existingPost.slug) {
      const slugInUse = await ctx.db
        .query("blogPosts")
        .withIndex("by_slug", (q) => q.eq("slug", updates.slug))
        .first();

      if (slugInUse) {
        throw new Error(`Slug "${updates.slug}" is already in use`);
      }
    }

    // Update post with new timestamp
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });

    return id;
  },
});

/**
 * Publish a blog post
 *
 * Changes status from "draft" to "published" and sets publishedAt timestamp.
 * Can only publish draft posts.
 */
export const publishPost = mutation({
  args: {
    id: v.id("blogPosts"),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.id);

    if (!post) {
      throw new Error("Post not found");
    }

    if (post.status === "published") {
      throw new Error("Post is already published");
    }

    if (post.status === "archived") {
      throw new Error("Cannot publish archived post. Restore it first.");
    }

    const now = Date.now();
    await ctx.db.patch(args.id, {
      status: "published",
      publishedAt: post.publishedAt || now, // Preserve original publish date if republishing
      updatedAt: now,
    });

    return args.id;
  },
});

/**
 * Unpublish a blog post
 *
 * Changes status from "published" back to "draft".
 * Preserves the original publishedAt timestamp.
 */
export const unpublishPost = mutation({
  args: {
    id: v.id("blogPosts"),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.id);

    if (!post) {
      throw new Error("Post not found");
    }

    if (post.status !== "published") {
      throw new Error("Only published posts can be unpublished");
    }

    await ctx.db.patch(args.id, {
      status: "draft",
      updatedAt: Date.now(),
    });

    return args.id;
  },
});

/**
 * Delete (archive) a blog post
 *
 * Performs soft delete by changing status to "archived".
 * Archived posts are not visible but can be restored.
 */
export const deletePost = mutation({
  args: {
    id: v.id("blogPosts"),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.id);

    if (!post) {
      throw new Error("Post not found");
    }

    if (post.status === "archived") {
      throw new Error("Post is already archived");
    }

    await ctx.db.patch(args.id, {
      status: "archived",
      updatedAt: Date.now(),
    });

    return args.id;
  },
});

/**
 * Increment view count for a blog post
 *
 * Atomically increments the viewCount field.
 * Called when a user views a post page.
 */
export const incrementViewCount = mutation({
  args: {
    id: v.id("blogPosts"),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.id);

    if (!post) {
      throw new Error("Post not found");
    }

    await ctx.db.patch(args.id, {
      viewCount: post.viewCount + 1,
    });

    return post.viewCount + 1;
  },
});

/**
 * Validate that a slug is unique
 *
 * Returns true if slug is available, false if already in use.
 * Used for client-side validation during post creation/editing.
 */
export const validateSlugUnique = query({
  args: {
    slug: v.string(),
    excludePostId: v.optional(v.id("blogPosts")),
  },
  handler: async (ctx, args) => {
    const existingPost = await ctx.db
      .query("blogPosts")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    // If no post found, slug is available
    if (!existingPost) {
      return true;
    }

    // If post found but it's the one we're editing, slug is available
    if (args.excludePostId && existingPost._id === args.excludePostId) {
      return true;
    }

    // Slug is in use by another post
    return false;
  },
});

// ============================================================================
// T008: CATEGORY AND TAG MUTATIONS
// ============================================================================

/**
 * Create a new blog category
 *
 * Generates a URL-safe slug from the category name and creates
 * a new category with postCount initialized to 0.
 *
 * @param name - Category display name
 * @param description - Category description
 * @returns ID of the created category
 */
export const createCategory = mutation({
  args: {
    name: v.string(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    // Validate name is not empty
    if (!args.name.trim()) {
      throw new Error("Category name cannot be empty");
    }

    // Generate slug from name
    const slug = generateSlug(args.name);

    // Validate slug is valid
    const slugValidation = validateSlug(slug);
    if (!slugValidation.isValid) {
      throw new Error(`Invalid slug: ${slugValidation.error}`);
    }

    // Check for duplicate slug
    const existing = await ctx.db
      .query("blogCategories")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();

    if (existing) {
      throw new Error(`Category with slug "${slug}" already exists`);
    }

    const now = Date.now();

    // Create category
    const categoryId = await ctx.db.insert("blogCategories", {
      name: args.name.trim(),
      slug,
      description: args.description.trim(),
      postCount: 0,
      createdAt: now,
      updatedAt: now,
    });

    return categoryId;
  },
});

/**
 * Update an existing blog category
 *
 * Updates name and/or description. If name changes, regenerates slug
 * and validates uniqueness.
 *
 * @param id - Category ID to update
 * @param name - New category name (optional)
 * @param description - New category description (optional)
 */
export const updateCategory = mutation({
  args: {
    id: v.id("blogCategories"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Fetch existing category
    const category = await ctx.db.get(args.id);
    if (!category) {
      throw new Error("Category not found");
    }

    // Build update object
    const updates: {
      name?: string;
      slug?: string;
      description?: string;
      updatedAt: number;
    } = {
      updatedAt: Date.now(),
    };

    // Handle name update (requires slug regeneration)
    if (args.name !== undefined) {
      const trimmedName = args.name.trim();
      if (!trimmedName) {
        throw new Error("Category name cannot be empty");
      }

      const newSlug = generateSlug(trimmedName);

      // Validate new slug
      const slugValidation = validateSlug(newSlug);
      if (!slugValidation.isValid) {
        throw new Error(`Invalid slug: ${slugValidation.error}`);
      }

      // Check for duplicate slug (excluding current category)
      if (newSlug !== category.slug) {
        const existing = await ctx.db
          .query("blogCategories")
          .withIndex("by_slug", (q) => q.eq("slug", newSlug))
          .first();

        if (existing && existing._id !== args.id) {
          throw new Error(`Category with slug "${newSlug}" already exists`);
        }

        updates.slug = newSlug;
      }

      updates.name = trimmedName;
    }

    // Handle description update
    if (args.description !== undefined) {
      updates.description = args.description.trim();
    }

    // Apply updates
    await ctx.db.patch(args.id, updates);
  },
});

/**
 * Delete a blog category
 *
 * Removes a category from the database. Note: This does not update
 * posts that reference this category. Consider updating or archiving
 * posts before deleting categories.
 *
 * @param id - Category ID to delete
 */
export const deleteCategory = mutation({
  args: {
    id: v.id("blogCategories"),
  },
  handler: async (ctx, args) => {
    const category = await ctx.db.get(args.id);
    if (!category) {
      throw new Error("Category not found");
    }

    await ctx.db.delete(args.id);
  },
});

/**
 * Create a new blog tag
 *
 * Generates a URL-safe slug from the tag name and creates
 * a new tag with postCount initialized to 0.
 *
 * @param name - Tag display name
 * @returns ID of the created tag
 */
export const createTag = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    // Validate name is not empty
    if (!args.name.trim()) {
      throw new Error("Tag name cannot be empty");
    }

    // Generate slug from name
    const slug = generateSlug(args.name);

    // Validate slug is valid
    const slugValidation = validateSlug(slug);
    if (!slugValidation.isValid) {
      throw new Error(`Invalid slug: ${slugValidation.error}`);
    }

    // Check for duplicate slug
    const existing = await ctx.db
      .query("blogTags")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();

    if (existing) {
      throw new Error(`Tag with slug "${slug}" already exists`);
    }

    const now = Date.now();

    // Create tag
    const tagId = await ctx.db.insert("blogTags", {
      name: args.name.trim(),
      slug,
      postCount: 0,
      createdAt: now,
      updatedAt: now,
    });

    return tagId;
  },
});

/**
 * Delete a blog tag
 *
 * Removes a tag from the database. Note: This does not update
 * posts that reference this tag. Consider removing tag from posts
 * before deletion.
 *
 * @param id - Tag ID to delete
 */
export const deleteTag = mutation({
  args: {
    id: v.id("blogTags"),
  },
  handler: async (ctx, args) => {
    const tag = await ctx.db.get(args.id);
    if (!tag) {
      throw new Error("Tag not found");
    }

    await ctx.db.delete(args.id);
  },
});

/**
 * Update post counts for all categories and tags
 *
 * Recalculates postCount for all categories and tags based on
 * published posts. This should be called periodically or after
 * bulk post operations to keep counts accurate.
 *
 * Categories: Count posts with matching categoryId and status="published"
 * Tags: Count published posts that include the tag in their tags array
 */
export const updatePostCounts = mutation({
  args: {},
  handler: async (ctx) => {
    // Get all published posts
    const posts = await ctx.db
      .query("blogPosts")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .collect();

    // Update category counts
    const categories = await ctx.db.query("blogCategories").collect();

    for (const category of categories) {
      const count = posts.filter(
        (post) => post.categoryId === category._id,
      ).length;
      await ctx.db.patch(category._id, {
        postCount: count,
        updatedAt: Date.now(),
      });
    }

    // Update tag counts
    const tags = await ctx.db.query("blogTags").collect();

    for (const tag of tags) {
      const count = posts.filter((post) => post.tags.includes(tag.slug)).length;
      await ctx.db.patch(tag._id, {
        postCount: count,
        updatedAt: Date.now(),
      });
    }
  },
});

/**
 * Generate URL-safe slug from text
 *
 * Converts text into a URL-safe slug by:
 * - Converting to lowercase
 * - Replacing spaces with hyphens
 * - Removing special characters
 * - Handling unicode/accented characters
 * - Preventing consecutive hyphens
 *
 * @param text - Text to convert to slug
 * @returns URL-safe slug
 */
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 200)
    .replace(/-+$/g, "");
}

/**
 * Validate slug format
 *
 * @param slug - Slug to validate
 * @returns Validation result with isValid and optional error message
 */
function validateSlug(slug: string): { isValid: boolean; error?: string } {
  if (!slug) {
    return { isValid: false, error: "Slug cannot be empty" };
  }

  if (slug.length > 200) {
    return {
      isValid: false,
      error: "Slug is too long (maximum 200 characters)",
    };
  }

  if (!/^[a-z0-9-]+$/.test(slug)) {
    return {
      isValid: false,
      error: "Slug can only contain lowercase letters, numbers, and hyphens",
    };
  }

  if (/^-|-$/.test(slug)) {
    return { isValid: false, error: "Slug cannot start or end with a hyphen" };
  }

  if (/--/.test(slug)) {
    return {
      isValid: false,
      error: "Slug cannot contain consecutive hyphens",
    };
  }

  return { isValid: true };
}
