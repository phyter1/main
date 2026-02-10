/**
 * Upload Service for Image Management
 * Handles file uploads to Vercel Blob Store
 */

import { del, put } from "@vercel/blob";

/**
 * Upload configuration constants
 */
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/gif",
  "image/webp",
];

/**
 * Upload file to Vercel Blob Store
 * @param file - File or Blob to upload
 * @param filename - Sanitized filename for the upload
 * @returns Promise resolving to uploaded image URL
 */
export async function uploadImage(
  file: File | Blob,
  filename: string,
): Promise<string> {
  // Validate environment configuration
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error(
      "Blob token not configured. Set BLOB_READ_WRITE_TOKEN environment variable.",
    );
  }

  try {
    // Upload to Vercel Blob Store
    const blob = await put(filename, file, {
      access: "public",
      addRandomSuffix: true,
      contentType: file.type,
      cacheControlMaxAge: 60 * 60 * 24 * 365, // 1 year CDN cache
    });

    return blob.url;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Vercel Blob upload failed: ${errorMessage}`);
  }
}

/**
 * Delete image from Vercel Blob Store
 * @param url - URL of the image to delete
 * @returns Promise resolving when deletion completes
 */
export async function deleteImage(url: string): Promise<void> {
  // Validate environment configuration
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error(
      "Blob token not configured. Set BLOB_READ_WRITE_TOKEN environment variable.",
    );
  }

  try {
    await del(url);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Vercel Blob delete failed: ${errorMessage}`);
  }
}

/**
 * Validate file for upload
 * @param file - File or Blob to validate
 * @returns Validation result with error message if invalid
 */
export function validateUploadFile(file: File | Blob): {
  valid: boolean;
  error?: string;
} {
  // Check file type
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error:
        "Invalid file type. Only PNG, JPEG, GIF, and WebP images are allowed.",
    };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
    };
  }

  return { valid: true };
}

/**
 * Sanitize filename to prevent path traversal and other attacks
 * @param filename - Original filename
 * @returns Sanitized filename
 */
export function sanitizeFilename(filename: string): string {
  // Remove path traversal attempts
  let sanitized = filename.replace(/\.\./g, "");

  // Remove directory separators
  sanitized = sanitized.replace(/[/\\]/g, "");

  // Only allow alphanumeric, dash, underscore, and dot
  sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, "_");

  // Prevent multiple consecutive dots
  sanitized = sanitized.replace(/\.{2,}/g, ".");

  // Remove multiple consecutive underscores
  sanitized = sanitized.replace(/_{2,}/g, "_");

  // Remove leading/trailing underscores
  sanitized = sanitized.replace(/^_+|_+$/g, "");

  // Ensure filename is not empty or only underscores
  if (sanitized.length === 0 || /^_+$/.test(sanitized)) {
    sanitized = `upload_${Date.now()}`;
  }

  return sanitized;
}

/**
 * Export configuration and constants for testing
 */
export const uploadConfig = {
  MAX_FILE_SIZE,
  ACCEPTED_IMAGE_TYPES,
};
