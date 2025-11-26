# Implementation Quick Start

> **Current Project Status**: ✅ Base setup complete. This guide shows what's already done and what's next.

## Getting Started

### 1. ✅ Project Already Initialized

Your project is already set up with:
- Next.js 16 with App Router
- TypeScript (strict mode)
- Tailwind CSS 4
- shadcn/ui configured (new-york style)
- Fira Sans & Fira Mono fonts
- Biome for linting/formatting
- React Compiler enabled

**Skip to** [Step 2: Install Additional Dependencies](#2-install-additional-dependencies)

### 2. Install Additional Dependencies

```bash
# Animation library
bun add framer-motion

# Diagrams (for Stack and Infrastructure pages)
bun add reactflow

# Date utilities (already installed)
# bun add date-fns

# shadcn/ui components are installed as needed (see below)
```

### 3. ✅ Tailwind Already Configured

Tailwind CSS 4 is already set up with:
- OKLCH color system in `src/app/globals.css`
- Fira Sans and Fira Mono fonts
- Custom theming via CSS variables
- shadcn/ui integration

**No additional Tailwind config needed** - the project uses Tailwind 4's new CSS-first configuration.

---

## Implementation Phases

### Phase 1: Foundation ✅ PARTIALLY COMPLETE

**Already Done**:
- ✅ Project structure set up
- ✅ Fonts configured (Fira Sans + Fira Mono)
- ✅ Design system CSS variables (OKLCH colors in globals.css)
- ✅ shadcn/ui configured and ready
- ✅ Basic utilities (cn helper, fonts)
- ✅ Root layout with fonts
- ✅ Basic homepage

**Still To Do**:
- [ ] Install shadcn/ui components (Button, Card, Badge, etc.)
- [ ] Build Navigation component
- [ ] Add GrainOverlay effect
- [ ] Create additional page routes

**Deliverable**: Navigable skeleton with consistent styling

**Commands to Complete Phase 1**:
```bash
# Install core shadcn/ui components
npx shadcn@latest add button card badge separator

# Install Framer Motion for animations
bun add framer-motion

# Create component directories
mkdir -p src/components/{layout,sections,effects}
```

### Phase 2: Landing Page (Week 1-2)

- [ ] Build Hero section with typewriter effect
- [ ] Add stats bar with counter animation
- [ ] Create featured projects preview (placeholder data)
- [ ] Add stack icons preview
- [ ] Implement scroll-triggered reveals
- [ ] Add CursorGlow effect

**Deliverable**: Complete, animated landing page

### Phase 3: About Page (Week 2)

- [ ] Create Timeline component
- [ ] Populate career history data
- [ ] Build philosophy cards section
- [ ] Add working style content
- [ ] Implement "beyond code" section

**Deliverable**: Complete about page with timeline

### Phase 4: Stack Page (Week 2-3)

- [ ] Set up React Flow
- [ ] Create custom StackNode component
- [ ] Define stack data (nodes and edges)
- [ ] Implement category filters
- [ ] Build detail panel
- [ ] Add list view fallback

**Deliverable**: Interactive tech stack explorer

### Phase 5: Projects Page (Week 3)

- [ ] Create ProjectCard component
- [ ] Build featured project layout
- [ ] Implement filtering/sorting
- [ ] Create project detail modal/page
- [ ] Add project data

**Deliverable**: Complete projects showcase

### Phase 6: Infrastructure Page (Week 3-4)

- [ ] Configure React Flow for infra diagram
- [ ] Create custom InfraNode component
- [ ] Define infrastructure data
- [ ] Add animated edges
- [ ] Build detail panel
- [ ] Add IaC showcase section

**Deliverable**: Interactive infrastructure visualization

### Phase 7: Polish (Week 4)

- [ ] Implement Command Palette
- [ ] Add page transitions
- [ ] Test reduced motion support
- [ ] Mobile responsive testing
- [ ] Performance optimization
- [ ] SEO and meta tags
- [ ] Deploy to Vercel

**Deliverable**: Production-ready portfolio

---

## File Creation Order

### Already Created ✅
```bash
src/lib/fonts.ts                    ✅ Fira fonts configured
src/lib/utils.ts                    ✅ cn() helper
src/app/globals.css                 ✅ OKLCH theme + Tailwind
src/app/layout.tsx                  ✅ Root layout with fonts
src/app/page.tsx                    ✅ Basic homepage
components.json                     ✅ shadcn/ui config
```

### Install shadcn/ui Components (as needed)
```bash
# Core UI primitives
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add badge

# Forms and inputs
npx shadcn@latest add input
npx shadcn@latest add textarea

# Navigation and dialogs
npx shadcn@latest add dialog
npx shadcn@latest add command
npx shadcn@latest add separator
npx shadcn@latest add tabs

# Feedback
npx shadcn@latest add tooltip
npx shadcn@latest add toast

# These will create files in src/components/ui/
```

### Custom Components to Build

```bash
# 1. Effects
src/components/effects/GrainOverlay.tsx
src/components/effects/CursorGlow.tsx
src/components/effects/TypeWriter.tsx

# 2. Layout
src/components/layout/Navigation.tsx
src/components/layout/Footer.tsx
src/components/layout/PageTransition.tsx

# 3. Hooks
src/hooks/useReducedMotion.ts
src/hooks/useCommandPalette.ts

# 4. Data files
src/data/projects.ts
src/data/stack.ts
src/data/timeline.ts
src/data/infrastructure.ts
src/data/commands.ts

# 5. Section components
src/components/sections/Hero.tsx
src/components/sections/Timeline.tsx
src/components/sections/StackDiagram.tsx
src/components/sections/ProjectCard.tsx
src/components/sections/InfraGraph.tsx

# 6. Pages
src/app/about/page.tsx
src/app/stack/page.tsx
src/app/projects/page.tsx
src/app/projects/[slug]/page.tsx
src/app/infrastructure/page.tsx
src/app/contact/page.tsx
```

---

## Content Checklist

### Personal Information
- [ ] Full name and title
- [ ] Location
- [ ] Professional tagline
- [ ] Bio/about text
- [ ] Contact email
- [ ] Social links (GitHub, LinkedIn, Twitter/X)

### Career History
- [ ] All positions with dates
- [ ] Key responsibilities
- [ ] Notable achievements
- [ ] Technologies used per role

### Projects
- [ ] Project titles and descriptions
- [ ] Screenshots/thumbnails
- [ ] Technology stacks
- [ ] Live demo links
- [ ] GitHub repos
- [ ] Metrics (if available)

### Tech Stack
- [ ] All technologies categorized
- [ ] Proficiency levels
- [ ] Years of experience
- [ ] Key projects per technology

### Infrastructure
- [ ] Personal infra diagram
- [ ] Service descriptions
- [ ] Terraform/IaC examples

---

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Custom domain set up
- [ ] Analytics added (optional)
- [ ] Performance tested (Lighthouse 90+)
- [ ] Accessibility tested
- [ ] Mobile tested
- [ ] OG images created
- [ ] Sitemap generated
- [ ] robots.txt configured

---

## Quick Wins for Impact

1. **Typewriter hero** — Immediately signals "developer portfolio"
2. **Dark theme** — Professional, modern feel
3. **Command palette** — Power user feature that impresses
4. **Animated counters** — Makes stats feel dynamic
5. **Infrastructure diagram** — Unique differentiator
6. **Live project demos** — Shows, don't tell

---

## Quick Command Reference

### Development Commands (Bun)

```bash
# Start dev server
bun dev

# Build for production
bun build

# Start production server
bun start

# Lint code (Biome)
bun lint

# Format code (Biome)
bun format

# Install a package
bun add <package-name>

# Install a dev dependency
bun add -D <package-name>
```

### shadcn/ui Commands

```bash
# Add a specific component
npx shadcn@latest add button

# Add multiple components at once
npx shadcn@latest add button card badge dialog

# Update components.json config
npx shadcn@latest init
```

### Biome Commands

```bash
# Check code (lint + format check)
bun lint

# Format code
bun format

# Auto-fix linting issues
bunx biome check --write

# Format and organize imports
bunx biome format --write
```

---

## Resources

- [Next.js 16 Docs](https://nextjs.org/docs)
- [shadcn/ui Components](https://ui.shadcn.com/docs/components)
- [Framer Motion](https://www.framer.com/motion/)
- [React Flow](https://reactflow.dev/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)
- [Fira Sans Font](https://fonts.google.com/specimen/Fira+Sans)
- [Fira Mono Font](https://fonts.google.com/specimen/Fira+Mono)
- [Biome Docs](https://biomejs.dev/)
- [OKLCH Color Picker](https://oklch.com/)
