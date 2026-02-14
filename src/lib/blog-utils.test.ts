import { describe, expect, it } from "vitest";
import {
  calculateReadingTime,
  formatDate,
  generateSlug,
  sanitizeMarkdown,
  validateSlug,
} from "./blog-utils";

describe("Blog Utilities", () => {
  describe("generateSlug", () => {
    describe("Basic Slug Generation", () => {
      it("should convert title to lowercase", () => {
        const result = generateSlug("Hello World");
        expect(result).toBe("hello-world");
      });

      it("should replace spaces with hyphens", () => {
        const result = generateSlug("This is a test");
        expect(result).toBe("this-is-a-test");
      });

      it("should handle multiple spaces", () => {
        const result = generateSlug("Multiple   spaces   here");
        expect(result).toBe("multiple-spaces-here");
      });

      it("should remove leading and trailing spaces", () => {
        const result = generateSlug("  trimmed title  ");
        expect(result).toBe("trimmed-title");
      });
    });

    describe("Special Characters", () => {
      it("should remove special characters", () => {
        const result = generateSlug("Hello@World!Test#");
        expect(result).toBe("helloworldtest");
      });

      it("should handle punctuation", () => {
        const result = generateSlug("What's your experience?");
        expect(result).toBe("whats-your-experience");
      });

      it("should preserve numbers", () => {
        const result = generateSlug("Top 10 JavaScript Tips");
        expect(result).toBe("top-10-javascript-tips");
      });

      it("should handle mixed special characters and spaces", () => {
        const result = generateSlug("React.js & TypeScript: Best Practices!");
        expect(result).toBe("reactjs-typescript-best-practices");
      });
    });

    describe("Unicode and Non-ASCII", () => {
      it("should handle accented characters", () => {
        const result = generateSlug("Café résumé naïve");
        expect(result).toBe("cafe-resume-naive");
      });

      it("should handle emoji", () => {
        const result = generateSlug("JavaScript Tips 🚀 and Tricks");
        expect(result).toBe("javascript-tips-and-tricks");
      });

      it("should handle mixed unicode", () => {
        const result = generateSlug("Testing ñ ü ö characters");
        expect(result).toBe("testing-n-u-o-characters");
      });
    });

    describe("Edge Cases", () => {
      it("should handle empty string", () => {
        const result = generateSlug("");
        expect(result).toBe("");
      });

      it("should handle only special characters", () => {
        const result = generateSlug("@#$%^&*()");
        expect(result).toBe("");
      });

      it("should not create double hyphens", () => {
        const result = generateSlug("Hello -- World");
        expect(result).toBe("hello-world");
      });

      it("should not have leading or trailing hyphens", () => {
        const result = generateSlug("-Leading and Trailing-");
        expect(result).toBe("leading-and-trailing");
      });

      it("should handle very long titles", () => {
        const longTitle =
          "This is a very long blog post title that should be truncated to a reasonable length for URL purposes";
        const result = generateSlug(longTitle);
        expect(result.length).toBeLessThanOrEqual(200);
        expect(result).not.toMatch(/^-/);
        expect(result).not.toMatch(/-$/);
      });
    });
  });

  describe("calculateReadingTime", () => {
    describe("Basic Reading Time Calculation", () => {
      it("should calculate reading time for short content (1 min)", () => {
        const content = "word ".repeat(200); // 200 words
        const result = calculateReadingTime(content);
        expect(result).toBe(1);
      });

      it("should calculate reading time for medium content", () => {
        const content = "word ".repeat(600); // 600 words
        const result = calculateReadingTime(content);
        expect(result).toBe(3);
      });

      it("should calculate reading time for long content", () => {
        const content = "word ".repeat(1000); // 1000 words
        const result = calculateReadingTime(content);
        expect(result).toBe(5);
      });

      it("should round up partial minutes", () => {
        const content = "word ".repeat(250); // 250 words (1.25 min)
        const result = calculateReadingTime(content);
        expect(result).toBe(2);
      });
    });

    describe("Content Type Handling", () => {
      it("should handle content with punctuation", () => {
        const content =
          "Hello, world! This is a test. How are you? I'm fine, thanks.";
        const result = calculateReadingTime(content);
        expect(result).toBeGreaterThanOrEqual(1);
      });

      it("should handle content with numbers", () => {
        const content =
          "In 2024, there were 100 developers working on 50 projects with 200 features.";
        const result = calculateReadingTime(content);
        expect(result).toBeGreaterThanOrEqual(1);
      });

      it("should handle content with code blocks", () => {
        const content = `
          const greeting = "Hello, world!";
          console.log(greeting);
          function test() { return true; }
        `;
        const result = calculateReadingTime(content);
        expect(result).toBeGreaterThanOrEqual(1);
      });

      it("should handle markdown content", () => {
        const content = `
          # Heading

          This is a **bold** and *italic* text.

          - List item 1
          - List item 2

          [Link](https://example.com)
        `;
        const result = calculateReadingTime(content);
        expect(result).toBeGreaterThanOrEqual(1);
      });
    });

    describe("Edge Cases", () => {
      it("should return 1 for empty content", () => {
        const result = calculateReadingTime("");
        expect(result).toBe(1);
      });

      it("should return 1 for whitespace-only content", () => {
        const result = calculateReadingTime("   \n\t  ");
        expect(result).toBe(1);
      });

      it("should return 1 for very short content", () => {
        const result = calculateReadingTime("Hello world");
        expect(result).toBe(1);
      });

      it("should handle multiple spaces between words", () => {
        const content = "word    word    word";
        const result = calculateReadingTime(content);
        expect(result).toBe(1);
      });

      it("should handle newlines and tabs", () => {
        const content = "word\nword\tword\r\nword";
        const result = calculateReadingTime(content);
        expect(result).toBe(1);
      });
    });

    describe("Reading Speed Assumption", () => {
      it("should use 200 words per minute as baseline", () => {
        const content = "word ".repeat(400); // 400 words
        const result = calculateReadingTime(content);
        expect(result).toBe(2); // 400 words / 200 wpm = 2 minutes
      });

      it("should handle exactly 200 words", () => {
        const content = "word ".repeat(200);
        const result = calculateReadingTime(content);
        expect(result).toBe(1);
      });
    });
  });

  describe("formatDate", () => {
    describe("Basic Date Formatting", () => {
      it("should format date as 'MMM dd, yyyy'", () => {
        const timestamp = new Date("2024-01-15T12:00:00Z").getTime();
        const result = formatDate(timestamp);
        expect(result).toBe("Jan 15, 2024");
      });

      it("should format different months correctly", () => {
        const dates = [
          {
            timestamp: new Date("2024-03-20T12:00:00Z").getTime(),
            expected: "Mar 20, 2024",
          },
          {
            timestamp: new Date("2024-06-10T12:00:00Z").getTime(),
            expected: "Jun 10, 2024",
          },
          {
            timestamp: new Date("2024-12-25T12:00:00Z").getTime(),
            expected: "Dec 25, 2024",
          },
        ];

        for (const { timestamp, expected } of dates) {
          expect(formatDate(timestamp)).toBe(expected);
        }
      });

      it("should handle single-digit days", () => {
        const timestamp = new Date("2024-05-05T12:00:00Z").getTime();
        const result = formatDate(timestamp);
        expect(result).toBe("May 05, 2024");
      });

      it("should handle end of month", () => {
        const timestamp = new Date("2024-01-31T12:00:00Z").getTime();
        const result = formatDate(timestamp);
        expect(result).toBe("Jan 31, 2024");
      });
    });

    describe("Different Years", () => {
      it("should format dates from different years", () => {
        const dates = [
          {
            timestamp: new Date("2020-01-01T12:00:00Z").getTime(),
            expected: "Jan 01, 2020",
          },
          {
            timestamp: new Date("2023-12-31T12:00:00Z").getTime(),
            expected: "Dec 31, 2023",
          },
          {
            timestamp: new Date("2025-06-15T12:00:00Z").getTime(),
            expected: "Jun 15, 2025",
          },
        ];

        for (const { timestamp, expected } of dates) {
          expect(formatDate(timestamp)).toBe(expected);
        }
      });
    });

    describe("Edge Cases", () => {
      it("should handle timestamp 0 (Unix epoch)", () => {
        const result = formatDate(0);
        // Unix epoch is Jan 1, 1970 00:00:00 UTC, but displays in local timezone
        // PST is UTC-8, so it shows Dec 31, 1969 16:00:00
        expect(result).toMatch(/(?:Dec 31, 1969|Jan 01, 1970)/);
      });

      it("should handle negative timestamps", () => {
        const timestamp = new Date("1969-12-31T12:00:00Z").getTime();
        const result = formatDate(timestamp);
        expect(result).toBe("Dec 31, 1969");
      });

      it("should handle future dates", () => {
        const timestamp = new Date("2030-12-25T12:00:00Z").getTime();
        const result = formatDate(timestamp);
        expect(result).toBe("Dec 25, 2030");
      });

      it("should handle Date object input", () => {
        const date = new Date("2024-07-04T12:00:00Z");
        const result = formatDate(date);
        expect(result).toBe("Jul 04, 2024");
      });

      it("should handle string date input", () => {
        const dateString = "2024-08-15T12:00:00Z";
        const result = formatDate(dateString);
        expect(result).toBe("Aug 15, 2024");
      });
    });
  });

  describe("sanitizeMarkdown", () => {
    describe("Basic Sanitization", () => {
      it("should preserve valid markdown", () => {
        const content = "# Heading\n\nThis is **bold** and *italic*.";
        const result = sanitizeMarkdown(content);
        expect(result).toBe(content);
      });

      it("should preserve links", () => {
        const content = "[Link text](https://example.com)";
        const result = sanitizeMarkdown(content);
        expect(result).toBe(content);
      });

      it("should preserve code blocks", () => {
        const content = "```javascript\nconst x = 42;\n```";
        const result = sanitizeMarkdown(content);
        expect(result).toBe(content);
      });

      it("should preserve lists", () => {
        const content = "- Item 1\n- Item 2\n- Item 3";
        const result = sanitizeMarkdown(content);
        expect(result).toBe(content);
      });
    });

    describe("Script Injection Prevention", () => {
      it("should remove script tags", () => {
        const content = "Hello <script>alert('xss')</script> world";
        const result = sanitizeMarkdown(content);
        expect(result).not.toContain("<script>");
        expect(result).not.toContain("alert");
      });

      it("should remove inline JavaScript", () => {
        const content = "Click <a href=\"javascript:alert('xss')\">here</a>";
        const result = sanitizeMarkdown(content);
        expect(result).not.toContain("javascript:");
      });

      it("should remove event handlers", () => {
        const content = '<img src="x" onerror="alert(\'xss\')">';
        const result = sanitizeMarkdown(content);
        expect(result).not.toContain("onerror");
      });

      it("should remove iframe tags", () => {
        const content = 'Content <iframe src="evil.com"></iframe> here';
        const result = sanitizeMarkdown(content);
        expect(result).not.toContain("<iframe>");
      });

      it("should remove object tags", () => {
        const content = '<object data="evil.swf"></object>';
        const result = sanitizeMarkdown(content);
        expect(result).not.toContain("<object>");
      });

      it("should remove embed tags", () => {
        const content = '<embed src="evil.swf">';
        const result = sanitizeMarkdown(content);
        expect(result).not.toContain("<embed>");
      });
    });

    describe("HTML Sanitization", () => {
      it("should allow safe HTML tags", () => {
        const content = "<strong>Bold</strong> and <em>italic</em>";
        const result = sanitizeMarkdown(content);
        expect(result).toContain("<strong>");
        expect(result).toContain("<em>");
      });

      it("should allow code and pre tags", () => {
        const content = "<pre><code>const x = 42;</code></pre>";
        const result = sanitizeMarkdown(content);
        expect(result).toContain("<pre>");
        expect(result).toContain("<code>");
      });

      it("should sanitize dangerous attributes from safe tags", () => {
        const content = "<div onclick=\"alert('xss')\">Content</div>";
        const result = sanitizeMarkdown(content);
        expect(result).not.toContain("onclick");
      });
    });

    describe("Edge Cases", () => {
      it("should handle empty content", () => {
        const result = sanitizeMarkdown("");
        expect(result).toBe("");
      });

      it("should handle whitespace-only content", () => {
        const content = "   \n\t  ";
        const result = sanitizeMarkdown(content);
        expect(result).toBe(content);
      });

      it("should handle very long content", () => {
        const longContent = "word ".repeat(10000);
        const result = sanitizeMarkdown(longContent);
        expect(result).toBeDefined();
        expect(result.length).toBeGreaterThan(0);
      });

      it("should handle nested malicious tags", () => {
        const content =
          "<div><script>alert('xss')</script><p>Content</p></div>";
        const result = sanitizeMarkdown(content);
        expect(result).not.toContain("<script>");
      });

      it("should handle malformed HTML", () => {
        const content = "<div><p>Unclosed tags";
        const result = sanitizeMarkdown(content);
        expect(result).toBeDefined();
      });
    });
  });

  describe("validateSlug", () => {
    describe("Valid Slugs", () => {
      it("should accept lowercase letters", () => {
        const result = validateSlug("hello");
        expect(result.isValid).toBe(true);
      });

      it("should accept numbers", () => {
        const result = validateSlug("post-123");
        expect(result.isValid).toBe(true);
      });

      it("should accept hyphens", () => {
        const result = validateSlug("hello-world");
        expect(result.isValid).toBe(true);
      });

      it("should accept alphanumeric with hyphens", () => {
        const result = validateSlug("top-10-tips-2024");
        expect(result.isValid).toBe(true);
      });

      it("should accept single character", () => {
        const result = validateSlug("a");
        expect(result.isValid).toBe(true);
      });

      it("should accept slug with multiple words", () => {
        const result = validateSlug("this-is-a-long-slug-with-many-words");
        expect(result.isValid).toBe(true);
      });
    });

    describe("Invalid Slugs", () => {
      it("should reject uppercase letters", () => {
        const result = validateSlug("Hello-World");
        expect(result.isValid).toBe(false);
        expect(result.error).toContain("lowercase");
      });

      it("should reject spaces", () => {
        const result = validateSlug("hello world");
        expect(result.isValid).toBe(false);
        expect(result.error).toContain("spaces");
      });

      it("should reject special characters", () => {
        const result = validateSlug("hello@world");
        expect(result.isValid).toBe(false);
        expect(result.error).toContain("special characters");
      });

      it("should reject underscores", () => {
        const result = validateSlug("hello_world");
        expect(result.isValid).toBe(false);
        expect(result.error).toContain("special characters");
      });

      it("should reject leading hyphen", () => {
        const result = validateSlug("-hello");
        expect(result.isValid).toBe(false);
        expect(result.error).toContain("start or end");
      });

      it("should reject trailing hyphen", () => {
        const result = validateSlug("hello-");
        expect(result.isValid).toBe(false);
        expect(result.error).toContain("start or end");
      });

      it("should reject double hyphens", () => {
        const result = validateSlug("hello--world");
        expect(result.isValid).toBe(false);
        expect(result.error).toContain("consecutive hyphens");
      });

      it("should reject empty string", () => {
        const result = validateSlug("");
        expect(result.isValid).toBe(false);
        expect(result.error).toContain("empty");
      });

      it("should reject whitespace-only", () => {
        const result = validateSlug("   ");
        expect(result.isValid).toBe(false);
        expect(result.error).toContain("empty");
      });

      it("should reject very long slugs", () => {
        const longSlug = "a".repeat(201);
        const result = validateSlug(longSlug);
        expect(result.isValid).toBe(false);
        expect(result.error).toContain("long");
      });

      it("should reject unicode characters", () => {
        const result = validateSlug("café");
        expect(result.isValid).toBe(false);
        expect(result.error).toContain("special characters");
      });

      it("should reject emoji", () => {
        const result = validateSlug("hello-🚀");
        expect(result.isValid).toBe(false);
        expect(result.error).toContain("special characters");
      });
    });

    describe("Edge Cases", () => {
      it("should accept exactly 200 characters", () => {
        const slug = "a".repeat(200);
        const result = validateSlug(slug);
        expect(result.isValid).toBe(true);
      });

      it("should accept slug with all numbers", () => {
        const result = validateSlug("12345");
        expect(result.isValid).toBe(true);
      });

      it("should accept slug starting with number", () => {
        const result = validateSlug("2024-goals");
        expect(result.isValid).toBe(true);
      });

      it("should handle null input gracefully", () => {
        const result = validateSlug(null as unknown as string);
        expect(result.isValid).toBe(false);
      });

      it("should handle undefined input gracefully", () => {
        const result = validateSlug(undefined as unknown as string);
        expect(result.isValid).toBe(false);
      });
    });
  });
});
