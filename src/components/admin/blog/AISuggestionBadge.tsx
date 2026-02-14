"use client";

/**
 * AISuggestionBadge Component
 *
 * T004: Reusable badge component with robot emoji and tooltip for AI suggestions
 *
 * Features:
 * - Renders 🤖 badge with shadcn/ui Badge component
 * - Tooltip shows "AI Suggested" on hover (using native title attribute)
 * - onClick prop triggers overlay display
 * - ARIA label "AI suggestion - click to review"
 * - Keyboard accessible (Enter and Space keys trigger onClick)
 * - Follows new-york style conventions
 */

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface AISuggestionBadgeProps {
  /**
   * Click handler to trigger overlay display
   */
  onClick: () => void;

  /**
   * Optional additional CSS classes
   */
  className?: string;
}

export function AISuggestionBadge({
  onClick,
  className,
}: AISuggestionBadgeProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLSpanElement>) => {
    // Trigger onClick on Enter or Space key
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <Badge
      variant="secondary"
      className={cn(
        "cursor-pointer hover:bg-secondary/80 transition-colors",
        className,
      )}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label="AI suggestion - click to review"
      title="AI Suggested"
    >
      🤖
    </Badge>
  );
}
