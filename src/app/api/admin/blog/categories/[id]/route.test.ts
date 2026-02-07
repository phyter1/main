/**
 * Category Update/Delete API Route Tests
 * Tests PATCH and DELETE /api/admin/blog/categories/[id]
 */

import { beforeEach, describe, expect, it, mock } from "bun:test";
import type { NextRequest } from "next/server";
import { DELETE, PATCH } from "./route";

// Mock auth module
const mockVerifySessionToken = mock(() => true);
mock.module("@/lib/auth", () => ({
  verifySessionToken: mockVerifySessionToken,
}));

// Mock Convex fetchMutation
const mockFetchMutation = mock(() => Promise.resolve());
mock.module("convex/nextjs", () => ({
  fetchMutation: mockFetchMutation,
}));

// Mock Convex API
mock.module("../../../../../../../convex/_generated/api", () => ({
  api: {
    blog: {
      updateCategory: "blog:updateCategory",
      deleteCategory: "blog:deleteCategory",
    },
  },
}));

// Helper to create request with cookies
function createRequestWithCookies(
  url: string,
  method: string,
  body?: unknown,
  cookieValue = "valid-session-token",
): NextRequest {
  const request = new Request(url, {
    method,
    headers: { "Content-Type": "application/json" },
    ...(body && { body: JSON.stringify(body) }),
  }) as NextRequest;

  Object.defineProperty(request, "cookies", {
    value: {
      get: () => ({ value: cookieValue }),
    },
    writable: true,
  });

  return request;
}

describe("PATCH /api/admin/blog/categories/[id]", () => {
  beforeEach(() => {
    mock.restore();
    mockVerifySessionToken.mockReturnValue(true);
    mockFetchMutation.mockResolvedValue(undefined);
  });

  it("should require authentication", async () => {
    mockVerifySessionToken.mockReturnValue(false);

    const request = createRequestWithCookies(
      "http://localhost:3000/api/admin/blog/categories/123",
      "PATCH",
      { name: "Updated" },
      "invalid-token",
    );

    const response = await PATCH(request, {
      params: { id: "123" },
    });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("should update category with valid data", async () => {
    const request = createRequestWithCookies(
      "http://localhost:3000/api/admin/blog/categories/category123",
      "PATCH",
      {
        name: "Updated Category",
        description: "Updated description",
      },
    );

    const response = await PATCH(request, {
      params: { id: "category123" },
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockFetchMutation).toHaveBeenCalled();
  });

  it("should allow partial updates", async () => {
    const request = createRequestWithCookies(
      "http://localhost:3000/api/admin/blog/categories/category123",
      "PATCH",
      {
        name: "New Name Only",
      },
    );

    const response = await PATCH(request, {
      params: { id: "category123" },
    });

    expect(response.status).toBe(200);
  });

  it("should validate name if provided", async () => {
    const request = createRequestWithCookies(
      "http://localhost:3000/api/admin/blog/categories/category123",
      "PATCH",
      {
        name: "", // Empty name should fail
      },
    );

    const response = await PATCH(request, {
      params: { id: "category123" },
    });

    expect(response.status).toBe(400);
  });

  it("should handle category not found", async () => {
    mockFetchMutation.mockRejectedValue(new Error("Category not found"));

    const request = createRequestWithCookies(
      "http://localhost:3000/api/admin/blog/categories/nonexistent",
      "PATCH",
      { name: "Updated" },
    );

    const response = await PATCH(request, {
      params: { id: "nonexistent" },
    });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toContain("not found");
  });

  it("should handle duplicate category errors", async () => {
    mockFetchMutation.mockRejectedValue(
      new Error('Category with slug "technology" already exists'),
    );

    const request = createRequestWithCookies(
      "http://localhost:3000/api/admin/blog/categories/category123",
      "PATCH",
      { name: "Technology" },
    );

    const response = await PATCH(request, {
      params: { id: "category123" },
    });
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.error).toContain("already exists");
  });
});

describe("DELETE /api/admin/blog/categories/[id]", () => {
  beforeEach(() => {
    mock.restore();
    mockVerifySessionToken.mockReturnValue(true);
    mockFetchMutation.mockResolvedValue(undefined);
  });

  it("should require authentication", async () => {
    mockVerifySessionToken.mockReturnValue(false);

    const request = createRequestWithCookies(
      "http://localhost:3000/api/admin/blog/categories/123",
      "DELETE",
      undefined,
      "invalid-token",
    );

    const response = await DELETE(request, {
      params: { id: "123" },
    });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("should delete category with valid ID", async () => {
    const request = createRequestWithCookies(
      "http://localhost:3000/api/admin/blog/categories/category123",
      "DELETE",
    );

    const response = await DELETE(request, {
      params: { id: "category123" },
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockFetchMutation).toHaveBeenCalled();
  });

  it("should handle category not found", async () => {
    mockFetchMutation.mockRejectedValue(new Error("Category not found"));

    const request = createRequestWithCookies(
      "http://localhost:3000/api/admin/blog/categories/nonexistent",
      "DELETE",
    );

    const response = await DELETE(request, {
      params: { id: "nonexistent" },
    });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toContain("not found");
  });

  it("should handle Convex errors gracefully", async () => {
    mockFetchMutation.mockRejectedValue(new Error("Database error"));

    const request = createRequestWithCookies(
      "http://localhost:3000/api/admin/blog/categories/category123",
      "DELETE",
    );

    const response = await DELETE(request, {
      params: { id: "category123" },
    });

    expect(response.status).toBe(500);
  });
});
