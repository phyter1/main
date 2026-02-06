/**
 * Blog Mock Data for Testing
 * Provides comprehensive mock data matching Convex schema types for blog system
 */

/**
 * Blog post status type matching Convex schema
 */
export type BlogStatus = "draft" | "published" | "archived";

/**
 * SEO metadata structure for blog posts
 */
export interface SEOMetadata {
  metaTitle: string;
  metaDescription: string;
  ogImage: string;
}

/**
 * Blog post interface matching Convex schema
 */
export interface BlogPost {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  status: BlogStatus;
  author: string;
  coverImage: string;
  tags: string[];
  category: string;
  readingTime: number;
  viewCount: number;
  featured: boolean;
  publishedAt?: number;
  createdAt: number;
  updatedAt: number;
  seoMetadata: SEOMetadata;
}

/**
 * Blog category interface matching Convex schema
 */
export interface BlogCategory {
  name: string;
  slug: string;
  description: string;
  postCount: number;
}

/**
 * Blog tag interface matching Convex schema
 */
export interface BlogTag {
  name: string;
  slug: string;
  postCount: number;
}

/**
 * Counter for generating unique mock data
 */
let mockCounter = 0;

/**
 * Single mock blog post for basic testing
 */
export const mockBlogPost: BlogPost = {
  title: "Getting Started with TypeScript and Next.js",
  slug: "getting-started-typescript-nextjs",
  content: `# Getting Started with TypeScript and Next.js

TypeScript has become the de facto standard for building robust React applications. When combined with Next.js, you get a powerful framework for building production-ready web applications.

## Why TypeScript?

TypeScript provides static typing, which catches errors at compile time rather than runtime. This leads to:

- Fewer bugs in production
- Better IDE support with autocomplete
- Improved code maintainability
- Self-documenting code through type definitions

## Setting Up Next.js with TypeScript

Setting up a new Next.js project with TypeScript is straightforward:

\`\`\`bash
npx create-next-app@latest my-app --typescript
cd my-app
npm run dev
\`\`\`

## Best Practices

1. Use strict mode in tsconfig.json
2. Define interfaces for your data structures
3. Avoid using 'any' type
4. Leverage type inference when possible

## Conclusion

TypeScript and Next.js together provide an excellent developer experience while ensuring code quality and maintainability.`,
  excerpt:
    "Learn how to get started with TypeScript and Next.js to build robust, type-safe web applications with excellent developer experience.",
  status: "published",
  author: "Ryan Lowe",
  coverImage: "https://images.unsplash.com/photo-1516116216624-53e697fedbea",
  tags: ["typescript", "nextjs", "react", "webdev"],
  category: "tutorials",
  readingTime: 5,
  viewCount: 1247,
  featured: true,
  publishedAt: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days ago
  createdAt: Date.now() - 10 * 24 * 60 * 60 * 1000, // 10 days ago
  updatedAt: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days ago
  seoMetadata: {
    metaTitle: "Getting Started with TypeScript and Next.js | Developer Guide",
    metaDescription:
      "Learn how to get started with TypeScript and Next.js to build robust, type-safe web applications with excellent developer experience.",
    ogImage: "https://images.unsplash.com/photo-1516116216624-53e697fedbea",
  },
};

/**
 * Single mock blog category for basic testing
 */
export const mockBlogCategory: BlogCategory = {
  name: "Tutorials",
  slug: "tutorials",
  description:
    "Step-by-step guides and tutorials for web development technologies",
  postCount: 12,
};

/**
 * Single mock blog tag for basic testing
 */
export const mockBlogTag: BlogTag = {
  name: "TypeScript",
  slug: "typescript",
  postCount: 8,
};

/**
 * Array of mock blog posts with varied statuses
 */
export const mockBlogPosts: BlogPost[] = [
  {
    title: "Building a Modern React Application",
    slug: "building-modern-react-application",
    content: `# Building a Modern React Application

Modern React development has evolved significantly with the introduction of hooks, server components, and improved build tools.

## Key Concepts

React 19 introduces several powerful features that change how we build applications...`,
    excerpt:
      "Explore modern React development patterns including hooks, server components, and the latest best practices.",
    status: "published",
    author: "Ryan Lowe",
    coverImage: "https://images.unsplash.com/photo-1633356122544-f134324a6cee",
    tags: ["react", "javascript", "webdev"],
    category: "tutorials",
    readingTime: 8,
    viewCount: 892,
    featured: true,
    publishedAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
    createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
    seoMetadata: {
      metaTitle: "Building a Modern React Application | React Best Practices",
      metaDescription:
        "Explore modern React development patterns including hooks, server components, and the latest best practices.",
      ogImage: "https://images.unsplash.com/photo-1633356122544-f134324a6cee",
    },
  },
  {
    title: "Mastering Tailwind CSS",
    slug: "mastering-tailwind-css",
    content: `# Mastering Tailwind CSS

Tailwind CSS has revolutionized how we style modern web applications with its utility-first approach.

## Why Tailwind?

Utility-first CSS provides several advantages over traditional approaches...`,
    excerpt:
      "Master Tailwind CSS and learn how utility-first styling can accelerate your development workflow.",
    status: "published",
    author: "Ryan Lowe",
    coverImage: "https://images.unsplash.com/photo-1507721999472-8ed4421c4af2",
    tags: ["tailwind", "css", "webdev"],
    category: "tutorials",
    readingTime: 6,
    viewCount: 654,
    featured: false,
    publishedAt: Date.now() - 14 * 24 * 60 * 60 * 1000,
    createdAt: Date.now() - 20 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 14 * 24 * 60 * 60 * 1000,
    seoMetadata: {
      metaTitle: "Mastering Tailwind CSS | Utility-First Styling Guide",
      metaDescription:
        "Master Tailwind CSS and learn how utility-first styling can accelerate your development workflow.",
      ogImage: "https://images.unsplash.com/photo-1507721999472-8ed4421c4af2",
    },
  },
  {
    title: "Advanced TypeScript Patterns",
    slug: "advanced-typescript-patterns",
    content: `# Advanced TypeScript Patterns

TypeScript offers powerful type system features that can make your code more robust and maintainable.

## Generic Types

Generics are one of the most powerful features in TypeScript...`,
    excerpt:
      "Dive deep into advanced TypeScript patterns including generics, conditional types, and mapped types.",
    status: "draft",
    author: "Ryan Lowe",
    coverImage: "https://images.unsplash.com/photo-1555099962-4199c345e5dd",
    tags: ["typescript", "programming", "advanced"],
    category: "deep-dive",
    readingTime: 12,
    viewCount: 0,
    featured: false,
    createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
    seoMetadata: {
      metaTitle: "Advanced TypeScript Patterns | Type System Deep Dive",
      metaDescription:
        "Dive deep into advanced TypeScript patterns including generics, conditional types, and mapped types.",
      ogImage: "https://images.unsplash.com/photo-1555099962-4199c345e5dd",
    },
  },
  {
    title: "Testing React Components with Bun",
    slug: "testing-react-components-bun",
    content: `# Testing React Components with Bun

Bun provides a fast, modern testing framework perfect for React component testing.

## Getting Started

Setting up Bun for testing is straightforward...`,
    excerpt:
      "Learn how to test React components effectively using Bun's built-in test runner and modern testing practices.",
    status: "published",
    author: "Ryan Lowe",
    coverImage: "https://images.unsplash.com/photo-1516116216624-53e697fedbea",
    tags: ["testing", "react", "bun"],
    category: "tutorials",
    readingTime: 7,
    viewCount: 432,
    featured: false,
    publishedAt: Date.now() - 21 * 24 * 60 * 60 * 1000,
    createdAt: Date.now() - 25 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 21 * 24 * 60 * 60 * 1000,
    seoMetadata: {
      metaTitle: "Testing React Components with Bun | Modern Testing Guide",
      metaDescription:
        "Learn how to test React components effectively using Bun's built-in test runner and modern testing practices.",
      ogImage: "https://images.unsplash.com/photo-1516116216624-53e697fedbea",
    },
  },
  {
    title: "Building Type-Safe APIs with tRPC",
    slug: "building-type-safe-apis-trpc",
    content: `# Building Type-Safe APIs with tRPC

tRPC enables end-to-end type safety for your APIs without code generation.

## What is tRPC?

tRPC leverages TypeScript to provide automatic type inference...`,
    excerpt:
      "Discover how tRPC brings end-to-end type safety to your APIs with zero code generation required.",
    status: "published",
    author: "Ryan Lowe",
    coverImage: "https://images.unsplash.com/photo-1618477388954-7852f32655ec",
    tags: ["trpc", "typescript", "api"],
    category: "deep-dive",
    readingTime: 10,
    viewCount: 723,
    featured: true,
    publishedAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
    createdAt: Date.now() - 35 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
    seoMetadata: {
      metaTitle: "Building Type-Safe APIs with tRPC | TypeScript API Guide",
      metaDescription:
        "Discover how tRPC brings end-to-end type safety to your APIs with zero code generation required.",
      ogImage: "https://images.unsplash.com/photo-1618477388954-7852f32655ec",
    },
  },
  {
    title: "Database Migration Strategies",
    slug: "database-migration-strategies",
    content: `# Database Migration Strategies

Managing database schema changes in production requires careful planning and execution.

## Migration Approaches

Different strategies work for different scenarios...`,
    excerpt:
      "Learn best practices for managing database migrations in production environments with zero downtime.",
    status: "archived",
    author: "Ryan Lowe",
    coverImage: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d",
    tags: ["database", "devops", "migrations"],
    category: "operations",
    readingTime: 9,
    viewCount: 1523,
    featured: false,
    createdAt: Date.now() - 90 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 60 * 24 * 60 * 60 * 1000,
    seoMetadata: {
      metaTitle: "Database Migration Strategies | DevOps Best Practices",
      metaDescription:
        "Learn best practices for managing database migrations in production environments with zero downtime.",
      ogImage: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d",
    },
  },
];

/**
 * Array of mock blog categories
 */
export const mockBlogCategories: BlogCategory[] = [
  {
    name: "Tutorials",
    slug: "tutorials",
    description:
      "Step-by-step guides and tutorials for web development technologies",
    postCount: 12,
  },
  {
    name: "Deep Dive",
    slug: "deep-dive",
    description:
      "In-depth technical explorations of advanced programming concepts",
    postCount: 8,
  },
  {
    name: "Operations",
    slug: "operations",
    description: "DevOps, infrastructure, and production operations content",
    postCount: 5,
  },
  {
    name: "News & Updates",
    slug: "news-updates",
    description: "Latest news and updates from the web development ecosystem",
    postCount: 15,
  },
];

/**
 * Array of mock blog tags
 */
export const mockBlogTags: BlogTag[] = [
  { name: "TypeScript", slug: "typescript", postCount: 8 },
  { name: "React", slug: "react", postCount: 12 },
  { name: "Next.js", slug: "nextjs", postCount: 7 },
  { name: "Tailwind", slug: "tailwind", postCount: 5 },
  { name: "Testing", slug: "testing", postCount: 6 },
  { name: "API", slug: "api", postCount: 4 },
  { name: "Database", slug: "database", postCount: 3 },
  { name: "DevOps", slug: "devops", postCount: 5 },
];

/**
 * Helper function to create a mock blog post with custom values
 * Useful for generating test data with specific requirements
 */
export function createMockBlogPost(
  overrides: Partial<BlogPost> = {},
): BlogPost {
  mockCounter++;
  const now = Date.now();
  const status = overrides.status || "draft";
  const isPublished = status === "published";

  return {
    title: `Mock Blog Post ${mockCounter}`,
    slug: `mock-blog-post-${mockCounter}`,
    content: `# Mock Blog Post ${mockCounter}\n\nThis is mock content for testing purposes.`,
    excerpt: `This is a mock excerpt for blog post ${mockCounter}`,
    status,
    author: "Test Author",
    coverImage: `https://images.unsplash.com/photo-${mockCounter}`,
    tags: ["test", "mock"],
    category: "testing",
    readingTime: 5,
    viewCount: 0,
    featured: false,
    ...(isPublished && { publishedAt: now - 1000 }),
    createdAt: now - 2000,
    updatedAt: now - 1000,
    seoMetadata: {
      metaTitle: `Mock Blog Post ${mockCounter} | Test`,
      metaDescription: `Mock description for blog post ${mockCounter}`,
      ogImage: `https://images.unsplash.com/photo-${mockCounter}`,
    },
    ...overrides,
  };
}

/**
 * Helper function to create a mock blog category with custom values
 */
export function createMockBlogCategory(
  overrides: Partial<BlogCategory> = {},
): BlogCategory {
  mockCounter++;
  return {
    name: `Mock Category ${mockCounter}`,
    slug: `mock-category-${mockCounter}`,
    description: `This is a mock category for testing purposes`,
    postCount: 0,
    ...overrides,
  };
}

/**
 * Helper function to create a mock blog tag with custom values
 */
export function createMockBlogTag(overrides: Partial<BlogTag> = {}): BlogTag {
  mockCounter++;
  return {
    name: `Mock Tag ${mockCounter}`,
    slug: `mock-tag-${mockCounter}`,
    postCount: 0,
    ...overrides,
  };
}
