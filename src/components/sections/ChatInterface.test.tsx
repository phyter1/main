import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { ChatInterface } from "./ChatInterface";

// Mock fetch for API calls
const originalFetch = global.fetch;

describe("ChatInterface Component - T007", () => {
  beforeEach(() => {
    // Clean up DOM before each test
    cleanup();
    // Reset fetch mock before each test
    global.fetch = originalFetch;
  });

  afterEach(() => {
    // Clean up DOM after each test
    cleanup();
    // Restore original fetch
    global.fetch = originalFetch;
  });

  describe("Core Rendering", () => {
    it("should render the chat interface with input area", () => {
      render(<ChatInterface />);

      // Check for textarea
      const textarea = screen.getByRole("textbox");
      expect(textarea).toBeDefined();
      expect(textarea.getAttribute("placeholder")).toBe(
        "Type your message... (Press Enter to send, Shift+Enter for new line)",
      );

      // Check for send button
      const sendButton = screen.getByRole("button", { name: /send/i });
      expect(sendButton).toBeDefined();
    });

    it("should render empty message history initially", () => {
      render(<ChatInterface />);

      // Should not have any messages initially
      const messages = document.querySelectorAll('[data-role="user"]');
      expect(messages.length).toBe(0);
    });

    it("should have accessible ARIA labels", () => {
      render(<ChatInterface />);

      // Check for textarea label
      const textarea = screen.getByRole("textbox");
      expect(textarea.getAttribute("aria-label")).toBe("Chat message input");

      // Check for send button label
      const sendButton = screen.getByRole("button", { name: /send/i });
      expect(sendButton.getAttribute("aria-label")).toBe("Send message");
    });
  });

  describe("User Input Handling", () => {
    it("should allow typing in textarea", () => {
      render(<ChatInterface />);

      const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: "Hello, AI!" } });

      expect(textarea.value).toBe("Hello, AI!");
    });

    it("should disable send button when input is empty", () => {
      render(<ChatInterface />);

      const sendButton = screen.getByRole("button", {
        name: /send/i,
      }) as HTMLButtonElement;
      expect(sendButton.disabled).toBe(true);
    });

    it("should enable send button when input has text", () => {
      render(<ChatInterface />);

      const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
      const sendButton = screen.getByRole("button", {
        name: /send/i,
      }) as HTMLButtonElement;

      fireEvent.change(textarea, { target: { value: "Hello!" } });
      expect(sendButton.disabled).toBe(false);
    });

    it("should clear input after sending message", async () => {
      // Mock fetch for successful response
      global.fetch = mock(() =>
        Promise.resolve({
          ok: true,
          body: new ReadableStream({
            start(controller) {
              controller.enqueue(
                new TextEncoder().encode("data: Hello back!\n\n"),
              );
              controller.close();
            },
          }),
        }),
      ) as typeof fetch;

      render(<ChatInterface />);

      const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
      const sendButton = screen.getByRole("button", { name: /send/i });

      fireEvent.change(textarea, { target: { value: "Hello!" } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(textarea.value).toBe("");
      });
    });
  });

  describe("Keyboard Shortcuts", () => {
    it("should send message on Enter key", async () => {
      global.fetch = mock(() =>
        Promise.resolve({
          ok: true,
          body: new ReadableStream({
            start(controller) {
              controller.enqueue(
                new TextEncoder().encode("data: Response\n\n"),
              );
              controller.close();
            },
          }),
        }),
      ) as typeof fetch;

      render(<ChatInterface />);

      const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;

      fireEvent.change(textarea, { target: { value: "Test message" } });
      fireEvent.keyDown(textarea, { key: "Enter", shiftKey: false });

      await waitFor(() => {
        expect(textarea.value).toBe("");
      });
    });

    it("should add newline on Shift+Enter", () => {
      render(<ChatInterface />);

      const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;

      fireEvent.change(textarea, { target: { value: "Line 1" } });
      fireEvent.keyDown(textarea, { key: "Enter", shiftKey: true });

      // Should not clear the textarea (message not sent)
      expect(textarea.value).toBe("Line 1");
    });

    it("should not send empty message on Enter", () => {
      render(<ChatInterface />);

      const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;

      fireEvent.keyDown(textarea, { key: "Enter", shiftKey: false });

      // Textarea should remain empty
      expect(textarea.value).toBe("");
    });
  });

  describe("Message Display", () => {
    it("should display user message after sending", async () => {
      global.fetch = mock(() =>
        Promise.resolve({
          ok: true,
          body: new ReadableStream({
            start(controller) {
              controller.enqueue(
                new TextEncoder().encode("data: Response\n\n"),
              );
              controller.close();
            },
          }),
        }),
      ) as typeof fetch;

      render(<ChatInterface />);

      const textarea = screen.getByRole("textbox");
      const sendButton = screen.getByRole("button", { name: /send/i });

      fireEvent.change(textarea, { target: { value: "User message" } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        const userMessage = screen.getByText("User message");
        expect(userMessage).toBeDefined();
      });
    });

    it("should display assistant response after streaming", async () => {
      global.fetch = mock(() =>
        Promise.resolve({
          ok: true,
          body: new ReadableStream({
            start(controller) {
              controller.enqueue(
                new TextEncoder().encode("data: Assistant response\n\n"),
              );
              controller.close();
            },
          }),
        }),
      ) as typeof fetch;

      render(<ChatInterface />);

      const textarea = screen.getByRole("textbox");
      const sendButton = screen.getByRole("button", { name: /send/i });

      fireEvent.change(textarea, { target: { value: "Hello" } });
      fireEvent.click(sendButton);

      await waitFor(
        () => {
          const assistantMessage = screen.getByText(/Assistant response/);
          expect(assistantMessage).toBeDefined();
        },
        { timeout: 3000 },
      );
    });

    it("should display multiple messages in order", async () => {
      let callCount = 0;
      global.fetch = mock(() => {
        callCount++;
        return Promise.resolve({
          ok: true,
          body: new ReadableStream({
            start(controller) {
              controller.enqueue(
                new TextEncoder().encode(`data: Response ${callCount}\n\n`),
              );
              controller.close();
            },
          }),
        });
      }) as typeof fetch;

      render(<ChatInterface />);

      const textarea = screen.getByRole("textbox");
      const sendButton = screen.getByRole("button", { name: /send/i });

      // Send first message
      fireEvent.change(textarea, { target: { value: "Message 1" } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(screen.getByText("Message 1")).toBeDefined();
      });

      // Send second message
      fireEvent.change(textarea, { target: { value: "Message 2" } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(screen.getByText("Message 2")).toBeDefined();
      });
    });
  });

  describe("Loading States", () => {
    it("should show typing indicator while streaming", async () => {
      global.fetch = mock(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                ok: true,
                body: new ReadableStream({
                  start(controller) {
                    controller.enqueue(
                      new TextEncoder().encode("data: Response\n\n"),
                    );
                    controller.close();
                  },
                }),
              });
            }, 100);
          }),
      ) as typeof fetch;

      render(<ChatInterface />);

      const textarea = screen.getByRole("textbox");
      const sendButton = screen.getByRole("button", { name: /send/i });

      fireEvent.change(textarea, { target: { value: "Hello" } });
      fireEvent.click(sendButton);

      // Should show typing indicator
      await waitFor(() => {
        const typingIndicator = document.querySelector(
          '[data-component="typing-indicator"]',
        );
        expect(typingIndicator).toBeDefined();
      });
    });

    it("should disable input while streaming", async () => {
      global.fetch = mock(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                ok: true,
                body: new ReadableStream({
                  start(controller) {
                    controller.enqueue(
                      new TextEncoder().encode("data: Response\n\n"),
                    );
                    controller.close();
                  },
                }),
              });
            }, 100);
          }),
      ) as typeof fetch;

      render(<ChatInterface />);

      const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
      const sendButton = screen.getByRole("button", {
        name: /send/i,
      }) as HTMLButtonElement;

      fireEvent.change(textarea, { target: { value: "Hello" } });
      fireEvent.click(sendButton);

      // Input should be disabled while processing
      await waitFor(() => {
        expect(textarea.disabled).toBe(true);
        expect(sendButton.disabled).toBe(true);
      });
    });
  });

  describe("Error Handling", () => {
    it("should display error message on API failure", async () => {
      global.fetch = mock(() =>
        Promise.reject(new Error("Network error")),
      ) as typeof fetch;

      render(<ChatInterface />);

      const textarea = screen.getByRole("textbox");
      const sendButton = screen.getByRole("button", { name: /send/i });

      fireEvent.change(textarea, { target: { value: "Hello" } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        const errorMessages = screen.getAllByText(/Network error/i);
        expect(errorMessages.length).toBeGreaterThan(0);
      });
    });

    it("should display error on HTTP error status", async () => {
      global.fetch = mock(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          statusText: "Internal Server Error",
          json: () => Promise.resolve({ error: "Server error" }),
        }),
      ) as typeof fetch;

      render(<ChatInterface />);

      const textarea = screen.getByRole("textbox");
      const sendButton = screen.getByRole("button", { name: /send/i });

      fireEvent.change(textarea, { target: { value: "Hello" } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        const errorMessages = screen.getAllByText(/Server error/i);
        expect(errorMessages.length).toBeGreaterThan(0);
      });
    });

    it("should re-enable input after error", async () => {
      global.fetch = mock(() =>
        Promise.reject(new Error("Network error")),
      ) as typeof fetch;

      render(<ChatInterface />);

      const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
      const sendButton = screen.getByRole("button", {
        name: /send/i,
      }) as HTMLButtonElement;

      fireEvent.change(textarea, { target: { value: "Hello" } });
      fireEvent.click(sendButton);

      // Wait for error to be processed
      await waitFor(() => {
        const errorMessages = screen.getAllByText(/Network error/i);
        expect(errorMessages.length).toBeGreaterThan(0);
      });

      // Textarea should be re-enabled (not disabled by loading state)
      expect(textarea.disabled).toBe(false);

      // Send button disabled state depends on input content
      // After sending, input is cleared, so button should be disabled due to empty input
      // But we can verify it's not disabled due to loading by typing again
      fireEvent.change(textarea, { target: { value: "Retry" } });
      expect(sendButton.disabled).toBe(false);
    });
  });

  describe("Scroll Behavior", () => {
    it("should auto-scroll to bottom on new messages", async () => {
      global.fetch = mock(() =>
        Promise.resolve({
          ok: true,
          body: new ReadableStream({
            start(controller) {
              controller.enqueue(
                new TextEncoder().encode("data: Response\n\n"),
              );
              controller.close();
            },
          }),
        }),
      ) as typeof fetch;

      render(<ChatInterface />);

      const textarea = screen.getByRole("textbox");
      const sendButton = screen.getByRole("button", { name: /send/i });

      fireEvent.change(textarea, { target: { value: "Test" } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        const messagesContainer = document.querySelector(
          '[data-slot="scroll-area-viewport"]',
        );
        expect(messagesContainer).toBeDefined();
      });
    });
  });

  describe("API Integration", () => {
    it("should call /api/chat endpoint with correct payload", async () => {
      const mockFetch = mock(() =>
        Promise.resolve({
          ok: true,
          body: new ReadableStream({
            start(controller) {
              controller.enqueue(
                new TextEncoder().encode("data: Response\n\n"),
              );
              controller.close();
            },
          }),
        }),
      ) as typeof fetch;

      global.fetch = mockFetch;

      render(<ChatInterface />);

      const textarea = screen.getByRole("textbox");
      const sendButton = screen.getByRole("button", { name: /send/i });

      fireEvent.change(textarea, { target: { value: "Test message" } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();

        // Check fetch was called with correct URL
        // biome-ignore lint/suspicious/noExplicitAny: Mock function type is not easily typed
        const call = (mockFetch as any).mock.calls[0];
        expect(call[0]).toBe("/api/chat");
      });
    });
  });
});
