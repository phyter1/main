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
 *
 * T011: AI Suggestion Integration
 * - Displays AI suggestion badges for all metadata fields
 * - Overlay with approve/reject actions
 * - Manual editing removes suggestions
 * - Individual tag suggestions with badges
 */

import { useMutation, useQuery } from "convex/react";
import { Plus, X } from "lucide-react";
import { useEffect, useId, useState } from "react";
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
import type { AIMetadataSuggestions, SEOMetadata } from "@/types/blog";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { AISuggestionBadge } from "./AISuggestionBadge";
import { AISuggestionOverlay } from "./AISuggestionOverlay";
import { ImageUploader } from "./ImageUploader";
import { NewSuggestionChip } from "./NewSuggestionChip";

export interface BlogPostMetadataProps {
  title: string;
  metadata: {
    slug: string;
    categoryId?: Id<"blogCategories">;
    tags: string[];
    featured: boolean;
    coverImage?: string;
    seoMetadata: SEOMetadata;
    excerpt?: string;
    aiSuggestions?: AIMetadataSuggestions;
  };
  onChange: (metadata: BlogPostMetadataProps["metadata"]) => void;
  /**
   * T014: New suggestions from re-run (for approved fields)
   * When AI generates new suggestions for already-approved fields,
   * they are shown as NewSuggestionChips instead of replacing the values
   */
  newSuggestions?: {
    excerpt?: string;
    tags?: string[];
    category?: string;
    seoMetadata?: {
      metaTitle?: string;
      metaDescription?: string;
      keywords?: string[];
    };
  };
}

export function BlogPostMetadata({
  title,
  metadata,
  onChange,
  newSuggestions,
}: BlogPostMetadataProps) {
  // Generate unique IDs for form fields to avoid conflicts
  const slugId = useId();
  const categoryId = useId();
  const excerptId = useId();
  const newCategoryNameId = useId();
  const newCategoryDescId = useId();
  const tagsId = useId();
  const _coverImageId = useId();
  const featuredId = useId();
  const metaTitleId = useId();
  const metaDescId = useId();
  const ogImageId = useId();

  // Fetch categories and tags from Convex
  const categories = useQuery(api.blog.getCategories, {}) || [];
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

  // AI Suggestion overlay state (T011)
  type OverlayField =
    | "excerpt"
    | "metaTitle"
    | "metaDescription"
    | "keywords"
    | "category"
    | { type: "tag"; value: string };
  const [activeOverlay, setActiveOverlay] = useState<OverlayField | null>(null);

  // T014: State for dismissed new suggestions (re-run logic)
  const [dismissedNewSuggestions, setDismissedNewSuggestions] = useState<
    Set<string>
  >(new Set());

  // T014: Filter rejected tags from new suggestions on mount/update
  useEffect(() => {
    if (!newSuggestions?.tags || !metadata.aiSuggestions?.tags?.rejectedTags) {
      return;
    }

    const rejectedTags = metadata.aiSuggestions.tags.rejectedTags;
    const filteredTags = newSuggestions.tags.filter(
      (tag) => !rejectedTags.includes(tag),
    );

    // If any tags were filtered out, update metadata with filtered tags
    if (filteredTags.length < newSuggestions.tags.length) {
      onChange({
        ...metadata,
        aiSuggestions: {
          ...metadata.aiSuggestions,
          tags: {
            value: filteredTags,
            state: "pending",
            rejectedTags: metadata.aiSuggestions.tags.rejectedTags,
          },
        },
      });
    }
  }, [newSuggestions, metadata, onChange]);

  // T014: Helper to check if field has an approved suggestion
  const hasApprovedSuggestion = (
    field:
      | "excerpt"
      | "metaTitle"
      | "metaDescription"
      | "keywords"
      | "category"
      | "tags",
  ): boolean => {
    if (!metadata.aiSuggestions) return false;

    if (field === "excerpt") {
      return metadata.aiSuggestions.excerpt?.state === "approved";
    }
    if (field === "tags") {
      return metadata.aiSuggestions.tags?.state === "approved";
    }
    if (field === "category") {
      return metadata.aiSuggestions.category?.state === "approved";
    }
    if (
      field === "metaTitle" ||
      field === "metaDescription" ||
      field === "keywords"
    ) {
      return metadata.aiSuggestions.seoMetadata?.[field]?.state === "approved";
    }
    return false;
  };

  // T014: Helper to get new suggestion if not dismissed
  const getNewSuggestion = (
    field:
      | "excerpt"
      | "metaTitle"
      | "metaDescription"
      | "keywords"
      | "category",
  ): string | string[] | undefined => {
    if (dismissedNewSuggestions.has(field)) return undefined;
    if (!newSuggestions) return undefined;

    if (field === "excerpt") return newSuggestions.excerpt;
    if (field === "category") return newSuggestions.category;
    if (field === "metaTitle") return newSuggestions.seoMetadata?.metaTitle;
    if (field === "metaDescription")
      return newSuggestions.seoMetadata?.metaDescription;
    if (field === "keywords") return newSuggestions.seoMetadata?.keywords;

    return undefined;
  };

  // T014: Handle replace action from NewSuggestionChip
  const handleReplaceNewSuggestion = (
    field:
      | "excerpt"
      | "metaTitle"
      | "metaDescription"
      | "keywords"
      | "category",
    value: string,
  ) => {
    if (field === "excerpt") {
      onChange({ ...metadata, excerpt: value });
    } else if (field === "category") {
      // Find category ID by name
      const category = categories.find((c) => c.name === value);
      if (category) {
        onChange({
          ...metadata,
          categoryId: category._id as Id<"blogCategories">,
        });
      }
    } else if (field === "metaTitle" || field === "metaDescription") {
      onChange({
        ...metadata,
        seoMetadata: {
          ...metadata.seoMetadata,
          [field]: value,
        },
      });
    }
    // Dismiss after replacing
    setDismissedNewSuggestions((prev) => new Set(prev).add(field));
  };

  // T014: Handle dismiss action from NewSuggestionChip
  const handleDismissNewSuggestion = (field: string) => {
    setDismissedNewSuggestions((prev) => new Set(prev).add(field));
  };

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
    // Clear AI suggestion for this field when manually edited (T011)
    const updatedSuggestions = metadata.aiSuggestions
      ? { ...metadata.aiSuggestions }
      : undefined;

    if (updatedSuggestions?.seoMetadata) {
      if (field === "metaTitle" && updatedSuggestions.seoMetadata.metaTitle) {
        updatedSuggestions.seoMetadata = {
          ...updatedSuggestions.seoMetadata,
          metaTitle: {
            ...updatedSuggestions.seoMetadata.metaTitle,
            state: "rejected",
          },
        };
      } else if (
        field === "metaDescription" &&
        updatedSuggestions.seoMetadata.metaDescription
      ) {
        updatedSuggestions.seoMetadata = {
          ...updatedSuggestions.seoMetadata,
          metaDescription: {
            ...updatedSuggestions.seoMetadata.metaDescription,
            state: "rejected",
          },
        };
      } else if (
        field === "keywords" &&
        updatedSuggestions.seoMetadata.keywords
      ) {
        updatedSuggestions.seoMetadata = {
          ...updatedSuggestions.seoMetadata,
          keywords: {
            ...updatedSuggestions.seoMetadata.keywords,
            state: "rejected",
          },
        };
      }
    }

    onChange({
      ...metadata,
      seoMetadata: {
        ...metadata.seoMetadata,
        [field]: value,
      },
      aiSuggestions: updatedSuggestions,
    });
  };

  // Update excerpt
  const handleExcerptChange = (value: string) => {
    // Clear AI suggestion for excerpt when manually edited (T011)
    const updatedSuggestions = metadata.aiSuggestions
      ? { ...metadata.aiSuggestions }
      : undefined;

    if (updatedSuggestions?.excerpt) {
      updatedSuggestions.excerpt = {
        ...updatedSuggestions.excerpt,
        state: "rejected",
      };
    }

    onChange({
      ...metadata,
      excerpt: value,
      aiSuggestions: updatedSuggestions,
    });
  };

  // AI Suggestion handlers (T011)
  const handleApproveSuggestion = (field: OverlayField) => {
    if (!metadata.aiSuggestions) return;

    const updatedSuggestions = { ...metadata.aiSuggestions };

    if (field === "excerpt" && updatedSuggestions.excerpt) {
      updatedSuggestions.excerpt = {
        ...updatedSuggestions.excerpt,
        state: "approved",
      };
    } else if (field === "category" && updatedSuggestions.category) {
      updatedSuggestions.category = {
        ...updatedSuggestions.category,
        state: "approved",
      };
    } else if (
      field === "metaTitle" &&
      updatedSuggestions.seoMetadata?.metaTitle
    ) {
      updatedSuggestions.seoMetadata = {
        ...updatedSuggestions.seoMetadata,
        metaTitle: {
          ...updatedSuggestions.seoMetadata.metaTitle,
          state: "approved",
        },
      };
    } else if (
      field === "metaDescription" &&
      updatedSuggestions.seoMetadata?.metaDescription
    ) {
      updatedSuggestions.seoMetadata = {
        ...updatedSuggestions.seoMetadata,
        metaDescription: {
          ...updatedSuggestions.seoMetadata.metaDescription,
          state: "approved",
        },
      };
    } else if (
      field === "keywords" &&
      updatedSuggestions.seoMetadata?.keywords
    ) {
      updatedSuggestions.seoMetadata = {
        ...updatedSuggestions.seoMetadata,
        keywords: {
          ...updatedSuggestions.seoMetadata.keywords,
          state: "approved",
        },
      };
    } else if (
      typeof field === "object" &&
      field.type === "tag" &&
      updatedSuggestions.tags
    ) {
      // For tags, mark as approved and filter out from value
      updatedSuggestions.tags = {
        ...updatedSuggestions.tags,
        state: "approved",
      };
    }

    onChange({
      ...metadata,
      aiSuggestions: updatedSuggestions,
    });

    setActiveOverlay(null);
  };

  const handleRejectSuggestion = (field: OverlayField) => {
    if (!metadata.aiSuggestions) return;

    const updatedSuggestions = { ...metadata.aiSuggestions };

    if (field === "excerpt" && updatedSuggestions.excerpt) {
      updatedSuggestions.excerpt = {
        ...updatedSuggestions.excerpt,
        state: "rejected",
      };
    } else if (field === "category" && updatedSuggestions.category) {
      updatedSuggestions.category = {
        ...updatedSuggestions.category,
        state: "rejected",
      };
    } else if (
      field === "metaTitle" &&
      updatedSuggestions.seoMetadata?.metaTitle
    ) {
      updatedSuggestions.seoMetadata = {
        ...updatedSuggestions.seoMetadata,
        metaTitle: {
          ...updatedSuggestions.seoMetadata.metaTitle,
          state: "rejected",
        },
      };
    } else if (
      field === "metaDescription" &&
      updatedSuggestions.seoMetadata?.metaDescription
    ) {
      updatedSuggestions.seoMetadata = {
        ...updatedSuggestions.seoMetadata,
        metaDescription: {
          ...updatedSuggestions.seoMetadata.metaDescription,
          state: "rejected",
        },
      };
    } else if (
      field === "keywords" &&
      updatedSuggestions.seoMetadata?.keywords
    ) {
      updatedSuggestions.seoMetadata = {
        ...updatedSuggestions.seoMetadata,
        keywords: {
          ...updatedSuggestions.seoMetadata.keywords,
          state: "rejected",
        },
      };
    } else if (
      typeof field === "object" &&
      field.type === "tag" &&
      updatedSuggestions.tags
    ) {
      // For tags, add to rejectedTags and remove from suggestions
      updatedSuggestions.tags = {
        ...updatedSuggestions.tags,
        rejectedTags: [...updatedSuggestions.tags.rejectedTags, field.value],
        value: updatedSuggestions.tags.value.filter(
          (tag) => tag !== field.value,
        ),
      };
    }

    onChange({
      ...metadata,
      aiSuggestions: updatedSuggestions,
    });

    setActiveOverlay(null);
  };

  // Helper to check if field has pending AI suggestion
  const hasPendingSuggestion = (field: string): boolean => {
    if (!metadata.aiSuggestions) return false;

    switch (field) {
      case "excerpt":
        return metadata.aiSuggestions.excerpt?.state === "pending";
      case "category":
        return metadata.aiSuggestions.category?.state === "pending";
      case "metaTitle":
        return (
          metadata.aiSuggestions.seoMetadata?.metaTitle?.state === "pending"
        );
      case "metaDescription":
        return (
          metadata.aiSuggestions.seoMetadata?.metaDescription?.state ===
          "pending"
        );
      case "keywords":
        return (
          metadata.aiSuggestions.seoMetadata?.keywords?.state === "pending"
        );
      default:
        return false;
    }
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

      {/* Excerpt Field */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor={excerptId}>Excerpt</Label>
          {hasPendingSuggestion("excerpt") && (
            <AISuggestionBadge onClick={() => setActiveOverlay("excerpt")} />
          )}
        </div>
        <div className="relative">
          <Textarea
            id={excerptId}
            value={metadata.excerpt || ""}
            onChange={(e) => handleExcerptChange(e.target.value)}
            placeholder="Brief summary of the post..."
            rows={3}
            maxLength={200}
          />
          <AISuggestionOverlay
            isOpen={activeOverlay === "excerpt"}
            onApprove={() => handleApproveSuggestion("excerpt")}
            onReject={() => handleRejectSuggestion("excerpt")}
            onClose={() => setActiveOverlay(null)}
          />
        </div>
        <p className="text-muted-foreground text-xs">
          {metadata.excerpt?.length || 0} / 200 characters
        </p>
        {/* T014: Show NewSuggestionChip for approved fields with new suggestions */}
        {hasApprovedSuggestion("excerpt") && getNewSuggestion("excerpt") && (
          <NewSuggestionChip
            value={getNewSuggestion("excerpt") as string}
            onReplace={(value) => handleReplaceNewSuggestion("excerpt", value)}
            onDismiss={() => handleDismissNewSuggestion("excerpt")}
          />
        )}
      </div>

      {/* Tags Input with Autocomplete */}
      <div className="space-y-2">
        <Label htmlFor={tagsId}>Tags</Label>
        <div className="space-y-2">
          {/* Current Tags */}
          {metadata.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {metadata.tags.map((tag) => {
                // Check if this tag is an AI suggestion
                const isAISuggested =
                  metadata.aiSuggestions?.tags?.state === "pending" &&
                  metadata.aiSuggestions.tags.value.includes(tag);

                return (
                  <div
                    key={tag}
                    className="relative inline-flex items-center gap-1"
                  >
                    <Badge variant="secondary" className="gap-1">
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
                    {isAISuggested && (
                      <AISuggestionBadge
                        onClick={() =>
                          setActiveOverlay({ type: "tag", value: tag })
                        }
                      />
                    )}
                    <AISuggestionOverlay
                      isOpen={
                        typeof activeOverlay === "object" &&
                        activeOverlay !== null &&
                        activeOverlay.type === "tag" &&
                        activeOverlay.value === tag
                      }
                      onApprove={() =>
                        handleApproveSuggestion({ type: "tag", value: tag })
                      }
                      onReject={() =>
                        handleRejectSuggestion({ type: "tag", value: tag })
                      }
                      onClose={() => setActiveOverlay(null)}
                    />
                  </div>
                );
              })}
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
        <Label>Cover Image</Label>
        <ImageUploader
          initialImageUrl={metadata.coverImage}
          onUploadComplete={async (url) => {
            // Delete old Vercel Blob image if replacing with new one
            if (
              metadata.coverImage &&
              metadata.coverImage !== url &&
              metadata.coverImage.includes("vercel-storage.com")
            ) {
              try {
                await fetch("/api/admin/blog/delete-image", {
                  method: "DELETE",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ url: metadata.coverImage }),
                });
              } catch (error) {
                console.error("Failed to delete old cover image:", error);
              }
            }

            // Auto-populate OG image if it's empty or matches the old cover image
            const shouldUpdateOgImage =
              !metadata.seoMetadata.ogImage ||
              metadata.seoMetadata.ogImage === metadata.coverImage;

            // Update metadata with new URL and auto-populate OG image
            onChange({
              ...metadata,
              coverImage: url,
              seoMetadata: {
                ...metadata.seoMetadata,
                ogImage: shouldUpdateOgImage
                  ? url
                  : metadata.seoMetadata.ogImage,
              },
            });
          }}
          onError={(error) => {
            console.error("Cover image upload error:", error);
          }}
        />
        <p className="text-muted-foreground text-xs">
          Cover image will automatically be used for social media sharing (OG
          image) unless you specify a different OG image below.
        </p>
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
          <div className="flex items-center gap-2">
            <Label htmlFor={metaTitleId}>Meta Title</Label>
            {hasPendingSuggestion("metaTitle") && (
              <AISuggestionBadge
                onClick={() => setActiveOverlay("metaTitle")}
              />
            )}
          </div>
          <div className="relative">
            <Input
              id={metaTitleId}
              value={metadata.seoMetadata.metaTitle || ""}
              onChange={(e) => handleSeoChange("metaTitle", e.target.value)}
              placeholder={title}
              maxLength={60}
            />
            <AISuggestionOverlay
              isOpen={activeOverlay === "metaTitle"}
              onApprove={() => handleApproveSuggestion("metaTitle")}
              onReject={() => handleRejectSuggestion("metaTitle")}
              onClose={() => setActiveOverlay(null)}
            />
          </div>
          <p className="text-muted-foreground text-xs">
            {metadata.seoMetadata.metaTitle?.length || 0} / 60 characters
            (recommended: 50-60)
          </p>
          {/* T014: Show NewSuggestionChip for approved fields with new suggestions */}
          {hasApprovedSuggestion("metaTitle") &&
            getNewSuggestion("metaTitle") && (
              <NewSuggestionChip
                value={getNewSuggestion("metaTitle") as string}
                onReplace={(value) =>
                  handleReplaceNewSuggestion("metaTitle", value)
                }
                onDismiss={() => handleDismissNewSuggestion("metaTitle")}
              />
            )}
        </div>

        {/* Meta Description */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor={metaDescId}>Meta Description</Label>
            {hasPendingSuggestion("metaDescription") && (
              <AISuggestionBadge
                onClick={() => setActiveOverlay("metaDescription")}
              />
            )}
          </div>
          <div className="relative">
            <Textarea
              id={metaDescId}
              value={metadata.seoMetadata.metaDescription || ""}
              onChange={(e) =>
                handleSeoChange("metaDescription", e.target.value)
              }
              placeholder="Brief description for search engines..."
              rows={3}
              maxLength={200}
              className={isMetaDescTooLong ? "border-yellow-500" : ""}
            />
            <AISuggestionOverlay
              isOpen={activeOverlay === "metaDescription"}
              onApprove={() => handleApproveSuggestion("metaDescription")}
              onReject={() => handleRejectSuggestion("metaDescription")}
              onClose={() => setActiveOverlay(null)}
            />
          </div>
          <p
            className={`text-xs ${isMetaDescTooLong ? "text-yellow-600" : "text-muted-foreground"}`}
          >
            {metaDescLength} / 160 characters (recommended)
            {isMetaDescTooLong && " - Exceeds recommended length"}
          </p>
          {/* T014: Show NewSuggestionChip for approved fields with new suggestions */}
          {hasApprovedSuggestion("metaDescription") &&
            getNewSuggestion("metaDescription") && (
              <NewSuggestionChip
                value={getNewSuggestion("metaDescription") as string}
                onReplace={(value) =>
                  handleReplaceNewSuggestion("metaDescription", value)
                }
                onDismiss={() => handleDismissNewSuggestion("metaDescription")}
              />
            )}
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
