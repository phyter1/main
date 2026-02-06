/**
 * Category Management API Route
 * POST /api/admin/blog/categories - Creates a new blog category
 * Requires admin authentication
 */

import { fetchMutation } from "convex/nextjs";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifySessionToken } from "@/lib/auth";
import { api } from "../../../../../../convex/_generated/api";

/**
 * Zod schema for creating a category
 * Validates name and description requirements
 */
const CreateCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(500, "Description too long"),
});

export async function POST(request: NextRequest) {
  try {
    // Verify admin session
    const sessionCookie = request.cookies.get("session")?.value;

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

    const validationResult = CreateCategorySchema.safeParse(body);

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

    // Create category via Convex mutation
    try {
      const categoryId = await fetchMutation(api.blog.createCategory, {
        name: data.name,
        description: data.description,
      });

      return NextResponse.json(
        {
          success: true,
          categoryId,
          message: "Category created successfully",
        },
        { status: 201 },
      );
    } catch (convexError) {
      // Handle Convex-specific errors (e.g., duplicate slug)
      const errorMessage =
        convexError instanceof Error
          ? convexError.message
          : "Failed to create category";

      if (errorMessage.includes("already exists")) {
        return NextResponse.json({ error: errorMessage }, { status: 409 });
      }

      throw convexError;
    }
  } catch (error) {
    console.error("Create category error:", error);
    return NextResponse.json(
      { error: "An error occurred while creating the category" },
      { status: 500 },
    );
  }
}
