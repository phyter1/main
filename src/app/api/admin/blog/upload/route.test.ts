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

import { beforeEach, describe, expect, it, spyOn } from "bun:test";
import * as auth from "@/lib/auth";
import * as uploadService from "@/lib/upload-service";

// Set up spies BEFORE importing the route
const verifySessionTokenSpy = spyOn(
  auth,
  "verifySessionToken",
).mockResolvedValue(true);
const validateUploadFileSpy = spyOn(
  uploadService,
  "validateUploadFile",
).mockReturnValue({ valid: true });
const sanitizeFilenameSpy = spyOn(
  uploadService,
  "sanitizeFilename",
).mockImplementation((filename: string) => filename);
const uploadImageSpy = spyOn(uploadService, "uploadImage").mockResolvedValue(
  "https://test-blob.vercel-storage.com/test-abc123.jpg",
);

// NOW import the route - it will use the spied functions
import { POST } from "./route";

describe("POST /api/admin/blog/upload", () => {
  beforeEach(() => {
    // Reset spy call counts and restore default mocks
    verifySessionTokenSpy.mockClear();
    verifySessionTokenSpy.mockResolvedValue(true);

    validateUploadFileSpy.mockClear();
    validateUploadFileSpy.mockReturnValue({ valid: true });

    sanitizeFilenameSpy.mockClear();
    sanitizeFilenameSpy.mockImplementation((filename: string) => filename);

    uploadImageSpy.mockClear();
    uploadImageSpy.mockResolvedValue(
      "https://test-blob.vercel-storage.com/test-abc123.jpg",
    );
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
      );

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized. Admin authentication required.");
    });

    it("should return 401 when session token is invalid", async () => {
      verifySessionTokenSpy.mockResolvedValue(false);

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
          headers: {
            cookie: "session=invalid-token",
          },
          body: formData,
        },
      );

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized. Admin authentication required.");
    });

    it("should accept valid session token", async () => {
      verifySessionTokenSpy.mockResolvedValue(true);

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
          headers: {
            cookie: "session=valid-session-token",
          },
          body: formData,
        },
      );

      const response = await POST(request as any);

      expect(response.status).toBe(200);
      expect(verifySessionTokenSpy).toHaveBeenCalledWith("valid-session-token");
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
            headers: {
              cookie: "session=valid-session-token",
              "x-forwarded-for": "192.168.1.100",
            },
            body: formData,
          },
        );

        await POST(request as any);
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
          headers: {
            cookie: "session=valid-session-token",
            "x-forwarded-for": "192.168.1.100",
          },
          body: formData,
        },
      );

      const response = await POST(request as any);
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
          headers: {
            cookie: "session=valid-session-token",
            "x-forwarded-for": "192.168.1.100",
          },
          body: formData1,
        },
      );

      const response1 = await POST(request1 as any);
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
          headers: {
            cookie: "session=valid-session-token",
            "x-forwarded-for": "192.168.1.200",
          },
          body: formData2,
        },
      );

      const response2 = await POST(request2 as any);
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
          headers: {
            cookie: "session=valid-session-token",
            "x-real-ip": "192.168.1.150",
          },
          body: formData,
        },
      );

      const response = await POST(request as any);
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
          headers: {
            cookie: "session=valid-session-token",
          },
          body: formData,
        },
      );

      const response = await POST(request as any);
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
          headers: {
            cookie: "session=valid-session-token",
          },
          body: formData,
        },
      );

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe(
        "No file provided. Include 'file' field in form data.",
      );
    });

    it("should return 400 when file validation fails (invalid type)", async () => {
      validateUploadFileSpy.mockReturnValue({
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
          headers: {
            cookie: "session=valid-session-token",
          },
          body: formData,
        },
      );

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe(
        "Invalid file type. Only PNG, JPEG, GIF, and WebP images are allowed.",
      );
    });

    it("should return 400 when file validation fails (size too large)", async () => {
      validateUploadFileSpy.mockReturnValue({
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
          headers: {
            cookie: "session=valid-session-token",
          },
          body: formData,
        },
      );

      const response = await POST(request as any);
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
          headers: {
            cookie: "session=valid-session-token",
          },
          body: formData,
        },
      );

      const response = await POST(request as any);

      expect(response.status).toBe(200);
      expect(validateUploadFileSpy).toHaveBeenCalled();
      expect(uploadImageSpy).toHaveBeenCalled();
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
          headers: {
            cookie: "session=valid-session-token",
          },
          body: formData,
        },
      );

      const response = await POST(request as any);

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
          headers: {
            cookie: "session=valid-session-token",
          },
          body: formData,
        },
      );

      const response = await POST(request as any);

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
      uploadImageSpy.mockResolvedValue(expectedUrl);

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
          headers: {
            cookie: "session=valid-session-token",
          },
          body: formData,
        },
      );

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.url).toBe(expectedUrl);
      expect(uploadImageSpy).toHaveBeenCalledTimes(1);
    });

    it("should return 500 when upload service fails", async () => {
      uploadImageSpy.mockRejectedValue(
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
          headers: {
            cookie: "session=valid-session-token",
          },
          body: formData,
        },
      );

      const response = await POST(request as any);
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
          headers: {
            cookie: "session=valid-session-token",
          },
          body: formData,
        },
      );

      const response = await POST(request as any);

      expect(response.status).toBe(200);
      expect(sanitizeFilenameSpy).toHaveBeenCalledWith(
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
            cookie: "session=valid-session-token",
            "content-type": "application/json",
          },
          body: JSON.stringify({ file: "test" }),
        },
      );

      const response = await POST(request as any);
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
      verifySessionTokenSpy.mockRejectedValue(new Error("Unexpected error"));

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
          headers: {
            cookie: "session=valid-session-token",
          },
          body: formData,
        },
      );

      const response = await POST(request as any);
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
          headers: {
            cookie: "session=valid-session-token",
          },
          body: formData,
        },
      );

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty("url");
      expect(typeof data.url).toBe("string");
      expect(data.url).toMatch(/^https?:\/\//);
    });

    it("should return JSON error response with appropriate status code", async () => {
      validateUploadFileSpy.mockReturnValue({
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
          headers: {
            cookie: "session=valid-session-token",
          },
          body: formData,
        },
      );

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toHaveProperty("error");
      expect(typeof data.error).toBe("string");
    });
  });
});
