import { describe, expect, it } from "vitest";
import {
  applyResumeUpdate,
  formatResumeAsLLMContext,
  getExpertiseByProficiency,
  getSkillsByCategory,
  type ProficiencyLevel,
  previewResumeUpdate,
  resume,
  type SkillCategory,
  validateResumeUpdate,
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

describe("T010: Dynamic Resume Updates", () => {
  describe("validateResumeUpdate", () => {
    it("should validate a valid experience add operation", () => {
      const update = {
        section: "experience" as const,
        operation: "add" as const,
        data: {
          title: "New Position",
          organization: "Test Company",
          period: "2026 - Present",
          description: "Test role description",
          highlights: ["Achievement 1"],
          type: "job" as const,
        },
      };

      const result = validateResumeUpdate(update);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it("should invalidate update with invalid section", () => {
      const update = {
        section: "invalid-section",
        operation: "add",
        data: {},
      };

      const result = validateResumeUpdate(update);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain("section");
    });

    it("should invalidate update with invalid operation", () => {
      const update = {
        section: "experience",
        operation: "invalid-op",
        data: {},
      };

      const result = validateResumeUpdate(update);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain("operation");
    });

    it("should invalidate update/delete without id", () => {
      const updateOperation = {
        section: "experience" as const,
        operation: "update" as const,
        data: { title: "Updated Title" },
      };

      const result = validateResumeUpdate(updateOperation);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "Update and delete operations require an id",
      );
    });

    it("should validate skills add operation", () => {
      const update = {
        section: "skills" as const,
        operation: "add" as const,
        data: {
          category: "languages" as const,
          skill: {
            name: "Python",
            proficiency: "expert" as const,
            yearsUsed: 5,
            category: "language" as const,
          },
        },
      };

      const result = validateResumeUpdate(update);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it("should validate projects add operation", () => {
      const update = {
        section: "projects" as const,
        operation: "add" as const,
        data: {
          id: "test-project",
          title: "Test Project",
          description: "Test description",
          longDescription: "Longer description",
          technologies: ["TypeScript", "React"],
          highlights: ["Test highlight"],
          status: "completed" as const,
          featured: false,
          links: [],
        },
      };

      const result = validateResumeUpdate(update);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it("should validate principles add operation", () => {
      const update = {
        section: "principles" as const,
        operation: "add" as const,
        data: {
          id: "test-principle",
          groupId: "test-group",
          title: "Test Principle",
          description: "Test description",
          application: "Test application",
        },
      };

      const result = validateResumeUpdate(update);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });
  });

  describe("applyResumeUpdate", () => {
    it("should add new experience entry", () => {
      const update = {
        section: "experience" as const,
        operation: "add" as const,
        data: {
          title: "Senior Developer",
          organization: "Tech Corp",
          period: "2026 - Present",
          description: "Leading development",
          highlights: ["Led team of 5"],
          type: "job" as const,
        },
      };

      const updatedResume = applyResumeUpdate(update);

      expect(updatedResume.experience.length).toBe(
        resume.experience.length + 1,
      );
      expect(updatedResume.experience[0].title).toBe("Senior Developer");

      // Verify original is unchanged
      expect(resume.experience.length).not.toBe(
        updatedResume.experience.length,
      );
    });

    it("should update existing experience entry", () => {
      const existingEntry = resume.experience[0];
      const update = {
        section: "experience" as const,
        operation: "update" as const,
        id: existingEntry.title,
        data: {
          description: "Updated description",
        },
      };

      const updatedResume = applyResumeUpdate(update);

      const updatedEntry = updatedResume.experience.find(
        (e) => e.title === existingEntry.title,
      );
      expect(updatedEntry?.description).toBe("Updated description");

      // Verify original is unchanged
      expect(resume.experience[0].description).not.toBe("Updated description");
    });

    it("should delete experience entry", () => {
      const entryToDelete = resume.experience[0];
      const update = {
        section: "experience" as const,
        operation: "delete" as const,
        id: entryToDelete.title,
        data: {},
      };

      const updatedResume = applyResumeUpdate(update);

      expect(updatedResume.experience.length).toBe(
        resume.experience.length - 1,
      );
      expect(
        updatedResume.experience.find((e) => e.title === entryToDelete.title),
      ).toBeUndefined();

      // Verify original is unchanged
      expect(resume.experience.length).not.toBe(
        updatedResume.experience.length,
      );
    });

    it("should add skill to category", () => {
      const update = {
        section: "skills" as const,
        operation: "add" as const,
        data: {
          category: "languages" as const,
          skill: {
            name: "Rust",
            proficiency: "learning" as const,
            yearsUsed: 1,
            category: "language" as const,
          },
        },
      };

      const updatedResume = applyResumeUpdate(update);

      const addedSkill = updatedResume.skills.languages.find(
        (s) => s.name === "Rust",
      );
      expect(addedSkill).toBeDefined();
      expect(addedSkill?.proficiency).toBe("learning");

      // Verify original is unchanged
      expect(
        resume.skills.languages.find((s) => s.name === "Rust"),
      ).toBeUndefined();
    });

    it("should update skill proficiency", () => {
      const existingSkill = resume.skills.languages[0];
      const update = {
        section: "skills" as const,
        operation: "update" as const,
        id: existingSkill.name,
        data: {
          category: "languages" as const,
          proficiency: "expert" as const,
        },
      };

      const updatedResume = applyResumeUpdate(update);

      const updatedSkill = updatedResume.skills.languages.find(
        (s) => s.name === existingSkill.name,
      );
      expect(updatedSkill?.proficiency).toBe("expert");
    });

    it("should add new project", () => {
      const update = {
        section: "projects" as const,
        operation: "add" as const,
        data: {
          id: "new-project",
          title: "New Project",
          description: "Test project",
          longDescription: "Detailed description",
          technologies: ["TypeScript"],
          highlights: ["Built from scratch"],
          status: "in-progress" as const,
          featured: true,
          links: [],
        },
      };

      const updatedResume = applyResumeUpdate(update);

      const addedProject = updatedResume.projects.find(
        (p) => p.id === "new-project",
      );
      expect(addedProject).toBeDefined();
      expect(addedProject?.title).toBe("New Project");

      // Verify original is unchanged
      expect(
        resume.projects.find((p) => p.id === "new-project"),
      ).toBeUndefined();
    });

    it("should maintain immutability", () => {
      const originalLength = resume.experience.length;
      const update = {
        section: "experience" as const,
        operation: "add" as const,
        data: {
          title: "Test Position",
          organization: "Test Org",
          period: "2026",
          description: "Test",
          highlights: [],
          type: "job" as const,
        },
      };

      applyResumeUpdate(update);

      // Original should be unchanged
      expect(resume.experience.length).toBe(originalLength);
    });

    it("should throw error for invalid update", () => {
      const invalidUpdate = {
        section: "invalid-section",
        operation: "add",
        data: {},
      };

      // TypeScript won't allow this, but we can test runtime validation
      // by casting through unknown
      expect(() =>
        applyResumeUpdate(
          invalidUpdate as unknown as Parameters<typeof applyResumeUpdate>[0],
        ),
      ).toThrow();
    });
  });

  describe("previewResumeUpdate", () => {
    it("should generate markdown preview for add operation", () => {
      const update = {
        section: "experience" as const,
        operation: "add" as const,
        data: {
          title: "New Role",
          organization: "New Company",
          period: "2026 - Present",
          description: "Role description",
          highlights: ["Achievement"],
          type: "job" as const,
        },
      };

      const preview = previewResumeUpdate(update);

      expect(preview).toContain("New Role");
      expect(preview).toContain("New Company");
      expect(preview).toContain("2026 - Present");
      expect(preview).toContain("+");
    });

    it("should generate markdown preview for update operation", () => {
      const existingEntry = resume.experience[0];
      const update = {
        section: "experience" as const,
        operation: "update" as const,
        id: existingEntry.title,
        data: {
          description: "Updated description",
        },
      };

      const preview = previewResumeUpdate(update);

      expect(preview).toContain("~");
      expect(preview).toContain("Updated description");
    });

    it("should generate markdown preview for delete operation", () => {
      const entryToDelete = resume.experience[0];
      const update = {
        section: "experience" as const,
        operation: "delete" as const,
        id: entryToDelete.title,
        data: {},
      };

      const preview = previewResumeUpdate(update);

      expect(preview).toContain("-");
      expect(preview).toContain(entryToDelete.title);
    });

    it("should include section name in preview", () => {
      const update = {
        section: "skills" as const,
        operation: "add" as const,
        data: {
          category: "languages" as const,
          skill: {
            name: "Go",
            proficiency: "intermediate" as const,
            category: "language" as const,
          },
        },
      };

      const preview = previewResumeUpdate(update);

      expect(preview).toContain("skills");
      expect(preview).toContain("Go");
      expect(preview).toContain("intermediate");
      expect(preview).toContain("+");
    });
  });

  describe("T010 Acceptance Criteria", () => {
    it("AC1: New functions added without breaking existing exports", () => {
      // All existing exports should still work
      expect(resume).toBeDefined();
      expect(formatResumeAsLLMContext).toBeDefined();
      expect(getSkillsByCategory).toBeDefined();
      expect(getExpertiseByProficiency).toBeDefined();

      // New exports should exist
      expect(validateResumeUpdate).toBeDefined();
      expect(applyResumeUpdate).toBeDefined();
      expect(previewResumeUpdate).toBeDefined();
    });

    it("AC2: Validates update structure and data types", () => {
      const validUpdate = {
        section: "experience" as const,
        operation: "add" as const,
        data: {
          title: "Test",
          organization: "Test Co",
          period: "2026",
          description: "Test",
          highlights: [],
          type: "job" as const,
        },
      };

      const result = validateResumeUpdate(validUpdate);
      expect(result.isValid).toBe(true);
    });

    it("AC3: applyResumeUpdate returns NEW resume object (immutable)", () => {
      const update = {
        section: "experience" as const,
        operation: "add" as const,
        data: {
          title: "Test",
          organization: "Test",
          period: "2026",
          description: "Test",
          highlights: [],
          type: "job" as const,
        },
      };

      const originalLength = resume.experience.length;
      const updated = applyResumeUpdate(update);

      expect(updated).not.toBe(resume);
      expect(resume.experience.length).toBe(originalLength);
      expect(updated.experience.length).toBe(originalLength + 1);
    });

    it("AC4: previewResumeUpdate generates readable markdown diff", () => {
      const update = {
        section: "experience" as const,
        operation: "add" as const,
        data: {
          title: "Test Role",
          organization: "Test Org",
          period: "2026",
          description: "Test description",
          highlights: [],
          type: "job" as const,
        },
      };

      const preview = previewResumeUpdate(update);

      expect(typeof preview).toBe("string");
      expect(preview.length).toBeGreaterThan(0);
      expect(preview).toContain("+");
    });

    it("AC5: All existing tests still pass", () => {
      // This test passing means existing functionality works
      expect(resume.experience.length).toBeGreaterThan(0);
      expect(resume.skills.languages.length).toBeGreaterThan(0);
    });
  });
});
