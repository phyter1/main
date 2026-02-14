import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Convex Schema for Admin Data
 * Defines tables for prompts, test cases, test results, and blog system
 */

export default defineSchema({
  // Admin sessions table
  sessions: defineTable({
    token: v.string(),
    expiresAt: v.number(),
  }).index("by_token", ["token"]),

  // Prompt versions table
  promptVersions: defineTable({
    agentType: v.union(v.literal("chat"), v.literal("fit-assessment")),
    prompt: v.string(),
    description: v.string(),
    author: v.string(),
    tokenCount: v.number(),
    isActive: v.boolean(),
  })
    .index("by_agent_type", ["agentType"])
    .index("by_active", ["agentType", "isActive"]),

  // Test cases table
  testCases: defineTable({
    agentType: v.union(v.literal("chat"), v.literal("fit-assessment")),
    question: v.string(),
    criteria: v.array(
      v.object({
        type: v.union(
          v.literal("contains"),
          v.literal("first-person"),
          v.literal("token-limit"),
          v.literal("max-length"),
        ),
        value: v.optional(v.union(v.string(), v.number())),
        expected: v.optional(v.boolean()),
      }),
    ),
  }).index("by_agent_type", ["agentType"]),

  // Test results table
  testResults: defineTable({
    testCaseId: v.id("testCases"),
    passed: v.boolean(),
    response: v.string(),
    tokenCount: v.number(),
    latency: v.number(),
  }).index("by_test_case", ["testCaseId"]),

  // Blog posts table
  blogPosts: defineTable({
    title: v.string(),
    slug: v.string(),
    excerpt: v.string(),
    content: v.string(),
    coverImageUrl: v.optional(v.string()),
    status: v.union(
      v.literal("draft"),
      v.literal("published"),
      v.literal("archived"),
    ),
    categoryId: v.optional(v.id("blogCategories")),
    tags: v.array(v.string()),
    author: v.string(),
    readingTimeMinutes: v.number(),
    viewCount: v.number(),
    featured: v.boolean(),
    seoMetadata: v.object({
      metaTitle: v.optional(v.string()),
      metaDescription: v.optional(v.string()),
      ogImage: v.optional(v.string()),
      keywords: v.optional(v.array(v.string())),
    }),
    // AI-powered metadata suggestions (T001)
    aiSuggestions: v.optional(
      v.object({
        excerpt: v.optional(
          v.object({
            value: v.string(),
            state: v.union(
              v.literal("pending"),
              v.literal("approved"),
              v.literal("rejected"),
            ),
          }),
        ),
        tags: v.optional(
          v.object({
            value: v.array(v.string()),
            state: v.union(
              v.literal("pending"),
              v.literal("approved"),
              v.literal("rejected"),
            ),
            rejectedTags: v.array(v.string()),
          }),
        ),
        category: v.optional(
          v.object({
            value: v.string(),
            state: v.union(
              v.literal("pending"),
              v.literal("approved"),
              v.literal("rejected"),
            ),
          }),
        ),
        seoMetadata: v.optional(
          v.object({
            metaTitle: v.optional(
              v.object({
                value: v.string(),
                state: v.union(
                  v.literal("pending"),
                  v.literal("approved"),
                  v.literal("rejected"),
                ),
              }),
            ),
            metaDescription: v.optional(
              v.object({
                value: v.string(),
                state: v.union(
                  v.literal("pending"),
                  v.literal("approved"),
                  v.literal("rejected"),
                ),
              }),
            ),
            keywords: v.optional(
              v.object({
                value: v.array(v.string()),
                state: v.union(
                  v.literal("pending"),
                  v.literal("approved"),
                  v.literal("rejected"),
                ),
              }),
            ),
          }),
        ),
        analysis: v.optional(
          v.object({
            tone: v.string(),
            readability: v.string(),
          }),
        ),
      }),
    ),
    // Change detection for triggering AI analysis
    lastAnalyzedContent: v.optional(v.string()),
    lastAnalyzedTitle: v.optional(v.string()),
    publishedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_slug", ["slug"])
    .index("by_published_date", ["status", "publishedAt"])
    .index("by_category", ["categoryId", "status"])
    .index("by_featured", ["featured", "status"])
    .searchIndex("search_posts", {
      searchField: "title",
      filterFields: ["status", "categoryId"],
    }),

  // Blog categories table
  blogCategories: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    postCount: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_post_count", ["postCount"]),

  // Blog tags table
  blogTags: defineTable({
    name: v.string(),
    slug: v.string(),
    postCount: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_post_count", ["postCount"]),
});
