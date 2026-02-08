/**
 * Blog Data Transformation Utilities
 *
 * Transforms Convex query results to BlogPost types for client components.
 * Handles field name mismatches and provides defaults for missing fields.
 */

import type { BlogPost, SEOMetadata } from "@/types/blog";
import type { Id } from "../../convex/_generated/dataModel";

/**
 * Convex blog post result type
 * Represents the actual structure returned by Convex queries
 */
export interface ConvexBlogPost {
  _id: Id<"blogPosts">;
  _creationTime: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  status: "draft" | "published" | "archived";
  author: string;
  publishedAt?: number;
  updatedAt: number;
  coverImageUrl?: string;
  categoryId?: Id<"blogCategories">;
  tags: string[];
  featured: boolean;
  viewCount?: number;
  readingTimeMinutes?: number;
  seoMetadata?: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: string;
    keywords?: string[];
  };
}

/**
 * Transform Convex blog post to BlogPost type
 *
 * @param convexPost - Post from Convex query
 * @param categoryName - Optional category name (if available from separate query)
 * @returns Transformed BlogPost
 */
export function transformConvexPost(
  convexPost: ConvexBlogPost,
  categoryName?: string,
): BlogPost {
  return {
    _id: convexPost._id as unknown as string,
    _creationTime: convexPost._creationTime,
    title: convexPost.title,
    slug: convexPost.slug,
    excerpt: convexPost.excerpt,
    content: convexPost.content,
    status: convexPost.status,
    author: convexPost.author,
    publishedAt: convexPost.publishedAt,
    updatedAt: convexPost.updatedAt,
    coverImage: convexPost.coverImageUrl,
    category: categoryName || "", // Default to empty string if not provided
    tags: convexPost.tags,
    featured: convexPost.featured,
    viewCount: convexPost.viewCount || 0,
    readingTime: convexPost.readingTimeMinutes || 0,
    seoMetadata: {
      metaTitle: convexPost.seoMetadata?.metaTitle || "",
      metaDescription: convexPost.seoMetadata?.metaDescription || "",
      ogImage: convexPost.seoMetadata?.ogImage,
      keywords: convexPost.seoMetadata?.keywords,
    } as SEOMetadata,
  };
}

/**
 * Transform array of Convex blog posts
 *
 * @param convexPosts - Array of posts from Convex query
 * @param categoryMap - Optional map of categoryId -> categoryName
 * @returns Array of transformed BlogPosts
 */
export function transformConvexPosts(
  convexPosts: ConvexBlogPost[],
  categoryMap?: Map<string, string>,
): BlogPost[] {
  return convexPosts.map((post) => {
    const categoryName = post.categoryId
      ? categoryMap?.get(post.categoryId as unknown as string)
      : undefined;
    return transformConvexPost(post, categoryName);
  });
}

/**
 * Build category map from Convex category array
 *
 * @param categories - Array of categories from Convex
 * @returns Map of categoryId -> categoryName
 */
export function buildCategoryMap(
  categories: Array<{ _id: Id<"blogCategories">; name: string }>,
): Map<string, string> {
  const map = new Map<string, string>();
  for (const category of categories) {
    map.set(category._id as unknown as string, category.name);
  }
  return map;
}
