"use client";

/**
 * BlogPostClient Component
 *
 * Client-side component for blog post rendering with:
 * - useQuery for data fetching
 * - View count increment on mount
 * - Related posts display
 * - Table of contents generation
 *
 * FIXED: React hooks rules violations - all hooks now called unconditionally
 */

import {
  type Preloaded,
  useMutation,
  usePreloadedQuery,
  useQuery,
} from "convex/react";
import { notFound } from "next/navigation";
import { useEffect, useMemo } from "react";
import { BlogCard } from "@/components/blog/BlogCard";
import { BlogContent } from "@/components/blog/BlogContent";
import { BlogHeader } from "@/components/blog/BlogHeader";
import { ShareButtons } from "@/components/blog/ShareButtons";
import {
  type Heading,
  TableOfContents,
} from "@/components/blog/TableOfContents";
import { generateArticleStructuredData } from "@/lib/blog-metadata";
import type { BlogPost } from "@/types/blog";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";

interface BlogPostClientProps {
  slug: string;
  preloadedPost: Preloaded<typeof api.blog.getPostBySlug> | null;
}

/**
 * Extract headings from markdown content for table of contents
 */
function extractHeadings(content: string): Heading[] {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const headings: Heading[] = [];
  let match: RegExpExecArray | null = headingRegex.exec(content);

  while (match !== null) {
    const level = match[1].length;
    const text = match[2].trim();

    // Generate ID from heading text (same as rehype-slug does)
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    headings.push({ id, text, level });
    match = headingRegex.exec(content);
  }

  return headings;
}

export function BlogPostClient({ slug, preloadedPost }: BlogPostClientProps) {
  // CRITICAL: All hooks must be called unconditionally and before any returns
  // This satisfies React's rules of hooks

  // Determine if we should use preloaded data or fetch client-side
  const shouldUsePreloaded = preloadedPost !== null;

  // Hook 1: useQuery for client-side fetching
  // Skip if we have preloaded data
  const clientFetchedPost = useQuery(
    api.blog.getPostBySlug,
    shouldUsePreloaded ? "skip" : { slug },
  );

  // Hook 2: usePreloadedQuery for SSR preloaded data
  // Always call but handle null preloadedPost by providing undefined behavior
  // When preloadedPost is null, this returns undefined which we handle below
  const preloadedPostData = usePreloadedQuery(
    shouldUsePreloaded
      ? preloadedPost
      : (undefined as unknown as Preloaded<typeof api.blog.getPostBySlug>),
  );

  // Determine the active post data based on which loading strategy we used
  const post = shouldUsePreloaded ? preloadedPostData : clientFetchedPost;

  // Hook 3: useQuery for related posts - always called unconditionally
  // Skip if post doesn't have tags
  const relatedByTag = useQuery(
    api.blog.getPostsByTag,
    post?.tags?.length
      ? {
          tag: post.tags[0],
          status: "published",
        }
      : "skip",
  );

  // Hook 4: useMutation - always called unconditionally
  const incrementViewCount = useMutation(api.blog.incrementViewCount);

  // Hook 5: useMemo for headings - always called unconditionally
  const headings = useMemo(
    () => extractHeadings(post?.content ?? ""),
    [post?.content],
  );

  // Hook 6: useMemo for related posts - always called unconditionally
  const relatedPosts = useMemo(() => {
    if (!relatedByTag || !Array.isArray(relatedByTag) || !post) return [];

    return relatedByTag
      .filter((p) => p._id !== post._id)
      .slice(0, 3)
      .map(
        (p) =>
          ({
            _id: p._id,
            _creationTime: p._creationTime,
            title: p.title,
            slug: p.slug,
            excerpt: p.excerpt,
            content: p.content,
            status: p.status,
            author: p.author,
            publishedAt: p.publishedAt,
            updatedAt: p.updatedAt,
            coverImage: p.coverImageUrl,
            category: "", // TODO: Map categoryId to category name
            tags: p.tags,
            featured: p.featured,
            viewCount: p.viewCount || 0,
            readingTime: p.readingTimeMinutes || 0,
            seoMetadata: p.seoMetadata as any, // TODO: Fix type mismatch
          }) as BlogPost,
      );
  }, [relatedByTag, post]);

  // Hook 7: useEffect for view count - always called unconditionally
  useEffect(() => {
    if (post?._id) {
      incrementViewCount({ id: post._id as Id<"blogPosts"> }).catch((error) => {
        console.error("Failed to increment view count:", error);
      });
    }
  }, [post?._id, incrementViewCount]);

  // ALL HOOKS CALLED - Now safe to do conditional returns

  // Handle loading state
  if (post === undefined) {
    return (
      <div className="container mx-auto max-w-4xl py-16 text-center">
        <p className="text-muted-foreground">Loading post...</p>
      </div>
    );
  }

  // Handle post not found
  if (post === null) {
    notFound();
  }

  // Generate JSON-LD structured data
  const jsonLd = generateArticleStructuredData(post as unknown as BlogPost);

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Structured data for SEO
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container mx-auto max-w-7xl pt-24 pb-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
          {/* Main Content */}
          <article className="min-w-0">
            {/* Blog Header */}
            <BlogHeader
              post={{
                _id: post._id,
                _creationTime: post._creationTime,
                title: post.title,
                slug: post.slug,
                excerpt: post.excerpt,
                content: post.content,
                status: post.status,
                author: post.author,
                publishedAt: post.publishedAt,
                updatedAt: post.updatedAt,
                coverImage: post.coverImageUrl,
                category: "", // TODO: Map categoryId to category name
                tags: post.tags,
                featured: post.featured,
                viewCount: post.viewCount || 0,
                readingTime: post.readingTimeMinutes || 0,
                seoMetadata: post.seoMetadata as any,
              }}
              className="mb-8"
            />

            {/* Blog Content */}
            <BlogContent content={post.content} className="mb-8" />

            {/* Share Buttons */}
            <div className="border-t border-border pt-6 mb-8">
              <h2 className="text-sm font-semibold mb-4 text-muted-foreground uppercase">
                Share this post
              </h2>
              <ShareButtons title={post.title} slug={post.slug} />
            </div>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <div className="border-t border-border pt-8">
                <h2 className="text-2xl font-bold mb-6">Related Posts</h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {relatedPosts.map((relatedPost) => (
                    <BlogCard key={relatedPost._id} post={relatedPost} />
                  ))}
                </div>
              </div>
            )}
          </article>

          {/* Sidebar: Table of Contents */}
          <aside className="hidden lg:block">
            <TableOfContents headings={headings} />
          </aside>
        </div>
      </div>
    </>
  );
}
