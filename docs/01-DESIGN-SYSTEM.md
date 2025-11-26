# Design System

> **Current Status**: This project uses shadcn/ui with Tailwind CSS 4 and OKLCH color system. The design system below describes how to work with the existing setup and extend it.

## Color Palette

### OKLCH Color System

The project uses OKLCH (Oklab Lightness Chroma Hue) color space for better perceptual uniformity and smoother dark mode transitions. All colors are defined in `src/app/globals.css`.

### CSS Variables (Already Configured)

The current theme uses shadcn/ui's neutral palette. All colors are defined in both light and dark modes:

```css
:root {
  /* shadcn/ui semantic colors (already in globals.css) */
  --background: oklch(1 0 0);                    /* Pure white in light mode */
  --foreground: oklch(0.145 0 0);                /* Near black text */
  --primary: oklch(0.205 0 0);                   /* Primary actions */
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);      /* Red for errors */
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);                      /* Focus rings */
  --radius: 0.625rem;                            /* 10px base radius */

  /* Chart colors (if needed for data viz) */
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
}

.dark {
  /* Dark mode overrides (already in globals.css) */
  --background: oklch(0.145 0 0);                /* Near black */
  --foreground: oklch(0.985 0 0);                /* Near white text */
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --border: oklch(1 0 0 / 10%);                  /* 10% white */
  --input: oklch(1 0 0 / 15%);
  /* ... see globals.css for complete dark mode palette */
}
```

### Color Usage Rules (shadcn/ui Conventions)

| Element | Tailwind Class | CSS Variable |
|---------|----------------|--------------|
| Page background | `bg-background` | `--background` |
| Card backgrounds | `bg-card` | `--card` |
| Text (primary) | `text-foreground` | `--foreground` |
| Text (secondary) | `text-muted-foreground` | `--muted-foreground` |
| Primary actions | `bg-primary text-primary-foreground` | `--primary` |
| Secondary actions | `bg-secondary text-secondary-foreground` | `--secondary` |
| Accent/highlights | `bg-accent text-accent-foreground` | `--accent` |
| Destructive actions | `bg-destructive text-destructive-foreground` | `--destructive` |
| Borders | `border-border` | `--border` |
| Input borders | `border-input` | `--input` |
| Focus rings | `ring-ring` | `--ring` |

**Adding Custom Accent Colors:**
If you want to add a signature accent color (electric cyan, amber, etc.), you can:
1. Define new CSS variables in `globals.css`
2. Extend Tailwind config to use them
3. Override `--accent` and `--accent-foreground` variables

---

## Typography

### Font Stack (✅ Already Configured)

The project uses Fira font family for a clean, technical aesthetic:

```typescript
// lib/fonts.ts (already implemented)
import { Fira_Sans, Fira_Mono, Fira_Code } from 'next/font/google'

export const firaSans = Fira_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-fira-sans',
  display: 'swap',
})

export const firaMono = Fira_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-fira-mono',
  display: 'swap',
})

export const firaCode = Fira_Code({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-fira-code',
  display: 'swap',
})
```

**Font Usage:**
- `--font-fira-sans` → Body text, headings, UI elements
- `--font-fira-mono` → Code blocks, technical content, monospace needs
- `--font-fira-code` → Alternative for code with ligatures (available but not currently used)

### Type Scale

Use Tailwind's built-in type scale with the configured Fira fonts:

| Element | Tailwind Class | Font | Notes |
|---------|----------------|------|-------|
| Hero display | `text-6xl font-bold` | Fira Sans | 3.75rem / 60px |
| Page titles (h1) | `text-4xl font-bold` | Fira Sans | 2.25rem / 36px |
| Section titles (h2) | `text-3xl font-bold` | Fira Sans | 1.875rem / 30px |
| Subsection (h3) | `text-2xl font-semibold` | Fira Sans | 1.5rem / 24px |
| Body text | `text-base` | Fira Sans | 1rem / 16px |
| Small text | `text-sm` | Fira Sans | 0.875rem / 14px |
| Tiny text | `text-xs` | Fira Sans | 0.75rem / 12px |
| Code/Terminal | `font-mono` | Fira Mono | Use with any size class |

**Custom Sizes (if needed):**
```css
.text-display {
  font-size: 4rem;      /* 64px - Extra large hero */
  line-height: 1.1;
  font-family: var(--font-fira-sans);
}
```

### Typography Rules

- **Headings**: Fira Sans (font-bold or font-semibold)
- **Body text**: Fira Sans (font-normal)
- **Code/Technical**: Fira Mono (via `font-mono` class)
- **Consistency**: Stick to Fira family throughout for visual cohesion

---

## Spacing System

### Use Tailwind's Built-in Spacing

Tailwind provides a comprehensive spacing scale based on 4px increments. Use these instead of custom variables:

| Tailwind Class | Value | Common Use Case |
|----------------|-------|-----------------|
| `p-1` / `m-1` | 0.25rem (4px) | Tight spacing, icon gaps |
| `p-2` / `m-2` | 0.5rem (8px) | Small padding, compact UI |
| `p-3` / `m-3` | 0.75rem (12px) | List item gaps |
| `p-4` / `m-4` | 1rem (16px) | Standard spacing |
| `p-6` / `m-6` | 1.5rem (24px) | Card padding |
| `p-8` / `m-8` | 2rem (32px) | Section padding |
| `p-12` / `m-12` | 3rem (48px) | Large section gaps |
| `p-16` / `m-16` | 4rem (64px) | Hero section spacing |
| `p-24` / `m-24` | 6rem (96px) | Major section breaks |
| `p-32` / `m-32` | 8rem (128px) | Extra large spacing |

### Spacing Guidelines

| Context | Tailwind Classes |
|---------|------------------|
| Between page sections | `my-24` or `my-32` |
| Section internal padding | `py-16 px-8` |
| Between cards in grid | `gap-6` |
| Card internal padding | `p-6` |
| Between list items | `space-y-3` |
| Icon + text gap | `gap-2` |

---

## Border Radius

### shadcn/ui Radius System (✅ Already Configured)

The project uses a custom radius system defined in `globals.css`:

```css
:root {
  --radius: 0.625rem;  /* 10px base radius */
}

/* Auto-calculated variants in @theme */
--radius-sm: calc(var(--radius) - 4px);   /* 6px */
--radius-md: calc(var(--radius) - 2px);   /* 8px */
--radius-lg: var(--radius);                /* 10px */
--radius-xl: calc(var(--radius) + 4px);   /* 14px */
```

### Tailwind Classes

| Element | Class | Computed Value |
|---------|-------|----------------|
| Small elements | `rounded-sm` | 6px |
| Default (inputs) | `rounded-md` | 8px |
| Cards, modals | `rounded-lg` | 10px |
| Large cards | `rounded-xl` | 14px |
| Circular (avatars) | `rounded-full` | 9999px |

**Note**: shadcn/ui components automatically use the appropriate radius from the theme.

---

## Shadows & Effects

```css
:root {
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.4);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.5);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.6);
  --shadow-glow: 0 0 var(--glow-spread) var(--accent-glow);
  
  /* Backdrop blur */
  --blur-sm: 8px;
  --blur-md: 16px;
  --blur-lg: 24px;
}
```

### Glow Effect (Accent Elements)

```css
.glow {
  box-shadow: 
    0 0 20px var(--accent-glow),
    0 0 40px var(--accent-glow),
    inset 0 0 20px var(--accent-glow);
}
```

---

## Motion Tokens

```css
:root {
  /* Durations */
  --duration-fast: 150ms;
  --duration-normal: 300ms;
  --duration-slow: 500ms;
  --duration-slower: 800ms;
  
  /* Easings */
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

### Animation Guidelines

| Interaction | Duration | Easing |
|-------------|----------|--------|
| Button hover | `--duration-fast` | `--ease-out` |
| Card hover lift | `--duration-normal` | `--ease-spring` |
| Page transitions | `--duration-slow` | `--ease-in-out` |
| Staggered reveals | `--duration-slower` | `--ease-out` |

---

## Z-Index Scale

```css
:root {
  --z-base: 0;
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-overlay: 300;
  --z-modal: 400;
  --z-toast: 500;
  --z-command-palette: 600;
}
```

---

## Breakpoints

```typescript
// Tailwind config extension
const screens = {
  'sm': '640px',
  'md': '768px',
  'lg': '1024px',
  'xl': '1280px',
  '2xl': '1536px',
}
```

### Responsive Strategy

- **Mobile (< 768px)**: Stack layouts, simplified animations
- **Tablet (768-1024px)**: 2-column grids
- **Desktop (> 1024px)**: Full experience with all effects
- **Large (> 1280px)**: Expanded margins, larger type scale

---

## Grain Texture Overlay

```css
.grain-overlay {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9999;
  opacity: var(--grain-opacity);
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
}
```
