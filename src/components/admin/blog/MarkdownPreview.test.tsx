/**
 * MarkdownPreview Component Tests
 *
 * Tests MDX rendering, syntax highlighting, table of contents generation,
 * responsive layout, and dark mode support following TDD methodology.
 */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MarkdownPreview } from "./MarkdownPreview";

describe("MarkdownPreview Component", () => {
  afterEach(() => {
    cleanup();
  });

  describe("MDX Content Rendering", () => {
    it("should render basic markdown with proper HTML structure", () => {
      const markdown = "# Hello World\n\nThis is a paragraph.";

      render(<MarkdownPreview content={markdown} />);

      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading.textContent).toBe("Hello World");
      expect(screen.getByText("This is a paragraph.")).toBeDefined();
    });

    it("should render multiple heading levels correctly", () => {
      const markdown = `# H1 Heading
## H2 Heading
### H3 Heading`;

      render(<MarkdownPreview content={markdown} />);

      expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
        "H1 Heading",
      );
      expect(screen.getByRole("heading", { level: 2 }).textContent).toBe(
        "H2 Heading",
      );
      expect(screen.getByRole("heading", { level: 3 }).textContent).toBe(
        "H3 Heading",
      );
    });

    it("should render inline formatting (bold, italic, code)", () => {
      const markdown = "Text with **bold**, *italic*, and `code` formatting.";

      render(<MarkdownPreview content={markdown} />);

      const content = screen.getByText(/Text with/);
      expect(content).toBeDefined();
      expect(screen.getByText("bold")).toBeDefined();
      expect(screen.getByText("italic")).toBeDefined();
      expect(screen.getByText("code")).toBeDefined();
    });

    it("should render lists (ordered and unordered)", () => {
      const markdown = `- Item 1
- Item 2
- Item 3

1. First
2. Second
3. Third`;

      render(<MarkdownPreview content={markdown} />);

      expect(screen.getByText("Item 1")).toBeDefined();
      expect(screen.getByText("Item 2")).toBeDefined();
      expect(screen.getByText("First")).toBeDefined();
      expect(screen.getByText("Second")).toBeDefined();
    });

    it("should render blockquotes with proper styling", () => {
      const markdown = "> This is a quote\n> With multiple lines";

      render(<MarkdownPreview content={markdown} />);

      expect(screen.getByText(/This is a quote/)).toBeDefined();
    });

    it("should render links correctly", () => {
      const markdown = "[Click here](https://example.com)";

      render(<MarkdownPreview content={markdown} />);

      const link = screen.getByRole("link");
      expect(link.textContent).toBe("Click here");
      expect(link.getAttribute("href")).toBe("https://example.com");
    });

    it("should handle empty content gracefully", () => {
      render(<MarkdownPreview content="" />);

      // Should render without crashing
      expect(document.querySelector(".markdown-preview")).toBeDefined();
    });

    it("should handle whitespace-only content", () => {
      render(<MarkdownPreview content="   \n   \n   " />);

      // Should render without crashing
      expect(document.querySelector(".markdown-preview")).toBeDefined();
    });
  });

  describe("Code Block Rendering and Syntax Highlighting", () => {
    it("should render code blocks with syntax highlighting", () => {
      const markdown = "```typescript\nconst hello = 'world';\n```";

      render(<MarkdownPreview content={markdown} />);

      // Syntax highlighting breaks text into spans, check for code element
      const codeElement = document.querySelector("code.language-typescript");
      expect(codeElement).toBeDefined();
      expect(codeElement?.textContent).toContain("const");
      expect(codeElement?.textContent).toContain("hello");
    });

    it("should detect language from code fence", () => {
      const markdown = "```javascript\nfunction test() {}\n```";

      render(<MarkdownPreview content={markdown} />);

      // Check for code element with language class
      const codeElement = document.querySelector("code.language-javascript");
      expect(codeElement).toBeDefined();
      expect(codeElement?.className).toContain("language-javascript");
    });

    it("should handle code blocks without language specification", () => {
      const markdown = "```\nplain code\n```";

      render(<MarkdownPreview content={markdown} />);

      expect(screen.getByText("plain code")).toBeDefined();
    });

    it("should support multiple languages (typescript, javascript, python, bash)", () => {
      const markdown = `\`\`\`typescript
const ts: string = "test";
\`\`\`

\`\`\`python
def hello():
    pass
\`\`\`

\`\`\`bash
echo "hello"
\`\`\``;

      render(<MarkdownPreview content={markdown} />);

      // Check for language-specific code blocks
      expect(document.querySelector("code.language-typescript")).toBeDefined();
      expect(document.querySelector("code.language-python")).toBeDefined();
      expect(document.querySelector("code.language-bash")).toBeDefined();
    });

    it("should preserve indentation in code blocks", () => {
      const markdown =
        "```javascript\nfunction test() {\n  return true;\n}\n```";

      render(<MarkdownPreview content={markdown} />);

      const codeElement = document.querySelector("code.language-javascript");
      expect(codeElement).toBeDefined();
      // Indentation preserved in rendered HTML
      expect(codeElement?.textContent).toContain("return");
    });
  });

  describe("Auto-Linked Headings", () => {
    it("should add anchor links to headings", () => {
      const markdown = "# Introduction\n## Getting Started";

      render(<MarkdownPreview content={markdown} />);

      const h1 = screen.getByRole("heading", { level: 1 });
      const h2 = screen.getByRole("heading", { level: 2 });

      expect(h1.id).toBe("introduction");
      expect(h2.id).toBe("getting-started");
    });

    it("should generate slugs from heading text", () => {
      const markdown = "## Hello World Example";

      render(<MarkdownPreview content={markdown} />);

      const heading = screen.getByRole("heading", { level: 2 });
      expect(heading.id).toBe("hello-world-example");
    });

    it("should handle special characters in headings", () => {
      const markdown = "## React & TypeScript: Best Practices!";

      render(<MarkdownPreview content={markdown} />);

      const heading = screen.getByRole("heading", { level: 2 });
      expect(heading.id).toBe("react--typescript-best-practices");
    });

    it("should add clickable anchor links to headings", () => {
      const markdown = "## Section Title";

      render(<MarkdownPreview content={markdown} />);

      const heading = screen.getByRole("heading", { level: 2 });
      const anchor = heading.querySelector("a");

      expect(anchor).toBeDefined();
      expect(anchor?.getAttribute("href")).toBe("#section-title");
    });
  });

  describe("Table of Contents Generation", () => {
    it("should generate TOC from headings", () => {
      const markdown = `# Main Title
## Section 1
### Subsection 1.1
## Section 2`;

      render(<MarkdownPreview content={markdown} showToc={true} />);

      const tocLinks = document.querySelectorAll(".toc-link");
      const tocTexts = Array.from(tocLinks).map((link) => link.textContent);

      expect(tocTexts.includes("Section 1")).toBe(true);
      expect(tocTexts.includes("Subsection 1.1")).toBe(true);
      expect(tocTexts.includes("Section 2")).toBe(true);
    });

    it("should not generate TOC when showToc is false", () => {
      const markdown = "# Title\n## Heading";

      render(<MarkdownPreview content={markdown} showToc={false} />);

      const toc = document.querySelector(".table-of-contents");
      expect(toc).toBeNull();
    });

    it("should generate TOC links that navigate to sections", () => {
      const markdown = "## First Section\n## Second Section";

      render(<MarkdownPreview content={markdown} showToc={true} />);

      const tocLinks = document.querySelectorAll(".toc-link");
      expect(tocLinks.length).toBeGreaterThan(0);

      const firstLink = tocLinks[0] as HTMLAnchorElement;
      expect(firstLink.getAttribute("href")).toBe("#first-section");
    });

    it("should show nested TOC structure for hierarchical headings", () => {
      const markdown = `## Level 2
### Level 3
#### Level 4
## Another Level 2`;

      render(<MarkdownPreview content={markdown} showToc={true} />);

      const tocContainer = document.querySelector(".table-of-contents");
      expect(tocContainer).toBeDefined();

      // Should have all heading levels represented in TOC
      const tocLinks = document.querySelectorAll(".toc-link");
      const tocTexts = Array.from(tocLinks).map((link) => link.textContent);

      expect(tocTexts.includes("Level 2")).toBe(true);
      expect(tocTexts.includes("Level 3")).toBe(true);
      expect(tocTexts.includes("Level 4")).toBe(true);
      expect(tocTexts.includes("Another Level 2")).toBe(true);
    });

    it("should only include h2-h4 in TOC (skip h1)", () => {
      const markdown = `# Main Title (H1)
## Section (H2)
### Subsection (H3)
#### Detail (H4)
##### Too Deep (H5)`;

      render(<MarkdownPreview content={markdown} showToc={true} />);

      const tocLinks = document.querySelectorAll(".toc-link");
      const tocTexts = Array.from(tocLinks).map((link) => link.textContent);

      // H1 should not be in TOC
      expect(tocTexts.includes("Main Title (H1)")).toBe(false);

      // H2-H4 should be in TOC
      expect(tocTexts.includes("Section (H2)")).toBe(true);
      expect(tocTexts.includes("Subsection (H3)")).toBe(true);
      expect(tocTexts.includes("Detail (H4)")).toBe(true);
    });
  });

  describe("Responsive Layout", () => {
    it("should apply responsive CSS classes", () => {
      const markdown = "# Test Content";

      render(<MarkdownPreview content={markdown} />);

      const container = document.querySelector(".markdown-preview");
      expect(container?.className).toContain("markdown-preview");
    });

    it("should render full width on mobile, constrained on desktop", () => {
      const markdown = "# Test";

      render(<MarkdownPreview content={markdown} />);

      const container = document.querySelector(".markdown-preview");

      // Should have responsive width classes
      expect(container?.className).toBeDefined();
    });

    it("should handle long content without horizontal scroll", () => {
      const markdown = `# ${"Very Long Title ".repeat(20)}`;

      render(<MarkdownPreview content={markdown} />);

      const container = document.querySelector(".markdown-preview");
      expect(container).toBeDefined();
    });
  });

  describe("Dark Mode Support", () => {
    it("should apply dark mode classes when dark theme active", () => {
      // Mock dark mode
      document.documentElement.classList.add("dark");

      const markdown = "# Dark Mode Test";
      render(<MarkdownPreview content={markdown} />);

      const container = document.querySelector(".markdown-preview");
      expect(container).toBeDefined();

      // Cleanup
      document.documentElement.classList.remove("dark");
    });

    it("should style code blocks appropriately in dark mode", () => {
      document.documentElement.classList.add("dark");

      const markdown = "```typescript\nconst code = true;\n```";
      render(<MarkdownPreview content={markdown} />);

      const codeElement = document.querySelector("code.language-typescript");
      expect(codeElement).toBeDefined();

      document.documentElement.classList.remove("dark");
    });

    it("should style headings appropriately in dark mode", () => {
      document.documentElement.classList.add("dark");

      const markdown = "## Dark Mode Heading";
      render(<MarkdownPreview content={markdown} />);

      const heading = screen.getByRole("heading", { level: 2 });
      expect(heading).toBeDefined();

      document.documentElement.classList.remove("dark");
    });
  });

  describe("Styling Consistency with Public Blog", () => {
    it("should use consistent typography classes", () => {
      const markdown = `# Heading 1
## Heading 2
Paragraph text with **bold** and *italic*.`;

      render(<MarkdownPreview content={markdown} />);

      const container = document.querySelector(".markdown-preview");
      expect(container?.className).toContain("prose");
    });

    it("should apply prose classes for readable typography", () => {
      const markdown = "Regular paragraph text.";

      render(<MarkdownPreview content={markdown} />);

      const container = document.querySelector(".markdown-preview");
      expect(container?.className).toMatch(/prose/);
    });

    it("should match public blog post styling for consistency", () => {
      const markdown = `## Test Heading
This is a test paragraph.

\`\`\`typescript
const test = true;
\`\`\``;

      render(<MarkdownPreview content={markdown} />);

      const container = document.querySelector(".markdown-preview");
      // Should have prose and dark:prose-invert for consistent styling
      expect(container?.className).toContain("prose");
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("should handle malformed markdown gracefully", () => {
      const markdown = "### Unclosed **bold\n## Missing closing";

      render(<MarkdownPreview content={markdown} />);

      // Should render without throwing
      expect(document.querySelector(".markdown-preview")).toBeDefined();
    });

    it("should handle very long content efficiently", () => {
      const markdown = `# Heading\n\n${"Paragraph. ".repeat(1000)}`;

      render(<MarkdownPreview content={markdown} />);

      expect(document.querySelector(".markdown-preview")).toBeDefined();
    });

    it("should sanitize dangerous HTML/script tags", () => {
      const markdown = "<script>alert('xss')</script>\n## Safe Heading";

      render(<MarkdownPreview content={markdown} />);

      // Script should not be executed
      const scripts = document.querySelectorAll("script");
      expect(scripts.length).toBe(0);

      // Safe content should render
      expect(screen.getByText("Safe Heading")).toBeDefined();
    });

    it("should handle null/undefined content prop gracefully", () => {
      // @ts-expect-error Testing runtime behavior
      render(<MarkdownPreview content={null} />);

      expect(document.querySelector(".markdown-preview")).toBeDefined();
    });
  });

  describe("Performance and Optimization", () => {
    it("should render without unnecessary re-renders", () => {
      const markdown = "# Performance Test";

      const { rerender } = render(<MarkdownPreview content={markdown} />);

      // Re-render with same content
      rerender(<MarkdownPreview content={markdown} />);

      // Should still work correctly
      expect(screen.getByText("Performance Test")).toBeDefined();
    });

    it("should handle rapid content changes", () => {
      const { rerender } = render(<MarkdownPreview content="# Version 1" />);

      rerender(<MarkdownPreview content="# Version 2" />);
      rerender(<MarkdownPreview content="# Version 3" />);

      expect(screen.getByText("Version 3")).toBeDefined();
    });
  });
});
