"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NewSuggestionChipProps {
  value: string;
  onReplace: (value: string) => void;
  onDismiss: () => void;
  className?: string;
}

export function NewSuggestionChip({
  value,
  onReplace,
  onDismiss,
  className,
}: NewSuggestionChipProps) {
  const handleReplace = () => {
    onReplace(value);
  };

  const handleDismiss = () => {
    onDismiss();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn("mt-2", className)}
    >
      <div
        data-chip="true"
        role="alert"
        className={cn(
          "flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950/30",
          className,
        )}
      >
        <span className="text-lg" aria-hidden="true">
          💡
        </span>
        <span className="flex-1 text-sm text-muted-foreground">
          <span className="font-medium">New suggestion:</span> {value}
        </span>
        <div className="flex gap-2">
          <Button
            onClick={handleReplace}
            variant="default"
            size="xs"
            className="bg-green-600 hover:bg-green-700 text-white dark:bg-green-700 dark:hover:bg-green-800"
            aria-label="Replace with new suggestion"
          >
            <span className="font-bold">✓</span>
            <span className="ml-1">Replace</span>
          </Button>

          <Button
            onClick={handleDismiss}
            variant="destructive"
            size="xs"
            className="bg-red-600 hover:bg-red-700 text-white dark:bg-red-700 dark:hover:bg-red-800"
            aria-label="Dismiss new suggestion"
          >
            <span className="font-bold">✗</span>
            <span className="ml-1">Dismiss</span>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
