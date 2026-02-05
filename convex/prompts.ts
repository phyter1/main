import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { PromptVersionSchema } from "./validators";

/**
 * Save a new prompt version
 */
export const saveVersion = mutation({
  args: {
    agentType: v.union(v.literal("chat"), v.literal("fit-assessment")),
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
    agentType: v.union(v.literal("chat"), v.literal("fit-assessment")),
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
    agentType: v.union(v.literal("chat"), v.literal("fit-assessment")),
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
    agentType: v.union(v.literal("chat"), v.literal("fit-assessment")),
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
