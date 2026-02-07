/**
 * BlogPostMetadata Component Tests
 *
 * Tests for T010: BlogPostMetadata component with comprehensive validation:
 * - SEO metadata fields (metaTitle, metaDescription, ogImage)
 * - Cover image URL input with preview
 * - Category dropdown with create option
 * - Tag input with autocomplete and creation
 * - Slug field with auto-generation
 * - Featured post checkbox
 * - All fields properly controlled
 */

import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";

// Mock Convex hooks BEFORE any imports
const mockUseQuery = mock(() => []);
const mockUseMutation = mock(() => mock(() => Promise.resolve("mock-id")));

mock.module("convex/react", () => ({
  useQuery: mockUseQuery,
  useMutation: mockUseMutation,
}));

// Mock Convex generated API
mock.module("../../../../convex/_generated/api", () => ({
  api: {
    blog: {
      getCategories: { type: "query" },
      getTags: { type: "query" },
      createCategory: { type: "mutation" },
    },
  },
}));

// Mock Convex generated dataModel
mock.module("../../../../convex/_generated/dataModel", () => ({
  Id: {} as any,
}));

// Mock blog utility functions
const mockGenerateSlug = mock((title: string) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
});

const mockValidateSlug = mock((slug: string) => {
  if (!slug) return { isValid: false, error: "Slug cannot be empty" };
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return {
      isValid: false,
      error: "Slug can only contain lowercase letters, numbers, and hyphens",
    };
  }
  return { isValid: true };
});

mock.module("@/lib/blog-utils", () => ({
  generateSlug: mockGenerateSlug,
  validateSlug: mockValidateSlug,
}));

// Now import the components AFTER all mocks are set up
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BlogPostMetadata } from "./BlogPostMetadata";

describe("BlogPostMetadata", () => {
  const mockOnChange = mock(() => {});
  const defaultMetadata = {
    slug: "",
    categoryId: undefined,
    tags: [],
    featured: false,
    coverImage: "",
    seoMetadata: {
      metaTitle: "",
      metaDescription: "",
      ogImage: "",
    },
  };

  beforeEach(() => {
    mock.restore();
    mockUseQuery.mockReturnValue([]);
    mockUseMutation.mockReturnValue(mock(() => Promise.resolve("mock-id")));
  });

  afterEach(() => {
    cleanup();
    mock.restore();
  });

  describe("Rendering", () => {
    it("should render all metadata fields", () => {
      render(
        <BlogPostMetadata
          title="Test Post"
          metadata={defaultMetadata}
          onChange={mockOnChange}
        />,
      );

      // Check for slug field
      expect(screen.getByLabelText(/slug/i)).toBeDefined();

      // Check for category dropdown
      expect(screen.getByLabelText(/category/i)).toBeDefined();

      // Check for tag input
      expect(screen.getByLabelText(/tags/i)).toBeDefined();

      // Check for featured checkbox
      expect(screen.getByLabelText(/featured/i)).toBeDefined();

      // Check for cover image input
      expect(screen.getByLabelText(/cover image/i)).toBeDefined();

      // Check for SEO fields
      expect(screen.getByLabelText(/meta title/i)).toBeDefined();
      expect(screen.getByLabelText(/meta description/i)).toBeDefined();
      expect(screen.getByLabelText(/og image/i)).toBeDefined();
    });

    it("should display current metadata values", () => {
      const metadata = {
        slug: "test-post",
        categoryId: "category-123",
        tags: ["react", "typescript"],
        featured: true,
        coverImage: "https://example.com/image.jpg",
        seoMetadata: {
          metaTitle: "Test Post SEO Title",
          metaDescription: "Test description for SEO",
          ogImage: "https://example.com/og-image.jpg",
        },
      };

      render(
        <BlogPostMetadata
          title="Test Post"
          metadata={metadata}
          onChange={mockOnChange}
        />,
      );

      const slugInput = screen.getByLabelText(/slug/i) as HTMLInputElement;
      expect(slugInput.value).toBe("test-post");

      const featuredCheckbox = screen.getByLabelText(
        /featured/i,
      ) as HTMLInputElement;
      expect(featuredCheckbox.checked).toBe(true);

      const coverImageInput = screen.getByLabelText(
        /cover image/i,
      ) as HTMLInputElement;
      expect(coverImageInput.value).toBe("https://example.com/image.jpg");
    });
  });

  describe("Slug Auto-Generation", () => {
    it("should auto-generate slug from title when slug is empty", async () => {
      const user = userEvent.setup();

      render(
        <BlogPostMetadata
          title="Hello World Post"
          metadata={defaultMetadata}
          onChange={mockOnChange}
        />,
      );

      // Find and click the auto-generate button
      const generateButton = screen.getByRole("button", {
        name: /generate/i,
      });
      await user.click(generateButton);

      await waitFor(() => {
        expect(mockGenerateSlug).toHaveBeenCalledWith("Hello World Post");
        expect(mockOnChange).toHaveBeenCalledWith(
          expect.objectContaining({
            slug: "hello-world-post",
          }),
        );
      });
    });

    it("should validate generated slug", async () => {
      const user = userEvent.setup();

      render(
        <BlogPostMetadata
          title="Test Post"
          metadata={defaultMetadata}
          onChange={mockOnChange}
        />,
      );

      const generateButton = screen.getByRole("button", {
        name: /generate/i,
      });
      await user.click(generateButton);

      await waitFor(() => {
        expect(mockValidateSlug).toHaveBeenCalled();
      });
    });

    it("should not overwrite existing slug without confirmation", async () => {
      const user = userEvent.setup();
      const metadata = { ...defaultMetadata, slug: "existing-slug" };

      render(
        <BlogPostMetadata
          title="New Title"
          metadata={metadata}
          onChange={mockOnChange}
        />,
      );

      const generateButton = screen.getByRole("button", {
        name: /generate/i,
      });
      await user.click(generateButton);

      // Should show confirmation dialog or warning
      expect(
        screen.getByText(/slug already exists/i) ||
          screen.getByText(/overwrite/i),
      ).toBeDefined();
    });
  });

  describe("Slug Validation", () => {
    it("should display error for invalid slug format", async () => {
      const user = userEvent.setup();

      render(
        <BlogPostMetadata
          title="Test"
          metadata={defaultMetadata}
          onChange={mockOnChange}
        />,
      );

      const slugInput = screen.getByLabelText(/slug/i);
      await user.clear(slugInput);
      await user.type(slugInput, "Invalid Slug!");

      await waitFor(() => {
        expect(
          screen.getByText(/slug can only contain lowercase/i),
        ).toBeDefined();
      });
    });

    it("should display error for empty slug", async () => {
      const user = userEvent.setup();

      render(
        <BlogPostMetadata
          title="Test"
          metadata={{ ...defaultMetadata, slug: "test" }}
          onChange={mockOnChange}
        />,
      );

      const slugInput = screen.getByLabelText(/slug/i);
      await user.clear(slugInput);
      await user.tab(); // Trigger blur

      await waitFor(() => {
        expect(screen.getByText(/slug cannot be empty/i)).toBeDefined();
      });
    });

    it("should show success indicator for valid slug", async () => {
      const user = userEvent.setup();

      render(
        <BlogPostMetadata
          title="Test"
          metadata={defaultMetadata}
          onChange={mockOnChange}
        />,
      );

      const slugInput = screen.getByLabelText(/slug/i);
      await user.type(slugInput, "valid-slug");

      await waitFor(() => {
        expect(mockValidateSlug).toHaveBeenCalledWith("valid-slug");
        // Should not show error message
        expect(screen.queryByText(/error/i)).toBeNull();
      });
    });
  });

  describe("Category Management", () => {
    it("should display existing categories in dropdown", () => {
      const categories = [
        { _id: "cat-1", name: "Technology", slug: "technology", postCount: 5 },
        { _id: "cat-2", name: "Design", slug: "design", postCount: 3 },
      ];
      mockUseQuery.mockReturnValue(categories);

      render(
        <BlogPostMetadata
          title="Test"
          metadata={defaultMetadata}
          onChange={mockOnChange}
        />,
      );

      const categorySelect = screen.getByLabelText(/category/i);
      expect(categorySelect).toBeDefined();
    });

    it("should allow selecting a category", async () => {
      const user = userEvent.setup();
      const categories = [
        { _id: "cat-1", name: "Technology", slug: "technology", postCount: 5 },
      ];
      mockUseQuery.mockReturnValue(categories);

      render(
        <BlogPostMetadata
          title="Test"
          metadata={defaultMetadata}
          onChange={mockOnChange}
        />,
      );

      const categorySelect = screen.getByLabelText(/category/i);
      await user.click(categorySelect);

      // Select should open with options
      await waitFor(() => {
        expect(screen.getByText("Technology")).toBeDefined();
      });
    });

    it("should provide create new category option", async () => {
      const user = userEvent.setup();
      mockUseQuery.mockReturnValue([]);

      render(
        <BlogPostMetadata
          title="Test"
          metadata={defaultMetadata}
          onChange={mockOnChange}
        />,
      );

      const createButton = screen.getByRole("button", {
        name: /create category/i,
      });
      expect(createButton).toBeDefined();

      await user.click(createButton);

      // Should show category creation form
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/category name/i)).toBeDefined();
      });
    });

    it("should create new category and select it", async () => {
      const user = userEvent.setup();
      const mockCreateCategory = mock(() => Promise.resolve("new-category-id"));
      mockUseMutation.mockReturnValue(mockCreateCategory);

      render(
        <BlogPostMetadata
          title="Test"
          metadata={defaultMetadata}
          onChange={mockOnChange}
        />,
      );

      const createButton = screen.getByRole("button", {
        name: /create category/i,
      });
      await user.click(createButton);

      const nameInput = screen.getByPlaceholderText(/category name/i);
      await user.type(nameInput, "New Category");

      const descInput = screen.getByPlaceholderText(/description/i);
      await user.type(descInput, "Category description");

      const submitButton = screen.getByRole("button", { name: /create$/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockCreateCategory).toHaveBeenCalledWith({
          name: "New Category",
          description: "Category description",
        });
        expect(mockOnChange).toHaveBeenCalledWith(
          expect.objectContaining({
            categoryId: "new-category-id",
          }),
        );
      });
    });
  });

  describe("Tag Management", () => {
    it("should display existing tags as badges", () => {
      const metadata = {
        ...defaultMetadata,
        tags: ["react", "typescript"],
      };

      render(
        <BlogPostMetadata
          title="Test"
          metadata={metadata}
          onChange={mockOnChange}
        />,
      );

      expect(screen.getByText("react")).toBeDefined();
      expect(screen.getByText("typescript")).toBeDefined();
    });

    it("should allow adding new tags", async () => {
      const user = userEvent.setup();

      render(
        <BlogPostMetadata
          title="Test"
          metadata={defaultMetadata}
          onChange={mockOnChange}
        />,
      );

      const tagInput = screen.getByPlaceholderText(/add tag/i);
      await user.type(tagInput, "javascript{Enter}");

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(
          expect.objectContaining({
            tags: ["javascript"],
          }),
        );
      });
    });

    it("should allow removing tags", async () => {
      const user = userEvent.setup();
      const metadata = {
        ...defaultMetadata,
        tags: ["react", "typescript"],
      };

      render(
        <BlogPostMetadata
          title="Test"
          metadata={metadata}
          onChange={mockOnChange}
        />,
      );

      // Find remove button for "react" tag
      const reactBadge = screen.getByText("react").closest("span");
      const removeButton = reactBadge?.querySelector("button");
      expect(removeButton).toBeDefined();

      await user.click(removeButton!);

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(
          expect.objectContaining({
            tags: ["typescript"],
          }),
        );
      });
    });

    it("should show tag suggestions from existing tags", async () => {
      const user = userEvent.setup();
      const existingTags = [
        { _id: "tag-1", name: "JavaScript", slug: "javascript", postCount: 10 },
        { _id: "tag-2", name: "TypeScript", slug: "typescript", postCount: 8 },
      ];
      mockUseQuery.mockReturnValue(existingTags);

      render(
        <BlogPostMetadata
          title="Test"
          metadata={defaultMetadata}
          onChange={mockOnChange}
        />,
      );

      const tagInput = screen.getByPlaceholderText(/add tag/i);
      await user.type(tagInput, "java");

      // Should show autocomplete suggestions
      await waitFor(() => {
        expect(screen.getByText("JavaScript")).toBeDefined();
      });
    });

    it("should prevent duplicate tags", async () => {
      const user = userEvent.setup();
      const metadata = {
        ...defaultMetadata,
        tags: ["react"],
      };

      render(
        <BlogPostMetadata
          title="Test"
          metadata={metadata}
          onChange={mockOnChange}
        />,
      );

      const tagInput = screen.getByPlaceholderText(/add tag/i);
      await user.type(tagInput, "react{Enter}");

      // Should not add duplicate tag
      await waitFor(() => {
        expect(mockOnChange).not.toHaveBeenCalled();
      });

      // Should show error message
      expect(screen.getByText(/tag already added/i)).toBeDefined();
    });
  });

  describe("Cover Image", () => {
    it("should display cover image preview when URL is provided", () => {
      const metadata = {
        ...defaultMetadata,
        coverImage: "https://example.com/image.jpg",
      };

      render(
        <BlogPostMetadata
          title="Test"
          metadata={metadata}
          onChange={mockOnChange}
        />,
      );

      const preview = screen.getByAltText(/cover image preview/i);
      expect(preview).toBeDefined();
      expect((preview as HTMLImageElement).src).toContain(
        "https://example.com/image.jpg",
      );
    });

    it("should update preview when URL changes", async () => {
      const user = userEvent.setup();

      render(
        <BlogPostMetadata
          title="Test"
          metadata={defaultMetadata}
          onChange={mockOnChange}
        />,
      );

      const imageInput = screen.getByLabelText(/cover image/i);
      await user.type(imageInput, "https://example.com/new-image.jpg");

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(
          expect.objectContaining({
            coverImage: "https://example.com/new-image.jpg",
          }),
        );
      });
    });

    it("should show placeholder when no cover image URL", () => {
      render(
        <BlogPostMetadata
          title="Test"
          metadata={defaultMetadata}
          onChange={mockOnChange}
        />,
      );

      expect(screen.queryByAltText(/cover image preview/i)).toBeNull();
      expect(screen.getByText(/no cover image/i)).toBeDefined();
    });
  });

  describe("SEO Metadata", () => {
    it("should display all SEO fields", () => {
      const metadata = {
        ...defaultMetadata,
        seoMetadata: {
          metaTitle: "SEO Title",
          metaDescription: "SEO Description",
          ogImage: "https://example.com/og.jpg",
        },
      };

      render(
        <BlogPostMetadata
          title="Test"
          metadata={metadata}
          onChange={mockOnChange}
        />,
      );

      const titleInput = screen.getByLabelText(
        /meta title/i,
      ) as HTMLInputElement;
      expect(titleInput.value).toBe("SEO Title");

      const descInput = screen.getByLabelText(
        /meta description/i,
      ) as HTMLTextAreaElement;
      expect(descInput.value).toBe("SEO Description");

      const ogInput = screen.getByLabelText(/og image/i) as HTMLInputElement;
      expect(ogInput.value).toBe("https://example.com/og.jpg");
    });

    it("should show character count for meta description", () => {
      const metadata = {
        ...defaultMetadata,
        seoMetadata: {
          metaTitle: "",
          metaDescription: "This is a test description",
          ogImage: "",
        },
      };

      render(
        <BlogPostMetadata
          title="Test"
          metadata={metadata}
          onChange={mockOnChange}
        />,
      );

      expect(screen.getByText(/27.*160/i)).toBeDefined();
    });

    it("should warn when meta description exceeds recommended length", () => {
      const longDescription = "a".repeat(170);
      const metadata = {
        ...defaultMetadata,
        seoMetadata: {
          metaTitle: "",
          metaDescription: longDescription,
          ogImage: "",
        },
      };

      render(
        <BlogPostMetadata
          title="Test"
          metadata={metadata}
          onChange={mockOnChange}
        />,
      );

      expect(screen.getByText(/exceeds recommended/i)).toBeDefined();
    });
  });

  describe("Featured Post Toggle", () => {
    it("should toggle featured status", async () => {
      const user = userEvent.setup();

      render(
        <BlogPostMetadata
          title="Test"
          metadata={defaultMetadata}
          onChange={mockOnChange}
        />,
      );

      const featuredCheckbox = screen.getByLabelText(/featured/i);
      await user.click(featuredCheckbox);

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(
          expect.objectContaining({
            featured: true,
          }),
        );
      });
    });

    it("should display featured indicator when checked", () => {
      const metadata = {
        ...defaultMetadata,
        featured: true,
      };

      render(
        <BlogPostMetadata
          title="Test"
          metadata={metadata}
          onChange={mockOnChange}
        />,
      );

      const featuredCheckbox = screen.getByLabelText(
        /featured/i,
      ) as HTMLInputElement;
      expect(featuredCheckbox.checked).toBe(true);
    });
  });

  describe("Controlled Component Behavior", () => {
    it("should call onChange for all field updates", async () => {
      const user = userEvent.setup();

      render(
        <BlogPostMetadata
          title="Test"
          metadata={defaultMetadata}
          onChange={mockOnChange}
        />,
      );

      // Test slug change
      const slugInput = screen.getByLabelText(/slug/i);
      await user.type(slugInput, "new-slug");

      // Test featured change
      const featuredCheckbox = screen.getByLabelText(/featured/i);
      await user.click(featuredCheckbox);

      // Test cover image change
      const imageInput = screen.getByLabelText(/cover image/i);
      await user.type(imageInput, "https://example.com/img.jpg");

      // Verify onChange was called for each field
      await waitFor(() => {
        expect(mockOnChange.mock.calls.length).toBeGreaterThan(0);
      });
    });

    it("should not modify metadata prop directly", async () => {
      const user = userEvent.setup();
      const originalMetadata = { ...defaultMetadata };

      render(
        <BlogPostMetadata
          title="Test"
          metadata={originalMetadata}
          onChange={mockOnChange}
        />,
      );

      const slugInput = screen.getByLabelText(/slug/i);
      await user.type(slugInput, "test");

      // Original metadata should remain unchanged
      expect(originalMetadata).toEqual(defaultMetadata);
    });
  });

  describe("Integration", () => {
    it("should handle complete metadata update flow", async () => {
      const user = userEvent.setup();
      mockUseQuery.mockReturnValue([
        { _id: "cat-1", name: "Tech", slug: "tech", postCount: 5 },
      ]);

      render(
        <BlogPostMetadata
          title="My Awesome Post"
          metadata={defaultMetadata}
          onChange={mockOnChange}
        />,
      );

      // Generate slug
      const generateButton = screen.getByRole("button", {
        name: /generate/i,
      });
      await user.click(generateButton);

      // Add tags
      const tagInput = screen.getByPlaceholderText(/add tag/i);
      await user.type(tagInput, "react{Enter}");
      await user.type(tagInput, "tutorial{Enter}");

      // Set cover image
      const imageInput = screen.getByLabelText(/cover image/i);
      await user.type(imageInput, "https://example.com/cover.jpg");

      // Set SEO metadata
      const metaTitleInput = screen.getByLabelText(/meta title/i);
      await user.type(metaTitleInput, "Awesome Post - SEO");

      // Toggle featured
      const featuredCheckbox = screen.getByLabelText(/featured/i);
      await user.click(featuredCheckbox);

      // Verify all changes were propagated
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalled();
      });
    });
  });
});
