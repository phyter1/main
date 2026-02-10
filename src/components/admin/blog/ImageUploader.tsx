"use client";

import { Upload, X } from "lucide-react";
import Image from "next/image";
import {
  type ChangeEvent,
  type DragEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * ImageUploader Component Props
 */
interface ImageUploaderProps {
  /**
   * Callback fired when image upload completes successfully
   * @param url - The URL of the uploaded image
   */
  onUploadComplete: (url: string) => void;

  /**
   * Callback fired when an error occurs during upload
   * @param error - The error message
   */
  onError: (error: string) => void;

  /**
   * Optional: Initial image URL to display
   */
  initialImageUrl?: string;

  /**
   * Optional: Maximum file size in bytes (default: 5MB)
   */
  maxFileSize?: number;

  /**
   * Optional: Accepted file types (default: image/*)
   */
  acceptedTypes?: string[];
}

/**
 * Image validation configuration
 */
const DEFAULT_MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
];
const UPLOAD_SERVICE_URL =
  process.env.NEXT_PUBLIC_UPLOAD_SERVICE_URL || "/api/admin/blog/upload";

/**
 * ImageUploader Component
 *
 * A comprehensive image uploader with drag-and-drop, file selection, URL input,
 * preview display, progress indication, validation, and error handling.
 *
 * Features:
 * - Drag-and-drop file upload
 * - Manual file selection
 * - URL input option
 * - Image preview
 * - Upload progress indicator
 * - File validation (size, format)
 * - Integration with upload service
 * - Comprehensive error handling
 *
 * @example
 * ```tsx
 * <ImageUploader
 *   onUploadComplete={(url) => console.log('Uploaded:', url)}
 *   onError={(error) => console.error('Error:', error)}
 * />
 * ```
 */
export function ImageUploader({
  onUploadComplete,
  onError,
  initialImageUrl,
  maxFileSize = DEFAULT_MAX_FILE_SIZE,
  acceptedTypes = ACCEPTED_IMAGE_TYPES,
}: ImageUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    initialImageUrl || null,
  );
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageUrlInputId = useId(); // Generate unique ID for accessibility

  /**
   * Sync preview URL with initialImageUrl prop changes
   */
  useEffect(() => {
    setPreviewUrl(initialImageUrl || null);
  }, [initialImageUrl]);

  /**
   * Validates an image file
   */
  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Check file type
    if (!acceptedTypes.includes(file.type)) {
      return {
        valid: false,
        error: "Only image files are allowed (PNG, JPG, GIF, WebP)",
      };
    }

    // Check file size
    if (file.size > maxFileSize) {
      return {
        valid: false,
        error: `File size must be less than ${Math.round(maxFileSize / (1024 * 1024))}MB`,
      };
    }

    return { valid: true };
  };

  /**
   * Validates a URL
   */
  const validateUrl = (url: string): { valid: boolean; error?: string } => {
    try {
      const urlObj = new URL(url);
      if (!urlObj.protocol.startsWith("http")) {
        return {
          valid: false,
          error: "URL must start with http:// or https://",
        };
      }
      return { valid: true };
    } catch {
      return { valid: false, error: "Please enter a valid URL" };
    }
  };

  /**
   * Uploads a file to the upload service
   */
  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(UPLOAD_SERVICE_URL, {
      method: "POST",
      body: formData,
      credentials: "same-origin",
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.url;
  };

  /**
   * Handles file selection and upload
   */
  const handleFileUpload = async (file: File) => {
    // Clear previous error and state
    setErrorMessage(null);
    setPreviewUrl(null);

    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      setErrorMessage(validation.error || "Invalid file");
      onError(validation.error || "Invalid file");
      return;
    }

    // Create preview after validation passes
    const previewObjectUrl = URL.createObjectURL(file);
    setPreviewUrl(previewObjectUrl);

    // Upload file
    setIsUploading(true);
    try {
      const uploadedUrl = await uploadFile(file);
      onUploadComplete(uploadedUrl);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Upload failed";
      setErrorMessage(errorMsg);
      onError(errorMsg);
      setPreviewUrl(null);
      URL.revokeObjectURL(previewObjectUrl);
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Handles file input change
   */
  const handleFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  /**
   * Handles drag enter event
   */
  const handleDragEnter = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  /**
   * Handles drag leave event
   */
  const handleDragLeave = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  /**
   * Handles drag over event
   */
  const handleDragOver = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
  };

  /**
   * Handles file drop
   */
  const handleDrop = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  /**
   * Handles URL input submission
   */
  const handleUrlSubmit = () => {
    // Clear previous error
    setErrorMessage(null);

    // Validate URL
    const validation = validateUrl(imageUrl);
    if (!validation.valid) {
      setErrorMessage(validation.error || "Invalid URL");
      onError(validation.error || "Invalid URL");
      return;
    }

    // Set preview and complete
    setPreviewUrl(imageUrl);
    onUploadComplete(imageUrl);
    setImageUrl("");
  };

  /**
   * Removes current image and resets state
   */
  const handleRemove = () => {
    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setErrorMessage(null);
    setImageUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /**
   * Triggers file input click
   */
  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Upload Header */}
          <div>
            <h3 className="text-lg font-semibold">Upload Image</h3>
            <p className="text-sm text-muted-foreground">
              PNG, JPG, GIF up to {Math.round(maxFileSize / (1024 * 1024))}MB
            </p>
          </div>

          {/* Preview or Upload Zone */}
          {previewUrl ? (
            <div className="relative">
              {previewUrl.startsWith("blob:") ||
              previewUrl.startsWith("http") ? (
                // biome-ignore lint/performance/noImgElement: Blob URLs and external URLs cannot use Next Image
                <img
                  src={previewUrl}
                  alt="Upload preview"
                  data-testid="image-preview"
                  className="w-full h-64 object-cover rounded-md border"
                />
              ) : (
                <Image
                  src={previewUrl}
                  alt="Upload preview"
                  width={800}
                  height={256}
                  data-testid="image-preview"
                  className="w-full h-64 object-cover rounded-md border"
                />
              )}
              <Button
                variant="destructive"
                size="sm"
                onClick={handleRemove}
                className="absolute top-2 right-2"
              >
                <X className="size-4 mr-1" />
                Remove
              </Button>
            </div>
          ) : (
            // biome-ignore lint/a11y/useSemanticElements: must be div not button to avoid nested button HTML error
            <div
              data-testid="drop-zone"
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer w-full ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-muted-foreground/50"
              }`}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
            >
              <Upload className="size-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm font-medium mb-2">
                Drag and drop an image here
              </p>
              <p className="text-xs text-muted-foreground mb-4">or</p>
              <Button
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  handleBrowseClick();
                }}
                disabled={isUploading}
                type="button"
              >
                Browse Files
              </Button>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                data-testid="file-input"
                aria-label="Upload image file"
                className="hidden"
              />
            </div>
          )}

          {/* Upload Progress */}
          {isUploading && (
            <div className="flex items-center justify-center py-2">
              <div className="flex items-center gap-2">
                <div className="size-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-muted-foreground">
                  Uploading...
                </span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div
              role="alert"
              className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm"
            >
              {errorMessage}
            </div>
          )}

          {/* URL Input Option */}
          <div className="border-t pt-4">
            <Label htmlFor={imageUrlInputId} className="text-sm font-medium">
              Or paste image URL
            </Label>
            <div className="flex gap-2 mt-2">
              <Input
                id={imageUrlInputId}
                type="url"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                disabled={isUploading}
                className="flex-1"
              />
              <Button
                onClick={handleUrlSubmit}
                disabled={!imageUrl || isUploading}
              >
                Use URL
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
