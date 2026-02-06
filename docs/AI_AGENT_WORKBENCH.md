interface Metrics {
  passRate: number;           // Percentage of tests passed
  avgTokens: number;          // Average tokens per response
  avgLatency: number;         // Average response time (ms)
  totalTests: number;         // Number of tests executed
  totalPassed: number;        // Number of tests passed
  totalFailed: number;        // Number of tests failed
  criteriaBreakdown: {
    [criterionType: string]: {
      passed: number;
      failed: number;
      passRate: number;
    };
  };
}
```

### Workflows

#### Prompt Refinement Workflow

1. **Navigate to Chat Agent Tab**
   - Access `/admin/agent-workbench`
   - Select "Chat Agent" tab
   - View current active prompt

2. **Describe Desired Changes**
   ```typescript
   // Example refinement requests:
   "Make the agent more conversational and use a friendly tone"
   "Add capability to discuss specific technologies in depth"
   "Improve how the agent structures responses with better formatting"
   "Make responses more concise while maintaining key information"
   ```

3. **Review Generated Diff**
   - AI generates refined prompt
   - View side-by-side diff showing changes
   - Read AI's reasoning for modifications
   - Check token count impact

4. **Test Refinement**
   - Run existing test suite against new prompt
   - View side-by-side comparison with current prompt
   - Check pass rate and performance metrics
   - Review individual test results

5. **Apply Changes**
   - If satisfied with test results, click "Apply"
   - Changes staged but not yet deployed
   - Can continue iterating with more refinements

6. **Deploy New Version**
   - Click "Deploy" to activate refined prompt
   - Enter version description and change notes
   - New semantic version created automatically
   - Old version deactivated, remains in history
   - Git commit created for audit trail

#### Resume Update Workflow

1. **Navigate to Resume Data Tab**
   - Access `/admin/agent-workbench`
   - Select "Resume Data" tab
   - View current resume structure

2. **Describe Addition**
   ```typescript
   // Example update requests:
   "Add new position: Senior Engineering Lead at TechCorp,
   started January 2026, focusing on AI integration and
   building high-performance teams"

   "Add skill: PostgreSQL with expert proficiency level"

   "Update principle: Add 'AI-First Development' principle
   about using AI tools to enhance productivity"
   ```

3. **Review Preview**
   - AI generates structured resume data
   - View formatted preview of changes
   - Check JSON structure and formatting
   - Validate all required fields present

4. **Apply Update**
   - Click "Apply" to update `src/data/resume.ts`
   - File modified with proper TypeScript formatting
   - Changes immediately reflected in application
   - Git commit created with update details

#### Testing Workflow

1. **Navigate to Test Suite Tab**
   - Access `/admin/agent-workbench`
   - Select "Test Suite" tab
   - View existing test cases

2. **Add Test Cases**
   ```typescript
   {
     name: "React Experience Query",
     category: "Technical Questions",
     question: "What experience does Ryan have with React?",
     criteria: [
       {
         type: "contains",
         value: "React",
         message: "Must mention React"
       },
       {
         type: "first-person",
         expected: false,
         message: "Should use third person"
       },
       {
         type: "max-length",
         value: 500,
         message: "Keep response concise"
       }
     ],
     priority: "high"
   }
   ```

3. **Run Tests**
   - Select test cases to execute
   - Choose prompt to test (current or modified)
   - Click "Run Tests"
   - View real-time progress

4. **Review Results**
   - See pass/fail status for each test
   - View detailed criterion results
   - Check aggregate metrics
   - Identify failing tests for improvement

#### Rollback Workflow

1. **Navigate to History Page**
   - Access `/admin/agent-workbench/history`
   - View chronological version list
   - See active version highlighted

2. **Select Version**
   - Click on version to view details
   - Read version description and changes
   - Check when deployed and by whom
   - View test results from deployment

3. **View Diff**
   - Click "Compare with Active"
   - See side-by-side diff of prompts
   - Review what would change with rollback
   - Check token count differences

4. **Rollback**
   - Click "Rollback to This Version"
   - Confirm rollback action
   - Selected version becomes active
   - Git commit created documenting rollback
   - Previous active version remains in history

### Security Best Practices

#### Authentication and Session Security

**Rate Limiting:**
- Default: 5 requests per minute per IP for admin API routes
- Applies to all `/api/admin/*` endpoints
- Prevents brute force password attacks
- Configurable via `ADMIN_MAX_REQUESTS_PER_MINUTE` environment variable

**Session Management:**
- Sessions encrypted using `ADMIN_SESSION_SECRET`
- Default expiration: 7 days of inactivity
- Sessions invalidated on logout
- Secure cookie flags in production (httpOnly, secure, sameSite)

**Password Security:**
- Minimum 16 characters recommended
- Mixed case letters, numbers, and symbols
- Hashed using bcrypt before comparison
- Rotate every 90 days

#### Audit Trail via Git Commits

All prompt deployments and rollbacks create git commits for complete audit trail:

```bash
# Deployment commit
feat(workbench): deploy chat prompt v1.2.0

Changes:
- Made agent more conversational and friendly
- Enhanced context usage patterns
- Improved error handling instructions

Deployed by: admin
Timestamp: 2026-02-04T19:30:00Z

# Rollback commit
fix(workbench): rollback chat prompt to v1.1.0

Reason: v1.2.0 showed decreased pass rate in testing
Rolled back by: admin
Timestamp: 2026-02-04T20:15:00Z
```

**Audit Benefits:**
- Complete history of all prompt changes
- Easy to identify who changed what and when
- Rollback capability through git history
- Integration with CI/CD pipelines
- Compliance and accountability

#### Prompt Injection Prevention

The refinement request system includes protections against prompt injection attacks:

**Input Validation:**
```typescript
// Validate refinement requests
function validateRefinementRequest(request: string): void {
  // Check length limits
  if (request.length > 5000) {
    throw new Error("Refinement request too long");
  }

  // Detect injection patterns
  const injectionPatterns = [
    /ignore (previous|all) instructions/i,
    /disregard (previous|all) (instructions|rules)/i,
    /you are now/i,
    /new instructions:/i,
    /system:/i,
    /\[INST\]/i,
    /<\|.*?\|>/
  ];

  for (const pattern of injectionPatterns) {
    if (pattern.test(request)) {
      throw new Error("Invalid refinement request detected");
    }
  }
}
```

**Sanitization:**
- Strip potentially malicious formatting
- Limit special characters
- Validate against known injection patterns
- Log suspicious requests for review

**Sandboxing:**
- Refinement runs in controlled context
- Cannot access sensitive environment variables
- Limited to prompt generation only
- Cannot execute arbitrary code

#### API Security

**Authentication Required:**
All admin API routes require valid session:
```typescript
// Middleware checks session before processing
export async function middleware(request: Request) {
  const session = await getSession(request);

  if (!session?.authenticated) {
    return Response.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  return NextResponse.next();
}
```

**Rate Limiting by Route:**
```typescript
// Different limits for different routes
const rateLimits = {
  "/api/admin/login": 5,           // 5/min - prevent brute force
  "/api/admin/refine-prompt": 10,  // 10/min - expensive AI calls
  "/api/admin/test-prompt": 5,     // 5/min - very expensive
  "/api/admin/deploy-prompt": 20,  // 20/min - cheap operations
  "/api/admin/update-resume": 10   // 10/min - moderate cost
};
```

**Input Validation:**
- All inputs validated with Zod schemas
- Type-safe request/response handling
- Explicit validation of required fields
- Length limits on all text inputs

### Development Guidelines

#### Project Structure

All admin workbench components follow consistent organization:

```
src/
├── components/
│   └── admin/
│       ├── workbench/
│       │   ├── ChatAgentTab.tsx        # Chat agent refinement interface
│       │   ├── ResumeDataTab.tsx       # Resume update interface
│       │   ├── TestSuiteTab.tsx        # Test management interface
│       │   ├── SettingsTab.tsx         # Workbench settings
│       │   ├── PromptDiff.tsx          # Diff viewer component
│       │   ├── TestResults.tsx         # Test results display
│       │   └── VersionHistory.tsx      # Version history list
│       ├── auth/
│       │   ├── LoginForm.tsx           # Admin login form
│       │   └── SessionProvider.tsx     # Session context
│       └── layout/
│           ├── AdminLayout.tsx         # Admin page layout
│           └── AdminNav.tsx            # Admin navigation
├── app/
│   ├── admin/
│   │   ├── agent-workbench/
│   │   │   ├── page.tsx                # Main workbench page
│   │   │   └── history/
│   │   │       └── page.tsx            # History viewer page
│   │   ├── login/
│   │   │   └── page.tsx                # Login page
│   │   └── layout.tsx                  # Admin section layout
│   └── api/
│       └── admin/
│           ├── login/
│           │   └── route.ts            # Login endpoint
│           ├── logout/
│           │   └── route.ts            # Logout endpoint
│           ├── refine-prompt/
│           │   └── route.ts            # Prompt refinement
│           ├── test-prompt/
│           │   └── route.ts            # Test execution
│           ├── deploy-prompt/
│           │   └── route.ts            # Version deployment
│           ├── prompt-history/
│           │   └── route.ts            # History retrieval
│           └── update-resume/
│               └── route.ts            # Resume updates
└── lib/
    └── admin/
        ├── prompt-versioning.ts        # Version management functions
        ├── test-runner.ts              # Test execution engine
        ├── session.ts                  # Session management
        └── validation.ts               # Input validation
```

#### Component Patterns

**Admin Components:**
All admin components use consistent patterns:

```typescript
// Example: ChatAgentTab.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { PromptDiff } from './PromptDiff';

export function ChatAgentTab() {
  const [currentPrompt, setCurrentPrompt] = useState<string>('');
  const [refinementRequest, setRefinementRequest] = useState<string>('');
  const [refinedPrompt, setRefinedPrompt] = useState<string | null>(null);
  const [isRefining, setIsRefining] = useState(false);

  const handleRefine = async () => {
    setIsRefining(true);
    try {
      const response = await fetch('/api/admin/refine-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentType: 'chat',
          currentPrompt,
          refinementRequest
        })
      });

      const data = await response.json();
      setRefinedPrompt(data.refinedPrompt);
    } catch (error) {
      console.error('Refinement failed:', error);
    } finally {
      setIsRefining(false);
    }
  };

  return (
    <div className="space-y-4">
      <Textarea
        value={refinementRequest}
        onChange={(e) => setRefinementRequest(e.target.value)}
        placeholder="Describe how you want to refine the prompt..."
        rows={4}
      />

      <Button onClick={handleRefine} disabled={isRefining}>
        {isRefining ? 'Refining...' : 'Refine Prompt'}
      </Button>

      {refinedPrompt && (
        <PromptDiff
          original={currentPrompt}
          modified={refinedPrompt}
        />
      )}
    </div>
  );
}
```

#### Testing Patterns

**Mocking AI SDK for Tests:**

```typescript
import { describe, it, expect, mock, beforeEach } from 'bun:test';

// Mock AI SDK for predictable testing
const mockGenerateText = mock(() => ({
  text: "Refined prompt with improvements"
}));

mock.module('ai', () => ({
  generateText: mockGenerateText,
  generateObject: mock(() => ({
    object: { /* mock object */ }
  }))
}));

describe('Prompt Refinement API', () => {
  beforeEach(() => {
    mock.restore();
  });

  it('should refine prompt based on request', async () => {
    const response = await fetch('/api/admin/refine-prompt', {
      method: 'POST',
      body: JSON.stringify({
        agentType: 'chat',
        currentPrompt: 'Original prompt',
        refinementRequest: 'Make it more friendly'
      })
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.refinedPrompt).toBeDefined();
    expect(mockGenerateText).toHaveBeenCalledTimes(1);
  });
});
```

#### shadcn/ui Component Usage

All admin UI uses shadcn/ui components with the new-york style:

```typescript
// Common components used in admin interfaces
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
```

**Example Usage:**
```typescript
<Card>
  <CardHeader>
    <CardTitle>Prompt Refinement</CardTitle>
    <CardDescription>
      Describe changes to refine the agent prompt
    </CardDescription>
  </CardHeader>
  <CardContent>
    <Textarea placeholder="Enter refinement request..." />
    <Button className="mt-4">Refine</Button>
  </CardContent>
</Card>
```

#### API Route Patterns

All admin API routes follow consistent patterns:

```typescript
// Example: src/app/api/admin/refine-prompt/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateText } from 'ai';
import { createAnthropicClient } from '@/lib/ai-config';
import { validateSession } from '@/lib/admin/session';
import { validateRefinementRequest } from '@/lib/admin/validation';

// Request schema
const RequestSchema = z.object({
  agentType: z.enum(['chat', 'assessment', 'custom']),
  currentPrompt: z.string().min(10).max(10000),
  refinementRequest: z.string().min(10).max(5000),
  context: z.string().optional()
});

export async function POST(request: NextRequest) {
  try {
    // Validate session
    const session = await validateSession(request);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse and validate request
    const body = await request.json();
    const validated = RequestSchema.parse(body);

    // Additional validation
    validateRefinementRequest(validated.refinementRequest);

    // Generate refined prompt
    const model = createAnthropicClient('CHAT');
    const result = await generateText({
      model,
      system: `You are a prompt engineering expert...`,
      prompt: `Current prompt: ${validated.currentPrompt}\n\nRefinement request: ${validated.refinementRequest}`
    });

    // Return result
    return NextResponse.json({
      refinedPrompt: result.text,
      changes: extractChanges(result.text),
      reasoning: extractReasoning(result.text),
      tokenCount: countTokens(result.text)
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Refinement error:', error);
    return NextResponse.json(
      { error: 'Refinement failed' },
      { status: 500 }
    );
  }
}
```

#### Best Practices

**Component Development:**
- Keep components focused and single-purpose
- Use TypeScript for full type safety
- Implement proper loading and error states
- Follow React Server Component patterns where applicable
- Use shadcn/ui components consistently

**API Development:**
- Always validate session authentication
- Use Zod for request validation
- Implement proper error handling with specific messages
- Return appropriate HTTP status codes
- Log errors server-side for debugging

**Testing:**
- Mock AI SDK calls for predictable tests
- Test authentication and authorization
- Test input validation (valid and invalid inputs)
- Test error scenarios (rate limits, invalid sessions)
- Use Bun test framework with descriptive test names

**Security:**
- Never expose API keys or sensitive data
- Validate all user inputs
- Implement rate limiting on all endpoints
- Use secure session management
- Log security-relevant events

**Git Workflow:**
- Commit prompt deployments with descriptive messages
- Document rollbacks with reasons
- Use conventional commit format
- Include admin actions in commit messages

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
