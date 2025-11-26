# Interactions & Animations Specification

## Overview

Motion and interaction are what separate a good portfolio from a great one. Every animation should feel intentional—like the site is alive and responsive to the user.

---

## Core Animation Principles

1. **Purposeful**: Every animation communicates something
2. **Fast by Default**: Snappy interactions, slower reveals
3. **Respectful**: Honor `prefers-reduced-motion`
4. **Consistent**: Same easing across similar interactions

---

## Global Motion Tokens

```typescript
// lib/motion.ts
export const transitions = {
  fast: { duration: 0.15, ease: [0.16, 1, 0.3, 1] },
  normal: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
  slow: { duration: 0.5, ease: [0.65, 0, 0.35, 1] },
  spring: { type: 'spring', stiffness: 300, damping: 25 },
  springBouncy: { type: 'spring', stiffness: 400, damping: 20 },
}

export const stagger = {
  fast: 0.05,
  normal: 0.1,
  slow: 0.15,
}
```

---

## Page Transitions

### Enter Animation

```typescript
// components/layout/PageTransition.tsx
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.65, 0, 0.35, 1],
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.3,
    },
  },
}
```

### Child Element Stagger

```typescript
const childVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4 }
  },
}

// Usage
<motion.div variants={childVariants}>
  <Heading />
</motion.div>
<motion.div variants={childVariants}>
  <Description />
</motion.div>
```

---

## Component Animations

### Card Hover

```typescript
const cardHover = {
  rest: {
    y: 0,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
  },
  hover: {
    y: -4,
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
    transition: transitions.spring,
  },
}

// Border glow on hover
const cardBorderGlow = {
  rest: {
    boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.06)',
  },
  hover: {
    boxShadow: '0 0 0 1px rgba(0, 245, 212, 0.3), 0 0 20px rgba(0, 245, 212, 0.1)',
  },
}
```

### Button Interactions

```typescript
const buttonVariants = {
  rest: { scale: 1 },
  hover: { scale: 1.02 },
  tap: { scale: 0.98 },
}

// Primary button glow
const buttonGlow = {
  rest: {
    boxShadow: '0 0 0 rgba(0, 245, 212, 0)',
  },
  hover: {
    boxShadow: '0 0 20px rgba(0, 245, 212, 0.3)',
  },
}
```

### Navigation Link Underline

```css
.nav-link {
  position: relative;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--accent-primary);
  transition: width var(--duration-normal) var(--ease-out);
}

.nav-link:hover::after,
.nav-link[aria-current="page"]::after {
  width: 100%;
}
```

---

## Scroll-Triggered Animations

### Reveal on Scroll

```typescript
// hooks/useScrollReveal.ts
import { useInView } from 'framer-motion'

const revealVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.65, 0, 0.35, 1],
    },
  },
}

// Usage
function Section() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  
  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={revealVariants}
    >
      {/* content */}
    </motion.section>
  )
}
```

### Counter Animation

```typescript
// components/effects/AnimatedCounter.tsx
function AnimatedCounter({ value, duration = 2 }: Props) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const count = useMotionValue(0)
  const rounded = useTransform(count, Math.round)
  
  useEffect(() => {
    if (isInView) {
      const controls = animate(count, value, { duration })
      return controls.stop
    }
  }, [isInView, value])
  
  return <motion.span ref={ref}>{rounded}</motion.span>
}
```

---

## Special Effects

### Typewriter Effect

```typescript
// components/effects/TypeWriter.tsx
interface TypeWriterProps {
  text: string
  speed?: number
  delay?: number
  cursor?: boolean
  onComplete?: () => void
}

function TypeWriter({ text, speed = 50, delay = 0, cursor = true, onComplete }: TypeWriterProps) {
  const [displayText, setDisplayText] = useState('')
  const [isComplete, setIsComplete] = useState(false)
  
  useEffect(() => {
    const timeout = setTimeout(() => {
      let i = 0
      const interval = setInterval(() => {
        if (i < text.length) {
          setDisplayText(text.slice(0, i + 1))
          i++
        } else {
          clearInterval(interval)
          setIsComplete(true)
          onComplete?.()
        }
      }, speed)
      
      return () => clearInterval(interval)
    }, delay)
    
    return () => clearTimeout(timeout)
  }, [text, speed, delay, onComplete])
  
  return (
    <span className="typewriter">
      {displayText}
      {cursor && <span className={`cursor ${isComplete ? 'cursor--blink' : ''}`}>_</span>}
    </span>
  )
}
```

```css
.cursor {
  opacity: 1;
}

.cursor--blink {
  animation: blink 1s step-end infinite;
}

@keyframes blink {
  50% { opacity: 0; }
}
```

### Cursor Glow Effect

```typescript
// components/effects/CursorGlow.tsx
function CursorGlow() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY })
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])
  
  // Skip on touch devices
  if ('ontouchstart' in window) return null
  
  return (
    <div
      className="cursor-glow"
      style={{
        '--x': `${position.x}px`,
        '--y': `${position.y}px`,
      } as React.CSSProperties}
    />
  )
}
```

```css
.cursor-glow {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9998;
  background: radial-gradient(
    600px circle at var(--x) var(--y),
    rgba(0, 245, 212, 0.06),
    transparent 40%
  );
}
```

### Grain Overlay

```typescript
// components/effects/GrainOverlay.tsx
function GrainOverlay() {
  return <div className="grain-overlay" aria-hidden="true" />
}
```

```css
.grain-overlay {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9999;
  opacity: 0.03;
  background-image: url("data:image/svg+xml,..."); /* See design system */
  background-repeat: repeat;
}
```

---

## Command Palette

### Trigger

```typescript
// hooks/useCommandPalette.ts
function useCommandPalette() {
  const [isOpen, setIsOpen] = useState(false)
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])
  
  return { isOpen, open: () => setIsOpen(true), close: () => setIsOpen(false) }
}
```

### Commands Configuration

```typescript
// data/commands.ts
export interface Command {
  id: string
  label: string
  shortcut?: string
  icon: string
  action: () => void
  category: 'navigation' | 'actions' | 'theme' | 'social'
  keywords?: string[]
}

export const commands: Command[] = [
  // Navigation
  {
    id: 'home',
    label: 'Go to Home',
    shortcut: 'G H',
    icon: 'Home',
    action: () => router.push('/'),
    category: 'navigation',
    keywords: ['landing', 'main'],
  },
  {
    id: 'projects',
    label: 'Go to Projects',
    shortcut: 'G P',
    icon: 'Folder',
    action: () => router.push('/projects'),
    category: 'navigation',
  },
  {
    id: 'stack',
    label: 'Go to Stack',
    shortcut: 'G S',
    icon: 'Layers',
    action: () => router.push('/stack'),
    category: 'navigation',
  },
  {
    id: 'infra',
    label: 'Go to Infrastructure',
    shortcut: 'G I',
    icon: 'Server',
    action: () => router.push('/infrastructure'),
    category: 'navigation',
  },
  
  // Actions
  {
    id: 'contact',
    label: 'Contact Me',
    shortcut: 'C',
    icon: 'Mail',
    action: () => router.push('/contact'),
    category: 'actions',
  },
  {
    id: 'resume',
    label: 'Download Resume',
    icon: 'Download',
    action: () => window.open('/resume.pdf'),
    category: 'actions',
  },
  
  // Theme
  {
    id: 'theme-dark',
    label: 'Dark Theme',
    icon: 'Moon',
    action: () => setTheme('dark'),
    category: 'theme',
  },
  {
    id: 'theme-light',
    label: 'Light Theme',
    icon: 'Sun',
    action: () => setTheme('light'),
    category: 'theme',
  },
  
  // Social
  {
    id: 'github',
    label: 'Open GitHub',
    icon: 'Github',
    action: () => window.open('https://github.com/...'),
    category: 'social',
  },
  {
    id: 'linkedin',
    label: 'Open LinkedIn',
    icon: 'Linkedin',
    action: () => window.open('https://linkedin.com/in/...'),
    category: 'social',
  },
]
```

### Component Structure

```typescript
// components/ui/CommandPalette.tsx
function CommandPalette({ isOpen, onClose }: Props) {
  const [search, setSearch] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  
  const filteredCommands = useMemo(() => {
    if (!search) return commands
    return commands.filter(cmd => 
      cmd.label.toLowerCase().includes(search.toLowerCase()) ||
      cmd.keywords?.some(k => k.toLowerCase().includes(search.toLowerCase()))
    )
  }, [search])
  
  // Group by category
  const grouped = useMemo(() => {
    return groupBy(filteredCommands, 'category')
  }, [filteredCommands])
  
  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        setSelectedIndex(i => Math.min(i + 1, filteredCommands.length - 1))
      }
      if (e.key === 'ArrowUp') {
        setSelectedIndex(i => Math.max(i - 1, 0))
      }
      if (e.key === 'Enter') {
        filteredCommands[selectedIndex]?.action()
        onClose()
      }
    }
    
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, selectedIndex, filteredCommands, onClose])
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            className="command-palette__backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="command-palette"
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={transitions.spring}
          >
            <input
              type="text"
              placeholder="Type a command or search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
            />
            <div className="command-palette__results">
              {Object.entries(grouped).map(([category, cmds]) => (
                <div key={category} className="command-palette__group">
                  <div className="command-palette__group-label">{category}</div>
                  {cmds.map((cmd, i) => (
                    <button
                      key={cmd.id}
                      className={`command-palette__item ${
                        i === selectedIndex ? 'command-palette__item--selected' : ''
                      }`}
                      onClick={() => { cmd.action(); onClose(); }}
                    >
                      <Icon name={cmd.icon} />
                      <span>{cmd.label}</span>
                      {cmd.shortcut && <kbd>{cmd.shortcut}</kbd>}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
```

---

## Reduced Motion Support

```typescript
// hooks/useReducedMotion.ts
function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false)
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mediaQuery.matches)
    
    const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mediaQuery.addEventListener('change', listener)
    return () => mediaQuery.removeEventListener('change', listener)
  }, [])
  
  return reducedMotion
}

// Usage
function AnimatedComponent() {
  const reducedMotion = useReducedMotion()
  
  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={reducedMotion ? { duration: 0 } : transitions.normal}
    >
      {/* content */}
    </motion.div>
  )
}
```

---

## Performance Guidelines

1. **Use CSS for simple animations** (hover states, underlines)
2. **Use Framer Motion for complex sequences** (page transitions, stagger)
3. **Avoid animating layout properties** (width, height) — use transform
4. **Use `will-change` sparingly** and only when needed
5. **Test on lower-end devices** — 60fps is the target
6. **Lazy load animation-heavy sections** (infra diagram, stack visualization)
