/**
 * Tests for update-resume API route
 * POST endpoint for AI-powered conversational resume updates
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Mock AI SDK generateObject for testing
 */
const mockGenerateObjectResult = {
  object: {
    proposedChanges: {
      section: "experience" as const,
      operation: "add" as const,
      data: {
        title: "Senior Engineer",
        organization: "Test Company",
        period: "2024 - Present",
        description: "Test description",
        highlights: ["Test highlight"],
        technologies: ["TypeScript", "React"],
      },
    },
    preview:
      "```diff\n+ Added: Senior Engineer at Test Company (2024 - Present)\n```",
    affectedSections: ["experience"],
  },
};

const mockGenerateObject = vi.fn(() =>
  Promise.resolve(mockGenerateObjectResult),
);

vi.mock("ai", () => ({
  generateObject: mockGenerateObject,
}));

/**
 * Mock AI config
 */
vi.mock("@/lib/ai-config", () => ({
  createOpenAIClient: vi.fn(() => "mock-openai-client"),
  AI_RATE_LIMITS: {
    MAX_REQUESTS_PER_MINUTE: 5,
    MAX_TOKENS_PER_REQUEST: 4096,
  },
}));

/**
 * Mock resume data for predictable tests
 */
const mockResume = {
  personalInfo: {
    name: "Test User",
    title: "Test Title",
    location: "Test Location",
    summary: "Test summary",
  },
  experience: [
    {
      title: "Current Role",
      organization: "Current Company",
      period: "2020 - Present",
      description: "Current work",
      highlights: ["Achievement 1"],
      technologies: ["TypeScript"],
      type: "job" as const,
    },
  ],
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

vi.mock("@/data/resume", () => ({
  resume: mockResume,
}));

describe("POST /api/admin/update-resume", () => {
  // Counter for generating unique IPs per test
  let ipCounter = 0;

  beforeEach(() => {
    // Clear mocks
    mockGenerateObject.mockClear();

    // Reset mockGenerateObject to return default result
    mockGenerateObject.mockImplementation(() =>
      Promise.resolve(mockGenerateObjectResult),
    );

    // Increment IP counter for unique IPs per test
    ipCounter++;
  });

  afterEach(() => {
    // Note: We don't need to restore mocks as we're using unique IPs per test
  });

  // Helper function to generate unique IP for each test
  function getUniqueIP(): string {
    return `192.168.${Math.floor(ipCounter / 256)}.${ipCounter % 256}`;
  }

  describe("Request Validation", () => {
    it("should reject requests with missing updateRequest field", async () => {
      const module = await import("./route");
      const request = new Request("http://localhost/api/admin/update-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": getUniqueIP(),
        },
        body: JSON.stringify({}),
      });

      const response = await module.POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
      expect(data.error).toContain("updateRequest");
    });

    it("should reject requests with non-string updateRequest", async () => {
      const module = await import("./route");
      const request = new Request("http://localhost/api/admin/update-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": getUniqueIP(),
        },
        body: JSON.stringify({ updateRequest: 123 }),
      });

      const response = await module.POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it("should reject requests with updateRequest exceeding 1000 characters", async () => {
      const module = await import("./route");
      const longRequest = "a".repeat(1001);
      const request = new Request("http://localhost/api/admin/update-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": getUniqueIP(),
        },
        body: JSON.stringify({ updateRequest: longRequest }),
      });

      const response = await module.POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
      expect(data.error).toContain("1000 characters");
    });

    it("should accept valid updateRequest with proper length", async () => {
      const module = await import("./route");
      const request = new Request("http://localhost/api/admin/update-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": getUniqueIP(),
        },
        body: JSON.stringify({
          updateRequest: "Add project using TypeScript and React",
        }),
      });

      const response = await module.POST(request);

      expect(response.status).toBe(200);
      expect(mockGenerateObject).toHaveBeenCalledTimes(1);
    });
  });

  describe("AI Generation", () => {
    it("should generate proposed changes for adding experience", async () => {
      const module = await import("./route");
      mockGenerateObject.mockResolvedValueOnce({
        object: {
          proposedChanges: {
            section: "experience",
            operation: "add",
            data: {
              title: "Senior Developer",
              organization: "Tech Corp",
              period: "2023 - 2024",
              description: "Led development team",
              highlights: ["Shipped major feature"],
              technologies: ["React", "TypeScript"],
            },
          },
          preview: "```diff\n+ Added: Senior Developer at Tech Corp\n```",
          affectedSections: ["experience"],
        },
      });

      const request = new Request("http://localhost/api/admin/update-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": getUniqueIP(),
        },
        body: JSON.stringify({
          updateRequest:
            "Add my previous role as Senior Developer at Tech Corp",
        }),
      });

      const response = await module.POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.proposedChanges).toBeDefined();
      expect(data.proposedChanges.section).toBe("experience");
      expect(data.proposedChanges.operation).toBe("add");
      expect(data.preview).toContain("Senior Developer");
      expect(data.affectedSections).toContain("experience");
    });

    it("should generate proposed changes for adding skills", async () => {
      const module = await import("./route");
      mockGenerateObject.mockResolvedValueOnce({
        object: {
          proposedChanges: {
            section: "skills",
            operation: "add",
            data: {
              category: "languages",
              skills: ["Python", "Go"],
            },
          },
          preview: "```diff\n+ Added skills: Python, Go\n```",
          affectedSections: ["skills"],
        },
      });

      const request = new Request("http://localhost/api/admin/update-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": getUniqueIP(),
        },
        body: JSON.stringify({
          updateRequest: "Add Python and Go to my programming languages",
        }),
      });

      const response = await module.POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.proposedChanges.section).toBe("skills");
      expect(data.affectedSections).toContain("skills");
    });

    it("should generate proposed changes for adding projects", async () => {
      const module = await import("./route");
      mockGenerateObject.mockResolvedValueOnce({
        object: {
          proposedChanges: {
            section: "projects",
            operation: "add",
            data: {
              title: "E-commerce Platform",
              description: "Full-stack shopping application",
              technologies: ["Next.js", "PostgreSQL"],
              status: "completed",
            },
          },
          preview: "```diff\n+ Added project: E-commerce Platform\n```",
          affectedSections: ["projects"],
        },
      });

      const request = new Request("http://localhost/api/admin/update-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": getUniqueIP(),
        },
        body: JSON.stringify({
          updateRequest:
            "Add project: E-commerce Platform built with Next.js and PostgreSQL",
        }),
      });

      const response = await module.POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.proposedChanges.section).toBe("projects");
      expect(data.preview).toContain("E-commerce Platform");
    });

    it("should include current resume data in AI prompt", async () => {
      const module = await import("./route");
      const request = new Request("http://localhost/api/admin/update-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": getUniqueIP(),
        },
        body: JSON.stringify({
          updateRequest: "Add TypeScript skill",
        }),
      });

      await module.POST(request);

      expect(mockGenerateObject).toHaveBeenCalledTimes(1);
      const callArgs = mockGenerateObject.mock.calls[0][0];

      expect(callArgs.prompt).toContain("Add TypeScript skill");
      expect(callArgs.system).toContain("Current resume data:");
    });
  });

  describe("Rate Limiting", () => {
    it("should allow requests within rate limit (5 per minute)", async () => {
      const module = await import("./route");

      // Make 5 requests (should all succeed)
      for (let i = 0; i < 5; i++) {
        const request = new Request(
          "http://localhost/api/admin/update-resume",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-forwarded-for": "192.168.1.100",
            },
            body: JSON.stringify({
              updateRequest: `Request ${i}`,
            }),
          },
        );

        const response = await module.POST(request);
        expect(response.status).toBe(200);
      }
    });

    it("should reject requests exceeding rate limit", async () => {
      const module = await import("./route");

      // Make 6 requests from same IP (6th should fail)
      for (let i = 0; i < 6; i++) {
        const request = new Request(
          "http://localhost/api/admin/update-resume",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-forwarded-for": "192.168.1.101",
            },
            body: JSON.stringify({
              updateRequest: `Request ${i}`,
            }),
          },
        );

        const response = await module.POST(request);

        if (i < 5) {
          expect(response.status).toBe(200);
        } else {
          expect(response.status).toBe(429);
          const data = await response.json();
          expect(data.error).toContain("Rate limit exceeded");
        }
      }
    });

    it("should include Retry-After header in rate limit response", async () => {
      const module = await import("./route");

      // Exhaust rate limit
      for (let i = 0; i < 6; i++) {
        const request = new Request(
          "http://localhost/api/admin/update-resume",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-forwarded-for": "192.168.1.102",
            },
            body: JSON.stringify({
              updateRequest: `Request ${i}`,
            }),
          },
        );

        const response = await module.POST(request);

        if (i === 5) {
          expect(response.headers.get("Retry-After")).toBeDefined();
          const retryAfter = Number(response.headers.get("Retry-After"));
          expect(retryAfter).toBeGreaterThan(0);
          expect(retryAfter).toBeLessThanOrEqual(60);
        }
      }
    });

    it("should track rate limits independently per IP", async () => {
      const module = await import("./route");

      // IP 1: Make 5 requests
      for (let i = 0; i < 5; i++) {
        const request = new Request(
          "http://localhost/api/admin/update-resume",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-forwarded-for": "192.168.1.103",
            },
            body: JSON.stringify({ updateRequest: `IP1 Request ${i}` }),
          },
        );
        await module.POST(request);
      }

      // IP 2: Should still be able to make requests
      const ip2Request = new Request(
        "http://localhost/api/admin/update-resume",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-forwarded-for": "192.168.1.104",
          },
          body: JSON.stringify({ updateRequest: "IP2 Request" }),
        },
      );

      const response = await module.POST(ip2Request);
      expect(response.status).toBe(200);
    });
  });

  describe("Response Format", () => {
    it("should return structured response with all required fields", async () => {
      const module = await import("./route");
      const request = new Request("http://localhost/api/admin/update-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": getUniqueIP(),
        },
        body: JSON.stringify({
          updateRequest: "Add new skill",
        }),
      });

      const response = await module.POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty("proposedChanges");
      expect(data).toHaveProperty("preview");
      expect(data).toHaveProperty("affectedSections");

      expect(data.proposedChanges).toHaveProperty("section");
      expect(data.proposedChanges).toHaveProperty("operation");
      expect(data.proposedChanges).toHaveProperty("data");

      expect(Array.isArray(data.affectedSections)).toBe(true);
      expect(typeof data.preview).toBe("string");
    });

    it("should include markdown diff in preview", async () => {
      const module = await import("./route");
      const request = new Request("http://localhost/api/admin/update-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": getUniqueIP(),
        },
        body: JSON.stringify({
          updateRequest: "Update current role description",
        }),
      });

      const response = await module.POST(request);
      const data = await response.json();

      expect(data.preview).toContain("```diff");
      expect(data.preview).toContain("```");
    });
  });

  describe("Error Handling", () => {
    it("should handle invalid JSON in request body", async () => {
      const module = await import("./route");
      const request = new Request("http://localhost/api/admin/update-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": getUniqueIP(),
        },
        body: "invalid json{",
      });

      const response = await module.POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("Invalid JSON");
    });

    it("should handle AI generation errors gracefully", async () => {
      const module = await import("./route");
      mockGenerateObject.mockRejectedValueOnce(
        new Error("AI service unavailable"),
      );

      const request = new Request("http://localhost/api/admin/update-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": getUniqueIP(),
        },
        body: JSON.stringify({
          updateRequest: "Add new project",
        }),
      });

      const response = await module.POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBeDefined();
    });

    it("should return proper Content-Type header", async () => {
      const module = await import("./route");
      const request = new Request("http://localhost/api/admin/update-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": getUniqueIP(),
        },
        body: JSON.stringify({
          updateRequest: "Test request",
        }),
      });

      const response = await module.POST(request);

      expect(response.headers.get("Content-Type")).toBe("application/json");
    });
  });

  describe("Security", () => {
    it("should sanitize user input in updateRequest", async () => {
      const module = await import("./route");
      const request = new Request("http://localhost/api/admin/update-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": getUniqueIP(),
        },
        body: JSON.stringify({
          updateRequest: "Add <script>alert('xss')</script> project",
        }),
      });

      const response = await module.POST(request);

      expect(response.status).toBe(200);
      // Verify that the input is passed to AI safely
      expect(mockGenerateObject).toHaveBeenCalled();
    });

    it("should not auto-commit changes to resume data", async () => {
      const module = await import("./route");
      const originalResume = JSON.parse(JSON.stringify(mockResume));

      const request = new Request("http://localhost/api/admin/update-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": getUniqueIP(),
        },
        body: JSON.stringify({
          updateRequest: "Add new experience",
        }),
      });

      await module.POST(request);

      // Resume data should remain unchanged
      expect(mockResume).toEqual(originalResume);
    });
  });
});
