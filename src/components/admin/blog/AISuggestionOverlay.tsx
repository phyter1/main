"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AISuggestionOverlayProps {
  isOpen: boolean;
  onApprove: () => void;
  onReject: () => void;
  onClose: () => void;
  className?: string;
}

export function AISuggestionOverlay({
  isOpen,
  onApprove,
  onReject,
  onClose,
  className,
}: AISuggestionOverlayProps) {
  const approveButtonRef = useRef<HTMLButtonElement>(null);
  const previousActiveElement = useRef<Element | null>(null);

  // Handle Escape key to close overlay
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Focus management: auto-focus approve button and restore focus on close
  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element before opening overlay
      previousActiveElement.current = document.activeElement;

      // Auto-focus approve button when overlay opens
      setTimeout(() => {
        approveButtonRef.current?.focus();
      }, 50);
    } else {
      // Restore focus to the previously focused element when overlay closes
      if (
        previousActiveElement.current &&
        previousActiveElement.current instanceof HTMLElement
      ) {
        previousActiveElement.current.focus();
      }
    }
  }, [isOpen]);

  const handleApprove = () => {
    onApprove();
    onClose();
  };

  const handleReject = () => {
    onReject();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className={cn(
            "absolute inset-0 z-50 flex items-center justify-center gap-2 rounded-md bg-background/95 backdrop-blur-sm border border-border shadow-lg",
            className,
          )}
          data-overlay="true"
          role="dialog"
          aria-modal="true"
          aria-label="AI suggestion actions"
        >
          <Button
            ref={approveButtonRef}
            onClick={handleApprove}
            variant="default"
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white dark:bg-green-700 dark:hover:bg-green-800"
            aria-label="Approve AI suggestion"
          >
            <span className="text-lg font-bold">✓</span>
            <span className="ml-1">Approve</span>
          </Button>

          <Button
            onClick={handleReject}
            variant="destructive"
            size="sm"
            className="bg-red-600 hover:bg-red-700 text-white dark:bg-red-700 dark:hover:bg-red-800"
            aria-label="Reject AI suggestion"
          >
            <span className="text-lg font-bold">✗</span>
            <span className="ml-1">Reject</span>
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
