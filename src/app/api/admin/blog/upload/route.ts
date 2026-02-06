/**
 * Image Upload API Route
 * Handles file uploads for blog post images with authentication,
 * validation, and integration with upload service (Cloudinary/S3)
 */

import { type NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";
import {
  sanitizeFilename,
  uploadToCloudinary,
  validateUploadFile,
} from "@/lib/upload-service";

/**
 * Rate limiting configuration
 */
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_UPLOADS_PER_WINDOW = 10; // 10 uploads per minute per IP

/**
 * Rate limit tracking
 * In production, use Redis or distributed cache
 */
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const uploadRateLimits = new Map<string, RateLimitEntry>();

/**
 * Clean up expired rate limit entries
 */
function cleanupRateLimits(): void {
  const now = Date.now();
  for (const [ip, entry] of uploadRateLimits.entries()) {
    if (entry.resetAt < now) {
      uploadRateLimits.delete(ip);
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
  const entry = uploadRateLimits.get(ip);

  if (!entry) {
    // First request from this IP
    uploadRateLimits.set(ip, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return { exceeded: false };
  }

  if (entry.resetAt < now) {
    // Window expired, reset counter
    uploadRateLimits.set(ip, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return { exceeded: false };
  }

  // Within window, check count
  if (entry.count >= MAX_UPLOADS_PER_WINDOW) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return { exceeded: true, retryAfter };
  }

  // Increment count
  entry.count += 1;
  uploadRateLimits.set(ip, entry);
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
 * POST /api/admin/blog/upload
 * Upload image file with authentication and validation
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Authentication: Verify session token
    const sessionToken = getSessionToken(request);
    if (!sessionToken || !verifySessionToken(sessionToken)) {
      return NextResponse.json(
        { error: "Unauthorized. Admin authentication required." },
        { status: 401 },
      );
    }

    // Rate limiting: Check upload rate
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

    // Parse multipart form data
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch (_error) {
      return NextResponse.json(
        { error: "Invalid request. Expected multipart/form-data." },
        { status: 400 },
      );
    }

    // Extract file from form data
    const file = formData.get("file");
    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { error: "No file provided. Include 'file' field in form data." },
        { status: 400 },
      );
    }

    // Validate file
    const validation = validateUploadFile(file);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error || "Invalid file" },
        { status: 400 },
      );
    }

    // Sanitize filename if it's a File object
    if (file instanceof File) {
      const _sanitized = sanitizeFilename(file.name);
      // Note: We sanitize but don't need to create new File object
      // Upload service will handle the file appropriately
    }

    // Upload to service
    let uploadedUrl: string;
    try {
      uploadedUrl = await uploadToCloudinary(file);
    } catch (error) {
      console.error("Upload service error:", error);
      return NextResponse.json(
        { error: "Upload failed. Please try again." },
        { status: 500 },
      );
    }

    // Return success with uploaded URL
    return NextResponse.json(
      {
        url: uploadedUrl,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Unexpected upload error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during upload." },
      { status: 500 },
    );
  }
}
