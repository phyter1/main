/**
 * Next.js Proxy for Authentication
 * Protects /admin/* routes with session-based authentication
 */

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { validateAuthConfig, verifySessionToken } from "./lib/auth";

/**
 * Environment-aware debug logger
 * Only logs in development, silent in production
 */
const debug =
  process.env.NODE_ENV !== "production"
    ? console.log.bind(console, "[AUTH]")
    : () => {};

/**
 * Proxy to protect admin routes
 * @param request - Incoming Next.js request
 * @returns Response with redirect or next()
 */
export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  debug("Proxy called:", pathname);

  // Allow access to /admin/login without authentication
  if (pathname === "/admin/login") {
    debug("Allowing /admin/login");
    return NextResponse.next();
  }

  // Validate auth configuration on server startup
  try {
    validateAuthConfig();
  } catch (_error) {
    // Log error but allow proxy to continue
    console.error("[AUTH] Configuration validation failed");
  }

  // Check if this is an admin route (excluding /admin/login)
  if (pathname.startsWith("/admin")) {
    debug("Checking admin route authentication");
    // Extract session token from cookies
    const sessionToken = getSessionTokenFromRequest(request);
    debug("Session token:", sessionToken ? "EXISTS" : "MISSING");

    // Verify session token
    if (!sessionToken || !verifySessionToken(sessionToken)) {
      debug("Redirecting to login - No valid session");
      // Redirect to login page with original URL as redirect param
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl, { status: 307 });
    }

    debug("Valid session found, allowing access");

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
    "/admin",
    "/admin/:path*",
  ],
};
