/**
 * Tests for Admin Login API Route
 * Validates password authentication and session creation
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock auth utilities
const mockVerifyAdminPassword = vi.fn(() => Promise.resolve(false));
const mockGenerateSessionToken = vi.fn(() => "mock-session-token-12345");
const mockCreateSessionCookie = vi.fn(
  (token: string) => `session=${token}; HttpOnly; Path=/`,
);
const mockStoreSessionToken = vi.fn(() => {});

vi.mock("@/lib/auth", () => ({
  verifyAdminPassword: mockVerifyAdminPassword,
  generateSessionToken: mockGenerateSessionToken,
  createSessionCookie: mockCreateSessionCookie,
  storeSessionToken: mockStoreSessionToken,
}));

describe("POST /api/admin/login", () => {
  beforeEach(async () => {
    // Reset individual mocks instead of mock.restore() which destroys module mocks
    mockVerifyAdminPassword.mockReset();
    mockGenerateSessionToken.mockReset();
    mockCreateSessionCookie.mockReset();
    mockStoreSessionToken.mockReset();

    // Clear rate limit map to prevent test interference
    const { __testing__ } = await import("./route");
    __testing__.clearRateLimitMap();
  });

  describe("Request Validation", () => {
    it("should return 400 if request body is missing", async () => {
      const { POST } = await import("./route");

      const request = new Request("http://localhost/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "",
      });

      const response = await POST(request);
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toBeTruthy();
    });

    it("should return 400 if password field is missing", async () => {
      const { POST } = await import("./route");

      const request = new Request("http://localhost/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error.toLowerCase()).toContain("password");
    });

    it("should return 400 if password is empty string", async () => {
      const { POST } = await import("./route");

      const request = new Request("http://localhost/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: "" }),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toBeTruthy();
    });

    it("should return 400 if password is not a string", async () => {
      const { POST } = await import("./route");

      const request = new Request("http://localhost/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: 12345 }),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toBeTruthy();
    });
  });

  describe("Authentication", () => {
    it("should return 401 if password is incorrect", async () => {
      mockVerifyAdminPassword.mockResolvedValue(false);

      const { POST } = await import("./route");

      const request = new Request("http://localhost/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: "wrong-password" }),
      });

      const response = await POST(request);
      expect(response.status).toBe(401);

      const data = await response.json();
      expect(data.error).toContain("Invalid");
    });

    it("should call verifyAdminPassword with provided password", async () => {
      mockVerifyAdminPassword.mockResolvedValue(false);

      const { POST } = await import("./route");

      const testPassword = "test-password-123";
      const request = new Request("http://localhost/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: testPassword }),
      });

      await POST(request);

      expect(mockVerifyAdminPassword).toHaveBeenCalledWith(testPassword);
    });
  });

  describe("Successful Login", () => {
    it("should return 200 with success message on correct password", async () => {
      mockVerifyAdminPassword.mockResolvedValue(true);

      const { POST } = await import("./route");

      const request = new Request("http://localhost/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: "correct-password" }),
      });

      const response = await POST(request);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
    });

    it("should generate session token on successful login", async () => {
      mockVerifyAdminPassword.mockResolvedValue(true);

      const { POST } = await import("./route");

      const request = new Request("http://localhost/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: "correct-password" }),
      });

      await POST(request);

      expect(mockGenerateSessionToken).toHaveBeenCalled();
    });

    it("should store session token on successful login", async () => {
      mockVerifyAdminPassword.mockResolvedValue(true);
      const sessionToken = "new-session-token-xyz";
      mockGenerateSessionToken.mockReturnValue(sessionToken);

      const { POST } = await import("./route");

      const request = new Request("http://localhost/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: "correct-password" }),
      });

      await POST(request);

      expect(mockStoreSessionToken).toHaveBeenCalledWith(sessionToken);
    });

    it("should set session cookie in response headers", async () => {
      mockVerifyAdminPassword.mockResolvedValue(true);
      const sessionToken = "new-session-token-abc";
      mockGenerateSessionToken.mockReturnValue(sessionToken);
      mockCreateSessionCookie.mockReturnValue(
        `session=${sessionToken}; HttpOnly`,
      );

      const { POST } = await import("./route");

      const request = new Request("http://localhost/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: "correct-password" }),
      });

      const response = await POST(request);

      const setCookie = response.headers.get("Set-Cookie");
      expect(setCookie).toBeTruthy();
      expect(setCookie).toContain("session=");
    });

    it("should include redirect URL in success response", async () => {
      mockVerifyAdminPassword.mockResolvedValue(true);

      const { POST } = await import("./route");

      const request = new Request("http://localhost/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: "correct-password" }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.redirectTo).toBe("/admin/agent-workbench");
    });
  });

  describe("Error Handling", () => {
    it("should return 500 if verifyAdminPassword throws error", async () => {
      mockVerifyAdminPassword.mockRejectedValue(new Error("Database error"));

      const { POST } = await import("./route");

      const request = new Request("http://localhost/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: "test-password" }),
      });

      const response = await POST(request);
      expect(response.status).toBe(500);

      const data = await response.json();
      expect(data.error).toBeTruthy();
    });

    it("should not leak sensitive error details in response", async () => {
      mockVerifyAdminPassword.mockRejectedValue(
        new Error("Sensitive database connection string"),
      );

      const { POST } = await import("./route");

      const request = new Request("http://localhost/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: "test-password" }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.error).not.toContain("database connection string");
      expect(data.error).toContain("error");
    });
  });

  describe("Security", () => {
    it("should not reveal whether password was close to correct", async () => {
      mockVerifyAdminPassword.mockResolvedValue(false);

      const { POST } = await import("./route");

      const request = new Request("http://localhost/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: "almost-correct" }),
      });

      const response = await POST(request);
      const data = await response.json();

      // Should use generic error message
      expect(data.error.toLowerCase()).toContain("invalid");
      expect(data.error).not.toContain("close");
      expect(data.error).not.toContain("almost");
    });

    it("should not return different errors for different invalid passwords", async () => {
      mockVerifyAdminPassword.mockResolvedValue(false);

      const { POST } = await import("./route");

      const request1 = new Request("http://localhost/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: "password123" }),
      });

      const request2 = new Request("http://localhost/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: "different-wrong-password" }),
      });

      const response1 = await POST(request1);
      const response2 = await POST(request2);

      const data1 = await response1.json();
      const data2 = await response2.json();

      // Both should return same error message
      expect(data1.error).toBe(data2.error);
    });
  });
});
