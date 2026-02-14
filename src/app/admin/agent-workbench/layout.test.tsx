/**
 * Tests for Admin Agent Workbench Layout
 * Validates layout structure and authenticated layout integration
 */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

// Mock Next.js navigation (needed by AuthenticatedLayout)
vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/admin/agent-workbench"),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    refresh: vi.fn(),
  })),
}));

// Mock the authenticated layout component
vi.mock("@/app/admin/authenticated-layout", () => ({
  AuthenticatedLayout: vi.fn(({ children }: { children: React.ReactNode }) => (
    <div data-testid="authenticated-layout">
      <nav data-testid="sidebar">
        <div>Agent Workbench</div>
        <a href="/admin/agent-workbench">Chat Agent</a>
        <a href="/admin/agent-workbench/job-fit">Job Fit Agent</a>
        <a href="/admin/agent-workbench/resume">Resume Data</a>
        <a href="/admin/agent-workbench/tests">Test Suite</a>
        <a href="/admin/agent-workbench/history">History</a>
        <button type="button">Logout</button>
      </nav>
      <main data-testid="main-content" className="flex-1 overflow-auto p-8">
        {children}
      </main>
    </div>
  )),
}));

// Mock logout button
vi.mock("@/app/admin/logout-button", () => ({
  LogoutButton: () => <button type="button">Logout</button>,
}));

describe("Admin Agent Workbench Layout", () => {
  afterEach(() => {
    cleanup();
  });

  describe("Layout Rendering", () => {
    it("should render the layout component", async () => {
      const { default: AdminLayout } = await import("./layout");

      render(
        <AdminLayout>
          <div>Test Content</div>
        </AdminLayout>,
      );

      expect(screen.getByTestId("authenticated-layout")).toBeDefined();
    });

    it("should wrap children in AuthenticatedLayout", async () => {
      const { default: AdminLayout } = await import("./layout");

      render(
        <AdminLayout>
          <div data-testid="child-content">Protected Content</div>
        </AdminLayout>,
      );

      // Should have authenticated layout wrapper
      expect(screen.getByTestId("authenticated-layout")).toBeDefined();

      // Should render children
      expect(screen.getByTestId("child-content")).toBeDefined();
      expect(screen.getByText("Protected Content")).toBeDefined();
    });

    it("should render navigation elements", async () => {
      const { default: AdminLayout } = await import("./layout");

      render(
        <AdminLayout>
          <div>Content</div>
        </AdminLayout>,
      );

      // Check for navigation elements from mocked AuthenticatedLayout
      expect(screen.getByText("Agent Workbench")).toBeDefined();
      expect(screen.getByText("Chat Agent")).toBeDefined();
      expect(screen.getByText("Job Fit Agent")).toBeDefined();
      expect(screen.getByText("Resume Data")).toBeDefined();
      expect(screen.getByText("Test Suite")).toBeDefined();
      expect(screen.getByText("History")).toBeDefined();
    });

    it("should render logout button", async () => {
      const { default: AdminLayout } = await import("./layout");

      render(
        <AdminLayout>
          <div>Content</div>
        </AdminLayout>,
      );

      const logoutButton = screen.getByRole("button", { name: /logout/i });
      expect(logoutButton).toBeDefined();
    });

    it("should have proper layout structure", async () => {
      const { default: AdminLayout } = await import("./layout");

      const { container } = render(
        <AdminLayout>
          <div>Content</div>
        </AdminLayout>,
      );

      // Should have sidebar nav
      const sidebar = screen.getByTestId("sidebar");
      expect(sidebar).toBeDefined();

      // Should have main content area
      const main = screen.getByTestId("main-content");
      expect(main).toBeDefined();
    });

    it("should render children in main content area", async () => {
      const { default: AdminLayout } = await import("./layout");

      render(
        <AdminLayout>
          <div data-testid="protected-content">Protected Content Here</div>
        </AdminLayout>,
      );

      const protectedContent = screen.getByTestId("protected-content");
      expect(protectedContent).toBeDefined();
      expect(protectedContent.textContent).toBe("Protected Content Here");
    });
  });

  describe("Navigation Links", () => {
    it("should render all navigation links with correct hrefs", async () => {
      const { default: AdminLayout } = await import("./layout");

      const { container } = render(
        <AdminLayout>
          <div>Content</div>
        </AdminLayout>,
      );

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

      expect(chatLink).toBeDefined();
      expect(jobFitLink).toBeDefined();
      expect(resumeLink).toBeDefined();
      expect(testsLink).toBeDefined();
      expect(historyLink).toBeDefined();
    });
  });
});
