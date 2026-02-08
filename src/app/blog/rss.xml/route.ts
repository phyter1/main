/**
 * RSS Feed Route
 *
 * T031: Create RSS feed generation
 * GET /blog/rss.xml - Returns valid RSS 2.0 XML feed with last 50 published posts
 */

import { ConvexHttpClient } from "convex/browser";
import {
  buildCategoryMap,
  type ConvexBlogPost,
  transformConvexPosts,
} from "@/lib/blog-transforms";
import type { BlogPost } from "@/types/blog";
import { api } from "../../../../convex/_generated/api";

// Site metadata for RSS feed
const SITE_TITLE = "Phytertek Blog";
const SITE_DESCRIPTION =
  "Insights on software engineering, AI integration, and building high-performance teams";
const SITE_URL = "https://phytertek.com";
const BLOG_URL = `${SITE_URL}/blog`;
const RSS_URL = `${BLOG_URL}/rss.xml`;

// Configuration
const MAX_POSTS = 50;
const CACHE_DURATION = 3600; // 1 hour in seconds
const USE_EXCERPT = process.env.RSS_USE_EXCERPT === "true";

/**
 * Escape XML special characters
 *
 * Escapes characters that have special meaning in XML:
 * - < becomes &lt;
 * - > becomes &gt;
 * - & becomes &amp;
 * - " becomes &quot;
 * - ' becomes &apos;
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Format date to RFC 822 format required by RSS 2.0
 *
 * Example: "Wed, 07 Feb 2026 12:00:00 GMT"
 */
function formatRFC822Date(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toUTCString();
}

/**
 * Generate RSS item XML for a blog post
 */
function generateRssItem(post: BlogPost): string {
  const postUrl = `${BLOG_URL}/${post.slug}`;
  const content = USE_EXCERPT ? post.excerpt : post.content;
  const pubDate = post.publishedAt
    ? formatRFC822Date(post.publishedAt)
    : formatRFC822Date(post.updatedAt);

  return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(postUrl)}</link>
      <description>${escapeXml(content)}</description>
      <author>${escapeXml(post.author)}</author>
      <category>${escapeXml(post.category)}</category>
      <pubDate>${pubDate}</pubDate>
      <guid isPermaLink="true">${escapeXml(postUrl)}</guid>
    </item>`;
}

/**
 * Generate complete RSS 2.0 XML feed
 */
function generateRssFeed(posts: BlogPost[]): string {
  const now = formatRFC822Date(Date.now());

  const items = posts.map((post) => generateRssItem(post)).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_TITLE)}</title>
    <link>${escapeXml(BLOG_URL)}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>en-us</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${escapeXml(RSS_URL)}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;
}

/**
 * GET /blog/rss.xml
 *
 * Returns RSS 2.0 XML feed with last 50 published blog posts
 *
 * Features:
 * - Valid RSS 2.0 XML format
 * - Last 50 published posts
 * - Full content or excerpt (configurable via RSS_USE_EXCERPT env var)
 * - Proper XML encoding with entity escaping
 * - Cache-Control headers for 1-hour caching
 * - RFC 822 date formatting
 */
export async function GET(): Promise<Response> {
  try {
    // Validate Convex URL
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      console.error("RSS Feed Error: NEXT_PUBLIC_CONVEX_URL not configured");
      return new Response("Failed to generate RSS feed", { status: 500 });
    }

    // Initialize Convex client
    const client = new ConvexHttpClient(convexUrl);

    // Query last 50 published posts and categories
    const result = await client.query(api.blog.listPosts, {
      status: "published",
      limit: MAX_POSTS,
    });

    const categories = await client.query(api.blog.getCategories);
    const categoryMap = buildCategoryMap(categories);

    // Transform Convex posts to BlogPost type
    const posts = transformConvexPosts(
      result.posts as unknown as ConvexBlogPost[],
      categoryMap,
    );

    // Generate RSS XML
    const xml = generateRssFeed(posts);

    // Return with proper headers
    return new Response(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": `public, max-age=${CACHE_DURATION}, s-maxage=${CACHE_DURATION}, stale-while-revalidate=${CACHE_DURATION * 2}`,
      },
    });
  } catch (error) {
    console.error("RSS Feed Generation Error:", error);
    return new Response("Failed to generate RSS feed", { status: 500 });
  }
}
