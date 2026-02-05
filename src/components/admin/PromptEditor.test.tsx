import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PromptEditor } from "./PromptEditor";

describe("PromptEditor", () => {
  const mockInitialPrompt = "You are a helpful AI assistant.";

  beforeEach(() => {
    // Reset fetch mock before each test
    global.fetch = mock(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            proposedPrompt: "You are a helpful and friendly AI assistant.",
            diffSummary: "Added 'friendly' to the prompt",
            tokenCountOriginal: 10,
            tokenCountProposed: 12,
            changes: ["Added 'friendly' adjective"],
          }),
      } as Response),
    );
  });

  afterEach(() => {
    cleanup();
    mock.restore();
  });

  describe("Core Functionality", () => {
    it("should render with initial prompt", () => {
      render(
        <PromptEditor agentType="chat" initialPrompt={mockInitialPrompt} />,
      );

      expect(screen.getByText("Current Prompt")).toBeTruthy();
      expect(screen.getByText(mockInitialPrompt)).toBeTruthy();
    });

    it("should render refinement chat interface", () => {
      render(
        <PromptEditor agentType="chat" initialPrompt={mockInitialPrompt} />,
      );

      expect(screen.getByText("Refinement Chat")).toBeTruthy();
      expect(
        screen.getByPlaceholderText("Describe how to refine the prompt..."),
      ).toBeTruthy();
      expect(
        screen.getByRole("button", { name: /Refine Prompt/i }),
      ).toBeTruthy();
    });

    it("should display agent type in UI", () => {
      render(
        <PromptEditor
          agentType="fit-assessment"
          initialPrompt={mockInitialPrompt}
        />,
      );

      expect(screen.getByText(/fit-assessment/i)).toBeTruthy();
    });
  });

  describe("Refinement Flow", () => {
    it("should handle refinement request and show proposed prompt", async () => {
      const user = userEvent.setup();

      render(
        <PromptEditor agentType="chat" initialPrompt={mockInitialPrompt} />,
      );

      const textarea = screen.getByPlaceholderText(
        "Describe how to refine the prompt...",
      );
      const refineButton = screen.getByRole("button", {
        name: /Refine Prompt/i,
      });

      await user.type(textarea, "Make it more friendly");
      await user.click(refineButton);

      await waitFor(() => {
        expect(screen.getByText("Proposed Prompt")).toBeTruthy();
      });
    });

    it("should show diff view after refinement", async () => {
      const user = userEvent.setup();

      render(
        <PromptEditor agentType="chat" initialPrompt={mockInitialPrompt} />,
      );

      const textarea = screen.getByPlaceholderText(
        "Describe how to refine the prompt...",
      );
      const refineButton = screen.getByRole("button", {
        name: /Refine Prompt/i,
      });

      await user.type(textarea, "Make it more friendly");
      await user.click(refineButton);

      await waitFor(() => {
        expect(screen.getByText("Original Prompt")).toBeTruthy();
        expect(screen.getByText("Proposed Prompt")).toBeTruthy();
      });
    });

    it("should display refinement history", async () => {
      const user = userEvent.setup();

      render(
        <PromptEditor agentType="chat" initialPrompt={mockInitialPrompt} />,
      );

      const textarea = screen.getByPlaceholderText(
        "Describe how to refine the prompt...",
      );
      const refineButton = screen.getByRole("button", {
        name: /Refine Prompt/i,
      });

      await user.type(textarea, "Make it more friendly");
      await user.click(refineButton);

      await waitFor(() => {
        expect(screen.getByText("Make it more friendly")).toBeTruthy();
      });
    });

    it("should clear textarea after successful refinement", async () => {
      const user = userEvent.setup();

      render(
        <PromptEditor agentType="chat" initialPrompt={mockInitialPrompt} />,
      );

      const textarea = screen.getByPlaceholderText(
        "Describe how to refine the prompt...",
      ) as HTMLTextAreaElement;
      const refineButton = screen.getByRole("button", {
        name: /Refine Prompt/i,
      });

      await user.type(textarea, "Make it more friendly");
      await user.click(refineButton);

      await waitFor(() => {
        expect(textarea.value).toBe("");
      });
    });
  });

  describe("Action Buttons", () => {
    it("should show action buttons after refinement", async () => {
      const user = userEvent.setup();

      render(
        <PromptEditor agentType="chat" initialPrompt={mockInitialPrompt} />,
      );

      const textarea = screen.getByPlaceholderText(
        "Describe how to refine the prompt...",
      );
      const refineButton = screen.getByRole("button", {
        name: /Refine Prompt/i,
      });

      await user.type(textarea, "Make it more friendly");
      await user.click(refineButton);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /Test Changes/i }),
        ).toBeTruthy();
        expect(
          screen.getByRole("button", { name: /Apply Changes/i }),
        ).toBeTruthy();
        expect(screen.getByRole("button", { name: /Revert/i })).toBeTruthy();
      });
    });

    it("should apply changes and update current prompt", async () => {
      const user = userEvent.setup();

      render(
        <PromptEditor agentType="chat" initialPrompt={mockInitialPrompt} />,
      );

      const textarea = screen.getByPlaceholderText(
        "Describe how to refine the prompt...",
      );
      const refineButton = screen.getByRole("button", {
        name: /Refine Prompt/i,
      });

      await user.type(textarea, "Make it more friendly");
      await user.click(refineButton);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /Apply Changes/i }),
        ).toBeTruthy();
      });

      const applyButton = screen.getByRole("button", {
        name: /Apply Changes/i,
      });
      await user.click(applyButton);

      await waitFor(() => {
        expect(
          screen.getByText("You are a helpful and friendly AI assistant."),
        ).toBeTruthy();
      });
    });

    it("should revert changes and clear proposed prompt", async () => {
      const user = userEvent.setup();

      render(
        <PromptEditor agentType="chat" initialPrompt={mockInitialPrompt} />,
      );

      const textarea = screen.getByPlaceholderText(
        "Describe how to refine the prompt...",
      );
      const refineButton = screen.getByRole("button", {
        name: /Refine Prompt/i,
      });

      await user.type(textarea, "Make it more friendly");
      await user.click(refineButton);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /Revert/i })).toBeTruthy();
      });

      const revertButton = screen.getByRole("button", { name: /Revert/i });
      await user.click(revertButton);

      await waitFor(() => {
        expect(screen.queryByText("Proposed Prompt")).toBeFalsy();
      });
    });
  });

  describe("Loading States", () => {
    it("should show loading state during refinement", async () => {
      const user = userEvent.setup();

      // Mock delayed response
      global.fetch = mock(
        () =>
          new Promise((resolve) => {
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: () =>
                    Promise.resolve({
                      proposedPrompt: "Updated prompt",
                      diffSummary: "Test changes",
                      tokenCountOriginal: 10,
                      tokenCountProposed: 12,
                      changes: ["Test change"],
                    }),
                } as Response),
              100,
            );
          }),
      );

      render(
        <PromptEditor agentType="chat" initialPrompt={mockInitialPrompt} />,
      );

      const textarea = screen.getByPlaceholderText(
        "Describe how to refine the prompt...",
      );
      const refineButton = screen.getByRole("button", {
        name: /Refine Prompt/i,
      });

      await user.type(textarea, "Make it more friendly");
      await user.click(refineButton);

      expect(refineButton.hasAttribute("disabled")).toBe(true);
    });

    it("should re-enable button after refinement completes", async () => {
      const user = userEvent.setup();

      render(
        <PromptEditor agentType="chat" initialPrompt={mockInitialPrompt} />,
      );

      const textarea = screen.getByPlaceholderText(
        "Describe how to refine the prompt...",
      ) as HTMLTextAreaElement;
      const refineButton = screen.getByRole("button", {
        name: /Refine Prompt/i,
      });

      await user.type(textarea, "Make it more friendly");
      await user.click(refineButton);

      // After completion, textarea should be empty and button should show "Refine Prompt" again
      await waitFor(
        () => {
          expect(textarea.value).toBe("");
          const button = screen.getByRole("button", { name: /Refine Prompt/i });
          expect(button.textContent).not.toContain("Refining...");
        },
        { timeout: 3000 },
      );
    });
  });

  describe("Error Handling", () => {
    it("should handle API errors gracefully", async () => {
      const user = userEvent.setup();

      global.fetch = mock(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          json: () => Promise.resolve({ error: "Internal server error" }),
        } as Response),
      );

      render(
        <PromptEditor agentType="chat" initialPrompt={mockInitialPrompt} />,
      );

      const textarea = screen.getByPlaceholderText(
        "Describe how to refine the prompt...",
      );
      const refineButton = screen.getByRole("button", {
        name: /Refine Prompt/i,
      });

      await user.type(textarea, "Make it more friendly");
      await user.click(refineButton);

      await waitFor(() => {
        const errorMessages = screen.getAllByText(/error/i);
        expect(errorMessages.length).toBeGreaterThan(0);
      });
    });

    it("should handle network errors", async () => {
      const user = userEvent.setup();

      global.fetch = mock(() => Promise.reject(new Error("Network error")));

      render(
        <PromptEditor agentType="chat" initialPrompt={mockInitialPrompt} />,
      );

      const textarea = screen.getByPlaceholderText(
        "Describe how to refine the prompt...",
      );
      const refineButton = screen.getByRole("button", {
        name: /Refine Prompt/i,
      });

      await user.type(textarea, "Make it more friendly");
      await user.click(refineButton);

      await waitFor(() => {
        const errorMessages = screen.getAllByText(/error/i);
        expect(errorMessages.length).toBeGreaterThan(0);
      });
    });

    it("should not submit empty refinement requests", async () => {
      render(
        <PromptEditor agentType="chat" initialPrompt={mockInitialPrompt} />,
      );

      const refineButton = screen.getByRole("button", {
        name: /Refine Prompt/i,
      });

      expect(refineButton.hasAttribute("disabled")).toBe(true);
    });
  });

  describe("API Integration", () => {
    it("should call /api/admin/refine-prompt with correct payload", async () => {
      const user = userEvent.setup();
      const mockFetch = mock(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              proposedPrompt: "Updated prompt",
              diffSummary: "Test changes",
              tokenCountOriginal: 10,
              tokenCountProposed: 12,
              changes: ["Test change"],
            }),
        } as Response),
      );
      global.fetch = mockFetch;

      render(
        <PromptEditor agentType="chat" initialPrompt={mockInitialPrompt} />,
      );

      const textarea = screen.getByPlaceholderText(
        "Describe how to refine the prompt...",
      );
      const refineButton = screen.getByRole("button", {
        name: /Refine Prompt/i,
      });

      await user.type(textarea, "Make it more friendly");
      await user.click(refineButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      const callArgs = mockFetch.mock.calls[0];
      expect(callArgs[0]).toBe("/api/admin/refine-prompt");

      const requestBody = JSON.parse(callArgs[1].body);
      expect(requestBody.agentType).toBe("chat");
      expect(requestBody.currentPrompt).toBe(mockInitialPrompt);
      expect(requestBody.refinementRequest).toBe("Make it more friendly");
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty initial prompt", () => {
      render(<PromptEditor agentType="chat" initialPrompt="" />);

      expect(screen.getByText("Current Prompt")).toBeTruthy();
    });

    it("should handle very long prompts", () => {
      const longPrompt = "A".repeat(10000);

      render(<PromptEditor agentType="chat" initialPrompt={longPrompt} />);

      expect(screen.getByText("Current Prompt")).toBeTruthy();
    });

    it("should handle multiple refinements in sequence", async () => {
      const user = userEvent.setup();

      render(
        <PromptEditor agentType="chat" initialPrompt={mockInitialPrompt} />,
      );

      const textarea = screen.getByPlaceholderText(
        "Describe how to refine the prompt...",
      );
      const refineButton = screen.getByRole("button", {
        name: /Refine Prompt/i,
      });

      // First refinement
      await user.type(textarea, "Make it more friendly");
      await user.click(refineButton);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /Apply Changes/i }),
        ).toBeTruthy();
      });

      const applyButton = screen.getByRole("button", {
        name: /Apply Changes/i,
      });
      await user.click(applyButton);

      // Second refinement
      await user.type(textarea, "Make it more professional");
      await user.click(refineButton);

      await waitFor(() => {
        expect(screen.getAllByText(/Make it more/i).length).toBeGreaterThan(1);
      });
    });
  });

  describe("Responsive Layout", () => {
    it("should apply responsive grid classes", () => {
      const { container } = render(
        <PromptEditor agentType="chat" initialPrompt={mockInitialPrompt} />,
      );

      const gridContainer = container.querySelector(".lg\\:grid-cols-2");
      expect(gridContainer).toBeTruthy();
    });
  });
});
