/**
 * BlogPostEditor Component Tests
 *
 * Tests for the controlled BlogPostEditor component covering:
 * - Component rendering with required props
 * - Title and content editing functionality
 * - Preview toggle functionality
 * - Character and word count display
 * - Accessibility (useId for form fields)
 */

import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { BlogPostEditor } from "./BlogPostEditor";

// Mock BlogContent component
mock.module("@/components/blog/BlogContent", () => ({
  BlogContent: ({ content }: { content: string }) => (
    <div data-testid="blog-content">{content}</div>
  ),
}));

describe("BlogPostEditor", () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    mock.restore();
    cleanup();
  });

  afterEach(() => {
    mock.restore();
    cleanup();
  });

  describe("Component Rendering", () => {
    it("should render title input field", () => {
      const onTitleChange = mock(() => {});
      const onContentChange = mock(() => {});

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
      const onTitleChange = mock(() => {});
      const onContentChange = mock(() => {});

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
      const onTitleChange = mock(() => {});
      const onContentChange = mock(() => {});

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
      const onTitleChange = mock(() => {});
      const onContentChange = mock(() => {});

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
      const onTitleChange = mock(() => {});
      const onContentChange = mock(() => {});

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
      const onTitleChange = mock(() => {});
      const onContentChange = mock(() => {});

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
      const onTitleChange = mock(() => {});
      const onContentChange = mock(() => {});

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
      const onTitleChange = mock(() => {});
      const onContentChange = mock(() => {});

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
      const onTitleChange = mock(() => {});
      const onContentChange = mock(() => {});

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
      const onTitleChange = mock(() => {});
      const onContentChange = mock(() => {});

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
      const onTitleChange = mock(() => {});
      const onContentChange = mock(() => {});

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
      const onTitleChange = mock(() => {});
      const onContentChange = mock(() => {});

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
      const onTitleChange = mock(() => {});
      const onContentChange = mock(() => {});

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
      const onTitleChange = mock(() => {});
      const onContentChange = mock(() => {});

      render(
        <BlogPostEditor
          title=""
          content="   \n\n\t  "
          onTitleChange={onTitleChange}
          onContentChange={onContentChange}
        />,
      );

      expect(screen.getByText(/0 words/i)).toBeDefined();
    });
  });

  describe("Accessibility", () => {
    it("should have unique IDs for form fields", () => {
      const onTitleChange = mock(() => {});
      const onContentChange = mock(() => {});

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
      const onTitleChange = mock(() => {});
      const onContentChange = mock(() => {});

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
      const onTitleChange = mock(() => {});
      const onContentChange = mock(() => {});

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
      const onTitleChange = mock(() => {});
      const onContentChange = mock(() => {});

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
      const onTitleChange = mock(() => {});
      const onContentChange = mock(() => {});

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
});
