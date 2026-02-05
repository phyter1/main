/**
 * Test Suite for Prompt Versioning System
 * Validates version storage, retrieval, activation, and rollback functionality
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
import type { mkdir, readdir, readFile, writeFile } from "node:fs/promises";

// Mock the fs/promises module
const mockMkdir: Mock<typeof mkdir> = mock();
const mockWriteFile: Mock<typeof writeFile> = mock();
const mockReadFile: Mock<typeof readFile> = mock();
const mockReaddir: Mock<typeof readdir> = mock();

mock.module("node:fs/promises", () => ({
  mkdir: mockMkdir,
  writeFile: mockWriteFile,
  readFile: mockReadFile,
  readdir: mockReaddir,
}));

describe("T002: Prompt Versioning System", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    mock.restore();
  });

  afterEach(() => {
    // Ensure clean state after each test
    mock.restore();
  });

  describe("savePromptVersion", () => {
    it("should save a new prompt version with correct metadata", async () => {
      const { savePromptVersion } = await import("./prompt-versioning");

      mockMkdir.mockResolvedValue(undefined);
      mockReaddir.mockResolvedValue([]);
      mockWriteFile.mockResolvedValue(undefined);

      const result = await savePromptVersion(
        "chat",
        "You are a helpful assistant",
        "Initial chat prompt",
        "admin",
      );

      // Verify result structure
      expect(result.agentType).toBe("chat");
      expect(result.prompt).toBe("You are a helpful assistant");
      expect(result.description).toBe("Initial chat prompt");
      expect(result.author).toBe("admin");
      expect(result.isActive).toBe(true); // First version should be active
      expect(result.tokenCount).toBeGreaterThan(0);
      expect(result.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );
      expect(result.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);

      // Verify mkdir was called to create directory structure
      expect(mockMkdir).toHaveBeenCalledWith(
        expect.stringContaining(".admin/prompts/chat"),
        { recursive: true },
      );

      // Verify writeFile was called with correct structure
      expect(mockWriteFile).toHaveBeenCalled();
    });

    it("should save prompt version for fit-assessment agent type", async () => {
      const { savePromptVersion } = await import("./prompt-versioning");

      mockMkdir.mockResolvedValue(undefined);
      mockReaddir.mockResolvedValue([]);
      mockWriteFile.mockResolvedValue(undefined);

      const result = await savePromptVersion(
        "fit-assessment",
        "Analyze job fit",
        "Job fit assessment prompt",
        "admin",
      );

      expect(result.agentType).toBe("fit-assessment");
      expect(result.prompt).toBe("Analyze job fit");

      // Verify directory path includes fit-assessment
      expect(mockMkdir).toHaveBeenCalledWith(
        expect.stringContaining(".admin/prompts/fit-assessment"),
        { recursive: true },
      );
    });

    it("should calculate token count using chars / 4 estimation", async () => {
      const { savePromptVersion } = await import("./prompt-versioning");

      mockMkdir.mockResolvedValue(undefined);
      mockReaddir.mockResolvedValue([]);
      mockWriteFile.mockResolvedValue(undefined);

      const promptText = "a".repeat(400); // 400 characters
      const result = await savePromptVersion(
        "chat",
        promptText,
        "Test prompt",
        "admin",
      );

      // 400 / 4 = 100 tokens (approximately)
      expect(result.tokenCount).toBe(100);
    });

    it("should reject invalid agent type", async () => {
      const { savePromptVersion } = await import("./prompt-versioning");

      await expect(
        savePromptVersion(
          // @ts-expect-error Testing invalid agent type
          "invalid-type",
          "Test prompt",
          "Test description",
          "admin",
        ),
      ).rejects.toThrow("Invalid agent type");
    });

    it("should handle file system errors gracefully", async () => {
      const { savePromptVersion } = await import("./prompt-versioning");

      mockMkdir.mockRejectedValue(new Error("Permission denied"));

      await expect(
        savePromptVersion("chat", "Test prompt", "Test description", "admin"),
      ).rejects.toThrow("Permission denied");
    });

    it("should set first version as active", async () => {
      const { savePromptVersion } = await import("./prompt-versioning");

      mockMkdir.mockResolvedValue(undefined);
      mockReaddir.mockResolvedValue([]); // No existing versions
      mockWriteFile.mockResolvedValue(undefined);

      const result = await savePromptVersion(
        "chat",
        "First prompt",
        "Initial version",
        "admin",
      );

      expect(result.isActive).toBe(true);
    });

    it("should set subsequent versions as inactive", async () => {
      const { savePromptVersion } = await import("./prompt-versioning");

      const existingVersion = {
        id: "existing-version",
        agentType: "chat",
        prompt: "First prompt",
        description: "Existing",
        author: "admin",
        tokenCount: 50,
        createdAt: "2026-02-04T09:00:00.000Z",
        isActive: true,
      };

      mockMkdir.mockResolvedValue(undefined);
      mockReaddir.mockResolvedValue(["existing-version.json"]); // Existing versions
      mockReadFile.mockResolvedValue(JSON.stringify(existingVersion));
      mockWriteFile.mockResolvedValue(undefined);

      const result = await savePromptVersion(
        "chat",
        "Second prompt",
        "Updated version",
        "admin",
      );

      expect(result.isActive).toBe(false);
    });
  });

  describe("loadPromptVersion", () => {
    it("should load an existing prompt version", async () => {
      const { loadPromptVersion } = await import("./prompt-versioning");

      const mockVersion = {
        id: "test-uuid-1234",
        agentType: "chat",
        prompt: "Test prompt content",
        description: "Test description",
        author: "admin",
        tokenCount: 100,
        createdAt: "2026-02-04T10:00:00.000Z",
        isActive: true,
      };

      mockReadFile.mockResolvedValue(JSON.stringify(mockVersion));

      const result = await loadPromptVersion("chat", "test-uuid-1234");

      expect(result).toEqual(mockVersion);
      expect(mockReadFile).toHaveBeenCalledWith(
        expect.stringContaining(".admin/prompts/chat/test-uuid-1234.json"),
        "utf-8",
      );
    });

    it("should throw error when version file does not exist", async () => {
      const { loadPromptVersion } = await import("./prompt-versioning");

      mockReadFile.mockRejectedValue({ code: "ENOENT" });

      await expect(
        loadPromptVersion("chat", "non-existent-id"),
      ).rejects.toThrow("Version not found");
    });

    it("should throw error for invalid agent type", async () => {
      const { loadPromptVersion } = await import("./prompt-versioning");

      await expect(
        // @ts-expect-error Testing invalid agent type
        loadPromptVersion("invalid-type", "some-id"),
      ).rejects.toThrow("Invalid agent type");
    });

    it("should handle corrupted JSON files", async () => {
      const { loadPromptVersion } = await import("./prompt-versioning");

      mockReadFile.mockResolvedValue("invalid json {");

      await expect(loadPromptVersion("chat", "corrupt-id")).rejects.toThrow();
    });
  });

  describe("listVersions", () => {
    it("should list all versions for an agent type sorted by timestamp", async () => {
      const { listVersions } = await import("./prompt-versioning");

      const mockVersion1 = {
        id: "version-1",
        agentType: "chat",
        prompt: "Prompt 1",
        description: "First",
        author: "admin",
        tokenCount: 50,
        createdAt: "2026-02-04T09:00:00.000Z",
        isActive: false,
      };

      const mockVersion2 = {
        id: "version-2",
        agentType: "chat",
        prompt: "Prompt 2",
        description: "Second",
        author: "admin",
        tokenCount: 75,
        createdAt: "2026-02-04T10:00:00.000Z",
        isActive: true,
      };

      mockReaddir.mockResolvedValue(["version-1.json", "version-2.json"]);
      mockReadFile
        .mockResolvedValueOnce(JSON.stringify(mockVersion1))
        .mockResolvedValueOnce(JSON.stringify(mockVersion2));

      const result = await listVersions("chat");

      expect(result).toHaveLength(2);
      // Should be sorted newest first
      expect(result[0].id).toBe("version-2");
      expect(result[1].id).toBe("version-1");
    });

    it("should return empty array when no versions exist", async () => {
      const { listVersions } = await import("./prompt-versioning");

      mockReaddir.mockResolvedValue([]);

      const result = await listVersions("chat");

      expect(result).toEqual([]);
    });

    it("should handle directory not existing", async () => {
      const { listVersions } = await import("./prompt-versioning");

      mockReaddir.mockRejectedValue({ code: "ENOENT" });

      const result = await listVersions("chat");

      expect(result).toEqual([]);
    });

    it("should filter out non-JSON files", async () => {
      const { listVersions } = await import("./prompt-versioning");

      const mockVersion = {
        id: "version-1",
        agentType: "chat",
        prompt: "Prompt",
        description: "Test",
        author: "admin",
        tokenCount: 50,
        createdAt: "2026-02-04T10:00:00.000Z",
        isActive: true,
      };

      mockReaddir.mockResolvedValue([
        "version-1.json",
        "README.md",
        ".DS_Store",
      ]);
      mockReadFile.mockResolvedValue(JSON.stringify(mockVersion));

      const result = await listVersions("chat");

      expect(result).toHaveLength(1);
      // Only JSON files should be read
      expect(result[0].id).toBe("version-1");
    });

    it("should throw error for invalid agent type", async () => {
      const { listVersions } = await import("./prompt-versioning");

      await expect(
        // @ts-expect-error Testing invalid agent type
        listVersions("invalid-type"),
      ).rejects.toThrow("Invalid agent type");
    });
  });

  describe("getActiveVersion", () => {
    it("should return the currently active version", async () => {
      const { getActiveVersion } = await import("./prompt-versioning");

      const mockInactiveVersion = {
        id: "inactive-1",
        agentType: "chat",
        prompt: "Old prompt",
        description: "Inactive",
        author: "admin",
        tokenCount: 50,
        createdAt: "2026-02-04T09:00:00.000Z",
        isActive: false,
      };

      const mockActiveVersion = {
        id: "active-1",
        agentType: "chat",
        prompt: "Current prompt",
        description: "Active version",
        author: "admin",
        tokenCount: 75,
        createdAt: "2026-02-04T10:00:00.000Z",
        isActive: true,
      };

      mockReaddir.mockResolvedValue(["inactive-1.json", "active-1.json"]);
      mockReadFile
        .mockResolvedValueOnce(JSON.stringify(mockInactiveVersion))
        .mockResolvedValueOnce(JSON.stringify(mockActiveVersion));

      const result = await getActiveVersion("chat");

      expect(result).toEqual(mockActiveVersion);
      expect(result?.isActive).toBe(true);
    });

    it("should return null when no active version exists", async () => {
      const { getActiveVersion } = await import("./prompt-versioning");

      const mockVersion = {
        id: "version-1",
        agentType: "chat",
        prompt: "Prompt",
        description: "Inactive",
        author: "admin",
        tokenCount: 50,
        createdAt: "2026-02-04T10:00:00.000Z",
        isActive: false,
      };

      mockReaddir.mockResolvedValue(["version-1.json"]);
      mockReadFile.mockResolvedValue(JSON.stringify(mockVersion));

      const result = await getActiveVersion("chat");

      expect(result).toBeNull();
    });

    it("should return null when no versions exist", async () => {
      const { getActiveVersion } = await import("./prompt-versioning");

      mockReaddir.mockResolvedValue([]);

      const result = await getActiveVersion("chat");

      expect(result).toBeNull();
    });

    it("should throw error for invalid agent type", async () => {
      const { getActiveVersion } = await import("./prompt-versioning");

      await expect(
        // @ts-expect-error Testing invalid agent type
        getActiveVersion("invalid-type"),
      ).rejects.toThrow("Invalid agent type");
    });
  });

  describe("rollbackVersion", () => {
    it("should set specified version as active and deactivate others", async () => {
      const { rollbackVersion } = await import("./prompt-versioning");

      const mockVersion1 = {
        id: "version-1",
        agentType: "chat",
        prompt: "Old prompt",
        description: "Version 1",
        author: "admin",
        tokenCount: 50,
        createdAt: "2026-02-04T09:00:00.000Z",
        isActive: false,
      };

      const mockVersion2 = {
        id: "version-2",
        agentType: "chat",
        prompt: "Current prompt",
        description: "Version 2",
        author: "admin",
        tokenCount: 75,
        createdAt: "2026-02-04T10:00:00.000Z",
        isActive: true,
      };

      // Mock listVersions to return both versions
      mockReaddir.mockResolvedValue(["version-1.json", "version-2.json"]);
      mockReadFile
        .mockResolvedValueOnce(JSON.stringify(mockVersion1))
        .mockResolvedValueOnce(JSON.stringify(mockVersion2));

      mockWriteFile.mockResolvedValue(undefined);

      await rollbackVersion("chat", "version-1");

      // Should write both files (deactivate version-2, activate version-1)
      expect(mockWriteFile).toHaveBeenCalled();

      // Verify version-1 is activated
      const version1Call = mockWriteFile.mock.calls.find((call) =>
        call[0]?.toString().includes("version-1.json"),
      );
      expect(version1Call).toBeDefined();
      if (version1Call) {
        const version1Data = JSON.parse(version1Call[1] as string);
        expect(version1Data.isActive).toBe(true);
      }

      // Verify version-2 is deactivated
      const version2Call = mockWriteFile.mock.calls.find((call) =>
        call[0]?.toString().includes("version-2.json"),
      );
      expect(version2Call).toBeDefined();
      if (version2Call) {
        const version2Data = JSON.parse(version2Call[1] as string);
        expect(version2Data.isActive).toBe(false);
      }
    });

    it("should throw error when target version does not exist", async () => {
      const { rollbackVersion } = await import("./prompt-versioning");

      mockReaddir.mockResolvedValue(["other-version.json"]);
      mockReadFile.mockResolvedValue(
        JSON.stringify({
          id: "other-version",
          agentType: "chat",
          prompt: "Test",
          description: "Test",
          author: "admin",
          tokenCount: 50,
          createdAt: "2026-02-04T10:00:00.000Z",
          isActive: true,
        }),
      );

      await expect(
        rollbackVersion("chat", "non-existent-version"),
      ).rejects.toThrow("Version not found");
    });

    it("should throw error for invalid agent type", async () => {
      const { rollbackVersion } = await import("./prompt-versioning");

      await expect(
        // @ts-expect-error Testing invalid agent type
        rollbackVersion("invalid-type", "some-version"),
      ).rejects.toThrow("Invalid agent type");
    });

    it("should handle case when no other versions exist", async () => {
      const { rollbackVersion } = await import("./prompt-versioning");

      const mockVersion = {
        id: "only-version",
        agentType: "chat",
        prompt: "Only prompt",
        description: "Single version",
        author: "admin",
        tokenCount: 50,
        createdAt: "2026-02-04T10:00:00.000Z",
        isActive: false,
      };

      mockReaddir.mockResolvedValue(["only-version.json"]);
      mockReadFile.mockResolvedValue(JSON.stringify(mockVersion));
      mockWriteFile.mockResolvedValue(undefined);

      await rollbackVersion("chat", "only-version");

      // Should write the file (activate the only version)
      expect(mockWriteFile).toHaveBeenCalled();

      // Verify the version was activated
      const writeCall = mockWriteFile.mock.calls.find((call) =>
        call[0]?.toString().includes("only-version.json"),
      );
      expect(writeCall).toBeDefined();
      if (writeCall) {
        const versionData = JSON.parse(writeCall[1] as string);
        expect(versionData.isActive).toBe(true);
      }
    });
  });
});
