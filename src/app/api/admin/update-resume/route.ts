/**
 * Update Resume API Route
 * POST endpoint for AI-powered conversational resume updates
 *
 * This endpoint accepts natural language requests to update resume data
 * and returns proposed changes for manual review and approval.
 *
 * Features:
 * - AI-generated structured resume updates
 * - Markdown diff preview of changes
 * - Rate limiting (5 requests/minute per IP)
 * - Input validation and sanitization
 * - Does NOT auto-commit changes - returns preview only
 */

import { generateObject } from "ai";
import { z } from "zod";
import { resume } from "@/data/resume";
import { createOpenAIClient } from "@/lib/ai-config";

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
  // Check common headers used by proxies and CDNs
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

  // Clean up expired entries
  if (entry && now >= entry.resetAt) {
    rateLimitMap.delete(ip);
    return false;
  }

  // Check if limit exceeded (5 requests per minute for admin endpoints)
  if (entry && entry.count >= 5) {
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
 * Zod schema for AI response
 * Defines the structure of proposed resume changes
 */
const ResumeUpdateResponseSchema = z.object({
  proposedChanges: z.object({
    section: z.enum(["experience", "skills", "projects"]),
    operation: z.enum(["add", "update", "delete"]),
    data: z.any(), // Flexible to accommodate different section structures
  }),
  preview: z.string().describe("Markdown diff showing the proposed changes"),
  affectedSections: z
    .array(z.string())
    .describe("List of resume sections affected by this change"),
});

/**
 * Validate and sanitize request body
 */
interface UpdateResumeRequest {
  updateRequest: string;
}

function validateRequestBody(body: unknown): {
  isValid: boolean;
  error?: string;
  data?: UpdateResumeRequest;
} {
  if (!body || typeof body !== "object") {
    return { isValid: false, error: "Invalid request body" };
  }

  const { updateRequest } = body as Partial<UpdateResumeRequest>;

  if (!updateRequest) {
    return {
      isValid: false,
      error: "Missing required field: updateRequest",
    };
  }

  if (typeof updateRequest !== "string") {
    return {
      isValid: false,
      error: "updateRequest must be a string",
    };
  }

  if (updateRequest.length === 0) {
    return {
      isValid: false,
      error: "updateRequest cannot be empty",
    };
  }

  if (updateRequest.length > 1000) {
    return {
      isValid: false,
      error: "updateRequest must not exceed 1000 characters",
    };
  }

  return {
    isValid: true,
    data: { updateRequest },
  };
}

/**
 * Generate AI system prompt for resume updates
 */
function generateSystemPrompt(resumeData: typeof resume): string {
  return `You are helping update a professional resume based on conversational requests.

Current resume data: ${JSON.stringify(resumeData, null, 2)}

Your task is to generate proposed changes to the resume data structure that fulfill the user's request.
Be specific about which section to update (experience, skills, or projects) and what data to add/modify/delete.

Rules:
1. DO NOT auto-commit changes - only propose them for review
2. Generate a clear markdown diff preview showing what will change
3. List all affected sections
4. For "add" operations: provide complete data structure for the new item
5. For "update" operations: specify which existing item to update and what fields to change
6. For "delete" operations: specify which item to remove
7. Be conservative - if unclear, ask for clarification in the preview

Section-specific guidance:
- experience: Add/update job positions with title, organization, period, description, highlights, technologies
- skills: Add/update technical skills by category (languages, frameworks, databases, devTools, infrastructure)
- projects: Add/update projects with title, description, technologies, status, highlights

Return structured data matching the ResumeUpdateResponseSchema.`;
}

/**
 * POST /api/admin/update-resume
 * Handles AI-powered resume update requests
 */
export async function POST(request: Request): Promise<Response> {
  try {
    // Extract client IP for rate limiting
    const clientIP = getClientIP(request);

    // Check rate limit (5 requests per minute)
    if (isRateLimited(clientIP)) {
      const retryAfter = getSecondsUntilReset(clientIP);

      return new Response(
        JSON.stringify({
          error: "Rate limit exceeded. Please try again later.",
          retryAfter,
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": retryAfter.toString(),
          },
        },
      );
    }

    // Parse request body
    let body: unknown;
    try {
      body = await request.json();
    } catch (_error) {
      return new Response(
        JSON.stringify({
          error: "Invalid JSON in request body",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    // Validate request body
    const validation = validateRequestBody(body);
    if (!validation.isValid || !validation.data) {
      return new Response(
        JSON.stringify({
          error: validation.error,
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    // Record request for rate limiting
    recordRequest(clientIP);

    const { updateRequest } = validation.data;

    // Create OpenAI client
    const model = createOpenAIClient();

    // Generate system prompt with current resume data
    const systemPrompt = generateSystemPrompt(resume);

    // Generate AI response with structured output
    const result = await generateObject({
      model,
      schema: ResumeUpdateResponseSchema,
      system: systemPrompt,
      prompt: updateRequest,
      temperature: 0.7,
    });

    // Return proposed changes (not auto-committed)
    return new Response(JSON.stringify(result.object), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Update resume API error:", error);

    return new Response(
      JSON.stringify({
        error: "An error occurred processing your request. Please try again.",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
}
