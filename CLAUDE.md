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

## AI Integration

This project uses the Vercel AI SDK with Anthropic's models for AI-powered features.

### Setup

1. **Environment Configuration**
   ```bash
   # Copy the example environment file
   cp .env.local.example .env.local

   # Add your Anthropic API key to .env.local
   # Get your API key from: https://console.anthropic.com/settings/keys
   ```

2. **Environment Variables**
   - `ANTHROPIC_API_KEY` (required): Your Anthropic API key
   - `AI_MAX_REQUESTS_PER_MINUTE` (optional): Rate limit for AI requests (default: 10)
   - `AI_MAX_TOKENS_PER_REQUEST` (optional): Max tokens per request (default: 4096)

### Available Models

The AI configuration (`src/lib/ai-config.ts`) provides access to three model tiers:

- **CHAT**: Claude Sonnet 4.5 - Primary model for chat completions and interactive features
- **FAST**: Claude 3.5 Haiku - Optimized for fast, simple tasks
- **ADVANCED**: Claude Opus 4.5 - Best for complex reasoning and advanced tasks

### Usage Example

```typescript
import { createAnthropicClient, AI_RATE_LIMITS } from '@/lib/ai-config';

// Create a client with the default CHAT model
const client = createAnthropicClient();

// Or specify a different model
const fastClient = createAnthropicClient('FAST');
const advancedClient = createAnthropicClient('ADVANCED');

// Access rate limiting constants
console.log(AI_RATE_LIMITS.MAX_REQUESTS_PER_MINUTE);
```

### Rate Limiting

Rate limits are configured in `src/lib/ai-config.ts`:
- Maximum 10 requests per minute (configurable via environment)
- Maximum 4096 tokens per request (configurable via environment)
- 30 second request timeout
- 3 retry attempts with 1 second delay

### Environment Validation

The AI configuration module automatically validates environment variables:
- Checks for required `ANTHROPIC_API_KEY` presence
- Validates API key format (warns if doesn't match expected pattern)
- Throws descriptive errors if configuration is invalid
- Safe for Next.js build process (non-blocking during static generation)

### Security Notes

- Never commit `.env.local` files containing actual API keys
- Use `.env.local.example` as a template for team members
- API keys are only validated in server-side contexts
- Environment variables are not exposed to the client bundle
