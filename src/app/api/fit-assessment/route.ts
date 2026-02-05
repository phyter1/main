import { generateObject } from "ai";
import { z } from "zod";
import { formatResumeAsLLMContext, resume } from "@/data/resume";
import { AI_RATE_LIMITS, createOpenAIClient } from "@/lib/ai-config";
import {
  logSecurityEvent,
  validateJobDescription,
} from "@/lib/input-sanitization";
import { getActiveVersion } from "@/lib/prompt-versioning";
import type { GuardrailViolation } from "@/types/guardrails";

/**
 * Rate limiting storage
 * In production, use Redis or a distributed cache
 */
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

/**
 * Simple in-memory rate limiter
 * Limits requests per IP address
 */
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = AI_RATE_LIMITS.MAX_REQUESTS_PER_MINUTE;
  const windowMs = 60000; // 1 minute

  const record = rateLimitStore.get(ip);

  if (!record || now > record.resetAt) {
    // First request or window expired
    rateLimitStore.set(ip, {
      count: 1,
      resetAt: now + windowMs,
    });
    return true;
  }

  if (record.count >= limit) {
    // Rate limit exceeded
    return false;
  }

  // Increment count
  record.count += 1;
  return true;
}

/**
 * Get client IP address from request
 */
function getClientIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }

  // Fallback for development
  return "unknown";
}

/**
 * Request validation schema
 */
const RequestSchema = z.object({
  jobDescription: z
    .string()
    .min(1, "Job description is required")
    .max(10000, "Job description must not exceed 10000 characters")
    .refine((val) => val.trim().length > 0, {
      message: "Job description cannot be empty or whitespace only",
    }),
});

/**
 * Response schema for AI-generated assessment
 */
const AssessmentSchema = z.object({
  fitLevel: z
    .enum(["strong", "moderate", "weak"])
    .describe(
      "Overall fit level: strong (highly qualified), moderate (partially qualified), weak (not a good match)",
    ),
  reasoning: z
    .array(z.string())
    .describe(
      "Array of specific reasons for the fit assessment, referencing candidate's actual experience and skills",
    ),
  recommendations: z
    .array(z.string())
    .describe(
      "Array of actionable recommendations for the candidate (skills to highlight, areas to develop, etc.)",
    ),
});

export type FitAssessmentRequest = z.infer<typeof RequestSchema>;
export type FitAssessmentResponse = z.infer<typeof AssessmentSchema>;

/**
 * Loads the fit assessment system prompt from Convex
 * Throws error if Convex is unavailable or no active version exists
 */
async function loadFitAssessmentPrompt(): Promise<string> {
  const activeVersion = await getActiveVersion("fit-assessment");

  if (!activeVersion?.prompt) {
    throw new Error(
      "No active fit assessment prompt found in Convex. Please configure prompt in admin workbench.",
    );
  }

  return activeVersion.prompt;
}

    const userPrompt = `Please assess Ryan's fit for the following job opportunity. Be honest and specific.

JOB DESCRIPTION:
${sanitizedJobDescription}

Provide a structured assessment with:
1. Overall fit level (strong/moderate/weak)
2. Specific reasoning based on Ryan's actual experience - Write in FIRST PERSON from Ryan's perspective using "I", "my", "I have". Examples: "I have 7 years of TypeScript experience", "My background in cloud infrastructure..."
3. Actionable recommendations - Write these as Ryan speaking DIRECTLY to the hiring manager in FIRST PERSON, suggesting what they should ask about or discuss. Examples: "Ask me about my AI-assisted development workflow", "I can provide specific examples of my architecture work", "Let's discuss how my experience translates to your team's needs".`;

    // Generate structured assessment using AI SDK
    const result = await generateObject({
      model,
      schema: AssessmentSchema,
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.7,
    });

    // Return structured response
    return Response.json(result.object, { status: 200 });
  } catch (error) {
    console.error("Error processing fit assessment:", error);

    // Return generic error to client (don't expose internal details)
    return Response.json(
      {
        error: "Failed to process fit assessment. Please try again later.",
      },
      { status: 500 },
    );
  }
}
