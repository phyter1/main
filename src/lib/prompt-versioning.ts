/**
 * Prompt Versioning System
 * Manages versioning of AI agent system prompts with metadata tracking
 */

import { randomUUID } from "node:crypto";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Supported agent types for prompt versioning
 */
export type AgentType = "chat" | "fit-assessment";

/**
 * Prompt version metadata structure
 */
export interface PromptVersion {
  id: string;
  agentType: AgentType;
  prompt: string;
  description: string;
  author: string;
  tokenCount: number;
  createdAt: string;
  isActive: boolean;
}

/**
 * Valid agent types
 */
const VALID_AGENT_TYPES: AgentType[] = ["chat", "fit-assessment"];

/**
 * Base directory for prompt storage
 */
const PROMPTS_BASE_DIR = ".admin/prompts";

/**
 * Validates that the agent type is supported
 */
function validateAgentType(agentType: string): asserts agentType is AgentType {
  if (!VALID_AGENT_TYPES.includes(agentType as AgentType)) {
    throw new Error(
      `Invalid agent type: ${agentType}. Must be one of: ${VALID_AGENT_TYPES.join(", ")}`,
    );
  }
}

/**
 * Calculates estimated token count using chars / 4 approximation
 */
function calculateTokenCount(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Gets the directory path for a specific agent type
 */
function getAgentDirectory(agentType: AgentType): string {
  return path.join(process.cwd(), PROMPTS_BASE_DIR, agentType);
}

/**
 * Gets the file path for a specific version
 */
function getVersionFilePath(agentType: AgentType, versionId: string): string {
  return path.join(getAgentDirectory(agentType), `${versionId}.json`);
}

/**
 * Saves a new prompt version
 * @param agentType - Type of agent (chat or fit-assessment)
 * @param promptText - Full prompt text
 * @param description - Description of changes
 * @param author - Author of the version
 * @returns Promise resolving to the created version metadata
 */
export async function savePromptVersion(
  agentType: AgentType,
  promptText: string,
  description: string,
  author: string,
): Promise<PromptVersion> {
  validateAgentType(agentType);

  // Check if this is the first version for this agent type
  const existingVersions = await listVersions(agentType);
  const isFirstVersion = existingVersions.length === 0;

  const version: PromptVersion = {
    id: randomUUID(),
    agentType,
    prompt: promptText,
    description,
    author,
    tokenCount: calculateTokenCount(promptText),
    createdAt: new Date().toISOString(),
    isActive: isFirstVersion, // First version is automatically active
  };

  // Ensure directory exists
  const agentDir = getAgentDirectory(agentType);
  await mkdir(agentDir, { recursive: true });

  // Write version file
  const filePath = getVersionFilePath(agentType, version.id);
  await writeFile(filePath, JSON.stringify(version, null, 2), "utf-8");

  return version;
}

/**
 * Loads a specific prompt version
 * @param agentType - Type of agent
 * @param versionId - ID of the version to load
 * @returns Promise resolving to the version metadata
 */
export async function loadPromptVersion(
  agentType: AgentType,
  versionId: string,
): Promise<PromptVersion> {
  validateAgentType(agentType);

  const filePath = getVersionFilePath(agentType, versionId);

  try {
    const content = await readFile(filePath, "utf-8");
    return JSON.parse(content) as PromptVersion;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      throw new Error(
        `Version not found: ${versionId} for agent type ${agentType}`,
      );
    }
    throw error;
  }
}

/**
 * Lists all versions for a specific agent type
 * @param agentType - Type of agent
 * @returns Promise resolving to array of versions, sorted newest first
 */
export async function listVersions(
  agentType: AgentType,
): Promise<PromptVersion[]> {
  validateAgentType(agentType);

  const agentDir = getAgentDirectory(agentType);

  try {
    const files = await readdir(agentDir);
    const jsonFiles = files.filter((file) => file.endsWith(".json"));

    const versions = await Promise.all(
      jsonFiles.map(async (file) => {
        const filePath = path.join(agentDir, file);
        const content = await readFile(filePath, "utf-8");
        return JSON.parse(content) as PromptVersion;
      }),
    );

    // Sort by createdAt timestamp, newest first
    return versions.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return []; // Directory doesn't exist yet, no versions
    }
    throw error;
  }
}

/**
 * Gets the currently active version for an agent type
 * @param agentType - Type of agent
 * @returns Promise resolving to the active version or null if none active
 */
export async function getActiveVersion(
  agentType: AgentType,
): Promise<PromptVersion | null> {
  validateAgentType(agentType);

  const versions = await listVersions(agentType);
  return versions.find((v) => v.isActive) ?? null;
}

/**
 * Sets a specific version as active and deactivates all others
 * @param agentType - Type of agent
 * @param versionId - ID of the version to activate
 */
export async function rollbackVersion(
  agentType: AgentType,
  versionId: string,
): Promise<void> {
  validateAgentType(agentType);

  const versions = await listVersions(agentType);

  // Verify the target version exists
  const targetVersion = versions.find((v) => v.id === versionId);
  if (!targetVersion) {
    throw new Error(
      `Version not found: ${versionId} for agent type ${agentType}`,
    );
  }

  // Update all versions: activate target, deactivate others
  await Promise.all(
    versions.map(async (version) => {
      const updatedVersion = {
        ...version,
        isActive: version.id === versionId,
      };

      const filePath = getVersionFilePath(agentType, version.id);
      await writeFile(
        filePath,
        JSON.stringify(updatedVersion, null, 2),
        "utf-8",
      );
    }),
  );
}
