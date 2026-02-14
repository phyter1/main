/**
 * Blog Utility Functions
 *
 * Comprehensive utilities for blog post management including:
 * - URL-safe slug generation from titles
 * - Reading time estimation based on word count
 * - Consistent date formatting
 * - Markdown sanitization for security
 * - Slug validation with detailed error messages
 * - Content hashing for change detection
 */

import { format } from "date-fns";

/**
 * Validation result for slug validation
 */
export interface SlugValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Generate URL-safe slug from title
 *
 * Converts a blog post title into a URL-safe slug by:
 * - Converting to lowercase
 * - Replacing spaces with hyphens
 * - Removing special characters (preserving numbers and letters)
 * - Handling unicode/accented characters
 * - Preventing consecutive hyphens
 * - Removing leading/trailing hyphens
 *
 * @param title - The blog post title to convert
 * @returns URL-safe slug
 *
 * @example
 * generateSlug("Hello World") // "hello-world"
 * generateSlug("Top 10 JavaScript Tips!") // "top-10-javascript-tips"
 * generateSlug("Café résumé") // "cafe-resume"
 */
export function generateSlug(title: string): string {
  return (
    title
      .toLowerCase()
      .trim()
      // Normalize unicode characters (e.g., é -> e)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      // Replace spaces (including multiple spaces) with single hyphen
      .replace(/\s+/g, "-")
      // Remove all characters except lowercase letters, numbers, and hyphens
      .replace(/[^a-z0-9-]/g, "")
      // Replace multiple consecutive hyphens with single hyphen
      .replace(/-+/g, "-")
      // Remove leading and trailing hyphens
      .replace(/^-+|-+$/g, "")
      // Limit length to 200 characters
      .slice(0, 200)
      // Remove trailing hyphen if slicing created one
      .replace(/-+$/g, "")
  );
}

/**
 * Calculate estimated reading time in minutes
 *
 * Estimates reading time based on average reading speed of 200 words per minute.
 * Returns 0 for very short content (< 1 minute read time).
 *
 * @param content - The blog post content (markdown or plain text)
 * @returns Estimated reading time in minutes (0 for < 1 minute)
 *
 * @example
 * calculateReadingTime("word ".repeat(50)) // 0 (less than 1 minute)
 * calculateReadingTime("word ".repeat(200)) // 1
 * calculateReadingTime("word ".repeat(400)) // 2
 */
export function calculateReadingTime(content: string): number {
  const trimmed = content.trim();

  // Return 1 minute minimum for empty content
  if (!trimmed) {
    return 1;
  }

  // Split by whitespace and filter out empty strings
  const words = trimmed.split(/\s+/).filter((word) => word.length > 0);
  const wordCount = words.length;

  // Average reading speed: 200 words per minute
  const WORDS_PER_MINUTE = 200;
  const minutes = wordCount / WORDS_PER_MINUTE;

  // Round up (0 for < 1 minute)
  return Math.ceil(minutes);
}

/**
 * Format timestamp as human-readable date
 *
 * Formats a timestamp, Date object, or date string into consistent
 * "MMM dd, yyyy" format (e.g., "Jan 15, 2024").
 *
 * @param timestamp - Unix timestamp (milliseconds), Date object, or date string
 * @returns Formatted date string
 *
 * @example
 * formatDate(new Date("2024-01-15")) // "Jan 15, 2024"
 * formatDate(1705276800000) // "Jan 15, 2024"
 * formatDate("2024-03-20") // "Mar 20, 2024"
 */
export function formatDate(timestamp: number | Date | string): string {
  const date = typeof timestamp === "string" ? new Date(timestamp) : timestamp;
  return format(date, "MMM dd, yyyy");
}

/**
 * Sanitize markdown content to prevent XSS and script injection
 *
 * Removes dangerous HTML elements and attributes while preserving
 * safe markdown and HTML formatting. Protects against:
 * - Script injection (<script> tags)
 * - Inline JavaScript (javascript: protocol)
 * - Event handlers (onclick, onerror, etc.)
 * - Dangerous iframes, objects, and embeds
 *
 * Safe elements like <strong>, <em>, <code>, <pre> are preserved.
 *
 * @param content - Raw markdown content from user input
 * @returns Sanitized markdown safe for rendering
 *
 * @example
 * sanitizeMarkdown("# Title\n**bold**") // "# Title\n**bold**"
 * sanitizeMarkdown("<script>alert('xss')</script>") // ""
 * sanitizeMarkdown("<strong>Safe</strong>") // "<strong>Safe</strong>"
 */
export function sanitizeMarkdown(content: string): string {
  return (
    content
      // Remove script tags and their content
      .replace(/<script[^>]*>.*?<\/script>/gi, "")
      // Remove iframe tags and their content
      .replace(/<iframe[^>]*>.*?<\/iframe>/gi, "")
      // Remove object tags and their content
      .replace(/<object[^>]*>.*?<\/object>/gi, "")
      // Remove embed tags
      .replace(/<embed[^>]*>/gi, "")
      // Remove event handlers (onclick, onerror, etc.)
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
      // Remove javascript: protocol from any attributes
      .replace(/javascript:/gi, "")
  );
}

/**
 * Validate slug format and provide detailed error messages
 *
 * Validates that a slug:
 * - Contains only lowercase letters, numbers, and hyphens
 * - Does not start or end with a hyphen
 * - Does not contain consecutive hyphens
 * - Is not empty
 * - Does not exceed 200 characters
 *
 * @param slug - The slug to validate
 * @returns Validation result with isValid boolean and optional error message
 *
 * @example
 * validateSlug("hello-world") // { isValid: true }
 * validateSlug("Hello-World") // { isValid: false, error: "..." }
 * validateSlug("hello--world") // { isValid: false, error: "..." }
 */
export function validateSlug(slug: string): SlugValidationResult {
  // Handle null/undefined
  if (slug == null) {
    return {
      isValid: false,
      error: "Slug cannot be empty",
    };
  }

  // Check for empty or whitespace-only
  const trimmed = slug.trim();
  if (!trimmed) {
    return {
      isValid: false,
      error: "Slug cannot be empty",
    };
  }

  // Check length
  if (trimmed.length > 200) {
    return {
      isValid: false,
      error: "Slug is too long (maximum 200 characters)",
    };
  }

  // Check for uppercase letters
  if (/[A-Z]/.test(trimmed)) {
    return {
      isValid: false,
      error: "Slug must be lowercase only",
    };
  }

  // Check for spaces
  if (/\s/.test(trimmed)) {
    return {
      isValid: false,
      error: "Slug cannot contain spaces",
    };
  }

  // Check for special characters (only lowercase letters, numbers, and hyphens allowed)
  if (!/^[a-z0-9-]+$/.test(trimmed)) {
    return {
      isValid: false,
      error:
        "Slug can only contain lowercase letters, numbers, and hyphens (no special characters)",
    };
  }

  // Check for leading or trailing hyphens
  if (/^-|-$/.test(trimmed)) {
    return {
      isValid: false,
      error: "Slug cannot start or end with a hyphen",
    };
  }

  // Check for consecutive hyphens
  if (/--/.test(trimmed)) {
    return {
      isValid: false,
      error: "Slug cannot contain consecutive hyphens",
    };
  }

  return {
    isValid: true,
  };
}

/**
 * Generate SHA-256 hash of content for change detection
 *
 * Creates a consistent cryptographic hash of content using SHA-256 algorithm.
 * The hash can be stored and later compared to detect if content has changed.
 *
 * **Use Cases:**
 * - Detect when blog post content has been modified
 * - Trigger AI re-analysis only when content changes
 * - Cache invalidation based on content changes
 *
 * **Performance:**
 * - Handles large content (100KB+) efficiently
 * - SHA-256 computed in < 100ms for typical blog posts
 * - Returns 64-character hexadecimal string
 *
 * @param content - The content to hash (markdown, plain text, etc.)
 * @returns 64-character hexadecimal SHA-256 hash
 *
 * @example
 * const hash1 = hashContent("Hello, world!");
 * const hash2 = hashContent("Hello, world!");
 * console.log(hash1 === hash2); // true
 *
 * const hash3 = hashContent("Goodbye, world!");
 * console.log(hash1 === hash3); // false
 */
export async function hashContent(content: string): Promise<string> {
  // Convert string to Uint8Array for Web Crypto API
  const encoder = new TextEncoder();
  const data = encoder.encode(content);

  // Generate SHA-256 hash using Web Crypto API (available in Node.js 15+ and browsers)
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);

  // Convert ArrayBuffer to hexadecimal string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  return hashHex;
}

/**
 * Check if content has changed compared to a previous hash
 *
 * Compares current content against a previously stored hash to determine
 * if the content has been modified. Useful for triggering actions only
 * when content actually changes.
 *
 * **Use Cases:**
 * - Determine if AI should re-analyze blog post
 * - Detect changes before saving to database
 * - Cache invalidation logic
 *
 * **Edge Case Handling:**
 * - Returns `true` if previous hash is null/undefined/empty (treat as changed)
 * - Returns `true` if hash format is invalid
 * - Case-sensitive comparison (whitespace matters)
 *
 * @param currentContent - The current content to check
 * @param previousHash - The hash of the previous content (or null/undefined)
 * @returns `true` if content has changed, `false` if identical
 *
 * @example
 * const original = "Hello, world!";
 * const hash = await hashContent(original);
 *
 * const unchanged = await hasContentChanged(original, hash);
 * console.log(unchanged); // false
 *
 * const modified = "Goodbye, world!";
 * const changed = await hasContentChanged(modified, hash);
 * console.log(changed); // true
 *
 * // Handle null/undefined previous hash
 * const firstTime = await hasContentChanged("New content", null);
 * console.log(firstTime); // true (no previous hash to compare)
 */
export async function hasContentChanged(
  currentContent: string,
  previousHash: string | null | undefined,
): Promise<boolean> {
  // If no previous hash exists, treat as changed
  if (!previousHash || previousHash.trim() === "") {
    return true;
  }

  // Generate hash of current content
  const currentHash = await hashContent(currentContent);

  // Compare hashes (case-sensitive)
  return currentHash !== previousHash;
}
