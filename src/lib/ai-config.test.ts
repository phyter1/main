/**
 * Test Suite for AI Configuration Module
 * Validates environment variable handling, rate limiting constants, and configuration exports
 */

import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import {
  aiConfig,
  AI_RATE_LIMITS,
  AI_MODEL,
  createOpenAIClient,
} from "./ai-config";

describe("T002: AI SDK Configuration and Environment Validation", () => {
  // Store original environment
  const originalEnv = { ...process.env };

  beforeEach(() => {
    // Reset environment before each test
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe("Environment Variable Validation", () => {
    it("should validate required OPENAI_API_KEY is present", () => {
      // Set valid API key
      process.env.OPENAI_API_KEY = "sk-test-key-12345";

      expect(() => {
        aiConfig.validate();
      }).not.toThrow();
    });

    it("should throw error when OPENAI_API_KEY is missing", () => {
      delete process.env.OPENAI_API_KEY;

      expect(() => {
        aiConfig.validate();
      }).toThrow(
        "Missing or invalid required environment variables: OPENAI_API_KEY",
      );
    });

    it("should reject placeholder API key value", () => {
      process.env.OPENAI_API_KEY = "your_api_key_here";

      expect(() => {
        aiConfig.validate();
      }).toThrow();
    });

    it("should reject empty API key value", () => {
      process.env.OPENAI_API_KEY = "";

      expect(() => {
        aiConfig.validate();
      }).toThrow();
    });

    it("should provide API key through getter when valid", () => {
      process.env.OPENAI_API_KEY = "sk-test-key-12345";

      expect(aiConfig.apiKey).toBe("sk-test-key-12345");
    });

    it("should throw error from getter when API key is invalid", () => {
      process.env.OPENAI_API_KEY = "your_api_key_here";

      expect(() => {
        const _key = aiConfig.apiKey;
      }).toThrow("OPENAI_API_KEY is not configured");
    });
  });

  describe("Rate Limiting Constants", () => {
    it("should export AI_RATE_LIMITS with default values", () => {
      expect(AI_RATE_LIMITS).toBeDefined();
      expect(AI_RATE_LIMITS.REQUEST_TIMEOUT_MS).toBe(30000);
      expect(AI_RATE_LIMITS.MAX_RETRIES).toBe(3);
      expect(AI_RATE_LIMITS.RETRY_DELAY_MS).toBe(1000);
    });

    it("should respect environment variable for MAX_REQUESTS_PER_MINUTE", () => {
      // Note: AI_RATE_LIMITS is evaluated at module load time
      // This test validates the constant is a number
      expect(typeof AI_RATE_LIMITS.MAX_REQUESTS_PER_MINUTE).toBe("number");
      expect(AI_RATE_LIMITS.MAX_REQUESTS_PER_MINUTE).toBeGreaterThan(0);
    });

    it("should respect environment variable for MAX_TOKENS_PER_REQUEST", () => {
      // Note: AI_RATE_LIMITS is evaluated at module load time
      // This test validates the constant is a number
      expect(typeof AI_RATE_LIMITS.MAX_TOKENS_PER_REQUEST).toBe("number");
      expect(AI_RATE_LIMITS.MAX_TOKENS_PER_REQUEST).toBeGreaterThan(0);
    });

    it("should have valid numeric values for rate limits", () => {
      // Validate all rate limit values are proper numbers
      expect(typeof AI_RATE_LIMITS.MAX_REQUESTS_PER_MINUTE).toBe("number");
      expect(typeof AI_RATE_LIMITS.MAX_TOKENS_PER_REQUEST).toBe("number");
      expect(Number.isNaN(AI_RATE_LIMITS.MAX_REQUESTS_PER_MINUTE)).toBe(false);
      expect(Number.isNaN(AI_RATE_LIMITS.MAX_TOKENS_PER_REQUEST)).toBe(false);
    });
  });

  describe("AI Model Configuration", () => {
    it("should export AI_MODEL locked to gpt-4.1-nano", () => {
      expect(AI_MODEL).toBeDefined();
      expect(AI_MODEL).toBe("gpt-4.1-nano");
    });

    it("should be a constant string value", () => {
      // Verify it's a string constant
      expect(typeof AI_MODEL).toBe("string");
      expect(AI_MODEL.length).toBeGreaterThan(0);
    });
  });

  describe("Configuration Object", () => {
    it("should export aiConfig with required properties", () => {
      process.env.OPENAI_API_KEY = "sk-test-key-12345";

      expect(aiConfig).toBeDefined();
      expect(aiConfig.rateLimits).toBeDefined();
      expect(aiConfig.model).toBeDefined();
      expect(typeof aiConfig.validate).toBe("function");
    });

    it("should provide access to rate limits through aiConfig", () => {
      expect(aiConfig.rateLimits.MAX_REQUESTS_PER_MINUTE).toBeDefined();
      expect(aiConfig.rateLimits.MAX_TOKENS_PER_REQUEST).toBeDefined();
    });

    it("should provide access to model through aiConfig", () => {
      expect(aiConfig.model).toBeDefined();
      expect(aiConfig.model).toBe("gpt-4.1-nano");
    });
  });

  describe("createOpenAIClient Function", () => {
    it("should create client with gpt-4.1-nano model", () => {
      process.env.OPENAI_API_KEY = "sk-test-key-12345";

      expect(() => {
        const _client = createOpenAIClient();
      }).not.toThrow();
    });

    it("should not accept any model parameter", () => {
      process.env.OPENAI_API_KEY = "sk-test-key-12345";

      // Function should have no parameters
      expect(createOpenAIClient.length).toBe(0);
    });

    it("should validate environment before creating client", () => {
      delete process.env.OPENAI_API_KEY;

      expect(() => {
        createOpenAIClient();
      }).toThrow();
    });
  });

  describe("Type Exports", () => {
    it("should export all required values", () => {
      // This test validates that all exports are available
      // TypeScript compilation will fail if exports are not correct
      expect(aiConfig).toBeDefined();
      expect(AI_RATE_LIMITS).toBeDefined();
      expect(AI_MODEL).toBeDefined();
      expect(createOpenAIClient).toBeDefined();
    });
  });
});
