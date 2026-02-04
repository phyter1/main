/**
 * AI Configuration and Environment Validation
 *
 * This module handles:
 * - Environment variable validation for AI integration
 * - Rate limiting constants and configuration
 * - AI SDK initialization and setup
 * - Type-safe configuration exports
 */

import { openai } from "@ai-sdk/openai";

/**
 * Rate Limiting Constants
 * These values help prevent API quota exhaustion and manage costs
 */
export const AI_RATE_LIMITS = {
  /** Maximum AI requests allowed per minute */
  MAX_REQUESTS_PER_MINUTE: Number(process.env.AI_MAX_REQUESTS_PER_MINUTE) || 10,

  /** Maximum tokens per individual request */
  MAX_TOKENS_PER_REQUEST: Number(process.env.AI_MAX_TOKENS_PER_REQUEST) || 4096,

  /** Default timeout for AI requests in milliseconds */
  REQUEST_TIMEOUT_MS: 30000,

  /** Retry configuration */
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 1000,
} as const;

/**
 * AI Model Configuration
 * Locked to gpt-4.1-nano for maximum cost efficiency
 */
export const AI_MODEL = "gpt-4.1-nano" as const;

/**
 * Environment Variable Validation
 * Validates required environment variables at application startup
 */
class AIConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AIConfigError";
  }
}

/**
 * Validates that all required environment variables are present and valid
 * @throws {AIConfigError} If required environment variables are missing or invalid
 */
function validateEnvironment(): void {
  const requiredVars = ["OPENAI_API_KEY"] as const;
  const missing: string[] = [];

  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (!value || value.trim() === "" || value === "your_api_key_here") {
      missing.push(varName);
    }
  }

  if (missing.length > 0) {
    throw new AIConfigError(
      `Missing or invalid required environment variables: ${missing.join(", ")}\n` +
        "Please copy .env.local.example to .env.local and configure your API keys.",
    );
  }

  // Validate API key format (basic check)
  const apiKey = process.env.OPENAI_API_KEY;
  if (apiKey && !apiKey.startsWith("sk-")) {
    console.warn(
      'Warning: OPENAI_API_KEY does not match expected format (should start with "sk-")',
    );
  }
}

/**
 * AI Configuration Object
 * Exports validated configuration for use throughout the application
 */
export const aiConfig = {
  /** OpenAI API key */
  get apiKey(): string {
    const key = process.env.OPENAI_API_KEY;
    if (!key || key === "your_api_key_here") {
      throw new AIConfigError("OPENAI_API_KEY is not configured");
    }
    return key;
  },

  /** Rate limiting configuration */
  rateLimits: AI_RATE_LIMITS,

  /** AI model (locked to gpt-4.1-nano) */
  model: AI_MODEL,

  /** Validates environment configuration */
  validate: validateEnvironment,
} as const;

/**
 * OpenAI SDK Client
 * Pre-configured client for AI SDK usage
 * Locked to gpt-4.1-nano - no model selection allowed
 */
export function createOpenAIClient() {
  // Validate environment before creating client
  aiConfig.validate();

  return openai(AI_MODEL);
}

/**
 * Type exports for AI configuration
 */
export type AIConfig = typeof aiConfig;
export type AIRateLimits = typeof AI_RATE_LIMITS;

// Validate environment on module load in server context
// This will fail fast if configuration is missing
if (typeof window === "undefined") {
  try {
    aiConfig.validate();
  } catch (error) {
    // Log warning but don't crash during build/static generation
    if (process.env.NODE_ENV === "production") {
      console.warn("AI configuration validation warning:", error);
    }
  }
}
