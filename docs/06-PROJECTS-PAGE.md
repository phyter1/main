# Projects Page Specification

## Overview

The Projects page showcases your work—both professional highlights and personal projects. The key differentiator: **live demos and real depth**, not just screenshots and bullet points.

---

## Page Structure

```
[Page Header]
Projects

[Filter Bar]
[Featured Projects Section]
[All Projects Grid]
[Archived/Legacy Section (collapsed)]
```

---

## Project Data Structure

```typescript
// data/projects.ts

export interface Project {
  id: string
  title: string
  slug: string
  tagline: string // One-liner
  description: string // 2-3 paragraphs
  
  // Categorization
  type: 'professional' | 'personal' | 'open-source'
  status: 'live' | 'in-progress' | 'completed' | 'archived'
  featured: boolean
  
  // Visual
  thumbnail?: string
  screenshots?: string[]
  color?: string // Accent color for this project
  
  // Technical
  technologies: string[]
  architecture?: string // Brief architecture description
  challenges?: string[] // Technical challenges solved
  
  // Links
  links: {
    demo?: string
    github?: string
    article?: string
    video?: string
  }
  
  // Metrics (optional)
  metrics?: {
    users?: number | string
    uptime?: string
    performance?: string
    custom?: { label: string; value: string }[]
  }
  
  // Timeline
  startDate: string
  endDate?: string
  
  // For case study expansion
  caseStudy?: {
    problem: string
    approach: string
    solution: string
    results: string
    learnings: string[]
  }
}

export const projects: Project[] = [
  {
    id: 'blackjack-trainer',
    title: 'Blackjack Trainer',
    slug: 'blackjack-trainer',
    tagline: 'A comprehensive card counting and strategy training application',
    description: `
      A full-featured blackjack training application with realistic casino 
      visuals, multiple counting systems, and configurable rule variations.
      Built to demonstrate complex state management and game logic in React.
    `,
    type: 'personal',
    status: 'in-progress',
    featured: true,
    technologies: ['TypeScript', 'React', 'Tailwind', 'Framer Motion'],
    challenges: [
      'Realistic card animations and chip stacking',
      'Accurate counting system implementations',
      'Configurable rule engines'
    ],
    links: {
      github: 'https://github.com/...',
      demo: 'https://...'
    }
  },
  {
    id: 'survey-platform',
    title: 'Healthcare Survey Platform',
    slug: 'survey-platform',
    tagline: 'Self-service survey builder serving 30,000+ active users',
    description: `
      A comprehensive survey platform for healthcare data collection with 
      custom input types including pain body maps, prescription lookups, 
      and complex branching logic.
    `,
    type: 'professional',
    status: 'live',
    featured: true,
    technologies: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'AWS'],
    metrics: {
      users: '30,000+',
      custom: [
        { label: 'Survey Responses', value: '1M+' },
        { label: 'Custom Input Types', value: '15+' }
      ]
    },
    caseStudy: {
      problem: 'Healthcare organizations needed flexible data collection...',
      approach: 'Built a modular, extensible architecture...',
      solution: 'Implemented a custom survey builder with...',
      results: 'Platform now serves 30k+ users with 99.9% uptime',
      learnings: [
        'Complex form state management patterns',
        'Healthcare compliance considerations',
        'Building for non-technical users'
      ]
    }
  },
  // ... more projects
]
```

---

## Sections

### 1. Page Header

```
Projects

I build things that solve real problems—from healthcare platforms
serving thousands to personal tools that scratch my own itch.
```

### 2. Filter Bar

```
┌─────────────────────────────────────────────────────────────┐
│  [All]  [Professional]  [Personal]  [Open Source]          │
│                                                             │
│  Status: [Any ▼]    Tech: [Any ▼]    Sort: [Recent ▼]     │
└─────────────────────────────────────────────────────────────┘
```

**Filters**:
- Type toggle (exclusive)
- Status dropdown
- Technology dropdown (multi-select)
- Sort: Recent, Alphabetical, Featured first

---

### 3. Featured Projects

Large, detailed cards for 2-3 highlighted projects.

```
┌─────────────────────────────────────────────────────────────┐
│  FEATURED                                                   │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                      │   │
│  │  [Live Demo / Screenshot / Video Preview]           │   │
│  │                                                      │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │  Healthcare Survey Platform              [LIVE]     │   │
│  │                                                      │   │
│  │  Self-service survey builder serving 30,000+ users  │   │
│  │                                                      │   │
│  │  [TS] [React] [Node] [AWS] [PostgreSQL]            │   │
│  │                                                      │   │
│  │  👥 30k+ users   📊 1M+ responses   ⏱️ 99.9% uptime │   │
│  │                                                      │   │
│  │  [View Case Study]              [See Architecture]  │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────┐  ┌──────────────────────┐        │
│  │  Blackjack Trainer   │  │  EHR Integration     │        │
│  │  [IN PROGRESS]       │  │  [COMPLETED]         │        │
│  │  ...                 │  │  ...                 │        │
│  └──────────────────────┘  └──────────────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

**Featured Card Components**:
- Large preview area (screenshot, video, or embedded demo)
- Title + status badge
- Tagline
- Tech stack badges
- Metrics row (if available)
- Action buttons

---

### 4. All Projects Grid

Standard project cards in a responsive grid.

```
┌─────────────────────────────────────────────────────────────┐
│  ALL PROJECTS                                               │
├──────────────────┬──────────────────┬──────────────────────┤
│                  │                  │                      │
│  [Project Card]  │  [Project Card]  │  [Project Card]     │
│                  │                  │                      │
├──────────────────┼──────────────────┼──────────────────────┤
│                  │                  │                      │
│  [Project Card]  │  [Project Card]  │  [Project Card]     │
│                  │                  │                      │
└──────────────────┴──────────────────┴──────────────────────┘
```

**Standard Card**:
- Thumbnail (or generated pattern)
- Title + type badge
- Tagline (truncated)
- 3-4 tech badges
- Status indicator
- Hover: reveal action links

---

### 5. Project Detail Modal/Page

When clicking a project, expand to full details.

**Option A**: Modal overlay
**Option B**: Dedicated page (`/projects/[slug]`)

Recommend: Modal for quick browse, with link to full page for sharing.

**Detail View Layout**:
```
┌─────────────────────────────────────────────────────────────┐
│  [← Back]                                    [Share] [GitHub]│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [Large Screenshot / Demo Embed]                            │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Project Title                                   [LIVE]     │
│  Tagline goes here                                          │
│                                                             │
│  [Tech] [Stack] [Badges]                                    │
│                                                             │
├──────────────────────────────┬──────────────────────────────┤
│  OVERVIEW                    │  METRICS                     │
│                              │                              │
│  Full description text       │  👥 Users: 30,000+          │
│  with multiple paragraphs    │  📊 Responses: 1M+          │
│  explaining the project...   │  ⏱️ Uptime: 99.9%           │
│                              │                              │
├──────────────────────────────┴──────────────────────────────┤
│  TECHNICAL CHALLENGES                                       │
│                                                             │
│  • Challenge one explained                                  │
│  • Challenge two explained                                  │
│  • Challenge three explained                                │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  CASE STUDY (if available)                                  │
│                                                             │
│  [Problem → Approach → Solution → Results]                  │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  SCREENSHOTS                                                │
│                                                             │
│  [Gallery of screenshots with lightbox]                     │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  [View Demo]  [View Code]  [Read Article]                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Live Demo Embedding

For projects that can be embedded:

### Iframe Embed
```typescript
interface DemoEmbed {
  type: 'iframe'
  url: string
  aspectRatio: '16:9' | '4:3' | '1:1'
}
```

### Mini Version
Build simplified, embedded versions of projects:
- Blackjack: Single hand demo
- Survey: Sample survey experience
- Tools: Interactive widget

### Video Preview
```typescript
interface VideoPreview {
  type: 'video'
  url: string
  poster: string
  autoplay: boolean
}
```

---

## Card Hover States

**Standard Card**:
```css
.project-card {
  transition: transform var(--duration-normal) var(--ease-spring),
              box-shadow var(--duration-normal) var(--ease-out);
}

.project-card:hover {
  transform: translateY(-4px);
  box-shadow: 
    0 8px 24px rgba(0, 0, 0, 0.4),
    0 0 0 1px var(--border-default);
}

.project-card:hover .project-card__overlay {
  opacity: 1; /* Reveal action buttons */
}
```

**Featured Card**:
- Subtle parallax on thumbnail
- Glow effect on border
- Demo preview starts playing (if video)

---

## Empty States

**No projects match filter**:
```
No projects found matching your criteria.
[Clear Filters]
```

**No projects yet** (for others building this):
```
Projects coming soon!
Check back later or visit my GitHub.
```

---

## Responsive Behavior

### Desktop (>1024px)
- 3-column grid
- Featured projects full width
- Sidebar filters
- Modal for details

### Tablet (768-1024px)
- 2-column grid
- Featured projects full width
- Horizontal filter bar
- Full page for details

### Mobile (<768px)
- Single column
- Featured cards simplified
- Bottom sheet filters
- Full page for details

---

## Performance

- Lazy load project thumbnails with blur placeholder
- Virtualize grid if >20 projects
- Preload featured project images
- Demo embeds load on interaction only
