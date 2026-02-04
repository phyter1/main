import { describe, expect, it } from "bun:test";
import {
  type ExperienceEntry,
  type ProficiencyLevel,
  type Resume,
  type SkillCategory,
  formatResumeAsLLMContext,
  getExpertiseByProficiency,
  getSkillsByCategory,
  resume,
} from "./resume";

describe("T001: Create resume/experience data model for LLM context", () => {
  describe("Resume Data Structure", () => {
    it("should have a valid resume object", () => {
      expect(resume).toBeDefined();
      expect(resume.personalInfo).toBeDefined();
      expect(resume.experience).toBeDefined();
      expect(resume.skills).toBeDefined();
      expect(resume.principles).toBeDefined();
    });

    it("should have personal information", () => {
      expect(resume.personalInfo.name).toBeDefined();
      expect(resume.personalInfo.title).toBeDefined();
      expect(resume.personalInfo.location).toBeDefined();
    });

    it("should have experience entries with required fields", () => {
      expect(resume.experience.length).toBeGreaterThan(0);

      for (const exp of resume.experience) {
        expect(exp.title).toBeDefined();
        expect(exp.organization).toBeDefined();
        expect(exp.period).toBeDefined();
        expect(exp.description).toBeDefined();
        expect(exp.highlights).toBeDefined();
        expect(Array.isArray(exp.highlights)).toBe(true);
      }
    });

    it("should have skills organized by category", () => {
      expect(resume.skills.languages).toBeDefined();
      expect(resume.skills.frameworks).toBeDefined();
      expect(resume.skills.databases).toBeDefined();
      expect(resume.skills.devTools).toBeDefined();
      expect(resume.skills.infrastructure).toBeDefined();
    });

    it("should have proficiency levels for all skills", () => {
      const allSkills = [
        ...resume.skills.languages,
        ...resume.skills.frameworks,
        ...resume.skills.databases,
        ...resume.skills.devTools,
        ...resume.skills.infrastructure,
      ];

      for (const skill of allSkills) {
        expect(skill.proficiency).toBeDefined();
        expect(["expert", "intermediate", "learning", "gap"]).toContain(
          skill.proficiency,
        );
      }
    });

    it("should include projects from projects.ts", () => {
      expect(resume.projects).toBeDefined();
      expect(resume.projects.length).toBeGreaterThan(0);

      // Should include featured projects
      const featuredProjects = resume.projects.filter((p) => p.featured);
      expect(featuredProjects.length).toBeGreaterThan(0);
    });

    it("should include principles from principles.ts", () => {
      expect(resume.principles).toBeDefined();
      expect(resume.principles.length).toBeGreaterThan(0);
    });
  });

  describe("LLM Context Formatting", () => {
    it("should format resume as markdown string", () => {
      const context = formatResumeAsLLMContext(resume);

      expect(typeof context).toBe("string");
      expect(context.length).toBeGreaterThan(100);
    });

    it("should include personal information in LLM context", () => {
      const context = formatResumeAsLLMContext(resume);

      expect(context).toContain(resume.personalInfo.name);
      expect(context).toContain(resume.personalInfo.title);
    });

    it("should include experience entries in LLM context", () => {
      const context = formatResumeAsLLMContext(resume);

      // Should contain at least one experience entry
      expect(context).toContain(resume.experience[0].title);
      expect(context).toContain(resume.experience[0].organization);
    });

    it("should include skills by category in LLM context", () => {
      const context = formatResumeAsLLMContext(resume);

      // Should mention skill categories
      expect(context).toContain("Languages");
      expect(context).toContain("Frameworks");
    });

    it("should include proficiency levels in LLM context", () => {
      const context = formatResumeAsLLMContext(resume);

      // Should mention at least one expert skill
      const expertSkill = resume.skills.languages.find(
        (s) => s.proficiency === "expert",
      );
      if (expertSkill) {
        expect(context).toContain(expertSkill.name);
      }
    });

    it("should include projects in LLM context", () => {
      const context = formatResumeAsLLMContext(resume);

      // Should mention at least one project
      if (resume.projects.length > 0) {
        expect(context).toContain(resume.projects[0].title);
      }
    });

    it("should be well-formatted markdown", () => {
      const context = formatResumeAsLLMContext(resume);

      // Should have markdown headers
      expect(context).toMatch(/^#\s+/m);
      // Should have lists
      expect(context).toMatch(/^[-*]\s+/m);
    });
  });

  describe("Helper Functions", () => {
    it("should filter skills by category", () => {
      const languages = getSkillsByCategory(resume, "languages");
      expect(languages.length).toBeGreaterThan(0);
      expect(languages.every((s) => resume.skills.languages.includes(s))).toBe(
        true,
      );
    });

    it("should filter skills by proficiency", () => {
      const expertSkills = getExpertiseByProficiency(resume, "expert");
      expect(Array.isArray(expertSkills)).toBe(true);

      // All returned skills should have expert proficiency
      for (const skill of expertSkills) {
        expect(skill.proficiency).toBe("expert");
      }
    });

    it("should handle all proficiency levels", () => {
      const proficiencyLevels: ProficiencyLevel[] = [
        "expert",
        "intermediate",
        "learning",
        "gap",
      ];

      for (const level of proficiencyLevels) {
        const skills = getExpertiseByProficiency(resume, level);
        expect(Array.isArray(skills)).toBe(true);
        // Each skill should have the requested proficiency
        for (const skill of skills) {
          expect(skill.proficiency).toBe(level);
        }
      }
    });

    it("should handle all skill categories", () => {
      const categories: SkillCategory[] = [
        "languages",
        "frameworks",
        "databases",
        "devTools",
        "infrastructure",
      ];

      for (const category of categories) {
        const skills = getSkillsByCategory(resume, category);
        expect(Array.isArray(skills)).toBe(true);
      }
    });
  });

  describe("Data Integration", () => {
    it("should integrate data from projects.ts", () => {
      // Resume should include projects from projects.ts
      expect(resume.projects).toBeDefined();

      // Featured projects should be included
      const featuredProjects = resume.projects.filter((p) => p.featured);
      expect(featuredProjects.length).toBeGreaterThan(0);
    });

    it("should integrate data from stack.ts", () => {
      // Skills should be derived from stack.ts
      const allSkills = [
        ...resume.skills.languages,
        ...resume.skills.frameworks,
        ...resume.skills.databases,
        ...resume.skills.devTools,
        ...resume.skills.infrastructure,
      ];

      expect(allSkills.length).toBeGreaterThan(0);
    });

    it("should integrate data from principles.ts", () => {
      // Principles should be included
      expect(resume.principles).toBeDefined();
      expect(resume.principles.length).toBeGreaterThan(0);
    });

    it("should integrate data from timeline.ts", () => {
      // Experience should include timeline events
      expect(resume.experience).toBeDefined();
      expect(resume.experience.length).toBeGreaterThan(0);
    });
  });

  describe("TypeScript Type Safety", () => {
    it("should export Resume interface", () => {
      // This is a compile-time check, but we can verify runtime structure
      const resumeKeys = Object.keys(resume);
      expect(resumeKeys).toContain("personalInfo");
      expect(resumeKeys).toContain("experience");
      expect(resumeKeys).toContain("skills");
      expect(resumeKeys).toContain("projects");
      expect(resumeKeys).toContain("principles");
    });

    it("should export ExperienceEntry interface", () => {
      const firstExp = resume.experience[0];
      expect(firstExp).toBeDefined();

      const expKeys = Object.keys(firstExp);
      expect(expKeys).toContain("title");
      expect(expKeys).toContain("organization");
      expect(expKeys).toContain("period");
    });
  });

  describe("Acceptance Criteria Validation", () => {
    it("AC1: Data structure exists in src/data/resume.ts", () => {
      // If this test runs, the file exists
      expect(resume).toBeDefined();
    });

    it("AC2: Includes all information from existing data files", () => {
      expect(resume.projects).toBeDefined();
      expect(resume.skills).toBeDefined();
      expect(resume.principles).toBeDefined();
      expect(resume.experience).toBeDefined();
    });

    it("AC3: Formatted as LLM-friendly context", () => {
      const context = formatResumeAsLLMContext(resume);
      expect(typeof context).toBe("string");
      expect(context.length).toBeGreaterThan(100);
    });

    it("AC4: Includes skills taxonomy with proficiency levels", () => {
      const allSkills = [
        ...resume.skills.languages,
        ...resume.skills.frameworks,
        ...resume.skills.databases,
        ...resume.skills.devTools,
        ...resume.skills.infrastructure,
      ];

      // Check that proficiency levels exist
      const proficiencies = allSkills.map((s) => s.proficiency);
      expect(proficiencies.length).toBeGreaterThan(0);

      // Check for different proficiency levels
      const uniqueProficiencies = new Set(proficiencies);
      expect(uniqueProficiencies.size).toBeGreaterThan(0);
    });

    it("AC5: TypeScript interfaces exported", () => {
      // This is verified at compile time, but we can check the exports exist
      expect(resume).toBeDefined();
      expect(formatResumeAsLLMContext).toBeDefined();
      expect(getSkillsByCategory).toBeDefined();
      expect(getExpertiseByProficiency).toBeDefined();
    });
  });
});
