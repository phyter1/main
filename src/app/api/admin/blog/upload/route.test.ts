/**
 * Image Upload API Route Tests
 * Tests POST /api/admin/blog/upload endpoint for file upload functionality
 *
 * Test Coverage:
 * - Authentication and authorization
 * - Rate limiting enforcement
 * - File validation (type, size)
 * - Upload service integration
 * - Error handling and responses
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { verifySessionToken } from "@/lib/auth";

// Mock auth module
vi.mock("@/lib/auth", () => ({
  verifySessionToken: vi.fn(() => Promise.resolve(true)),
}));

// Mock upload service
vi.mock("@/lib/upload-service", () => ({
  validateUploadFile: vi.fn(() => ({ valid: true })),
  sanitizeFilename: vi.fn((filename: string) => filename),
  uploadImage: vi.fn(() =>
    Promise.resolve("https://test-blob.vercel-storage.com/test-abc123.jpg"),
  ),
}));

// Import upload service after mocks
import {
  sanitizeFilename,
  uploadImage,
  validateUploadFile,
} from "@/lib/upload-service";

describe("POST /api/admin/blog/upload", () => {
  let POST: any;

  beforeEach(async () => {
    // Clear all mock call counts
    vi.clearAllMocks();

    // Set default: auth succeeds
    vi.mocked(verifySessionToken).mockReturnValue(Promise.resolve(true));

    // Reset upload service mocks to defaults
    vi.mocked(validateUploadFile).mockReturnValue({ valid: true });
    vi.mocked(sanitizeFilename).mockImplementation(
      (filename: string) => filename,
    );
    vi.mocked(uploadImage).mockResolvedValue(
      "https://test-blob.vercel-storage.com/test-abc123.jpg",
    );

    // Clear rate limit state by re-importing the module
    // This forces the uploadRateLimits Map to be reset
    vi.resetModules();
    const module = await import("./route");
    POST = module.POST;
  });

  /**
   * Authentication Tests
   */
  describe("Authentication", () => {
    it("should return 401 when session cookie is missing", async () => {
      const formData = new FormData();
      formData.append(
        "file",
        new Blob(["test"], { type: "image/png" }),
        "test.png",
      );

      const request = new Request(
        "http://localhost:3000/api/admin/blog/upload",
        {
          method: "POST",
          body: formData,
        },
      ) as any;

      // Mock cookies property with no session token
      Object.defineProperty(request, "cookies", {
        value: {
          get: () => undefined,
        },
        writable: true,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized. Admin authentication required.");
    });

    it("should return 401 when session token is invalid", async () => {
      vi.mocked(verifySessionToken).mockResolvedValue(false);

      const formData = new FormData();
      formData.append(
        "file",
        new Blob(["test"], { type: "image/png" }),
        "test.png",
      );

      const request = new Request(
        "http://localhost:3000/api/admin/blog/upload",
        {
          method: "POST",
          body: formData,
        },
      ) as any;

      // Mock cookies property with invalid token
      Object.defineProperty(request, "cookies", {
        value: {
          get: () => ({ value: "invalid-token" }),
        },
        writable: true,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized. Admin authentication required.");
    });

    it("should accept valid session token", async () => {
      vi.mocked(verifySessionToken).mockResolvedValue(true);

      const formData = new FormData();
      formData.append(
        "file",
        new Blob(["test"], { type: "image/png" }),
        "test.png",
      );

      const request = new Request(
        "http://localhost:3000/api/admin/blog/upload",
        {
          method: "POST",
          body: formData,
        },
      ) as any;

      // Mock cookies property
      Object.defineProperty(request, "cookies", {
        value: {
          get: () => ({ value: "valid-session-token" }),
        },
        writable: true,
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(vi.mocked(verifySessionToken)).toHaveBeenCalledWith(
        "valid-session-token",
      );
    });
  });

  /**
   * Rate Limiting Tests
   */
  describe("Rate Limiting", () => {
    it("should enforce rate limiting after exceeding max uploads", async () => {
      // Make 10 successful requests (at the limit)
      for (let i = 0; i < 10; i++) {
        const formData = new FormData();
        formData.append(
          "file",
          new Blob(["test"], { type: "image/png" }),
          "test.png",
        );

        const request = new Request(
          "http://localhost:3000/api/admin/blog/upload",
          {
            method: "POST",
            body: formData,
          },
        ) as any;

        // Mock cookies property
        Object.defineProperty(request, "cookies", {
          value: {
            get: () => ({ value: "valid-session-token" }),
          },
          writable: true,
        });

        // Mock headers for IP tracking
        const originalGet = request.headers.get.bind(request.headers);
        request.headers.get = (name: string) => {
          if (name.toLowerCase() === "x-forwarded-for") {
            return "192.168.1.100";
          }
          return originalGet(name);
        };

        await POST(request);
      }

      // 11th request should be rate limited
      const formData = new FormData();
      formData.append(
        "file",
        new Blob(["test"], { type: "image/png" }),
        "test.png",
      );

      const request = new Request(
        "http://localhost:3000/api/admin/blog/upload",
        {
          method: "POST",
          body: formData,
        },
      ) as any;

      // Mock cookies property
      Object.defineProperty(request, "cookies", {
        value: {
          get: () => ({ value: "valid-session-token" }),
        },
        writable: true,
      });

      // Mock headers for IP tracking
      const originalGet = request.headers.get.bind(request.headers);
      request.headers.get = (name: string) => {
        if (name.toLowerCase() === "x-forwarded-for") {
          return "192.168.1.100";
        }
        return originalGet(name);
      };

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.error).toBe("Rate limit exceeded. Please try again later.");
      expect(data.retryAfter).toBeDefined();
      expect(response.headers.get("Retry-After")).toBeDefined();
    });

    it("should track rate limits per IP address independently", async () => {
      // Make request from IP 1
      const formData1 = new FormData();
      formData1.append(
        "file",
        new Blob(["test"], { type: "image/png" }),
        "test.png",
      );

      const request1 = new Request(
        "http://localhost:3000/api/admin/blog/upload",
        {
          method: "POST",
          body: formData1,
        },
      ) as any;

      // Mock cookies property
      Object.defineProperty(request1, "cookies", {
        value: {
          get: () => ({ value: "valid-session-token" }),
        },
        writable: true,
      });

      // Mock headers for IP 1
      const originalGet1 = request1.headers.get.bind(request1.headers);
      request1.headers.get = (name: string) => {
        if (name.toLowerCase() === "x-forwarded-for") {
          return "192.168.1.100";
        }
        return originalGet1(name);
      };

      const response1 = await POST(request1);
      expect(response1.status).toBe(200);

      // Make request from IP 2
      const formData2 = new FormData();
      formData2.append(
        "file",
        new Blob(["test"], { type: "image/png" }),
        "test.png",
      );

      const request2 = new Request(
        "http://localhost:3000/api/admin/blog/upload",
        {
          method: "POST",
          body: formData2,
        },
      ) as any;

      // Mock cookies property
      Object.defineProperty(request2, "cookies", {
        value: {
          get: () => ({ value: "valid-session-token" }),
        },
        writable: true,
      });

      // Mock headers for IP 2
      const originalGet2 = request2.headers.get.bind(request2.headers);
      request2.headers.get = (name: string) => {
        if (name.toLowerCase() === "x-forwarded-for") {
          return "192.168.1.200";
        }
        return originalGet2(name);
      };

      const response2 = await POST(request2);
      expect(response2.status).toBe(200);
    });

    it("should extract IP from x-real-ip header if x-forwarded-for is not present", async () => {
      const formData = new FormData();
      formData.append(
        "file",
        new Blob(["test"], { type: "image/png" }),
        "test.png",
      );

      const request = new Request(
        "http://localhost:3000/api/admin/blog/upload",
        {
          method: "POST",
          body: formData,
        },
      ) as any;

      // Mock cookies property
      Object.defineProperty(request, "cookies", {
        value: {
          get: () => ({ value: "valid-session-token" }),
        },
        writable: true,
      });

      // Mock headers for IP
      const originalGet = request.headers.get.bind(request.headers);
      request.headers.get = (name: string) => {
        if (name.toLowerCase() === "x-real-ip") {
          return "192.168.1.150";
        }
        return originalGet(name);
      };

      const response = await POST(request);
      expect(response.status).toBe(200);
    });
  });

  /**
   * File Validation Tests
   */
  describe("File Validation", () => {
    it("should return 400 when no file is provided", async () => {
      const formData = new FormData();
      // No file appended

      const request = new Request(
        "http://localhost:3000/api/admin/blog/upload",
        {
          method: "POST",
          body: formData,
        },
      ) as any;

      // Mock cookies property
      Object.defineProperty(request, "cookies", {
        value: {
          get: () => ({ value: "valid-session-token" }),
        },
        writable: true,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe(
        "No file provided. Include 'file' field in form data.",
      );
    });

    it("should return 400 when file field is not a Blob", async () => {
      const formData = new FormData();
      formData.append("file", "not-a-file");

      const request = new Request(
        "http://localhost:3000/api/admin/blog/upload",
        {
          method: "POST",
          body: formData,
        },
      ) as any;

      // Mock cookies property
      Object.defineProperty(request, "cookies", {
        value: {
          get: () => ({ value: "valid-session-token" }),
        },
        writable: true,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe(
        "No file provided. Include 'file' field in form data.",
      );
    });

    it("should return 400 when file validation fails (invalid type)", async () => {
      vi.mocked(validateUploadFile).mockReturnValue({
        valid: false,
        error:
          "Invalid file type. Only PNG, JPEG, GIF, and WebP images are allowed.",
      });

      const formData = new FormData();
      formData.append(
        "file",
        new Blob(["test"], { type: "application/pdf" }),
        "test.pdf",
      );

      const request = new Request(
        "http://localhost:3000/api/admin/blog/upload",
        {
          method: "POST",
          body: formData,
        },
      ) as any;

      // Mock cookies property
      Object.defineProperty(request, "cookies", {
        value: {
          get: () => ({ value: "valid-session-token" }),
        },
        writable: true,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe(
        "Invalid file type. Only PNG, JPEG, GIF, and WebP images are allowed.",
      );
    });

    it("should return 400 when file validation fails (size too large)", async () => {
      vi.mocked(validateUploadFile).mockReturnValue({
        valid: false,
        error: "File size exceeds maximum limit of 5MB",
      });

      const formData = new FormData();
      formData.append(
        "file",
        new Blob(["test"], { type: "image/png" }),
        "large.png",
      );

      const request = new Request(
        "http://localhost:3000/api/admin/blog/upload",
        {
          method: "POST",
          body: formData,
        },
      ) as any;

      // Mock cookies property
      Object.defineProperty(request, "cookies", {
        value: {
          get: () => ({ value: "valid-session-token" }),
        },
        writable: true,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("File size exceeds maximum limit of 5MB");
    });

    it("should accept valid image file (PNG)", async () => {
      const formData = new FormData();
      formData.append(
        "file",
        new Blob(["test"], { type: "image/png" }),
        "test.png",
      );

      const request = new Request(
        "http://localhost:3000/api/admin/blog/upload",
        {
          method: "POST",
          body: formData,
        },
      ) as any;

      // Mock cookies property
      Object.defineProperty(request, "cookies", {
        value: {
          get: () => ({ value: "valid-session-token" }),
        },
        writable: true,
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(vi.mocked(validateUploadFile)).toHaveBeenCalled();
      expect(vi.mocked(uploadImage)).toHaveBeenCalled();
    });

    it("should accept valid image file (JPEG)", async () => {
      const formData = new FormData();
      formData.append(
        "file",
        new Blob(["test"], { type: "image/jpeg" }),
        "test.jpg",
      );

      const request = new Request(
        "http://localhost:3000/api/admin/blog/upload",
        {
          method: "POST",
          body: formData,
        },
      ) as any;

      // Mock cookies property
      Object.defineProperty(request, "cookies", {
        value: {
          get: () => ({ value: "valid-session-token" }),
        },
        writable: true,
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
    });

    it("should accept valid image file (WebP)", async () => {
      const formData = new FormData();
      formData.append(
        "file",
        new Blob(["test"], { type: "image/webp" }),
        "test.webp",
      );

      const request = new Request(
        "http://localhost:3000/api/admin/blog/upload",
        {
          method: "POST",
          body: formData,
        },
      ) as any;

      // Mock cookies property
      Object.defineProperty(request, "cookies", {
        value: {
          get: () => ({ value: "valid-session-token" }),
        },
        writable: true,
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
    });
  });

  /**
   * Upload Service Integration Tests
   */
  describe("Upload Service Integration", () => {
    it("should upload file to Vercel Blob and return URL", async () => {
      const expectedUrl =
        "https://test-blob.vercel-storage.com/test-abc123.jpg";
      vi.mocked(uploadImage).mockResolvedValue(expectedUrl);

      const formData = new FormData();
      formData.append(
        "file",
        new Blob(["test"], { type: "image/png" }),
        "test.png",
      );

      const request = new Request(
        "http://localhost:3000/api/admin/blog/upload",
        {
          method: "POST",
          body: formData,
        },
      ) as any;

      // Mock cookies property
      Object.defineProperty(request, "cookies", {
        value: {
          get: () => ({ value: "valid-session-token" }),
        },
        writable: true,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.url).toBe(expectedUrl);
      expect(vi.mocked(uploadImage)).toHaveBeenCalledTimes(1);
    });

    it("should return 500 when upload service fails", async () => {
      vi.mocked(uploadImage).mockRejectedValue(
        new Error("Vercel Blob upload failed: Network error"),
      );

      const formData = new FormData();
      formData.append(
        "file",
        new Blob(["test"], { type: "image/png" }),
        "test.png",
      );

      const request = new Request(
        "http://localhost:3000/api/admin/blog/upload",
        {
          method: "POST",
          body: formData,
        },
      ) as any;

      // Mock cookies property
      Object.defineProperty(request, "cookies", {
        value: {
          get: () => ({ value: "valid-session-token" }),
        },
        writable: true,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Upload failed. Please try again.");
    });

    it("should sanitize filename for File objects", async () => {
      const file = new File(["test"], "dangerous../../../file.png", {
        type: "image/png",
      });
      const formData = new FormData();
      formData.append("file", file);

      const request = new Request(
        "http://localhost:3000/api/admin/blog/upload",
        {
          method: "POST",
          body: formData,
        },
      ) as any;

      // Mock cookies property
      Object.defineProperty(request, "cookies", {
        value: {
          get: () => ({ value: "valid-session-token" }),
        },
        writable: true,
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(vi.mocked(sanitizeFilename)).toHaveBeenCalledWith(
        "dangerous../../../file.png",
      );
    });
  });

  /**
   * Request Parsing Tests
   */
  describe("Request Parsing", () => {
    it("should return 400 when request is not multipart/form-data", async () => {
      const request = new Request(
        "http://localhost:3000/api/admin/blog/upload",
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({ file: "test" }),
        },
      ) as any;

      // Mock cookies property
      Object.defineProperty(request, "cookies", {
        value: {
          get: () => ({ value: "valid-session-token" }),
        },
        writable: true,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Invalid request. Expected multipart/form-data.");
    });
  });

  /**
   * Error Handling Tests
   */
  describe("Error Handling", () => {
    it("should return 500 for unexpected errors", async () => {
      // Force an unexpected error by making verifySessionToken throw
      vi.mocked(verifySessionToken).mockRejectedValue(
        new Error("Unexpected error"),
      );

      const formData = new FormData();
      formData.append(
        "file",
        new Blob(["test"], { type: "image/png" }),
        "test.png",
      );

      const request = new Request(
        "http://localhost:3000/api/admin/blog/upload",
        {
          method: "POST",
          body: formData,
        },
      ) as any;

      // Mock cookies property
      Object.defineProperty(request, "cookies", {
        value: {
          get: () => ({ value: "valid-session-token" }),
        },
        writable: true,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("An unexpected error occurred during upload.");
    });
  });

  /**
   * Response Format Tests
   */
  describe("Response Format", () => {
    it("should return JSON response with url on success", async () => {
      const formData = new FormData();
      formData.append(
        "file",
        new Blob(["test"], { type: "image/png" }),
        "test.png",
      );

      const request = new Request(
        "http://localhost:3000/api/admin/blog/upload",
        {
          method: "POST",
          body: formData,
        },
      ) as any;

      // Mock cookies property
      Object.defineProperty(request, "cookies", {
        value: {
          get: () => ({ value: "valid-session-token" }),
        },
        writable: true,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty("url");
      expect(typeof data.url).toBe("string");
      expect(data.url).toMatch(/^https?:\/\//);
    });

    it("should return JSON error response with appropriate status code", async () => {
      vi.mocked(validateUploadFile).mockReturnValue({
        valid: false,
        error: "Invalid file",
      });

      const formData = new FormData();
      formData.append(
        "file",
        new Blob(["test"], { type: "image/png" }),
        "test.png",
      );

      const request = new Request(
        "http://localhost:3000/api/admin/blog/upload",
        {
          method: "POST",
          body: formData,
        },
      ) as any;

      // Mock cookies property
      Object.defineProperty(request, "cookies", {
        value: {
          get: () => ({ value: "valid-session-token" }),
        },
        writable: true,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toHaveProperty("error");
      expect(typeof data.error).toBe("string");
    });
  });
});
