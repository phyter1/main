# About Page Specification

## Overview

The About page reveals the person behind the code. It should feel personal but professional, showcasing your journey, philosophy, and what makes you unique as an engineer.

---

## Page Structure

```
[Page Header]
About Me

[Hero Statement Section]
[Timeline Section]
[Philosophy Section]
[Working Style Section]
[Beyond Code Section]
```

---

## Sections

### 1. Hero Statement

**Layout**: Large text block, possibly with subtle background treatment

**Content Example**:
```
I'm a Full-Stack Engineer with 16+ years of experience
building products that matter.

Currently: Tech Lead at Hugo Health, architecting systems
that serve 30,000+ users in healthcare technology.

Previously: Built everything from EHR integrations to
AI-powered developer tools.

Based in Florida. Always building.
```

**Style**:
- Mix of display font for emphasis, mono for details
- Key stats/roles in accent color
- Location with subtle icon

---

### 2. Career Timeline

**Component**: `<Timeline />` with git-graph aesthetic

**Data Structure**:
```typescript
const timeline: TimelineEvent[] = [
  {
    id: 'hugo-lead',
    type: 'job',
    title: 'Tech Lead, Product Engineering',
    organization: 'Hugo Health',
    date: { start: '2022', end: 'present' },
    description: 'Leading frontend architecture and AI integration initiatives.',
    highlights: [
      'Architected survey platform serving 30k+ users',
      'Built innovative EHR integration using headless browsers',
      'Pioneered AI-assisted development workflows'
    ],
    technologies: ['TypeScript', 'React', 'Next.js', 'AWS']
  },
  {
    id: 'hugo-senior',
    type: 'job',
    title: 'Software Engineer III',
    organization: 'Hugo Health',
    date: { start: '2020', end: '2022' },
    // ...
  },
  // ... more entries going back
]
```

**Visual Design**:
- Vertical line as "main branch"
- Commit dots for each event
- Role changes = larger commits
- Technologies shown as small badges
- Expandable highlights on click

**Interactions**:
- Scroll-triggered reveal animation
- Click to expand details
- Filter by type (jobs, projects, education)

---

### 3. Engineering Philosophy

**Layout**: Card grid or styled blockquotes

**Content Pillars**:

```
┌────────────────────────────────────────────────────────────┐
│  How I Think About Engineering                             │
├──────────────────────┬─────────────────────────────────────┤
│                      │                                     │
│  [Icon: Code]        │  [Icon: Users]                     │
│  Code as Craft       │  User-First                        │
│                      │                                     │
│  Every line should   │  Technical decisions should        │
│  be intentional.     │  serve real human needs.           │
│  Readability and     │  I build features that             │
│  maintainability     │  people actually use.              │
│  over cleverness.    │                                     │
│                      │                                     │
├──────────────────────┼─────────────────────────────────────┤
│                      │                                     │
│  [Icon: Zap]         │  [Icon: Layers]                    │
│  Pragmatic Speed     │  Systems Thinking                  │
│                      │                                     │
│  Ship early, iterate │  Everything connects.              │
│  fast, but never     │  I consider the full               │
│  compromise on       │  lifecycle: dev experience,        │
│  foundations.        │  deployment, observability.        │
│                      │                                     │
└──────────────────────┴─────────────────────────────────────┘
```

**Style**:
- Cards with icons
- Short, punchy statements
- Background treatment that sets this apart

---

### 4. Working Style

**Layout**: Horizontal sections or tabs

**Content Areas**:

**AI-Assisted Development** (highlight this—it's unique):
```
I've developed a strategic approach to AI-assisted development:

• GitHub Copilot → Real-time completions in the editor
• Claude Code → Complex agentic tasks and refactoring  
• Codex → Planning and architecture decisions
• Gemini → Documentation and explanations

It's not about replacing engineering judgment—it's about
amplifying it. I use each tool for what it does best.
```

**Communication Style**:
```
• I document decisions, not just code
• Async-first, but sync when it matters
• I prefer clear over clever in technical writing
• Strong opinions, loosely held
```

**What I Value in Teams**:
```
• Psychological safety to experiment and fail
• Clear ownership with collaborative spirit
• Code review as teaching, not gatekeeping
• Shipping over perfection
```

---

### 5. Beyond Code

**Layout**: Relaxed, more personal section

**Content**:
```
When I'm not building software...

[Icon: Gamepad]
I'm exploring the frontier of Red Dead Redemption 2,
appreciating the craft of open-world game design.

[Icon: Cards]
Building a comprehensive blackjack trainer—because
even card games deserve elegant architecture.

[Icon: Map]
Based in Englewood, Florida—trading cold weather
for warm debugging sessions.
```

**Style**:
- More casual tone
- Small icons or illustrations
- Shows personality without oversharing

---

## Visual Design Notes

### Color Usage
- Timeline line: `--border-default`
- Timeline commits: `--accent-primary`
- Philosophy cards: `--bg-secondary` with accent icons
- Personal section: Slightly warmer tone

### Typography
- Section headers: Playfair Display
- Body text: JetBrains Mono
- Quotes/callouts: Italic Playfair or styled mono

### Spacing
- Generous vertical spacing between sections (`--space-16`)
- Timeline events: `--space-8` apart
- Card grids: `--space-6` gap

---

## Responsive Behavior

### Desktop
- Timeline on left, content on right (or alternating)
- Philosophy as 2x2 grid
- Full animations

### Tablet
- Timeline centered, content below
- Philosophy as 2x2 grid
- Reduced animation

### Mobile
- Single column throughout
- Timeline simplified (no branching visual)
- Philosophy stacked
- Touch-friendly expand/collapse

---

## Interactions Checklist

- [ ] Timeline entries expand on click
- [ ] Timeline filters work correctly
- [ ] Philosophy cards have hover states
- [ ] Scroll reveals are smooth
- [ ] Links to projects/stack pages work
- [ ] Contact CTA at bottom

---

## Content Personalization Hooks

The data files should make it easy to update:

```typescript
// data/about.ts
export const aboutData = {
  headline: '...',
  currentRole: {
    title: '...',
    company: '...',
    description: '...'
  },
  location: '...',
  timeline: [...],
  philosophy: [...],
  workingStyle: {...},
  interests: [...]
}
```
