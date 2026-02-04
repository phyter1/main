import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { JobFitAnalyzer } from "./JobFitAnalyzer";

// Mock fetch for API calls
const mockFetch = mock(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () =>
      Promise.resolve({
        fitLevel: "strong",
        reasoning: [
          "Strong TypeScript and React experience",
          "Proven track record in full-stack development",
        ],
        recommendations: [
          "Highlight your AI integration experience",
          "Emphasize leadership in technical projects",
        ],
      }),
  }),
);

global.fetch = mockFetch as unknown as typeof fetch;

describe("JobFitAnalyzer Component", () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  describe("Initial Render", () => {
    it("should render the component with textarea and button", () => {
      render(<JobFitAnalyzer />);

      expect(screen.getByLabelText(/job description/i)).toBeDefined();
      expect(
        screen.getByRole("button", { name: /analyze fit/i }),
      ).toBeDefined();
    });

    it("should have an empty textarea initially", () => {
      render(<JobFitAnalyzer />);

      const textarea = screen.getByLabelText(
        /job description/i,
      ) as HTMLTextAreaElement;
      expect(textarea.value).toBe("");
    });

    it("should not display results before submission", () => {
      render(<JobFitAnalyzer />);

      expect(screen.queryByText(/fit level/i)).toBeNull();
      expect(screen.queryByText(/reasoning/i)).toBeNull();
    });
  });

  describe("User Input", () => {
    it("should allow user to type in textarea", async () => {
      const user = userEvent.setup();
      render(<JobFitAnalyzer />);

      const textarea = screen.getByLabelText(
        /job description/i,
      ) as HTMLTextAreaElement;
      const testInput = "Looking for a Senior React Developer with 5+ years";

      await user.type(textarea, testInput);

      expect(textarea.value).toBe(testInput);
    });

    it("should enable submit button when textarea has content", async () => {
      const user = userEvent.setup();
      render(<JobFitAnalyzer />);

      const textarea = screen.getByLabelText(/job description/i);
      const button = screen.getByRole("button", {
        name: /analyze fit/i,
      }) as HTMLButtonElement;

      await user.type(textarea, "Test job description");

      expect(button.disabled).toBe(false);
    });
  });

  describe("Form Validation", () => {
    it("should disable button when job description is empty", () => {
      render(<JobFitAnalyzer />);

      const button = screen.getByRole("button", {
        name: /analyze fit/i,
      }) as HTMLButtonElement;

      expect(button.disabled).toBe(true);
    });

    it("should show error for job description exceeding 10k characters", async () => {
      const user = userEvent.setup();
      render(<JobFitAnalyzer />);

      const textarea = screen.getByLabelText(/job description/i);
      // Type past the limit - userEvent.type can be slow, so we'll use paste simulation
      const longText = "a".repeat(10001);

      // Simulate pasting text directly
      await user.click(textarea);
      await user.paste(longText);

      await waitFor(() => {
        expect(
          screen.getByText(/must not exceed.*10.*characters/i),
        ).toBeDefined();
      });
    });

    it("should display character count", () => {
      render(<JobFitAnalyzer />);

      expect(screen.getByText(/0 \/ 10,000/)).toBeDefined();
    });

    it("should update character count as user types", async () => {
      const user = userEvent.setup();
      render(<JobFitAnalyzer />);

      const textarea = screen.getByLabelText(/job description/i);
      await user.type(textarea, "Test");

      expect(screen.getByText(/4 \/ 10,000/)).toBeDefined();
    });
  });

  describe("API Integration", () => {
    it("should call API with job description on submit", async () => {
      const user = userEvent.setup();
      mockFetch.mockClear();

      render(<JobFitAnalyzer />);

      const textarea = screen.getByLabelText(/job description/i);
      const button = screen.getByRole("button", { name: /analyze fit/i });

      await user.type(
        textarea,
        "Looking for a Senior React Developer with 5+ years experience",
      );
      await user.click(button);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          "/api/fit-assessment",
          expect.objectContaining({
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: expect.stringContaining("Senior React Developer"),
          }),
        );
      });
    });

    it("should show loading state during API call", async () => {
      const user = userEvent.setup();
      mockFetch.mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  status: 200,
                  json: () =>
                    Promise.resolve({
                      fitLevel: "strong",
                      reasoning: ["Test reasoning"],
                      recommendations: ["Test recommendation"],
                    }),
                }),
              100,
            ),
          ),
      );

      render(<JobFitAnalyzer />);

      const textarea = screen.getByLabelText(/job description/i);
      const button = screen.getByRole("button", { name: /analyze fit/i });

      await user.type(textarea, "Test job description");
      await user.click(button);

      expect(screen.getByText(/analyzing/i)).toBeDefined();
    });

    it("should disable button during loading", async () => {
      const user = userEvent.setup();
      mockFetch.mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  status: 200,
                  json: () =>
                    Promise.resolve({
                      fitLevel: "strong",
                      reasoning: ["Test reasoning"],
                      recommendations: ["Test recommendation"],
                    }),
                }),
              100,
            ),
          ),
      );

      render(<JobFitAnalyzer />);

      const textarea = screen.getByLabelText(/job description/i);
      const button = screen.getByRole("button", {
        name: /analyze fit/i,
      }) as HTMLButtonElement;

      await user.type(textarea, "Test job description");
      await user.click(button);

      expect(button.disabled).toBe(true);
    });
  });

  describe("Results Display", () => {
    it("should display strong fit level with green badge", async () => {
      const user = userEvent.setup();
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve({
              fitLevel: "strong",
              reasoning: ["Test reasoning"],
              recommendations: ["Test recommendation"],
            }),
        }),
      );

      render(<JobFitAnalyzer />);

      const textarea = screen.getByLabelText(/job description/i);
      const button = screen.getByRole("button", { name: /analyze fit/i });

      await user.type(textarea, "Test job description");
      await user.click(button);

      await waitFor(() => {
        const badge = screen.getByText(/strong fit/i);
        expect(badge).toBeDefined();
        expect(badge.className).toContain("bg-green");
      });
    });

    it("should display moderate fit level with yellow badge", async () => {
      const user = userEvent.setup();
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve({
              fitLevel: "moderate",
              reasoning: ["Some skills match"],
              recommendations: ["Develop additional skills"],
            }),
        }),
      );

      render(<JobFitAnalyzer />);

      const textarea = screen.getByLabelText(/job description/i);
      const button = screen.getByRole("button", { name: /analyze fit/i });

      await user.type(textarea, "Test job description");
      await user.click(button);

      await waitFor(() => {
        const badge = screen.getByText(/moderate fit/i);
        expect(badge).toBeDefined();
        expect(badge.className).toContain("bg-yellow");
      });
    });

    it("should display weak fit level with red badge", async () => {
      const user = userEvent.setup();
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve({
              fitLevel: "weak",
              reasoning: ["Skills do not match"],
              recommendations: ["Consider different opportunities"],
            }),
        }),
      );

      render(<JobFitAnalyzer />);

      const textarea = screen.getByLabelText(/job description/i);
      const button = screen.getByRole("button", { name: /analyze fit/i });

      await user.type(textarea, "Test job description");
      await user.click(button);

      await waitFor(() => {
        const badge = screen.getByText(/weak fit/i);
        expect(badge).toBeDefined();
        expect(badge.className).toContain("bg-red");
      });
    });

    it("should display reasoning bullets", async () => {
      const user = userEvent.setup();
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve({
              fitLevel: "strong",
              reasoning: [
                "Strong TypeScript experience",
                "Excellent React skills",
              ],
              recommendations: ["Apply with confidence"],
            }),
        }),
      );

      render(<JobFitAnalyzer />);

      const textarea = screen.getByLabelText(/job description/i);
      const button = screen.getByRole("button", { name: /analyze fit/i });

      await user.type(textarea, "Test job description");
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText(/Strong TypeScript experience/i)).toBeDefined();
        expect(screen.getByText(/Excellent React skills/i)).toBeDefined();
      });
    });

    it("should display recommendations section", async () => {
      const user = userEvent.setup();
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve({
              fitLevel: "strong",
              reasoning: ["Test reasoning"],
              recommendations: [
                "Highlight your leadership experience",
                "Emphasize your technical skills",
              ],
            }),
        }),
      );

      render(<JobFitAnalyzer />);

      const textarea = screen.getByLabelText(/job description/i);
      const button = screen.getByRole("button", { name: /analyze fit/i });

      await user.type(textarea, "Test job description");
      await user.click(button);

      await waitFor(() => {
        expect(
          screen.getByText(/Highlight your leadership experience/i),
        ).toBeDefined();
        expect(
          screen.getByText(/Emphasize your technical skills/i),
        ).toBeDefined();
      });
    });
  });

  describe("Error Handling", () => {
    it("should display error message on API failure", async () => {
      const user = userEvent.setup();
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          json: () =>
            Promise.resolve({
              error: "Failed to process fit assessment",
            }),
        }),
      );

      render(<JobFitAnalyzer />);

      const textarea = screen.getByLabelText(/job description/i);
      const button = screen.getByRole("button", { name: /analyze fit/i });

      await user.type(textarea, "Test job description");
      await user.click(button);

      await waitFor(() => {
        expect(
          screen.getByText(/Failed to process fit assessment/i),
        ).toBeDefined();
      });
    });

    it("should display error message on network failure", async () => {
      const user = userEvent.setup();
      mockFetch.mockImplementationOnce(() =>
        Promise.reject(new Error("Network error")),
      );

      render(<JobFitAnalyzer />);

      const textarea = screen.getByLabelText(/job description/i);
      const button = screen.getByRole("button", { name: /analyze fit/i });

      await user.type(textarea, "Test job description");
      await user.click(button);

      await waitFor(() => {
        expect(
          screen.getByText(/something went wrong|failed to analyze/i),
        ).toBeDefined();
      });
    });

    it("should display rate limit error with retry message", async () => {
      const user = userEvent.setup();
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          status: 429,
          json: () =>
            Promise.resolve({
              error: "Rate limit exceeded. Please try again later.",
              retryAfter: 60,
            }),
        }),
      );

      render(<JobFitAnalyzer />);

      const textarea = screen.getByLabelText(/job description/i);
      const button = screen.getByRole("button", { name: /analyze fit/i });

      await user.type(textarea, "Test job description");
      await user.click(button);

      await waitFor(() => {
        expect(
          screen.getByText(/rate limit exceeded|try again later/i),
        ).toBeDefined();
      });
    });
  });

  describe("Acceptance Criteria Validation", () => {
    it("should have component at correct location", () => {
      // This test validates the file exists and exports correctly
      render(<JobFitAnalyzer />);
      expect(screen.getByLabelText(/job description/i)).toBeDefined();
    });

    it("should have large textarea for pasting job description", () => {
      render(<JobFitAnalyzer />);
      const textarea = screen.getByLabelText(/job description/i);
      expect(textarea.tagName).toBe("TEXTAREA");
    });

    it("should have Analyze Fit button that triggers assessment", async () => {
      const user = userEvent.setup();
      mockFetch.mockClear();

      render(<JobFitAnalyzer />);

      const button = screen.getByRole("button", { name: /analyze fit/i });
      const textarea = screen.getByLabelText(/job description/i);

      await user.type(textarea, "Test job description");
      await user.click(button);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });
    });

    it("should display fit level with color coding", async () => {
      const user = userEvent.setup();
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve({
              fitLevel: "strong",
              reasoning: ["Test"],
              recommendations: ["Test"],
            }),
        }),
      );

      render(<JobFitAnalyzer />);

      const textarea = screen.getByLabelText(/job description/i);
      const button = screen.getByRole("button", { name: /analyze fit/i });

      await user.type(textarea, "Test");
      await user.click(button);

      await waitFor(() => {
        const badge = screen.getByText(/strong fit/i);
        expect(badge).toBeDefined();
      });
    });

    it("should show reasoning bullets", async () => {
      const user = userEvent.setup();
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve({
              fitLevel: "strong",
              reasoning: ["Reason 1", "Reason 2"],
              recommendations: ["Rec 1"],
            }),
        }),
      );

      render(<JobFitAnalyzer />);

      const textarea = screen.getByLabelText(/job description/i);
      const button = screen.getByRole("button", { name: /analyze fit/i });

      await user.type(textarea, "Test");
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText("Reason 1")).toBeDefined();
        expect(screen.getByText("Reason 2")).toBeDefined();
      });
    });

    it("should show recommendations", async () => {
      const user = userEvent.setup();
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve({
              fitLevel: "strong",
              reasoning: ["Reason 1"],
              recommendations: ["Recommendation 1", "Recommendation 2"],
            }),
        }),
      );

      render(<JobFitAnalyzer />);

      const textarea = screen.getByLabelText(/job description/i);
      const button = screen.getByRole("button", { name: /analyze fit/i });

      await user.type(textarea, "Test");
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText("Recommendation 1")).toBeDefined();
        expect(screen.getByText("Recommendation 2")).toBeDefined();
      });
    });

    it("should have loading state during analysis", async () => {
      const user = userEvent.setup();
      mockFetch.mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  status: 200,
                  json: () =>
                    Promise.resolve({
                      fitLevel: "strong",
                      reasoning: ["Test"],
                      recommendations: ["Test"],
                    }),
                }),
              50,
            ),
          ),
      );

      render(<JobFitAnalyzer />);

      const textarea = screen.getByLabelText(/job description/i);
      const button = screen.getByRole("button", { name: /analyze fit/i });

      await user.type(textarea, "Test");
      await user.click(button);

      expect(screen.getByText(/analyzing/i)).toBeDefined();
    });

    it("should prevent submission when input is invalid (button disabled)", () => {
      render(<JobFitAnalyzer />);

      const button = screen.getByRole("button", {
        name: /analyze fit/i,
      }) as HTMLButtonElement;

      // Button should be disabled when textarea is empty, preventing submission
      expect(button.disabled).toBe(true);
    });
  });
});
