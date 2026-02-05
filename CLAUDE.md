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

## Code Quality Tools

### Biome Configuration
- Formatter: 2-space indentation
- Linter: Recommended rules enabled with React and Next.js domains
- VCS integration enabled (Git)
- Auto-organize imports on save
- Ignores: `node_modules`, `.next`, `dist`, `build`
- Special rule: `noUnknownAtRules` disabled for Tailwind compatibility

Always use `bun lint` and `bun format` (not `npm run lint` or other package managers).

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

## Admin Workbench

The application includes a secure administrative interface for managing portfolio content, analytics, and system configuration. Authentication is password-based with session management.

### Overview

The Admin Workbench provides:

1. **Content Management**
   - Edit resume data, projects, and experience
   - Update skills and technologies
   - Manage featured work and case studies

2. **Analytics Dashboard**
   - AI feature usage metrics
   - Chat engagement statistics
   - Job fit assessment trends
   - Rate limit monitoring

3. **System Configuration**
   - AI model settings and quotas
   - Rate limit adjustments
   - Environment variable management (view only)
   - Cache and performance tuning

### Setup and Authentication

#### Environment Configuration

The admin system requires specific environment variables for authentication and security.

**Required Environment Variables:**

```bash
# Admin password for authentication
# CRITICAL: Use a strong password with at least 16 characters
# Include mixed case letters, numbers, and symbols
# Example: "MySecure#Admin2026Pass!"
ADMIN_PASSWORD=your_secure_password_here

# Session secret for encrypting session data
# CRITICAL: Must be a random 64-character string
# Generate using: openssl rand -base64 48
# This encrypts session cookies to prevent tampering
ADMIN_SESSION_SECRET=random_64_char_secret_for_session_encryption

# Optional: Rate limiting for admin login attempts
# Default: 5 requests per minute per IP
# Prevents brute force password attacks
ADMIN_MAX_REQUESTS_PER_MINUTE=5
```

**Setting Up Admin Access:**

1. **Generate Session Secret**
   ```bash
   # On macOS/Linux:
   openssl rand -base64 48

   # Example output (DO NOT USE THIS EXACT VALUE):
   # p8KjN2mR7vL3xQ9wY4tF6sD8aH1cE5nU2bV7iO3kG9rT4jM8lZ6xC1yP5wQ2sA7h
   ```

2. **Set Strong Admin Password**
   - Minimum 16 characters
   - Mix of uppercase, lowercase, numbers, and symbols
   - Avoid common passwords, dictionary words, or personal information
   - Use a password manager to generate and store

3. **Update `.env.local`**
   ```bash
   # Copy example file if not already done
   cp .env.local.example .env.local

   # Edit .env.local and set:
   ADMIN_PASSWORD=YourActualStrongPassword123!@#
   ADMIN_SESSION_SECRET=<paste the 64-char secret from openssl command>

   # Optional: Customize rate limiting
   ADMIN_MAX_REQUESTS_PER_MINUTE=10  # Allow more requests if needed
   ```

4. **Restart Development Server**
   ```bash
   bun dev
   ```

5. **Access Admin Interface**
   - Navigate to: http://localhost:3000/admin
   - Enter your admin password
   - Session lasts 24 hours (configurable)

#### Security Architecture

**Password-Based Authentication:**
- Single admin password (no multi-user support)
- Password hashed using bcrypt before comparison
- Failed login attempts tracked per IP
- Rate limiting prevents brute force attacks

**Session Management:**
- Encrypted session cookies using `ADMIN_SESSION_SECRET`
- Sessions expire after 24 hours of inactivity
- Sessions invalidated on logout
- Secure cookie flags in production (httpOnly, secure, sameSite)

**Rate Limiting:**
- Default: 5 login attempts per minute per IP
- Configurable via `ADMIN_MAX_REQUESTS_PER_MINUTE`
- 429 response with `Retry-After` header on limit exceeded
- Independent from AI endpoint rate limits

### Security Best Practices

#### Password Management

1. **Password Strength**
   - Use at least 16 characters
   - Include uppercase, lowercase, numbers, and symbols
   - Avoid patterns: "Admin123!", "Password2026", etc.
   - Test with password strength checker

2. **Password Rotation**
   - Rotate admin password every 90 days
   - Change immediately if compromised
   - Update both `.env.local` and production environment
   - Consider using different passwords for dev/staging/prod

3. **Session Secret Rotation**
   - Rotate `ADMIN_SESSION_SECRET` quarterly
   - Invalidates all existing sessions on rotation
   - Generate new secret using `openssl rand -base64 48`
   - Coordinate rotation with low-traffic periods

#### Environment Security

1. **Never Commit Secrets**
   - `.env.local` is in `.gitignore` (verify this)
   - Never commit actual passwords or session secrets
   - Use `.env.local.example` as template only
   - Review commits before pushing to ensure no secrets leaked

2. **Production Deployment**
   - Use environment variables in hosting platform (Vercel, etc.)
   - Never hardcode secrets in code
   - Use different secrets for each environment
   - Enable audit logging for secret access

3. **Access Control**
   - Limit who has access to production environment variables
   - Use principle of least privilege
   - Document who has admin access
   - Revoke access when team members leave

#### Attack Prevention

1. **Brute Force Protection**
   - Rate limiting enabled by default (5 attempts/minute)
   - Consider implementing exponential backoff
   - Monitor failed login attempts
   - Alert on suspicious activity patterns

2. **Session Security**
   - Sessions encrypted with strong secret
   - httpOnly cookies prevent XSS access
   - Secure flag ensures HTTPS-only transmission
   - SameSite attribute prevents CSRF attacks

3. **Network Security**
   - Use HTTPS in production (enforced)
   - Consider IP allowlisting for admin routes
   - Enable firewall rules if applicable
   - Use VPN for sensitive admin operations

### Quick Start Guide

**First Time Setup:**

```bash
# 1. Generate session secret
openssl rand -base64 48

# 2. Copy example environment file
cp .env.local.example .env.local

# 3. Edit .env.local and set:
#    - ADMIN_PASSWORD (your strong password)
#    - ADMIN_SESSION_SECRET (output from step 1)

# 4. Start development server
bun dev

# 5. Access admin interface
# http://localhost:3000/admin
```

**Daily Usage:**

1. Navigate to `/admin`
2. Enter admin password
3. Access dashboard and management tools
4. Changes auto-save or use "Save" buttons
5. Logout when finished (or session expires in 24h)

**Troubleshooting:**

**Problem:** "Invalid password" error on login

**Solution:**
1. Verify `ADMIN_PASSWORD` is set in `.env.local`
2. Check for typos in password (case-sensitive)
3. Ensure no extra whitespace in `.env.local`
4. Restart dev server after changing environment variables

**Problem:** "Session expired" immediately after login

**Solution:**
1. Verify `ADMIN_SESSION_SECRET` is set and at least 32 characters
2. Regenerate secret using `openssl rand -base64 48`
3. Clear browser cookies for localhost
4. Restart dev server

**Problem:** 429 "Too many requests" on login

**Solution:**
1. Wait 60 seconds for rate limit to reset
2. Increase `ADMIN_MAX_REQUESTS_PER_MINUTE` in `.env.local` if needed
3. Check if multiple IPs are trying to access (possible attack)
4. Review server logs for suspicious activity

**Problem:** Admin routes accessible without authentication

**Solution:**
1. Verify authentication middleware is applied to `/admin` routes
2. Check session validation logic in `src/middleware.ts`
3. Ensure cookies are enabled in browser
4. Review Next.js middleware configuration

### Development vs Production

**Development Environment:**
- Use simple password for convenience (still secure, just easier to type)
- Higher rate limits (10-20 requests/minute)
- Session logging enabled for debugging
- Cookie secure flag disabled (http:// allowed)

**Production Environment:**
- Strong, unique password (16+ characters, complex)
- Conservative rate limits (5 requests/minute)
- Minimal logging (no password logging)
- Cookie secure flag enabled (HTTPS required)
- Consider IP allowlisting for admin routes
- Enable monitoring and alerting for failed logins

### Future Enhancements

**Planned Features:**
- Multi-user support with roles and permissions
- Two-factor authentication (TOTP)
- Audit logging for all admin actions
- SSO integration (OAuth, SAML)
- Advanced analytics and reporting
- Automated backup and restore
- Content versioning and rollback
