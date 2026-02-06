/**
 * Admin Blog Create API Route
 * POST /api/admin/blog/create - Creates a new draft blog post
 * Requires admin authentication
 */

import { fetchMutation } from "convex/nextjs";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifySessionToken } from "@/lib/auth";
import { api } from "../../../../../../convex/_generated/api";

/**
 * Zod schema for creating a blog post
 * Validates all required fields and optional metadata
 */
const CreatePostSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(200, "Slug too long")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers, and hyphens",
    ),
  excerpt: z
    .string()
    .min(1, "Excerpt is required")
    .max(500, "Excerpt too long"),
  content: z.string().min(1, "Content is required"),
  author: z.string().min(1, "Author is required"),
  coverImageUrl: z.string().url().optional(),
  categoryId: z.string().optional(),
  tags: z.array(z.string()).default([]),
  readingTimeMinutes: z.number().min(1).max(999),
  featured: z.boolean().optional().default(false),
  seoMetadata: z
    .object({
      metaTitle: z.string().max(60).optional(),
      metaDescription: z.string().max(160).optional(),
      ogImage: z.string().url().optional(),
      keywords: z.array(z.string()).optional(),
    })
    .optional()
    .default({}),
});

export async function POST(request: NextRequest) {
  try {
    // Verify admin session
    const cookies = request.headers.get("cookie") || "";
    const sessionMatch = cookies.match(/session=([^;]+)/);
    const sessionCookie = sessionMatch?.[1];

    if (!sessionCookie || !verifySessionToken(sessionCookie)) {
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

    const validationResult = CreatePostSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.format(),
        },
        { status: 400 },
      );
    }

    const data = validationResult.data;

    // Create post via Convex mutation
    try {
      const postId = await fetchMutation(api.blog.createPost, {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        author: data.author,
        coverImageUrl: data.coverImageUrl,
        categoryId: data.categoryId as any, // Convex ID type
        tags: data.tags,
        readingTimeMinutes: data.readingTimeMinutes,
        featured: data.featured,
        seoMetadata: data.seoMetadata,
      });

      return NextResponse.json(
        {
          success: true,
          postId,
          message: "Draft post created successfully",
        },
        { status: 201 },
      );
    } catch (convexError) {
      // Handle Convex-specific errors (e.g., duplicate slug)
      const errorMessage =
        convexError instanceof Error
          ? convexError.message
          : "Failed to create post";

      if (errorMessage.includes("already in use")) {
        return NextResponse.json(
          { error: "Slug already in use" },
          { status: 409 },
        );
      }

      throw convexError;
    }
  } catch (error) {
    console.error("Create post error:", error);
    return NextResponse.json(
      { error: "An error occurred while creating the post" },
      { status: 500 },
    );
  }
}
