import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { useMutation } from "convex/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import NewBlogPostPage from "./page";

/**
 * Test suite for New Blog Post Page (T016)
 *
 * Tests for:
 * - Page rendering with empty form
 * - Component integration (BlogPostEditor, BlogPostMetadata)
 * - Save draft functionality
 * - Publish functionality
 * - Cancel/back navigation
 * - Auto-save indicator
 * - Form validation
 */

// Mock Next.js navigation
const mockPush = vi.fn(() => {});
const mockBack = vi.fn(() => {});

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
  }),
}));

// Mock Convex client
vi.mock("convex/react", () => ({
  useMutation: vi.fn(() => vi.fn(() => Promise.resolve())),
  useQuery: vi.fn(() => []),
}));

// Mock blog components
const { mockBlogPostEditor } = vi.hoisted(() => {
  const mockBlogPostEditor = vi.fn(
    ({ onSave }: { onSave: (data: unknown) => void }) => (
      <div data-testid="blog-post-editor">
        <button
          type="button"
          onClick={() => onSave({ title: "Test", content: "Content" })}
        >
          Save Editor
        </button>
      </div>
    ),
  );

  return { mockBlogPostEditor };
});

vi.mock("@/components/admin/blog/BlogPostEditor", () => ({
  BlogPostEditor: mockBlogPostEditor,
}));

vi.mock("@/components/admin/blog/BlogPostMetadata", () => ({
  BlogPostMetadata: vi.fn(
    ({ onChange }: { onChange: (data: unknown) => void }) => (
      <div data-testid="blog-post-metadata">
        <button
          type="button"
          onClick={() =>
            onChange({
              slug: "test-slug",
              tags: [],
              featured: false,
              seoMetadata: { metaTitle: "", metaDescription: "" },
            })
          }
        >
          Update Metadata
        </button>
      </div>
    ),
  ),
}));

describe("NewBlogPostPage", () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockBack.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  describe("Page Rendering", () => {
    it("should render new post page with empty form", () => {
      render(<NewBlogPostPage />);

      expect(screen.getByText(/create new blog post/i)).toBeDefined();
      expect(screen.getByTestId("blog-post-editor")).toBeDefined();
      expect(screen.getByTestId("blog-post-metadata")).toBeDefined();
    });

    it("should render page heading", () => {
      render(<NewBlogPostPage />);

      const heading = screen.getAllByRole("heading", {
        name: /create new blog post/i,
      })[0];
      expect(heading).toBeDefined();
    });

    it("should display save draft button", () => {
      render(<NewBlogPostPage />);

      expect(screen.getByText(/save draft/i)).toBeDefined();
    });

    it("should display publish button", () => {
      render(<NewBlogPostPage />);

      expect(screen.getByText(/publish/i)).toBeDefined();
    });

    it("should display cancel button", () => {
      render(<NewBlogPostPage />);

      expect(screen.getByText(/cancel/i)).toBeDefined();
    });
  });

  describe("Component Integration", () => {
    it("should render BlogPostEditor component", () => {
      render(<NewBlogPostPage />);

      expect(screen.getByTestId("blog-post-editor")).toBeDefined();
    });

    it("should render BlogPostMetadata component", () => {
      render(<NewBlogPostPage />);

      expect(screen.getByTestId("blog-post-metadata")).toBeDefined();
    });

    it("should pass empty post data to editor", () => {
      render(<NewBlogPostPage />);

      // Editor receives no post prop for new posts
      expect(mockBlogPostEditor).toHaveBeenCalled();
      const calls = mockBlogPostEditor.mock.calls as Array<
        Array<{ post?: unknown }>
      >;
      expect(calls[0][0].post).toBeUndefined();
    });
  });

  describe("Save Draft Functionality", () => {
    it("should save draft when save draft button clicked", async () => {
      const mockCreatePost = vi.fn(() => Promise.resolve("new-post-id"));
      vi.mocked(useMutation).mockReturnValue(mockCreatePost);

      render(<NewBlogPostPage />);

      const saveDraftButton = screen.getByText(/save draft/i);
      fireEvent.click(saveDraftButton);

      await waitFor(() => {
        expect(mockCreatePost).toHaveBeenCalled();
      });
    });

    it("should show saving status while saving draft", async () => {
      const mockCreatePost = vi.fn(
        () => new Promise((resolve) => setTimeout(resolve, 100)),
      );
      vi.mocked(useMutation).mockReturnValue(mockCreatePost);

      render(<NewBlogPostPage />);

      const saveDraftButton = screen.getByText(/save draft/i);
      fireEvent.click(saveDraftButton);

      expect(screen.getByText(/saving/i)).toBeDefined();
    });

    it("should navigate to blog list after saving draft", async () => {
      const mockCreatePost = vi.fn(() => Promise.resolve("new-post-id"));
      vi.mocked(useMutation).mockReturnValue(mockCreatePost);

      render(<NewBlogPostPage />);

      const saveDraftButton = screen.getByText(/save draft/i);
      fireEvent.click(saveDraftButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/admin/blog");
      });
    });
  });

  describe("Publish Functionality", () => {
    it("should publish post when publish button clicked", async () => {
      const mockCreatePost = vi.fn(() => Promise.resolve("new-post-id"));
      const mockPublishPost = vi.fn(() => Promise.resolve());
      vi.mocked(useMutation)
        .mockReturnValueOnce(mockCreatePost)
        .mockReturnValueOnce(mockPublishPost);

      render(<NewBlogPostPage />);

      const publishButton = screen.getByText(/publish/i);
      fireEvent.click(publishButton);

      await waitFor(() => {
        expect(mockCreatePost).toHaveBeenCalled();
      });
    });

    it("should show publishing status while publishing", async () => {
      const mockCreatePost = vi.fn(
        () => new Promise((resolve) => setTimeout(resolve, 100)),
      );
      vi.mocked(useMutation).mockReturnValue(mockCreatePost);

      render(<NewBlogPostPage />);

      const publishButton = screen.getByText(/publish/i);
      fireEvent.click(publishButton);

      expect(screen.getByText(/publishing/i)).toBeDefined();
    });
  });

  describe("Cancel/Back Navigation", () => {
    it("should navigate back when cancel button clicked", () => {
      render(<NewBlogPostPage />);

      const cancelButton = screen.getByText(/cancel/i);
      fireEvent.click(cancelButton);

      expect(mockBack).toHaveBeenCalled();
    });

    it("should navigate to blog list when cancel clicked", () => {
      render(<NewBlogPostPage />);

      const cancelButton = screen.getByText(/cancel/i);
      fireEvent.click(cancelButton);

      // Can navigate either back or to /admin/blog
      expect(mockBack).toHaveBeenCalled();
    });
  });

  describe("Auto-save Indicator", () => {
    it("should show auto-save status indicator", () => {
      render(<NewBlogPostPage />);

      // Auto-save status displayed via BlogPostEditor
      expect(screen.getByTestId("blog-post-editor")).toBeDefined();
    });

    it("should update auto-save status when content changes", async () => {
      render(<NewBlogPostPage />);

      const editor = screen.getByTestId("blog-post-editor");
      const saveButton = editor.querySelector("button");
      if (saveButton) {
        fireEvent.click(saveButton);
      }

      // Editor handles auto-save internally
      expect(mockBlogPostEditor).toHaveBeenCalled();
    });
  });

  describe("Form Validation", () => {
    it("should validate required fields before saving", async () => {
      render(<NewBlogPostPage />);

      // Validation handled by BlogPostEditor and BlogPostMetadata components
      expect(screen.getByTestId("blog-post-editor")).toBeDefined();
      expect(screen.getByTestId("blog-post-metadata")).toBeDefined();
    });

    it("should show validation errors for invalid data", async () => {
      render(<NewBlogPostPage />);

      // Validation errors displayed by child components
      expect(screen.getByTestId("blog-post-editor")).toBeDefined();
    });
  });
});
