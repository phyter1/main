/**
 * Tests for Admin Agent Workbench Layout
 * Validates authentication flow, login form, and authenticated layout
 */

import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";

// Mock Next.js cookies
const mockCookiesGet = mock(() => undefined);
const mockCookies = mock(async () => ({
  get: mockCookiesGet,
}));

mock.module("next/headers", () => ({
  cookies: mockCookies,
}));

// Mock Next.js navigation
const mockUsePathname = mock(() => "/admin/agent-workbench");
const mockPush = mock();
const mockRefresh = mock();
const mockUseRouter = mock(() => ({
  push: mockPush,
  refresh: mockRefresh,
}));

mock.module("next/navigation", () => ({
  usePathname: mockUsePathname,
  useRouter: mockUseRouter,
}));

// Mock auth utilities
const mockVerifySessionToken = mock(() => false);

mock.module("@/lib/auth", () => ({
  verifySessionToken: mockVerifySessionToken,
  generateSessionToken: mock(() => "mock-session-token"),
  createSessionCookie: mock((token: string) => `session=${token}`),
  clearSessionCookie: mock(() => "session=; Max-Age=0"),
  storeSessionToken: mock(() => {}),
  invalidateSessionToken: mock(() => {}),
  verifyAdminPassword: mock(() => Promise.resolve(true)),
}));

// Helper to render async server component
async function renderLayout(children: React.ReactNode) {
  const { default: AdminLayout } = await import("./layout");
  const LayoutComponent = await AdminLayout({ children });
  return render(LayoutComponent);
}

describe("Admin Agent Workbench Layout", () => {
  beforeEach(() => {
    cleanup();
    mock.restore();
  });

  afterEach(() => {
    cleanup();
    mock.restore();
  });

  describe("Unauthenticated Access", () => {
    it("should render login form when not authenticated", async () => {
      // Setup: no session cookie
      mockCookiesGet.mockReturnValue(undefined);
      mockVerifySessionToken.mockReturnValue(false);

      const { container } = await renderLayout(<div>Test children</div>);

      // Should show login form
      expect(container.textContent).toContain("Admin Login");
      expect(container.querySelector('input[type="password"]')).toBeTruthy();
    });

    it("should render password input field in login form", async () => {
      mockCookiesGet.mockReturnValue(undefined);
      mockVerifySessionToken.mockReturnValue(false);

      await renderLayout(<div>Test children</div>);

      const passwordInput = screen.getByLabelText(/password/i);
      expect(passwordInput).toBeTruthy();
      expect(passwordInput.getAttribute("type")).toBe("password");
    });

    it("should render submit button in login form", async () => {
      mockCookiesGet.mockReturnValue(undefined);
      mockVerifySessionToken.mockReturnValue(false);

      await renderLayout(<div>Test children</div>);

      const submitButton = screen.getByRole("button", { name: /sign in/i });
      expect(submitButton).toBeTruthy();
    });

    it("should not render children when not authenticated", async () => {
      mockCookiesGet.mockReturnValue(undefined);
      mockVerifySessionToken.mockReturnValue(false);

      const { container } = await renderLayout(
        <div data-testid="protected-content">Protected Content</div>,
      );

      expect(container.textContent).not.toContain("Protected Content");
    });
  });

  describe("Authenticated Access", () => {
    it("should render layout with sidebar when authenticated", async () => {
      // Setup: valid session cookie
      mockCookiesGet.mockReturnValue({ value: "valid-session-token" });
      mockVerifySessionToken.mockReturnValue(true);

      const { container } = await renderLayout(
        <div data-testid="protected-content">Protected Content</div>,
      );

      // Should render sidebar navigation
      expect(container.textContent).toContain("Agent Workbench");
      expect(container.textContent).toContain("Protected Content");
    });

    it("should render all navigation links in sidebar", async () => {
      mockCookiesGet.mockReturnValue({ value: "valid-session-token" });
      mockVerifySessionToken.mockReturnValue(true);

      await renderLayout(<div>Content</div>);

      // Check for all required navigation items
      expect(screen.getByText("Chat Agent")).toBeTruthy();
      expect(screen.getByText("Job Fit Agent")).toBeTruthy();
      expect(screen.getByText("Resume Data")).toBeTruthy();
      expect(screen.getByText("Test Suite")).toBeTruthy();
      expect(screen.getByText("History")).toBeTruthy();
    });

    it("should render navigation links with correct hrefs", async () => {
      mockCookiesGet.mockReturnValue({ value: "valid-session-token" });
      mockVerifySessionToken.mockReturnValue(true);

      const { container } = await renderLayout(<div>Content</div>);

      const chatLink = container.querySelector(
        'a[href="/admin/agent-workbench"]',
      );
      const jobFitLink = container.querySelector(
        'a[href="/admin/agent-workbench/job-fit"]',
      );
      const resumeLink = container.querySelector(
        'a[href="/admin/agent-workbench/resume"]',
      );
      const testsLink = container.querySelector(
        'a[href="/admin/agent-workbench/tests"]',
      );
      const historyLink = container.querySelector(
        'a[href="/admin/agent-workbench/history"]',
      );

      expect(chatLink).toBeTruthy();
      expect(jobFitLink).toBeTruthy();
      expect(resumeLink).toBeTruthy();
      expect(testsLink).toBeTruthy();
      expect(historyLink).toBeTruthy();
    });

    it("should render logout button", async () => {
      mockCookiesGet.mockReturnValue({ value: "valid-session-token" });
      mockVerifySessionToken.mockReturnValue(true);

      await renderLayout(<div>Content</div>);

      const logoutButton = screen.getByRole("button", { name: /logout/i });
      expect(logoutButton).toBeTruthy();
    });

    it("should render children in main content area when authenticated", async () => {
      mockCookiesGet.mockReturnValue({ value: "valid-session-token" });
      mockVerifySessionToken.mockReturnValue(true);

      await renderLayout(
        <div data-testid="protected-content">Protected Content Here</div>,
      );

      const protectedContent = screen.getByTestId("protected-content");
      expect(protectedContent).toBeTruthy();
      expect(protectedContent.textContent).toBe("Protected Content Here");
    });
  });

  describe("Layout Structure", () => {
    it("should have proper flex layout structure", async () => {
      mockCookiesGet.mockReturnValue({ value: "valid-session-token" });
      mockVerifySessionToken.mockReturnValue(true);

      const { container } = await renderLayout(<div>Content</div>);

      // Should have flex container
      const flexContainer = container.querySelector(".flex.h-screen");
      expect(flexContainer).toBeTruthy();
    });

    it("should have sidebar and main content area", async () => {
      mockCookiesGet.mockReturnValue({ value: "valid-session-token" });
      mockVerifySessionToken.mockReturnValue(true);

      const { container } = await renderLayout(<div>Content</div>);

      // Check for sidebar (should be a nav element)
      const sidebar = container.querySelector("nav");
      expect(sidebar).toBeTruthy();

      // Check for main content area
      const main = container.querySelector("main");
      expect(main).toBeTruthy();
    });

    it("should apply overflow-auto to main content area", async () => {
      mockCookiesGet.mockReturnValue({ value: "valid-session-token" });
      mockVerifySessionToken.mockReturnValue(true);

      const { container } = await renderLayout(<div>Content</div>);

      const main = container.querySelector("main");
      expect(main?.className).toContain("overflow-auto");
    });
  });

  describe("Session Validation", () => {
    it("should verify session token from cookies", async () => {
      const sessionToken = "test-session-token";
      mockCookiesGet.mockReturnValue({ value: sessionToken });
      mockVerifySessionToken.mockReturnValue(true);

      await renderLayout(<div>Content</div>);

      // verifySessionToken should have been called
      expect(mockVerifySessionToken).toHaveBeenCalled();
    });

    it("should show login form when session token is invalid", async () => {
      mockCookiesGet.mockReturnValue({ value: "invalid-token" });
      mockVerifySessionToken.mockReturnValue(false);

      const { container } = await renderLayout(<div>Content</div>);

      expect(container.textContent).toContain("Admin Login");
    });
  });
});
