import { cn } from "@/lib/utils";

export interface TypingIndicatorProps {
  label?: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

function TypingIndicator({
  label = "Typing",
  showLabel = true,
  size = "md",
  className,
}: TypingIndicatorProps) {
  const sizeClasses = {
    sm: "size-1.5",
    md: "size-2",
    lg: "size-3",
  };

  const gapClasses = {
    sm: "gap-1",
    md: "gap-1.5",
    lg: "gap-2",
  };

  return (
    // biome-ignore lint/a11y/useSemanticElements: role="status" is appropriate for dynamic loading indicator
    <div
      data-component="typing-indicator"
      data-size={size}
      role="status"
      aria-live="polite"
      className={cn("flex items-center", gapClasses[size], className)}
    >
      <span className="sr-only">{label}...</span>
      <div className={cn("flex items-center", gapClasses[size])}>
        <span
          data-dot
          className={cn(
            "rounded-full bg-muted-foreground animate-bounce",
            sizeClasses[size],
          )}
          style={{ animationDelay: "0ms", animationDuration: "1.4s" }}
        />
        <span
          data-dot
          className={cn(
            "rounded-full bg-muted-foreground animate-bounce",
            sizeClasses[size],
          )}
          style={{ animationDelay: "160ms", animationDuration: "1.4s" }}
        />
        <span
          data-dot
          className={cn(
            "rounded-full bg-muted-foreground animate-bounce",
            sizeClasses[size],
          )}
          style={{ animationDelay: "320ms", animationDuration: "1.4s" }}
        />
      </div>
      {showLabel && (
        <span className="text-sm text-muted-foreground ml-1">{label}...</span>
      )}
    </div>
  );
}

export { TypingIndicator };
