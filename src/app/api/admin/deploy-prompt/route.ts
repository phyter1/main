/**
 * Deploy Prompt API Route
 * POST endpoint for deploying prompt versions to production with git commit audit trail
 */

import { exec } from "node:child_process";
import { promisify } from "node:util";
import { z } from "zod";
import { type AgentType, rollbackVersion } from "@/lib/prompt-versioning";

const execAsync = promisify(exec);

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
  commitHash?: string;
  message: string;
}

/**
 * Extract commit hash from git commit output
 * Git output format: "[branch commitHash] commit message"
 */
function extractCommitHash(gitOutput: string | undefined): string | undefined {
  if (!gitOutput) return undefined;

  // Match pattern: [branch hash] or "commit hash"
  const match = gitOutput.match(
    /\[[\w\-/]+\s+([a-f0-9]+)\]|^commit\s+([a-f0-9]+)/i,
  );
  if (match) {
    return match[1] || match[2];
  }
  return undefined;
}

/**
 * Create git commit for prompt deployment
 * Stages changes and creates commit with audit trail
 */
async function createGitCommit(
  agentType: AgentType,
  versionId: string,
  deployMessage?: string,
): Promise<string | undefined> {
  try {
    // Stage prompt directory changes
    await execAsync("git add .admin/prompts/");

    // Build commit message with deployment details
    const commitMessageLines = [
      `deploy: activate ${agentType} prompt version ${versionId}`,
      "",
      deployMessage || `Deployed version ${versionId} to production`,
    ];

    const commitMessage = commitMessageLines.join("\n");

    // Create commit
    const { stdout } = await execAsync(`git commit -m "${commitMessage}"`);

    // Extract commit hash from output
    return extractCommitHash(stdout);
  } catch (error) {
    // Git errors are non-fatal (deployment still succeeded)
    console.warn("Git commit failed:", error);
    return undefined;
  }
}

/**
 * POST /api/admin/deploy-prompt
 *
 * Deploys a prompt version to production and creates git commit for audit trail
 *
 * @param request - Request with agentType, versionId, and optional message
 * @returns JSON response with success status, versionId, optional commitHash, and message
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
    await rollbackVersion(agentType, versionId);

    // Create git commit for audit trail (non-blocking failure)
    const commitHash = await createGitCommit(agentType, versionId, message);

    // Build success response
    const response: DeployPromptResponse = {
      success: true,
      versionId,
      message: commitHash
        ? `Prompt version ${versionId} activated and committed to git (${commitHash})`
        : `Prompt version ${versionId} activated`,
    };

    // Include commit hash if available
    if (commitHash) {
      response.commitHash = commitHash;
    }

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
