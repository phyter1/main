/**
 * T028: Individual Blog Post Page
 *
 * Dynamic blog post page with:
 * - BlogHeader component for title, author, metadata
 * - BlogContent with MDX rendering
 * - TableOfContents for long posts
 * - ShareButtons component
 * - Related posts section (same category/tags)
 * - View count increment on load
 * - Dynamic metadata generation (title, description, OG tags)
 * - Structured data (JSON-LD)
 * - ISR with 1-hour revalidation
 * - generateStaticParams for published posts
 */

import { preloadQuery } from "convex/nextjs";
import type { Metadata } from "next";
import { generateBlogMetadata } from "@/lib/blog-metadata";
import { buildCategoryMap, transformConvexPost } from "@/lib/blog-transforms";
import { api } from "../../../../convex/_generated/api";
import { BlogPostClient } from "./BlogPostClient";

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * ISR revalidation: 1 hour (3600 seconds)
 */
export const revalidate = 3600;

/**
 * Server component wrapper for blog post page
 */
export default async function BlogPostPage({ params }: BlogPostPageProps) {
  try {
    console.log("[BlogPostPage] Starting page render");
    const { slug } = await params;
    console.log("[BlogPostPage] Slug:", slug);

    // Preload post data for client component
    console.log("[BlogPostPage] Fetching post by slug...");
    const preloadedPost = await preloadQuery(api.blog.getPostBySlug, { slug });
    console.log("[BlogPostPage] Post fetched:", !!preloadedPost);

    return <BlogPostClient slug={slug} preloadedPost={preloadedPost} />;
  } catch (error) {
    console.error("[BlogPostPage] ERROR:", error);
    console.error(
      "[BlogPostPage] Error stack:",
      error instanceof Error ? error.stack : "No stack",
    );
    console.error(
      "[BlogPostPage] Error message:",
      error instanceof Error ? error.message : String(error),
    );
    throw error; // Re-throw to let Next.js handle it
  }
}

/**
 * Generate dynamic metadata for SEO
 *
 * T032: Enhanced with comprehensive SEO metadata generation including:
 * - OpenGraph tags (og:title, og:description, og:image, og:type, og:url)
 * - Twitter Card tags (twitter:card, twitter:title, twitter:description, twitter:image)
 * - Canonical URL to prevent duplicate content
 * - Article metadata (publishedTime, modifiedTime, author)
 * - Keywords for search indexing
 *
 * Uses seoMetadata fields when present, falls back to post defaults
 */
export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  try {
    console.log("[generateMetadata] Starting metadata generation");
    const { slug } = await params;
    console.log("[generateMetadata] Slug:", slug);

    // Preload post and categories for metadata
    console.log("[generateMetadata] Fetching post by slug...");
    const preloadedPost = await preloadQuery(api.blog.getPostBySlug, { slug });
    const rawPost = (preloadedPost || null) as any;
    console.log("[generateMetadata] Raw post fetched:", !!rawPost);

    if (!rawPost) {
      console.log("[generateMetadata] Post not found for slug:", slug);
      return {
        title: "Post Not Found",
        description: "The blog post you're looking for doesn't exist.",
      };
    }

    // Get categories for transformation
    console.log("[generateMetadata] Fetching categories...");
    const categories = (await preloadQuery(api.blog.getCategories, {})) as any;
    console.log(
      "[generateMetadata] Categories fetched:",
      categories?.length || 0,
    );
    const categoryMap = categories ? buildCategoryMap(categories) : undefined;
    console.log(
      "[generateMetadata] Category map built, size:",
      categoryMap?.size || 0,
    );

    // Transform Convex post to BlogPost type
    console.log(
      "[generateMetadata] Transforming post, categoryId:",
      rawPost.categoryId,
    );
    const categoryName =
      rawPost.categoryId && categoryMap
        ? categoryMap.get(rawPost.categoryId as unknown as string)
        : undefined;
    console.log("[generateMetadata] Category name resolved:", categoryName);

    const post = transformConvexPost(rawPost, categoryName);
    console.log("[generateMetadata] Post transformed successfully");

    // Generate comprehensive metadata using blog-metadata library
    // This includes all SEO tags, OpenGraph, Twitter Cards, and canonical URL
    console.log("[generateMetadata] Generating blog metadata...");
    const metadata = generateBlogMetadata(post);
    console.log("[generateMetadata] Metadata generated successfully");
    return metadata;
  } catch (error) {
    console.error("[generateMetadata] ERROR:", error);
    console.error(
      "[generateMetadata] Error stack:",
      error instanceof Error ? error.stack : "No stack",
    );
    console.error(
      "[generateMetadata] Error message:",
      error instanceof Error ? error.message : String(error),
    );
    throw error; // Re-throw to let Next.js handle it
  }
}

/**
 * Generate static params for all published posts
 */
export async function generateStaticParams(): Promise<{ slug: string }[]> {
  // Preload all published posts
  const result = await preloadQuery(api.blog.listPosts, {
    status: "published",
    limit: 1000,
  });

  const data = result as any;

  if (!data || !data.posts) {
    return [];
  }

  return data.posts.map((post: { slug: string }) => ({
    slug: post.slug,
  }));
}
