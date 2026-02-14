/**
 * Image Delete API Route Tests
 * Tests DELETE /api/admin/blog/delete-image endpoint for image deletion functionality
 *
 * Test Coverage:
 * - Authentication and authorization
 * - Rate limiting enforcement
 * - URL validation
 * - Delete service integration
 * - Error handling and responses
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock auth module
const mockVerifySessionToken = vi.fn(() => Promise.resolve(true));
vi.mock("@/lib/auth", () => ({
  verifySessionToken: mockVerifySessionToken,
}));

// Mock upload service
const mockDeleteImage = vi.fn(() => Promise.resolve());
vi.mock("@/lib/upload-service", () => ({
  deleteImage: mockDeleteImage,
}));

describe("DELETE /api/admin/blog/delete-image", () => {
  let DELETE: any;

  beforeEach(async () => {
    // Reset mocks
    mockVerifySessionToken.mockReset();
    mockVerifySessionToken.mockImplementation(() => Promise.resolve(true));

    mockDeleteImage.mockReset();
    mockDeleteImage.mockImplementation(() => Promise.resolve());

    // Dynamically import to get mocked version
    const module = await import("./route");
    DELETE = module.DELETE;
  });

  /**
   * Authentication Tests
   */
  describe("Authentication", () => {
    it("should return 401 when session cookie is missing", async () => {
      const request = new Request(
        "http://localhost:3000/api/admin/blog/delete-image",
        {
          method: "DELETE",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            url: "https://test-blob.vercel-storage.com/test.png",
          }),
        },
      ) as any;

      // Mock cookies property with no session
      Object.defineProperty(request, "cookies", {
        value: {
          get: () => undefined,
        },
        writable: true,
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized. Admin authentication required.");
      expect(mockDeleteImage).not.toHaveBeenCalled();
    });

    it("should return 401 when session token is invalid", async () => {
      mockVerifySessionToken.mockResolvedValue(false);

      const request = new Request(
        "http://localhost:3000/api/admin/blog/delete-image",
        {
          method: "DELETE",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            url: "https://test-blob.vercel-storage.com/test.png",
          }),
        },
      ) as any;

      // Mock cookies property with invalid token
      Object.defineProperty(request, "cookies", {
        value: {
          get: () => ({ value: "invalid-token" }),
        },
        writable: true,
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized. Admin authentication required.");
      expect(mockDeleteImage).not.toHaveBeenCalled();
    });

    it("should accept valid session token", async () => {
      mockVerifySessionToken.mockResolvedValue(true);

      const request = new Request(
        "http://localhost:3000/api/admin/blog/delete-image",
        {
          method: "DELETE",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            url: "https://test-blob.vercel-storage.com/test.png",
          }),
        },
      ) as any;

      // Mock cookies property with valid token
      Object.defineProperty(request, "cookies", {
        value: {
          get: () => ({ value: "valid-session-token" }),
        },
        writable: true,
      });

      const response = await DELETE(request);

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
    it("should enforce rate limiting after exceeding max deletes", async () => {
      // Make 10 successful requests (at the limit)
      for (let i = 0; i < 10; i++) {
        const request = new Request(
          "http://localhost:3000/api/admin/blog/delete-image",
          {
            method: "DELETE",
            headers: {
              "x-forwarded-for": "192.168.1.100",
              "content-type": "application/json",
            },
            body: JSON.stringify({
              url: `https://test-blob.vercel-storage.com/test-${i}.png`,
            }),
          },
        ) as any;

        // Mock cookies property
        Object.defineProperty(request, "cookies", {
          value: {
            get: () => ({ value: "valid-session-token" }),
          },
          writable: true,
        });

        await DELETE(request);
      }

      // 11th request should be rate limited
      const request = new Request(
        "http://localhost:3000/api/admin/blog/delete-image",
        {
          method: "DELETE",
          headers: {
            "x-forwarded-for": "192.168.1.100",
            "content-type": "application/json",
          },
          body: JSON.stringify({
            url: "https://test-blob.vercel-storage.com/test-11.png",
          }),
        },
      ) as any;

      // Mock cookies property
      Object.defineProperty(request, "cookies", {
        value: {
          get: () => ({ value: "valid-session-token" }),
        },
        writable: true,
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.error).toBe("Rate limit exceeded. Please try again later.");
      expect(data.retryAfter).toBeDefined();
      expect(response.headers.get("Retry-After")).toBeDefined();
    });

    it("should track rate limits per IP address independently", async () => {
      // Use unique IPs that haven't been used in other tests
      const ip1 = "10.0.0.1";
      const ip2 = "10.0.0.2";

      // Make request from IP 1
      const request1 = new Request(
        "http://localhost:3000/api/admin/blog/delete-image",
        {
          method: "DELETE",
          headers: {
            "x-forwarded-for": ip1,
            "content-type": "application/json",
          },
          body: JSON.stringify({
            url: "https://test-blob.vercel-storage.com/test-independent-1.png",
          }),
        },
      ) as any;

      // Mock cookies property
      Object.defineProperty(request1, "cookies", {
        value: {
          get: () => ({ value: "valid-session-token" }),
        },
        writable: true,
      });

      const response1 = await DELETE(request1);
      expect(response1.status).toBe(200);

      // Make request from IP 2
      const request2 = new Request(
        "http://localhost:3000/api/admin/blog/delete-image",
        {
          method: "DELETE",
          headers: {
            "x-forwarded-for": ip2,
            "content-type": "application/json",
          },
          body: JSON.stringify({
            url: "https://test-blob.vercel-storage.com/test-independent-2.png",
          }),
        },
      ) as any;

      // Mock cookies property
      Object.defineProperty(request2, "cookies", {
        value: {
          get: () => ({ value: "valid-session-token" }),
        },
        writable: true,
      });

      const response2 = await DELETE(request2);
      expect(response2.status).toBe(200);

      // Both IPs should have independent rate limits
    });
  });

  /**
   * URL Validation Tests
   */
  describe("URL Validation", () => {
    it("should return 400 when URL is missing", async () => {
      const request = new Request(
        "http://localhost:3000/api/admin/blog/delete-image",
        {
          method: "DELETE",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({}),
        },
      ) as any;

      // Mock cookies property
      Object.defineProperty(request, "cookies", {
        value: {
          get: () => ({ value: "valid-session-token" }),
        },
        writable: true,
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe(
        "Missing or invalid 'url' field in request body.",
      );
      expect(mockDeleteImage).not.toHaveBeenCalled();
    });

    it("should return 400 when URL is not a string", async () => {
      const request = new Request(
        "http://localhost:3000/api/admin/blog/delete-image",
        {
          method: "DELETE",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({ url: 123 }),
        },
      ) as any;

      // Mock cookies property
      Object.defineProperty(request, "cookies", {
        value: {
          get: () => ({ value: "valid-session-token" }),
        },
        writable: true,
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe(
        "Missing or invalid 'url' field in request body.",
      );
      expect(mockDeleteImage).not.toHaveBeenCalled();
    });

    it("should return 400 when URL is not HTTPS", async () => {
      const request = new Request(
        "http://localhost:3000/api/admin/blog/delete-image",
        {
          method: "DELETE",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({ url: "http://insecure-url.com/image.png" }),
        },
      ) as any;

      // Mock cookies property
      Object.defineProperty(request, "cookies", {
        value: {
          get: () => ({ value: "valid-session-token" }),
        },
        writable: true,
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Invalid URL. Must be a valid HTTPS URL.");
      expect(mockDeleteImage).not.toHaveBeenCalled();
    });

    it("should accept valid HTTPS URL", async () => {
      const request = new Request(
        "http://localhost:3000/api/admin/blog/delete-image",
        {
          method: "DELETE",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            url: "https://test-blob.vercel-storage.com/test.png",
          }),
        },
      ) as any;

      // Mock cookies property
      Object.defineProperty(request, "cookies", {
        value: {
          get: () => ({ value: "valid-session-token" }),
        },
        writable: true,
      });

      const response = await DELETE(request);

      expect(response.status).toBe(200);
      expect(mockDeleteImage).toHaveBeenCalledWith(
        "https://test-blob.vercel-storage.com/test.png",
      );
    });
  });

  /**
   * Delete Service Integration Tests
   */
  describe("Delete Service Integration", () => {
    it("should delete image from Vercel Blob and return success", async () => {
      const testUrl = "https://test-blob.vercel-storage.com/test-abc123.png";

      const request = new Request(
        "http://localhost:3000/api/admin/blog/delete-image",
        {
          method: "DELETE",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({ url: testUrl }),
        },
      ) as any;

      // Mock cookies property
      Object.defineProperty(request, "cookies", {
        value: {
          get: () => ({ value: "valid-session-token" }),
        },
        writable: true,
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe("Image deleted successfully.");
      expect(mockDeleteImage).toHaveBeenCalledTimes(1);
      expect(mockDeleteImage).toHaveBeenCalledWith(testUrl);
    });

    it("should return 500 when delete service fails", async () => {
      mockDeleteImage.mockRejectedValue(
        new Error("Vercel Blob delete failed: Network error"),
      );

      const request = new Request(
        "http://localhost:3000/api/admin/blog/delete-image",
        {
          method: "DELETE",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            url: "https://test-blob.vercel-storage.com/test.png",
          }),
        },
      ) as any;

      // Mock cookies property
      Object.defineProperty(request, "cookies", {
        value: {
          get: () => ({ value: "valid-session-token" }),
        },
        writable: true,
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Delete failed. Please try again.");
    });
  });

  /**
   * Request Parsing Tests
   */
  describe("Request Parsing", () => {
    it("should return 400 when request body is not JSON", async () => {
      const request = new Request(
        "http://localhost:3000/api/admin/blog/delete-image",
        {
          method: "DELETE",
          headers: {
            "content-type": "text/plain",
          },
          body: "not-json",
        },
      ) as any;

      // Mock cookies property
      Object.defineProperty(request, "cookies", {
        value: {
          get: () => ({ value: "valid-session-token" }),
        },
        writable: true,
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe(
        "Invalid request. Expected JSON body with 'url' field.",
      );
    });
  });

  /**
   * Error Handling Tests
   */
  describe("Error Handling", () => {
    it("should return 500 for unexpected errors", async () => {
      // Force an unexpected error by making verifySessionToken throw
      mockVerifySessionToken.mockRejectedValue(new Error("Unexpected error"));

      const request = new Request(
        "http://localhost:3000/api/admin/blog/delete-image",
        {
          method: "DELETE",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            url: "https://test-blob.vercel-storage.com/test.png",
          }),
        },
      ) as any;

      // Mock cookies property
      Object.defineProperty(request, "cookies", {
        value: {
          get: () => ({ value: "valid-session-token" }),
        },
        writable: true,
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("An unexpected error occurred during deletion.");
    });
  });

  /**
   * Response Format Tests
   */
  describe("Response Format", () => {
    it("should return JSON response with success on successful delete", async () => {
      const request = new Request(
        "http://localhost:3000/api/admin/blog/delete-image",
        {
          method: "DELETE",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            url: "https://test-blob.vercel-storage.com/test.png",
          }),
        },
      ) as any;

      // Mock cookies property
      Object.defineProperty(request, "cookies", {
        value: {
          get: () => ({ value: "valid-session-token" }),
        },
        writable: true,
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty("success");
      expect(data).toHaveProperty("message");
      expect(data.success).toBe(true);
      expect(typeof data.message).toBe("string");
    });

    it("should return JSON error response with appropriate status code", async () => {
      const request = new Request(
        "http://localhost:3000/api/admin/blog/delete-image",
        {
          method: "DELETE",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({ url: "http://insecure.com/test.png" }),
        },
      ) as any;

      // Mock cookies property
      Object.defineProperty(request, "cookies", {
        value: {
          get: () => ({ value: "valid-session-token" }),
        },
        writable: true,
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toHaveProperty("error");
      expect(typeof data.error).toBe("string");
    });
  });
});
