/**
 * Prompt History Page Tests
 * Tests for the prompt history viewer page
 */

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import PromptHistoryPage from "./page";

// Polyfill for pointer capture (not supported in happy-dom)
if (typeof Element !== "undefined") {
  if (!Element.prototype.hasPointerCapture) {
    Element.prototype.hasPointerCapture = () => false;
  }
  if (!Element.prototype.setPointerCapture) {
    Element.prototype.setPointerCapture = () => {};
  }
  if (!Element.prototype.releasePointerCapture) {
    Element.prototype.releasePointerCapture = () => {};
  }
}

// Mock fetch globally
const mockFetch = vi.fn();
globalThis.fetch = mockFetch as unknown as typeof fetch;

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock admin components
vi.mock("@/components/admin", () => ({
  PromptDiff: ({
    original,
    proposed,
  }: {
    original: string;
    proposed: string;
  }) => (
    <div data-testid="prompt-diff">
      <div data-testid="original">{original}</div>
      <div data-testid="proposed">{proposed}</div>
    </div>
  ),
}));

describe("PromptHistoryPage", () => {
  const mockVersions = [
    {
      id: "version-1",
      agentType: "chat" as const,
      prompt: "Test prompt 1",
      description: "Initial version",
      author: "Admin",
      tokenCount: 100,
      createdAt: "2026-02-04T10:00:00Z",
      isActive: true,
    },
    {
      id: "version-2",
      agentType: "chat" as const,
      prompt: "Test prompt 2",
      description: "Updated version",
      author: "Admin",
      tokenCount: 120,
      createdAt: "2026-02-03T10:00:00Z",
      isActive: false,
    },
    {
      id: "version-3",
      agentType: "fit-assessment" as const,
      prompt: "Test prompt 3",
      description: "Fit assessment prompt",
      author: "Admin",
      tokenCount: 150,
      createdAt: "2026-02-02T10:00:00Z",
      isActive: true,
    },
  ];

  beforeEach(() => {
    // Reset mocks before each test
    mockFetch.mockReset();
    mockPush.mockReset();

    // Smart mock that filters versions based on agentType query param
    mockFetch.mockImplementation(async (url: string) => {
      const urlStr = url.toString();
      let filteredVersions = mockVersions;

      if (urlStr.includes("agentType=chat")) {
        filteredVersions = mockVersions.filter((v) => v.agentType === "chat");
      } else if (urlStr.includes("agentType=fit-assessment")) {
        filteredVersions = mockVersions.filter(
          (v) => v.agentType === "fit-assessment",
        );
      }

      return {
        ok: true,
        json: async () => ({ versions: filteredVersions }),
      } as Response;
    });
  });

  afterEach(() => {
    cleanup();
  });

  describe("Initial Rendering", () => {
    it("should render the page title", async () => {
      render(<PromptHistoryPage />);

      expect(screen.getByText("Prompt History")).toBeDefined();
    });

    it("should render filter dropdown with default value", async () => {
      render(<PromptHistoryPage />);

      await waitFor(() => {
        const selectTriggers = screen.getAllByText(/All Agents/i);
        expect(selectTriggers.length).toBeGreaterThan(0);
      });
    });

    it("should fetch all prompt versions on initial load", async () => {
      render(<PromptHistoryPage />);

      await waitFor(() => {
        // For "all" filter, we make 2 calls (chat + fit-assessment)
        expect(mockFetch).toHaveBeenCalled();
        expect(mockFetch.mock.calls.length).toBeGreaterThanOrEqual(2);
      });

      // Check that both agent types were fetched
      const calls = mockFetch.mock.calls.map((call) => call[0] as string);
      expect(calls.some((url) => url.includes("agentType=chat"))).toBe(true);
      expect(
        calls.some((url) => url.includes("agentType=fit-assessment")),
      ).toBe(true);
    });

    it("should display loading state while fetching", async () => {
      // Mock a delayed response
      mockFetch.mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({ versions: mockVersions }),
                } as Response),
              100,
            );
          }),
      );

      render(<PromptHistoryPage />);

      expect(screen.getByText(/Loading/i)).toBeDefined();
    });
  });

  describe("Version Display", () => {
    it("should display all versions after successful fetch", async () => {
      render(<PromptHistoryPage />);

      await waitFor(
        () => {
          expect(screen.queryByText(/Initial version/)).not.toBeNull();
          expect(screen.queryByText(/Updated version/)).not.toBeNull();
          expect(screen.queryByText(/Fit assessment prompt/)).not.toBeNull();
        },
        { timeout: 3000 },
      );
    });

    it("should display version metadata", async () => {
      render(<PromptHistoryPage />);

      await waitFor(
        () => {
          const authorElements = screen.queryAllByText(/Author: Admin/);
          expect(authorElements.length).toBeGreaterThan(0);

          const tokenElements = screen.queryAllByText(/Tokens: 100/);
          expect(tokenElements.length).toBeGreaterThan(0);
        },
        { timeout: 3000 },
      );
    });

    it("should display Active badge for active versions", async () => {
      render(<PromptHistoryPage />);

      await waitFor(
        () => {
          const activeBadges = screen.queryAllByText("Active");
          expect(activeBadges.length).toBeGreaterThanOrEqual(2); // version-1 and version-3 are active
        },
        { timeout: 3000 },
      );
    });

    it("should format timestamps correctly", async () => {
      render(<PromptHistoryPage />);

      await waitFor(
        () => {
          // Check that a formatted date string appears
          const timestampElement = screen.queryByText(
            /2\/4\/2026|Feb 4, 2026/i,
          );
          expect(timestampElement).not.toBeNull();
        },
        { timeout: 3000 },
      );
    });
  });

  describe("Filtering", () => {
    it("should filter by agent type when filter is changed", async () => {
      const user = userEvent.setup();
      render(<PromptHistoryPage />);

      await waitFor(
        () => {
          expect(screen.queryByText(/Initial version/)).not.toBeNull();
        },
        { timeout: 3000 },
      );

      // Mock filtered response for chat agent
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          versions: mockVersions.filter((v) => v.agentType === "chat"),
        }),
      } as Response);

      // Find and click filter dropdown (use getAllByRole and take first one)
      const filterButtons = screen.queryAllByRole("combobox");
      await user.click(filterButtons[0]);

      // Select "Chat Agent" option
      const chatOption = screen.queryByText("Chat Agent");
      expect(chatOption).not.toBeNull();
      if (chatOption) await user.click(chatOption);

      await waitFor(
        () => {
          // Should fetch with chat filter
          const lastCallArgs = mockFetch.mock.calls[
            mockFetch.mock.calls.length - 1
          ] as [string];
          expect(lastCallArgs[0]).toContain("agentType=chat");
        },
        { timeout: 3000 },
      );
    });

    it("should show only filtered versions after applying filter", async () => {
      const user = userEvent.setup();
      render(<PromptHistoryPage />);

      await waitFor(
        () => {
          expect(screen.queryByText(/Fit assessment prompt/)).not.toBeNull();
        },
        { timeout: 3000 },
      );

      // Mock filtered response
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          versions: mockVersions.filter((v) => v.agentType === "chat"),
        }),
      } as Response);

      const filterButtons = screen.queryAllByRole("combobox");
      await user.click(filterButtons[0]);

      const chatOption = screen.queryByText("Chat Agent");
      expect(chatOption).not.toBeNull();
      if (chatOption) await user.click(chatOption);

      await waitFor(
        () => {
          // Fit assessment version should not be visible
          expect(screen.queryByText(/Fit assessment prompt/)).toBeNull();
          // Chat versions should be visible
          expect(screen.queryByText(/Initial version/)).not.toBeNull();
        },
        { timeout: 3000 },
      );
    });
  });

  describe("Version Actions", () => {
    it("should render View Diff button for each version", async () => {
      render(<PromptHistoryPage />);

      await waitFor(
        () => {
          const viewDiffButtons = screen.queryAllByText("View Diff");
          expect(viewDiffButtons.length).toBeGreaterThanOrEqual(3); // One for each version
        },
        { timeout: 3000 },
      );
    });

    it("should render Test Version button for each version", async () => {
      render(<PromptHistoryPage />);

      await waitFor(
        () => {
          const testButtons = screen.queryAllByText("Test Version");
          expect(testButtons.length).toBeGreaterThanOrEqual(3);
        },
        { timeout: 3000 },
      );
    });

    it("should render Rollback button only for inactive versions", async () => {
      render(<PromptHistoryPage />);

      await waitFor(
        () => {
          const rollbackButtons = screen.queryAllByText("Rollback");
          expect(rollbackButtons.length).toBeGreaterThanOrEqual(1); // Only version-2 is inactive
        },
        { timeout: 3000 },
      );
    });

    it("should open diff modal when View Diff is clicked", async () => {
      const user = userEvent.setup();
      render(<PromptHistoryPage />);

      await waitFor(
        () => {
          expect(screen.queryByText(/Initial version/)).not.toBeNull();
        },
        { timeout: 3000 },
      );

      const viewDiffButtons = screen.queryAllByText("View Diff");
      await user.click(viewDiffButtons[0]);

      await waitFor(
        () => {
          // Modal should appear with PromptDiff component
          expect(screen.queryByTestId("prompt-diff")).not.toBeNull();
        },
        { timeout: 3000 },
      );
    });

    it("should navigate to test suite when Test Version is clicked", async () => {
      const user = userEvent.setup();
      render(<PromptHistoryPage />);

      await waitFor(
        () => {
          expect(screen.queryByText(/Initial version/)).not.toBeNull();
        },
        { timeout: 3000 },
      );

      const testButtons = screen.queryAllByText("Test Version");
      await user.click(testButtons[0]);

      await waitFor(
        () => {
          expect(mockPush).toHaveBeenCalledWith(
            expect.stringContaining("/admin/agent-workbench/test"),
          );
        },
        { timeout: 3000 },
      );
    });

    it("should call rollback API when Rollback is clicked", async () => {
      const user = userEvent.setup();
      render(<PromptHistoryPage />);

      await waitFor(
        () => {
          expect(screen.queryByText(/Updated version/)).not.toBeNull();
        },
        { timeout: 3000 },
      );

      // Mock successful rollback response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, versionId: "version-2" }),
      } as Response);

      // Mock refresh response for both agent types
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ versions: mockVersions }),
      } as Response);

      const rollbackButton = screen.queryByText("Rollback");
      expect(rollbackButton).not.toBeNull();
      if (rollbackButton) await user.click(rollbackButton);

      await waitFor(
        () => {
          // Should call deploy-prompt API
          const deployCall = mockFetch.mock.calls.find((call) =>
            (call[0] as string).includes("/api/admin/deploy-prompt"),
          );
          expect(deployCall).toBeDefined();
        },
        { timeout: 3000 },
      );
    });

    it("should refresh version list after successful rollback", async () => {
      const user = userEvent.setup();
      render(<PromptHistoryPage />);

      await waitFor(
        () => {
          expect(screen.queryByText(/Updated version/)).not.toBeNull();
        },
        { timeout: 3000 },
      );

      const initialFetchCount = mockFetch.mock.calls.length;

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, versionId: "version-2" }),
      } as Response);

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ versions: mockVersions }),
      } as Response);

      const rollbackButton = screen.queryByText("Rollback");
      expect(rollbackButton).not.toBeNull();
      if (rollbackButton) await user.click(rollbackButton);

      await waitFor(
        () => {
          // Should have made additional fetch calls (rollback + refresh)
          expect(mockFetch.mock.calls.length).toBeGreaterThan(
            initialFetchCount,
          );
        },
        { timeout: 3000 },
      );
    });
  });

  describe("Error Handling", () => {
    it("should display error message when fetch fails", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: async () => ({ error: "Failed to fetch versions" }),
      } as Response);

      render(<PromptHistoryPage />);

      await waitFor(() => {
        expect(
          screen.getByText(/Failed to load prompt history|Error/i),
        ).toBeDefined();
      });
    });

    it("should display error message when rollback fails", async () => {
      const user = userEvent.setup();
      render(<PromptHistoryPage />);

      await waitFor(
        () => {
          expect(screen.queryByText(/Updated version/)).not.toBeNull();
        },
        { timeout: 3000 },
      );

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "Rollback failed" }),
      } as Response);

      const rollbackButton = screen.queryByText("Rollback");
      expect(rollbackButton).not.toBeNull();
      if (rollbackButton) await user.click(rollbackButton);

      await waitFor(
        () => {
          expect(screen.queryByText(/Rollback failed|Error/i)).not.toBeNull();
        },
        { timeout: 3000 },
      );
    });

    it("should handle network errors gracefully", async () => {
      mockFetch.mockRejectedValue(new Error("Network error"));

      render(<PromptHistoryPage />);

      await waitFor(() => {
        expect(screen.getByText(/Error|Failed/i)).toBeDefined();
      });
    });
  });

  describe("Responsive Design", () => {
    it("should render cards in a responsive layout", async () => {
      const { container } = render(<PromptHistoryPage />);

      await waitFor(
        () => {
          expect(screen.queryByText(/Prompt History/i)).not.toBeNull();
        },
        { timeout: 3000 },
      );

      // Check that the main container exists
      const mainContainer = container.querySelector(".space-y-6");
      expect(mainContainer).not.toBeNull();
    });
  });
});
