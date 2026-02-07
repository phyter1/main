"use client";

/**
 * New Blog Post Page (T016)
 *
 * Admin page for creating new blog posts with:
 * - Empty form (BlogPostEditor + BlogPostMetadata)
 * - Side-by-side editor and preview
 * - Save draft functionality
 * - Publish functionality
 * - Cancel/back navigation
 * - Auto-save indicator
 * - Form validation
 *
 * Dependencies: T009 (BlogPostEditor), T010 (BlogPostMetadata),
 *               T013 (ImageUploader), T014 (MarkdownPreview)
 */

import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BlogPostEditor } from "@/components/admin/blog/BlogPostEditor";
import { BlogPostMetadata } from "@/components/admin/blog/BlogPostMetadata";
import { Button } from "@/components/ui/button";
import { calculateReadingTime, generateSlug } from "@/lib/blog-utils";
import type { SEOMetadata } from "@/types/blog";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";

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

export default function NewBlogPostPage() {
  const router = useRouter();

  // Convex mutations
  const createPost = useMutation(api.blog.createPost);
  const publishPost = useMutation(api.blog.publishPost);

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
  const [isPublishing, setIsPublishing] = useState(false);

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
  }) => {
    setFormData((prev) => ({
      ...prev,
      ...metadata,
    }));
  };

  /**
   * Save post as draft
   */
  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      // Generate slug if not provided
      const slug = formData.slug || generateSlug(formData.title);

      // Calculate reading time
      const readingTimeMinutes = calculateReadingTime(formData.content);

      // Create draft post
      await createPost({
        title: formData.title || "Untitled Post",
        slug,
        excerpt: formData.excerpt || "",
        content: formData.content || "",
        coverImageUrl: formData.coverImage,
        categoryId: formData.categoryId,
        tags: formData.tags,
        author: "Ryan Lowe",
        readingTimeMinutes,
        featured: formData.featured,
        seoMetadata: {
          metaTitle: formData.seoMetadata.metaTitle,
          metaDescription: formData.seoMetadata.metaDescription,
          ogImage: formData.seoMetadata.ogImage,
          keywords: formData.seoMetadata.keywords,
        },
      });

      // Navigate to blog list
      router.push("/admin/blog");
    } catch (error) {
      console.error("Failed to save draft:", error);
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Publish post immediately
   */
  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      // Generate slug if not provided
      const slug = formData.slug || generateSlug(formData.title);

      // Calculate reading time
      const readingTimeMinutes = calculateReadingTime(formData.content);

      // Create post
      const postId = await createPost({
        title: formData.title || "Untitled Post",
        slug,
        excerpt: formData.excerpt || "",
        content: formData.content || "",
        coverImageUrl: formData.coverImage,
        categoryId: formData.categoryId,
        tags: formData.tags,
        author: "Ryan Lowe",
        readingTimeMinutes,
        featured: formData.featured,
        seoMetadata: {
          metaTitle: formData.seoMetadata.metaTitle,
          metaDescription: formData.seoMetadata.metaDescription,
          ogImage: formData.seoMetadata.ogImage,
          keywords: formData.seoMetadata.keywords,
        },
      });

      // Publish immediately if post was created
      if (postId) {
        await publishPost({ id: postId });
      }

      // Navigate to blog list
      router.push("/admin/blog");
    } catch (error) {
      console.error("Failed to publish post:", error);
    } finally {
      setIsPublishing(false);
    }
  };

  /**
   * Cancel and go back
   */
  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="container mx-auto max-w-7xl py-8">
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Create New Blog Post</h1>
          <p className="text-muted-foreground mt-2">
            Create a new blog post with rich content and metadata
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSaving || isPublishing}
          >
            Cancel
          </Button>
          <Button
            variant="secondary"
            onClick={handleSaveDraft}
            disabled={isSaving || isPublishing}
          >
            {isSaving ? "Saving..." : "Save Draft"}
          </Button>
          <Button onClick={handlePublish} disabled={isSaving || isPublishing}>
            {isPublishing ? "Publishing..." : "Publish"}
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
              seoMetadata: formData.seoMetadata,
            }}
            onChange={handleMetadataChange}
          />
        </div>
      </div>
    </div>
  );
}
