/**
 * BlogHeader Component
 *
 * Displays comprehensive header information for a blog post including:
 * - Post title (h1) for SEO and accessibility
 * - Author name with proper attribution
 * - Published date with semantic time element
 * - Reading time estimate
 * - Category badge for classification
 * - Tags for content discovery
 * - Cover image with responsive sizing
 *
 * This component follows semantic HTML best practices and responsive design
 * principles for optimal display across all device sizes.
 */

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/blog-utils";
import { cn } from "@/lib/utils";
import type { BlogPost } from "@/types/blog";

export interface BlogHeaderProps {
  /**
   * Blog post data to display in header
   */
  post: BlogPost;

  /**
   * Additional CSS classes for header container
   */
  className?: string;
}

/**
 * BlogHeader displays the header section of a blog post with title, metadata, and cover image
 */
export function BlogHeader({ post, className }: BlogHeaderProps) {
  const {
    title,
    author,
    publishedAt,
    readingTime,
    category,
    tags,
    coverImage,
  } = post;

  // Format published date if available
  const formattedDate = publishedAt ? formatDate(publishedAt) : null;

  // Generate datetime attribute for time element (ISO 8601 format)
  const dateTimeAttribute = publishedAt
    ? new Date(publishedAt).toISOString()
    : undefined;

  return (
    <header
      className={cn(
        "space-y-6 pb-8 border-b border-border",
        "mx-auto max-w-4xl",
        className,
      )}
    >
      {/* Cover Image */}
      {coverImage && (
        <div className="relative w-full aspect-[21/9] overflow-hidden rounded-xl">
          <Image
            src={coverImage}
            alt={`Cover image for ${title}`}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
          />
        </div>
      )}

      {/* Metadata Bar */}
      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        {/* Author */}
        {author && (
          <>
            <span className="font-medium text-foreground">{author}</span>
            <span className="text-muted-foreground/50">•</span>
          </>
        )}

        {/* Published Date */}
        {formattedDate && (
          <>
            <time
              dateTime={dateTimeAttribute}
              className="text-muted-foreground"
            >
              {formattedDate}
            </time>
            <span className="text-muted-foreground/50">•</span>
          </>
        )}

        {/* Reading Time */}
        <span className="text-muted-foreground">
          {readingTime === 0 ? "< 1 min read" : `${readingTime} min read`}
        </span>
      </div>

      {/* Title */}
      <h1 className="text-4xl font-bold tracking-tight lg:text-5xl break-words">
        {title}
      </h1>

      {/* Category and Tags */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Category Badge */}
        {category && (
          <Badge variant="default" className="capitalize">
            {category}
          </Badge>
        )}

        {/* Tag Badges */}
        {tags &&
          tags.length > 0 &&
          tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="capitalize">
              {tag}
            </Badge>
          ))}
      </div>
    </header>
  );
}
