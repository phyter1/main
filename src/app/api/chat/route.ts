



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
          explanation:
            "Rate limiting prevents abuse and ensures fair access for all visitors. This is a standard production security practice.",
          detected: `You have made ${entry?.count || AI_RATE_LIMITS.MAX_REQUESTS_PER_MINUTE} requests in the last minute. The limit is ${AI_RATE_LIMITS.MAX_REQUESTS_PER_MINUTE} requests per minute.`,
          implementation: `Each IP address is limited to ${AI_RATE_LIMITS.MAX_REQUESTS_PER_MINUTE} requests per minute using a sliding window algorithm with automatic cleanup.`,
          sourceFile: "src/app/api/chat/route.ts",
          lineNumbers: "57-106",
          context: {
            currentCount:
              entry?.count || AI_RATE_LIMITS.MAX_REQUESTS_PER_MINUTE,
            limit: AI_RATE_LIMITS.MAX_REQUESTS_PER_MINUTE,
            retryAfter,
          },
        },
      };

      return new Response(JSON.stringify(response), {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": retryAfter.toString(),
        },
      });
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
            type:
              validation.severity === "high"
                ? "prompt_injection"
                : "validation_failure",
            severity: validation.severity || "medium",
          });

          // Build enhanced error response
          const response: GuardrailViolation = {
            error: validation.reason || "Invalid message content",
            guardrail: validation.guardrailDetails,
          };

          return new Response(JSON.stringify(response), {
            status: 400,
            headers: {
              "Content-Type": "application/json",
            },
          });
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

    // Load chat prompt (from active version or default)
    const chatPrompt = await loadChatPrompt();

    // Create system prompt by replacing {resumeContext} placeholder
    const systemPrompt = chatPrompt.replace("{resumeContext}", resumeContext);

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
