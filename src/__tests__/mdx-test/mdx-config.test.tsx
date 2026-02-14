import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { compile } from "@mdx-js/mdx";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

describe("T001: MDX Configuration", () => {
  let sampleMdxContent: string;

  beforeEach(async () => {
    // Load sample MDX file
    const filePath = join(process.cwd(), "src/__tests__/mdx-test/sample.mdx");
    sampleMdxContent = await readFile(filePath, "utf-8");
  });

  afterEach(() => {
    // Cleanup
  });

  describe("MDX Dependencies", () => {
    it("should have @next/mdx installed", async () => {
      const pkg = await import("@next/mdx");
      expect(pkg).toBeDefined();
      expect(typeof pkg.default).toBe("function");
    });

    it("should have @mdx-js/loader installed", async () => {
      const pkg = await import("@mdx-js/loader");
      expect(pkg).toBeDefined();
    });

    it("should have @mdx-js/react installed", async () => {
      const pkg = await import("@mdx-js/react");
      expect(pkg).toBeDefined();
      expect(pkg.MDXProvider).toBeDefined();
    });

    it("should have remark-gfm installed", () => {
      expect(remarkGfm).toBeDefined();
      expect(typeof remarkGfm).toBe("function");
    });

    it("should have remark-math installed", () => {
      expect(remarkMath).toBeDefined();
      expect(typeof remarkMath).toBe("function");
    });

    it("should have rehype-highlight installed", () => {
      expect(rehypeHighlight).toBeDefined();
      expect(typeof rehypeHighlight).toBe("function");
    });

    it("should have rehype-slug installed", () => {
      expect(rehypeSlug).toBeDefined();
      expect(typeof rehypeSlug).toBe("function");
    });

    it("should have rehype-autolink-headings installed", () => {
      expect(rehypeAutolinkHeadings).toBeDefined();
      expect(typeof rehypeAutolinkHeadings).toBe("function");
    });

    it("should have @tiptap/react installed", async () => {
      const pkg = await import("@tiptap/react");
      expect(pkg).toBeDefined();
      expect(pkg.useEditor).toBeDefined();
    });

    it("should have @tiptap/starter-kit installed", async () => {
      const pkg = await import("@tiptap/starter-kit");
      expect(pkg).toBeDefined();
      expect(pkg.default).toBeDefined();
    });

    it("should have @tiptap/extension-link installed", async () => {
      const pkg = await import("@tiptap/extension-link");
      expect(pkg).toBeDefined();
      expect(pkg.Link).toBeDefined();
    });
  });

  describe("MDX Compilation", () => {
    it("should compile MDX with all plugins", async () => {
      const compiled = await compile(sampleMdxContent, {
        remarkPlugins: [remarkGfm, remarkMath],
        rehypePlugins: [rehypeHighlight, rehypeSlug, rehypeAutolinkHeadings],
      });

      expect(compiled).toBeDefined();
      expect(compiled.value).toBeDefined();
      expect(typeof compiled.value).toBe("string");
    });

    it("should process GitHub Flavored Markdown", async () => {
      const gfmContent = `
# Test

- [x] Task list
- [ ] Another task

| Table | Header |
|-------|--------|
| Cell  | Data   |

~~Strikethrough~~
`;

      const compiled = await compile(gfmContent, {
        remarkPlugins: [remarkGfm],
      });

      expect(compiled.value).toBeDefined();
      // GFM features should be processed
      expect(compiled.value).toContain("input");
      expect(compiled.value).toContain("table");
      expect(compiled.value).toContain("del");
    });

    it("should add IDs to headings with rehype-slug", async () => {
      const headingContent = `
# Main Heading
## Sub Heading With Spaces
### Another-Heading
`;

      const compiled = await compile(headingContent, {
        rehypePlugins: [rehypeSlug],
      });

      expect(compiled.value).toBeDefined();
      // Headings should have ID attributes (in JSX format)
      expect(compiled.value).toContain('id: "main-heading"');
      expect(compiled.value).toContain('id: "sub-heading-with-spaces"');
      expect(compiled.value).toContain('id: "another-heading"');
    });

    it("should add anchor links to headings with rehype-autolink-headings", async () => {
      const headingContent = `
# Test Heading
`;

      const compiled = await compile(headingContent, {
        rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings],
      });

      expect(compiled.value).toBeDefined();
      // Should have anchor link (in JSX format)
      expect(compiled.value).toContain('href: "#test-heading"');
    });

    it("should handle code blocks with rehype-highlight", async () => {
      const codeContent = `
\`\`\`typescript
const hello = "world";
console.log(hello);
\`\`\`
`;

      const compiled = await compile(codeContent, {
        rehypePlugins: [rehypeHighlight],
      });

      expect(compiled.value).toBeDefined();
      // Code should have syntax highlighting classes
      expect(compiled.value).toContain("hljs");
    });
  });

  describe("Next.js Configuration", () => {
    it("should have MDX configuration in next.config.ts", async () => {
      const configPath = join(process.cwd(), "next.config.ts");
      const configContent = await readFile(configPath, "utf-8");

      // Check for MDX configuration
      expect(configContent).toContain("@next/mdx");
      expect(configContent).toContain("createMDX");
      expect(configContent).toContain("remarkPlugins");
      expect(configContent).toContain("rehypePlugins");
      expect(configContent).toContain(
        'pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"]',
      );

      // Check for plugin references (as strings)
      expect(configContent).toContain("remark-gfm");
      expect(configContent).toContain("remark-math");
      expect(configContent).toContain("rehype-highlight");
      expect(configContent).toContain("rehype-slug");
      expect(configContent).toContain("rehype-autolink-headings");
    });

    it("should export configured withMDX", async () => {
      const configPath = join(process.cwd(), "next.config.ts");
      const configContent = await readFile(configPath, "utf-8");

      expect(configContent).toContain("withMDX");
      expect(configContent).toContain("export default withMDX(nextConfig)");
    });
  });

  describe("Package.json Verification", () => {
    it("should have all MDX dependencies in package.json", async () => {
      const pkgPath = join(process.cwd(), "package.json");
      const pkgContent = await readFile(pkgPath, "utf-8");
      const pkg = JSON.parse(pkgContent);

      const requiredDeps = [
        "@next/mdx",
        "@mdx-js/loader",
        "@mdx-js/react",
        "remark-gfm",
        "remark-math",
        "rehype-highlight",
        "rehype-slug",
        "rehype-autolink-headings",
        "@tiptap/react",
        "@tiptap/starter-kit",
        "@tiptap/extension-link",
      ];

      for (const dep of requiredDeps) {
        const hasInDeps = pkg.dependencies?.[dep];
        const hasInDevDeps = pkg.devDependencies?.[dep];

        expect(hasInDeps || hasInDevDeps).toBeTruthy();
      }
    });
  });

  describe("Integration Tests", () => {
    it("should be able to import and use MDX components", async () => {
      // Test that we can dynamically import MDX components
      const { MDXProvider } = await import("@mdx-js/react");

      expect(MDXProvider).toBeDefined();
      expect(typeof MDXProvider).toBe("function");
    });

    it("should compile sample.mdx without errors", async () => {
      expect(sampleMdxContent).toBeDefined();
      expect(sampleMdxContent.length).toBeGreaterThan(0);

      const compiled = await compile(sampleMdxContent, {
        remarkPlugins: [remarkGfm, remarkMath],
        rehypePlugins: [rehypeHighlight, rehypeSlug, rehypeAutolinkHeadings],
      });

      expect(compiled).toBeDefined();
      expect(compiled.value).toBeDefined();
    });

    it("should handle complex MDX features", async () => {
      const complexContent = `
# Complex Test

## Code with Language

\`\`\`typescript
interface User {
  id: number;
  name: string;
}
\`\`\`

## Task Lists

- [x] Install dependencies
- [x] Configure Next.js
- [ ] Create tests

## Tables

| Package | Version | Status |
|---------|---------|--------|
| MDX     | 3.x     | ✓      |
| GFM     | 4.x     | ✓      |

## Links

Check out [Next.js](https://nextjs.org) and [MDX](https://mdxjs.com).

## Headings with Auto-Links

This section should have auto-generated anchors.
`;

      const compiled = await compile(complexContent, {
        remarkPlugins: [remarkGfm, remarkMath],
        rehypePlugins: [rehypeHighlight, rehypeSlug, rehypeAutolinkHeadings],
      });

      expect(compiled.value).toBeDefined();
      // Should process all features
      expect(compiled.value).toContain("table");
      expect(compiled.value).toContain("input");
      expect(compiled.value).toContain("hljs");
      expect(compiled.value).toContain("id:");
    });
  });

  describe("Acceptance Criteria", () => {
    it("✓ should have @next/mdx, @mdx-js/loader, @mdx-js/react installed", async () => {
      const nextMdx = await import("@next/mdx");
      const mdxLoader = await import("@mdx-js/loader");
      const mdxReact = await import("@mdx-js/react");

      expect(nextMdx).toBeDefined();
      expect(mdxLoader).toBeDefined();
      expect(mdxReact).toBeDefined();
    });

    it("✓ should have remark-gfm and remark-math installed", () => {
      expect(remarkGfm).toBeDefined();
      expect(remarkMath).toBeDefined();
    });

    it("✓ should have rehype plugins installed", () => {
      expect(rehypeHighlight).toBeDefined();
      expect(rehypeSlug).toBeDefined();
      expect(rehypeAutolinkHeadings).toBeDefined();
    });

    it("✓ should have Tiptap packages installed", async () => {
      const tiptapReact = await import("@tiptap/react");
      const tiptapStarterKit = await import("@tiptap/starter-kit");
      const tiptapLink = await import("@tiptap/extension-link");

      expect(tiptapReact).toBeDefined();
      expect(tiptapStarterKit).toBeDefined();
      expect(tiptapLink).toBeDefined();
    });

    it("✓ should have configured withMDX in next.config.ts with plugins", async () => {
      const configPath = join(process.cwd(), "next.config.ts");
      const configContent = await readFile(configPath, "utf-8");

      expect(configContent).toContain("createMDX");
      expect(configContent).toContain("withMDX");
      expect(configContent).toContain("remark-gfm");
      expect(configContent).toContain("remark-math");
      expect(configContent).toContain("rehype-highlight");
      expect(configContent).toContain("rehype-slug");
      expect(configContent).toContain("rehype-autolink-headings");
    });

    it("✓ should allow MDX files to be imported and rendered", async () => {
      // Verify that MDX compilation works
      const testMdx = "# Test\n\nHello, MDX!";

      const compiled = await compile(testMdx, {
        remarkPlugins: [remarkGfm, remarkMath],
        rehypePlugins: [rehypeHighlight, rehypeSlug, rehypeAutolinkHeadings],
      });

      expect(compiled).toBeDefined();
      expect(compiled.value).toContain("Test");
      expect(compiled.value).toContain("Hello, MDX!");
    });
  });
});
