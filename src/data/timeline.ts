import { type Project, projects } from "./projects";

export interface TimelineEvent {
  id: string;
  type: "job" | "project" | "milestone" | "education";
  title: string;
  organization?: string;
  description: string;
  date: string | { start: string; end?: string };
  highlights?: string[];
  technologies?: string[];
}

// Convert projects to timeline events
function projectToTimelineEvent(project: Project): TimelineEvent {
  return {
    id: project.id,
    type: "project",
    title: project.title,
    description: project.description,
    date: project.date || "2018-01", // Fallback date if not specified
    highlights: project.highlights,
    technologies: project.technologies,
  };
}

export const timelineEvents: TimelineEvent[] = [
  {
    id: "hugo-tech-lead",
    type: "job",
    title: "Tech Lead, Product Engineering",
    organization: "Hugo Health",
    description:
      "Leading full-stack architecture for Hugo Connect application serving 30,000+ active users. Championing AI-assisted development practices across the organization.",
    date: { start: "2020-01", end: undefined },
    highlights: [
      "Own full-stack architecture including infrastructure (Terraform), CI/CD (Azure DevOps), and application development",
      "Champion AI-assisted development with strategic multi-tool approach (GitHub Copilot, Claude Code, Codex, Gemini)",
      "Lead architecture decisions, conduct code reviews, and mentor team on modern development practices",
      "Optimized Docker images for Next.js, reducing build sizes by 80%",
      "Led AWS cost optimization through EKS cluster consolidation",
    ],
    technologies: [
      "TypeScript",
      "Node.js",
      "Next.js",
      "React",
      "Terraform",
      "Azure DevOps",
      "AWS",
      "Docker",
    ],
  },
  {
    id: "hugo-senior",
    type: "job",
    title: "Software Engineer III",
    organization: "Hugo Health",
    description:
      "Advanced to senior engineer role, taking on greater architecture responsibilities and mentoring team members.",
    date: { start: "2019-01", end: "2020-01" },
    highlights: [
      "Led architecture decisions and code reviews",
      "Designed and implemented RESTful APIs",
      "Mentored junior engineers on development practices",
      "Optimized application performance and user experience",
    ],
    technologies: ["TypeScript", "React", "Node.js", "PostgreSQL", "AWS"],
  },
  {
    id: "hugo-engineer",
    type: "job",
    title: "Software Engineer I",
    organization: "Hugo Health",
    description:
      "Started journey in healthcare technology, building features for patient health record management platform.",
    date: { start: "2018-05", end: "2019-01" },
    highlights: [
      "Developed features for Hugo Connect application",
      "Built responsive interfaces with React and TypeScript",
      "Implemented API integrations",
      "Contributed to CI/CD pipeline improvements",
    ],
    technologies: ["JavaScript", "TypeScript", "React", "Node.js", "AWS"],
  },
  {
    id: "stripe-contract",
    type: "job",
    title: "Full Stack Engineer (Contract)",
    organization: "Stripe",
    description:
      "Contract role developing reusable component library for payment processing interfaces.",
    date: { start: "2018-03", end: "2018-05" },
    highlights: [
      "Developed reusable component library with base input templates",
      "Built payment processing interfaces",
      "Collaborated with design team on component specifications",
    ],
    technologies: ["JavaScript", "React"],
  },
  {
    id: "salesforce-era",
    type: "job",
    title: "Salesforce Development & IT Leadership",
    organization: "Multiple Organizations",
    description:
      "Led enterprise application development and technology operations across Saint Leo University, International Living Future Institute, Phillips Contracting, and Lumenal Lighting.",
    date: { start: "2013-01", end: "2017-12" },
    highlights: [
      "Managed cloud migrations and systems administration",
      "Developed custom Salesforce applications",
      "Led IT operations and infrastructure projects",
      "Earned multiple Salesforce Trailhead certifications",
    ],
    technologies: ["Salesforce", "Apex", "Lightning Components"],
  },
  {
    id: "sysadmin-era",
    type: "job",
    title: "Systems & Network Administration",
    organization: "Multiple Organizations",
    description:
      "Provided IT support and systems administration across Vesta Property Services, CR Techs, Englewood On-line, and Microtek.",
    date: { start: "2005-01", end: "2013-01" },
    highlights: [
      "Systems administration and network management",
      "Hardware troubleshooting and infrastructure support",
      "End-user technical support and training",
    ],
    technologies: [],
  },
];

export const getEventsByType = (
  type: TimelineEvent["type"],
): TimelineEvent[] => {
  return timelineEvents.filter((event) => event.type === type);
};

export const getSortedTimeline = (): TimelineEvent[] => {
  // Convert projects to timeline events and merge with other events
  const projectEvents = projects.map(projectToTimelineEvent);
  const allEvents = [...timelineEvents, ...projectEvents];

  return allEvents.sort((a, b) => {
    // Always use start date for sorting (for date ranges)
    const dateA = typeof a.date === "string" ? a.date : a.date.start;
    const dateB = typeof b.date === "string" ? b.date : b.date.start;
    return dateB.localeCompare(dateA); // Most recent first
  });
};
