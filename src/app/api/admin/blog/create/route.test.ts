/**
 * Admin Blog Create API Route Tests
 * Tests POST /api/admin/blog/create endpoint
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { verifySessionToken } from "@/lib/auth";

// Mock auth module
vi.mock("@/lib/auth", () => ({
  verifySessionToken: vi.fn(() => Promise.resolve(true)),
}));

// Mock Convex fetchMutation
vi.mock("convex/nextjs", () => ({
  fetchMutation: vi.fn(() => Promise.resolve("test-post-id-123")),
}));

// Mock Convex API
vi.mock("../../../../../../convex/_generated/api", () => ({
  api: {
    blog: {
      createPost: "blog:createPost",
    },
  },
}));

import { fetchMutation } from "convex/nextjs";
// Import route after mocks are set up
import { POST } from "./route";

describe("POST /api/admin/blog/create", () => {
  beforeEach(() => {
    // Set default: auth succeeds
    vi.mocked(verifySessionToken).mockReturnValue(Promise.resolve(true));
    vi.mocked(fetchMutation).mockResolvedValue("test-post-id-123");
  });

  it("should create a draft post with valid data and authentication", async () => {
    const validPostData = {
      title: "Test Blog Post",
      slug: "test-blog-post",
      excerpt: "This is a test excerpt for the blog post",
      content: "# Test Content\n\nThis is the full content of the test post.",
      author: "Test Author",
      readingTimeMinutes: 5,
      tags: ["test", "blog"],
      featured: false,
      seoMetadata: {
        metaTitle: "Test Blog Post - SEO Title",
        metaDescription: "This is the meta description for SEO",
      },
    };

    const request = new Request("http://localhost:3000/api/admin/blog/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validPostData),
    }) as any;

    // Mock cookies property
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
    expect(data.postId).toBe("test-post-id-123");
    expect(data.message).toBe("Draft post created successfully");
    expect(fetchMutation).toHaveBeenCalledTimes(1);
  });

  it("should return 401 when session is invalid", async () => {
    vi.mocked(verifySessionToken).mockReturnValue(Promise.resolve(false)); // Override for this test

    const request = new Request("http://localhost:3000/api/admin/blog/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Test" }),
    }) as any;

    // Mock cookies property with invalid token
    Object.defineProperty(request, "cookies", {
      value: {
        get: () => ({ value: "invalid-token" }),
      },
      writable: true,
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("should return 401 when session cookie is missing", async () => {
    const request = new Request("http://localhost:3000/api/admin/blog/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Test" }),
    }) as any;

    // Mock cookies property with no session token
    Object.defineProperty(request, "cookies", {
      value: {
        get: () => undefined,
      },
      writable: true,
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("should return 400 when request body is invalid JSON", async () => {
    const request = new Request("http://localhost:3000/api/admin/blog/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: "invalid json {",
    }) as any;

    // Mock cookies property
    Object.defineProperty(request, "cookies", {
      value: {
        get: () => ({ value: "valid-session-token" }),
      },
      writable: true,
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid request body");
  });

  it("should return 400 when title is missing", async () => {
    const invalidData = {
      slug: "test-slug",
      excerpt: "Test excerpt",
      content: "Test content",
      author: "Test Author",
      readingTimeMinutes: 5,
    };

    const request = new Request("http://localhost:3000/api/admin/blog/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(invalidData),
    }) as any;

    // Mock cookies property
    Object.defineProperty(request, "cookies", {
      value: {
        get: () => ({ value: "valid-session-token" }),
      },
      writable: true,
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Validation failed");
    expect(data.details).toBeDefined();
  });

  it("should return 400 when slug format is invalid", async () => {
    const invalidData = {
      title: "Test Post",
      slug: "Invalid Slug With Spaces!",
      excerpt: "Test excerpt",
      content: "Test content",
      author: "Test Author",
      readingTimeMinutes: 5,
    };

    const request = new Request("http://localhost:3000/api/admin/blog/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(invalidData),
    }) as any;

    // Mock cookies property
    Object.defineProperty(request, "cookies", {
      value: {
        get: () => ({ value: "valid-session-token" }),
      },
      writable: true,
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Validation failed");
  });

  it("should return 400 when readingTimeMinutes is invalid", async () => {
    const invalidData = {
      title: "Test Post",
      slug: "test-post",
      excerpt: "Test excerpt",
      content: "Test content",
      author: "Test Author",
      readingTimeMinutes: 0, // Invalid: must be at least 1
    };

    const request = new Request("http://localhost:3000/api/admin/blog/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(invalidData),
    }) as any;

    // Mock cookies property
    Object.defineProperty(request, "cookies", {
      value: {
        get: () => ({ value: "valid-session-token" }),
      },
      writable: true,
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Validation failed");
  });

  it("should return 409 when slug is already in use", async () => {
    vi.mocked(fetchMutation).mockRejectedValue(
      new Error('Slug "test-slug" is already in use'),
    );

    const validData = {
      title: "Test Post",
      slug: "test-slug",
      excerpt: "Test excerpt",
      content: "Test content",
      author: "Test Author",
      readingTimeMinutes: 5,
    };

    const request = new Request("http://localhost:3000/api/admin/blog/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validData),
    }) as any;

    // Mock cookies property
    Object.defineProperty(request, "cookies", {
      value: {
        get: () => ({ value: "valid-session-token" }),
      },
      writable: true,
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.error).toBe("Slug already in use");
  });

  it("should return 500 when Convex mutation fails", async () => {
    vi.mocked(fetchMutation).mockRejectedValue(
      new Error("Database connection failed"),
    );

    const validData = {
      title: "Test Post",
      slug: "test-slug",
      excerpt: "Test excerpt",
      content: "Test content",
      author: "Test Author",
      readingTimeMinutes: 5,
    };

    const request = new Request("http://localhost:3000/api/admin/blog/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validData),
    }) as any;

    // Mock cookies property
    Object.defineProperty(request, "cookies", {
      value: {
        get: () => ({ value: "valid-session-token" }),
      },
      writable: true,
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("An error occurred while creating the post");
  });

  it("should accept optional fields", async () => {
    const dataWithOptionals = {
      title: "Test Post",
      slug: "test-slug",
      excerpt: "Test excerpt",
      content: "Test content",
      author: "Test Author",
      readingTimeMinutes: 5,
      coverImageUrl: "https://example.com/image.jpg",
      categoryId: "category-123",
      tags: ["javascript", "typescript"],
      featured: true,
      seoMetadata: {
        metaTitle: "SEO Title",
        metaDescription: "SEO Description",
        ogImage: "https://example.com/og-image.jpg",
        keywords: ["test", "blog"],
      },
    };

    const request = new Request("http://localhost:3000/api/admin/blog/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataWithOptionals),
    }) as any;

    // Mock cookies property
    Object.defineProperty(request, "cookies", {
      value: {
        get: () => ({ value: "valid-session-token" }),
      },
      writable: true,
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
  });

  it("should validate coverImageUrl is a valid URL", async () => {
    const invalidData = {
      title: "Test Post",
      slug: "test-slug",
      excerpt: "Test excerpt",
      content: "Test content",
      author: "Test Author",
      readingTimeMinutes: 5,
      coverImageUrl: "not-a-valid-url",
    };

    const request = new Request("http://localhost:3000/api/admin/blog/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(invalidData),
    }) as any;

    // Mock cookies property
    Object.defineProperty(request, "cookies", {
      value: {
        get: () => ({ value: "valid-session-token" }),
      },
      writable: true,
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Validation failed");
  });

  it("should validate SEO metadata fields have correct length", async () => {
    const invalidData = {
      title: "Test Post",
      slug: "test-slug",
      excerpt: "Test excerpt",
      content: "Test content",
      author: "Test Author",
      readingTimeMinutes: 5,
      seoMetadata: {
        metaTitle: "x".repeat(100), // Too long (max 60)
      },
    };

    const request = new Request("http://localhost:3000/api/admin/blog/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(invalidData),
    }) as any;

    // Mock cookies property
    Object.defineProperty(request, "cookies", {
      value: {
        get: () => ({ value: "valid-session-token" }),
      },
      writable: true,
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Validation failed");
  });

  it("should use default values for tags and featured when not provided", async () => {
    const minimalData = {
      title: "Test Post",
      slug: "test-slug",
      excerpt: "Test excerpt",
      content: "Test content",
      author: "Test Author",
      readingTimeMinutes: 5,
    };

    const request = new Request("http://localhost:3000/api/admin/blog/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(minimalData),
    }) as any;

    // Mock cookies property
    Object.defineProperty(request, "cookies", {
      value: {
        get: () => ({ value: "valid-session-token" }),
      },
      writable: true,
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
  });
});
