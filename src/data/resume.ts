import {
  getAllPrinciples,
  type Principle,
  principleGroups,
} from "./principles";
import { type Project, projects } from "./projects";
import { type StackItem, stackItems } from "./stack";
import { type TimelineEvent, timelineEvents } from "./timeline";

/**
 * Proficiency levels for skills taxonomy
 * - expert: Deep expertise, can teach others, production experience
 * - intermediate: Solid working knowledge, can build features independently
 * - learning: Currently learning or limited production experience
 * - gap: Knowledge gap or area for improvement
 */
export type ProficiencyLevel = "expert" | "intermediate" | "learning" | "gap";

/**
 * Skill categories matching the stack organization
 */
export type SkillCategory =
  | "languages"
  | "frameworks"
  | "databases"
  | "devTools"
  | "infrastructure";

/**
 * Individual skill with proficiency level
 */
export interface Skill {
  name: string;
  proficiency: ProficiencyLevel;
  yearsUsed?: number;
  description?: string;
  category: StackItem["category"];
}

/**
 * Skills organized by category
 */
export interface SkillsTaxonomy {
  languages: Skill[];
  frameworks: Skill[];
  databases: Skill[];
  devTools: Skill[];
  infrastructure: Skill[];
}

/**
 * Personal information
 */
export interface PersonalInfo {
  name: string;
  title: string;
  location: string;
  summary: string;
}

/**
 * Experience entry from timeline
 */
export interface ExperienceEntry {
  title: string;
  organization: string;
  period: string;
  description: string;
  highlights: string[];
  technologies?: string[];
  type: TimelineEvent["type"];
}

/**
 * Complete resume data structure for LLM context
 */
export interface Resume {
  personalInfo: PersonalInfo;
  experience: ExperienceEntry[];
  skills: SkillsTaxonomy;
  projects: Project[];
  principles: Principle[];
}

/**
 * Convert stack proficiency to resume proficiency level
 */
function mapStackProficiency(
  stackProficiency: StackItem["proficiency"],
): ProficiencyLevel {
  switch (stackProficiency) {
    case "expert":
      return "expert";
    case "proficient":
      return "intermediate";
    case "familiar":
      return "learning";
    default:
      return "intermediate";
  }
}

/**
 * Convert StackItem to Skill
 */
function stackItemToSkill(item: StackItem): Skill {
  return {
    name: item.label,
    proficiency: mapStackProficiency(item.proficiency),
    yearsUsed: item.yearsUsed,
    description: item.description,
    category: item.category,
  };
}

/**
 * Organize skills by category
 */
function organizeSkillsByCategory(): SkillsTaxonomy {
  const skills = stackItems.map(stackItemToSkill);

  return {
    languages: skills.filter((s) => s.category === "language"),
    frameworks: skills.filter((s) => s.category === "framework"),
    databases: skills.filter((s) => s.category === "database"),
    devTools: skills.filter((s) => s.category === "devtool"),
    infrastructure: skills.filter((s) => s.category === "infrastructure"),
  };
}

/**
 * Format timeline date for experience entry
 */
function formatTimelinePeriod(date: TimelineEvent["date"]): string {
  if (typeof date === "string") {
    return date;
  }
  const start = date.start;
  const end = date.end || "Present";
  return `${start} - ${end}`;
}

/**
 * Convert TimelineEvent to ExperienceEntry
 */
function timelineEventToExperience(event: TimelineEvent): ExperienceEntry {
  return {
    title: event.title,
    organization: event.organization || "Independent",
    period: formatTimelinePeriod(event.date),
    description: event.description,
    highlights: event.highlights || [],
    technologies: event.technologies,
    type: event.type,
  };
}

/**
 * Main resume data structure
 */
export const resume: Resume = {
  personalInfo: {
    name: "Ryan Lowe",
    title: "Tech Lead, Product Engineering",
    location: "Remote",
    summary:
      "Full-stack engineer with 10+ years of experience building scalable healthcare and enterprise applications. Expert in TypeScript, React, Node.js, and cloud infrastructure. Champion of AI-assisted development practices and modern engineering principles. Currently leading architecture and development for Hugo Connect, serving 30,000+ active users.",
  },
  experience: timelineEvents
    .filter((event) => event.type === "job")
    .map(timelineEventToExperience)
    .sort((a, b) => {
      // Most recent first
      if (a.period.includes("Present")) return -1;
      if (b.period.includes("Present")) return 1;
      return b.period.localeCompare(a.period);
    }),
  skills: organizeSkillsByCategory(),
  projects: projects,
  principles: getAllPrinciples(),
};

/**
 * Format resume as markdown for LLM context
 */
export function formatResumeAsLLMContext(resume: Resume): string {
  let markdown = "";

  // Personal Information
  markdown += `# ${resume.personalInfo.name}\n\n`;
  markdown += `**${resume.personalInfo.title}**\n\n`;
  markdown += `${resume.personalInfo.summary}\n\n`;
  markdown += `**Location:** ${resume.personalInfo.location}\n\n`;

  // Experience
  markdown += "## Professional Experience\n\n";
  for (const exp of resume.experience) {
    markdown += `### ${exp.title}\n`;
    markdown += `**${exp.organization}** | ${exp.period}\n\n`;
    markdown += `${exp.description}\n\n`;

    if (exp.highlights.length > 0) {
      markdown += "**Key Achievements:**\n";
      for (const highlight of exp.highlights) {
        markdown += `- ${highlight}\n`;
      }
      markdown += "\n";
    }

    if (exp.technologies && exp.technologies.length > 0) {
      markdown += `**Technologies:** ${exp.technologies.join(", ")}\n\n`;
    }
  }

  // Skills by Category
  markdown += "## Technical Skills\n\n";

  // Languages
  if (resume.skills.languages.length > 0) {
    markdown += "### Languages\n";
    for (const skill of resume.skills.languages) {
      markdown += `- **${skill.name}** (${skill.proficiency})`;
      if (skill.yearsUsed) {
        markdown += ` - ${skill.yearsUsed} years`;
      }
      if (skill.description) {
        markdown += `: ${skill.description}`;
      }
      markdown += "\n";
    }
    markdown += "\n";
  }

  // Frameworks
  if (resume.skills.frameworks.length > 0) {
    markdown += "### Frameworks\n";
    for (const skill of resume.skills.frameworks) {
      markdown += `- **${skill.name}** (${skill.proficiency})`;
      if (skill.yearsUsed) {
        markdown += ` - ${skill.yearsUsed} years`;
      }
      if (skill.description) {
        markdown += `: ${skill.description}`;
      }
      markdown += "\n";
    }
    markdown += "\n";
  }

  // Databases
  if (resume.skills.databases.length > 0) {
    markdown += "### Databases\n";
    for (const skill of resume.skills.databases) {
      markdown += `- **${skill.name}** (${skill.proficiency})`;
      if (skill.yearsUsed) {
        markdown += ` - ${skill.yearsUsed} years`;
      }
      if (skill.description) {
        markdown += `: ${skill.description}`;
      }
      markdown += "\n";
    }
    markdown += "\n";
  }

  // Dev Tools
  if (resume.skills.devTools.length > 0) {
    markdown += "### Dev Tools\n";
    for (const skill of resume.skills.devTools) {
      markdown += `- **${skill.name}** (${skill.proficiency})`;
      if (skill.yearsUsed) {
        markdown += ` - ${skill.yearsUsed} years`;
      }
      if (skill.description) {
        markdown += `: ${skill.description}`;
      }
      markdown += "\n";
    }
    markdown += "\n";
  }

  // Infrastructure
  if (resume.skills.infrastructure.length > 0) {
    markdown += "### Infrastructure\n";
    for (const skill of resume.skills.infrastructure) {
      markdown += `- **${skill.name}** (${skill.proficiency})`;
      if (skill.yearsUsed) {
        markdown += ` - ${skill.yearsUsed} years`;
      }
      if (skill.description) {
        markdown += `: ${skill.description}`;
      }
      markdown += "\n";
    }
    markdown += "\n";
  }

  // Projects
  markdown += "## Notable Projects\n\n";
  const featuredProjects = resume.projects.filter((p) => p.featured);
  for (const project of featuredProjects) {
    markdown += `### ${project.title}\n`;
    markdown += `${project.description}\n\n`;
    markdown += `${project.longDescription}\n\n`;

    if (project.highlights.length > 0) {
      markdown += "**Highlights:**\n";
      for (const highlight of project.highlights) {
        markdown += `- ${highlight}\n`;
      }
      markdown += "\n";
    }

    markdown += `**Technologies:** ${project.technologies.join(", ")}\n`;
    markdown += `**Status:** ${project.status}\n\n`;
  }

  // Engineering Principles
  markdown += "## Engineering Principles\n\n";
  for (const group of principleGroups) {
    markdown += `### ${group.title}\n`;
    markdown += `*${group.subtitle}*\n\n`;
    markdown += `${group.description}\n\n`;

    for (const principle of group.principles) {
      markdown += `#### ${principle.title}\n`;
      markdown += `${principle.description}\n\n`;
      markdown += `**Application:** ${principle.application}\n\n`;
    }
  }

  return markdown;
}

/**
 * Get skills by category
 */
export function getSkillsByCategory(
  resume: Resume,
  category: SkillCategory,
): Skill[] {
  return resume.skills[category];
}

/**
 * Get skills by proficiency level
 */
export function getExpertiseByProficiency(
  resume: Resume,
  proficiency: ProficiencyLevel,
): Skill[] {
  const allSkills = [
    ...resume.skills.languages,
    ...resume.skills.frameworks,
    ...resume.skills.databases,
    ...resume.skills.devTools,
    ...resume.skills.infrastructure,
  ];

  return allSkills.filter((skill) => skill.proficiency === proficiency);
}
