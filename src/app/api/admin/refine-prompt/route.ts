/**
 * Prompt Refinement API Route
 * POST endpoint for AI-powered prompt refinement with versioning
 */

import { generateObject } from "ai";
import { z } from "zod";
import { AI_RATE_LIMITS, createOpenAIClient } from "@/lib/ai-config";
import type { AgentType } from "@/lib/prompt-versioning";
import { getActiveVersion } from "@/lib/prompt-versioning";

/**
 * Rate limiting state
 * Tracks request counts per IP address with timestamp cleanup
 */
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

/**
 * Get client IP address from request headers
 */
function getClientIP(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }

  return "unknown";
}

/**
 * Check if request is rate limited
 */
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (entry && now >= entry.resetAt) {
    rateLimitMap.delete(ip);
    return false;
  }

  if (entry && entry.count >= AI_RATE_LIMITS.MAX_REQUESTS_PER_MINUTE) {
    return true;
  }

  return false;
}

/**
 * Record request for rate limiting
 */
function recordRequest(ip: string): void {
  const now = Date.now();
  const oneMinuteFromNow = now + 60 * 1000;

  const entry = rateLimitMap.get(ip);

  if (!entry || now >= entry.resetAt) {
    rateLimitMap.set(ip, {
      count: 1,
      resetAt: oneMinuteFromNow,
    });
  } else {
    entry.count++;
  }
}

/**
 * Get seconds until rate limit reset
 */
function getSecondsUntilReset(ip: string): number {
  const entry = rateLimitMap.get(ip);
  if (!entry) return 60;

  const now = Date.now();
  const secondsRemaining = Math.ceil((entry.resetAt - now) / 1000);
  return Math.max(secondsRemaining, 1);
}

/**
 * Request validation schema
 */
const RequestSchema = z.object({
  agentType: z.enum(["chat", "fit-assessment"]),
  currentPrompt: z.string().optional(),
  refinementRequest: z
    .string()
    .min(1, "refinementRequest is required")
    .max(1000, "refinementRequest must not exceed 1000 characters")
    .refine((val) => val.trim().length > 0, {
      message: "refinementRequest cannot be empty or whitespace only",
    }),
});

/**
 * Response schema for AI-generated refinement
 */
const RefinementSchema = z.object({
  proposedPrompt: z.string().describe("The refined prompt text"),
  diffSummary: z.string().describe("Summary of what changed in the refinement"),
  tokenCountOriginal: z
    .number()
    .describe("Estimated token count of original prompt"),
  tokenCountProposed: z
    .number()
    .describe("Estimated token count of proposed prompt"),
  changes: z
    .array(z.string())
    .describe("List of specific changes made to the prompt"),
});

export type RefinePromptRequest = z.infer<typeof RequestSchema>;
export type RefinePromptResponse = z.infer<typeof RefinementSchema>;

/**
 * Calculate estimated token count using chars / 4 approximation
 */
function calculateTokenCount(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * POST /api/admin/refine-prompt
 *
 * Refines an AI agent system prompt based on user request
 */
export async function POST(request: Request): Promise<Response> {
  try {
    // Rate limiting check
    const clientIP = getClientIP(request);

    if (isRateLimited(clientIP)) {
      const retryAfter = getSecondsUntilReset(clientIP);

      return Response.json(
        {
          error: "Rate limit exceeded. Please try again later.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": retryAfter.toString(),
          },
        },
      );
    }

    // Parse request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return Response.json(
        { error: "Invalid JSON in request body" },
        { status: 400 },
      );
    }

    // Validate request body
    const validation = RequestSchema.safeParse(body);
    if (!validation.success) {
      const errorMessage = validation.error.issues
        .map((issue) => issue.message)
        .join(", ");
      return Response.json({ error: errorMessage }, { status: 400 });
    }

    const { agentType, currentPrompt, refinementRequest } = validation.data;

    // Record request for rate limiting
    recordRequest(clientIP);

    // Load current prompt if not provided
    let promptToRefine = currentPrompt;
    if (!promptToRefine || promptToRefine.trim() === "") {
      const activeVersion = await getActiveVersion(agentType as AgentType);
      if (!activeVersion) {
        return Response.json(
          {
            error: `No active prompt found for agent type '${agentType}'. Please provide currentPrompt.`,
          },
          { status: 400 },
        );
      }
      promptToRefine = activeVersion.prompt;
    }

    // Create AI client
    const model = createOpenAIClient();

    // System prompt for refinement
    const systemPrompt = `You are an expert prompt engineer helping refine AI agent system prompts.

Your task is to analyze the current prompt and apply the requested refinement while maintaining the agent's core functionality and voice.

Guidelines:
1. Preserve the agent's purpose and personality
2. Maintain all critical instructions and constraints
3. Improve clarity, structure, and effectiveness
4. Keep changes focused on the refinement request
5. Provide specific, actionable changes in the changes array`;

    // User prompt with current and refinement request
    const userPrompt = `Current prompt:
${promptToRefine}

Refinement request:
${refinementRequest}

Generate an improved prompt that addresses the refinement request while maintaining the agent's core functionality and voice.

Provide:
1. The complete refined prompt text
2. A summary of what changed
3. Token counts for both versions
4. A list of specific changes made`;

    // Generate refinement using AI SDK
    const result = await generateObject({
      model,
      schema: RefinementSchema,
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.7,
    });

    // Calculate actual token counts
    const tokenCountOriginal = calculateTokenCount(promptToRefine);
    const tokenCountProposed = calculateTokenCount(
      result.object.proposedPrompt,
    );

    // Return structured response with actual token counts
    return Response.json(
      {
        ...result.object,
        tokenCountOriginal,
        tokenCountProposed,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error processing prompt refinement:", error);

    return Response.json(
      {
        error: "Failed to process refinement request. Please try again later.",
      },
      { status: 500 },
    );
  }
}
