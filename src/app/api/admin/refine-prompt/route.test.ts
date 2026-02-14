/**
 * Test Suite for Prompt Refinement API Route
 * Tests AI-powered prompt refinement with versioning integration
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock AI SDK before imports
const mockGenerateObject = vi.fn(() => ({
  object: {
    proposedPrompt: "Mock refined prompt text",
    diffSummary: "Added clarity to instructions",
    tokenCountOriginal: 100,
    tokenCountProposed: 120,
    changes: ["Improved clarity", "Added examples"],
  },
}));

vi.mock("ai", () => ({
  generateObject: mockGenerateObject,
}));

// Mock AI config
vi.mock("@/lib/ai-config", () => ({
  createOpenAIClient: vi.fn(() => "mock-openai-client"),
  AI_RATE_LIMITS: {
    MAX_REQUESTS_PER_MINUTE: 5,
  },
}));

// Mock prompt versioning
const mockGetActiveVersion = vi.fn(() =>
  Promise.resolve({
    id: "test-version-id",
    agentType: "chat",
    prompt: "Current active prompt text",
    description: "Current version",
    author: "admin",
    tokenCount: 100,
    createdAt: "2026-01-01T00:00:00.000Z",
    isActive: true,
  }),
);

vi.mock("@/lib/prompt-versioning", () => ({
  getActiveVersion: mockGetActiveVersion,
}));

// Import route handler after mocks
const { POST } = await import("./route");

// Import route handler after mocks to access rate limit map
let rateLimitMap: Map<string, { count: number; resetAt: number }>;

describe("POST /api/admin/refine-prompt", () => {
  beforeEach(() => {
    // Clear rate limit map between tests
    if (rateLimitMap) {
      rateLimitMap.clear();
    }
  });

  afterEach(() => {
    // Clear rate limit map after tests
    if (rateLimitMap) {
      rateLimitMap.clear();
    }
  });

  describe("Valid requests", () => {
    it("should return refined prompt with all required fields", async () => {
      const request = new Request(
        "http://localhost:3000/api/admin/refine-prompt",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            agentType: "chat",
            currentPrompt: "Original prompt text",
            refinementRequest: "Make it more concise",
          }),
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty("proposedPrompt");
      expect(data).toHaveProperty("diffSummary");
      expect(data).toHaveProperty("tokenCountOriginal");
      expect(data).toHaveProperty("tokenCountProposed");
      expect(data).toHaveProperty("changes");
      expect(Array.isArray(data.changes)).toBe(true);
    });

    it("should use active version when currentPrompt not provided", async () => {
      const request = new Request(
        "http://localhost:3000/api/admin/refine-prompt",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            agentType: "chat",
            refinementRequest: "Improve clarity",
          }),
        },
      );

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(mockGetActiveVersion).toHaveBeenCalledWith("chat");
    });

    it("should handle fit-assessment agent type", async () => {
      const request = new Request(
        "http://localhost:3000/api/admin/refine-prompt",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            agentType: "fit-assessment",
            currentPrompt: "Assessment prompt",
            refinementRequest: "Add more detail",
          }),
        },
      );

      const response = await POST(request);

      expect(response.status).toBe(200);
    });

    it("should handle empty currentPrompt by loading active version", async () => {
      const request = new Request(
        "http://localhost:3000/api/admin/refine-prompt",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            agentType: "chat",
            currentPrompt: "",
            refinementRequest: "Improve structure",
          }),
        },
      );

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(mockGetActiveVersion).toHaveBeenCalled();
    });
  });

  describe("Input validation", () => {
    it("should reject missing agentType", async () => {
      const request = new Request(
        "http://localhost:3000/api/admin/refine-prompt",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            currentPrompt: "Prompt text",
            refinementRequest: "Make better",
          }),
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toHaveProperty("error");
    });

    it("should reject invalid agentType", async () => {
      const request = new Request(
        "http://localhost:3000/api/admin/refine-prompt",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            agentType: "invalid-type",
            currentPrompt: "Prompt text",
            refinementRequest: "Make better",
          }),
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("chat");
    });

    it("should reject missing refinementRequest", async () => {
      const request = new Request(
        "http://localhost:3000/api/admin/refine-prompt",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            agentType: "chat",
            currentPrompt: "Prompt text",
          }),
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toHaveProperty("error");
    });

    it("should reject refinementRequest exceeding 1000 characters", async () => {
      const longRequest = "a".repeat(1001);
      const request = new Request(
        "http://localhost:3000/api/admin/refine-prompt",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            agentType: "chat",
            currentPrompt: "Prompt text",
            refinementRequest: longRequest,
          }),
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("1000");
    });

    it("should reject empty refinementRequest", async () => {
      const request = new Request(
        "http://localhost:3000/api/admin/refine-prompt",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            agentType: "chat",
            currentPrompt: "Prompt text",
            refinementRequest: "",
          }),
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toHaveProperty("error");
    });

    it("should reject invalid JSON", async () => {
      const request = new Request(
        "http://localhost:3000/api/admin/refine-prompt",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: "invalid json{",
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("JSON");
    });
  });

  describe("Rate limiting", () => {
    it("should enforce 5 requests per minute per IP", async () => {
      const makeRequest = () =>
        POST(
          new Request("http://localhost:3000/api/admin/refine-prompt", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-forwarded-for": "192.168.1.100",
            },
            body: JSON.stringify({
              agentType: "chat",
              currentPrompt: "Test prompt",
              refinementRequest: "Test refinement",
            }),
          }),
        );

      // Make 5 requests (should all succeed)
      for (let i = 0; i < 5; i++) {
        const response = await makeRequest();
        expect(response.status).toBe(200);
      }

      // 6th request should be rate limited
      const response = await makeRequest();
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.error).toContain("Rate limit");
      expect(response.headers.get("Retry-After")).toBeTruthy();
    });

    it("should track different IPs independently", async () => {
      const makeRequest = (ip: string) =>
        POST(
          new Request("http://localhost:3000/api/admin/refine-prompt", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-forwarded-for": ip,
            },
            body: JSON.stringify({
              agentType: "chat",
              currentPrompt: "Test prompt",
              refinementRequest: "Test refinement",
            }),
          }),
        );

      // Both IPs should be able to make requests independently
      const response1 = await makeRequest("192.168.1.1");
      const response2 = await makeRequest("192.168.1.2");

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
    });
  });

  describe("Error handling", () => {
    it("should handle AI API failures gracefully", async () => {
      // Reset mock to default before changing
      mockGenerateObject.mockRestore();

      // Mock AI API failure
      mockGenerateObject.mockImplementation(() => {
        throw new Error("AI API error");
      });

      const request = new Request(
        "http://localhost:3000/api/admin/refine-prompt",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            agentType: "chat",
            currentPrompt: "Prompt text",
            refinementRequest: "Make better",
          }),
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toHaveProperty("error");
      expect(data.error).toContain("refinement");
    });

    it("should handle missing active version", async () => {
      // Reset mock to default before changing
      mockGetActiveVersion.mockRestore();

      // Mock no active version found
      mockGetActiveVersion.mockImplementation(() => Promise.resolve(null));

      const request = new Request(
        "http://localhost:3000/api/admin/refine-prompt",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-forwarded-for": "192.168.1.200", // Use unique IP to avoid rate limit
          },
          body: JSON.stringify({
            agentType: "chat",
            refinementRequest: "Improve",
          }),
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("active prompt");
    });
  });

  describe("AI prompt engineering", () => {
    it("should include currentPrompt and refinementRequest in AI call", async () => {
      // Reset mock to ensure clean state
      mockGenerateObject.mockRestore();
      mockGenerateObject.mockImplementation(() => ({
        object: {
          proposedPrompt: "Refined prompt",
          diffSummary: "Changes made",
          tokenCountOriginal: 50,
          tokenCountProposed: 60,
          changes: ["Change 1"],
        },
      }));

      const request = new Request(
        "http://localhost:3000/api/admin/refine-prompt",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-forwarded-for": "192.168.1.250", // Use unique IP
          },
          body: JSON.stringify({
            agentType: "chat",
            currentPrompt: "Original prompt",
            refinementRequest: "Make it better",
          }),
        },
      );

      await POST(request);

      expect(mockGenerateObject).toHaveBeenCalled();
      const callArgs =
        mockGenerateObject.mock.calls[
          mockGenerateObject.mock.calls.length - 1
        ][0];

      // Verify prompt contains current and refinement request
      expect(callArgs.prompt).toContain("Original prompt");
      expect(callArgs.prompt).toContain("Make it better");
    });
  });
});
