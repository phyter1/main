# 🚨 CRITICAL SECURITY FIXES REQUIRED BEFORE PRODUCTION

## Status: **DO NOT DEPLOY** until these fixes are complete

---

## 1. FIX PASSWORD STORAGE (CRITICAL)

### Current Problem
Your `.env.local` contains:
```bash
ADMIN_PASSWORD="R3@llyStr0ngP@ssw0rd!2026"
```

The code expects `ADMIN_PASSWORD_HASH` but you're using plaintext.

### Fix Steps

1. **Generate password hash:**
   ```bash
   bun run scripts/hash-password.ts "R3@llyStr0ngP@ssw0rd!2026"
   ```

2. **Update `.env.local`:**
   - Remove the line: `ADMIN_PASSWORD="R3@llyStr0ngP@ssw0rd!2026"`
   - Add the generated hash: `ADMIN_PASSWORD_HASH=<hash from step 1>`

3. **Test it works:**
   - Restart dev server
   - Try logging in with your password
   - Should work with the hash

4. **Update production environment:**
   - Set `ADMIN_PASSWORD_HASH` in Vercel/your hosting platform
   - Do NOT set `ADMIN_PASSWORD`

---

## 2. ROTATE ALL EXPOSED CREDENTIALS (CRITICAL)

### Your `.env.local` contains REAL production credentials:

```bash
# These are REAL keys that need to be rotated:
OPENAI_API_KEY=sk-proj-W-Z0Rz9pSJMl618WtdKbceiIBw4...
CONVEX_DEPLOY_KEY=prod:secret-lemming-168|eyJ2MiI6IjFh...
ADMIN_SESSION_SECRET=/WzNvRFS54DiDKq+OTmwRkm+9/UAqUze5WG...
```

### Immediate Actions Required

1. **OpenAI API Key**
   - Go to: https://platform.openai.com/api-keys
   - Delete key: `sk-proj-W-Z0Rz9pSJMl618...`
   - Generate new key
   - Update `.env.local` and production

2. **Convex Deploy Key**
   - Go to: https://dashboard.convex.dev
   - Regenerate deployment key
   - Update `.env.local` and production

3. **Session Secret**
   ```bash
   # Generate new secret:
   openssl rand -base64 48

   # Add to .env.local:
   ADMIN_SESSION_SECRET=<new secret>
   ```

4. **Check Git History**
   ```bash
   cd /Users/ryanlowe/code/code-ripper/workspace/workspace/phyter1-main

   # Check if .env.local was ever committed:
   git log --all --full-history -- .env.local

   # Check if keys appear in git history:
   git log --all -p -S "sk-proj-W-Z0Rz9pSJMl618"
   ```

   **If found in git history:**
   - ALL credentials are compromised
   - Use BFG Repo-Cleaner to remove from history
   - Force push to all remotes
   - Rotate ALL keys immediately

---

## 3. ADD RATE LIMITING TO LOGIN (CRITICAL)

### Current Problem
Login endpoint has NO rate limiting. Attackers can try unlimited passwords.

### Fix Required

Add this code to `/src/app/api/admin/login/route.ts`:

```typescript
// Add after imports
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const loginRateLimitMap = new Map<string, RateLimitEntry>();

function getClientIP(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }

  return "unknown";
}

function isLoginRateLimited(ip: string): { limited: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = loginRateLimitMap.get(ip);
  const LIMIT = 5; // 5 attempts
  const WINDOW_MS = 15 * 60 * 1000; // per 15 minutes

  // Clean up expired entries
  if (entry && now >= entry.resetAt) {
    loginRateLimitMap.delete(ip);
    return { limited: false };
  }

  // Check if rate limited
  if (entry && entry.count >= LIMIT) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return { limited: true, retryAfter };
  }

  // Increment counter
  if (entry) {
    entry.count++;
  } else {
    loginRateLimitMap.set(ip, {
      count: 1,
      resetAt: now + WINDOW_MS,
    });
  }

  return { limited: false };
}

// Add at the START of your POST function:
export async function POST(request: NextRequest) {
  // Check rate limit FIRST
  const clientIP = getClientIP(request);
  const rateLimitCheck = isLoginRateLimited(clientIP);

  if (rateLimitCheck.limited) {
    return NextResponse.json(
      {
        error: "Too many login attempts. Please try again later.",
        retryAfter: rateLimitCheck.retryAfter
      },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimitCheck.retryAfter) }
      }
    );
  }

  // ... rest of your existing login code ...
}
```

---

## 4. FIX OPEN REDIRECT VULNERABILITY (HIGH)

### Current Problem
The redirect validation can be bypassed with URLs like:
- `/admin/../evil.com`
- `//admin.evil.com`
- `/admin@evil.com`

### Fix Required

Replace the redirect validation in `/src/app/api/admin/login/route.ts`:

```typescript
// Replace this section (around line 53-60):
function validateAdminRedirect(redirectTo: string | undefined): string {
  const defaultRedirect = "/admin/agent-workbench";

  if (!redirectTo || typeof redirectTo !== "string") {
    return defaultRedirect;
  }

  // Must start with /admin
  if (!redirectTo.startsWith("/admin")) {
    return defaultRedirect;
  }

  // Must not contain protocol or domain
  if (redirectTo.includes("://") || redirectTo.includes("//")) {
    return defaultRedirect;
  }

  // Must not contain @ (URL credential syntax)
  if (redirectTo.includes("@")) {
    return defaultRedirect;
  }

  // Path traversal protection
  try {
    const normalized = new URL(redirectTo, "http://localhost").pathname;
    if (!normalized.startsWith("/admin")) {
      return defaultRedirect;
    }
    return normalized;
  } catch {
    return defaultRedirect;
  }
}

// Then use it:
const validatedRedirectTo = validateAdminRedirect(redirectTo);
```

---

## 5. REMOVE DEBUG CONSOLE.LOGS (MEDIUM)

### Current Problem
`/src/proxy.ts` logs every authentication check in production.

### Fix Required

Replace console.logs with environment-aware logging:

```typescript
// Add at top of proxy.ts:
const debug = process.env.NODE_ENV !== "production"
  ? console.log.bind(console, '[AUTH]')
  : () => {};

// Replace all console.log with debug():
debug("Proxy called:", pathname);
debug("Checking admin route authentication");
debug("Session token:", sessionToken ? "EXISTS" : "MISSING");

// Keep error logging but make generic:
console.error("[AUTH] Configuration validation failed");
```

---

## 6. CHANGE COOKIE SAMESITE TO STRICT (MEDIUM)

### Current Problem
Cookies use `SameSite=Lax` which allows some cross-site requests.

### Fix Required

In `/src/lib/auth.ts`, change line 97:

```typescript
// OLD:
"SameSite=Lax",

// NEW:
"SameSite=Strict",
```

---

## TESTING CHECKLIST

After applying fixes:

- [ ] Password hash works (can login with hashed password)
- [ ] Rate limiting works (5 failed attempts blocks for 15 min)
- [ ] All old credentials rotated
- [ ] Console logs removed from production build
- [ ] Open redirect protection works (test with `//evil.com`)
- [ ] Cookies have `SameSite=Strict`
- [ ] No .env.local in git history
- [ ] Production environment variables set

---

## PRODUCTION DEPLOYMENT CHECKLIST

Before deploying:

- [ ] All CRITICAL fixes applied
- [ ] All credentials rotated
- [ ] Git history clean (no secrets)
- [ ] .env.local NOT committed
- [ ] Production environment variables configured
- [ ] Test login with rate limiting
- [ ] Test invalid redirect URLs
- [ ] Verify secure cookies in production

---

## NEED HELP?

If you need assistance with any of these fixes, let me know which one and I'll help you implement it step by step.
