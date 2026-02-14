/**
 * Shared Authentication Mock Helpers for Admin API Route Tests
 *
 * This module provides standardized auth mocking following Vitest best practices.
 * Use these helpers to avoid common pitfalls with async auth mocks.
 */

import { vi } from "vitest";

/**
 * Creates a mock for verifySessionToken with configurable behavior
 *
 * Usage:
 * ```typescript
 * import { createAuthMock } from '@/__tests__/helpers/auth-mock';
 *
 * const { mockVerifySessionToken, mockAuth } = createAuthMock();
 *
 * vi.mock('@/lib/auth', () => ({
 *   verifySessionToken: mockVerifySessionToken,
 * }));
 *
 * // In tests:
 * mockAuth.setValid(true); // Allow auth
 * mockAuth.setValid(false); // Reject auth
 * mockAuth.reset(); // Reset to default (valid)
 * ```
 */
export function createAuthMock() {
  // Default: auth succeeds
  let isValid = true;

  const mockVerifySessionToken = vi.fn(async (_token: string) => {
    return isValid;
  });

  return {
    mockVerifySessionToken,
    mockAuth: {
      setValid: (valid: boolean) => {
        isValid = valid;
      },
      reset: () => {
        isValid = true;
        mockVerifySessionToken.mockClear();
      },
    },
  };
}

/**
 * Creates a Convex session storage mock with in-memory Map
 *
 * Usage:
 * ```typescript
 * import { createConvexSessionMock } from '@/__tests__/helpers/auth-mock';
 *
 * const { mockConvexClient, sessionMock } = createConvexSessionMock();
 *
 * vi.mock('convex/browser', () => ({
 *   ConvexHttpClient: mockConvexClient,
 * }));
 *
 * beforeEach(() => {
 *   sessionMock.reset();
 *   sessionMock.addSession('valid-token', Date.now() + 60000);
 * });
 * ```
 */
export function createConvexSessionMock() {
  const sessionStorage = new Map<string, { expiresAt: number }>();

  const mockQuery = vi.fn(async (_apiFunction: any, args: any) => {
    if (args?.token !== undefined) {
      const session = sessionStorage.get(args.token);
      if (!session) return { valid: false };
      return { valid: session.expiresAt > Date.now() };
    }
    return null;
  });

  const mockMutation = vi.fn(async (_apiFunction: any, args: any) => {
    if (args?.token && args?.expiresAt) {
      sessionStorage.set(args.token, { expiresAt: args.expiresAt });
      return { success: true };
    }
    return null;
  });

  class MockConvexHttpClient {
    query = mockQuery;
    mutation = mockMutation;
  }

  return {
    mockConvexClient: MockConvexHttpClient,
    sessionMock: {
      addSession: (token: string, expiresAt: number) => {
        sessionStorage.set(token, { expiresAt });
      },
      removeSession: (token: string) => {
        sessionStorage.delete(token);
      },
      clear: () => {
        sessionStorage.clear();
      },
      reset: () => {
        sessionStorage.clear();
        mockQuery.mockClear();
        mockMutation.mockClear();
      },
      hasSession: (token: string) => {
        return sessionStorage.has(token);
      },
    },
  };
}

/**
 * Helper to create a NextRequest with cookie header
 *
 * Usage:
 * ```typescript
 * const request = createRequestWithAuth(
 *   'http://localhost:3000/api/admin/blog/create',
 *   'POST',
 *   { title: 'Test' },
 *   'valid-session-token'
 * );
 * ```
 */
export function createRequestWithAuth(
  url: string,
  method: string,
  body?: unknown,
  sessionToken?: string,
): Request {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (sessionToken) {
    headers.cookie = `session=${sessionToken}`;
  }

  return new Request(url, {
    method,
    headers,
    ...(body && { body: JSON.stringify(body) }),
  });
}
