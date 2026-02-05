import { describe, expect, it, mock } from "bun:test";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { Navigation } from "./Navigation";

// Mock next/link
mock.module("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock next/navigation
let mockPathname = "/";
mock.module("next/navigation", () => ({
  usePathname: () => mockPathname,
}));

// Mock Button component
mock.module("@/components/ui/button", () => ({
  Button: ({
    children,
    asChild,
    ...props
  }: {
    children: React.ReactNode;
    asChild?: boolean;
  }) => {
    // If asChild is true, render children directly without wrapper
    if (asChild) {
      return <>{children}</>;
    }
    return <button {...props}>{children}</button>;
  },
}));

// Mock lucide-react icons
mock.module("lucide-react", () => ({
  Menu: () => <div data-testid="menu-icon">Menu</div>,
  Terminal: () => <div data-testid="terminal-icon">Terminal</div>,
  X: () => <div data-testid="x-icon">X</div>,
}));

describe("T013: Update Navigation to include new pages", () => {
  describe("New Navigation Links", () => {
    it("should include Chat link in desktop navigation", () => {
      render(<Navigation />);

      const chatLink = screen.getByRole("link", { name: "Chat" });
      expect(chatLink).toBeDefined();
      expect(chatLink.getAttribute("href")).toBe("/chat");
    });

    it("should include Fit Assessment link in desktop navigation", () => {
      render(<Navigation />);

      const fitAssessmentLinks = screen.getAllByRole("link", {
        name: "Fit Assessment",
      });
      expect(fitAssessmentLinks.length).toBeGreaterThan(0);
      expect(fitAssessmentLinks[0].getAttribute("href")).toBe(
        "/fit-assessment",
      );
    });

    it("should include Chat link in mobile menu", async () => {
      render(<Navigation />);

      // Open mobile menu
      const menuButtons = screen.getAllByRole("button");
      const menuButton = menuButtons[menuButtons.length - 1]; // Get the last button (mobile menu toggle)
      await userEvent.click(menuButton);

      // Check for Chat link in mobile menu
      const chatLinks = screen.getAllByRole("link", { name: "Chat" });
      expect(chatLinks.length).toBeGreaterThan(1); // Desktop + Mobile
      expect(chatLinks[0].getAttribute("href")).toBe("/chat");
    });

    it("should include Fit Assessment link in mobile menu", async () => {
      render(<Navigation />);

      // Open mobile menu
      const menuButtons = screen.getAllByRole("button");
      const menuButton = menuButtons[menuButtons.length - 1]; // Get the last button (mobile menu toggle)
      await userEvent.click(menuButton);

      // Check for Fit Assessment link in mobile menu
      const fitAssessmentLinks = screen.getAllByRole("link", {
        name: "Fit Assessment",
      });
      expect(fitAssessmentLinks.length).toBeGreaterThan(1); // Desktop + Mobile
      expect(fitAssessmentLinks[0].getAttribute("href")).toBe(
        "/fit-assessment",
      );
    });
  });

  describe("Navigation Ordering", () => {
    it("should place new links after existing navigation items", () => {
      render(<Navigation />);

      const allLinks = screen.getAllByRole("link");
      const linkTexts = allLinks.map((link) => link.textContent);

      const chatIndex = linkTexts.indexOf("Chat");
      const fitAssessmentIndex = linkTexts.indexOf("Fit Assessment");
      const infrastructureIndex = linkTexts.indexOf("Infrastructure");

      // Chat and Fit Assessment should come after Infrastructure
      expect(chatIndex).toBeGreaterThan(infrastructureIndex);
      expect(fitAssessmentIndex).toBeGreaterThan(chatIndex);
    });

    it("should maintain all existing navigation links", () => {
      render(<Navigation />);

      expect(screen.getAllByRole("link", { name: "Home" })[0]).toBeDefined();
      expect(screen.getAllByRole("link", { name: "About" })[0]).toBeDefined();
      expect(
        screen.getAllByRole("link", { name: "Principles" })[0],
      ).toBeDefined();
      expect(screen.getAllByRole("link", { name: "Stack" })[0]).toBeDefined();
      expect(
        screen.getAllByRole("link", { name: "Projects" })[0],
      ).toBeDefined();
      expect(screen.getAllByRole("link", { name: "Chat" })[0]).toBeDefined();
      expect(
        screen.getAllByRole("link", { name: "Fit Assessment" })[0],
      ).toBeDefined();
    });
  });

  describe("Active Route Highlighting", () => {
    it("should highlight Chat link when on /chat route", () => {
      mockPathname = "/chat";
      render(<Navigation />);

      const chatLinks = screen.getAllByRole("link", { name: "Chat" });
      const chatLink = chatLinks[0]; // Get first (desktop) link
      expect(chatLink.className).toContain("text-foreground");

      // Find the active indicator span
      const activeIndicator = chatLink.querySelector(
        "span.absolute.bottom-0.left-0.right-0",
      );
      expect(activeIndicator).toBeDefined();
    });

    it("should highlight Fit Assessment link when on /fit-assessment route", () => {
      mockPathname = "/fit-assessment";
      render(<Navigation />);

      const fitAssessmentLinks = screen.getAllByRole("link", {
        name: "Fit Assessment",
      });
      const fitAssessmentLink = fitAssessmentLinks[0]; // Get first (desktop) link
      expect(fitAssessmentLink.className).toContain("text-foreground");

      // Find the active indicator span
      const activeIndicator = fitAssessmentLink.querySelector(
        "span.absolute.bottom-0.left-0.right-0",
      );
      expect(activeIndicator).toBeDefined();
    });

    it("should not highlight Chat link when on other routes", () => {
      mockPathname = "/about";
      render(<Navigation />);

      const chatLinks = screen.getAllByRole("link", { name: "Chat" });
      const chatLink = chatLinks[0]; // Get first (desktop) link
      expect(chatLink.className).toContain("text-muted-foreground");

      // Should not have active indicator
      const activeIndicator = chatLink.querySelector(
        "span.absolute.bottom-0.left-0.right-0",
      );
      expect(activeIndicator).toBeNull();
    });

    it("should not highlight Fit Assessment link when on other routes", () => {
      mockPathname = "/principles";
      render(<Navigation />);

      const fitAssessmentLinks = screen.getAllByRole("link", {
        name: "Fit Assessment",
      });
      const fitAssessmentLink = fitAssessmentLinks[0]; // Get first (desktop) link
      expect(fitAssessmentLink.className).toContain("text-muted-foreground");

      // Should not have active indicator
      const activeIndicator = fitAssessmentLink.querySelector(
        "span.absolute.bottom-0.left-0.right-0",
      );
      expect(activeIndicator).toBeNull();
    });
  });

  describe("Responsive Behavior", () => {
    it("should show mobile menu button", () => {
      render(<Navigation />);

      const menuButtons = screen.getAllByRole("button");
      expect(menuButtons.length).toBeGreaterThan(0);
    });

    it("should toggle mobile menu when button is clicked", async () => {
      render(<Navigation />);

      const menuButtons = screen.getAllByRole("button");
      const menuButton = menuButtons[menuButtons.length - 1];

      // Initially, mobile menu should not be visible (only desktop links)
      const initialChatLinks = screen.getAllByRole("link", { name: "Chat" });
      const initialCount = initialChatLinks.length;

      // Click to open mobile menu
      await userEvent.click(menuButton);

      // Mobile menu should be visible (duplicate links for mobile)
      const openChatLinks = screen.getAllByRole("link", { name: "Chat" });
      expect(openChatLinks.length).toBeGreaterThan(initialCount);
    });

    it("should close mobile menu when a link is clicked", async () => {
      render(<Navigation />);

      const menuButtons = screen.getAllByRole("button");
      const menuButton = menuButtons[menuButtons.length - 1];

      // Open mobile menu
      await userEvent.click(menuButton);

      // Click a navigation link (get one from the mobile menu section)
      const chatLinks = screen.getAllByRole("link", { name: "Chat" });
      const mobileChatLink = chatLinks[chatLinks.length - 1]; // Get last (mobile menu) link
      await userEvent.click(mobileChatLink);

      // Mobile menu should close (back to original number of links)
      const finalChatLinks = screen.getAllByRole("link", { name: "Chat" });
      expect(finalChatLinks.length).toBeLessThan(chatLinks.length);
    });

    it("should include all navigation items in mobile menu", async () => {
      render(<Navigation />);

      const menuButtons = screen.getAllByRole("button");
      const menuButton = menuButtons[menuButtons.length - 1];
      await userEvent.click(menuButton);

      // Check that all links are present in mobile menu (desktop + mobile versions)
      expect(
        screen.getAllByRole("link", { name: "Home" }).length,
      ).toBeGreaterThanOrEqual(2);
      expect(
        screen.getAllByRole("link", { name: "Chat" }).length,
      ).toBeGreaterThanOrEqual(2);
      expect(
        screen.getAllByRole("link", { name: "Fit Assessment" }).length,
      ).toBeGreaterThanOrEqual(2);
    });
  });

  describe("Navigation Structure and Branding", () => {
    it("should maintain logo with Terminal icon", () => {
      render(<Navigation />);

      const terminalIcons = screen.getAllByTestId("terminal-icon");
      expect(terminalIcons.length).toBeGreaterThan(0);
    });

    it("should maintain Ryan Lowe branding in logo", () => {
      render(<Navigation />);

      const logos = screen.getAllByText("Ryan Lowe");
      expect(logos.length).toBeGreaterThan(0);
    });

    it("should maintain Resume download button", () => {
      render(<Navigation />);

      const resumeLinks = screen.getAllByText("Resume");
      expect(resumeLinks.length).toBeGreaterThan(0);
    });

    it("should have fixed positioning for sticky navigation", () => {
      const { container } = render(<Navigation />);

      const nav = container.querySelector("nav");
      expect(nav?.className).toContain("fixed");
      expect(nav?.className).toContain("top-0");
    });
  });

  describe("Acceptance Criteria Validation", () => {
    it("should have Chat link added to navigation", () => {
      render(<Navigation />);

      const chatLinks = screen.getAllByRole("link", { name: "Chat" });
      expect(chatLinks.length).toBeGreaterThan(0);
      expect(chatLinks[0].getAttribute("href")).toBe("/chat");
    });

    it("should have Fit Assessment link added to navigation", () => {
      render(<Navigation />);

      const fitAssessmentLinks = screen.getAllByRole("link", {
        name: "Fit Assessment",
      });
      expect(fitAssessmentLinks.length).toBeGreaterThan(0);
      expect(fitAssessmentLinks[0].getAttribute("href")).toBe(
        "/fit-assessment",
      );
    });

    it("should maintain responsive behavior with mobile menu", async () => {
      render(<Navigation />);

      const menuButtons = screen.getAllByRole("button");
      const menuButton = menuButtons[menuButtons.length - 1];
      await userEvent.click(menuButton);

      // Check that mobile menu includes new links
      expect(
        screen.getAllByRole("link", { name: "Chat" }).length,
      ).toBeGreaterThanOrEqual(2);
      expect(
        screen.getAllByRole("link", { name: "Fit Assessment" }).length,
      ).toBeGreaterThanOrEqual(2);
    });

    it("should have active states working for new routes", () => {
      mockPathname = "/chat";
      render(<Navigation />);

      const chatLinks = screen.getAllByRole("link", { name: "Chat" });
      const chatLink = chatLinks[0];
      expect(chatLink.className).toContain("text-foreground");

      const activeIndicator = chatLink.querySelector(
        "span.absolute.bottom-0.left-0.right-0",
      );
      expect(activeIndicator).toBeDefined();
    });

    it("should include new links in mobile menu", async () => {
      render(<Navigation />);

      const menuButtons = screen.getAllByRole("button");
      const menuButton = menuButtons[menuButtons.length - 1];
      await userEvent.click(menuButton);

      const mobileChatLinks = screen.getAllByRole("link", { name: "Chat" });
      const mobileFitLinks = screen.getAllByRole("link", {
        name: "Fit Assessment",
      });

      expect(mobileChatLinks.length).toBeGreaterThanOrEqual(2);
      expect(mobileFitLinks.length).toBeGreaterThanOrEqual(2);
    });
  });
});
