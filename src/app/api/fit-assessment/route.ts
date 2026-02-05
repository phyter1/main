import { generateObject } from "ai";
import { z } from "zod";
import { formatResumeAsLLMContext, resume } from "@/data/resume";
import { AI_RATE_LIMITS, createOpenAIClient } from "@/lib/ai-config";
import {
  logSecurityEvent,
  validateJobDescription,
} from "@/lib/input-sanitization";
import { getActiveVersion } from "@/lib/prompt-versioning";
import type { GuardrailViolation } from "@/types/guardrails";



 catch (error) {
    // Log error but don't fail - fall back to default prompt
    console.warn("Failed to load active prompt version, using default:", error);
    return REMOVED_FROM_HISTORY;
  }
}

/**
 * POST /api/fit-assessment
 *
 * Assesses job fit based on resume data and job description
 *
 * @param request - Request with jobDescription in body
 * @returns JSON response with fitLevel, reasoning, and recommendations
 */
export async function POST(request: Request) {
  try {
    // Rate limiting check
    const clientIP = getClientIP(request);
    const withinLimit = checkRateLimit(clientIP);

    if (!withinLimit) {
      const record = rateLimitStore.get(clientIP);
      const retryAfter = record
        ? Math.ceil((record.resetAt - Date.now()) / 1000)
        : 60;

      const response: GuardrailViolation = {
        error: "Rate limit exceeded. Please try again later.",
        guardrail: {
          type: "rate_limit",
          severity: "medium",
          category: "IP-Based Rate Limiting",
          explanation:
            "Rate limiting prevents abuse and ensures fair access for all visitors. This is a standard production security practice.",
          detected: `You have made ${record?.count || AI_RATE_LIMITS.MAX_REQUESTS_PER_MINUTE} requests in the last minute. The limit is ${AI_RATE_LIMITS.MAX_REQUESTS_PER_MINUTE} requests per minute.`,
          implementation: `Each IP address is limited to ${AI_RATE_LIMITS.MAX_REQUESTS_PER_MINUTE} requests per minute using a sliding window algorithm with automatic cleanup.`,
          sourceFile: "src/app/api/fit-assessment/route.ts",
          lineNumbers: "20-44",
          context: {
            currentCount:
              record?.count || AI_RATE_LIMITS.MAX_REQUESTS_PER_MINUTE,
            limit: AI_RATE_LIMITS.MAX_REQUESTS_PER_MINUTE,
            retryAfter,
          },
        },
      };

      return Response.json(response, { status: 429 });
    }

    // Parse and validate request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return Response.json(
        { error: "Invalid JSON in request body" },
        { status: 400 },
      );
    }

    const validation = RequestSchema.safeParse(body);
    if (!validation.success) {
      const errorMessage = validation.error.issues
        .map((issue) => issue.message)
        .join(", ");
      return Response.json({ error: errorMessage }, { status: 400 });
    }

    const { jobDescription } = validation.data;

    // Validate and sanitize job description for security
    const sanitizationResult = validateJobDescription(jobDescription);

    if (!sanitizationResult.isValid) {
      // Log security event
      logSecurityEvent({
        type:
          sanitizationResult.severity === "high"
            ? "prompt_injection"
            : "validation_failure",
        severity: sanitizationResult.severity || "medium",
      });

      // Build enhanced error response
      const response: GuardrailViolation = {
        error: sanitizationResult.reason || "Invalid job description",
        guardrail: sanitizationResult.guardrailDetails,
      };

      return Response.json(response, { status: 400 });
    }

    // Use sanitized input
    const sanitizedJobDescription =
      sanitizationResult.sanitizedInput || jobDescription;

    // Format resume as LLM context
    const resumeContext = formatResumeAsLLMContext(resume);

    // Create AI client (locked to gpt-4.1-nano for maximum cost efficiency)
    const model = createOpenAIClient();

    // Load system prompt from versioning system with fallback to default
    const systemPrompt = `${await loadFitAssessmentPrompt()}

RYAN'S BACKGROUND:
${resumeContext}`;

    const userPrompt = `Please assess Ryan's fit for the following job opportunity. Be honest and specific.

JOB DESCRIPTION:
${sanitizedJobDescription}

Provide a structured assessment with:
1. Overall fit level (strong/moderate/weak)
2. Specific reasoning based on Ryan's actual experience - Write in FIRST PERSON from Ryan's perspective using "I", "my", "I have". Examples: "I have 7 years of TypeScript experience", "My background in cloud infrastructure..."
3. Actionable recommendations - Write these as Ryan speaking DIRECTLY to the hiring manager in FIRST PERSON, suggesting what they should ask about or discuss. Examples: "Ask me about my AI-assisted development workflow", "I can provide specific examples of my architecture work", "Let's discuss how my experience translates to your team's needs".`;

    // Generate structured assessment using AI SDK
    const result = await generateObject({
      model,
      schema: AssessmentSchema,
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.7,
    });

    // Return structured response
    return Response.json(result.object, { status: 200 });
  } catch (error) {
    console.error("Error processing fit assessment:", error);

    // Return generic error to client (don't expose internal details)
    return Response.json(
      {
        error: "Failed to process fit assessment. Please try again later.",
      },
      { status: 500 },
    );
  }
}
