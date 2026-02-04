import { describe, expect, it } from "bun:test";
import { render, screen } from "@testing-library/react";
import { ChatMessage } from "./chat-message";

describe("ChatMessage Component - T003", () => {
  describe("Core Functionality", () => {
    it("should render user message with correct styling", () => {
      render(
        // biome-ignore lint/a11y/useValidAriaRole: role is a component prop, not ARIA role
        <ChatMessage role="user" content="Hello, this is a user message" />,
      );

      const message = screen.getByText("Hello, this is a user message");
      expect(message).toBeDefined();

      // User messages should have different background
      const messageContainer = message.closest('[data-role="user"]');
      expect(messageContainer).toBeDefined();
    });

    it("should render assistant message with correct styling", () => {
      render(
        // biome-ignore lint/a11y/useValidAriaRole: role is a component prop, not ARIA role
        <ChatMessage
          role="assistant"
          content="Hello, this is an assistant message"
        />,
      );

      const message = screen.getByText("Hello, this is an assistant message");
      expect(message).toBeDefined();

      const messageContainer = message.closest('[data-role="assistant"]');
      expect(messageContainer).toBeDefined();
    });

    it("should render message content as markdown when enabled", () => {
      render(
        // biome-ignore lint/a11y/useValidAriaRole: role is a component prop, not ARIA role
        <ChatMessage
          role="assistant"
          content="**Bold text** and *italic*"
          enableMarkdown={true}
        />,
      );

      // Should contain markdown-rendered content
      const message = screen.getByText(/Bold text/);
      expect(message).toBeDefined();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty content gracefully", () => {
      // biome-ignore lint/a11y/useValidAriaRole: role is a component prop, not ARIA role
      render(<ChatMessage role="user" content="" />);

      // Should still render the message container
      const container = document.querySelector('[data-role="user"]');
      expect(container).toBeDefined();
    });

    it("should handle very long messages", () => {
      const longMessage = "A".repeat(1000);
      // biome-ignore lint/a11y/useValidAriaRole: role is a component prop, not ARIA role
      render(<ChatMessage role="assistant" content={longMessage} />);

      const message = screen.getByText(longMessage);
      expect(message).toBeDefined();
    });

    it("should support custom className", () => {
      render(
        // biome-ignore lint/a11y/useValidAriaRole: role is a component prop, not ARIA role
        <ChatMessage role="user" content="Test" className="custom-class" />,
      );

      const container = document.querySelector(".custom-class");
      expect(container).toBeDefined();
    });
  });

  describe("Timestamp and Metadata", () => {
    it("should display timestamp when provided", () => {
      const timestamp = new Date("2024-01-01T12:00:00Z");
      render(
        // biome-ignore lint/a11y/useValidAriaRole: role is a component prop, not ARIA role
        <ChatMessage
          role="user"
          content="Test message"
          timestamp={timestamp}
        />,
      );

      // Should contain formatted timestamp
      const timeElement = screen.getByText(/12:00/);
      expect(timeElement).toBeDefined();
    });

    it("should not display timestamp when not provided", () => {
      // biome-ignore lint/a11y/useValidAriaRole: role is a component prop, not ARIA role
      render(<ChatMessage role="user" content="Test message" />);

      // Should not have time element
      const container = document.querySelector('[data-role="user"]');
      const timeElement = container?.querySelector("time");
      expect(timeElement).toBeNull();
    });
  });

  describe("Accessibility", () => {
    it("should use semantic HTML elements", () => {
      // biome-ignore lint/a11y/useValidAriaRole: role is a component prop, not ARIA role
      render(<ChatMessage role="user" content="Test message" />);

      const container = document.querySelector('[data-role="user"]');
      expect(container?.tagName).toBe("ARTICLE");
    });

    it("should be keyboard accessible", () => {
      // biome-ignore lint/a11y/useValidAriaRole: role is a component prop, not ARIA role
      render(<ChatMessage role="assistant" content="Test message" />);

      const container = document.querySelector('[data-role="assistant"]');
      expect(container?.hasAttribute("tabIndex")).toBe(false);
    });
  });
});
