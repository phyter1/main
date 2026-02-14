"use client";

/**
 * Edit Blog Post Page (T016)
 *
 * Admin page for editing existing blog posts with:
 * - Loading existing post data
 * - Side-by-side editor and preview
 * - Save functionality
 * - Publish/unpublish button
 * - Delete button with confirmation
 * - Cancel/back navigation
 * - Auto-save indicator
 * - Form validation
 *
 * Dependencies: T009 (BlogPostEditor), T010 (BlogPostMetadata),
 *               T013 (ImageUploader), T014 (MarkdownPreview)
 */

import { useMutation, useQuery } from "convex/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BlogPostEditor } from "@/components/admin/blog/BlogPostEditor";
import { BlogPostMetadata } from "@/components/admin/blog/BlogPostMetadata";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { calculateReadingTime, hashContent } from "@/lib/blog-utils";
import type { AIMetadataSuggestions, SEOMetadata } from "@/types/blog";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";

/**
 * Post form state
 */
interface PostFormState {
  title: string;
  excerpt: string;
  content: string;
  slug: string;
  categoryId?: Id<"blogCategories">;
  tags: string[];
  featured: boolean;
  coverImage?: string;
  seoMetadata: SEOMetadata;
}

export default function EditBlogPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as Id<"blogPosts">;

  // Fetch post data
  const post = useQuery(api.blog.getPostById, { id: postId });

  // Convex mutations
  const updatePost = useMutation(api.blog.updatePost);
  const publishPost = useMutation(api.blog.publishPost);
  const unpublishPost = useMutation(api.blog.unpublishPost);
  const deletePost = useMutation(api.blog.deletePost);

  // Form state
  const [formData, setFormData] = useState<PostFormState>({
    title: "",
    excerpt: "",
    content: "",
    slug: "",
    tags: [],
    featured: false,
    seoMetadata: {
      metaTitle: "",
      metaDescription: "",
    },
  });

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // T012: AI metadata suggestion state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [lastAnalyzedContentHash, setLastAnalyzedContentHash] = useState<
    string | null
  >(null);
  const [lastAnalyzedTitleHash, setLastAnalyzedTitleHash] = useState<
    string | null
  >(null);
  const [newSuggestions, setNewSuggestions] =
    useState<AIMetadataSuggestions | null>(null);

  /**
   * Initialize form data from loaded post
   */
  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        slug: post.slug,
        categoryId: post.categoryId as Id<"blogCategories"> | undefined,
        tags: post.tags,
        featured: post.featured,
        coverImage: post.coverImageUrl, // Fixed: schema uses coverImageUrl
        seoMetadata: {
          metaTitle: post.seoMetadata?.metaTitle ?? "",
          metaDescription: post.seoMetadata?.metaDescription ?? "",
          ogImage: post.seoMetadata?.ogImage ?? "",
        },
      });
    }
  }, [post]);

  /**
   * Handle metadata changes
   */
  const handleMetadataChange = (metadata: {
    slug: string;
    categoryId?: Id<"blogCategories">;
    tags: string[];
    featured: boolean;
    coverImage?: string;
    seoMetadata: SEOMetadata;
    excerpt?: string;
    aiSuggestions?: any;
  }) => {
    setFormData((prev) => ({
      ...prev,
      ...metadata,
    }));
  };

  /**
   * T012: Handle AI metadata suggestion request
   */
  const handleSuggestMetadata = async () => {
    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const response = await fetch("/api/admin/blog/suggest-metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: formData.content,
          title: formData.title,
          excerpt: formData.excerpt,
          postId,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to generate suggestions: ${response.statusText}`,
        );
      }

      const suggestions = await response.json();

      // Update hashes
      setLastAnalyzedContentHash(await hashContent(formData.content));
      setLastAnalyzedTitleHash(await hashContent(formData.title));

      // Pass suggestions to metadata component
      setNewSuggestions(suggestions);
    } catch (error) {
      console.error("AI metadata suggestion error:", error);
      setAnalysisError(
        error instanceof Error
          ? error.message
          : "Failed to generate suggestions",
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  /**
   * Internal save helper (without state management)
   */
  const savePostData = async () => {
    // Calculate reading time
    const readingTimeMinutes = calculateReadingTime(formData.content);

    // Update post
    await updatePost({
      id: postId,
      title: formData.title,
      slug: formData.slug,
      excerpt: formData.excerpt,
      content: formData.content,
      coverImageUrl: formData.coverImage,
      categoryId: formData.categoryId,
      tags: formData.tags,
      author: post?.author || "Ryan Lowe",
      readingTimeMinutes,
      featured: formData.featured,
      seoMetadata: {
        metaTitle: formData.seoMetadata.metaTitle,
        metaDescription: formData.seoMetadata.metaDescription,
        ogImage: formData.seoMetadata.ogImage,
        keywords: formData.seoMetadata.keywords,
      },
    });
  };

  /**
   * Save post changes
   */
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await savePostData();
      // Stay on page after saving (allow continued editing)
    } catch (error) {
      console.error("Failed to save post:", error);
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Publish post
   */
  const handlePublish = async () => {
    setIsSaving(true);
    try {
      // Save changes first
      await savePostData();

      // Then publish
      await publishPost({ id: postId });
    } catch (error) {
      console.error("Failed to publish post:", error);
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Unpublish post
   */
  const handleUnpublish = async () => {
    setIsSaving(true);
    try {
      await unpublishPost({ id: postId });
    } catch (error) {
      console.error("Failed to unpublish post:", error);
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Delete post with confirmation
   */
  const handleDelete = async () => {
    try {
      await deletePost({ id: postId });
      router.push("/admin/blog");
    } catch (error) {
      console.error("Failed to delete post:", error);
    } finally {
      setShowDeleteDialog(false);
    }
  };

  /**
   * Cancel and go back
   */
  const handleCancel = () => {
    router.back();
  };

  // Loading state
  if (post === undefined) {
    return (
      <div className="container mx-auto max-w-7xl py-8">
        <div className="text-center">
          <p className="text-muted-foreground">Loading post...</p>
        </div>
      </div>
    );
  }

  // Not found state
  if (post === null) {
    return (
      <div className="container mx-auto max-w-7xl py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Post Not Found</h1>
          <p className="text-muted-foreground mt-2">
            The post you're looking for doesn't exist.
          </p>
          <Button className="mt-4" onClick={() => router.push("/admin/blog")}>
            Back to Blog List
          </Button>
        </div>
      </div>
    );
  }

  const isPublished = post.status === "published";

  return (
    <div className="container mx-auto max-w-7xl py-8">
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Edit Blog Post</h1>
          <p className="text-muted-foreground mt-2">
            {post.title || "Untitled Post"}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
            disabled={isSaving}
          >
            Delete
          </Button>
          {isPublished ? (
            <Button
              variant="secondary"
              onClick={handleUnpublish}
              disabled={isSaving}
            >
              Unpublish
            </Button>
          ) : (
            <Button
              variant="secondary"
              onClick={handlePublish}
              disabled={isSaving}
            >
              Publish
            </Button>
          )}
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {/* Main Content: Side-by-side editor and metadata */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left: Editor (2/3 width) */}
        <div className="lg:col-span-2">
          <BlogPostEditor
            title={formData.title}
            content={formData.content}
            onTitleChange={(title) =>
              setFormData((prev) => ({ ...prev, title }))
            }
            onContentChange={(content) =>
              setFormData((prev) => ({ ...prev, content }))
            }
            onSuggestMetadata={handleSuggestMetadata}
            lastAnalyzedContentHash={lastAnalyzedContentHash || undefined}
            lastAnalyzedTitleHash={lastAnalyzedTitleHash || undefined}
            isAnalyzing={isAnalyzing}
            analysisError={analysisError || undefined}
          />
        </div>

        {/* Right: Metadata (1/3 width) */}
        <div className="lg:col-span-1">
          <BlogPostMetadata
            title={formData.title}
            metadata={{
              slug: formData.slug,
              categoryId: formData.categoryId,
              tags: formData.tags,
              featured: formData.featured,
              coverImage: formData.coverImage,
              excerpt: formData.excerpt,
              seoMetadata: formData.seoMetadata,
              aiSuggestions: post?.aiSuggestions,
            }}
            onChange={handleMetadataChange}
            newSuggestions={newSuggestions || undefined}
          />
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Blog Post</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this post? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
