# Sample Data Structures

These are starter data files populated with your actual information. Copy these to your `src/data/` directory and customize further.

---

## projects.ts

```typescript
export interface Project {
  id: string
  title: string
  slug: string
  tagline: string
  description: string
  type: 'professional' | 'personal' | 'open-source'
  status: 'live' | 'in-progress' | 'completed' | 'archived'
  featured: boolean
  thumbnail?: string
  technologies: string[]
  challenges?: string[]
  links: {
    demo?: string
    github?: string
    article?: string
  }
  metrics?: {
    users?: string
    custom?: { label: string; value: string }[]
  }
  startDate: string
  endDate?: string
}

export const projects: Project[] = [
  {
    id: 'survey-platform',
    title: 'Healthcare Survey Platform',
    slug: 'survey-platform',
    tagline: 'Self-service survey builder serving 30,000+ active users',
    description: `
      A comprehensive survey platform for healthcare data collection featuring 
      a self-service builder with custom input types including interactive pain 
      body maps, prescription lookups, and complex branching logic. Built to 
      handle HIPAA-compliant data collection at scale.
    `,
    type: 'professional',
    status: 'live',
    featured: true,
    technologies: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'AWS', 'Terraform'],
    challenges: [
      'Complex form state management with dynamic branching',
      'Building accessible custom input components',
      'HIPAA compliance and data security',
      'Performance optimization for large surveys'
    ],
    metrics: {
      users: '30,000+',
      custom: [
        { label: 'Survey Responses', value: '1M+' },
        { label: 'Custom Input Types', value: '15+' }
      ]
    },
    startDate: '2020',
  },
  {
    id: 'ehr-integration',
    title: 'EHR Integration System',
    slug: 'ehr-integration',
    tagline: 'Innovative headless browser automation for healthcare data exchange',
    description: `
      An innovative approach to EHR integration using Fargate, Puppeteer, and 
      Docker for automated headless browser interactions. Built before official 
      APIs were available, this system enabled seamless data exchange between 
      healthcare systems.
    `,
    type: 'professional',
    status: 'completed',
    featured: true,
    technologies: ['TypeScript', 'Node.js', 'Puppeteer', 'Docker', 'AWS Fargate', 'Terraform'],
    challenges: [
      'Reliable automation of complex web interfaces',
      'Handling authentication flows programmatically',
      'Building resilient retry mechanisms',
      'Managing browser instances at scale'
    ],
    startDate: '2019',
    endDate: '2021',
  },
  {
    id: 'blackjack-trainer',
    title: 'Blackjack Trainer',
    slug: 'blackjack-trainer',
    tagline: 'Comprehensive card counting and strategy training application',
    description: `
      A full-featured blackjack training application with realistic casino 
      visuals, multiple card counting systems (Hi-Lo, KO, Omega II, and more), 
      and configurable rule variations. Features include gesture-based betting, 
      realistic chip stacking, and detailed statistics tracking.
    `,
    type: 'personal',
    status: 'in-progress',
    featured: true,
    technologies: ['TypeScript', 'React', 'Tailwind CSS', 'Framer Motion'],
    challenges: [
      'Realistic card and chip animations',
      'Implementing accurate counting system algorithms',
      'Building a flexible rule engine for variations',
      'Creating intuitive gesture-based controls'
    ],
    links: {
      github: 'https://github.com/...',
    },
    startDate: '2024',
  },
  {
    id: 'ai-dev-tools',
    title: 'AI Developer Workflow Tools',
    slug: 'ai-dev-tools',
    tagline: 'Automated commit messages and intelligent test result analysis',
    description: `
      A suite of AI-driven developer productivity tools including automated 
      commit message generation based on staged changes and intelligent test 
      result analysis that provides actionable insights from CI/CD output.
    `,
    type: 'personal',
    status: 'completed',
    featured: false,
    technologies: ['TypeScript', 'Node.js', 'OpenAI API', 'Git'],
    startDate: '2023',
    endDate: '2024',
  },
  {
    id: 'docker-optimization',
    title: 'Infrastructure Optimization',
    slug: 'docker-optimization',
    tagline: '80% reduction in Docker image sizes and AWS cost optimization',
    description: `
      Comprehensive infrastructure optimization project achieving 80% reduction 
      in Docker image sizes through multi-stage builds and layer optimization. 
      Also implemented AWS cost optimization through EKS cluster improvements 
      and resource right-sizing.
    `,
    type: 'professional',
    status: 'completed',
    featured: false,
    technologies: ['Docker', 'AWS', 'EKS', 'Terraform', 'Kubernetes'],
    metrics: {
      custom: [
        { label: 'Image Size Reduction', value: '80%' },
        { label: 'Cost Savings', value: 'Significant' }
      ]
    },
    startDate: '2022',
    endDate: '2023',
  },
]
```

---

## stack.ts

```typescript
export interface StackNode {
  id: string
  name: string
  category: 'languages' | 'frontend' | 'backend' | 'database' | 'infrastructure' | 'tools'
  icon: string
  proficiency: 'expert' | 'proficient' | 'familiar'
  yearsUsed: number
  lastUsed: 'current' | 'recent' | 'past'
  description: string
  highlights?: string[]
}

export const stackNodes: StackNode[] = [
  // Languages
  {
    id: 'typescript',
    name: 'TypeScript',
    category: 'languages',
    icon: 'FileCode',
    proficiency: 'expert',
    yearsUsed: 6,
    lastUsed: 'current',
    description: 'Primary language for all new projects. Strict mode always.',
    highlights: [
      'Full-stack TypeScript at Hugo Health',
      'Complex type systems for survey builders',
      'Shared types between frontend and backend'
    ]
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    category: 'languages',
    icon: 'FileCode',
    proficiency: 'expert',
    yearsUsed: 12,
    lastUsed: 'current',
    description: 'Deep ES6+ expertise, though TypeScript is preferred.'
  },

  // Frontend
  {
    id: 'react',
    name: 'React',
    category: 'frontend',
    icon: 'Atom',
    proficiency: 'expert',
    yearsUsed: 7,
    lastUsed: 'current',
    description: 'Core frontend framework. Deep experience with hooks, context, and performance.',
    highlights: [
      'Built component libraries from scratch',
      'Complex state management patterns',
      'Accessibility-first development'
    ]
  },
  {
    id: 'nextjs',
    name: 'Next.js',
    category: 'frontend',
    icon: 'Triangle',
    proficiency: 'expert',
    yearsUsed: 4,
    lastUsed: 'current',
    description: 'Primary React framework. App Router, Server Components, ISR.',
    highlights: [
      'Production apps serving thousands',
      'Edge functions and middleware',
      'Performance optimization'
    ]
  },
  {
    id: 'tailwind',
    name: 'Tailwind CSS',
    category: 'frontend',
    icon: 'Palette',
    proficiency: 'proficient',
    yearsUsed: 3,
    lastUsed: 'current',
    description: 'Preferred styling solution for rapid, consistent UI development.'
  },

  // Backend
  {
    id: 'nodejs',
    name: 'Node.js',
    category: 'backend',
    icon: 'Server',
    proficiency: 'expert',
    yearsUsed: 8,
    lastUsed: 'current',
    description: 'Primary backend runtime. Express, Fastify, and serverless.',
    highlights: [
      'High-throughput API services',
      'Real-time websocket applications',
      'Background job processing'
    ]
  },

  // Database
  {
    id: 'postgresql',
    name: 'PostgreSQL',
    category: 'database',
    icon: 'Database',
    proficiency: 'proficient',
    yearsUsed: 6,
    lastUsed: 'current',
    description: 'Primary relational database. Complex queries, optimization, migrations.'
  },
  {
    id: 'redis',
    name: 'Redis',
    category: 'database',
    icon: 'Zap',
    proficiency: 'proficient',
    yearsUsed: 5,
    lastUsed: 'current',
    description: 'Caching, session storage, pub/sub, and rate limiting.'
  },

  // Infrastructure
  {
    id: 'aws',
    name: 'AWS',
    category: 'infrastructure',
    icon: 'Cloud',
    proficiency: 'expert',
    yearsUsed: 7,
    lastUsed: 'current',
    description: 'Primary cloud provider. Lambda, ECS, RDS, S3, and more.',
    highlights: [
      'Cost optimization initiatives',
      'Multi-region deployments',
      'Security best practices'
    ]
  },
  {
    id: 'terraform',
    name: 'Terraform',
    category: 'infrastructure',
    icon: 'Blocks',
    proficiency: 'expert',
    yearsUsed: 5,
    lastUsed: 'current',
    description: 'Infrastructure as Code. Modules, workspaces, state management.',
    highlights: [
      'Modular infrastructure design',
      'Multi-environment management',
      'Automated deployments'
    ]
  },
  {
    id: 'docker',
    name: 'Docker',
    category: 'infrastructure',
    icon: 'Container',
    proficiency: 'expert',
    yearsUsed: 6,
    lastUsed: 'current',
    description: 'Containerization expert. Multi-stage builds, optimization.',
    highlights: [
      '80% image size reduction project',
      'Local development environments',
      'Production container orchestration'
    ]
  },

  // Tools
  {
    id: 'git',
    name: 'Git',
    category: 'tools',
    icon: 'GitBranch',
    proficiency: 'expert',
    yearsUsed: 12,
    lastUsed: 'current',
    description: 'Version control expertise. Complex workflows, rebasing, bisect.'
  },
]
```

---

## timeline.ts

```typescript
export interface TimelineEvent {
  id: string
  type: 'job' | 'project' | 'milestone'
  title: string
  organization?: string
  description: string
  date: string | { start: string; end?: string }
  highlights?: string[]
  technologies?: string[]
}

export const timeline: TimelineEvent[] = [
  {
    id: 'hugo-lead',
    type: 'job',
    title: 'Tech Lead, Product Engineering',
    organization: 'Hugo Health',
    date: { start: '2022', end: 'present' },
    description: 'Leading frontend architecture, AI integration, and platform development.',
    highlights: [
      'Architected survey platform serving 30k+ active users',
      'Pioneered AI-assisted development workflows',
      'Managed Terraform-based AWS infrastructure'
    ],
    technologies: ['TypeScript', 'React', 'Next.js', 'AWS', 'Terraform']
  },
  {
    id: 'hugo-senior',
    type: 'job',
    title: 'Software Engineer III',
    organization: 'Hugo Health',
    date: { start: '2020', end: '2022' },
    description: 'Senior IC building core platform features and infrastructure.',
    highlights: [
      'Built innovative EHR integration system',
      'Achieved 80% Docker image size reduction',
      'Led AWS cost optimization initiatives'
    ],
    technologies: ['TypeScript', 'React', 'Node.js', 'Docker', 'AWS']
  },
  {
    id: 'hugo-mid',
    type: 'job',
    title: 'Software Engineer II',
    organization: 'Hugo Health',
    date: { start: '2019', end: '2020' },
    description: 'Full-stack development on healthcare platform.',
    technologies: ['JavaScript', 'React', 'Node.js', 'PostgreSQL']
  },
  {
    id: 'hugo-junior',
    type: 'job',
    title: 'Software Engineer I',
    organization: 'Hugo Health',
    date: { start: '2018', end: '2019' },
    description: 'Started at Hugo Health, building foundational platform features.',
    technologies: ['JavaScript', 'React', 'Node.js']
  },
  // Add earlier career history as needed
]
```

---

## about.ts

```typescript
export const aboutData = {
  name: 'Ryan',
  title: 'Full-Stack Engineer & Infrastructure Architect',
  location: 'Englewood, Florida',
  
  headline: `
    I'm a Full-Stack Engineer with 16+ years of experience building 
    products that matter. Currently architecting systems that serve 
    30,000+ users in healthcare technology.
  `,
  
  currentRole: {
    title: 'Tech Lead, Product Engineering',
    company: 'Hugo Health',
    since: '2018',
    description: 'Building scalable healthcare technology platforms.'
  },
  
  philosophy: [
    {
      title: 'Code as Craft',
      icon: 'Code',
      description: 'Every line should be intentional. Readability and maintainability over cleverness.'
    },
    {
      title: 'User-First',
      icon: 'Users',
      description: 'Technical decisions should serve real human needs. I build features people actually use.'
    },
    {
      title: 'Pragmatic Speed',
      icon: 'Zap',
      description: 'Ship early, iterate fast, but never compromise on foundations.'
    },
    {
      title: 'Systems Thinking',
      icon: 'Layers',
      description: 'Everything connects. I consider the full lifecycle: dev experience, deployment, observability.'
    }
  ],
  
  aiWorkflow: {
    title: 'AI-Assisted Development',
    description: `
      I've developed a strategic approach to AI-assisted development, 
      using each tool for what it does best:
    `,
    tools: [
      { name: 'GitHub Copilot', use: 'Real-time completions in the editor' },
      { name: 'Claude Code', use: 'Complex agentic tasks and refactoring' },
      { name: 'Codex', use: 'Planning and architecture decisions' },
      { name: 'Gemini', use: 'Documentation and explanations' },
    ]
  },
  
  interests: [
    {
      icon: 'Gamepad2',
      title: 'Gaming',
      description: 'Exploring Red Dead Redemption 2, appreciating open-world game design.'
    },
    {
      icon: 'Spade',
      title: 'Card Games',
      description: 'Building a comprehensive blackjack trainer—even card games deserve elegant architecture.'
    }
  ],
  
  social: {
    github: 'https://github.com/...',
    linkedin: 'https://linkedin.com/in/...',
    email: 'ryan@phytertek.com',
  }
}
```

---

## constants.ts

```typescript
export const siteConfig = {
  name: 'Ryan',
  title: 'Ryan | Full-Stack Engineer',
  description: 'Senior software engineer specializing in TypeScript, React, Next.js, and AWS. Building scalable healthcare technology and developer tools.',
  url: 'https://...',
  ogImage: '/og-image.png',
  
  nav: [
    { label: 'Home', href: '/', shortcut: 'G H' },
    { label: 'About', href: '/about', shortcut: 'G A' },
    { label: 'Stack', href: '/stack', shortcut: 'G S' },
    { label: 'Projects', href: '/projects', shortcut: 'G P' },
    { label: 'Infrastructure', href: '/infrastructure', shortcut: 'G I' },
    { label: 'Contact', href: '/contact', shortcut: 'G C' },
  ],
  
  social: {
    github: 'https://github.com/...',
    linkedin: 'https://linkedin.com/in/...',
    twitter: 'https://twitter.com/...',
    email: 'ryan@phytertek.com',
  }
}
```
