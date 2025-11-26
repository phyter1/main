# Stack Page Specification

## Overview

The Stack page is an interactive exploration of your technical expertise. Instead of a boring skills list, it's a **visual, explorable diagram** that shows relationships, proficiency, and context.

---

## Core Concept: "The System Map"

Imagine your tech stack as a living system diagram—like an architecture diagram, but for your skills. Technologies are nodes, relationships are edges, and interacting with it reveals depth.

---

## Primary Visualization Options

### Option A: Layered Architecture View

```
┌─────────────────────────────────────────────────────────────┐
│                        USERS                                │
│                          ↓                                  │
├─────────────────────────────────────────────────────────────┤
│  FRONTEND          [React] [Next.js] [TypeScript]          │
│                          ↓                                  │
├─────────────────────────────────────────────────────────────┤
│  API LAYER         [Node.js] [Express] [tRPC]              │
│                          ↓                                  │
├─────────────────────────────────────────────────────────────┤
│  DATA              [PostgreSQL] [Redis] [Prisma]           │
│                          ↓                                  │
├─────────────────────────────────────────────────────────────┤
│  INFRASTRUCTURE    [AWS] [Terraform] [Docker] [EKS]        │
└─────────────────────────────────────────────────────────────┘
```

### Option B: Radial/Constellation View

```
                    [Docker]
                        \
         [Terraform]----[AWS]----[EKS]
                          \
                          [Node.js]
                              \
    [PostgreSQL]---[Prisma]---[●YOU]---[TypeScript]---[React]
                              /                         \
                         [Redis]                    [Next.js]
                                                        \
                                                     [Tailwind]
```

### Option C: Network Graph (Recommended)

Using React Flow, create a true network diagram where:
- Nodes = Technologies
- Edges = How they connect in your work
- Clusters = Categories (frontend, backend, infra)
- Node size = Proficiency level
- Edge thickness = How often you use them together

---

## Data Structure

```typescript
// data/stack.ts

export interface StackNode {
  id: string
  name: string
  category: 'frontend' | 'backend' | 'database' | 'infrastructure' | 'tools' | 'languages'
  icon: string // Lucide icon name or custom SVG
  proficiency: 'expert' | 'proficient' | 'familiar'
  yearsUsed: number
  lastUsed: 'current' | 'recent' | 'past' // Within 6mo, 1yr, older
  description: string
  highlights?: string[] // Key things you've done with it
  relatedProjects?: string[] // IDs of projects using this
}

export interface StackEdge {
  source: string
  target: string
  relationship: 'uses' | 'deploys' | 'integrates' | 'builds-on'
}

export const stackNodes: StackNode[] = [
  {
    id: 'typescript',
    name: 'TypeScript',
    category: 'languages',
    icon: 'FileCode',
    proficiency: 'expert',
    yearsUsed: 6,
    lastUsed: 'current',
    description: 'My primary language for all new projects. Strict mode always.',
    highlights: [
      'Full-stack TypeScript at Hugo Health',
      'Complex type systems for survey builders',
      'Shared types between frontend and backend'
    ]
  },
  {
    id: 'react',
    name: 'React',
    category: 'frontend',
    icon: 'Atom',
    proficiency: 'expert',
    yearsUsed: 7,
    lastUsed: 'current',
    description: 'Core frontend framework. Deep experience with hooks, context, and performance optimization.',
    highlights: [
      'Built component libraries from scratch',
      'Complex state management patterns',
      'Accessibility-first development'
    ]
  },
  // ... more nodes
]

export const stackEdges: StackEdge[] = [
  { source: 'typescript', target: 'react', relationship: 'uses' },
  { source: 'react', target: 'nextjs', relationship: 'builds-on' },
  { source: 'nextjs', target: 'vercel', relationship: 'deploys' },
  { source: 'terraform', target: 'aws', relationship: 'manages' },
  // ... more edges
]
```

---

## Page Layout

```
┌─────────────────────────────────────────────────────────────┐
│  My Tech Stack                                              │
│  [Interactive visualization of the technologies I work with]│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [Filter: All] [Frontend] [Backend] [Infra] [Tools]        │
│                                                             │
│  ┌───────────────────────────────────────┬─────────────────┤
│  │                                       │                 │
│  │                                       │  DETAIL PANEL   │
│  │         INTERACTIVE GRAPH             │                 │
│  │                                       │  [Selected      │
│  │         [Click a node to              │   Technology]   │
│  │          see details]                 │                 │
│  │                                       │  Icon + Name    │
│  │                                       │  Proficiency    │
│  │                                       │  Years Used     │
│  │                                       │  Description    │
│  │                                       │  Highlights     │
│  │                                       │  Projects →     │
│  │                                       │                 │
│  └───────────────────────────────────────┴─────────────────┤
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  LEGEND                                                     │
│  ● Expert  ◐ Proficient  ○ Familiar                        │
│  ━ Current  ─ Recent  ┄ Past                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Interactions

### Graph Interactions
- **Pan**: Click and drag background
- **Zoom**: Scroll wheel or pinch
- **Select node**: Click → highlights connected nodes, dims others
- **Hover node**: Shows quick tooltip with name + proficiency
- **Double-click**: Zooms to fit that node and connections

### Filter Behavior
- Clicking a category filter shows only those nodes
- Edges to other categories become dashed/dimmed
- "All" shows everything
- Smooth transition between states

### Detail Panel
- Slides in from right when node selected
- Shows full information
- Links to related projects
- "Back" button or click elsewhere to deselect

---

## Visual Design

### Node Styling

```css
/* Base node */
.stack-node {
  background: var(--bg-secondary);
  border: 2px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: var(--space-3);
}

/* Expert level */
.stack-node--expert {
  border-color: var(--accent-primary);
  box-shadow: 0 0 12px var(--accent-glow);
}

/* Proficient level */
.stack-node--proficient {
  border-color: var(--text-secondary);
}

/* Familiar level */
.stack-node--familiar {
  border-color: var(--border-subtle);
  opacity: 0.8;
}

/* Current use */
.stack-node--current::after {
  content: '';
  position: absolute;
  top: -4px;
  right: -4px;
  width: 8px;
  height: 8px;
  background: var(--success);
  border-radius: 50%;
}
```

### Edge Styling
- Active connections: Solid, accent color
- Inactive: Dashed, muted color
- Animated dashes for "data flow" effect

### Category Colors
Consider subtle background tints for clusters:
- Frontend: Cyan tint
- Backend: Purple tint
- Infrastructure: Orange tint
- Tools: Green tint

---

## Alternative: List View

For accessibility and mobile, provide a toggle to switch to list view:

```
┌─────────────────────────────────────────────────────────────┐
│  [Graph View]  [List View]                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  LANGUAGES                                                  │
│  ├─ TypeScript ●●●●● (6 years)                             │
│  └─ JavaScript ●●●●○ (10+ years)                           │
│                                                             │
│  FRONTEND                                                   │
│  ├─ React ●●●●● (7 years)                                  │
│  ├─ Next.js ●●●●○ (4 years)                                │
│  └─ Tailwind ●●●●○ (3 years)                               │
│                                                             │
│  ... etc                                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Notes

### React Flow Setup

```typescript
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
} from 'reactflow'

// Custom node component
function StackNodeComponent({ data }: { data: StackNode }) {
  return (
    <div className={`stack-node stack-node--${data.proficiency}`}>
      <Icon name={data.icon} />
      <span>{data.name}</span>
    </div>
  )
}

const nodeTypes = {
  stackNode: StackNodeComponent,
}
```

### Performance
- Use React Flow's built-in virtualization for many nodes
- Lazy load detail panel content
- Memoize node components
- Use CSS transitions, not JS animations for hover states

### Accessibility
- Keyboard navigation through nodes (arrow keys)
- Screen reader announces node details
- List view as fallback
- High contrast mode support

---

## Mobile Behavior

- Default to list view on mobile
- Graph view available but simplified (no minimap)
- Touch-friendly node selection
- Detail panel becomes bottom sheet
- Horizontal scroll for filters
