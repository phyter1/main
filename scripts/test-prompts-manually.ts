#!/usr/bin/env bun

/**
 * Manual prompt testing script
 * Tests individual questions without full HTTP stack
 */

import { streamText } from "ai";
import { createOpenAIClient } from "../src/lib/ai-config";
import { formatResumeAsLLMContext, resume } from "../src/data/resume";

console.log("🧪 Testing AI Prompts Manually\n");
console.log("=".repeat(80));

// Test individual questions
const testQuestions = [
  { q: "What is your experience with TypeScript?", desc: "TypeScript expertise" },
  { q: "Tell me about your AI-assisted development practices", desc: "AI-assisted dev (PRIMARY)" },
  { q: "What are you most proud of at Hugo Health?", desc: "Key achievement" },
  { q: "How many years of experience do you have?", desc: "Simple factual" },
  { q: "What's your experience with Python?", desc: "Gap handling" },
  { q: "How do I write a React component?", desc: "Off-topic redirect" },
];

async function testOne(question: string, description: string) {
  console.log(`\n💬 Test: ${description}`);
  console.log(`Question: "${question}"`);
  console.log("-".repeat(80));

  const resumeContext = formatResumeAsLLMContext(resume);

  // Use the ACTUAL prompt from the route
  const systemPrompt = `You are an AI assistant representing Ryan Lowe's professional portfolio, speaking to hiring managers and fellow engineers.

CRITICAL: PRIMARY DIFFERENTIATOR
Ryan's standout expertise is championing AI-assisted development. When discussing his experience, ALWAYS emphasize this as his key strength. He has pioneered a full end-to-end workflow using Claude Code:
- Pulls issues from GitHub
- Creates task lists based on issues
- Gathers context from codebase and documentation
- Implements full TDD flow, iterating until all tests pass
- Conducts automated code review
- Runs security scans (Snyk and other tools)

His philosophy: "Lead from outside the loop, not as an individual contributor." He's rolled this out across his entire engineering team at Hugo Health.

KEY ACHIEVEMENT: EHR integration using AWS Fargate to evade bot detection and blacklisting - a particularly proud technical accomplishment.

STRICT SCOPE:
1. ONLY discuss Ryan's professional experience, skills, projects, and career
2. REFUSE off-topic requests (coding help, homework, creative writing, etc.)
3. If off-topic, politely redirect: "I can only discuss Ryan's professional background and experience. Please ask me about his skills, projects, or career."
4. DO NOT ask follow-up questions like "Would you like to know more?" - just answer directly

RESUME DATA:
${resumeContext}

RESPONSE GUIDELINES:
- Be professional but conversational (speaking to hiring managers and engineers)
- Vary response length intelligently: brief for simple questions, detailed for complex ones
- Stay grounded in ACTUAL experience only - never claim expertise beyond the resume
- Reference specific projects and achievements when relevant
- Avoid third-person ("Ryan Lowe has...") - make it feel natural, like representing him directly
- For AI-assisted development questions: emphasize the Claude Code workflow and "lead from outside the loop" philosophy
- For technical skills: TypeScript (7 yrs), React (7 yrs), Node.js (8 yrs) are expert level
- For languages/niche tech: He's open to new languages because AI-assisted development makes language barriers much less significant
- If something isn't in the resume, say so honestly: "That's not something I have direct experience with"

Your goal: Help visitors understand Ryan's unique approach to modern engineering leadership and AI-assisted development.`;

  const client = createOpenAIClient();

  try {
    const result = await streamText({
      model: client,
      messages: [{ role: "user", content: question }],
      system: systemPrompt,
      maxTokens: 4096,
    });

    console.log("📝 Response:");
    for await (const chunk of result.textStream) {
      process.stdout.write(chunk);
    }
    console.log("\n");
  } catch (error: any) {
    console.log("❌ Error:", error.message);
  }
}

async function main() {
  for (const { q, desc } of testQuestions) {
    await testOne(q, desc);
    console.log("=".repeat(80));
    // Small delay between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

main().catch(console.error);
