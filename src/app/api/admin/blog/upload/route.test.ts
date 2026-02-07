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

import { beforeEach, describe, expect, it, mock } from "bun:test";

// Mock session verification - must be defined before mock.module
const mockVerifySessionToken = mock(() => true);

// Mock upload service functions - must be defined before mock.module
const mockValidateUploadFile = mock(() => ({ valid: true }));
const mockSanitizeFilename = mock((filename: string) => filename);
const mockUploadToCloudinary = mock(() =>
  Promise.resolve("https://res.cloudinary.com/test/image/upload/v123/test.jpg"),
);

// Apply mocks before imports
mock.module("@/lib/auth", () => ({
  verifySessionToken: mockVerifySessionToken,
}));

mock.module("@/lib/upload-service", () => ({
  validateUploadFile: mockValidateUploadFile,
  sanitizeFilename: mockSanitizeFilename,
  uploadToCloudinary: mockUploadToCloudinary,
}));

describe("POST /api/admin/blog/upload", () => {
  beforeEach(() => {
    // Reset all mocks before each test
    mockVerifySessionToken.mockReset();
    mockVerifySessionToken.mockReturnValue(true);
    mockValidateUploadFile.mockReset();
    mockValidateUploadFile.mockReturnValue({ valid: true });
    mockSanitizeFilename.mockReset();
    mockSanitizeFilename.mockImplementation((filename: string) => filename);
    mockUploadToCloudinary.mockReset();
    mockUploadToCloudinary.mockReturnValue(
      Promise.resolve(
        "https://res.cloudinary.com/test/image/upload/v123/test.jpg",
      ),
    );
  });

  /**
   * Authentication Tests
   */
  describe("Authentication", () => {
    it("should return 401 when session cookie is missing", async () => {
      const { POST } = await import("./route");

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
      expect(mockUploadToCloudinary).not.toHaveBeenCalled();
    });

    it("should return 401 when session token is invalid", async () => {
      mockVerifySessionToken.mockReturnValue(false);

      const { POST } = await import("./route");

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
      expect(mockUploadToCloudinary).not.toHaveBeenCalled();
    });

    it("should accept valid session token", async () => {
      mockVerifySessionToken.mockReturnValue(true);

      const { POST } = await import("./route");

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
      expect(mockVerifySessionToken).toHaveBeenCalledWith(
        "valid-session-token",
      );
    });
  });

  /**
   * Rate Limiting Tests
   */
  describe("Rate Limiting", () => {
    it("should enforce rate limiting after exceeding max uploads", async () => {
      const { POST } = await import("./route");

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

        const response = await POST(request as any);
        expect(response.status).toBe(200);
      }

      // 11th request should be rate limited
      const formData11 = new FormData();
      formData11.append(
        "file",
        new Blob(["test"], { type: "image/png" }),
        "test.png",
      );

      const rateLimitedRequest = new Request(
        "http://localhost:3000/api/admin/blog/upload",
        {
          method: "POST",
          headers: {
            cookie: "session=valid-session-token",
            "x-forwarded-for": "192.168.1.100",
          },
          body: formData11,
        },
      );

      const response = await POST(rateLimitedRequest as any);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.error).toBe("Rate limit exceeded. Please try again later.");
      expect(data.retryAfter).toBeDefined();
      expect(response.headers.get("Retry-After")).toBeDefined();
    });

    it("should track rate limits per IP address independently", async () => {
      const { POST } = await import("./route");

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
            "x-forwarded-for": "192.168.1.101",
          },
          body: formData1,
        },
      );

      const response1 = await POST(request1 as any);
      expect(response1.status).toBe(200);

      // Make request from different IP 2
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
            "x-forwarded-for": "192.168.1.102",
          },
          body: formData2,
        },
      );

      const response2 = await POST(request2 as any);
      expect(response2.status).toBe(200);

      // Both IPs should have independent rate limits
    });

    it("should extract IP from x-real-ip header if x-forwarded-for is not present", async () => {
      const { POST } = await import("./route");

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
            "x-real-ip": "192.168.1.103",
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
      const { POST } = await import("./route");

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
      expect(mockUploadToCloudinary).not.toHaveBeenCalled();
    });

    it("should return 400 when file field is not a Blob", async () => {
      const { POST } = await import("./route");

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
      const { POST } = await import("./route");

      mockValidateUploadFile.mockReturnValue({
        valid: false,
        error:
          "Invalid file type. Only PNG, JPEG, GIF, and WebP images are allowed.",
      });

      const formData = new FormData();
      formData.append(
        "file",
        new Blob(["test"], { type: "text/plain" }),
        "test.txt",
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
      expect(mockUploadToCloudinary).not.toHaveBeenCalled();
    });

    it("should return 400 when file validation fails (size too large)", async () => {
      const { POST } = await import("./route");

      mockValidateUploadFile.mockReturnValue({
        valid: false,
        error: "File size exceeds maximum limit of 5MB",
      });

      const formData = new FormData();
      formData.append(
        "file",
        new Blob(["x".repeat(6 * 1024 * 1024)], { type: "image/png" }),
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
      expect(mockUploadToCloudinary).not.toHaveBeenCalled();
    });

    it("should accept valid image file (PNG)", async () => {
      const { POST } = await import("./route");

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
      expect(mockValidateUploadFile).toHaveBeenCalled();
      expect(mockUploadToCloudinary).toHaveBeenCalled();
    });

    it("should accept valid image file (JPEG)", async () => {
      const { POST } = await import("./route");

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
      const { POST } = await import("./route");

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
    it("should upload file to Cloudinary and return URL", async () => {
      const { POST } = await import("./route");

      const expectedUrl =
        "https://res.cloudinary.com/test/image/upload/v123/test.jpg";
      mockUploadToCloudinary.mockReturnValue(Promise.resolve(expectedUrl));

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
      expect(mockUploadToCloudinary).toHaveBeenCalledTimes(1);
    });

    it("should return 500 when upload service fails", async () => {
      const { POST } = await import("./route");

      mockUploadToCloudinary.mockImplementation(() => {
        throw new Error("Cloudinary upload failed: Network error");
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

      expect(response.status).toBe(500);
      expect(data.error).toBe("Upload failed. Please try again.");
    });

    it("should sanitize filename for File objects", async () => {
      const { POST } = await import("./route");

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
      expect(mockSanitizeFilename).toHaveBeenCalledWith(
        "dangerous../../../file.png",
      );
    });
  });

  /**
   * Request Parsing Tests
   */
  describe("Request Parsing", () => {
    it("should return 400 when request is not multipart/form-data", async () => {
      const { POST } = await import("./route");

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
      const { POST } = await import("./route");

      // Force an unexpected error by making verifySessionToken throw
      mockVerifySessionToken.mockImplementation(() => {
        throw new Error("Unexpected error");
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

      expect(response.status).toBe(500);
      expect(data.error).toBe("An unexpected error occurred during upload.");
    });
  });

  /**
   * Response Format Tests
   */
  describe("Response Format", () => {
    it("should return JSON response with url on success", async () => {
      const { POST } = await import("./route");

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
      const { POST } = await import("./route");

      mockValidateUploadFile.mockReturnValue({
        valid: false,
        error: "Invalid file",
      });

      const formData = new FormData();
      formData.append(
        "file",
        new Blob(["test"], { type: "text/plain" }),
        "test.txt",
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
