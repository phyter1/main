/**
 * Admin Blog Post API Route Tests
 * Tests PATCH /api/admin/blog/[id] and DELETE /api/admin/blog/[id] endpoints
 */

import { beforeEach, describe, expect, it, mock } from "bun:test";
import { DELETE, PATCH } from "./route";

// Mock session verification
const mockVerifySessionToken = mock(() => true);
mock.module("@/lib/auth", () => ({
  verifySessionToken: mockVerifySessionToken,
}));

// Mock Convex mutation
const mockFetchMutation = mock(() => undefined);
mock.module("convex/nextjs", () => ({
  fetchMutation: mockFetchMutation,
}));

// Mock Convex API
mock.module("../../../../../../convex/_generated/api", () => ({
  api: {
    blog: {
      updatePost: "updatePost",
      deletePost: "deletePost",
    },
  },
}));

describe("PATCH /api/admin/blog/[id]", () => {
  beforeEach(() => {
    mock.restore();
    mockVerifySessionToken.mockReturnValue(true);
    mockFetchMutation.mockReturnValue(undefined);
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
          Cookie: "session=valid-session-token",
        },
        body: JSON.stringify(updateData),
      },
    );

    const response = await PATCH(request as any, {
      params: { id: "test-id" },
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe("Post updated successfully");
    expect(mockFetchMutation).toHaveBeenCalledTimes(1);
  });

  it("should return 401 when session is invalid", async () => {
    mockVerifySessionToken.mockReturnValue(false);

    const request = new Request(
      "http://localhost:3000/api/admin/blog/test-id",
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Cookie: "session=invalid-token",
        },
        body: JSON.stringify({ title: "Updated" }),
      },
    );

    const response = await PATCH(request as any, {
      params: { id: "test-id" },
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
        Cookie: "session=valid-session-token",
      },
      body: JSON.stringify({ title: "Updated" }),
    });

    const response = await PATCH(request as any, {
      params: { id: "" },
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
          Cookie: "session=valid-session-token",
        },
        body: "invalid json {",
      },
    );

    const response = await PATCH(request as any, {
      params: { id: "test-id" },
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
          Cookie: "session=valid-session-token",
        },
        body: JSON.stringify(invalidData),
      },
    );

    const response = await PATCH(request as any, {
      params: { id: "test-id" },
    });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Validation failed");
  });

  it("should return 404 when post is not found", async () => {
    mockFetchMutation.mockImplementation(() => {
      throw new Error("Post not found");
    });

    const request = new Request(
      "http://localhost:3000/api/admin/blog/nonexistent-id",
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Cookie: "session=valid-session-token",
        },
        body: JSON.stringify({ title: "Updated" }),
      },
    );

    const response = await PATCH(request as any, {
      params: { id: "nonexistent-id" },
    });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Post not found");
  });

  it("should return 409 when slug is already in use", async () => {
    mockFetchMutation.mockImplementation(() => {
      throw new Error('Slug "new-slug" is already in use');
    });

    const request = new Request(
      "http://localhost:3000/api/admin/blog/test-id",
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Cookie: "session=valid-session-token",
        },
        body: JSON.stringify({ slug: "new-slug" }),
      },
    );

    const response = await PATCH(request as any, {
      params: { id: "test-id" },
    });
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.error).toBe("Slug already in use");
  });

  it("should return 500 when Convex mutation fails", async () => {
    mockFetchMutation.mockImplementation(() => {
      throw new Error("Database error");
    });

    const request = new Request(
      "http://localhost:3000/api/admin/blog/test-id",
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Cookie: "session=valid-session-token",
        },
        body: JSON.stringify({ title: "Updated" }),
      },
    );

    const response = await PATCH(request as any, {
      params: { id: "test-id" },
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
          Cookie: "session=valid-session-token",
        },
        body: JSON.stringify(partialUpdate),
      },
    );

    const response = await PATCH(request as any, {
      params: { id: "test-id" },
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
          Cookie: "session=valid-session-token",
        },
        body: JSON.stringify(invalidUpdate),
      },
    );

    const response = await PATCH(request as any, {
      params: { id: "test-id" },
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
          Cookie: "session=valid-session-token",
        },
        body: JSON.stringify(multiFieldUpdate),
      },
    );

    const response = await PATCH(request as any, {
      params: { id: "test-id" },
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });
});

describe("DELETE /api/admin/blog/[id]", () => {
  beforeEach(() => {
    mock.restore();
    mockVerifySessionToken.mockReturnValue(true);
    mockFetchMutation.mockReturnValue(undefined);
  });

  it("should archive a post with valid ID and authentication", async () => {
    const request = new Request(
      "http://localhost:3000/api/admin/blog/test-id",
      {
        method: "DELETE",
        headers: {
          Cookie: "session=valid-session-token",
        },
      },
    );

    const response = await DELETE(request as any, {
      params: { id: "test-id" },
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe("Post archived successfully");
    expect(mockFetchMutation).toHaveBeenCalledTimes(1);
  });

  it("should return 401 when session is invalid", async () => {
    mockVerifySessionToken.mockReturnValue(false);

    const request = new Request(
      "http://localhost:3000/api/admin/blog/test-id",
      {
        method: "DELETE",
        headers: {
          Cookie: "session=invalid-token",
        },
      },
    );

    const response = await DELETE(request as any, {
      params: { id: "test-id" },
    });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("should return 400 when post ID is missing", async () => {
    const request = new Request("http://localhost:3000/api/admin/blog/", {
      method: "DELETE",
      headers: {
        Cookie: "session=valid-session-token",
      },
    });

    const response = await DELETE(request as any, {
      params: { id: "" },
    });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid post ID");
  });

  it("should return 404 when post is not found", async () => {
    mockFetchMutation.mockImplementation(() => {
      throw new Error("Post not found");
    });

    const request = new Request(
      "http://localhost:3000/api/admin/blog/nonexistent-id",
      {
        method: "DELETE",
        headers: {
          Cookie: "session=valid-session-token",
        },
      },
    );

    const response = await DELETE(request as any, {
      params: { id: "nonexistent-id" },
    });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Post not found");
  });

  it("should return 409 when post is already archived", async () => {
    mockFetchMutation.mockImplementation(() => {
      throw new Error("Post is already archived");
    });

    const request = new Request(
      "http://localhost:3000/api/admin/blog/test-id",
      {
        method: "DELETE",
        headers: {
          Cookie: "session=valid-session-token",
        },
      },
    );

    const response = await DELETE(request as any, {
      params: { id: "test-id" },
    });
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.error).toBe("Post is already archived");
  });

  it("should return 500 when Convex mutation fails", async () => {
    mockFetchMutation.mockImplementation(() => {
      throw new Error("Database error");
    });

    const request = new Request(
      "http://localhost:3000/api/admin/blog/test-id",
      {
        method: "DELETE",
        headers: {
          Cookie: "session=valid-session-token",
        },
      },
    );

    const response = await DELETE(request as any, {
      params: { id: "test-id" },
    });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("An error occurred while archiving the post");
  });
});
