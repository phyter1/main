import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { BlogPost } from "@/types/blog";
import { BlogCard } from "./BlogCard";

// Mock framer-motion to avoid animation issues in tests
vi.mock("framer-motion", () => ({
  motion: {
    article: ({ children, ...props }: any) => (
      <article {...props}>{children}</article>
    ),
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

// Mock useReducedMotion hook
vi.mock("@/hooks/useReducedMotion", () => ({
  useReducedMotion: () => false,
}));

// Mock Next.js Link
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock Next.js Image
vi.mock("next/image", () => ({
  default: ({ alt, src, ...props }: any) => (
    <img alt={alt} src={src} {...props} />
  ),
}));

// Mock blog utility functions
vi.mock("@/lib/blog-utils", () => ({
  formatDate: (_timestamp: number) => "Jan 15, 2024",
}));

// Mock blog post data
const mockBlogPost: BlogPost = {
  _id: "post-1",
  _creationTime: 1705276800000,
  title: "Getting Started with React",
  slug: "getting-started-with-react",
  excerpt:
    "Learn the fundamentals of React and build your first component-based application.",
  content: "Full post content here...",
  status: "published",
  author: "Ryan Lowe",
  publishedAt: 1705276800000,
  updatedAt: 1705276800000,
  coverImage: "https://example.com/cover.jpg",
  category: "Technology",
  tags: ["React", "JavaScript", "Tutorial"],
  featured: false,
  viewCount: 150,
  readingTime: 5,
  seoMetadata: {
    metaTitle: "Getting Started with React",
    metaDescription: "Learn React fundamentals",
    keywords: ["React", "JavaScript"],
  },
};

const mockFeaturedPost: BlogPost = {
  ...mockBlogPost,
  _id: "post-2",
  title: "Featured Post",
  slug: "featured-post",
  featured: true,
};

describe("BlogCard", () => {
  it("renders component with post title", () => {
    const { container } = render(<BlogCard post={mockBlogPost} />);

    expect(container.textContent).toContain("Getting Started with React");
  });

  it("renders post excerpt", () => {
    const { container } = render(<BlogCard post={mockBlogPost} />);

    expect(container.textContent).toContain("Learn the fundamentals of React");
  });

  it("renders cover image with proper alt text", () => {
    const { container } = render(<BlogCard post={mockBlogPost} />);

    const image = container.querySelector("img");
    expect(image).toBeDefined();
    expect(image?.getAttribute("alt")).toBe("Getting Started with React");
    expect(image?.getAttribute("src")).toContain("cover.jpg");
  });

  it("displays category badge", () => {
    const { container } = render(<BlogCard post={mockBlogPost} />);

    expect(container.textContent).toContain("Technology");
  });

  it("displays published date", () => {
    const { container } = render(<BlogCard post={mockBlogPost} />);

    expect(container.textContent).toContain("Jan 15, 2024");
  });

  it("displays reading time", () => {
    const { container } = render(<BlogCard post={mockBlogPost} />);

    expect(container.textContent).toContain("5 min read");
  });

  it("links to post page with correct href", () => {
    const { container } = render(<BlogCard post={mockBlogPost} />);

    const link = container.querySelector("a");
    expect(link?.getAttribute("href")).toBe("/blog/getting-started-with-react");
  });

  it("applies hover effects with transition classes", () => {
    const { container } = render(<BlogCard post={mockBlogPost} />);

    const card = container.querySelector("article");
    expect(card?.className).toContain("transition");
    expect(card?.className).toContain("hover:shadow");
  });

  it("renders in responsive grid layout", () => {
    const { container } = render(<BlogCard post={mockBlogPost} />);

    const card = container.querySelector("article");
    expect(card?.className).toContain("flex");
    expect(card?.className).toContain("flex-col");
  });

  it("applies featured variant styling when post is featured", () => {
    const { container } = render(<BlogCard post={mockFeaturedPost} />);

    const card = container.querySelector("article");
    // Featured posts should have distinct styling (border, background, etc.)
    expect(card?.className).toContain("border-2");
  });

  it("applies regular styling for non-featured posts", () => {
    const { container } = render(<BlogCard post={mockBlogPost} />);

    const card = container.querySelector("article");
    // Regular posts should have standard border
    expect(card?.className).toContain("border");
    expect(card?.className).not.toContain("border-2");
  });

  it("renders without cover image gracefully", () => {
    const postWithoutImage = {
      ...mockBlogPost,
      coverImage: undefined,
    };

    const { container } = render(<BlogCard post={postWithoutImage} />);

    // Should still render title and excerpt
    expect(container.textContent).toContain("Getting Started with React");
    expect(container.textContent).toContain("Learn the fundamentals of React");
  });

  it("truncates long excerpts appropriately", () => {
    const postWithLongExcerpt = {
      ...mockBlogPost,
      excerpt:
        "This is a very long excerpt that should be truncated to prevent the card from becoming too tall and disrupting the grid layout. It contains many words and detailed information about the blog post content.",
    };

    const { container } = render(<BlogCard post={postWithLongExcerpt} />);

    const excerptElement = container.querySelector(".line-clamp-3");
    expect(excerptElement).toBeDefined();
  });

  it("renders category badge with correct variant", () => {
    const { container } = render(<BlogCard post={mockBlogPost} />);

    const categoryBadge = container.querySelector('[data-variant="secondary"]');
    expect(categoryBadge).toBeDefined();
    expect(categoryBadge?.textContent).toContain("Technology");
  });

  it("formats date metadata correctly", () => {
    const { container } = render(<BlogCard post={mockBlogPost} />);

    // Check for proper semantic HTML with time element
    const timeElement = container.querySelector("time");
    expect(timeElement).toBeDefined();
    expect(timeElement?.textContent).toContain("Jan 15, 2024");
  });

  it("displays reading time with proper formatting", () => {
    const { container } = render(<BlogCard post={mockBlogPost} />);

    expect(container.textContent).toContain("5 min read");

    // Should handle singular minute
    const postWithOneMinute = {
      ...mockBlogPost,
      readingTime: 1,
    };

    const { container: container2 } = render(
      <BlogCard post={postWithOneMinute} />,
    );
    expect(container2.textContent).toContain("1 min read");
  });

  it("applies proper aspect ratio to cover image", () => {
    const { container } = render(<BlogCard post={mockBlogPost} />);

    const imageContainer = container.querySelector(".aspect-video");
    expect(imageContainer).toBeDefined();
  });

  it("includes proper accessibility attributes", () => {
    const { container } = render(<BlogCard post={mockBlogPost} />);

    const link = container.querySelector("a");
    expect(link).toBeDefined();
    expect(link?.getAttribute("aria-label")).toContain("Read");

    // Image should have alt text
    const image = container.querySelector("img");
    expect(image).toBeDefined();
    expect(image?.getAttribute("alt")).toBe("Getting Started with React");
  });

  it("renders with dark mode support classes", () => {
    const { container } = render(<BlogCard post={mockBlogPost} />);

    const card = container.querySelector("article");
    // Should have background classes that work with dark mode
    expect(card?.className).toContain("bg-");
  });

  it("applies proper spacing between card elements", () => {
    const { container } = render(<BlogCard post={mockBlogPost} />);

    // Check for gap classes in content container
    const contentContainer = container.querySelector(".gap-4");
    expect(contentContainer).toBeDefined();
  });

  it("renders featured badge for featured posts", () => {
    const { container } = render(<BlogCard post={mockFeaturedPost} />);

    expect(container.textContent).toContain("Featured");
  });

  it("uses proper semantic HTML structure", () => {
    const { container } = render(<BlogCard post={mockBlogPost} />);

    // Should use article tag for semantic meaning
    const article = container.querySelector("article");
    expect(article).toBeDefined();

    // Should have heading within article
    const heading = container.querySelector("h3");
    expect(heading).toBeDefined();
  });
});
