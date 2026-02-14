/**
 * Category Management API Route Tests
 * Tests POST /api/admin/blog/categories for creating categories
 */

import { fetchMutation } from "convex/nextjs";
import type { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { verifySessionToken } from "@/lib/auth";
import { POST } from "./route";

// Mock auth module
vi.mock("@/lib/auth", () => ({
  verifySessionToken: vi.fn(() => Promise.resolve(true)),
}));

// Mock Convex fetchMutation
vi.mock("convex/nextjs", () => ({
  fetchMutation: vi.fn(() => Promise.resolve("category123")),
}));

// Mock Convex API
vi.mock("../../../../../../convex/_generated/api", () => ({
  api: {
    blog: {
      createCategory: "blog:createCategory",
    },
  },
}));

describe("POST /api/admin/blog/categories", () => {
  beforeEach(() => {
    vi.mocked(verifySessionToken).mockReturnValue(true);
    vi.mocked(fetchMutation).mockResolvedValue("category123");
  });

  it("should require authentication", async () => {
    vi.mocked(verifySessionToken).mockReturnValue(Promise.resolve(false));

    const request = new Request(
      "http://localhost:3000/api/admin/blog/categories",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Test", description: "Test desc" }),
      },
    ) as NextRequest;

    // Mock cookies property
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

  it("should validate required fields", async () => {
    const request = new Request(
      "http://localhost:3000/api/admin/blog/categories",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      },
    ) as NextRequest;

    // Mock cookies
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

  it("should create category with valid data", async () => {
    const request = new Request(
      "http://localhost:3000/api/admin/blog/categories",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Technology",
          description: "Articles about technology and innovation",
        }),
      },
    ) as NextRequest;

    // Mock cookies
    Object.defineProperty(request, "cookies", {
      value: {
        get: () => ({ value: "valid-session-token" }),
      },
      writable: true,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.categoryId).toBeDefined();
    expect(vi.mocked(fetchMutation)).toHaveBeenCalled();
  });

  it("should validate name length", async () => {
    const request = new Request(
      "http://localhost:3000/api/admin/blog/categories",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "",
          description: "Test description",
        }),
      },
    ) as NextRequest;

    Object.defineProperty(request, "cookies", {
      value: {
        get: () => ({ value: "valid-session-token" }),
      },
      writable: true,
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
  });

  it("should validate description length", async () => {
    const request = new Request(
      "http://localhost:3000/api/admin/blog/categories",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Test Category",
          description: "",
        }),
      },
    ) as NextRequest;

    Object.defineProperty(request, "cookies", {
      value: {
        get: () => ({ value: "valid-session-token" }),
      },
      writable: true,
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
  });

  it("should handle duplicate category errors", async () => {
    vi.mocked(fetchMutation).mockRejectedValue(
      new Error('Category with slug "technology" already exists'),
    );

    const request = new Request(
      "http://localhost:3000/api/admin/blog/categories",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Technology",
          description: "Tech articles",
        }),
      },
    ) as NextRequest;

    Object.defineProperty(request, "cookies", {
      value: {
        get: () => ({ value: "valid-session-token" }),
      },
      writable: true,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.error).toContain("already exists");
  });

  it("should handle invalid JSON body", async () => {
    const request = new Request(
      "http://localhost:3000/api/admin/blog/categories",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "invalid json",
      },
    ) as NextRequest;

    Object.defineProperty(request, "cookies", {
      value: {
        get: () => ({ value: "valid-session-token" }),
      },
      writable: true,
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
  });

  it("should handle Convex errors gracefully", async () => {
    vi.mocked(fetchMutation).mockRejectedValue(
      new Error("Database connection failed"),
    );

    const request = new Request(
      "http://localhost:3000/api/admin/blog/categories",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Test Category",
          description: "Test description",
        }),
      },
    ) as NextRequest;

    Object.defineProperty(request, "cookies", {
      value: {
        get: () => ({ value: "valid-session-token" }),
      },
      writable: true,
    });

    const response = await POST(request);

    expect(response.status).toBe(500);
  });
});
