/**
 * Chat API Route
 * POST endpoint for streaming AI chat completions with resume context
 */

import { streamText } from "ai";
import { formatResumeAsLLMContext, resume } from "@/data/resume";
import { AI_RATE_LIMITS, createOpenAIClient } from "@/lib/ai-config";
import {
  logSecurityEvent,
  validateChatMessage,
} from "@/lib/input-sanitization";
import { getActiveVersion } from "@/lib/prompt-versioning";
import type { GuardrailViolation } from "@/types/guardrails";

/**
 * Message structure for chat
 */
interface Message {
  role: "user" | "assistant";
  content: string;
}

/**
 * Load chat prompt from Convex active version
 * Throws error if Convex is unavailable or no active version exists
 */
async function loadChatPrompt(): Promise<string> {
  const activeVersion = await getActiveVersion("chat");

  if (!activeVersion?.prompt) {
    throw new Error(
      "No active chat prompt found in Convex. Please configure prompt in admin workbench.",
    );
  }

  return activeVersion.prompt;
}