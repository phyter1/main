/**
 * Category Update/Delete API Route Tests
 * Tests PATCH and DELETE /api/admin/blog/categories/[id]
 */

import type { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock auth module
const mockVerifySessionToken = vi.fn(() => Promise.resolve(true));
vi.mock("@/lib/auth", () => ({
  verifySessionToken: mockVerifySessionToken,
}));

// Mock Convex fetchMutation
const mockFetchMutation = vi.fn(() => Promise.resolve());
vi.mock("convex/nextjs", () => ({
  fetchMutation: mockFetchMutation,
}));

// Mock Convex API
vi.mock("../../../../../../../convex/_generated/api", () => ({
  api: {
    blog: {
      updateCategory: "blog:updateCategory",
      deleteCategory: "blog:deleteCategory",
    },
  },
}));

// Import route handlers
let PATCH: any;
let DELETE: any;

describe("PATCH /api/admin/blog/categories/[id]", () => {
  beforeEach(async () => {
    mockVerifySessionToken.mockReset();
    mockVerifySessionToken.mockImplementation(() => Promise.resolve(true));
    mockFetchMutation.mockReset();
    mockFetchMutation.mockImplementation(() => Promise.resolve());

    // Dynamically import to get mocked version
    const module = await import("./route");
    PATCH = module.PATCH;
    DELETE = module.DELETE;
  });

  it("should require authentication", async () => {
    mockVerifySessionToken.mockReturnValue(Promise.resolve(false));

    const request = new Request(
      "http://localhost:3000/api/admin/blog/categories/123",
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Updated" }),
      },
    ) as NextRequest;

    // Mock cookies property
    Object.defineProperty(request, "cookies", {
      value: {
        get: () => ({ value: "invalid-token" }),
      },
      writable: true,
    });

    const response = await PATCH(request, {
      params: Promise.resolve({ id: "123" }),
    });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("should update category with valid data", async () => {
    const request = new Request(
      "http://localhost:3000/api/admin/blog/categories/category123",
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Updated Category",
          description: "Updated description",
        }),
      },
    ) as NextRequest;

    // Mock cookies property
    Object.defineProperty(request, "cookies", {
      value: {
        get: () => ({ value: "valid-session-token" }),
      },
      writable: true,
    });

    const response = await PATCH(request, {
      params: Promise.resolve({ id: "category123" }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockFetchMutation).toHaveBeenCalled();
  });

  it("should allow partial updates", async () => {
    const request = new Request(
      "http://localhost:3000/api/admin/blog/categories/category123",
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "New Name Only",
        }),
      },
    ) as NextRequest;

    // Mock cookies property
    Object.defineProperty(request, "cookies", {
      value: {
        get: () => ({ value: "valid-session-token" }),
      },
      writable: true,
    });

    const response = await PATCH(request, {
      params: Promise.resolve({ id: "category123" }),
    });

    expect(response.status).toBe(200);
  });

  it("should validate name if provided", async () => {
    const request = new Request(
      "http://localhost:3000/api/admin/blog/categories/category123",
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "", // Empty name should fail
        }),
      },
    ) as NextRequest;

    // Mock cookies property
    Object.defineProperty(request, "cookies", {
      value: {
        get: () => ({ value: "valid-session-token" }),
      },
      writable: true,
    });

    const response = await PATCH(request, {
      params: Promise.resolve({ id: "category123" }),
    });

    expect(response.status).toBe(400);
  });

  it("should handle category not found", async () => {
    mockFetchMutation.mockRejectedValue(new Error("Category not found"));

    const request = new Request(
      "http://localhost:3000/api/admin/blog/categories/nonexistent",
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Updated" }),
      },
    ) as NextRequest;

    // Mock cookies property
    Object.defineProperty(request, "cookies", {
      value: {
        get: () => ({ value: "valid-session-token" }),
      },
      writable: true,
    });

    const response = await PATCH(request, {
      params: Promise.resolve({ id: "nonexistent" }),
    });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toContain("not found");
  });

  it("should handle duplicate category errors", async () => {
    mockFetchMutation.mockRejectedValue(
      new Error('Category with slug "technology" already exists'),
    );

    const request = new Request(
      "http://localhost:3000/api/admin/blog/categories/category123",
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Technology" }),
      },
    ) as NextRequest;

    // Mock cookies property
    Object.defineProperty(request, "cookies", {
      value: {
        get: () => ({ value: "valid-session-token" }),
      },
      writable: true,
    });

    const response = await PATCH(request, {
      params: Promise.resolve({ id: "category123" }),
    });
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.error).toContain("already exists");
  });
});

describe("DELETE /api/admin/blog/categories/[id]", () => {
  beforeEach(async () => {
    mockVerifySessionToken.mockReset();
    mockVerifySessionToken.mockImplementation(() => Promise.resolve(true));
    mockFetchMutation.mockReset();
    mockFetchMutation.mockImplementation(() => Promise.resolve());

    // Dynamically import already done in PATCH describe block
  });

  it("should require authentication", async () => {
    mockVerifySessionToken.mockReturnValue(Promise.resolve(false));

    const request = new Request(
      "http://localhost:3000/api/admin/blog/categories/123",
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      },
    ) as NextRequest;

    // Mock cookies property
    Object.defineProperty(request, "cookies", {
      value: {
        get: () => ({ value: "invalid-token" }),
      },
      writable: true,
    });

    const response = await DELETE(request, {
      params: Promise.resolve({ id: "123" }),
    });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("should delete category with valid ID", async () => {
    const request = new Request(
      "http://localhost:3000/api/admin/blog/categories/category123",
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      },
    ) as NextRequest;

    // Mock cookies property
    Object.defineProperty(request, "cookies", {
      value: {
        get: () => ({ value: "valid-session-token" }),
      },
      writable: true,
    });

    const response = await DELETE(request, {
      params: Promise.resolve({ id: "category123" }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockFetchMutation).toHaveBeenCalled();
  });

  it("should handle category not found", async () => {
    mockFetchMutation.mockRejectedValue(new Error("Category not found"));

    const request = new Request(
      "http://localhost:3000/api/admin/blog/categories/nonexistent",
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      },
    ) as NextRequest;

    // Mock cookies property
    Object.defineProperty(request, "cookies", {
      value: {
        get: () => ({ value: "valid-session-token" }),
      },
      writable: true,
    });

    const response = await DELETE(request, {
      params: Promise.resolve({ id: "nonexistent" }),
    });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toContain("not found");
  });

  it("should handle Convex errors gracefully", async () => {
    mockFetchMutation.mockRejectedValue(new Error("Database error"));

    const request = new Request(
      "http://localhost:3000/api/admin/blog/categories/category123",
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      },
    ) as NextRequest;

    // Mock cookies property
    Object.defineProperty(request, "cookies", {
      value: {
        get: () => ({ value: "valid-session-token" }),
      },
      writable: true,
    });

    const response = await DELETE(request, {
      params: Promise.resolve({ id: "category123" }),
    });

    expect(response.status).toBe(500);
  });
});
