# Component Specifications

> **Current Status**: Use shadcn/ui components as the foundation. Install them with `npx shadcn@latest add <component>`. Custom components should be built in other directories (layout/, sections/, effects/).

## Component Strategy

**Use shadcn/ui for**:

- ✅ Basic UI primitives (Button, Card, Badge, Input, Dialog, etc.)
- ✅ Form components (Input, Select, Checkbox, etc.)
- ✅ Layout utilities (Separator, Tabs, etc.)
- ✅ Feedback components (Tooltip, Toast, Alert, etc.)

**Build custom for**:

- 🎨 Portfolio-specific components (Hero, ProjectCard, StackDiagram, etc.)
- 🎨 Visual effects (GrainOverlay, CursorGlow, TypeWriter)
- 🎨 Layout components (Navigation, Footer, PageTransition)
- 🎨 Specialized visualizations (InfraGraph, Timeline)

**Key Points**:

- shadcn/ui components live in `src/components/ui/`
- Custom components live in `src/components/layout/`, `src/components/sections/`, `src/components/effects/`
- All shadcn/ui components use your theme automatically (OKLCH colors, Fira fonts, etc.)

## UI Primitives (shadcn/ui)

### Button

**Installation**: `npx shadcn@latest add button`

The shadcn/ui Button component provides these variants out of the box:

```typescript
import { Button } from '@/components/ui/button'

// Usage
<Button variant="default">Primary Action</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="outline">Outline</Button>
<Button variant="destructive">Delete</Button>
<Button variant="link">Link Style</Button>

// Sizes
<Button size="default">Default</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="icon">Icon Only</Button>
```

**Built-in Features**:

- Automatic focus states with ring
- Loading state support (add manually with lucide-react icons)
- Disabled states
- Full TypeScript support
- Accessibility (ARIA attributes)

**Customization**:
The button uses `class-variance-authority` for variants. To add custom variants, edit `src/components/ui/button.tsx` after installation.

---

### Card

**Installation**: `npx shadcn@latest add card`

shadcn/ui provides a flexible Card component with sub-components:

```typescript
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'

// Basic usage
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description text</CardDescription>
  </CardHeader>
  <CardContent>
    Main card content goes here
  </CardContent>
  <CardFooter>
    Footer content (buttons, links, etc.)
  </CardFooter>
</Card>

// Interactive card with hover effect
<Card className="hover:shadow-lg transition-shadow cursor-pointer">
  {/* content */}
</Card>
```

**Built-in Styling**:

- Background: `bg-card`
- Border: `border-border`
- Rounded corners: `rounded-lg`
- Proper semantic structure

---

### Badge

**Installation**: `npx shadcn@latest add badge`

```typescript
import { Badge } from '@/components/ui/badge'

// Variants
<Badge variant="default">Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Error</Badge>
<Badge variant="outline">Outline</Badge>
```

---

### Other Available shadcn/ui Components

Install these as needed for your portfolio:

| Component | Installation Command | Use Case |
|-----------|---------------------|----------|
| **Dialog** | `npx shadcn@latest add dialog` | Modals, project details |
| **Input** | `npx shadcn@latest add input` | Contact forms |
| **Separator** | `npx shadcn@latest add separator` | Visual dividers |
| **Tabs** | `npx shadcn@latest add tabs` | Project categories, stack filters |
| **Tooltip** | `npx shadcn@latest add tooltip` | Stack icons, tech details |
| **Command** | `npx shadcn@latest add command` | Command palette (Cmd+K) |
| **Avatar** | `npx shadcn@latest add avatar` | Profile images |
| **Skeleton** | `npx shadcn@latest add skeleton` | Loading states |

Browse all components: <https://ui.shadcn.com/docs/components>

---

## Custom Components to Build

The following components are portfolio-specific and should be built custom in `src/components/`:

### Terminal (Custom)

Location: `src/components/ui/terminal.tsx` or `src/components/effects/terminal.tsx`

A styled container that mimics a terminal window:

```typescript
interface TerminalProps {
  title?: string
  children: React.ReactNode
  showControls?: boolean  // Red/yellow/green dots
  className?: string
}
```

**Implementation Notes**:

- Use `bg-zinc-950` or similar dark background
- Add macOS-style traffic lights (decorative)
- Use `font-mono` for all text
- Consider using the TypeWriter effect component for content

---

### CommandPalette (Use shadcn/ui Command)

**Installation**: `npx shadcn@latest add command` + `npx shadcn@latest add dialog`

Build this using shadcn's Command component wrapped in a Dialog:

```typescript
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command'
import { Dialog, DialogContent } from '@/components/ui/dialog'

// See 08-INTERACTIONS.md for full implementation
```

---

## Layout Components

### Navigation

Fixed top navigation with:

- Logo/name on left
- Nav links center (hidden on mobile)
- Command palette trigger on right
- Mobile: hamburger menu

**Behavior**:

- Transparent initially
- Gains backdrop blur on scroll
- Active page indicator (accent underline)

```typescript
interface NavItem {
  label: string
  href: string
  shortcut?: string  // For command palette
}
```

---

### Footer

Minimal footer with:

- Social links (GitHub, LinkedIn, Twitter/X, Email)
- "Built with" stack badges
- Copyright year

---

### PageTransition

Wrapper component for page-level animations.

```typescript
interface PageTransitionProps {
  children: React.ReactNode
}
```

**Animation**:

- Fade in + slide up on enter
- Staggered children reveals
- Exit: fade out + slide down

---

## Section Components

### Hero

Landing page hero section.

**Elements**:

1. Greeting with typewriter effect: `> Hello, I'm Ryan_`
2. Large display headline: role/title
3. Brief tagline in secondary text
4. CTA buttons: "View Projects" + "Get in Touch"
5. Scroll indicator at bottom

**Background**:

- Subtle gradient mesh
- Optional: animated grid pattern
- Grain overlay

---

### StackDiagram

Interactive tech stack visualization.

```typescript
interface StackNode {
  id: string
  label: string
  icon: string
  category: 'frontend' | 'backend' | 'infrastructure' | 'tools'
  proficiency: 'expert' | 'proficient' | 'familiar'
  description: string
  yearsUsed: number
}
```

**Visualization Options**:

1. **Radial/Orbit**: Technologies orbit around "You" center
2. **Layered**: Frontend → Backend → Infra layers
3. **Network Graph**: Connected nodes showing relationships

**Interactions**:

- Hover reveals tooltip with details
- Click opens expanded view
- Filter by category
- Nodes pulse based on "activity" or proficiency

---

### ProjectCard

```typescript
interface Project {
  id: string
  title: string
  description: string
  thumbnail?: string
  technologies: string[]
  links: {
    demo?: string
    github?: string
    article?: string
  }
  featured: boolean
  status: 'live' | 'in-progress' | 'archived'
  metrics?: {
    users?: number
    stars?: number
    // etc.
  }
}
```

**Card Layout**:

- Thumbnail/preview at top (optional: live embed)
- Title + status badge
- Description (2-3 lines, truncated)
- Tech stack as small badges
- Action links

**Featured Projects**:

- Larger card size
- Embedded demo if possible
- More detailed metrics

---

### InfraGraph

Interactive infrastructure diagram using React Flow.

```typescript
interface InfraNode {
  id: string
  type: 'service' | 'database' | 'cdn' | 'external' | 'user'
  label: string
  provider?: 'aws' | 'vercel' | 'cloudflare' | 'custom'
  icon: string
  description: string
  status?: 'active' | 'deprecated'
}

interface InfraEdge {
  source: string
  target: string
  label?: string
  animated?: boolean
}
```

**Features**:

- Pan and zoom
- Click nodes for details panel
- Animated data flow on edges
- Toggle layers (frontend, backend, data)
- Provider-specific icons

---

### Timeline

Career history as a git-style commit graph.

```typescript
interface TimelineEvent {
  id: string
  type: 'job' | 'project' | 'milestone' | 'education'
  title: string
  organization?: string
  description: string
  date: string | { start: string; end?: string }
  highlights?: string[]
  technologies?: string[]
}
```

**Visual Style**:

- Vertical line (the "branch")
- Commit dots along the line
- Events branch off with connector lines
- Different colors/icons for event types
- Expandable details on click

---

## Effect Components

### GrainOverlay

Full-screen noise texture overlay. See design system for implementation.

---

### CursorGlow

Subtle glow that follows the cursor.

```typescript
interface CursorGlowProps {
  color?: string
  size?: number
  blur?: number
}
```

**Implementation Notes**:

- Use CSS custom properties updated via JS
- Apply to a fixed-position pseudo-element
- Disable on touch devices
- Respect `prefers-reduced-motion`

---

### TypeWriter

Text reveal with typewriter effect.

```typescript
interface TypeWriterProps {
  text: string | string[]
  speed?: number
  delay?: number
  cursor?: boolean
  onComplete?: () => void
}
```

**Features**:

- Configurable typing speed
- Blinking cursor
- Support for multiple lines (with pause between)
- Callback when complete

---

## Utility Components

### VisuallyHidden

For accessible hidden content.

### SkipLink

Skip to main content link for keyboard users.

### FocusTrap

Trap focus within modals/dialogs.

### ReducedMotion

Wrapper that respects `prefers-reduced-motion`.
