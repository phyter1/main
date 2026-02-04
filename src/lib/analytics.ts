/**
 * Analytics utility for tracking AI feature usage in a privacy-respecting manner.
 *
 * This module provides functions to track user interactions with AI features
 * using Umami custom events. All tracking is privacy-respecting:
 * - Only tracks counts/interactions, never content
 * - No PII (Personally Identifiable Information) is collected
 * - No message content, job descriptions, or user data is tracked
 *
 * Umami Configuration:
 * - Website ID: 81d82483-e533-456e-beaa-85e1c2858092
 * - Script loaded in layout.tsx
 * - Uses window.umami.track() API
 *
 * @module analytics
 */

/**
 * Extended Window interface to include Umami global
 */
declare global {
  interface Window {
    umami?: {
      track: (eventName: string, eventData?: Record<string, unknown>) => void;
    };
  }
}

/**
 * Safely execute Umami tracking with error handling
 *
 * @param callback - Function to execute that calls Umami tracking
 */
function safeTrack(callback: () => void): void {
  try {
    // Check if running in browser environment
    if (typeof window === "undefined") {
      return;
    }

    // Check if Umami is loaded
    if (!window.umami?.track) {
      return;
    }

    callback();
  } catch (error) {
    // Silently fail - analytics should never break the application
    console.warn("Analytics tracking failed:", error);
  }
}

/**
 * Track a chat message interaction.
 *
 * Privacy-respecting: Only tracks that a message was sent, NOT the message content.
 * This allows us to understand chat feature usage without collecting sensitive data.
 *
 * @example
 * ```typescript
 * // In ChatInterface.tsx - after successful message send
 * trackChatMessage();
 * ```
 */
export function trackChatMessage(): void {
  safeTrack(() => {
    window.umami?.track("ai-chat-message");
  });
}

/**
 * Track a fit assessment interaction.
 *
 * Privacy-respecting: Only tracks that an assessment was performed, NOT the job description.
 * This allows us to measure feature usage without collecting job posting content.
 *
 * @example
 * ```typescript
 * // In JobFitAnalyzer.tsx - after successful assessment
 * trackFitAssessment();
 * ```
 */
export function trackFitAssessment(): void {
  safeTrack(() => {
    window.umami?.track("ai-fit-assessment");
  });
}

/**
 * Track a context expansion interaction.
 *
 * Privacy-respecting: Only tracks the project ID, NOT the actual context content.
 * This allows us to understand which projects users are interested in without
 * collecting the STAR context details.
 *
 * @param projectId - The unique identifier of the project whose context was expanded
 *
 * @example
 * ```typescript
 * // In ExpandableContext.tsx - when user expands context
 * trackContextExpansion("hugo-connect");
 * ```
 */
export function trackContextExpansion(projectId: string): void {
  safeTrack(() => {
    window.umami?.track("ai-context-expansion", {
      projectId,
    });
  });
}
