/**
 * Unit tests for upload-service.ts Vercel Blob integration
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock @vercel/blob module before importing upload-service
// Note: mock functions must be defined inside the factory for Vitest hoisting
vi.mock("@vercel/blob", () => ({
  put: vi.fn(() =>
    Promise.resolve({
      url: "https://test-blob.vercel-storage.com/test-image-abc123.png",
      pathname: "test-image-abc123.png",
      contentType: "image/png",
      contentDisposition: "inline",
    }),
  ),
  del: vi.fn(() => Promise.resolve()),
}));

import { del as mockDel, put as mockPut } from "@vercel/blob";
// Import after mocking
import {
  deleteImage,
  sanitizeFilename,
  uploadConfig,
  uploadImage,
  validateUploadFile,
} from "./upload-service";

describe("uploadImage", () => {
  beforeEach(() => {
    vi.mocked(mockPut).mockClear();
    // Set environment variable for tests
    process.env.BLOB_READ_WRITE_TOKEN = "test_token";
  });

  afterEach(() => {});

  it("should upload file to Vercel Blob and return URL", async () => {
    const file = new File(["test content"], "test.png", {
      type: "image/png",
    });
    const filename = "sanitized-test.png";

    const url = await uploadImage(file, filename);

    expect(url).toBe(
      "https://test-blob.vercel-storage.com/test-image-abc123.png",
    );
    expect(vi.mocked(mockPut)).toHaveBeenCalledTimes(1);
    expect(vi.mocked(mockPut)).toHaveBeenCalledWith(filename, file, {
      access: "public",
      addRandomSuffix: true,
      contentType: "image/png",
      cacheControlMaxAge: 60 * 60 * 24 * 365,
    });
  });

  it("should throw error if BLOB_READ_WRITE_TOKEN not configured", async () => {
    delete process.env.BLOB_READ_WRITE_TOKEN;

    const file = new File(["test content"], "test.png", {
      type: "image/png",
    });

    await expect(uploadImage(file, "test.png")).rejects.toThrow(
      "Blob token not configured",
    );
  });

  it("should handle Vercel Blob API errors", async () => {
    mockPut.mockImplementationOnce(() =>
      Promise.reject(new Error("Network error")),
    );

    const file = new File(["test content"], "test.png", {
      type: "image/png",
    });

    await expect(uploadImage(file, "test.png")).rejects.toThrow(
      "Vercel Blob upload failed: Network error",
    );
  });

  it("should apply sanitized filename before upload", async () => {
    const file = new File(["test content"], "../../malicious.png", {
      type: "image/png",
    });
    const sanitized = sanitizeFilename("../../malicious.png");

    await uploadImage(file, sanitized);

    expect(vi.mocked(mockPut)).toHaveBeenCalledWith(
      "malicious.png", // Path traversal removed
      file,
      expect.any(Object),
    );
  });
});

describe("deleteImage", () => {
  beforeEach(() => {
    mockDel.mockClear();
    process.env.BLOB_READ_WRITE_TOKEN = "test_token";
  });

  afterEach(() => {});

  it("should delete image from Vercel Blob", async () => {
    const url = "https://test-blob.vercel-storage.com/test-image-abc123.png";

    await deleteImage(url);

    expect(vi.mocked(mockDel)).toHaveBeenCalledTimes(1);
    expect(vi.mocked(mockDel)).toHaveBeenCalledWith(url);
  });

  it("should throw error if BLOB_READ_WRITE_TOKEN not configured", async () => {
    delete process.env.BLOB_READ_WRITE_TOKEN;

    await expect(
      deleteImage("https://test-blob.vercel-storage.com/test.png"),
    ).rejects.toThrow("Blob token not configured");
  });

  it("should handle Vercel Blob delete errors", async () => {
    mockDel.mockImplementationOnce(() =>
      Promise.reject(new Error("Delete failed")),
    );

    await expect(
      deleteImage("https://test-blob.vercel-storage.com/test.png"),
    ).rejects.toThrow("Vercel Blob delete failed: Delete failed");
  });
});

describe("validateUploadFile", () => {
  it("should validate PNG file successfully", () => {
    const file = new File(["test"], "test.png", { type: "image/png" });
    const result = validateUploadFile(file);

    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("should validate JPEG file successfully", () => {
    const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
    const result = validateUploadFile(file);

    expect(result.valid).toBe(true);
  });

  it("should validate GIF file successfully", () => {
    const file = new File(["test"], "test.gif", { type: "image/gif" });
    const result = validateUploadFile(file);

    expect(result.valid).toBe(true);
  });

  it("should validate WebP file successfully", () => {
    const file = new File(["test"], "test.webp", { type: "image/webp" });
    const result = validateUploadFile(file);

    expect(result.valid).toBe(true);
  });

  it("should reject invalid file type", () => {
    const file = new File(["test"], "test.pdf", {
      type: "application/pdf",
    });
    const result = validateUploadFile(file);

    expect(result.valid).toBe(false);
    expect(result.error).toContain("Invalid file type");
  });

  it("should reject file exceeding size limit", () => {
    // Create blob larger than 5MB
    const largeContent = new Array(6 * 1024 * 1024).fill("a").join("");
    const file = new File([largeContent], "large.png", {
      type: "image/png",
    });
    const result = validateUploadFile(file);

    expect(result.valid).toBe(false);
    expect(result.error).toContain("File size exceeds maximum limit");
  });

  it("should accept file at exact size limit", () => {
    // Create blob exactly 5MB
    const content = new Array(5 * 1024 * 1024).fill("a").join("");
    const file = new File([content], "exact.png", { type: "image/png" });
    const result = validateUploadFile(file);

    expect(result.valid).toBe(true);
  });
});

describe("sanitizeFilename", () => {
  it("should remove path traversal attempts", () => {
    expect(sanitizeFilename("../../etc/passwd")).toBe("etcpasswd");
    expect(sanitizeFilename("..\\..\\windows\\system32")).toBe(
      "windowssystem32",
    );
  });

  it("should remove directory separators", () => {
    expect(sanitizeFilename("path/to/file.png")).toBe("pathtofile.png");
    expect(sanitizeFilename("path\\to\\file.png")).toBe("pathtofile.png");
  });

  it("should replace special characters with underscore", () => {
    expect(sanitizeFilename("file name with spaces.png")).toBe(
      "file_name_with_spaces.png",
    );
    expect(sanitizeFilename("file@name#with$special%.png")).toBe(
      "file_name_with_special_.png",
    );
  });

  it("should preserve alphanumeric, dash, underscore, and dot", () => {
    expect(sanitizeFilename("valid-file_name123.png")).toBe(
      "valid-file_name123.png",
    );
  });

  it("should prevent multiple consecutive dots", () => {
    expect(sanitizeFilename("file...name.png")).toBe("file.name.png");
  });

  it("should generate default filename if empty after sanitization", () => {
    const result = sanitizeFilename("@#$%^&*()");
    expect(result).toMatch(/^upload_\d+$/);
  });

  it("should handle unicode characters", () => {
    // Unicode characters get replaced with single underscore (consecutive underscores removed)
    expect(sanitizeFilename("file-日本語.png")).toBe("file-_.png");
  });

  it("should handle already safe filenames", () => {
    expect(sanitizeFilename("my-photo-2024.jpg")).toBe("my-photo-2024.jpg");
  });
});

describe("uploadConfig", () => {
  it("should export MAX_FILE_SIZE constant", () => {
    expect(uploadConfig.MAX_FILE_SIZE).toBe(5 * 1024 * 1024);
  });

  it("should export ACCEPTED_IMAGE_TYPES array", () => {
    expect(uploadConfig.ACCEPTED_IMAGE_TYPES).toEqual([
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/gif",
      "image/webp",
    ]);
  });
});
