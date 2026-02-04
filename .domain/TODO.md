# TODO: Feature: LLM interface trained on my previous work, experience, and expertise for interactive out-of-loop screening (phyter1/main#7)

**Source**: https://github.com/phyter1/main/issues/7
**Created**: 2026-02-04T15:11:57Z

## Overview

Build an AI-powered portfolio interface that allows hiring managers to:
- Query experience and expertise through conversational AI
- Paste job descriptions for fit assessment
- Expand resume items to see AI-generated context
- View honest skills assessment (strong/moderate/gaps)

## Tasks

### Group 1 (Foundation - No Dependencies)

- [ ] T001: Create resume/experience data model for LLM context
  - **Acceptance**: Data structure in `src/data/resume.ts` containing structured experience, projects, and expertise
  - **Acceptance**: Includes all information from existing `projects.ts`, `stack.ts`, `principles.ts`, `timeline.ts`
  - **Acceptance**: Formatted as LLM-friendly context (markdown or structured text)
  - **Acceptance**: Includes skills taxonomy with proficiency levels (expert/intermediate/learning/gaps)
  - **Acceptance**: TypeScript interface exported

- [ ] T002: Add AI SDK dependency and configure environment
  - **Acceptance**: Package installed (Vercel AI SDK or Anthropic SDK)
  - **Acceptance**: `.env.local.example` file with API key placeholder
  - **Acceptance**: Environment variable validation in config
  - **Acceptance**: Rate limiting constants defined
  - **Acceptance**: Documentation in CLAUDE.md about AI integration

- [ ] T003: Create shadcn/ui chat components (textarea, message bubbles)
  - **Acceptance**: `components/ui/textarea.tsx` added via shadcn CLI
  - **Acceptance**: `components/ui/scroll-area.tsx` added for chat history
  - **Acceptance**: Custom `ChatMessage` component created with user/assistant variants
  - **Acceptance**: Typing indicator component created
  - **Acceptance**: Components use existing theme variables

- [ ] T004: Create SkillsMatrix component for displaying skills with gaps
  - **Acceptance**: Component in `src/components/sections/SkillsMatrix.tsx`
  - **Acceptance**: Displays three columns: Strong, Moderate, Gaps
  - **Acceptance**: Uses badge components from shadcn/ui
  - **Acceptance**: Responsive grid layout (stacks on mobile)
  - **Acceptance**: Reads from skills data model
  - **Acceptance**: Has colocated test file with >80% coverage

### Group 2 (API Layer - Depends on Group 1)

- [ ] T005: Create API route for chat completions with streaming
  - **Acceptance**: Route at `src/app/api/chat/route.ts`
  - **Acceptance**: POST endpoint accepts `{messages: Message[]}`
  - **Acceptance**: Streams LLM responses using AI SDK
  - **Acceptance**: System prompt includes resume data from T001
  - **Acceptance**: Error handling for API failures
  - **Acceptance**: Rate limiting implemented (10 req/min per IP)
  - **Depends**: T001, T002

- [ ] T006: Create API route for job fit assessment
  - **Acceptance**: Route at `src/app/api/fit-assessment/route.ts`
  - **Acceptance**: POST endpoint accepts `{jobDescription: string}`
  - **Acceptance**: Returns structured assessment: `{fitLevel: "strong"|"weak"|"moderate", reasoning: string[], recommendations: string[]}`
  - **Acceptance**: Uses resume data for comparison
  - **Acceptance**: Input validation (max 10k characters, required field)
  - **Acceptance**: Error handling and rate limiting
  - **Depends**: T001, T002

### Group 3 (UI Components - Depends on Group 2)

- [ ] T007: Create ChatInterface component with streaming support
  - **Acceptance**: Component at `src/components/sections/ChatInterface.tsx`
  - **Acceptance**: Displays message history with user/assistant bubbles
  - **Acceptance**: Textarea for input with send button
  - **Acceptance**: Connects to `/api/chat` endpoint
  - **Acceptance**: Streams responses token-by-token
  - **Acceptance**: Loading states and error handling
  - **Acceptance**: Accessible (keyboard navigation, ARIA labels)
  - **Acceptance**: Has colocated test file mocking API calls
  - **Depends**: T003, T005

- [ ] T008: Create JobFitAnalyzer component
  - **Acceptance**: Component at `src/components/sections/JobFitAnalyzer.tsx`
  - **Acceptance**: Large textarea for pasting job description
  - **Acceptance**: "Analyze Fit" button triggers assessment
  - **Acceptance**: Displays fit level with color coding (green/yellow/red)
  - **Acceptance**: Shows reasoning bullets and recommendations
  - **Acceptance**: Loading state during analysis
  - **Acceptance**: Error handling for invalid input
  - **Acceptance**: Has colocated test file with >80% coverage
  - **Depends**: T006

- [ ] T009: Create ExpandableContext component for resume items
  - **Acceptance**: Component at `src/components/ui/ExpandableContext.tsx`
  - **Acceptance**: Shows "View AI Context" button
  - **Acceptance**: Expands to reveal detailed context
  - **Acceptance**: Smooth animation using Framer Motion
  - **Acceptance**: Can be used in existing project cards
  - **Acceptance**: Accepts `context` prop with situation/task/action/result
  - **Acceptance**: Has colocated test file
  - **Depends**: T003

### Group 4 (Pages - Depends on Group 3)

- [ ] T010: Create /chat page for AI conversation interface
  - **Acceptance**: Page at `src/app/chat/page.tsx`
  - **Acceptance**: Layout file with appropriate title
  - **Acceptance**: Renders ChatInterface component
  - **Acceptance**: Hero section with title "Ask Me Anything"
  - **Acceptance**: Subtitle explaining the AI is trained on experience
  - **Acceptance**: Follows existing page structure conventions
  - **Acceptance**: Has colocated test file
  - **Depends**: T007

- [ ] T011: Create /fit-assessment page for job description analyzer
  - **Acceptance**: Page at `src/app/fit-assessment/page.tsx`
  - **Acceptance**: Layout file with SEO metadata
  - **Acceptance**: Renders JobFitAnalyzer component
  - **Acceptance**: Introductory text explaining the tool
  - **Acceptance**: Example job description link or sample
  - **Acceptance**: Follows existing page conventions
  - **Acceptance**: Has colocated test file
  - **Depends**: T008

- [ ] T012: Update /about or /stack page to include SkillsMatrix with gaps
  - **Acceptance**: SkillsMatrix component added to appropriate page
  - **Acceptance**: Section header: "Skills & Expertise"
  - **Acceptance**: Subheader explaining honest self-assessment
  - **Acceptance**: Integration matches existing page style
  - **Acceptance**: Tests updated to cover new section
  - **Depends**: T004

### Group 5 (Integration - Depends on Group 4)

- [ ] T013: Update Navigation to include new pages
  - **Acceptance**: "Chat" link added to navigation
  - **Acceptance**: "Fit Assessment" link added
  - **Acceptance**: Navigation maintains responsive behavior
  - **Acceptance**: Active states work for new routes
  - **Acceptance**: Tests updated to include new links
  - **Depends**: T010, T011

- [ ] T014: Enhance existing projects page with ExpandableContext
  - **Acceptance**: At least 3 featured projects have "View AI Context" buttons
  - **Acceptance**: Context data includes STAR format (Situation, Task, Action, Result)
  - **Acceptance**: Smooth UX with loading states
  - **Acceptance**: Maintains existing project card styling
  - **Acceptance**: Tests verify expansion functionality
  - **Depends**: T009

### Group 6 (Polish & Documentation - Depends on Group 5)

- [ ] T015: Add usage analytics for AI features
  - **Acceptance**: Track chat interactions (count, not content)
  - **Acceptance**: Track fit assessments (count)
  - **Acceptance**: Track context expansions
  - **Acceptance**: Privacy-respecting (no PII)
  - **Acceptance**: Uses existing Umami integration
  - **Depends**: T013

- [ ] T016: Update CLAUDE.md with AI integration patterns
  - **Acceptance**: Documents API routes structure
  - **Acceptance**: Explains LLM context management
  - **Acceptance**: Lists environment variables required
  - **Acceptance**: Includes testing strategy for AI features
  - **Acceptance**: Rate limiting explanation
  - **Depends**: T015

- [ ] T017: Create comprehensive E2E test for full user flow
  - **Acceptance**: Test simulates: landing → chat → fit assessment → context expansion
  - **Acceptance**: Mocks API responses appropriately
  - **Acceptance**: Verifies all critical user paths
  - **Acceptance**: Runs in CI/CD pipeline
  - **Acceptance**: Covers error scenarios
  - **Depends**: T016

## Execution Strategy

- **Group 1**: 4 tasks in parallel (foundation)
- **Group 2**: 2 tasks in parallel (API layer)
- **Group 3**: 3 tasks in parallel (UI components)
- **Group 4**: 3 tasks in parallel (pages)
- **Group 5**: 2 tasks in parallel (integration)
- **Group 6**: 3 tasks in parallel (polish)

**Total**: 17 tasks across 6 parallel groups

## Notes

- All tasks follow TDD: write tests first, then implementation
- Use existing patterns from codebase (shadcn/ui, Biome formatting, bun:test)
- Keep API keys in environment variables, never commit secrets
- Maintain accessibility standards (WCAG 2.1 AA)
- All components should support reduced motion preferences
