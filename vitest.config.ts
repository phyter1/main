import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "happy-dom",
    setupFiles: "./vitest.setup.ts",

    // For convex-test (when testing Convex functions)
    environmentOptions: {
      happyDOM: {
        settings: {
          navigator: { userAgent: "vitest" },
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
