/**
 * Test Suite for Prompt Versioning System
 * Validates version storage, retrieval, activation, and rollback functionality using Convex
 */

import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type Mock,
  mock,
} from "bun:test";

// Mock Convex client and API
const mockQuery: Mock<any> = mock();
const mockMutation: Mock<any> = mock();

mock.module("convex/browser", () => ({
  ConvexHttpClient: mock(function ConvexHttpClient() {
    return {
      query: mockQuery,
      mutation: mockMutation,
      action: mock(() => Promise.resolve(null)),
    };
  }),
}));

// Mock the Convex API
mock.module("../../convex/_generated/api", () => ({
  api: {
    prompts: {
      listVersions: "prompts:listVersions",
      saveVersion: "prompts:saveVersion",
      getVersion: "prompts:getVersion",
      setActive: "prompts:setActive",
      rollback: "prompts:rollback",
    },
  },
}));

// Mock dataModel types
mock.module("../../convex/_generated/dataModel", () => ({
  Id: String,
}));

describe("T002: Prompt Versioning System", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    mockQuery.mockClear();
    mockMutation.mockClear();
  });

  afterEach(() => {
    // Ensure clean state after each test
    mock.restore();
  });

  describe("savePromptVersion", () => {
    it("should save a new prompt version with correct metadata", async () => {
      const { savePromptVersion } = await import("./prompt-versioning");

      // Mock: No existing versions (this is the first version)
      mockQuery.mockResolvedValueOnce([]);

      // Mock: saveVersion mutation returns version ID
      const mockVersionId = "version-123";
      mockMutation.mockResolvedValueOnce(mockVersionId);

      const result = await savePromptVersion(
        "chat",
        "You are a helpful assistant",
        "Initial chat prompt",
        "admin",
      );

      // Verify result is the version ID
      expect(result).toBe(mockVersionId);

      // Verify listVersions was called to check if first version
      expect(mockQuery).toHaveBeenCalledWith("prompts:listVersions", {
        agentType: "chat",
      });

      // Verify saveVersion mutation was called with correct data
      expect(mockMutation).toHaveBeenCalledWith("prompts:saveVersion", {
        agentType: "chat",
        prompt: "You are a helpful assistant",
        description: "Initial chat prompt",
        author: "admin",
        tokenCount: expect.any(Number),
        isActive: true, // First version should be active
      });
    });

    it("should save prompt version for fit-assessment agent type", async () => {
      const { savePromptVersion } = await import("./prompt-versioning");

      mockQuery.mockResolvedValueOnce([]);
      mockMutation.mockResolvedValueOnce("version-456");

      await savePromptVersion(
        "fit-assessment",
        "Analyze job fit",
        "Job fit assessment prompt",
        "admin",
      );

      expect(mockQuery).toHaveBeenCalledWith("prompts:listVersions", {
        agentType: "fit-assessment",
      });

      expect(mockMutation).toHaveBeenCalledWith(
        "prompts:saveVersion",
        expect.objectContaining({
          agentType: "fit-assessment",
          prompt: "Analyze job fit",
        }),
      );
    });

    it("should calculate token count using chars / 4 estimation", async () => {
      const { savePromptVersion } = await import("./prompt-versioning");

      mockQuery.mockResolvedValueOnce([]);
      mockMutation.mockResolvedValueOnce("version-789");

      const testPrompt = "1234567890"; // 10 chars = 3 tokens (ceil(10/4))

      await savePromptVersion("chat", testPrompt, "Test", "admin");

      expect(mockMutation).toHaveBeenCalledWith(
        "prompts:saveVersion",
        expect.objectContaining({
          tokenCount: 3,
        }),
      );
    });

    it("should set subsequent versions as inactive", async () => {
      const { savePromptVersion } = await import("./prompt-versioning");

      // Mock: Existing versions (not the first version)
      mockQuery.mockResolvedValueOnce([{ _id: "existing-version" }]);
      mockMutation.mockResolvedValueOnce("version-new");

      await savePromptVersion("chat", "Updated prompt", "Update", "admin");

      expect(mockMutation).toHaveBeenCalledWith(
        "prompts:saveVersion",
        expect.objectContaining({
          isActive: false, // Not first version
        }),
      );
    });
  });

  describe("loadPromptVersion", () => {
    it("should load an existing prompt version", async () => {
      const { loadPromptVersion } = await import("./prompt-versioning");

      const mockVersion = {
        _id: "version-123",
        agentType: "chat",
        prompt: "Test prompt",
        description: "Test description",
        author: "admin",
        tokenCount: 100,
        _creationTime: Date.now(),
        isActive: true,
      };

      mockQuery.mockResolvedValueOnce(mockVersion);

      const result = await loadPromptVersion("chat", "version-123" as any);

      expect(result).toEqual(
        expect.objectContaining({
          _id: "version-123",
          id: "version-123", // Transformed property
          agentType: "chat",
          prompt: "Test prompt",
          createdAt: expect.any(String), // ISO string
        }),
      );

      expect(mockQuery).toHaveBeenCalledWith("prompts:getVersion", {
        versionId: "version-123",
      });
    });

    it("should return null when version does not exist", async () => {
      const { loadPromptVersion } = await import("./prompt-versioning");

      mockQuery.mockResolvedValueOnce(null);

      const result = await loadPromptVersion("chat", "non-existent" as any);

      expect(result).toBeNull();
    });
  });

  describe("listVersions", () => {
    it("should list all versions for an agent type sorted by timestamp", async () => {
      const { listVersions } = await import("./prompt-versioning");

      const mockVersions = [
        {
          _id: "version-1",
          agentType: "chat",
          prompt: "Prompt 1",
          description: "First",
          author: "admin",
          tokenCount: 50,
          _creationTime: Date.now() - 1000,
          isActive: false,
        },
        {
          _id: "version-2",
          agentType: "chat",
          prompt: "Prompt 2",
          description: "Second",
          author: "admin",
          tokenCount: 60,
          _creationTime: Date.now(),
          isActive: true,
        },
      ];

      mockQuery.mockResolvedValueOnce(mockVersions);

      const result = await listVersions("chat");

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(
        expect.objectContaining({
          id: "version-1",
          agentType: "chat",
        }),
      );
    });

    it("should return empty array when no versions exist", async () => {
      const { listVersions } = await import("./prompt-versioning");

      mockQuery.mockResolvedValueOnce([]);

      const result = await listVersions("chat");

      expect(result).toEqual([]);
    });
  });

  describe("getActiveVersion", () => {
    it("should return the currently active version", async () => {
      const { getActiveVersion } = await import("./prompt-versioning");

      const mockActiveVersion = {
        _id: "version-active",
        agentType: "chat",
        prompt: "Active prompt",
        description: "Active",
        author: "admin",
        tokenCount: 100,
        _creationTime: Date.now(),
        isActive: true,
      };

      mockQuery.mockResolvedValueOnce(mockActiveVersion);

      const result = await getActiveVersion("chat");

      expect(result).toEqual(
        expect.objectContaining({
          id: "version-active",
          isActive: true,
        }),
      );

      expect(mockQuery).toHaveBeenCalledWith("prompts:getActiveVersion", {
        agentType: "chat",
      });
    });

    it("should return null when no active version exists", async () => {
      const { getActiveVersion } = await import("./prompt-versioning");

      mockQuery.mockResolvedValueOnce(null);

      const result = await getActiveVersion("chat");

      expect(result).toBeNull();
    });
  });

  describe("rollbackVersion", () => {
    it("should set specified version as active", async () => {
      const { rollbackVersion } = await import("./prompt-versioning");

      // Mock: Version exists
      mockQuery.mockResolvedValueOnce({
        _id: "version-1",
        agentType: "chat",
        prompt: "Old prompt",
        description: "Old",
        author: "admin",
        tokenCount: 50,
        _creationTime: Date.now(),
        isActive: false,
      });

      // Mock: Rollback mutation succeeds
      mockMutation.mockResolvedValueOnce(undefined);

      await rollbackVersion("chat", "version-1" as any);

      expect(mockMutation).toHaveBeenCalledWith("prompts:rollback", {
        agentType: "chat",
        versionId: "version-1",
      });
    });

    it("should throw error if version does not exist", async () => {
      const { rollbackVersion } = await import("./prompt-versioning");

      // Mock: Version does not exist
      mockQuery.mockResolvedValueOnce(null);

      await expect(
        rollbackVersion("chat", "non-existent" as any),
      ).rejects.toThrow("Version not found");
    });
  });

  describe("Edge Cases", () => {
    it("should reject invalid agent types", async () => {
      const { savePromptVersion } = await import("./prompt-versioning");

      await expect(
        savePromptVersion("invalid" as any, "Prompt", "Desc", "admin"),
      ).rejects.toThrow("Invalid agent type");
    });

    it("should handle Convex query errors gracefully", async () => {
      const { listVersions } = await import("./prompt-versioning");

      mockQuery.mockRejectedValueOnce(new Error("Convex connection error"));

      await expect(listVersions("chat")).rejects.toThrow(
        "Convex connection error",
      );
    });

    it("should handle Convex mutation errors gracefully", async () => {
      const { savePromptVersion } = await import("./prompt-versioning");

      mockQuery.mockResolvedValueOnce([]);
      mockMutation.mockRejectedValueOnce(new Error("Convex write error"));

      await expect(
        savePromptVersion("chat", "Prompt", "Desc", "admin"),
      ).rejects.toThrow("Convex write error");
    });
  });
});
