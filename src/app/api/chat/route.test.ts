/**
 * Test Suite for Chat API Route
 * Validates POST endpoint with streaming, resume context, and rate limiting
 */

import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import type { Message } from "ai";

// Mock the AI SDK
const mockStreamTextResult = {
  toTextStreamResponse: mock(() => {
    return new Response("mock stream response", {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }),
};

const mockStreamText = mock(() => mockStreamTextResult);

// Mock the AI SDK - include generateObject for compatibility with other tests
mock.module("ai", () => ({
  streamText: mockStreamText,
  generateObject: mock(() => Promise.resolve({ object: {} })),
}));

// Mock the AI config
mock.module("@/lib/ai-config", () => ({
  createOpenAIClient: mock(() => "mock-openai-client"),
  AI_RATE_LIMITS: {
    MAX_REQUESTS_PER_MINUTE: 10,
    MAX_TOKENS_PER_REQUEST: 4096,
  },
}));

// Mock the resume data
const mockResume = {
  personalInfo: {
    name: "Test User",
    title: "Test Title",
    location: "Test Location",
    summary: "Test summary",
  },
  experience: [],
  skills: {
    languages: [],
    frameworks: [],
    databases: [],
    devTools: [],
    infrastructure: [],
  },
  projects: [],
  principles: [],
};

const mockFormatResumeAsLLMContext = mock(() => "# Test User\n\nTest context");

mock.module("@/data/resume", () => ({
  resume: mockResume,
  formatResumeAsLLMContext: mockFormatResumeAsLLMContext,
}));

// Mock the prompt-versioning module
const mockGetActiveVersion = mock(() => Promise.resolve(null));

mock.module("@/lib/prompt-versioning", () => ({
  getActiveVersion: mockGetActiveVersion,
}));

describe("T005: Chat API Route with Streaming", () => {
  let POST: (request: Request) => Promise<Response>;

  beforeEach(async () => {
    // Clear all mocks before each test
    mockStreamText.mockClear();
    mockStreamText.mockRestore();
    mockStreamTextResult.toTextStreamResponse.mockClear();
    mockStreamTextResult.toTextStreamResponse.mockRestore();
    mockFormatResumeAsLLMContext.mockClear();
    mockFormatResumeAsLLMContext.mockRestore();
    mockGetActiveVersion.mockClear();
    mockGetActiveVersion.mockRestore();

    // Reset mock implementations to default
    mockStreamText.mockImplementation(() => mockStreamTextResult);
    mockStreamTextResult.toTextStreamResponse.mockImplementation(() => {
      return new Response("mock stream response", {
        status: 200,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    });
    mockFormatResumeAsLLMContext.mockImplementation(
      () => "# Test User\n\nTest context",
    );

    // Reset getActiveVersion to return null by default
    mockGetActiveVersion.mockImplementation(() => Promise.resolve(null));

    // Dynamic import to get fresh module with mocks
    const module = await import("./route");
    POST = module.POST;
  });

  afterEach(() => {
    // Clean up mocks after each test
    mockStreamText.mockClear();
    mockStreamTextResult.toTextStreamResponse.mockClear();
    mockFormatResumeAsLLMContext.mockClear();
    mockGetActiveVersion.mockClear();
  });

  describe("Request Handling", () => {
    it("should accept POST requests with messages array", async () => {
      const messages: Message[] = [{ id: "1", role: "user", content: "Hello" }];

      const request = new Request("http://localhost:3000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });

      const response = await POST(request);

      expect(response).toBeDefined();
      expect(response.status).toBe(200);
    });

    it("should reject requests without messages", async () => {
      const request = new Request("http://localhost:3000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it("should reject requests with invalid messages format", async () => {
      const request = new Request("http://localhost:3000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: "not an array" }),
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it("should reject requests with empty messages array", async () => {
      const request = new Request("http://localhost:3000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [] }),
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it("should reject malformed JSON", async () => {
      const request = new Request("http://localhost:3000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "invalid json",
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
    });
  });

  describe("Resume Context Integration", () => {
    it("should include resume context in system prompt", async () => {
      const messages: Message[] = [
        { id: "1", role: "user", content: "Tell me about your experience" },
      ];

      const request = new Request("http://localhost:3000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });

      await POST(request);

      // Verify formatResumeAsLLMContext was called
      expect(mockFormatResumeAsLLMContext).toHaveBeenCalled();
      expect(mockFormatResumeAsLLMContext).toHaveBeenCalledWith(mockResume);
    });

    it("should call streamText with resume context in system message", async () => {
      const messages: Message[] = [{ id: "1", role: "user", content: "Hello" }];

      const request = new Request("http://localhost:3000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });

      await POST(request);

      // Verify streamText was called with correct parameters
      expect(mockStreamText).toHaveBeenCalled();

      const callArgs = mockStreamText.mock.calls[0][0];
      expect(callArgs).toBeDefined();
      expect(callArgs.model).toBe("mock-openai-client");
      expect(callArgs.messages).toEqual(messages);
      expect(callArgs.system).toContain("Test User");
    });
  });

  describe("Streaming Response", () => {
    it("should return streaming response from AI SDK", async () => {
      const messages: Message[] = [{ id: "1", role: "user", content: "Hello" }];

      const request = new Request("http://localhost:3000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });

      const response = await POST(request);

      // Verify toTextStreamResponse was called
      expect(mockStreamTextResult.toTextStreamResponse).toHaveBeenCalled();

      // Verify response is the stream from AI SDK
      expect(response).toBeDefined();
      expect(response.status).toBe(200);
    });

    it("should include proper content-type header for streaming", async () => {
      const messages: Message[] = [{ id: "1", role: "user", content: "Hello" }];

      const request = new Request("http://localhost:3000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });

      const response = await POST(request);

      const contentType = response.headers.get("content-type");
      expect(contentType).toBeDefined();
    });
  });

  describe("Rate Limiting", () => {
    it("should track requests per IP address", async () => {
      const messages: Message[] = [{ id: "1", role: "user", content: "Hello" }];

      const request = new Request("http://localhost:3000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": "192.168.1.1",
        },
        body: JSON.stringify({ messages }),
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
    });

    it("should enforce rate limit of 10 requests per minute", async () => {
      const messages: Message[] = [{ id: "1", role: "user", content: "Hello" }];

      const ip = "192.168.1.2";

      // Make 10 requests (should all succeed)
      for (let i = 0; i < 10; i++) {
        const request = new Request("http://localhost:3000/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-forwarded-for": ip,
          },
          body: JSON.stringify({ messages }),
        });

        const response = await POST(request);
        expect(response.status).toBe(200);
      }

      // 11th request should be rate limited
      const rateLimitedRequest = new Request("http://localhost:3000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": ip,
        },
        body: JSON.stringify({ messages }),
      });

      const rateLimitedResponse = await POST(rateLimitedRequest);
      expect(rateLimitedResponse.status).toBe(429);
    });

    it("should include retry-after header when rate limited", async () => {
      const messages: Message[] = [{ id: "1", role: "user", content: "Hello" }];

      const ip = "192.168.1.3";

      // Exceed rate limit
      for (let i = 0; i < 11; i++) {
        const request = new Request("http://localhost:3000/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-forwarded-for": ip,
          },
          body: JSON.stringify({ messages }),
        });

        const response = await POST(request);

        if (response.status === 429) {
          const retryAfter = response.headers.get("retry-after");
          expect(retryAfter).toBeDefined();
          expect(Number.parseInt(retryAfter || "0", 10)).toBeGreaterThan(0);
        }
      }
    });

    it("should track different IPs independently", async () => {
      const messages: Message[] = [{ id: "1", role: "user", content: "Hello" }];

      const ip1 = "192.168.1.4";
      const ip2 = "192.168.1.5";

      // Make requests from IP1
      for (let i = 0; i < 10; i++) {
        const request = new Request("http://localhost:3000/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-forwarded-for": ip1,
          },
          body: JSON.stringify({ messages }),
        });

        await POST(request);
      }

      // IP2 should still be able to make requests
      const ip2Request = new Request("http://localhost:3000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": ip2,
        },
        body: JSON.stringify({ messages }),
      });

      const response = await POST(ip2Request);
      expect(response.status).toBe(200);
    });
  });

  describe("Error Handling", () => {
    it("should handle AI SDK errors gracefully", async () => {
      // Mock streamText to throw error
      mockStreamText.mockImplementationOnce(() => {
        throw new Error("AI SDK error");
      });

      const messages: Message[] = [{ id: "1", role: "user", content: "Hello" }];

      const request = new Request("http://localhost:3000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });

      const response = await POST(request);

      expect(response.status).toBe(500);
    });

    it("should return proper error message format", async () => {
      const request = new Request("http://localhost:3000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const response = await POST(request);

      const body = await response.json();
      expect(body).toHaveProperty("error");
      expect(typeof body.error).toBe("string");
    });
  });

  describe("Prompt Loading (T011)", () => {
    it("should load active prompt version when available", async () => {
      // Mock getActiveVersion to return an active version
      const mockPromptVersion = {
        id: "test-version-id",
        agentType: "chat" as const,
        prompt: "Custom system prompt for testing",
        description: "Test version",
        author: "test-author",
        tokenCount: 100,
        createdAt: new Date().toISOString(),
        isActive: true,
      };

      mockGetActiveVersion.mockImplementationOnce(() =>
        Promise.resolve(mockPromptVersion),
      );

      const messages: Message[] = [{ id: "1", role: "user", content: "Hello" }];

      const request = new Request("http://localhost:3000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });

      await POST(request);

      // Verify getActiveVersion was called with 'chat'
      expect(mockGetActiveVersion).toHaveBeenCalledWith("chat");

      // Verify streamText was called with custom prompt
      expect(mockStreamText).toHaveBeenCalled();
      const callArgs = mockStreamText.mock.calls[0][0];
      expect(callArgs.system).toContain("Custom system prompt for testing");
    });

    it("should fall back to default prompt when no active version", async () => {
      // Mock getActiveVersion to return null (no active version)
      mockGetActiveVersion.mockImplementationOnce(() => Promise.resolve(null));

      const messages: Message[] = [{ id: "1", role: "user", content: "Hello" }];

      const request = new Request("http://localhost:3000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });

      await POST(request);

      // Verify getActiveVersion was called
      expect(mockGetActiveVersion).toHaveBeenCalledWith("chat");

      // Verify streamText was called with default prompt
      expect(mockStreamText).toHaveBeenCalled();
      const callArgs = mockStreamText.mock.calls[0][0];
      // Default prompt should contain key phrases from the embedded prompt
      expect(callArgs.system).toContain("You are Ryan Lowe");
      expect(callArgs.system).toContain("KEY FACTS");
    });

    it("should fall back to default prompt when version loading fails", async () => {
      // Mock getActiveVersion to throw an error
      mockGetActiveVersion.mockImplementationOnce(() =>
        Promise.reject(new Error("Failed to load version")),
      );

      const messages: Message[] = [{ id: "1", role: "user", content: "Hello" }];

      const request = new Request("http://localhost:3000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });

      await POST(request);

      // Verify getActiveVersion was called
      expect(mockGetActiveVersion).toHaveBeenCalledWith("chat");

      // Verify streamText was called with default prompt (error handled gracefully)
      expect(mockStreamText).toHaveBeenCalled();
      const callArgs = mockStreamText.mock.calls[0][0];
      expect(callArgs.system).toContain("You are Ryan Lowe");
      expect(callArgs.system).toContain("KEY FACTS");
    });
  });

  describe("Acceptance Criteria Validation", () => {
    it("AC1: Route exists at src/app/api/chat/route.ts", () => {
      // If this test runs, the file exists and exports POST
      expect(POST).toBeDefined();
      expect(typeof POST).toBe("function");
    });

    it("AC2: POST endpoint accepts {messages: Message[]}", async () => {
      const messages: Message[] = [{ id: "1", role: "user", content: "Hello" }];

      const request = new Request("http://localhost:3000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
    });

    it("AC3: Streams LLM responses using AI SDK", async () => {
      const messages: Message[] = [{ id: "1", role: "user", content: "Hello" }];

      const request = new Request("http://localhost:3000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });

      await POST(request);

      // Verify streamText was called
      expect(mockStreamText).toHaveBeenCalled();
      // Verify toTextStreamResponse was called
      expect(mockStreamTextResult.toTextStreamResponse).toHaveBeenCalled();
    });

    it("AC4: System prompt includes resume data", async () => {
      const messages: Message[] = [{ id: "1", role: "user", content: "Hello" }];

      const request = new Request("http://localhost:3000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });

      await POST(request);

      // Verify resume context was included
      expect(mockFormatResumeAsLLMContext).toHaveBeenCalled();

      const callArgs = mockStreamText.mock.calls[0][0];
      expect(callArgs.system).toContain("Test User");
    });

    it("AC5: Error handling for API failures", async () => {
      mockStreamText.mockImplementationOnce(() => {
        throw new Error("API failure");
      });

      const messages: Message[] = [{ id: "1", role: "user", content: "Hello" }];

      const request = new Request("http://localhost:3000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });

      const response = await POST(request);

      // Should handle error gracefully
      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it("AC6: Rate limiting implemented (10 req/min per IP)", async () => {
      const messages: Message[] = [{ id: "1", role: "user", content: "Hello" }];

      const ip = "192.168.1.100";

      // Make 11 requests
      let rateLimitedFound = false;

      for (let i = 0; i < 11; i++) {
        const request = new Request("http://localhost:3000/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-forwarded-for": ip,
          },
          body: JSON.stringify({ messages }),
        });

        const response = await POST(request);

        if (response.status === 429) {
          rateLimitedFound = true;
          break;
        }
      }

      expect(rateLimitedFound).toBe(true);
    });
  });
});
