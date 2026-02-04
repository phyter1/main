# Codebase Context Analysis

## Tech Stack
- **Framework**: Next.js 16 with React 19.2.0, App Router
- **Language**: TypeScript 5 (strict mode)
- **Runtime**: Bun (Node.js 18+ fallback)
- **AI/LLM**: `ai@^6.0.69`, OpenAI + Anthropic SDKs
- **UI**: shadcn/ui + Radix UI, Tailwind CSS 4, Framer Motion
- **Validation**: Zod 4.3.6
- **Testing**: Bun Test (386 tests, 100% passing)

## Key Files
- `/tmp/phyter1-main/src/lib/input-sanitization.ts` - Security validation (28+ patterns)
- `/tmp/phyter1-main/src/app/api/chat/route.ts` - Streaming chat endpoint
- `/tmp/phyter1-main/src/app/api/fit-assessment/route.ts` - Job fit analysis
- `/tmp/phyter1-main/src/components/sections/ChatInterface.tsx` - Chat UI
- `/tmp/phyter1-main/src/components/sections/JobFitAnalyzer.tsx` - Job fit UI
- `/tmp/phyter1-main/src/components/ui/` - UI primitives (badge, card, etc.)

## Current Error Handling
- Generic error messages ("Input contains patterns that attempt to override system instructions")
- HTTP status codes: 400 (validation), 429 (rate limit), 500 (server error)
- Simple error state in UI components
- No detailed feedback about which guardrail was triggered or why

## Existing Patterns
- **ValidationResult interface**: `{ isValid, sanitizedInput?, reason?, severity? }`
- **Rate limiting**: 10 req/min per IP (in-memory Map)
- **Security logging**: `logSecurityEvent({ type, severity, pattern? })`
- **UI components**: Badge (variants), Card (sections), error display patterns
- **Streaming**: Plain text streams for chat, structured JSON for assessments
- **Testing**: Co-located test files, acceptance criteria-driven tests

## Implementation Requirements
1. Enhance ValidationResult to include detailed metadata
2. Create GuardrailViolation interface for API responses
3. Update both API routes to return enhanced error structure
4. Build GuardrailFeedback UI component
5. Integrate feedback component into ChatInterface and JobFitAnalyzer
6. Ensure backward compatibility with existing error handling
7. Add tests for all new functionality
