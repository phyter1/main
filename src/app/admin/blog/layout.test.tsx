import { afterEach, describe, expect, it, mock } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";

/**
 * Admin Blog Layout Tests (T015)
 *
 * Test suite for the admin blog layout covering:
 * - Authenticated layout wrapper integration
 * - Children rendering
 * - Authentication requirement
 * - Layout structure
 */

// Mock authenticated layout
mock.module("@/app/admin/agent-workbench/authenticated-layout", () => ({
  AuthenticatedLayout: mock(({ children }: { children: React.ReactNode }) => (
    <div data-testid="authenticated-layout">
      <div>Authenticated Layout Wrapper</div>
      {children}
    </div>
  )),
}));

describe("Admin Blog Layout", () => {
  afterEach(() => {
    cleanup();
  });

  describe("Layout Rendering", () => {
    it("should render the layout component", async () => {
      const { default: BlogLayout } = await import("./layout");

      render(
        <BlogLayout>
          <div>Test Content</div>
        </BlogLayout>,
      );

      expect(screen.getByTestId("authenticated-layout")).toBeDefined();
    });

    it("should wrap children in AuthenticatedLayout", async () => {
      const { default: BlogLayout } = await import("./layout");

      render(
        <BlogLayout>
          <div data-testid="child-content">Child Content</div>
        </BlogLayout>,
      );

      // Should have authenticated layout wrapper
      expect(screen.getByTestId("authenticated-layout")).toBeDefined();
      expect(screen.getByText("Authenticated Layout Wrapper")).toBeDefined();

      // Should render children
      expect(screen.getByTestId("child-content")).toBeDefined();
      expect(screen.getByText("Child Content")).toBeDefined();
    });

    it("should render multiple children", async () => {
      const { default: BlogLayout } = await import("./layout");

      render(
        <BlogLayout>
          <div>First Child</div>
          <div>Second Child</div>
        </BlogLayout>,
      );

      expect(screen.getByText("First Child")).toBeDefined();
      expect(screen.getByText("Second Child")).toBeDefined();
    });
  });

  describe("Authentication Requirement", () => {
    it("should use authenticated layout for security", async () => {
      const { default: BlogLayout } = await import("./layout");

      render(
        <BlogLayout>
          <div>Protected Content</div>
        </BlogLayout>,
      );

      // Verify authenticated layout is being used
      expect(screen.getByTestId("authenticated-layout")).toBeDefined();
    });
  });
});
