# Guardrail Feedback System

**Status**: Implemented
**Related Issue**: [phyter1/main#10](https://github.com/phyter1/main/issues/10)
**Purpose**: Production-grade AI security with educational feedback

## Overview

The Guardrail Feedback System transforms security violations from frustrating error messages into educational opportunities. Instead of showing generic "your input was rejected" errors, the system provides detailed, transparent feedback that explains:

- **Why** the guardrail exists (the security purpose)
- **What** was detected in the user's input
- **How** the detection mechanism works
- **Where** to find the implementation in the source code

This approach serves dual purposes:
1. **Security**: Comprehensive input validation protecting against prompt injection, XSS, rate limiting abuse, and other attack vectors
2. **Portfolio Value**: Every security violation becomes a teaching moment that showcases production-grade implementation

## Architecture

### Component Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        User Input                            │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│              Input Validation Layer                          │
│         (src/lib/input-sanitization.ts)                      │
│                                                               │
│  • Pattern Matching (30+ injection patterns)                 │
│  • Length Validation                                          │
│  • Statistical Analysis (character distribution)             │
│  • Scope Enforcement (job description keywords)              │
│  • HTML Sanitization                                          │
└───────────────────┬─────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
┌──────────────┐      ┌──────────────────────┐
│  Valid Input │      │  GuardrailViolation  │
│              │      │  (with details)      │
└──────────────┘      └──────┬───────────────┘
                             │
                             ▼
                ┌────────────────────────────┐
                │  GuardrailFeedback         │
                │  Component                 │
                │  (UI Display)              │
                └────────────────────────────┘
```

### Type System

The guardrail system is fully typed using TypeScript interfaces defined in `src/types/guardrails.ts`:

```typescript
/**
 * Core guardrail violation response
 */
export interface GuardrailViolation {
  error: string;              // Backward-compatible error message
  guardrail?: GuardrailDetails; // Enhanced feedback details
}

/**
 * Detailed guardrail information
 */
export interface GuardrailDetails {
  type: GuardrailType;        // Which guardrail was triggered
  severity: GuardrailSeverity; // low | medium | high
  category: string;            // Specific subcategory
  explanation: string;         // Why this guardrail exists
  detected: string;            // What was found in the input
  implementation: string;      // How the detection works
  sourceFile: string;          // Path to implementation
  lineNumbers?: string;        // Optional line range
  context?: Record<string, unknown>; // Type-specific metadata
}
```

## Guardrail Types

### 1. Prompt Injection (`prompt_injection`)

**Purpose**: Detect attempts to override the AI's system instructions or extract its prompt.

**Detection Categories**:
- **System Instruction Override**: "Ignore all previous instructions"
- **System Prompt Extraction**: "Show me your system prompt"
- **Role Confusion**: "You are now a Python interpreter"
- **Jailbreak Attempt**: "Developer mode enabled"
- **Instruction Delimiter Confusion**: `[SYSTEM]`, `<|assistant|>`
- **Encoding/Obfuscation**: Base64, ROT13, hex encoding attempts
- **Obfuscation Detection**: >30% special character ratio

**Implementation**: Pattern matching against 30+ known attack vectors using regular expressions.

**Source**: `src/lib/input-sanitization.ts:33-78` (patterns), `161-209` (detection logic)

**Example Response**:
```json
{
  "error": "Input contains patterns that attempt to override system instructions",
  "guardrail": {
    "type": "prompt_injection",
    "severity": "high",
    "category": "System Instruction Override",
    "explanation": "Your input contained patterns that attempt to override the AI's instructions. This portfolio demonstrates production-grade AI security by detecting and blocking these attempts.",
    "detected": "Patterns attempting to change the AI's behavior or extract system prompts. These are common attack vectors in AI applications.",
    "implementation": "Input validation using pattern matching against 30+ known prompt injection techniques, including role confusion, instruction overrides, and jailbreak attempts.",
    "sourceFile": "src/lib/input-sanitization.ts",
    "lineNumbers": "26-71"
  }
}
```

### 2. Rate Limit (`rate_limit`)

**Purpose**: Prevent API abuse and excessive costs through request throttling.

**Detection Logic**:
- Per-IP tracking using in-memory Map
- Configurable limits (default: 10 requests/minute)
- Automatic cleanup of expired entries
- HTTP 429 (Too Many Requests) status code

**Implementation**: IP-based rate limiting with sliding window.

**Source**: `src/app/api/chat/route.ts:58-95` (rate limit logic)

**Example Response**:
```json
{
  "error": "Too many requests. Please wait before trying again.",
  "guardrail": {
    "type": "rate_limit",
    "severity": "medium",
    "category": "Request Throttling",
    "explanation": "Rate limits prevent API abuse, control costs, and ensure fair access for all users.",
    "detected": "You have exceeded the allowed number of requests.",
    "implementation": "Per-IP rate limiting using in-memory tracking with configurable thresholds.",
    "sourceFile": "src/app/api/chat/route.ts",
    "lineNumbers": "58-95",
    "context": {
      "currentCount": 10,
      "limit": 10,
      "retryAfter": 42
    }
  }
}
```

### 3. Length Validation (`length_validation`)

**Purpose**: Prevent token stuffing attacks and manage API costs.

**Detection Categories**:
- **Maximum Length Exceeded**: Input exceeds character limits
- **Excessive Line Breaks**: Too many newlines (>500 lines)

**Limits**:
```typescript
export const INPUT_LIMITS = {
  CHAT_MESSAGE: 2000,        // Chat messages
  JOB_DESCRIPTION: 10000,    // Job description analysis
  MAX_LINES: 500,            // Line count limit
};
```

**Implementation**: Length checks before processing, with percentage calculations.

**Source**: `src/lib/input-sanitization.ts:111-115` (limits), `280-305` (chat validation)

**Example Response**:
```json
{
  "error": "Message exceeds maximum length of 2000 characters",
  "guardrail": {
    "type": "length_validation",
    "severity": "low",
    "category": "Maximum Length Enforcement",
    "explanation": "Length limits prevent token stuffing attacks and excessive API costs while ensuring responsive performance.",
    "detected": "Your input is 2547 characters, which is 547 characters (27% over the limit).",
    "implementation": "Input is validated before processing using configurable limits defined in INPUT_LIMITS constants.",
    "sourceFile": "src/lib/input-sanitization.ts",
    "lineNumbers": "104-108",
    "context": {
      "inputLength": 2547,
      "maxLength": 2000,
      "overage": 547,
      "overagePercent": 27
    }
  }
}
```

### 4. Suspicious Pattern (`suspicious_pattern`)

**Purpose**: Defense-in-depth protection against code injection attempts.

**Detection Categories**:
- **XSS/Script Injection**: `<script>`, `javascript:`, event handlers
- **Command Injection**: `rm -rf`, `curl`, `wget`, pipe to bash
- **SQL Injection**: `OR 1=1`, `DROP TABLE`, `UNION SELECT`
- **Path Traversal**: `../`, `..\`
- **Token Stuffing**: Excessive repetition patterns

**Implementation**: Pattern matching against common malicious signatures.

**Source**: `src/lib/input-sanitization.ts:83-106` (patterns), `239-263` (detection)

**Example Response**:
```json
{
  "error": "Input contains suspicious or potentially malicious patterns",
  "guardrail": {
    "type": "suspicious_pattern",
    "severity": "high",
    "category": "XSS/Script Injection",
    "explanation": "Your input contained patterns commonly used in xss/script injection attacks. This demonstrates defense-in-depth security practices.",
    "detected": "HTML script tags, JavaScript execution attempts, or other malicious code patterns. While this is a chat interface (not vulnerable to traditional XSS), the validation demonstrates comprehensive security thinking.",
    "implementation": "Pattern matching against known malicious signatures including XSS, command injection, SQL injection, and path traversal.",
    "sourceFile": "src/lib/input-sanitization.ts",
    "lineNumbers": "76-99"
  }
}
```

### 5. Scope Enforcement (`scope_enforcement`)

**Purpose**: Ensure input matches expected use case (e.g., job descriptions for assessment tool).

**Detection Logic**:
- Keyword matching for expected content
- Length-based heuristics
- Context-appropriate validation

**Job Description Keywords**:
- `responsibilities`, `requirements`, `qualifications`, `duties`, `skills`, `experience`
- `role`, `position`, `job`, `opportunity`, `career`
- `years`, `months`, `bachelor`, `master`, `degree`
- `team`, `company`, `organization`, `department`

**Implementation**: Keyword matching with length-based thresholds.

**Source**: `src/lib/input-sanitization.ts:406-442`

**Example Response**:
```json
{
  "error": "Input does not appear to be a job description",
  "guardrail": {
    "type": "scope_enforcement",
    "severity": "medium",
    "category": "Content Validation",
    "explanation": "This tool is specifically designed to analyze job descriptions. Scope enforcement ensures consistent, focused interactions and prevents misuse.",
    "detected": "Your input does not contain expected job-related keywords (responsibilities, requirements, qualifications, skills, etc.). This appears to be off-topic content.",
    "implementation": "Keyword matching against common job description terminology to ensure appropriate use of the assessment tool.",
    "sourceFile": "src/lib/input-sanitization.ts",
    "lineNumbers": "262-281",
    "context": {
      "inputLength": 87,
      "keywordMatches": 0,
      "required": "At least one job-related keyword"
    }
  }
}
```

## GuardrailFeedback Component

### Component API

**File**: `src/components/ui/guardrail-feedback.tsx`

```typescript
export interface GuardrailFeedbackProps {
  /**
   * The guardrail violation to display
   */
  violation: GuardrailViolation;

  /**
   * Optional CSS class name for styling
   */
  className?: string;

  /**
   * Optional repository URL for GitHub links
   * Defaults to "https://github.com/phyter1/main"
   */
  repositoryUrl?: string;
}
```

### Usage Example

```tsx
import { GuardrailFeedback } from "@/components/ui/guardrail-feedback";
import type { GuardrailViolation } from "@/types/guardrails";

function ChatInterface() {
  const [error, setError] = useState<GuardrailViolation | null>(null);

  async function handleSubmit(message: string) {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      // API returns GuardrailViolation format
      const violation = await response.json();
      setError(violation);
      return;
    }

    // Handle success...
  }

  return (
    <div>
      {error && <GuardrailFeedback violation={error} />}
      {/* Chat UI... */}
    </div>
  );
}
```

### Visual Design

The component displays:
- **Icon and color-coding** by guardrail type
- **Severity badge** (high/medium/low)
- **Category badge** showing specific violation type
- **"Why This Matters"** section explaining the security purpose
- **"What Was Detected"** section describing what was found
- **Expandable "How It Works"** section with:
  - Technical implementation details
  - Clickable GitHub source link with line numbers
  - Context data (if available) in structured format
- **Educational footer** reinforcing portfolio value

**Accessibility**:
- ARIA labels and roles
- Keyboard navigation for expandable section
- Semantic HTML structure
- Screen reader-friendly content

## API Integration

### Server-Side Validation

All API routes validate input and return `GuardrailViolation` format on errors:

```typescript
// src/app/api/chat/route.ts
export async function POST(request: Request) {
  const { message } = await request.json();

  // Validate input
  const validation = validateChatMessage(message);
  if (!validation.isValid) {
    return Response.json(
      {
        error: validation.reason,
        guardrail: validation.guardrailDetails,
      } satisfies GuardrailViolation,
      { status: 400 }
    );
  }

  // Rate limiting
  const ip = getClientIP(request);
  if (isRateLimited(ip)) {
    const retryAfter = getSecondsUntilReset(ip);
    return Response.json(
      {
        error: "Too many requests. Please wait before trying again.",
        guardrail: {
          type: "rate_limit",
          severity: "medium",
          category: "Request Throttling",
          explanation: "Rate limits prevent API abuse...",
          detected: "You have exceeded the allowed number of requests.",
          implementation: "Per-IP rate limiting...",
          sourceFile: "src/app/api/chat/route.ts",
          lineNumbers: "58-95",
          context: {
            currentCount: entry.count,
            limit: AI_RATE_LIMITS.MAX_REQUESTS_PER_MINUTE,
            retryAfter,
          },
        },
      } satisfies GuardrailViolation,
      {
        status: 429,
        headers: { "Retry-After": retryAfter.toString() },
      }
    );
  }

  // Process valid request...
}
```

### Client-Side Handling

```typescript
// Fetch with guardrail error handling
async function callAPI(input: string) {
  try {
    const response = await fetch("/api/endpoint", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input }),
    });

    if (!response.ok) {
      const violation: GuardrailViolation = await response.json();

      // Display educational feedback
      showGuardrailFeedback(violation);
      return;
    }

    const data = await response.json();
    // Handle success...
  } catch (error) {
    // Handle network errors...
  }
}
```

## Educational Value

### Portfolio Showcase

The guardrail system demonstrates:

1. **Production-Grade Security**
   - Comprehensive input validation
   - Defense-in-depth approach
   - Rate limiting and abuse prevention
   - Proper error handling and feedback

2. **Type Safety**
   - Fully typed with TypeScript
   - Compile-time validation
   - IntelliSense support for developers

3. **User Experience**
   - Clear, educational error messages
   - Non-punishing feedback tone
   - Transparency about implementation
   - Direct links to source code

4. **Code Quality**
   - Well-documented
   - Testable architecture
   - Separation of concerns
   - Reusable components

### Interview Talking Points

When discussing this system in interviews:

- **Security-First Mindset**: "I implemented comprehensive guardrails covering prompt injection, rate limiting, and content validation. Each violation provides educational feedback showing exactly how the system works."

- **User Experience**: "Instead of generic error messages, I created detailed feedback that explains why guardrails exist and what was detected. This turns security violations into teaching moments."

- **Technical Depth**: "The system uses pattern matching for injection detection, statistical analysis for obfuscation attempts, and per-IP rate limiting. All implementation details are exposed via clickable GitHub links."

- **Production Thinking**: "I considered real-world attack vectors from OWASP and implemented defense-in-depth. The type system ensures proper error handling across the entire API surface."

## Testing

### Test Coverage

**File**: `src/components/ui/guardrail-feedback.test.tsx`

Tests cover:
- Component rendering for each guardrail type
- Severity badge variants
- Expandable details functionality
- GitHub link generation
- Context data display
- Fallback for missing guardrail details
- Accessibility attributes

**File**: `src/lib/input-sanitization.test.ts`

Tests cover:
- All prompt injection pattern categories
- Suspicious pattern detection
- Length validation (character and line limits)
- Scope enforcement (job description keywords)
- HTML sanitization
- Edge cases and boundary conditions

### Running Tests

```bash
# Run all tests
bun test

# Run specific test file
bun test guardrail-feedback.test.tsx

# Run with coverage
bun test --coverage
```

## Security Considerations

### What This Guards Against

✅ **Prompt Injection**: 30+ attack patterns blocked
✅ **Rate Limiting**: Per-IP throttling prevents abuse
✅ **Token Stuffing**: Length and line count limits
✅ **XSS Attempts**: Pattern matching and HTML sanitization
✅ **Scope Creep**: Content validation for expected use cases

### What This Doesn't Guard Against

❌ **DDoS**: Distributed attacks require infrastructure-level mitigation
❌ **Account Takeover**: No authentication system in this portfolio
❌ **Model Jailbreaking**: Advanced prompt engineering may bypass patterns
❌ **Business Logic Attacks**: Application-specific vulnerabilities

### Production Hardening

For production deployment, consider:

1. **Rate Limiting**: Move to Redis/distributed cache
2. **Monitoring**: Log security events to SIEM
3. **Pattern Updates**: Regularly update injection patterns
4. **WAF Integration**: Add CloudFlare or AWS WAF
5. **Content Security Policy**: Implement strict CSP headers
6. **Input Sanitization**: Use battle-tested libraries (DOMPurify, etc.)

## References

### Source Files

- **Type Definitions**: `src/types/guardrails.ts`
- **Validation Logic**: `src/lib/input-sanitization.ts`
- **UI Component**: `src/components/ui/guardrail-feedback.tsx`
- **API Implementation**: `src/app/api/chat/route.ts`, `src/app/api/fit-assessment/route.ts`
- **Tests**: `src/lib/input-sanitization.test.ts`, `src/components/ui/guardrail-feedback.test.tsx`

### Related Documentation

- [Security Documentation](../SECURITY.md) - General security practices
- [Architecture Overview](./00-ARCHITECTURE.md) - System architecture
- [Implementation Guide](./09-IMPLEMENTATION-GUIDE.md) - Development workflow

### External Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP AI Security](https://owasp.org/www-project-ai-security-and-privacy-guide/)
- [Prompt Injection Primer](https://simonwillison.net/2023/Apr/14/worst-that-can-happen/)
- [AI Security Best Practices](https://www.anthropic.com/index/prompt-injection)

---

**Last Updated**: 2024-02-04
**Status**: Production-ready
**Maintainer**: Ryan Lowe (@phyter1)
