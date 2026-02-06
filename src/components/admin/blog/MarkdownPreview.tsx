"use client";

/**
 * MarkdownPreview Component
 *
 * Renders MDX content with syntax highlighting, auto-linked headings,
 * table of contents generation, responsive layout, and dark mode support.
 *
 * Features:
 * - MDX rendering with remark and rehype plugins
 * - Syntax highlighting via rehype-highlight
 * - Auto-linked headings with rehype-slug and rehype-autolink-headings
 * - Optional table of contents generation
 * - Responsive typography with Tailwind prose classes
 * - Dark mode support matching public blog styling
 *
 * @example
 * <MarkdownPreview
 *   content="# Hello World\n\nThis is **bold** text."
 *   showToc={true}
 * />
 */

import { useMemo, useRef } from "react";
import ReactMarkdown from "react-markdown";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

/**
 * Heading structure for table of contents
 */
interface TocHeading {
  id: string;
  text: string;
  level: number;
}

/**
 * MarkdownPreview component props
 */
interface MarkdownPreviewProps {
  /**
   * Markdown/MDX content to render
   */
  content: string;

  /**
   * Whether to show table of contents
   * @default false
   */
  showToc?: boolean;

  /**
   * Additional CSS classes for the container
   */
  className?: string;
}

/**
 * Extract headings from markdown content for TOC generation
 */
function extractHeadings(content: string): TocHeading[] {
  if (!content || typeof content !== "string") {
    return [];
  }

  const headingRegex = /^(#{2,4})\s+(.+)$/gm;
  const headings: TocHeading[] = [];

  let match = headingRegex.exec(content);
  while (match !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = generateSlug(text);

    headings.push({ id, text, level });
    match = headingRegex.exec(content);
  }

  return headings;
}

/**
 * Generate URL-safe slug from heading text
 */
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * MarkdownPreview Component
 */
export function MarkdownPreview({
  content,
  showToc = false,
  className = "",
}: MarkdownPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Extract headings for TOC
  const headings = useMemo(() => {
    if (!showToc) return [];
    return extractHeadings(content || "");
  }, [content, showToc]);

  // Sanitize content
  const sanitizedContent = useMemo(() => {
    if (!content || typeof content !== "string") {
      return "";
    }

    return content
      .replace(/<script[^>]*>.*?<\/script>/gi, "")
      .replace(/<iframe[^>]*>.*?<\/iframe>/gi, "")
      .replace(/<object[^>]*>.*?<\/object>/gi, "")
      .replace(/<embed[^>]*>/gi, "")
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
      .replace(/javascript:/gi, "");
  }, [content]);

  // Custom components for ReactMarkdown
  // Note: We let rehype-autolink-headings handle the anchor wrapping
  const components = useMemo(
    () => ({
      code: ({
        className,
        children,
        ...props
      }: React.HTMLProps<HTMLElement>) => {
        const match = /language-(\w+)/.exec(className || "");
        const isInline = !match;

        if (isInline) {
          return (
            <code className="inline-code" {...props}>
              {children}
            </code>
          );
        }

        return (
          <code className={className} {...props}>
            {children}
          </code>
        );
      },
      pre: ({ children, ...props }: React.HTMLProps<HTMLPreElement>) => {
        return (
          <pre className="code-block" {...props}>
            {children}
          </pre>
        );
      },
    }),
    [],
  );

  return (
    <div className={`markdown-preview-container ${className}`}>
      {showToc && headings.length > 0 && (
        <nav className="table-of-contents mb-8 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
            Table of Contents
          </h3>
          <TableOfContents headings={headings} />
        </nav>
      )}

      <div
        ref={containerRef}
        className="markdown-preview prose prose-neutral max-w-none dark:prose-invert prose-headings:font-semibold prose-headings:tracking-tight prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline dark:prose-a:text-blue-400 prose-code:rounded prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:text-sm prose-code:font-normal prose-code:before:content-none prose-code:after:content-none dark:prose-code:bg-gray-800 prose-pre:rounded-lg prose-pre:bg-gray-900 prose-pre:p-4 dark:prose-pre:bg-gray-950"
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[
            rehypeSlug,
            rehypeHighlight,
            [
              rehypeAutolinkHeadings,
              {
                behavior: "wrap",
                properties: {
                  className: ["heading-anchor"],
                },
              },
            ],
          ]}
          components={components}
        >
          {sanitizedContent}
        </ReactMarkdown>
      </div>
    </div>
  );
}

/**
 * TableOfContents Component
 * Renders hierarchical TOC from headings
 */
interface TableOfContentsProps {
  headings: TocHeading[];
}

function TableOfContents({ headings }: TableOfContentsProps) {
  if (!headings || headings.length === 0) {
    return null;
  }

  return (
    <div className="toc-tree">
      <ul className="space-y-2">
        {headings.map((heading) => (
          <li
            key={heading.id}
            className={
              heading.level === 2 ? "" : `ml-${(heading.level - 2) * 4}`
            }
          >
            <a
              href={`#${heading.id}`}
              className="toc-link block text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
