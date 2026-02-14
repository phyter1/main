# Authentication Mocking Guide for Admin API Tests

## The Problem

Many admin API route tests are failing with 401 Unauthorized errors because:
1. They don't mock `verifySessionToken` from `@/lib/auth`
2. Or they mock it incorrectly (wrong approach for how the route actually works)

## Quick Fix Patterns

### Pattern A: Simple Direct Mock (Recommended)

**Use when:** Route calls `verifySessionToken()` directly from `@/lib/auth`

**Files to fix:** Most admin blog API routes

```typescript
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createAuthMock, createRequestWithAuth } from '@/__tests__/helpers/auth-mock';

// Create auth mock BEFORE any imports
const { mockVerifySessionToken, mockAuth } = createAuthMock();

vi.mock('@/lib/auth', () => ({
  verifySessionToken: mockVerifySessionToken,
}));

// Mock other dependencies
vi.mock('convex/nextjs', () => ({
  fetchMutation: vi.fn(() => Promise.resolve('test-id-123')),
}));

// NOW import the route
import { POST } from './route';
import { fetchMutation } from 'convex/nextjs';

describe('POST /api/admin/blog/create', () => {
  beforeEach(() => {
    mockAuth.reset(); // Reset to valid auth
    vi.clearAllMocks();
  });

  it('should create post with valid auth', async () => {
    const request = createRequestWithAuth(
      'http://localhost:3000/api/admin/blog/create',
      'POST',
      { title: 'Test', slug: 'test', /* ... */ },
      'valid-session-token'
    );

    const response = await POST(request as any);
    expect(response.status).toBe(201);
  });

  it('should return 401 with invalid auth', async () => {
    mockAuth.setValid(false); // Override for this test

    const request = createRequestWithAuth(
      'http://localhost:3000/api/admin/blog/create',
      'POST',
      { title: 'Test' },
      'invalid-token'
    );

    const response = await POST(request as any);
    expect(response.status).toBe(401);
  });
});
```

### Pattern B: Convex Session Mock (Advanced)

**Use when:** Route uses Convex session verification directly

**Files to fix:** Routes that manage sessions or have complex auth flows

```typescript
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createConvexSessionMock } from '@/__tests__/helpers/auth-mock';

// Create Convex session mock
const { mockConvexClient, sessionMock } = createConvexSessionMock();

vi.mock('convex/browser', () => ({
  ConvexHttpClient: mockConvexClient,
}));

vi.mock('convex/nextjs', () => ({
  fetchMutation: vi.fn(() => Promise.resolve('test-id')),
}));

import { POST } from './route';

describe('POST /api/admin/blog/publish', () => {
  beforeEach(async () => {
    // CRITICAL: Reset modules to clear ConvexHttpClient singleton
    vi.resetModules();

    sessionMock.reset();

    // Add valid session
    sessionMock.addSession('valid-token', Date.now() + 60000);

    // Re-import to get fresh mocked version
    const module = await import('./route');
    POST = module.POST;
  });

  it('should publish with valid session', async () => {
    const request = new Request(url, {
      method: 'POST',
      headers: { cookie: 'session=valid-token' },
      body: JSON.stringify({ postId: '123' })
    });

    const response = await POST(request as any);
    expect(response.status).toBe(200);
  });
});
```

## Files That Need Fixing

### Simple Direct Mock (Pattern A):
1. `src/app/api/admin/blog/create/route.test.ts` - Missing `@/lib/auth` mock
2. `src/app/api/admin/blog/[id]/route.test.ts` - Missing DELETE/PATCH imports + auth mock
3. `src/app/api/admin/blog/upload/route.test.ts` - Currently has auth mock but may need fixing
4. `src/app/api/admin/blog/delete-image/route.test.ts` - Similar to upload
5. `src/app/api/admin/blog/publish/route.test.ts` - May need pattern B
6. `src/app/api/admin/blog/categories/[id]/route.test.ts` - Missing DELETE import + auth

### Convex Session Mock (Pattern B):
- May not be needed if Pattern A works!

## Step-by-Step Fix Process

### For Pattern A (Simple Mock):

1. **Add helper imports at top:**
   ```typescript
   import { createAuthMock, createRequestWithAuth } from '@/__tests__/helpers/auth-mock';
   ```

2. **Create mock BEFORE other imports:**
   ```typescript
   const { mockVerifySessionToken, mockAuth } = createAuthMock();

   vi.mock('@/lib/auth', () => ({
     verifySessionToken: mockVerifySessionToken,
   }));
   ```

3. **Add reset in beforeEach:**
   ```typescript
   beforeEach(() => {
     mockAuth.reset();
     vi.clearAllMocks();
   });
   ```

4. **Update request creation:**
   ```typescript
   const request = createRequestWithAuth(url, 'POST', body, 'valid-token');
   ```

5. **Add 401 test:**
   ```typescript
   it('should return 401 with invalid auth', async () => {
     mockAuth.setValid(false);
     const request = createRequestWithAuth(url, 'POST', body, 'invalid');
     const response = await POST(request as any);
     expect(response.status).toBe(401);
   });
   ```

## Common Gotchas

1. **Import order matters:** Create mocks BEFORE importing the route
2. **Use `mockAuth.reset()` in beforeEach:** Prevents test pollution
3. **Session token in cookie header:** Use `createRequestWithAuth()` helper
4. **Missing DELETE/PATCH imports:** Check if route exports these and import them
5. **Type assertion:** May need `as any` for Request types in some routes

## Testing the Fix

After applying the pattern:

```bash
# Test one file
bunx vitest run src/app/api/admin/blog/create/route.test.ts

# Test all admin API routes
bunx vitest run src/app/api/admin/
```

All tests should pass with proper auth mocking! 🎯
