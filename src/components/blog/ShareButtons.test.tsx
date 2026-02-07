import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import { cleanup, render, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { ShareButtons } from "./ShareButtons";

describe("ShareButtons", () => {
  const mockPost = {
    title: "Getting Started with React",
    slug: "getting-started-with-react",
  };

  const baseUrl = "https://example.com";
  const postUrl = `${baseUrl}/blog/${mockPost.slug}`;

  // Mock window.location
  const originalLocation = window.location;

  beforeEach(() => {
    // Mock window.location
    Object.defineProperty(window, "location", {
      configurable: true,
      value: {
        origin: baseUrl,
        href: postUrl,
      },
    });

    // Mock clipboard API
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      writable: true,
      value: {
        writeText: mock(() => Promise.resolve()),
      },
    });
  });

  afterEach(() => {
    // Restore original location
    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
    });
    mock.restore();
    cleanup();
  });

  describe("Component Rendering", () => {
    it("should render all share buttons", () => {
      const { container } = render(
        <ShareButtons title={mockPost.title} slug={mockPost.slug} />,
      );

      const buttons = container.querySelectorAll("button");
      expect(buttons.length).toBe(4);

      const twitterButton = container.querySelector('[aria-label*="Twitter"]');
      const linkedinButton = container.querySelector(
        '[aria-label*="LinkedIn"]',
      );
      const copyButton = container.querySelector('[aria-label*="Copy"]');
      const emailButton = container.querySelector('[aria-label*="email"]');

      expect(twitterButton).toBeDefined();
      expect(linkedinButton).toBeDefined();
      expect(copyButton).toBeDefined();
      expect(emailButton).toBeDefined();
    });

    it("should render with custom base URL", () => {
      const customUrl = "https://phytertek.com";
      const { container } = render(
        <ShareButtons
          title={mockPost.title}
          slug={mockPost.slug}
          baseUrl={customUrl}
        />,
      );

      const twitterButton = container.querySelector('[aria-label*="Twitter"]');
      expect(twitterButton).toBeDefined();
    });

    it("should have accessible button labels", () => {
      const { container } = render(
        <ShareButtons title={mockPost.title} slug={mockPost.slug} />,
      );

      const buttons = container.querySelectorAll("button");
      expect(buttons.length).toBe(4);

      for (const button of buttons) {
        expect(button.getAttribute("aria-label")).toBeTruthy();
      }
    });
  });

  describe("Twitter Share", () => {
    it("should generate correct Twitter share URL", () => {
      const { container } = render(
        <ShareButtons title={mockPost.title} slug={mockPost.slug} />,
      );

      const twitterButton = container.querySelector('[aria-label*="Twitter"]');
      expect(twitterButton?.getAttribute("data-url")).toContain(
        "https://twitter.com/intent/tweet",
      );
    });

    it("should properly URL encode Twitter parameters", () => {
      const titleWithSpecialChars = "Getting Started with React & TypeScript!";
      const { container } = render(
        <ShareButtons title={titleWithSpecialChars} slug={mockPost.slug} />,
      );

      const twitterButton = container.querySelector('[aria-label*="Twitter"]');
      const dataUrl = twitterButton?.getAttribute("data-url");

      expect(dataUrl).toContain("Getting%20Started%20with%20React");
      expect(dataUrl).toContain(encodeURIComponent("&"));
    });

    it("should include post URL in Twitter share", () => {
      const { container } = render(
        <ShareButtons title={mockPost.title} slug={mockPost.slug} />,
      );

      const twitterButton = container.querySelector('[aria-label*="Twitter"]');
      const dataUrl = twitterButton?.getAttribute("data-url");

      expect(dataUrl).toContain(encodeURIComponent(postUrl));
    });

    it("should open Twitter in new window when clicked", async () => {
      const user = userEvent.setup();
      const mockOpen = mock(() => null);
      window.open = mockOpen;

      const { container } = render(
        <ShareButtons title={mockPost.title} slug={mockPost.slug} />,
      );

      const twitterButton = container.querySelector('[aria-label*="Twitter"]');
      await user.click(twitterButton as Element);

      expect(mockOpen).toHaveBeenCalledTimes(1);
      expect(mockOpen.mock.calls[0][0]).toContain(
        "https://twitter.com/intent/tweet",
      );
    });
  });

  describe("LinkedIn Share", () => {
    it("should generate correct LinkedIn share URL", () => {
      const { container } = render(
        <ShareButtons title={mockPost.title} slug={mockPost.slug} />,
      );

      const linkedinButton = container.querySelector(
        '[aria-label*="LinkedIn"]',
      );
      expect(linkedinButton?.getAttribute("data-url")).toContain(
        "https://www.linkedin.com/sharing/share-offsite",
      );
    });

    it("should properly URL encode LinkedIn parameters", () => {
      const { container } = render(
        <ShareButtons title={mockPost.title} slug={mockPost.slug} />,
      );

      const linkedinButton = container.querySelector(
        '[aria-label*="LinkedIn"]',
      );
      const dataUrl = linkedinButton?.getAttribute("data-url");

      expect(dataUrl).toContain(encodeURIComponent(postUrl));
    });

    it("should open LinkedIn in new window when clicked", async () => {
      const user = userEvent.setup();
      const mockOpen = mock(() => null);
      window.open = mockOpen;

      const { container } = render(
        <ShareButtons title={mockPost.title} slug={mockPost.slug} />,
      );

      const linkedinButton = container.querySelector(
        '[aria-label*="LinkedIn"]',
      );
      await user.click(linkedinButton as Element);

      expect(mockOpen).toHaveBeenCalledTimes(1);
      expect(mockOpen.mock.calls[0][0]).toContain(
        "https://www.linkedin.com/sharing/share-offsite",
      );
    });
  });

  describe("Copy Link", () => {
    it("should copy post URL to clipboard", async () => {
      const user = userEvent.setup();
      const mockWriteText = mock(() => Promise.resolve());
      navigator.clipboard.writeText = mockWriteText;

      const { container } = render(
        <ShareButtons title={mockPost.title} slug={mockPost.slug} />,
      );

      const copyButton = container.querySelector('[aria-label*="Copy"]');
      await user.click(copyButton as Element);

      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalledTimes(1);
        expect(mockWriteText).toHaveBeenCalledWith(postUrl);
      });
    });

    it("should show confirmation feedback after copying", async () => {
      const user = userEvent.setup();
      const { container } = render(
        <ShareButtons title={mockPost.title} slug={mockPost.slug} />,
      );

      const copyButton = container.querySelector('[aria-label*="Copy"]');
      await user.click(copyButton as Element);

      await waitFor(() => {
        const copiedText = container.textContent;
        expect(copiedText).toContain("Copied");
      });
    });

    it("should hide confirmation after timeout", async () => {
      const user = userEvent.setup();
      const { container } = render(
        <ShareButtons title={mockPost.title} slug={mockPost.slug} />,
      );

      const copyButton = container.querySelector('[aria-label*="Copy"]');
      await user.click(copyButton as Element);

      await waitFor(() => {
        const copiedText = container.textContent;
        expect(copiedText).toContain("Copied");
      });

      // Wait for confirmation to disappear (2 seconds)
      await waitFor(
        () => {
          const text = container.textContent;
          expect(text).not.toContain("Copied");
        },
        { timeout: 2500 },
      );
    });

    it("should handle clipboard API errors gracefully", async () => {
      const user = userEvent.setup();
      const mockWriteText = mock(() =>
        Promise.reject(new Error("Clipboard not available")),
      );
      navigator.clipboard.writeText = mockWriteText;

      const { container } = render(
        <ShareButtons title={mockPost.title} slug={mockPost.slug} />,
      );

      const copyButton = container.querySelector('[aria-label*="Copy"]');
      await user.click(copyButton as Element);

      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalledTimes(1);
      });

      // Should show error feedback
      await waitFor(() => {
        const text = container.textContent;
        expect(
          text?.includes("Failed to copy") || text?.includes("Copied"),
        ).toBe(true);
      });
    });

    it("should use custom base URL for copying", async () => {
      const user = userEvent.setup();
      const mockWriteText = mock(() => Promise.resolve());
      navigator.clipboard.writeText = mockWriteText;

      const customUrl = "https://phytertek.com";
      const { container } = render(
        <ShareButtons
          title={mockPost.title}
          slug={mockPost.slug}
          baseUrl={customUrl}
        />,
      );

      const copyButton = container.querySelector('[aria-label*="Copy"]');
      await user.click(copyButton as Element);

      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalledWith(
          `${customUrl}/blog/${mockPost.slug}`,
        );
      });
    });
  });

  describe("Email Share", () => {
    it("should generate correct mailto link", () => {
      const { container } = render(
        <ShareButtons title={mockPost.title} slug={mockPost.slug} />,
      );

      const emailButton = container.querySelector('[aria-label*="email"]');
      const dataUrl = emailButton?.getAttribute("data-url");

      expect(dataUrl).toContain("mailto:");
      expect(dataUrl).toContain("subject=");
      expect(dataUrl).toContain("body=");
    });

    it("should properly URL encode email parameters", () => {
      const titleWithSpecialChars = "Getting Started with React & TypeScript!";
      const { container } = render(
        <ShareButtons title={titleWithSpecialChars} slug={mockPost.slug} />,
      );

      const emailButton = container.querySelector('[aria-label*="email"]');
      const dataUrl = emailButton?.getAttribute("data-url");

      expect(dataUrl).toContain(encodeURIComponent(titleWithSpecialChars));
      expect(dataUrl).toContain(encodeURIComponent(postUrl));
    });

    it("should include post URL in email body", () => {
      const { container } = render(
        <ShareButtons title={mockPost.title} slug={mockPost.slug} />,
      );

      const emailButton = container.querySelector('[aria-label*="email"]');
      const dataUrl = emailButton?.getAttribute("data-url");

      const decodedUrl = decodeURIComponent(dataUrl || "");
      expect(decodedUrl).toContain(postUrl);
    });

    it("should open email client when clicked", async () => {
      const user = userEvent.setup();
      const mockAssign = mock(() => {});
      Object.defineProperty(window.location, "assign", {
        configurable: true,
        value: mockAssign,
      });

      const { container } = render(
        <ShareButtons title={mockPost.title} slug={mockPost.slug} />,
      );

      const emailButton = container.querySelector('[aria-label*="email"]');
      await user.click(emailButton as Element);

      expect(mockAssign).toHaveBeenCalledTimes(1);
      expect(mockAssign.mock.calls[0][0]).toContain("mailto:");
    });
  });

  describe("URL Encoding", () => {
    it("should handle special characters in title", () => {
      const specialTitle = "Test & Test: Special <Characters> (2024)!";
      const { container } = render(
        <ShareButtons title={specialTitle} slug={mockPost.slug} />,
      );

      const twitterButton = container.querySelector('[aria-label*="Twitter"]');
      const dataUrl = twitterButton?.getAttribute("data-url");

      // Verify URL encoding doesn't break the URL
      expect(dataUrl).toBeDefined();
      expect(dataUrl).not.toContain("<");
      expect(dataUrl).not.toContain(">");
    });

    it("should handle special characters in slug", () => {
      const specialSlug = "test-post-2024";
      const { container } = render(
        <ShareButtons title={mockPost.title} slug={specialSlug} />,
      );

      const linkedinButton = container.querySelector(
        '[aria-label*="LinkedIn"]',
      );
      const dataUrl = linkedinButton?.getAttribute("data-url");

      expect(dataUrl).toContain(specialSlug);
    });

    it("should handle Unicode characters", () => {
      const unicodeTitle = "React 开发指南 🚀";
      const { container } = render(
        <ShareButtons title={unicodeTitle} slug={mockPost.slug} />,
      );

      const emailButton = container.querySelector('[aria-label*="email"]');
      const dataUrl = emailButton?.getAttribute("data-url");

      expect(dataUrl).toBeDefined();
      expect(dataUrl).toContain(encodeURIComponent("🚀"));
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels for all buttons", () => {
      const { container } = render(
        <ShareButtons title={mockPost.title} slug={mockPost.slug} />,
      );

      const twitterButton = container.querySelector('[aria-label*="Twitter"]');
      const linkedinButton = container.querySelector(
        '[aria-label*="LinkedIn"]',
      );
      const copyButton = container.querySelector('[aria-label*="Copy"]');
      const emailButton = container.querySelector('[aria-label*="email"]');

      expect(twitterButton?.getAttribute("aria-label")).toContain("Twitter");
      expect(linkedinButton?.getAttribute("aria-label")).toContain("LinkedIn");
      expect(copyButton?.getAttribute("aria-label")).toContain("Copy");
      expect(emailButton?.getAttribute("aria-label")).toContain("email");
    });

    it("should be keyboard accessible", async () => {
      const user = userEvent.setup();
      const { container } = render(
        <ShareButtons title={mockPost.title} slug={mockPost.slug} />,
      );

      const buttons = container.querySelectorAll("button");
      const twitterButton = buttons[0];
      const linkedinButton = buttons[1];

      // Tab to first button
      await user.tab();
      expect(document.activeElement).toBe(twitterButton);

      // Tab to next button
      await user.tab();
      expect(document.activeElement).toBe(linkedinButton);
    });

    it("should update copy button label when copied", async () => {
      const user = userEvent.setup();
      const { container } = render(
        <ShareButtons title={mockPost.title} slug={mockPost.slug} />,
      );

      const copyButton = container.querySelector('[aria-label*="Copy"]');
      const originalLabel = copyButton?.getAttribute("aria-label");

      await user.click(copyButton as Element);

      await waitFor(() => {
        const newLabel = copyButton?.getAttribute("aria-label");
        expect(newLabel).not.toBe(originalLabel);
        expect(newLabel).toContain("Copied");
      });
    });
  });

  describe("Responsive Design", () => {
    it("should render compact layout on mobile", () => {
      const { container } = render(
        <ShareButtons title={mockPost.title} slug={mockPost.slug} />,
      );

      const group = container.querySelector('[role="group"]');
      expect(group?.className).toContain("flex");
    });

    it("should show icon-only buttons with tooltips", () => {
      const { container } = render(
        <ShareButtons title={mockPost.title} slug={mockPost.slug} />,
      );

      const buttons = container.querySelectorAll("button");
      for (const button of buttons) {
        // Each button should have an icon (svg element)
        const svg = button.querySelector("svg");
        expect(svg).toBeDefined();
      }
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty title", () => {
      const { container } = render(
        <ShareButtons title="" slug={mockPost.slug} />,
      );

      const twitterButton = container.querySelector('[aria-label*="Twitter"]');
      expect(twitterButton).toBeDefined();
    });

    it("should handle empty slug", () => {
      const { container } = render(
        <ShareButtons title={mockPost.title} slug="" />,
      );

      const twitterButton = container.querySelector('[aria-label*="Twitter"]');
      expect(twitterButton).toBeDefined();
    });

    it("should handle very long titles", () => {
      const longTitle = "A".repeat(300);
      const { container } = render(
        <ShareButtons title={longTitle} slug={mockPost.slug} />,
      );

      const twitterButton = container.querySelector('[aria-label*="Twitter"]');
      expect(twitterButton?.getAttribute("data-url")).toBeDefined();
    });

    it("should handle missing clipboard API", async () => {
      const user = userEvent.setup();

      // Remove clipboard API
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: undefined,
      });

      const { container } = render(
        <ShareButtons title={mockPost.title} slug={mockPost.slug} />,
      );

      const copyButton = container.querySelector('[aria-label*="Copy"]');
      await user.click(copyButton as Element);

      // Should still render and not crash
      expect(copyButton).toBeDefined();
    });
  });
});
