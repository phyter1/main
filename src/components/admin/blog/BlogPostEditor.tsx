"use client";

/**
 * BlogPostEditor Component
 *
 * Controlled Markdown editor for blog posts with:
 * - Plain textarea for Markdown input
 * - Live preview with GitHub Flavored Markdown
 * - Character and word count display
 * - Image upload via drag-drop or button
 */

import {
  ExternalLink,
  ImagePlus,
  Loader2,
  Sparkles,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import {
  type ChangeEvent,
  type DragEvent,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { BlogContent } from "@/components/blog/BlogContent";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { hasContentChanged } from "@/lib/blog-utils";

interface BlogPostEditorProps {
  title: string;
  content: string;
  onTitleChange: (title: string) => void;
  onContentChange: (content: string) => void;
  /**
   * T012: AI metadata suggestion callback
   * Called when content/title changes are detected and AI analysis should be triggered
   */
  onSuggestMetadata?: () => Promise<void>;
  /**
   * T012: Hash of last analyzed content for change detection
   */
  lastAnalyzedContentHash?: string | null;
  /**
   * T012: Hash of last analyzed title for change detection
   */
  lastAnalyzedTitleHash?: string | null;
  /**
   * T012: Whether AI analysis is currently in progress
   */
  isAnalyzing?: boolean;
  /**
   * T012: Error message from AI analysis failure
   */
  analysisError?: string | null;
}

export function BlogPostEditor({
  title,
  content,
  onTitleChange,
  onContentChange,
  onSuggestMetadata,
  lastAnalyzedContentHash,
  lastAnalyzedTitleHash,
  isAnalyzing = false,
  analysisError,
}: BlogPostEditorProps) {
  const titleId = useId();
  const contentId = useId();
  const fileInputId = useId();
  const [showPreview, setShowPreview] = useState(true);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [deletingImageUrl, setDeletingImageUrl] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // T012: Track whether content or title has changed since last analysis
  const [hasChanges, setHasChanges] = useState(false);

  /**
   * T012: Detect changes in content or title compared to last analyzed versions
   * Updates hasChanges state to enable/disable AI suggestion trigger
   */
  useEffect(() => {
    const detectChanges = async () => {
      if (!lastAnalyzedContentHash && !lastAnalyzedTitleHash) {
        // No previous analysis, treat as changed (first time)
        setHasChanges(true);
        return;
      }

      const contentChanged = await hasContentChanged(
        content,
        lastAnalyzedContentHash,
      );
      const titleChanged = await hasContentChanged(
        title,
        lastAnalyzedTitleHash,
      );

      setHasChanges(contentChanged || titleChanged);
    };

    detectChanges();
  }, [content, title, lastAnalyzedContentHash, lastAnalyzedTitleHash]);

  /**
   * Extract all Vercel Blob Storage image URLs from markdown content
   */
  const uploadedImages = useMemo(() => {
    const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    const matches = [...content.matchAll(imageRegex)];

    // Filter for Vercel Blob Storage URLs only
    return matches
      .map((match) => ({
        alt: match[1],
        url: match[2],
      }))
      .filter((img) => img.url.includes("vercel-storage.com"));
  }, [content]);

  // Character and word count
  const charCount = content.length;
  const trimmed = content.trim();
  const wordCount = trimmed
    ? trimmed.split(/\s+/).filter((word) => word.length > 0).length
    : 0;

  /**
   * Insert text at current cursor position in textarea
   */
  const insertAtCursor = (text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newContent =
      content.substring(0, start) + text + content.substring(end);

    onContentChange(newContent);

    // Set cursor after inserted text
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + text.length;
      textarea.focus();
    }, 0);
  };

  /**
   * Handle image file upload to Vercel Blob Storage
   */
  const handleImageUpload = async (file: File) => {
    // Validate file type
    const validTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/gif",
      "image/webp",
    ];
    if (!validTypes.includes(file.type)) {
      setUploadError(
        "Invalid file type. Please upload PNG, JPEG, GIF, or WebP images.",
      );
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadError("File too large. Maximum size is 5MB.");
      return;
    }

    setIsUploadingImage(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/blog/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Upload failed");
      }

      const { url } = await response.json();

      // Insert markdown at cursor
      const markdown = `![Image description](${url})`;
      insertAtCursor(markdown);
    } catch (error) {
      console.error("Upload failed:", error);
      setUploadError(
        error instanceof Error ? error.message : "Failed to upload image",
      );
    } finally {
      setIsUploadingImage(false);
    }
  };

  /**
   * Handle drag-drop image upload
   */
  const handleDrop = (e: DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("image/")) {
      handleImageUpload(file);
    }
  };

  /**
   * Handle file input change (button upload)
   */
  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /**
   * Delete image from Vercel Blob Storage and remove from markdown
   */
  const handleDeleteImage = async (imageUrl: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this image? This will remove it from Vercel Blob Storage and your post content.",
      )
    ) {
      return;
    }

    setDeletingImageUrl(imageUrl);
    setUploadError(null);

    try {
      // Delete from Vercel Blob Storage
      const response = await fetch("/api/admin/blog/delete-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: imageUrl }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete image");
      }

      // Remove from markdown content
      const imageRegex = new RegExp(
        `!\\[([^\\]]*)\\]\\(${imageUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\)`,
        "g",
      );
      const newContent = content.replace(imageRegex, "");

      onContentChange(newContent);
    } catch (error) {
      console.error("Delete failed:", error);
      setUploadError(
        error instanceof Error ? error.message : "Failed to delete image",
      );
    } finally {
      setDeletingImageUrl(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Input */}
      <div className="space-y-2">
        <Label htmlFor={titleId}>Title</Label>
        <input
          id={titleId}
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Enter post title..."
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Editor Controls */}
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex gap-2">
          <Button
            type="button"
            variant={showPreview ? "default" : "outline"}
            size="sm"
            onClick={() => setShowPreview(true)}
          >
            Preview
          </Button>
          <Button
            type="button"
            variant={!showPreview ? "default" : "outline"}
            size="sm"
            onClick={() => setShowPreview(false)}
          >
            Edit
          </Button>

          {!showPreview && (
            <>
              <div className="h-6 w-px bg-border" />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingImage}
              >
                {isUploadingImage ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ImagePlus className="h-4 w-4" />
                )}
                <span className="ml-2">Insert Image</span>
              </Button>
              <input
                ref={fileInputRef}
                id={fileInputId}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                className="hidden"
                onChange={handleFileSelect}
              />
            </>
          )}
        </div>

        <div className="flex items-center gap-4">
          {isUploadingImage && (
            <span className="text-sm text-muted-foreground">
              Uploading image...
            </span>
          )}
          <span className="text-sm text-muted-foreground">
            {charCount} characters · {wordCount} words
          </span>
        </div>
      </div>

      {/* Upload Error Alert */}
      {uploadError && (
        <Alert variant="destructive">
          <AlertDescription>{uploadError}</AlertDescription>
        </Alert>
      )}

      {/* T012: AI Analysis Status */}
      {isAnalyzing && (
        <Alert>
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription>
            Analyzing content for metadata suggestions...
          </AlertDescription>
        </Alert>
      )}

      {/* T012: AI Analysis Error */}
      {analysisError && !isAnalyzing && (
        <Alert variant="destructive">
          <AlertDescription>{analysisError}</AlertDescription>
        </Alert>
      )}

      {/* T012: Changes Detected Indicator */}
      {hasChanges && !isAnalyzing && onSuggestMetadata && (
        <Alert>
          <Sparkles className="h-4 w-4" />
          <AlertDescription>
            Content has changed. AI suggestions will be generated when you save.
          </AlertDescription>
        </Alert>
      )}

      {/* Editor / Preview */}
      <div className="min-h-[500px]">
        {showPreview ? (
          <div className="border rounded-md p-6 bg-white dark:bg-gray-900">
            <h2 className="text-3xl font-bold mb-6">{title || "Untitled"}</h2>
            {content ? (
              <BlogContent content={content} />
            ) : (
              <p className="text-muted-foreground italic">
                No content yet. Switch to Edit mode to start writing.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor={contentId}>
              Content (Markdown)
              <span className="ml-2 text-xs text-muted-foreground">
                Supports GitHub Flavored Markdown · Drag images to upload
              </span>
            </Label>
            <Textarea
              ref={textareaRef}
              id={contentId}
              value={content}
              onChange={(e) => onContentChange(e.target.value)}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              placeholder="Write your post content in Markdown...

# Heading 1
## Heading 2

**Bold text** and *italic text*

- List item 1
- List item 2

```javascript
// Code blocks
const example = 'Hello World';
```

[Links](https://example.com)
![Images](image-url)
"
              className="min-h-[500px] font-mono text-sm"
            />
          </div>
        )}
      </div>

      {/* Markdown Help */}
      {!showPreview && (
        <div className="text-xs text-muted-foreground space-y-1 border-t pt-4">
          <p className="font-semibold">Markdown Quick Reference:</p>
          <p>
            <code># Heading</code> · <code>**bold**</code> ·{" "}
            <code>*italic*</code> · <code>`code`</code> ·{" "}
            <code>[link](url)</code> · <code>![image](url)</code> ·{" "}
            <code>- list</code> · <code>```code block```</code>
          </p>
        </div>
      )}

      {/* Uploaded Images Gallery */}
      {uploadedImages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Uploaded Images</CardTitle>
            <CardDescription>
              Images uploaded to Vercel Blob Storage for this post. Delete
              unused images to free up space.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {uploadedImages.map((image) => (
                <div
                  key={image.url}
                  className="relative group border rounded-lg p-2 bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="aspect-video relative bg-background rounded overflow-hidden mb-2">
                    <Image
                      src={image.url}
                      alt={image.alt || "Uploaded image"}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    />
                  </div>
                  <div className="space-y-2">
                    {image.alt && (
                      <p className="text-xs text-muted-foreground truncate">
                        {image.alt}
                      </p>
                    )}
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleDeleteImage(image.url)}
                        disabled={deletingImageUrl === image.url}
                      >
                        {deletingImageUrl === image.url ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Trash2 className="h-3 w-3" />
                        )}
                        <span className="ml-1 text-xs">Delete</span>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(image.url, "_blank")}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
