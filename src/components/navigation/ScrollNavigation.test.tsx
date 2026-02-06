import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, mock } from "bun:test";
import { ScrollNavigation } from "./ScrollNavigation";

// Mock framer-motion to avoid animation issues in tests
mock.module("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock useReducedMotion hook
mock.module("@/hooks/useReducedMotion", () => ({
  useReducedMotion: () => false,
}));

// Mock Button component
mock.module("@/components/ui/button", () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

describe("ScrollNavigation", () => {
  it("renders FAB button", () => {
    render(<ScrollNavigation sections={["hero", "projects", "principles"]} />);

    const button = screen.getByRole("button", {
      name: /scroll to next section/i,
    });
    expect(button).toBeDefined();
  });

  it("scrolls to next section when clicked", () => {
    // Mock document.getElementById
    const mockScrollIntoView = mock(() => {});
    const mockElement = {
      scrollIntoView: mockScrollIntoView,
    };

    global.document.getElementById = mock(() => mockElement as any);

    render(<ScrollNavigation sections={["hero", "projects", "principles"]} />);

    const button = screen.getByRole("button", {
      name: /scroll to next section/i,
    });

    fireEvent.click(button);

    // Should attempt to scroll to next section
    expect(mockScrollIntoView).toHaveBeenCalledWith({
      behavior: "smooth",
      block: "start",
    });
  });

  it("handles missing section elements gracefully", () => {
    // Mock getElementById to return null
    global.document.getElementById = mock(() => null);

    render(<ScrollNavigation sections={["hero", "projects"]} />);

    const button = screen.getByRole("button", {
      name: /scroll to next section/i,
    });

    // Should not throw when clicking with missing elements
    expect(() => fireEvent.click(button)).not.toThrow();
  });

  it("renders with correct aria-label", () => {
    render(<ScrollNavigation sections={["hero", "projects"]} />);

    const button = screen.getByRole("button", {
      name: "Scroll to next section",
    });
    expect(button).toBeDefined();
  });
});
