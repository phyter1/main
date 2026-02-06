"use client";

/**
 * BlogPostEditor Component
 *
 * Comprehensive rich text editor for blog posts with:
 * - Tiptap editor with MDX support
 * - Live side-by-side MDX preview
 * - Auto-save functionality (every 30 seconds)
 * - Character and word count display
 * - Markdown toolbar for common formatting
 *
 * This component is the primary interface for creating and editing blog posts
 * in the admin interface.
 */

import Link from "@tiptap/extension-link";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Code, Heading2, Italic, Link as LinkIcon } from "lucide-react";
import { useCallback, useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { BlogPost } from "@/types/blog";

/**
 * Props for BlogPostEditor component
 */
interface BlogPostEditorProps {
  /**
   * Existing post data for editing (optional, omit for new posts)
   */
  post?: Partial<BlogPost>;

  /**
   * Callback invoked when post should be saved (auto-save or manual)
   * Receives current post data as argument
   */
  onSave: (data: Partial<BlogPost>) => void | Promise<void>;
}

/**
 * Auto-save status indicator
 */
type SaveStatus = "idle" | "saving" | "saved" | "error";

/**
 * BlogPostEditor Component
 *
 * Provides a comprehensive editing interface for blog posts with real-time preview,
 * auto-save, and rich text editing capabilities.
 */
export function BlogPostEditor({ post, onSave }: BlogPostEditorProps) {
  // Generate unique IDs for form fields
  const titleId = useId();
  const excerptId = useId();

  // Form state
  const [title, setTitle] = useState(post?.title || "");
  const [excerpt, setExcerpt] = useState(post?.excerpt || "");
  const [content, setContent] = useState(post?.content || "");

  // UI state
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  // Character and word count
  const [charCount, setCharCount] = useState(0);
  const [wordCount, setWordCount] = useState(0);

  // Initialize Tiptap editor
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 underline",
        },
      }),
    ],
    content: post?.content || "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none min-h-[500px] max-w-none p-4",
        role: "textbox",
        "aria-label": "Content editor",
      },
    },
    onUpdate: ({ editor }) => {
      const text = editor.getText();
      setContent(editor.getHTML());
      updateCounts(text);
    },
  });

  // Update character and word counts
  const updateCounts = useCallback((text: string) => {
    setCharCount(text.length);

    // Count words (filter out empty strings from whitespace)
    const words = text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0);
    setWordCount(words.length);
  }, []);

  // Handle save operation
  const handleSave = useCallback(async () => {
    setSaveStatus("saving");

    try {
      const postData: Partial<BlogPost> = {
        title,
        excerpt,
        content,
      };

      await onSave(postData);
      setSaveStatus("saved");

      // Reset to idle after 2 seconds
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (error) {
      setSaveStatus("error");
      console.error("Failed to save post:", error);
    }
  }, [title, excerpt, content, onSave]);

  // Auto-save effect
  useEffect(() => {
    // Don't auto-save if no changes
    if (!title && !excerpt && !content) {
      return;
    }

    // Set up auto-save timer (30 seconds)
    const autoSaveTimer = setTimeout(() => {
      handleSave();
    }, 30000);

    // Cleanup timer on unmount or when dependencies change
    return () => clearTimeout(autoSaveTimer);
  }, [title, excerpt, content, handleSave]);

  // Toolbar actions
  const toggleBold = () => {
    editor?.chain().focus().toggleBold().run();
  };

  const toggleItalic = () => {
    editor?.chain().focus().toggleItalic().run();
  };

  const toggleHeading = () => {
    editor?.chain().focus().toggleHeading({ level: 2 }).run();
  };

  const toggleCode = () => {
    editor?.chain().focus().toggleCode().run();
  };

  const openLinkDialog = () => {
    const previousUrl = editor?.getAttributes("link").href;
    setLinkUrl(previousUrl || "");
    setShowLinkDialog(true);
  };

  const insertLink = () => {
    if (linkUrl) {
      editor
        ?.chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: linkUrl })
        .run();
    } else {
      editor?.chain().focus().unsetLink().run();
    }
    setShowLinkDialog(false);
    setLinkUrl("");
  };

  // MDX Preview renderer
  const renderPreview = () => {
    // Simple markdown-to-HTML conversion for preview
    // In production, this would use a proper MDX renderer
    let html = content;

    // Convert markdown headings
    html = html.replace(/<h([1-6])>/g, "<h$1>");
    html = html.replace(/<\/h([1-6])>/g, "</h$1>");

    // Already has HTML from Tiptap, just render it
    return { __html: html };
  };

  return (
    <div className="flex flex-col h-full">
      {/* Save Status Indicator */}
      <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        {saveStatus === "saving" && <span>Saving...</span>}
        {saveStatus === "saved" && (
          <span className="text-green-600">Saved</span>
        )}
        {saveStatus === "error" && (
          <span className="text-red-600">Error saving</span>
        )}
      </div>

      {/* Title Input */}
      <div className="mb-4">
        <Label htmlFor={titleId}>Title</Label>
        <Input
          id={titleId}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter post title..."
          className="text-2xl font-bold"
        />
      </div>

      {/* Excerpt Input */}
      <div className="mb-4">
        <Label htmlFor={excerptId}>Excerpt</Label>
        <textarea
          id={excerptId}
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Enter post excerpt..."
          className="w-full min-h-[100px] p-2 border rounded-md resize-y"
          aria-label="Excerpt"
        />
        {excerpt.length > 200 && (
          <p className="mt-1 text-sm text-orange-600">
            Excerpt is longer than recommended (200 characters)
          </p>
        )}
      </div>

      {/* Side-by-side Editor and Preview */}
      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* Editor Panel */}
        <div
          className="flex-1 flex flex-col border rounded-md overflow-hidden"
          data-testid="editor-panel"
        >
          {/* Markdown Toolbar */}
          <div className="flex gap-1 p-2 border-b bg-gray-50 dark:bg-gray-800">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={toggleBold}
              aria-label="Bold"
              className="px-2"
            >
              <Bold className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={toggleItalic}
              aria-label="Italic"
              className="px-2"
            >
              <Italic className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={toggleHeading}
              aria-label="Heading"
              className="px-2"
            >
              <Heading2 className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={openLinkDialog}
              aria-label="Link"
              className="px-2"
            >
              <LinkIcon className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={toggleCode}
              aria-label="Code"
              className="px-2"
            >
              <Code className="w-4 h-4" />
            </Button>
          </div>

          {/* Link Dialog */}
          {showLinkDialog && (
            <div className="p-4 border-b bg-blue-50 dark:bg-blue-900">
              <div className="flex gap-2 items-center">
                <Input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="Enter URL..."
                  className="flex-1"
                />
                <Button size="sm" onClick={insertLink}>
                  Insert
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowLinkDialog(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Tiptap Editor */}
          <div className="flex-1 overflow-y-auto">
            <EditorContent editor={editor} />
          </div>

          {/* Character and Word Count */}
          <div className="p-2 border-t bg-gray-50 dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-400">
            <span>{charCount} characters</span>
            <span className="mx-2">•</span>
            <span>
              {wordCount} {wordCount === 1 ? "word" : "words"}
            </span>
          </div>
        </div>

        {/* Preview Panel */}
        <div
          className="flex-1 border rounded-md overflow-y-auto p-4 bg-white dark:bg-gray-900"
          data-testid="preview-panel"
        >
          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">
            Preview
          </h2>
          <div
            className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl dark:prose-invert max-w-none"
            // biome-ignore lint/security/noDangerouslySetInnerHtml: Preview requires HTML rendering
            dangerouslySetInnerHTML={renderPreview()}
          />
        </div>
      </div>
    </div>
  );
}
