/**
 * Admin Blog Publish API Route
 * POST /api/admin/blog/publish - Publishes a draft blog post
 * Requires admin authentication
 */

import { fetchMutation } from "convex/nextjs";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifySessionToken } from "@/lib/auth";
import { api } from "../../../../../../convex/_generated/api";

/**
 * Zod schema for publishing a blog post
 */
const PublishPostSchema = z.object({
  id: z.string().min(1, "Post ID is required"),
});

export async function POST(request: NextRequest) {
  try {
    // Verify admin session
    const sessionCookie = request.cookies.get("session")?.value;

    if (!sessionCookie || !(await verifySessionToken(sessionCookie))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse and validate request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }

    const validationResult = PublishPostSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.format(),
        },
        { status: 400 },
      );
    }

    const { id } = validationResult.data;

    // Publish post via Convex mutation
    try {
      await fetchMutation(api.blog.publishPost, {
        id: id as any, // Convex ID type
      });

      return NextResponse.json({
        success: true,
        message: "Post published successfully",
      });
    } catch (convexError) {
      const errorMessage =
        convexError instanceof Error
          ? convexError.message
          : "Failed to publish post";

      if (errorMessage.includes("not found")) {
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
      }

      if (errorMessage.includes("already published")) {
        return NextResponse.json(
          { error: "Post is already published" },
          { status: 409 },
        );
      }

      if (errorMessage.includes("Cannot publish archived")) {
        return NextResponse.json(
          { error: "Cannot publish archived post" },
          { status: 409 },
        );
      }

      throw convexError;
    }
  } catch (error) {
    console.error("Publish post error:", error);
    return NextResponse.json(
      { error: "An error occurred while publishing the post" },
      { status: 500 },
    );
  }
}
