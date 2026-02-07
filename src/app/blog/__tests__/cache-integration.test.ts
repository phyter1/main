/**
 * Blog Caching Integration Tests
 *
 * Tests for integrated caching strategy across all blog routes
 * Part of T034: Configure caching and ISR
 */

import { describe, expect, it } from "bun:test";

describe("Blog Caching Integration", () => {
  describe("All Blog Routes Have Revalidate", () => {
    it("should have revalidate export on all blog page routes", async () => {
      // Import all blog pages
      const pages = [
        await import("../page"), // listing
        await import("../[slug]/page"), // post
        await import("../category/[slug]/page"), // category
        await import("../tag/[slug]/page"), // tag
      ];

      // Verify all have revalidate export
      for (const page of pages) {
        expect(page.revalidate).toBeDefined();
        expect(typeof page.revalidate).toBe("number");
        expect(page.revalidate).toBeGreaterThan(0);
      }
    });

    it("should have integer revalidate values (no decimals)", async () => {
      const pages = [
        await import("../page"),
        await import("../[slug]/page"),
        await import("../category/[slug]/page"),
        await import("../tag/[slug]/page"),
      ];

      for (const page of pages) {
        expect(Number.isInteger(page.revalidate)).toBe(true);
      }
    });
  });

  describe("Cache Strategy Consistency", () => {
    it("should align cache headers with ISR revalidation periods", async () => {
      // Get Next.js config headers (relative to project root)
      const config = await import("../../../../next.config");
      const headers = await config.default.headers?.();
      const blogHeader = headers?.find((h) => h.source === "/blog/:path*");
      const cacheControl = blogHeader?.headers.find(
        (h) => h.key === "Cache-Control",
      );

      // Extract s-maxage value
      const sMaxageMatch = cacheControl?.value.match(/s-maxage=(\d+)/);
      const sMaxage = Number.parseInt(sMaxageMatch?.[1] || "0", 10);

      // Get page revalidate values
      const listingPage = await import("../page");

      // s-maxage should align with shortest revalidate period
      // (listing pages at 60s, posts at 3600s)
      // Using 60s s-maxage covers both cases appropriately
      expect(sMaxage).toBeGreaterThan(0);
      expect(sMaxage).toBeLessThanOrEqual(listingPage.revalidate);
    });

    it("should provide stale-while-revalidate buffer for better UX", async () => {
      // Get cache headers
      const config = await import("../../../../next.config");
      const headers = await config.default.headers?.();
      const blogHeader = headers?.find((h) => h.source === "/blog/:path*");
      const cacheControl = blogHeader?.headers.find(
        (h) => h.key === "Cache-Control",
      );

      // Extract stale-while-revalidate value
      const swrMatch = cacheControl?.value.match(
        /stale-while-revalidate=(\d+)/,
      );
      const swr = Number.parseInt(swrMatch?.[1] || "0", 10);

      // stale-while-revalidate should provide reasonable buffer
      // (typically 5x the s-maxage or at least 60s)
      expect(swr).toBeGreaterThanOrEqual(60);

      // Should be longer than s-maxage to allow background revalidation
      const sMaxageMatch = cacheControl?.value.match(/s-maxage=(\d+)/);
      const sMaxage = Number.parseInt(sMaxageMatch?.[1] || "0", 10);
      expect(swr).toBeGreaterThanOrEqual(sMaxage);
    });

    it("should balance content freshness with performance", async () => {
      const listingPage = await import("../page");
      const postPage = await import("../[slug]/page");
      const categoryPage = await import("../category/[slug]/page");
      const tagPage = await import("../tag/[slug]/page");

      // Listing and archive pages: shorter TTL for freshness
      expect(listingPage.revalidate).toBe(60);
      expect(categoryPage.revalidate).toBe(60);
      expect(tagPage.revalidate).toBe(60);

      // Blog posts: longer TTL for performance (content rarely changes)
      expect(postPage.revalidate).toBe(3600);
      expect(postPage.revalidate).toBeGreaterThan(listingPage.revalidate);
    });
  });

  describe("No Cache Conflicts", () => {
    it("should not have conflicting Cache-Control directives", async () => {
      const config = await import("../../../../next.config");
      const headers = await config.default.headers?.();
      const blogHeader = headers?.find((h) => h.source === "/blog/:path*");
      const cacheControl = blogHeader?.headers.find(
        (h) => h.key === "Cache-Control",
      );

      // Should not have conflicting directives
      const value = cacheControl?.value || "";

      // Should not have both max-age and s-maxage (prefer s-maxage)
      // OR if both present, they should be compatible
      const hasMaxAge = value.includes("max-age=");
      const hasSMaxAge = value.includes("s-maxage=");

      if (hasMaxAge && hasSMaxAge) {
        // If both present, extract and compare
        const maxAgeMatch = value.match(/max-age=(\d+)/);
        const sMaxAgeMatch = value.match(/s-maxage=(\d+)/);
        const maxAge = Number.parseInt(maxAgeMatch?.[1] || "0", 10);
        const sMaxAge = Number.parseInt(sMaxAgeMatch?.[1] || "0", 10);

        // s-maxage should not exceed max-age
        expect(sMaxAge).toBeLessThanOrEqual(maxAge);
      }

      // Should not have no-cache or no-store (would disable caching)
      expect(value).not.toContain("no-cache");
      expect(value).not.toContain("no-store");

      // Should not have must-revalidate with stale-while-revalidate
      // (they have conflicting behavior)
      const hasMustRevalidate = value.includes("must-revalidate");
      const hasStaleWhileRevalidate = value.includes("stale-while-revalidate");
      if (hasMustRevalidate && hasStaleWhileRevalidate) {
        // This combination is valid but may not behave as expected
        // Consider it a potential issue to investigate
        console.warn(
          "Cache-Control has both must-revalidate and stale-while-revalidate",
        );
      }
    });

    it("should use Vercel-compatible cache directives", async () => {
      const config = await import("../../../../next.config");
      const headers = await config.default.headers?.();
      const blogHeader = headers?.find((h) => h.source === "/blog/:path*");
      const cacheControl = blogHeader?.headers.find(
        (h) => h.key === "Cache-Control",
      );

      const value = cacheControl?.value || "";

      // Vercel Edge prefers s-maxage over max-age
      expect(value).toContain("s-maxage");

      // stale-while-revalidate is well-supported on Vercel Edge
      expect(value).toContain("stale-while-revalidate");
    });
  });

  describe("Revalidate Values Match Requirements", () => {
    it("should match T034 acceptance criteria exactly", async () => {
      const listingPage = await import("../page");
      const postPage = await import("../[slug]/page");
      const categoryPage = await import("../category/[slug]/page");
      const tagPage = await import("../tag/[slug]/page");

      // Verify exact values from acceptance criteria
      expect(listingPage.revalidate).toBe(60); // 1 minute
      expect(postPage.revalidate).toBe(3600); // 1 hour
      expect(categoryPage.revalidate).toBe(60); // 1 minute
      expect(tagPage.revalidate).toBe(60); // 1 minute
    });
  });
});
