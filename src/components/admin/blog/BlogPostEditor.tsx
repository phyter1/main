"use client";

/**
 * BlogPostEditor Component
 *
 * Controlled Markdown editor for blog posts with:
 * - Plain textarea for Markdown input
 * - Live preview with GitHub Flavored Markdown
 * - Character and word count display
 */

import { useId, useState } from "react";
import { BlogContent } from "@/components/blog/BlogContent";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface BlogPostEditorProps {
  title: string;
  content: string;
  onTitleChange: (title: string) => void;
  onContentChange: (content: string) => void;
}

export function BlogPostEditor({
  title,
  content,
  onTitleChange,
  onContentChange,
}: BlogPostEditorProps) {
  const titleId = useId();
  const contentId = useId();
  const [showPreview, setShowPreview] = useState(true);

  // Character and word count
  const charCount = content.length;
  const wordCount = content
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;

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
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {charCount} characters · {wordCount} words
          </span>
        </div>
      </div>

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
                Supports GitHub Flavored Markdown
              </span>
            </Label>
            <Textarea
              id={contentId}
              value={content}
              onChange={(e) => onContentChange(e.target.value)}
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
            <code>[link](url)</code> · <code>- list</code> ·{" "}
            <code>```code block```</code>
          </p>
        </div>
      )}
    </div>
  );
}
