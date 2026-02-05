/**
 * Test Execution Engine for AI Agent Prompts
 *
 * Runs test cases against system prompts and evaluates responses
 * against expected criteria (contains text, first-person, token limits, etc.)
 *
 * Used by the admin workbench to test prompt refinements before deployment.
 */

import { generateText } from "ai";
import { createOpenAIClient } from "@/lib/ai-config";

/**
 * Criterion types for test evaluation
 */
export type CriterionType =
  | "contains"
  | "first-person"
  | "token-limit"
  | "max-length";

/**
 * Criterion definition for evaluating test responses
 */
export interface Criterion {
  type: CriterionType;
  value: string | number;
}

/**
 * Test case structure
 */
export interface TestCase {
  id: string;
  question: string;
  expectedCriteria: Criterion[];
}

/**
 * Result of criterion evaluation
 */
interface CriterionResult {
  passed: boolean;
  reason?: string;
}

/**
 * Failed criterion details
 */
interface FailedCriterion {
  type: CriterionType;
  value: string | number;
  reason: string;
}

/**
 * Test result structure
 */
export interface TestResult {
  testCaseId: string;
  passed: boolean;
  response: string;
  tokenCount: number;
  latencyMs: number;
  failedCriteria?: FailedCriterion[];
}

/**
 * Agent types for test execution
 */
export type AgentType = "chat" | "fit-assessment";

/**
 * Evaluate a single criterion against a response
 *
 * @param criterion - The criterion to evaluate
 * @param response - The AI response to check
 * @param tokenCount - Token count from AI response
 * @returns CriterionResult with pass/fail and optional reason
 */
export function evaluateCriterion(
  criterion: Criterion,
  response: string,
  tokenCount: number,
): CriterionResult {
  switch (criterion.type) {
    case "contains": {
      const searchText = String(criterion.value);
      const passed = response.toLowerCase().includes(searchText.toLowerCase());
      return {
        passed,
        reason: passed
          ? undefined
          : `Response does not contain "${criterion.value}"`,
      };
    }

    case "first-person": {
      // Check for common first-person pronouns
      const firstPersonPronouns = [
        "\\bI\\b",
        "\\bI'm\\b",
        "\\bI've\\b",
        "\\bI'll\\b",
        "\\bI'd\\b",
        "\\bmy\\b",
        "\\bme\\b",
        "\\bmine\\b",
        "\\bmyself\\b",
      ];

      const firstPersonRegex = new RegExp(firstPersonPronouns.join("|"), "i");
      const passed = firstPersonRegex.test(response);

      return {
        passed,
        reason: passed
          ? undefined
          : "Response does not use first-person perspective (I, my, me, etc.)",
      };
    }

    case "token-limit": {
      const limit = Number(criterion.value);
      const passed = tokenCount <= limit;

      return {
        passed,
        reason: passed
          ? undefined
          : `Response exceeded token limit: ${tokenCount} tokens (limit: ${limit})`,
      };
    }

    case "max-length": {
      const maxChars = Number(criterion.value);
      const actualLength = response.length;
      const passed = actualLength <= maxChars;

      return {
        passed,
        reason: passed
          ? undefined
          : `Response exceeded max length: ${actualLength} characters (limit: ${maxChars})`,
      };
    }

    default: {
      // TypeScript exhaustiveness check
      const _exhaustive: never = criterion.type;
      throw new Error(`Unknown criterion type: ${_exhaustive}`);
    }
  }
}

/**
 * Run a single test case against a system prompt
 *
 * @param systemPrompt - The system prompt to test
 * @param testCase - The test case to execute
 * @param agentType - The type of agent being tested
 * @returns TestResult with pass/fail, response, and metrics
 */
export async function runTest(
  systemPrompt: string,
  testCase: TestCase,
  _agentType: AgentType,
): Promise<TestResult> {
  const startTime = Date.now();

  // Create OpenAI client
  const model = createOpenAIClient();

  // Execute test question against the prompt
  const result = await generateText({
    model,
    prompt: testCase.question,
    system: systemPrompt,
  });

  const latencyMs = Date.now() - startTime;
  const tokenCount = result.usage?.totalTokens || 0;
  const response = result.text;

  // Evaluate all criteria
  const failedCriteria: FailedCriterion[] = [];
  for (const criterion of testCase.expectedCriteria) {
    const evaluation = evaluateCriterion(criterion, response, tokenCount);

    if (!evaluation.passed) {
      failedCriteria.push({
        type: criterion.type,
        value: criterion.value,
        reason: evaluation.reason || "Unknown failure",
      });
    }
  }

  return {
    testCaseId: testCase.id,
    passed: failedCriteria.length === 0,
    response,
    tokenCount,
    latencyMs,
    failedCriteria: failedCriteria.length > 0 ? failedCriteria : undefined,
  };
}

/**
 * Run a suite of test cases against a system prompt
 *
 * @param systemPrompt - The system prompt to test
 * @param testCases - Array of test cases to execute
 * @param agentType - The type of agent being tested
 * @returns Array of TestResults for all test cases
 */
export async function runTestSuite(
  systemPrompt: string,
  testCases: TestCase[],
  _agentType: AgentType,
): Promise<TestResult[]> {
  const results: TestResult[] = [];

  // Run tests sequentially to avoid rate limiting
  for (const testCase of testCases) {
    const result = await runTest(systemPrompt, testCase, _agentType);
    results.push(result);
  }

  return results;
}
