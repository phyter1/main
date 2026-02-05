/**
 * Test Prompt API Route
 * POST endpoint for running test suites against AI prompts
 * Used by admin workbench to validate prompt refinements
 */

import type { AgentType, TestCase, TestResult } from "@/lib/test-runner";
import { runTestSuite } from "@/lib/test-runner";

/**
 * Rate limiting configuration for test-prompt endpoint
 * More restrictive than chat endpoints due to resource-intensive testing
 */
const TEST_PROMPT_RATE_LIMIT = {
  MAX_REQUESTS_PER_MINUTE: 5,
  MAX_TEST_CASES_PER_REQUEST: 20,
} as const;

/**
 * Rate limiting state
 * Tracks request counts per IP address with timestamp cleanup
 */
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

/**
 * Get client IP address from request headers
 */
function getClientIP(request: Request): string {
  // Check common headers used by proxies and CDNs
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwardedFor.split(",")[0].trim();
  }

  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }

  // Fallback to a default (in production, this should be handled better)
  return "unknown";
}

/**
 * Check if request is rate limited
 * Returns true if rate limit exceeded, false otherwise
 */
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  // Clean up expired entries
  if (entry && now >= entry.resetAt) {
    rateLimitMap.delete(ip);
    return false;
  }

  // Check if limit exceeded
  if (entry && entry.count >= TEST_PROMPT_RATE_LIMIT.MAX_REQUESTS_PER_MINUTE) {
    return true;
  }

  return false;
}

/**
 * Record request for rate limiting
 */
function recordRequest(ip: string): void {
  const now = Date.now();
  const oneMinuteFromNow = now + 60 * 1000;

  const entry = rateLimitMap.get(ip);

  if (!entry || now >= entry.resetAt) {
    // Create new entry or reset expired entry
    rateLimitMap.set(ip, {
      count: 1,
      resetAt: oneMinuteFromNow,
    });
  } else {
    // Increment count
    entry.count++;
  }
}

/**
 * Get seconds until rate limit reset
 */
function getSecondsUntilReset(ip: string): number {
  const entry = rateLimitMap.get(ip);
  if (!entry) return 60;

  const now = Date.now();
  const secondsRemaining = Math.ceil((entry.resetAt - now) / 1000);
  return Math.max(secondsRemaining, 1);
}

/**
 * Request body structure
 */
interface TestPromptRequestBody {
  promptText: string;
  agentType: AgentType;
  testCases: TestCase[];
}

/**
 * Validate request body
 */
function validateRequestBody(body: unknown): body is TestPromptRequestBody {
  if (!body || typeof body !== "object") {
    return false;
  }

  const { promptText, agentType, testCases } = body as TestPromptRequestBody;

  // Validate promptText
  if (!promptText || typeof promptText !== "string" || !promptText.trim()) {
    return false;
  }

  // Validate agentType
  if (
    !agentType ||
    typeof agentType !== "string" ||
    (agentType !== "chat" && agentType !== "fit-assessment")
  ) {
    return false;
  }

  // Validate testCases
  if (!testCases || !Array.isArray(testCases) || testCases.length === 0) {
    return false;
  }

  // Validate max test cases
  if (testCases.length > TEST_PROMPT_RATE_LIMIT.MAX_TEST_CASES_PER_REQUEST) {
    return false;
  }

  // Validate test case structure
  for (const testCase of testCases) {
    if (
      !testCase.id ||
      !testCase.question ||
      !testCase.expectedCriteria ||
      !Array.isArray(testCase.expectedCriteria)
    ) {
      return false;
    }
  }

  return true;
}

/**
 * Response structure
 */
interface TestPromptResponse {
  results: TestResult[];
  summary: {
    totalTests: number;
    passed: number;
    failed: number;
    avgTokens: number;
    avgLatencyMs: number;
  };
}

/**
 * Calculate summary statistics from test results
 */
function calculateSummary(
  results: TestResult[],
): TestPromptResponse["summary"] {
  const totalTests = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = totalTests - passed;

  const totalTokens = results.reduce((sum, r) => sum + r.tokenCount, 0);
  const avgTokens = totalTests > 0 ? Math.round(totalTokens / totalTests) : 0;

  const totalLatency = results.reduce((sum, r) => sum + r.latencyMs, 0);
  const avgLatencyMs =
    totalTests > 0 ? Math.round(totalLatency / totalTests) : 0;

  return {
    totalTests,
    passed,
    failed,
    avgTokens,
    avgLatencyMs,
  };
}

/**
 * POST /api/admin/test-prompt
 * Handles test suite execution for prompt validation
 */
export async function POST(request: Request): Promise<Response> {
  try {
    // Extract client IP for rate limiting
    const clientIP = getClientIP(request);

    // Check rate limit
    if (isRateLimited(clientIP)) {
      const retryAfter = getSecondsUntilReset(clientIP);

      return new Response(
        JSON.stringify({
          error: "Rate limit exceeded. Please try again later.",
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": retryAfter.toString(),
          },
        },
      );
    }

    // Parse request body
    let body: unknown;
    try {
      body = await request.json();
    } catch (_error) {
      return new Response(
        JSON.stringify({
          error: "Invalid JSON in request body",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    // Validate request body
    if (!validateRequestBody(body)) {
      // Provide more specific error messages
      const data = body as Partial<TestPromptRequestBody>;
      let errorMessage = "Invalid request body. ";

      if (!data.promptText) {
        errorMessage += "Missing or invalid promptText. ";
      }
      if (!data.agentType) {
        errorMessage +=
          "Missing or invalid agentType (must be 'chat' or 'fit-assessment'). ";
      } else if (
        data.agentType !== "chat" &&
        data.agentType !== "fit-assessment"
      ) {
        errorMessage +=
          "Invalid agentType (must be 'chat' or 'fit-assessment'). ";
      }
      if (!data.testCases || !Array.isArray(data.testCases)) {
        errorMessage += "Missing or invalid testCases array. ";
      } else if (data.testCases.length === 0) {
        errorMessage += "testCases array cannot be empty. ";
      } else if (
        data.testCases.length >
        TEST_PROMPT_RATE_LIMIT.MAX_TEST_CASES_PER_REQUEST
      ) {
        errorMessage += `Too many test cases (max ${TEST_PROMPT_RATE_LIMIT.MAX_TEST_CASES_PER_REQUEST} per request). `;
      }

      return new Response(
        JSON.stringify({
          error: errorMessage.trim(),
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    // Record request for rate limiting
    recordRequest(clientIP);

    // Execute test suite
    const results = await runTestSuite(
      body.promptText,
      body.testCases,
      body.agentType,
    );

    // Calculate summary statistics
    const summary = calculateSummary(results);

    // Build response
    const response: TestPromptResponse = {
      results,
      summary,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Test Prompt API error:", error);

    return new Response(
      JSON.stringify({
        error: "An error occurred processing your request. Please try again.",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
}
