/**
 * Type definitions for enhanced guardrail feedback system
 *
 * This module defines the types used to provide detailed, educational
 * feedback when security guardrails are triggered. Each violation includes
 * context about why the guardrail exists, what was detected, and how it works.
 */

/**
 * Types of security guardrails implemented in the system
 */
export type GuardrailType =
  | "prompt_injection"      // Attempts to override AI instructions
  | "rate_limit"            // Request rate limiting
  | "length_validation"     // Input length constraints
  | "suspicious_pattern"    // Malicious code patterns (XSS, injection, etc.)
  | "scope_enforcement";    // Off-topic or out-of-scope requests

/**
 * Severity level of the guardrail violation
 */
export type GuardrailSeverity = "low" | "medium" | "high";

/**
 * Detailed information about a triggered guardrail
 */
export interface GuardrailDetails {
  /**
   * Type of guardrail that was triggered
   */
  type: GuardrailType;

  /**
   * Severity level of the violation
   */
  severity: GuardrailSeverity;

  /**
   * Specific category within the guardrail type
   * Examples:
   * - For prompt_injection: "System Instruction Override", "Role Confusion", "Jailbreak Attempt"
   * - For suspicious_pattern: "XSS/Script Injection", "Command Injection", "SQL Injection"
   * - For length_validation: "Maximum Length Exceeded", "Token Stuffing"
   */
  category: string;

  /**
   * Human-readable explanation of why this guardrail exists
   * Should be educational and explain the security/quality purpose
   */
  explanation: string;

  /**
   * Description of what was detected in the user's input
   * Should NOT expose the exact regex patterns for security reasons
   * Should be specific enough to be educational
   */
  detected: string;

  /**
   * Brief technical explanation of how this guardrail works
   * Should give insight into the implementation without compromising security
   */
  implementation: string;

  /**
   * Path to the source file containing the implementation
   * Relative to repository root (e.g., "src/lib/input-sanitization.ts")
   */
  sourceFile: string;

  /**
   * Optional line number range in the source file
   * Format: "57-106" or "104" for single line
   */
  lineNumbers?: string;

  /**
   * Additional context specific to the violation type
   * Examples:
   * - For rate_limit: { currentCount: 10, limit: 10, retryAfter: 42 }
   * - For length_validation: { inputLength: 2547, maxLength: 2000, overage: 547 }
   */
  context?: Record<string, unknown>;
}

/**
 * Enhanced error response when a guardrail is triggered
 *
 * This response maintains backward compatibility by including the error field,
 * while adding detailed guardrail information for educational feedback.
 */
export interface GuardrailViolation {
  /**
   * User-friendly error message (backward compatible)
   * This is the message shown if the client doesn't support enhanced feedback
   */
  error: string;

  /**
   * Detailed information about the triggered guardrail
   * Present when a specific guardrail was triggered (not for generic errors)
   */
  guardrail?: GuardrailDetails;
}

/**
 * Extended validation result that includes guardrail details
 * This extends the existing ValidationResult type with optional guardrail metadata
 */
export interface ValidationResultWithDetails {
  /**
   * Whether the input passed validation
   */
  isValid: boolean;

  /**
   * Sanitized input (if validation passed)
   */
  sanitizedInput?: string;

  /**
   * Simple reason string (backward compatible)
   */
  reason?: string;

  /**
   * Severity level (backward compatible)
   */
  severity?: GuardrailSeverity;

  /**
   * Detailed guardrail information (new)
   */
  guardrailDetails?: GuardrailDetails;
}
