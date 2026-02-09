/**
 * T029: Category Archive Page
 *
 * Dynamic page for displaying blog posts filtered by category.
 *
 * Features:
 * - Category header with name, description, and post count
 * - Grid of BlogCard components for posts in category
 * - BlogSidebar with categories, tags, and recent posts
 * - Pagination with 20 posts per page
 * - Dynamic metadata with category name
 * - generateStaticParams for all categories
 * - ISR with 60-second revalidation
 */

"use client";

import { useQuery } from "convex/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { notFound } from "next/navigation";
import { use, useState } from "react";
import { BlogCard } from "@/components/blog/BlogCard";
import { BlogSidebar } from "@/components/blog/BlogSidebar";
import { Button } from "@/components/ui/button";
import type { BlogPost } from "@/types/blog";
import { api } from "../../../../../convex/_generated/api";

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

const POSTS_PER_PAGE = 20;

/**
 * Category Archive Page Component
 *
 * Displays all posts in a specific category with pagination.
 */
export default function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = use(params);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch categories to get category data
  const categories = useQuery(api.blog.getCategories, {});

  // Find the category by slug
  const category = categories?.find(
    (cat: { slug: string }) => cat.slug === slug,
  );

  // Calculate pagination
  const offset = (currentPage - 1) * POSTS_PER_PAGE;

  // Fetch posts for this category
  const postsData = useQuery(api.blog.listPosts, {
    status: "published",
    category: category?._id,
    limit: POSTS_PER_PAGE,
    offset,
  });

  // Handle loading state
  if (categories === undefined) {
    return (
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="text-center">
          <p className="text-muted-foreground">Loading category...</p>
        </div>
      </div>
    );
  }

  // Handle category not found
  if (!category) {
    notFound();
  }

  const posts = postsData?.posts || [];
  const totalPosts = postsData?.total || 0;
  const hasMore = postsData?.hasMore || false;
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

  // Pagination handlers
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleNextPage = () => {
    if (hasMore) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="container mx-auto px-4 pt-24 pb-12">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <main className="flex-1">
          {/* Category Header */}
          <header className="mb-12">
            <h1 className="text-4xl font-bold tracking-tight mb-4">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-xl text-muted-foreground mb-4">
                {category.description}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              {totalPosts} {totalPosts === 1 ? "post" : "posts"}
            </p>
          </header>

          {/* Posts Grid */}
          {postsData === undefined ? (
            <div
              data-testid="posts-loading"
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
              {Array.from({ length: 6 }, (_, index) => (
                <div
                  key={`skeleton-loading-${category._id}-${index}`}
                  className="h-96 bg-muted animate-pulse rounded-xl"
                />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No posts found in this category yet.
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
                {posts.map((post) => (
                  <BlogCard key={post._id} post={post as unknown as BlogPost} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <nav
                  className="flex items-center justify-between border-t pt-8"
                  aria-label="Pagination"
                >
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1}
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={handleNextPage}
                      disabled={!hasMore}
                      aria-label="Next page"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </nav>
              )}
            </>
          )}
        </main>

        {/* Sidebar */}
        <BlogSidebar />
      </div>
    </div>
  );
}
