/**
 * Image Delete API Route
 * Handles deletion of uploaded images from Vercel Blob Store with authentication
 */

import { type NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";
import { deleteImage } from "@/lib/upload-service";

/**
 * Rate limiting configuration
 * TODO: In production, use Redis or distributed cache for persistent rate limiting
 * across serverless function invocations. Current in-memory Map won't persist.
 */
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_DELETES_PER_WINDOW = 10; // 10 deletes per minute per IP

/**
 * Rate limit tracking
 */
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const deleteRateLimits = new Map<string, RateLimitEntry>();

/**
 * Clean up expired rate limit entries
 */
function cleanupRateLimits(): void {
  const now = Date.now();
  for (const [ip, entry] of deleteRateLimits.entries()) {
    if (entry.resetAt < now) {
      deleteRateLimits.delete(ip);
    }
  }
}

/**
 * Check if request exceeds rate limit
 * @param ip - Client IP address
 * @returns Object with exceeded flag and retry time
 */
function checkRateLimit(ip: string): {
  exceeded: boolean;
  retryAfter?: number;
} {
  cleanupRateLimits();

  const now = Date.now();
  const entry = deleteRateLimits.get(ip);

  if (!entry) {
    // First request from this IP
    deleteRateLimits.set(ip, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return { exceeded: false };
  }

  if (entry.resetAt < now) {
    // Window expired, reset counter
    deleteRateLimits.set(ip, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return { exceeded: false };
  }

  // Within window, check count
  if (entry.count >= MAX_DELETES_PER_WINDOW) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return { exceeded: true, retryAfter };
  }

  // Increment count
  entry.count += 1;
  deleteRateLimits.set(ip, entry);
  return { exceeded: false };
}

/**
 * Extract client IP from request headers
 * @param request - Next.js request object
 * @returns Client IP address
 */
function getClientIP(request: NextRequest): string {
  // Check standard forwarding headers
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }

  // Fallback to request IP
  return "unknown";
}

/**
 * Extract session token from request cookies
 * @param request - Next.js request object
 * @returns Session token or undefined
 */
function getSessionToken(request: NextRequest): string | undefined {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) {
    return undefined;
  }

  const cookies = cookieHeader.split(";").reduce(
    (acc, cookie) => {
      const [key, value] = cookie.trim().split("=");
      if (key && value) {
        acc[key] = value;
      }
      return acc;
    },
    {} as Record<string, string>,
  );

  return cookies.session;
}

/**
 * DELETE /api/admin/blog/delete-image
 * Delete image from Vercel Blob Store with authentication
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    // Authentication: Verify session token
    const sessionToken = getSessionToken(request);
    if (!sessionToken || !(await verifySessionToken(sessionToken))) {
      return NextResponse.json(
        { error: "Unauthorized. Admin authentication required." },
        { status: 401 },
      );
    }

    // Rate limiting: Check delete rate
    const clientIP = getClientIP(request);
    const rateLimitResult = checkRateLimit(clientIP);
    if (rateLimitResult.exceeded) {
      const response = NextResponse.json(
        {
          error: "Rate limit exceeded. Please try again later.",
          retryAfter: rateLimitResult.retryAfter,
        },
        { status: 429 },
      );

      if (rateLimitResult.retryAfter) {
        response.headers.set(
          "Retry-After",
          rateLimitResult.retryAfter.toString(),
        );
      }

      return response;
    }

    // Parse JSON body
    let body: { url?: string };
    try {
      body = await request.json();
    } catch (_error) {
      return NextResponse.json(
        { error: "Invalid request. Expected JSON body with 'url' field." },
        { status: 400 },
      );
    }

    // Validate URL field
    const { url } = body;
    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'url' field in request body." },
        { status: 400 },
      );
    }

    // Validate URL format (basic check for Vercel Blob URLs)
    if (!url.startsWith("https://")) {
      return NextResponse.json(
        { error: "Invalid URL. Must be a valid HTTPS URL." },
        { status: 400 },
      );
    }

    // Delete from Vercel Blob Store
    try {
      await deleteImage(url);
    } catch (error) {
      console.error("Vercel Blob delete error:", error);
      return NextResponse.json(
        { error: "Delete failed. Please try again." },
        { status: 500 },
      );
    }

    // Return success
    return NextResponse.json(
      {
        success: true,
        message: "Image deleted successfully.",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Unexpected delete error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during deletion." },
      { status: 500 },
    );
  }
}
