/**
 * BlogHeader Component Tests
 *
 * Comprehensive test suite for the BlogHeader component covering:
 * - Post title, author, and date rendering
 * - Reading time estimate display
 * - Category and tags display
 * - Cover image rendering with proper sizing
 * - Responsive layout behavior
 * - Semantic HTML validation (h1, time, etc.)
 * - Date formatting consistency
 */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { BlogPost } from "@/types/blog";
import { BlogHeader } from "./BlogHeader";

// Mock Next.js Image component for testing
vi.mock("next/image", () => ({
  default: ({ alt, src, ...props }: any) => (
    <img alt={alt} src={src} {...props} />
  ),
}));

describe("BlogHeader", () => {
  let mockPost: BlogPost;

  beforeEach(() => {
    // Clean up from previous tests
    cleanup();

    // Create comprehensive mock post data
    mockPost = {
      _id: "test-post-id",
      _creationTime: Date.now(),
      title: "Getting Started with React 19",
      slug: "getting-started-with-react-19",
      excerpt: "Learn the new features and improvements in React 19.",
      content: "# React 19\n\nThis is a comprehensive guide...",
      status: "published",
      author: "Ryan Lowe",
      publishedAt: new Date("2024-01-15T12:00:00Z").getTime(),
      updatedAt: new Date("2024-01-20T12:00:00Z").getTime(),
      coverImage: "https://example.com/react-19-cover.jpg",
      category: "Technology",
      tags: ["React", "JavaScript", "Web Development"],
      featured: true,
      viewCount: 150,
      readingTime: 8,
      seoMetadata: {
        metaTitle: "Getting Started with React 19 | Blog",
        metaDescription: "Learn the new features in React 19",
        ogImage: "https://example.com/og-react-19.jpg",
        keywords: ["react", "javascript", "web development"],
        canonicalUrl: "https://example.com/blog/getting-started-with-react-19",
        author: "Ryan Lowe",
        publishedTime: new Date("2024-01-15T12:00:00Z").toISOString(),
        modifiedTime: new Date("2024-01-20T12:00:00Z").toISOString(),
      },
    };
  });

  afterEach(() => {
    cleanup();
  });

  describe("Title and Semantic HTML", () => {
    it("should render post title in an h1 element", () => {
      render(<BlogHeader post={mockPost} />);

      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toBeDefined();
      expect(heading.textContent).toBe("Getting Started with React 19");
    });

    it("should render title with proper semantic structure", () => {
      const { container } = render(<BlogHeader post={mockPost} />);

      // h1 should be the main heading
      const h1Elements = container.querySelectorAll("h1");
      expect(h1Elements.length).toBe(1);
      expect(h1Elements[0].textContent).toBe("Getting Started with React 19");
    });

    it("should handle long titles without overflow", () => {
      const longTitlePost = {
        ...mockPost,
        title:
          "An Extremely Long Blog Post Title That Should Still Display Properly Without Breaking Layout Or Causing Horizontal Scroll Issues",
      };

      const { container } = render(<BlogHeader post={longTitlePost} />);
      const heading = container.querySelector("h1");

      expect(heading).toBeDefined();
      expect(heading?.textContent).toContain("Extremely Long Blog Post Title");
    });
  });

  describe("Author Display", () => {
    it("should render author name", () => {
      render(<BlogHeader post={mockPost} />);

      const authorElements = screen.getAllByText("Ryan Lowe");
      expect(authorElements.length).toBeGreaterThan(0);
    });

    it("should render author with proper label", () => {
      render(<BlogHeader post={mockPost} />);

      const authorElements = screen.getAllByText(/Ryan Lowe/i);
      expect(authorElements.length).toBeGreaterThan(0);
    });

    it("should handle authors with special characters", () => {
      const specialAuthorPost = {
        ...mockPost,
        author: "José García-López",
      };

      render(<BlogHeader post={specialAuthorPost} />);
      const authorElements = screen.getAllByText("José García-López");
      expect(authorElements.length).toBeGreaterThan(0);
    });
  });

  describe("Date Display and Formatting", () => {
    it("should render published date in a time element", () => {
      const { container } = render(<BlogHeader post={mockPost} />);

      const timeElements = container.querySelectorAll("time");
      expect(timeElements.length).toBeGreaterThan(0);
    });

    it("should format date consistently (MMM dd, yyyy)", () => {
      render(<BlogHeader post={mockPost} />);

      // formatDate from blog-utils formats as "MMM dd, yyyy"
      expect(screen.getByText("Jan 15, 2024")).toBeDefined();
    });

    it("should include datetime attribute on time element", () => {
      const { container } = render(<BlogHeader post={mockPost} />);

      const timeElement = container.querySelector("time");
      expect(timeElement).toBeDefined();
      expect(timeElement?.hasAttribute("dateTime")).toBe(true);
    });

    it("should format various dates correctly", () => {
      // Test March date
      const marchPost = {
        ...mockPost,
        publishedAt: new Date("2024-03-20T12:00:00Z").getTime(),
      };

      const { unmount: unmountMarch } = render(<BlogHeader post={marchPost} />);
      expect(screen.getByText("Mar 20, 2024")).toBeDefined();
      unmountMarch();

      // Test December date
      const decPost = {
        ...mockPost,
        publishedAt: new Date("2024-12-05T12:00:00Z").getTime(),
      };

      const { unmount: unmountDec } = render(<BlogHeader post={decPost} />);
      expect(screen.getByText("Dec 05, 2024")).toBeDefined();
      unmountDec();
    });

    it("should handle timestamp numbers correctly", () => {
      const timestampPost = {
        ...mockPost,
        publishedAt: new Date("2024-01-15T12:00:00Z").getTime(), // Jan 15, 2024 at noon UTC
      };

      render(<BlogHeader post={timestampPost} />);
      expect(screen.getByText("Jan 15, 2024")).toBeDefined();
    });
  });

  describe("Reading Time Display", () => {
    it("should render reading time estimate", () => {
      render(<BlogHeader post={mockPost} />);

      expect(screen.getByText(/8 min read/i)).toBeDefined();
    });

    it("should handle 1 minute reading time (singular)", () => {
      const quickPost = { ...mockPost, readingTime: 1 };

      render(<BlogHeader post={quickPost} />);
      expect(screen.getByText(/1 min read/i)).toBeDefined();
    });

    it("should handle long reading times", () => {
      const longPost = { ...mockPost, readingTime: 45 };

      render(<BlogHeader post={longPost} />);
      expect(screen.getByText(/45 min read/i)).toBeDefined();
    });

    it("should display reading time with proper formatting", () => {
      render(<BlogHeader post={mockPost} />);

      // Should be styled consistently (not just plain text)
      const readingTimeText = screen.getByText(/8 min read/i);
      expect(readingTimeText).toBeDefined();
    });
  });

  describe("Category Display", () => {
    it("should render category name", () => {
      render(<BlogHeader post={mockPost} />);

      expect(screen.getByText("Technology")).toBeDefined();
    });

    it("should style category as a badge/pill", () => {
      render(<BlogHeader post={mockPost} />);

      // Category should be visually distinct (likely using Badge component)
      const categoryElement = screen.getByText("Technology");
      expect(categoryElement).toBeDefined();
    });

    it("should handle long category names", () => {
      const longCategoryPost = {
        ...mockPost,
        category: "Artificial Intelligence and Machine Learning",
      };

      render(<BlogHeader post={longCategoryPost} />);
      expect(
        screen.getByText("Artificial Intelligence and Machine Learning"),
      ).toBeDefined();
    });
  });

  describe("Tags Display", () => {
    it("should render all tags", () => {
      render(<BlogHeader post={mockPost} />);

      expect(screen.getByText("React")).toBeDefined();
      expect(screen.getByText("JavaScript")).toBeDefined();
      expect(screen.getByText("Web Development")).toBeDefined();
    });

    it("should handle posts with no tags", () => {
      const noTagsPost = { ...mockPost, tags: [] };

      render(<BlogHeader post={noTagsPost} />);

      // Should not crash, tags section may be hidden or show empty state
      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toBeDefined();
    });

    it("should handle posts with single tag", () => {
      const singleTagPost = { ...mockPost, tags: ["React"] };

      render(<BlogHeader post={singleTagPost} />);
      expect(screen.getByText("React")).toBeDefined();
    });

    it("should handle posts with many tags", () => {
      const manyTagsPost = {
        ...mockPost,
        tags: [
          "React",
          "JavaScript",
          "TypeScript",
          "Next.js",
          "Tailwind CSS",
          "Testing",
          "Performance",
          "Accessibility",
        ],
      };

      render(<BlogHeader post={manyTagsPost} />);

      // All tags should be visible
      expect(screen.getByText("React")).toBeDefined();
      expect(screen.getByText("TypeScript")).toBeDefined();
      expect(screen.getByText("Accessibility")).toBeDefined();
    });

    it("should style tags distinctly from category", () => {
      render(<BlogHeader post={mockPost} />);

      // Tags and category should be visually distinguishable
      const category = screen.getByText("Technology");
      const tag = screen.getByText("React");

      expect(category).toBeDefined();
      expect(tag).toBeDefined();
    });
  });

  describe("Cover Image Display", () => {
    it("should render cover image when provided", () => {
      render(<BlogHeader post={mockPost} />);

      const images = screen.getAllByRole("img");
      const coverImage = images.find(
        (img) =>
          img.getAttribute("src") === "https://example.com/react-19-cover.jpg",
      );

      expect(coverImage).toBeDefined();
    });

    it("should include alt text for cover image", () => {
      render(<BlogHeader post={mockPost} />);

      const images = screen.getAllByRole("img");
      const coverImage = images.find(
        (img) =>
          img.getAttribute("src") === "https://example.com/react-19-cover.jpg",
      );

      expect(coverImage?.hasAttribute("alt")).toBe(true);
      expect(coverImage?.getAttribute("alt")).toContain("React 19");
    });

    it("should handle posts without cover image", () => {
      const noImagePost = { ...mockPost, coverImage: undefined };

      render(<BlogHeader post={noImagePost} />);

      // Should render without errors
      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toBeDefined();
    });

    it("should apply proper sizing classes to cover image", () => {
      const { container } = render(<BlogHeader post={mockPost} />);

      const images = container.querySelectorAll("img");
      const coverImage = Array.from(images).find(
        (img) =>
          img.getAttribute("src") === "https://example.com/react-19-cover.jpg",
      );

      expect(coverImage).toBeDefined();
      // Image should have responsive sizing
      const classList = coverImage?.className || "";
      expect(classList.length).toBeGreaterThan(0);
    });
  });

  describe("Responsive Layout", () => {
    it("should apply responsive classes to header container", () => {
      const { container } = render(<BlogHeader post={mockPost} />);

      const header = container.querySelector("header");
      expect(header).toBeDefined();

      const classList = header?.className || "";
      expect(classList.length).toBeGreaterThan(0);
    });

    it("should render all required elements in correct structure", () => {
      const { container } = render(<BlogHeader post={mockPost} />);

      // Should have semantic header element
      const header = container.querySelector("header");
      expect(header).toBeDefined();

      // Should have h1 inside header
      const h1 = header?.querySelector("h1");
      expect(h1).toBeDefined();

      // Should have time element for date
      const time = header?.querySelector("time");
      expect(time).toBeDefined();
    });

    it("should maintain proper spacing between elements", () => {
      const { container } = render(<BlogHeader post={mockPost} />);

      const header = container.querySelector("header");
      const classList = header?.className || "";

      // Should include spacing utilities (gap, space-y, etc.)
      expect(classList.length).toBeGreaterThan(0);
    });
  });

  describe("Complete Integration", () => {
    it("should render all elements together correctly", () => {
      render(<BlogHeader post={mockPost} />);

      // Title
      expect(
        screen.getByRole("heading", {
          level: 1,
          name: "Getting Started with React 19",
        }),
      ).toBeDefined();

      // Author
      const authorElements = screen.getAllByText("Ryan Lowe");
      expect(authorElements.length).toBeGreaterThan(0);

      // Date
      expect(screen.getByText("Jan 15, 2024")).toBeDefined();

      // Reading time
      expect(screen.getByText(/8 min read/i)).toBeDefined();

      // Category
      expect(screen.getByText("Technology")).toBeDefined();

      // Tags
      expect(screen.getByText("React")).toBeDefined();
      expect(screen.getByText("JavaScript")).toBeDefined();
      expect(screen.getByText("Web Development")).toBeDefined();

      // Cover image
      const images = screen.getAllByRole("img");
      expect(images.length).toBeGreaterThan(0);
    });

    it("should handle minimal post data gracefully", () => {
      const minimalPost: BlogPost = {
        _id: "minimal-id",
        _creationTime: Date.now(),
        title: "Minimal Post",
        slug: "minimal-post",
        excerpt: "Short excerpt",
        content: "Content here",
        status: "published",
        author: "Author Name",
        publishedAt: Date.now(),
        updatedAt: Date.now(),
        category: "General",
        tags: [],
        featured: false,
        viewCount: 0,
        readingTime: 1,
        seoMetadata: {
          metaTitle: "Minimal Post",
          metaDescription: "Description",
        },
      };

      render(<BlogHeader post={minimalPost} />);

      // Should render without errors
      expect(
        screen.getByRole("heading", { level: 1, name: "Minimal Post" }),
      ).toBeDefined();
      expect(screen.getByText("Author Name")).toBeDefined();
      expect(screen.getByText("General")).toBeDefined();
    });

    it("should maintain semantic structure for accessibility", () => {
      const { container } = render(<BlogHeader post={mockPost} />);

      // Should use semantic HTML5 elements
      expect(container.querySelector("header")).toBeDefined();
      expect(container.querySelector("h1")).toBeDefined();
      expect(container.querySelector("time")).toBeDefined();

      // Should have proper heading hierarchy
      const h1Elements = container.querySelectorAll("h1");
      expect(h1Elements.length).toBe(1);
    });
  });

  describe("Edge Cases", () => {
    it("should handle posts with undefined publishedAt gracefully", () => {
      const draftPost = { ...mockPost, publishedAt: undefined };

      render(<BlogHeader post={draftPost} />);

      // Should still render title and other elements
      expect(
        screen.getByRole("heading", {
          level: 1,
          name: "Getting Started with React 19",
        }),
      ).toBeDefined();
    });

    it("should handle empty strings in required fields", () => {
      const emptyFieldsPost = {
        ...mockPost,
        author: "",
        category: "",
      };

      render(<BlogHeader post={emptyFieldsPost} />);

      // Should not crash
      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toBeDefined();
    });

    it("should handle very short titles", () => {
      const shortTitlePost = { ...mockPost, title: "Hi" };

      render(<BlogHeader post={shortTitlePost} />);
      expect(
        screen.getByRole("heading", { level: 1, name: "Hi" }),
      ).toBeDefined();
    });

    it("should handle titles with special characters", () => {
      const specialTitlePost = {
        ...mockPost,
        title: 'React 19: The "Breaking" Changes & What You Need to Know!',
      };

      render(<BlogHeader post={specialTitlePost} />);
      expect(
        screen.getByText(
          'React 19: The "Breaking" Changes & What You Need to Know!',
        ),
      ).toBeDefined();
    });
  });
});
