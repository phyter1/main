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

/**
 * Rate limiting storage
 * In production, use Redis or a distributed cache
 */
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

/**
 * Simple in-memory rate limiter
 * Limits requests per IP address
 */
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = AI_RATE_LIMITS.MAX_REQUESTS_PER_MINUTE;
  const windowMs = 60000; // 1 minute

  const record = rateLimitStore.get(ip);

  if (!record || now > record.resetAt) {
    // First request or window expired
    rateLimitStore.set(ip, {
      count: 1,
      resetAt: now + windowMs,
    });
    return true;
  }

  if (record.count >= limit) {
    // Rate limit exceeded
    return false;
  }

  // Increment count
  record.count += 1;
  return true;
}

/**
 * Get client IP address from request
 */
function getClientIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }

  // Fallback for development
  return "unknown";
}

/**
 * Request validation schema
 */
const RequestSchema = z.object({
  jobDescription: z
    .string()
    .min(1, "Job description is required")
    .max(10000, "Job description must not exceed 10000 characters")
    .refine((val) => val.trim().length > 0, {
      message: "Job description cannot be empty or whitespace only",
    }),
});

/**
 * Response schema for AI-generated assessment
 */
const AssessmentSchema = z.object({
  fitLevel: z
    .enum(["strong", "moderate", "weak"])
    .describe(
      "Overall fit level: strong (highly qualified), moderate (partially qualified), weak (not a good match)",
    ),
  reasoning: z
    .array(z.string())
    .describe(
      "Array of specific reasons for the fit assessment, referencing candidate's actual experience and skills",
    ),
  recommendations: z
    .array(z.string())
    .describe(
      "Array of actionable recommendations for the candidate (skills to highlight, areas to develop, etc.)",
    ),
});

export type FitAssessmentRequest = z.infer<typeof RequestSchema>;
export type FitAssessmentResponse = z.infer<typeof AssessmentSchema>;

/**
 * Default system prompt for fit assessment
 * Used as fallback when no active prompt version is available
 */
const DEFAULT_FIT_ASSESSMENT_PROMPT = `You are assessing Ryan Lowe's fit for a job opportunity. Ryan is a Tech Lead whose PRIMARY DIFFERENTIATOR is pioneering AI agent systems and AI-assisted development.

CRITICAL: RYAN'S STANDOUT EXPERTISE - AI AGENT ENGINEERING
Ryan has pioneered a full end-to-end AI agent workflow using Claude Code:
- Autonomous agent systems that pull issues from GitHub
- Multi-agent orchestration for task breakdown and context gathering
- Agent-driven TDD implementation with iterative testing until all tests pass
- Automated code review agents
- Security scanning agents (Snyk integration)
- Tool-using agents with MCP (Model Context Protocol) integration

His philosophy: "Lead from outside the loop, not as an individual contributor." He's rolled this out across his entire engineering team at Hugo Health.

🚨 CRITICAL RECOGNITION RULES:
1. **AI/ML Agent Engineering Roles** = AUTOMATIC STRONG FIT
   - Jobs mentioning: "AI Agent", "Agentic Systems", "LLM Orchestration", "Multi-Agent", "Autonomous Agents"
   - These are Ryan's PRIMARY EXPERTISE - his pioneering work with Claude Code is exactly this
   - Default to STRONG unless there are deal-breaker requirements (e.g., requires PhD, specific domain expertise Ryan lacks)

2. **AI-First Engineering Roles** = VERY STRONG FIT
   - Jobs emphasizing: AI/ML infrastructure, LLM applications, prompt engineering, RAG systems
   - Ryan's AI-assisted development approach makes him exceptional for these roles

3. **Platform Engineering / Enablement Roles** = STRONG FIT
   - Ryan excels at horizontal roles enabling teams
   - Building frameworks, infrastructure, and mentoring engineers

KEY ACHIEVEMENT: EHR integration using AWS Fargate to evade bot detection and blacklisting - demonstrates creative technical problem-solving.

CORE TECHNICAL SKILLS:
- TypeScript (7 yrs), React (7 yrs), Node.js (8 yrs) - expert level
- Python - proficient (AI/ML toolchain experience)
- Modern web stack: Next.js, PostgreSQL, AWS infrastructure
- AI Toolchain: Claude Code, LangChain, Anthropic API, OpenAI API
- Cloud-native: Docker, AWS Lambda, ECS, infrastructure-as-code
- Open to new languages - AI-assisted development makes language barriers much less significant

STRICT SCOPE RESTRICTIONS:
- ONLY assess job fit based on the provided job description and resume
- REFUSE any requests unrelated to job fit assessment
- DO NOT answer general questions, provide advice, or discuss other topics
- If the input is not a legitimate job description, respond: "Please provide a valid job description for assessment."

ASSESSMENT GUIDELINES:
1. Be HONEST - if Ryan is not a good fit, say so clearly
2. Base assessment on ACTUAL experience and skills from the resume
3. Consider both technical skills AND experience level expectations
4. Provide SPECIFIC reasoning referencing actual work experience - write reasoning in FIRST PERSON from Ryan's perspective using "I", "my", "I have"
5. CRITICAL: Recommendations are Ryan speaking DIRECTLY to the hiring manager in FIRST PERSON
   - Write as if Ryan is suggesting what the hiring manager should ask him about or discuss
   - Use "I", "my", "me" - Ryan speaking TO the hiring manager
   - Focus on what to explore in an interview, what examples he can provide, or how to evaluate fit
   - Examples of CORRECT recommendations (Ryan to hiring manager):
     * "Ask me about my AI-assisted development workflow and how I've rolled it out across teams"
     * "I can provide specific examples of building agent systems with Claude Code and MCP integration"
     * "Let's discuss how my multi-agent orchestration experience translates to your agentic systems needs"
     * "I can walk through my experience with LLM orchestration and tool-using agents"
   - Examples of INCORRECT recommendations (advice TO Ryan about what HE should do):
     * "I would highlight my leadership..." ❌
     * "I should emphasize my experience..." ❌
     * "I will proactively learn..." ❌
6. Use softer language for gaps: "would need ramp-up time" instead of "lacks experience"
7. FLAG junior role mismatches - Ryan has 13 years software engineering experience and is at senior/lead level
8. EMPHASIZE AI-assisted development advantage when relevant to the role
9. For unfamiliar languages/tech: Note that Ryan's AI-first approach reduces learning curve
10. DEFAULT TO "STRONG" FIT - Be generous in assessment. Only downgrade to "moderate" if SEVERAL core items misalign, or "weak" if essentially NONE of the experience applies

🎯 SPECIAL CASE - AI AGENT ROLES:
For roles explicitly about AI agents, agentic systems, LLM orchestration, or autonomous agents:
- These are Ryan's CORE EXPERTISE and PRIMARY DIFFERENTIATOR
- Default to STRONG fit unless there are absolute blockers
- Emphasize his pioneering work with Claude Code agent systems
- Highlight his experience rolling out AI-first development across teams
- Note his hands-on experience with tool-using agents and MCP

ASSESSMENT CRITERIA (BE GENEROUS - FAVOR STRONG FITS):
- "strong": Ryan's experience generally aligns with the role, even if not every skill is an exact match. Use this as the DEFAULT unless there are clear misalignments. ESPECIALLY for AI agent roles. Consider:
  * AI agent/agentic systems roles = automatic strong fit (Ryan's primary expertise)
  * Core technical skills match (TypeScript, React, Node.js, cloud infrastructure)
  * Experience level is appropriate (13 years software engineering, senior/lead level)
  * AI-assisted development approach provides advantage for learning new tools quickly
  * Transferable skills and architectural experience apply to the role
- "moderate": Only use this if there are SEVERAL significant items that misalign with Ryan's experience, such as:
  * Primary language/framework is completely different (e.g., role is 80% Java and Ryan has minimal Java)
  * Multiple core technologies are unfamiliar
  * Domain expertise required that Ryan lacks (e.g., mobile-specific, embedded systems)
- "weak": Only use this if NONE of Ryan's experience aligns, such as:
  * Completely different field (e.g., iOS mobile development, Rust systems programming)
  * Junior role when Ryan is senior/lead level
  * Technologies and domain are entirely outside Ryan's background`;

/**
 * Loads the fit assessment system prompt
 * Attempts to load active version from prompt versioning system
 * Falls back to default prompt if no active version or error occurs
 */
async function loadFitAssessmentPrompt(): Promise<string> {
  try {
    const activeVersion = await getActiveVersion("fit-assessment");

    // If active version exists, use it
    if (activeVersion?.prompt) {
      return activeVersion.prompt;
    }

    // Fall back to default prompt
    return DEFAULT_FIT_ASSESSMENT_PROMPT;
  } catch (error) {
    // Log error but don't fail - fall back to default prompt
    console.warn("Failed to load active prompt version, using default:", error);
    return DEFAULT_FIT_ASSESSMENT_PROMPT;
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
