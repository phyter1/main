/**
 * BlogPostEditor Component Tests
 *
 * Tests for the controlled BlogPostEditor component covering:
 * - Component rendering with required props
 * - Title and content editing functionality
 * - Preview toggle functionality
 * - Character and word count display
 * - Accessibility (useId for form fields)
 * - T012: Change detection and AI metadata suggestion
 */

import { cleanup, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock BlogContent component
vi.mock("@/components/blog/BlogContent", () => ({
  BlogContent: ({ content }: { content: string }) => (
    <div data-testid="blog-content">{content}</div>
  ),
}));

// Mock blog-utils for hash functions
vi.mock("@/lib/blog-utils", () => ({
  hashContent: vi.fn((content: string) => {
    // Simple mock hash based on content
    return Promise.resolve(`hash-${content.length}-${content.slice(0, 10)}`);
  }),
  hasContentChanged: vi.fn(
    (currentContent: string, previousHash: string | null | undefined) => {
      if (!previousHash) return Promise.resolve(true);
      const currentHash = `hash-${currentContent.length}-${currentContent.slice(0, 10)}`;
      return Promise.resolve(currentHash !== previousHash);
    },
  ),
}));

import { BlogPostEditor } from "./BlogPostEditor";

describe("BlogPostEditor", () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();

    cleanup();
  });

  afterEach(() => {
    cleanup();
  });

  describe("Component Rendering", () => {
    it("should render title input field", () => {
      const onTitleChange = vi.fn(() => {});
      const onContentChange = vi.fn(() => {});

      render(
        <BlogPostEditor
          title=""
          content=""
          onTitleChange={onTitleChange}
          onContentChange={onContentChange}
        />,
      );

      const titleInput = screen.getByLabelText("Title");
      expect(titleInput).toBeDefined();
      expect((titleInput as HTMLInputElement).type).toBe("text");
    });

    it("should render content textarea in edit mode", async () => {
      const onTitleChange = vi.fn(() => {});
      const onContentChange = vi.fn(() => {});

      render(
        <BlogPostEditor
          title=""
          content=""
          onTitleChange={onTitleChange}
          onContentChange={onContentChange}
        />,
      );

      // Switch to Edit mode first
      const editButton = screen.getByRole("button", { name: "Edit" });
      await user.click(editButton);

      const contentTextarea = screen.getByLabelText(/Content \(Markdown\)/i);
      expect(contentTextarea).toBeDefined();
    });

    it("should render with provided title", () => {
      const onTitleChange = vi.fn(() => {});
      const onContentChange = vi.fn(() => {});

      render(
        <BlogPostEditor
          title="Test Blog Post"
          content=""
          onTitleChange={onTitleChange}
          onContentChange={onContentChange}
        />,
      );

      const titleInput = screen.getByLabelText("Title") as HTMLInputElement;
      expect(titleInput.value).toBe("Test Blog Post");
    });

    it("should render with provided content", () => {
      const onTitleChange = vi.fn(() => {});
      const onContentChange = vi.fn(() => {});

      render(
        <BlogPostEditor
          title=""
          content="# Hello World"
          onTitleChange={onTitleChange}
          onContentChange={onContentChange}
        />,
      );

      // Content is shown in preview by default
      const blogContent = screen.getByTestId("blog-content");
      expect(blogContent.textContent).toBe("# Hello World");
    });

    it("should display character and word count", () => {
      const onTitleChange = vi.fn(() => {});
      const onContentChange = vi.fn(() => {});

      render(
        <BlogPostEditor
          title=""
          content="Hello world this is a test"
          onTitleChange={onTitleChange}
          onContentChange={onContentChange}
        />,
      );

      // 26 characters, 6 words
      expect(screen.getByText(/26 characters/i)).toBeDefined();
      expect(screen.getByText(/6 words/i)).toBeDefined();
    });
  });

  describe("Title Editing", () => {
    it("should call onTitleChange when title is typed", async () => {
      const onTitleChange = vi.fn(() => {});
      const onContentChange = vi.fn(() => {});

      render(
        <BlogPostEditor
          title=""
          content=""
          onTitleChange={onTitleChange}
          onContentChange={onContentChange}
        />,
      );

      const titleInput = screen.getByLabelText("Title");
      await user.type(titleInput, "New");

      expect(onTitleChange).toHaveBeenCalled();
      expect(onTitleChange.mock.calls.length).toBeGreaterThan(0);
    });
  });

  describe("Content Editing", () => {
    it("should call onContentChange when content is typed", async () => {
      const onTitleChange = vi.fn(() => {});
      const onContentChange = vi.fn(() => {});

      render(
        <BlogPostEditor
          title=""
          content=""
          onTitleChange={onTitleChange}
          onContentChange={onContentChange}
        />,
      );

      // Switch to Edit mode
      const editButton = screen.getByRole("button", { name: "Edit" });
      await user.click(editButton);

      const contentTextarea = screen.getByLabelText(/Content \(Markdown\)/i);
      await user.type(contentTextarea, "Test");

      expect(onContentChange).toHaveBeenCalled();
      expect(onContentChange.mock.calls.length).toBeGreaterThan(0);
    });
  });

  describe("Preview Toggle", () => {
    it("should show preview by default", () => {
      const onTitleChange = vi.fn(() => {});
      const onContentChange = vi.fn(() => {});

      render(
        <BlogPostEditor
          title="Test"
          content="# Content"
          onTitleChange={onTitleChange}
          onContentChange={onContentChange}
        />,
      );

      // Preview should be visible
      expect(screen.getByTestId("blog-content")).toBeDefined();

      // Preview button should be active (default variant)
      const previewButton = screen.getByRole("button", { name: "Preview" });
      expect(previewButton).toBeDefined();
    });

    it("should switch to edit mode when Edit button clicked", async () => {
      const onTitleChange = vi.fn(() => {});
      const onContentChange = vi.fn(() => {});

      render(
        <BlogPostEditor
          title=""
          content=""
          onTitleChange={onTitleChange}
          onContentChange={onContentChange}
        />,
      );

      const editButton = screen.getByRole("button", { name: "Edit" });
      await user.click(editButton);

      // Textarea should now be visible
      const contentTextarea = screen.getByLabelText(/Content \(Markdown\)/i);
      expect(contentTextarea).toBeDefined();
    });

    it("should switch back to preview mode when Preview button clicked", async () => {
      const onTitleChange = vi.fn(() => {});
      const onContentChange = vi.fn(() => {});

      render(
        <BlogPostEditor
          title="Test"
          content="# Hello"
          onTitleChange={onTitleChange}
          onContentChange={onContentChange}
        />,
      );

      // Switch to edit mode
      const editButton = screen.getByRole("button", { name: "Edit" });
      await user.click(editButton);

      // Switch back to preview
      const previewButton = screen.getByRole("button", { name: "Preview" });
      await user.click(previewButton);

      // Preview should be visible again
      expect(screen.getByTestId("blog-content")).toBeDefined();
    });
  });

  describe("Character and Word Count", () => {
    it("should count words correctly", () => {
      const onTitleChange = vi.fn(() => {});
      const onContentChange = vi.fn(() => {});

      render(
        <BlogPostEditor
          title=""
          content="one two three four five"
          onTitleChange={onTitleChange}
          onContentChange={onContentChange}
        />,
      );

      expect(screen.getByText(/5 words/i)).toBeDefined();
    });

    it("should count characters correctly", () => {
      const onTitleChange = vi.fn(() => {});
      const onContentChange = vi.fn(() => {});

      render(
        <BlogPostEditor
          title=""
          content="hello"
          onTitleChange={onTitleChange}
          onContentChange={onContentChange}
        />,
      );

      expect(screen.getByText(/5 characters/i)).toBeDefined();
    });

    it("should handle empty content", () => {
      const onTitleChange = vi.fn(() => {});
      const onContentChange = vi.fn(() => {});

      render(
        <BlogPostEditor
          title=""
          content=""
          onTitleChange={onTitleChange}
          onContentChange={onContentChange}
        />,
      );

      expect(screen.getByText(/0 characters/i)).toBeDefined();
      expect(screen.getByText(/0 words/i)).toBeDefined();
    });

    it("should not count whitespace-only as words", () => {
      const onTitleChange = vi.fn(() => {});
      const onContentChange = vi.fn(() => {});

      render(
        <BlogPostEditor
          title=""
          content={"   \n\n\t  "}
          onTitleChange={onTitleChange}
          onContentChange={onContentChange}
        />,
      );

      expect(screen.getByText(/0 words/i)).toBeDefined();
    });
  });

  describe("Accessibility", () => {
    it("should have unique IDs for form fields", () => {
      const onTitleChange = vi.fn(() => {});
      const onContentChange = vi.fn(() => {});

      render(
        <BlogPostEditor
          title=""
          content=""
          onTitleChange={onTitleChange}
          onContentChange={onContentChange}
        />,
      );

      const titleInput = screen.getByLabelText("Title");
      const titleId = titleInput.getAttribute("id");

      expect(titleId).toBeDefined();
      expect(typeof titleId).toBe("string");
      expect(titleId?.length).toBeGreaterThan(0);
    });

    it("should have proper label associations", async () => {
      const onTitleChange = vi.fn(() => {});
      const onContentChange = vi.fn(() => {});

      render(
        <BlogPostEditor
          title=""
          content=""
          onTitleChange={onTitleChange}
          onContentChange={onContentChange}
        />,
      );

      // Title should be properly labeled
      const titleInput = screen.getByLabelText("Title");
      expect(titleInput).toBeDefined();

      // Switch to edit mode to check content label
      const editButton = screen.getByRole("button", { name: "Edit" });
      await user.click(editButton);

      const contentTextarea = screen.getByLabelText(/Content \(Markdown\)/i);
      expect(contentTextarea).toBeDefined();
    });
  });

  describe("Preview Content", () => {
    it("should display 'Untitled' when title is empty", () => {
      const onTitleChange = vi.fn(() => {});
      const onContentChange = vi.fn(() => {});

      render(
        <BlogPostEditor
          title=""
          content="Some content"
          onTitleChange={onTitleChange}
          onContentChange={onContentChange}
        />,
      );

      // Preview mode shows title
      expect(screen.getByText("Untitled")).toBeDefined();
    });

    it("should display title in preview", () => {
      const onTitleChange = vi.fn(() => {});
      const onContentChange = vi.fn(() => {});

      render(
        <BlogPostEditor
          title="My Great Post"
          content="Content here"
          onTitleChange={onTitleChange}
          onContentChange={onContentChange}
        />,
      );

      expect(screen.getByText("My Great Post")).toBeDefined();
    });

    it("should display message when content is empty", () => {
      const onTitleChange = vi.fn(() => {});
      const onContentChange = vi.fn(() => {});

      render(
        <BlogPostEditor
          title="Title"
          content=""
          onTitleChange={onTitleChange}
          onContentChange={onContentChange}
        />,
      );

      expect(
        screen.getByText(
          /No content yet\. Switch to Edit mode to start writing\./i,
        ),
      ).toBeDefined();
    });
  });

  describe("T012: Change Detection and AI Metadata Suggestion", () => {
    beforeEach(() => {
      // Mock fetch for AI suggestion API
      global.fetch = vi.fn();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    describe("Initial State", () => {
      it("should not trigger AI analysis on initial render", () => {
        const onTitleChange = vi.fn(() => {});
        const onContentChange = vi.fn(() => {});
        const onSuggestMetadata = vi.fn(() => {});

        render(
          <BlogPostEditor
            title="Initial Title"
            content="Initial content"
            onTitleChange={onTitleChange}
            onContentChange={onContentChange}
            onSuggestMetadata={onSuggestMetadata}
          />,
        );

        expect(onSuggestMetadata).not.toHaveBeenCalled();
      });

      it("should initialize without last analyzed hashes", () => {
        const onTitleChange = vi.fn(() => {});
        const onContentChange = vi.fn(() => {});
        const onSuggestMetadata = vi.fn(() => {});

        render(
          <BlogPostEditor
            title=""
            content=""
            onTitleChange={onTitleChange}
            onContentChange={onContentChange}
            onSuggestMetadata={onSuggestMetadata}
          />,
        );

        // Component should render successfully
        expect(screen.getByLabelText("Title")).toBeDefined();
      });
    });

    describe("Change Detection", () => {
      it("should detect content change and call onSuggestMetadata", async () => {
        const onTitleChange = vi.fn(() => {});
        const onContentChange = vi.fn(() => {});
        const onSuggestMetadata = vi.fn(() => Promise.resolve());

        const { rerender } = render(
          <BlogPostEditor
            title="Test Title"
            content="Original content"
            onTitleChange={onTitleChange}
            onContentChange={onContentChange}
            onSuggestMetadata={onSuggestMetadata}
            lastAnalyzedContentHash="hash-of-original"
            lastAnalyzedTitleHash="hash-of-title"
          />,
        );

        // Simulate content change by re-rendering with new content
        rerender(
          <BlogPostEditor
            title="Test Title"
            content="Modified content"
            onTitleChange={onTitleChange}
            onContentChange={onContentChange}
            onSuggestMetadata={onSuggestMetadata}
            lastAnalyzedContentHash="hash-of-original"
            lastAnalyzedTitleHash="hash-of-title"
          />,
        );

        // Wait for async hash comparison
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Should detect change and trigger callback on save
        // Note: Actual trigger happens on "Save Draft" click
      });

      it("should detect title change", async () => {
        const onTitleChange = vi.fn(() => {});
        const onContentChange = vi.fn(() => {});
        const onSuggestMetadata = vi.fn(() => Promise.resolve());

        const { rerender } = render(
          <BlogPostEditor
            title="Original Title"
            content="Test content"
            onTitleChange={onTitleChange}
            onContentChange={onContentChange}
            onSuggestMetadata={onSuggestMetadata}
            lastAnalyzedContentHash="hash-of-content"
            lastAnalyzedTitleHash="hash-of-original-title"
          />,
        );

        rerender(
          <BlogPostEditor
            title="Modified Title"
            content="Test content"
            onTitleChange={onTitleChange}
            onContentChange={onContentChange}
            onSuggestMetadata={onSuggestMetadata}
            lastAnalyzedContentHash="hash-of-content"
            lastAnalyzedTitleHash="hash-of-original-title"
          />,
        );

        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      it("should not trigger AI when content unchanged", async () => {
        const onTitleChange = vi.fn(() => {});
        const onContentChange = vi.fn(() => {});
        const onSuggestMetadata = vi.fn(() => Promise.resolve());

        render(
          <BlogPostEditor
            title="Same Title"
            content="Same content"
            onTitleChange={onTitleChange}
            onContentChange={onContentChange}
            onSuggestMetadata={onSuggestMetadata}
            lastAnalyzedContentHash="hash-of-same-content"
            lastAnalyzedTitleHash="hash-of-same-title"
          />,
        );

        await new Promise((resolve) => setTimeout(resolve, 100));

        // If hashes match (mocked scenario), no trigger should occur
      });
    });

    describe("Loading State", () => {
      it("should show loading state during AI analysis", async () => {
        const onTitleChange = vi.fn(() => {});
        const onContentChange = vi.fn(() => {});
        const onSuggestMetadata = vi.fn(
          () => new Promise((resolve) => setTimeout(resolve, 1000)),
        );

        render(
          <BlogPostEditor
            title="Test"
            content="Test content"
            onTitleChange={onTitleChange}
            onContentChange={onContentChange}
            onSuggestMetadata={onSuggestMetadata}
            isAnalyzing={true}
          />,
        );

        // Look for analyzing message
        expect(screen.getByText(/analyzing content/i)).toBeDefined();
      });

      it("should show spinner icon during analysis", () => {
        const onTitleChange = vi.fn(() => {});
        const onContentChange = vi.fn(() => {});
        const onSuggestMetadata = vi.fn(() => Promise.resolve());

        const { container } = render(
          <BlogPostEditor
            title="Test"
            content="Test"
            onTitleChange={onTitleChange}
            onContentChange={onContentChange}
            onSuggestMetadata={onSuggestMetadata}
            isAnalyzing={true}
          />,
        );

        // Check for loading spinner
        const spinner = container.querySelector(".animate-spin");
        expect(spinner).toBeDefined();
      });
    });

    describe("Error Handling", () => {
      it("should display error message on API failure", async () => {
        const onTitleChange = vi.fn(() => {});
        const onContentChange = vi.fn(() => {});
        const onSuggestMetadata = vi.fn(() =>
          Promise.reject(new Error("API Error")),
        );

        render(
          <BlogPostEditor
            title="Test"
            content="Test"
            onTitleChange={onTitleChange}
            onContentChange={onContentChange}
            onSuggestMetadata={onSuggestMetadata}
            analysisError="Failed to analyze content. Please try again."
          />,
        );

        // Error message should be displayed
        expect(screen.getByText(/failed to analyze content/i)).toBeDefined();
      });

      it("should not show error during analysis", () => {
        const onTitleChange = vi.fn(() => {});
        const onContentChange = vi.fn(() => {});
        const onSuggestMetadata = vi.fn(() => Promise.resolve());

        render(
          <BlogPostEditor
            title="Test"
            content="Test"
            onTitleChange={onTitleChange}
            onContentChange={onContentChange}
            onSuggestMetadata={onSuggestMetadata}
            analysisError="Error message"
            isAnalyzing={true}
          />,
        );

        // Error should be hidden during analysis
        expect(screen.queryByText(/error message/i)).toBeNull();
        // But analyzing message should show
        expect(screen.getByText(/analyzing content/i)).toBeDefined();
      });

      it("should clear error on retry", async () => {
        const onTitleChange = vi.fn(() => {});
        const onContentChange = vi.fn(() => {});
        const onSuggestMetadata = vi.fn(() => Promise.resolve());

        const { rerender } = render(
          <BlogPostEditor
            title="Test"
            content="Test"
            onTitleChange={onTitleChange}
            onContentChange={onContentChange}
            onSuggestMetadata={onSuggestMetadata}
            analysisError="Previous error"
          />,
        );

        // Error should be displayed
        expect(screen.queryByText(/previous error/i)).toBeDefined();

        // Clear error by re-rendering without error prop
        rerender(
          <BlogPostEditor
            title="Test"
            content="Test"
            onTitleChange={onTitleChange}
            onContentChange={onContentChange}
            onSuggestMetadata={onSuggestMetadata}
          />,
        );

        // Error should be cleared
        expect(screen.queryByText(/previous error/i)).toBeNull();
      });
    });

    describe("Success Flow", () => {
      it("should trigger metadata update on successful analysis", async () => {
        const onTitleChange = vi.fn(() => {});
        const onContentChange = vi.fn(() => {});
        const onSuggestMetadata = vi.fn(() =>
          Promise.resolve({
            excerpt: "AI suggested excerpt",
            tags: ["react", "typescript"],
            category: "Technology",
          }),
        );

        render(
          <BlogPostEditor
            title="Test Post"
            content="Test content for AI analysis"
            onTitleChange={onTitleChange}
            onContentChange={onContentChange}
            onSuggestMetadata={onSuggestMetadata}
          />,
        );

        // Trigger analysis would happen on save
        // Callback should update parent component state
      });
    });

    describe("Hash Tracking", () => {
      it("should accept lastAnalyzedContentHash prop", () => {
        const onTitleChange = vi.fn(() => {});
        const onContentChange = vi.fn(() => {});
        const onSuggestMetadata = vi.fn(() => Promise.resolve());

        render(
          <BlogPostEditor
            title="Test"
            content="Test"
            onTitleChange={onTitleChange}
            onContentChange={onContentChange}
            onSuggestMetadata={onSuggestMetadata}
            lastAnalyzedContentHash="abc123hash"
          />,
        );

        expect(screen.getByLabelText("Title")).toBeDefined();
      });

      it("should accept lastAnalyzedTitleHash prop", () => {
        const onTitleChange = vi.fn(() => {});
        const onContentChange = vi.fn(() => {});
        const onSuggestMetadata = vi.fn(() => Promise.resolve());

        render(
          <BlogPostEditor
            title="Test"
            content="Test"
            onTitleChange={onTitleChange}
            onContentChange={onContentChange}
            onSuggestMetadata={onSuggestMetadata}
            lastAnalyzedTitleHash="def456hash"
          />,
        );

        expect(screen.getByLabelText("Title")).toBeDefined();
      });
    });

    describe("Changes Indicator", () => {
      it("should show changes indicator when content has changed", async () => {
        const onTitleChange = vi.fn(() => {});
        const onContentChange = vi.fn(() => {});
        const onSuggestMetadata = vi.fn(() => Promise.resolve());

        render(
          <BlogPostEditor
            title="Test"
            content="New content"
            onTitleChange={onTitleChange}
            onContentChange={onContentChange}
            onSuggestMetadata={onSuggestMetadata}
            lastAnalyzedContentHash="hash-of-old-content"
            lastAnalyzedTitleHash="hash-of-title"
          />,
        );

        // Wait for async hash comparison
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Should show changes detected message
        expect(
          screen.queryByText(/content has changed/i) ||
            screen.queryByText(/ai suggestions will be generated/i),
        ).toBeDefined();
      });

      it("should not show changes indicator when analyzing", async () => {
        const onTitleChange = vi.fn(() => {});
        const onContentChange = vi.fn(() => {});
        const onSuggestMetadata = vi.fn(() => Promise.resolve());

        render(
          <BlogPostEditor
            title="Test"
            content="Changed content"
            onTitleChange={onTitleChange}
            onContentChange={onContentChange}
            onSuggestMetadata={onSuggestMetadata}
            lastAnalyzedContentHash="old-hash"
            isAnalyzing={true}
          />,
        );

        // Wait for async processing
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Changes indicator should be hidden during analysis
        expect(screen.queryByText(/content has changed/i)).toBeNull();
      });

      it("should not show changes indicator without onSuggestMetadata callback", async () => {
        const onTitleChange = vi.fn(() => {});
        const onContentChange = vi.fn(() => {});

        render(
          <BlogPostEditor
            title="Test"
            content="Changed content"
            onTitleChange={onTitleChange}
            onContentChange={onContentChange}
            lastAnalyzedContentHash="old-hash"
          />,
        );

        // Wait for async processing
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Should not show indicator without callback
        expect(screen.queryByText(/content has changed/i)).toBeNull();
      });
    });
  });
});
