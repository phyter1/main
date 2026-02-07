/**
 * Blog Sitemap Utilities (T033)
 *
 * Utility functions for generating blog-related sitemap entries.
 * Includes URL generation for posts, categories, tags, and comprehensive
 * sitemap entry generation with proper priorities and change frequencies.
 */

import type { BlogCategory, BlogPost, BlogTag } from "@/types/blog";

/**
 * Blog sitemap entry type
 * Matches Next.js MetadataRoute.Sitemap entry structure
 */
export type BlogSitemapEntry = {
  url: string;
  lastModified: Date;
  changeFrequency:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  priority: number;
};

/**
 * Default base URL for sitemap generation
 */
const DEFAULT_BASE_URL = "https://ryn.phytertek.com";

/**
 * Generate URL for a blog post
 *
 * @param slug - Post slug
 * @param baseUrl - Base URL (defaults to production URL)
 * @returns Full URL to blog post
 */
export function generatePostUrl(
  slug: string,
  baseUrl: string = DEFAULT_BASE_URL,
): string {
  return `${baseUrl}/blog/${slug}`;
}

/**
 * Generate URL for a blog category page
 *
 * @param slug - Category slug
 * @param baseUrl - Base URL (defaults to production URL)
 * @returns Full URL to category page
 */
export function generateCategoryUrl(
  slug: string,
  baseUrl: string = DEFAULT_BASE_URL,
): string {
  return `${baseUrl}/blog/category/${slug}`;
}

/**
 * Generate URL for a blog tag page
 *
 * @param slug - Tag slug
 * @param baseUrl - Base URL (defaults to production URL)
 * @returns Full URL to tag page
 */
export function generateTagUrl(
  slug: string,
  baseUrl: string = DEFAULT_BASE_URL,
): string {
  return `${baseUrl}/blog/tag/${slug}`;
}

/**
 * Generate comprehensive sitemap entries for all blog content
 *
 * Creates sitemap entries for:
 * - Blog listing page
 * - All published blog posts
 * - All category pages
 * - All tag pages
 *
 * Each entry includes appropriate priority and changeFrequency values
 * based on content type and update patterns.
 *
 * @param options - Configuration options
 * @param options.posts - Array of published blog posts
 * @param options.categories - Array of blog categories
 * @param options.tags - Array of blog tags
 * @param options.baseUrl - Base URL for sitemap entries
 * @returns Array of sitemap entries ready for Next.js sitemap
 */
export function generateBlogSitemapEntries(options: {
  posts: BlogPost[];
  categories: BlogCategory[];
  tags: BlogTag[];
  baseUrl?: string;
}): BlogSitemapEntry[] {
  const { posts, categories, tags, baseUrl = DEFAULT_BASE_URL } = options;
  const entries: BlogSitemapEntry[] = [];

  // 1. Blog listing page
  // High priority (0.9) as it's the main entry point
  // Daily updates as new posts are added frequently
  entries.push({
    url: `${baseUrl}/blog`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.9,
  });

  // 2. Individual blog posts
  // Good priority (0.8) as they're primary content
  // Monthly updates as posts are generally stable after publication
  for (const post of posts) {
    entries.push({
      url: generatePostUrl(post.slug, baseUrl),
      lastModified: new Date(post.publishedAt || post.updatedAt),
      changeFrequency: "monthly",
      priority: 0.8,
    });
  }

  // 3. Category pages
  // Medium priority (0.7) as they're navigation pages
  // Weekly updates as categories change with new posts
  for (const category of categories) {
    entries.push({
      url: generateCategoryUrl(category.slug, baseUrl),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }

  // 4. Tag pages
  // Lower priority (0.6) as they're secondary navigation
  // Weekly updates as tags change with new posts
  for (const tag of tags) {
    entries.push({
      url: generateTagUrl(tag.slug, baseUrl),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    });
  }

  return entries;
}
