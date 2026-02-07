/**
 * Blog Page Caching Configuration Tests
 *
 * Verifies that all blog pages export correct revalidate values
 * Part of T034: Configure caching and ISR
 */

import { describe, expect, it } from "bun:test";

describe("Blog Page Revalidate Exports", () => {
  describe("Blog Listing Page", () => {
    it("should export revalidate = 60 from blog listing page", async () => {
      const page = await import("../page");

      // Verify revalidate export exists
      expect(page.revalidate).toBeDefined();

      // Verify revalidate value is 60 seconds (1 minute)
      expect(page.revalidate).toBe(60);

      // Verify it's a number
      expect(typeof page.revalidate).toBe("number");
    });

    it("should use numeric revalidate value (not string)", async () => {
      const page = await import("../page");

      // Ensure it's strictly a number
      expect(typeof page.revalidate).toBe("number");
      expect(Number.isInteger(page.revalidate)).toBe(true);
    });
  });

  describe("Blog Post Page", () => {
    it("should export revalidate = 3600 from blog post page", async () => {
      const page = await import("../[slug]/page");

      // Verify revalidate export exists
      expect(page.revalidate).toBeDefined();

      // Verify revalidate value is 3600 seconds (1 hour)
      expect(page.revalidate).toBe(3600);

      // Verify it's a number
      expect(typeof page.revalidate).toBe("number");
    });

    it("should use numeric revalidate value (not string)", async () => {
      const page = await import("../[slug]/page");

      // Ensure it's strictly a number
      expect(typeof page.revalidate).toBe("number");
      expect(Number.isInteger(page.revalidate)).toBe(true);
    });
  });

  describe("Category Archive Page", () => {
    it("should export revalidate = 60 from category page", async () => {
      const page = await import("../category/[slug]/page");

      // Verify revalidate export exists
      expect(page.revalidate).toBeDefined();

      // Verify revalidate value is 60 seconds (1 minute)
      expect(page.revalidate).toBe(60);

      // Verify it's a number
      expect(typeof page.revalidate).toBe("number");
    });

    it("should use numeric revalidate value (not string)", async () => {
      const page = await import("../category/[slug]/page");

      // Ensure it's strictly a number
      expect(typeof page.revalidate).toBe("number");
      expect(Number.isInteger(page.revalidate)).toBe(true);
    });
  });

  describe("Tag Archive Page", () => {
    it("should export revalidate = 60 from tag page", async () => {
      const page = await import("../tag/[slug]/page");

      // Verify revalidate export exists
      expect(page.revalidate).toBeDefined();

      // Verify revalidate value is 60 seconds (1 minute)
      expect(page.revalidate).toBe(60);

      // Verify it's a number
      expect(typeof page.revalidate).toBe("number");
    });

    it("should use numeric revalidate value (not string)", async () => {
      const page = await import("../tag/[slug]/page");

      // Ensure it's strictly a number
      expect(typeof page.revalidate).toBe("number");
      expect(Number.isInteger(page.revalidate)).toBe(true);
    });
  });

  describe("Revalidate Strategy Consistency", () => {
    it("should have consistent revalidate for listing and archive pages", async () => {
      const listingPage = await import("../page");
      const categoryPage = await import("../category/[slug]/page");
      const tagPage = await import("../tag/[slug]/page");

      // All listing/archive pages should have same revalidate
      expect(listingPage.revalidate).toBe(60);
      expect(categoryPage.revalidate).toBe(60);
      expect(tagPage.revalidate).toBe(60);
    });

    it("should use longer revalidate for individual posts", async () => {
      const listingPage = await import("../page");
      const postPage = await import("../[slug]/page");

      // Post page should have longer TTL than listing
      expect(postPage.revalidate).toBeGreaterThan(listingPage.revalidate);
      expect(postPage.revalidate).toBe(3600); // 1 hour
    });

    it("should use positive revalidate values", async () => {
      const pages = [
        await import("../page"),
        await import("../[slug]/page"),
        await import("../category/[slug]/page"),
        await import("../tag/[slug]/page"),
      ];

      for (const page of pages) {
        expect(page.revalidate).toBeGreaterThan(0);
      }
    });
  });
});
