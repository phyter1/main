/**
 * T007: API Route for AI-Powered Blog Metadata Suggestions
 * POST /api/admin/blog/suggest-metadata
 *
 * Generates metadata suggestions for blog posts using AI:
 * - Excerpt generation
 * - Tag suggestions
 * - Category suggestion
 * - SEO metadata (title, description, keywords)
 * - Content analysis (tone, readability)
 */

import { generateObject } from "ai";
import { ConvexHttpClient } from "convex/browser";
import { z } from "zod";
import { AI_RATE_LIMITS, createOpenAIClient } from "@/lib/ai-config";
import { api } from "../../../../../../convex/_generated/api";

/**
 * Request body validation schema
 */
const RequestSchema = z.object({
  content: z
    .string()
    .min(10, "Content must be at least 10 characters")
    .max(50000, "Content must not exceed 50,000 characters"),
  title: z.string().min(1, "Title is required"),
  excerpt: z.string().optional(),
  postId: z.string().optional(),
});

/**
 * AI response schema for metadata suggestions
 */
const MetadataSuggestionsSchema = z.object({
  excerpt: z
    .string()
    .describe("A concise 150-200 character excerpt of the blog post"),
  tags: z
    .array(z.string())
    .describe("Relevant tags (3-5 tags) based on content and existing tags"),
  category: z.string().describe("Most appropriate category for this post"),
  seoMetadata: z.object({
    metaTitle: z
      .string()
      .describe("SEO-optimized title (50-60 characters) for search engines"),
    metaDescription: z
      .string()
      .describe(
        "SEO-optimized description (150-160 characters) for search results",
      ),
    keywords: z
      .array(z.string())
      .describe("5-8 SEO keywords relevant to the content"),
  }),
  analysis: z.object({
    tone: z
      .string()
      .describe(
        "Overall tone of the content (e.g., Professional, Casual, Technical)",
      ),
    readability: z
      .string()
      .describe(
        "Readability level (e.g., Beginner-friendly, Intermediate, Advanced)",
      ),
  }),
});

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
 * Clear rate limit map (for testing only)
 * @internal
 */
export function clearRateLimits(): void {
  rateLimitMap.clear();
}

/**
 * Get client IP address from request headers
 */
function getClientIP(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }

  return "unknown";
}

/**
 * Check if request is rate limited
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
    rateLimitMap.set(ip, {
      count: 1,
      resetAt: oneMinuteFromNow,
    });
  } else {
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
 * Get Convex client instance
 */
function getConvexClient(): ConvexHttpClient {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    throw new Error("NEXT_PUBLIC_CONVEX_URL is not configured");
  }
  return new ConvexHttpClient(convexUrl);
}

/**
 * POST /api/admin/blog/suggest-metadata
 * Generates AI-powered metadata suggestions for blog posts
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

    // Parse and validate request body
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

    const validation = RequestSchema.safeParse(body);
    if (!validation.success) {
      // Format Zod error messages for user feedback
      const errorDetails = validation.error.format();
      const errorParts: string[] = [];

      // Check for specific field errors
      if (errorDetails.content?._errors?.length) {
        errorParts.push(`content: ${errorDetails.content._errors.join(", ")}`);
      }
      if (errorDetails.title?._errors?.length) {
        errorParts.push(`title: ${errorDetails.title._errors.join(", ")}`);
      }
      if (errorDetails._errors?.length) {
        errorParts.push(...errorDetails._errors);
      }

      const errorMessage =
        errorParts.length > 0 ? errorParts.join("; ") : "Invalid request body";

      return new Response(
        JSON.stringify({
          error: errorMessage,
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    const { content, title, excerpt, postId } = validation.data;

    // Record request for rate limiting
    recordRequest(clientIP);

    // Query existing tags and categories from Convex for context
    const convex = getConvexClient();

    const [existingTags, existingCategories] = await Promise.all([
      convex.query(api.blog.getTags),
      convex.query(api.blog.getCategories),
    ]);

    // Format existing tags and categories for prompt context
    const existingTagNames = existingTags
      .map((tag: { name: string }) => tag.name)
      .join(", ");
    const existingCategoryNames = existingCategories
      .map((cat: { name: string }) => cat.name)
      .join(", ");

    // System prompt for metadata generation
    const systemPrompt = `You are an expert content strategist analyzing blog posts to generate SEO-optimized metadata.

Existing Tags: ${existingTagNames || "No existing tags"}
Existing Categories: ${existingCategoryNames || "No existing categories"}

For the given blog post, generate:
1. Excerpt (150-200 characters, engaging summary that captures the main idea)
2. Tags (3-5 tags, prefer existing tags when relevant, only create new tags if truly necessary)
3. Category (choose from existing categories or suggest new if truly unique)
4. SEO Metadata:
   - metaTitle (50-60 characters, keyword-optimized for search engines)
   - metaDescription (150-160 characters, compelling description for search results)
   - keywords (5-8 relevant keywords for SEO)
5. Analysis:
   - tone (e.g., Professional, Casual, Technical, Conversational, Tutorial)
   - readability (e.g., Beginner-friendly, Intermediate, Advanced, Expert)

Be concise, specific, and SEO-conscious. Prefer existing tags and categories when they fit.`;

    // Create OpenAI client
    const openaiClient = createOpenAIClient();

    // Build AI prompt
    const userPrompt = `
Analyze this blog post and generate metadata suggestions:

Title: ${title}
${excerpt ? `Current Excerpt: ${excerpt}` : ""}
${postId ? `Post ID: ${postId}` : ""}

Content:
${content}

Generate comprehensive metadata suggestions including excerpt, tags, category, SEO metadata, and content analysis.
    `.trim();

    // Generate structured metadata suggestions using AI
    const result = await generateObject({
      model: openaiClient,
      schema: MetadataSuggestionsSchema,
      system: systemPrompt,
      prompt: userPrompt,
    });

    // Return structured suggestions
    return new Response(JSON.stringify(result.object), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Metadata suggestion error:", error);

    // Return user-friendly error without exposing API key or internal details
    return new Response(
      JSON.stringify({
        error:
          "An error occurred generating metadata suggestions. Please try again.",
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
