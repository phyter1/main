/**
 * Next.js Configuration Tests
 *
 * Tests for caching headers configuration in next.config.ts
 * Part of T034: Configure caching and ISR
 */

import { describe, expect, it } from "bun:test";

describe("Next.js Configuration - Cache Headers", () => {
  it("should have headers configuration function", async () => {
    const config = await import("./next.config");

    // Should have headers function
    expect(config.default.headers).toBeDefined();
    expect(typeof config.default.headers).toBe("function");
  });

  it("should configure Cache-Control headers for /blog/:path* routes", async () => {
    const config = await import("./next.config");

    // Get headers configuration
    const headers = await config.default.headers?.();

    // Verify headers array exists
    expect(headers).toBeDefined();
    expect(Array.isArray(headers)).toBe(true);

    // Find blog route header
    const blogHeader = headers?.find((h) => h.source === "/blog/:path*");

    // Verify blog header exists
    expect(blogHeader).toBeDefined();
    expect(blogHeader?.source).toBe("/blog/:path*");

    // Verify Cache-Control header
    const cacheControl = blogHeader?.headers.find(
      (h) => h.key === "Cache-Control",
    );
    expect(cacheControl).toBeDefined();
    expect(cacheControl?.key).toBe("Cache-Control");
  });

  it("should set s-maxage in Cache-Control header", async () => {
    const config = await import("./next.config");
    const headers = await config.default.headers?.();
    const blogHeader = headers?.find((h) => h.source === "/blog/:path*");
    const cacheControl = blogHeader?.headers.find(
      (h) => h.key === "Cache-Control",
    );

    // Verify s-maxage directive present
    expect(cacheControl?.value).toBeDefined();
    expect(cacheControl?.value).toContain("s-maxage");

    // Extract s-maxage value
    const sMaxageMatch = cacheControl?.value.match(/s-maxage=(\d+)/);
    expect(sMaxageMatch).toBeDefined();

    // Verify s-maxage value is reasonable (between 1 and 3600 seconds)
    const sMaxage = Number.parseInt(sMaxageMatch?.[1] || "0", 10);
    expect(sMaxage).toBeGreaterThan(0);
    expect(sMaxage).toBeLessThanOrEqual(3600);
  });

  it("should set stale-while-revalidate in Cache-Control header", async () => {
    const config = await import("./next.config");
    const headers = await config.default.headers?.();
    const blogHeader = headers?.find((h) => h.source === "/blog/:path*");
    const cacheControl = blogHeader?.headers.find(
      (h) => h.key === "Cache-Control",
    );

    // Verify stale-while-revalidate directive present
    expect(cacheControl?.value).toBeDefined();
    expect(cacheControl?.value).toContain("stale-while-revalidate");

    // Extract stale-while-revalidate value
    const swrMatch = cacheControl?.value.match(/stale-while-revalidate=(\d+)/);
    expect(swrMatch).toBeDefined();

    // Verify stale-while-revalidate value is reasonable (between 1 and 3600 seconds)
    const swr = Number.parseInt(swrMatch?.[1] || "0", 10);
    expect(swr).toBeGreaterThan(0);
    expect(swr).toBeLessThanOrEqual(3600);
  });

  it("should format Cache-Control header correctly", async () => {
    const config = await import("./next.config");
    const headers = await config.default.headers?.();
    const blogHeader = headers?.find((h) => h.source === "/blog/:path*");
    const cacheControl = blogHeader?.headers.find(
      (h) => h.key === "Cache-Control",
    );

    // Verify proper formatting (comma-separated directives)
    expect(cacheControl?.value).toBeDefined();
    expect(cacheControl?.value).toMatch(
      /s-maxage=\d+,\s*stale-while-revalidate=\d+/,
    );
  });

  it("should optimize for Vercel Edge caching", async () => {
    const config = await import("./next.config");
    const headers = await config.default.headers?.();
    const blogHeader = headers?.find((h) => h.source === "/blog/:path*");
    const cacheControl = blogHeader?.headers.find(
      (h) => h.key === "Cache-Control",
    );

    // Should use s-maxage (shared cache) for Vercel Edge
    expect(cacheControl?.value).toContain("s-maxage");

    // Should NOT include no-cache or no-store (would disable caching)
    expect(cacheControl?.value).not.toContain("no-cache");
    expect(cacheControl?.value).not.toContain("no-store");

    // Should include stale-while-revalidate for better UX
    expect(cacheControl?.value).toContain("stale-while-revalidate");
  });
});
