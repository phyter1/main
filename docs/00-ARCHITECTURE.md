# Portfolio Architecture Overview

## Vision: "The Living System"

Your portfolio isn't a static resume—it's a **living system** that demonstrates your engineering philosophy. The aesthetic direction: **Terminal Noir meets Data Visualization**—a dark, sophisticated interface where code and infrastructure come alive through subtle animations and interactive elements.

### Core Concept

The site behaves like a sophisticated monitoring dashboard—the kind you'd build for a production system. Visitors explore your career the way an engineer explores a codebase: through layers of abstraction, interactive diagrams, and real data.

---

## Design Philosophy

### Aesthetic Direction: "Refined Technical"

- **Dark-first**: OKLCH-based dark theme with neutral base colors
- **Typography**: Fira Sans for body text, Fira Mono for code and technical elements
- **Accent color**: Customizable via CSS variables (currently using neutral theme from shadcn/ui)
- **Motion**: Subtle, purposeful—like cursor blinks and terminal outputs
- **Texture**: Subtle noise grain, scan lines on hover, depth through layered shadows

> **Note**: The design system uses OKLCH color space for better perceptual uniformity and dark mode support. All colors are defined as CSS variables in `src/app/globals.css`.

### What Makes It Unforgettable

1. **Infrastructure Visualization**: An interactive diagram of your personal/professional stack that visitors can explore
2. **Live Project Demos**: Embedded, functional mini-versions of your projects
3. **Command Palette Navigation**: Press `Cmd+K` to navigate like a power user
4. **"Git History" Timeline**: Your career rendered as a commit graph
5. **Real Metrics**: Actual stats from your projects (if public)

---

## Technical Stack

```
Framework:      Next.js 16 (App Router) with React 19.2
Language:       TypeScript (strict mode)
Styling:        Tailwind CSS 4 + OKLCH color system
UI Components:  shadcn/ui (new-york style) - already installed
Animation:      Framer Motion
3D/Diagrams:    React Flow (for infra diagrams)
Icons:          Lucide React
Fonts:          Fira Sans + Fira Mono (via next/font/google)
Linting:        Biome (replaces ESLint/Prettier)
React Features: React Compiler enabled
Package Mgr:    Bun
Deployment:     Vercel (or your own AWS infra)
```

### Current Setup Status

✅ **Already Configured:**
- shadcn/ui component library (new-york style, RSC-enabled)
- Tailwind CSS 4 with custom OKLCH color theming
- Fira Sans & Fira Mono fonts
- TypeScript with strict mode
- Biome for linting and formatting
- React Compiler enabled in Next.js config

⏳ **To Be Implemented:**
- Component library (using shadcn/ui as foundation)
- Framer Motion animations
- React Flow diagrams
- Page routes and content

---

## Site Structure

```
/                       → Landing (hero + quick navigation)
/about                  → Background, philosophy, personality
/stack                  → Interactive tech stack explorer
/projects               → Project showcase with live demos
/infrastructure         → Your personal infra visualization
/contact                → Contact form + social links
```

---

## File Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout with font configuration ✅
│   ├── page.tsx                # Landing page (basic setup done) ✅
│   ├── globals.css             # Tailwind + OKLCH theme variables ✅
│   ├── about/page.tsx
│   ├── stack/page.tsx
│   ├── projects/page.tsx
│   ├── infrastructure/page.tsx
│   └── contact/page.tsx
├── components/
│   ├── ui/                     # shadcn/ui components (install as needed)
│   │   ├── button.tsx          # npx shadcn@latest add button
│   │   ├── card.tsx            # npx shadcn@latest add card
│   │   ├── badge.tsx           # npx shadcn@latest add badge
│   │   └── ...                 # Add others as needed
│   ├── layout/                 # Layout components
│   │   ├── Navigation.tsx
│   │   ├── Footer.tsx
│   │   └── PageTransition.tsx
│   ├── sections/               # Page sections
│   │   ├── Hero.tsx
│   │   ├── StackDiagram.tsx
│   │   ├── ProjectCard.tsx
│   │   ├── InfraGraph.tsx
│   │   └── Timeline.tsx
│   └── effects/                # Visual effects
│       ├── GrainOverlay.tsx
│       ├── CursorGlow.tsx
│       └── TypeWriter.tsx
├── hooks/                      # Custom hooks
│   ├── useCommandPalette.ts
│   └── useReducedMotion.ts
├── lib/                        # Utilities
│   ├── fonts.ts                # Fira Sans & Fira Mono config ✅
│   ├── utils.ts                # cn() helper ✅
│   └── constants.ts
└── data/                       # Content data
    ├── projects.ts
    ├── stack.ts
    └── timeline.ts
```

**Key Points:**
- ✅ = Already implemented
- `src/components/ui/` is reserved for shadcn/ui components
- Use `npx shadcn@latest add <component>` to install shadcn components
- Custom components go in other directories (layout/, sections/, effects/)
- No separate styles/ directory needed (globals.css is in app/)

---

## Document Index

| Document | Purpose |
|----------|---------|
| `01-DESIGN-SYSTEM.md` | Colors, typography, spacing, component tokens |
| `02-COMPONENTS.md` | All component specifications |
| `03-LANDING-PAGE.md` | Hero section and landing experience |
| `04-ABOUT-PAGE.md` | Background and personality section |
| `05-STACK-PAGE.md` | Interactive tech stack explorer |
| `06-PROJECTS-PAGE.md` | Project showcase specifications |
| `07-INFRASTRUCTURE-PAGE.md` | Personal infra visualization |
| `08-INTERACTIONS.md` | Animations, transitions, command palette |

---

## Key Principles

1. **Performance First**: Static generation where possible, lazy load heavy components
2. **Accessibility**: Keyboard navigation, reduced motion support, semantic HTML
3. **Progressive Enhancement**: Core content works without JS
4. **Content as Data**: All content lives in typed data files for easy updates
5. **Mobile-Conscious**: Responsive, but optimized for the developer audience (desktop-first)
