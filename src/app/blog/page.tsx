/**
 * Blog Listing Page — Server Component
 *
 * Fetches blog data server-side so posts are visible to search engines,
 * social link previews, and crawlers. Passes data to BlogListingClient
 * for interactive hydration with real-time Convex subscriptions.
 *
 * ISR: revalidates every 60 seconds.
 */

import { ConvexHttpClient } from "convex/browser";
import {
  buildCategoryMap,
  type ConvexBlogPost,
  transformConvexPosts,
} from "@/lib/blog-transforms";
import { api } from "../../../convex/_generated/api";
import BlogListingClient from "./BlogListingClient";

const POSTS_PER_PAGE = 20;

export const revalidate = 60;
export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

  // Fallback: if no Convex URL, render client-only (will fetch on mount)
  if (!convexUrl) {
    return (
      <BlogListingClient
        initialFeaturedPosts={[]}
        initialPosts={[]}
        initialTotalPosts={0}
        initialHasMore={false}
      />
    );
  }

  const convex = new ConvexHttpClient(convexUrl);

  const [featuredPostsData, categoriesData, postsData] = await Promise.all([
    convex.query(api.blog.getFeaturedPosts),
    convex.query(api.blog.getCategories, {}),
    convex.query(api.blog.listPosts, {
      status: "published",
      limit: POSTS_PER_PAGE,
      offset: 0,
    }),
  ]);

  const categoryMap = buildCategoryMap(categoriesData);
  const featuredPosts = transformConvexPosts(
    (featuredPostsData || []) as unknown as ConvexBlogPost[],
    categoryMap,
  );
  const posts = transformConvexPosts(
    (postsData?.posts || []) as unknown as ConvexBlogPost[],
    categoryMap,
  );

  return (
    <BlogListingClient
      initialFeaturedPosts={featuredPosts}
      initialPosts={posts}
      initialTotalPosts={postsData?.total || 0}
      initialHasMore={postsData?.hasMore || false}
    />
  );
}
