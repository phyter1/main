/**
 * Admin Blog Publish API Route Tests
 * Tests POST /api/admin/blog/publish endpoint
 */

import { beforeEach, describe, expect, it, mock } from "bun:test";
import { POST } from "./route";

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
      publishPost: "publishPost",
    },
  },
}));

describe("POST /api/admin/blog/publish", () => {
  beforeEach(() => {
    mock.restore();
    mockVerifySessionToken.mockReturnValue(true);
    mockFetchMutation.mockReturnValue(undefined);
  });

  it("should publish a post with valid ID and authentication", async () => {
    const publishData = {
      id: "test-post-id-123",
    };

    const request = new Request(
      "http://localhost:3000/api/admin/blog/publish",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: "session=valid-session-token",
        },
        body: JSON.stringify(publishData),
      },
    );

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe("Post published successfully");
    expect(mockFetchMutation).toHaveBeenCalledTimes(1);
  });

  it("should return 401 when session is invalid", async () => {
    mockVerifySessionToken.mockReturnValue(false);

    const request = new Request(
      "http://localhost:3000/api/admin/blog/publish",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: "session=invalid-token",
        },
        body: JSON.stringify({ id: "test-id" }),
      },
    );

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("should return 401 when session cookie is missing", async () => {
    const request = new Request(
      "http://localhost:3000/api/admin/blog/publish",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: "test-id" }),
      },
    );

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("should return 400 when request body is invalid JSON", async () => {
    const request = new Request(
      "http://localhost:3000/api/admin/blog/publish",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: "session=valid-session-token",
        },
        body: "invalid json {",
      },
    );

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid request body");
  });

  it("should return 400 when post ID is missing", async () => {
    const request = new Request(
      "http://localhost:3000/api/admin/blog/publish",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: "session=valid-session-token",
        },
        body: JSON.stringify({}),
      },
    );

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Validation failed");
  });

  it("should return 400 when post ID is empty string", async () => {
    const request = new Request(
      "http://localhost:3000/api/admin/blog/publish",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: "session=valid-session-token",
        },
        body: JSON.stringify({ id: "" }),
      },
    );

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Validation failed");
  });

  it("should return 404 when post is not found", async () => {
    mockFetchMutation.mockImplementation(() => {
      throw new Error("Post not found");
    });

    const request = new Request(
      "http://localhost:3000/api/admin/blog/publish",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: "session=valid-session-token",
        },
        body: JSON.stringify({ id: "nonexistent-id" }),
      },
    );

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Post not found");
  });

  it("should return 409 when post is already published", async () => {
    mockFetchMutation.mockImplementation(() => {
      throw new Error("Post is already published");
    });

    const request = new Request(
      "http://localhost:3000/api/admin/blog/publish",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: "session=valid-session-token",
        },
        body: JSON.stringify({ id: "already-published-id" }),
      },
    );

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.error).toBe("Post is already published");
  });

  it("should return 409 when trying to publish archived post", async () => {
    mockFetchMutation.mockImplementation(() => {
      throw new Error("Cannot publish archived post. Restore it first.");
    });

    const request = new Request(
      "http://localhost:3000/api/admin/blog/publish",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: "session=valid-session-token",
        },
        body: JSON.stringify({ id: "archived-post-id" }),
      },
    );

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.error).toBe("Cannot publish archived post");
  });

  it("should return 500 when Convex mutation fails", async () => {
    mockFetchMutation.mockImplementation(() => {
      throw new Error("Database connection failed");
    });

    const request = new Request(
      "http://localhost:3000/api/admin/blog/publish",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: "session=valid-session-token",
        },
        body: JSON.stringify({ id: "test-id" }),
      },
    );

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("An error occurred while publishing the post");
  });

  it("should validate request body format", async () => {
    const invalidData = {
      postId: "test-id", // Wrong field name (should be "id")
    };

    const request = new Request(
      "http://localhost:3000/api/admin/blog/publish",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: "session=valid-session-token",
        },
        body: JSON.stringify(invalidData),
      },
    );

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Validation failed");
  });

  it("should accept string post ID", async () => {
    const validData = {
      id: "valid-post-id-string",
    };

    const request = new Request(
      "http://localhost:3000/api/admin/blog/publish",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: "session=valid-session-token",
        },
        body: JSON.stringify(validData),
      },
    );

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });
});
