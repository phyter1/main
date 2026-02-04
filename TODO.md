# Implementation Tasks: Enhanced Guardrail Feedback System

**Issue**: phyter1/main#10 - Showcase AI guardrails, security measures, and agentic prompting implementation

---

## Task Breakdown

### Parallel Group 1: Type Definitions and Core Infrastructure (4 tasks)

#### T001: Create GuardrailViolation type definitions
**Status**: pending
**File**: `src/types/guardrails.ts` (new)
**Description**: Define TypeScript interfaces for enhanced error responses
**Dependencies**: None
**Acceptance Criteria**:
- [ ] Create `GuardrailType` enum: `prompt_injection | rate_limit | length_validation | suspicious_pattern | scope_enforcement`
- [ ] Create `GuardrailSeverity` enum: `low | medium | high`
- [ ] Create `GuardrailDetails` interface with all required fields
- [ ] Create `GuardrailViolation` interface extending base error
- [ ] Export all types for use in API routes and components
- [ ] Add JSDoc comments explaining each field

#### T002: Enhance ValidationResult in input-sanitization.ts
**Status**: pending
**File**: `src/lib/input-sanitization.ts`
**Description**: Add detailed metadata to validation results
**Dependencies**: T001
**Acceptance Criteria**:
- [ ] Import GuardrailDetails type
- [ ] Extend ValidationResult interface with optional guardrailDetails field
- [ ] Update validateChatMessage to populate guardrail details
- [ ] Update validateJobDescription to populate guardrail details
- [ ] Include specific pattern matched, category, implementation details
- [ ] Map validation failures to appropriate guardrail types
- [ ] Update all existing tests to pass
- [ ] Add new tests for guardrail details population

#### T003: Update chat API route with enhanced errors
**Status**: pending
**File**: `src/app/api/chat/route.ts`
**Description**: Return GuardrailViolation format on validation failures
**Dependencies**: T001, T002
**Acceptance Criteria**:
- [ ] Import GuardrailViolation type
- [ ] Update validation error responses to include guardrail details
- [ ] Update rate limit responses with guardrail metadata
- [ ] Maintain backward compatibility (keep error field)
- [ ] Add sourceFile paths and line numbers
- [ ] Update existing tests
- [ ] Add tests for enhanced error format

#### T004: Update fit-assessment API route with enhanced errors
**Status**: pending
**File**: `src/app/api/fit-assessment/route.ts`
**Description**: Return GuardrailViolation format on validation failures
**Dependencies**: T001, T002
**Acceptance Criteria**:
- [ ] Import GuardrailViolation type
- [ ] Update validation error responses to include guardrail details
- [ ] Update rate limit responses with guardrail metadata
- [ ] Maintain backward compatibility (keep error field)
- [ ] Add sourceFile paths and line numbers
- [ ] Update existing tests
- [ ] Add tests for enhanced error format

---

### Parallel Group 2: UI Components (3 tasks)

#### T005: Create GuardrailFeedback component
**Status**: pending
**File**: `src/components/ui/guardrail-feedback.tsx`
**Description**: Build reusable component to display guardrail violations
**Dependencies**: T001
**Acceptance Criteria**:
- [ ] Accept GuardrailViolation as prop
- [ ] Display guardrail icon based on type (🛡️ prompt injection, ⏱️ rate limit, 📏 length, ⚠️ suspicious, 🎯 scope)
- [ ] Show severity badge with color coding (red: high, yellow: medium, gray: low)
- [ ] Display category and explanation
- [ ] Show "What was detected" section
- [ ] Show "How it works" section
- [ ] Link to source code on GitHub with file path and line numbers
- [ ] Expandable details section (collapsed by default for mobile)
- [ ] Mobile responsive design
- [ ] Educational, non-punishing tone in copy
- [ ] Accessible (ARIA labels, keyboard navigation)
- [ ] Create test file with component tests

#### T006: Create GuardrailFeedback stories and examples
**Status**: pending
**File**: `src/components/ui/guardrail-feedback.stories.tsx` (new, optional)
**Description**: Document component usage with examples
**Dependencies**: T005
**Acceptance Criteria**:
- [ ] Example for each guardrail type
- [ ] Example for each severity level
- [ ] Mobile and desktop views
- [ ] Expanded and collapsed states
- [ ] (Optional: Can be skipped if no Storybook setup exists)

#### T007: Add GuardrailFeedback styles and animations
**Status**: pending
**File**: `src/components/ui/guardrail-feedback.tsx`
**Description**: Polish component with Framer Motion animations
**Dependencies**: T005
**Acceptance Criteria**:
- [ ] Fade-in animation on mount
- [ ] Smooth expand/collapse transition
- [ ] Hover states on interactive elements
- [ ] Focus states for keyboard navigation
- [ ] Match existing design system (shadcn/ui patterns)
- [ ] Support reduced motion preference

---

### Parallel Group 3: Integration (3 tasks)

#### T008: Integrate GuardrailFeedback into ChatInterface
**Status**: pending
**File**: `src/components/sections/ChatInterface.tsx`
**Description**: Display guardrail feedback on validation errors
**Dependencies**: T003, T005
**Acceptance Criteria**:
- [ ] Import GuardrailFeedback component
- [ ] Update error state to store full GuardrailViolation
- [ ] Conditionally render GuardrailFeedback when error has guardrail details
- [ ] Fall back to simple error message for backward compatibility
- [ ] Position feedback prominently in chat UI
- [ ] Update error handling to parse API response correctly
- [ ] Test with all guardrail types
- [ ] Update component tests

#### T009: Integrate GuardrailFeedback into JobFitAnalyzer
**Status**: pending
**File**: `src/components/sections/JobFitAnalyzer.tsx`
**Description**: Display guardrail feedback on validation errors
**Dependencies**: T004, T005
**Acceptance Criteria**:
- [ ] Import GuardrailFeedback component
- [ ] Update error state to store full GuardrailViolation
- [ ] Conditionally render GuardrailFeedback when error has guardrail details
- [ ] Fall back to simple error message for backward compatibility
- [ ] Position feedback prominently in form UI
- [ ] Update error handling to parse API response correctly
- [ ] Handle rate limit errors specially (show retry timer)
- [ ] Test with all guardrail types
- [ ] Update component tests

#### T010: Add end-to-end tests for guardrail feedback
**Status**: pending
**File**: `src/app/__tests__/guardrail-feedback.integration.test.tsx` (new)
**Description**: Test full flow from API to UI for all guardrail types
**Dependencies**: T008, T009
**Acceptance Criteria**:
- [ ] Test prompt injection feedback in ChatInterface
- [ ] Test rate limit feedback in both interfaces
- [ ] Test length validation feedback
- [ ] Test suspicious pattern feedback
- [ ] Test scope enforcement feedback
- [ ] Verify GitHub links are correctly formatted
- [ ] Verify severity badges display correctly
- [ ] Test mobile responsive behavior
- [ ] Test keyboard navigation and accessibility

---

### Parallel Group 4: Documentation and Polish (2 tasks)

#### T011: Add documentation for guardrail system
**Status**: pending
**File**: `docs/guardrails.md` (new) or `README.md` update
**Description**: Document the enhanced guardrail feedback system
**Dependencies**: None (can run in parallel)
**Acceptance Criteria**:
- [ ] Explain purpose of guardrail feedback system
- [ ] List all guardrail types and what they detect
- [ ] Document GuardrailViolation API response format
- [ ] Show example API responses for each guardrail type
- [ ] Document GuardrailFeedback component API
- [ ] Add usage examples
- [ ] Link to relevant source files
- [ ] Explain educational/portfolio value

#### T012: Update error logging to track guardrail metrics
**Status**: pending
**File**: `src/lib/analytics.ts` or new file
**Description**: Track guardrail violations for analytics
**Dependencies**: T001
**Acceptance Criteria**:
- [ ] Log guardrail violations with type and severity
- [ ] Track which guardrails are triggered most often
- [ ] Privacy-respecting (no sensitive data logged)
- [ ] Optional: Add dashboard/reporting capability
- [ ] Update existing logSecurityEvent function
- [ ] Add tests for logging logic

---

## Execution Plan

**Total Tasks**: 12
**Parallel Groups**: 4

**Group 1** (Foundation): T001, T002, T003, T004 - Run in parallel
**Group 2** (UI Components): T005, T006, T007 - Run in parallel (after Group 1)
**Group 3** (Integration): T008, T009, T010 - Run in parallel (after Group 2)
**Group 4** (Documentation): T011, T012 - Run in parallel (anytime)

**Estimated Complexity**:
- High: T002 (validation logic), T005 (main component), T010 (integration tests)
- Medium: T003, T004 (API updates), T008, T009 (integration)
- Low: T001 (types), T006, T007 (polish), T011, T012 (docs)

---

## Testing Strategy

Each task includes tests as acceptance criteria:
- Unit tests for types and utilities
- Component tests for UI elements
- API route tests for error responses
- Integration tests for full flows
- Accessibility tests for keyboard/screen reader support

Target: Maintain 100% test pass rate (currently 386/386 passing)

---

## Definition of Done

A task is complete when:
1. All acceptance criteria are met
2. All tests pass (existing + new)
3. Code follows existing patterns and conventions
4. TypeScript strict mode passes
5. Biome linting passes
6. Component is accessible (ARIA, keyboard navigation)
7. Mobile responsive (if UI component)
8. Documentation updated (if public API)

---

## Notes

- Maintain backward compatibility throughout
- Follow existing patterns (shadcn/ui, data-slot attributes, cn() utility)
- Use existing Badge and Card components for consistency
- Ensure educational tone (not punishing) in all copy
- Link to actual source code on GitHub (use repository URL from issue context)
- Privacy-respecting analytics (no sensitive data)
