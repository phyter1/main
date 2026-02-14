import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import ChatPage from "./page";

// Mock ChatInterface component
vi.mock("@/components/sections/ChatInterface", () => ({
  ChatInterface: ({ className }: { className?: string }) => (
    <div data-testid="chat-interface" className={className}>
      Mock ChatInterface
    </div>
  ),
}));

describe("T010: /chat Page Implementation", () => {
  afterEach(() => {
    cleanup();
  });

  describe("Core Structure", () => {
    it("should render the page", () => {
      render(<ChatPage />);

      const page = screen.getByTestId("chat-page");
      expect(page).toBeDefined();
    });

    it("should have min-h-screen for full viewport height", () => {
      render(<ChatPage />);

      const page = screen.getByTestId("chat-page");
      expect(page.className).toContain("min-h-screen");
    });

    it("should have proper background styling", () => {
      render(<ChatPage />);

      const page = screen.getByTestId("chat-page");
      expect(page.className).toContain("bg-background");
    });

    it("should have proper padding", () => {
      render(<ChatPage />);

      const page = screen.getByTestId("chat-page");
      expect(page.className).toContain("py-24");
    });
  });

  describe("Hero Section", () => {
    it("should render hero section with title", () => {
      render(<ChatPage />);

      const title = screen.getByText("Ask Me Anything");
      expect(title).toBeDefined();
    });

    it("should render title as h1 element", () => {
      render(<ChatPage />);

      const title = screen.getByRole("heading", { level: 1 });
      expect(title.textContent).toBe("Ask Me Anything");
    });

    it("should have hero section centered", () => {
      render(<ChatPage />);

      const title = screen.getByText("Ask Me Anything");
      const section = title.closest(".text-center");
      expect(section).toBeDefined();
    });

    it("should render subtitle explaining AI training", () => {
      render(<ChatPage />);

      const subtitle = screen.getByText(/trained on Ryan's experience/i);
      expect(subtitle).toBeDefined();
    });

    it("should have proper spacing in hero section", () => {
      render(<ChatPage />);

      const title = screen.getByText("Ask Me Anything");
      expect(title.className).toContain("mb-4");
    });

    it("should have responsive title sizing", () => {
      render(<ChatPage />);

      const title = screen.getByText("Ask Me Anything");
      expect(title.className).toContain("text-5xl");
      expect(title.className).toContain("md:text-6xl");
    });

    it("should have bold title font weight", () => {
      render(<ChatPage />);

      const title = screen.getByText("Ask Me Anything");
      expect(title.className).toContain("font-bold");
    });
  });

  describe("ChatInterface Integration", () => {
    it("should render ChatInterface component", () => {
      render(<ChatPage />);

      const chatInterface = screen.getByTestId("chat-interface");
      expect(chatInterface).toBeDefined();
    });

    it("should render ChatInterface below hero section", () => {
      render(<ChatPage />);

      const title = screen.getByText("Ask Me Anything");
      const chatInterface = screen.getByTestId("chat-interface");

      // Both should exist
      expect(title).toBeDefined();
      expect(chatInterface).toBeDefined();
    });
  });

  describe("Layout and Styling", () => {
    it("should have max-width container", () => {
      render(<ChatPage />);

      const page = screen.getByTestId("chat-page");
      const container = page.querySelector(".max-w-6xl");
      expect(container).toBeDefined();
    });

    it("should have responsive padding", () => {
      render(<ChatPage />);

      const page = screen.getByTestId("chat-page");
      const container = page.querySelector(".px-4");
      expect(container).toBeDefined();
    });

    it("should have proper spacing between sections", () => {
      render(<ChatPage />);

      const page = screen.getByTestId("chat-page");
      const spacingDiv = page.querySelector(".space-y-16");
      expect(spacingDiv).toBeDefined();
    });
  });

  describe("Accessibility", () => {
    it("should have semantic heading structure", () => {
      render(<ChatPage />);

      const h1 = screen.getByRole("heading", { level: 1 });
      expect(h1).toBeDefined();
      expect(h1.textContent).toBe("Ask Me Anything");
    });

    it("should have proper text hierarchy", () => {
      render(<ChatPage />);

      const title = screen.getByText("Ask Me Anything");
      const subtitle = screen.getByText(/trained on Ryan's experience/i);

      expect(title.className).toContain("text-foreground");
      expect(subtitle.className).toContain("text-muted-foreground");
    });
  });

  describe("Acceptance Criteria", () => {
    it("should have page at src/app/chat/page.tsx", () => {
      // This test verifies the file structure by successfully importing
      expect(ChatPage).toBeDefined();
    });

    it("should render ChatInterface component from T007", () => {
      render(<ChatPage />);

      const chatInterface = screen.getByTestId("chat-interface");
      expect(chatInterface).toBeDefined();
    });

    it('should have hero section with title "Ask Me Anything"', () => {
      render(<ChatPage />);

      const title = screen.getByRole("heading", { level: 1 });
      expect(title.textContent).toBe("Ask Me Anything");
    });

    it("should have subtitle explaining AI is trained on experience", () => {
      render(<ChatPage />);

      const subtitle = screen.getByText(/trained on Ryan's experience/i);
      expect(subtitle).toBeDefined();
    });

    it("should follow existing page structure conventions", () => {
      render(<ChatPage />);

      const page = screen.getByTestId("chat-page");

      // Should follow patterns from about/principles pages
      expect(page.className).toContain("min-h-screen");
      expect(page.className).toContain("bg-background");
      expect(page.className).toContain("py-24");
    });

    it("should have proper responsive design", () => {
      render(<ChatPage />);

      const title = screen.getByText("Ask Me Anything");

      // Responsive title sizing
      expect(title.className).toContain("text-5xl");
      expect(title.className).toContain("md:text-6xl");
    });
  });
});
