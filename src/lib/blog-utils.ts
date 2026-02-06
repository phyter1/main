/**
 * Blog Utility Functions
 *
 * Comprehensive utilities for blog post management including:
 * - URL-safe slug generation from titles
 * - Reading time estimation based on word count
 * - Consistent date formatting
 * - Markdown sanitization for security
 * - Slug validation with detailed error messages
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
 * Always returns at least 1 minute for any content.
 *
 * @param content - The blog post content (markdown or plain text)
 * @returns Estimated reading time in minutes (minimum 1)
 *
 * @example
 * calculateReadingTime("word ".repeat(200)) // 1
 * calculateReadingTime("word ".repeat(400)) // 2
 * calculateReadingTime("word ".repeat(600)) // 3
 */
export function calculateReadingTime(content: string): number {
  const trimmed = content.trim();

  // Return 1 minute for empty or very short content
  if (!trimmed) {
    return 1;
  }

  // Split by whitespace and filter out empty strings
  const words = trimmed.split(/\s+/).filter((word) => word.length > 0);
  const wordCount = words.length;

  // Average reading speed: 200 words per minute
  const WORDS_PER_MINUTE = 200;
  const minutes = wordCount / WORDS_PER_MINUTE;

  // Round up and ensure minimum of 1 minute
  return Math.max(1, Math.ceil(minutes));
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
