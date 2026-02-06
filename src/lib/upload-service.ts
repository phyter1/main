/**
 * Upload Service for Image Management
 * Handles file uploads to Cloudinary or S3 based on environment configuration
 */

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
 * Upload service configuration
 */
interface UploadConfig {
  provider: "cloudinary" | "s3" | "local";
  cloudinaryUrl?: string;
  cloudinaryPreset?: string;
  s3Bucket?: string;
  s3Region?: string;
}

/**
 * Get upload service configuration from environment
 */
function getUploadConfig(): UploadConfig {
  const provider = (process.env.UPLOAD_PROVIDER || "cloudinary") as
    | "cloudinary"
    | "s3"
    | "local";

  return {
    provider,
    cloudinaryUrl: process.env.CLOUDINARY_UPLOAD_URL,
    cloudinaryPreset: process.env.CLOUDINARY_UPLOAD_PRESET,
    s3Bucket: process.env.S3_BUCKET,
    s3Region: process.env.S3_REGION || "us-east-1",
  };
}

/**
 * Upload file to Cloudinary
 * @param file - File or Blob to upload
 * @returns Promise resolving to uploaded image URL
 */
export async function uploadToCloudinary(file: File | Blob): Promise<string> {
  const config = getUploadConfig();

  // Validate configuration
  if (!config.cloudinaryUrl) {
    throw new Error(
      "Cloudinary upload URL not configured. Set CLOUDINARY_UPLOAD_URL environment variable.",
    );
  }

  // Create form data for Cloudinary API
  const formData = new FormData();
  formData.append("file", file);

  if (config.cloudinaryPreset) {
    formData.append("upload_preset", config.cloudinaryPreset);
  }

  // Upload to Cloudinary
  const response = await fetch(config.cloudinaryUrl, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Cloudinary upload failed: ${response.statusText}`);
  }

  const data = await response.json();

  // Return secure URL from Cloudinary response
  if (!data.secure_url) {
    throw new Error("Cloudinary response missing secure_url");
  }

  return data.secure_url;
}

/**
 * Upload file to S3
 * @param file - File or Blob to upload
 * @returns Promise resolving to uploaded image URL
 */
export async function uploadToS3(_file: File | Blob): Promise<string> {
  const config = getUploadConfig();

  if (!config.s3Bucket) {
    throw new Error(
      "S3 bucket not configured. Set S3_BUCKET environment variable.",
    );
  }

  // Note: In production, you would use AWS SDK here
  // For now, this is a placeholder that will be implemented when S3 is chosen
  throw new Error("S3 upload not yet implemented. Use Cloudinary provider.");
}

/**
 * Upload file to local storage (development only)
 * @param file - File or Blob to upload
 * @returns Promise resolving to local file URL
 */
export async function uploadToLocal(_file: File | Blob): Promise<string> {
  // Local storage is not recommended for production
  // This is a placeholder for development/testing
  throw new Error(
    "Local upload not implemented. Use Cloudinary or S3 provider.",
  );
}

/**
 * Main upload function that routes to appropriate service
 * @param file - File or Blob to upload
 * @returns Promise resolving to uploaded image URL
 */
export async function uploadImage(file: File | Blob): Promise<string> {
  const config = getUploadConfig();

  switch (config.provider) {
    case "cloudinary":
      return uploadToCloudinary(file);
    case "s3":
      return uploadToS3(file);
    case "local":
      return uploadToLocal(file);
    default:
      throw new Error(`Unknown upload provider: ${config.provider}`);
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

  // Ensure filename is not empty
  if (sanitized.length === 0) {
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
  getConfig: getUploadConfig,
};
