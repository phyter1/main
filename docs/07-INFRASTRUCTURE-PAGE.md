# Infrastructure Page Specification

## Overview

This page is a **unique differentiator**—most portfolios don't showcase infrastructure expertise visually. You'll present your personal/professional infrastructure as an interactive architecture diagram, demonstrating both technical depth and your systems thinking.

---

## Core Concept: "The Control Room"

The page feels like looking at a systems dashboard. Visitors can explore your infrastructure the way an engineer would—clicking through services, understanding data flows, and seeing how everything connects.

---

## Page Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Infrastructure                                             │
│  How I architect and deploy systems                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [View: Personal Infra]  [Professional Examples]  [IaC]    │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                 INTERACTIVE DIAGRAM                         │
│                                                             │
│    ┌─────────┐                                             │
│    │ Users   │                                             │
│    └────┬────┘                                             │
│         │                                                   │
│         ▼                                                   │
│    ┌─────────┐      ┌─────────┐                            │
│    │Cloudflare│────▶│ Vercel  │                            │
│    └─────────┘      └────┬────┘                            │
│                          │                                  │
│         ┌────────────────┼────────────────┐                │
│         │                │                │                │
│         ▼                ▼                ▼                │
│    ┌─────────┐     ┌─────────┐     ┌─────────┐            │
│    │   API   │     │  Auth   │     │ Storage │            │
│    │(Lambda) │     │(Cognito)│     │  (S3)   │            │
│    └────┬────┘     └─────────┘     └─────────┘            │
│         │                                                   │
│         ▼                                                   │
│    ┌─────────┐     ┌─────────┐                             │
│    │   RDS   │◀───▶│ ElastiC │                             │
│    │(Postgres)│     │ (Redis) │                             │
│    └─────────┘     └─────────┘                             │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  [Selected: AWS Lambda]                                     │
│                                                             │
│  Purpose: API endpoints and async processing               │
│  Tech: Node.js 18.x runtime                                │
│  Deployed via: Terraform                                    │
│  Connects to: RDS, S3, SQS                                 │
│                                                             │
│  [View Terraform] [See Related Projects]                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Structure

```typescript
// data/infrastructure.ts

export interface InfraNode {
  id: string
  type: 'user' | 'cdn' | 'frontend' | 'api' | 'compute' | 'database' | 'cache' | 'storage' | 'queue' | 'monitoring' | 'external'
  label: string
  shortLabel?: string
  provider: 'aws' | 'vercel' | 'cloudflare' | 'github' | 'custom' | 'other'
  service?: string // e.g., 'Lambda', 'RDS', 'S3'
  
  // Position (for React Flow)
  position: { x: number; y: number }
  
  // Details
  description: string
  purpose: string
  techDetails?: string[]
  
  // Deployment
  deployedVia?: 'terraform' | 'cdk' | 'manual' | 'ci-cd'
  
  // Status (for visual indicators)
  status?: 'active' | 'deprecated' | 'planned'
  
  // Links
  links?: {
    terraform?: string
    docs?: string
    project?: string
  }
}

export interface InfraEdge {
  id: string
  source: string
  target: string
  label?: string
  type: 'data' | 'auth' | 'deploy' | 'monitor'
  animated?: boolean
  bidirectional?: boolean
}

export interface InfraConfig {
  id: string
  name: string
  description: string
  nodes: InfraNode[]
  edges: InfraEdge[]
}

// Example: Personal Infrastructure
export const personalInfra: InfraConfig = {
  id: 'personal',
  name: 'Personal Infrastructure',
  description: 'My personal projects and website infrastructure',
  nodes: [
    {
      id: 'users',
      type: 'user',
      label: 'Users',
      provider: 'other',
      position: { x: 400, y: 0 },
      description: 'End users accessing my sites and projects',
      purpose: 'Entry point'
    },
    {
      id: 'cloudflare',
      type: 'cdn',
      label: 'Cloudflare',
      provider: 'cloudflare',
      service: 'CDN + DNS',
      position: { x: 400, y: 100 },
      description: 'DNS management, DDoS protection, and edge caching',
      purpose: 'Edge security and performance',
      techDetails: ['DNS management', 'SSL termination', 'Edge caching', 'DDoS protection']
    },
    {
      id: 'vercel',
      type: 'frontend',
      label: 'Vercel',
      provider: 'vercel',
      service: 'Edge Functions + Static',
      position: { x: 400, y: 200 },
      description: 'Hosting for Next.js applications with edge functions',
      purpose: 'Frontend hosting and edge compute',
      deployedVia: 'ci-cd',
      links: {
        docs: 'https://vercel.com/docs'
      }
    },
    // ... more nodes
  ],
  edges: [
    { id: 'e1', source: 'users', target: 'cloudflare', type: 'data', animated: true },
    { id: 'e2', source: 'cloudflare', target: 'vercel', type: 'data', animated: true },
    // ... more edges
  ]
}

// Example: Professional Pattern (anonymized)
export const professionalPattern: InfraConfig = {
  id: 'healthcare-pattern',
  name: 'Healthcare SaaS Pattern',
  description: 'Architecture pattern used for HIPAA-compliant healthcare applications',
  // ... similar structure, but showing patterns rather than specific services
}
```

---

## Views/Tabs

### 1. Personal Infrastructure

Your actual infrastructure for personal projects:
- Portfolio site hosting
- API services
- Database layer
- Domain management
- Email setup (phytertek.com)

### 2. Professional Patterns

Anonymized architecture patterns from your professional work:
- Healthcare SaaS architecture
- EHR Integration pattern (Fargate + Puppeteer)
- Survey platform architecture

**Note**: Be careful about NDA concerns—show patterns, not proprietary details.

### 3. Infrastructure as Code

Showcase your Terraform/IaC expertise:
- Code snippets
- Module organization
- State management approach
- CI/CD pipeline visualization

---

## Visual Design

### Node Styling by Type

```typescript
const nodeStyles = {
  user: {
    icon: 'Users',
    bgColor: 'transparent',
    borderColor: '--text-secondary',
  },
  cdn: {
    icon: 'Globe',
    bgColor: '#f38020', // Cloudflare orange
    borderColor: '#f38020',
  },
  frontend: {
    icon: 'Monitor',
    bgColor: '#000000', // Vercel black
    borderColor: '#ffffff',
  },
  api: {
    icon: 'Server',
    bgColor: '#ff9900', // AWS orange
    borderColor: '#ff9900',
  },
  database: {
    icon: 'Database',
    bgColor: '#336791', // PostgreSQL blue
    borderColor: '#336791',
  },
  cache: {
    icon: 'Zap',
    bgColor: '#dc382d', // Redis red
    borderColor: '#dc382d',
  },
  storage: {
    icon: 'HardDrive',
    bgColor: '#569a31', // S3 green
    borderColor: '#569a31',
  },
  queue: {
    icon: 'Layers',
    bgColor: '#ff4f8b', // SQS pink
    borderColor: '#ff4f8b',
  },
  monitoring: {
    icon: 'Activity',
    bgColor: '#9146ff', // Purple for monitoring
    borderColor: '#9146ff',
  },
}
```

### Edge Styling

```typescript
const edgeStyles = {
  data: {
    stroke: '--accent-primary',
    strokeWidth: 2,
    animated: true, // Moving dashes
  },
  auth: {
    stroke: '--warning',
    strokeWidth: 2,
    strokeDasharray: '5,5',
  },
  deploy: {
    stroke: '--success',
    strokeWidth: 1,
    animated: false,
  },
  monitor: {
    stroke: '--info',
    strokeWidth: 1,
    strokeDasharray: '2,2',
  },
}
```

### Animated Data Flow

```css
@keyframes flowAnimation {
  from {
    stroke-dashoffset: 24;
  }
  to {
    stroke-dashoffset: 0;
  }
}

.edge--animated {
  animation: flowAnimation 1s linear infinite;
}
```

---

## Interactions

### Diagram Controls
- **Pan**: Click and drag
- **Zoom**: Scroll wheel, pinch, or buttons
- **Reset**: Double-click to fit view
- **Minimap**: Optional toggle in corner

### Node Selection
- Click node → highlight node, dim others, show detail panel
- Hover node → tooltip with quick info
- Connected nodes remain visible when one is selected

### Edge Interaction
- Hover edge → shows label if present
- Click edge → highlights source and target nodes

### Layer Toggles
- Toggle visibility of node types
- "Show only data flow" mode
- "Show only deployment" mode

---

## Detail Panel

Slides in from right (desktop) or bottom (mobile) when node selected.

```
┌─────────────────────────────────────┐
│  [Icon] AWS Lambda          [Close] │
├─────────────────────────────────────┤
│                                     │
│  TYPE: Compute                      │
│  PROVIDER: AWS                      │
│  STATUS: ● Active                   │
│                                     │
│  PURPOSE                            │
│  API endpoints and async processing │
│                                     │
│  TECHNICAL DETAILS                  │
│  • Node.js 18.x runtime            │
│  • 512MB memory                     │
│  • VPC connected                    │
│  • CloudWatch logging               │
│                                     │
│  DEPLOYED VIA                       │
│  Terraform                          │
│                                     │
│  CONNECTIONS                        │
│  → RDS (data)                       │
│  → S3 (storage)                     │
│  → SQS (queue)                      │
│  ← API Gateway (trigger)            │
│                                     │
│  [View Terraform] [See Projects]    │
└─────────────────────────────────────┘
```

---

## IaC Showcase Section

Below or alongside the diagram, show your Terraform expertise:

```
┌─────────────────────────────────────────────────────────────┐
│  Infrastructure as Code                                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  I manage all infrastructure declaratively with Terraform.  │
│                                                             │
│  [Module Structure]                                         │
│                                                             │
│  terraform/                                                 │
│  ├── modules/                                               │
│  │   ├── vpc/                                               │
│  │   ├── ecs-cluster/                                       │
│  │   ├── rds/                                               │
│  │   └── lambda-api/                                        │
│  ├── environments/                                          │
│  │   ├── dev/                                               │
│  │   ├── staging/                                           │
│  │   └── production/                                        │
│  └── shared/                                                │
│                                                             │
│  [Key Practices]                                            │
│  • Remote state with S3 + DynamoDB locking                 │
│  • Workspaces for environment separation                    │
│  • Automated plan/apply via GitHub Actions                  │
│  • Cost estimation in PRs                                   │
│                                                             │
│  [View Sample Module]                                       │
└─────────────────────────────────────────────────────────────┘
```

---

## Responsive Behavior

### Desktop (>1024px)
- Full diagram with all interactions
- Detail panel on right side
- Minimap visible
- IaC section below

### Tablet (768-1024px)
- Simplified diagram (larger nodes)
- Detail panel as overlay
- No minimap
- Touch-optimized controls

### Mobile (<768px)
- Diagram as scrollable/zoomable area
- Or: simplified list view of components
- Detail panel as bottom sheet
- Tap to select nodes

---

## Implementation Notes

### React Flow Setup

```typescript
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
} from 'reactflow'

// Custom node component
function InfraNodeComponent({ data }: NodeProps<InfraNode>) {
  const style = nodeStyles[data.type]
  return (
    <div className="infra-node" style={{ borderColor: style.borderColor }}>
      <div className="infra-node__icon" style={{ background: style.bgColor }}>
        <Icon name={style.icon} />
      </div>
      <span className="infra-node__label">{data.label}</span>
      {data.service && (
        <span className="infra-node__service">{data.service}</span>
      )}
    </div>
  )
}
```

### Performance
- Use React Flow's built-in performance optimizations
- Lazy load detail panel content
- Animate only visible edges
- Reduce motion option

### Accessibility
- Keyboard navigation through nodes
- Screen reader descriptions for each node
- Alternative text list view
- High contrast mode
