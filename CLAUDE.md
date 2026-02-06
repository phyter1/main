# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 16 portfolio application for Phytertek using the App Router architecture. The project uses React 19.2.0 with the React Compiler enabled.

## Development Commands

```bash
# Start development server (default: http://localhost:3000)
bun dev

# Build for production
bun build

# Start production server
bun start

# Lint and check code quality
bun lint

# Format code
bun format
```

## Technology Stack

- **Framework**: Next.js 16 with App Router
- **React**: 19.2.0 with React Compiler enabled (next.config.ts)
- **Styling**: Tailwind CSS 4 with custom theming system
- **Linting/Formatting**: Biome (not ESLint/Prettier)
- **UI Components**: shadcn/ui (new-york style)
- **Fonts**: Fira Sans and Fira Mono from next/font/google
- **Package Manager**: Bun
- **AI Integration**: Vercel AI SDK with Anthropic provider

## Code Organization

### Import Aliases
Path aliases are configured in tsconfig.json:
- `@/*` maps to `src/*`

shadcn/ui specific aliases (components.json):
- `@/components` - Component directory
- `@/lib/utils` - Utility functions (cn helper)
- `@/components/ui` - shadcn/ui components
- `@/lib` - Library code
- `@/hooks` - React hooks

### Project Structure

```
src/
├── app/              # Next.js App Router pages and layouts
│   ├── layout.tsx    # Root layout with metadata and font configuration
│   ├── page.tsx      # Homepage
│   └── globals.css   # Global styles with Tailwind and theming
└── lib/
    ├── ai-config.ts  # AI SDK configuration and environment validation
    ├── fonts.ts      # Font configuration (Fira Sans, Fira Mono, Fira Code)
    └── utils.ts      # cn() utility for className merging
```

## Styling and Theming

### Tailwind Configuration
- Uses Tailwind CSS 4 with `@tailwindcss/postcss`
- Animations from `tw-animate-css` package
- Custom dark mode variant: `@custom-variant dark (&:is(.dark *))`
- CSS variables defined in `globals.css` for theme customization
- Color system uses OKLCH color space for better perceptual uniformity
- Custom radius system: `sm`, `md`, `lg`, `xl` based on `--radius` (0.625rem)

### Font System
- Primary font: Fira Sans (weights: 400, 700)
- Monospace font: Fira Mono (weights: 400, 700)
- Additional: Fira Code (available but not currently used in layout)
- All fonts use `display: swap` for optimal performance
- CSS variables: `--font-fira-sans`, `--font-fira-mono`, `--font-fira-code`

### shadcn/ui Setup
- Style: "new-york"
- Uses React Server Components (rsc: true)
- Base color: neutral
- CSS variables enabled for theming
- Icon library: lucide-react


## Theme System

The application includes a comprehensive theme system with light, dark, and system preference detection.

### Quick Start

**Three theme modes**: light, dark, system (auto-matches OS preference)

**Core Components**:
- `ThemeProvider` (`src/providers/ThemeProvider.tsx`) - React Context provider
- `useTheme()` hook (`src/hooks/useTheme.ts`) - Access theme state in components
- `ThemeToggle` (`src/components/theme/ThemeToggle.tsx`) - UI dropdown in navigation

**Already integrated** in root layout with FOUC prevention.

### Usage

```tsx
import { useTheme } from '@/hooks/useTheme';

export function MyComponent() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  // theme: "light" | "dark" | "system" (user's choice)
  // resolvedTheme: "light" | "dark" (actual theme displayed)

  return <button onClick={() => setTheme('dark')}>Go Dark</button>;
}
```

### Styling Patterns

**Preferred**: Use Tailwind dark mode utilities
```tsx
<div className="bg-white dark:bg-gray-800">
  <h1 className="text-gray-900 dark:text-gray-100">Title</h1>
</div>
```

**Alternative**: Programmatic styling with resolvedTheme
```tsx
const { resolvedTheme } = useTheme();
const bgColor = resolvedTheme === 'dark' ? 'bg-gray-800' : 'bg-white';
```

### Technical Details

- **Persistence**: localStorage with key `"theme"`
- **CSS Class**: `.dark` applied to `<html>` when dark mode active
- **SSR Safe**: No hydration mismatches
- **FOUC Prevention**: Inline script in layout.tsx
- **System Detection**: `prefers-color-scheme` media query

### Testing

```bash
bun test src/providers/ThemeProvider.test.tsx  # 21 tests
bun test src/hooks/__tests__/useTheme.test.tsx  # 5 tests
bun test src/components/theme/ThemeToggle.test.tsx  # 30 tests
```

All theme tests: 58 total, 81.72% coverage

## Code Quality Tools

### Biome Configuration
- Formatter: 2-space indentation
- Linter: Recommended rules enabled with React and Next.js domains
- VCS integration enabled (Git)
- Auto-organize imports on save
- Ignores: `node_modules`, `.next`, `dist`, `build`
- Special rule: `noUnknownAtRules` disabled for Tailwind compatibility

Always use `bun lint` and `bun format` (not `npm run lint` or other package managers).

### Git Hooks

This project uses git hooks to enforce code quality and testing standards automatically. These hooks are the guardrails that prevent shortcuts from making it into the codebase.

#### What's Installed

**Pre-commit Hook** (`.git-hooks/pre-commit`)
- Runs `lint-staged` to check only staged files
- Executes Biome lint and format on `*.{ts,tsx,js,jsx}` files
- Automatically fixes auto-fixable issues
- Prevents commit if unfixable issues remain

**Pre-push Hook** (`.git-hooks/pre-push`)
- Runs full test suite via `bun test`
- Validates all tests pass before code reaches remote
- Catches test failures before they break CI/CD
- Enforces the "Green" phase of TDD before sharing code

**Automatic Installation**
- Hooks install automatically on `bun install` via `postinstall` script
- Uses `simple-git-hooks` for lightweight, zero-dependency hook management
- New team members get hooks automatically when cloning and installing

#### How They Enforce "No Shortcuts"

The hooks are your pair programmer who won't let you cut corners:

**Preventing Common Shortcuts:**
- "I'll fix the lint errors later" → Pre-commit catches it now
- "I'll format it before the PR" → Pre-commit formats it now
- "I'll add tests after I see if this works" → Pre-push requires tests to pass
- "Nobody will notice this broken test" → Pre-push blocks the push
- "Moving too fast for quality checks" → Hooks slow you down (intentionally)

**Supporting TDD Workflow:**
1. **Red**: Write failing test → Can still commit (test can fail locally)
2. **Green**: Make test pass → Pre-push validates this before sharing
3. **Refactor**: Clean up code → Pre-commit ensures clean formatting

The hooks don't prevent you from having failing tests locally (that's part of TDD), but they do prevent you from pushing code that would break the build for others.

#### Using --no-verify: True Emergencies Only

The `--no-verify` flag exists. Use it extremely rarely.

**Acceptable Use Cases (Document in Commit Message):**
```bash
# Production is down, hotfix needed immediately, will fix tests in follow-up
git commit --no-verify -m "hotfix: patch critical security vulnerability

Bypassing pre-commit due to production emergency.
Follow-up PR #123 will address test failures."

# Hook itself is broken and blocking all commits
git commit --no-verify -m "fix: repair broken pre-commit hook

Hook was incorrectly failing on valid code.
Bypassing to fix the hook itself."
```

**NEVER Use --no-verify For:**
- "The lint errors are annoying" → Fix the errors or update Biome config
- "I don't have time for tests right now" → You have time, you're choosing not to
- "It's just a small change" → Small changes need quality too
- "I'll fix it in the next commit" → Fix it in this commit
- "The tests are flaky" → Fix the flaky tests, don't bypass them

**When You Reach for --no-verify, Ask:**
1. Is production actually down right now?
2. Have I documented why I'm bypassing in the commit message?
3. Have I created a follow-up issue/PR to fix what I'm bypassing?
4. Would I be okay explaining this to the team in a retrospective?

If you can't answer "yes" to all four, you don't need `--no-verify`.

#### Philosophy: Hooks as Guardrails, Not Gatekeepers

These hooks exist to make your life easier, not harder:

**What They Prevent:**
- Embarrassing "oops, forgot to lint" commits
- Pushing broken code that fails CI
- Context-switching to fix issues discovered in CI
- Breaking the build for other developers
- Accumulating technical debt from "I'll fix it later"

**What They Don't Prevent:**
- Committing work-in-progress (tests can fail locally)
- Experimenting with new approaches
- Rapid iteration during development
- The creative problem-solving process

Think of hooks as the spell-checker in your editor - mildly annoying when they catch something, but you're glad they did before someone else saw it.

#### Troubleshooting

**Hook doesn't run:**
```bash
# Reinstall hooks
bun run postinstall

# Verify hooks are installed
ls -la .git/hooks/pre-commit .git/hooks/pre-push
```

**Hook fails on valid code:**
```bash
# Check what's failing
bunx lint-staged  # For pre-commit issues
bun test         # For pre-push issues

# Fix the underlying issue, don't bypass the hook
```

**Hook is too slow:**
- Pre-commit only checks staged files (fast by design)
- Pre-push runs all tests (intentionally thorough)
- If pre-push is slow, optimize your tests, don't bypass the hook

**Need to bypass for legitimate reason:**
```bash
# Document why in the commit message
git commit --no-verify -m "type: description

Detailed explanation of why --no-verify is necessary.
Link to follow-up issue/PR to address what's bypassed."
```

## Next.js Configuration

- React Compiler enabled (`reactCompiler: true`)
- TypeScript strict mode enabled
- Module resolution: bundler
- Target: ES2017

## AI Integration

This project uses the Vercel AI SDK with Anthropic's Claude models to power interactive AI features, including a conversational chat interface and AI-powered job fit assessment.

### Overview

The application includes three main AI-powered features:

1. **Interactive Chat Interface** (`/chat`)
   - Real-time streaming conversations with AI
   - Full context about Ryan's professional background
   - Token-by-token response streaming for responsive UX

2. **Job Fit Assessment** (`/fit-assessment`)
   - AI-powered analysis of job descriptions vs. candidate experience
   - Structured assessment with fit level, reasoning, and recommendations
   - Honest, actionable feedback based on actual skills and experience

3. **Expandable Context System**
   - Resume data formatted as LLM context
   - Comprehensive markdown representation of experience, skills, projects, and principles
   - Efficient context injection into every AI request

### Setup

1. **Environment Configuration**
   ```bash
   # Copy the example environment file
   cp .env.local.example .env.local

   # Add your Anthropic API key to .env.local
   # Get your API key from: https://console.anthropic.com/settings/keys
   ```

2. **Required Environment Variables**
   ```bash
   # Required: Your Anthropic API key
   ANTHROPIC_API_KEY=sk-ant-api03-...

   # Optional: Rate limiting configuration
   AI_MAX_REQUESTS_PER_MINUTE=10        # Default: 10
   AI_MAX_TOKENS_PER_REQUEST=4096       # Default: 4096
   ```

3. **Environment Validation**
   - The application validates environment variables on server startup
   - Missing or invalid keys will throw descriptive errors
   - Non-blocking during Next.js build/static generation
   - API key format validation (warns if doesn't match `sk-ant-` pattern)

### API Routes

#### POST /api/chat

Handles streaming chat completions with resume context.

**Request Format:**
```typescript
{
  messages: Array<{
    id: string;
    role: "user" | "assistant";
    content: string;
  }>
}
```

**Response:**
- Streaming text response (real-time token delivery)
- Content-Type: `text/plain; charset=utf-8`

**Features:**
- Streaming responses using Vercel AI SDK's `streamText()`
- Resume context automatically injected into system prompt
- IP-based rate limiting (10 requests/minute per IP)
- Comprehensive error handling with user-friendly messages

**Error Responses:**
- `400 Bad Request`: Invalid request body or missing messages
- `429 Too Many Requests`: Rate limit exceeded (includes `Retry-After` header)
- `500 Internal Server Error`: AI API failure or processing error

**Implementation:**
```typescript
// Example usage in a React component
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ messages: conversationHistory })
});

// Handle streaming response
const reader = response.body?.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  const chunk = decoder.decode(value);
  // Process streaming chunk
}
```

#### POST /api/fit-assessment

Assesses job fit based on resume data and a provided job description.

**Request Format:**
```typescript
{
  jobDescription: string; // 1-10000 characters, required
}
```

**Response Format:**
```typescript
{
  fitLevel: "strong" | "moderate" | "weak";
  reasoning: string[];        // Specific reasons for assessment
  recommendations: string[];  // Actionable recommendations
}
```

**Features:**
- Structured AI output using Vercel AI SDK's `generateObject()`
- Zod schema validation for type-safe responses
- Honest assessment based on actual resume data
- Actionable recommendations for skill development

**Error Responses:**
- `400 Bad Request`: Invalid or missing job description
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: AI API failure

**Assessment Criteria:**
- **strong**: Candidate has most/all required skills with relevant experience
- **moderate**: Some required skills but may need development in key areas
- **weak**: Lacks most required skills or experience level doesn't match

### LLM Context Management

The resume data model provides a comprehensive context formatting system for AI interactions.

#### Resume Data Structure

Located in `src/data/resume.ts`, the resume data includes:

```typescript
interface Resume {
  personalInfo: {
    name: string;
    title: string;
    location: string;
    summary: string;
  };
  experience: Array<{
    title: string;
    organization: string;
    period: string;
    description: string;
    highlights: string[];
    technologies?: string[];
  }>;
  skills: {
    languages: Skill[];
    frameworks: Skill[];
    databases: Skill[];
    devTools: Skill[];
    infrastructure: Skill[];
  };
  projects: Project[];
  principles: Principle[];
}
```

#### Context Formatting

The `formatResumeAsLLMContext()` function converts resume data into markdown:

```typescript
import { formatResumeAsLLMContext, resume } from '@/data/resume';

// Generate comprehensive markdown context
const resumeContext = formatResumeAsLLMContext(resume);

// Use in system prompt
const systemPrompt = `You are an AI assistant with access to:
${resumeContext}`;
```

**Context Includes:**
- Personal information and professional summary
- Detailed experience history with highlights
- Technical skills organized by category with proficiency levels
- Featured projects with descriptions and technologies
- Engineering principles and philosophy

**Benefits:**
- Consistent context across all AI interactions
- Efficient token usage with structured markdown
- Easy to update as experience grows
- Type-safe data access

### Available AI Models

The AI configuration (`src/lib/ai-config.ts`) provides three model tiers:

```typescript
export const AI_MODELS = {
  CHAT: "claude-sonnet-4-5-20250929",      // Primary: Chat completions
  FAST: "claude-3-5-haiku-20241022",       // Fast: Simple tasks
  ADVANCED: "claude-opus-4-5-20251101"     // Advanced: Complex reasoning
}
```

**Model Selection:**
```typescript
import { createAnthropicClient } from '@/lib/ai-config';

// Use default CHAT model (Sonnet 4.5)
const chatClient = createAnthropicClient();

// Use FAST model for quick responses
const fastClient = createAnthropicClient('FAST');

// Use ADVANCED model for complex analysis
const advancedClient = createAnthropicClient('ADVANCED');
```

**Model Characteristics:**
- **CHAT (Sonnet 4.5)**: Balanced performance and quality for conversations
- **FAST (Haiku)**: Lower latency for simple tasks, cost-effective
- **ADVANCED (Opus 4.5)**: Highest quality reasoning for complex assessments

### Rate Limiting

Rate limiting is implemented at the API route level with IP-based tracking.

**Configuration:**
```typescript
export const AI_RATE_LIMITS = {
  MAX_REQUESTS_PER_MINUTE: 10,    // Per IP address
  MAX_TOKENS_PER_REQUEST: 4096,   // Per individual request
  REQUEST_TIMEOUT_MS: 30000,      // 30 second timeout
  MAX_RETRIES: 3,                 // Retry attempts
  RETRY_DELAY_MS: 1000           // Delay between retries
}
```

**Implementation:**
- **In-memory tracking**: Per-IP request counts with automatic cleanup
- **Rolling window**: 60-second window from first request
- **Retry-After header**: Informs clients when they can retry
- **Independent tracking**: Different IPs tracked separately

**Rate Limit Response:**
```typescript
// When rate limit exceeded:
{
  error: "Rate limit exceeded. Please try again later.",
  retryAfter: 42  // seconds until reset
}
// HTTP Status: 429 Too Many Requests
// Header: Retry-After: 42
```

**Production Considerations:**
- Current implementation uses in-memory storage
- For multi-instance deployments, consider Redis or distributed cache
- Monitor rate limit hits with analytics
- Adjust limits based on usage patterns and API quotas

### Testing Strategy

AI features use mocked API calls in tests for fast, reliable, isolated testing.

#### Mocking AI SDK

```typescript
// Mock streamText for chat tests
const mockStreamTextResult = {
  toTextStreamResponse: mock(() => {
    return new Response("mock stream response", {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" }
    });
  })
};

const mockStreamText = mock(() => mockStreamTextResult);

mock.module("ai", () => ({
  streamText: mockStreamText
}));
```

#### Mocking AI Configuration

```typescript
// Mock AI config and rate limits
mock.module("@/lib/ai-config", () => ({
  createAnthropicClient: mock(() => "mock-anthropic-client"),
  AI_RATE_LIMITS: {
    MAX_REQUESTS_PER_MINUTE: 10,
    MAX_TOKENS_PER_REQUEST: 4096
  }
}));
```

#### Mocking Resume Data

```typescript
// Mock resume context for predictable tests
const mockResume = {
  personalInfo: {
    name: "Test User",
    title: "Test Title",
    location: "Test Location",
    summary: "Test summary"
  },
  // ... minimal test data
};

const mockFormatResumeAsLLMContext = mock(() => "# Test User\n\nTest context");

mock.module("@/data/resume", () => ({
  resume: mockResume,
  formatResumeAsLLMContext: mockFormatResumeAsLLMContext
}));
```

#### Test Coverage Areas

**Chat API Route Tests:**
- Request validation (messages array format)
- Resume context integration
- Streaming response handling
- Rate limiting enforcement
- Error handling (400, 429, 500 status codes)
- IP-based tracking

**Fit Assessment API Tests:**
- Request validation (job description length and format)
- Structured response format (fitLevel, reasoning, recommendations)
- Rate limiting
- Error handling
- Zod schema validation

**Component Tests:**
- ChatInterface: User input, message display, streaming, error states
- Chat page: Layout, hero section, component integration
- Fit assessment page: Form handling, result display

**Benefits of Mocked Tests:**
- Fast execution (no actual API calls)
- Deterministic results (no flaky tests)
- No API quota consumption during testing
- Isolated component behavior testing
- Easy to test error scenarios

### Analytics and Privacy

The application implements privacy-respecting analytics tracking for AI feature usage.

**Tracking Philosophy:**
- No personally identifiable information (PII) collected
- No conversation content stored or tracked
- Only aggregate usage metrics
- GDPR and privacy law compliant

**Tracked Events:**
- AI chat session initiated (count only)
- Fit assessment requested (count only)
- API rate limit hits (for optimization)
- Error rates by type (for reliability monitoring)

**Not Tracked:**
- Message content or conversation topics
- User identity or IP addresses beyond rate limiting
- Personal information from job descriptions
- Individual user behavior or session details

**Implementation:**
- Server-side only (no client-side tracking scripts)
- Minimal data retention
- No third-party analytics services
- Self-hosted monitoring preferred

### Troubleshooting

#### API Key Issues

**Problem:** `AIConfigError: Missing or invalid required environment variables: ANTHROPIC_API_KEY`

**Solution:**
1. Verify `.env.local` file exists in project root
2. Ensure `ANTHROPIC_API_KEY` is set and not "your_api_key_here"
3. Get API key from https://console.anthropic.com/settings/keys
4. Restart development server after updating `.env.local`

**Problem:** `Warning: ANTHROPIC_API_KEY does not match expected format`

**Solution:**
- API key should start with `sk-ant-`
- Verify you copied the entire key
- Generate a new key if the current one is invalid

#### Rate Limiting Issues

**Problem:** 429 responses during development

**Solution:**
1. Rate limit is per IP address, development and testing may hit limit quickly
2. Increase `AI_MAX_REQUESTS_PER_MINUTE` in `.env.local` for development
3. Wait 60 seconds for rate limit to reset
4. Consider implementing a bypass for development environments

**Problem:** Rate limit not working correctly in production

**Solution:**
- Verify proxy headers (`x-forwarded-for`, `x-real-ip`) are being passed correctly
- Check if multiple app instances need distributed cache (Redis)
- Monitor rate limit hits with logging

#### Streaming Issues

**Problem:** Chat responses not streaming, appear all at once

**Solution:**
1. Verify response Content-Type is `text/plain; charset=utf-8`
2. Check browser compatibility with ReadableStream API
3. Ensure no response buffering middleware
4. Test with network throttling disabled

**Problem:** Streaming stops mid-response

**Solution:**
- Check API token limits (default 4096)
- Verify network connection stability
- Check server timeout configuration (default 30s)
- Review server logs for errors

#### Context Issues

**Problem:** AI responses don't include resume information

**Solution:**
1. Verify `formatResumeAsLLMContext()` is called in API route
2. Check resume data is populated correctly in `src/data/resume.ts`
3. Review system prompt includes resume context
4. Test with explicit questions about resume content

**Problem:** Token limit exceeded errors

**Solution:**
- Resume context is ~3000 tokens, leaving ~1000 for conversation
- Reduce `AI_MAX_TOKENS_PER_REQUEST` if needed
- Consider truncating older conversation history
- Optimize context formatting to reduce token usage

#### Test Failures

**Problem:** Tests fail with "module not found" for mocks

**Solution:**
1. Ensure mock.module() calls are before imports
2. Use dynamic imports: `const module = await import("./route")`
3. Clear mock state between tests with `mock.restore()`

**Problem:** Rate limiting tests fail intermittently

**Solution:**
- Rate limit state persists between tests
- Use unique IP addresses per test
- Clear rate limit map in `afterEach()` hook
- Avoid parallel test execution for rate limit tests

### Code Examples

#### Creating a Custom AI Feature

```typescript
// src/app/api/custom-feature/route.ts
import { generateObject } from "ai";
import { z } from "zod";
import { createAnthropicClient } from "@/lib/ai-config";
import { formatResumeAsLLMContext, resume } from "@/data/resume";

// Define response schema
const ResponseSchema = z.object({
  result: z.string(),
  confidence: z.number().min(0).max(1)
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { input } = body;

    // Create AI client
    const model = createAnthropicClient("CHAT");

    // Generate resume context
    const resumeContext = formatResumeAsLLMContext(resume);

    // Generate structured response
    const result = await generateObject({
      model,
      schema: ResponseSchema,
      system: `Context: ${resumeContext}`,
      prompt: input,
      temperature: 0.7
    });

    return Response.json(result.object);
  } catch (error) {
    return Response.json(
      { error: "Processing failed" },
      { status: 500 }
    );
  }
}
```

#### Using Different Models

```typescript
// Fast model for simple tasks
const summaryClient = createAnthropicClient("FAST");
const summary = await generateText({
  model: summaryClient,
  prompt: "Summarize in one sentence"
});

// Advanced model for complex reasoning
const analysisClient = createAnthropicClient("ADVANCED");
const analysis = await generateObject({
  model: analysisClient,
  schema: ComplexAnalysisSchema,
  prompt: "Perform deep analysis..."
});
```

### Security Best Practices

1. **API Key Management**
   - Never commit `.env.local` files
   - Use `.env.local.example` as template
   - Rotate keys periodically
   - Use different keys for dev/staging/prod

2. **Input Validation**
   - Always validate user input with Zod schemas
   - Sanitize input before passing to AI
   - Enforce length limits on user-provided text
   - Validate request structure before processing

3. **Rate Limiting**
   - Implement rate limiting on all AI endpoints
   - Use IP-based tracking as baseline
   - Consider user authentication for personalized limits
   - Monitor and adjust limits based on usage patterns

4. **Error Handling**
   - Never expose API keys or internal errors to clients
   - Log errors server-side for debugging
   - Return user-friendly error messages
   - Implement proper HTTP status codes

5. **Context Security**
   - Review context data before injecting into prompts
   - Avoid including sensitive information in context
   - Validate resume data structure and content
   - Sanitize user-provided data before context inclusion

### Performance Optimization

1. **Context Management**
   - Cache formatted resume context if data is static
   - Minimize context size to reduce token usage
   - Consider dynamic context based on conversation topic
   - Use efficient markdown formatting

2. **Streaming Optimization**
   - Use streaming for better perceived performance
   - Implement proper backpressure handling
   - Optimize network buffering settings
   - Consider WebSocket for bidirectional streaming

3. **Model Selection**
   - Use FAST model when possible for cost/speed
   - Reserve ADVANCED model for complex tasks
   - Profile token usage across different models
   - Monitor response latency per model

4. **Rate Limiting Strategy**
   - Use Redis or distributed cache for multi-instance
   - Implement sliding window for smoother limiting
   - Consider tier-based limits for authenticated users
   - Monitor and optimize limits based on API quotas

## AI Agent Workbench

The application includes a sophisticated AI Agent Workbench for conversational prompt refinement, testing, and deployment. This meta-demonstration showcases AI-first development by using AI to improve AI - enabling iterative refinement of agent prompts through natural language conversation, side-by-side testing, and version control.

### Overview

The AI Agent Workbench is a conversational interface for refining and testing AI agent prompts. Rather than manually editing system prompts, you describe desired changes in natural language, and the AI generates refined prompts that better capture your intent. This approach demonstrates using AI to improve AI systems through iterative refinement.

**Key Capabilities:**
- **Conversational Prompt Refinement**: Describe changes in natural language, AI generates refined prompts
- **Side-by-Side Testing**: Compare current vs. modified prompts with identical test cases
- **Version History**: Full version control with rollback capability
- **Resume Data Updates**: AI-powered resume content updates
- **Test Suite Management**: Define test cases with multiple criterion types

**Meta-Demonstration:**
This workbench demonstrates AI-first development principles:
- Using AI to improve AI agent behavior
- Natural language as the primary interface for technical changes
- Rapid iteration through conversational refinement
- Test-driven validation of prompt improvements

### Features

#### Conversational Prompt Refinement
Describe desired prompt changes in natural language, and the AI generates refined system prompts:

```typescript
// Example refinement request
"Make the chat agent more conversational and friendly while maintaining professionalism"

// AI generates refined prompt with changes highlighted
// Shows diff view of modifications
// Apply changes with one click
```

**Refinement Capabilities:**
- Tone and style adjustments (formal, casual, friendly, technical)
- Capability additions (new skills, knowledge areas, response patterns)
- Response structure changes (conciseness, detail level, formatting)
- Context integration improvements (better use of resume data)
- Safety and guardrail enhancements

#### Side-by-Side Testing
Test current vs. modified prompts with identical inputs to validate improvements:

```typescript
// Define test cases
const tests = [
  {
    question: "Tell me about Ryan's experience with React",
    criteria: [
      { type: "contains", value: "React" },
      { type: "first-person", expected: false },
      { type: "max-length", value: 500 }
    ]
  }
];

// Run both prompts simultaneously
// Compare results side-by-side
// View pass/fail for each criterion
// See performance metrics (tokens, latency)
```

**Testing Features:**
- Parallel execution for fair comparison
- Multiple criterion types for validation
- Aggregate metrics (pass rate, avg tokens, avg latency)
- Visual diff highlighting differences in responses
- Test suite persistence across sessions

#### Version History with Rollback
Complete version control for all prompt changes:

```typescript
// Version metadata
{
  versionId: "v1.2.3",
  timestamp: "2026-02-04T19:30:00Z",
  description: "Made agent more conversational and friendly",
  author: "admin",
  tokenCount: 1250,
  isActive: true,
  changes: [
    "Added conversational tone guidance",
    "Enhanced context usage patterns",
    "Improved error handling instructions"
  ]
}
```

**Version Management:**
- Automatic versioning on deployment
- Semantic version numbering (major.minor.patch)
- Detailed change descriptions
- One-click rollback to previous versions
- Version comparison (diff view)
- Only one active version per agent type

#### Resume Data Updates
AI-powered updates to resume content through natural language:

```typescript
// Example update request
"Add my new role as Senior Engineering Lead at TechCorp,
started January 2026, focusing on AI integration and team leadership"

// AI generates structured resume data
// Shows preview of changes
// Apply to update resume.ts
```

**Update Capabilities:**
- New experience entries with structured data
- Skill additions with proficiency levels
- Project updates with technologies and descriptions
- Principle additions for engineering philosophy
- Automatic formatting and validation

#### Test Suite Management
Define and manage comprehensive test cases for agent validation:

**Criterion Types:**
- `contains`: Response must contain specific text
- `first-person`: Response must/must not use first person ("I", "my")
- `token-limit`: Response must stay under token limit
- `max-length`: Response character length limit
- `response-time`: Maximum acceptable latency
- `sentiment`: Expected sentiment (positive, neutral, professional)

**Test Organization:**
- Group tests by category (basic queries, technical questions, edge cases)
- Reusable test suites
- Historical test results
- Pass/fail tracking over time

### Admin Routes

#### Pages

**`/admin/agent-workbench`** - Main workbench interface with tabbed navigation

Tabs:
- **Chat Agent**: Refine and test chat agent prompts
- **Resume Data**: Update resume content
- **Test Suite**: Manage test cases and run validations
- **Settings**: Configure workbench behavior

**`/admin/agent-workbench/history`** - Version history viewer

Features:
- List all prompt versions chronologically
- View version details and metadata
- Compare versions (diff view)
- Rollback to previous versions
- Export version history

#### API Routes

**`POST /api/admin/login`** - Admin authentication
```typescript
// Request
{ password: string }

// Response (success)
{ success: true, sessionId: string }

// Response (failure)
{ error: "Invalid password" }
```

**`POST /api/admin/logout`** - Session termination
```typescript
// Response
{ success: true }
```

**`POST /api/admin/refine-prompt`** - AI-powered prompt refinement
```typescript
// Request
{
  agentType: "chat" | "assessment" | "custom";
  currentPrompt: string;
  refinementRequest: string;
  context?: string;
}

// Response
{
  refinedPrompt: string;
  changes: string[];
  reasoning: string;
  tokenCount: number;
  estimatedImprovement: string;
}
```

**`POST /api/admin/test-prompt`** - Test prompt execution
```typescript
// Request
{
  prompt: string;
  testCases: Array<{
    question: string;
    criteria: Array<{
      type: "contains" | "first-person" | "token-limit" | "max-length";
      value?: string | number;
      expected?: boolean;
    }>;
  }>;
  compareWith?: string; // Compare with current active prompt
}

// Response
{
  results: Array<{
    question: string;
    response: string;
    passed: boolean;
    criteriaResults: Array<{
      type: string;
      passed: boolean;
      message: string;
    }>;
    tokenCount: number;
    latency: number;
  }>;
  metrics: {
    passRate: number;
    avgTokens: number;
    avgLatency: number;
  };
  comparison?: {
    currentResults: TestResults;
    modifiedResults: TestResults;
    improvement: string;
  };
}
```

**`POST /api/admin/deploy-prompt`** - Deploy refined prompt as new version
```typescript
// Request
{
  agentType: "chat" | "assessment" | "custom";
  prompt: string;
  description: string;
  changes: string[];
}

// Response
{
  success: true;
  version: {
    versionId: string;
    timestamp: string;
    description: string;
    tokenCount: number;
  };
}
```

**`GET /api/admin/prompt-history`** - Retrieve version history
```typescript
// Query params
?agentType=chat&limit=10&offset=0

// Response
{
  versions: Array<{
    versionId: string;
    timestamp: string;
    description: string;
    author: string;
    tokenCount: number;
    isActive: boolean;
    changes: string[];
  }>;
  total: number;
}
```

**`POST /api/admin/update-resume`** - Update resume data
```typescript
// Request
{
  updateRequest: string; // Natural language description
  section?: "experience" | "skills" | "projects" | "principles";
}

// Response
{
  preview: {
    section: string;
    changes: Array<{
      type: "add" | "modify" | "remove";
      path: string;
      before?: any;
      after?: any;
    }>;
  };
  applyUrl: string; // Endpoint to apply changes
}
```

### Prompt Versioning System

#### Storage Structure

Prompt versions are stored in `.admin/prompts/{agent-type}/{version-id}.json`:

```
.admin/
└── prompts/
    ├── chat/
    │   ├── v1.0.0.json
    │   ├── v1.1.0.json
    │   └── v1.2.0.json (active)
    ├── assessment/
    │   ├── v1.0.0.json
    │   └── v1.1.0.json (active)
    └── custom/
        └── v1.0.0.json (active)
```

#### Version Metadata Schema

```typescript
interface PromptVersion {
  versionId: string;           // Semantic version (v1.2.3)
  agentType: string;           // Agent type identifier
  timestamp: string;           // ISO 8601 timestamp
  description: string;         // Human-readable description
  author: string;              // Who created this version
  prompt: string;              // The actual system prompt
  tokenCount: number;          // Token count of prompt
  isActive: boolean;           // Currently deployed version
  changes: string[];           // List of changes from previous version
  metadata: {
    testResults?: TestResults; // Results from pre-deployment testing
    previousVersion?: string;  // Link to previous version
    rollbackCount: number;     // Number of times rolled back to this
    deploymentNotes?: string;  // Additional deployment context
  };
}
```

#### Versioning Functions

**Save New Version:**
```typescript
async function savePromptVersion(
  agentType: string,
  prompt: string,
  description: string,
  changes: string[]
): Promise<PromptVersion> {
  // Generate new semantic version
  const latestVersion = await getLatestVersion(agentType);
  const newVersion = incrementVersion(latestVersion);

  // Deactivate current active version
  await deactivateCurrentVersion(agentType);

  // Create version metadata
  const version: PromptVersion = {
    versionId: newVersion,
    agentType,
    timestamp: new Date().toISOString(),
    description,
    author: "admin",
    prompt,
    tokenCount: countTokens(prompt),
    isActive: true,
    changes,
    metadata: {
      previousVersion: latestVersion,
      rollbackCount: 0
    }
  };

  // Save to filesystem
  await fs.writeFile(
    `.admin/prompts/${agentType}/${newVersion}.json`,
    JSON.stringify(version, null, 2)
  );

  return version;
}
```

**Load Active Version:**
```typescript
async function loadActivePrompt(agentType: string): Promise<PromptVersion> {
  const versions = await listVersions(agentType);
  const active = versions.find(v => v.isActive);

  if (!active) {
    throw new Error(`No active version for agent type: ${agentType}`);
  }

  return active;
}
```

**List Versions:**
```typescript
async function listVersions(
  agentType: string,
  options?: { limit?: number; offset?: number }
): Promise<PromptVersion[]> {
  const dir = `.admin/prompts/${agentType}`;
  const files = await fs.readdir(dir);

  const versions = await Promise.all(
    files
      .filter(f => f.endsWith('.json'))
      .map(f => fs.readFile(path.join(dir, f), 'utf-8'))
      .map(async content => JSON.parse(await content))
  );

  // Sort by timestamp (newest first)
  versions.sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Apply pagination
  const { limit = 10, offset = 0 } = options || {};
  return versions.slice(offset, offset + limit);
}
```

**Rollback to Version:**
```typescript
async function rollbackToVersion(
  agentType: string,
  versionId: string
): Promise<void> {
  // Load target version
  const targetVersion = await loadVersion(agentType, versionId);

  // Deactivate current version
  await deactivateCurrentVersion(agentType);

  // Activate target version
  targetVersion.isActive = true;
  targetVersion.metadata.rollbackCount += 1;

  // Save updated version
  await saveVersion(targetVersion);

  // Create git commit for rollback
  await gitCommit(`Rollback ${agentType} prompt to ${versionId}`);
}
```

**Active Version Policy:**
- Only one version can be active per agent type at any time
- Activating a new version automatically deactivates the current one
- Rollback creates a new activation without creating a new version
- All version changes are tracked in git for audit trail

### Test Runner Capabilities

#### Test Case Definition

```typescript
interface TestCase {
  id: string;
  name: string;
  category: string;
  question: string;
  criteria: Criterion[];
  tags?: string[];
  priority?: "low" | "medium" | "high";
}

interface Criterion {
  type: "contains" | "first-person" | "token-limit" | "max-length" | "response-time" | "sentiment";
  value?: string | number;
  expected?: boolean;
  message?: string;
}
```

#### Criterion Types

**`contains` - Text Content Validation**
```typescript
{
  type: "contains",
  value: "React",
  message: "Response must mention React"
}
```
Validates that the response contains specific text (case-insensitive).

**`first-person` - Perspective Validation**
```typescript
{
  type: "first-person",
  expected: false,
  message: "Response should use third person (not 'I' or 'my')"
}
```
Validates response perspective (agent should speak about Ryan in third person).

**`token-limit` - Token Budget Validation**
```typescript
{
  type: "token-limit",
  value: 500,
  message: "Response must stay under 500 tokens"
}
```
Ensures response stays within token budget for cost control.

**`max-length` - Character Length Validation**
```typescript
{
  type: "max-length",
  value: 1000,
  message: "Response must be under 1000 characters"
}
```
Validates response character length for UI constraints.

**`response-time` - Latency Validation**
```typescript
{
  type: "response-time",
  value: 3000,
  message: "Response must complete within 3 seconds"
}
```
Ensures acceptable response latency for user experience.

**`sentiment` - Tone Validation**
```typescript
{
  type: "sentiment",
  value: "professional",
  message: "Response should maintain professional tone"
}
```
Validates response sentiment (positive, neutral, professional, technical).

#### Side-by-Side Comparison

When testing a modified prompt, the test runner executes both prompts in parallel:

```typescript
interface ComparisonResults {
  current: {
    results: TestResult[];
    metrics: Metrics;
    prompt: string;
  };
  modified: {
    results: TestResult[];
    metrics: Metrics;
    prompt: string;
  };
  improvement: {
    passRateDelta: number;      // +5% pass rate
    tokenDelta: number;          // -50 avg tokens
    latencyDelta: number;        // -200ms avg latency
    recommendation: string;      // "Deploy" or "Needs improvement"
  };
  sideBySide: Array<{
    question: string;
    currentResponse: string;
    modifiedResponse: string;
    currentPassed: boolean;
    modifiedPassed: boolean;
    diff: string;                // Visual diff of responses
  }>;
}
```

**Comparison Features:**
- Parallel execution for fair timing comparison
- Visual diff highlighting response differences
- Criterion-by-criterion comparison
- Aggregate metrics comparison (pass rate, tokens, latency)
- Improvement recommendations based on results

#### Metrics Calculation

```typescript

## AI Agent Workbench

Comprehensive documentation for the AI Agent Workbench feature has been moved to [docs/AI_AGENT_WORKBENCH.md](./docs/AI_AGENT_WORKBENCH.md) due to its extensive scope (conversational prompt refinement, version control, testing framework, etc.).
