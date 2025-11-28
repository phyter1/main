export interface Project {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  thumbnail?: string;
  technologies: string[];
  links: {
    demo?: string;
    github?: string;
    article?: string;
  };
  featured: boolean;
  status: "live" | "in-progress" | "archived";
  category: "personal" | "professional";
  date?: string; // Date for timeline placement (YYYY-MM format)
  metrics?: {
    users?: number;
    stars?: number;
    performance?: string;
  };
  highlights: string[];
}

export const projects: Project[] = [
  {
    id: "hugo-connect",
    title: "Hugo Connect Healthcare Platform",
    description:
      "Full-stack architecture for healthcare application serving 30,000+ active users with EHR integration and dynamic survey capabilities.",
    longDescription:
      "Led complete architecture and development of Hugo Connect, a comprehensive healthcare platform that empowers patients to access and manage their health records. Built with modern TypeScript stack and cloud-native infrastructure.",
    technologies: [
      "TypeScript",
      "Next.js",
      "React",
      "Node.js",
      "Terraform",
      "Azure DevOps",
      "AWS",
      "Docker",
    ],
    links: {},
    featured: true,
    status: "live",
    category: "professional",
    date: "2020-01",
    metrics: {
      users: 30000,
      performance: "99.9% uptime SLA",
    },
    highlights: [
      "Full-stack ownership: Infrastructure (Terraform), CI/CD (Azure DevOps), and application development",
      "Serving 30,000+ active users in production",
      "Optimized Docker builds reducing image sizes by 80%",
      "Led AWS cost optimization initiatives",
    ],
  },
  {
    id: "ehr-integration",
    title: "Distributed EHR Data Retrieval System",
    description:
      "Scalable browser automation system using AWS Fargate with XVFB-enabled Docker containers and random IP rotation to avoid bot detection for patient-authorized health record retrieval.",
    longDescription:
      "Engineered a sophisticated distributed system that spins up AWS Fargate Docker instances with XVFB installed to run headed Puppeteer browsers from random IP addresses. This architecture avoided bot detection systems, enabling automated patient-authorized login and data retrieval from multiple EHR platforms including Epic and Cerner, predating the FHIR mandate.",
    technologies: [
      "TypeScript",
      "Node.js",
      "Puppeteer",
      "XVFB",
      "AWS Fargate",
      "Docker",
      "AWS ECS",
    ],
    links: {},
    featured: true,
    status: "live",
    category: "professional",
    date: "2019-08",
    highlights: [
      "AWS Fargate-based distributed browser automation",
      "XVFB Docker containers for headed Puppeteer instances",
      "Random IP rotation to circumvent bot detection",
      "Patient-authorized retrieval across Epic, Cerner, and other EHR systems",
    ],
  },
  {
    id: "survey-platform",
    title: "Dynamic Branching Survey System",
    description:
      "Architected comprehensive survey platform with visual builder, logic branching, custom prescription lookups, and interactive body maps.",
    longDescription:
      "Designed and built a sophisticated survey system featuring a drag-and-drop visual builder with advanced capabilities including complex logic branching, custom prescription drug lookups, interactive anatomical body maps, and matrix question types. Powers patient intake and health assessments.",
    technologies: ["TypeScript", "React", "Next.js", "PostgreSQL", "Node.js"],
    links: {},
    featured: true,
    status: "live",
    category: "professional",
    date: "2018-11",
    highlights: [
      "Visual drag-and-drop survey builder",
      "Advanced conditional logic and branching",
      "Custom prescription medication lookup integration",
      "Interactive body map for symptom tracking",
    ],
  },
  {
    id: "ai-workflow",
    title: "AI-Assisted Development Workflow (2024)",
    description:
      "Strategic multi-tool AI development approach using GitHub Copilot, Claude Code, Codex, and Gemini for optimal developer productivity in production since 2024.",
    longDescription:
      "Beginning in 2024, pioneered and championed AI-assisted development practices across the organization. Developed strategic approach to selecting and using multiple AI tools for different use cases: GitHub Copilot for IDE completions, Claude Code for test generation and agentic tasks, Codex for planning, and Gemini for documentation. Accelerates delivery while maintaining enterprise code quality standards.",
    technologies: [
      "GitHub Copilot",
      "Claude Code",
      "Codex",
      "Gemini",
      "TypeScript",
    ],
    links: {},
    featured: true,
    status: "live",
    category: "professional",
    date: "2024-01",
    highlights: [
      "Championed AI-assisted development starting in 2024",
      "Strategic tool selection for optimal use cases",
      "Maintained enterprise code quality standards",
      "Accelerated delivery while enhancing code quality",
    ],
  },
  {
    id: "stripe-components",
    title: "Stripe Payment Component Library",
    description:
      "Reusable component library with base input templates for payment processing interfaces during contract work at Stripe.",
    longDescription:
      "Developed a comprehensive library of reusable React components for Stripe's payment processing interfaces. Created flexible base input templates that maintained consistency across payment flows while being customizable for different use cases.",
    technologies: ["JavaScript", "React", "Stripe API"],
    links: {},
    featured: false,
    status: "archived",
    category: "professional",
    date: "2018-04",
    highlights: [
      "Built reusable component library",
      "Created flexible base input templates",
      "Maintained consistency across payment flows",
    ],
  },
  {
    id: "blackjack-trainer",
    title: "Blackjack Card Counting Trainer",
    description:
      "Full-featured blackjack training platform with multiple counting systems, game modes, and comprehensive statistics tracking. Practice card counting skills with realistic casino simulations.",
    longDescription:
      "A comprehensive blackjack game simulation and training platform featuring a fully-functional game engine, beautiful casino-style UI, and extensive card counting training modes. Built with modern TypeScript stack and includes sophisticated features like audit trails, session replay, and configurable rule sets for different casino variations.",
    technologies: [
      "Next.js",
      "React",
      "TypeScript",
      "Tailwind CSS",
      "Bun",
      "shadcn/ui",
    ],
    links: {
      demo: "https://21.phytertek.com",
      github: "https://github.com/phytertek-1/blackjack",
    },
    featured: true,
    status: "live",
    category: "personal",
    date: "2024-09",
    highlights: [
      "Complete blackjack engine with all standard actions (split, double, surrender)",
      "Card counting trainer with beginner, intermediate, and advanced modes",
      "Multiple rule sets (Vegas Strip, Atlantic City, European)",
      "Comprehensive audit trail system with 25+ event types and session replay",
    ],
  },
  {
    id: "tts-cli",
    title: "TTS CLI - Text-to-Speech Library",
    description:
      "Fast, cross-platform command-line tool for text-to-speech using Microsoft Edge TTS. Supports 200+ voices across 100+ languages with enterprise-grade security scanning.",
    longDescription:
      "A high-performance text-to-speech CLI tool built with Bun that leverages Microsoft Edge TTS for high-quality speech synthesis. Features comprehensive security scanning with CodeQL, Semgrep, Snyk, and other tools. Distributed as standalone executables for all major platforms with automated CI/CD pipelines.",
    technologies: [
      "TypeScript",
      "Bun",
      "Node.js",
      "Microsoft Edge TTS",
      "GitHub Actions",
    ],
    links: {
      github: "https://github.com/phyter1/tts-cli",
    },
    featured: true,
    status: "live",
    category: "personal",
    date: "2024-08",
    highlights: [
      "200+ voices across 100+ languages with adjustable rate and pitch",
      "Cross-platform standalone executables (macOS, Linux, Windows)",
      "Enterprise security scanning (CodeQL, Semgrep, Snyk, OWASP, Trivy)",
      "19MB compressed executables with automated release pipeline",
    ],
  },
  {
    id: "portfolio",
    title: "Personal Portfolio",
    description:
      "Modern portfolio website showcasing projects and technical expertise. Built with cutting-edge technologies including Next.js 16, React 19, and Tailwind CSS 4.",
    longDescription:
      "A responsive portfolio application built with the latest web technologies. Features animated UI components, custom theming system, and optimized performance. Demonstrates expertise in modern web development practices and attention to detail in user experience.",
    technologies: [
      "Next.js",
      "React",
      "TypeScript",
      "Tailwind CSS",
      "shadcn/ui",
      "Framer Motion",
      "Biome",
    ],
    links: {
      demo: "https://ryan.phytertek.com",
      github: "https://github.com/phyter1/main",
    },
    featured: true,
    status: "live",
    category: "personal",
    date: "2025-01",
    highlights: [
      "Built with Next.js 16 and React 19 with React Compiler enabled",
      "Custom theming system using Tailwind CSS 4 with OKLCH color space",
      "Animated UI with Framer Motion and reduced motion support",
      "Modern developer tooling with Biome for linting and formatting",
    ],
  },
];

export const getFeaturedProjects = (): Project[] => {
  return projects.filter((project) => project.featured);
};

export const getProjectsByStatus = (status: Project["status"]): Project[] => {
  return projects.filter((project) => project.status === status);
};
