/**
 * Sitemap Generation Tests (T033)
 *
 * Integration tests for the main sitemap function that combines
 * static site pages with dynamic blog content.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock data
const mockPostsData = {
  posts: [
    {
      _id: "post1" as any,
      _creationTime: Date.now(),
      title: "Test Post 1",
      slug: "test-post-1",
      excerpt: "Test excerpt",
      content: "Content",
      status: "published" as const,
      author: "Ryan Lowe",
      publishedAt: new Date("2024-01-15").getTime(),
      updatedAt: new Date("2024-01-20").getTime(),
      category: "technology",
      tags: ["react"],
      featured: false,
      viewCount: 10,
      readingTime: 5,
      seoMetadata: {
        metaTitle: "Test Post 1",
        metaDescription: "Test",
      },
    },
  ],
  total: 1,
  hasMore: false,
};

const mockCategoriesData = [
  {
    _id: "cat1" as any,
    _creationTime: Date.now(),
    name: "Technology",
    slug: "technology",
    description: "Tech posts",
    postCount: 5,
  },
];

const mockTagsData = [
  {
    _id: "tag1" as any,
    _creationTime: Date.now(),
    name: "React",
    slug: "react",
    postCount: 4,
  },
];

// Mock Convex HTTP client query method
const mockQuery = vi.fn();

class MockConvexHttpClient {
  query = mockQuery;
}

vi.mock("convex/browser", () => ({
  ConvexHttpClient: MockConvexHttpClient,
}));

// Mock the Convex API functions directly in the sitemap module
vi.mock("../../convex/_generated/api", () => ({
  api: {
    blog: {
      listPosts: "blog.listPosts",
      getCategories: "blog.getCategories",
      getTags: "blog.getTags",
    },
  },
}));

describe("sitemap", () => {
  beforeEach(() => {
    mockQuery.mockClear();
  });

  it("should return MetadataRoute.Sitemap type", async () => {
    // Setup mock to return proper data for each call
    let callCount = 0;
    mockQuery.mockImplementation(async () => {
      callCount++;
      if (callCount === 1) return mockPostsData;
      if (callCount === 2) return mockCategoriesData;
      if (callCount === 3) return mockTagsData;
      return null;
    });

    const sitemap = (await import("./sitemap")).default;
    const result = await sitemap();

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it("should include static site pages", async () => {
    let callCount = 0;
    mockQuery.mockImplementation(async () => {
      callCount++;
      if (callCount === 1) return mockPostsData;
      if (callCount === 2) return mockCategoriesData;
      if (callCount === 3) return mockTagsData;
      return null;
    });

    const sitemap = (await import("./sitemap")).default;
    const result = await sitemap();

    const baseUrl = "https://ryn.phytertek.com";

    // Check for static pages
    const urls = result.map((entry) => entry.url);
    expect(urls).toContain(baseUrl); // Homepage
    expect(urls).toContain(`${baseUrl}/about`);
    expect(urls).toContain(`${baseUrl}/principles`);
    expect(urls).toContain(`${baseUrl}/projects`);
    expect(urls).toContain(`${baseUrl}/stack`);
  });

  it("should include blog listing page", async () => {
    let callCount = 0;
    mockQuery.mockImplementation(async () => {
      callCount++;
      if (callCount === 1) return mockPostsData;
      if (callCount === 2) return mockCategoriesData;
      if (callCount === 3) return mockTagsData;
      return null;
    });

    const sitemap = (await import("./sitemap")).default;
    const result = await sitemap();

    const blogListingEntry = result.find(
      (entry) => entry.url === "https://ryn.phytertek.com/blog",
    );
    expect(blogListingEntry).toBeDefined();
    expect(blogListingEntry?.priority).toBe(0.9);
    expect(blogListingEntry?.changeFrequency).toBe("daily");
  });

  it("should include blog posts", async () => {
    let callCount = 0;
    mockQuery.mockImplementation(async () => {
      callCount++;
      if (callCount === 1) return mockPostsData;
      if (callCount === 2) return mockCategoriesData;
      if (callCount === 3) return mockTagsData;
      return null;
    });

    const sitemap = (await import("./sitemap")).default;
    const result = await sitemap();

    const postEntry = result.find((entry) =>
      entry.url.includes("/blog/test-post-1"),
    );
    expect(postEntry).toBeDefined();
    expect(postEntry?.priority).toBe(0.8);
    expect(postEntry?.changeFrequency).toBe("monthly");
  });

  it("should include category pages", async () => {
    let callCount = 0;
    mockQuery.mockImplementation(async () => {
      callCount++;
      if (callCount === 1) return mockPostsData;
      if (callCount === 2) return mockCategoriesData;
      if (callCount === 3) return mockTagsData;
      return null;
    });

    const sitemap = (await import("./sitemap")).default;
    const result = await sitemap();

    const categoryEntry = result.find((entry) =>
      entry.url.includes("/blog/category/technology"),
    );
    expect(categoryEntry).toBeDefined();
    expect(categoryEntry?.priority).toBe(0.7);
    expect(categoryEntry?.changeFrequency).toBe("weekly");
  });

  it("should include tag pages", async () => {
    let callCount = 0;
    mockQuery.mockImplementation(async () => {
      callCount++;
      if (callCount === 1) return mockPostsData;
      if (callCount === 2) return mockCategoriesData;
      if (callCount === 3) return mockTagsData;
      return null;
    });

    const sitemap = (await import("./sitemap")).default;
    const result = await sitemap();

    const tagEntry = result.find((entry) =>
      entry.url.includes("/blog/tag/react"),
    );
    expect(tagEntry).toBeDefined();
    expect(tagEntry?.priority).toBe(0.6);
    expect(tagEntry?.changeFrequency).toBe("weekly");
  });

  it("should have valid sitemap structure for all entries", async () => {
    let callCount = 0;
    mockQuery.mockImplementation(async () => {
      callCount++;
      if (callCount === 1) return mockPostsData;
      if (callCount === 2) return mockCategoriesData;
      if (callCount === 3) return mockTagsData;
      return null;
    });

    const sitemap = (await import("./sitemap")).default;
    const result = await sitemap();

    for (const entry of result) {
      // Validate required fields
      expect(entry.url).toBeDefined();
      expect(typeof entry.url).toBe("string");
      expect(entry.url.startsWith("https://")).toBe(true);

      expect(entry.lastModified).toBeDefined();
      expect(entry.lastModified).toBeInstanceOf(Date);

      expect(entry.changeFrequency).toBeDefined();
      expect([
        "always",
        "hourly",
        "daily",
        "weekly",
        "monthly",
        "yearly",
        "never",
      ]).toContain(entry.changeFrequency);

      expect(entry.priority).toBeDefined();
      expect(typeof entry.priority).toBe("number");
      expect(entry.priority).toBeGreaterThanOrEqual(0);
      expect(entry.priority).toBeLessThanOrEqual(1);
    }
  });

  it("should handle empty blog content gracefully", async () => {
    // Mock empty responses
    let callCount = 0;
    mockQuery.mockImplementation(async () => {
      callCount++;
      if (callCount === 1) return { posts: [], total: 0, hasMore: false };
      if (callCount === 2) return [];
      if (callCount === 3) return [];
      return null;
    });

    const sitemap = (await import("./sitemap")).default;
    const result = await sitemap();

    // Should still include static pages and blog listing
    expect(result.length).toBeGreaterThan(0);

    const blogListingEntry = result.find((entry) =>
      entry.url.includes("/blog"),
    );
    expect(blogListingEntry).toBeDefined();
  });

  it("should use correct priorities for different page types", async () => {
    let callCount = 0;
    mockQuery.mockImplementation(async () => {
      callCount++;
      if (callCount === 1) return mockPostsData;
      if (callCount === 2) return mockCategoriesData;
      if (callCount === 3) return mockTagsData;
      return null;
    });

    const sitemap = (await import("./sitemap")).default;
    const result = await sitemap();

    const baseUrl = "https://ryn.phytertek.com";

    // Homepage should have highest priority
    const homepageEntry = result.find((entry) => entry.url === baseUrl);
    expect(homepageEntry?.priority).toBe(1);

    // Blog listing should have high priority
    const blogListingEntry = result.find(
      (entry) => entry.url === `${baseUrl}/blog`,
    );
    expect(blogListingEntry?.priority).toBe(0.9);

    // Blog posts should have good priority
    const postEntry = result.find((entry) =>
      entry.url.includes("/blog/test-post-1"),
    );
    expect(postEntry?.priority).toBe(0.8);

    // Category pages should have medium priority
    const categoryEntry = result.find((entry) =>
      entry.url.includes("/blog/category/"),
    );
    expect(categoryEntry?.priority).toBe(0.7);

    // Tag pages should have lower priority
    const tagEntry = result.find((entry) => entry.url.includes("/blog/tag/"));
    expect(tagEntry?.priority).toBe(0.6);
  });
});
