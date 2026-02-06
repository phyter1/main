"use client";

/**
 * BlogPostMetadata Component
 *
 * T010: Admin component for managing blog post metadata including:
 * - SEO metadata fields (metaTitle, metaDescription, ogImage)
 * - Cover image URL input with preview
 * - Category dropdown with create option
 * - Tag input with autocomplete and creation
 * - Slug field with auto-generation
 * - Featured post checkbox
 * - All fields properly controlled
 */

import { useMutation, useQuery } from "convex/react";
import { Image as ImageIcon, Plus, X } from "lucide-react";
import Image from "next/image";
import { useId, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { generateSlug, validateSlug } from "@/lib/blog-utils";
import type { SEOMetadata } from "@/types/blog";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";

export interface BlogPostMetadataProps {
  title: string;
  metadata: {
    slug: string;
    categoryId?: Id<"blogCategories">;
    tags: string[];
    featured: boolean;
    coverImage?: string;
    seoMetadata: SEOMetadata;
  };
  onChange: (metadata: BlogPostMetadataProps["metadata"]) => void;
}

export function BlogPostMetadata({
  title,
  metadata,
  onChange,
}: BlogPostMetadataProps) {
  // Generate unique IDs for form fields to avoid conflicts
  const slugId = useId();
  const categoryId = useId();
  const newCategoryNameId = useId();
  const newCategoryDescId = useId();
  const tagsId = useId();
  const coverImageId = useId();
  const featuredId = useId();
  const metaTitleId = useId();
  const metaDescId = useId();
  const ogImageId = useId();

  // Fetch categories and tags from Convex
  const categories = useQuery(api.blog.getCategories) || [];
  const existingTags = useQuery(api.blog.getTags) || [];
  const createCategory = useMutation(api.blog.createCategory);

  // Local state for UI interactions
  const [slugError, setSlugError] = useState<string | null>(null);
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDesc, setNewCategoryDesc] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tagError, setTagError] = useState<string | null>(null);
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
  const [showSlugOverwriteWarning, setShowSlugOverwriteWarning] =
    useState(false);

  // Auto-generate slug from title
  const handleGenerateSlug = () => {
    if (metadata.slug?.trim()) {
      // Show warning if slug already exists
      setShowSlugOverwriteWarning(true);
      return;
    }

    const newSlug = generateSlug(title);
    const validation = validateSlug(newSlug);

    if (validation.isValid) {
      onChange({ ...metadata, slug: newSlug });
      setSlugError(null);
    } else {
      setSlugError(validation.error || "Invalid slug");
    }
  };

  // Force slug generation even if slug exists
  const handleForceGenerateSlug = () => {
    const newSlug = generateSlug(title);
    onChange({ ...metadata, slug: newSlug });
    setSlugError(null);
    setShowSlugOverwriteWarning(false);
  };

  // Validate and update slug
  const handleSlugChange = (value: string) => {
    onChange({ ...metadata, slug: value });

    const validation = validateSlug(value);
    if (!validation.isValid) {
      setSlugError(validation.error || "Invalid slug");
    } else {
      setSlugError(null);
    }
  };

  // Handle slug blur to show empty error
  const handleSlugBlur = () => {
    if (!metadata.slug || !metadata.slug.trim()) {
      setSlugError("Slug cannot be empty");
    }
  };

  // Create new category
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;

    try {
      const categoryId = await createCategory({
        name: newCategoryName.trim(),
        description: newCategoryDesc.trim(),
      });

      onChange({
        ...metadata,
        categoryId: categoryId as Id<"blogCategories">,
      });

      setNewCategoryName("");
      setNewCategoryDesc("");
      setShowCreateCategory(false);
    } catch (error) {
      console.error("Failed to create category:", error);
    }
  };

  // Handle tag input change with autocomplete
  const handleTagInputChange = (value: string) => {
    setTagInput(value);
    setTagError(null);

    if (value.trim()) {
      // Filter existing tags for suggestions
      const suggestions = existingTags
        .filter((tag) => tag.name.toLowerCase().includes(value.toLowerCase()))
        .map((tag) => tag.name)
        .slice(0, 5);

      setTagSuggestions(suggestions);
    } else {
      setTagSuggestions([]);
    }
  };

  // Add tag from input
  const handleAddTag = (tagName: string) => {
    const trimmedTag = tagName.trim().toLowerCase();

    if (!trimmedTag) return;

    // Check for duplicate
    if (metadata.tags.includes(trimmedTag)) {
      setTagError("Tag already added");
      return;
    }

    onChange({
      ...metadata,
      tags: [...metadata.tags, trimmedTag],
    });

    setTagInput("");
    setTagSuggestions([]);
    setTagError(null);
  };

  // Handle tag input key press
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag(tagInput);
    }
  };

  // Remove tag
  const handleRemoveTag = (tagToRemove: string) => {
    onChange({
      ...metadata,
      tags: metadata.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  // Update SEO metadata
  const handleSeoChange = (field: keyof SEOMetadata, value: string) => {
    onChange({
      ...metadata,
      seoMetadata: {
        ...metadata.seoMetadata,
        [field]: value,
      },
    });
  };

  // Calculate meta description character count
  const metaDescLength = metadata.seoMetadata.metaDescription?.length || 0;
  const isMetaDescTooLong = metaDescLength > 160;

  return (
    <div className="space-y-6">
      {/* Slug Field with Auto-Generation */}
      <div className="space-y-2">
        <Label htmlFor={slugId}>Slug *</Label>
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              id={slugId}
              value={metadata.slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              onBlur={handleSlugBlur}
              placeholder="post-url-slug"
              aria-invalid={!!slugError}
              className={slugError ? "border-destructive" : ""}
            />
            {slugError && (
              <p className="text-destructive text-sm mt-1">{slugError}</p>
            )}
          </div>
          <Button type="button" onClick={handleGenerateSlug} variant="outline">
            Generate
          </Button>
        </div>
        <p className="text-muted-foreground text-xs">
          URL-safe slug for this post (lowercase letters, numbers, and hyphens
          only)
        </p>
      </div>

      {/* Slug Overwrite Warning Dialog */}
      <Dialog
        open={showSlugOverwriteWarning}
        onOpenChange={setShowSlugOverwriteWarning}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Slug Already Exists</DialogTitle>
            <DialogDescription>
              A slug already exists for this post. Do you want to overwrite it
              with a new slug generated from the title?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSlugOverwriteWarning(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleForceGenerateSlug}>Overwrite</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category Dropdown */}
      <div className="space-y-2">
        <Label htmlFor={categoryId}>Category</Label>
        <div className="flex gap-2">
          <div className="flex-1">
            <Select
              value={metadata.categoryId}
              onValueChange={(value) =>
                onChange({
                  ...metadata,
                  categoryId: value as Id<"blogCategories">,
                })
              }
            >
              <SelectTrigger id={categoryId}>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category._id} value={category._id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            type="button"
            onClick={() => setShowCreateCategory(true)}
            variant="outline"
            size="icon"
            title="Create category"
          >
            <Plus className="size-4" />
          </Button>
        </div>
      </div>

      {/* Create Category Dialog */}
      <Dialog open={showCreateCategory} onOpenChange={setShowCreateCategory}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Category</DialogTitle>
            <DialogDescription>
              Add a new category for organizing blog posts.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={newCategoryNameId}>Category Name *</Label>
              <Input
                id={newCategoryNameId}
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Technology"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={newCategoryDescId}>Description</Label>
              <Textarea
                id={newCategoryDescId}
                value={newCategoryDesc}
                onChange={(e) => setNewCategoryDesc(e.target.value)}
                placeholder="Posts about technology and software development"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateCategory(false);
                setNewCategoryName("");
                setNewCategoryDesc("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateCategory}
              disabled={!newCategoryName.trim()}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tags Input with Autocomplete */}
      <div className="space-y-2">
        <Label htmlFor={tagsId}>Tags</Label>
        <div className="space-y-2">
          {/* Current Tags */}
          {metadata.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {metadata.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 hover:bg-muted rounded-full p-0.5"
                    aria-label={`Remove ${tag} tag`}
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {/* Tag Input */}
          <div className="relative">
            <Input
              id={tagsId}
              value={tagInput}
              onChange={(e) => handleTagInputChange(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder="Add tag (press Enter)"
            />
            {tagError && (
              <p className="text-destructive text-sm mt-1">{tagError}</p>
            )}

            {/* Tag Suggestions */}
            {tagSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-md">
                {tagSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleAddTag(suggestion)}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <p className="text-muted-foreground text-xs">
          Press Enter to add tags. Click suggestions to use existing tags.
        </p>
      </div>

      {/* Cover Image */}
      <div className="space-y-2">
        <Label htmlFor={coverImageId}>Cover Image URL</Label>
        <Input
          id={coverImageId}
          value={metadata.coverImage || ""}
          onChange={(e) =>
            onChange({ ...metadata, coverImage: e.target.value })
          }
          placeholder="https://example.com/image.jpg"
          type="url"
        />
        {metadata.coverImage ? (
          <div className="mt-2 border rounded-md overflow-hidden relative h-48">
            <Image
              src={metadata.coverImage}
              alt="Cover image preview"
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="mt-2 border rounded-md h-48 flex items-center justify-center bg-muted">
            <div className="text-center text-muted-foreground">
              <ImageIcon className="size-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No cover image</p>
            </div>
          </div>
        )}
      </div>

      {/* Featured Post Checkbox */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id={featuredId}
          checked={metadata.featured}
          onChange={(e) =>
            onChange({ ...metadata, featured: e.target.checked })
          }
          className="size-4 rounded border-input"
        />
        <Label htmlFor={featuredId} className="cursor-pointer">
          Featured Post
        </Label>
      </div>
      <p className="text-muted-foreground text-xs -mt-4 ml-6">
        Featured posts may be highlighted on the blog homepage
      </p>

      {/* SEO Metadata Section */}
      <div className="border-t pt-6 space-y-4">
        <h3 className="font-semibold">SEO Metadata</h3>

        {/* Meta Title */}
        <div className="space-y-2">
          <Label htmlFor={metaTitleId}>Meta Title</Label>
          <Input
            id={metaTitleId}
            value={metadata.seoMetadata.metaTitle || ""}
            onChange={(e) => handleSeoChange("metaTitle", e.target.value)}
            placeholder={title}
            maxLength={60}
          />
          <p className="text-muted-foreground text-xs">
            {metadata.seoMetadata.metaTitle?.length || 0} / 60 characters
            (recommended: 50-60)
          </p>
        </div>

        {/* Meta Description */}
        <div className="space-y-2">
          <Label htmlFor={metaDescId}>Meta Description</Label>
          <Textarea
            id={metaDescId}
            value={metadata.seoMetadata.metaDescription || ""}
            onChange={(e) => handleSeoChange("metaDescription", e.target.value)}
            placeholder="Brief description for search engines..."
            rows={3}
            maxLength={200}
            className={isMetaDescTooLong ? "border-yellow-500" : ""}
          />
          <p
            className={`text-xs ${isMetaDescTooLong ? "text-yellow-600" : "text-muted-foreground"}`}
          >
            {metaDescLength} / 160 characters (recommended)
            {isMetaDescTooLong && " - Exceeds recommended length"}
          </p>
        </div>

        {/* OG Image */}
        <div className="space-y-2">
          <Label htmlFor={ogImageId}>OG Image URL</Label>
          <Input
            id={ogImageId}
            value={metadata.seoMetadata.ogImage || ""}
            onChange={(e) => handleSeoChange("ogImage", e.target.value)}
            placeholder="https://example.com/og-image.jpg"
            type="url"
          />
          <p className="text-muted-foreground text-xs">
            Image for social media sharing (recommended: 1200x630px)
          </p>
        </div>
      </div>
    </div>
  );
}
