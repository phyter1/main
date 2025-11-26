# Landing Page Specification

## Overview

The landing page is your first impression—a bold statement that immediately communicates "senior engineer who cares about craft." It should load fast, feel alive, and guide visitors to explore.

---

## Sections

### 1. Hero Section

**Layout**: Full viewport height, centered content

**Content Hierarchy**:
```
[Terminal-style greeting with typewriter effect]
> Hello, I'm Ryan_

[Display headline - Playfair]
Full-Stack Engineer
& Infrastructure Architect

[Subheading - JetBrains Mono, secondary color]
Building scalable systems with TypeScript, React, and AWS.
Passionate about developer experience and AI-assisted workflows.

[CTA Buttons]
[View My Work]  [Let's Connect]

[Scroll indicator at bottom]
↓
```

**Background Treatment**:
- Base: `--bg-primary`
- Gradient mesh: subtle radial gradients in accent color (very low opacity)
- Optional: Animated grid pattern that responds to cursor
- Grain overlay

**Animations**:
1. Page load: Staggered fade-in of elements (0.1s delay between each)
2. Typewriter completes, then headline fades in
3. CTAs appear last
4. Scroll indicator pulses gently

---

### 2. Quick Stats Bar

**Layout**: Horizontal strip below hero, edge-to-edge

**Content**:
```
[16+ years]     [30k+ users served]     [TypeScript Expert]     [AWS Certified]
 Experience      Products Built          Primary Stack           Infrastructure
```

**Style**:
- Background: `--bg-secondary`
- Numbers in accent color
- Labels in `--text-secondary`
- Subtle top/bottom borders

**Animation**: Numbers count up on scroll into view

---

### 3. Featured Work Preview

**Layout**: 2-column grid on desktop, stack on mobile

**Content**: 2-3 highlighted projects

```
┌─────────────────────────────────────────────────────────┐
│  Featured Work                            [View All →]  │
├────────────────────────┬────────────────────────────────┤
│                        │                                │
│   [Project Card 1]     │      [Project Card 2]          │
│   Blackjack Trainer    │      Survey Platform           │
│                        │                                │
├────────────────────────┴────────────────────────────────┤
│                                                         │
│              [Project Card 3 - Full Width]              │
│              EHR Integration System                     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Project Cards** (preview variant):
- Thumbnail or icon
- Title
- One-line description
- 3-4 tech badges
- Hover: lift + glow

---

### 4. Stack Overview

**Layout**: Visual cluster or horizontal scroll

**Content**: Icon grid of primary technologies

```
┌─────────────────────────────────────────────────────────┐
│  My Stack                              [Explore →]      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│    [TS]   [React]   [Next.js]   [Node]   [AWS]         │
│                                                         │
│    [Terraform]   [Docker]   [PostgreSQL]   [Redis]     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Interactions**:
- Icons have subtle hover animations
- Click leads to full stack page
- Optional: hover shows "X years experience" tooltip

---

### 5. Philosophy Snippet

**Layout**: Centered text block with accent borders

**Content**:
```
"I believe in building systems that are as elegant to maintain
 as they are powerful to use. Code should tell a story."

 [More About Me →]
```

**Style**:
- Quote in slightly larger text
- Accent-colored quotation marks
- Or: styled as a terminal comment block

---

### 6. Contact CTA

**Layout**: Full-width banner

**Content**:
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│         Let's build something together.                 │
│                                                         │
│              [Get in Touch]                             │
│                                                         │
│     ryan@example.com  •  GitHub  •  LinkedIn           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Style**:
- Background: `--bg-tertiary` or subtle gradient
- Large, bold headline
- Primary CTA button
- Social links as icon row

---

## Responsive Behavior

### Desktop (>1024px)
- Full animations and effects
- 2-column featured work
- Horizontal stats bar

### Tablet (768-1024px)
- Reduced hero text size
- 2-column featured work
- Stats may wrap to 2x2

### Mobile (<768px)
- Stack all content vertically
- Simplified animations
- Tap-friendly buttons (min 44px)
- Hero takes ~80vh

---

## Performance Considerations

- **Above the fold**: No external dependencies, inline critical CSS
- **Hero image/animation**: Use CSS-only or tiny SVG
- **Stats counting**: Use Intersection Observer, only animate once
- **Project thumbnails**: Lazy load with blur placeholder
- **Fonts**: Preload display font, system fallback for mono

---

## SEO & Meta

```typescript
const metadata = {
  title: 'Ryan | Full-Stack Engineer & Infrastructure Architect',
  description: 'Senior software engineer specializing in TypeScript, React, Next.js, and AWS. Building scalable healthcare technology and developer tools.',
  openGraph: {
    title: 'Ryan | Full-Stack Engineer',
    description: '...',
    image: '/og-image.png',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
}
```

---

## Interaction States

| Element | Hover | Focus | Active |
|---------|-------|-------|--------|
| CTA Primary | Glow + slight scale | Ring outline | Darken |
| CTA Secondary | Background appears | Ring outline | Darken |
| Project Card | Lift + border glow | Ring outline | — |
| Stack Icon | Scale + tooltip | Ring outline | — |
| Nav Link | Underline animates in | Underline | Bold |
