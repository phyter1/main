/**
 * Prompt Versioning System
 * Manages versioning of AI agent system prompts with metadata tracking using Convex
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

/**
 * Supported agent types for prompt versioning
 */
export type AgentType = "chat" | "fit-assessment";

/**
 * Prompt version metadata structure (Convex format)
 */
interface ConvexPromptVersion {
  _id: Id<"promptVersions">;
  agentType: AgentType;
  prompt: string;
  description: string;
  author: string;
  tokenCount: number;
  _creationTime: number;
  isActive: boolean;
}

/**
 * Prompt version with compatibility properties for frontend
 */
export interface PromptVersion extends ConvexPromptVersion {
  id: string; // Alias for _id
  createdAt: string; // ISO string from _creationTime
}

/**
 * Valid agent types
 */
const VALID_AGENT_TYPES: AgentType[] = ["chat", "fit-assessment"];

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
 * Singleton Convex client instance for server-side operations
 * IMPORTANT: The client itself is reused, but queries are NOT cached.
 * Every query call fetches fresh data from Convex in real-time.
 */
let convexClientInstance: ConvexHttpClient | null = null;

/**
 * Get or create Convex client instance for server-side operations
 * @returns ConvexHttpClient instance (queries always fetch fresh data)
 */
function getConvexClient(): ConvexHttpClient {
  if (convexClientInstance) {
    return convexClientInstance;
  }

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    throw new Error("NEXT_PUBLIC_CONVEX_URL is not set");
  }

  convexClientInstance = new ConvexHttpClient(convexUrl);
  return convexClientInstance;
}

/**
 * Transform Convex version to include compatibility properties
 */
function transformVersion(version: ConvexPromptVersion): PromptVersion {
  return {
    ...version,
    id: version._id,
    createdAt: new Date(version._creationTime).toISOString(),
  };
}

/**
 * Saves a new prompt version
 * @param agentType - Type of agent (chat or fit-assessment)
 * @param promptText - Full prompt text
 * @param description - Description of changes
 * @param author - Author of the version
 * @returns Promise resolving to the created version ID
 */
export async function savePromptVersion(
  agentType: AgentType,
  promptText: string,
  description: string,
  author: string,
): Promise<Id<"promptVersions">> {
  validateAgentType(agentType);

  const client = getConvexClient();

  // Check if this is the first version for this agent type
  const existingVersions = await client.query(api.prompts.listVersions, {
    agentType,
  });
  const isFirstVersion = existingVersions.length === 0;

  const versionId = await client.mutation(api.prompts.saveVersion, {
    agentType,
    prompt: promptText,
    description,
    author,
    tokenCount: calculateTokenCount(promptText),
    isActive: isFirstVersion, // First version is automatically active
  });

  return versionId;
}

/**
 * Loads a specific prompt version
 * @param agentType - Type of agent
 * @param versionId - ID of the version to load
 * @returns Promise resolving to the version metadata
 */
export async function loadPromptVersion(
  agentType: AgentType,
  versionId: Id<"promptVersions">,
): Promise<PromptVersion | null> {
  validateAgentType(agentType);

  const client = getConvexClient();
  const version = await client.query(api.prompts.getVersion, { versionId });

  return version ? transformVersion(version as ConvexPromptVersion) : null;
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

  const client = getConvexClient();
  const versions = await client.query(api.prompts.listVersions, { agentType });

  return (versions as ConvexPromptVersion[]).map(transformVersion);
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

  const client = getConvexClient();
  const version = await client.query(api.prompts.getActiveVersion, {
    agentType,
  });

  return version ? transformVersion(version as ConvexPromptVersion) : null;
}

/**
 * Sets a specific version as active and deactivates all others
 * @param agentType - Type of agent
 * @param versionId - ID of the version to activate
 */
export async function rollbackVersion(
  agentType: AgentType,
  versionId: Id<"promptVersions">,
): Promise<void> {
  validateAgentType(agentType);

  const client = getConvexClient();

  // Verify the version exists
  const version = await client.query(api.prompts.getVersion, { versionId });
  if (!version) {
    throw new Error(
      `Version not found: ${versionId} for agent type ${agentType}`,
    );
  }

  // Set as active (this will deactivate others)
  await client.mutation(api.prompts.setActive, { versionId, agentType });
}
