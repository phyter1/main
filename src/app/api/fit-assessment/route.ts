import { generateObject } from "ai";
import { z } from "zod";
import { formatResumeAsLLMContext, resume } from "@/data/resume";
import { AI_RATE_LIMITS, createAnthropicClient } from "@/lib/ai-config";

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
  fitLevel: z.enum(["strong", "moderate", "weak"], {
    description:
      "Overall fit level: strong (highly qualified), moderate (partially qualified), weak (not a good match)",
  }),
  reasoning: z.array(z.string(), {
    description:
      "Array of specific reasons for the fit assessment, referencing candidate's actual experience and skills",
  }),
  recommendations: z.array(z.string(), {
    description:
      "Array of actionable recommendations for the candidate (skills to highlight, areas to develop, etc.)",
  }),
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

    // Format resume as LLM context
    const resumeContext = formatResumeAsLLMContext(resume);

    // Create AI client
    const model = createAnthropicClient("CHAT");

    // System prompt for honest, accurate assessment
    const systemPrompt = `You are an expert career counselor and technical recruiter. Your role is to provide honest, accurate assessments of job fit based on a candidate's resume and a job description.

IMPORTANT GUIDELINES:
1. Be HONEST - if the candidate is not a good fit, say so clearly
2. Base your assessment on ACTUAL experience and skills from the resume
3. Consider both technical skills AND experience level/role expectations
4. Provide SPECIFIC reasoning with references to resume details
5. Give ACTIONABLE recommendations

ASSESSMENT CRITERIA:
- "strong": Candidate has most/all required skills with relevant experience
- "moderate": Candidate has some required skills but may need development in key areas
- "weak": Candidate lacks most required skills or experience level doesn't match

CANDIDATE RESUME:
${resumeContext}`;

    const userPrompt = `Please assess this candidate's fit for the following job opportunity. Be honest and specific.

JOB DESCRIPTION:
${jobDescription}

Provide a structured assessment with:
1. Overall fit level (strong/moderate/weak)
2. Specific reasoning based on the candidate's actual experience
3. Actionable recommendations for the candidate`;

    // Generate structured assessment using AI SDK
    const result = await generateObject({
      model,
      schema: AssessmentSchema,
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.7,
      maxTokens: AI_RATE_LIMITS.MAX_TOKENS_PER_REQUEST,
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
