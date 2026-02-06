"use client";

/**
 * GuardrailFeedback Component
 *
 * Displays detailed, educational feedback when security guardrails are triggered.
 * Makes every guardrail violation a teaching moment that showcases the
 * production-grade security implementation.
 */

import {
  AnimatePresence,
  motion,
  type Transition,
  type Variants,
} from "framer-motion";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";
import type { GuardrailViolation } from "@/types/guardrails";

/**
 * Props for GuardrailFeedback component
 */
export interface GuardrailFeedbackProps {
  /**
   * The guardrail violation to display
   */
  violation: GuardrailViolation;

  /**
   * Optional CSS class name for styling
   */
  className?: string;

  /**
   * Optional repository URL for GitHub links
   * Defaults to "https://github.com/phyter1/main"
   */
  repositoryUrl?: string;
}

/**
 * Get icon and color for guardrail type
 */
function getGuardrailDisplay(type: string): { icon: string; color: string } {
  switch (type) {
    case "prompt_injection":
      return { icon: "🛡️", color: "text-destructive" };
    case "rate_limit":
      return { icon: "⏱️", color: "text-warning" };
    case "length_validation":
      return { icon: "📏", color: "text-info" };
    case "suspicious_pattern":
      return { icon: "⚠️", color: "text-warning" };
    case "scope_enforcement":
      return { icon: "🎯", color: "text-info" };
    default:
      return { icon: "ℹ️", color: "text-muted-foreground" };
  }
}

/**
 * Get badge variant for severity level
 */
function getSeverityVariant(
  severity: string,
): "destructive" | "default" | "secondary" {
  switch (severity) {
    case "high":
      return "destructive";
    case "medium":
      return "default";
    case "low":
      return "secondary";
    default:
      return "secondary";
  }
}

/**
 * Format type name for display
 */
function formatTypeName(type: string): string {
  return type
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * GuardrailFeedback Component
 *
 * Displays structured feedback about triggered security guardrails.
 * Educational and professional tone, not punishing.
 */
export function GuardrailFeedback({
  violation,
  className,
  repositoryUrl = "https://github.com/phyter1/main",
}: GuardrailFeedbackProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // Animation configuration that respects user's motion preferences
  const fadeInVariants = {
    initial: { opacity: prefersReducedMotion ? 1 : 0 },
    animate: { opacity: 1 },
  };

  const fadeInTransition: Transition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.2 };

  const expandVariants: Variants = {
    initial: { height: 0, opacity: 0 },
    animate: {
      height: "auto" as const,
      opacity: 1,
      transition: {
        height: { duration: prefersReducedMotion ? 0 : 0.2 },
        opacity: { duration: prefersReducedMotion ? 0 : 0.15 },
      },
    },
    exit: {
      height: 0,
      opacity: 0,
      transition: {
        height: { duration: prefersReducedMotion ? 0 : 0.2 },
        opacity: { duration: prefersReducedMotion ? 0 : 0.1 },
      },
    },
  };

  // If no guardrail details, fall back to simple error display
  if (!violation.guardrail) {
    return (
      <motion.div
        initial={fadeInVariants.initial}
        animate={fadeInVariants.animate}
        transition={fadeInTransition}
        className={cn(
          "rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive dark:border-destructive/30 dark:bg-destructive/10 dark:text-destructive-foreground",
          className,
        )}
        role="alert"
      >
        <p className="font-medium">Error</p>
        <p className="mt-1">{violation.error}</p>
      </motion.div>
    );
  }

  const { guardrail } = violation;
  const display = getGuardrailDisplay(guardrail.type);
  const sourceUrl = `${repositoryUrl}/blob/main/${guardrail.sourceFile}${
    guardrail.lineNumbers ? `#L${guardrail.lineNumbers.replace("-", "-L")}` : ""
  }`;

  return (
    <motion.div
      initial={fadeInVariants.initial}
      animate={fadeInVariants.animate}
      transition={fadeInTransition}
    >
      <Card
        className={cn("border-l-4", className)}
        data-guardrail-type={guardrail.type}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <span
                className={cn("text-2xl", display.color)}
                aria-hidden="true"
              >
                {display.icon}
              </span>
              <div>
                <CardTitle className="text-lg">
                  {display.icon} Security Guardrail Triggered
                </CardTitle>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge variant="outline" className="font-normal">
                    {formatTypeName(guardrail.type)}
                  </Badge>
                  <Badge variant={getSeverityVariant(guardrail.severity)}>
                    {guardrail.severity.toUpperCase()}
                  </Badge>
                  <Badge variant="secondary" className="font-normal">
                    {guardrail.category}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Why This Matters */}
          <div>
            <h4 className="mb-1 font-semibold text-sm">Why This Matters:</h4>
            <p className="text-sm text-muted-foreground">
              {guardrail.explanation}
            </p>
          </div>

          {/* What Was Detected */}
          <div>
            <h4 className="mb-1 font-semibold text-sm">What Was Detected:</h4>
            <p className="text-sm text-muted-foreground">
              {guardrail.detected}
            </p>
          </div>

          {/* Expandable Details Section */}
          <div>
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className={cn(
                "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium",
                "transition-colors duration-150 hover:bg-muted",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              )}
              aria-expanded={isExpanded}
            >
              <span>How It Works</span>
              <motion.span
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{
                  duration: prefersReducedMotion ? 0 : 0.2,
                  ease: "easeInOut" as const,
                }}
                aria-hidden="true"
              >
                ▼
              </motion.span>
            </button>

            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.div
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={expandVariants}
                  className="overflow-hidden"
                >
                  <div className="mt-2 space-y-3 rounded-md bg-muted/50 p-4 text-sm">
                    <div>
                      <h5 className="mb-1 font-semibold">Implementation:</h5>
                      <p className="text-muted-foreground">
                        {guardrail.implementation}
                      </p>
                    </div>

                    <div>
                      <h5 className="mb-1 font-semibold">Source Code:</h5>
                      <a
                        href={sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`View source code in ${guardrail.sourceFile} (opens in new tab)`}
                        className={cn(
                          "inline-flex items-center gap-1 text-info underline-offset-4",
                          "transition-all duration-150 hover:underline hover:text-info/80",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-info focus-visible:ring-offset-2 rounded-sm",
                        )}
                      >
                        <span>{guardrail.sourceFile}</span>
                        {guardrail.lineNumbers && (
                          <span className="text-muted-foreground">
                            :{guardrail.lineNumbers}
                          </span>
                        )}
                        <span aria-hidden="true">↗</span>
                      </a>
                    </div>

                    {/* Context Data (if available) */}
                    {guardrail.context &&
                      Object.keys(guardrail.context).length > 0 && (
                        <div>
                          <h5 className="mb-1 font-semibold">Details:</h5>
                          <dl className="grid grid-cols-2 gap-2 text-sm">
                            {Object.entries(guardrail.context).map(
                              ([key, value]) => (
                                <div key={key} className="flex flex-col">
                                  <dt className="text-xs text-muted-foreground">
                                    {key
                                      .replace(/([A-Z])/g, " $1")
                                      .replace(/^./, (str) =>
                                        str.toUpperCase(),
                                      )}
                                    :
                                  </dt>
                                  <dd className="font-mono text-xs">
                                    {typeof value === "object"
                                      ? JSON.stringify(value)
                                      : String(value)}
                                  </dd>
                                </div>
                              ),
                            )}
                          </dl>
                        </div>
                      )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Educational Footer */}
          <div className="border-t pt-3 text-xs text-muted-foreground">
            <p>
              This portfolio demonstrates production-grade AI security. Every
              guardrail violation is an opportunity to showcase the
              implementation.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
