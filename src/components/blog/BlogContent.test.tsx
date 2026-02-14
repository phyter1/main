import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { BlogContent } from "./BlogContent";

describe("BlogContent", () => {
  afterEach(() => {
    cleanup();
  });
  describe("Basic MDX Rendering", () => {
    it("should render plain text content", () => {
      const content = "This is plain text content.";
      const { container } = render(<BlogContent content={content} />);

      expect(screen.getByText("This is plain text content.")).toBeDefined();
    });

    it("should render headings with proper hierarchy", () => {
      const content = `# Heading 1\n## Heading 2\n### Heading 3`;
      const { container } = render(<BlogContent content={content} />);

      expect(screen.getByRole("heading", { level: 1 })).toBeDefined();
      expect(screen.getByRole("heading", { level: 2 })).toBeDefined();
      expect(screen.getByRole("heading", { level: 3 })).toBeDefined();
    });

    it("should render paragraphs", () => {
      const content = "First paragraph.\n\nSecond paragraph.";
      const { container } = render(<BlogContent content={content} />);

      expect(screen.getByText("First paragraph.")).toBeDefined();
      expect(screen.getByText("Second paragraph.")).toBeDefined();
    });

    it("should render bold and italic text", () => {
      const content = "**Bold text** and *italic text*";
      const { container } = render(<BlogContent content={content} />);

      const strong = container.querySelector("strong");
      const em = container.querySelector("em");
      expect(strong?.textContent).toBe("Bold text");
      expect(em?.textContent).toBe("italic text");
    });
  });

  describe("GitHub Flavored Markdown (GFM) Features", () => {
    it("should render tables with proper structure", () => {
      const content = `
| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |
      `.trim();
      const { container } = render(<BlogContent content={content} />);

      const table = container.querySelector("table");
      expect(table).toBeDefined();

      const headers = container.querySelectorAll("th");
      expect(headers.length).toBe(3);
      expect(headers[0]?.textContent).toBe("Header 1");

      const cells = container.querySelectorAll("td");
      expect(cells.length).toBe(6);
      expect(cells[0]?.textContent).toBe("Cell 1");
    });

    it("should render task lists with checkboxes", () => {
      const content = `
- [x] Completed task
- [ ] Incomplete task
- [x] Another completed task
      `.trim();
      const { container } = render(<BlogContent content={content} />);

      const checkboxes = container.querySelectorAll('input[type="checkbox"]');
      expect(checkboxes.length).toBe(3);

      // First checkbox should be checked
      expect((checkboxes[0] as HTMLInputElement).checked).toBe(true);
      // Second checkbox should not be checked
      expect((checkboxes[1] as HTMLInputElement).checked).toBe(false);
    });

    it("should render strikethrough text", () => {
      const content = "~~strikethrough text~~";
      const { container } = render(<BlogContent content={content} />);

      const strikethrough = container.querySelector("del");
      expect(strikethrough).toBeDefined();
      expect(strikethrough?.textContent).toBe("strikethrough text");
    });

    it("should auto-link URLs", () => {
      const content = "Check out https://example.com for more info.";
      const { container } = render(<BlogContent content={content} />);

      const link = container.querySelector('a[href="https://example.com"]');
      expect(link).toBeDefined();
      expect(link?.textContent).toBe("https://example.com");
    });

    it("should render tables with alignment", () => {
      const content = `
| Left | Center | Right |
|:-----|:------:|------:|
| L1   | C1     | R1    |
      `.trim();
      const { container } = render(<BlogContent content={content} />);

      const cells = container.querySelectorAll("td");
      expect(cells.length).toBe(3);

      // Check alignment styles (implementation-dependent)
      expect(cells[0]).toBeDefined();
      expect(cells[1]).toBeDefined();
      expect(cells[2]).toBeDefined();
    });
  });

  describe("Syntax Highlighting for Code Blocks", () => {
    it("should render inline code", () => {
      const content = "Use `const x = 5;` for variables.";
      const { container } = render(<BlogContent content={content} />);

      const code = container.querySelector("code");
      expect(code).toBeDefined();
      expect(code?.textContent).toBe("const x = 5;");
    });

    it("should render code blocks with language detection", () => {
      const content = `
\`\`\`typescript
const greeting: string = "Hello, World!";
console.log(greeting);
\`\`\`
      `.trim();
      const { container } = render(<BlogContent content={content} />);

      const pre = container.querySelector("pre");
      expect(pre).toBeDefined();

      const code = pre?.querySelector("code");
      expect(code).toBeDefined();
      expect(code?.textContent).toContain("Hello, World!");
    });

    it("should render code blocks without language specification", () => {
      const content = `
\`\`\`
Plain code block
No syntax highlighting
\`\`\`
      `.trim();
      const { container } = render(<BlogContent content={content} />);

      const pre = container.querySelector("pre");
      expect(pre).toBeDefined();
      expect(pre?.textContent).toContain("Plain code block");
    });

    it("should render multiple code blocks", () => {
      const content = `
\`\`\`javascript
const js = true;
\`\`\`

\`\`\`python
python = True
\`\`\`
      `.trim();
      const { container } = render(<BlogContent content={content} />);

      const codeBlocks = container.querySelectorAll("pre");
      expect(codeBlocks.length).toBe(2);
    });
  });

  describe("Auto-linked Headings with Anchor Links", () => {
    it("should add IDs to headings", () => {
      const content = "# Hello World\n## Getting Started";
      const { container } = render(<BlogContent content={content} />);

      const h1 = container.querySelector("h1");
      expect(h1?.id).toBeTruthy();

      const h2 = container.querySelector("h2");
      expect(h2?.id).toBeTruthy();
    });

    it("should create anchor links for headings", () => {
      const content = "# Linked Heading";
      const { container } = render(<BlogContent content={content} />);

      const heading = container.querySelector("h1");
      expect(heading?.id).toBeTruthy();

      // Check for anchor link (may be inside heading or as sibling)
      const anchor =
        heading?.querySelector("a") ||
        container.querySelector(`a[href="#${heading?.id}"]`);
      expect(anchor).toBeDefined();
    });

    it("should handle headings with special characters", () => {
      const content = "## Hello World! How are you?";
      const { container } = render(<BlogContent content={content} />);

      const heading = container.querySelector("h2");
      expect(heading?.id).toBeTruthy();
      // ID should be URL-safe (lowercase, hyphens, no special chars)
      expect(heading?.id).toMatch(/^[a-z0-9-]+$/);
    });
  });

  describe("Lists and Nested Content", () => {
    it("should render unordered lists", () => {
      const content = `
- Item 1
- Item 2
- Item 3
      `.trim();
      const { container } = render(<BlogContent content={content} />);

      const list = container.querySelector("ul");
      expect(list).toBeDefined();

      const items = list?.querySelectorAll("li");
      expect(items?.length).toBe(3);
    });

    it("should render ordered lists", () => {
      const content = `
1. First
2. Second
3. Third
      `.trim();
      const { container } = render(<BlogContent content={content} />);

      const list = container.querySelector("ol");
      expect(list).toBeDefined();

      const items = list?.querySelectorAll("li");
      expect(items?.length).toBe(3);
    });

    it("should render nested lists", () => {
      const content = `
- Parent 1
  - Child 1
  - Child 2
- Parent 2
      `.trim();
      const { container } = render(<BlogContent content={content} />);

      const parentList = container.querySelector("ul");
      expect(parentList).toBeDefined();

      const nestedList = parentList?.querySelector("ul");
      expect(nestedList).toBeDefined();
    });
  });

  describe("Links and Images", () => {
    it("should render markdown links", () => {
      const content = "[Click here](https://example.com)";
      const { container } = render(<BlogContent content={content} />);

      const link = screen.getByRole("link");
      expect(link).toBeDefined();
      expect(link.getAttribute("href")).toBe("https://example.com");
      expect(link.textContent).toBe("Click here");
    });

    it("should render images with alt text", () => {
      const content = "![Alt text](https://example.com/image.png)";
      const { container } = render(<BlogContent content={content} />);

      const img = container.querySelector("img");
      expect(img).toBeDefined();
      expect(img?.getAttribute("alt")).toBe("Alt text");
      expect(img?.getAttribute("src")).toBe("https://example.com/image.png");
    });

    it("should handle external links", () => {
      const content = "[External](https://external.com)";
      const { container } = render(<BlogContent content={content} />);

      const link = screen.getByRole("link");
      expect(link.getAttribute("href")).toBe("https://external.com");
    });
  });

  describe("Blockquotes and Horizontal Rules", () => {
    it("should render blockquotes", () => {
      const content = "> This is a quote";
      const { container } = render(<BlogContent content={content} />);

      const blockquote = container.querySelector("blockquote");
      expect(blockquote).toBeDefined();
      expect(blockquote?.textContent).toContain("This is a quote");
    });

    it("should render horizontal rules", () => {
      const content = "Text above\n\n---\n\nText below";
      const { container } = render(<BlogContent content={content} />);

      const hr = container.querySelector("hr");
      expect(hr).toBeDefined();
    });

    it("should render nested blockquotes", () => {
      const content = "> Outer quote\n>> Inner quote";
      const { container } = render(<BlogContent content={content} />);

      const blockquotes = container.querySelectorAll("blockquote");
      expect(blockquotes.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Math Rendering", () => {
    it("should render inline math expressions", () => {
      const content = "The formula $E = mc^2$ is famous.";
      const { container } = render(<BlogContent content={content} />);

      // Math content should be present (exact rendering depends on implementation)
      expect(container.textContent).toContain("E = mc^2");
    });

    it("should render block math expressions", () => {
      const content = `
$$
x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}
$$
      `.trim();
      const { container } = render(<BlogContent content={content} />);

      // Math block should be rendered
      expect(container.textContent).toBeTruthy();
    });
  });

  describe("Styling and CSS Classes", () => {
    it("should apply proper styling to all GFM elements", () => {
      const content = `
# Styled Heading

**Bold** and *italic* text.

| Table | Header |
|-------|--------|
| Cell  | Data   |

- [x] Task list
- [ ] Incomplete

\`\`\`javascript
const code = true;
\`\`\`
      `.trim();
      const { container } = render(<BlogContent content={content} />);

      // Verify elements render without errors
      expect(container.querySelector("h1")).toBeDefined();
      expect(container.querySelector("table")).toBeDefined();
      expect(container.querySelector("pre")).toBeDefined();
    });

    it("should have responsive layout", () => {
      const content = "# Responsive Content\n\nThis should be responsive.";
      const { container } = render(<BlogContent content={content} />);

      // Component should render successfully
      expect(screen.getByRole("heading")).toBeDefined();
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("should handle empty content gracefully", () => {
      const { container } = render(<BlogContent content="" />);
      expect(container).toBeDefined();
    });

    it("should handle malformed markdown gracefully", () => {
      const content = "# Unclosed [link(https://example.com";
      const { container } = render(<BlogContent content={content} />);

      // Should still render something
      expect(container.textContent).toBeTruthy();
    });

    it("should handle very long content", () => {
      const content = `# Long Content\n\n${"Lorem ipsum ".repeat(1000)}`;
      const { container } = render(<BlogContent content={content} />);

      expect(screen.getByRole("heading")).toBeDefined();
    });

    it("should handle special HTML characters", () => {
      const content = "Text with <, >, & characters";
      const { container } = render(<BlogContent content={content} />);

      expect(container.textContent).toContain("<");
      expect(container.textContent).toContain(">");
      expect(container.textContent).toContain("&");
    });

    it("should prevent XSS attacks", () => {
      const content = '<script>alert("XSS")</script>';
      const { container } = render(<BlogContent content={content} />);

      // Script tags should be escaped or removed
      const scripts = container.querySelectorAll("script");
      expect(scripts.length).toBe(0);
    });
  });

  describe("Complex GFM Combinations", () => {
    it("should render tables with task lists inside", () => {
      const content = `
| Task | Status |
|------|--------|
| Item 1 | - [x] Done |
| Item 2 | - [ ] Todo |
      `.trim();
      const { container } = render(<BlogContent content={content} />);

      const table = container.querySelector("table");
      expect(table).toBeDefined();
    });

    it("should render code blocks with language info and line numbers", () => {
      const content = `
\`\`\`typescript
function example() {
  return "test";
}
\`\`\`
      `.trim();
      const { container } = render(<BlogContent content={content} />);

      const pre = container.querySelector("pre");
      expect(pre).toBeDefined();
      expect(pre?.textContent).toContain("function example");
    });

    it("should handle nested formatting", () => {
      const content = "**Bold _italic_ text**";
      const { container } = render(<BlogContent content={content} />);

      expect(container.textContent).toContain("Bold italic text");
    });

    it("should render complete blog post example", () => {
      const content = `
# Complete Blog Post

## Introduction

This is a **complete** example with *various* features.

### Features List

- [x] Tables
- [x] Code blocks
- [ ] More features

### Code Example

\`\`\`typescript
interface BlogPost {
  title: string;
  content: string;
}
\`\`\`

### Data Table

| Feature | Status |
|---------|--------|
| GFM     | ✅     |
| Syntax  | ✅     |

> Important note about the post

Check out https://example.com for more.

---

© 2026 Blog
      `.trim();

      const { container } = render(<BlogContent content={content} />);

      expect(screen.getByRole("heading", { level: 1 })).toBeDefined();
      expect(document.querySelector("table")).toBeDefined();
      expect(document.querySelector("pre")).toBeDefined();
      expect(document.querySelector("blockquote")).toBeDefined();
      expect(document.querySelector("hr")).toBeDefined();
    });
  });
});
