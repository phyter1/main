import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    unoptimized: true,
  },
  // Configure MDX support for .mdx files
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
};

// Configure MDX with plugins
const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    // Note: Plugins are specified as module names (strings) to avoid serialization issues with Next.js
    remarkPlugins: [
      "remark-gfm", // GitHub Flavored Markdown support
      "remark-math", // Math equation support
    ],
    rehypePlugins: [
      "rehype-highlight", // Syntax highlighting for code blocks
      "rehype-slug", // Add IDs to headings
      "rehype-autolink-headings", // Add anchor links to headings
    ],
  },
});

export default withMDX(nextConfig);
