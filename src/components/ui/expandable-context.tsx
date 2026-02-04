"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { trackContextExpansion } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { Button } from "./button";

export interface ExpandableContextProps {
  context: {
    situation: string;
    task: string;
    action: string;
    result: string;
  };
  projectId?: string;
  className?: string;
}

function ExpandableContext({
  context,
  projectId,
  className,
}: ExpandableContextProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);

    // Track context expansion when user expands (privacy-respecting - only project ID tracked)
    if (newExpandedState && projectId) {
      trackContextExpansion(projectId);
    }
  };

  return (
    <div
      data-slot="expandable-context"
      className={cn("flex flex-col gap-3", className)}
    >
      <Button
        variant="outline"
        size="sm"
        onClick={toggleExpanded}
        aria-expanded={isExpanded}
        aria-controls="context-content"
        className="w-fit"
      >
        {isExpanded ? (
          <>
            <ChevronUp className="size-4" />
            Hide Context
          </>
        ) : (
          <>
            <ChevronDown className="size-4" />
            View AI Context
          </>
        )}
      </Button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            id="context-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: {
                duration: 0.3,
                ease: [0.4, 0, 0.2, 1],
              },
              opacity: {
                duration: 0.2,
                ease: [0.4, 0, 0.2, 1],
              },
            }}
            style={{ overflow: "hidden" }}
            className="space-y-4"
          >
            <div className="rounded-lg border bg-card p-4 space-y-4">
              <div data-section="situation" className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">
                  Situation
                </h3>
                <p className="text-sm text-muted-foreground">
                  {context.situation}
                </p>
              </div>

              <div data-section="task" className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">Task</h3>
                <p className="text-sm text-muted-foreground">{context.task}</p>
              </div>

              <div data-section="action" className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">
                  Action
                </h3>
                <p className="text-sm text-muted-foreground">
                  {context.action}
                </p>
              </div>

              <div data-section="result" className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">
                  Result
                </h3>
                <p className="text-sm text-muted-foreground">
                  {context.result}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export { ExpandableContext };
