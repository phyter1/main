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

import { Eye, FilePen, FileText, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { BlogPostList } from "@/components/admin/blog/BlogPostList";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BlogPost } from "@/data/blog-mock";
import { mockBlogCategories, mockBlogPosts } from "@/data/blog-mock";

/**
 * Page metadata for SEO and browser tab
 */
export const metadata = {
  title: "Blog Management | Admin Dashboard",
  description: "Manage blog posts, categories, and content",
};

export default function BlogPage() {
  const router = useRouter();

  // Calculate statistics from mock data
  const totalPosts = mockBlogPosts.length;
  const draftPosts = mockBlogPosts.filter(
    (post) => post.status === "draft",
  ).length;
  const publishedPosts = mockBlogPosts.filter(
    (post) => post.status === "published",
  ).length;

  // Handler for creating new post
  const handleNewPost = () => {
    router.push("/admin/blog/new");
  };

  // Handler for editing post
  const handleEditPost = (post: BlogPost) => {
    router.push(`/admin/blog/edit/${post.slug}`);
  };

  // Handler for deleting post
  const handleDeletePost = (post: BlogPost) => {
    console.log("Delete post:", post.slug);
    // TODO: Implement delete functionality with confirmation
  };

  // Handlers for bulk actions
  const handleBulkPublish = (posts: BlogPost[]) => {
    console.log(
      "Bulk publish:",
      posts.map((p) => p.slug),
    );
    // TODO: Implement bulk publish
  };

  const handleBulkArchive = (posts: BlogPost[]) => {
    console.log(
      "Bulk archive:",
      posts.map((p) => p.slug),
    );
    // TODO: Implement bulk archive
  };

  const handleBulkDelete = (posts: BlogPost[]) => {
    console.log(
      "Bulk delete:",
      posts.map((p) => p.slug),
    );
    // TODO: Implement bulk delete with confirmation
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
            posts={mockBlogPosts}
            categories={mockBlogCategories}
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
