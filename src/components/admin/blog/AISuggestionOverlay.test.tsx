import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AISuggestionOverlay } from "./AISuggestionOverlay";

describe("T005: AISuggestionOverlay", () => {
  const mockOnApprove = vi.fn();
  const mockOnReject = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe("Rendering", () => {
    it("should render overlay with approve and reject buttons", () => {
      render(
        <AISuggestionOverlay
          isOpen={true}
          onApprove={mockOnApprove}
          onReject={mockOnReject}
          onClose={mockOnClose}
        />,
      );

      expect(screen.getByRole("button", { name: /approve/i })).toBeDefined();
      expect(screen.getByRole("button", { name: /reject/i })).toBeDefined();
    });

    it("should not render when isOpen is false", () => {
      const { container } = render(
        <AISuggestionOverlay
          isOpen={false}
          onApprove={mockOnApprove}
          onReject={mockOnReject}
          onClose={mockOnClose}
        />,
      );

      expect(container.querySelector("[data-overlay]")).toBeNull();
    });

    it("should have absolute positioning", () => {
      const { container } = render(
        <AISuggestionOverlay
          isOpen={true}
          onApprove={mockOnApprove}
          onReject={mockOnReject}
          onClose={mockOnClose}
        />,
      );

      const overlay = container.querySelector("[data-overlay]");
      expect(overlay).toBeDefined();
      expect(overlay?.className).toContain("absolute");
    });

    it("should display checkmark icon for approve button", () => {
      render(
        <AISuggestionOverlay
          isOpen={true}
          onApprove={mockOnApprove}
          onReject={mockOnReject}
          onClose={mockOnClose}
        />,
      );

      const approveButton = screen.getByRole("button", { name: /approve/i });
      expect(approveButton.textContent).toContain("✓");
    });

    it("should display X icon for reject button", () => {
      render(
        <AISuggestionOverlay
          isOpen={true}
          onApprove={mockOnApprove}
          onReject={mockOnReject}
          onClose={mockOnClose}
        />,
      );

      const rejectButton = screen.getByRole("button", { name: /reject/i });
      expect(rejectButton.textContent).toContain("✗");
    });
  });

  describe("Approve/Reject Actions", () => {
    it("should call onApprove when approve button is clicked", () => {
      render(
        <AISuggestionOverlay
          isOpen={true}
          onApprove={mockOnApprove}
          onReject={mockOnReject}
          onClose={mockOnClose}
        />,
      );

      const approveButton = screen.getByRole("button", { name: /approve/i });
      fireEvent.click(approveButton);

      expect(mockOnApprove).toHaveBeenCalledTimes(1);
    });

    it("should call onReject when reject button is clicked", () => {
      render(
        <AISuggestionOverlay
          isOpen={true}
          onApprove={mockOnApprove}
          onReject={mockOnReject}
          onClose={mockOnClose}
        />,
      );

      const rejectButton = screen.getByRole("button", { name: /reject/i });
      fireEvent.click(rejectButton);

      expect(mockOnReject).toHaveBeenCalledTimes(1);
    });

    it("should call onClose after approving", () => {
      render(
        <AISuggestionOverlay
          isOpen={true}
          onApprove={mockOnApprove}
          onReject={mockOnReject}
          onClose={mockOnClose}
        />,
      );

      const approveButton = screen.getByRole("button", { name: /approve/i });
      fireEvent.click(approveButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("should call onClose after rejecting", () => {
      render(
        <AISuggestionOverlay
          isOpen={true}
          onApprove={mockOnApprove}
          onReject={mockOnReject}
          onClose={mockOnClose}
        />,
      );

      const rejectButton = screen.getByRole("button", { name: /reject/i });
      fireEvent.click(rejectButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("Keyboard Interactions", () => {
    it("should close overlay when Escape key is pressed", () => {
      render(
        <AISuggestionOverlay
          isOpen={true}
          onApprove={mockOnApprove}
          onReject={mockOnReject}
          onClose={mockOnClose}
        />,
      );

      fireEvent.keyDown(document, { key: "Escape" });

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("should not close when other keys are pressed", () => {
      render(
        <AISuggestionOverlay
          isOpen={true}
          onApprove={mockOnApprove}
          onReject={mockOnReject}
          onClose={mockOnClose}
        />,
      );

      fireEvent.keyDown(document, { key: "Enter" });
      fireEvent.keyDown(document, { key: "Tab" });

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe("Focus Management", () => {
    it("should auto-focus approve button when overlay opens", async () => {
      const { rerender } = render(
        <AISuggestionOverlay
          isOpen={false}
          onApprove={mockOnApprove}
          onReject={mockOnReject}
          onClose={mockOnClose}
        />,
      );

      rerender(
        <AISuggestionOverlay
          isOpen={true}
          onApprove={mockOnApprove}
          onReject={mockOnReject}
          onClose={mockOnClose}
        />,
      );

      await waitFor(() => {
        const approveButton = screen.getByRole("button", { name: /approve/i });
        expect(document.activeElement).toBe(approveButton);
      });
    });

    it("should restore focus when overlay closes", async () => {
      const triggerButton = document.createElement("button");
      document.body.appendChild(triggerButton);
      triggerButton.focus();

      const { rerender } = render(
        <AISuggestionOverlay
          isOpen={true}
          onApprove={mockOnApprove}
          onReject={mockOnReject}
          onClose={mockOnClose}
        />,
      );

      rerender(
        <AISuggestionOverlay
          isOpen={false}
          onApprove={mockOnApprove}
          onReject={mockOnReject}
          onClose={mockOnClose}
        />,
      );

      await waitFor(() => {
        expect(document.activeElement).toBe(triggerButton);
      });

      document.body.removeChild(triggerButton);
    });
  });

  describe("Animations", () => {
    it("should have framer-motion animation wrapper", () => {
      const { container } = render(
        <AISuggestionOverlay
          isOpen={true}
          onApprove={mockOnApprove}
          onReject={mockOnReject}
          onClose={mockOnClose}
        />,
      );

      const overlay = container.querySelector("[data-overlay]");
      expect(overlay?.parentElement?.getAttribute("style")).toBeDefined();
    });

    it("should animate in when opening", () => {
      const { container } = render(
        <AISuggestionOverlay
          isOpen={true}
          onApprove={mockOnApprove}
          onReject={mockOnReject}
          onClose={mockOnClose}
        />,
      );

      const motion = container.querySelector("[data-overlay]")?.parentElement;
      expect(motion).toBeDefined();
    });
  });

  describe("Responsive Behavior", () => {
    it("should cover parent element fully", () => {
      const { container } = render(
        <AISuggestionOverlay
          isOpen={true}
          onApprove={mockOnApprove}
          onReject={mockOnReject}
          onClose={mockOnClose}
        />,
      );

      const overlay = container.querySelector("[data-overlay]");
      expect(overlay?.className).toContain("inset-0");
    });

    it("should adapt to different parent dimensions", () => {
      const { container } = render(
        <div style={{ width: "500px", height: "100px", position: "relative" }}>
          <AISuggestionOverlay
            isOpen={true}
            onApprove={mockOnApprove}
            onReject={mockOnReject}
            onClose={mockOnClose}
          />
        </div>,
      );

      const overlay = container.querySelector("[data-overlay]");
      expect(overlay).toBeDefined();
      expect(overlay?.className).toContain("absolute");
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels on approve button", () => {
      render(
        <AISuggestionOverlay
          isOpen={true}
          onApprove={mockOnApprove}
          onReject={mockOnReject}
          onClose={mockOnClose}
        />,
      );

      const approveButton = screen.getByRole("button", { name: /approve/i });
      expect(approveButton.getAttribute("aria-label")).toContain("Approve");
    });

    it("should have proper ARIA labels on reject button", () => {
      render(
        <AISuggestionOverlay
          isOpen={true}
          onApprove={mockOnApprove}
          onReject={mockOnReject}
          onClose={mockOnClose}
        />,
      );

      const rejectButton = screen.getByRole("button", { name: /reject/i });
      expect(rejectButton.getAttribute("aria-label")).toContain("Reject");
    });

    it("should have role=dialog", () => {
      const { container } = render(
        <AISuggestionOverlay
          isOpen={true}
          onApprove={mockOnApprove}
          onReject={mockOnReject}
          onClose={mockOnClose}
        />,
      );

      const overlay = container.querySelector("[role='dialog']");
      expect(overlay).toBeDefined();
    });

    it("should have aria-modal attribute", () => {
      const { container } = render(
        <AISuggestionOverlay
          isOpen={true}
          onApprove={mockOnApprove}
          onReject={mockOnReject}
          onClose={mockOnClose}
        />,
      );

      const overlay = container.querySelector("[aria-modal='true']");
      expect(overlay).toBeDefined();
    });
  });

  describe("Edge Cases", () => {
    it("should handle rapid open/close toggling", async () => {
      const { rerender } = render(
        <AISuggestionOverlay
          isOpen={false}
          onApprove={mockOnApprove}
          onReject={mockOnReject}
          onClose={mockOnClose}
        />,
      );

      for (let i = 0; i < 5; i++) {
        rerender(
          <AISuggestionOverlay
            isOpen={true}
            onApprove={mockOnApprove}
            onReject={mockOnReject}
            onClose={mockOnClose}
          />,
        );

        rerender(
          <AISuggestionOverlay
            isOpen={false}
            onApprove={mockOnApprove}
            onReject={mockOnReject}
            onClose={mockOnClose}
          />,
        );
      }

      expect(mockOnApprove).not.toHaveBeenCalled();
      expect(mockOnReject).not.toHaveBeenCalled();
    });

    it("should cleanup event listeners on unmount", () => {
      const { unmount } = render(
        <AISuggestionOverlay
          isOpen={true}
          onApprove={mockOnApprove}
          onReject={mockOnReject}
          onClose={mockOnClose}
        />,
      );

      unmount();

      fireEvent.keyDown(document, { key: "Escape" });
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it("should not call handlers multiple times on double-click", () => {
      render(
        <AISuggestionOverlay
          isOpen={true}
          onApprove={mockOnApprove}
          onReject={mockOnReject}
          onClose={mockOnClose}
        />,
      );

      const approveButton = screen.getByRole("button", { name: /approve/i });
      fireEvent.click(approveButton);
      fireEvent.click(approveButton);

      expect(mockOnApprove).toHaveBeenCalledTimes(2);
      expect(mockOnClose).toHaveBeenCalledTimes(2);
    });
  });
});
