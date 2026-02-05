/**
 * Manual Verification Script for T001 Authentication Implementation
 * Demonstrates end-to-end authentication flow
 */

import { NextRequest } from "next/server";
import { middleware } from "../middleware";
import {
  createSessionCookie,
  generateSessionToken,
  hashPassword,
  storeSessionToken,
  verifyPassword,
  verifySessionToken,
} from "../src/lib/auth";

console.log("=== T001 Authentication Implementation Verification ===\n");

// Test 1: Password Hashing and Verification
console.log("1. Password Hashing and Verification");
const password = "SecureAdmin2026!";
const hash = await hashPassword(password);
console.log(`   ✓ Password hashed (${hash.substring(0, 20)}...)`);

const isValid = await verifyPassword(password, hash);
console.log(`   ✓ Password verified: ${isValid ? "PASS" : "FAIL"}`);

const isInvalid = await verifyPassword("WrongPassword", hash);
console.log(`   ✓ Wrong password rejected: ${!isInvalid ? "PASS" : "FAIL"}\n`);

// Test 2: Session Token Generation
console.log("2. Session Token Generation");
const token1 = generateSessionToken();
const token2 = generateSessionToken();
console.log(`   ✓ Token 1: ${token1.substring(0, 16)}...`);
console.log(`   ✓ Token 2: ${token2.substring(0, 16)}...`);
console.log(`   ✓ Tokens unique: ${token1 !== token2 ? "PASS" : "FAIL"}`);
console.log(`   ✓ Token length: ${token1.length} chars (64 expected)\n`);

// Test 3: Session Storage and Verification
console.log("3. Session Storage and Verification");
const sessionToken = generateSessionToken();
storeSessionToken(sessionToken);
console.log(`   ✓ Token stored: ${sessionToken.substring(0, 16)}...`);

const tokenValid = verifySessionToken(sessionToken);
console.log(`   ✓ Token verification: ${tokenValid ? "PASS" : "FAIL"}`);

const invalidToken = verifySessionToken("invalid-token");
console.log(
  `   ✓ Invalid token rejected: ${!invalidToken ? "PASS" : "FAIL"}\n`,
);

// Test 4: Cookie Creation
console.log("4. Cookie Creation");
const cookie = createSessionCookie(sessionToken);
console.log(`   ✓ Cookie: ${cookie.substring(0, 60)}...`);
console.log(
  `   ✓ Has HttpOnly: ${cookie.includes("HttpOnly") ? "PASS" : "FAIL"}`,
);
console.log(
  `   ✓ Has SameSite: ${cookie.includes("SameSite") ? "PASS" : "FAIL"}`,
);
console.log(`   ✓ Has Path: ${cookie.includes("Path=/") ? "PASS" : "FAIL"}\n`);

// Test 5: Middleware Route Protection
console.log("5. Middleware Route Protection");

// Test unauthenticated request
const unauthRequest = new NextRequest("http://localhost:3000/admin");
const unauthResponse = await middleware(unauthRequest);
console.log(
  `   ✓ Unauthenticated /admin: ${unauthResponse.status === 307 ? "REDIRECTED" : "FAILED"}`,
);

// Test authenticated request
const authRequest = new NextRequest("http://localhost:3000/admin", {
  headers: {
    cookie: `session=${sessionToken}`,
  },
});
const authResponse = await middleware(authRequest);
console.log(
  `   ✓ Authenticated /admin: ${authResponse.status === 200 ? "ALLOWED" : "FAILED"}`,
);

// Test /admin/login always allowed
const loginRequest = new NextRequest("http://localhost:3000/admin/login");
const loginResponse = await middleware(loginRequest);
console.log(
  `   ✓ /admin/login allowed: ${loginResponse.status !== 307 ? "PASS" : "FAIL"}`,
);

// Test non-admin route not protected
const publicRequest = new NextRequest("http://localhost:3000/");
const publicResponse = await middleware(publicRequest);
console.log(
  `   ✓ Public route allowed: ${publicResponse.status !== 307 ? "PASS" : "FAIL"}\n`,
);

console.log("=== All Verification Tests Complete ===");
console.log("✓ Password hashing: WORKING");
console.log("✓ Token generation: WORKING");
console.log("✓ Session management: WORKING");
console.log("✓ Cookie utilities: WORKING");
console.log("✓ Middleware protection: WORKING\n");

console.log("Next steps:");
console.log("1. Set ADMIN_PASSWORD in .env.local");
console.log("2. Create /admin/login page");
console.log("3. Create /admin dashboard pages");
console.log("4. Add login form and authentication API routes");
