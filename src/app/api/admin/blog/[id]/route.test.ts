/**
 * Admin Blog Post API Route Tests
 * Tests PATCH /api/admin/blog/[id] and DELETE /api/admin/blog/[id] endpoints
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock auth module
vi.mock("@/lib/auth", () => ({
  verifySessionToken: vi.fn(() => Promise.resolve(true)),
}));

// Mock Convex fetchMutation
vi.mock("convex/nextjs", () => ({
  fetchMutation: vi.fn(() => Promise.resolve(undefined)),
}));

// Mock Convex API
vi.mock("../../../../../../convex/_generated/api", () => ({
  api: {
    blog: {
      updatePost: "blog:updatePost",
      deletePost: "blog:deletePost",
    },
  },
}));

import { fetchMutation } from "convex/nextjs";
// Import mocks and route after setup
import { verifySessionToken } from "@/lib/auth";
import { DELETE, PATCH } from "./route";

describe("PATCH /api/admin/blog/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(verifySessionToken).mockReturnValue(Promise.resolve(true));
    vi.mocked(fetchMutation).mockResolvedValue(undefined);
  });

  it("should update a post with valid data and authentication", async () => {
    const updateData = {
      title: "Updated Title",
      excerpt: "Updated excerpt",
      content: "Updated content",
    };

    const request = new Request(
      "http://localhost:3000/api/admin/blog/test-id",
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      },
    ) as any;

    // Mock cookies property
    Object.defineProperty(request, "cookies", {
      value: {
        get: () => ({ value: "valid-session-token" }),
      },
      writable: true,
    });

    const response = await PATCH(request, {
      params: Promise.resolve({ id: "test-id" }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe("Post updated successfully");
    expect(fetchMutation).toHaveBeenCalledTimes(1);
  });

  it("should return 401 when session is invalid", async () => {
    vi.mocked(verifySessionToken).mockReturnValue(Promise.resolve(false));

    const request = new Request(
      "http://localhost:3000/api/admin/blog/test-id",
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: "Updated" }),
      },
    ) as any;

    // Mock cookies property with invalid token
    Object.defineProperty(request, "cookies", {
      value: {
        get: () => ({ value: "invalid-token" }),
      },
      writable: true,
    });

    const response = await PATCH(request, {
      params: Promise.resolve({ id: "test-id" }),
    });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("should return 400 when post ID is missing", async () => {
    const request = new Request("http://localhost:3000/api/admin/blog/", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title: "Updated" }),
    }) as any;

    // Mock cookies property
    Object.defineProperty(request, "cookies", {
      value: {
        get: () => ({ value: "valid-session-token" }),
      },
      writable: true,
    });

    const response = await PATCH(request, {
      params: Promise.resolve({ id: "" }),
    });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid post ID");
  });

  it("should return 400 when request body is invalid JSON", async () => {
    const request = new Request(
      "http://localhost:3000/api/admin/blog/test-id",
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: "invalid json {",
      },
    ) as any;

    // Mock cookies property
    Object.defineProperty(request, "cookies", {
      value: {
        get: () => ({ value: "valid-session-token" }),
      },
      writable: true,
    });

    const response = await PATCH(request, {
      params: Promise.resolve({ id: "test-id" }),
    });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid request body");
  });

  it("should return 400 when validation fails", async () => {
    const invalidData = {
      title: "", // Empty title is invalid
    };

    const request = new Request(
      "http://localhost:3000/api/admin/blog/test-id",
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invalidData),
      },
    ) as any;

    // Mock cookies property
    Object.defineProperty(request, "cookies", {
      value: {
        get: () => ({ value: "valid-session-token" }),
      },
      writable: true,
    });

    const response = await PATCH(request, {
      params: Promise.resolve({ id: "test-id" }),
    });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Validation failed");
  });

  it("should return 404 when post is not found", async () => {
    vi.mocked(fetchMutation).mockRejectedValue(new Error("Post not found"));

    const request = new Request(
      "http://localhost:3000/api/admin/blog/nonexistent-id",
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: "Updated" }),
      },
    ) as any;

    // Mock cookies property
    Object.defineProperty(request, "cookies", {
      value: {
        get: () => ({ value: "valid-session-token" }),
      },
      writable: true,
    });

    const response = await PATCH(request, {
      params: Promise.resolve({ id: "nonexistent-id" }),
    });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Post not found");
  });

  it("should return 409 when slug is already in use", async () => {
    vi.mocked(fetchMutation).mockRejectedValue(
      new Error('Slug "new-slug" is already in use'),
    );

    const request = new Request(
      "http://localhost:3000/api/admin/blog/test-id",
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ slug: "new-slug" }),
      },
    ) as any;

    // Mock cookies property
    Object.defineProperty(request, "cookies", {
      value: {
        get: () => ({ value: "valid-session-token" }),
      },
      writable: true,
    });

    const response = await PATCH(request, {
      params: Promise.resolve({ id: "test-id" }),
    });
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.error).toBe("Slug already in use");
  });

  it("should return 500 when Convex mutation fails", async () => {
    vi.mocked(fetchMutation).mockRejectedValue(new Error("Database error"));

    const request = new Request(
      "http://localhost:3000/api/admin/blog/test-id",
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: "Updated" }),
      },
    ) as any;

    // Mock cookies property
    Object.defineProperty(request, "cookies", {
      value: {
        get: () => ({ value: "valid-session-token" }),
      },
      writable: true,
    });

    const response = await PATCH(request, {
      params: Promise.resolve({ id: "test-id" }),
    });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("An error occurred while updating the post");
  });

  it("should accept partial updates", async () => {
    const partialUpdate = {
      title: "Only Title Updated",
    };

    const request = new Request(
      "http://localhost:3000/api/admin/blog/test-id",
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(partialUpdate),
      },
    ) as any;

    // Mock cookies property
    Object.defineProperty(request, "cookies", {
      value: {
        get: () => ({ value: "valid-session-token" }),
      },
      writable: true,
    });

    const response = await PATCH(request, {
      params: Promise.resolve({ id: "test-id" }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it("should validate slug format when updating", async () => {
    const invalidUpdate = {
      slug: "Invalid Slug!",
    };

    const request = new Request(
      "http://localhost:3000/api/admin/blog/test-id",
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invalidUpdate),
      },
    ) as any;

    // Mock cookies property
    Object.defineProperty(request, "cookies", {
      value: {
        get: () => ({ value: "valid-session-token" }),
      },
      writable: true,
    });

    const response = await PATCH(request, {
      params: Promise.resolve({ id: "test-id" }),
    });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Validation failed");
  });

  it("should update multiple fields at once", async () => {
    const multiFieldUpdate = {
      title: "New Title",
      excerpt: "New excerpt",
      content: "New content",
      featured: true,
      tags: ["new-tag"],
    };

    const request = new Request(
      "http://localhost:3000/api/admin/blog/test-id",
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(multiFieldUpdate),
      },
    ) as any;

    // Mock cookies property
    Object.defineProperty(request, "cookies", {
      value: {
        get: () => ({ value: "valid-session-token" }),
      },
      writable: true,
    });

    const response = await PATCH(request, {
      params: Promise.resolve({ id: "test-id" }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });
});

describe("DELETE /api/admin/blog/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(verifySessionToken).mockReturnValue(Promise.resolve(true));
    vi.mocked(fetchMutation).mockResolvedValue(undefined);
  });

  it("should archive a post with valid ID and authentication", async () => {
    const request = new Request(
      "http://localhost:3000/api/admin/blog/test-id",
      {
        method: "DELETE",
      },
    ) as any;

    // Mock cookies property
    Object.defineProperty(request, "cookies", {
      value: {
        get: () => ({ value: "valid-session-token" }),
      },
      writable: true,
    });

    const response = await DELETE(request, {
      params: Promise.resolve({ id: "test-id" }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe("Post archived successfully");
    expect(fetchMutation).toHaveBeenCalledTimes(1);
  });

  it("should return 401 when session is invalid", async () => {
    vi.mocked(verifySessionToken).mockReturnValue(Promise.resolve(false));

    const request = new Request(
      "http://localhost:3000/api/admin/blog/test-id",
      {
        method: "DELETE",
      },
    ) as any;

    // Mock cookies property with invalid token
    Object.defineProperty(request, "cookies", {
      value: {
        get: () => ({ value: "invalid-token" }),
      },
      writable: true,
    });

    const response = await DELETE(request, {
      params: Promise.resolve({ id: "test-id" }),
    });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("should return 400 when post ID is missing", async () => {
    const request = new Request("http://localhost:3000/api/admin/blog/", {
      method: "DELETE",
    }) as any;

    // Mock cookies property
    Object.defineProperty(request, "cookies", {
      value: {
        get: () => ({ value: "valid-session-token" }),
      },
      writable: true,
    });

    const response = await DELETE(request, {
      params: Promise.resolve({ id: "" }),
    });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid post ID");
  });

  it("should return 404 when post is not found", async () => {
    vi.mocked(fetchMutation).mockRejectedValue(new Error("Post not found"));

    const request = new Request(
      "http://localhost:3000/api/admin/blog/nonexistent-id",
      {
        method: "DELETE",
      },
    ) as any;

    // Mock cookies property
    Object.defineProperty(request, "cookies", {
      value: {
        get: () => ({ value: "valid-session-token" }),
      },
      writable: true,
    });

    const response = await DELETE(request, {
      params: Promise.resolve({ id: "nonexistent-id" }),
    });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Post not found");
  });

  it("should return 409 when post is already archived", async () => {
    vi.mocked(fetchMutation).mockRejectedValue(
      new Error("Post is already archived"),
    );

    const request = new Request(
      "http://localhost:3000/api/admin/blog/test-id",
      {
        method: "DELETE",
      },
    ) as any;

    // Mock cookies property
    Object.defineProperty(request, "cookies", {
      value: {
        get: () => ({ value: "valid-session-token" }),
      },
      writable: true,
    });

    const response = await DELETE(request, {
      params: Promise.resolve({ id: "test-id" }),
    });
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.error).toBe("Post is already archived");
  });

  it("should return 500 when Convex mutation fails", async () => {
    vi.mocked(fetchMutation).mockRejectedValue(new Error("Database error"));

    const request = new Request(
      "http://localhost:3000/api/admin/blog/test-id",
      {
        method: "DELETE",
      },
    ) as any;

    // Mock cookies property
    Object.defineProperty(request, "cookies", {
      value: {
        get: () => ({ value: "valid-session-token" }),
      },
      writable: true,
    });

    const response = await DELETE(request, {
      params: Promise.resolve({ id: "test-id" }),
    });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("An error occurred while archiving the post");
  });
});
