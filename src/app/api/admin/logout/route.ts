/**
 * Admin Logout API Route
 * Handles session invalidation and cookie clearing
 */

import { type NextRequest, NextResponse } from "next/server";
import { clearSessionCookie, invalidateSessionToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // Get session token from cookies
    const cookieHeader = request.headers.get("cookie");
    if (cookieHeader) {
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

      const sessionToken = cookies.session;
      if (sessionToken) {
        // Invalidate the session token
        await invalidateSessionToken(sessionToken);
      }
    }

    // Return success response with cleared cookie
    const response = NextResponse.json({ success: true });
    response.headers.set("Set-Cookie", clearSessionCookie());

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "An error occurred during logout" },
      { status: 500 },
    );
  }
}
