import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { PromptVersionSchema } from "./validators";

/**
 * Save a new prompt version
 */
export const saveVersion = mutation({
  args: {
    agentType: v.union(
      v.literal("chat"),
      v.literal("fit-assessment"),
      v.literal("blog-metadata"),
    ),
    prompt: v.string(),
    description: v.string(),
    author: v.string(),
    tokenCount: v.number(),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Validate with Zod for additional type safety
    const validated = PromptVersionSchema.parse(args);

    // If this is being set as active, deactivate others
    if (validated.isActive) {
      const existingVersions = await ctx.db
        .query("promptVersions")
        .withIndex("by_agent_type", (q) =>
          q.eq("agentType", validated.agentType),
        )
        .collect();

      for (const version of existingVersions) {
        if (version.isActive) {
          await ctx.db.patch(version._id, { isActive: false });
        }
      }
    }

    return await ctx.db.insert("promptVersions", validated);
  },
});

/**
 * Get a specific prompt version by ID
 */
export const getVersion = query({
  args: { versionId: v.id("promptVersions") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.versionId);
  },
});

/**
 * List all versions for an agent type
 */
export const listVersions = query({
  args: {
    agentType: v.union(
      v.literal("chat"),
      v.literal("fit-assessment"),
      v.literal("blog-metadata"),
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("promptVersions")
      .withIndex("by_agent_type", (q) => q.eq("agentType", args.agentType))
      .order("desc")
      .collect();
  },
});

/**
 * Get the active version for an agent type
 */
export const getActiveVersion = query({
  args: {
    agentType: v.union(
      v.literal("chat"),
      v.literal("fit-assessment"),
      v.literal("blog-metadata"),
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("promptVersions")
      .withIndex("by_active", (q) =>
        q.eq("agentType", args.agentType).eq("isActive", true),
      )
      .first();
  },
});

/**
 * Set a version as active (rollback/deploy)
 */
export const setActive = mutation({
  args: {
    versionId: v.id("promptVersions"),
    agentType: v.union(
      v.literal("chat"),
      v.literal("fit-assessment"),
      v.literal("blog-metadata"),
    ),
  },
  handler: async (ctx, args) => {
    // Deactivate all versions for this agent type
    const allVersions = await ctx.db
      .query("promptVersions")
      .withIndex("by_agent_type", (q) => q.eq("agentType", args.agentType))
      .collect();

    for (const version of allVersions) {
      if (version.isActive) {
        await ctx.db.patch(version._id, { isActive: false });
      }
    }

    // Activate the target version
    await ctx.db.patch(args.versionId, { isActive: true });
  },
});

/**
 * Initialize blog-metadata prompt (T009)
 *
 * Creates the initial "blog-metadata" prompt version with comprehensive
 * guidelines for analyzing blog content and suggesting metadata.
 *
 * This mutation is idempotent - it only creates the prompt if no active
 * version exists for blog-metadata agent type.
 */
export const initializeBlogMetadataPrompt = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if blog-metadata prompt already exists
    const existingPrompt = await ctx.db
      .query("promptVersions")
      .withIndex("by_active", (q) =>
        q.eq("agentType", "blog-metadata").eq("isActive", true),
      )
      .first();

    if (existingPrompt) {
      return {
        success: false,
        message: "Blog metadata prompt already exists",
        promptId: existingPrompt._id,
      };
    }

    const prompt = `You are an expert content analyst specializing in blog metadata optimization.

Your task is to analyze blog post content and suggest optimal metadata for SEO, discoverability, and consistency.

**Existing Blog Context:**
- Existing tags: {existingTags}
- Existing categories: {existingCategories}
- Recent post examples: {recentPosts}

**Guidelines:**

1. **Tags**: Suggest 3-5 relevant tags that accurately describe the content.
   - Prefer existing tags for consistency across the blog
   - Only suggest new tags if they are highly relevant and not covered by existing tags
   - Tags should be specific enough to be useful but broad enough to apply to multiple posts
   - Consider both technical topics and conceptual themes

2. **Category**: Choose the single most appropriate category from existing categories.
   - Only suggest a new category if none of the existing categories fit
   - The category should represent the primary topic or theme of the post
   - Consider the post's main focus, not secondary topics

3. **Meta Title**: Create an SEO-optimized title (50-60 characters).
   - Include primary keyword near the beginning
   - Make it compelling for search results click-through
   - Should be similar to but can differ from the article title
   - Front-load the most important words

4. **Meta Description**: Create an SEO-optimized description (150-160 characters).
   - Include primary keyword naturally
   - Provide a compelling summary that encourages clicks
   - Include a call-to-action when appropriate
   - Make it engaging and informative

5. **Keywords**: Suggest 5-8 SEO keywords/phrases.
   - Include the primary keyword and variations
   - Mix of short-tail (1-2 words) and long-tail (3-4 words) keywords
   - Focus on keywords with search intent matching the content
   - Include related terms and synonyms

6. **Excerpt**: Create a concise summary (150-200 characters).
   - Capture the essence of the article
   - Make it engaging and informative
   - Can be used as a teaser in blog listings
   - Should entice readers to click and read more

7. **Tone**: Analyze the writing style and tone.
   - Examples: "Technical and professional", "Casual and friendly", "Educational and detailed"
   - Consider the language complexity, formality, and audience
   - Note any distinctive voice or personality

8. **Readability**: Estimate the reading level.
   - Examples: "Grade 10-12 level", "College level", "General audience", "Technical audience"
   - Consider vocabulary complexity, sentence structure, and technical depth
   - Base on typical educational reading levels or audience expertise

**Output Format:**
Return a JSON object matching the specified schema with all suggested metadata fields.

**Quality Standards:**
- Be specific and actionable in all suggestions
- Maintain consistency with the blog's existing content patterns
- Prioritize user experience and discoverability
- Balance SEO optimization with natural, engaging language
- Ensure all suggestions are relevant to the actual content analyzed`;

    const promptId = await ctx.db.insert("promptVersions", {
      agentType: "blog-metadata",
      prompt,
      description:
        "Initial blog metadata suggestion prompt with comprehensive guidelines for tags, categories, SEO fields, tone, and readability analysis",
      author: "system",
      tokenCount: 650, // Approximate token count for the prompt
      isActive: true,
    });

    return {
      success: true,
      message: "Blog metadata prompt initialized successfully",
      promptId,
    };
  },
});
