export interface ProjectContext {
  situation: string;
  task: string;
  action: string;
  result: string;
}

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
  context?: ProjectContext;
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
    context: {
      situation:
        "Hugo Health needed a comprehensive healthcare platform to empower 30,000+ patients to access and manage their health records. The platform required robust EHR integration, dynamic survey capabilities, and enterprise-grade infrastructure to support sensitive healthcare data.",
      task: "Lead the complete architecture and development of a full-stack healthcare platform with cloud-native infrastructure, implementing secure EHR integrations, dynamic survey systems, and scalable CI/CD pipelines while maintaining 99.9% uptime SLA.",
      action:
        "Architected and developed the platform using TypeScript, Next.js, and React for the frontend, with Node.js backend services. Implemented infrastructure as code using Terraform, built comprehensive CI/CD pipelines in Azure DevOps, and deployed to AWS with Docker containerization. Optimized Docker builds to reduce image sizes by 80% and led cost optimization initiatives to improve infrastructure efficiency.",
      result:
        "Successfully delivered a production platform serving 30,000+ active users with 99.9% uptime SLA. The platform now provides seamless EHR integration, dynamic survey capabilities, and enterprise-grade security for healthcare data management. Achieved significant cost savings through infrastructure optimization and established scalable development practices.",
    },
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
    context: {
      situation:
        "Before the FHIR mandate, patients needed a way to authorize retrieval of their health records from multiple EHR platforms (Epic, Cerner, etc.). These platforms had sophisticated bot detection systems that prevented automated access, making it extremely difficult to build a scalable solution for patient-authorized data retrieval.",
      task: "Design and build a distributed browser automation system that could circumvent bot detection mechanisms while maintaining patient authorization and security. The system needed to scale reliably across multiple EHR platforms and handle concurrent requests efficiently.",
      action:
        "Engineered a sophisticated AWS Fargate-based architecture that spins up Docker instances with XVFB installed to run headed Puppeteer browsers from random IP addresses. Implemented TypeScript/Node.js orchestration layer using AWS ECS for container management. Designed IP rotation strategy and browser fingerprinting techniques to avoid detection while maintaining full compliance with patient authorization requirements.",
      result:
        "Successfully deployed a production system that retrieves patient-authorized health records across Epic, Cerner, and other major EHR platforms. The distributed architecture scales automatically with demand, maintains high reliability, and successfully circumvents bot detection while remaining fully compliant with healthcare regulations and patient authorization protocols.",
    },
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
    context: {
      situation:
        "Healthcare providers needed a flexible system to create and manage patient intake forms and health assessments. Existing survey tools lacked the specialized features required for healthcare use cases, such as prescription drug lookups, anatomical symptom mapping, and complex conditional logic based on patient responses.",
      task: "Design and build a comprehensive survey platform from scratch that would support visual survey creation, advanced conditional branching, healthcare-specific question types (prescription lookups, body maps), and seamless integration with patient intake workflows.",
      action:
        "Architected and developed a full-stack survey system using TypeScript, React, Next.js, and PostgreSQL. Built a drag-and-drop visual builder interface that allows non-technical users to create complex surveys. Implemented advanced conditional logic engine for branching based on responses, integrated prescription medication database with intelligent lookup, and created interactive anatomical body maps for symptom tracking. Added support for matrix question types and various response formats.",
      result:
        "Delivered a production-ready survey platform that powers patient intake and health assessments for healthcare providers. The system enables clinical staff to create sophisticated, branching surveys without developer intervention. Features like prescription lookup and body mapping have significantly improved data collection quality and patient experience during intake processes.",
    },
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
    context: {
      situation:
        "Card counting is a valuable skill for understanding probability and game theory, but practicing requires either expensive trips to casinos or subpar training tools that don't accurately simulate real casino conditions. Most existing trainers lack proper game engines, comprehensive audit trails, or support for multiple casino rule variations.",
      task: "Build a professional-grade blackjack training platform that accurately simulates casino conditions, supports multiple counting systems and game modes, provides detailed session analytics, and offers an engaging user experience comparable to real casino play.",
      action:
        "Developed a complete blackjack game engine in TypeScript supporting all standard actions (hit, stand, split, double down, surrender) with Next.js and React for the UI. Built three progressive training modes (beginner, intermediate, advanced) with real-time counting feedback. Implemented configurable rule sets for major casino variations (Vegas Strip, Atlantic City, European). Created a comprehensive audit trail system tracking 25+ event types with session replay capabilities. Designed a casino-style interface using Tailwind CSS and shadcn/ui components.",
      result:
        "Launched a fully-functional blackjack training platform at 21.phytertek.com that provides realistic casino simulation for card counting practice. The platform features accurate probability calculations, multiple counting systems, detailed analytics, and an immersive casino-style experience. The audit trail and replay system enables in-depth analysis of playing strategies and decision-making patterns.",
    },
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
      demo: "https://phytertek.com",
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
