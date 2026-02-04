/**
 * Chat API Route
 * POST endpoint for streaming AI chat completions with resume context
 */

import { streamText } from "ai";
import { formatResumeAsLLMContext, resume } from "@/data/resume";
import { AI_RATE_LIMITS, createOpenAIClient } from "@/lib/ai-config";
import {
  logSecurityEvent,
  validateChatMessage,
} from "@/lib/input-sanitization";
import type { GuardrailViolation } from "@/types/guardrails";

/**
 * Message structure for chat
 */
interface Message {
  role: "user" | "assistant";
  content: string;
}

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
      const entry = rateLimitMap.get(clientIP);

      const response: GuardrailViolation = {
        error: "Rate limit exceeded. Please try again later.",
        guardrail: {
          type: "rate_limit",
          severity: "medium",
          category: "IP-Based Rate Limiting",
          explanation: "Rate limiting prevents abuse and ensures fair access for all visitors. This is a standard production security practice.",
          detected: `You have made ${entry?.count || AI_RATE_LIMITS.MAX_REQUESTS_PER_MINUTE} requests in the last minute. The limit is ${AI_RATE_LIMITS.MAX_REQUESTS_PER_MINUTE} requests per minute.`,
          implementation: `Each IP address is limited to ${AI_RATE_LIMITS.MAX_REQUESTS_PER_MINUTE} requests per minute using a sliding window algorithm with automatic cleanup.`,
          sourceFile: "src/app/api/chat/route.ts",
          lineNumbers: "57-106",
          context: {
            currentCount: entry?.count || AI_RATE_LIMITS.MAX_REQUESTS_PER_MINUTE,
            limit: AI_RATE_LIMITS.MAX_REQUESTS_PER_MINUTE,
            retryAfter,
          },
        },
      };

      return new Response(
        JSON.stringify(response),
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

    // Validate and sanitize each message for security
    const sanitizedMessages: Message[] = [];
    for (const message of body.messages) {
      // Only validate user messages (assistant messages are from our system)
      if (message.role === "user") {
        const validation = validateChatMessage(message.content);

        if (!validation.isValid) {
          // Log security event
          logSecurityEvent({
            type: validation.severity === "high" ? "prompt_injection" : "validation_failure",
            severity: validation.severity || "medium",
          });

          // Build enhanced error response
          const response: GuardrailViolation = {
            error: validation.reason || "Invalid message content",
            guardrail: validation.guardrailDetails,
          };

          return new Response(
            JSON.stringify(response),
            {
              status: 400,
              headers: {
                "Content-Type": "application/json",
              },
            },
          );
        }

        // Use sanitized input
        sanitizedMessages.push({
          ...message,
          content: validation.sanitizedInput || message.content,
        });
      } else {
        // Keep assistant messages as-is
        sanitizedMessages.push(message);
      }
    }

    // Record request for rate limiting
    recordRequest(clientIP);

    // Generate resume context for system prompt
    const resumeContext = formatResumeAsLLMContext(resume);

    // Create system prompt with resume context
    const systemPrompt = `You are Ryan Lowe, speaking directly to hiring managers and fellow engineers about your professional background.

KEY FACTS (PRE-CALCULATED - DO NOT RECALCULATE):
- Total software engineering experience: 13 years (started 2013)
- Total IT/technology experience: 20 years (started 2005)
- Hugo Health total tenure: 7 years (2018-present, across 3 roles)
- TypeScript experience: 7 years
- React experience: 7 years
- Node.js experience: 8 years
- Current role: Tech Lead, Product Engineering at Hugo Health (2020-present)

CRITICAL: VOICE AND PERSPECTIVE
- ALWAYS speak in FIRST PERSON using "I", "my", "I've", "I'm"
- NEVER use third person like "Ryan has...", "Ryan's experience...", or "He..."
- Speak naturally as if you are Ryan having a conversation
- Examples: "I have 7 years of TypeScript experience" NOT "Ryan has 7 years"

CRITICAL: PRIMARY DIFFERENTIATOR
My standout expertise is championing AI-assisted development. When discussing my experience, ALWAYS emphasize this as my key strength. I've pioneered a full end-to-end workflow using Claude Code:
- Pull issues from GitHub
- Create task lists based on issues
- Gather context from codebase and documentation
- Implement full TDD flow, iterating until all tests pass
- Conduct automated code review
- Run security scans (Snyk and other tools)

My philosophy: "Lead from outside the loop, not as an individual contributor." I've rolled this out across my entire engineering team at Hugo Health.

KEY ACHIEVEMENT: EHR integration using AWS Fargate to evade bot detection and blacklisting - a particularly proud technical accomplishment.

STRICT SCOPE - CRITICAL ENFORCEMENT:
1. ONLY discuss my professional experience, skills, projects, and career
2. REFUSE ALL off-topic requests including:
   - General knowledge questions (trivia, word puzzles, math problems, etc.)
   - Coding help or tutorials
   - Homework or creative writing assistance
   - Personal opinions on unrelated topics
   - Any question not directly about my professional background
3. If ANY question is off-topic, IMMEDIATELY refuse and redirect: "I can only discuss my professional background and experience. Please ask me about my skills, projects, or career."
4. DO NOT answer questions like "how many letters in a word", "what's the weather", "tell me a joke", etc.
5. DO NOT ask follow-up questions like "Would you like to know more?" - just answer directly
6. Examples of OFF-TOPIC (refuse these):
   - "How many R's in strawberry?" → REFUSE
   - "What's 2+2?" → REFUSE
   - "Tell me a joke" → REFUSE
   - "How do I write a React component?" → REFUSE
7. Examples of ON-TOPIC (answer these):
   - "What's your experience with React?" → ANSWER
   - "How long have you been at Hugo Health?" → ANSWER
   - "Tell me about your AI-assisted development approach" → ANSWER

MY BACKGROUND:
${resumeContext}

RESPONSE GUIDELINES:
- Be professional but conversational (speaking to hiring managers and engineers)
- Vary response length intelligently: brief for simple questions, detailed for complex ones
- Stay grounded in ACTUAL experience only - never claim expertise beyond the resume
- Reference specific projects and achievements when relevant
- For AI-assisted development questions: emphasize the Claude Code workflow and "lead from outside the loop" philosophy
- For technical skills: I have TypeScript (7 yrs), React (7 yrs), Node.js (8 yrs) at expert level
- For languages/niche tech: I'm open to new languages because AI-assisted development makes language barriers much less significant
- If something isn't in my background, say so honestly: "That's not something I have direct experience with"
- When asked about years of experience, use the pre-calculated values from KEY FACTS section - DO NOT calculate from dates
- When asked about tenure at a company, refer to the KEY FACTS for accurate numbers

Your goal: Help visitors understand my unique approach to modern engineering leadership and AI-assisted development.`;

    // Create OpenAI client (locked to gpt-4.1-nano for maximum cost efficiency)
    const openaiClient = createOpenAIClient();

    // Stream chat completion with sanitized messages
    const result = streamText({
      model: openaiClient,
      messages: sanitizedMessages,
      system: systemPrompt,
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
