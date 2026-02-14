/**
 * Admin Blog Publish API Route Tests
 * Tests POST /api/admin/blog/publish endpoint
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { verifySessionToken } from "@/lib/auth";

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
      publishPost: "blog:publishPost",
    },
  },
}));

import { fetchMutation } from "convex/nextjs";
// Import route after mocks are set up
import { POST } from "./route";

describe("POST /api/admin/blog/publish", () => {
  beforeEach(() => {
    // Set default: auth succeeds
    vi.mocked(verifySessionToken).mockReturnValue(Promise.resolve(true));
    vi.mocked(fetchMutation).mockResolvedValue(undefined);
  });

  it("should publish a post with valid ID and authentication", async () => {
    const publishData = {
      id: "test-post-id-123",
    };

    const request = new Request(
      "http://localhost:3000/api/admin/blog/publish",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(publishData),
      },
    ) as any;

    // Mock cookies property
    Object.defineProperty(request, "cookies", {
      value: {
        get: () => ({ value: "valid-session-token" }),
      },
      writable: true,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe("Post published successfully");
    expect(fetchMutation).toHaveBeenCalledTimes(1);
  });

  it("should return 401 when session is invalid", async () => {
    vi.mocked(verifySessionToken).mockReturnValue(Promise.resolve(false)); // Override for this test

    const request = new Request(
      "http://localhost:3000/api/admin/blog/publish",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: "test-id" }),
      },
    ) as any;

    // Mock cookies property with invalid token
    Object.defineProperty(request, "cookies", {
      value: {
        get: () => ({ value: "invalid-token" }),
      },
      writable: true,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("should return 401 when session cookie is missing", async () => {
    const request = new Request(
      "http://localhost:3000/api/admin/blog/publish",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: "test-id" }),
      },
    ) as any;

    // Mock cookies property with no session token
    Object.defineProperty(request, "cookies", {
      value: {
        get: () => undefined,
      },
      writable: true,
    });

    const response = await POST(request);
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

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid request body");
  });

  it("should return 400 when post ID is missing", async () => {
    const request = new Request(
      "http://localhost:3000/api/admin/blog/publish",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      },
    ) as any;

    // Mock cookies property
    Object.defineProperty(request, "cookies", {
      value: {
        get: () => ({ value: "valid-session-token" }),
      },
      writable: true,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Validation failed");
  });

  it("should return 400 when post ID is empty string", async () => {
    const request = new Request(
      "http://localhost:3000/api/admin/blog/publish",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: "" }),
      },
    ) as any;

    // Mock cookies property
    Object.defineProperty(request, "cookies", {
      value: {
        get: () => ({ value: "valid-session-token" }),
      },
      writable: true,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Validation failed");
  });

  it("should return 404 when post is not found", async () => {
    vi.mocked(fetchMutation).mockRejectedValue(new Error("Post not found"));

    const request = new Request(
      "http://localhost:3000/api/admin/blog/publish",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: "nonexistent-id" }),
      },
    ) as any;

    // Mock cookies property
    Object.defineProperty(request, "cookies", {
      value: {
        get: () => ({ value: "valid-session-token" }),
      },
      writable: true,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Post not found");
  });

  it("should return 409 when post is already published", async () => {
    vi.mocked(fetchMutation).mockRejectedValue(
      new Error("Post is already published"),
    );

    const request = new Request(
      "http://localhost:3000/api/admin/blog/publish",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: "already-published-id" }),
      },
    ) as any;

    // Mock cookies property
    Object.defineProperty(request, "cookies", {
      value: {
        get: () => ({ value: "valid-session-token" }),
      },
      writable: true,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.error).toBe("Post is already published");
  });

  it("should return 409 when trying to publish archived post", async () => {
    vi.mocked(fetchMutation).mockRejectedValue(
      new Error("Cannot publish archived post. Restore it first."),
    );

    const request = new Request(
      "http://localhost:3000/api/admin/blog/publish",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: "archived-post-id" }),
      },
    ) as any;

    // Mock cookies property
    Object.defineProperty(request, "cookies", {
      value: {
        get: () => ({ value: "valid-session-token" }),
      },
      writable: true,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.error).toBe("Cannot publish archived post");
  });

  it("should return 500 when Convex mutation fails", async () => {
    vi.mocked(fetchMutation).mockRejectedValue(
      new Error("Database connection failed"),
    );

    const request = new Request(
      "http://localhost:3000/api/admin/blog/publish",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: "test-id" }),
      },
    ) as any;

    // Mock cookies property
    Object.defineProperty(request, "cookies", {
      value: {
        get: () => ({ value: "valid-session-token" }),
      },
      writable: true,
    });

    const response = await POST(request);
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
        headers: { "Content-Type": "application/json" },
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

    const response = await POST(request);
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validData),
      },
    ) as any;

    // Mock cookies property
    Object.defineProperty(request, "cookies", {
      value: {
        get: () => ({ value: "valid-session-token" }),
      },
      writable: true,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });
});
