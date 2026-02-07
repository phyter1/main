/**
 * Sitemap Generation (T033)
 *
 * Generates comprehensive sitemap including:
 * - Static site pages
 * - Blog listing page
 * - All published blog posts
 * - Category pages
 * - Tag pages
 *
 * Uses proper priority values and change frequencies for optimal SEO.
 */

import { preloadQuery } from "convex/nextjs";
import type { MetadataRoute } from "next";
import { generateBlogSitemapEntries } from "@/lib/blog-sitemap";
import { api } from "../../convex/_generated/api";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://ryn.phytertek.com";
  const currentDate = new Date();

  // Static site pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/principles`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/projects`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/stack`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  // Fetch blog content for dynamic sitemap entries
  try {
    // Fetch all published posts
    const postsData = await preloadQuery(api.blog.listPosts, {
      status: "published",
      limit: 1000, // Get all posts for sitemap
    });

    // Fetch all categories
    const categoriesData = await preloadQuery(api.blog.getCategories, {});

    // Fetch all tags
    const tagsData = await preloadQuery(api.blog.getTags, {});

    // Generate blog sitemap entries
    const blogEntries = generateBlogSitemapEntries({
      posts: postsData.posts || [],
      categories: categoriesData || [],
      tags: tagsData || [],
      baseUrl,
    });

    // Combine static and blog entries
    return [...staticPages, ...blogEntries];
  } catch (error) {
    // If blog data fetch fails, return static pages only
    console.error("Failed to fetch blog data for sitemap:", error);
    return staticPages;
  }
}
