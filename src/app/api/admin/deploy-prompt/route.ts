/**
 * Deploy Prompt API Route
 * POST endpoint for deploying prompt versions to production (stored in Convex)
 */

import { z } from "zod";
import { type AgentType, rollbackVersion } from "@/lib/prompt-versioning";
import type { Id } from "../../../../../convex/_generated/dataModel";

/**
 * Rate limiting configuration for admin endpoints
 * More restrictive than public AI endpoints
 */
const ADMIN_RATE_LIMIT = 5; // requests per minute per IP

/**
 * Rate limiting storage
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

  // Clean up expired entries
  if (entry && now >= entry.resetAt) {
    rateLimitMap.delete(ip);
    return false;
  }

  // Check if limit exceeded
  if (entry && entry.count >= ADMIN_RATE_LIMIT) {
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
  versionId: z.string().min(1, "versionId is required"),
  message: z.string().optional(),
});

/**
 * Response structure
 */
interface DeployPromptResponse {
  success: boolean;
  versionId: string;
  message: string;
}


/**
 * POST /api/admin/deploy-prompt
 *
 * Deploys a prompt version to production (activates version in Convex)
 *
 * @param request - Request with agentType, versionId, and optional message
 * @returns JSON response with success status, versionId, and message
 */
export async function POST(request: Request): Promise<Response> {
  try {
    // Extract client IP for rate limiting
    const clientIP = getClientIP(request);

    // Check rate limit
    if (isRateLimited(clientIP)) {
      const retryAfter = getSecondsUntilReset(clientIP);

      return Response.json(
        {
          error: "Rate limit exceeded. Please try again later.",
          retryAfter,
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
    } catch (_error) {
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

    const { agentType, versionId, message } = validation.data;

    // Record request for rate limiting
    recordRequest(clientIP);

    // Activate prompt version using rollbackVersion
    // Cast string to Convex Id type
    await rollbackVersion(agentType, versionId as Id<"promptVersions">);

    // Build success response
    const response: DeployPromptResponse = {
      success: true,
      versionId,
      message: `Prompt version ${versionId} activated`,
    };

    return Response.json(response, { status: 200 });
  } catch (error) {
    console.error("Error deploying prompt:", error);

    return Response.json(
      {
        error: "Failed to deploy prompt version. Please try again later.",
      },
      { status: 500 },
    );
  }
}
