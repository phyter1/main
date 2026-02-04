"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { trackFitAssessment } from "@/lib/analytics";

/**
 * Response structure from /api/fit-assessment
 */
interface FitAssessmentResponse {
  fitLevel: "strong" | "moderate" | "weak";
  reasoning: string[];
  recommendations: string[];
}

/**
 * Error response from API
 */
interface ErrorResponse {
  error: string;
  retryAfter?: number;
}

/**
 * Component state for form and results
 */
interface JobFitAnalyzerState {
  jobDescription: string;
  loading: boolean;
  result: FitAssessmentResponse | null;
  error: string | null;
}

/**
 * Maximum character limit for job description
 */
const MAX_CHARS = 10000;

/**
 * Get badge variant based on fit level
 */
function getFitBadgeVariant(
  fitLevel: "strong" | "moderate" | "weak",
): "default" | "secondary" | "destructive" {
  switch (fitLevel) {
    case "strong":
      return "default";
    case "moderate":
      return "secondary";
    case "weak":
      return "destructive";
  }
}

/**
 * Get badge className for color coding
 */
function getFitBadgeClassName(
  fitLevel: "strong" | "moderate" | "weak",
): string {
  switch (fitLevel) {
    case "strong":
      return "bg-green-600 hover:bg-green-700 text-white";
    case "moderate":
      return "bg-yellow-600 hover:bg-yellow-700 text-white";
    case "weak":
      return "bg-red-600 hover:bg-red-700 text-white";
  }
}

/**
 * Get human-readable fit level text
 */
function getFitLevelText(fitLevel: "strong" | "moderate" | "weak"): string {
  switch (fitLevel) {
    case "strong":
      return "Strong Fit";
    case "moderate":
      return "Moderate Fit";
    case "weak":
      return "Weak Fit";
  }
}

/**
 * JobFitAnalyzer - Component for analyzing job fit based on resume
 *
 * Features:
 * - Large textarea for pasting job descriptions
 * - Form validation (required, max 10k chars)
 * - API integration with /api/fit-assessment
 * - Loading state during analysis
 * - Color-coded fit level badges (green/yellow/red)
 * - Reasoning bullets display
 * - Recommendations section
 * - Comprehensive error handling
 */
export function JobFitAnalyzer() {
  const [state, setState] = useState<JobFitAnalyzerState>({
    jobDescription: "",
    loading: false,
    result: null,
    error: null,
  });

  /**
   * Handle textarea input change
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;

    // Clear previous errors when user starts typing
    if (state.error) {
      setState((prev) => ({ ...prev, error: null }));
    }

    // Validate max length
    if (value.length > MAX_CHARS) {
      setState((prev) => ({
        ...prev,
        error: `Job description must not exceed ${MAX_CHARS.toLocaleString()} characters`,
      }));
      return;
    }

    setState((prev) => ({ ...prev, jobDescription: value }));
  };

  /**
   * Validate form input
   */
  const validateInput = (): boolean => {
    const trimmed = state.jobDescription.trim();

    if (!trimmed) {
      setState((prev) => ({
        ...prev,
        error: "Job description is required and cannot be empty",
      }));
      return false;
    }

    if (trimmed.length > MAX_CHARS) {
      setState((prev) => ({
        ...prev,
        error: `Job description must not exceed ${MAX_CHARS.toLocaleString()} characters`,
      }));
      return false;
    }

    return true;
  };

  /**
   * Handle form submission and API call
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate input
    if (!validateInput()) {
      return;
    }

    // Clear previous results and errors
    setState((prev) => ({
      ...prev,
      loading: true,
      error: null,
      result: null,
    }));

    try {
      const response = await fetch("/api/fit-assessment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobDescription: state.jobDescription.trim(),
        }),
      });

      if (!response.ok) {
        // Handle error response
        const errorData: ErrorResponse = await response.json();

        if (response.status === 429) {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: `Rate limit exceeded. Please try again in ${errorData.retryAfter || 60} seconds.`,
          }));
          return;
        }

        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorData.error || "Failed to process fit assessment",
        }));
        return;
      }

      // Success - parse and display results
      const result: FitAssessmentResponse = await response.json();

      // Track fit assessment interaction (privacy-respecting - no job description tracked)
      trackFitAssessment();

      setState((prev) => ({
        ...prev,
        loading: false,
        result,
      }));
    } catch (error) {
      console.error("Error analyzing job fit:", error);

      setState((prev) => ({
        ...prev,
        loading: false,
        error:
          "Something went wrong. Failed to analyze job fit. Please try again.",
      }));
    }
  };

  return (
    <section className="container mx-auto max-w-4xl px-6 py-12">
      <Card>
        <CardHeader>
          <CardTitle>Job Fit Analyzer</CardTitle>
          <CardDescription>
            Paste a job description to see how well it matches your experience
            and skills
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Job Description Input */}
            <div className="space-y-2">
              <label
                htmlFor="job-description"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Job Description
              </label>
              <Textarea
                id="job-description"
                value={state.jobDescription}
                onChange={handleInputChange}
                placeholder="Paste the full job description here..."
                className="min-h-[300px] resize-y"
                disabled={state.loading}
                aria-label="Job Description"
                aria-invalid={!!state.error}
                aria-describedby={state.error ? "error-message" : undefined}
              />
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  {state.jobDescription.length.toLocaleString()} /{" "}
                  {MAX_CHARS.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Error Message */}
            {state.error && (
              <div
                id="error-message"
                className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive"
                role="alert"
              >
                {state.error}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={state.loading || !state.jobDescription.trim()}
              className="w-full sm:w-auto"
            >
              {state.loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Analyze Fit"
              )}
            </Button>
          </form>

          {/* Results Display */}
          {state.result && (
            <div className="mt-8 space-y-6">
              {/* Fit Level Badge */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">Fit Level:</span>
                <Badge
                  variant={getFitBadgeVariant(state.result.fitLevel)}
                  className={getFitBadgeClassName(state.result.fitLevel)}
                >
                  {getFitLevelText(state.result.fitLevel)}
                </Badge>
              </div>

              {/* Reasoning Section */}
              {state.result.reasoning.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold">Reasoning</h3>
                  <ul className="space-y-2">
                    {state.result.reasoning.map((reason, index) => (
                      <li
                        key={`reason-${
                          // biome-ignore lint/suspicious/noArrayIndexKey: List is static after API response
                          index
                        }`}
                        className="flex gap-2 text-sm text-muted-foreground"
                      >
                        <span className="text-primary">•</span>
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations Section */}
              {state.result.recommendations.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold">Recommendations</h3>
                  <ul className="space-y-2">
                    {state.result.recommendations.map(
                      (recommendation, index) => (
                        <li
                          key={`rec-${
                            // biome-ignore lint/suspicious/noArrayIndexKey: List is static after API response
                            index
                          }`}
                          className="flex gap-2 text-sm text-muted-foreground"
                        >
                          <span className="text-primary">→</span>
                          <span>{recommendation}</span>
                        </li>
                      ),
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
