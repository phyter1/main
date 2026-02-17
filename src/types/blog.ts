/**
 * Blog Type Definitions
 *
 * TypeScript types and interfaces for the blog system that match the Convex schema.
 * These types provide type safety for blog posts, categories, tags, and related data.
 */

/**
 * Blog post publication status
 *
 * - draft: Post is being written and not publicly visible
 * - published: Post is publicly visible on the blog
 * - archived: Post is no longer active but preserved for history
 */
export type BlogStatus = "draft" | "published" | "archived";

/**
 * SEO metadata for blog posts
 *
 * Defines all SEO-related fields for optimal search engine optimization
 * and social media sharing.
 */
export interface SEOMetadata {
  /**
   * Page title for SEO (appears in search results and browser tab)
   * Should be 50-60 characters for optimal display
   */
  metaTitle: string;

  /**
   * Meta description for SEO (appears in search results)
   * Should be 150-160 characters for optimal display
   */
  metaDescription: string;

  /**
   * Open Graph image URL for social media sharing
   * Recommended size: 1200x630px
   */
  ogImage?: string;

  /**
   * Keywords for SEO (comma-separated or array)
   * Used for search engine indexing
   */
  keywords?: string[];

  /**
   * Canonical URL to prevent duplicate content issues
   */
  canonicalUrl?: string;

  /**
   * Post author name for structured data
   */
  author?: string;

  /**
   * ISO 8601 timestamp of when post was first published
   * Used for article structured data
   */
  publishedTime?: string;

  /**
   * ISO 8601 timestamp of when post was last modified
   * Used for article structured data
   */
  modifiedTime?: string;
}

/**
 * Blog category
 *
 * Categories are high-level groupings for blog posts (e.g., "Technology", "Design")
 */
export interface BlogCategory {
  /**
   * Convex document ID
   */
  _id: string;

  /**
   * Creation timestamp (milliseconds since epoch)
   */
  _creationTime: number;

  /**
   * Category name (displayed in UI)
   */
  name: string;

  /**
   * URL-safe slug for routing
   */
  slug: string;

  /**
   * Optional description of the category
   */
  description?: string;

  /**
   * Number of posts in this category
   * Updated automatically when posts are added/removed
   */
  postCount: number;
}

/**
 * Blog tag
 *
 * Tags are granular labels for blog posts (e.g., "React", "TypeScript", "Tutorial")
 */
export interface BlogTag {
  /**
   * Convex document ID
   */
  _id: string;

  /**
   * Creation timestamp (milliseconds since epoch)
   */
  _creationTime: number;

  /**
   * Tag name (displayed in UI)
   */
  name: string;

  /**
   * URL-safe slug for routing
   */
  slug: string;

  /**
   * Number of posts with this tag
   * Updated automatically when posts are tagged/untagged
   */
  postCount: number;
}

/**
 * Blog post
 *
 * Complete blog post with all content, metadata, and relationships.
 * Matches the Convex blogPosts table schema.
 */
export interface BlogPost {
  /**
   * Convex document ID
   */
  _id: string;

  /**
   * Creation timestamp (milliseconds since epoch)
   */
  _creationTime: number;

  /**
   * Post title (displayed prominently in UI)
   */
  title: string;

  /**
   * URL-safe slug for routing (e.g., "getting-started-with-react")
   * Must be unique across all posts
   */
  slug: string;

  /**
   * Short excerpt or summary of the post
   * Displayed in post listings and previews
   * Recommended: 150-200 characters
   */
  excerpt: string;

  /**
   * Full post content in Markdown/MDX format
   * Supports GitHub Flavored Markdown (GFM) with tables, task lists, etc.
   */
  content: string;

  /**
   * Publication status of the post
   */
  status: BlogStatus;

  /**
   * Post author name
   */
  author: string;

  /**
   * Timestamp when post was first published (milliseconds since epoch)
   * Undefined for draft posts
   */
  publishedAt?: number;

  /**
   * Timestamp when post was last updated (milliseconds since epoch)
   * Always defined, even for drafts
   */
  updatedAt: number;

  /**
   * Cover image URL
   * Displayed at the top of the post and in post listings
   */
  coverImage?: string;

  /**
   * Category name (not ID, to simplify queries)
   */
  category: string;

  /**
   * Array of tag names (not IDs, to simplify queries)
   */
  tags: string[];

  /**
   * Whether this post is featured
   * Featured posts may be highlighted on the homepage
   */
  featured: boolean;

  /**
   * Number of times this post has been viewed
   * Incremented on each page view
   */
  viewCount: number;

  /**
   * Estimated reading time in minutes
   * Calculated based on word count (average reading speed: 200 words/min)
   */
  readingTime: number;

  /**
   * SEO metadata for this post
   * Used for search engine optimization and social sharing
   */
  seoMetadata: SEOMetadata;
}

/**
 * Blog post filter criteria
 *
 * Used for filtering and searching blog posts in queries
 */
export interface BlogPostFilter {
  /**
   * Filter by publication status
   */
  status?: BlogStatus;

  /**
   * Filter by category slug
   */
  category?: string;

  /**
   * Filter by tag slug
   */
  tag?: string;

  /**
   * Filter by featured status
   */
  featured?: boolean;

  /**
   * Search query (searches title, excerpt, and content)
   */
  searchQuery?: string;

  /**
   * Number of posts to return (pagination)
   */
  limit?: number;

  /**
   * Number of posts to skip (pagination)
   */
  offset?: number;
}

/**
 * Blog post sort options
 *
 * Defines how to sort blog post query results
 */
export interface BlogPostSort {
  /**
   * Field to sort by
   */
  field: "publishedAt" | "updatedAt" | "viewCount" | "title";

  /**
   * Sort direction
   */
  direction: "asc" | "desc";
}

/**
 * Paginated blog post results
 *
 * Standard pagination response for blog post queries
 */
export interface PaginatedBlogPosts {
  /**
   * Array of blog posts for current page
   */
  posts: BlogPost[];

  /**
   * Total number of posts matching the filter
   */
  total: number;

  /**
   * Number of posts per page
   */
  limit: number;

  /**
   * Current offset
   */
  offset: number;

  /**
   * Whether there are more posts available
   */
  hasMore: boolean;
}

/**
 * AI suggestion state
 *
 * Tracks the approval status of AI-generated metadata suggestions
 */
export type AISuggestionState = "pending" | "approved" | "rejected";

/**
 * Generic AI suggestion wrapper
 *
 * Wraps a suggested value with its approval state
 */
export interface AISuggestion<T> {
  /**
   * The suggested value
   */
  value: T;

  /**
   * Current state of the suggestion
   */
  state: AISuggestionState;
}

/**
 * AI suggestions for tags
 *
 * Includes additional tracking for rejected tags to prevent re-suggestion
 */
export interface AITagSuggestions extends AISuggestion<string[]> {
  /**
   * Tags that have been explicitly rejected
   * AI won't suggest these again
   */
  rejectedTags: string[];
}

/**
 * AI suggestions for SEO metadata fields
 *
 * Each SEO field can be independently suggested and approved/rejected
 */
export interface AISEOMetadataSuggestions {
  /**
   * Suggested meta title
   */
  metaTitle?: AISuggestion<string>;

  /**
   * Suggested meta description
   */
  metaDescription?: AISuggestion<string>;

  /**
   * Suggested keywords
   */
  keywords?: AISuggestion<string[]>;
}

/**
 * AI content analysis
 *
 * Read-only analysis of post content (tone, readability)
 */
export interface AIAnalysis {
  /**
   * Detected tone of the content (e.g., "Professional", "Casual", "Technical")
   */
  tone: string;

  /**
   * Readability assessment (e.g., "Easy", "Moderate", "Advanced")
   */
  readability: string;
}

/**
 * Complete AI metadata suggestions
 *
 * All AI-generated suggestions for a blog post
 */
export interface AIMetadataSuggestions {
  /**
   * Suggested excerpt
   */
  excerpt?: AISuggestion<string>;

  /**
   * Suggested tags with rejection tracking
   */
  tags?: AITagSuggestions;

  /**
   * Suggested category
   */
  category?: AISuggestion<string>;

  /**
   * Suggested SEO metadata fields
   */
  seoMetadata?: AISEOMetadataSuggestions;

  /**
   * Content analysis (read-only, not approve/reject)
   */
  analysis?: AIAnalysis;
}
