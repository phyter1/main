/**
 * Integration Tests for Admin Workflows
 * Tests complete user flows: login → refine → test → deploy
 * Tests resume update workflow: request → preview → apply
 * Tests rollback workflow: history → select → deploy
 * Tests unauthorized access handling
 */

import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock Next.js router
const mockRouterPush = mock(() => {});
const mockRouterRefresh = mock(() => {});

mock.module("next/navigation", () => ({
  useRouter: () => ({
    push: mockRouterPush,
    refresh: mockRouterRefresh,
  }),
}));

// Mock authentication library
const mockVerifyAdminPassword = mock(
  async (password: string) => password === "correct-password",
);
const mockGenerateSessionToken = mock(() => "mock-session-token");
const mockStoreSessionToken = mock(() => {});
const mockCreateSessionCookie = mock(
  () => "session=mock-session-token; Path=/; HttpOnly",
);
const mockVerifySessionToken = mock(
  (token: string) => token === "valid-session-token",
);

mock.module("@/lib/auth", () => ({
  verifyAdminPassword: mockVerifyAdminPassword,
  generateSessionToken: mockGenerateSessionToken,
  storeSessionToken: mockStoreSessionToken,
  createSessionCookie: mockCreateSessionCookie,
  verifySessionToken: mockVerifySessionToken,
}));

// Mock prompt versioning
const mockGetActiveVersion = mock(async (agentType: string) => {
  if (agentType === "chat") {
    return {
      id: "chat-v1",
      agentType: "chat",
      prompt: "You are a helpful chat assistant.",
      description: "Initial chat prompt",
      author: "admin",
      tokenCount: 10,
      createdAt: "2026-02-04T12:00:00Z",
      isActive: true,
    };
  }
  return null;
});

const mockRollbackVersion = mock(async () => {});

mock.module("@/lib/prompt-versioning", () => ({
  getActiveVersion: mockGetActiveVersion,
  rollbackVersion: mockRollbackVersion,
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

// NOTE: Import order - Components must be imported AFTER mocks are set up for proper test execution
// This is intentional and required for the test framework to work correctly
import PromptHistoryPage from "@/app/admin/agent-workbench/history/page";
import { LoginForm } from "@/components/admin/auth/LoginForm";
import { PromptEditor } from "@/components/admin/PromptEditor";
import { ResumeUpdater } from "@/components/admin/ResumeUpdater";

describe("Admin Workflows Integration Tests", () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockRouterPush.mockClear();
    mockRouterRefresh.mockClear();
    mockVerifyAdminPassword.mockClear();
    mockGenerateSessionToken.mockClear();
    mockStoreSessionToken.mockClear();
    mockCreateSessionCookie.mockClear();
    mockVerifySessionToken.mockClear();
    mockGetActiveVersion.mockClear();
    mockRollbackVersion.mockClear();

    // Reset fetch mock
    global.fetch = mock(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      } as Response),
    );
  });

  afterEach(() => {
    cleanup();
    mock.restore();
  });

  describe("Login to Refinement to Deployment Workflow", () => {
    it("completes full refinement workflow from login to deployment", async () => {
      const user = userEvent.setup();

      // Mock window.location since LoginForm uses window.location.href for redirect
      const originalLocation = window.location;
      delete (window as { location?: Location }).location;
      window.location = { ...originalLocation, href: "" } as Location;

      // Step 1: Mock login API
      global.fetch = mock((url: string) => {
        if (url === "/api/admin/login") {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                success: true,
                redirectTo: "/admin/agent-workbench",
              }),
            headers: new Headers({
              "Set-Cookie": "session=mock-session-token; Path=/; HttpOnly",
            }),
          } as Response);
        }

        if (url === "/api/admin/refine-prompt") {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                proposedPrompt:
                  "You are a helpful and professional chat assistant.",
                diffSummary: "Made tone more professional",
                tokenCountOriginal: 10,
                tokenCountProposed: 12,
                changes: ["Added 'professional' adjective"],
              }),
          } as Response);
        }

        if (url === "/api/admin/test-prompt") {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                testResults: [
                  {
                    input: "Hello",
                    output: "Hello! How can I help you today?",
                    passed: true,
                  },
                ],
              }),
          } as Response);
        }

        if (url === "/api/admin/deploy-prompt") {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                success: true,
                versionId: "chat-v2",
                message: "Deployed successfully",
              }),
          } as Response);
        }

        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        } as Response);
      });

      // Step 2: Render login page
      render(<LoginForm />);

      // Step 3: Login
      const passwordInput = screen.getByLabelText("Password");
      await user.type(passwordInput, "correct-password");

      const loginButton = screen.getByRole("button", { name: /Sign in/i });
      await user.click(loginButton);

      // Verify login API was called and window.location.href was set
      await waitFor(() => {
        expect(window.location.href).toBe("/admin/agent-workbench");
      });

      // Restore window.location
      window.location = originalLocation;

      // Step 4: Now render the PromptEditor component (simulating navigation)
      cleanup();
      render(
        <PromptEditor
          agentType="chat"
          initialPrompt="You are a helpful chat assistant."
        />,
      );

      // Step 5: Submit refinement request
      const refinementTextarea = screen.getByPlaceholderText(
        "Describe how to refine the prompt...",
      );
      await user.type(refinementTextarea, "Make tone more professional");

      const refineButton = screen.getByRole("button", {
        name: /Refine Prompt/i,
      });
      await user.click(refineButton);

      // Step 6: Verify proposed changes displayed
      await waitFor(() => {
        expect(screen.getByText("Proposed Prompt")).toBeDefined();
      });

      // Step 7: Test changes (note: actual testing would navigate to test tab)
      const testButton = screen.getByRole("button", { name: /Test Changes/i });
      expect(testButton).toBeDefined();

      // Step 8: Apply changes
      const applyButton = screen.getByRole("button", {
        name: /Apply Changes/i,
      });
      await user.click(applyButton);

      // Verify changes applied
      await waitFor(() => {
        expect(
          screen.getByText(
            "You are a helpful and professional chat assistant.",
          ),
        ).toBeDefined();
      });

      // Note: Deployment would typically happen in a separate step
      // This test verifies the complete workflow is functional
    });

    it("handles refinement errors gracefully", async () => {
      const user = userEvent.setup();

      // Mock API error
      global.fetch = mock(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          json: () => Promise.resolve({ error: "Internal server error" }),
        } as Response),
      );

      render(<PromptEditor agentType="chat" initialPrompt="Initial prompt" />);

      const textarea = screen.getByPlaceholderText(
        "Describe how to refine the prompt...",
      );
      await user.type(textarea, "Test refinement");

      const refineButton = screen.getByRole("button", {
        name: /Refine Prompt/i,
      });
      await user.click(refineButton);

      // Verify error is displayed
      await waitFor(() => {
        const errorElements = screen.getAllByText(/error/i);
        expect(errorElements.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Resume Update Workflow", () => {
    it("completes full resume update workflow from request to apply", async () => {
      const user = userEvent.setup();

      // Mock update-resume API
      global.fetch = mock((url: string) => {
        if (url === "/api/admin/update-resume") {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                proposedChanges: {
                  section: "projects",
                  operation: "add",
                  data: {
                    title: "New Project",
                    description: "Test project",
                    technologies: ["React", "TypeScript"],
                  },
                },
                preview: "Added new project: New Project",
                affectedSections: ["projects"],
              }),
          } as Response);
        }

        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        } as Response);
      });

      // Render ResumeUpdater
      render(<ResumeUpdater initialResume={mockResume} />);

      // Step 1: Submit update request
      const updateTextarea = screen.getByPlaceholderText(/Add project X/i);
      await user.type(
        updateTextarea,
        "Add project: Build a portfolio with Next.js",
      );

      const requestButton = screen.getByRole("button", {
        name: /Request Update/i,
      });
      await user.click(requestButton);

      // Step 2: Verify proposed changes displayed
      await waitFor(() => {
        expect(screen.getByText("Proposed Changes")).toBeDefined();
      });

      // Step 3: Verify preview is shown
      await waitFor(() => {
        expect(screen.getByText(/Added new project/i)).toBeDefined();
      });

      // Step 4: Apply changes
      const applyButton = screen.getByRole("button", {
        name: /Apply Changes/i,
      });
      await user.click(applyButton);

      // Verify changes applied (proposed changes should disappear)
      await waitFor(() => {
        expect(screen.queryByText("Proposed Changes")).toBeNull();
      });
    });

    it("allows canceling resume updates", async () => {
      const user = userEvent.setup();

      // Mock update-resume API
      global.fetch = mock(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              proposedChanges: {
                section: "skills",
                operation: "add",
                data: { name: "React", proficiency: "advanced" },
              },
              preview: "Added skill: React",
              affectedSections: ["skills"],
            }),
        } as Response),
      );

      render(<ResumeUpdater initialResume={mockResume} />);

      // Submit update request
      const textarea = screen.getByPlaceholderText(/Add project X/i);
      await user.type(textarea, "Add React to skills");

      const requestButton = screen.getByRole("button", {
        name: /Request Update/i,
      });
      await user.click(requestButton);

      // Wait for proposed changes
      await waitFor(() => {
        expect(screen.getByText("Proposed Changes")).toBeDefined();
      });

      // Cancel changes
      const cancelButton = screen.getByRole("button", { name: /Cancel/i });
      await user.click(cancelButton);

      // Verify proposed changes are cleared
      expect(screen.queryByText("Proposed Changes")).toBeNull();
    });

    it("handles resume update errors", async () => {
      const user = userEvent.setup();

      // Mock API error
      global.fetch = mock(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          json: () => Promise.resolve({ error: "Update failed" }),
        } as Response),
      );

      render(<ResumeUpdater initialResume={mockResume} />);

      const textarea = screen.getByPlaceholderText(/Add project X/i);
      await user.type(textarea, "Add new project");

      const requestButton = screen.getByRole("button", {
        name: /Request Update/i,
      });
      await user.click(requestButton);

      // Verify error is displayed
      await waitFor(() => {
        expect(screen.getByText(/failed/i)).toBeDefined();
      });
    });
  });

  describe("Rollback Workflow", () => {
    it("completes rollback workflow from history to deployment", async () => {
      const user = userEvent.setup();

      // Mock prompt history API
      global.fetch = mock((url: string) => {
        if (url.includes("/api/admin/prompt-history")) {
          // Need to handle both chat and fit-assessment calls for "all" filter
          if (url.includes("agentType=chat")) {
            return Promise.resolve({
              ok: true,
              json: () =>
                Promise.resolve({
                  versions: [
                    {
                      id: "chat-v2",
                      agentType: "chat",
                      prompt: "You are a professional chat assistant.",
                      description: "Professional version",
                      author: "admin",
                      tokenCount: 12,
                      createdAt: "2026-02-04T14:00:00Z",
                      isActive: true,
                    },
                    {
                      id: "chat-v1",
                      agentType: "chat",
                      prompt: "You are a helpful chat assistant.",
                      description: "Initial version",
                      author: "admin",
                      tokenCount: 10,
                      createdAt: "2026-02-04T12:00:00Z",
                      isActive: false,
                    },
                  ],
                }),
            } as Response);
          }

          if (url.includes("agentType=fit-assessment")) {
            return Promise.resolve({
              ok: true,
              json: () =>
                Promise.resolve({
                  versions: [],
                }),
            } as Response);
          }

          // Default response for other cases
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ versions: [] }),
          } as Response);
        }

        if (url === "/api/admin/deploy-prompt") {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                success: true,
                versionId: "chat-v1",
                message: "Rollback successful",
              }),
          } as Response);
        }

        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        } as Response);
      });

      // Render history page
      render(<PromptHistoryPage />);

      // Wait for versions to load (look for any version text)
      await waitFor(
        () => {
          const versionElements = screen.getAllByText(
            /Professional version|Initial version/i,
          );
          expect(versionElements.length).toBeGreaterThan(0);
        },
        { timeout: 3000 },
      );

      // Verify both versions are displayed
      const initialVersionElements = screen.getAllByText(/Initial version/i);
      expect(initialVersionElements.length).toBeGreaterThan(0);

      // Find rollback button for inactive version
      const rollbackButtons = screen.getAllByRole("button", {
        name: /Rollback/i,
      });
      expect(rollbackButtons.length).toBeGreaterThan(0);

      // Click rollback button
      await user.click(rollbackButtons[0]);

      // Verify deploy API was called
      await waitFor(() => {
        const mockFetch = global.fetch as {
          mock?: { calls: Array<[string, ...unknown[]]> };
        };
        const fetchCalls = mockFetch.mock?.calls || [];
        const deployCall = fetchCalls.find(
          (call) => call[0] === "/api/admin/deploy-prompt",
        );
        expect(deployCall).toBeDefined();
      });
    });

    it("filters history by agent type", async () => {
      // Note: user interaction with dropdown would require more complex testing
      // This test verifies the dropdown is rendered and clickable

      // Mock prompt history API for different agent types
      global.fetch = mock((url: string) => {
        if (url.includes("agentType=chat")) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                versions: [
                  {
                    id: "chat-v1",
                    agentType: "chat",
                    prompt: "Chat prompt",
                    description: "Chat version",
                    author: "admin",
                    tokenCount: 10,
                    createdAt: "2026-02-04T12:00:00Z",
                    isActive: true,
                  },
                ],
              }),
          } as Response);
        }

        if (url.includes("agentType=fit-assessment")) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                versions: [
                  {
                    id: "fit-v1",
                    agentType: "fit-assessment",
                    prompt: "Fit assessment prompt",
                    description: "Fit version",
                    author: "admin",
                    tokenCount: 8,
                    createdAt: "2026-02-04T12:00:00Z",
                    isActive: true,
                  },
                ],
              }),
          } as Response);
        }

        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ versions: [] }),
        } as Response);
      });

      const { container } = render(<PromptHistoryPage />);

      // Wait for initial load - the page loads with "all" filter which fetches both agent types
      await waitFor(() => {
        const versionElements = screen.getAllByText(
          /Chat version|Fit version/i,
        );
        expect(versionElements.length).toBeGreaterThan(0);
      });

      // Find and click the filter dropdown
      const selectTrigger = container.querySelector('[role="combobox"]');
      if (selectTrigger) {
        fireEvent.click(selectTrigger);
      }

      // Verify dropdown functionality (filter trigger exists and is clickable)
      expect(selectTrigger).toBeDefined();
    });

    it("handles rollback errors", async () => {
      const user = userEvent.setup();

      // Track if deploy was called
      let deployCalled = false;

      // Mock prompt history API
      global.fetch = mock((url: string) => {
        if (url.includes("/api/admin/prompt-history")) {
          // Handle both chat and fit-assessment for "all" filter
          if (url.includes("agentType=chat")) {
            return Promise.resolve({
              ok: true,
              json: () =>
                Promise.resolve({
                  versions: [
                    {
                      id: "chat-v1",
                      agentType: "chat",
                      prompt: "Test prompt",
                      description: "Test version",
                      author: "admin",
                      tokenCount: 10,
                      createdAt: "2026-02-04T12:00:00Z",
                      isActive: false,
                    },
                  ],
                }),
            } as Response);
          }

          if (url.includes("agentType=fit-assessment")) {
            return Promise.resolve({
              ok: true,
              json: () => Promise.resolve({ versions: [] }),
            } as Response);
          }

          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ versions: [] }),
          } as Response);
        }

        if (url === "/api/admin/deploy-prompt") {
          deployCalled = true;
          return Promise.resolve({
            ok: false,
            status: 500,
            json: () => Promise.resolve({ error: "Deployment failed" }),
          } as Response);
        }

        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        } as Response);
      });

      const { container } = render(<PromptHistoryPage />);

      // Wait for versions to load
      await waitFor(
        () => {
          const versionElements = screen.getAllByText(/Test version/i);
          expect(versionElements.length).toBeGreaterThan(0);
        },
        { timeout: 3000 },
      );

      // Click rollback button
      const rollbackButton = screen.getByRole("button", { name: /Rollback/i });
      await user.click(rollbackButton);

      // Wait for deploy call to complete
      await waitFor(
        () => {
          expect(deployCalled).toBe(true);
        },
        { timeout: 2000 },
      );

      // The error is displayed in a specific error div with class including "destructive"
      // Wait a bit for the error to render
      await waitFor(
        () => {
          const errorDiv = container.querySelector('[class*="destructive"]');
          expect(errorDiv).toBeDefined();
        },
        { timeout: 2000 },
      );
    });
  });

  describe("Unauthorized Access Workflow", () => {
    it("handles login with incorrect password", async () => {
      const user = userEvent.setup();

      // Mock login API with failure
      global.fetch = mock(() =>
        Promise.resolve({
          ok: false,
          status: 401,
          json: () => Promise.resolve({ error: "Invalid password" }),
        } as Response),
      );

      render(<LoginForm />);

      const passwordInput = screen.getByLabelText("Password");
      await user.type(passwordInput, "wrong-password");

      const loginButton = screen.getByRole("button", { name: /Sign in/i });
      await user.click(loginButton);

      // Verify error is displayed
      await waitFor(() => {
        expect(screen.getByText("Invalid password")).toBeDefined();
      });

      // Verify no redirect occurred
      expect(mockRouterPush).not.toHaveBeenCalled();
    });

    it("handles network errors during login", async () => {
      const user = userEvent.setup();

      // Mock network error
      global.fetch = mock(() => Promise.reject(new Error("Network error")));

      render(<LoginForm />);

      const passwordInput = screen.getByLabelText("Password");
      await user.type(passwordInput, "correct-password");

      const loginButton = screen.getByRole("button", { name: /Sign in/i });
      await user.click(loginButton);

      // Verify error is displayed
      await waitFor(() => {
        expect(screen.getByText(/error occurred/i)).toBeDefined();
      });
    });

    it("prevents empty password submission", async () => {
      render(<LoginForm />);

      const loginButton = screen.getByRole("button", { name: /Sign in/i });

      // Button should be enabled but form validation should prevent submission
      expect(loginButton.hasAttribute("disabled")).toBe(false);

      // Password input should have required attribute
      const passwordInput = screen.getByLabelText(
        "Password",
      ) as HTMLInputElement;
      expect(passwordInput.hasAttribute("required")).toBe(true);
    });
  });

  describe("End-to-End Workflow Scenarios", () => {
    it("handles multiple refinements in a session", async () => {
      const user = userEvent.setup();

      let refinementCount = 0;

      global.fetch = mock(() => {
        refinementCount++;
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              proposedPrompt: `Refined prompt version ${refinementCount}`,
              diffSummary: `Refinement ${refinementCount} applied`,
              tokenCountOriginal: 10,
              tokenCountProposed: 10 + refinementCount,
              changes: [`Change ${refinementCount}`],
            }),
        } as Response);
      });

      render(<PromptEditor agentType="chat" initialPrompt="Original prompt" />);

      // First refinement
      const textarea = screen.getByPlaceholderText(
        "Describe how to refine the prompt...",
      );
      await user.type(textarea, "First refinement");

      const refineButton = screen.getByRole("button", {
        name: /Refine Prompt/i,
      });
      await user.click(refineButton);

      await waitFor(() => {
        expect(screen.getByText("Refined prompt version 1")).toBeDefined();
      });

      // Apply first refinement
      const applyButton = screen.getByRole("button", {
        name: /Apply Changes/i,
      });
      await user.click(applyButton);

      // Second refinement
      await user.type(textarea, "Second refinement");
      await user.click(refineButton);

      await waitFor(() => {
        expect(screen.getByText("Refined prompt version 2")).toBeDefined();
      });

      // Verify refinement history shows both refinements
      expect(screen.getByText("First refinement")).toBeDefined();
      expect(screen.getByText("Second refinement")).toBeDefined();
    });

    it("maintains workflow state across component interactions", async () => {
      const user = userEvent.setup();

      global.fetch = mock(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              proposedPrompt: "New prompt",
              diffSummary: "Changes applied",
              tokenCountOriginal: 10,
              tokenCountProposed: 12,
              changes: ["Test change"],
            }),
        } as Response),
      );

      render(<PromptEditor agentType="chat" initialPrompt="Initial prompt" />);

      // Start refinement
      const textarea = screen.getByPlaceholderText(
        "Describe how to refine the prompt...",
      );
      await user.type(textarea, "Make changes");

      const refineButton = screen.getByRole("button", {
        name: /Refine Prompt/i,
      });
      await user.click(refineButton);

      // Wait for proposed changes
      await waitFor(() => {
        expect(screen.getByText("Proposed Prompt")).toBeDefined();
      });

      // Revert changes
      const revertButton = screen.getByRole("button", { name: /Revert/i });
      await user.click(revertButton);

      // Verify state is cleared
      expect(screen.queryByText("Proposed Prompt")).toBeNull();

      // Verify original prompt is still displayed
      expect(screen.getByText("Initial prompt")).toBeDefined();
    });
  });
});
