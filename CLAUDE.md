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

## Technology Stack

- **Framework**: Next.js 16 with App Router
- **React**: 19.2.0 with React Compiler enabled (next.config.ts)
- **Styling**: Tailwind CSS 4 with custom theming system
- **Linting/Formatting**: Biome (not ESLint/Prettier)
- **UI Components**: shadcn/ui (new-york style)
- **Fonts**: Fira Sans and Fira Mono from next/font/google
- **Package Manager**: Bun

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

## Code Quality Tools

### Biome Configuration
- Formatter: 2-space indentation
- Linter: Recommended rules enabled with React and Next.js domains
- VCS integration enabled (Git)
- Auto-organize imports on save
- Ignores: `node_modules`, `.next`, `dist`, `build`
- Special rule: `noUnknownAtRules` disabled for Tailwind compatibility

Always use `bun lint` and `bun format` (not `npm run lint` or other package managers).

## Next.js Configuration

- React Compiler enabled (`reactCompiler: true`)
- TypeScript strict mode enabled
- Module resolution: bundler
- Target: ES2017

## Content Writing Guidelines

When writing or editing content for this portfolio:

- **Never use em dashes (—) without spaces** - This is a telltale sign of AI-generated content
  - ❌ Bad: "AI agents—they're team members"
  - ✅ Good: "AI agents. They're team members." OR "AI agents are team members."
  - ✅ Also fine: "AI agents - they're team members" (single dash with spaces is acceptable)
- Use natural punctuation: periods, commas, single dashes with spaces, or break into separate sentences
- Write in a direct, human voice without overly formal or AI-typical phrasing
