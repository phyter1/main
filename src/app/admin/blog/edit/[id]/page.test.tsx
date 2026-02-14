import { render, screen, waitFor } from "@testing-library/react";
import { useMutation, useQuery } from "convex/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import EditBlogPostPage from "./page";

/**
 * Test suite for Edit Blog Post Page (T016) - FIXED VERSION
 */

// Mock Next.js navigation
const mockPush = vi.fn();
const mockBack = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
  }),
  useParams: () => ({
    id: "test-post-id",
  }),
}));

// Mock Convex API with string identifiers (working pattern from blog/page.test.tsx)
vi.mock("../../../../../../convex/_generated/api", () => ({
  api: {
    blog: {
      getPostById: "getPostById",
      updatePost: "updatePost",
      publishPost: "publishPost",
      unpublishPost: "unpublishPost",
      deletePost: "deletePost",
    },
  },
}));

// Mock Convex client
vi.mock("convex/react", () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
}));

// Mock blog components - match actual component interface
vi.mock("@/components/admin/blog/BlogPostEditor", () => ({
  BlogPostEditor: ({
    title,
  }: {
    title: string;
    content: string;
    onTitleChange: (title: string) => void;
    onContentChange: (content: string) => void;
  }) => (
    <div data-testid="blog-post-editor">
      <div>Title: {title}</div>
    </div>
  ),
}));

vi.mock("@/components/admin/blog/BlogPostMetadata", () => ({
  BlogPostMetadata: ({
    metadata,
  }: {
    title: string;
    metadata: { slug: string };
    onChange: (data: unknown) => void;
  }) => (
    <div data-testid="blog-post-metadata">
      <div>Slug: {metadata.slug}</div>
    </div>
  ),
}));

// Mock UI components
vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open: boolean }) =>
    open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogTitle: ({ children }: { children: React.ReactNode }) => (
    <h2>{children}</h2>
  ),
  DialogDescription: ({ children }: { children: React.ReactNode }) => (
    <p>{children}</p>
  ),
  DialogFooter: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

// Mock blog utils
vi.mock("@/lib/blog-utils", () => ({
  calculateReadingTime: vi.fn(() => 5),
}));

// Sample test data - must match schema expected by page component
const mockPost = {
  _id: "test-post-id",
  _creationTime: Date.now(),
  title: "Test Post",
  slug: "test-post",
  excerpt: "Test excerpt",
  content: "Test content",
  status: "draft" as const,
  author: "Test Author",
  updatedAt: Date.now(),
  categoryId: "test-category-id" as any,
  tags: ["test"],
  featured: false,
  viewCount: 0,
  readingTime: 5,
  coverImageUrl: "/test-image.jpg",
  seoMetadata: {
    metaTitle: "Test Meta Title",
    metaDescription: "Test meta description",
  },
};

describe("EditBlogPostPage - Fixed", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPush.mockClear();
    mockBack.mockClear();

    // Mock useQuery to return post data when called with getPostById
    vi.mocked(useQuery).mockImplementation((queryName: string) => {
      if (queryName === "getPostById") {
        return mockPost;
      }
      return undefined;
    });

    // Mock useMutation to return mock functions
    vi.mocked(useMutation).mockReturnValue(vi.fn(() => Promise.resolve()));
  });

  describe("Page Rendering", () => {
    it("should render edit post page with existing data", async () => {
      render(<EditBlogPostPage />);

      await waitFor(() => {
        expect(screen.getByText(/edit blog post/i)).toBeDefined();
        expect(screen.getByText(/title: test post/i)).toBeDefined();
      });
    });

    it("should render page heading with post title", async () => {
      render(<EditBlogPostPage />);

      await waitFor(() => {
        const heading = screen.getAllByRole("heading", {
          name: /edit blog post/i,
        })[0];
        expect(heading).toBeDefined();
      });
    });
  });
});
