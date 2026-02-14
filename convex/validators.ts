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

// Blog-specific validators
export const BlogStatusSchema = z.enum(["draft", "published", "archived"]);
export type BlogStatus = z.infer<typeof BlogStatusSchema>;

export const SEOMetadataSchema = z.object({
  metaTitle: z.string().min(1).max(60).optional(),
  metaDescription: z.string().min(1).max(160).optional(),
  ogImage: z.string().url().optional(),
  keywords: z.array(z.string()).optional(),
});
export type SEOMetadata = z.infer<typeof SEOMetadataSchema>;

export const CreatePostSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9-]+$/),
  excerpt: z.string().min(1).max(500),
  content: z.string().min(1),
  coverImageUrl: z.string().url().optional(),
  categoryId: z.string().optional(),
  tags: z.array(z.string()),
  author: z.string().min(1),
  readingTimeMinutes: z.number().int().positive(),
  featured: z.boolean().optional(),
  seoMetadata: SEOMetadataSchema,
});
export type CreatePostInput = z.infer<typeof CreatePostSchema>;

export const UpdatePostSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(200).optional(),
  slug: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  excerpt: z.string().min(1).max(500).optional(),
  content: z.string().min(1).optional(),
  coverImageUrl: z.string().url().optional(),
  categoryId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  author: z.string().min(1).optional(),
  readingTimeMinutes: z.number().int().positive().optional(),
  featured: z.boolean().optional(),
  seoMetadata: SEOMetadataSchema.optional(),
});
export type UpdatePostInput = z.infer<typeof UpdatePostSchema>;

export const CategoryInputSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500),
});
export type CategoryInput = z.infer<typeof CategoryInputSchema>;

export const CategoryUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
});
export type CategoryUpdate = z.infer<typeof CategoryUpdateSchema>;

export const TagInputSchema = z.object({
  name: z.string().min(1).max(50),
});
export type TagInput = z.infer<typeof TagInputSchema>;
