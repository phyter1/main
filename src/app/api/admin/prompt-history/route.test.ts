/**
 * Tests for GET /api/admin/prompt-history
 * Tests prompt version history listing API endpoint
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PromptVersion } from "@/lib/prompt-versioning";

// Mock listVersions function from prompt-versioning library
const mockListVersions = vi.fn(
  async (_agentType: string): Promise<PromptVersion[]> => [],
);

// Mock prompt-versioning module
vi.mock("@/lib/prompt-versioning", () => ({
  listVersions: mockListVersions,
}));

describe("GET /api/admin/prompt-history", () => {
  beforeEach(() => {});

  afterEach(() => {});

  it("should return versions for chat agent type", async () => {
    // Arrange - Mock versions data
    const mockVersions: PromptVersion[] = [
      {
        id: "v1",
        agentType: "chat",
        prompt: "Test prompt 1",
        description: "First version",
        author: "admin",
        tokenCount: 100,
        createdAt: "2026-02-04T12:00:00Z",
        isActive: true,
      },
      {
        id: "v2",
        agentType: "chat",
        prompt: "Test prompt 2",
        description: "Second version",
        author: "admin",
        tokenCount: 150,
        createdAt: "2026-02-03T12:00:00Z",
        isActive: false,
      },
    ];

    mockListVersions.mockImplementation(
      async (agentType: string): Promise<PromptVersion[]> => {
        if (agentType === "chat") {
          return mockVersions;
        }
        return [];
      },
    );

    // Import route handler dynamically after mocks are set up
    const { GET } = await import("./route");

    // Act - Create request with chat agent type
    const request = new Request(
      "http://localhost:3000/api/admin/prompt-history?agentType=chat",
    );
    const response = await GET(request);

    // Assert - Verify successful response
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("application/json");

    const data = await response.json();
    expect(data).toEqual({ versions: mockVersions });
    expect(mockListVersions).toHaveBeenCalledWith("chat");
  });

  it("should return versions for fit-assessment agent type", async () => {
    // Arrange - Mock versions data
    const mockVersions: PromptVersion[] = [
      {
        id: "v1",
        agentType: "fit-assessment",
        prompt: "Fit assessment prompt",
        description: "Initial version",
        author: "admin",
        tokenCount: 200,
        createdAt: "2026-02-04T12:00:00Z",
        isActive: true,
      },
    ];

    mockListVersions.mockImplementation(
      async (agentType: string): Promise<PromptVersion[]> => {
        if (agentType === "fit-assessment") {
          return mockVersions;
        }
        return [];
      },
    );

    // Import route handler dynamically
    const { GET } = await import("./route");

    // Act - Create request with fit-assessment agent type
    const request = new Request(
      "http://localhost:3000/api/admin/prompt-history?agentType=fit-assessment",
    );
    const response = await GET(request);

    // Assert - Verify successful response
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toEqual({ versions: mockVersions });
    expect(mockListVersions).toHaveBeenCalledWith("fit-assessment");
  });

  it("should return empty array when no versions exist", async () => {
    // Arrange - Mock empty versions
    mockListVersions.mockImplementation(
      async (_agentType: string): Promise<PromptVersion[]> => {
        return [];
      },
    );

    // Import route handler dynamically
    const { GET } = await import("./route");

    // Act - Create request
    const request = new Request(
      "http://localhost:3000/api/admin/prompt-history?agentType=chat",
    );
    const response = await GET(request);

    // Assert - Verify successful response with empty array
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toEqual({ versions: [] });
  });

  it("should return 400 when agentType query param is missing", async () => {
    // Import route handler dynamically
    const { GET } = await import("./route");

    // Act - Create request without agentType query param
    const request = new Request(
      "http://localhost:3000/api/admin/prompt-history",
    );
    const response = await GET(request);

    // Assert - Verify 400 error response
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toBe(
      "Missing required query parameter: agentType. Must be 'chat' or 'fit-assessment'.",
    );
  });

  it("should return 400 when agentType is invalid", async () => {
    // Import route handler dynamically
    const { GET } = await import("./route");

    // Act - Create request with invalid agentType
    const request = new Request(
      "http://localhost:3000/api/admin/prompt-history?agentType=invalid",
    );
    const response = await GET(request);

    // Assert - Verify 400 error response
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toBe(
      "Invalid agentType: invalid. Must be 'chat' or 'fit-assessment'.",
    );
  });

  it("should handle file system errors gracefully", async () => {
    // Arrange - Mock file system error
    mockListVersions.mockImplementation(async (_agentType: string) => {
      throw new Error("File system error: EACCES permission denied");
    });

    // Import route handler dynamically
    const { GET } = await import("./route");

    // Act - Create request
    const request = new Request(
      "http://localhost:3000/api/admin/prompt-history?agentType=chat",
    );
    const response = await GET(request);

    // Assert - Verify 500 error response
    expect(response.status).toBe(500);

    const data = await response.json();
    expect(data.error).toBe(
      "Failed to retrieve prompt history. Please try again.",
    );
  });

  it("should return versions sorted by timestamp (newest first)", async () => {
    // Arrange - Mock unsorted versions (listVersions should handle sorting)
    const mockVersions: PromptVersion[] = [
      {
        id: "v3",
        agentType: "chat",
        prompt: "Newest prompt",
        description: "Latest version",
        author: "admin",
        tokenCount: 100,
        createdAt: "2026-02-05T12:00:00Z",
        isActive: true,
      },
      {
        id: "v2",
        agentType: "chat",
        prompt: "Middle prompt",
        description: "Middle version",
        author: "admin",
        tokenCount: 150,
        createdAt: "2026-02-04T12:00:00Z",
        isActive: false,
      },
      {
        id: "v1",
        agentType: "chat",
        prompt: "Oldest prompt",
        description: "First version",
        author: "admin",
        tokenCount: 120,
        createdAt: "2026-02-03T12:00:00Z",
        isActive: false,
      },
    ];

    mockListVersions.mockImplementation(
      async (_agentType: string): Promise<PromptVersion[]> => {
        return mockVersions;
      },
    );

    // Import route handler dynamically
    const { GET } = await import("./route");

    // Act - Create request
    const request = new Request(
      "http://localhost:3000/api/admin/prompt-history?agentType=chat",
    );
    const response = await GET(request);

    // Assert - Verify versions are sorted (trust listVersions to handle sorting)
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.versions).toEqual(mockVersions);
    expect(data.versions[0].id).toBe("v3"); // Newest first
    expect(data.versions[2].id).toBe("v1"); // Oldest last
  });

  it("should include all PromptVersion metadata fields", async () => {
    // Arrange - Mock version with all fields
    const mockVersion: PromptVersion = {
      id: "test-uuid",
      agentType: "chat",
      prompt: "Full prompt text here",
      description: "Detailed description",
      author: "test-author",
      tokenCount: 250,
      createdAt: "2026-02-04T15:30:00Z",
      isActive: true,
    };

    mockListVersions.mockImplementation(
      async (_agentType: string): Promise<PromptVersion[]> => {
        return [mockVersion];
      },
    );

    // Import route handler dynamically
    const { GET } = await import("./route");

    // Act - Create request
    const request = new Request(
      "http://localhost:3000/api/admin/prompt-history?agentType=chat",
    );
    const response = await GET(request);

    // Assert - Verify all metadata fields present
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.versions).toHaveLength(1);

    const returnedVersion = data.versions[0];
    expect(returnedVersion.id).toBe("test-uuid");
    expect(returnedVersion.agentType).toBe("chat");
    expect(returnedVersion.prompt).toBe("Full prompt text here");
    expect(returnedVersion.description).toBe("Detailed description");
    expect(returnedVersion.author).toBe("test-author");
    expect(returnedVersion.tokenCount).toBe(250);
    expect(returnedVersion.createdAt).toBe("2026-02-04T15:30:00Z");
    expect(returnedVersion.isActive).toBe(true);
  });
});
