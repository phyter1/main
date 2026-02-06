# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 16 portfolio application for Phytertek using the App Router architecture. The project uses React 19.2.0 with the React Compiler enabled.

## Development Commands

```bash
# Start development server (default: http://localhost:3000)
bun dev

# Build for production
bun build

# Start production server
bun start

# Lint and check code quality
bun lint

# Format code
bun format
```

## Testing

### Test Execution

**IMPORTANT: Known Issue with Parallel Test Execution**

This project has known issues when running all tests in parallel (Bun's default behavior). Tests must be run sequentially to avoid concurrency-related failures.

```bash
# Run all tests sequentially (default test command)
bun test

# Run specific test suites
bun test:lib          # Library tests only
bun test:components   # Component tests only
bun test:api          # API route tests only
bun test:pages        # Page tests only
bun test:admin        # Admin tests only

# Watch mode (use for individual file development)
bun test:watch
```

### Adding New Tests

**CRITICAL: When adding new test files, you MUST update the sequential test script:**

1. Create your test file (e.g., `src/components/MyComponent.test.tsx`)
2. Open `scripts/test-all-sequential.sh`
3. Add your test file to the appropriate section with the `run_test` function:

```bash
# Example: Adding a new component test
echo "🎨 UI Component Tests"
run_test "src/components/ui/chat-message.test.tsx" "chat-message"
run_test "src/components/ui/my-component.test.tsx" "my-component"  # <-- Add here
```

**Why Sequential Testing?**
- Parallel test execution causes race conditions in shared resources
- Mock state can leak between parallel test files
- DOM cleanup conflicts when tests run simultaneously
- The sequential script ensures proper isolation between test files

**Test Organization in `test-all-sequential.sh`:**
- 📚 Library Tests (`src/lib/`)
- 🔌 Provider Tests (`src/providers/`)
- 🪝 Hook Tests (`src/hooks/`)
- 🎨 UI Component Tests (`src/components/ui/`)
- 🎨 Theme Component Tests (`src/components/theme/`)
- ✨ Effects Component Tests (`src/components/effects/`)
- 📦 Section Component Tests (`src/components/sections/`)
- 🔧 Admin Component Tests (`src/components/admin/`)
- 🏗️ Layout Component Tests (`src/components/layout/`)
- 📄 Page Tests (`src/app/*/page.test.tsx`)
- 🔐 Admin Page Tests (`src/app/admin/`)
- 🌐 API Route Tests (`src/app/api/`)
- 🔐 Admin API Route Tests (`src/app/api/admin/`)
- 💾 Data Tests (`src/data/`)
- 🔗 Integration Tests (`src/app/__tests__/`, `src/__tests__/`)

## Technology Stack

- **Framework**: Next.js 16 with App Router
- **React**: 19.2.0 with React Compiler enabled (next.config.ts)
- **Styling**: Tailwind CSS 4 with custom theming system
- **Linting/Formatting**: Biome (not ESLint/Prettier)
- **UI Components**: shadcn/ui (new-york style)
- **Fonts**: Fira Sans and Fira Mono from next/font/google
- **Package Manager**: Bun
- **AI Integration**: Vercel AI SDK with Anthropic provider

## Code Organization

### Import Aliases
Path aliases are configured in tsconfig.json:
- `@/*` maps to `src/*`

shadcn/ui specific aliases (components.json):
- `@/components` - Component directory
- `@/lib/utils` - Utility functions (cn helper)
- `@/components/ui` - shadcn/ui components
- `@/lib` - Library code
- `@/hooks` - React hooks

### Project Structure

```
src/
├── app/              # Next.js App Router pages and layouts
│   ├── layout.tsx    # Root layout with metadata and font configuration
│   ├── page.tsx      # Homepage
│   └── globals.css   # Global styles with Tailwind and theming
└── lib/
    ├── ai-config.ts  # AI SDK configuration and environment validation
    ├── fonts.ts      # Font configuration (Fira Sans, Fira Mono, Fira Code)
    └── utils.ts      # cn() utility for className merging
```

## Styling and Theming

### Tailwind Configuration
- Uses Tailwind CSS 4 with `@tailwindcss/postcss`
- Animations from `tw-animate-css` package
- Custom dark mode variant: `@custom-variant dark (&:is(.dark *))`
- CSS variables defined in `globals.css` for theme customization
- Color system uses OKLCH color space for better perceptual uniformity
- Custom radius system: `sm`, `md`, `lg`, `xl` based on `--radius` (0.625rem)

### Font System
- Primary font: Fira Sans (weights: 400, 700)
- Monospace font: Fira Mono (weights: 400, 700)
- Additional: Fira Code (available but not currently used in layout)
- All fonts use `display: swap` for optimal performance
- CSS variables: `--font-fira-sans`, `--font-fira-mono`, `--font-fira-code`

### shadcn/ui Setup
- Style: "new-york"
- Uses React Server Components (rsc: true)
- Base color: neutral
- CSS variables enabled for theming
- Icon library: lucide-react

## Theme System

The application includes a comprehensive theme system with light mode, dark mode, and system preference detection. The theme system is built with React Context, localStorage persistence, and automatic dark class application for seamless theming across the entire application.

### Overview

The theme system provides three theme states:
- **light** - Force light theme regardless of system preference
- **dark** - Force dark theme regardless of system preference
- **system** - Automatically match the user's operating system theme preference

**Key Features:**
- localStorage persistence (theme preference saved across sessions)
- System preference detection using `prefers-color-scheme` media query
- Automatic dark class application to `document.documentElement`
- SSR-safe implementation (no hydration mismatches)
- FOUC (Flash of Unstyled Content) prevention
- Real-time system preference change detection

### Architecture

The theme system consists of three main components:

#### ThemeProvider Component (`src/providers/ThemeProvider.tsx`)

The core provider that manages theme state and provides it to the entire application via React Context.

**Features:**
- Client-side component with `"use client"` directive
- Manages theme state with `useState`
- Detects system preference with `window.matchMedia("(prefers-color-scheme: dark)")`
- Persists theme to localStorage with key "theme"
- Applies `.dark` class to `document.documentElement` when dark theme is active
- Watches for system preference changes with event listener cleanup
- Defaults to "system" theme if no stored preference exists

**Integration:**
```tsx
// src/app/layout.tsx
import { ThemeProvider } from '@/providers/ThemeProvider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

#### useTheme Hook (`src/hooks/useTheme.ts`)

A custom hook for consuming theme context in components.

**API:**
```typescript
import { useTheme } from '@/hooks/useTheme';

function MyComponent() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  // theme: "light" | "dark" | "system" (user's selection)
  // setTheme: (theme: Theme) => void (update theme)
  // resolvedTheme: "light" | "dark" (actual theme in use)

  return <div>Current theme: {resolvedTheme}</div>;
}
```

**Type Safety:**
```typescript
export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: ResolvedTheme;
}
```

**Error Handling:**
- Throws error if used outside ThemeProvider
- Clear error message: "useTheme must be used within ThemeProvider"

#### ThemeToggle Component (`src/components/theme/ThemeToggle.tsx`)

A dropdown button UI component for theme selection, integrated into the Navigation component.

**Features:**
- Sun icon in light mode, moon icon in dark mode
- Smooth icon transitions with CSS animations
- Dropdown menu with three options: Light, Dark, System
- Visual checkmark indicator for active theme
- Keyboard accessible (Tab, Enter, Escape)
- Proper ARIA labels for screen readers
- Uses shadcn/ui components (Button, DropdownMenu)

**Usage:**
```tsx
import { ThemeToggle } from '@/components/theme/ThemeToggle';

export function Navigation() {
  return (
    <nav>
      {/* Other navigation items */}
      <ThemeToggle />
    </nav>
  );
}
```

**Integration Points:**
- Desktop navigation: Positioned before Resume button
- Mobile menu: Included in mobile navigation dropdown
- Styling: Uses Tailwind dark mode variant with smooth transitions

### Usage Examples

#### Basic Theme Switching

```tsx
"use client";

import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/button';

export function ThemeControls() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  return (
    <div>
      <p>Current selection: {theme}</p>
      <p>Active theme: {resolvedTheme}</p>

      <div className="flex gap-2">
        <Button onClick={() => setTheme("light")}>Light</Button>
        <Button onClick={() => setTheme("dark")}>Dark</Button>
        <Button onClick={() => setTheme("system")}>System</Button>
      </div>
    </div>
  );
}
```

#### Theme-Aware Component Styling

```tsx
"use client";

import { useTheme } from '@/hooks/useTheme';

export function ThemedCard() {
  const { resolvedTheme } = useTheme();

  return (
    <div className={`
      rounded-lg p-6
      ${resolvedTheme === 'dark' ? 'bg-gray-800' : 'bg-white'}
    `}>
      <h2>Theme-aware card</h2>
      <p>Current theme: {resolvedTheme}</p>
    </div>
  );
}
```

**Better Approach with Tailwind:**
```tsx
export function ThemedCard() {
  return (
    <div className="rounded-lg p-6 bg-white dark:bg-gray-800">
      <h2 className="text-gray-900 dark:text-gray-100">Theme-aware card</h2>
      <p className="text-gray-600 dark:text-gray-400">
        Automatically adapts to theme
      </p>
    </div>
  );
}
```

#### Conditional Rendering Based on Theme

```tsx
"use client";

import { useTheme } from '@/hooks/useTheme';
import { Sun, Moon } from 'lucide-react';

export function ThemeIndicator() {
  const { resolvedTheme } = useTheme();

  return (
    <div className="flex items-center gap-2">
      {resolvedTheme === 'dark' ? (
        <Moon className="size-5" />
      ) : (
        <Sun className="size-5" />
      )}
      <span>{resolvedTheme} mode</span>
    </div>
  );
}
```

#### Testing Theme-Aware Components

```tsx
import { describe, it, expect, beforeEach } from 'bun:test';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { MyThemedComponent } from './MyThemedComponent';

describe('MyThemedComponent', () => {
  beforeEach(() => {
    // Reset localStorage before each test
    localStorage.clear();
  });

  it('should render with light theme', () => {
    // Mock system preference
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string) => ({
        matches: false, // Light mode
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
      }),
    });

    render(
      <ThemeProvider>
        <MyThemedComponent />
      </ThemeProvider>
    );

    // Verify light theme rendering
    expect(screen.getByText(/light mode/i)).toBeDefined();
  });

  it('should render with dark theme', () => {
    // Mock system preference to dark
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string) => ({
        matches: true, // Dark mode
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
      }),
    });

    render(
      <ThemeProvider>
        <MyThemedComponent />
      </ThemeProvider>
    );

    // Verify dark theme rendering
    expect(screen.getByText(/dark mode/i)).toBeDefined();
  });
});
```

### Technical Details

#### localStorage Schema

The theme preference is stored in localStorage with the following schema:

```typescript
// Key: "theme"
// Value: "light" | "dark" | "system"

// Example:
localStorage.getItem("theme"); // "dark"
localStorage.setItem("theme", "light");
```

**Storage Behavior:**
- Theme is saved immediately when changed via `setTheme()`
- Theme is loaded once on component mount
- Invalid stored values are ignored (falls back to "system")
- No storage quota concerns (single string value)

#### CSS Classes

The theme system applies CSS classes to enable dark mode styling:

```html
<!-- Light theme -->
<html lang="en">
  <!-- No .dark class -->
</html>

<!-- Dark theme -->
<html lang="en" class="dark">
  <!-- .dark class applied -->
</html>
```

**Tailwind Dark Mode Variant:**
```css
/* globals.css */
@custom-variant dark (&:is(.dark *));
```

**Usage in Components:**
```tsx
<div className="bg-white dark:bg-gray-800">
  <p className="text-gray-900 dark:text-gray-100">
    Automatically adapts to theme
  </p>
</div>
```

#### SSR Considerations

The theme system is SSR-safe with the following patterns:

**Client Component Directive:**
```tsx
"use client"; // ThemeProvider must run on client

import { createContext } from "react";
```

**Window Access Guards:**
```tsx
useEffect(() => {
  if (typeof window === "undefined") return;

  // Safe to access window and document here
  const stored = localStorage.getItem("theme");
}, []);
```

**Hydration Safety:**
- Theme is loaded after mount (not during render)
- No mismatches between server and client HTML
- localStorage access only happens client-side
- Default "system" theme matches server render

**FOUC Prevention:**

While the current implementation is SSR-safe, there may be a brief flash when the page loads. To prevent this, you can add an inline script in your root layout:

```tsx
// src/app/layout.tsx (optional enhancement)
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('theme') || 'system';
                const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                const resolved = theme === 'system' ? systemPreference : theme;
                if (resolved === 'dark') {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
```

This script runs immediately before page render to apply the correct theme class, preventing any flash of wrong theme.

### System Preference Detection

The theme system automatically detects and responds to operating system theme changes:

**Detection Method:**
```typescript
const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

// Initial detection
const isDark = mediaQuery.matches; // true if OS is in dark mode

// Listen for changes
mediaQuery.addEventListener("change", (e) => {
  const newPreference = e.matches ? "dark" : "light";
  // Update resolvedTheme if theme is "system"
});
```

**Behavior:**
- When theme is set to "system", resolvedTheme automatically updates with OS preference
- Changes to OS theme are detected immediately (no polling required)
- Event listener is properly cleaned up on component unmount
- Works on macOS, Windows, Linux, iOS, and Android

**User Experience:**
1. User sets theme to "system" in ThemeToggle dropdown
2. Application shows light or dark based on OS preference
3. User changes OS theme (e.g., macOS System Settings → Appearance)
4. Application automatically updates to match new OS preference
5. No page reload required

### Performance Considerations

**Optimization Strategies:**

1. **Minimal Re-renders**
   - Theme state updates only when changed
   - Resolved theme is computed, not stored in state
   - Context value is memoized to prevent unnecessary re-renders

2. **Efficient Event Listeners**
   - Single `matchMedia` listener for system preference
   - Listener cleanup on component unmount
   - No polling or intervals

3. **localStorage Reads**
   - Read once on mount, not on every render
   - Write only when theme changes
   - No performance impact on navigation

4. **Class Application**
   - Direct DOM manipulation for dark class
   - No virtual DOM diffing for class changes
   - Instant theme switching

**Measured Impact:**
- Bundle size: ~1KB minified + gzipped (ThemeProvider + useTheme hook)
- Runtime overhead: Negligible (context lookup is O(1))
- Theme switch latency: < 16ms (single frame)
- No layout shifts or CLS issues

### Security Considerations

**Storage Validation:**
```typescript
const storedTheme = localStorage.getItem("theme");

// Validate before using
if (
  storedTheme === "light" ||
  storedTheme === "dark" ||
  storedTheme === "system"
) {
  setThemeState(storedTheme);
} else {
  // Invalid value, ignore and use default
  setThemeState("system");
}
```

**No XSS Risk:**
- Theme values are restricted to specific strings
- No user-generated content stored
- No HTML injection possible through theme values

**localStorage Safety:**
- No sensitive data stored (only theme preference)
- Data persists across sessions (intentional for UX)
- No privacy concerns (theme is not PII)

### Accessibility

The theme system includes comprehensive accessibility features:

**Keyboard Navigation:**
- ThemeToggle fully keyboard accessible
- Tab to focus, Enter to open dropdown, Arrow keys to navigate
- Escape to close dropdown
- Active theme indicated with checkmark

**Screen Reader Support:**
```tsx
<Button aria-label="Toggle theme">
  <Sun className="..." />
  <Moon className="..." />
  <span className="sr-only">Toggle theme</span>
</Button>
```

**Visual Indicators:**
- Clear icon transitions (Sun ↔ Moon)
- Checkmark shows active theme in dropdown
- No reliance on color alone

**Reduced Motion:**
The theme system respects `prefers-reduced-motion`:
```css
.theme-toggle-icon {
  transition: transform 0.2s ease;
}

@media (prefers-reduced-motion: reduce) {
  .theme-toggle-icon {
    transition: none;
  }
}
```

### Troubleshooting

#### Theme Not Persisting

**Problem:** Theme resets to system on page reload

**Solution:**
1. Check localStorage is enabled in browser
2. Verify `setTheme()` is being called correctly
3. Check browser DevTools → Application → Local Storage
4. Ensure no code is clearing localStorage on load

```tsx
// Debug localStorage
console.log('Stored theme:', localStorage.getItem('theme'));
```

#### Dark Class Not Applying

**Problem:** `.dark` class not appearing on `<html>` element

**Solution:**
1. Verify ThemeProvider is wrapping your app
2. Check `document.documentElement.classList` in DevTools
3. Ensure no CSS conflicts removing the class
4. Verify Tailwind dark variant is configured correctly

```tsx
// Debug dark class application
useEffect(() => {
  console.log('Dark class applied:', document.documentElement.classList.contains('dark'));
}, [resolvedTheme]);
```

#### System Preference Not Detected

**Problem:** Theme doesn't match OS preference when set to "system"

**Solution:**
1. Check browser support for `matchMedia`
2. Verify OS has dark mode setting
3. Test with `window.matchMedia('(prefers-color-scheme: dark)').matches`

```tsx
// Debug system preference detection
const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
console.log('System prefers dark:', isDark);
```

#### SSR Hydration Mismatch

**Problem:** Warning about server/client HTML mismatch

**Solution:**
1. Ensure ThemeProvider has `"use client"` directive
2. Don't render theme-dependent content on server
3. Use `useEffect` for client-only rendering
4. Add FOUC prevention script if needed

```tsx
// Client-only rendering pattern
const [mounted, setMounted] = useState(false);

useEffect(() => {
  setMounted(true);
}, []);

if (!mounted) {
  return null; // or skeleton
}

return <ThemeAwareContent />;
```

#### Theme Flash on Load (FOUC)

**Problem:** Brief flash of wrong theme when page loads

**Solution:**
Add inline script to apply theme before React hydration (see SSR Considerations section above for implementation).

### Testing

The theme system includes comprehensive test coverage:

**Test Coverage:**
- ThemeProvider: 21 tests
- useTheme hook: 15 tests
- ThemeToggle component: 12 tests
- Navigation integration: 17 tests

**Key Test Areas:**
1. Theme state management (set/get theme)
2. localStorage persistence (save/load)
3. System preference detection (matchMedia)
4. Dark class application (DOM manipulation)
5. SSR safety (window guards)
6. Error handling (useTheme outside provider)
7. Component rendering (ThemeToggle UI)
8. Integration testing (Navigation + ThemeToggle)

**Running Tests:**
```bash
# Run all theme-related tests
bun test src/providers/ThemeProvider.test.tsx
bun test src/hooks/__tests__/useTheme.test.tsx
bun test src/components/theme/ThemeToggle.test.tsx

# Run with coverage
bun test --coverage
```

### Best Practices

**Do's:**
- ✅ Use Tailwind `dark:` variant for styling
- ✅ Wrap app with ThemeProvider in root layout
- ✅ Use `useTheme` hook for theme-aware logic
- ✅ Test components with both light and dark themes
- ✅ Respect `prefers-reduced-motion` for transitions
- ✅ Provide keyboard navigation for theme controls
- ✅ Use semantic HTML and ARIA labels

**Don'ts:**
- ❌ Don't access localStorage directly (use `setTheme`)
- ❌ Don't apply dark class manually (provider handles it)
- ❌ Don't use `useTheme` outside ThemeProvider
- ❌ Don't forget `"use client"` for theme-aware components
- ❌ Don't hard-code theme values in components
- ❌ Don't skip SSR safety checks
- ❌ Don't create multiple ThemeProviders

### Future Enhancements

**Potential Improvements:**
1. Theme transition animations (smooth color changes)
2. Additional theme variants (high contrast, custom themes)
3. Per-component theme overrides
4. Theme preview before applying
5. Scheduled theme switching (auto-dark at night)
6. Theme sync across tabs (BroadcastChannel API)
7. Analytics for theme preference distribution

## Code Quality Tools

### Biome Configuration
- Formatter: 2-space indentation
- Linter: Recommended rules enabled with React and Next.js domains
- VCS integration enabled (Git)
- Auto-organize imports on save
- Ignores: `node_modules`, `.next`, `dist`, `build`
- Special rule: `noUnknownAtRules` disabled for Tailwind compatibility

Always use `bun lint` and `bun format` (not `npm run lint` or other package managers).

### Git Hooks

This project uses git hooks to enforce code quality and testing standards automatically. These hooks are the guardrails that prevent shortcuts from making it into the codebase.

#### What's Installed

**Pre-commit Hook** (`.git-hooks/pre-commit`)
- Runs `lint-staged` to check only staged files
- Executes Biome lint and format on `*.{ts,tsx,js,jsx}` files
- Automatically fixes auto-fixable issues
- Prevents commit if unfixable issues remain

**Pre-push Hook** (`.git-hooks/pre-push`)
- Runs full test suite via `bun test`
- Validates all tests pass before code reaches remote
- Catches test failures before they break CI/CD
- Enforces the "Green" phase of TDD before sharing code

**Automatic Installation**
- Hooks install automatically on `bun install` via `postinstall` script
- Uses `simple-git-hooks` for lightweight, zero-dependency hook management
- New team members get hooks automatically when cloning and installing

#### How They Enforce "No Shortcuts"

The hooks are your pair programmer who won't let you cut corners:

**Preventing Common Shortcuts:**
- "I'll fix the lint errors later" → Pre-commit catches it now
- "I'll format it before the PR" → Pre-commit formats it now
- "I'll add tests after I see if this works" → Pre-push requires tests to pass
- "Nobody will notice this broken test" → Pre-push blocks the push
- "Moving too fast for quality checks" → Hooks slow you down (intentionally)

**Supporting TDD Workflow:**
1. **Red**: Write failing test → Can still commit (test can fail locally)
2. **Green**: Make test pass → Pre-push validates this before sharing
3. **Refactor**: Clean up code → Pre-commit ensures clean formatting

The hooks don't prevent you from having failing tests locally (that's part of TDD), but they do prevent you from pushing code that would break the build for others.

#### Using --no-verify: True Emergencies Only

The `--no-verify` flag exists. Use it extremely rarely.

**Acceptable Use Cases (Document in Commit Message):**
```bash
# Production is down, hotfix needed immediately, will fix tests in follow-up
git commit --no-verify -m "hotfix: patch critical security vulnerability

Bypassing pre-commit due to production emergency.
Follow-up PR #123 will address test failures."

# Hook itself is broken and blocking all commits
git commit --no-verify -m "fix: repair broken pre-commit hook

Hook was incorrectly failing on valid code.
Bypassing to fix the hook itself."
```

**NEVER Use --no-verify For:**
- "The lint errors are annoying" → Fix the errors or update Biome config
- "I don't have time for tests right now" → You have time, you're choosing not to
- "It's just a small change" → Small changes need quality too
- "I'll fix it in the next commit" → Fix it in this commit
- "The tests are flaky" → Fix the flaky tests, don't bypass them

**When You Reach for --no-verify, Ask:**
1. Is production actually down right now?
2. Have I documented why I'm bypassing in the commit message?
3. Have I created a follow-up issue/PR to fix what I'm bypassing?
4. Would I be okay explaining this to the team in a retrospective?

If you can't answer "yes" to all four, you don't need `--no-verify`.

#### Philosophy: Hooks as Guardrails, Not Gatekeepers

These hooks exist to make your life easier, not harder:

**What They Prevent:**
- Embarrassing "oops, forgot to lint" commits
- Pushing broken code that fails CI
- Context-switching to fix issues discovered in CI
- Breaking the build for other developers
- Accumulating technical debt from "I'll fix it later"

**What They Don't Prevent:**
- Committing work-in-progress (tests can fail locally)
- Experimenting with new approaches
- Rapid iteration during development
- The creative problem-solving process

Think of hooks as the spell-checker in your editor - mildly annoying when they catch something, but you're glad they did before someone else saw it.

#### Troubleshooting

**Hook doesn't run:**
```bash
# Reinstall hooks
bun run postinstall

# Verify hooks are installed
ls -la .git/hooks/pre-commit .git/hooks/pre-push
```

**Hook fails on valid code:**
```bash
# Check what's failing
bunx lint-staged  # For pre-commit issues
bun test         # For pre-push issues

# Fix the underlying issue, don't bypass the hook
```

**Hook is too slow:**
- Pre-commit only checks staged files (fast by design)
- Pre-push runs all tests (intentionally thorough)
- If pre-push is slow, optimize your tests, don't bypass the hook

**Need to bypass for legitimate reason:**
```bash
# Document why in the commit message
git commit --no-verify -m "type: description

Detailed explanation of why --no-verify is necessary.
Link to follow-up issue/PR to address what's bypassed."
```

## Next.js Configuration

- React Compiler enabled (`reactCompiler: true`)
- TypeScript strict mode enabled
- Module resolution: bundler
- Target: ES2017

## AI Integration

This project uses the Vercel AI SDK with Anthropic's Claude models to power interactive AI features, including a conversational chat interface and AI-powered job fit assessment.

### Overview

The application includes three main AI-powered features:

1. **Interactive Chat Interface** (`/chat`)
   - Real-time streaming conversations with AI
   - Full context about Ryan's professional background
   - Token-by-token response streaming for responsive UX

2. **Job Fit Assessment** (`/fit-assessment`)
   - AI-powered analysis of job descriptions vs. candidate experience
   - Structured assessment with fit level, reasoning, and recommendations
   - Honest, actionable feedback based on actual skills and experience

3. **Expandable Context System**
   - Resume data formatted as LLM context
   - Comprehensive markdown representation of experience, skills, projects, and principles
   - Efficient context injection into every AI request

### Setup

1. **Environment Configuration**
   ```bash
   # Copy the example environment file
   cp .env.local.example .env.local

   # Add your Anthropic API key to .env.local
   # Get your API key from: https://console.anthropic.com/settings/keys
   ```

2. **Required Environment Variables**
   ```bash
   # Required: Your Anthropic API key
   ANTHROPIC_API_KEY=sk-ant-api03-...

   # Optional: Rate limiting configuration
   AI_MAX_REQUESTS_PER_MINUTE=10        # Default: 10
   AI_MAX_TOKENS_PER_REQUEST=4096       # Default: 4096
   ```

3. **Environment Validation**
   - The application validates environment variables on server startup
   - Missing or invalid keys will throw descriptive errors
   - Non-blocking during Next.js build/static generation
   - API key format validation (warns if doesn't match `sk-ant-` pattern)

### API Routes

#### POST /api/chat

Handles streaming chat completions with resume context.

**Request Format:**
```typescript
{
  messages: Array<{
    id: string;
    role: "user" | "assistant";
    content: string;
  }>
}
```

**Response:**
- Streaming text response (real-time token delivery)
- Content-Type: `text/plain; charset=utf-8`

**Features:**
- Streaming responses using Vercel AI SDK's `streamText()`
- Resume context automatically injected into system prompt
- IP-based rate limiting (10 requests/minute per IP)
- Comprehensive error handling with user-friendly messages

**Error Responses:**
- `400 Bad Request`: Invalid request body or missing messages
- `429 Too Many Requests`: Rate limit exceeded (includes `Retry-After` header)
- `500 Internal Server Error`: AI API failure or processing error

**Implementation:**
```typescript
// Example usage in a React component
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ messages: conversationHistory })
});

// Handle streaming response
const reader = response.body?.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  const chunk = decoder.decode(value);
  // Process streaming chunk
}
```

#### POST /api/fit-assessment

Assesses job fit based on resume data and a provided job description.

**Request Format:**
```typescript
{
  jobDescription: string; // 1-10000 characters, required
}
```

**Response Format:**
```typescript
{
  fitLevel: "strong" | "moderate" | "weak";
  reasoning: string[];        // Specific reasons for assessment
  recommendations: string[];  // Actionable recommendations
}
```

**Features:**
- Structured AI output using Vercel AI SDK's `generateObject()`
- Zod schema validation for type-safe responses
- Honest assessment based on actual resume data
- Actionable recommendations for skill development

**Error Responses:**
- `400 Bad Request`: Invalid or missing job description
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: AI API failure

**Assessment Criteria:**
- **strong**: Candidate has most/all required skills with relevant experience
- **moderate**: Some required skills but may need development in key areas
- **weak**: Lacks most required skills or experience level doesn't match

### LLM Context Management

The resume data model provides a comprehensive context formatting system for AI interactions.

#### Resume Data Structure

Located in `src/data/resume.ts`, the resume data includes:

```typescript
interface Resume {
  personalInfo: {
    name: string;
    title: string;
    location: string;
    summary: string;
  };
  experience: Array<{
    title: string;
    organization: string;
    period: string;
    description: string;
    highlights: string[];
    technologies?: string[];
  }>;
  skills: {
    languages: Skill[];
    frameworks: Skill[];
    databases: Skill[];
    devTools: Skill[];
    infrastructure: Skill[];
  };
  projects: Project[];
  principles: Principle[];
}
```

#### Context Formatting

The `formatResumeAsLLMContext()` function converts resume data into markdown:

```typescript
import { formatResumeAsLLMContext, resume } from '@/data/resume';

// Generate comprehensive markdown context
const resumeContext = formatResumeAsLLMContext(resume);

// Use in system prompt
const systemPrompt = `You are an AI assistant with access to:
${resumeContext}`;
```

**Context Includes:**
- Personal information and professional summary
- Detailed experience history with highlights
- Technical skills organized by category with proficiency levels
- Featured projects with descriptions and technologies
- Engineering principles and philosophy

**Benefits:**
- Consistent context across all AI interactions
- Efficient token usage with structured markdown
- Easy to update as experience grows
- Type-safe data access

### Available AI Models

The AI configuration (`src/lib/ai-config.ts`) provides three model tiers:

```typescript
export const AI_MODELS = {
  CHAT: "claude-sonnet-4-5-20250929",      // Primary: Chat completions
  FAST: "claude-3-5-haiku-20241022",       // Fast: Simple tasks
  ADVANCED: "claude-opus-4-5-20251101"     // Advanced: Complex reasoning
}
```

**Model Selection:**
```typescript
import { createAnthropicClient } from '@/lib/ai-config';

// Use default CHAT model (Sonnet 4.5)
const chatClient = createAnthropicClient();

// Use FAST model for quick responses
const fastClient = createAnthropicClient('FAST');

// Use ADVANCED model for complex analysis
const advancedClient = createAnthropicClient('ADVANCED');
```

**Model Characteristics:**
- **CHAT (Sonnet 4.5)**: Balanced performance and quality for conversations
- **FAST (Haiku)**: Lower latency for simple tasks, cost-effective
- **ADVANCED (Opus 4.5)**: Highest quality reasoning for complex assessments

### Rate Limiting

Rate limiting is implemented at the API route level with IP-based tracking.

**Configuration:**
```typescript
export const AI_RATE_LIMITS = {
  MAX_REQUESTS_PER_MINUTE: 10,    // Per IP address
  MAX_TOKENS_PER_REQUEST: 4096,   // Per individual request
  REQUEST_TIMEOUT_MS: 30000,      // 30 second timeout
  MAX_RETRIES: 3,                 // Retry attempts
  RETRY_DELAY_MS: 1000           // Delay between retries
}
```

**Implementation:**
- **In-memory tracking**: Per-IP request counts with automatic cleanup
- **Rolling window**: 60-second window from first request
- **Retry-After header**: Informs clients when they can retry
- **Independent tracking**: Different IPs tracked separately

**Rate Limit Response:**
```typescript
// When rate limit exceeded:
{
  error: "Rate limit exceeded. Please try again later.",
  retryAfter: 42  // seconds until reset
}
// HTTP Status: 429 Too Many Requests
// Header: Retry-After: 42
```

**Production Considerations:**
- Current implementation uses in-memory storage
- For multi-instance deployments, consider Redis or distributed cache
- Monitor rate limit hits with analytics
- Adjust limits based on usage patterns and API quotas

### Testing Strategy

AI features use mocked API calls in tests for fast, reliable, isolated testing.

#### Mocking AI SDK

```typescript
// Mock streamText for chat tests
const mockStreamTextResult = {
  toTextStreamResponse: mock(() => {
    return new Response("mock stream response", {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" }
    });
  })
};

const mockStreamText = mock(() => mockStreamTextResult);

mock.module("ai", () => ({
  streamText: mockStreamText
}));
```

#### Mocking AI Configuration

```typescript
// Mock AI config and rate limits
mock.module("@/lib/ai-config", () => ({
  createAnthropicClient: mock(() => "mock-anthropic-client"),
  AI_RATE_LIMITS: {
    MAX_REQUESTS_PER_MINUTE: 10,
    MAX_TOKENS_PER_REQUEST: 4096
  }
}));
```

#### Mocking Resume Data

```typescript
// Mock resume context for predictable tests
const mockResume = {
  personalInfo: {
    name: "Test User",
    title: "Test Title",
    location: "Test Location",
    summary: "Test summary"
  },
  // ... minimal test data
};

const mockFormatResumeAsLLMContext = mock(() => "# Test User\n\nTest context");

mock.module("@/data/resume", () => ({
  resume: mockResume,
  formatResumeAsLLMContext: mockFormatResumeAsLLMContext
}));
```

#### Test Coverage Areas

**Chat API Route Tests:**
- Request validation (messages array format)
- Resume context integration
- Streaming response handling
- Rate limiting enforcement
- Error handling (400, 429, 500 status codes)
- IP-based tracking

**Fit Assessment API Tests:**
- Request validation (job description length and format)
- Structured response format (fitLevel, reasoning, recommendations)
- Rate limiting
- Error handling
- Zod schema validation

**Component Tests:**
- ChatInterface: User input, message display, streaming, error states
- Chat page: Layout, hero section, component integration
- Fit assessment page: Form handling, result display

**Benefits of Mocked Tests:**
- Fast execution (no actual API calls)
- Deterministic results (no flaky tests)
- No API quota consumption during testing
- Isolated component behavior testing
- Easy to test error scenarios

### Analytics and Privacy

The application implements privacy-respecting analytics tracking for AI feature usage.

**Tracking Philosophy:**
- No personally identifiable information (PII) collected
- No conversation content stored or tracked
- Only aggregate usage metrics
- GDPR and privacy law compliant

**Tracked Events:**
- AI chat session initiated (count only)
- Fit assessment requested (count only)
- API rate limit hits (for optimization)
- Error rates by type (for reliability monitoring)

**Not Tracked:**
- Message content or conversation topics
- User identity or IP addresses beyond rate limiting
- Personal information from job descriptions
- Individual user behavior or session details

**Implementation:**
- Server-side only (no client-side tracking scripts)
- Minimal data retention
- No third-party analytics services
- Self-hosted monitoring preferred

### Troubleshooting

#### API Key Issues

**Problem:** `AIConfigError: Missing or invalid required environment variables: ANTHROPIC_API_KEY`

**Solution:**
1. Verify `.env.local` file exists in project root
2. Ensure `ANTHROPIC_API_KEY` is set and not "your_api_key_here"
3. Get API key from https://console.anthropic.com/settings/keys
4. Restart development server after updating `.env.local`

**Problem:** `Warning: ANTHROPIC_API_KEY does not match expected format`

**Solution:**
- API key should start with `sk-ant-`
- Verify you copied the entire key
- Generate a new key if the current one is invalid

#### Rate Limiting Issues

**Problem:** 429 responses during development

**Solution:**
1. Rate limit is per IP address, development and testing may hit limit quickly
2. Increase `AI_MAX_REQUESTS_PER_MINUTE` in `.env.local` for development
3. Wait 60 seconds for rate limit to reset
4. Consider implementing a bypass for development environments

**Problem:** Rate limit not working correctly in production

**Solution:**
- Verify proxy headers (`x-forwarded-for`, `x-real-ip`) are being passed correctly
- Check if multiple app instances need distributed cache (Redis)
- Monitor rate limit hits with logging

#### Streaming Issues

**Problem:** Chat responses not streaming, appear all at once

**Solution:**
1. Verify response Content-Type is `text/plain; charset=utf-8`
2. Check browser compatibility with ReadableStream API
3. Ensure no response buffering middleware
4. Test with network throttling disabled

**Problem:** Streaming stops mid-response

**Solution:**
- Check API token limits (default 4096)
- Verify network connection stability
- Check server timeout configuration (default 30s)
- Review server logs for errors

#### Context Issues

**Problem:** AI responses don't include resume information

**Solution:**
1. Verify `formatResumeAsLLMContext()` is called in API route
2. Check resume data is populated correctly in `src/data/resume.ts`
3. Review system prompt includes resume context
4. Test with explicit questions about resume content

**Problem:** Token limit exceeded errors

**Solution:**
- Resume context is ~3000 tokens, leaving ~1000 for conversation
- Reduce `AI_MAX_TOKENS_PER_REQUEST` if needed
- Consider truncating older conversation history
- Optimize context formatting to reduce token usage

#### Test Failures

**Problem:** Tests fail with "module not found" for mocks

**Solution:**
1. Ensure mock.module() calls are before imports
2. Use dynamic imports: `const module = await import("./route")`
3. Clear mock state between tests with `mock.restore()`

**Problem:** Rate limiting tests fail intermittently

**Solution:**
- Rate limit state persists between tests
- Use unique IP addresses per test
- Clear rate limit map in `afterEach()` hook
- Avoid parallel test execution for rate limit tests

### Code Examples

#### Creating a Custom AI Feature

```typescript
// src/app/api/custom-feature/route.ts
import { generateObject } from "ai";
import { z } from "zod";
import { createAnthropicClient } from "@/lib/ai-config";
import { formatResumeAsLLMContext, resume } from "@/data/resume";

// Define response schema
const ResponseSchema = z.object({
  result: z.string(),
  confidence: z.number().min(0).max(1)
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { input } = body;

    // Create AI client
    const model = createAnthropicClient("CHAT");

    // Generate resume context
    const resumeContext = formatResumeAsLLMContext(resume);

    // Generate structured response
    const result = await generateObject({
      model,
      schema: ResponseSchema,
      system: `Context: ${resumeContext}`,
      prompt: input,
      temperature: 0.7
    });

    return Response.json(result.object);
  } catch (error) {
    return Response.json(
      { error: "Processing failed" },
      { status: 500 }
    );
  }
}
```

#### Using Different Models

```typescript
// Fast model for simple tasks
const summaryClient = createAnthropicClient("FAST");
const summary = await generateText({
  model: summaryClient,
  prompt: "Summarize in one sentence"
});

// Advanced model for complex reasoning
const analysisClient = createAnthropicClient("ADVANCED");
const analysis = await generateObject({
  model: analysisClient,
  schema: ComplexAnalysisSchema,
  prompt: "Perform deep analysis..."
});
```

### Security Best Practices

1. **API Key Management**
   - Never commit `.env.local` files
   - Use `.env.local.example` as template
   - Rotate keys periodically
   - Use different keys for dev/staging/prod

2. **Input Validation**
   - Always validate user input with Zod schemas
   - Sanitize input before passing to AI
   - Enforce length limits on user-provided text
   - Validate request structure before processing

3. **Rate Limiting**
   - Implement rate limiting on all AI endpoints
   - Use IP-based tracking as baseline
   - Consider user authentication for personalized limits
   - Monitor and adjust limits based on usage patterns

4. **Error Handling**
   - Never expose API keys or internal errors to clients
   - Log errors server-side for debugging
   - Return user-friendly error messages
   - Implement proper HTTP status codes

5. **Context Security**
   - Review context data before injecting into prompts
   - Avoid including sensitive information in context
   - Validate resume data structure and content
   - Sanitize user-provided data before context inclusion

### Performance Optimization

1. **Context Management**
   - Cache formatted resume context if data is static
   - Minimize context size to reduce token usage
   - Consider dynamic context based on conversation topic
   - Use efficient markdown formatting

2. **Streaming Optimization**
   - Use streaming for better perceived performance
   - Implement proper backpressure handling
   - Optimize network buffering settings
   - Consider WebSocket for bidirectional streaming

3. **Model Selection**
   - Use FAST model when possible for cost/speed
   - Reserve ADVANCED model for complex tasks
   - Profile token usage across different models
   - Monitor response latency per model

4. **Rate Limiting Strategy**
   - Use Redis or distributed cache for multi-instance
   - Implement sliding window for smoother limiting
   - Consider tier-based limits for authenticated users
   - Monitor and optimize limits based on API quotas

## AI Agent Workbench

The application includes a sophisticated AI Agent Workbench for conversational prompt refinement, testing, and deployment. This meta-demonstration showcases AI-first development by using AI to improve AI - enabling iterative refinement of agent prompts through natural language conversation, side-by-side testing, and version control.

### Overview

The AI Agent Workbench is a conversational interface for refining and testing AI agent prompts. Rather than manually editing system prompts, you describe desired changes in natural language, and the AI generates refined prompts that better capture your intent. This approach demonstrates using AI to improve AI systems through iterative refinement.

**Key Capabilities:**
- **Conversational Prompt Refinement**: Describe changes in natural language, AI generates refined prompts
- **Side-by-Side Testing**: Compare current vs. modified prompts with identical test cases
- **Version History**: Full version control with rollback capability
- **Resume Data Updates**: AI-powered resume content updates
- **Test Suite Management**: Define test cases with multiple criterion types

**Meta-Demonstration:**
This workbench demonstrates AI-first development principles:
- Using AI to improve AI agent behavior
- Natural language as the primary interface for technical changes
- Rapid iteration through conversational refinement
- Test-driven validation of prompt improvements

### Features

#### Conversational Prompt Refinement
Describe desired prompt changes in natural language, and the AI generates refined system prompts:

```typescript
// Example refinement request
"Make the chat agent more conversational and friendly while maintaining professionalism"

// AI generates refined prompt with changes highlighted
// Shows diff view of modifications
// Apply changes with one click
```

**Refinement Capabilities:**
- Tone and style adjustments (formal, casual, friendly, technical)
- Capability additions (new skills, knowledge areas, response patterns)
- Response structure changes (conciseness, detail level, formatting)
- Context integration improvements (better use of resume data)
- Safety and guardrail enhancements

#### Side-by-Side Testing
Test current vs. modified prompts with identical inputs to validate improvements:

```typescript
// Define test cases
const tests = [
  {
    question: "Tell me about Ryan's experience with React",
    criteria: [
      { type: "contains", value: "React" },
      { type: "first-person", expected: false },
      { type: "max-length", value: 500 }
    ]
  }
];

// Run both prompts simultaneously
// Compare results side-by-side
// View pass/fail for each criterion
// See performance metrics (tokens, latency)
```

**Testing Features:**
- Parallel execution for fair comparison
- Multiple criterion types for validation
- Aggregate metrics (pass rate, avg tokens, avg latency)
- Visual diff highlighting differences in responses
- Test suite persistence across sessions

#### Version History with Rollback
Complete version control for all prompt changes:

```typescript
// Version metadata
{
  versionId: "v1.2.3",
  timestamp: "2026-02-04T19:30:00Z",
  description: "Made agent more conversational and friendly",
  author: "admin",
  tokenCount: 1250,
  isActive: true,
  changes: [
    "Added conversational tone guidance",
    "Enhanced context usage patterns",
    "Improved error handling instructions"
  ]
}
```

**Version Management:**
- Automatic versioning on deployment
- Semantic version numbering (major.minor.patch)
- Detailed change descriptions
- One-click rollback to previous versions
- Version comparison (diff view)
- Only one active version per agent type

#### Resume Data Updates
AI-powered updates to resume content through natural language:

```typescript
// Example update request
"Add my new role as Senior Engineering Lead at TechCorp,
started January 2026, focusing on AI integration and team leadership"

// AI generates structured resume data
// Shows preview of changes
// Apply to update resume.ts
```

**Update Capabilities:**
- New experience entries with structured data
- Skill additions with proficiency levels
- Project updates with technologies and descriptions
- Principle additions for engineering philosophy
- Automatic formatting and validation

#### Test Suite Management
Define and manage comprehensive test cases for agent validation:

**Criterion Types:**
- `contains`: Response must contain specific text
- `first-person`: Response must/must not use first person ("I", "my")
- `token-limit`: Response must stay under token limit
- `max-length`: Response character length limit
- `response-time`: Maximum acceptable latency
- `sentiment`: Expected sentiment (positive, neutral, professional)

**Test Organization:**
- Group tests by category (basic queries, technical questions, edge cases)
- Reusable test suites
- Historical test results
- Pass/fail tracking over time

### Admin Routes

#### Pages

**`/admin/agent-workbench`** - Main workbench interface with tabbed navigation

Tabs:
- **Chat Agent**: Refine and test chat agent prompts
- **Resume Data**: Update resume content
- **Test Suite**: Manage test cases and run validations
- **Settings**: Configure workbench behavior

**`/admin/agent-workbench/history`** - Version history viewer

Features:
- List all prompt versions chronologically
- View version details and metadata
- Compare versions (diff view)
- Rollback to previous versions
- Export version history

#### API Routes

**`POST /api/admin/login`** - Admin authentication
```typescript
// Request
{ password: string }

// Response (success)
{ success: true, sessionId: string }

// Response (failure)
{ error: "Invalid password" }
```

**`POST /api/admin/logout`** - Session termination
```typescript
// Response
{ success: true }
```

**`POST /api/admin/refine-prompt`** - AI-powered prompt refinement
```typescript
// Request
{
  agentType: "chat" | "assessment" | "custom";
  currentPrompt: string;
  refinementRequest: string;
  context?: string;
}

// Response
{
  refinedPrompt: string;
  changes: string[];
  reasoning: string;
  tokenCount: number;
  estimatedImprovement: string;
}
```

**`POST /api/admin/test-prompt`** - Test prompt execution
```typescript
// Request
{
  prompt: string;
  testCases: Array<{
    question: string;
    criteria: Array<{
      type: "contains" | "first-person" | "token-limit" | "max-length";
      value?: string | number;
      expected?: boolean;
    }>;
  }>;
  compareWith?: string; // Compare with current active prompt
}

// Response
{
  results: Array<{
    question: string;
    response: string;
    passed: boolean;
    criteriaResults: Array<{
      type: string;
      passed: boolean;
      message: string;
    }>;
    tokenCount: number;
    latency: number;
  }>;
  metrics: {
    passRate: number;
    avgTokens: number;
    avgLatency: number;
  };
  comparison?: {
    currentResults: TestResults;
    modifiedResults: TestResults;
    improvement: string;
  };
}
```

**`POST /api/admin/deploy-prompt`** - Deploy refined prompt as new version
```typescript
// Request
{
  agentType: "chat" | "assessment" | "custom";
  prompt: string;
  description: string;
  changes: string[];
}

// Response
{
  success: true;
  version: {
    versionId: string;
    timestamp: string;
    description: string;
    tokenCount: number;
  };
}
```

**`GET /api/admin/prompt-history`** - Retrieve version history
```typescript
// Query params
?agentType=chat&limit=10&offset=0

// Response
{
  versions: Array<{
    versionId: string;
    timestamp: string;
    description: string;
    author: string;
    tokenCount: number;
    isActive: boolean;
    changes: string[];
  }>;
  total: number;
}
```

**`POST /api/admin/update-resume`** - Update resume data
```typescript
// Request
{
  updateRequest: string; // Natural language description
  section?: "experience" | "skills" | "projects" | "principles";
}

// Response
{
  preview: {
    section: string;
    changes: Array<{
      type: "add" | "modify" | "remove";
      path: string;
      before?: any;
      after?: any;
    }>;
  };
  applyUrl: string; // Endpoint to apply changes
}
```

### Prompt Versioning System

#### Storage Structure

Prompt versions are stored in `.admin/prompts/{agent-type}/{version-id}.json`:

```
.admin/
└── prompts/
    ├── chat/
    │   ├── v1.0.0.json
    │   ├── v1.1.0.json
    │   └── v1.2.0.json (active)
    ├── assessment/
    │   ├── v1.0.0.json
    │   └── v1.1.0.json (active)
    └── custom/
        └── v1.0.0.json (active)
```

#### Version Metadata Schema

```typescript
interface PromptVersion {
  versionId: string;           // Semantic version (v1.2.3)
  agentType: string;           // Agent type identifier
  timestamp: string;           // ISO 8601 timestamp
  description: string;         // Human-readable description
  author: string;              // Who created this version
  prompt: string;              // The actual system prompt
  tokenCount: number;          // Token count of prompt
  isActive: boolean;           // Currently deployed version
  changes: string[];           // List of changes from previous version
  metadata: {
    testResults?: TestResults; // Results from pre-deployment testing
    previousVersion?: string;  // Link to previous version
    rollbackCount: number;     // Number of times rolled back to this
    deploymentNotes?: string;  // Additional deployment context
  };
}
```

#### Versioning Functions

**Save New Version:**
```typescript
async function savePromptVersion(
  agentType: string,
  prompt: string,
  description: string,
  changes: string[]
): Promise<PromptVersion> {
  // Generate new semantic version
  const latestVersion = await getLatestVersion(agentType);
  const newVersion = incrementVersion(latestVersion);

  // Deactivate current active version
  await deactivateCurrentVersion(agentType);

  // Create version metadata
  const version: PromptVersion = {
    versionId: newVersion,
    agentType,
    timestamp: new Date().toISOString(),
    description,
    author: "admin",
    prompt,
    tokenCount: countTokens(prompt),
    isActive: true,
    changes,
    metadata: {
      previousVersion: latestVersion,
      rollbackCount: 0
    }
  };

  // Save to filesystem
  await fs.writeFile(
    `.admin/prompts/${agentType}/${newVersion}.json`,
    JSON.stringify(version, null, 2)
  );

  return version;
}
```

**Load Active Version:**
```typescript
async function loadActivePrompt(agentType: string): Promise<PromptVersion> {
  const versions = await listVersions(agentType);
  const active = versions.find(v => v.isActive);

  if (!active) {
    throw new Error(`No active version for agent type: ${agentType}`);
  }

  return active;
}
```

**List Versions:**
```typescript
async function listVersions(
  agentType: string,
  options?: { limit?: number; offset?: number }
): Promise<PromptVersion[]> {
  const dir = `.admin/prompts/${agentType}`;
  const files = await fs.readdir(dir);

  const versions = await Promise.all(
    files
      .filter(f => f.endsWith('.json'))
      .map(f => fs.readFile(path.join(dir, f), 'utf-8'))
      .map(async content => JSON.parse(await content))
  );

  // Sort by timestamp (newest first)
  versions.sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Apply pagination
  const { limit = 10, offset = 0 } = options || {};
  return versions.slice(offset, offset + limit);
}
```

**Rollback to Version:**
```typescript
async function rollbackToVersion(
  agentType: string,
  versionId: string
): Promise<void> {
  // Load target version
  const targetVersion = await loadVersion(agentType, versionId);

  // Deactivate current version
  await deactivateCurrentVersion(agentType);

  // Activate target version
  targetVersion.isActive = true;
  targetVersion.metadata.rollbackCount += 1;

  // Save updated version
  await saveVersion(targetVersion);

  // Create git commit for rollback
  await gitCommit(`Rollback ${agentType} prompt to ${versionId}`);
}
```

**Active Version Policy:**
- Only one version can be active per agent type at any time
- Activating a new version automatically deactivates the current one
- Rollback creates a new activation without creating a new version
- All version changes are tracked in git for audit trail

### Test Runner Capabilities

#### Test Case Definition

```typescript
interface TestCase {
  id: string;
  name: string;
  category: string;
  question: string;
  criteria: Criterion[];
  tags?: string[];
  priority?: "low" | "medium" | "high";
}

interface Criterion {
  type: "contains" | "first-person" | "token-limit" | "max-length" | "response-time" | "sentiment";
  value?: string | number;
  expected?: boolean;
  message?: string;
}
```

#### Criterion Types

**`contains` - Text Content Validation**
```typescript
{
  type: "contains",
  value: "React",
  message: "Response must mention React"
}
```
Validates that the response contains specific text (case-insensitive).

**`first-person` - Perspective Validation**
```typescript
{
  type: "first-person",
  expected: false,
  message: "Response should use third person (not 'I' or 'my')"
}
```
Validates response perspective (agent should speak about Ryan in third person).

**`token-limit` - Token Budget Validation**
```typescript
{
  type: "token-limit",
  value: 500,
  message: "Response must stay under 500 tokens"
}
```
Ensures response stays within token budget for cost control.

**`max-length` - Character Length Validation**
```typescript
{
  type: "max-length",
  value: 1000,
  message: "Response must be under 1000 characters"
}
```
Validates response character length for UI constraints.

**`response-time` - Latency Validation**
```typescript
{
  type: "response-time",
  value: 3000,
  message: "Response must complete within 3 seconds"
}
```
Ensures acceptable response latency for user experience.

**`sentiment` - Tone Validation**
```typescript
{
  type: "sentiment",
  value: "professional",
  message: "Response should maintain professional tone"
}
```
Validates response sentiment (positive, neutral, professional, technical).

#### Side-by-Side Comparison

When testing a modified prompt, the test runner executes both prompts in parallel:

```typescript
interface ComparisonResults {
  current: {
    results: TestResult[];
    metrics: Metrics;
    prompt: string;
  };
  modified: {
    results: TestResult[];
    metrics: Metrics;
    prompt: string;
  };
  improvement: {
    passRateDelta: number;      // +5% pass rate
    tokenDelta: number;          // -50 avg tokens
    latencyDelta: number;        // -200ms avg latency
    recommendation: string;      // "Deploy" or "Needs improvement"
  };
  sideBySide: Array<{
    question: string;
    currentResponse: string;
    modifiedResponse: string;
    currentPassed: boolean;
    modifiedPassed: boolean;
    diff: string;                // Visual diff of responses
  }>;
}
```

**Comparison Features:**
- Parallel execution for fair timing comparison
- Visual diff highlighting response differences
- Criterion-by-criterion comparison
- Aggregate metrics comparison (pass rate, tokens, latency)
- Improvement recommendations based on results

#### Metrics Calculation

```typescript
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
