/**
 * Authentication Utilities for Admin Access
 * Provides password hashing, session token management, and cookie utilities
 * Uses Web Crypto API for Edge Runtime compatibility
 * Uses Convex for persistent session storage
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";

/**
 * Configuration constants
 */
const PBKDF2_ITERATIONS = 100000;
const PBKDF2_KEYLEN = 64;
const SALT_LENGTH = 16;
const SESSION_TOKEN_LENGTH = 32;
const SESSION_DURATION_DAYS = 7;
const SESSION_DURATION_MS = SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000;

/**
 * Session storage interface
 */
interface SessionToken {
  token: string;
  expiresAt: number;
}

/**
 * Convex client for session operations
 */
let convexClient: ConvexHttpClient | null = null;

function getConvexClient(): ConvexHttpClient {
  if (!convexClient) {
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      throw new Error("NEXT_PUBLIC_CONVEX_URL is not set");
    }
    convexClient = new ConvexHttpClient(convexUrl);
  }
  return convexClient;
}

/**
 * Test helper to clear all sessions
 * @internal - Only for use in tests
 */
export const __testing__ = {
  clearSessions: async () => {
    // In tests, we'll need to clear Convex sessions differently
    // For now, this is a placeholder
  },
  addSession: async (token: string, expiresAt: number) => {
    const client = getConvexClient();
    await client.mutation(api.sessions.storeSession, { token, expiresAt });
  },
};

/**
 * Hash a password using PBKDF2 with random salt (Web Crypto API)
 * @param password - Plain text password to hash
 * @returns Promise resolving to hash in format: salt:hash
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const hash = await derivePBKDF2(password, salt);

  return `${arrayToHex(salt)}:${arrayToHex(hash)}`;
}

/**
 * Verify a password against a hash (Web Crypto API)
 * @param password - Plain text password to verify
 * @param storedHash - Hash in format: salt:hash
 * @returns Promise resolving to true if password matches
 */
export async function verifyPassword(
  password: string,
  storedHash: string,
): Promise<boolean> {
  if (!password || !storedHash) {
    return false;
  }

  const [saltHex, hashHex] = storedHash.split(":");
  if (!saltHex || !hashHex) {
    return false;
  }

  const salt = hexToArray(saltHex);
  const hash = await derivePBKDF2(password, salt);
  const storedHashArray = hexToArray(hashHex);

  return constantTimeEqual(hash, storedHashArray);
}

/**
 * Generate a cryptographically secure session token (Web Crypto API)
 * @returns Random hex string of SESSION_TOKEN_LENGTH bytes
 */
export function generateSessionToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(SESSION_TOKEN_LENGTH));
  return arrayToHex(bytes);
}

/**
 * Create a session cookie string with security flags
 * @param token - Session token value
 * @returns Cookie string with security flags
 */
export function createSessionCookie(token: string): string {
  const maxAge = SESSION_DURATION_DAYS * 24 * 60 * 60; // 7 days in seconds
  const isProduction = process.env.NODE_ENV === "production";

  const cookieParts = [
    `session=${token}`,
    "HttpOnly",
    "SameSite=Strict", // Strict for better CSRF protection
    "Path=/", // Available to all routes (needed for /api/admin/* endpoints)
    `Max-Age=${maxAge}`,
  ];

  if (isProduction) {
    cookieParts.push("Secure");
  }

  return cookieParts.join("; ");
}

/**
 * Create a cookie string that clears the session cookie
 * @returns Cookie string that expires the session
 */
export function clearSessionCookie(): string {
  return "session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0";
}

/**
 * Store a session token with expiration
 * @param token - Session token to store
 * @param expiresAt - Optional custom expiration timestamp (defaults to 7 days)
 */
export async function storeSessionToken(
  token: string,
  expiresAt?: number,
): Promise<void> {
  const expiration = expiresAt ?? Date.now() + SESSION_DURATION_MS;
  const client = getConvexClient();
  await client.mutation(api.sessions.storeSession, {
    token,
    expiresAt: expiration,
  });
}

/**
 * Verify if a session token is valid and not expired
 * @param token - Session token to verify
 * @returns Promise resolving to true if token is valid and not expired
 */
export async function verifySessionToken(token: string): Promise<boolean> {
  const client = getConvexClient();
  const result = await client.query(api.sessions.verifySession, { token });
  return result.valid;
}

/**
 * Invalidate a session token (logout)
 * @param token - Session token to invalidate
 */
export async function invalidateSessionToken(token: string): Promise<void> {
  const client = getConvexClient();
  await client.mutation(api.sessions.invalidateSession, { token });
}

/**
 * Clean up expired session tokens from storage
 */
async function _cleanupExpiredSessions(): Promise<void> {
  const client = getConvexClient();
  await client.mutation(api.sessions.cleanupExpiredSessions, {});
}

/**
 * Validate authentication configuration
 * @throws Error if required environment variables are missing or invalid
 */
export function validateAuthConfig(): void {
  const adminPassword = process.env.ADMIN_PASSWORD;
  const isProduction = process.env.NODE_ENV === "production";

  // In production, ADMIN_PASSWORD is required
  if (isProduction && !adminPassword) {
    throw new Error(
      "Missing required environment variable: ADMIN_PASSWORD is required in production",
    );
  }

  // Reject placeholder values
  if (adminPassword === "your_password_here") {
    throw new Error(
      "ADMIN_PASSWORD cannot be placeholder value 'your_password_here'",
    );
  }

  // In development, warn if ADMIN_PASSWORD is not set
  if (!isProduction && !adminPassword) {
    console.warn(
      "Warning: ADMIN_PASSWORD not set. Admin authentication will not work.",
    );
  }
}

/**
 * Verify admin password against environment variable
 * @param password - Password to verify
 * @returns Promise resolving to true if password matches ADMIN_PASSWORD
 */
export async function verifyAdminPassword(password: string): Promise<boolean> {
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
  if (!adminPasswordHash) {
    // If no hash is stored, check plain text env var (development only)
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      return false;
    }
    // In development, allow plain text comparison
    // In production, should always use hash
    if (process.env.NODE_ENV !== "production") {
      return password === adminPassword;
    }
    return false;
  }

  return verifyPassword(password, adminPasswordHash);
}

/**
 * Auth configuration object for validation and access
 */
export const authConfig = {
  validate: validateAuthConfig,
  get adminPassword(): string | undefined {
    return process.env.ADMIN_PASSWORD;
  },
  get sessionDurationMs(): number {
    return SESSION_DURATION_MS;
  },
  get sessionDurationDays(): number {
    return SESSION_DURATION_DAYS;
  },
};

/**
 * Helper: Derive PBKDF2 key using Web Crypto API
 * @param password - Password string
 * @param salt - Salt as Uint8Array
 * @returns Promise resolving to derived key as Uint8Array
 */
async function derivePBKDF2(
  password: string,
  salt: Uint8Array,
): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    passwordBuffer,
    { name: "PBKDF2" },
    false,
    ["deriveBits"],
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-512",
    },
    keyMaterial,
    PBKDF2_KEYLEN * 8, // bits
  );

  return new Uint8Array(derivedBits);
}

/**
 * Helper: Convert Uint8Array to hex string
 * @param array - Byte array
 * @returns Hex string
 */
function arrayToHex(array: Uint8Array): string {
  return Array.from(array)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Helper: Convert hex string to Uint8Array
 * @param hex - Hex string
 * @returns Byte array
 */
function hexToArray(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = Number.parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

/**
 * Helper: Constant-time equality comparison
 * @param a - First array
 * @param b - Second array
 * @returns True if arrays are equal
 */
function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a[i] ^ b[i];
  }

  return result === 0;
}

/**
 * Type exports for use in middleware and routes
 */
export type { SessionToken };
