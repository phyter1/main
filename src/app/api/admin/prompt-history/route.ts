/**
 * Prompt History API Route
 * GET endpoint for listing prompt version history
 */

import { type AgentType, listVersions } from "@/lib/prompt-versioning";

/**
 * Validates that the agent type is supported
 */
function isValidAgentType(agentType: string): agentType is AgentType {
  return agentType === "chat" || agentType === "fit-assessment";
}

/**
 * GET /api/admin/prompt-history
 * Lists all versions for a specific agent type
 *
 * Query params:
 * - agentType: 'chat' | 'fit-assessment' (required)
 *
 * Response:
 * { versions: PromptVersion[] }
 */
export async function GET(request: Request): Promise<Response> {
  try {
    // Parse query parameters
    const url = new URL(request.url);
    const agentType = url.searchParams.get("agentType");

    // Validate agentType is provided
    if (!agentType) {
      return new Response(
        JSON.stringify({
          error:
            "Missing required query parameter: agentType. Must be 'chat' or 'fit-assessment'.",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    // Validate agentType is valid
    if (!isValidAgentType(agentType)) {
      return new Response(
        JSON.stringify({
          error: `Invalid agentType: ${agentType}. Must be 'chat' or 'fit-assessment'.`,
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    // Retrieve versions from prompt-versioning library
    // listVersions returns versions sorted by timestamp (newest first)
    const versions = await listVersions(agentType);

    // Return versions in response
    return new Response(
      JSON.stringify({
        versions,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error("Prompt history API error:", error);

    return new Response(
      JSON.stringify({
        error: "Failed to retrieve prompt history. Please try again.",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
}
