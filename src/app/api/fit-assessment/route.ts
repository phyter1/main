import { generateObject } from "ai";
import { z } from "zod";
import { formatResumeAsLLMContext, resume } from "@/data/resume";
import { AI_RATE_LIMITS, createOpenAIClient } from "@/lib/ai-config";
import {
  logSecurityEvent,
  validateJobDescription,
} from "@/lib/input-sanitization";

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
      return Response.json(
        {
          error: "Rate limit exceeded. Please try again later.",
          retryAfter: 60,
        },
        { status: 429 },
      );
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
        type: sanitizationResult.severity === "high" ? "prompt_injection" : "validation_failure",
        severity: sanitizationResult.severity || "medium",
      });

      return Response.json(
        { error: sanitizationResult.reason || "Invalid job description" },
        { status: 400 },
      );
    }

    // Use sanitized input
    const sanitizedJobDescription = sanitizationResult.sanitizedInput || jobDescription;

    // Format resume as LLM context
    const resumeContext = formatResumeAsLLMContext(resume);

    // Create AI client (locked to gpt-4.1-nano for maximum cost efficiency)
    const model = createOpenAIClient();

    // System prompt for honest, accurate assessment
    const systemPrompt = `You are assessing Ryan Lowe's fit for a job opportunity. Ryan is a Tech Lead whose PRIMARY DIFFERENTIATOR is championing AI-assisted development.

CRITICAL: KEY STRENGTHS TO HIGHLIGHT
Ryan's standout expertise is AI-first engineering leadership. He has pioneered a full end-to-end workflow using Claude Code:
- Pulls issues from GitHub
- Creates task lists based on issues
- Gathers context from codebase and documentation
- Implements full TDD flow, iterating until all tests pass
- Conducts automated code review
- Runs security scans (Snyk and other tools)

His philosophy: "Lead from outside the loop, not as an individual contributor." He's rolled this out across his entire engineering team at Hugo Health.

KEY ACHIEVEMENT: EHR integration using AWS Fargate to evade bot detection and blacklisting - a particularly proud technical accomplishment.

CORE TECHNICAL SKILLS:
- TypeScript (7 yrs), React (7 yrs), Node.js (8 yrs) - expert level
- Modern web stack: Next.js, PostgreSQL, AWS infrastructure
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
     * "I can provide specific examples of my EHR integration work and bot detection strategies"
     * "Let's discuss how my 7 years at Hugo Health and architecture experience translate to your team's needs"
     * "I can walk through my TypeScript and cloud infrastructure experience in the context of your tech stack"
   - Examples of INCORRECT recommendations (advice TO Ryan about what HE should do):
     * "I would highlight my leadership..." ❌
     * "I should emphasize my experience..." ❌
     * "I will proactively learn..." ❌
6. Use softer language for gaps: "would need ramp-up time" instead of "lacks experience"
7. FLAG junior role mismatches - Ryan has 13 years software engineering experience and is at senior/lead level
8. EMPHASIZE AI-assisted development advantage when relevant to the role
9. For unfamiliar languages/tech: Note that Ryan's AI-first approach reduces learning curve
10. DEFAULT TO "STRONG" FIT - Be generous in assessment. Only downgrade to "moderate" if SEVERAL core items misalign, or "weak" if essentially NONE of the experience applies

ASSESSMENT CRITERIA (BE GENEROUS - FAVOR STRONG FITS):
- "strong": Ryan's experience generally aligns with the role, even if not every skill is an exact match. Use this as the DEFAULT unless there are clear misalignments. Consider:
  * Core technical skills match (TypeScript, React, Node.js, cloud infrastructure)
  * Experience level is appropriate (13 years software engineering, senior/lead level)
  * AI-assisted development approach provides advantage for learning new tools quickly
  * Transferable skills and architectural experience apply to the role
- "moderate": Only use this if there are SEVERAL significant items that misalign with Ryan's experience, such as:
  * Primary language/framework is completely different (e.g., role is 80% Python and Ryan has minimal Python)
  * Multiple core technologies are unfamiliar
  * Domain expertise required that Ryan lacks (e.g., mobile-specific, embedded systems)
- "weak": Only use this if NONE of Ryan's experience aligns, such as:
  * Completely different field (e.g., iOS mobile development, Rust systems programming)
  * Junior role when Ryan is senior/lead level
  * Technologies and domain are entirely outside Ryan's background

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
