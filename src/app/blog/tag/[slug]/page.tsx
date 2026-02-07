/**
 * Tag Archive Page (T030)
 *
 * Displays all blog posts with a specific tag, with features including:
 * - Tag header with name and post count
 * - Grid of BlogCard components for posts
 * - Related tags section
 * - BlogSidebar component
 * - Pagination (20 posts per page)
 * - Dynamic metadata with tag name
 * - generateStaticParams for all tags
 * - ISR with 60-second revalidation
 */

import { ConvexHttpClient } from "convex/browser";
import type { Metadata } from "next";
import Link from "next/link";
import { BlogCard } from "@/components/blog/BlogCard";
import { BlogSidebar } from "@/components/blog/BlogSidebar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { BlogPost, BlogTag } from "@/types/blog";
import { api } from "../../../../../convex/_generated/api";

// ISR revalidation interval (60 seconds)
export const revalidate = 60;

interface TagPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<{
    page?: string;
  }>;
}

/**
 * Generate metadata for tag archive pages
 *
 * Creates SEO-optimized metadata including:
 * - Title with tag name
 * - Description mentioning tag and post count
 * - OpenGraph tags for social sharing
 */
export async function generateMetadata({
  params,
}: TagPageProps): Promise<Metadata> {
  const { slug } = await params;

  // Fetch tag data for metadata
  const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
  const tags = (await convex.query(api.blog.getTags)) as BlogTag[];
  const tag = tags.find((t) => t.slug === slug);

  if (!tag) {
    return {
      title: "Tag Not Found",
      description: "The requested tag could not be found.",
    };
  }

  const title = `${tag.name} - Blog Tags`;
  const description = `Browse all ${tag.postCount} blog posts tagged with ${tag.name}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `/blog/tag/${slug}`,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

/**
 * Generate static params for all tags
 *
 * Pre-renders pages for all tags at build time.
 * Pages will be regenerated on-demand with ISR.
 */
export async function generateStaticParams() {
  const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
  const tags = (await convex.query(api.blog.getTags)) as BlogTag[];

  return tags.map((tag) => ({
    slug: tag.slug,
  }));
}

/**
 * Tag Archive Page Component
 *
 * Server component that fetches and displays all posts with a specific tag.
 * Includes pagination, related tags, and sidebar navigation.
 */
export default async function TagPage({ params, searchParams }: TagPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams?.page || "1");
  const postsPerPage = 20;
  const offset = (page - 1) * postsPerPage;

  // Fetch tag data
  const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
  const tags = (await convex.query(api.blog.getTags)) as BlogTag[];
  const tag = tags.find((t) => t.slug === slug);

  // Handle tag not found
  if (!tag) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Tag Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The tag you're looking for doesn't exist.
          </p>
          <Link
            href="/blog"
            className="text-primary hover:underline font-medium"
          >
            ← Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  // Fetch posts with this tag
  const allPosts = (await convex.query(api.blog.getPostsByTag, {
    tag: slug,
    status: "published",
  })) as BlogPost[];

  const totalPosts = allPosts.length;
  const totalPages = Math.ceil(totalPosts / postsPerPage);
  const posts = allPosts.slice(offset, offset + postsPerPage);

  // Get related tags (exclude current tag, show top 5 by post count)
  const relatedTags = tags
    .filter((t) => t.slug !== slug)
    .sort((a, b) => b.postCount - a.postCount)
    .slice(0, 5);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="flex-1">
          {/* Tag Header */}
          <div
            data-testid="tag-header"
            className="mb-8 pb-6 border-b border-border"
          >
            <h1 className="text-4xl font-bold mb-2">{tag.name}</h1>
            <p className="text-muted-foreground">
              {totalPosts} {totalPosts === 1 ? "post" : "posts"} tagged with{" "}
              {tag.name}
            </p>
          </div>

          {/* Posts Grid */}
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground mb-4">
                No posts found with this tag.
              </p>
              <Link
                href="/blog"
                className="text-primary hover:underline font-medium"
              >
                Browse all posts
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {posts.map((post) => (
                  <BlogCard key={post._id} post={post} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div
                  data-testid="pagination-controls"
                  className="flex items-center justify-center gap-2 mt-8"
                >
                  {page > 1 && (
                    <Link
                      href={`/blog/tag/${slug}?page=${page - 1}`}
                      className="px-4 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                    >
                      Previous
                    </Link>
                  )}

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (pageNum) => (
                        <Link
                          key={pageNum}
                          href={`/blog/tag/${slug}?page=${pageNum}`}
                          className={`px-4 py-2 rounded-md transition-colors ${
                            pageNum === page
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                          }`}
                        >
                          {pageNum}
                        </Link>
                      ),
                    )}
                  </div>

                  {page < totalPages && (
                    <Link
                      href={`/blog/tag/${slug}?page=${page + 1}`}
                      className="px-4 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                    >
                      Next
                    </Link>
                  )}
                </div>
              )}
            </>
          )}

          {/* Related Tags Section */}
          {relatedTags.length > 0 && (
            <Card className="mt-12" data-testid="related-tags">
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-4">Related Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {relatedTags.map((relatedTag) => (
                    <Link
                      key={relatedTag._id}
                      href={`/blog/tag/${relatedTag.slug}`}
                    >
                      <Badge
                        variant="outline"
                        className="hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
                      >
                        {relatedTag.name} ({relatedTag.postCount})
                      </Badge>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <BlogSidebar />
      </div>
    </div>
  );
}
