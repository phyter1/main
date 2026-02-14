/**
 * Test Suite for Test Prompt API Route
 * Validates POST endpoint for running test suites against AI prompts
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { TestCase, TestResult } from "@/lib/test-runner";

// Mock runTestSuite from test-runner
const mockRunTestSuite = vi.fn(() =>
  Promise.resolve([
    {
      testCaseId: "test-1",
      passed: true,
      response: "Mock response 1",
      tokenCount: 150,
      latencyMs: 500,
    },
    {
      testCaseId: "test-2",
      passed: false,
      response: "Mock response 2",
      tokenCount: 200,
      latencyMs: 600,
      failedCriteria: [
        {
          type: "contains",
          value: "expected text",
          reason: "Response does not contain expected text",
        },
      ],
    },
  ] as TestResult[]),
);

vi.mock("@/lib/test-runner", () => ({
  runTestSuite: mockRunTestSuite,
}));

// Mock AI config for rate limiting
vi.mock("@/lib/ai-config", () => ({
  createOpenAIClient: vi.fn(() => "mock-openai-client"),
  AI_RATE_LIMITS: {
    MAX_REQUESTS_PER_MINUTE: 5,
    MAX_TOKENS_PER_REQUEST: 4096,
  },
}));

describe("T006: Test Prompt API Route", () => {
  let POST: (request: Request) => Promise<Response>;

  beforeEach(async () => {
    // Clear all mocks before each test
    mockRunTestSuite.mockClear();

    // Reset mock implementation to default
    mockRunTestSuite.mockImplementation(() =>
      Promise.resolve([
        {
          testCaseId: "test-1",
          passed: true,
          response: "Mock response 1",
          tokenCount: 150,
          latencyMs: 500,
        },
        {
          testCaseId: "test-2",
          passed: false,
          response: "Mock response 2",
          tokenCount: 200,
          latencyMs: 600,
          failedCriteria: [
            {
              type: "contains",
              value: "expected text",
              reason: "Response does not contain expected text",
            },
          ],
        },
      ] as TestResult[]),
    );

    // Dynamic import to get fresh module with mocks
    const module = await import("./route");
    POST = module.POST;
  });

  afterEach(() => {
    // Clean up mocks after each test
    mockRunTestSuite.mockClear();
  });

  describe("Request Handling", () => {
    it("should accept POST requests with valid test prompt data", async () => {
      const testCases: TestCase[] = [
        {
          id: "test-1",
          question: "What is your experience?",
          expectedCriteria: [{ type: "contains", value: "experience" }],
        },
      ];

      const request = new Request(
        "http://localhost:3000/api/admin/test-prompt",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-forwarded-for": "10.0.0.1",
          },
          body: JSON.stringify({
            promptText: "You are a test assistant.",
            agentType: "chat",
            testCases,
          }),
        },
      );

      const response = await POST(request);

      expect(response).toBeDefined();
      expect(response.status).toBe(200);
    });

    it("should reject requests with missing promptText", async () => {
      const testCases: TestCase[] = [
        {
          id: "test-1",
          question: "Test question",
          expectedCriteria: [{ type: "contains", value: "test" }],
        },
      ];

      const request = new Request(
        "http://localhost:3000/api/admin/test-prompt",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-forwarded-for": "10.0.0.2",
          },
          body: JSON.stringify({
            agentType: "chat",
            testCases,
          }),
        },
      );

      const response = await POST(request);

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toContain("promptText");
    });

    it("should reject requests with missing agentType", async () => {
      const testCases: TestCase[] = [
        {
          id: "test-1",
          question: "Test question",
          expectedCriteria: [{ type: "contains", value: "test" }],
        },
      ];

      const request = new Request(
        "http://localhost:3000/api/admin/test-prompt",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-forwarded-for": "10.0.0.3",
          },
          body: JSON.stringify({
            promptText: "Test prompt",
            testCases,
          }),
        },
      );

      const response = await POST(request);

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toContain("agentType");
    });

    it("should reject requests with missing testCases", async () => {
      const request = new Request(
        "http://localhost:3000/api/admin/test-prompt",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-forwarded-for": "10.0.0.4",
          },
          body: JSON.stringify({
            promptText: "Test prompt",
            agentType: "chat",
          }),
        },
      );

      const response = await POST(request);

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toContain("testCases");
    });

    it("should reject requests with invalid agentType", async () => {
      const testCases: TestCase[] = [
        {
          id: "test-1",
          question: "Test question",
          expectedCriteria: [{ type: "contains", value: "test" }],
        },
      ];

      const request = new Request(
        "http://localhost:3000/api/admin/test-prompt",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-forwarded-for": "10.0.0.5",
          },
          body: JSON.stringify({
            promptText: "Test prompt",
            agentType: "invalid",
            testCases,
          }),
        },
      );

      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it("should reject requests with more than 20 test cases", async () => {
      const testCases: TestCase[] = Array.from({ length: 21 }, (_, i) => ({
        id: `test-${i}`,
        question: "Test question",
        expectedCriteria: [{ type: "contains", value: "test" }],
      }));

      const request = new Request(
        "http://localhost:3000/api/admin/test-prompt",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-forwarded-for": "10.0.0.6",
          },
          body: JSON.stringify({
            promptText: "Test prompt",
            agentType: "chat",
            testCases,
          }),
        },
      );

      const response = await POST(request);

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toContain("20");
    });

    it("should reject malformed JSON", async () => {
      const request = new Request(
        "http://localhost:3000/api/admin/test-prompt",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-forwarded-for": "10.0.0.7",
          },
          body: "invalid json",
        },
      );

      const response = await POST(request);

      expect(response.status).toBe(400);
    });
  });

  describe("Test Suite Execution", () => {
    it("should call runTestSuite with correct parameters", async () => {
      const testCases: TestCase[] = [
        {
          id: "test-1",
          question: "What is your experience?",
          expectedCriteria: [{ type: "contains", value: "experience" }],
        },
      ];

      const request = new Request(
        "http://localhost:3000/api/admin/test-prompt",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-forwarded-for": "10.0.1.1",
          },
          body: JSON.stringify({
            promptText: "You are a test assistant.",
            agentType: "chat",
            testCases,
          }),
        },
      );

      await POST(request);

      // Verify runTestSuite was called
      expect(mockRunTestSuite).toHaveBeenCalled();

      const [promptText, receivedTestCases, agentType] =
        mockRunTestSuite.mock.calls[0];
      expect(promptText).toBe("You are a test assistant.");
      expect(receivedTestCases).toEqual(testCases);
      expect(agentType).toBe("chat");
    });

    it("should support fit-assessment agent type", async () => {
      const testCases: TestCase[] = [
        {
          id: "test-1",
          question: "Test question",
          expectedCriteria: [{ type: "contains", value: "test" }],
        },
      ];

      const request = new Request(
        "http://localhost:3000/api/admin/test-prompt",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-forwarded-for": "10.0.1.2",
          },
          body: JSON.stringify({
            promptText: "Test prompt",
            agentType: "fit-assessment",
            testCases,
          }),
        },
      );

      await POST(request);

      expect(mockRunTestSuite).toHaveBeenCalled();
      const [, , agentType] = mockRunTestSuite.mock.calls[0];
      expect(agentType).toBe("fit-assessment");
    });
  });

  describe("Response Format", () => {
    it("should return results and summary in response", async () => {
      const testCases: TestCase[] = [
        {
          id: "test-1",
          question: "Test question",
          expectedCriteria: [{ type: "contains", value: "test" }],
        },
      ];

      const request = new Request(
        "http://localhost:3000/api/admin/test-prompt",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-forwarded-for": "10.0.2.1",
          },
          body: JSON.stringify({
            promptText: "Test prompt",
            agentType: "chat",
            testCases,
          }),
        },
      );

      const response = await POST(request);
      const body = await response.json();

      expect(body).toHaveProperty("results");
      expect(body).toHaveProperty("summary");
    });

    it("should calculate summary statistics correctly", async () => {
      const testCases: TestCase[] = [
        {
          id: "test-1",
          question: "Test question",
          expectedCriteria: [{ type: "contains", value: "test" }],
        },
      ];

      const request = new Request(
        "http://localhost:3000/api/admin/test-prompt",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-forwarded-for": "10.0.2.2",
          },
          body: JSON.stringify({
            promptText: "Test prompt",
            agentType: "chat",
            testCases,
          }),
        },
      );

      const response = await POST(request);
      const body = await response.json();

      expect(body.summary).toHaveProperty("totalTests");
      expect(body.summary).toHaveProperty("passed");
      expect(body.summary).toHaveProperty("failed");
      expect(body.summary).toHaveProperty("avgTokens");
      expect(body.summary).toHaveProperty("avgLatencyMs");

      // Verify calculations based on mock data
      expect(body.summary.totalTests).toBe(2);
      expect(body.summary.passed).toBe(1);
      expect(body.summary.failed).toBe(1);
      expect(body.summary.avgTokens).toBe(175); // (150 + 200) / 2
      expect(body.summary.avgLatencyMs).toBe(550); // (500 + 600) / 2
    });

    it("should include full test results in response", async () => {
      const testCases: TestCase[] = [
        {
          id: "test-1",
          question: "Test question",
          expectedCriteria: [{ type: "contains", value: "test" }],
        },
      ];

      const request = new Request(
        "http://localhost:3000/api/admin/test-prompt",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-forwarded-for": "10.0.2.3",
          },
          body: JSON.stringify({
            promptText: "Test prompt",
            agentType: "chat",
            testCases,
          }),
        },
      );

      const response = await POST(request);
      const body = await response.json();

      expect(Array.isArray(body.results)).toBe(true);
      expect(body.results.length).toBe(2);

      // Verify first result structure
      const result1 = body.results[0];
      expect(result1).toHaveProperty("testCaseId");
      expect(result1).toHaveProperty("passed");
      expect(result1).toHaveProperty("response");
      expect(result1).toHaveProperty("tokenCount");
      expect(result1).toHaveProperty("latencyMs");

      // Verify second result includes failedCriteria
      const result2 = body.results[1];
      expect(result2.passed).toBe(false);
      expect(result2).toHaveProperty("failedCriteria");
      expect(Array.isArray(result2.failedCriteria)).toBe(true);
    });
  });

  describe("Rate Limiting", () => {
    it("should track requests per IP address", async () => {
      const testCases: TestCase[] = [
        {
          id: "test-1",
          question: "Test question",
          expectedCriteria: [{ type: "contains", value: "test" }],
        },
      ];

      const request = new Request(
        "http://localhost:3000/api/admin/test-prompt",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-forwarded-for": "192.168.1.1",
          },
          body: JSON.stringify({
            promptText: "Test prompt",
            agentType: "chat",
            testCases,
          }),
        },
      );

      const response = await POST(request);

      expect(response.status).toBe(200);
    });

    it("should enforce rate limit of 5 requests per minute", async () => {
      const testCases: TestCase[] = [
        {
          id: "test-1",
          question: "Test question",
          expectedCriteria: [{ type: "contains", value: "test" }],
        },
      ];

      const ip = "192.168.1.100";

      // Make 5 requests (should all succeed)
      for (let i = 0; i < 5; i++) {
        const request = new Request(
          "http://localhost:3000/api/admin/test-prompt",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-forwarded-for": ip,
            },
            body: JSON.stringify({
              promptText: "Test prompt",
              agentType: "chat",
              testCases,
            }),
          },
        );

        const response = await POST(request);
        expect(response.status).toBe(200);
      }

      // 6th request should be rate limited
      const rateLimitedRequest = new Request(
        "http://localhost:3000/api/admin/test-prompt",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-forwarded-for": ip,
          },
          body: JSON.stringify({
            promptText: "Test prompt",
            agentType: "chat",
            testCases,
          }),
        },
      );

      const rateLimitedResponse = await POST(rateLimitedRequest);
      expect(rateLimitedResponse.status).toBe(429);
    });

    it("should include retry-after header when rate limited", async () => {
      const testCases: TestCase[] = [
        {
          id: "test-1",
          question: "Test question",
          expectedCriteria: [{ type: "contains", value: "test" }],
        },
      ];

      const ip = "192.168.1.101";

      // Exceed rate limit
      for (let i = 0; i < 6; i++) {
        const request = new Request(
          "http://localhost:3000/api/admin/test-prompt",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-forwarded-for": ip,
            },
            body: JSON.stringify({
              promptText: "Test prompt",
              agentType: "chat",
              testCases,
            }),
          },
        );

        const response = await POST(request);

        if (response.status === 429) {
          const retryAfter = response.headers.get("retry-after");
          expect(retryAfter).toBeDefined();
          expect(Number.parseInt(retryAfter || "0", 10)).toBeGreaterThan(0);
        }
      }
    });

    it("should track different IPs independently", async () => {
      const testCases: TestCase[] = [
        {
          id: "test-1",
          question: "Test question",
          expectedCriteria: [{ type: "contains", value: "test" }],
        },
      ];

      const ip1 = "192.168.1.102";
      const ip2 = "192.168.1.103";

      // Make requests from IP1
      for (let i = 0; i < 5; i++) {
        const request = new Request(
          "http://localhost:3000/api/admin/test-prompt",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-forwarded-for": ip1,
            },
            body: JSON.stringify({
              promptText: "Test prompt",
              agentType: "chat",
              testCases,
            }),
          },
        );

        await POST(request);
      }

      // IP2 should still be able to make requests
      const ip2Request = new Request(
        "http://localhost:3000/api/admin/test-prompt",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-forwarded-for": ip2,
          },
          body: JSON.stringify({
            promptText: "Test prompt",
            agentType: "chat",
            testCases,
          }),
        },
      );

      const response = await POST(ip2Request);
      expect(response.status).toBe(200);
    });
  });

  describe("Error Handling", () => {
    it("should handle test runner errors gracefully", async () => {
      // Mock runTestSuite to throw error
      mockRunTestSuite.mockImplementationOnce(() => {
        throw new Error("Test runner error");
      });

      const testCases: TestCase[] = [
        {
          id: "test-1",
          question: "Test question",
          expectedCriteria: [{ type: "contains", value: "test" }],
        },
      ];

      const request = new Request(
        "http://localhost:3000/api/admin/test-prompt",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-forwarded-for": "10.0.3.1",
          },
          body: JSON.stringify({
            promptText: "Test prompt",
            agentType: "chat",
            testCases,
          }),
        },
      );

      const response = await POST(request);

      expect(response.status).toBe(500);
    });

    it("should return proper error message format", async () => {
      const request = new Request(
        "http://localhost:3000/api/admin/test-prompt",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-forwarded-for": "10.0.3.2",
          },
          body: JSON.stringify({}),
        },
      );

      const response = await POST(request);

      const body = await response.json();
      expect(body).toHaveProperty("error");
      expect(typeof body.error).toBe("string");
    });
  });

  describe("Acceptance Criteria Validation", () => {
    it("AC1: Route exists at src/app/api/admin/test-prompt/route.ts", () => {
      // If this test runs, the file exists and exports POST
      expect(POST).toBeDefined();
      expect(typeof POST).toBe("function");
    });

    it("AC2: POST endpoint accepts { promptText, agentType, testCases }", async () => {
      const testCases: TestCase[] = [
        {
          id: "test-1",
          question: "Test question",
          expectedCriteria: [{ type: "contains", value: "test" }],
        },
      ];

      const request = new Request(
        "http://localhost:3000/api/admin/test-prompt",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-forwarded-for": "10.0.4.1",
          },
          body: JSON.stringify({
            promptText: "Test prompt",
            agentType: "chat",
            testCases,
          }),
        },
      );

      const response = await POST(request);

      expect(response.status).toBe(200);
    });

    it("AC3: Executes test suite using runTestSuite()", async () => {
      const testCases: TestCase[] = [
        {
          id: "test-1",
          question: "Test question",
          expectedCriteria: [{ type: "contains", value: "test" }],
        },
      ];

      const request = new Request(
        "http://localhost:3000/api/admin/test-prompt",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-forwarded-for": "10.0.4.2",
          },
          body: JSON.stringify({
            promptText: "Test prompt",
            agentType: "chat",
            testCases,
          }),
        },
      );

      await POST(request);

      // Verify runTestSuite was called
      expect(mockRunTestSuite).toHaveBeenCalled();
    });

    it("AC4: Returns results with summary statistics", async () => {
      const testCases: TestCase[] = [
        {
          id: "test-1",
          question: "Test question",
          expectedCriteria: [{ type: "contains", value: "test" }],
        },
      ];

      const request = new Request(
        "http://localhost:3000/api/admin/test-prompt",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-forwarded-for": "10.0.4.3",
          },
          body: JSON.stringify({
            promptText: "Test prompt",
            agentType: "chat",
            testCases,
          }),
        },
      );

      const response = await POST(request);
      const body = await response.json();

      expect(body).toHaveProperty("results");
      expect(body).toHaveProperty("summary");
      expect(body.summary).toHaveProperty("totalTests");
      expect(body.summary).toHaveProperty("passed");
      expect(body.summary).toHaveProperty("failed");
      expect(body.summary).toHaveProperty("avgTokens");
      expect(body.summary).toHaveProperty("avgLatencyMs");
    });

    it("AC5: Rate limiting at 5 requests per minute per IP", async () => {
      const testCases: TestCase[] = [
        {
          id: "test-1",
          question: "Test question",
          expectedCriteria: [{ type: "contains", value: "test" }],
        },
      ];

      const ip = "192.168.1.200";

      // Make 6 requests
      let rateLimitedFound = false;

      for (let i = 0; i < 6; i++) {
        const request = new Request(
          "http://localhost:3000/api/admin/test-prompt",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-forwarded-for": ip,
            },
            body: JSON.stringify({
              promptText: "Test prompt",
              agentType: "chat",
              testCases,
            }),
          },
        );

        const response = await POST(request);

        if (response.status === 429) {
          rateLimitedFound = true;
          break;
        }
      }

      expect(rateLimitedFound).toBe(true);
    });

    it("AC6: Max 20 test cases per request enforced", async () => {
      const testCases: TestCase[] = Array.from({ length: 21 }, (_, i) => ({
        id: `test-${i}`,
        question: "Test question",
        expectedCriteria: [{ type: "contains", value: "test" }],
      }));

      const request = new Request(
        "http://localhost:3000/api/admin/test-prompt",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-forwarded-for": "10.0.4.5",
          },
          body: JSON.stringify({
            promptText: "Test prompt",
            agentType: "chat",
            testCases,
          }),
        },
      );

      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it("AC7: Input validation for all required fields", async () => {
      // Missing promptText
      const request1 = new Request(
        "http://localhost:3000/api/admin/test-prompt",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-forwarded-for": "10.0.4.6",
          },
          body: JSON.stringify({
            agentType: "chat",
            testCases: [
              {
                id: "test-1",
                question: "Test",
                expectedCriteria: [{ type: "contains", value: "test" }],
              },
            ],
          }),
        },
      );

      const response1 = await POST(request1);
      expect(response1.status).toBe(400);

      // Missing agentType
      const request2 = new Request(
        "http://localhost:3000/api/admin/test-prompt",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-forwarded-for": "10.0.4.7",
          },
          body: JSON.stringify({
            promptText: "Test",
            testCases: [
              {
                id: "test-1",
                question: "Test",
                expectedCriteria: [{ type: "contains", value: "test" }],
              },
            ],
          }),
        },
      );

      const response2 = await POST(request2);
      expect(response2.status).toBe(400);

      // Missing testCases
      const request3 = new Request(
        "http://localhost:3000/api/admin/test-prompt",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-forwarded-for": "10.0.4.8",
          },
          body: JSON.stringify({
            promptText: "Test",
            agentType: "chat",
          }),
        },
      );

      const response3 = await POST(request3);
      expect(response3.status).toBe(400);
    });
  });
});
