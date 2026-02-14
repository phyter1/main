import { useMutation, useQuery } from "convex/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock Convex API
vi.mock("../../convex/_generated/api", () => ({
  api: {
    blog: {
      getPostById: "getPostById",
    },
  },
}));

// Mock Convex
vi.mock("convex/react", () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
}));

// Mock Next navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
  }),
  useParams: () => ({
    id: "test-id",
  }),
}));

const mockPost = {
  _id: "test-id",
  title: "Test Post",
  slug: "test-post",
  excerpt: "excerpt",
  content: "content",
  status: "draft" as const,
  author: "Author",
  _creationTime: Date.now(),
  updatedAt: Date.now(),
  categoryId: "cat-id",
  tags: ["tag"],
  featured: false,
  viewCount: 0,
  readingTime: 5,
  coverImageUrl: "/image.jpg",
  seoMetadata: {
    metaTitle: "Meta",
    metaDescription: "Desc",
  },
};

describe("Simple Test", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useQuery).mockImplementation((queryName: string) => {
      if (queryName === "getPostById") {
        return mockPost;
      }
      return undefined;
    });
    vi.mocked(useMutation).mockReturnValue(vi.fn(() => Promise.resolve()));
  });

  it("should work", () => {
    expect(true).toBe(true);
  });
});
