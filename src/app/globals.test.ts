import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("globals.css Color Tokens", () => {
  const globalsPath = resolve(__dirname, "./globals.css");
  const globalsCSS = readFileSync(globalsPath, "utf-8");

  describe("Primary Vibrant Color", () => {
    it("should define --color-primary-vibrant in @theme inline", () => {
      expect(globalsCSS).toContain("--color-primary-vibrant:");
    });

    it("should define --primary-vibrant in :root for light mode", () => {
      const rootSection = globalsCSS.match(/:root\s*\{[^}]+\}/s)?.[0];
      expect(rootSection).toBeDefined();
      expect(rootSection).toContain("--primary-vibrant:");
    });

    it("should define --primary-vibrant in .dark for dark mode", () => {
      const darkSection = globalsCSS.match(/\.dark\s*\{[^}]+\}/s)?.[0];
      expect(darkSection).toBeDefined();
      expect(darkSection).toContain("--primary-vibrant:");
    });

    it("should define --primary-vibrant-foreground in :root", () => {
      const rootSection = globalsCSS.match(/:root\s*\{[^}]+\}/s)?.[0];
      expect(rootSection).toContain("--primary-vibrant-foreground:");
    });

    it("should define --primary-vibrant-foreground in .dark", () => {
      const darkSection = globalsCSS.match(/\.dark\s*\{[^}]+\}/s)?.[0];
      expect(darkSection).toContain("--primary-vibrant-foreground:");
    });

    it("should use OKLCH color space for primary-vibrant", () => {
      const rootSection = globalsCSS.match(/:root\s*\{[^}]+\}/s)?.[0];
      const vibrantColorLine = rootSection
        ?.split("\n")
        .find((line) => line.includes("--primary-vibrant:"));

      expect(vibrantColorLine).toBeDefined();
      expect(vibrantColorLine).toContain("oklch(");
    });

    it("should have different values for light and dark mode primary-vibrant", () => {
      const rootSection = globalsCSS.match(/:root\s*\{[^}]+\}/s)?.[0];
      const darkSection = globalsCSS.match(/\.dark\s*\{[^}]+\}/s)?.[0];

      const lightValue = rootSection
        ?.split("\n")
        .find((line) => line.includes("--primary-vibrant:"))
        ?.trim();
      const darkValue = darkSection
        ?.split("\n")
        .find((line) => line.includes("--primary-vibrant:"))
        ?.trim();

      expect(lightValue).toBeDefined();
      expect(darkValue).toBeDefined();
      expect(lightValue).not.toBe(darkValue);
    });
  });

  describe("Semantic Colors", () => {
    it("should define --color-success in @theme inline", () => {
      expect(globalsCSS).toContain("--color-success:");
    });

    it("should define --color-warning in @theme inline", () => {
      expect(globalsCSS).toContain("--color-warning:");
    });

    it("should define --color-info in @theme inline", () => {
      expect(globalsCSS).toContain("--color-info:");
    });

    it("should define --success in :root", () => {
      const rootSection = globalsCSS.match(/:root\s*\{[^}]+\}/s)?.[0];
      expect(rootSection).toContain("--success:");
    });

    it("should define --warning in :root", () => {
      const rootSection = globalsCSS.match(/:root\s*\{[^}]+\}/s)?.[0];
      expect(rootSection).toContain("--warning:");
    });

    it("should define --info in :root", () => {
      const rootSection = globalsCSS.match(/:root\s*\{[^}]+\}/s)?.[0];
      expect(rootSection).toContain("--info:");
    });

    it("should define --success in .dark", () => {
      const darkSection = globalsCSS.match(/\.dark\s*\{[^}]+\}/s)?.[0];
      expect(darkSection).toContain("--success:");
    });

    it("should define --warning in .dark", () => {
      const darkSection = globalsCSS.match(/\.dark\s*\{[^}]+\}/s)?.[0];
      expect(darkSection).toContain("--warning:");
    });

    it("should define --info in .dark", () => {
      const darkSection = globalsCSS.match(/\.dark\s*\{[^}]+\}/s)?.[0];
      expect(darkSection).toContain("--info:");
    });

    it("should define foreground variants for semantic colors in @theme inline", () => {
      expect(globalsCSS).toContain("--color-success-foreground:");
      expect(globalsCSS).toContain("--color-warning-foreground:");
      expect(globalsCSS).toContain("--color-info-foreground:");
    });

    it("should use OKLCH color space for semantic colors", () => {
      const rootSection = globalsCSS.match(/:root\s*\{[^}]+\}/s)?.[0];

      const successLine = rootSection
        ?.split("\n")
        .find((line) => line.includes("--success:"));
      const warningLine = rootSection
        ?.split("\n")
        .find((line) => line.includes("--warning:"));
      const infoLine = rootSection
        ?.split("\n")
        .find((line) => line.includes("--info:"));

      expect(successLine).toContain("oklch(");
      expect(warningLine).toContain("oklch(");
      expect(infoLine).toContain("oklch(");
    });
  });

  describe("Category Colors", () => {
    it("should define --color-category-frontend in @theme inline", () => {
      expect(globalsCSS).toContain("--color-category-frontend:");
    });

    it("should define --color-category-backend in @theme inline", () => {
      expect(globalsCSS).toContain("--color-category-backend:");
    });

    it("should define --color-category-database in @theme inline", () => {
      expect(globalsCSS).toContain("--color-category-database:");
    });

    it("should define --color-category-devtools in @theme inline", () => {
      expect(globalsCSS).toContain("--color-category-devtools:");
    });

    it("should define --color-category-cloud in @theme inline", () => {
      expect(globalsCSS).toContain("--color-category-cloud:");
    });

    it("should define --color-category-ai in @theme inline", () => {
      expect(globalsCSS).toContain("--color-category-ai:");
    });

    it("should define --category-frontend in :root", () => {
      const rootSection = globalsCSS.match(/:root\s*\{[^}]+\}/s)?.[0];
      expect(rootSection).toContain("--category-frontend:");
    });

    it("should define --category-backend in :root", () => {
      const rootSection = globalsCSS.match(/:root\s*\{[^}]+\}/s)?.[0];
      expect(rootSection).toContain("--category-backend:");
    });

    it("should define --category-database in :root", () => {
      const rootSection = globalsCSS.match(/:root\s*\{[^}]+\}/s)?.[0];
      expect(rootSection).toContain("--category-database:");
    });

    it("should define --category-devtools in :root", () => {
      const rootSection = globalsCSS.match(/:root\s*\{[^}]+\}/s)?.[0];
      expect(rootSection).toContain("--category-devtools:");
    });

    it("should define --category-cloud in :root", () => {
      const rootSection = globalsCSS.match(/:root\s*\{[^}]+\}/s)?.[0];
      expect(rootSection).toContain("--category-cloud:");
    });

    it("should define --category-ai in :root", () => {
      const rootSection = globalsCSS.match(/:root\s*\{[^}]+\}/s)?.[0];
      expect(rootSection).toContain("--category-ai:");
    });

    it("should define all category colors in .dark", () => {
      const darkSection = globalsCSS.match(/\.dark\s*\{[^}]+\}/s)?.[0];
      expect(darkSection).toContain("--category-frontend:");
      expect(darkSection).toContain("--category-backend:");
      expect(darkSection).toContain("--category-database:");
      expect(darkSection).toContain("--category-devtools:");
      expect(darkSection).toContain("--category-cloud:");
      expect(darkSection).toContain("--category-ai:");
    });

    it("should use OKLCH color space for category colors", () => {
      const rootSection = globalsCSS.match(/:root\s*\{[^}]+\}/s)?.[0];

      const frontendLine = rootSection
        ?.split("\n")
        .find((line) => line.includes("--category-frontend:"));
      const backendLine = rootSection
        ?.split("\n")
        .find((line) => line.includes("--category-backend:"));
      const databaseLine = rootSection
        ?.split("\n")
        .find((line) => line.includes("--category-database:"));
      const devtoolsLine = rootSection
        ?.split("\n")
        .find((line) => line.includes("--category-devtools:"));
      const cloudLine = rootSection
        ?.split("\n")
        .find((line) => line.includes("--category-cloud:"));
      const aiLine = rootSection
        ?.split("\n")
        .find((line) => line.includes("--category-ai:"));

      expect(frontendLine).toContain("oklch(");
      expect(backendLine).toContain("oklch(");
      expect(databaseLine).toContain("oklch(");
      expect(devtoolsLine).toContain("oklch(");
      expect(cloudLine).toContain("oklch(");
      expect(aiLine).toContain("oklch(");
    });
  });

  describe("Accent Color Variants", () => {
    it("should define --color-accent in @theme inline", () => {
      expect(globalsCSS).toContain("--color-accent:");
    });

    it("should define --color-accent-hover in @theme inline", () => {
      expect(globalsCSS).toContain("--color-accent-hover:");
    });

    it("should define --color-accent-subtle in @theme inline", () => {
      expect(globalsCSS).toContain("--color-accent-subtle:");
    });

    it("should define --color-accent-vibrant in @theme inline", () => {
      expect(globalsCSS).toContain("--color-accent-vibrant:");
    });

    it("should define accent variants in :root", () => {
      const rootSection = globalsCSS.match(/:root\s*\{[^}]+\}/s)?.[0];
      expect(rootSection).toContain("--accent:");
      expect(rootSection).toContain("--accent-hover:");
      expect(rootSection).toContain("--accent-subtle:");
      expect(rootSection).toContain("--accent-vibrant:");
    });

    it("should define accent variants in .dark", () => {
      const darkSection = globalsCSS.match(/\.dark\s*\{[^}]+\}/s)?.[0];
      expect(darkSection).toContain("--accent:");
      expect(darkSection).toContain("--accent-hover:");
      expect(darkSection).toContain("--accent-subtle:");
      expect(darkSection).toContain("--accent-vibrant:");
    });
  });

  describe("Tailwind Integration", () => {
    it("should import tailwindcss at the top", () => {
      expect(globalsCSS).toMatch(/@import\s+["']tailwindcss["'];/);
    });

    it("should import tw-animate-css", () => {
      expect(globalsCSS).toMatch(/@import\s+["']tw-animate-css["'];/);
    });

    it("should define custom dark variant", () => {
      expect(globalsCSS).toContain("@custom-variant dark");
    });

    it("should have @theme inline section", () => {
      expect(globalsCSS).toContain("@theme inline");
    });
  });

  describe("Color Consistency", () => {
    it("should have matching number of color definitions in :root and .dark", () => {
      const rootSection = globalsCSS.match(/:root\s*\{[^}]+\}/s)?.[0];
      const darkSection = globalsCSS.match(/\.dark\s*\{[^}]+\}/s)?.[0];

      const rootColorCount = (rootSection?.match(/--[a-z-]+:\s*oklch\(/g) || [])
        .length;
      const darkColorCount = (darkSection?.match(/--[a-z-]+:\s*oklch\(/g) || [])
        .length;

      // Should have same number of color definitions (or close to it)
      expect(Math.abs(rootColorCount - darkColorCount)).toBeLessThanOrEqual(2);
    });

    it("should use consistent OKLCH format across all colors", () => {
      const allColorLines = globalsCSS.match(/--[a-z-]+:\s*oklch\([^)]+\);/g);
      expect(allColorLines).toBeDefined();

      if (allColorLines) {
        expect(allColorLines.length).toBeGreaterThan(30); // We have many colors

        // All should be valid OKLCH format
        for (const line of allColorLines) {
          expect(line).toMatch(/oklch\(\s*[\d.]+\s+[\d.]+\s+[\d.]+/);
        }
      }
    });
  });

  describe("Light and Dark Mode Support", () => {
    it("should define :root section for light mode", () => {
      expect(globalsCSS).toContain(":root {");
    });

    it("should define .dark section for dark mode", () => {
      expect(globalsCSS).toContain(".dark {");
    });

    it("should have radius configuration in :root", () => {
      const rootSection = globalsCSS.match(/:root\s*\{[^}]+\}/s)?.[0];
      expect(rootSection).toContain("--radius:");
    });

    it("should define base layer styles", () => {
      expect(globalsCSS).toContain("@layer base");
    });

    it("should apply background and foreground colors to body", () => {
      expect(globalsCSS).toMatch(/body\s*\{[^}]*bg-background[^}]*\}/);
      expect(globalsCSS).toMatch(/body\s*\{[^}]*text-foreground[^}]*\}/);
    });
  });
});
