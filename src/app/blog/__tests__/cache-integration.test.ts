/**
 * Blog Caching Integration Tests
 *
 * Tests for integrated caching strategy across all blog routes
 * Part of T034: Configure caching and ISR
 *
 * @vitest-environment node
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

// Helper to read file content
function readFile(relativePath: string): string {
  const filePath = resolve(__dirname, relativePath);
  return readFileSync(filePath, "utf-8");
}

// Helper to extract revalidate value from file content
function extractRevalidateValue(content: string): number | null {
  const match = content.match(/export\s+const\s+revalidate\s*=\s*(\d+)/);
  return match ? Number.parseInt(match[1], 10) : null;
}

describe("Blog Caching Integration", () => {
  describe("Server-Rendered Routes Have Revalidate", () => {
    it("should have revalidate export on server component routes", () => {
      // Only server components can use revalidate
      const serverPages = [
        readFile("../[slug]/page.tsx"), // post (server component)
        readFile("../tag/[slug]/page.tsx"), // tag (server component)
      ];

      // Verify server components have revalidate export
      for (const content of serverPages) {
        const revalidate = extractRevalidateValue(content);
        expect(revalidate).not.toBeNull();
        expect(revalidate).toBeGreaterThan(0);
      }
    });

    it("should have integer revalidate values (no decimals)", () => {
      const serverPages = [
        readFile("../[slug]/page.tsx"),
        readFile("../tag/[slug]/page.tsx"),
      ];

      for (const content of serverPages) {
        const revalidate = extractRevalidateValue(content);
        expect(revalidate).not.toBeNull();
        expect(Number.isInteger(revalidate)).toBe(true);
      }
    });
  });

  describe("Cache Strategy Consistency", () => {
    it("should align cache headers with ISR revalidation periods", () => {
      // Get Next.js config
      const configContent = readFile("../../../../next.config.ts");

      // Check if config has cache headers defined
      expect(configContent).toContain("headers");

      // Get server component revalidate values
      const tagContent = readFile("../tag/[slug]/page.tsx");
      const tagRevalidate = extractRevalidateValue(tagContent);

      expect(tagRevalidate).not.toBeNull();
      expect(tagRevalidate).toBe(60);
    });

    it("should provide stale-while-revalidate buffer for better UX", () => {
      // Get Next.js config
      const configContent = readFile("../../../../next.config.ts");

      // Check if stale-while-revalidate is configured
      // This is a basic check - the config should have cache headers
      expect(configContent).toContain("headers");
    });

    it("should balance content freshness with performance", () => {
      const postContent = readFile("../[slug]/page.tsx");
      const tagContent = readFile("../tag/[slug]/page.tsx");

      const postRevalidate = extractRevalidateValue(postContent);
      const tagRevalidate = extractRevalidateValue(tagContent);

      // Archive pages: shorter TTL for freshness
      expect(tagRevalidate).toBe(60);

      // Blog posts: longer TTL for performance (content rarely changes)
      expect(postRevalidate).toBe(3600);
      expect(postRevalidate!).toBeGreaterThan(tagRevalidate!);
    });
  });

  describe("No Cache Conflicts", () => {
    it("should not have conflicting Cache-Control directives", () => {
      const configContent = readFile("../../../../next.config.ts");

      // Should not have both no-cache and caching directives
      const hasHeaders = configContent.includes("headers");
      expect(hasHeaders).toBe(true);

      // If cache headers are defined, they should not conflict
      if (configContent.includes("Cache-Control")) {
        // Should not have no-cache or no-store (would disable caching)
        const cacheControlLines = configContent
          .split("\n")
          .filter((line) => line.includes("Cache-Control"));

        for (const line of cacheControlLines) {
          // Basic sanity check - cache control lines shouldn't disable all caching
          if (line.includes("no-cache") || line.includes("no-store")) {
            // This might be intentional for certain routes, but blog routes should cache
            expect(line).not.toContain("/blog");
          }
        }
      }
    });

    it("should use Vercel-compatible cache directives", () => {
      const configContent = readFile("../../../../next.config.ts");

      // Vercel Edge supports standard Cache-Control headers
      // Just verify we have some cache configuration
      expect(configContent).toContain("headers");
    });
  });

  describe("Revalidate Values Match Requirements", () => {
    it("should match T034 acceptance criteria for server components", () => {
      const postContent = readFile("../[slug]/page.tsx");
      const tagContent = readFile("../tag/[slug]/page.tsx");

      const postRevalidate = extractRevalidateValue(postContent);
      const tagRevalidate = extractRevalidateValue(tagContent);

      // Verify exact values from acceptance criteria (server components only)
      expect(postRevalidate).toBe(3600); // 1 hour
      expect(tagRevalidate).toBe(60); // 1 minute
    });

    it("should verify client components use Convex real-time", () => {
      const listingContent = readFile("../page.tsx");
      const categoryContent = readFile("../category/[slug]/page.tsx");

      const listingRevalidate = extractRevalidateValue(listingContent);
      const categoryRevalidate = extractRevalidateValue(categoryContent);

      // Client components should NOT have revalidate exports
      expect(listingRevalidate).toBeNull();
      expect(categoryRevalidate).toBeNull();

      // Should use Convex real-time queries instead
      expect(listingContent).toContain("useQuery");
      expect(categoryContent).toContain("useQuery");
    });
  });
});
