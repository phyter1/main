"use client";

import { Check, Link2, Linkedin, Mail, Twitter } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ShareButtonsProps {
  /**
   * Blog post title for sharing
   */
  title: string;

  /**
   * Blog post slug for URL construction
   */
  slug: string;

  /**
   * Optional base URL (defaults to window.location.origin)
   */
  baseUrl?: string;

  /**
   * Optional className for custom styling
   */
  className?: string;
}

/**
 * ShareButtons component for blog posts
 *
 * Provides sharing functionality across multiple platforms:
 * - Twitter: Share post with title and URL
 * - LinkedIn: Share post URL
 * - Copy Link: Copy post URL to clipboard with confirmation
 * - Email: Open email client with pre-filled subject and body
 *
 * All URLs are properly encoded for each platform's requirements.
 * Copy link provides visual feedback with confirmation message.
 *
 * @example
 * ```tsx
 * <ShareButtons
 *   title="Getting Started with React"
 *   slug="getting-started-with-react"
 * />
 * ```
 */
export function ShareButtons({
  title,
  slug,
  baseUrl,
  className,
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [postUrl, setPostUrl] = useState(`/blog/${slug}`);

  // Set full URL after hydration to avoid SSR mismatch
  useEffect(() => {
    const base = baseUrl || window.location.origin;
    setPostUrl(`${base}/blog/${slug}`);
  }, [baseUrl, slug]);

  /**
   * Generate Twitter share URL with proper encoding
   */
  const getTwitterUrl = () => {
    const text = encodeURIComponent(title);
    const url = encodeURIComponent(postUrl);
    return `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
  };

  /**
   * Generate LinkedIn share URL with proper encoding
   */
  const getLinkedInUrl = () => {
    const url = encodeURIComponent(postUrl);
    return `https://www.linkedin.com/sharing/share-offsite?url=${url}`;
  };

  /**
   * Generate email mailto link with proper encoding
   */
  const getEmailUrl = () => {
    const subject = encodeURIComponent(title);
    const body = encodeURIComponent(
      `I thought you might find this interesting:\n\n${postUrl}`,
    );
    return `mailto:?subject=${subject}&body=${body}`;
  };

  /**
   * Open share URL in new window
   */
  const handleShare = (url: string) => {
    if (typeof window !== "undefined") {
      window.open(url, "_blank", "noopener,noreferrer,width=600,height=600");
    }
  };

  /**
   * Copy post URL to clipboard with confirmation feedback
   */
  const handleCopyLink = async () => {
    try {
      if (!navigator?.clipboard) {
        setCopyError(true);
        setTimeout(() => setCopyError(false), 2000);
        return;
      }

      await navigator.clipboard.writeText(postUrl);
      setCopied(true);
      setCopyError(false);

      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      setCopyError(true);
      setTimeout(() => setCopyError(false), 2000);
    }
  };

  /**
   * Open email client with pre-filled content
   */
  const handleEmailShare = () => {
    if (typeof window !== "undefined") {
      window.location.assign(getEmailUrl());
    }
  };

  return (
    // biome-ignore lint/a11y/useSemanticElements: Share buttons group is not a form fieldset
    <div
      role="group"
      aria-label="Share this post"
      className={cn("flex items-center gap-2", className)}
    >
      {/* Twitter Share Button */}
      <Button
        variant="outline"
        size="icon-sm"
        onClick={() => handleShare(getTwitterUrl())}
        aria-label="Share on Twitter"
        title="Share on Twitter"
        data-url={getTwitterUrl()}
        className="hover:bg-blue-500/10 dark:hover:bg-blue-500/20 hover:border-blue-500 transition-colors"
      >
        <Twitter className="size-4" />
      </Button>

      {/* LinkedIn Share Button */}
      <Button
        variant="outline"
        size="icon-sm"
        onClick={() => handleShare(getLinkedInUrl())}
        aria-label="Share on LinkedIn"
        title="Share on LinkedIn"
        data-url={getLinkedInUrl()}
        className="hover:bg-blue-600/10 dark:hover:bg-blue-600/20 hover:border-blue-600 transition-colors"
      >
        <Linkedin className="size-4" />
      </Button>

      {/* Copy Link Button */}
      <Button
        variant="outline"
        size="icon-sm"
        onClick={handleCopyLink}
        aria-label={
          copied
            ? "Copied to clipboard"
            : copyError
              ? "Failed to copy"
              : "Copy link to clipboard"
        }
        title={copied ? "Copied!" : "Copy link"}
        className={cn(
          "transition-colors",
          copied &&
            "bg-green-500/10 dark:bg-green-500/20 border-green-500 text-green-700 dark:text-green-400",
          copyError &&
            "bg-red-500/10 dark:bg-red-500/20 border-red-500 text-red-700 dark:text-red-400",
          !copied &&
            !copyError &&
            "hover:bg-gray-500/10 dark:hover:bg-gray-500/20 hover:border-gray-500",
        )}
      >
        {copied ? <Check className="size-4" /> : <Link2 className="size-4" />}
      </Button>

      {/* Email Share Button */}
      <Button
        variant="outline"
        size="icon-sm"
        onClick={handleEmailShare}
        aria-label="Share via email"
        title="Share via email"
        data-url={getEmailUrl()}
        className="hover:bg-purple-500/10 dark:hover:bg-purple-500/20 hover:border-purple-500 transition-colors"
      >
        <Mail className="size-4" />
      </Button>

      {/* Copy Confirmation Message */}
      {copied && (
        <span
          className="text-sm text-green-700 dark:text-green-400 animate-fade-in"
          aria-live="polite"
        >
          Copied!
        </span>
      )}

      {/* Copy Error Message */}
      {copyError && (
        <span
          className="text-sm text-red-700 dark:text-red-400 animate-fade-in"
          aria-live="polite"
        >
          Failed to copy
        </span>
      )}
    </div>
  );
}
