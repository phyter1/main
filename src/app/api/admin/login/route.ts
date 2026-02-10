/**
 * Admin Login API Route
 * Handles password authentication and session creation
 * Includes rate limiting and open redirect protection
 */

import { type NextRequest, NextResponse } from "next/server";
import {
  createSessionCookie,
  generateSessionToken,
  storeSessionToken,
  verifyAdminPassword,
} from "@/lib/auth";

/**
 * Rate limiting for login attempts
 * Prevents brute force attacks
 */
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const loginRateLimitMap = new Map<string, RateLimitEntry>();

/**
 * Export for testing purposes - allows tests to clear rate limit state
 * @internal
 */
export const __testing__ = {
  clearRateLimitMap: () => loginRateLimitMap.clear(),
};

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
 * Check if login attempts are rate limited
 * Returns limited status and retry time
 */
function isLoginRateLimited(ip: string): {
  limited: boolean;
  retryAfter?: number;
} {
  const now = Date.now();
  const entry = loginRateLimitMap.get(ip);
  const LIMIT = 5; // 5 attempts
  const WINDOW_MS = 15 * 60 * 1000; // per 15 minutes

  // Clean up expired entries
  if (entry && now >= entry.resetAt) {
    loginRateLimitMap.delete(ip);
    return { limited: false };
  }

  // Check if rate limited
  if (entry && entry.count >= LIMIT) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return { limited: true, retryAfter };
  }

  // Increment counter
  if (entry) {
    entry.count++;
  } else {
    loginRateLimitMap.set(ip, {
      count: 1,
      resetAt: now + WINDOW_MS,
    });
  }

  return { limited: false };
}

/**
 * Validate redirect URL to prevent open redirect attacks
 * Only allows redirects to /admin/* paths
 */
function validateAdminRedirect(redirectTo: string | undefined): string {
  const defaultRedirect = "/admin/agent-workbench";

  if (!redirectTo || typeof redirectTo !== "string") {
    return defaultRedirect;
  }

  // Must start with /admin
  if (!redirectTo.startsWith("/admin")) {
    return defaultRedirect;
  }

  // Must not contain protocol or domain
  if (redirectTo.includes("://") || redirectTo.includes("//")) {
    return defaultRedirect;
  }

  // Must not contain @ (URL credential syntax)
  if (redirectTo.includes("@")) {
    return defaultRedirect;
  }

  // Path traversal protection
  try {
    const normalized = new URL(redirectTo, "http://localhost").pathname;
    if (!normalized.startsWith("/admin")) {
      return defaultRedirect;
    }
    return normalized;
  } catch {
    return defaultRedirect;
  }
}

export async function POST(request: NextRequest) {
  // Check rate limit FIRST
  const clientIP = getClientIP(request);
  const rateLimitCheck = isLoginRateLimited(clientIP);

  if (rateLimitCheck.limited) {
    return NextResponse.json(
      {
        error: "Too many login attempts. Please try again later.",
        retryAfter: rateLimitCheck.retryAfter,
      },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimitCheck.retryAfter) },
      },
    );
  }
  try {
    // Parse request body
    let body: { password?: string; redirectTo?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }

    // Validate password field
    const { password, redirectTo } = body;

    if (!password || typeof password !== "string" || password.trim() === "") {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 },
      );
    }

    // Verify admin password
    const isValid = await verifyAdminPassword(password);

    if (!isValid) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    // Generate session token
    const sessionToken = generateSessionToken();

    // Store session token
    await storeSessionToken(sessionToken);

    // Create session cookie
    const cookieHeader = createSessionCookie(sessionToken);

    // Validate and sanitize redirect URL (protection against open redirects)
    const validatedRedirectTo = validateAdminRedirect(redirectTo);

    // Return success response with cookie
    const response = NextResponse.json({
      success: true,
      redirectTo: validatedRedirectTo,
    });

    response.headers.set("Set-Cookie", cookieHeader);

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "An error occurred during login" },
      { status: 500 },
    );
  }
}
