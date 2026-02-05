/**
 * Test Suite for Authentication Utilities
 * Validates password hashing, token generation, and session management
 */

import { afterEach, beforeEach, describe, expect, it } from "bun:test";

describe("T001: Authentication Utilities and Middleware", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("Password Verification", () => {
    it("should verify correct password against hash", async () => {
      const { verifyPassword, hashPassword } = await import("./auth");
      const password = "test-password-123";
      const hash = await hashPassword(password);

      const result = await verifyPassword(password, hash);
      expect(result).toBe(true);
    });

    it("should reject incorrect password", async () => {
      const { verifyPassword, hashPassword } = await import("./auth");
      const password = "test-password-123";
      const wrongPassword = "wrong-password";
      const hash = await hashPassword(password);

      const result = await verifyPassword(wrongPassword, hash);
      expect(result).toBe(false);
    });

    it("should generate different hashes for same password (salt)", async () => {
      const { hashPassword } = await import("./auth");
      const password = "test-password-123";

      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });

    it("should verify password with env variable ADMIN_PASSWORD", async () => {
      process.env.ADMIN_PASSWORD = "admin-secret-123";
      const { verifyPassword, hashPassword } = await import("./auth");

      const hash = await hashPassword("admin-secret-123");
      const result = await verifyPassword("admin-secret-123", hash);

      expect(result).toBe(true);
    });

    it("should reject empty password", async () => {
      const { verifyPassword, hashPassword } = await import("./auth");
      const hash = await hashPassword("test");

      const result = await verifyPassword("", hash);
      expect(result).toBe(false);
    });

    it("should reject empty hash", async () => {
      const { verifyPassword } = await import("./auth");

      const result = await verifyPassword("test", "");
      expect(result).toBe(false);
    });
  });

  describe("Token Generation and Validation", () => {
    it("should generate cryptographically secure token", async () => {
      const { generateSessionToken } = await import("./auth");

      const token = generateSessionToken();

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.length).toBeGreaterThan(0);
    });

    it("should generate unique tokens", async () => {
      const { generateSessionToken } = await import("./auth");

      const token1 = generateSessionToken();
      const token2 = generateSessionToken();

      expect(token1).not.toBe(token2);
    });

    it("should generate tokens of consistent length", async () => {
      const { generateSessionToken } = await import("./auth");

      const token1 = generateSessionToken();
      const token2 = generateSessionToken();

      expect(token1.length).toBe(token2.length);
    });

    it("should generate tokens with sufficient entropy (>32 bytes)", async () => {
      const { generateSessionToken } = await import("./auth");

      const token = generateSessionToken();
      // Hex encoding: 64 chars = 32 bytes
      expect(token.length).toBeGreaterThanOrEqual(64);
    });
  });

  describe("Cookie Utilities", () => {
    it("should create session cookie with HTTP-only flag", async () => {
      const { createSessionCookie } = await import("./auth");

      const cookie = createSessionCookie("test-token-123");

      expect(cookie).toContain("session=test-token-123");
      expect(cookie).toContain("HttpOnly");
    });

    it("should set SameSite=Lax for CSRF protection", async () => {
      const { createSessionCookie } = await import("./auth");

      const cookie = createSessionCookie("test-token-123");

      expect(cookie).toContain("SameSite=Lax");
    });

    it("should set Secure flag in production", async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";

      delete require.cache[require.resolve("./auth")];
      const { createSessionCookie } = await import("./auth");

      const cookie = createSessionCookie("test-token-123");

      expect(cookie).toContain("Secure");
      process.env.NODE_ENV = originalEnv;
    });

    it("should not set Secure flag in development", async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";

      delete require.cache[require.resolve("./auth")];
      const { createSessionCookie } = await import("./auth");

      const cookie = createSessionCookie("test-token-123");

      expect(cookie).not.toContain("Secure");
      process.env.NODE_ENV = originalEnv;
    });

    it("should set Path=/ for all routes", async () => {
      const { createSessionCookie } = await import("./auth");

      const cookie = createSessionCookie("test-token-123");

      expect(cookie).toContain("Path=/");
    });

    it("should set Max-Age for 7 days", async () => {
      const { createSessionCookie } = await import("./auth");

      const cookie = createSessionCookie("test-token-123");
      const sevenDaysInSeconds = 7 * 24 * 60 * 60;

      expect(cookie).toContain(`Max-Age=${sevenDaysInSeconds}`);
    });

    it("should create clear cookie string", async () => {
      const { clearSessionCookie } = await import("./auth");

      const cookie = clearSessionCookie();

      expect(cookie).toContain("session=");
      expect(cookie).toContain("Max-Age=0");
      expect(cookie).toContain("Path=/");
    });
  });

  describe("Session Token Storage", () => {
    it("should store session token with expiration", async () => {
      const { storeSessionToken, verifySessionToken } = await import("./auth");

      const token = "test-token-123";
      storeSessionToken(token);

      const isValid = verifySessionToken(token);
      expect(isValid).toBe(true);
    });

    it("should verify valid session token", async () => {
      const { storeSessionToken, verifySessionToken } = await import("./auth");

      const token = "valid-token-456";
      storeSessionToken(token);

      const isValid = verifySessionToken(token);
      expect(isValid).toBe(true);
    });

    it("should reject invalid session token", async () => {
      const { verifySessionToken } = await import("./auth");

      const isValid = verifySessionToken("invalid-token");
      expect(isValid).toBe(false);
    });

    it("should reject expired session token", async () => {
      const { storeSessionToken, verifySessionToken } = await import("./auth");

      const token = "expired-token-789";
      // Store with past expiration
      storeSessionToken(token, Date.now() - 1000);

      const isValid = verifySessionToken(token);
      expect(isValid).toBe(false);
    });

    it("should clean up expired tokens automatically", async () => {
      const { storeSessionToken, verifySessionToken } = await import("./auth");

      // Store multiple tokens with different expirations
      storeSessionToken("valid-token", Date.now() + 60000);
      storeSessionToken("expired-token-1", Date.now() - 1000);
      storeSessionToken("expired-token-2", Date.now() - 2000);

      // Verify only valid token remains
      expect(verifySessionToken("valid-token")).toBe(true);
      expect(verifySessionToken("expired-token-1")).toBe(false);
      expect(verifySessionToken("expired-token-2")).toBe(false);
    });

    it("should invalidate token on logout", async () => {
      const { storeSessionToken, invalidateSessionToken, verifySessionToken } =
        await import("./auth");

      const token = "logout-token-123";
      storeSessionToken(token);

      expect(verifySessionToken(token)).toBe(true);

      invalidateSessionToken(token);

      expect(verifySessionToken(token)).toBe(false);
    });
  });

  describe("Environment Variable Validation", () => {
    it("should require ADMIN_PASSWORD in production", async () => {
      process.env.NODE_ENV = "production";
      delete process.env.ADMIN_PASSWORD;

      delete require.cache[require.resolve("./auth")];

      await expect(async () => {
        const { validateAuthConfig } = await import("./auth");
        validateAuthConfig();
      }).toThrow();
    });

    it("should allow missing ADMIN_PASSWORD in development", async () => {
      process.env.NODE_ENV = "development";
      delete process.env.ADMIN_PASSWORD;

      delete require.cache[require.resolve("./auth")];

      const { validateAuthConfig } = await import("./auth");
      expect(() => validateAuthConfig()).not.toThrow();
    });

    it("should reject placeholder ADMIN_PASSWORD value", async () => {
      process.env.ADMIN_PASSWORD = "your_password_here";

      delete require.cache[require.resolve("./auth")];

      const { validateAuthConfig } = await import("./auth");
      expect(() => validateAuthConfig()).toThrow();
    });

    it("should accept valid ADMIN_PASSWORD", async () => {
      process.env.ADMIN_PASSWORD = "secure-password-123";

      delete require.cache[require.resolve("./auth")];

      const { validateAuthConfig } = await import("./auth");
      expect(() => validateAuthConfig()).not.toThrow();
    });
  });
});
