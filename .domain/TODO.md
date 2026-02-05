# TODO: Private AI Agent Refinement & Testing Workbench (phyter1/main#15)

**Source**: https://github.com/phyter1/main/issues/15
**Created**: 2026-02-05T00:01:28Z
**Status**: In Progress

## Overview

Build a private, authenticated workbench for conversationally refining and testing AI agents (chat and job-fit analyzer). This meta-feature demonstrates AI-first development by using AI to improve AI.

## Tasks

### Group 1: Foundation - Auth & Core Infrastructure (No Dependencies)

- [ ] **T001: Create authentication utilities and middleware**
  - Acceptance: `src/lib/auth.ts` created with password hashing utilities
  - Acceptance: `middleware.ts` created with auth check for `/admin/*` routes
  - Acceptance: Redirects unauthenticated requests to login page
  - Acceptance: Sets secure HTTP-only cookie on successful auth
  - Acceptance: Unit tests for auth utilities (password verification, token validation)
  - Files: `middleware.ts`, `src/lib/auth.ts`, `src/lib/auth.test.ts`

- [ ] **T002: Create prompt versioning system**
  - Acceptance: `src/lib/prompt-versioning.ts` created with save/load/list version functions
  - Acceptance: Prompts saved to `.admin/prompts/{agent-type}/{version-id}.json`
  - Acceptance: Version metadata includes: timestamp, description, author, token count
  - Acceptance: Functions: `savePromptVersion()`, `loadPromptVersion()`, `listVersions()`, `rollbackVersion()`
  - Acceptance: Unit tests for all versioning functions
  - Files: `src/lib/prompt-versioning.ts`, `src/lib/prompt-versioning.test.ts`

- [ ] **T003: Create test execution engine**
  - Acceptance: `src/lib/test-runner.ts` created with test case execution logic
  - Acceptance: Runs test cases against a given system prompt
  - Acceptance: Returns structured results: pass/fail, response text, token count, latency
  - Acceptance: Supports criteria evaluation: contains text, first person, token limit, etc.
  - Acceptance: Unit tests with mocked AI responses
  - Files: `src/lib/test-runner.ts`, `src/lib/test-runner.test.ts`

- [ ] **T004: Add admin environment configuration**
  - Acceptance: `.env.local.example` updated with `ADMIN_PASSWORD` variable
  - Acceptance: `ADMIN_SESSION_SECRET` for session encryption
  - Acceptance: Documentation in `.env.local.example` for setup
  - Acceptance: CLAUDE.md updated with admin auth section
  - Files: `.env.local.example`, `CLAUDE.md`

### Group 2: API Routes - Prompt Management (Depends on Group 1: T002)

- [ ] **T005: Create prompt refinement API route**
  - Acceptance: `POST /api/admin/refine-prompt` created
  - Acceptance: Input: agent type, current prompt, refinement request (conversational)
  - Acceptance: Uses AI to generate refined prompt based on request
  - Acceptance: Returns: proposed prompt, diff summary, token count comparison
  - Acceptance: Rate limiting (5 req/min for admin routes)
  - Acceptance: Auth check using middleware
  - Acceptance: Unit tests with mocked AI responses
  - Depends: T002
  - Files: `src/app/api/admin/refine-prompt/route.ts`, `src/app/api/admin/refine-prompt/route.test.ts`

- [ ] **T006: Create test-prompt API route**
  - Acceptance: `POST /api/admin/test-prompt` created
  - Acceptance: Input: prompt text, agent type, test cases array
  - Acceptance: Runs all test cases against the prompt using test-runner
  - Acceptance: Returns: test results with pass/fail, responses, metrics
  - Acceptance: Supports parallel test execution
  - Acceptance: Auth check using middleware
  - Acceptance: Unit tests with mocked test runner
  - Depends: T003
  - Files: `src/app/api/admin/test-prompt/route.ts`, `src/app/api/admin/test-prompt/route.test.ts`

- [ ] **T007: Create deploy-prompt API route**
  - Acceptance: `POST /api/admin/deploy-prompt` created
  - Acceptance: Input: agent type, prompt version ID
  - Acceptance: Updates the active prompt file for specified agent
  - Acceptance: Creates git commit with change description
  - Acceptance: Returns: deployment status, commit hash, rollback instructions
  - Acceptance: Auth check using middleware
  - Acceptance: Unit tests with mocked file system and git operations
  - Depends: T002
  - Files: `src/app/api/admin/deploy-prompt/route.ts`, `src/app/api/admin/deploy-prompt/route.test.ts`

- [ ] **T008: Create prompt history API route**
  - Acceptance: `GET /api/admin/prompt-history?agent={type}` created
  - Acceptance: Returns list of all prompt versions for specified agent
  - Acceptance: Includes metadata: timestamp, description, token count, author
  - Acceptance: Sorted by timestamp (newest first)
  - Acceptance: Auth check using middleware
  - Acceptance: Unit tests
  - Depends: T002
  - Files: `src/app/api/admin/prompt-history/route.ts`, `src/app/api/admin/prompt-history/route.test.ts`

### Group 3: API Routes - Resume Management (Depends on Group 1)

- [ ] **T009: Create update-resume API route**
  - Acceptance: `POST /api/admin/update-resume` created
  - Acceptance: Input: conversational update request ("Add project X with tech Y")
  - Acceptance: Uses AI to generate proposed resume data changes
  - Acceptance: Returns: proposed changes, diff preview, affected sections
  - Acceptance: Does NOT auto-commit - returns preview for approval
  - Acceptance: Auth check using middleware
  - Acceptance: Unit tests with mocked AI responses
  - Files: `src/app/api/admin/update-resume/route.ts`, `src/app/api/admin/update-resume/route.test.ts`

- [ ] **T010: Modify resume.ts to support dynamic updates**
  - Acceptance: Add `updateResume()` function that accepts partial resume updates
  - Acceptance: Validates structure before applying changes
  - Acceptance: Preserves existing data while merging updates
  - Acceptance: Exports `applyResumeUpdate()` for admin use
  - Acceptance: Unit tests for update logic
  - Files: `src/data/resume.ts`, `src/data/resume.test.ts`

### Group 4: Make Existing Routes Configurable (Depends on Group 2: T002)

- [ ] **T011: Refactor chat route to support prompt loading**
  - Acceptance: Extract system prompt to separate constant/file
  - Acceptance: Add `loadActivePrompt('chat')` function call
  - Acceptance: Falls back to embedded prompt if no active version
  - Acceptance: Maintains all existing functionality (streaming, rate limits, validation)
  - Acceptance: Existing tests still pass
  - Acceptance: New test for prompt loading
  - Depends: T002
  - Files: `src/app/api/chat/route.ts`, `src/app/api/chat/route.test.ts`

- [ ] **T012: Refactor fit-assessment route to support prompt loading**
  - Acceptance: Extract system prompt to separate constant/file
  - Acceptance: Add `loadActivePrompt('fit-assessment')` function call
  - Acceptance: Falls back to embedded prompt if no active version
  - Acceptance: Maintains all existing functionality
  - Acceptance: Existing tests still pass
  - Acceptance: New test for prompt loading
  - Depends: T002
  - Files: `src/app/api/fit-assessment/route.ts`, `src/app/api/fit-assessment/route.test.ts`

### Group 5: Admin UI Components (Depends on Group 1: T001)

- [ ] **T013: Create admin layout with authentication**
  - Acceptance: `src/app/admin/agent-workbench/layout.tsx` created
  - Acceptance: Wraps admin routes with auth check
  - Acceptance: Renders login form if not authenticated
  - Acceptance: Shows navigation sidebar when authenticated
  - Acceptance: Includes logout button
  - Acceptance: Uses shadcn/ui components
  - Depends: T001
  - Files: `src/app/admin/agent-workbench/layout.tsx`

- [ ] **T014: Create PromptDiff component**
  - Acceptance: `src/components/admin/PromptDiff.tsx` created
  - Acceptance: Shows side-by-side diff of original vs. proposed prompt
  - Acceptance: Highlights additions (green), deletions (red), changes (yellow)
  - Acceptance: Displays token count difference
  - Acceptance: Syntax highlighting for prompt text
  - Acceptance: Responsive layout (stacks on mobile)
  - Files: `src/components/admin/PromptDiff.tsx`

- [ ] **T015: Create TestRunner component**
  - Acceptance: `src/components/admin/TestRunner.tsx` created
  - Acceptance: Displays list of test cases with add/edit/delete controls
  - Acceptance: Shows test results in table: question, expected criteria, pass/fail
  - Acceptance: Displays metrics: pass rate, avg tokens, avg latency
  - Acceptance: "Run Tests" button triggers API call to `/api/admin/test-prompt`
  - Acceptance: Shows loading state during test execution
  - Acceptance: Side-by-side comparison of current vs. modified prompt results
  - Files: `src/components/admin/TestRunner.tsx`

- [ ] **T016: Create PromptEditor component**
  - Acceptance: `src/components/admin/PromptEditor.tsx` created
  - Acceptance: Conversational chat interface for refinement requests
  - Acceptance: Shows current prompt in read-only panel
  - Acceptance: Displays AI-proposed changes in diff view
  - Acceptance: "Test Changes", "Apply Changes", "Revert" buttons
  - Acceptance: Streaming response support for refinement suggestions
  - Acceptance: Uses shadcn/ui components (Textarea, Button, Card, etc.)
  - Files: `src/components/admin/PromptEditor.tsx`

- [ ] **T017: Create ResumeUpdater component**
  - Acceptance: `src/components/admin/ResumeUpdater.tsx` created
  - Acceptance: Conversational interface for resume updates
  - Acceptance: Shows current resume data in structured view
  - Acceptance: Displays proposed changes with diff
  - Acceptance: "Preview Changes", "Apply Changes", "Cancel" buttons
  - Acceptance: Integration with `/api/admin/update-resume`
  - Files: `src/components/admin/ResumeUpdater.tsx`

### Group 6: Main Workbench Pages (Depends on Group 5)

- [ ] **T018: Create main agent workbench page**
  - Acceptance: `src/app/admin/agent-workbench/page.tsx` created
  - Acceptance: Tab navigation: Chat Agent, Job Fit Agent, Resume Data, Test Suite, History
  - Acceptance: Each tab renders appropriate component (PromptEditor, TestRunner, etc.)
  - Acceptance: Loads current prompts and version history on mount
  - Acceptance: Clean, professional UI with shadcn/ui
  - Acceptance: Mobile responsive
  - Depends: T013, T014, T015, T016, T017
  - Files: `src/app/admin/agent-workbench/page.tsx`

- [ ] **T019: Create prompt history viewer**
  - Acceptance: `src/app/admin/agent-workbench/history/page.tsx` created
  - Acceptance: Displays timeline of all prompt changes
  - Acceptance: Shows version metadata: timestamp, description, token count
  - Acceptance: "View Diff", "Rollback", "Test Version" actions per version
  - Acceptance: Filter by agent type
  - Acceptance: Integration with `/api/admin/prompt-history`
  - Depends: T013
  - Files: `src/app/admin/agent-workbench/history/page.tsx`

### Group 7: Testing & Documentation (Depends on All Previous Groups)

- [ ] **T020: Create integration tests for admin workflows**
  - Acceptance: Test complete workflow: login → refine prompt → test → deploy
  - Acceptance: Test resume update workflow: request → preview → apply
  - Acceptance: Test rollback workflow: history → select version → deploy
  - Acceptance: Test unauthorized access handling
  - Acceptance: All tests pass with mocked AI and file system
  - Depends: T018, T019
  - Files: `src/app/admin/__tests__/workflows.integration.test.ts`

- [ ] **T021: Update CLAUDE.md with admin workbench documentation**
  - Acceptance: New section: "AI Agent Workbench"
  - Acceptance: Documents authentication setup
  - Acceptance: Documents all admin routes and their usage
  - Acceptance: Documents prompt versioning system
  - Acceptance: Documents test runner capabilities
  - Acceptance: Security best practices for admin access
  - Depends: T018, T019
  - Files: `CLAUDE.md`

## Parallel Execution Strategy

- **Group 1** (4 tasks): Foundation - All run in parallel
- **Group 2** (4 tasks): Prompt API routes - All run in parallel after Group 1
- **Group 3** (2 tasks): Resume API routes - Run in parallel after Group 1
- **Group 4** (2 tasks): Refactor existing routes - Run in parallel after Group 2
- **Group 5** (5 tasks): UI Components - All run in parallel after Group 1
- **Group 6** (2 tasks): Main pages - Run in parallel after Group 5
- **Group 7** (2 tasks): Testing & docs - Run in parallel after Group 6

**Total Tasks**: 21
**Parallel Groups**: 7
**Maximum Parallelism**: 5 tasks (Group 5)

## Notes

- All tasks follow TDD approach: tests first, then implementation
- All tasks create colocated test files (*.test.ts)
- Use existing patterns from `/api/chat` and `/api/fit-assessment` routes
- Follow Biome formatting (2-space indentation)
- Use shadcn/ui components (new-york style)
- Mock AI SDK in all tests
- Rate limiting for all admin API routes (5 req/min)
