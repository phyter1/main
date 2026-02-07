#!/usr/bin/env bun
/**
 * Password Hashing Utility
 * Generates PBKDF2 hash for admin password
 * Usage: bun run scripts/hash-password.ts "YourPassword123!"
 */

import { hashPassword } from "../src/lib/auth";

const password = process.argv[2];

if (!password) {
  console.error("❌ Error: Password required");
  console.error("\nUsage: bun run scripts/hash-password.ts <password>");
  console.error('Example: bun run scripts/hash-password.ts "MySecurePass123!"');
  process.exit(1);
}

console.log("🔐 Hashing password...\n");

const hash = await hashPassword(password);

console.log("✅ Hash generated successfully!\n");
console.log("Add this to your .env.local file:");
console.log("─".repeat(60));
console.log(`ADMIN_PASSWORD_HASH=${hash}`);
console.log("─".repeat(60));
console.log("\n⚠️  IMPORTANT:");
console.log("1. Remove the ADMIN_PASSWORD line from .env.local");
console.log("2. Add the ADMIN_PASSWORD_HASH line above");
console.log("3. Set the same hash in your production environment");
console.log("4. Never commit .env.local to git!");
