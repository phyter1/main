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
import type { BlogPost } from "@/types/blog";
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
  const { slug } = await params;

  // Preload post data for client component
  const preloadedPost = await preloadQuery(api.blog.getPostBySlug, { slug });

  return <BlogPostClient slug={slug} preloadedPost={preloadedPost} />;
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
  const { slug } = await params;

  // Preload post for metadata
  const preloadedPost = await preloadQuery(api.blog.getPostBySlug, { slug });
  const post = preloadedPost || null;

  if (!post) {
    return {
      title: "Post Not Found",
      description: "The blog post you're looking for doesn't exist.",
    };
  }

  // Generate comprehensive metadata using blog-metadata library
  // This includes all SEO tags, OpenGraph, Twitter Cards, and canonical URL
  return generateBlogMetadata(post as unknown as BlogPost);
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
