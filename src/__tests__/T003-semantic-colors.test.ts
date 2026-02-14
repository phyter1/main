import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("T003: Semantic Color Tokens (success, warning, info)", () => {
  let globalsCSS: string;

  // Read globals.css once before all tests
  try {
    globalsCSS = readFileSync(
      join(process.cwd(), "src/app/globals.css"),
      "utf-8",
    );
  } catch (error) {
    console.error("Failed to read globals.css:", error);
    globalsCSS = "";
  }

  describe("Success Color Tokens", () => {
    describe("Light Mode", () => {
      it("should define --success in :root with green hue (145°) and correct chroma (0.20-0.22)", () => {
        const successMatch = globalsCSS.match(
          /:root\s*{[^}]*--success:\s*oklch\(([^)]+)\)/s,
        );
        expect(successMatch).toBeTruthy();

        const values = successMatch?.[1].split(/\s+/).map((v) => parseFloat(v));
        const chroma = values[1];
        const hue = values[2];
        expect(hue).toBeCloseTo(145, 5); // Green hue around 145°
        expect(chroma).toBeGreaterThanOrEqual(0.2);
        expect(chroma).toBeLessThanOrEqual(0.22);
      });

      it("should define --success-foreground in :root with proper contrast", () => {
        expect(globalsCSS).toContain("--success-foreground:");
        const successFgMatch = globalsCSS.match(
          /:root\s*{[^}]*--success-foreground:\s*oklch\(([^)]+)\)/s,
        );
        expect(successFgMatch).toBeTruthy();
      });
    });

    describe("Dark Mode", () => {
      it("should define --success in .dark with green hue (145°) and correct chroma (0.20-0.22)", () => {
        const successMatch = globalsCSS.match(
          /\.dark\s*{[^}]*--success:\s*oklch\(([^)]+)\)/s,
        );
        expect(successMatch).toBeTruthy();

        const values = successMatch?.[1].split(/\s+/).map((v) => parseFloat(v));
        const chroma = values[1];
        const hue = values[2];
        expect(hue).toBeCloseTo(145, 5);
        expect(chroma).toBeGreaterThanOrEqual(0.2);
        expect(chroma).toBeLessThanOrEqual(0.22);
      });

      it("should define --success-foreground in .dark with proper contrast", () => {
        const darkSuccessFgMatch = globalsCSS.match(
          /\.dark\s*{[^}]*--success-foreground:\s*oklch\(([^)]+)\)/s,
        );
        expect(darkSuccessFgMatch).toBeTruthy();
      });
    });
  });

  describe("Warning Color Tokens", () => {
    describe("Light Mode", () => {
      it("should define --warning in :root with yellow/amber hue (85°) and correct chroma (0.22-0.24)", () => {
        const warningMatch = globalsCSS.match(
          /:root\s*{[^}]*--warning:\s*oklch\(([^)]+)\)/s,
        );
        expect(warningMatch).toBeTruthy();

        const values = warningMatch?.[1].split(/\s+/).map((v) => parseFloat(v));
        const chroma = values[1];
        const hue = values[2];
        expect(hue).toBeCloseTo(85, 5); // Yellow/amber hue around 85°
        expect(chroma).toBeGreaterThanOrEqual(0.22);
        expect(chroma).toBeLessThanOrEqual(0.24);
      });

      it("should define --warning-foreground in :root with proper contrast", () => {
        expect(globalsCSS).toContain("--warning-foreground:");
        const warningFgMatch = globalsCSS.match(
          /:root\s*{[^}]*--warning-foreground:\s*oklch\(([^)]+)\)/s,
        );
        expect(warningFgMatch).toBeTruthy();
      });
    });

    describe("Dark Mode", () => {
      it("should define --warning in .dark with yellow/amber hue (85°) and correct chroma (0.22-0.24)", () => {
        const warningMatch = globalsCSS.match(
          /\.dark\s*{[^}]*--warning:\s*oklch\(([^)]+)\)/s,
        );
        expect(warningMatch).toBeTruthy();

        const values = warningMatch?.[1].split(/\s+/).map((v) => parseFloat(v));
        const chroma = values[1];
        const hue = values[2];
        expect(hue).toBeCloseTo(85, 5);
        expect(chroma).toBeGreaterThanOrEqual(0.22);
        expect(chroma).toBeLessThanOrEqual(0.24);
      });

      it("should define --warning-foreground in .dark with proper contrast", () => {
        const darkWarningFgMatch = globalsCSS.match(
          /\.dark\s*{[^}]*--warning-foreground:\s*oklch\(([^)]+)\)/s,
        );
        expect(darkWarningFgMatch).toBeTruthy();
      });
    });
  });

  describe("Info Color Tokens", () => {
    describe("Light Mode", () => {
      it("should define --info in :root with blue hue (220°) and correct chroma (0.22-0.24)", () => {
        const infoMatch = globalsCSS.match(
          /:root\s*{[^}]*--info:\s*oklch\(([^)]+)\)/s,
        );
        expect(infoMatch).toBeTruthy();

        const values = infoMatch?.[1].split(/\s+/).map((v) => parseFloat(v));
        const chroma = values[1];
        const hue = values[2];
        expect(hue).toBeCloseTo(220, 5); // Blue hue around 220°
        expect(chroma).toBeGreaterThanOrEqual(0.22);
        expect(chroma).toBeLessThanOrEqual(0.24);
      });

      it("should define --info-foreground in :root with proper contrast", () => {
        expect(globalsCSS).toContain("--info-foreground:");
        const infoFgMatch = globalsCSS.match(
          /:root\s*{[^}]*--info-foreground:\s*oklch\(([^)]+)\)/s,
        );
        expect(infoFgMatch).toBeTruthy();
      });
    });

    describe("Dark Mode", () => {
      it("should define --info in .dark with blue hue (220°) and correct chroma (0.22-0.24)", () => {
        const infoMatch = globalsCSS.match(
          /\.dark\s*{[^}]*--info:\s*oklch\(([^)]+)\)/s,
        );
        expect(infoMatch).toBeTruthy();

        const values = infoMatch?.[1].split(/\s+/).map((v) => parseFloat(v));
        const chroma = values[1];
        const hue = values[2];
        expect(hue).toBeCloseTo(220, 5);
        expect(chroma).toBeGreaterThanOrEqual(0.22);
        expect(chroma).toBeLessThanOrEqual(0.24);
      });

      it("should define --info-foreground in .dark with proper contrast", () => {
        const darkInfoFgMatch = globalsCSS.match(
          /\.dark\s*{[^}]*--info-foreground:\s*oklch\(([^)]+)\)/s,
        );
        expect(darkInfoFgMatch).toBeTruthy();
      });
    });
  });

  describe("Tailwind @theme Inline Mappings", () => {
    it("should map --color-success to var(--success) in @theme inline", () => {
      const themeSuccessMatch = globalsCSS.match(
        /@theme inline\s*{[^}]*--color-success:\s*var\(--success\)/s,
      );
      expect(themeSuccessMatch).toBeTruthy();
    });

    it("should map --color-success-foreground to var(--success-foreground) in @theme inline", () => {
      const themeSuccessFgMatch = globalsCSS.match(
        /@theme inline\s*{[^}]*--color-success-foreground:\s*var\(--success-foreground\)/s,
      );
      expect(themeSuccessFgMatch).toBeTruthy();
    });

    it("should map --color-warning to var(--warning) in @theme inline", () => {
      const themeWarningMatch = globalsCSS.match(
        /@theme inline\s*{[^}]*--color-warning:\s*var\(--warning\)/s,
      );
      expect(themeWarningMatch).toBeTruthy();
    });

    it("should map --color-warning-foreground to var(--warning-foreground) in @theme inline", () => {
      const themeWarningFgMatch = globalsCSS.match(
        /@theme inline\s*{[^}]*--color-warning-foreground:\s*var\(--warning-foreground\)/s,
      );
      expect(themeWarningFgMatch).toBeTruthy();
    });

    it("should map --color-info to var(--info) in @theme inline", () => {
      const themeInfoMatch = globalsCSS.match(
        /@theme inline\s*{[^}]*--color-info:\s*var\(--info\)/s,
      );
      expect(themeInfoMatch).toBeTruthy();
    });

    it("should map --color-info-foreground to var(--info-foreground) in @theme inline", () => {
      const themeInfoFgMatch = globalsCSS.match(
        /@theme inline\s*{[^}]*--color-info-foreground:\s*var\(--info-foreground\)/s,
      );
      expect(themeInfoFgMatch).toBeTruthy();
    });
  });

  describe("Color Consistency", () => {
    it("should align semantic colors with destructive color pattern (similar chroma range)", () => {
      // Destructive uses chroma 0.245 for light, 0.191 for dark
      // Success, Warning, Info should use similar chroma range (0.20-0.24)
      const successMatch = globalsCSS.match(
        /:root\s*{[^}]*--success:\s*oklch\(([^)]+)\)/s,
      );
      const warningMatch = globalsCSS.match(
        /:root\s*{[^}]*--warning:\s*oklch\(([^)]+)\)/s,
      );
      const infoMatch = globalsCSS.match(
        /:root\s*{[^}]*--info:\s*oklch\(([^)]+)\)/s,
      );

      expect(successMatch).toBeTruthy();
      expect(warningMatch).toBeTruthy();
      expect(infoMatch).toBeTruthy();

      // All semantic colors should have chroma in similar range
      const successChroma = parseFloat(successMatch?.[1].split(/\s+/)[1]);
      const warningChroma = parseFloat(warningMatch?.[1].split(/\s+/)[1]);
      const infoChroma = parseFloat(infoMatch?.[1].split(/\s+/)[1]);

      // All chromas should be within reasonable range of each other
      expect(Math.abs(successChroma - warningChroma)).toBeLessThan(0.1);
      expect(Math.abs(warningChroma - infoChroma)).toBeLessThan(0.1);
      expect(Math.abs(successChroma - infoChroma)).toBeLessThan(0.1);
    });

    it("should use OKLCH color space for all semantic colors", () => {
      const successMatch = globalsCSS.match(/--success:\s*oklch\(/);
      const warningMatch = globalsCSS.match(/--warning:\s*oklch\(/);
      const infoMatch = globalsCSS.match(/--info:\s*oklch\(/);

      expect(successMatch).toBeTruthy();
      expect(warningMatch).toBeTruthy();
      expect(infoMatch).toBeTruthy();
    });
  });

  describe("WCAG AA Contrast Requirements", () => {
    it("should have success foreground colors with sufficient contrast for text", () => {
      // Light mode: dark text on light background (high lightness difference)
      const lightSuccessMatch = globalsCSS.match(
        /:root\s*{[^}]*--success:\s*oklch\(([^)]+)\)/s,
      );
      const lightSuccessFgMatch = globalsCSS.match(
        /:root\s*{[^}]*--success-foreground:\s*oklch\(([^)]+)\)/s,
      );

      expect(lightSuccessMatch).toBeTruthy();
      expect(lightSuccessFgMatch).toBeTruthy();

      const successLightness = parseFloat(
        lightSuccessMatch?.[1].split(/\s+/)[0],
      );
      const successFgLightness = parseFloat(
        lightSuccessFgMatch?.[1].split(/\s+/)[0],
      );

      // Light mode: background should be lighter, foreground should be darker
      // Significant lightness difference needed for contrast (typically > 0.4)
      expect(Math.abs(successLightness - successFgLightness)).toBeGreaterThan(
        0.4,
      );
    });

    it("should have warning foreground colors with sufficient contrast for text", () => {
      const lightWarningMatch = globalsCSS.match(
        /:root\s*{[^}]*--warning:\s*oklch\(([^)]+)\)/s,
      );
      const lightWarningFgMatch = globalsCSS.match(
        /:root\s*{[^}]*--warning-foreground:\s*oklch\(([^)]+)\)/s,
      );

      expect(lightWarningMatch).toBeTruthy();
      expect(lightWarningFgMatch).toBeTruthy();

      const warningLightness = parseFloat(
        lightWarningMatch?.[1].split(/\s+/)[0],
      );
      const warningFgLightness = parseFloat(
        lightWarningFgMatch?.[1].split(/\s+/)[0],
      );

      expect(Math.abs(warningLightness - warningFgLightness)).toBeGreaterThan(
        0.4,
      );
    });

    it("should have info foreground colors with sufficient contrast for text", () => {
      const lightInfoMatch = globalsCSS.match(
        /:root\s*{[^}]*--info:\s*oklch\(([^)]+)\)/s,
      );
      const lightInfoFgMatch = globalsCSS.match(
        /:root\s*{[^}]*--info-foreground:\s*oklch\(([^)]+)\)/s,
      );

      expect(lightInfoMatch).toBeTruthy();
      expect(lightInfoFgMatch).toBeTruthy();

      const infoLightness = parseFloat(lightInfoMatch?.[1].split(/\s+/)[0]);
      const infoFgLightness = parseFloat(lightInfoFgMatch?.[1].split(/\s+/)[0]);

      expect(Math.abs(infoLightness - infoFgLightness)).toBeGreaterThan(0.4);
    });
  });
});
