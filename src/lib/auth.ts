/**
 * Authentication Utilities for Admin Access
 * Provides password hashing, session token management, and cookie utilities
 */

import { pbkdf2, randomBytes } from "node:crypto";
import { promisify } from "node:util";

const pbkdf2Async = promisify(pbkdf2);

/**
 * Configuration constants
 */
const PBKDF2_ITERATIONS = 100000;
const PBKDF2_KEYLEN = 64;
const PBKDF2_DIGEST = "sha512";
const SALT_LENGTH = 16;
const SESSION_TOKEN_LENGTH = 32;
const SESSION_DURATION_DAYS = 7;
const SESSION_DURATION_MS = SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000;

/**
 * Session storage (in-memory for now)
 * In production, this should use Redis or a database
 */
interface SessionToken {
  token: string;
  expiresAt: number;
}

const activeSessions = new Map<string, SessionToken>();

/**
 * Hash a password using PBKDF2 with random salt
 * @param password - Plain text password to hash
 * @returns Promise resolving to hash in format: salt:hash
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH);
  const hash = await pbkdf2Async(
    password,
    salt,
    PBKDF2_ITERATIONS,
    PBKDF2_KEYLEN,
    PBKDF2_DIGEST,
  );

  return `${salt.toString("hex")}:${hash.toString("hex")}`;
}

/**
 * Verify a password against a hash
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

  const salt = Buffer.from(saltHex, "hex");
  const hash = await pbkdf2Async(
    password,
    salt,
    PBKDF2_ITERATIONS,
    PBKDF2_KEYLEN,
    PBKDF2_DIGEST,
  );

  const storedHashBuffer = Buffer.from(hashHex, "hex");
  return hash.equals(storedHashBuffer);
}

/**
 * Generate a cryptographically secure session token
 * @returns Random hex string of SESSION_TOKEN_LENGTH bytes
 */
export function generateSessionToken(): string {
  return randomBytes(SESSION_TOKEN_LENGTH).toString("hex");
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
    "SameSite=Lax",
    "Path=/",
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
export function storeSessionToken(token: string, expiresAt?: number): void {
  const expiration = expiresAt ?? Date.now() + SESSION_DURATION_MS;
  activeSessions.set(token, { token, expiresAt: expiration });

  // Clean up expired tokens
  cleanupExpiredSessions();
}

/**
 * Verify if a session token is valid and not expired
 * @param token - Session token to verify
 * @returns True if token is valid and not expired
 */
export function verifySessionToken(token: string): boolean {
  cleanupExpiredSessions();

  const session = activeSessions.get(token);
  if (!session) {
    return false;
  }

  if (session.expiresAt < Date.now()) {
    activeSessions.delete(token);
    return false;
  }

  return true;
}

/**
 * Invalidate a session token (logout)
 * @param token - Session token to invalidate
 */
export function invalidateSessionToken(token: string): void {
  activeSessions.delete(token);
}

/**
 * Clean up expired session tokens from storage
 */
function cleanupExpiredSessions(): void {
  const now = Date.now();
  for (const [token, session] of activeSessions.entries()) {
    if (session.expiresAt < now) {
      activeSessions.delete(token);
    }
  }
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
 * Type exports for use in middleware and routes
 */
export type { SessionToken };
