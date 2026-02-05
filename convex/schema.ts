import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Convex Schema for Admin Data
 * Defines tables for prompts, test cases, and test results
 */

export default defineSchema({
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
});
