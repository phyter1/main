/**
 * Admin Login API Route
 * Handles password authentication and session creation
 */

import { type NextRequest, NextResponse } from "next/server";
import {
  createSessionCookie,
  generateSessionToken,
  storeSessionToken,
  verifyAdminPassword,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    let body: { password?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }

    // Validate password field
    const { password } = body;

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
    storeSessionToken(sessionToken);

    // Create session cookie
    const cookieHeader = createSessionCookie(sessionToken);

    // Return success response with cookie
    const response = NextResponse.json({
      success: true,
      redirectTo: "/admin/agent-workbench",
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
