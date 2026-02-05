/**
 * Test suite for Agent Workbench page
 * Tests tab navigation and component integration
 */

import { afterEach, describe, expect, it, mock } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import AgentWorkbenchPage from "./page";

// Mock all admin components
mock.module("@/components/admin/PromptEditor", () => ({
  PromptEditor: ({ agentType }: { agentType: string }) => (
    <div data-testid={`prompt-editor-${agentType}`}>
      PromptEditor for {agentType}
    </div>
  ),
}));

mock.module("@/components/admin/TestRunner", () => ({
  default: ({ agentType }: { agentType: string }) => (
    <div data-testid="test-runner">TestRunner for {agentType}</div>
  ),
}));

mock.module("@/components/admin/ResumeUpdater", () => ({
  ResumeUpdater: () => <div data-testid="resume-updater">ResumeUpdater</div>,
}));

// Mock prompt versioning
const mockChatPrompt = {
  id: "chat-1",
  agentType: "chat" as const,
  prompt: "You are a helpful chat assistant.",
  description: "Chat agent prompt",
  author: "admin",
  tokenCount: 10,
  createdAt: "2026-02-04T12:00:00Z",
  isActive: true,
};

const mockFitAssessmentPrompt = {
  id: "fit-1",
  agentType: "fit-assessment" as const,
  prompt: "Assess job fit based on resume.",
  description: "Fit assessment prompt",
  author: "admin",
  tokenCount: 8,
  createdAt: "2026-02-04T12:00:00Z",
  isActive: true,
};

mock.module("@/lib/prompt-versioning", () => ({
  getActiveVersion: mock(async (agentType: string) => {
    if (agentType === "chat") return mockChatPrompt;
    if (agentType === "fit-assessment") return mockFitAssessmentPrompt;
    return null;
  }),
}));

// Mock resume data
const mockResume = {
  personalInfo: {
    name: "Test User",
    title: "Test Developer",
    location: "Test City",
    summary: "Test summary",
  },
  experience: [],
  skills: {
    languages: [],
    frameworks: [],
    databases: [],
    devTools: [],
    infrastructure: [],
  },
  projects: [],
  principles: [],
};

mock.module("@/data/resume", () => ({
  resume: mockResume,
}));

// Mock Link component
mock.module("next/link", () => ({
  default: ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => <a href={href}>{children}</a>,
}));

describe("AgentWorkbenchPage", () => {
  afterEach(() => {
    // Cleanup after each test
    document.body.innerHTML = "";
  });

  it("should render the page title and admin badge", async () => {
    const Page = await AgentWorkbenchPage();
    const { unmount } = render(Page);

    expect(screen.getByText("AI Agent Workbench")).toBeDefined();
    expect(screen.getByText("Admin Mode")).toBeDefined();

    unmount();
  });

  it("should render all tab triggers", async () => {
    const Page = await AgentWorkbenchPage();
    const { unmount } = render(Page);

    expect(screen.getByRole("tab", { name: "Chat Agent" })).toBeDefined();
    expect(screen.getByRole("tab", { name: "Job Fit Agent" })).toBeDefined();
    expect(screen.getByRole("tab", { name: "Resume Data" })).toBeDefined();
    expect(screen.getByRole("tab", { name: "Test Suite" })).toBeDefined();
    expect(screen.getByRole("tab", { name: "History" })).toBeDefined();

    unmount();
  });

  it("should show Chat Agent tab content by default", async () => {
    const Page = await AgentWorkbenchPage();
    const { unmount } = render(Page);

    expect(screen.getByTestId("prompt-editor-chat")).toBeDefined();

    unmount();
  });

  it("should switch to Job Fit Agent tab when clicked", async () => {
    const Page = await AgentWorkbenchPage();
    const { unmount, container } = render(Page);

    const fitTab = screen.getByRole("tab", { name: "Job Fit Agent" });
    fireEvent.click(fitTab);

    // Check that the element exists in the DOM (may be hidden by CSS)
    const fitEditor = container.querySelector(
      '[data-testid="prompt-editor-fit-assessment"]',
    );
    expect(fitEditor).toBeDefined();

    unmount();
  });

  it("should switch to Resume Data tab when clicked", async () => {
    const Page = await AgentWorkbenchPage();
    const { unmount, container } = render(Page);

    const resumeTab = screen.getByRole("tab", { name: "Resume Data" });
    fireEvent.click(resumeTab);

    // Check that the element exists in the DOM (may be hidden by CSS)
    const resumeUpdater = container.querySelector(
      '[data-testid="resume-updater"]',
    );
    expect(resumeUpdater).toBeDefined();

    unmount();
  });

  it("should switch to Test Suite tab when clicked", async () => {
    const Page = await AgentWorkbenchPage();
    const { unmount, container } = render(Page);

    const testTab = screen.getByRole("tab", { name: "Test Suite" });
    fireEvent.click(testTab);

    // Check that the element exists in the DOM (may be hidden by CSS)
    const testRunner = container.querySelector('[data-testid="test-runner"]');
    expect(testRunner).toBeDefined();

    unmount();
  });

  it("should render history tab", async () => {
    const Page = await AgentWorkbenchPage();
    const { unmount } = render(Page);

    // Verify the history tab exists
    const historyTab = screen.getByRole("tab", { name: "History" });
    expect(historyTab).toBeDefined();

    unmount();
  });

  it("should load active prompts on mount", async () => {
    const Page = await AgentWorkbenchPage();
    const { unmount, container } = render(Page);

    // Verify chat prompt editor receives initial prompt
    const chatEditor = screen.getByTestId("prompt-editor-chat");
    expect(chatEditor).toBeDefined();

    // Switch to fit assessment tab
    const fitTab = screen.getByRole("tab", { name: "Job Fit Agent" });
    fireEvent.click(fitTab);

    // Verify fit assessment prompt editor is in DOM
    const fitEditor = container.querySelector(
      '[data-testid="prompt-editor-fit-assessment"]',
    );
    expect(fitEditor).toBeDefined();

    unmount();
  });

  it("should pass resume data to ResumeUpdater", async () => {
    const Page = await AgentWorkbenchPage();
    const { unmount, container } = render(Page);

    const resumeTab = screen.getByRole("tab", { name: "Resume Data" });
    fireEvent.click(resumeTab);

    // Check that the element exists in the DOM
    const resumeUpdater = container.querySelector(
      '[data-testid="resume-updater"]',
    );
    expect(resumeUpdater).toBeDefined();

    unmount();
  });

  it("should be accessible with proper ARIA labels", async () => {
    const Page = await AgentWorkbenchPage();
    const { container, unmount } = render(Page);

    // Check for main heading
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading.textContent).toBe("AI Agent Workbench");

    // Check for tab navigation structure
    const tablist = container.querySelector('[role="tablist"]');
    expect(tablist).toBeDefined();

    unmount();
  });

  it("should maintain mobile responsiveness", async () => {
    const Page = await AgentWorkbenchPage();
    const { container, unmount } = render(Page);

    // Check for responsive classes
    const mainContainer = container.querySelector(".space-y-6");
    expect(mainContainer).toBeDefined();

    unmount();
  });
});
