/**
 * Admin Blog Post API Route
 * PATCH /api/admin/blog/[id] - Updates an existing blog post
 * DELETE /api/admin/blog/[id] - Archives a blog post (soft delete)
 * Requires admin authentication
 */

import { fetchMutation } from "convex/nextjs";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifySessionToken } from "@/lib/auth";
import { api } from "../../../../../../convex/_generated/api";

/**
 * Zod schema for updating a blog post
 * All fields are optional for partial updates
 */
const UpdatePostSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  slug: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  excerpt: z.string().min(1).max(500).optional(),
  content: z.string().min(1).optional(),
  author: z.string().min(1).optional(),
  coverImageUrl: z.string().url().optional(),
  categoryId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  readingTimeMinutes: z.number().min(1).max(999).optional(),
  featured: z.boolean().optional(),
  seoMetadata: z
    .object({
      metaTitle: z.string().max(60).optional(),
      metaDescription: z.string().max(160).optional(),
      ogImage: z.string().url().optional(),
      keywords: z.array(z.string()).optional(),
    })
    .optional(),
});

/**
 * Verify admin session from request cookies
 */
async function verifyAdminSession(request: NextRequest): Promise<boolean> {
  const cookies = request.headers.get("cookie") || "";
  const sessionMatch = cookies.match(/session=([^;]+)/);
  const sessionCookie = sessionMatch?.[1];
  return !!(sessionCookie && (await verifySessionToken(sessionCookie)));
}

/**
 * PATCH handler - Update blog post
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Verify admin session
    if (!(await verifyAdminSession(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
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

    const validationResult = UpdatePostSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.format(),
        },
        { status: 400 },
      );
    }

    const updates = validationResult.data;

    // Update post via Convex mutation
    try {
      await fetchMutation(api.blog.updatePost, {
        id: id as any, // Convex ID type
        ...updates,
        categoryId: updates.categoryId as any,
      });

      return NextResponse.json({
        success: true,
        message: "Post updated successfully",
      });
    } catch (convexError) {
      const errorMessage =
        convexError instanceof Error
          ? convexError.message
          : "Failed to update post";

      if (errorMessage.includes("not found")) {
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
      }

      if (errorMessage.includes("already in use")) {
        return NextResponse.json(
          { error: "Slug already in use" },
          { status: 409 },
        );
      }

      throw convexError;
    }
  } catch (error) {
    console.error("Update post error:", error);
    return NextResponse.json(
      { error: "An error occurred while updating the post" },
      { status: 500 },
    );
  }
}

/**
 * DELETE handler - Archive blog post (soft delete)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Verify admin session
    if (!(await verifyAdminSession(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
    }

    // Archive post via Convex mutation
    try {
      await fetchMutation(api.blog.deletePost, {
        id: id as any, // Convex ID type
      });

      return NextResponse.json({
        success: true,
        message: "Post archived successfully",
      });
    } catch (convexError) {
      const errorMessage =
        convexError instanceof Error
          ? convexError.message
          : "Failed to archive post";

      if (errorMessage.includes("not found")) {
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
      }

      if (errorMessage.includes("already archived")) {
        return NextResponse.json(
          { error: "Post is already archived" },
          { status: 409 },
        );
      }

      throw convexError;
    }
  } catch (error) {
    console.error("Delete post error:", error);
    return NextResponse.json(
      { error: "An error occurred while archiving the post" },
      { status: 500 },
    );
  }
}
