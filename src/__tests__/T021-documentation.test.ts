import { describe, it, expect } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("T021: CLAUDE.md AI Agent Workbench Documentation", () => {
  let claudeContent: string;

  // Read CLAUDE.md once before all tests
  try {
    claudeContent = readFileSync(join(process.cwd(), "CLAUDE.md"), "utf-8");
  } catch (error) {
    console.error("Failed to read CLAUDE.md:", error);
    claudeContent = "";
  }

  describe("Main Section Structure", () => {
    it("should have AI Agent Workbench main section", () => {
      expect(claudeContent).toContain("## AI Agent Workbench");
    });

    it("should have Overview subsection", () => {
      expect(claudeContent).toContain("### Overview");
      expect(claudeContent).toContain(
        "conversational interface for refining and testing AI agent prompts",
      );
      expect(claudeContent).toContain("Meta-Demonstration");
    });

    it("should have Features subsection", () => {
      expect(claudeContent).toContain("### Features");
    });

    it("should have Admin Routes subsection", () => {
      expect(claudeContent).toContain("### Admin Routes");
    });

    it("should have Prompt Versioning System subsection", () => {
      expect(claudeContent).toContain("### Prompt Versioning System");
    });

    it("should have Test Runner Capabilities subsection", () => {
      expect(claudeContent).toContain("### Test Runner Capabilities");
    });

    it("should have Workflows subsection", () => {
      expect(claudeContent).toContain("### Workflows");
    });

    it("should have Security Best Practices subsection", () => {
      expect(claudeContent).toContain("### Security Best Practices");
    });

    it("should have Development Guidelines subsection", () => {
      expect(claudeContent).toContain("### Development Guidelines");
    });
  });

  describe("Features Documentation", () => {
    it("should document Conversational Prompt Refinement", () => {
      expect(claudeContent).toContain("#### Conversational Prompt Refinement");
      expect(claudeContent).toContain("Tone and style adjustments");
      expect(claudeContent).toContain("Capability additions");
    });

    it("should document Side-by-Side Testing", () => {
      expect(claudeContent).toContain("#### Side-by-Side Testing");
      expect(claudeContent).toContain("Parallel execution");
      expect(claudeContent).toContain("Multiple criterion types");
    });

    it("should document Version History with Rollback", () => {
      expect(claudeContent).toContain("#### Version History with Rollback");
      expect(claudeContent).toContain("Semantic version numbering");
      expect(claudeContent).toContain("One-click rollback");
    });

    it("should document Resume Data Updates", () => {
      expect(claudeContent).toContain("#### Resume Data Updates");
      expect(claudeContent).toContain("AI-powered updates to resume content");
    });

    it("should document Test Suite Management", () => {
      expect(claudeContent).toContain("#### Test Suite Management");
      expect(claudeContent).toContain("Criterion Types");
    });
  });

  describe("Admin Routes Documentation", () => {
    it("should document admin pages", () => {
      expect(claudeContent).toContain("#### Pages");
      expect(claudeContent).toContain("/admin/agent-workbench");
      expect(claudeContent).toContain("/admin/agent-workbench/history");
    });

    it("should document all admin API routes", () => {
      expect(claudeContent).toContain("#### API Routes");
      expect(claudeContent).toContain("POST /api/admin/login");
      expect(claudeContent).toContain("POST /api/admin/logout");
      expect(claudeContent).toContain("POST /api/admin/refine-prompt");
      expect(claudeContent).toContain("POST /api/admin/test-prompt");
      expect(claudeContent).toContain("POST /api/admin/deploy-prompt");
      expect(claudeContent).toContain("GET /api/admin/prompt-history");
      expect(claudeContent).toContain("POST /api/admin/update-resume");
    });

    it("should include request/response format examples", () => {
      expect(claudeContent).toContain("// Request");
      expect(claudeContent).toContain("// Response");
      expect(claudeContent).toContain("agentType");
      expect(claudeContent).toContain("refinementRequest");
    });
  });

  describe("Prompt Versioning System Documentation", () => {
    it("should document storage structure", () => {
      expect(claudeContent).toContain("#### Storage Structure");
      expect(claudeContent).toContain(
        ".admin/prompts/{agent-type}/{version-id}.json",
      );
    });

    it("should document version metadata schema", () => {
      expect(claudeContent).toContain("#### Version Metadata Schema");
      expect(claudeContent).toContain("interface PromptVersion");
      expect(claudeContent).toContain("versionId");
      expect(claudeContent).toContain("timestamp");
      expect(claudeContent).toContain("isActive");
    });

    it("should document versioning functions", () => {
      expect(claudeContent).toContain("#### Versioning Functions");
      expect(claudeContent).toContain("savePromptVersion");
      expect(claudeContent).toContain("loadActivePrompt");
      expect(claudeContent).toContain("listVersions");
      expect(claudeContent).toContain("rollbackToVersion");
    });

    it("should document active version policy", () => {
      expect(claudeContent).toContain(
        "Only one version can be active per agent type",
      );
    });
  });

  describe("Test Runner Capabilities Documentation", () => {
    it("should document test case definition", () => {
      expect(claudeContent).toContain("#### Test Case Definition");
      expect(claudeContent).toContain("interface TestCase");
      expect(claudeContent).toContain("interface Criterion");
    });

    it("should document all criterion types", () => {
      expect(claudeContent).toContain("#### Criterion Types");
      expect(claudeContent).toContain("contains");
      expect(claudeContent).toContain("first-person");
      expect(claudeContent).toContain("token-limit");
      expect(claudeContent).toContain("max-length");
      expect(claudeContent).toContain("response-time");
      expect(claudeContent).toContain("sentiment");
    });

    it("should document side-by-side comparison", () => {
      expect(claudeContent).toContain("#### Side-by-Side Comparison");
      expect(claudeContent).toContain("interface ComparisonResults");
      expect(claudeContent).toContain("improvement");
    });

    it("should document metrics calculation", () => {
      expect(claudeContent).toContain("#### Metrics Calculation");
      expect(claudeContent).toContain("interface Metrics");
      expect(claudeContent).toContain("passRate");
      expect(claudeContent).toContain("avgTokens");
      expect(claudeContent).toContain("avgLatency");
    });
  });

  describe("Workflows Documentation", () => {
    it("should document prompt refinement workflow", () => {
      expect(claudeContent).toContain("#### Prompt Refinement Workflow");
      expect(claudeContent).toContain("Navigate to Chat Agent Tab");
      expect(claudeContent).toContain("Describe Desired Changes");
      expect(claudeContent).toContain("Review Generated Diff");
      expect(claudeContent).toContain("Deploy New Version");
    });

    it("should document resume update workflow", () => {
      expect(claudeContent).toContain("#### Resume Update Workflow");
      expect(claudeContent).toContain("Navigate to Resume Data Tab");
      expect(claudeContent).toContain("Describe Addition");
      expect(claudeContent).toContain("Review Preview");
    });

    it("should document testing workflow", () => {
      expect(claudeContent).toContain("#### Testing Workflow");
      expect(claudeContent).toContain("Navigate to Test Suite Tab");
      expect(claudeContent).toContain("Add Test Cases");
      expect(claudeContent).toContain("Run Tests");
    });

    it("should document rollback workflow", () => {
      expect(claudeContent).toContain("#### Rollback Workflow");
      expect(claudeContent).toContain("Navigate to History Page");
      expect(claudeContent).toContain("Select Version");
      expect(claudeContent).toContain("View Diff");
    });
  });

  describe("Security Best Practices Documentation", () => {
    it("should document authentication and session security", () => {
      expect(claudeContent).toContain(
        "#### Authentication and Session Security",
      );
      expect(claudeContent).toContain("Rate Limiting");
      expect(claudeContent).toContain("Session Management");
      expect(claudeContent).toContain("Password Security");
    });

    it("should document audit trail via git commits", () => {
      expect(claudeContent).toContain("#### Audit Trail via Git Commits");
      expect(claudeContent).toContain("feat(workbench):");
      expect(claudeContent).toContain("fix(workbench): rollback");
    });

    it("should document prompt injection prevention", () => {
      expect(claudeContent).toContain("#### Prompt Injection Prevention");
      expect(claudeContent).toContain("Input Validation");
      expect(claudeContent).toContain("Sanitization");
      expect(claudeContent).toContain("Sandboxing");
    });

    it("should document API security", () => {
      expect(claudeContent).toContain("#### API Security");
      expect(claudeContent).toContain("Authentication Required");
      expect(claudeContent).toContain("Rate Limiting by Route");
    });
  });

  describe("Development Guidelines Documentation", () => {
    it("should document project structure", () => {
      expect(claudeContent).toContain("#### Project Structure");
      expect(claudeContent).toContain("components/");
      expect(claudeContent).toContain("└── admin/");
    });

    it("should document component patterns", () => {
      expect(claudeContent).toContain("#### Component Patterns");
      expect(claudeContent).toContain("ChatAgentTab.tsx");
    });

    it("should document testing patterns", () => {
      expect(claudeContent).toContain("#### Testing Patterns");
      expect(claudeContent).toContain("Mocking AI SDK");
    });

    it("should document shadcn/ui component usage", () => {
      expect(claudeContent).toContain("#### shadcn/ui Component Usage");
      expect(claudeContent).toContain("new-york style");
      expect(claudeContent).toContain("@/components/ui/button");
    });

    it("should document API route patterns", () => {
      expect(claudeContent).toContain("#### API Route Patterns");
      expect(claudeContent).toContain("RequestSchema");
      expect(claudeContent).toContain("validateSession");
    });

    it("should document best practices", () => {
      expect(claudeContent).toContain("#### Best Practices");
      expect(claudeContent).toContain("Component Development");
      expect(claudeContent).toContain("API Development");
      expect(claudeContent).toContain("Testing");
      expect(claudeContent).toContain("Security");
      expect(claudeContent).toContain("Git Workflow");
    });
  });

  describe("Code Examples", () => {
    it("should include TypeScript code examples", () => {
      const tsCodeBlocks = claudeContent.match(/```typescript/g);
      expect(tsCodeBlocks).toBeTruthy();
      expect(tsCodeBlocks!.length).toBeGreaterThan(10);
    });

    it("should include bash code examples", () => {
      const bashCodeBlocks = claudeContent.match(/```bash/g);
      expect(bashCodeBlocks).toBeTruthy();
      expect(bashCodeBlocks!.length).toBeGreaterThan(3);
    });

    it("should include interface definitions", () => {
      expect(claudeContent).toContain("interface PromptVersion");
      expect(claudeContent).toContain("interface TestCase");
      expect(claudeContent).toContain("interface Criterion");
      expect(claudeContent).toContain("interface ComparisonResults");
      expect(claudeContent).toContain("interface Metrics");
    });

    it("should include function signatures", () => {
      expect(claudeContent).toContain("async function savePromptVersion");
      expect(claudeContent).toContain("async function loadActivePrompt");
      expect(claudeContent).toContain("async function listVersions");
      expect(claudeContent).toContain("async function rollbackToVersion");
    });
  });
});
