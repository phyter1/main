/**
 * Admin Blog Create API Route Tests
 * Tests POST /api/admin/blog/create endpoint
 */

import { beforeEach, describe, expect, it, mock } from "bun:test";

// Mock session verification
const mockVerifySessionToken = mock(() => true);
mock.module("@/lib/auth", () => ({
  verifySessionToken: mockVerifySessionToken,
}));

// Mock Convex mutation
const mockFetchMutation = mock(() => "test-post-id-123");
mock.module("convex/nextjs", () => ({
  fetchMutation: mockFetchMutation,
}));

// Mock Convex API
mock.module("../../../../../../convex/_generated/api", () => ({
  api: {
    blog: {
      createPost: "createPost",
    },
  },
}));

describe("POST /api/admin/blog/create", () => {
  beforeEach(() => {
    mockVerifySessionToken.mockReset();
    mockVerifySessionToken.mockReturnValue(true);
    mockFetchMutation.mockReset();
    mockFetchMutation.mockReturnValue("test-post-id-123");
  });

  it("should create a draft post with valid data and authentication", async () => {
    mockVerifySessionToken.mockReturnValue(true);
    mockFetchMutation.mockReturnValue("test-post-id-123");

    const { POST } = await import("./route");

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
      headers: {
        "Content-Type": "application/json",
        cookie: "session=valid-session-token",
      },
      body: JSON.stringify(validPostData),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.postId).toBe("test-post-id-123");
    expect(data.message).toBe("Draft post created successfully");
    expect(mockFetchMutation).toHaveBeenCalledTimes(1);
  });

  it("should return 401 when session is invalid", async () => {
    mockVerifySessionToken.mockReturnValue(false);

    const request = new Request("http://localhost:3000/api/admin/blog/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: "session=invalid-token",
      },
      body: JSON.stringify({ title: "Test" }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("should return 401 when session cookie is missing", async () => {
    const request = new Request("http://localhost:3000/api/admin/blog/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title: "Test" }),
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
        Cookie: "session=valid-session-token",
      },
      body: "invalid json {",
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
      headers: {
        "Content-Type": "application/json",
        Cookie: "session=valid-session-token",
      },
      body: JSON.stringify(invalidData),
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
      headers: {
        "Content-Type": "application/json",
        Cookie: "session=valid-session-token",
      },
      body: JSON.stringify(invalidData),
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
      headers: {
        "Content-Type": "application/json",
        Cookie: "session=valid-session-token",
      },
      body: JSON.stringify(invalidData),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Validation failed");
  });

  it("should return 409 when slug is already in use", async () => {
    mockFetchMutation.mockImplementation(() => {
      throw new Error('Slug "test-slug" is already in use');
    });

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
      headers: {
        "Content-Type": "application/json",
        Cookie: "session=valid-session-token",
      },
      body: JSON.stringify(validData),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.error).toBe("Slug already in use");
  });

  it("should return 500 when Convex mutation fails", async () => {
    mockFetchMutation.mockImplementation(() => {
      throw new Error("Database connection failed");
    });

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
      headers: {
        "Content-Type": "application/json",
        Cookie: "session=valid-session-token",
      },
      body: JSON.stringify(validData),
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
      headers: {
        "Content-Type": "application/json",
        Cookie: "session=valid-session-token",
      },
      body: JSON.stringify(dataWithOptionals),
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
      headers: {
        "Content-Type": "application/json",
        Cookie: "session=valid-session-token",
      },
      body: JSON.stringify(invalidData),
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
      headers: {
        "Content-Type": "application/json",
        Cookie: "session=valid-session-token",
      },
      body: JSON.stringify(invalidData),
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
      headers: {
        "Content-Type": "application/json",
        Cookie: "session=valid-session-token",
      },
      body: JSON.stringify(minimalData),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
  });
});
