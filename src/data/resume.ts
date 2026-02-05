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

/**
 * T010: Dynamic Resume Update Types and Functions
 */

/**
 * Resume update data types for each section
 */
type ExperienceUpdateData = Partial<ExperienceEntry>;
type SkillUpdateData = {
  category?: SkillCategory;
  skill?: Skill;
  proficiency?: ProficiencyLevel;
};
type ProjectUpdateData = Partial<Project>;
type PrincipleUpdateData = Partial<Principle>;

/**
 * Resume update operation type
 */
export type ResumeUpdate = {
  section: "experience" | "skills" | "projects" | "principles";
  operation: "add" | "update" | "delete";
  data:
    | ExperienceUpdateData
    | SkillUpdateData
    | ProjectUpdateData
    | PrincipleUpdateData
    | Record<string, unknown>;
  id?: string;
};

/**
 * Validation result structure
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validate resume update structure and data types
 */
export function validateResumeUpdate(update: ResumeUpdate): ValidationResult {
  const errors: string[] = [];

  // Validate section
  const validSections = ["experience", "skills", "projects", "principles"];
  if (!validSections.includes(update.section)) {
    errors.push(
      `Invalid section: ${update.section}. Must be one of: ${validSections.join(", ")}`,
    );
  }

  // Validate operation
  const validOperations = ["add", "update", "delete"];
  if (!validOperations.includes(update.operation)) {
    errors.push(
      `Invalid operation: ${update.operation}. Must be one of: ${validOperations.join(", ")}`,
    );
  }

  // Validate id for update/delete operations
  if (
    (update.operation === "update" || update.operation === "delete") &&
    !update.id
  ) {
    errors.push("Update and delete operations require an id");
  }

  // Validate data structure based on section
  if (update.operation === "add" || update.operation === "update") {
    const data = update.data as Record<string, unknown>;
    switch (update.section) {
      case "experience":
        if (update.operation === "add") {
          if (!data.title) errors.push("Experience requires title");
          if (!data.organization)
            errors.push("Experience requires organization");
          if (!data.period) errors.push("Experience requires period");
          if (!data.description) errors.push("Experience requires description");
          if (!Array.isArray(data.highlights))
            errors.push("Experience requires highlights array");
          if (!data.type) errors.push("Experience requires type");
        }
        break;

      case "skills":
        if (update.operation === "add") {
          if (!data.category) errors.push("Skill requires category");
          if (!data.skill) errors.push("Skill requires skill object");
          const skill = data.skill as Record<string, unknown> | undefined;
          if (skill && !skill.name) errors.push("Skill requires name");
          if (skill && !skill.proficiency)
            errors.push("Skill requires proficiency");
          if (skill && !skill.category)
            errors.push("Skill requires category in skill object");
        }
        break;

      case "projects":
        if (update.operation === "add") {
          if (!data.id) errors.push("Project requires id");
          if (!data.title) errors.push("Project requires title");
          if (!data.description) errors.push("Project requires description");
          if (!data.longDescription)
            errors.push("Project requires longDescription");
          if (!Array.isArray(data.technologies))
            errors.push("Project requires technologies array");
          if (!Array.isArray(data.highlights))
            errors.push("Project requires highlights array");
          if (!data.status) errors.push("Project requires status");
          if (typeof data.featured !== "boolean")
            errors.push("Project requires featured boolean");
          if (!Array.isArray(data.links))
            errors.push("Project requires links array");
        }
        break;

      case "principles":
        if (update.operation === "add") {
          if (!data.id) errors.push("Principle requires id");
          if (!data.groupId) errors.push("Principle requires groupId");
          if (!data.title) errors.push("Principle requires title");
          if (!data.description) errors.push("Principle requires description");
          if (!data.application) errors.push("Principle requires application");
        }
        break;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Apply resume update and return new resume object (immutable)
 */
export function applyResumeUpdate(update: ResumeUpdate): Resume {
  // Validate update first
  const validation = validateResumeUpdate(update);
  if (!validation.isValid) {
    throw new Error(`Invalid resume update: ${validation.errors.join(", ")}`);
  }

  // Create deep copy of resume for immutability
  const updatedResume: Resume = {
    personalInfo: { ...resume.personalInfo },
    experience: [...resume.experience],
    skills: {
      languages: [...resume.skills.languages],
      frameworks: [...resume.skills.frameworks],
      databases: [...resume.skills.databases],
      devTools: [...resume.skills.devTools],
      infrastructure: [...resume.skills.infrastructure],
    },
    projects: [...resume.projects],
    principles: [...resume.principles],
  };

  switch (update.section) {
    case "experience":
      if (update.operation === "add") {
        updatedResume.experience = [
          update.data as ExperienceEntry,
          ...updatedResume.experience,
        ];
      } else if (update.operation === "update") {
        const updateData = update.data as Partial<ExperienceEntry>;
        updatedResume.experience = updatedResume.experience.map((exp) =>
          exp.title === update.id ? { ...exp, ...updateData } : exp,
        );
      } else if (update.operation === "delete") {
        updatedResume.experience = updatedResume.experience.filter(
          (exp) => exp.title !== update.id,
        );
      }
      break;

    case "skills":
      if (update.operation === "add") {
        const data = update.data as Record<string, unknown>;
        const category = data.category as SkillCategory;
        const skill = data.skill as Skill;
        updatedResume.skills[category] = [
          ...updatedResume.skills[category],
          skill,
        ];
      } else if (update.operation === "update") {
        const data = update.data as Record<string, unknown>;
        const category = data.category as SkillCategory;
        const updateData = update.data as Partial<Skill>;
        updatedResume.skills[category] = updatedResume.skills[category].map(
          (skill) =>
            skill.name === update.id ? { ...skill, ...updateData } : skill,
        );
      } else if (update.operation === "delete") {
        // Need to find which category the skill is in
        for (const category of Object.keys(
          updatedResume.skills,
        ) as SkillCategory[]) {
          updatedResume.skills[category] = updatedResume.skills[
            category
          ].filter((skill) => skill.name !== update.id);
        }
      }
      break;

    case "projects":
      if (update.operation === "add") {
        updatedResume.projects = [
          ...updatedResume.projects,
          update.data as Project,
        ];
      } else if (update.operation === "update") {
        const updateData = update.data as Partial<Project>;
        updatedResume.projects = updatedResume.projects.map((project) =>
          project.id === update.id ? { ...project, ...updateData } : project,
        );
      } else if (update.operation === "delete") {
        updatedResume.projects = updatedResume.projects.filter(
          (project) => project.id !== update.id,
        );
      }
      break;

    case "principles":
      if (update.operation === "add") {
        updatedResume.principles = [
          ...updatedResume.principles,
          update.data as Principle,
        ];
      } else if (update.operation === "update") {
        const updateData = update.data as Partial<Principle>;
        updatedResume.principles = updatedResume.principles.map((principle) =>
          principle.id === update.id
            ? { ...principle, ...updateData }
            : principle,
        );
      } else if (update.operation === "delete") {
        updatedResume.principles = updatedResume.principles.filter(
          (principle) => principle.id !== update.id,
        );
      }
      break;
  }

  return updatedResume;
}

/**
 * Generate markdown diff preview for resume update
 */
export function previewResumeUpdate(update: ResumeUpdate): string {
  let preview = `## Resume Update Preview\n\n`;
  preview += `**Section:** ${update.section}\n`;
  preview += `**Operation:** ${update.operation}\n\n`;

  if (update.id) {
    preview += `**Target ID:** ${update.id}\n\n`;
  }

  preview += "### Changes:\n\n";

  switch (update.operation) {
    case "add":
      preview += formatAddOperation(update);
      break;
    case "update":
      preview += formatUpdateOperation(update);
      break;
    case "delete":
      preview += formatDeleteOperation(update);
      break;
  }

  return preview;
}

/**
 * Format add operation for preview
 */
function formatAddOperation(update: ResumeUpdate): string {
  let preview = "";
  const data = update.data as Record<string, unknown>;

  switch (update.section) {
    case "experience":
      preview += `+ **${data.title}**\n`;
      preview += `+ ${data.organization} | ${data.period}\n`;
      preview += `+ ${data.description}\n`;
      break;

    case "skills": {
      const skill = data.skill as Record<string, unknown>;
      preview += `+ **${skill.name}** (${skill.proficiency})\n`;
      preview += `+ Category: ${data.category}\n`;
      break;
    }

    case "projects": {
      const technologies = data.technologies as string[];
      preview += `+ **${data.title}**\n`;
      preview += `+ ${data.description}\n`;
      preview += `+ Technologies: ${technologies.join(", ")}\n`;
      break;
    }

    case "principles":
      preview += `+ **${data.title}**\n`;
      preview += `+ ${data.description}\n`;
      break;
  }

  return preview;
}

/**
 * Format update operation for preview
 */
function formatUpdateOperation(update: ResumeUpdate): string {
  let preview = `~ Updating ${update.section}: ${update.id}\n\n`;
  preview += "**Changes:**\n";

  for (const [key, value] of Object.entries(update.data)) {
    preview += `~ ${key}: ${JSON.stringify(value)}\n`;
  }

  return preview;
}

/**
 * Format delete operation for preview
 */
function formatDeleteOperation(update: ResumeUpdate): string {
  return `- Deleting ${update.section}: ${update.id}\n`;
}
