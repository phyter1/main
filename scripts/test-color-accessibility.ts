#!/usr/bin/env bun

/**
 * Color Accessibility Testing Script
 *
 * Tests all color combinations in the design system for WCAG 2.1 Level AA compliance.
 * Calculates contrast ratios programmatically using WCAG formulas.
 */

interface ColorPair {
  name: string;
  foreground: string;
  background: string;
  category: string;
  usage: string;
  requiredRatio: number; // 4.5:1 for text, 3:1 for UI components
}

interface ContrastResult {
  pair: ColorPair;
  contrastRatio: number;
  passes: boolean;
  wcagLevel: "AAA" | "AA" | "Fail";
}

/**
 * Convert OKLCH to RGB
 * OKLCH format: oklch(L C H) where L is 0-1, C is 0-0.4, H is 0-360
 */
function oklchToRgb(oklch: string): { r: number; g: number; b: number } {
  // Parse OKLCH string
  const match = oklch.match(
    /oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*(?:\/\s*([\d.]+%?))?\)/,
  );

  if (!match) {
    throw new Error(`Invalid OKLCH format: ${oklch}`);
  }

  const [, lStr, cStr, hStr, _aStr] = match;
  const L = Number.parseFloat(lStr);
  const C = Number.parseFloat(cStr);
  const H = Number.parseFloat(hStr);

  // Convert OKLCH to Linear RGB (simplified conversion for testing)
  // This is a simplified conversion - in production, use a proper color space library
  // For WCAG contrast testing, approximation is acceptable as long as it's consistent

  // Convert to Lab (approximate)
  const a = C * Math.cos((H * Math.PI) / 180);
  const b = C * Math.sin((H * Math.PI) / 180);

  // Convert Lab to XYZ (simplified)
  const fy = (L + 0.16) / 1.16;
  const fx = a / 5 + fy;
  const fz = fy - b / 2;

  const xr = fx > 0.2068966 ? fx ** 3 : (fx - 0.13793103) / 7.787;
  const yr = fy > 0.2068966 ? fy ** 3 : (fy - 0.13793103) / 7.787;
  const zr = fz > 0.2068966 ? fz ** 3 : (fz - 0.13793103) / 7.787;

  // D65 illuminant
  const X = xr * 0.95047;
  const Y = yr * 1.0;
  const Z = zr * 1.08883;

  // XYZ to RGB
  let r = X * 3.2406 + Y * -1.5372 + Z * -0.4986;
  let g = X * -0.9689 + Y * 1.8758 + Z * 0.0415;
  let bValue = X * 0.0557 + Y * -0.204 + Z * 1.057;

  // Gamma correction
  r = r > 0.0031308 ? 1.055 * r ** (1 / 2.4) - 0.055 : 12.92 * r;
  g = g > 0.0031308 ? 1.055 * g ** (1 / 2.4) - 0.055 : 12.92 * g;
  bValue =
    bValue > 0.0031308 ? 1.055 * bValue ** (1 / 2.4) - 0.055 : 12.92 * bValue;

  // Clamp to 0-255
  return {
    r: Math.max(0, Math.min(255, Math.round(r * 255))),
    g: Math.max(0, Math.min(255, Math.round(g * 255))),
    b: Math.max(0, Math.min(255, Math.round(bValue * 255))),
  };
}

/**
 * Calculate relative luminance according to WCAG formula
 */
function getRelativeLuminance(rgb: {
  r: number;
  g: number;
  b: number;
}): number {
  const rsRGB = rgb.r / 255;
  const gsRGB = rgb.g / 255;
  const bsRGB = rgb.b / 255;

  const r = rsRGB <= 0.03928 ? rsRGB / 12.92 : ((rsRGB + 0.055) / 1.055) ** 2.4;
  const g = gsRGB <= 0.03928 ? gsRGB / 12.92 : ((gsRGB + 0.055) / 1.055) ** 2.4;
  const b = bsRGB <= 0.03928 ? bsRGB / 12.92 : ((bsRGB + 0.055) / 1.055) ** 2.4;

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculate contrast ratio according to WCAG formula
 */
function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = oklchToRgb(color1);
  const rgb2 = oklchToRgb(color2);

  const l1 = getRelativeLuminance(rgb1);
  const l2 = getRelativeLuminance(rgb2);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Get WCAG level based on contrast ratio and required ratio
 */
function getWCAGLevel(ratio: number, required: number): "AAA" | "AA" | "Fail" {
  if (required === 4.5) {
    // Text requirements
    if (ratio >= 7) return "AAA";
    if (ratio >= 4.5) return "AA";
  } else if (required === 3) {
    // UI component requirements
    if (ratio >= 4.5) return "AAA";
    if (ratio >= 3) return "AA";
  }
  return "Fail";
}

// Define all color pairs to test
const colorPairs: ColorPair[] = [
  // Light mode - Accent colors
  {
    name: "accent / background (light)",
    foreground: "oklch(0.6 0.2 250)",
    background: "oklch(1 0 0)",
    category: "Accent Colors",
    usage: "Accent elements on light backgrounds",
    requiredRatio: 3, // UI component
  },
  {
    name: "accent-foreground / accent (light)",
    foreground: "oklch(0.145 0 0)",
    background: "oklch(0.6 0.2 250)",
    category: "Accent Colors",
    usage: "Text on accent backgrounds",
    requiredRatio: 4.5,
  },
  {
    name: "accent-vibrant / background (light)",
    foreground: "oklch(0.5 0.25 250)",
    background: "oklch(1 0 0)",
    category: "Accent Colors",
    usage: "Vibrant accent elements",
    requiredRatio: 3,
  },

  // Dark mode - Accent colors
  {
    name: "accent / background (dark)",
    foreground: "oklch(0.65 0.22 250)",
    background: "oklch(0.145 0 0)",
    category: "Accent Colors",
    usage: "Accent elements on dark backgrounds",
    requiredRatio: 3,
  },
  {
    name: "accent-foreground / accent (dark)",
    foreground: "oklch(0.145 0 0)",
    background: "oklch(0.65 0.22 250)",
    category: "Accent Colors",
    usage: "Text on accent backgrounds (dark mode)",
    requiredRatio: 4.5,
  },
  {
    name: "accent-vibrant / background (dark)",
    foreground: "oklch(0.75 0.26 250)",
    background: "oklch(0.145 0 0)",
    category: "Accent Colors",
    usage: "Vibrant accent elements (dark mode)",
    requiredRatio: 3,
  },

  // Primary vibrant (light)
  {
    name: "primary-vibrant / background (light)",
    foreground: "oklch(0.48 0.24 220)",
    background: "oklch(1 0 0)",
    category: "Primary Vibrant",
    usage: "Vibrant CTA buttons",
    requiredRatio: 3,
  },
  {
    name: "primary-vibrant-foreground / primary-vibrant (light)",
    foreground: "oklch(0.98 0.02 220)",
    background: "oklch(0.48 0.24 220)",
    category: "Primary Vibrant",
    usage: "Text on vibrant buttons",
    requiredRatio: 4.5,
  },

  // Primary vibrant (dark)
  {
    name: "primary-vibrant / background (dark)",
    foreground: "oklch(0.65 0.26 200)",
    background: "oklch(0.145 0 0)",
    category: "Primary Vibrant",
    usage: "Vibrant CTA buttons (dark mode)",
    requiredRatio: 3,
  },
  {
    name: "primary-vibrant-foreground / primary-vibrant (dark)",
    foreground: "oklch(0.145 0 0)",
    background: "oklch(0.65 0.26 200)",
    category: "Primary Vibrant",
    usage: "Text on vibrant buttons (dark mode)",
    requiredRatio: 4.5,
  },

  // Semantic colors (light)
  {
    name: "success / background (light)",
    foreground: "oklch(0.48 0.22 145)",
    background: "oklch(1 0 0)",
    category: "Semantic Colors",
    usage: "Success indicators",
    requiredRatio: 3,
  },
  {
    name: "success-foreground / success (light)",
    foreground: "oklch(0.98 0.02 145)",
    background: "oklch(0.48 0.22 145)",
    category: "Semantic Colors",
    usage: "Text on success backgrounds",
    requiredRatio: 4.5,
  },
  {
    name: "warning / background (light)",
    foreground: "oklch(0.48 0.24 85)",
    background: "oklch(1 0 0)",
    category: "Semantic Colors",
    usage: "Warning indicators",
    requiredRatio: 3,
  },
  {
    name: "warning-foreground / warning (light)",
    foreground: "oklch(0.98 0.02 85)",
    background: "oklch(0.48 0.24 85)",
    category: "Semantic Colors",
    usage: "Text on warning backgrounds",
    requiredRatio: 4.5,
  },
  {
    name: "info / background (light)",
    foreground: "oklch(0.48 0.24 220)",
    background: "oklch(1 0 0)",
    category: "Semantic Colors",
    usage: "Info indicators",
    requiredRatio: 3,
  },
  {
    name: "info-foreground / info (light)",
    foreground: "oklch(0.98 0.02 220)",
    background: "oklch(0.48 0.24 220)",
    category: "Semantic Colors",
    usage: "Text on info backgrounds",
    requiredRatio: 4.5,
  },

  // Semantic colors (dark)
  {
    name: "success / background (dark)",
    foreground: "oklch(0.6 0.22 145)",
    background: "oklch(0.145 0 0)",
    category: "Semantic Colors",
    usage: "Success indicators (dark mode)",
    requiredRatio: 3,
  },
  {
    name: "success-foreground / success (dark)",
    foreground: "oklch(0.145 0 0)",
    background: "oklch(0.6 0.22 145)",
    category: "Semantic Colors",
    usage: "Text on success backgrounds (dark mode)",
    requiredRatio: 4.5,
  },
  {
    name: "warning / background (dark)",
    foreground: "oklch(0.7 0.24 85)",
    background: "oklch(0.145 0 0)",
    category: "Semantic Colors",
    usage: "Warning indicators (dark mode)",
    requiredRatio: 3,
  },
  {
    name: "warning-foreground / warning (dark)",
    foreground: "oklch(0.145 0 0)",
    background: "oklch(0.7 0.24 85)",
    category: "Semantic Colors",
    usage: "Text on warning backgrounds (dark mode)",
    requiredRatio: 4.5,
  },
  {
    name: "info / background (dark)",
    foreground: "oklch(0.6 0.24 220)",
    background: "oklch(0.145 0 0)",
    category: "Semantic Colors",
    usage: "Info indicators (dark mode)",
    requiredRatio: 3,
  },
  {
    name: "info-foreground / info (dark)",
    foreground: "oklch(0.145 0 0)",
    background: "oklch(0.6 0.24 220)",
    category: "Semantic Colors",
    usage: "Text on info backgrounds (dark mode)",
    requiredRatio: 4.5,
  },

  // Category colors (light)
  {
    name: "category-frontend / background (light)",
    foreground: "oklch(0.55 0.2 220)",
    background: "oklch(1 0 0)",
    category: "Category Colors",
    usage: "Frontend category badges",
    requiredRatio: 3,
  },
  {
    name: "category-backend / background (light)",
    foreground: "oklch(0.5 0.22 145)",
    background: "oklch(1 0 0)",
    category: "Category Colors",
    usage: "Backend category badges",
    requiredRatio: 3,
  },
  {
    name: "category-database / background (light)",
    foreground: "oklch(0.55 0.2 280)",
    background: "oklch(1 0 0)",
    category: "Category Colors",
    usage: "Database category badges",
    requiredRatio: 3,
  },
  {
    name: "category-devtools / background (light)",
    foreground: "oklch(0.58 0.24 35)",
    background: "oklch(1 0 0)",
    category: "Category Colors",
    usage: "DevTools category badges",
    requiredRatio: 3,
  },
  {
    name: "category-cloud / background (light)",
    foreground: "oklch(0.52 0.2 180)",
    background: "oklch(1 0 0)",
    category: "Category Colors",
    usage: "Cloud category badges",
    requiredRatio: 3,
  },
  {
    name: "category-ai / background (light)",
    foreground: "oklch(0.6 0.22 320)",
    background: "oklch(1 0 0)",
    category: "Category Colors",
    usage: "AI category badges",
    requiredRatio: 3,
  },

  // Category colors (dark)
  {
    name: "category-frontend / background (dark)",
    foreground: "oklch(0.65 0.22 220)",
    background: "oklch(0.145 0 0)",
    category: "Category Colors",
    usage: "Frontend category badges (dark mode)",
    requiredRatio: 3,
  },
  {
    name: "category-backend / background (dark)",
    foreground: "oklch(0.6 0.24 145)",
    background: "oklch(0.145 0 0)",
    category: "Category Colors",
    usage: "Backend category badges (dark mode)",
    requiredRatio: 3,
  },
  {
    name: "category-database / background (dark)",
    foreground: "oklch(0.65 0.22 280)",
    background: "oklch(0.145 0 0)",
    category: "Category Colors",
    usage: "Database category badges (dark mode)",
    requiredRatio: 3,
  },
  {
    name: "category-devtools / background (dark)",
    foreground: "oklch(0.68 0.24 35)",
    background: "oklch(0.145 0 0)",
    category: "Category Colors",
    usage: "DevTools category badges (dark mode)",
    requiredRatio: 3,
  },
  {
    name: "category-cloud / background (dark)",
    foreground: "oklch(0.62 0.22 180)",
    background: "oklch(0.145 0 0)",
    category: "Category Colors",
    usage: "Cloud category badges (dark mode)",
    requiredRatio: 3,
  },
  {
    name: "category-ai / background (dark)",
    foreground: "oklch(0.7 0.24 320)",
    background: "oklch(0.145 0 0)",
    category: "Category Colors",
    usage: "AI category badges (dark mode)",
    requiredRatio: 3,
  },
];

// Run tests
console.log("\n🎨 Color Accessibility Testing\n");
console.log(
  "Testing WCAG 2.1 Level AA compliance for all color combinations...\n",
);

const results: ContrastResult[] = [];
let totalTests = 0;
let passedTests = 0;

for (const pair of colorPairs) {
  totalTests++;

  try {
    const ratio = getContrastRatio(pair.foreground, pair.background);
    const passes = ratio >= pair.requiredRatio;
    const wcagLevel = getWCAGLevel(ratio, pair.requiredRatio);

    results.push({
      pair,
      contrastRatio: ratio,
      passes,
      wcagLevel,
    });

    if (passes) passedTests++;

    const statusIcon = passes ? "✅" : "❌";
    const levelBadge =
      wcagLevel === "AAA" ? "(AAA)" : wcagLevel === "AA" ? "(AA)" : "(FAIL)";

    console.log(
      `${statusIcon} ${pair.name}: ${ratio.toFixed(2)}:1 ${levelBadge}`,
    );
    console.log(`   Required: ${pair.requiredRatio}:1 | Usage: ${pair.usage}`);
  } catch (error) {
    console.error(`❌ Error testing ${pair.name}:`, error);
  }
}

console.log(
  `\n📊 Summary: ${passedTests}/${totalTests} tests passed (${((passedTests / totalTests) * 100).toFixed(1)}%)\n`,
);

// Group results by category
const byCategory = results.reduce(
  (acc, result) => {
    const cat = result.pair.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(result);
    return acc;
  },
  {} as Record<string, ContrastResult[]>,
);

console.log("📋 Results by Category:\n");

for (const [category, categoryResults] of Object.entries(byCategory)) {
  const passed = categoryResults.filter((r) => r.passes).length;
  const total = categoryResults.length;
  const percentage = ((passed / total) * 100).toFixed(1);

  console.log(`${category}: ${passed}/${total} (${percentage}%)`);
}

// Exit with appropriate code
process.exit(passedTests === totalTests ? 0 : 1);
