/**
 * Test Suite for Deploy Prompt API Route
 * Validates POST endpoint with prompt deployment and rate limiting
 */

import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";

// Mock prompt versioning module
const mockRollbackVersion = mock(
  async (_agentType: string, _versionId: string) => {
    // Success case by default
    return Promise.resolve();
  },
);

mock.module("@/lib/prompt-versioning", () => ({
  rollbackVersion: mockRollbackVersion,
}));

describe("T007: Deploy Prompt API Route", () => {
  let POST: (request: Request) => Promise<Response>;
  let testIpCounter = 0;

  // Helper function to generate unique IP for each test
  function getUniqueIP(): string {
    testIpCounter++;
    return `192.168.${Math.floor(testIpCounter / 256)}.${testIpCounter % 256}`;
  }

  beforeEach(async () => {
    // Clear all mocks before each test
    mockRollbackVersion.mockClear();

    // Reset mock implementations to default
    mockRollbackVersion.mockImplementation(
      async (_agentType: string, _versionId: string) => {
        return Promise.resolve();
      },
    );

    // Dynamic import to get fresh module with mocks
    const module = await import("./route");
    POST = module.POST;
  });

  afterEach(() => {
    // Clean up mocks after each test
    mockRollbackVersion.mockClear();
  });

  describe("Request Validation", () => {
    it("should accept POST requests with valid payload", async () => {
      const request = new Request(
        "http://localhost:3000/api/admin/deploy-prompt",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-forwarded-for": getUniqueIP(),
          },
          body: JSON.stringify({
            agentType: "chat",
            versionId: "test-version-id",
            message: "Deploy latest chat prompt",
          }),
        },
      );

      const response = await POST(request);

      expect(response.status).toBe(200);
    });

    it("should reject requests without agentType", async () => {
      const request = new Request(
        "http://localhost:3000/api/admin/deploy-prompt",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-forwarded-for": getUniqueIP(),
          },
          body: JSON.stringify({
            versionId: "test-version-id",
          }),
        },
      );

      const response = await POST(request);

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body).toHaveProperty("error");
    });

    it("should reject requests without versionId", async () => {
      const request = new Request(
        "http://localhost:3000/api/admin/deploy-prompt",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-forwarded-for": getUniqueIP(),
          },
          body: JSON.stringify({
            agentType: "chat",
          }),
        },
      );

      const response = await POST(request);

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body).toHaveProperty("error");
    });

    it("should reject invalid agentType values", async () => {
      const request = new Request(
        "http://localhost:3000/api/admin/deploy-prompt",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-forwarded-for": getUniqueIP(),
          },
          body: JSON.stringify({
            agentType: "invalid-type",
            versionId: "test-version-id",
          }),
        },
      );

      const response = await POST(request);

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toMatch(/agentType|expected one of/i);
    });

    it("should accept requests without optional message", async () => {
      const request = new Request(
        "http://localhost:3000/api/admin/deploy-prompt",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-forwarded-for": getUniqueIP(),
          },
          body: JSON.stringify({
            agentType: "fit-assessment",
            versionId: "test-version-id",
          }),
        },
      );

      const response = await POST(request);

      expect(response.status).toBe(200);
    });

    it("should reject malformed JSON", async () => {
      const request = new Request(
        "http://localhost:3000/api/admin/deploy-prompt",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-forwarded-for": getUniqueIP(),
          },
          body: "invalid json",
        },
      );

      const response = await POST(request);

      expect(response.status).toBe(400);
    });
  });

  describe("Prompt Version Activation", () => {
    it("should call rollbackVersion with correct parameters", async () => {
      const request = new Request(
        "http://localhost:3000/api/admin/deploy-prompt",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-forwarded-for": getUniqueIP(),
          },
          body: JSON.stringify({
            agentType: "chat",
            versionId: "version-123",
          }),
        },
      );

      await POST(request);

      expect(mockRollbackVersion).toHaveBeenCalled();
      expect(mockRollbackVersion).toHaveBeenCalledWith("chat", "version-123");
    });

    it("should handle rollbackVersion errors gracefully", async () => {
      mockRollbackVersion.mockImplementationOnce(async () => {
        throw new Error("Version not found");
      });

      const request = new Request(
        "http://localhost:3000/api/admin/deploy-prompt",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-forwarded-for": getUniqueIP(),
          },
          body: JSON.stringify({
            agentType: "chat",
            versionId: "invalid-version",
          }),
        },
      );

      const response = await POST(request);

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body).toHaveProperty("error");
    });
  });

  describe("Response Format", () => {
    it("should return success response with all required fields", async () => {
      const request = new Request(
        "http://localhost:3000/api/admin/deploy-prompt",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-forwarded-for": getUniqueIP(),
          },
          body: JSON.stringify({
            agentType: "chat",
            versionId: "version-123",
          }),
        },
      );

      const response = await POST(request);
      const body = await response.json();

      expect(body).toHaveProperty("success");
      expect(body.success).toBe(true);
      expect(body).toHaveProperty("versionId");
      expect(body.versionId).toBe("version-123");
      expect(body).toHaveProperty("message");
      expect(body.message).toContain("activated");
    });
  });

  describe("Rate Limiting", () => {
    it("should allow up to 5 requests per minute per IP", async () => {
      const ip = "192.168.1.1";

      // Make 5 requests (should all succeed)
      for (let i = 0; i < 5; i++) {
        const request = new Request(
          "http://localhost:3000/api/admin/deploy-prompt",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-forwarded-for": ip,
            },
            body: JSON.stringify({
              agentType: "chat",
              versionId: `version-${i}`,
            }),
          },
        );

        const response = await POST(request);
        expect(response.status).toBe(200);
      }
    });

    it("should enforce rate limit at 5 requests per minute", async () => {
      const ip = "192.168.1.2";

      // Make 5 requests (should succeed)
      for (let i = 0; i < 5; i++) {
        const request = new Request(
          "http://localhost:3000/api/admin/deploy-prompt",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-forwarded-for": ip,
            },
            body: JSON.stringify({
              agentType: "chat",
              versionId: `version-${i}`,
            }),
          },
        );

        const response = await POST(request);
        expect(response.status).toBe(200);
      }

      // 6th request should be rate limited
      const rateLimitedRequest = new Request(
        "http://localhost:3000/api/admin/deploy-prompt",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-forwarded-for": ip,
          },
          body: JSON.stringify({
            agentType: "chat",
            versionId: "version-6",
          }),
        },
      );

      const rateLimitedResponse = await POST(rateLimitedRequest);
      expect(rateLimitedResponse.status).toBe(429);
    });

    it("should include retry-after header when rate limited", async () => {
      const ip = "192.168.1.3";

      // Exceed rate limit
      for (let i = 0; i < 6; i++) {
        const request = new Request(
          "http://localhost:3000/api/admin/deploy-prompt",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-forwarded-for": ip,
            },
            body: JSON.stringify({
              agentType: "chat",
              versionId: `version-${i}`,
            }),
          },
        );

        const response = await POST(request);

        if (response.status === 429) {
          const retryAfter = response.headers.get("retry-after");
          expect(retryAfter).toBeDefined();
          expect(Number.parseInt(retryAfter || "0", 10)).toBeGreaterThan(0);
        }
      }
    });

    it("should track different IPs independently", async () => {
      const ip1 = "192.168.1.4";
      const ip2 = "192.168.1.5";

      // Max out IP1's rate limit
      for (let i = 0; i < 5; i++) {
        const request = new Request(
          "http://localhost:3000/api/admin/deploy-prompt",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-forwarded-for": ip1,
            },
            body: JSON.stringify({
              agentType: "chat",
              versionId: `version-${i}`,
            }),
          },
        );

        await POST(request);
      }

      // IP2 should still be able to make requests
      const ip2Request = new Request(
        "http://localhost:3000/api/admin/deploy-prompt",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-forwarded-for": ip2,
          },
          body: JSON.stringify({
            agentType: "chat",
            versionId: "version-ip2",
          }),
        },
      );

      const response = await POST(ip2Request);
      expect(response.status).toBe(200);
    });
  });

  describe("Acceptance Criteria Validation", () => {
    it("AC1: Route exists at src/app/api/admin/deploy-prompt/route.ts", () => {
      expect(POST).toBeDefined();
      expect(typeof POST).toBe("function");
    });

    it("AC2: POST handler accepts agentType, versionId, and optional message", async () => {
      const request = new Request(
        "http://localhost:3000/api/admin/deploy-prompt",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-forwarded-for": getUniqueIP(),
          },
          body: JSON.stringify({
            agentType: "chat",
            versionId: "version-123",
            message: "Test deployment",
          }),
        },
      );

      const response = await POST(request);
      expect(response.status).toBe(200);
    });

    it("AC3: Uses rollbackVersion() from prompt-versioning", async () => {
      const request = new Request(
        "http://localhost:3000/api/admin/deploy-prompt",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-forwarded-for": getUniqueIP(),
          },
          body: JSON.stringify({
            agentType: "fit-assessment",
            versionId: "version-456",
          }),
        },
      );

      await POST(request);

      expect(mockRollbackVersion).toHaveBeenCalledWith(
        "fit-assessment",
        "version-456",
      );
    });

    it("AC4: Activates prompt version using rollbackVersion", async () => {
      const request = new Request(
        "http://localhost:3000/api/admin/deploy-prompt",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-forwarded-for": getUniqueIP(),
          },
          body: JSON.stringify({
            agentType: "chat",
            versionId: "version-789",
            message: "Improve chat responses",
          }),
        },
      );

      await POST(request);

      expect(mockRollbackVersion).toHaveBeenCalledWith("chat", "version-789");
    });

    it("AC5: Response includes success, versionId, and message", async () => {
      const request = new Request(
        "http://localhost:3000/api/admin/deploy-prompt",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-forwarded-for": getUniqueIP(),
          },
          body: JSON.stringify({
            agentType: "chat",
            versionId: "version-123",
          }),
        },
      );

      const response = await POST(request);
      const body = await response.json();

      expect(body).toHaveProperty("success");
      expect(body).toHaveProperty("versionId");
      expect(body).toHaveProperty("message");
      expect(typeof body.success).toBe("boolean");
      expect(typeof body.versionId).toBe("string");
      expect(typeof body.message).toBe("string");
    });

    it("AC6: Rate limiting at 5 requests/minute per IP", async () => {
      const ip = "192.168.1.100";
      let rateLimitedFound = false;

      // Make 6 requests
      for (let i = 0; i < 6; i++) {
        const request = new Request(
          "http://localhost:3000/api/admin/deploy-prompt",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-forwarded-for": ip,
            },
            body: JSON.stringify({
              agentType: "chat",
              versionId: `version-${i}`,
            }),
          },
        );

        const response = await POST(request);

        if (response.status === 429) {
          rateLimitedFound = true;
          break;
        }
      }

      expect(rateLimitedFound).toBe(true);
    });

    it("AC7: Input validation for all required fields", async () => {
      // Missing agentType
      const request1 = new Request(
        "http://localhost:3000/api/admin/deploy-prompt",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-forwarded-for": getUniqueIP(),
          },
          body: JSON.stringify({ versionId: "v1" }),
        },
      );

      const response1 = await POST(request1);
      expect(response1.status).toBe(400);

      // Missing versionId
      const request2 = new Request(
        "http://localhost:3000/api/admin/deploy-prompt",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-forwarded-for": getUniqueIP(),
          },
          body: JSON.stringify({ agentType: "chat" }),
        },
      );

      const response2 = await POST(request2);
      expect(response2.status).toBe(400);

      // Invalid agentType
      const request3 = new Request(
        "http://localhost:3000/api/admin/deploy-prompt",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-forwarded-for": getUniqueIP(),
          },
          body: JSON.stringify({ agentType: "invalid", versionId: "v1" }),
        },
      );

      const response3 = await POST(request3);
      expect(response3.status).toBe(400);
    });
  });
});
