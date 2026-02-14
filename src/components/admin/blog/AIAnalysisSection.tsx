"use client";

/**
 * AIAnalysisSection Component
 *
 * T006: Collapsible section for displaying AI-generated tone and readability analysis.
 * This is an informational component (read-only, no approve/reject actions).
 *
 * Features:
 * - Collapsed by default
 * - Displays tone and readability as badges
 * - Smooth expand/collapse animation
 * - Keyboard accessible
 * - Screen reader friendly
 */

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export interface AIAnalysisSectionProps {
  /**
   * Tone of the content (e.g., "professional", "conversational", "technical")
   */
  tone: string;

  /**
   * Readability assessment (e.g., "clear", "moderate", "complex")
   */
  readability: string;
}

export function AIAnalysisSection({
  tone,
  readability,
}: AIAnalysisSectionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="border rounded-lg overflow-hidden">
        {/* Header with trigger */}
        <CollapsibleTrigger
          className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-expanded={isOpen}
        >
          <div className="flex items-center gap-2 font-medium">
            <span className="text-lg" aria-hidden="true">
              📊
            </span>
            <span>AI Analysis</span>
          </div>
          <ChevronDown
            className={`size-4 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
            aria-hidden="true"
          />
        </CollapsibleTrigger>

        {/* Collapsible content */}
        <CollapsibleContent className="transition-all duration-200 data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
          <div className="p-4 pt-0 space-y-3 border-t">
            {/* Tone */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Tone:</span>
              <Badge variant="secondary">{tone || "Not analyzed"}</Badge>
            </div>

            {/* Readability */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Readability:
              </span>
              <Badge variant="secondary">{readability || "Not analyzed"}</Badge>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
