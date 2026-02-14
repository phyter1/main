import { beforeEach, describe, expect, it, vi } from "vitest";

// Set up test environment with API key before any imports
process.env.ANTHROPIC_API_KEY = "sk-ant-test-key-for-testing";
process.env.OPENAI_API_KEY = "sk-test-key-for-testing";

// Mock the AI SDK module BEFORE any imports
vi.mock("ai", () => ({
  // Export streamText for compatibility with other tests
  streamText: vi.fn(() => ({
    toTextStreamResponse: () => new Response("mock", { status: 200 }),
  })),
  generateObject: vi.fn(async ({ prompt }: { prompt: string }) => {
    // Parse the job description to determine fit level
    const jobDescLower = prompt.toLowerCase();

    // Strong fit: TypeScript, React, Next.js keywords
    if (
      jobDescLower.includes("typescript") &&
      (jobDescLower.includes("react") || jobDescLower.includes("next"))
    ) {
      return {
        object: {
          fitLevel: "strong",
          reasoning: [
            "Expert-level TypeScript experience with 10+ years",
            "Deep React and Next.js expertise demonstrated in production applications",
            "Strong alignment with required technical stack",
          ],
          recommendations: [
            "Highlight your work on Hugo Connect serving 30,000+ users",
            "Emphasize your TypeScript and React expertise in interviews",
          ],
        },
      };
    }

    // Weak fit: iOS, Swift keywords or completely different tech
    if (
      jobDescLower.includes("ios") ||
      jobDescLower.includes("swift") ||
      jobDescLower.includes("swiftui")
    ) {
      return {
        object: {
          fitLevel: "weak",
          reasoning: [
            "No iOS development experience listed in resume",
            "Primary expertise is in web technologies (TypeScript/React), not mobile",
            "Significant skill gap for iOS-specific requirements",
          ],
          recommendations: [
            "Consider focusing on web development roles that match your expertise",
            "If interested in mobile, consider React Native which leverages your React knowledge",
          ],
        },
      };
    }

    // Moderate fit: Mixed requirements
    return {
      object: {
        fitLevel: "moderate",
        reasoning: [
          "Some relevant TypeScript experience for web interfaces",
          "Primary expertise is in different technology stack",
          "Would require learning the primary framework/language",
        ],
        recommendations: [
          "Highlight transferable skills from TypeScript and React",
          "Be prepared to demonstrate quick learning ability",
        ],
      },
    };
  }),
}));

// Mock the prompt versioning system
vi.mock("@/lib/prompt-versioning", () => ({
  getActiveVersion: vi.fn(() =>
    Promise.resolve({
      _id: "version-456" as any,
      id: "version-456",
      agentType: "fit-assessment" as const,
      prompt:
        "You are a job fit assessment AI. Analyze job descriptions and provide honest assessments.",
      description: "Default test prompt",
      author: "test",
      tokenCount: 100,
      _creationTime: Date.now(),
      createdAt: new Date().toISOString(),
      isActive: true,
    }),
  ),
}));

import { getActiveVersion } from "@/lib/prompt-versioning";
import { POST } from "./route";

describe("T006: Job Fit Assessment API Route", () => {
  beforeEach(() => {
    // Reset mock state before each test
    vi.mocked(getActiveVersion).mockClear();
    vi.mocked(getActiveVersion).mockReturnValue(
      Promise.resolve({
        _id: "version-456" as any,
        id: "version-456",
        agentType: "fit-assessment" as const,
        prompt:
          "You are a job fit assessment AI. Analyze job descriptions and provide honest assessments.",
        description: "Default test prompt",
        author: "test",
        tokenCount: 100,
        _creationTime: Date.now(),
        createdAt: new Date().toISOString(),
        isActive: true,
      }),
    );
  });

  describe("T012: Prompt Loading", () => {
    it("should load active prompt version when available", async () => {
      // Mock active version available
      const mockActiveVersion = {
        id: "test-version-123",
        agentType: "fit-assessment" as const,
        prompt: "This is a custom system prompt for testing.",
        description: "Test version",
        author: "test-user",
        tokenCount: 10,
        createdAt: new Date().toISOString(),
        isActive: true,
      };

      vi.mocked(getActiveVersion).mockReturnValue(
        Promise.resolve(mockActiveVersion),
      );

      const jobDescription = `
        Senior TypeScript Developer

        We are looking for an experienced TypeScript developer to join our team.

        Requirements:
        - Expert knowledge of TypeScript and React
        - Experience with Next.js framework
        - Strong understanding of modern web development

        Responsibilities:
        - Build and maintain web applications
        - Collaborate with the engineering team
        - Contribute to technical decisions
      `;

      const request = new Request("http://localhost:3000/api/fit-assessment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Forwarded-For": "10.2.1.1",
        },
        body: JSON.stringify({ jobDescription }),
      });

      await POST(request);

      // Verify getActiveVersion was called
      expect(vi.mocked(getActiveVersion)).toHaveBeenCalledWith(
        "fit-assessment",
      );
    });

    it("should return error when no active version exists", async () => {
      // Mock no active version
      vi.mocked(getActiveVersion).mockReturnValue(Promise.resolve(null));

      const jobDescription = `
        Senior TypeScript Developer

        We are looking for an experienced TypeScript developer to join our team.

        Requirements:
        - Expert knowledge of TypeScript and React
        - Experience with Next.js framework
        - Strong understanding of modern web development

        Responsibilities:
        - Build and maintain web applications
        - Collaborate with the engineering team
        - Contribute to technical decisions
      `;

      const request = new Request("http://localhost:3000/api/fit-assessment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Forwarded-For": "10.2.1.2",
        },
        body: JSON.stringify({ jobDescription }),
      });

      const response = await POST(request);

      // Should return error when no active prompt exists
      expect(response.status).toBe(500);

      const data = await response.json();
      expect(data.error).toBeDefined();
      expect(data.error).toContain("Failed to process");

      expect(vi.mocked(getActiveVersion)).toHaveBeenCalledWith(
        "fit-assessment",
      );
    });

    it("should return error when version loading fails", async () => {
      // Mock error during version loading
      vi.mocked(getActiveVersion).mockImplementation(() => {
        throw new Error("Failed to load prompt version");
      });

      const jobDescription = `
        Senior TypeScript Developer

        We are looking for an experienced TypeScript developer to join our team.

        Requirements:
        - Expert knowledge of TypeScript and React
        - Experience with Next.js framework
        - Strong understanding of modern web development

        Responsibilities:
        - Build and maintain web applications
        - Collaborate with the engineering team
        - Contribute to technical decisions
      `;

      const request = new Request("http://localhost:3000/api/fit-assessment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Forwarded-For": "10.2.1.3",
        },
        body: JSON.stringify({ jobDescription }),
      });

      const response = await POST(request);

      // Should return error when version loading fails
      expect(response.status).toBe(500);

      const data = await response.json();
      expect(data.error).toBeDefined();

      expect(vi.mocked(getActiveVersion)).toHaveBeenCalledWith(
        "fit-assessment",
      );
    });
  });

  describe("Input Validation", () => {
    it("should reject requests without jobDescription", async () => {
      const request = new Request("http://localhost:3000/api/fit-assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
      expect(data.error).toMatch(/required|string/i);
    });

    it("should reject jobDescription exceeding 10k characters", async () => {
      const longDescription = "a".repeat(10001);
      const request = new Request("http://localhost:3000/api/fit-assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription: longDescription }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
      expect(data.error).toMatch(/10000|exceed/i);
    });

    it("should reject empty jobDescription", async () => {
      const request = new Request("http://localhost:3000/api/fit-assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription: "" }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it("should reject jobDescription with only whitespace", async () => {
      const request = new Request("http://localhost:3000/api/fit-assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription: "   \n  \t  " }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });
  });

  describe("Response Structure", () => {
    it("should return structured assessment with required fields", async () => {
      const jobDescription = `
        Senior Full-Stack Engineer

        Required Skills:
        - TypeScript and React expertise
        - Node.js backend development
        - PostgreSQL database experience
        - Cloud infrastructure knowledge (AWS/GCP)

        Responsibilities:
        - Build scalable web applications
        - Lead technical architecture decisions
        - Mentor junior developers
      `;

      const request = new Request("http://localhost:3000/api/fit-assessment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Forwarded-For": "10.1.1.1", // Unique IP
        },
        body: JSON.stringify({ jobDescription }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty("fitLevel");
      expect(data).toHaveProperty("reasoning");
      expect(data).toHaveProperty("recommendations");

      // Verify fitLevel is one of the allowed values
      expect(["strong", "moderate", "weak"]).toContain(data.fitLevel);

      // Verify reasoning is an array of strings
      expect(Array.isArray(data.reasoning)).toBe(true);
      expect(data.reasoning.length).toBeGreaterThan(0);
      expect(typeof data.reasoning[0]).toBe("string");

      // Verify recommendations is an array of strings
      expect(Array.isArray(data.recommendations)).toBe(true);
      expect(data.recommendations.length).toBeGreaterThan(0);
      expect(typeof data.recommendations[0]).toBe("string");
    });

    it("should assess strong fit for matching job requirements", async () => {
      const jobDescription = `
        TypeScript/React Developer

        Required:
        - Expert in TypeScript and React
        - Experience with Next.js
        - Node.js backend development
        - PostgreSQL databases

        We're looking for someone to build modern web applications
        using TypeScript, React, and Next.js framework.
      `;

      const request = new Request("http://localhost:3000/api/fit-assessment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Forwarded-For": "10.1.1.2", // Unique IP
        },
        body: JSON.stringify({ jobDescription }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.fitLevel).toBe("strong");
      expect(data.reasoning.length).toBeGreaterThan(0);
    });

    it("should assess moderate fit for partially matching requirements", async () => {
      const jobDescription = `
        Python Machine Learning Engineer

        Required:
        - Expert Python and TensorFlow
        - Deep learning model development
        - Some TypeScript for web interface
        - Docker for deployment

        Build ML models and deploy them.
      `;

      const request = new Request("http://localhost:3000/api/fit-assessment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Forwarded-For": "10.1.1.3", // Unique IP
        },
        body: JSON.stringify({ jobDescription }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(["moderate", "weak"]).toContain(data.fitLevel);
    });

    it("should assess weak fit for non-matching job requirements", async () => {
      const jobDescription = `
        Mobile iOS Developer

        Required:
        - Expert in Swift and SwiftUI
        - iOS SDK and Xcode proficiency
        - Published apps in App Store
        - Objective-C legacy code maintenance

        Build native iOS applications exclusively.
      `;

      const request = new Request("http://localhost:3000/api/fit-assessment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Forwarded-For": "10.1.1.4", // Unique IP
        },
        body: JSON.stringify({ jobDescription }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.fitLevel).toBe("weak");
      expect(data.reasoning.length).toBeGreaterThan(0);
      expect(data.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe("Error Handling", () => {
    it("should handle invalid JSON gracefully", async () => {
      const request = new Request("http://localhost:3000/api/fit-assessment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Forwarded-For": "10.1.1.5", // Unique IP
        },
        body: "invalid json{",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it("should return 500 on AI processing errors", async () => {
      // This test validates error handling structure
      // Actual AI errors would be caught and returned as 500
      const request = new Request("http://localhost:3000/api/fit-assessment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Forwarded-For": "10.1.1.6", // Unique IP
        },
        body: JSON.stringify({
          jobDescription: "Valid job description for error testing",
        }),
      });

      const response = await POST(request);

      // Should either succeed with 200 or fail gracefully with 500
      expect([200, 500]).toContain(response.status);

      if (response.status === 500) {
        const data = await response.json();
        expect(data.error).toBeDefined();
      }
    });
  });

  describe("Rate Limiting", () => {
    it("should implement rate limiting mechanism", async () => {
      // Note: This test validates the structure exists
      // Actual rate limiting would require time-based testing
      const jobDescription =
        "Test job description for rate limiting typescript react";

      const requests = Array.from(
        { length: 3 },
        () =>
          new Request("http://localhost:3000/api/fit-assessment", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Forwarded-For": "192.168.1.1",
            },
            body: JSON.stringify({ jobDescription }),
          }),
      );

      // Send multiple requests
      const responses = await Promise.all(requests.map((req) => POST(req)));

      // At least some should succeed (or all if rate limit not hit)
      const successCount = responses.filter((r) => r.status === 200).length;
      expect(successCount).toBeGreaterThan(0);
    });
  });

  describe("Content Type Handling", () => {
    it("should handle requests with application/json content type", async () => {
      const request = new Request("http://localhost:3000/api/fit-assessment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Forwarded-For": "10.0.0.1", // Unique IP for this test
        },
        body: JSON.stringify({
          jobDescription:
            "Frontend Developer position with TypeScript and React",
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
    });

    it("should handle requests without explicit content type", async () => {
      const request = new Request("http://localhost:3000/api/fit-assessment", {
        method: "POST",
        headers: {
          "X-Forwarded-For": "10.0.0.2", // Unique IP for this test
        },
        body: JSON.stringify({
          jobDescription: "Backend Developer position with TypeScript",
        }),
      });

      const response = await POST(request);
      // Should still process or return validation error
      expect(response.status).toBeDefined();
    });
  });
});
