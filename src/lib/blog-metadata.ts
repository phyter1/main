/**
 * Blog Metadata Generation
 *
 * T032: Dynamic metadata generation for blog posts
 *
 * Provides comprehensive SEO metadata generation with fallback behavior:
 * - OpenGraph tags for social media sharing
 * - Twitter Card tags for Twitter embeds
 * - Canonical URLs to prevent duplicate content
 * - Article structured data (JSON-LD) for rich search results
 *
 * All functions prioritize seoMetadata fields and fall back to default post fields.
 */

import type { Metadata } from "next";
import type { BlogPost } from "@/types/blog";

/**
 * Base URL for the site
 * Used for generating canonical URLs and absolute paths
 */
const SITE_URL = "https://phytertek.com";

/**
 * Article structured data schema (JSON-LD)
 * Follows schema.org Article specification
 */
interface ArticleStructuredData {
  "@context": string;
  "@type": string;
  headline: string;
  description: string;
  author: {
    "@type": string;
    name: string;
  };
  datePublished?: string;
  dateModified: string;
  image?: string;
  url: string;
  mainEntityOfPage: string;
  keywords?: string[];
}

/**
 * Generates comprehensive Next.js metadata for a blog post
 *
 * Includes:
 * - Page title and description (with fallback)
 * - OpenGraph tags for social sharing (og:title, og:description, og:image, og:type, og:url)
 * - Twitter Card tags (twitter:card, twitter:title, twitter:description, twitter:image)
 * - Canonical URL
 * - Keywords (when present)
 *
 * @param post - Blog post to generate metadata for
 * @returns Next.js Metadata object ready for export from generateMetadata()
 */
export function generateBlogMetadata(post: BlogPost): Metadata {
  // Use seoMetadata fields when present, fall back to post fields
  const title = post.seoMetadata?.metaTitle || post.title;
  const description = post.seoMetadata?.metaDescription || post.excerpt;
  const image = post.seoMetadata?.ogImage || post.coverImage;
  const canonicalUrl = generateCanonicalUrl(post);

  // Convert timestamps to ISO 8601 strings
  const publishedTime = post.publishedAt
    ? new Date(post.publishedAt).toISOString()
    : undefined;
  const modifiedTime = new Date(post.updatedAt).toISOString();

  return {
    title,
    description,
    keywords: post.seoMetadata?.keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      type: "article",
      url: canonicalUrl,
      images: image ? [image] : [],
      publishedTime: publishedTime,
      modifiedTime: modifiedTime,
      authors: [post.author],
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : [],
    },
  };
}

/**
 * Generates article structured data (JSON-LD) for a blog post
 *
 * Structured data enables rich search results in Google and other search engines.
 * Follows schema.org Article specification.
 *
 * Include this in your page like:
 * ```tsx
 * <script
 *   type="application/ld+json"
 *   dangerouslySetInnerHTML={{
 *     __html: JSON.stringify(generateArticleStructuredData(post))
 *   }}
 * />
 * ```
 *
 * @param post - Blog post to generate structured data for
 * @returns Article structured data object ready for JSON-LD script tag
 */
export function generateArticleStructuredData(
  post: BlogPost,
): ArticleStructuredData {
  const url = generateCanonicalUrl(post);
  const publishedTime = post.publishedAt
    ? new Date(post.publishedAt).toISOString()
    : undefined;
  const modifiedTime = new Date(post.updatedAt).toISOString();

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    author: {
      "@type": "Person",
      name: post.author,
    },
    datePublished: publishedTime,
    dateModified: modifiedTime,
    image: post.coverImage,
    url,
    mainEntityOfPage: url,
    keywords: post.seoMetadata?.keywords,
  };
}

/**
 * Generates canonical URL for a blog post
 *
 * Canonical URLs prevent duplicate content issues in search engines.
 * Uses seoMetadata canonical URL if present, otherwise generates from slug.
 *
 * @param post - Blog post to generate canonical URL for
 * @returns Absolute canonical URL for the post
 */
export function generateCanonicalUrl(post: BlogPost): string {
  // Use canonical URL from seoMetadata if present
  if (post.seoMetadata?.canonicalUrl) {
    return post.seoMetadata.canonicalUrl;
  }

  // Generate canonical URL from slug
  return `${SITE_URL}/blog/${post.slug}`;
}
