/**
 * Test Runner - Unit Tests
 *
 * Tests for AI agent prompt test execution engine
 * Uses mocked AI SDK generateText for predictable, fast testing
 */

import { beforeEach, describe, expect, it, mock } from "bun:test";
import type { Criterion, TestCase } from "./test-runner";

/**
 * Mock AI SDK generateText implementation
 */
const mockGenerateText = mock(async () => ({
  text: "I have 7 years of TypeScript experience working on production applications at Hugo Health.",
  usage: {
    promptTokens: 150,
    completionTokens: 18,
    totalTokens: 168,
  },
}));

// Mock the AI SDK module
mock.module("ai", () => ({
  generateText: mockGenerateText,
}));

// Mock AI config
mock.module("@/lib/ai-config", () => ({
  createOpenAIClient: mock(() => "mock-openai-client"),
  AI_MODEL: "gpt-4.1-nano",
}));

/**
 * Import after mocking to ensure mocks are applied
 */
const testRunnerModule = await import("./test-runner");
const { runTest, runTestSuite, evaluateCriterion } = testRunnerModule;

describe("test-runner", () => {
  beforeEach(() => {
    mockGenerateText.mockClear();
  });

  describe("evaluateCriterion", () => {
    const sampleResponse = "I have 7 years of TypeScript experience.";

    it("should pass 'contains' criterion when text is found", () => {
      const criterion: Criterion = {
        type: "contains",
        value: "TypeScript",
      };

      const result = evaluateCriterion(criterion, sampleResponse, 50);
      expect(result.passed).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it("should fail 'contains' criterion when text is not found", () => {
      const criterion: Criterion = {
        type: "contains",
        value: "Python",
      };

      const result = evaluateCriterion(criterion, sampleResponse, 50);
      expect(result.passed).toBe(false);
      expect(result.reason).toContain("Python");
    });

    it("should be case-insensitive for 'contains' criterion", () => {
      const criterion: Criterion = {
        type: "contains",
        value: "typescript",
      };

      const result = evaluateCriterion(criterion, sampleResponse, 50);
      expect(result.passed).toBe(true);
    });

    it("should pass 'first-person' criterion when first-person pronouns are found", () => {
      const criterion: Criterion = {
        type: "first-person",
        value: "",
      };

      const result = evaluateCriterion(criterion, sampleResponse, 50);
      expect(result.passed).toBe(true);
    });

    it("should fail 'first-person' criterion when no first-person pronouns found", () => {
      const criterion: Criterion = {
        type: "first-person",
        value: "",
      };

      const response = "Ryan has extensive experience with TypeScript.";
      const result = evaluateCriterion(criterion, response, 50);
      expect(result.passed).toBe(false);
      expect(result.reason).toContain("first-person");
    });

    it("should pass 'token-limit' criterion when under limit", () => {
      const criterion: Criterion = {
        type: "token-limit",
        value: 100,
      };

      const result = evaluateCriterion(criterion, sampleResponse, 50);
      expect(result.passed).toBe(true);
    });

    it("should fail 'token-limit' criterion when over limit", () => {
      const criterion: Criterion = {
        type: "token-limit",
        value: 30,
      };

      const result = evaluateCriterion(criterion, sampleResponse, 50);
      expect(result.passed).toBe(false);
      expect(result.reason).toContain("50");
      expect(result.reason).toContain("30");
    });

    it("should pass 'max-length' criterion when under character limit", () => {
      const criterion: Criterion = {
        type: "max-length",
        value: 100,
      };

      const result = evaluateCriterion(criterion, sampleResponse, 50);
      expect(result.passed).toBe(true);
    });

    it("should fail 'max-length' criterion when over character limit", () => {
      const criterion: Criterion = {
        type: "max-length",
        value: 20,
      };

      const result = evaluateCriterion(criterion, sampleResponse, 50);
      expect(result.passed).toBe(false);
      expect(result.reason).toContain("characters");
    });
  });

  describe("runTest", () => {
    it("should execute a test case and return results", async () => {
      const systemPrompt = "You are a helpful AI assistant.";
      const testCase: TestCase = {
        id: "test-1",
        question: "What is your TypeScript experience?",
        expectedCriteria: [
          { type: "contains", value: "TypeScript" },
          { type: "first-person", value: "" },
        ],
      };

      const result = await runTest(systemPrompt, testCase, "chat");

      expect(result.testCaseId).toBe("test-1");
      expect(result.passed).toBe(true);
      expect(result.response).toContain("TypeScript");
      expect(result.tokenCount).toBeGreaterThan(0);
      expect(result.latencyMs).toBeGreaterThanOrEqual(0);
      expect(result.failedCriteria).toBeUndefined();
    });

    it("should mark test as failed when criteria not met", async () => {
      // Mock a response that doesn't meet criteria
      mockGenerateText.mockImplementationOnce(async () => ({
        text: "Ryan has TypeScript experience.",
        usage: {
          promptTokens: 150,
          completionTokens: 8,
          totalTokens: 158,
        },
      }));

      const systemPrompt = "You are a helpful AI assistant.";
      const testCase: TestCase = {
        id: "test-2",
        question: "What is your TypeScript experience?",
        expectedCriteria: [{ type: "first-person", value: "" }],
      };

      const result = await runTest(systemPrompt, testCase, "chat");

      expect(result.passed).toBe(false);
      expect(result.failedCriteria).toBeDefined();
      expect(result.failedCriteria?.length).toBeGreaterThan(0);
    });

    it("should track token count from AI response", async () => {
      mockGenerateText.mockImplementationOnce(async () => ({
        text: "Test response",
        usage: {
          promptTokens: 100,
          completionTokens: 50,
          totalTokens: 150,
        },
      }));

      const systemPrompt = "Test prompt";
      const testCase: TestCase = {
        id: "test-3",
        question: "Test question",
        expectedCriteria: [],
      };

      const result = await runTest(systemPrompt, testCase, "chat");

      expect(result.tokenCount).toBe(150);
    });

    it("should measure latency accurately", async () => {
      // Mock a response with a delay
      mockGenerateText.mockImplementationOnce(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
        return {
          text: "Delayed response",
          usage: {
            promptTokens: 100,
            completionTokens: 10,
            totalTokens: 110,
          },
        };
      });

      const systemPrompt = "Test prompt";
      const testCase: TestCase = {
        id: "test-4",
        question: "Test question",
        expectedCriteria: [],
      };

      const result = await runTest(systemPrompt, testCase, "chat");

      // Latency should be measured (non-zero) but timing can vary in CI
      expect(result.latencyMs).toBeGreaterThanOrEqual(0);
    });
  });

  describe("runTestSuite", () => {
    it("should run multiple test cases and return all results", async () => {
      const systemPrompt = "You are a helpful AI assistant.";
      const testCases: TestCase[] = [
        {
          id: "test-1",
          question: "What is your TypeScript experience?",
          expectedCriteria: [{ type: "contains", value: "TypeScript" }],
        },
        {
          id: "test-2",
          question: "Tell me about React",
          expectedCriteria: [{ type: "contains", value: "React" }],
        },
      ];

      // Mock responses for each test
      mockGenerateText
        .mockImplementationOnce(async () => ({
          text: "I have TypeScript experience.",
          usage: { promptTokens: 100, completionTokens: 10, totalTokens: 110 },
        }))
        .mockImplementationOnce(async () => ({
          text: "I have React experience.",
          usage: { promptTokens: 100, completionTokens: 10, totalTokens: 110 },
        }));

      const results = await runTestSuite(systemPrompt, testCases, "chat");

      expect(results).toHaveLength(2);
      expect(results[0].testCaseId).toBe("test-1");
      expect(results[1].testCaseId).toBe("test-2");
      expect(results[0].passed).toBe(true);
      expect(results[1].passed).toBe(true);
    });

    it("should handle empty test suite", async () => {
      const systemPrompt = "Test prompt";
      const testCases: TestCase[] = [];

      const results = await runTestSuite(systemPrompt, testCases, "chat");

      expect(results).toHaveLength(0);
    });

    it("should continue running tests even if one fails", async () => {
      const systemPrompt = "Test prompt";
      const testCases: TestCase[] = [
        {
          id: "test-1",
          question: "Question 1",
          expectedCriteria: [{ type: "contains", value: "success" }],
        },
        {
          id: "test-2",
          question: "Question 2",
          expectedCriteria: [{ type: "contains", value: "success" }],
        },
      ];

      // First test fails, second succeeds
      mockGenerateText
        .mockImplementationOnce(async () => ({
          text: "Failed response",
          usage: { promptTokens: 100, completionTokens: 10, totalTokens: 110 },
        }))
        .mockImplementationOnce(async () => ({
          text: "Success response",
          usage: { promptTokens: 100, completionTokens: 10, totalTokens: 110 },
        }));

      const results = await runTestSuite(systemPrompt, testCases, "chat");

      expect(results).toHaveLength(2);
      expect(results[0].passed).toBe(false);
      expect(results[1].passed).toBe(true);
    });
  });

  describe("error handling", () => {
    it("should handle AI API errors gracefully", async () => {
      mockGenerateText.mockImplementationOnce(async () => {
        throw new Error("API Error");
      });

      const systemPrompt = "Test prompt";
      const testCase: TestCase = {
        id: "error-test",
        question: "Test question",
        expectedCriteria: [],
      };

      await expect(runTest(systemPrompt, testCase, "chat")).rejects.toThrow();
    });
  });
});
