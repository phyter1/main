/**
 * TestRunner Component Tests
 * Tests for AI prompt testing interface with test case management
 */

import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TestRunner from "./TestRunner";

describe("TestRunner Component", () => {
  const defaultProps = {
    agentType: "chat" as const,
    promptText: "You are a helpful assistant.",
  };

  beforeEach(() => {
    // Reset all mocks
    mock.restore();

    // Mock fetch with default success response
    global.fetch = mock(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            results: [],
            summary: {
              totalTests: 0,
              passed: 0,
              failed: 0,
              avgTokens: 0,
              avgLatencyMs: 0,
            },
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        ),
      ),
    ) as typeof fetch;
  });

  afterEach(() => {
    cleanup();
  });

  describe("Rendering and Structure", () => {
    it("should render test runner heading", () => {
      render(<TestRunner {...defaultProps} />);
      expect(
        screen.getByRole("heading", { name: /test runner/i }),
      ).toBeDefined();
    });

    it("should render run tests button", () => {
      render(<TestRunner {...defaultProps} />);
      expect(screen.getByRole("button", { name: /run tests/i })).toBeDefined();
    });

    it("should render add test case button", () => {
      render(<TestRunner {...defaultProps} />);
      expect(
        screen.getByRole("button", { name: /add test case/i }),
      ).toBeDefined();
    });

    it("should display agent type", () => {
      render(<TestRunner {...defaultProps} agentType="chat" />);
      expect(screen.getByText(/agent type:/i)).toBeDefined();
    });

    it("should render empty state message", () => {
      render(<TestRunner {...defaultProps} />);
      expect(
        screen.getByText(/no test cases. click "add test case" to create one/i),
      ).toBeDefined();
    });
  });

  describe("Test Case Management", () => {
    it("should show form when add test case is clicked", async () => {
      const user = userEvent.setup();
      render(<TestRunner {...defaultProps} />);

      const addButton = screen.getByRole("button", { name: /add test case/i });
      await user.click(addButton);

      expect(screen.getByLabelText(/question/i)).toBeDefined();
    });

    it("should show validation error when saving empty question", async () => {
      const user = userEvent.setup();
      render(<TestRunner {...defaultProps} />);

      await user.click(screen.getByRole("button", { name: /add test case/i }));

      // Try to save without filling question
      const saveButton = screen.getByRole("button", {
        name: /save test case/i,
      });
      await user.click(saveButton);

      expect(screen.getByText(/question is required/i)).toBeDefined();
    });

    it("should add a test case successfully", async () => {
      const user = userEvent.setup();
      render(<TestRunner {...defaultProps} />);

      // Open form
      await user.click(screen.getByRole("button", { name: /add test case/i }));

      // Fill question
      const questionInput = screen.getByLabelText(/question/i);
      await user.type(questionInput, "What is TypeScript?");

      // Save
      const saveButton = screen.getByRole("button", {
        name: /save test case/i,
      });
      await user.click(saveButton);

      // Verify test case appears
      await waitFor(() => {
        expect(screen.getByText(/what is typescript\?/i)).toBeDefined();
      });
    });

    it("should delete a test case", async () => {
      const user = userEvent.setup();
      render(<TestRunner {...defaultProps} />);

      // Add a test case first
      await user.click(screen.getByRole("button", { name: /add test case/i }));
      await user.type(screen.getByLabelText(/question/i), "Test question");
      await user.click(screen.getByRole("button", { name: /save test case/i }));

      // Find and click delete button
      await waitFor(() => {
        expect(screen.getByText(/test question/i)).toBeDefined();
      });

      const deleteButtons = screen.getAllByRole("button", { name: /delete/i });
      await user.click(deleteButtons[0]);

      // Verify test case is removed
      expect(screen.queryByText(/test question/i)).toBeNull();
    });

    it("should support multiple criterion types", async () => {
      const user = userEvent.setup();
      render(<TestRunner {...defaultProps} />);

      await user.click(screen.getByRole("button", { name: /add test case/i }));
      await user.type(screen.getByLabelText(/question/i), "Test");

      // Click add criterion
      await user.click(screen.getByRole("button", { name: /add criterion/i }));

      // Check criterion type options
      const criterionType = screen.getByLabelText(
        /criterion type/i,
      ) as HTMLSelectElement;
      const options = Array.from(criterionType.options).map((opt) => opt.value);

      expect(options).toContain("contains");
      expect(options).toContain("first-person");
      expect(options).toContain("token-limit");
      expect(options).toContain("max-length");
    });
  });

  describe("Test Execution", () => {
    it("should disable run button when no test cases", () => {
      render(<TestRunner {...defaultProps} />);

      const runButton = screen.getByRole("button", {
        name: /run tests/i,
      }) as HTMLButtonElement;
      expect(runButton.disabled).toBe(true);
    });

    it("should enable run button when test cases exist", async () => {
      const user = userEvent.setup();
      render(<TestRunner {...defaultProps} />);

      // Add a test case
      await user.click(screen.getByRole("button", { name: /add test case/i }));
      await user.type(screen.getByLabelText(/question/i), "Test");
      await user.click(screen.getByRole("button", { name: /save test case/i }));

      // Check run button is enabled
      await waitFor(() => {
        const runButton = screen.getByRole("button", {
          name: /run tests/i,
        }) as HTMLButtonElement;
        expect(runButton.disabled).toBe(false);
      });
    });

    it("should call API with correct parameters", async () => {
      const user = userEvent.setup();
      const mockFetch = mock(() =>
        Promise.resolve(
          new Response(
            JSON.stringify({
              results: [
                {
                  testCaseId: "test-1",
                  passed: true,
                  response: "I have TypeScript experience",
                  tokenCount: 150,
                  latencyMs: 1200,
                },
              ],
              summary: {
                totalTests: 1,
                passed: 1,
                failed: 0,
                avgTokens: 150,
                avgLatencyMs: 1200,
              },
            }),
            { status: 200 },
          ),
        ),
      );
      global.fetch = mockFetch as typeof fetch;

      render(<TestRunner {...defaultProps} />);

      // Add test case
      await user.click(screen.getByRole("button", { name: /add test case/i }));
      await user.type(
        screen.getByLabelText(/question/i),
        "What is TypeScript?",
      );
      await user.click(screen.getByRole("button", { name: /save test case/i }));

      // Run tests
      await waitFor(() => {
        const runButton = screen.getByRole("button", {
          name: /run tests/i,
        }) as HTMLButtonElement;
        expect(runButton.disabled).toBe(false);
      });

      await user.click(screen.getByRole("button", { name: /run tests/i }));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
        const call = mockFetch.mock.calls[0];
        expect(call[0]).toBe("/api/admin/test-prompt");
        expect(call[1]?.method).toBe("POST");
      });
    });

    it("should display test results after execution", async () => {
      const user = userEvent.setup();

      global.fetch = mock(() =>
        Promise.resolve(
          new Response(
            JSON.stringify({
              results: [
                {
                  testCaseId: "test-1",
                  passed: true,
                  response: "I have 7 years of experience",
                  tokenCount: 150,
                  latencyMs: 1200,
                },
              ],
              summary: {
                totalTests: 1,
                passed: 1,
                failed: 0,
                avgTokens: 150,
                avgLatencyMs: 1200,
              },
            }),
            { status: 200 },
          ),
        ),
      ) as typeof fetch;

      render(<TestRunner {...defaultProps} />);

      // Add and run test
      await user.click(screen.getByRole("button", { name: /add test case/i }));
      await user.type(
        screen.getByLabelText(/question/i),
        "TypeScript experience?",
      );
      await user.click(screen.getByRole("button", { name: /save test case/i }));

      await waitFor(() => {
        const runButton = screen.getByRole("button", {
          name: /run tests/i,
        }) as HTMLButtonElement;
        expect(runButton.disabled).toBe(false);
      });

      await user.click(screen.getByRole("button", { name: /run tests/i }));

      await waitFor(() => {
        expect(screen.getByText(/✅ pass/i)).toBeDefined();
      });
    });

    it("should display failed test results", async () => {
      const user = userEvent.setup();

      global.fetch = mock(() =>
        Promise.resolve(
          new Response(
            JSON.stringify({
              results: [
                {
                  testCaseId: "test-1",
                  passed: false,
                  response: "TypeScript is a programming language",
                  tokenCount: 180,
                  latencyMs: 1100,
                  failedCriteria: [
                    {
                      type: "first-person",
                      value: true,
                      reason: "Response does not use first-person",
                    },
                  ],
                },
              ],
              summary: {
                totalTests: 1,
                passed: 0,
                failed: 1,
                avgTokens: 180,
                avgLatencyMs: 1100,
              },
            }),
            { status: 200 },
          ),
        ),
      ) as typeof fetch;

      render(<TestRunner {...defaultProps} />);

      await user.click(screen.getByRole("button", { name: /add test case/i }));
      await user.type(screen.getByLabelText(/question/i), "Test question");
      await user.click(screen.getByRole("button", { name: /save test case/i }));

      await waitFor(() => {
        const runButton = screen.getByRole("button", {
          name: /run tests/i,
        }) as HTMLButtonElement;
        expect(runButton.disabled).toBe(false);
      });

      await user.click(screen.getByRole("button", { name: /run tests/i }));

      await waitFor(() => {
        expect(screen.getByText(/❌ fail/i)).toBeDefined();
      });
    });
  });

  describe("Metrics Display", () => {
    it("should display summary metrics after test run", async () => {
      const user = userEvent.setup();

      global.fetch = mock(() =>
        Promise.resolve(
          new Response(
            JSON.stringify({
              results: [
                {
                  testCaseId: "test-1",
                  passed: true,
                  response: "Response",
                  tokenCount: 200,
                  latencyMs: 1500,
                },
              ],
              summary: {
                totalTests: 1,
                passed: 1,
                failed: 0,
                avgTokens: 200,
                avgLatencyMs: 1500,
              },
            }),
            { status: 200 },
          ),
        ),
      ) as typeof fetch;

      render(<TestRunner {...defaultProps} />);

      await user.click(screen.getByRole("button", { name: /add test case/i }));
      await user.type(screen.getByLabelText(/question/i), "Test");
      await user.click(screen.getByRole("button", { name: /save test case/i }));

      await waitFor(() => {
        const runButton = screen.getByRole("button", {
          name: /run tests/i,
        }) as HTMLButtonElement;
        expect(runButton.disabled).toBe(false);
      });

      await user.click(screen.getByRole("button", { name: /run tests/i }));

      await waitFor(() => {
        expect(screen.getByText(/100%/i)).toBeDefined();
        expect(screen.getByText("200")).toBeDefined();
        expect(screen.getByText(/1500ms/i)).toBeDefined();
      });
    });

    it("should calculate pass rate correctly", async () => {
      const user = userEvent.setup();

      global.fetch = mock(() =>
        Promise.resolve(
          new Response(
            JSON.stringify({
              results: [
                {
                  testCaseId: "test-1",
                  passed: true,
                  response: "Pass",
                  tokenCount: 100,
                  latencyMs: 1000,
                },
                {
                  testCaseId: "test-2",
                  passed: false,
                  response: "Fail",
                  tokenCount: 120,
                  latencyMs: 1100,
                },
              ],
              summary: {
                totalTests: 2,
                passed: 1,
                failed: 1,
                avgTokens: 110,
                avgLatencyMs: 1050,
              },
            }),
            { status: 200 },
          ),
        ),
      ) as typeof fetch;

      render(<TestRunner {...defaultProps} />);

      // Add two test cases
      await user.click(screen.getByRole("button", { name: /add test case/i }));
      await user.type(screen.getByLabelText(/question/i), "Test 1");
      await user.click(screen.getByRole("button", { name: /save test case/i }));

      await user.click(screen.getByRole("button", { name: /add test case/i }));
      await user.type(screen.getByLabelText(/question/i), "Test 2");
      await user.click(screen.getByRole("button", { name: /save test case/i }));

      await waitFor(() => {
        const runButton = screen.getByRole("button", {
          name: /run tests/i,
        }) as HTMLButtonElement;
        expect(runButton.disabled).toBe(false);
      });

      await user.click(screen.getByRole("button", { name: /run tests/i }));

      await waitFor(() => {
        expect(screen.getByText(/50%/i)).toBeDefined();
      });
    });
  });

  describe("Error Handling", () => {
    it("should display error message on API failure", async () => {
      const user = userEvent.setup();

      global.fetch = mock(() =>
        Promise.resolve(
          new Response(JSON.stringify({ error: "API Error" }), {
            status: 500,
          }),
        ),
      ) as typeof fetch;

      render(<TestRunner {...defaultProps} />);

      await user.click(screen.getByRole("button", { name: /add test case/i }));
      await user.type(screen.getByLabelText(/question/i), "Test");
      await user.click(screen.getByRole("button", { name: /save test case/i }));

      await waitFor(() => {
        const runButton = screen.getByRole("button", {
          name: /run tests/i,
        }) as HTMLButtonElement;
        expect(runButton.disabled).toBe(false);
      });

      await user.click(screen.getByRole("button", { name: /run tests/i }));

      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeDefined();
      });
    });

    it("should handle network errors", async () => {
      const user = userEvent.setup();

      global.fetch = mock(() =>
        Promise.reject(new Error("Network error")),
      ) as typeof fetch;

      render(<TestRunner {...defaultProps} />);

      await user.click(screen.getByRole("button", { name: /add test case/i }));
      await user.type(screen.getByLabelText(/question/i), "Test");
      await user.click(screen.getByRole("button", { name: /save test case/i }));

      await waitFor(() => {
        const runButton = screen.getByRole("button", {
          name: /run tests/i,
        }) as HTMLButtonElement;
        expect(runButton.disabled).toBe(false);
      });

      await user.click(screen.getByRole("button", { name: /run tests/i }));

      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeDefined();
      });
    });
  });

  describe("UI Components", () => {
    it("should use Badge component for criteria display", async () => {
      const user = userEvent.setup();
      render(<TestRunner {...defaultProps} />);

      await user.click(screen.getByRole("button", { name: /add test case/i }));
      await user.type(screen.getByLabelText(/question/i), "Test");

      await user.click(screen.getByRole("button", { name: /add criterion/i }));
      await user.selectOptions(
        screen.getByLabelText(/criterion type/i),
        "first-person",
      );
      await user.click(screen.getByRole("button", { name: /save criterion/i }));

      await user.click(screen.getByRole("button", { name: /save test case/i }));

      await waitFor(() => {
        const badges = document.querySelectorAll('[data-slot="badge"]');
        expect(badges.length).toBeGreaterThan(0);
      });
    });

    it("should use Card component for metrics", async () => {
      const user = userEvent.setup();

      global.fetch = mock(() =>
        Promise.resolve(
          new Response(
            JSON.stringify({
              results: [
                {
                  testCaseId: "test-1",
                  passed: true,
                  response: "Response",
                  tokenCount: 100,
                  latencyMs: 1000,
                },
              ],
              summary: {
                totalTests: 1,
                passed: 1,
                failed: 0,
                avgTokens: 100,
                avgLatencyMs: 1000,
              },
            }),
            { status: 200 },
          ),
        ),
      ) as typeof fetch;

      render(<TestRunner {...defaultProps} />);

      await user.click(screen.getByRole("button", { name: /add test case/i }));
      await user.type(screen.getByLabelText(/question/i), "Test");
      await user.click(screen.getByRole("button", { name: /save test case/i }));

      await waitFor(() => {
        const runButton = screen.getByRole("button", {
          name: /run tests/i,
        }) as HTMLButtonElement;
        expect(runButton.disabled).toBe(false);
      });

      await user.click(screen.getByRole("button", { name: /run tests/i }));

      await waitFor(() => {
        const cards = document.querySelectorAll('[data-slot="card"]');
        expect(cards.length).toBeGreaterThan(0);
      });
    });
  });
});
