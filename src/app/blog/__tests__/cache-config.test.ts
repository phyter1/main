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
  describe("Blog Listing Page", () => {
    it("should export revalidate = 60 from blog listing page", () => {
      const content = readPageFile("../page.tsx");
      const revalidate = extractRevalidateValue(content);

      // Verify revalidate export exists
      expect(revalidate).not.toBeNull();

      // Verify revalidate value is 60 seconds (1 minute)
      expect(revalidate).toBe(60);
    });

    it("should use numeric revalidate value (not string)", () => {
      const content = readPageFile("../page.tsx");

      // Ensure it's not exported as a string
      expect(content).not.toContain('export const revalidate = "60"');
      expect(content).toContain("export const revalidate = 60");
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

  describe("Category Archive Page", () => {
    it("should export revalidate = 60 from category page", () => {
      const content = readPageFile("../category/[slug]/page.tsx");
      const revalidate = extractRevalidateValue(content);

      // Verify revalidate export exists
      expect(revalidate).not.toBeNull();

      // Verify revalidate value is 60 seconds (1 minute)
      expect(revalidate).toBe(60);
    });

    it("should use numeric revalidate value (not string)", () => {
      const content = readPageFile("../category/[slug]/page.tsx");

      // Ensure it's not exported as a string
      expect(content).not.toContain('export const revalidate = "60"');
      expect(content).toContain("export const revalidate = 60");
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
    it("should have consistent revalidate for listing and archive pages", () => {
      const listingContent = readPageFile("../page.tsx");
      const categoryContent = readPageFile("../category/[slug]/page.tsx");
      const tagContent = readPageFile("../tag/[slug]/page.tsx");

      const listingRevalidate = extractRevalidateValue(listingContent);
      const categoryRevalidate = extractRevalidateValue(categoryContent);
      const tagRevalidate = extractRevalidateValue(tagContent);

      // All listing/archive pages should have same revalidate
      expect(listingRevalidate).toBe(60);
      expect(categoryRevalidate).toBe(60);
      expect(tagRevalidate).toBe(60);
    });

    it("should use longer revalidate for individual posts", () => {
      const listingContent = readPageFile("../page.tsx");
      const postContent = readPageFile("../[slug]/page.tsx");

      const listingRevalidate = extractRevalidateValue(listingContent);
      const postRevalidate = extractRevalidateValue(postContent);

      // Post page should have longer TTL than listing
      expect(postRevalidate).not.toBeNull();
      expect(listingRevalidate).not.toBeNull();
      expect(postRevalidate!).toBeGreaterThan(listingRevalidate!);
      expect(postRevalidate).toBe(3600); // 1 hour
    });

    it("should use positive revalidate values", () => {
      const contents = [
        readPageFile("../page.tsx"),
        readPageFile("../[slug]/page.tsx"),
        readPageFile("../category/[slug]/page.tsx"),
        readPageFile("../tag/[slug]/page.tsx"),
      ];

      for (const content of contents) {
        const revalidate = extractRevalidateValue(content);
        expect(revalidate).not.toBeNull();
        expect(revalidate!).toBeGreaterThan(0);
      }
    });
  });
});
