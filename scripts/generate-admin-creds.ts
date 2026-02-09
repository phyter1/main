/**
 * Generate Admin Credentials
 * Creates secure password and session secret for admin authentication
 */

import { hashPassword } from "../src/lib/auth";

/**
 * Generate a cryptographically secure random password
 */
function generateSecurePassword(): string {
  const length = 24;
  const charset = {
    uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    lowercase: "abcdefghijklmnopqrstuvwxyz",
    numbers: "0123456789",
    symbols: "!@#$%^&*()-_=+[]{}",
  };

  const allChars =
    charset.uppercase + charset.lowercase + charset.numbers + charset.symbols;

  // Ensure at least one character from each category
  let password = "";
  password +=
    charset.uppercase[Math.floor(Math.random() * charset.uppercase.length)];
  password +=
    charset.lowercase[Math.floor(Math.random() * charset.lowercase.length)];
  password +=
    charset.numbers[Math.floor(Math.random() * charset.numbers.length)];
  password +=
    charset.symbols[Math.floor(Math.random() * charset.symbols.length)];

  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle the password to randomize character positions
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}

/**
 * Generate a session secret
 */
function generateSessionSecret(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(48));
  return Buffer.from(bytes).toString("base64");
}

async function main() {
  console.log("🔐 Generating Admin Credentials\n");

  // Generate password
  const password = generateSecurePassword();
  console.log("Generated Password:");
  console.log(`  ${password}\n`);

  // Hash password
  const passwordHash = await hashPassword(password);
  console.log("Password Hash (PBKDF2):");
  console.log(`  ${passwordHash}\n`);

  // Generate session secret
  const sessionSecret = generateSessionSecret();
  console.log("Session Secret:");
  console.log(`  ${sessionSecret}\n`);

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Vercel Environment Variables:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  console.log(`ADMIN_PASSWORD=${password}`);
  console.log(`ADMIN_PASSWORD_HASH=${passwordHash}`);
  console.log(`ADMIN_SESSION_SECRET=${sessionSecret}\n`);

  console.log("⚠️  IMPORTANT: Store the plaintext password securely!");
  console.log("   You'll need it to log into the admin panel.\n");
}

main().catch(console.error);
