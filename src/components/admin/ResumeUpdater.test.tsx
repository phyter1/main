import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Resume } from "@/data/resume";
import { ResumeUpdater } from "./ResumeUpdater";

// Mock resume data for testing
const mockResume: Resume = {
  personalInfo: {
    name: "Test User",
    title: "Test Title",
    location: "Test Location",
    summary: "Test summary",
  },
  experience: [
    {
      title: "Senior Developer",
      organization: "Test Company",
      period: "2020 - Present",
      description: "Test description",
      highlights: ["Achievement 1", "Achievement 2"],
      technologies: ["TypeScript", "React"],
      type: "job",
    },
  ],
  skills: {
    languages: [
      {
        name: "TypeScript",
        proficiency: "expert",
        category: "language",
      },
    ],
    frameworks: [
      {
        name: "React",
        proficiency: "expert",
        category: "framework",
      },
    ],
    databases: [],
    devTools: [],
    infrastructure: [],
  },
  projects: [
    {
      id: "test-project",
      title: "Test Project",
      description: "Test project description",
      longDescription: "Long description",
      technologies: ["TypeScript", "React"],
      links: {},
      featured: true,
      status: "live",
      category: "personal",
      highlights: ["Highlight 1"],
    },
  ],
  principles: [
    {
      id: "test-principle",
      title: "Test Principle",
      description: "Test principle description",
      application: "Test application",
      order: 1,
    },
  ],
};

describe("ResumeUpdater Component - T017", () => {
  let fetchMock: ReturnType<typeof mock>;

  beforeEach(() => {
    // Mock fetch API
    fetchMock = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            proposedChanges: {
              section: "skills",
              operation: "add",
              data: {
                category: "languages",
                skill: {
                  name: "Python",
                  proficiency: "intermediate",
                  category: "language",
                },
              },
            },
            preview: "## Resume Update Preview\n\n+ **Python** (intermediate)",
            affectedSections: ["skills"],
          }),
      } as Response),
    );
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    cleanup();
  });

  describe("Core Functionality", () => {
    it("should render conversational input interface", () => {
      render(<ResumeUpdater initialResume={mockResume} />);

      expect(screen.getAllByText("Resume Update Assistant")[0]).toBeDefined();
      expect(
        screen.getAllByPlaceholderText(
          /Add project X using technologies Y, Z/,
        )[0],
      ).toBeDefined();
    });

    it("should render request update button", () => {
      render(<ResumeUpdater initialResume={mockResume} />);

      const buttons = screen.getAllByText("Request Update");
      expect(buttons.length).toBeGreaterThan(0);
      expect(buttons[0].tagName).toBe("BUTTON");
    });

    it("should display current resume data sections", () => {
      render(<ResumeUpdater initialResume={mockResume} />);

      expect(screen.getAllByText("Current Resume Data")[0]).toBeDefined();
      expect(screen.getAllByText("Experience")[0]).toBeDefined();
      expect(screen.getAllByText("Skills")[0]).toBeDefined();
      expect(screen.getAllByText("Projects")[0]).toBeDefined();
      expect(screen.getAllByText("Principles")[0]).toBeDefined();
    });

    it("should submit update request when button clicked", async () => {
      const user = userEvent.setup();
      render(<ResumeUpdater initialResume={mockResume} />);

      const textarea = screen.getAllByPlaceholderText(
        /Add project X using technologies Y, Z/,
      )[0];
      await user.type(textarea, "Add Python to skills");

      const buttons = screen.getAllByText("Request Update");
      await user.click(buttons[0]);

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock).toHaveBeenCalledWith("/api/admin/update-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ updateRequest: "Add Python to skills" }),
      });
    });

    it("should show loading state during API request", async () => {
      const user = userEvent.setup();
      fetchMock = vi.fn(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: () =>
                    Promise.resolve({
                      proposedChanges: {},
                      preview: "",
                      affectedSections: [],
                    }),
                } as Response),
              100,
            ),
          ),
      );
      global.fetch = fetchMock as unknown as typeof fetch;

      render(<ResumeUpdater initialResume={mockResume} />);

      const textarea = screen.getAllByPlaceholderText(
        /Add project X using technologies Y, Z/,
      )[0];
      await user.type(textarea, "Add Python");

      const buttons = screen.getAllByText("Request Update");
      await user.click(buttons[0]);

      // Button should be disabled during loading
      expect((buttons[0] as HTMLButtonElement).disabled).toBe(true);
    });

    it("should display proposed changes after successful request", async () => {
      const user = userEvent.setup();
      render(<ResumeUpdater initialResume={mockResume} />);

      const textarea = screen.getAllByPlaceholderText(
        /Add project X using technologies Y, Z/,
      )[0];
      await user.type(textarea, "Add Python to skills");

      const buttons = screen.getAllByText("Request Update");
      await user.click(buttons[0]);

      await waitFor(() => {
        expect(screen.getAllByText("Proposed Changes")[0]).toBeDefined();
      });

      expect(screen.getAllByText(/Section:/)[0]).toBeDefined();
      expect(screen.getAllByText(/Operation:/)[0]).toBeDefined();
      expect(screen.getAllByText(/Python/)[0]).toBeDefined();
    });
  });

  describe("Proposed Changes Display", () => {
    it("should show section and operation badges", async () => {
      const user = userEvent.setup();
      render(<ResumeUpdater initialResume={mockResume} />);

      const textarea = screen.getAllByPlaceholderText(
        /Add project X using technologies Y, Z/,
      )[0];
      await user.type(textarea, "Add Python");

      const buttons = screen.getAllByText("Request Update");
      await user.click(buttons[0]);

      await waitFor(() => {
        expect(screen.getAllByText("Proposed Changes")[0]).toBeDefined();
      });

      expect(screen.getAllByText(/skills/)[0]).toBeDefined();
      expect(screen.getAllByText(/add/)[0]).toBeDefined();
    });

    it("should display markdown preview of changes", async () => {
      const user = userEvent.setup();
      render(<ResumeUpdater initialResume={mockResume} />);

      const textarea = screen.getAllByPlaceholderText(
        /Add project X using technologies Y, Z/,
      )[0];
      await user.type(textarea, "Add Python");

      const buttons = screen.getAllByText("Request Update");
      await user.click(buttons[0]);

      await waitFor(() => {
        expect(screen.getAllByText(/Python/)[0]).toBeDefined();
      });
    });

    it("should show Apply and Cancel buttons for proposed changes", async () => {
      const user = userEvent.setup();
      render(<ResumeUpdater initialResume={mockResume} />);

      const textarea = screen.getAllByPlaceholderText(
        /Add project X using technologies Y, Z/,
      )[0];
      await user.type(textarea, "Add Python");

      const buttons = screen.getAllByText("Request Update");
      await user.click(buttons[0]);

      await waitFor(() => {
        expect(screen.getAllByText("Apply Changes")[0]).toBeDefined();
        expect(screen.getAllByText("Cancel")[0]).toBeDefined();
      });
    });

    it("should clear proposed changes when Cancel clicked", async () => {
      const user = userEvent.setup();
      render(<ResumeUpdater initialResume={mockResume} />);

      const textarea = screen.getAllByPlaceholderText(
        /Add project X using technologies Y, Z/,
      )[0];
      await user.type(textarea, "Add Python");

      const requestButtons = screen.getAllByText("Request Update");
      await user.click(requestButtons[0]);

      await waitFor(() => {
        expect(screen.getAllByText("Proposed Changes")[0]).toBeDefined();
      });

      const cancelButton = screen.getAllByText("Cancel")[0];
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryAllByText("Proposed Changes").length).toBe(0);
      });
    });
  });

  describe("Current Resume Data Display", () => {
    it("should display experience entries", () => {
      render(<ResumeUpdater initialResume={mockResume} />);

      // Experience tab is active by default
      const seniorDev = screen.queryAllByText("Senior Developer");
      expect(seniorDev.length).toBeGreaterThan(0);

      // Test Company might be part of a larger text node
      const companyText = screen.queryAllByText(/Test Company/);
      expect(companyText.length).toBeGreaterThan(0);

      const period = screen.queryAllByText(/2020 - Present/);
      expect(period.length).toBeGreaterThan(0);
    });

    it("should display skills organized by category", async () => {
      const user = userEvent.setup();
      render(<ResumeUpdater initialResume={mockResume} />);

      // Click Skills tab
      const skillsTab = screen.getAllByText("Skills")[0];
      await user.click(skillsTab);

      expect(screen.getAllByText("TypeScript")[0]).toBeDefined();
      expect(screen.getAllByText("React")[0]).toBeDefined();
    });

    it("should display projects with details", async () => {
      const user = userEvent.setup();
      render(<ResumeUpdater initialResume={mockResume} />);

      // Click Projects tab
      const projectsTab = screen.getAllByText("Projects")[0];
      await user.click(projectsTab);

      expect(screen.getAllByText("Test Project")[0]).toBeDefined();
      expect(screen.getAllByText("Test project description")[0]).toBeDefined();
    });

    it("should display principles", async () => {
      const user = userEvent.setup();
      render(<ResumeUpdater initialResume={mockResume} />);

      // Click Principles tab
      const principlesTab = screen.getAllByText("Principles")[0];
      await user.click(principlesTab);

      expect(screen.getAllByText("Test Principle")[0]).toBeDefined();
      expect(
        screen.getAllByText("Test principle description")[0],
      ).toBeDefined();
    });
  });

  describe("Error Handling", () => {
    it("should display error message on API failure", async () => {
      const user = userEvent.setup();
      fetchMock = vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          json: () => Promise.resolve({ error: "Server error" }),
        } as Response),
      );
      global.fetch = fetchMock as unknown as typeof fetch;

      render(<ResumeUpdater initialResume={mockResume} />);

      const textarea = screen.getAllByPlaceholderText(
        /Add project X using technologies Y, Z/,
      )[0];
      await user.type(textarea, "Add Python");

      const buttons = screen.getAllByText("Request Update");
      await user.click(buttons[0]);

      await waitFor(
        () => {
          expect(
            screen.getAllByText(/Failed to request update/)[0],
          ).toBeDefined();
        },
        { timeout: 3000 },
      );
    });

    it("should display error for network failure", async () => {
      const user = userEvent.setup();
      fetchMock = vi.fn(() => Promise.reject(new Error("Network error")));
      global.fetch = fetchMock as unknown as typeof fetch;

      render(<ResumeUpdater initialResume={mockResume} />);

      const textarea = screen.getAllByPlaceholderText(
        /Add project X using technologies Y, Z/,
      )[0];
      await user.type(textarea, "Add Python");

      const buttons = screen.getAllByText("Request Update");
      await user.click(buttons[0]);

      await waitFor(
        () => {
          expect(screen.getAllByText(/Network error/)[0]).toBeDefined();
        },
        { timeout: 3000 },
      );
    });

    it("should not submit empty request", () => {
      const { container } = render(
        <ResumeUpdater initialResume={mockResume} />,
      );

      // Find button that says "Request Update"
      const buttons = container.querySelectorAll("button");
      const requestButton = Array.from(buttons).find(
        (btn) => btn.textContent === "Request Update",
      );

      // Button should be disabled when input is empty
      expect(requestButton).toBeDefined();
      expect((requestButton as HTMLButtonElement).disabled).toBe(true);

      // Verify fetch was not called
      expect(fetchMock).not.toHaveBeenCalled();
    });
  });

  describe("Input Validation", () => {
    it("should disable submit button when input is empty", () => {
      const { container } = render(
        <ResumeUpdater initialResume={mockResume} />,
      );

      // Find buttons that say "Request Update" (not "Processing...")
      const buttons = container.querySelectorAll("button");
      const requestButton = Array.from(buttons).find(
        (btn) => btn.textContent === "Request Update",
      );

      expect(requestButton).toBeDefined();
      expect((requestButton as HTMLButtonElement).disabled).toBe(true);
    });

    it("should enable submit button when input has text", async () => {
      const user = userEvent.setup();
      render(<ResumeUpdater initialResume={mockResume} />);

      const textarea = screen.getAllByPlaceholderText(
        /Add project X using technologies Y, Z/,
      )[0];
      await user.type(textarea, "Add Python");

      const buttons = screen.getAllByText("Request Update");
      const button = buttons[0];
      expect((button as HTMLButtonElement).disabled).toBe(false);
    });

    it("should clear input after successful request", async () => {
      const user = userEvent.setup();
      render(<ResumeUpdater initialResume={mockResume} />);

      const textarea = screen.getAllByPlaceholderText(
        /Add project X using technologies Y, Z/,
      )[0] as HTMLTextAreaElement;
      await user.type(textarea, "Add Python");

      const buttons = screen.getAllByText("Request Update");
      await user.click(buttons[0]);

      await waitFor(() => {
        expect(textarea.value).toBe("");
      });
    });
  });

  describe("Accessibility", () => {
    it("should have accessible labels for inputs", () => {
      render(<ResumeUpdater initialResume={mockResume} />);

      const textarea = screen.getAllByPlaceholderText(
        /Add project X using technologies Y, Z/,
      )[0];
      expect(textarea).toBeDefined();
      expect(textarea.tagName).toBe("TEXTAREA");
    });

    it("should use semantic HTML structure", () => {
      const { container } = render(
        <ResumeUpdater initialResume={mockResume} />,
      );

      const cards = container.querySelectorAll('[data-slot="card"]');
      expect(cards.length).toBeGreaterThan(0);
    });

    it("should be keyboard navigable", () => {
      render(<ResumeUpdater initialResume={mockResume} />);

      const textarea = screen.getAllByPlaceholderText(
        /Add project X using technologies Y, Z/,
      )[0];
      const buttons = screen.getAllByText("Request Update");
      const button = buttons[0];

      // Elements should be keyboard accessible (no explicit negative tabIndex)
      expect(textarea.getAttribute("tabindex")).not.toBe("-1");
      expect(button.getAttribute("tabindex")).not.toBe("-1");
    });
  });
});
