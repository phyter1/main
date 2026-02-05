/**
 * Input Sanitization and Security Validation
 *
 * Comprehensive input validation to protect against:
 * - Prompt injection attacks
 * - XSS attempts
 * - Excessive token usage
 * - System prompt extraction
 * - Role confusion attacks
 * - Jailbreak attempts
 */

import type {
  GuardrailDetails,
  ValidationResultWithDetails,
} from "@/types/guardrails";

/**
 * Validation result with detailed feedback
 * @deprecated Use ValidationResultWithDetails for new code
 */
export interface ValidationResult {
  isValid: boolean;
  sanitizedInput?: string;
  reason?: string;
  severity?: "low" | "medium" | "high";
  guardrailDetails?: GuardrailDetails;
}

// Type alias for backward compatibility
export type { ValidationResultWithDetails };

/**
 * Common prompt injection patterns to detect and block
 */
const PROMPT_INJECTION_PATTERNS = [
  // Direct instruction overrides
  /ignore\s+(all\s+)?(previous|prior|above)\s+instructions/i,
  /disregard\s+(all\s+)?(previous|prior|above)\s+instructions/i,
  /forget\s+(all\s+)?(previous|prior|above)\s+instructions/i,

  // System prompt extraction attempts
  /show\s+(me\s+)?(your|the)\s+system\s+prompt/i,
  /what\s+(is|are)\s+your\s+(instructions|rules|guidelines)/i,
  /print\s+(your|the)\s+system\s+prompt/i,
  /repeat\s+(your|the)\s+system\s+prompt/i,
  /output\s+(your|the)\s+(instructions|system\s+prompt)/i,

  // Role switching attempts
  /you\s+are\s+now/i,
  /act\s+as\s+(a\s+)?(python|javascript|coding|writing|math|science|creative)/i,
  /pretend\s+(you\s+are|to\s+be)/i,
  /simulate\s+(being|a)/i,
  /roleplay\s+as/i,

  // Jailbreak attempts
  /for\s+educational\s+purposes/i,
  /in\s+a\s+hypothetical\s+scenario/i,
  /let's\s+imagine/i,
  /what\s+if\s+you\s+(were|could)/i,

  // Developer mode / DAN attacks
  /developer\s+mode/i,
  /DAN\s+mode/i,
  /jailbreak/i,
  /override\s+(your\s+)?(programming|instructions|restrictions|guidelines)/i,

  // Instruction delimiter confusion
  /\[SYSTEM\]/i,
  /\[INST\]/i,
  /\[\/INST\]/i,
  /<\|system\|>/i,
  /<\|user\|>/i,
  /<\|assistant\|>/i,

  // Encoding/obfuscation attempts
  /base64/i,
  /rot13/i,
  /\\x[0-9a-f]{2}/i, // Hex encoding
  /\\u[0-9a-f]{4}/i, // Unicode encoding
];

/**
 * Suspicious patterns that might indicate malicious intent
 */
const SUSPICIOUS_PATTERNS = [
  // Script injection
  /<script[^>]*>.*?<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi, // Event handlers (onclick, onerror, etc.)

  // Command injection
  /;\s*rm\s+-rf/i,
  /;\s*curl\s+/i,
  /;\s*wget\s+/i,
  /\|\s*bash/i,

  // SQL injection patterns (shouldn't apply but shows thoroughness)
  /('\s*OR\s+'?1'?\s*=\s*'?1)/i,
  /('\s*;\s*DROP\s+TABLE)/i,
  /UNION\s+SELECT/i,

  // Path traversal
  /\.\.\//g,
  /\.\.\\/g,

  // Excessive repetition (token stuffing)
  /(.{10,})\1{5,}/,
];

/**
 * Maximum allowed lengths for different input types
 */
export const INPUT_LIMITS = {
  CHAT_MESSAGE: 2000,
  JOB_DESCRIPTION: 10000,
  MAX_LINES: 500,
};

/**
 * Sanitize HTML and remove potentially dangerous content
 */
function sanitizeHtml(input: string): string {
  return input
    .replace(/<script[^>]*>.*?<\/script>/gi, "")
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, "")
    .replace(/<object[^>]*>.*?<\/object>/gi, "")
    .replace(/<embed[^>]*>/gi, "")
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/javascript:/gi, "");
}

/**
 * Determine specific category based on matched pattern
 */
function categorizePromptInjection(pattern: RegExp): string {
  const patternStr = pattern.source.toLowerCase();

  if (
    patternStr.includes("ignore") ||
    patternStr.includes("disregard") ||
    patternStr.includes("forget")
  ) {
    return "System Instruction Override";
  }
  if (
    patternStr.includes("system") ||
    patternStr.includes("instructions") ||
    patternStr.includes("prompt")
  ) {
    return "System Prompt Extraction";
  }
  if (
    patternStr.includes("act") ||
    patternStr.includes("pretend") ||
    patternStr.includes("roleplay")
  ) {
    return "Role Confusion";
  }
  if (
    patternStr.includes("developer") ||
    patternStr.includes("dan") ||
    patternStr.includes("jailbreak")
  ) {
    return "Jailbreak Attempt";
  }
  if (patternStr.includes("system|") || patternStr.includes("inst|")) {
    return "Instruction Delimiter Confusion";
  }
  if (
    patternStr.includes("base64") ||
    patternStr.includes("rot13") ||
    patternStr.includes("\\x") ||
    patternStr.includes("\\u")
  ) {
    return "Encoding/Obfuscation";
  }

  return "Prompt Injection";
}

/**
 * Check for prompt injection patterns
 */
function checkPromptInjection(input: string): ValidationResult {
  const lowerInput = input.toLowerCase();

  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    if (pattern.test(input)) {
      const category = categorizePromptInjection(pattern);

      return {
        isValid: false,
        reason:
          "Input contains patterns that attempt to override system instructions",
        severity: "high",
        guardrailDetails: {
          type: "prompt_injection",
          severity: "high",
          category,
          explanation:
            "Your input contained patterns that attempt to override the AI's instructions. This portfolio demonstrates production-grade AI security by detecting and blocking these attempts.",
          detected: `Patterns attempting to change the AI's behavior or extract system prompts. These are common attack vectors in AI applications.`,
          implementation:
            "Input validation using pattern matching against 30+ known prompt injection techniques, including role confusion, instruction overrides, and jailbreak attempts.",
          sourceFile: "src/lib/input-sanitization.ts",
          lineNumbers: "26-71",
        },
      };
    }
  }

  // Check for excessive special characters (potential obfuscation)
  const specialCharCount = (input.match(/[^a-zA-Z0-9\s.,!?;:()\-'"]/g) || [])
    .length;
  const specialCharRatio = specialCharCount / input.length;

  if (specialCharRatio > 0.3) {
    return {
      isValid: false,
      reason: "Input contains excessive special characters",
      severity: "medium",
      guardrailDetails: {
        type: "prompt_injection",
        severity: "medium",
        category: "Obfuscation Detection",
        explanation:
          "Your input contains an unusually high ratio of special characters, which can indicate an attempt to obfuscate malicious content or bypass security filters.",
        detected: `${Math.round(specialCharRatio * 100)}% special character ratio detected (threshold: 30%). This is often used in encoding attacks.`,
        implementation:
          "Statistical analysis of character distribution to detect potential obfuscation attempts.",
        sourceFile: "src/lib/input-sanitization.ts",
        lineNumbers: "140-149",
      },
    };
  }

  return { isValid: true };
}

/**
 * Categorize suspicious pattern type
 */
function categorizeSuspiciousPattern(pattern: RegExp): string {
  const patternStr = pattern.source.toLowerCase();

  if (
    patternStr.includes("script") ||
    patternStr.includes("javascript") ||
    patternStr.includes("on\\w")
  ) {
    return "XSS/Script Injection";
  }
  if (
    patternStr.includes("rm") ||
    patternStr.includes("curl") ||
    patternStr.includes("wget") ||
    patternStr.includes("bash")
  ) {
    return "Command Injection";
  }
  if (
    patternStr.includes("or") ||
    patternStr.includes("drop") ||
    patternStr.includes("union")
  ) {
    return "SQL Injection";
  }
  if (patternStr.includes("\\.\\.")) {
    return "Path Traversal";
  }
  if (patternStr.includes("\\1{")) {
    return "Token Stuffing";
  }

  return "Malicious Pattern";
}

/**
 * Check for suspicious patterns
 */
function checkSuspiciousPatterns(input: string): ValidationResult {
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(input)) {
      const category = categorizeSuspiciousPattern(pattern);

      return {
        isValid: false,
        reason: "Input contains suspicious or potentially malicious patterns",
        severity: "high",
        guardrailDetails: {
          type: "suspicious_pattern",
          severity: "high",
          category,
          explanation: `Your input contained patterns commonly used in ${category.toLowerCase()} attacks. This demonstrates defense-in-depth security practices.`,
          detected: `HTML script tags, JavaScript execution attempts, or other malicious code patterns. While this is a chat interface (not vulnerable to traditional XSS), the validation demonstrates comprehensive security thinking.`,
          implementation:
            "Pattern matching against known malicious signatures including XSS, command injection, SQL injection, and path traversal.",
          sourceFile: "src/lib/input-sanitization.ts",
          lineNumbers: "76-99",
        },
      };
    }
  }

  return { isValid: true };
}

/**
 * Validate and sanitize chat message input
 */
export function validateChatMessage(message: string): ValidationResult {
  // Check empty/whitespace
  const trimmed = message.trim();
  if (!trimmed) {
    return {
      isValid: false,
      reason: "Message cannot be empty",
      severity: "low",
    };
  }

  // Check length
  if (trimmed.length > INPUT_LIMITS.CHAT_MESSAGE) {
    const overage = trimmed.length - INPUT_LIMITS.CHAT_MESSAGE;
    const overagePercent = Math.round(
      (overage / INPUT_LIMITS.CHAT_MESSAGE) * 100,
    );

    return {
      isValid: false,
      reason: `Message exceeds maximum length of ${INPUT_LIMITS.CHAT_MESSAGE} characters`,
      severity: "low",
      guardrailDetails: {
        type: "length_validation",
        severity: "low",
        category: "Maximum Length Enforcement",
        explanation:
          "Length limits prevent token stuffing attacks and excessive API costs while ensuring responsive performance.",
        detected: `Your input is ${trimmed.length} characters, which is ${overage} characters (${overagePercent}% over the limit).`,
        implementation: `Input is validated before processing using configurable limits defined in INPUT_LIMITS constants.`,
        sourceFile: "src/lib/input-sanitization.ts",
        lineNumbers: "104-108",
        context: {
          inputLength: trimmed.length,
          maxLength: INPUT_LIMITS.CHAT_MESSAGE,
          overage,
          overagePercent,
        },
      },
    };
  }

  // Check for prompt injection
  const injectionCheck = checkPromptInjection(trimmed);
  if (!injectionCheck.isValid) {
    return injectionCheck;
  }

  // Check for suspicious patterns
  const suspiciousCheck = checkSuspiciousPatterns(trimmed);
  if (!suspiciousCheck.isValid) {
    return suspiciousCheck;
  }

  // Check line count (prevent excessive newlines)
  const lineCount = (trimmed.match(/\n/g) || []).length + 1;
  if (lineCount > INPUT_LIMITS.MAX_LINES) {
    return {
      isValid: false,
      reason: "Message contains too many line breaks",
      severity: "medium",
      guardrailDetails: {
        type: "length_validation",
        severity: "medium",
        category: "Excessive Line Breaks",
        explanation:
          "Line count limits prevent token stuffing via newlines and ensure readable formatting.",
        detected: `Your input contains ${lineCount} lines (limit: ${INPUT_LIMITS.MAX_LINES}). This can indicate an attempt to inflate token usage or bypass validation.`,
        implementation:
          "Line count validation before processing to prevent excessive newline abuse.",
        sourceFile: "src/lib/input-sanitization.ts",
        lineNumbers: "207-214",
        context: {
          lineCount,
          maxLines: INPUT_LIMITS.MAX_LINES,
        },
      },
    };
  }

  // Sanitize HTML
  const sanitized = sanitizeHtml(trimmed);

  return {
    isValid: true,
    sanitizedInput: sanitized,
  };
}

/**
 * Validate and sanitize job description input
 */
export function validateJobDescription(description: string): ValidationResult {
  // Check empty/whitespace
  const trimmed = description.trim();
  if (!trimmed) {
    return {
      isValid: false,
      reason: "Job description cannot be empty",
      severity: "low",
    };
  }

  // Check length
  if (trimmed.length > INPUT_LIMITS.JOB_DESCRIPTION) {
    const overage = trimmed.length - INPUT_LIMITS.JOB_DESCRIPTION;
    const overagePercent = Math.round(
      (overage / INPUT_LIMITS.JOB_DESCRIPTION) * 100,
    );

    return {
      isValid: false,
      reason: `Job description exceeds maximum length of ${INPUT_LIMITS.JOB_DESCRIPTION} characters`,
      severity: "low",
      guardrailDetails: {
        type: "length_validation",
        severity: "low",
        category: "Maximum Length Enforcement",
        explanation:
          "Length limits prevent token stuffing attacks and excessive API costs while ensuring responsive performance.",
        detected: `Your input is ${trimmed.length} characters, which is ${overage} characters (${overagePercent}% over the limit).`,
        implementation:
          "Input is validated before processing using configurable limits defined in INPUT_LIMITS constants.",
        sourceFile: "src/lib/input-sanitization.ts",
        lineNumbers: "104-108",
        context: {
          inputLength: trimmed.length,
          maxLength: INPUT_LIMITS.JOB_DESCRIPTION,
          overage,
          overagePercent,
        },
      },
    };
  }

  // Check for prompt injection
  const injectionCheck = checkPromptInjection(trimmed);
  if (!injectionCheck.isValid) {
    return injectionCheck;
  }

  // Check for suspicious patterns
  const suspiciousCheck = checkSuspiciousPatterns(trimmed);
  if (!suspiciousCheck.isValid) {
    return suspiciousCheck;
  }

  // Validate it looks like a job description
  // Should contain common job description keywords
  const jobDescriptionKeywords = [
    /\b(responsibilities|requirements|qualifications|duties|skills|experience)\b/i,
    /\b(role|position|job|opportunity|career)\b/i,
    /\b(years?|months?|bachelor|master|degree)\b/i,
    /\b(team|company|organization|department)\b/i,
  ];

  const keywordMatches = jobDescriptionKeywords.filter((pattern) =>
    pattern.test(trimmed),
  ).length;

  // If it's very short AND has no job-related keywords, it's suspicious
  // Longer text (>200 chars) gets benefit of the doubt
  if (trimmed.length < 100 && keywordMatches === 0) {
    return {
      isValid: false,
      reason:
        "Input does not appear to be a job description. Please provide a complete job posting with requirements and responsibilities.",
      severity: "medium",
      guardrailDetails: {
        type: "scope_enforcement",
        severity: "medium",
        category: "Content Validation",
        explanation:
          "This tool is specifically designed to analyze job descriptions. Scope enforcement ensures consistent, focused interactions and prevents misuse.",
        detected: `Your input does not contain expected job-related keywords (responsibilities, requirements, qualifications, skills, etc.). This appears to be off-topic content.`,
        implementation:
          "Keyword matching against common job description terminology to ensure appropriate use of the assessment tool.",
        sourceFile: "src/lib/input-sanitization.ts",
        lineNumbers: "262-281",
        context: {
          inputLength: trimmed.length,
          keywordMatches,
          required: "At least one job-related keyword",
        },
      },
    };
  }

  // For medium-length text (100-200 chars) with no keywords, also reject
  if (trimmed.length >= 100 && trimmed.length < 200 && keywordMatches === 0) {
    return {
      isValid: false,
      reason:
        "Input does not appear to be a job description. Please provide a complete job posting with requirements and responsibilities.",
      severity: "medium",
      guardrailDetails: {
        type: "scope_enforcement",
        severity: "medium",
        category: "Content Validation",
        explanation:
          "This tool is specifically designed to analyze job descriptions. Scope enforcement ensures consistent, focused interactions and prevents misuse.",
        detected: `Your input does not contain expected job-related keywords (responsibilities, requirements, qualifications, skills, etc.). This appears to be off-topic content.`,
        implementation:
          "Keyword matching against common job description terminology to ensure appropriate use of the assessment tool.",
        sourceFile: "src/lib/input-sanitization.ts",
        lineNumbers: "262-290",
        context: {
          inputLength: trimmed.length,
          keywordMatches,
          required: "At least one job-related keyword",
        },
      },
    };
  }

  // Check line count
  const lineCount = (trimmed.match(/\n/g) || []).length + 1;
  if (lineCount > INPUT_LIMITS.MAX_LINES) {
    return {
      isValid: false,
      reason: "Job description contains too many line breaks",
      severity: "medium",
      guardrailDetails: {
        type: "length_validation",
        severity: "medium",
        category: "Excessive Line Breaks",
        explanation:
          "Line count limits prevent token stuffing via newlines and ensure readable formatting.",
        detected: `Your input contains ${lineCount} lines (limit: ${INPUT_LIMITS.MAX_LINES}). This can indicate an attempt to inflate token usage or bypass validation.`,
        implementation:
          "Line count validation before processing to prevent excessive newline abuse.",
        sourceFile: "src/lib/input-sanitization.ts",
        lineNumbers: "468-476",
        context: {
          lineCount,
          maxLines: INPUT_LIMITS.MAX_LINES,
        },
      },
    };
  }

  // Sanitize HTML
  const sanitized = sanitizeHtml(trimmed);

  return {
    isValid: true,
    sanitizedInput: sanitized,
  };
}

/**
 * Validate output from AI to ensure it stays on topic
 */
export function validateAIOutput(
  output: string,
  context: "chat" | "assessment",
): boolean {
  const lower = output.toLowerCase();

  // Check for leaked system information
  const leakPatterns = [
    /my system prompt/i,
    /my instructions are/i,
    /i was told to/i,
    /i am programmed to/i,
  ];

  for (const pattern of leakPatterns) {
    if (pattern.test(output)) {
      return false;
    }
  }

  // Context-specific validation
  if (context === "chat") {
    // Chat should mention professional topics
    const professionalKeywords =
      /\b(experience|skill|project|work|technology|development|engineering|leadership|team)\b/i;
    if (output.length > 200 && !professionalKeywords.test(output)) {
      return false;
    }
  }

  return true;
}

/**
 * Log security events (without PII)
 */
export function logSecurityEvent(event: {
  type: "prompt_injection" | "suspicious_pattern" | "validation_failure";
  severity: "low" | "medium" | "high";
  pattern?: string;
  timestamp?: number;
}): void {
  // In production, send to monitoring service
  // For now, log to console with structured format
  console.warn("[SECURITY]", {
    ...event,
    timestamp: event.timestamp || Date.now(),
  });
}
