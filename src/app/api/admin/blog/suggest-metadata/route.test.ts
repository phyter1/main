/**
 * T007: API Route Tests for Metadata Suggestions
 * Tests POST /api/admin/blog/suggest-metadata endpoint
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock AI SDK
const mockGenerateObject = vi.fn();
vi.mock("ai", () => ({
  generateObject: mockGenerateObject,
}));

// Mock AI config
vi.mock("@/lib/ai-config", () => ({
  createOpenAIClient: vi.fn(() => "mock-openai-client"),
  AI_RATE_LIMITS: {
    MAX_REQUESTS_PER_MINUTE: 10,
    MAX_TOKENS_PER_REQUEST: 4096,
  },
}));

// Mock Convex client
const mockConvexQuery = vi.fn();
const MockConvexHttpClient = vi.fn(function (this: {
  query: typeof mockConvexQuery;
}) {
  this.query = mockConvexQuery;
});
vi.mock("convex/browser", () => ({
  ConvexHttpClient: MockConvexHttpClient,
}));

// Mock environment variables
process.env.NEXT_PUBLIC_CONVEX_URL = "https://mock-convex-url.convex.cloud";

// Import route after mocks
const { POST, clearRateLimits } = await import("./route");

describe("T007: POST /api/admin/blog/suggest-metadata", () => {
  // Rate limiting state between tests
  beforeEach(() => {
    vi.clearAllMocks();
    clearRateLimits(); // Clear rate limit state between tests
    // Set default mock return values
    mockConvexQuery.mockResolvedValue([]);
  });

  describe("Request Validation", () => {
    it("should reject request with missing body", async () => {
      const request = new Request(
        "http://localhost/api/admin/blog/suggest-metadata",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        },
      );

      const response = await POST(request);
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toContain("content");
    });

    it("should reject request with missing content", async () => {
      const request = new Request(
        "http://localhost/api/admin/blog/suggest-metadata",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: "Test" }),
        },
      );

      const response = await POST(request);
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toContain("content");
    });

    it("should reject request with missing title", async () => {
      const request = new Request(
        "http://localhost/api/admin/blog/suggest-metadata",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: "Test content" }),
        },
      );

      const response = await POST(request);
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toContain("title");
    });

    it("should reject request with content too short", async () => {
      const request = new Request(
        "http://localhost/api/admin/blog/suggest-metadata",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: "Hi", title: "Test" }),
        },
      );

      const response = await POST(request);
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toContain("content");
    });

    it("should reject request with content too long", async () => {
      const longContent = "a".repeat(50001);
      const request = new Request(
        "http://localhost/api/admin/blog/suggest-metadata",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: longContent, title: "Test" }),
        },
      );

      const response = await POST(request);
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toContain("content");
    });

    it("should accept valid request with all required fields", async () => {
      // Mock Convex queries
      mockConvexQuery.mockResolvedValue([]);

      // Mock AI response
      mockGenerateObject.mockResolvedValue({
        object: {
          excerpt: "Generated excerpt",
          tags: ["test", "ai"],
          category: "Technology",
          seoMetadata: {
            metaTitle: "SEO Title",
            metaDescription: "SEO Description",
            keywords: ["keyword1", "keyword2"],
          },
          analysis: {
            tone: "Professional",
            readability: "Easy",
          },
        },
      });

      const request = new Request(
        "http://localhost/api/admin/blog/suggest-metadata",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content:
              "This is a test blog post content that is sufficiently long.",
            title: "Test Blog Post",
          }),
        },
      );

      const response = await POST(request);
      expect(response.status).toBe(200);
    });

    it("should accept optional excerpt field", async () => {
      mockConvexQuery.mockResolvedValue([]);
      mockGenerateObject.mockResolvedValue({
        object: {
          excerpt: "Generated excerpt",
          tags: ["test"],
          category: "Technology",
          seoMetadata: {
            metaTitle: "SEO Title",
            metaDescription: "SEO Description",
            keywords: ["keyword"],
          },
          analysis: {
            tone: "Professional",
            readability: "Easy",
          },
        },
      });

      const request = new Request(
        "http://localhost/api/admin/blog/suggest-metadata",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: "This is a test blog post content.",
            title: "Test",
            excerpt: "Custom excerpt",
          }),
        },
      );

      const response = await POST(request);
      expect(response.status).toBe(200);
    });

    it("should accept optional postId field", async () => {
      mockConvexQuery.mockResolvedValue([]);
      mockGenerateObject.mockResolvedValue({
        object: {
          excerpt: "Generated excerpt",
          tags: ["test"],
          category: "Technology",
          seoMetadata: {
            metaTitle: "SEO Title",
            metaDescription: "SEO Description",
            keywords: ["keyword"],
          },
          analysis: {
            tone: "Professional",
            readability: "Easy",
          },
        },
      });

      const request = new Request(
        "http://localhost/api/admin/blog/suggest-metadata",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: "This is a test blog post content.",
            title: "Test",
            postId: "k17abc123",
          }),
        },
      );

      const response = await POST(request);
      expect(response.status).toBe(200);
    });
  });

  describe("AI Integration", () => {
    it("should query existing tags from Convex", async () => {
      const mockTags = [
        { name: "React", slug: "react" },
        { name: "TypeScript", slug: "typescript" },
      ];
      mockConvexQuery.mockResolvedValue(mockTags);

      mockGenerateObject.mockResolvedValue({
        object: {
          excerpt: "Generated excerpt",
          tags: ["react"],
          category: "Technology",
          seoMetadata: {
            metaTitle: "SEO Title",
            metaDescription: "SEO Description",
            keywords: ["keyword"],
          },
          analysis: {
            tone: "Professional",
            readability: "Easy",
          },
        },
      });

      const request = new Request(
        "http://localhost/api/admin/blog/suggest-metadata",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: "React TypeScript content here.",
            title: "Test",
          }),
        },
      );

      await POST(request);

      // Should query tags
      expect(mockConvexQuery).toHaveBeenCalled();
    });

    it("should query existing categories from Convex", async () => {
      const mockCategories = [
        { name: "Technology", slug: "technology" },
        { name: "Design", slug: "design" },
      ];
      mockConvexQuery.mockResolvedValue(mockCategories);

      mockGenerateObject.mockResolvedValue({
        object: {
          excerpt: "Generated excerpt",
          tags: ["test"],
          category: "Technology",
          seoMetadata: {
            metaTitle: "SEO Title",
            metaDescription: "SEO Description",
            keywords: ["keyword"],
          },
          analysis: {
            tone: "Professional",
            readability: "Easy",
          },
        },
      });

      const request = new Request(
        "http://localhost/api/admin/blog/suggest-metadata",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: "Technology article content.",
            title: "Test",
          }),
        },
      );

      await POST(request);

      expect(mockConvexQuery).toHaveBeenCalled();
    });

    it("should use generateObject with Zod schema", async () => {
      mockConvexQuery.mockResolvedValue([]);
      mockGenerateObject.mockResolvedValue({
        object: {
          excerpt: "Generated excerpt",
          tags: ["test"],
          category: "Technology",
          seoMetadata: {
            metaTitle: "SEO Title",
            metaDescription: "SEO Description",
            keywords: ["keyword"],
          },
          analysis: {
            tone: "Professional",
            readability: "Easy",
          },
        },
      });

      const request = new Request(
        "http://localhost/api/admin/blog/suggest-metadata",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: "Blog post content goes here.",
            title: "Test Title",
          }),
        },
      );

      await POST(request);

      expect(mockGenerateObject).toHaveBeenCalled();
      const callArgs = mockGenerateObject.mock.calls[0][0];
      expect(callArgs.schema).toBeDefined();
      expect(callArgs.prompt).toContain("Test Title");
      expect(callArgs.prompt).toContain("Blog post content");
    });

    it("should load active prompt version", async () => {
      mockConvexQuery.mockResolvedValue([]);
      mockGenerateObject.mockResolvedValue({
        object: {
          excerpt: "Generated excerpt",
          tags: ["test"],
          category: "Technology",
          seoMetadata: {
            metaTitle: "SEO Title",
            metaDescription: "SEO Description",
            keywords: ["keyword"],
          },
          analysis: {
            tone: "Professional",
            readability: "Easy",
          },
        },
      });

      const request = new Request(
        "http://localhost/api/admin/blog/suggest-metadata",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: "Content here.",
            title: "Title",
          }),
        },
      );

      await POST(request);

      // AI should be called to generate suggestions
      expect(mockGenerateObject).toHaveBeenCalled();
    });

    it("should return structured AI suggestions", async () => {
      mockConvexQuery.mockResolvedValue([]);

      const mockSuggestions = {
        excerpt: "AI-generated excerpt about testing",
        tags: ["testing", "vitest", "typescript"],
        category: "Development",
        seoMetadata: {
          metaTitle: "Testing Best Practices | Dev Blog",
          metaDescription: "Learn about comprehensive testing strategies",
          keywords: ["testing", "unit tests", "integration tests"],
        },
        analysis: {
          tone: "Technical and informative",
          readability: "Intermediate - suitable for developers",
        },
      };

      mockGenerateObject.mockResolvedValue({
        object: mockSuggestions,
      });

      const request = new Request(
        "http://localhost/api/admin/blog/suggest-metadata",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content:
              "This article covers testing best practices in modern TypeScript applications.",
            title: "Testing Best Practices",
          }),
        },
      );

      const response = await POST(request);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.excerpt).toBe(mockSuggestions.excerpt);
      expect(data.tags).toEqual(mockSuggestions.tags);
      expect(data.category).toBe(mockSuggestions.category);
      expect(data.seoMetadata).toEqual(mockSuggestions.seoMetadata);
      expect(data.analysis).toEqual(mockSuggestions.analysis);
    });
  });

  describe("Rate Limiting", () => {
    it("should enforce rate limit of 10 requests per minute", async () => {
      mockConvexQuery.mockResolvedValue([]);
      mockGenerateObject.mockResolvedValue({
        object: {
          excerpt: "Generated excerpt",
          tags: ["test"],
          category: "Technology",
          seoMetadata: {
            metaTitle: "SEO Title",
            metaDescription: "SEO Description",
            keywords: ["keyword"],
          },
          analysis: {
            tone: "Professional",
            readability: "Easy",
          },
        },
      });

      const makeRequest = () =>
        POST(
          new Request("http://localhost/api/admin/blog/suggest-metadata", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-forwarded-for": "192.168.1.1",
            },
            body: JSON.stringify({
              content: "Test content for rate limiting.",
              title: "Test",
            }),
          }),
        );

      // Make 10 requests (should all succeed)
      for (let i = 0; i < 10; i++) {
        const response = await makeRequest();
        expect(response.status).toBe(200);
      }

      // 11th request should be rate limited
      const rateLimitedResponse = await makeRequest();
      expect(rateLimitedResponse.status).toBe(429);

      const data = await rateLimitedResponse.json();
      expect(data.error).toContain("Rate limit");
    });

    it("should include Retry-After header when rate limited", async () => {
      mockConvexQuery.mockResolvedValue([]);
      mockGenerateObject.mockResolvedValue({
        object: {
          excerpt: "Generated excerpt",
          tags: ["test"],
          category: "Technology",
          seoMetadata: {
            metaTitle: "SEO Title",
            metaDescription: "SEO Description",
            keywords: ["keyword"],
          },
          analysis: {
            tone: "Professional",
            readability: "Easy",
          },
        },
      });

      const makeRequest = () =>
        POST(
          new Request("http://localhost/api/admin/blog/suggest-metadata", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-forwarded-for": "192.168.1.2",
            },
            body: JSON.stringify({
              content: "Test content.",
              title: "Test",
            }),
          }),
        );

      // Exceed rate limit
      for (let i = 0; i < 11; i++) {
        await makeRequest();
      }

      const response = await makeRequest();
      expect(response.headers.get("Retry-After")).toBeDefined();
      const retryAfter = Number(response.headers.get("Retry-After"));
      expect(retryAfter).toBeGreaterThan(0);
      expect(retryAfter).toBeLessThanOrEqual(60);
    });

    it("should track rate limits per IP address", async () => {
      mockConvexQuery.mockResolvedValue([]);
      mockGenerateObject.mockResolvedValue({
        object: {
          excerpt: "Generated excerpt",
          tags: ["test"],
          category: "Technology",
          seoMetadata: {
            metaTitle: "SEO Title",
            metaDescription: "SEO Description",
            keywords: ["keyword"],
          },
          analysis: {
            tone: "Professional",
            readability: "Easy",
          },
        },
      });

      // IP 1 makes 10 requests
      for (let i = 0; i < 10; i++) {
        const response = await POST(
          new Request("http://localhost/api/admin/blog/suggest-metadata", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-forwarded-for": "192.168.1.10",
            },
            body: JSON.stringify({
              content: "Content here for testing rate limiting.",
              title: "Title",
            }),
          }),
        );
        expect(response.status).toBe(200);
      }

      // IP 1 gets rate limited
      const ip1Response = await POST(
        new Request("http://localhost/api/admin/blog/suggest-metadata", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-forwarded-for": "192.168.1.10",
          },
          body: JSON.stringify({
            content: "Content here for testing rate limiting.",
            title: "Title",
          }),
        }),
      );
      expect(ip1Response.status).toBe(429);

      // IP 2 can still make requests
      const ip2Response = await POST(
        new Request("http://localhost/api/admin/blog/suggest-metadata", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-forwarded-for": "192.168.1.20",
          },
          body: JSON.stringify({
            content: "Content here for testing rate limiting.",
            title: "Title",
          }),
        }),
      );
      expect(ip2Response.status).toBe(200);
    });
  });

  describe("Error Handling", () => {
    it("should handle AI API errors gracefully", async () => {
      mockConvexQuery.mockResolvedValue([]);
      mockGenerateObject.mockRejectedValue(new Error("AI API error"));

      const request = new Request(
        "http://localhost/api/admin/blog/suggest-metadata",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: "Content here.",
            title: "Title",
          }),
        },
      );

      const response = await POST(request);
      expect(response.status).toBe(500);

      const data = await response.json();
      expect(data.error).toBeDefined();
      expect(data.error).not.toContain("API key"); // Should not expose API key info
    });

    it("should handle Convex query errors", async () => {
      mockConvexQuery.mockRejectedValue(new Error("Convex connection failed"));

      const request = new Request(
        "http://localhost/api/admin/blog/suggest-metadata",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: "Content here.",
            title: "Title",
          }),
        },
      );

      const response = await POST(request);
      expect(response.status).toBe(500);

      const data = await response.json();
      expect(data.error).toBeDefined();
    });

    it("should handle invalid JSON in request body", async () => {
      const request = new Request(
        "http://localhost/api/admin/blog/suggest-metadata",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: "invalid json{",
        },
      );

      const response = await POST(request);
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toContain("Invalid JSON");
    });
  });
});
