/**
 * Blog Page Caching Configuration Tests
 *
 * Verifies that all blog pages export correct revalidate values
 * Part of T034: Configure caching and ISR
 *
 * @vitest-environment node
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

// Helper to read page file content
function readPageFile(relativePath: string): string {
  const filePath = resolve(__dirname, relativePath);
  return readFileSync(filePath, "utf-8");
}

// Helper to extract revalidate value from file content
function extractRevalidateValue(content: string): number | null {
  const match = content.match(/export\s+const\s+revalidate\s*=\s*(\d+)/);
  return match ? Number.parseInt(match[1], 10) : null;
}

describe("Blog Page Revalidate Exports", () => {
  describe("Blog Listing Page (Client Component)", () => {
    it("should NOT export revalidate (client component with real-time data)", () => {
      const content = readPageFile("../page.tsx");
      const revalidate = extractRevalidateValue(content);

      // Client components cannot use revalidate - uses Convex real-time queries
      expect(revalidate).toBeNull();
      expect(content).toContain('"use client"');
    });

    it("should use Convex real-time queries instead of ISR", () => {
      const content = readPageFile("../page.tsx");

      // Should use useQuery for real-time updates
      expect(content).toContain("useQuery");
      expect(content).toContain("convex/react");
    });
  });

  describe("Blog Post Page", () => {
    it("should export revalidate = 3600 from blog post page", () => {
      const content = readPageFile("../[slug]/page.tsx");
      const revalidate = extractRevalidateValue(content);

      // Verify revalidate export exists
      expect(revalidate).not.toBeNull();

      // Verify revalidate value is 3600 seconds (1 hour)
      expect(revalidate).toBe(3600);
    });

    it("should use numeric revalidate value (not string)", () => {
      const content = readPageFile("../[slug]/page.tsx");

      // Ensure it's not exported as a string
      expect(content).not.toContain('export const revalidate = "3600"');
      expect(content).toContain("export const revalidate = 3600");
    });
  });

  describe("Category Archive Page (Client Component)", () => {
    it("should NOT export revalidate (client component with real-time data)", () => {
      const content = readPageFile("../category/[slug]/page.tsx");
      const revalidate = extractRevalidateValue(content);

      // Client components cannot use revalidate - uses Convex real-time queries
      expect(revalidate).toBeNull();
      expect(content).toContain('"use client"');
    });

    it("should use Convex real-time queries instead of ISR", () => {
      const content = readPageFile("../category/[slug]/page.tsx");

      // Should use useQuery for real-time updates
      expect(content).toContain("useQuery");
      expect(content).toContain("convex/react");
    });
  });

  describe("Tag Archive Page", () => {
    it("should export revalidate = 60 from tag page", () => {
      const content = readPageFile("../tag/[slug]/page.tsx");
      const revalidate = extractRevalidateValue(content);

      // Verify revalidate export exists
      expect(revalidate).not.toBeNull();

      // Verify revalidate value is 60 seconds (1 minute)
      expect(revalidate).toBe(60);
    });

    it("should use numeric revalidate value (not string)", () => {
      const content = readPageFile("../tag/[slug]/page.tsx");

      // Ensure it's not exported as a string
      expect(content).not.toContain('export const revalidate = "60"');
      expect(content).toContain("export const revalidate = 60");
    });
  });

  describe("Revalidate Strategy Consistency", () => {
    it("should have consistent revalidate for server-rendered archive pages", () => {
      const tagContent = readPageFile("../tag/[slug]/page.tsx");
      const tagRevalidate = extractRevalidateValue(tagContent);

      // Tag page (server component) should have 60s revalidate
      expect(tagRevalidate).toBe(60);
    });

    it("should use longer revalidate for individual posts", () => {
      const postContent = readPageFile("../[slug]/page.tsx");
      const tagContent = readPageFile("../tag/[slug]/page.tsx");

      const postRevalidate = extractRevalidateValue(postContent);
      const tagRevalidate = extractRevalidateValue(tagContent);

      // Post page should have longer TTL than archive pages
      expect(postRevalidate).not.toBeNull();
      expect(tagRevalidate).not.toBeNull();
      expect(postRevalidate!).toBeGreaterThan(tagRevalidate!);
      expect(postRevalidate).toBe(3600); // 1 hour
    });

    it("should use positive revalidate values on server components", () => {
      const serverComponents = [
        readPageFile("../[slug]/page.tsx"),
        readPageFile("../tag/[slug]/page.tsx"),
      ];

      for (const content of serverComponents) {
        const revalidate = extractRevalidateValue(content);
        expect(revalidate).not.toBeNull();
        expect(revalidate!).toBeGreaterThan(0);
      }
    });
  });
});
