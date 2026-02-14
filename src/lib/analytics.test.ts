import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  trackChatMessage,
  trackContextExpansion,
  trackFitAssessment,
} from "./analytics";

describe("Analytics Utility - Privacy-Respecting AI Feature Usage Tracking", () => {
  // Mock Umami tracking function
  let mockUmamiTrack: ReturnType<typeof mock>;

  beforeEach(() => {
    // Create mock for Umami tracking
    mockUmamiTrack = vi.fn(() => undefined);

    // Setup window.umami global (preserve existing window object)
    if (typeof window !== "undefined") {
      (window as any).umami = {
        track: mockUmamiTrack,
      };
    } else {
      (
        global as unknown as {
          window: { umami?: { track: typeof mockUmamiTrack } };
        }
      ).window = {
        umami: {
          track: mockUmamiTrack,
        },
      };
    }
  });

  afterEach(() => {
    // Clean up mocks but preserve window object
    mockUmamiTrack.mockClear();
    // Only delete umami property, not the entire window
    if (typeof window !== "undefined") {
      delete (window as any).umami;
    } else if ((global as any).window) {
      delete (global as any).window.umami;
    }
  });

  describe("trackChatMessage", () => {
    it("should track chat message interactions without content", () => {
      trackChatMessage();

      expect(mockUmamiTrack).toHaveBeenCalledTimes(1);
      expect(mockUmamiTrack).toHaveBeenCalledWith("ai-chat-message");
    });

    it("should not include message content in tracking", () => {
      trackChatMessage();

      // Verify no second argument (data) is passed
      expect(mockUmamiTrack).toHaveBeenCalledWith("ai-chat-message");
      const callArgs = mockUmamiTrack.mock.calls[0];
      expect(callArgs.length).toBe(1);
    });

    it("should handle missing Umami gracefully", () => {
      // Remove Umami from window
      (global as unknown as { window: { umami?: unknown } }).window.umami =
        undefined;

      // Should not throw error
      expect(() => trackChatMessage()).not.toThrow();
    });

    it("should handle missing window object gracefully", () => {
      delete (global as unknown as { window?: unknown }).window;

      // Should not throw error
      expect(() => trackChatMessage()).not.toThrow();
    });
  });

  describe("trackFitAssessment", () => {
    it("should track fit assessment interactions without job description", () => {
      trackFitAssessment();

      expect(mockUmamiTrack).toHaveBeenCalledTimes(1);
      expect(mockUmamiTrack).toHaveBeenCalledWith("ai-fit-assessment");
    });

    it("should not include job description in tracking", () => {
      trackFitAssessment();

      // Verify no second argument (data) is passed
      expect(mockUmamiTrack).toHaveBeenCalledWith("ai-fit-assessment");
      const callArgs = mockUmamiTrack.mock.calls[0];
      expect(callArgs.length).toBe(1);
    });

    it("should handle missing Umami gracefully", () => {
      (global as unknown as { window: { umami?: unknown } }).window.umami =
        undefined;

      expect(() => trackFitAssessment()).not.toThrow();
    });

    it("should handle missing window object gracefully", () => {
      delete (global as unknown as { window?: unknown }).window;

      expect(() => trackFitAssessment()).not.toThrow();
    });
  });

  describe("trackContextExpansion", () => {
    it("should track context expansion with project ID", () => {
      const projectId = "hugo-connect";

      trackContextExpansion(projectId);

      expect(mockUmamiTrack).toHaveBeenCalledTimes(1);
      expect(mockUmamiTrack).toHaveBeenCalledWith("ai-context-expansion", {
        projectId,
      });
    });

    it("should handle various project ID formats", () => {
      const testIds = ["hugo-connect", "ehr-integration", "survey-platform"];

      for (const projectId of testIds) {
        trackContextExpansion(projectId);
      }

      expect(mockUmamiTrack).toHaveBeenCalledTimes(3);

      // Verify each call has correct project ID
      for (let i = 0; i < testIds.length; i++) {
        expect(mockUmamiTrack.mock.calls[i]).toEqual([
          "ai-context-expansion",
          { projectId: testIds[i] },
        ]);
      }
    });

    it("should not include context content in tracking", () => {
      trackContextExpansion("test-project");

      // Verify only project ID is passed, not full context
      const callArgs = mockUmamiTrack.mock.calls[0];
      expect(callArgs[1]).toEqual({ projectId: "test-project" });
      expect(callArgs[1]).not.toHaveProperty("situation");
      expect(callArgs[1]).not.toHaveProperty("task");
      expect(callArgs[1]).not.toHaveProperty("action");
      expect(callArgs[1]).not.toHaveProperty("result");
    });

    it("should handle missing Umami gracefully", () => {
      (global as unknown as { window: { umami?: unknown } }).window.umami =
        undefined;

      expect(() => trackContextExpansion("test-project")).not.toThrow();
    });

    it("should handle missing window object gracefully", () => {
      delete (global as unknown as { window?: unknown }).window;

      expect(() => trackContextExpansion("test-project")).not.toThrow();
    });

    it("should handle empty project ID", () => {
      trackContextExpansion("");

      expect(mockUmamiTrack).toHaveBeenCalledWith("ai-context-expansion", {
        projectId: "",
      });
    });
  });

  describe("Privacy Validation", () => {
    it("should never track PII or sensitive content", () => {
      // Simulate all tracking functions
      trackChatMessage();
      trackFitAssessment();
      trackContextExpansion("project-123");

      // Verify no call includes content or sensitive data
      const allCalls = mockUmamiTrack.mock.calls;

      for (const call of allCalls) {
        const eventName = call[0];
        const eventData = call[1];

        // Verify event names are generic
        expect(eventName).toMatch(
          /^ai-(chat-message|fit-assessment|context-expansion)$/,
        );

        // If eventData exists, verify it only contains non-sensitive metadata
        if (eventData) {
          expect(eventData).not.toHaveProperty("content");
          expect(eventData).not.toHaveProperty("message");
          expect(eventData).not.toHaveProperty("jobDescription");
          expect(eventData).not.toHaveProperty("description");
          expect(eventData).not.toHaveProperty("text");
          expect(eventData).not.toHaveProperty("user");
          expect(eventData).not.toHaveProperty("email");
          expect(eventData).not.toHaveProperty("name");
        }
      }
    });
  });

  describe("Umami Integration", () => {
    it("should use Umami custom events API correctly", () => {
      trackChatMessage();

      // Verify window.umami.track is called (not window.umami.trackEvent or other methods)
      expect(mockUmamiTrack).toHaveBeenCalled();
    });

    it("should work with existing Umami configuration", () => {
      // The Umami script is loaded in layout.tsx with website ID: 81d82483-e533-456e-beaa-85e1c2858092
      // Our functions should work without additional configuration
      trackChatMessage();
      trackFitAssessment();
      trackContextExpansion("test");

      expect(mockUmamiTrack).toHaveBeenCalledTimes(3);
    });
  });

  describe("Error Handling", () => {
    it("should not throw if Umami.track throws an error", () => {
      mockUmamiTrack = vi.fn(() => {
        throw new Error("Umami tracking failed");
      });
      (
        global as unknown as {
          window: { umami: { track: typeof mockUmamiTrack } };
        }
      ).window.umami = {
        track: mockUmamiTrack,
      };

      expect(() => trackChatMessage()).not.toThrow();
      expect(() => trackFitAssessment()).not.toThrow();
      expect(() => trackContextExpansion("test")).not.toThrow();
    });

    it("should handle null or undefined gracefully", () => {
      expect(() => trackChatMessage()).not.toThrow();
      expect(() => trackFitAssessment()).not.toThrow();
      expect(() =>
        trackContextExpansion(null as unknown as string),
      ).not.toThrow();
      expect(() =>
        trackContextExpansion(undefined as unknown as string),
      ).not.toThrow();
    });
  });
});
