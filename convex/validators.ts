import { z } from "zod";

/**
 * Shared Zod validators for Convex functions
 * These can be reused across both client and server code
 */

export const AgentTypeSchema = z.enum(["chat", "fit-assessment"]);
export type AgentType = z.infer<typeof AgentTypeSchema>;

export const TestCriterionSchema = z.object({
  type: z.enum(["contains", "first-person", "token-limit", "max-length"]),
  value: z.union([z.string(), z.number()]).optional(),
  expected: z.boolean().optional(),
});
export type TestCriterion = z.infer<typeof TestCriterionSchema>;

export const PromptVersionSchema = z.object({
  agentType: AgentTypeSchema,
  prompt: z.string(),
  description: z.string(),
  author: z.string(),
  tokenCount: z.number(),
  isActive: z.boolean(),
});
export type PromptVersion = z.infer<typeof PromptVersionSchema>;

export const TestCaseSchema = z.object({
  agentType: AgentTypeSchema,
  question: z.string(),
  criteria: z.array(TestCriterionSchema),
});
export type TestCase = z.infer<typeof TestCaseSchema>;

export const TestResultSchema = z.object({
  passed: z.boolean(),
  response: z.string(),
  tokenCount: z.number(),
  latency: z.number(),
});
export type TestResult = z.infer<typeof TestResultSchema>;
