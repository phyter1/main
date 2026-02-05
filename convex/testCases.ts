import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { TestCaseSchema, TestResultSchema } from "./validators";

/**
 * Save a new test case
 */
export const saveTestCase = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    // Validate with Zod for additional type safety
    const validated = TestCaseSchema.parse(args);
    return await ctx.db.insert("testCases", validated);
  },
});

/**
 * Get a specific test case
 */
export const getTestCase = query({
  args: { testCaseId: v.id("testCases") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.testCaseId);
  },
});

/**
 * List all test cases for an agent type
 */
export const listTestCases = query({
  args: {
    agentType: v.union(v.literal("chat"), v.literal("fit-assessment")),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("testCases")
      .withIndex("by_agent_type", (q) => q.eq("agentType", args.agentType))
      .collect();
  },
});

/**
 * Delete a test case
 */
export const deleteTestCase = mutation({
  args: { testCaseId: v.id("testCases") },
  handler: async (ctx, args) => {
    // Delete associated test results first
    const results = await ctx.db
      .query("testResults")
      .withIndex("by_test_case", (q) => q.eq("testCaseId", args.testCaseId))
      .collect();

    for (const result of results) {
      await ctx.db.delete(result._id);
    }

    // Delete the test case
    await ctx.db.delete(args.testCaseId);
  },
});

/**
 * Save test results
 */
export const saveTestResults = mutation({
  args: {
    testCaseId: v.id("testCases"),
    passed: v.boolean(),
    response: v.string(),
    tokenCount: v.number(),
    latency: v.number(),
  },
  handler: async (ctx, args) => {
    // Validate with Zod for additional type safety
    const validated = TestResultSchema.parse({
      passed: args.passed,
      response: args.response,
      tokenCount: args.tokenCount,
      latency: args.latency,
    });

    return await ctx.db.insert("testResults", {
      ...validated,
      testCaseId: args.testCaseId,
    });
  },
});

/**
 * Get test results for a test case
 */
export const getTestResults = query({
  args: { testCaseId: v.id("testCases") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("testResults")
      .withIndex("by_test_case", (q) => q.eq("testCaseId", args.testCaseId))
      .order("desc")
      .collect();
  },
});
