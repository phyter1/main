"use client";

/**
 * Admin Blog Dashboard Page (T015)
 *
 * Main dashboard for blog management with:
 * - Statistics cards (total posts, drafts, published)
 * - BlogPostList component for managing posts
 * - Quick actions (New Post button)
 * - Responsive layout
 */

import { useMutation, useQuery } from "convex/react";
import { Eye, FilePen, FileText, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { BlogPostList } from "@/components/admin/blog/BlogPostList";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BlogPost } from "@/data/blog-mock";
import {
  buildCategoryMap,
  type ConvexBlogPost,
  transformConvexPosts,
} from "@/lib/blog-transforms";
import { api } from "../../../../convex/_generated/api";

export default function BlogPage() {
  const router = useRouter();

  // Fetch data from Convex
  const allPostsData = useQuery(api.blog.listPosts, {});
  const categoriesData = useQuery(api.blog.getCategories);
  const deletePostMutation = useMutation(api.blog.deletePost);

  // Handle loading state
  if (!allPostsData || !categoriesData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const categories = categoriesData || [];
  const categoryMap = buildCategoryMap(categories);

  // Transform Convex posts to BlogPost type
  const posts = transformConvexPosts(
    (allPostsData.posts || []) as unknown as ConvexBlogPost[],
    categoryMap,
  );

  // Calculate statistics
  const totalPosts = posts.length;
  const draftPosts = posts.filter((post) => post.status === "draft").length;
  const publishedPosts = posts.filter(
    (post) => post.status === "published",
  ).length;

  // Handler for creating new post
  const handleNewPost = () => {
    router.push("/admin/blog/new");
  };

  // Handler for editing post
  const handleEditPost = (post: any) => {
    router.push(`/admin/blog/edit/${post._id}`);
  };

  // Handler for deleting post
  const handleDeletePost = async (post: any) => {
    if (!confirm(`Are you sure you want to delete "${post.title}"?`)) {
      return;
    }

    try {
      await deletePostMutation({ id: post._id });
    } catch (error) {
      console.error("Failed to delete post:", error);
      alert("Failed to delete post. Please try again.");
    }
  };

  // Handlers for bulk actions
  const handleBulkPublish = async (selectedPosts: any[]) => {
    // TODO: Implement bulk publish mutation
    console.log(
      "Bulk publish:",
      selectedPosts.map((p) => p.slug),
    );
  };

  const handleBulkArchive = async (selectedPosts: any[]) => {
    // TODO: Implement bulk archive mutation
    console.log(
      "Bulk archive:",
      selectedPosts.map((p) => p.slug),
    );
  };

  const handleBulkDelete = async (selectedPosts: any[]) => {
    if (
      !confirm(`Are you sure you want to delete ${selectedPosts.length} posts?`)
    ) {
      return;
    }

    try {
      await Promise.all(
        selectedPosts.map((post) => deletePostMutation({ id: post._id })),
      );
    } catch (error) {
      console.error("Failed to delete posts:", error);
      alert("Failed to delete some posts. Please try again.");
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Blog Management</h1>
          <p className="text-muted-foreground">
            Manage your blog posts, categories, and content
          </p>
        </div>
        <Button onClick={handleNewPost} size="lg">
          <Plus className="mr-2 size-4" />
          New Post
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <article>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
              <FileText className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPosts}</div>
              <p className="text-xs text-muted-foreground">
                All blog posts in the system
              </p>
            </CardContent>
          </Card>
        </article>

        <article>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Drafts</CardTitle>
              <FilePen className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{draftPosts}</div>
              <p className="text-xs text-muted-foreground">
                Unpublished draft posts
              </p>
            </CardContent>
          </Card>
        </article>

        <article>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Published</CardTitle>
              <Eye className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{publishedPosts}</div>
              <p className="text-xs text-muted-foreground">
                Live published posts
              </p>
            </CardContent>
          </Card>
        </article>
      </div>

      {/* Blog Post List */}
      <Card>
        <CardHeader>
          <CardTitle>All Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <BlogPostList
            posts={posts as unknown as BlogPost[]}
            categories={categories}
            onEdit={handleEditPost}
            onDelete={handleDeletePost}
            onBulkPublish={handleBulkPublish}
            onBulkArchive={handleBulkArchive}
            onBulkDelete={handleBulkDelete}
          />
        </CardContent>
      </Card>
    </div>
  );
}
