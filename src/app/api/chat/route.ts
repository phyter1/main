/**
 * Chat API Route
 * POST endpoint for streaming AI chat completions with resume context
 */

import { type Message, streamText } from "ai";
import { formatResumeAsLLMContext, resume } from "@/data/resume";
import { AI_RATE_LIMITS, createAnthropicClient } from "@/lib/ai-config";

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
  if (entry && entry.count >= AI_RATE_LIMITS.MAX_REQUESTS_PER_MINUTE) {
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
 * Validate request body
 */
interface ChatRequestBody {
  messages: Message[];
}

function validateRequestBody(body: unknown): body is ChatRequestBody {
  if (!body || typeof body !== "object") {
    return false;
  }

  const { messages } = body as ChatRequestBody;

  if (!Array.isArray(messages)) {
    return false;
  }

  if (messages.length === 0) {
    return false;
  }

  // Validate message structure
  for (const message of messages) {
    if (!message.role || !message.content) {
      return false;
    }
  }

  return true;
}

/**
 * POST /api/chat
 * Handles chat completion requests with streaming responses
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
      return new Response(
        JSON.stringify({
          error:
            "Invalid request body. Expected { messages: Message[] } with at least one message.",
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

    // Generate resume context for system prompt
    const resumeContext = formatResumeAsLLMContext(resume);

    // Create system prompt with resume context
    const systemPrompt = `You are an AI assistant representing Ryan Lowe's portfolio. You have access to comprehensive information about Ryan's professional background, skills, projects, and engineering principles.

Use the following information to answer questions accurately and helpfully:

${resumeContext}

When answering questions:
- Be professional and conversational
- Reference specific projects, skills, or experiences when relevant
- Highlight Ryan's expertise in TypeScript, React, Node.js, and cloud infrastructure
- Mention his leadership experience and AI-assisted development practices
- If asked about something not in the resume, politely indicate you don't have that information

Your goal is to help visitors understand Ryan's background, skills, and experience in a natural, engaging way.`;

    // Create Anthropic client
    const anthropicClient = createAnthropicClient();

    // Stream chat completion
    const result = streamText({
      model: anthropicClient,
      messages: body.messages,
      system: systemPrompt,
      maxTokens: AI_RATE_LIMITS.MAX_TOKENS_PER_REQUEST,
    });

    // Return streaming response
    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);

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
