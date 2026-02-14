"use client";

/**
 * Blog Listing Page (T027)
 *
 * Main blog listing page featuring:
 * - Grid layout of BlogCard components
 * - Featured posts section at top
 * - BlogSidebar with categories and tags
 * - BlogSearch component for live search
 * - Pagination (20 posts per page)
 * - Category filtering via dropdown
 * - Responsive layout (mobile to desktop)
 * - Loading and empty states
 *
 * Note: Uses client-side rendering for interactive features.
 * Uses Convex real-time queries for live data updates.
 */

import { useQuery } from "convex/react";
import type { Variants } from "framer-motion";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useMemo } from "react";
import { BlogCard } from "@/components/blog/BlogCard";
import { BlogSearch } from "@/components/blog/BlogSearch";
import { BlogSidebar } from "@/components/blog/BlogSidebar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import {
  buildCategoryMap,
  type ConvexBlogPost,
  transformConvexPosts,
} from "@/lib/blog-transforms";
import { api } from "../../../convex/_generated/api";

// Constants
const POSTS_PER_PAGE = 20;

/**
 * Blog Listing Page Component
 *
 * Note: Uses Convex real-time queries which automatically update.
 * No ISR needed since this is a client component with live data.
 */
function BlogPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reducedMotion = useReducedMotion();

  // Get URL parameters
  const page = Number.parseInt(searchParams.get("page") || "1", 10);
  const categoryFilter = searchParams.get("category") || undefined;

  // Calculate pagination
  const offset = (page - 1) * POSTS_PER_PAGE;

  // Fetch data from Convex
  const featuredPostsData = useQuery(api.blog.getFeaturedPosts);
  const categoriesData = useQuery(api.blog.getCategories, {});
  const postsData = useQuery(api.blog.listPosts, {
    status: "published",
    category: categoryFilter,
    limit: POSTS_PER_PAGE,
    offset: offset,
  });

  // Extract and transform data
  const categories = categoriesData || [];
  const categoryMap = useMemo(
    () => (categories.length > 0 ? buildCategoryMap(categories) : undefined),
    [categories],
  );

  const featuredPosts = useMemo(
    () =>
      featuredPostsData
        ? transformConvexPosts(
            featuredPostsData as unknown as ConvexBlogPost[],
            categoryMap,
          )
        : [],
    [featuredPostsData, categoryMap],
  );

  const posts = useMemo(
    () =>
      postsData?.posts
        ? transformConvexPosts(
            postsData.posts as unknown as ConvexBlogPost[],
            categoryMap,
          )
        : [],
    [postsData?.posts, categoryMap],
  );

  const totalPosts = postsData?.total || 0;
  const hasMore = postsData?.hasMore || false;

  // Calculate pagination info
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);
  const hasPrevious = page > 1;
  const hasNext = hasMore;

  // Handler: Navigate to different page
  const handlePageChange = useCallback(
    (newPage: number) => {
      const params = new URLSearchParams(searchParams);
      params.set("page", newPage.toString());
      router.push(`/blog?${params.toString()}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [searchParams, router],
  );

  // Handler: Change category filter
  const handleCategoryChange = useCallback(
    (categorySlug: string) => {
      const params = new URLSearchParams();
      if (categorySlug !== "all") {
        params.set("category", categorySlug);
      }
      params.set("page", "1"); // Reset to first page
      router.push(`/blog?${params.toString()}`);
    },
    [router],
  );

  // Animation variants
  const containerVariants: Variants = useMemo(
    () => ({
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: reducedMotion ? 0 : 0.1,
        },
      },
    }),
    [reducedMotion],
  );

  const itemVariants: Variants = useMemo(
    () => ({
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: reducedMotion ? 0 : 0.5,
        },
      },
    }),
    [reducedMotion],
  );

  // Loading state
  const isLoading = postsData === undefined;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 pt-24 pb-12 max-w-7xl">
        {/* Page Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Blog
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Insights on AI-first development, agentic workflows, autonomous
            systems, and modern engineering practices.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <BlogSearch className="max-w-2xl" />
        </div>

        {/* Featured Posts Section */}
        {featuredPosts.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-foreground">
              Featured Posts
            </h2>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
              {featuredPosts.map((post) => (
                <BlogCard key={post._id} post={post} variants={itemVariants} />
              ))}
            </motion.div>
          </section>
        )}

        {/* Main Content: Posts Grid + Sidebar */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Posts Section */}
          <section className="flex-1">
            {/* Filter Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Filter by:
                </span>
                <Select
                  value={categoryFilter || "all"}
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category._id} value={category.slug}>
                        {category.name} ({category.postCount})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Post Count */}
              {!isLoading && (
                <p className="text-sm text-muted-foreground">
                  Showing {posts.length} of {totalPosts} posts
                </p>
              )}
            </div>

            {/* Posts Grid */}
            {isLoading ? (
              // Loading State
              <div className="py-12 text-center">
                <p className="text-muted-foreground">Loading posts...</p>
              </div>
            ) : posts.length === 0 ? (
              // Empty State
              <div className="py-12 text-center">
                <p className="text-muted-foreground text-lg mb-4">
                  No posts found
                </p>
                {categoryFilter && (
                  <Button
                    variant="outline"
                    onClick={() => handleCategoryChange("all")}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            ) : (
              // Posts Grid
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3"
              >
                {posts.map((post) => (
                  <BlogCard
                    key={post._id}
                    post={post}
                    variants={itemVariants}
                  />
                ))}
              </motion.div>
            )}

            {/* Pagination */}
            {!isLoading && totalPages > 1 && (
              <div className="mt-12 flex justify-center items-center gap-4">
                {/* Previous Button */}
                {hasPrevious && (
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(page - 1)}
                  >
                    Previous
                  </Button>
                )}

                {/* Page Info */}
                <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>

                {/* Next Button */}
                {hasNext && (
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(page + 1)}
                  >
                    Next
                  </Button>
                )}
              </div>
            )}
          </section>

          {/* Sidebar */}
          <BlogSidebar />
        </div>
      </div>
    </div>
  );
}

/**
 * Blog Page Wrapper with Suspense
 *
 * Wraps BlogPageContent in Suspense to handle useSearchParams() correctly
 * during static generation.
 */
export default function BlogPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 pt-24 pb-12 max-w-7xl">
            <div className="py-12 text-center">
              <p className="text-muted-foreground">Loading blog...</p>
            </div>
          </div>
        </div>
      }
    >
      <BlogPageContent />
    </Suspense>
  );
}
