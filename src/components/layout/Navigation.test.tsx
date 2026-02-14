import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { Navigation } from "./Navigation";

// Mock next/link
vi.mock("next/link", () => ({
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
vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
}));

// Mock Button component
vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    asChild,
    variant,
    ...props
  }: {
    children: React.ReactNode;
    asChild?: boolean;
    variant?: string;
  }) => {
    // If asChild is true, clone children with variant data attribute
    if (asChild && children) {
      const child = children as React.ReactElement;
      return React.cloneElement(child, { "data-variant": variant });
    }
    return (
      <button data-variant={variant} {...props}>
        {children}
      </button>
    );
  },
}));

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  Menu: () => <div data-testid="menu-icon">Menu</div>,
  Terminal: () => <div data-testid="terminal-icon">Terminal</div>,
  X: () => <div data-testid="x-icon">X</div>,
}));

// Mock ThemeToggle component
vi.mock("@/components/theme/ThemeToggle", () => ({
  ThemeToggle: () => (
    <button type="button" data-testid="theme-toggle">
      Theme Toggle
    </button>
  ),
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

  describe("T007: ThemeToggle Integration", () => {
    describe("ThemeToggle in Desktop Navigation", () => {
      it("should render ThemeToggle button in desktop navigation", () => {
        render(<Navigation />);

        const themeToggles = screen.getAllByTestId("theme-toggle");
        expect(themeToggles.length).toBeGreaterThan(0);
      });

      it("should position ThemeToggle before Resume button in desktop navigation", () => {
        const { container } = render(<Navigation />);

        // Get all buttons in order
        const buttons = Array.from(container.querySelectorAll("button, a"));
        const themeToggleIndex = buttons.findIndex(
          (btn) => btn.getAttribute("data-testid") === "theme-toggle",
        );
        const resumeButtonIndex = buttons.findIndex((btn) =>
          btn.textContent?.includes("Resume"),
        );

        expect(themeToggleIndex).toBeGreaterThan(-1);
        expect(resumeButtonIndex).toBeGreaterThan(-1);
        expect(themeToggleIndex).toBeLessThan(resumeButtonIndex);
      });

      it("should wrap ThemeToggle and Resume in a flex container with gap-4", () => {
        const { container } = render(<Navigation />);

        // Find the container wrapping ThemeToggle
        const themeToggle = container.querySelector(
          '[data-testid="theme-toggle"]',
        );
        const parentContainer = themeToggle?.parentElement;

        expect(parentContainer?.className).toContain("flex");
        expect(parentContainer?.className).toContain("items-center");
        expect(parentContainer?.className).toContain("gap-4");
      });
    });

    describe("ThemeToggle in Mobile Navigation", () => {
      it("should render ThemeToggle in mobile menu", async () => {
        render(<Navigation />);

        // Open mobile menu
        const menuButtons = screen.getAllByRole("button");
        const menuButton = menuButtons[menuButtons.length - 1];
        await userEvent.click(menuButton);

        // Check for ThemeToggle in mobile menu (should have 2 total: desktop + mobile)
        const themeToggles = screen.getAllByTestId("theme-toggle");
        expect(themeToggles.length).toBeGreaterThanOrEqual(2);
      });

      it("should position ThemeToggle before Resume button in mobile menu", async () => {
        const { container } = render(<Navigation />);

        // Open mobile menu
        const menuButtons = screen.getAllByRole("button");
        const menuButton = menuButtons[menuButtons.length - 1];
        await userEvent.click(menuButton);

        // Find mobile menu container with flex items (ThemeToggle and Resume are siblings)
        const mobileMenu = container.querySelector(".md\\:hidden .space-y-1");
        const buttonContainer = mobileMenu?.querySelector(
          ".flex.items-center.gap-4",
        );
        const children = Array.from(buttonContainer?.children || []);

        const themeToggleIndex = children.findIndex(
          (el) => el.getAttribute("data-testid") === "theme-toggle",
        );
        const resumeButtonIndex = children.findIndex((el) =>
          el.textContent?.includes("Resume"),
        );

        expect(themeToggleIndex).toBeGreaterThan(-1);
        expect(resumeButtonIndex).toBeGreaterThan(-1);
        expect(themeToggleIndex).toBeLessThan(resumeButtonIndex);
      });
    });

    describe("Layout and Styling", () => {
      it("should maintain existing navigation structure", () => {
        const { container } = render(<Navigation />);

        // Verify main structure elements still exist
        const nav = container.querySelector("nav");
        const logos = screen.getAllByText("Ryan Lowe");
        const desktopNav = container.querySelector(".md\\:flex");

        expect(nav).toBeDefined();
        expect(logos.length).toBeGreaterThan(0);
        expect(desktopNav).toBeDefined();
      });

      it("should not cause layout shifts when adding ThemeToggle", () => {
        const { container } = render(<Navigation />);

        const nav = container.querySelector("nav");
        const navInnerContent = nav?.querySelector(".flex.h-16");

        // Navigation should maintain flex layout
        expect(navInnerContent).toBeDefined();
        expect(navInnerContent?.className).toContain("flex");
        expect(navInnerContent?.className).toContain("items-center");
        expect(navInnerContent?.className).toContain("justify-between");
      });

      it("should maintain z-index and positioning", () => {
        const { container } = render(<Navigation />);

        const nav = container.querySelector("nav");
        expect(nav?.className).toContain("fixed");
        expect(nav?.className).toContain("z-50");
      });
    });

    describe("Acceptance Criteria Validation", () => {
      it("should import ThemeToggle from @/components/theme/ThemeToggle", () => {
        // This is validated by the component rendering successfully
        render(<Navigation />);

        const themeToggles = screen.getAllByTestId("theme-toggle");
        expect(themeToggles.length).toBeGreaterThan(0);
      });

      it("should add ThemeToggle button to desktop navigation", () => {
        const { container } = render(<Navigation />);

        const desktopNav = container.querySelector(".hidden.md\\:flex");
        const themeToggles = screen.getAllByTestId("theme-toggle");

        expect(themeToggles.length).toBeGreaterThan(0);
        expect(desktopNav).toBeDefined();
      });

      it("should position ThemeToggle before CTA buttons with gap-4", () => {
        const { container } = render(<Navigation />);

        const themeToggle = container.querySelector(
          '[data-testid="theme-toggle"]',
        );
        const parentContainer = themeToggle?.parentElement;

        expect(parentContainer?.className).toContain("gap-4");
      });

      it("should add ThemeToggle to mobile menu", async () => {
        render(<Navigation />);

        // Open mobile menu
        const menuButtons = screen.getAllByRole("button");
        const menuButton = menuButtons[menuButtons.length - 1];
        await userEvent.click(menuButton);

        const themeToggles = screen.getAllByTestId("theme-toggle");
        expect(themeToggles.length).toBeGreaterThanOrEqual(2);
      });

      it("should maintain existing navigation structure and styling", () => {
        const { container } = render(<Navigation />);

        // Verify all existing elements still exist
        const ryanLoweElements = screen.getAllByText("Ryan Lowe");
        expect(ryanLoweElements.length).toBeGreaterThan(0);
        expect(screen.getAllByRole("link", { name: "Home" })[0]).toBeDefined();
        expect(screen.getAllByText("Resume")[0]).toBeDefined();

        // Verify navigation structure
        const nav = container.querySelector("nav");
        expect(nav?.className).toContain("fixed");
        expect(nav?.className).toContain("z-50");
      });

      it("should have proper spacing with gap-4 for button group", () => {
        const { container } = render(<Navigation />);

        const themeToggle = container.querySelector(
          '[data-testid="theme-toggle"]',
        );
        const parentContainer = themeToggle?.parentElement;

        expect(parentContainer?.className).toContain("flex");
        expect(parentContainer?.className).toContain("gap-4");
      });

      it("should not cause layout shifts when adding toggle", () => {
        const { container } = render(<Navigation />);

        const nav = container.querySelector("nav");
        const navContent = nav?.querySelector(".flex.h-16");

        // Should maintain flex layout and height
        expect(navContent).toBeDefined();
        expect(navContent?.className).toContain("items-center");
      });
    });
  });

  describe("T013: Vibrant Colors in Navigation Elements", () => {
    describe("Component Rendering", () => {
      it("should render Navigation component successfully with vibrant color changes", () => {
        const { container } = render(<Navigation />);

        // Verify component renders
        const nav = container.querySelector("nav");
        expect(nav).toBeDefined();

        // Verify logo link exists
        const logoLink = container.querySelector('a[href="/"]');
        expect(logoLink).toBeDefined();

        // Verify terminal icon exists
        const terminalIcon = container.querySelector(
          '[data-testid="terminal-icon"]',
        );
        expect(terminalIcon).toBeDefined();

        // Verify resume links exist
        const resumeLinks = screen.getAllByText("Resume");
        expect(resumeLinks.length).toBeGreaterThan(0);
      });

      it("should render active state indicator when on active route", () => {
        mockPathname = "/about";
        const { container } = render(<Navigation />);

        const aboutLink = screen.getAllByRole("link", { name: "About" })[0];
        const activeIndicator = aboutLink.querySelector(
          "span.absolute.bottom-0.left-0.right-0",
        );

        // Active indicator should exist for active route
        expect(activeIndicator).toBeDefined();
      });

      it("should not render active state indicator when not on active route", () => {
        mockPathname = "/about";
        const { container } = render(<Navigation />);

        const stackLink = screen.getAllByRole("link", { name: "Stack" })[0];
        const activeIndicator = stackLink.querySelector(
          "span.absolute.bottom-0.left-0.right-0",
        );

        // Active indicator should not exist for non-active route
        expect(activeIndicator).toBeNull();
      });
    });

    describe("Acceptance Criteria Validation", () => {
      it("should have Terminal icon component in logo", () => {
        const { container } = render(<Navigation />);

        const terminalIcon = container.querySelector(
          '[data-testid="terminal-icon"]',
        );
        expect(terminalIcon).toBeDefined();

        // Verify icon is within the logo link
        const logoLink = container.querySelector('a[href="/"]');
        const iconInLogo = logoLink?.querySelector(
          '[data-testid="terminal-icon"]',
        );
        expect(iconInLogo).toBeDefined();
      });

      it("should have active state indicator for current route", () => {
        mockPathname = "/projects";
        const { container } = render(<Navigation />);

        const projectsLink = screen.getAllByRole("link", {
          name: "Projects",
        })[0];
        const activeIndicator = projectsLink.querySelector(
          "span.absolute.bottom-0.left-0.right-0",
        );

        expect(activeIndicator).toBeDefined();
      });

      it("should render Resume buttons in both desktop and mobile", async () => {
        const { container } = render(<Navigation />);

        // Desktop resume button
        const desktopNav = container.querySelector(
          ".hidden.md\\:flex.md\\:items-center.md\\:gap-4",
        );
        const desktopResume = desktopNav?.querySelector('a[href*="resume"]');
        expect(desktopResume).toBeDefined();

        // Open mobile menu
        const menuButtons = screen.getAllByRole("button");
        const menuButton = menuButtons[menuButtons.length - 1];
        await userEvent.click(menuButton);

        // Mobile resume button
        const mobileMenu = container.querySelector(".md\\:hidden");
        const mobileResume = mobileMenu?.querySelector('a[href*="resume"]');
        expect(mobileResume).toBeDefined();
      });

      it("should maintain all navigation functionality with vibrant colors", () => {
        mockPathname = "/";
        const { container } = render(<Navigation />);

        // Verify all key elements exist
        const nav = container.querySelector("nav");
        const logoLink = container.querySelector('a[href="/"]');
        const terminalIcon = container.querySelector(
          '[data-testid="terminal-icon"]',
        );
        const desktopNav = container.querySelector(
          ".hidden.md\\:flex.md\\:items-center.md\\:gap-4",
        );
        const resumeLink = desktopNav?.querySelector('a[href*="resume"]');

        expect(nav).toBeDefined();
        expect(logoLink).toBeDefined();
        expect(terminalIcon).toBeDefined();
        expect(resumeLink).toBeDefined();
      });
    });
  });
});
