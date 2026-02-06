/**
 * Category Update/Delete API Routes
 * PATCH /api/admin/blog/categories/[id] - Updates a category
 * DELETE /api/admin/blog/categories/[id] - Deletes a category
 * Requires admin authentication
 */

import { fetchMutation } from "convex/nextjs";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifySessionToken } from "@/lib/auth";
import { api } from "../../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../../convex/_generated/dataModel";

/**
 * Zod schema for updating a category
 * All fields are optional for partial updates
 */
const UpdateCategorySchema = z.object({
  name: z
    .string()
    .min(1, "Name cannot be empty")
    .max(100, "Name too long")
    .optional(),
  description: z
    .string()
    .min(1, "Description cannot be empty")
    .max(500, "Description too long")
    .optional(),
});

/**
 * PATCH /api/admin/blog/categories/[id]
 * Updates an existing category with partial data
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Verify admin session
    const sessionCookie = request.cookies.get("session")?.value;

    if (!sessionCookie || !verifySessionToken(sessionCookie)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

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

    const validationResult = UpdateCategorySchema.safeParse(body);

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

    // Ensure at least one field is being updated
    if (!data.name && !data.description) {
      return NextResponse.json(
        { error: "At least one field must be provided for update" },
        { status: 400 },
      );
    }

    // Update category via Convex mutation
    try {
      await fetchMutation(api.blog.updateCategory, {
        id: id as Id<"blogCategories">,
        name: data.name,
        description: data.description,
      });

      return NextResponse.json(
        {
          success: true,
          message: "Category updated successfully",
        },
        { status: 200 },
      );
    } catch (convexError) {
      // Handle Convex-specific errors
      const errorMessage =
        convexError instanceof Error
          ? convexError.message
          : "Failed to update category";

      if (errorMessage.includes("not found")) {
        return NextResponse.json(
          { error: "Category not found" },
          { status: 404 },
        );
      }

      if (errorMessage.includes("already exists")) {
        return NextResponse.json({ error: errorMessage }, { status: 409 });
      }

      throw convexError;
    }
  } catch (error) {
    console.error("Update category error:", error);
    return NextResponse.json(
      { error: "An error occurred while updating the category" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/admin/blog/categories/[id]
 * Deletes an existing category
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Verify admin session
    const sessionCookie = request.cookies.get("session")?.value;

    if (!sessionCookie || !verifySessionToken(sessionCookie)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // Delete category via Convex mutation
    try {
      await fetchMutation(api.blog.deleteCategory, {
        id: id as Id<"blogCategories">,
      });

      return NextResponse.json(
        {
          success: true,
          message: "Category deleted successfully",
        },
        { status: 200 },
      );
    } catch (convexError) {
      // Handle Convex-specific errors
      const errorMessage =
        convexError instanceof Error
          ? convexError.message
          : "Failed to delete category";

      if (errorMessage.includes("not found")) {
        return NextResponse.json(
          { error: "Category not found" },
          { status: 404 },
        );
      }

      throw convexError;
    }
  } catch (error) {
    console.error("Delete category error:", error);
    return NextResponse.json(
      { error: "An error occurred while deleting the category" },
      { status: 500 },
    );
  }
}
