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

import { beforeEach, describe, expect, it, spyOn } from "bun:test";
import * as auth from "@/lib/auth";
import * as uploadService from "@/lib/upload-service";

// Set up spies BEFORE importing the route
const verifySessionTokenSpy = spyOn(
  auth,
  "verifySessionToken",
).mockResolvedValue(true);
const deleteImageSpy = spyOn(uploadService, "deleteImage").mockResolvedValue(
  undefined,
);

// NOW import the route - it will use the spied functions
import { DELETE } from "./route";

describe("DELETE /api/admin/blog/delete-image", () => {
  beforeEach(() => {
    // Reset spy call counts and restore default mocks
    verifySessionTokenSpy.mockClear();
    verifySessionTokenSpy.mockResolvedValue(true);

    deleteImageSpy.mockClear();
    deleteImageSpy.mockResolvedValue(undefined);
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
      );

      const response = await DELETE(request as any);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized. Admin authentication required.");
      expect(deleteImageSpy).not.toHaveBeenCalled();
    });

    it("should return 401 when session token is invalid", async () => {
      verifySessionTokenSpy.mockResolvedValue(false);

      const request = new Request(
        "http://localhost:3000/api/admin/blog/delete-image",
        {
          method: "DELETE",
          headers: {
            cookie: "session=invalid-token",
            "content-type": "application/json",
          },
          body: JSON.stringify({
            url: "https://test-blob.vercel-storage.com/test.png",
          }),
        },
      );

      const response = await DELETE(request as any);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized. Admin authentication required.");
      expect(deleteImageSpy).not.toHaveBeenCalled();
    });

    it("should accept valid session token", async () => {
      verifySessionTokenSpy.mockResolvedValue(true);

      const request = new Request(
        "http://localhost:3000/api/admin/blog/delete-image",
        {
          method: "DELETE",
          headers: {
            cookie: "session=valid-session-token",
            "content-type": "application/json",
          },
          body: JSON.stringify({
            url: "https://test-blob.vercel-storage.com/test.png",
          }),
        },
      );

      const response = await DELETE(request as any);

      expect(response.status).toBe(200);
      expect(verifySessionTokenSpy).toHaveBeenCalledWith("valid-session-token");
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
              cookie: "session=valid-session-token",
              "x-forwarded-for": "192.168.1.100",
              "content-type": "application/json",
            },
            body: JSON.stringify({
              url: `https://test-blob.vercel-storage.com/test-${i}.png`,
            }),
          },
        );

        await DELETE(request as any);
      }

      // 11th request should be rate limited
      const request = new Request(
        "http://localhost:3000/api/admin/blog/delete-image",
        {
          method: "DELETE",
          headers: {
            cookie: "session=valid-session-token",
            "x-forwarded-for": "192.168.1.100",
            "content-type": "application/json",
          },
          body: JSON.stringify({
            url: "https://test-blob.vercel-storage.com/test-11.png",
          }),
        },
      );

      const response = await DELETE(request as any);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.error).toBe("Rate limit exceeded. Please try again later.");
      expect(data.retryAfter).toBeDefined();
      expect(response.headers.get("Retry-After")).toBeDefined();
    });

    it("should track rate limits per IP address independently", async () => {
      // Make request from IP 1
      const request1 = new Request(
        "http://localhost:3000/api/admin/blog/delete-image",
        {
          method: "DELETE",
          headers: {
            cookie: "session=valid-session-token",
            "x-forwarded-for": "192.168.1.100",
            "content-type": "application/json",
          },
          body: JSON.stringify({
            url: "https://test-blob.vercel-storage.com/test-1.png",
          }),
        },
      );

      const response1 = await DELETE(request1 as any);
      expect(response1.status).toBe(200);

      // Make request from IP 2
      const request2 = new Request(
        "http://localhost:3000/api/admin/blog/delete-image",
        {
          method: "DELETE",
          headers: {
            cookie: "session=valid-session-token",
            "x-forwarded-for": "192.168.1.200",
            "content-type": "application/json",
          },
          body: JSON.stringify({
            url: "https://test-blob.vercel-storage.com/test-2.png",
          }),
        },
      );

      const response2 = await DELETE(request2 as any);
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
            cookie: "session=valid-session-token",
            "content-type": "application/json",
          },
          body: JSON.stringify({}),
        },
      );

      const response = await DELETE(request as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe(
        "Missing or invalid 'url' field in request body.",
      );
      expect(deleteImageSpy).not.toHaveBeenCalled();
    });

    it("should return 400 when URL is not a string", async () => {
      const request = new Request(
        "http://localhost:3000/api/admin/blog/delete-image",
        {
          method: "DELETE",
          headers: {
            cookie: "session=valid-session-token",
            "content-type": "application/json",
          },
          body: JSON.stringify({ url: 123 }),
        },
      );

      const response = await DELETE(request as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe(
        "Missing or invalid 'url' field in request body.",
      );
      expect(deleteImageSpy).not.toHaveBeenCalled();
    });

    it("should return 400 when URL is not HTTPS", async () => {
      const request = new Request(
        "http://localhost:3000/api/admin/blog/delete-image",
        {
          method: "DELETE",
          headers: {
            cookie: "session=valid-session-token",
            "content-type": "application/json",
          },
          body: JSON.stringify({ url: "http://insecure-url.com/image.png" }),
        },
      );

      const response = await DELETE(request as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Invalid URL. Must be a valid HTTPS URL.");
      expect(deleteImageSpy).not.toHaveBeenCalled();
    });

    it("should accept valid HTTPS URL", async () => {
      const request = new Request(
        "http://localhost:3000/api/admin/blog/delete-image",
        {
          method: "DELETE",
          headers: {
            cookie: "session=valid-session-token",
            "content-type": "application/json",
          },
          body: JSON.stringify({
            url: "https://test-blob.vercel-storage.com/test.png",
          }),
        },
      );

      const response = await DELETE(request as any);

      expect(response.status).toBe(200);
      expect(deleteImageSpy).toHaveBeenCalledWith(
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
            cookie: "session=valid-session-token",
            "content-type": "application/json",
          },
          body: JSON.stringify({ url: testUrl }),
        },
      );

      const response = await DELETE(request as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe("Image deleted successfully.");
      expect(deleteImageSpy).toHaveBeenCalledTimes(1);
      expect(deleteImageSpy).toHaveBeenCalledWith(testUrl);
    });

    it("should return 500 when delete service fails", async () => {
      deleteImageSpy.mockRejectedValue(
        new Error("Vercel Blob delete failed: Network error"),
      );

      const request = new Request(
        "http://localhost:3000/api/admin/blog/delete-image",
        {
          method: "DELETE",
          headers: {
            cookie: "session=valid-session-token",
            "content-type": "application/json",
          },
          body: JSON.stringify({
            url: "https://test-blob.vercel-storage.com/test.png",
          }),
        },
      );

      const response = await DELETE(request as any);
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
            cookie: "session=valid-session-token",
            "content-type": "text/plain",
          },
          body: "not-json",
        },
      );

      const response = await DELETE(request as any);
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
      verifySessionTokenSpy.mockRejectedValue(new Error("Unexpected error"));

      const request = new Request(
        "http://localhost:3000/api/admin/blog/delete-image",
        {
          method: "DELETE",
          headers: {
            cookie: "session=valid-session-token",
            "content-type": "application/json",
          },
          body: JSON.stringify({
            url: "https://test-blob.vercel-storage.com/test.png",
          }),
        },
      );

      const response = await DELETE(request as any);
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
            cookie: "session=valid-session-token",
            "content-type": "application/json",
          },
          body: JSON.stringify({
            url: "https://test-blob.vercel-storage.com/test.png",
          }),
        },
      );

      const response = await DELETE(request as any);
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
            cookie: "session=valid-session-token",
            "content-type": "application/json",
          },
          body: JSON.stringify({ url: "http://insecure.com/test.png" }),
        },
      );

      const response = await DELETE(request as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toHaveProperty("error");
      expect(typeof data.error).toBe("string");
    });
  });
});
