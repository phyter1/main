/**
 * BlogSidebar Component (T023)
 *
 * Displays sidebar content for blog pages including:
 * - Categories list with post counts
 * - Tag cloud with clickable tags
 * - Recent posts list (5 most recent)
 * - RSS feed link
 *
 * Responsive: Collapses on mobile, visible on larger screens
 * Uses Convex queries to fetch data from backend
 */

"use client";

import { useQuery } from "convex/react";
import { Rss } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { api } from "../../../convex/_generated/api";

/**
 * BlogSidebar Component
 *
 * Fetches and displays blog metadata in a sidebar layout with
 * categories, tags, recent posts, and RSS feed link.
 */
export function BlogSidebar() {
  // Fetch data from Convex queries
  const categories = useQuery(api.blog.getCategories, {});
  const tags = useQuery(api.blog.getTags);
  const recentPostsData = useQuery(api.blog.listPosts, {
    status: "published",
    limit: 5,
  });

  const recentPosts = recentPostsData?.posts || [];

  return (
    <aside
      data-testid="blog-sidebar"
      className="hidden lg:block w-full lg:w-80 space-y-6"
    >
      {/* Categories Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Categories</CardTitle>
        </CardHeader>
        <CardContent>
          {!categories ? (
            <div className="space-y-2">
              <div className="h-6 bg-muted animate-pulse rounded" />
              <div className="h-6 bg-muted animate-pulse rounded" />
              <div className="h-6 bg-muted animate-pulse rounded" />
            </div>
          ) : categories.length === 0 ? (
            <p className="text-sm text-muted-foreground">No categories yet</p>
          ) : (
            <ul className="space-y-2">
              {categories.map((category) => (
                <li key={category._id}>
                  <Link
                    href={`/blog/category/${category.slug}`}
                    className={cn(
                      "flex items-center justify-between py-1 px-2 rounded-md",
                      "hover:bg-accent hover:text-accent-foreground",
                      "transition-colors duration-200",
                    )}
                  >
                    <span className="text-sm font-medium">{category.name}</span>
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {category.postCount}
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Tags Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tags</CardTitle>
        </CardHeader>
        <CardContent>
          {!tags ? (
            <div className="flex flex-wrap gap-2">
              <div className="h-6 w-16 bg-muted animate-pulse rounded-full" />
              <div className="h-6 w-20 bg-muted animate-pulse rounded-full" />
              <div className="h-6 w-14 bg-muted animate-pulse rounded-full" />
              <div className="h-6 w-18 bg-muted animate-pulse rounded-full" />
            </div>
          ) : tags.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tags yet</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Link key={tag._id} href={`/blog/tag/${tag.slug}`}>
                  <Badge
                    variant="outline"
                    className={cn(
                      "cursor-pointer",
                      "hover:bg-accent hover:text-accent-foreground",
                      "transition-colors duration-200",
                    )}
                  >
                    {tag.name}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Posts Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Posts</CardTitle>
        </CardHeader>
        <CardContent>
          {!recentPostsData ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="h-4 bg-muted animate-pulse rounded" />
                <div className="h-3 bg-muted animate-pulse rounded w-2/3" />
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-muted animate-pulse rounded" />
                <div className="h-3 bg-muted animate-pulse rounded w-2/3" />
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-muted animate-pulse rounded" />
                <div className="h-3 bg-muted animate-pulse rounded w-2/3" />
              </div>
            </div>
          ) : recentPosts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No posts yet</p>
          ) : (
            <ul className="space-y-4">
              {recentPosts.slice(0, 5).map((post, index) => (
                <li key={post._id} data-testid={`recent-post-${index}`}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className={cn(
                      "block group",
                      "hover:text-primary transition-colors duration-200",
                    )}
                  >
                    <h3 className="text-sm font-medium leading-tight line-clamp-2 group-hover:text-primary">
                      {post.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {post.publishedAt
                        ? new Date(post.publishedAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )
                        : "Draft"}
                    </p>
                  </Link>
                  {index < recentPosts.length - 1 && index < 4 && (
                    <Separator className="mt-4" />
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* RSS Feed Link */}
      <Card>
        <CardContent className="pt-6">
          <Link
            href="/blog/rss.xml"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "flex items-center justify-center gap-2",
              "py-2 px-4 rounded-md",
              "bg-primary text-primary-foreground",
              "hover:bg-primary/90",
              "transition-colors duration-200",
            )}
          >
            <Rss className="h-4 w-4" />
            <span className="text-sm font-medium">Subscribe via RSS</span>
          </Link>
        </CardContent>
      </Card>
    </aside>
  );
}
