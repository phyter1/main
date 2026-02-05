export interface StackItem {
  id: string;
  label: string;
  category:
    | "language"
    | "framework"
    | "library"
    | "database"
    | "devtool"
    | "infrastructure";
  subcategory?: "frontend" | "backend" | "fullstack";
  proficiency: "expert" | "proficient" | "familiar";
  context: "professional" | "personal" | "both";
  personalStack?: boolean; // Highlight as part of personal preferred stack
  description: string;
  yearsUsed?: number;
  icon?: string;
}

export const stackItems: StackItem[] = [
  // Languages
  {
    id: "typescript",
    label: "TypeScript",
    category: "language",
    subcategory: "fullstack",
    proficiency: "expert",
    context: "both",
    personalStack: true,
    description:
      "Primary language for full-stack development with strict typing",
    yearsUsed: 7,
  },
  {
    id: "javascript",
    label: "JavaScript",
    category: "language",
    subcategory: "fullstack",
    proficiency: "expert",
    context: "both",
    description: "ES6+ modern JavaScript for web development",
    yearsUsed: 10,
  },
  {
    id: "hcl",
    label: "HCL",
    category: "language",
    subcategory: "backend",
    proficiency: "proficient",
    context: "professional",
    description: "HashiCorp Configuration Language for infrastructure as code",
    yearsUsed: 4,
  },

  // Frontend Frameworks
  {
    id: "react",
    label: "React",
    category: "framework",
    subcategory: "frontend",
    proficiency: "expert",
    context: "both",
    personalStack: true,
    description: "Primary UI library with hooks and modern patterns",
    yearsUsed: 7,
  },
  {
    id: "nextjs",
    label: "Next.js",
    category: "framework",
    subcategory: "frontend",
    proficiency: "expert",
    context: "both",
    personalStack: true,
    description: "Full-stack React framework with App Router",
    yearsUsed: 5,
  },

  // Backend Frameworks
  {
    id: "nodejs",
    label: "Node.js",
    category: "framework",
    subcategory: "backend",
    proficiency: "expert",
    context: "both",
    description: "JavaScript runtime for backend services",
    yearsUsed: 8,
  },
  {
    id: "hono",
    label: "Hono",
    category: "framework",
    subcategory: "backend",
    proficiency: "expert",
    context: "both",
    personalStack: true,
    description: "Ultrafast web framework for edge runtimes",
    yearsUsed: 2,
  },

  // Frontend Libraries
  {
    id: "tailwind",
    label: "Tailwind CSS",
    category: "library",
    subcategory: "frontend",
    proficiency: "expert",
    context: "both",
    personalStack: true,
    description: "Utility-first CSS framework for rapid UI development",
    yearsUsed: 4,
  },
  {
    id: "shadcn-ui",
    label: "shadcn/ui",
    category: "library",
    subcategory: "frontend",
    proficiency: "expert",
    context: "both",
    personalStack: true,
    description: "Beautifully designed component library built on Radix UI",
    yearsUsed: 2,
  },
  {
    id: "zustand",
    label: "Zustand",
    category: "library",
    subcategory: "frontend",
    proficiency: "expert",
    context: "both",
    personalStack: true,
    description: "Lightweight state management for React applications",
    yearsUsed: 3,
  },
  {
    id: "react-hook-form",
    label: "React Hook Form",
    category: "library",
    subcategory: "frontend",
    proficiency: "expert",
    context: "both",
    personalStack: true,
    description: "Performant form handling with minimal re-renders",
    yearsUsed: 3,
  },
  {
    id: "tanstack-query",
    label: "TanStack Query",
    category: "library",
    subcategory: "frontend",
    proficiency: "expert",
    context: "both",
    personalStack: true,
    description: "Powerful async state management for React",
    yearsUsed: 3,
  },
  {
    id: "tanstack-table",
    label: "TanStack Table",
    category: "library",
    subcategory: "frontend",
    proficiency: "expert",
    context: "both",
    personalStack: true,
    description: "Headless UI for building powerful tables and datagrids",
    yearsUsed: 2,
  },

  // Backend Libraries
  {
    id: "drizzle",
    label: "Drizzle ORM",
    category: "library",
    subcategory: "backend",
    proficiency: "expert",
    context: "both",
    personalStack: true,
    description: "TypeScript ORM with SQL-like syntax and type safety",
    yearsUsed: 2,
  },
  {
    id: "zod",
    label: "Zod",
    category: "library",
    subcategory: "backend",
    proficiency: "expert",
    context: "both",
    personalStack: true,
    description:
      "TypeScript-first schema validation with static type inference",
    yearsUsed: 3,
  },
  {
    id: "openapi",
    label: "OpenAPI",
    category: "library",
    subcategory: "backend",
    proficiency: "expert",
    context: "both",
    personalStack: true,
    description: "API specification standard for REST APIs",
    yearsUsed: 4,
  },
  {
    id: "scalar",
    label: "Scalar",
    category: "library",
    subcategory: "backend",
    proficiency: "expert",
    context: "both",
    personalStack: true,
    description: "Beautiful API documentation from OpenAPI specifications",
    yearsUsed: 1,
  },
  {
    id: "graphql",
    label: "GraphQL",
    category: "library",
    subcategory: "backend",
    proficiency: "proficient",
    context: "professional",
    description: "API query language and runtime",
    yearsUsed: 4,
  },

  // Databases
  {
    id: "postgresql",
    label: "PostgreSQL",
    category: "database",
    proficiency: "expert",
    context: "both",
    personalStack: true,
    description: "Primary relational database for production systems",
    yearsUsed: 7,
  },
  {
    id: "redis",
    label: "Redis",
    category: "database",
    proficiency: "expert",
    context: "both",
    personalStack: true,
    description: "In-memory data store for caching and sessions",
    yearsUsed: 5,
  },
  {
    id: "mongodb",
    label: "MongoDB",
    category: "database",
    proficiency: "proficient",
    context: "professional",
    description: "NoSQL document database for flexible data models",
    yearsUsed: 7,
  },
  {
    id: "mysql",
    label: "MySQL",
    category: "database",
    proficiency: "proficient",
    context: "professional",
    description: "Open-source relational database management system",
    yearsUsed: 7,
  },

  // Development Tools
  {
    id: "bun",
    label: "Bun",
    category: "devtool",
    proficiency: "expert",
    context: "both",
    personalStack: true,
    description:
      "All-in-one JavaScript runtime, package manager, bundler, and test runner",
    yearsUsed: 2,
  },
  {
    id: "biome",
    label: "Biome",
    category: "devtool",
    proficiency: "expert",
    context: "both",
    personalStack: true,
    description: "Fast formatter and linter for JavaScript/TypeScript",
    yearsUsed: 1,
  },
  {
    id: "claude-code",
    label: "Claude Code",
    category: "devtool",
    proficiency: "expert",
    context: "both",
    personalStack: true,
    description:
      "AI-powered coding assistant for test generation, refactoring, and agentic development tasks",
    yearsUsed: 1,
  },
  {
    id: "github-copilot",
    label: "GitHub Copilot",
    category: "devtool",
    proficiency: "expert",
    context: "both",
    personalStack: true,
    description:
      "AI pair programmer for code completion and suggestion in real-time",
    yearsUsed: 3,
  },
  {
    id: "chatgpt",
    label: "ChatGPT",
    category: "devtool",
    proficiency: "expert",
    context: "both",
    description:
      "AI assistant for architecture planning, problem-solving, and technical research",
    yearsUsed: 2,
  },
  {
    id: "langchain",
    label: "LangChain",
    category: "devtool",
    proficiency: "proficient",
    context: "personal",
    personalStack: true,
    description:
      "Framework for building LLM applications with RAG, agents, and multi-step workflows",
    yearsUsed: 1,
  },
  {
    id: "huggingface",
    label: "Hugging Face",
    category: "devtool",
    proficiency: "proficient",
    context: "personal",
    personalStack: true,
    description:
      "Platform for SLM experimentation, local model deployment, and model evaluation",
    yearsUsed: 1,
  },
  {
    id: "git",
    label: "Git",
    category: "devtool",
    proficiency: "expert",
    context: "both",
    description: "Version control and collaboration",
    yearsUsed: 10,
  },
  {
    id: "vscode",
    label: "VS Code",
    category: "devtool",
    proficiency: "expert",
    context: "both",
    description: "Primary development environment",
    yearsUsed: 7,
  },
  {
    id: "github-actions",
    label: "GitHub Actions",
    category: "devtool",
    proficiency: "proficient",
    context: "professional",
    description: "CI/CD automation and deployment pipelines",
    yearsUsed: 4,
  },
  {
    id: "azure-devops",
    label: "Azure DevOps",
    category: "devtool",
    proficiency: "proficient",
    context: "professional",
    description: "CI/CD pipelines and project management",
    yearsUsed: 5,
  },

  // Infrastructure
  {
    id: "aws",
    label: "AWS",
    category: "infrastructure",
    proficiency: "proficient",
    context: "professional",
    description: "Cloud infrastructure (EC2, Lambda, S3, RDS, CloudFront)",
    yearsUsed: 8,
  },
  {
    id: "docker",
    label: "Docker",
    category: "infrastructure",
    proficiency: "expert",
    context: "both",
    description: "Containerization for consistent environments",
    yearsUsed: 6,
  },
  {
    id: "terraform",
    label: "Terraform",
    category: "infrastructure",
    proficiency: "proficient",
    context: "professional",
    description: "Infrastructure as Code for cloud provisioning",
    yearsUsed: 4,
  },
  {
    id: "nixpacks",
    label: "Nixpacks",
    category: "infrastructure",
    proficiency: "proficient",
    context: "personal",
    personalStack: true,
    description: "App source + Nix packages + Docker = reproducible builds",
    yearsUsed: 1,
  },
  {
    id: "vercel",
    label: "Vercel",
    category: "infrastructure",
    proficiency: "expert",
    context: "personal",
    personalStack: true,
    description:
      "Managed deployment platform for Next.js - consolidated from self-hosted infrastructure for simplicity",
    yearsUsed: 3,
  },
  {
    id: "kubernetes",
    label: "Kubernetes",
    category: "infrastructure",
    proficiency: "proficient",
    context: "professional",
    description: "Container orchestration for scalable deployments",
    yearsUsed: 7,
  },
];

export const getStackByCategory = (
  category: StackItem["category"],
): StackItem[] => {
  return stackItems.filter((item) => item.category === category);
};

export const getStackByProficiency = (
  proficiency: StackItem["proficiency"],
): StackItem[] => {
  return stackItems.filter((item) => item.proficiency === proficiency);
};

export const getPersonalStack = (): StackItem[] => {
  return stackItems.filter((item) => item.personalStack === true);
};

export const getStackByContext = (
  context: StackItem["context"],
): StackItem[] => {
  return stackItems.filter((item) => item.context === context);
};
