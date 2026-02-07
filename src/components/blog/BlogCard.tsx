"use client";

import type { Variants } from "framer-motion";
import { motion } from "framer-motion";
import { Calendar, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { formatDate } from "@/lib/blog-utils";
import type { BlogPost } from "@/types/blog";

interface BlogCardProps {
  post: BlogPost;
  variants?: Variants;
}

/**
 * BlogCard - Displays a blog post card with title, excerpt, cover image, and metadata
 *
 * Features:
 * - Responsive design with hover effects
 * - Featured variant styling for highlighted posts
 * - Category badge and reading time display
 * - Click navigation to post page
 * - Cover image with proper aspect ratio
 * - Semantic HTML structure for SEO
 */
export function BlogCard({ post, variants }: BlogCardProps) {
  const reducedMotion = useReducedMotion();

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: reducedMotion ? 0 : 0.5,
      },
    },
  };

  return (
    <motion.article
      variants={variants || cardVariants}
      className={`group flex h-full flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-300 hover:shadow-lg dark:hover:shadow-primary/10 ${
        post.featured
          ? "border-2 border-primary bg-gradient-to-br from-card to-primary/5"
          : "border-border"
      }`}
    >
      <Link
        href={`/blog/${post.slug}`}
        className="flex h-full flex-col gap-4"
        aria-label={`Read ${post.title}`}
      >
        {/* Cover Image */}
        {post.coverImage && (
          <div className="aspect-video relative w-full overflow-hidden bg-muted">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {post.featured && (
              <div className="absolute right-4 top-4">
                <Badge
                  variant="default"
                  className="bg-primary text-primary-foreground shadow-lg"
                >
                  Featured
                </Badge>
              </div>
            )}
          </div>
        )}

        {/* Card Content */}
        <div className="flex flex-1 flex-col gap-4 p-6">
          {/* Header with Category Badge */}
          <div className="flex items-start justify-between gap-2">
            <Badge variant="secondary" data-variant="secondary">
              {post.category}
            </Badge>
          </div>

          {/* Title and Excerpt */}
          <div className="flex-1 space-y-2">
            <h3 className="text-xl font-semibold leading-tight tracking-tight text-foreground transition-colors group-hover:text-primary">
              {post.title}
            </h3>
            <p className="line-clamp-3 text-sm text-muted-foreground">
              {post.excerpt}
            </p>
          </div>

          {/* Footer with Metadata */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <time
              dateTime={new Date(
                post.publishedAt || post._creationTime,
              ).toISOString()}
              className="flex items-center gap-1"
            >
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(post.publishedAt || post._creationTime)}
            </time>
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>{post.readingTime} min read</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
