/**
 * Next.js Middleware for Authentication
 * Protects /admin/* routes with session-based authentication
 */

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { validateAuthConfig, verifySessionToken } from "./src/lib/auth";

/**
 * Middleware to protect admin routes
 * @param request - Incoming Next.js request
 * @returns Response with redirect or next()
 */
export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // Allow access to /admin/login without authentication
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  // Validate auth configuration on server startup
  try {
    validateAuthConfig();
  } catch (error) {
    // Allow middleware to continue, but log the error
    console.error("Auth configuration validation failed:", error);
  }

  // Check if this is an admin route (excluding /admin/login)
  if (pathname.startsWith("/admin")) {
    // Extract session token from cookies
    const sessionToken = getSessionTokenFromRequest(request);

    // Verify session token
    if (!sessionToken || !verifySessionToken(sessionToken)) {
      // Redirect to login page
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl, { status: 307 });
    }

    // Add security headers to authenticated admin requests
    const response = NextResponse.next();
    addSecurityHeaders(response);
    return response;
  }

  // Allow all other routes
  return NextResponse.next();
}

/**
 * Extract session token from request cookies
 * @param request - Next.js request object
 * @returns Session token or undefined if not found
 */
function getSessionTokenFromRequest(request: NextRequest): string | undefined {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) {
    return undefined;
  }

  // Parse cookies manually
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
 * Add security headers to response
 * @param response - Next.js response object
 */
function addSecurityHeaders(response: NextResponse): void {
  // Prevent MIME type sniffing
  response.headers.set("x-content-type-options", "nosniff");

  // Prevent clickjacking
  response.headers.set("x-frame-options", "DENY");

  // Enable XSS protection
  response.headers.set("x-xss-protection", "1; mode=block");

  // Referrer policy
  response.headers.set("referrer-policy", "strict-origin-when-cross-origin");
}

/**
 * Middleware configuration
 * Protect admin routes with authentication
 */
export const config = {
  matcher: [
    /*
     * Match admin routes only for authentication
     */
    "/admin/:path*",
  ],
};
