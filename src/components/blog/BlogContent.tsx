"use client";

import ReactMarkdown from "react-markdown";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import "highlight.js/styles/github-dark.css";

interface BlogContentProps {
  content: string;
  className?: string;
}

/**
 * BlogContent component renders MDX/Markdown content with comprehensive GFM support.
 *
 * Features:
 * - GitHub Flavored Markdown (tables, task lists, strikethrough, autolinks)
 * - Syntax highlighting for code blocks with language detection
 * - Auto-linked headings with anchor links
 * - Math rendering via remark-math
 * - Responsive images
 * - Proper styling for all GFM elements
 *
 * @param content - The markdown/MDX content to render
 * @param className - Optional additional CSS classes
 */
export function BlogContent({ content, className = "" }: BlogContentProps) {
  return (
    <article
      className={`prose prose-neutral dark:prose-invert max-w-none ${className}`}
    >
      <ReactMarkdown
        remarkPlugins={[
          remarkGfm, // GitHub Flavored Markdown support
          remarkMath, // Math equation support
        ]}
        rehypePlugins={[
          rehypeHighlight, // Syntax highlighting for code blocks
          rehypeSlug, // Add IDs to headings
          [
            rehypeAutolinkHeadings,
            {
              behavior: "wrap", // Wrap heading content in anchor link
              properties: {
                className: ["heading-anchor"],
              },
            },
          ], // Add anchor links to headings
        ]}
        components={{
          // Custom component overrides for better styling and functionality
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-6">
              <table
                className="min-w-full divide-y divide-gray-300 dark:divide-gray-700"
                {...props}
              />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-gray-50 dark:bg-gray-800" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th
              className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100"
              {...props}
            />
          ),
          td: ({ node, ...props }) => (
            <td
              className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300"
              {...props}
            />
          ),
          tr: ({ node, ...props }) => (
            <tr
              className="border-b border-gray-200 dark:border-gray-700"
              {...props}
            />
          ),
          img: ({ node, ...props }) => (
            // biome-ignore lint/a11y/useAltText: alt is provided via props spread
            <img
              className="rounded-lg shadow-md max-w-full h-auto my-6"
              loading="lazy"
              {...props}
            />
          ),
          code: ({ node, className, children, ...props }: any) => {
            // Handle inline code vs code blocks
            // Inline code doesn't have a language class (language-*)
            const isInline = !className || !className.startsWith("language-");

            if (isInline) {
              return (
                <code
                  className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-sm font-mono"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            // Code blocks are handled by rehype-highlight
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          pre: ({ node, ...props }) => (
            <pre
              className="rounded-lg overflow-x-auto my-6 p-4 bg-gray-900 dark:bg-gray-950"
              {...props}
            />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="border-l-4 border-gray-300 dark:border-gray-700 pl-4 my-6 italic text-gray-700 dark:text-gray-300"
              {...props}
            />
          ),
          a: ({ node, ...props }) => (
            <a
              className="text-blue-600 dark:text-blue-400 hover:underline"
              target={props.href?.startsWith("http") ? "_blank" : undefined}
              rel={
                props.href?.startsWith("http")
                  ? "noopener noreferrer"
                  : undefined
              }
              {...props}
            />
          ),
          h1: ({ node, ...props }) => (
            <h1
              className="text-4xl font-bold mt-8 mb-4 scroll-mt-20"
              {...props}
            />
          ),
          h2: ({ node, ...props }) => (
            <h2
              className="text-3xl font-bold mt-8 mb-4 scroll-mt-20"
              {...props}
            />
          ),
          h3: ({ node, ...props }) => (
            <h3
              className="text-2xl font-bold mt-6 mb-3 scroll-mt-20"
              {...props}
            />
          ),
          h4: ({ node, ...props }) => (
            <h4
              className="text-xl font-bold mt-6 mb-3 scroll-mt-20"
              {...props}
            />
          ),
          h5: ({ node, ...props }) => (
            <h5
              className="text-lg font-bold mt-4 mb-2 scroll-mt-20"
              {...props}
            />
          ),
          h6: ({ node, ...props }) => (
            <h6
              className="text-base font-bold mt-4 mb-2 scroll-mt-20"
              {...props}
            />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc list-inside my-4 space-y-2" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol
              className="list-decimal list-inside my-4 space-y-2"
              {...props}
            />
          ),
          li: ({ node, children, ...props }: any) => {
            // Check if this is a task list item
            const firstChild = Array.isArray(children) ? children[0] : children;
            if (
              typeof firstChild === "object" &&
              firstChild !== null &&
              "type" in firstChild &&
              firstChild.type === "input"
            ) {
              return (
                <li className="flex items-start gap-2 list-none" {...props}>
                  {children}
                </li>
              );
            }

            return (
              <li className="ml-4" {...props}>
                {children}
              </li>
            );
          },
          input: ({ node, ...props }) => {
            // Task list checkboxes
            if (props.type === "checkbox") {
              return (
                <input
                  className="mt-1 mr-2 rounded"
                  disabled
                  type="checkbox"
                  {...props}
                />
              );
            }
            return <input {...props} />;
          },
          hr: ({ node, ...props }) => (
            <hr
              className="my-8 border-t border-gray-300 dark:border-gray-700"
              {...props}
            />
          ),
          p: ({ node, ...props }) => (
            <p className="my-4 leading-relaxed" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}
