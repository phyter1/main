import { describe, expect, it, mock } from "bun:test";
import { render, screen } from "@testing-library/react";
import { stackItems } from "@/data/stack";
import StackPage from "./page";

// Mock framer-motion to avoid animation issues in tests
mock.module("framer-motion", () => ({
  motion: {
    // biome-ignore lint/suspicious/noExplicitAny: Test mock requires flexible typing
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

// Mock useReducedMotion hook
mock.module("@/hooks/useReducedMotion", () => ({
  useReducedMotion: () => false,
}));

describe("T005: Add AI Development Tools to Stack Page", () => {
  describe("AI Development Tools in Data", () => {
    it("should include Claude Code in stack data", () => {
      const claudeCode = stackItems.find((item) => item.id === "claude-code");
      expect(claudeCode).toBeDefined();
      expect(claudeCode?.label).toBe("Claude Code");
      expect(claudeCode?.category).toBe("devtool");
    });

    it("should include GitHub Copilot in stack data", () => {
      const copilot = stackItems.find((item) => item.id === "github-copilot");
      expect(copilot).toBeDefined();
      expect(copilot?.label).toBe("GitHub Copilot");
      expect(copilot?.category).toBe("devtool");
    });

    it("should include ChatGPT in stack data", () => {
      const chatgpt = stackItems.find((item) => item.id === "chatgpt");
      expect(chatgpt).toBeDefined();
      expect(chatgpt?.label).toBe("ChatGPT");
      expect(chatgpt?.category).toBe("devtool");
    });

    it("should categorize AI tools as Dev Tools", () => {
      const aiTools = stackItems.filter(
        (item) =>
          item.id === "claude-code" ||
          item.id === "github-copilot" ||
          item.id === "chatgpt",
      );

      for (const tool of aiTools) {
        expect(tool.category).toBe("devtool");
      }
    });

    it("should have proficiency levels for all AI tools", () => {
      const aiTools = stackItems.filter(
        (item) =>
          item.id === "claude-code" ||
          item.id === "github-copilot" ||
          item.id === "chatgpt",
      );

      for (const tool of aiTools) {
        expect(tool.proficiency).toBeDefined();
        expect(["expert", "proficient", "familiar"]).toContain(
          tool.proficiency,
        );
      }
    });

    it("should have context for all AI tools", () => {
      const aiTools = stackItems.filter(
        (item) =>
          item.id === "claude-code" ||
          item.id === "github-copilot" ||
          item.id === "chatgpt",
      );

      for (const tool of aiTools) {
        expect(tool.context).toBeDefined();
        expect(["professional", "personal", "both"]).toContain(tool.context);
      }
    });

    it("should have descriptions for all AI tools", () => {
      const aiTools = stackItems.filter(
        (item) =>
          item.id === "claude-code" ||
          item.id === "github-copilot" ||
          item.id === "chatgpt",
      );

      for (const tool of aiTools) {
        expect(tool.description).toBeDefined();
        expect(tool.description.length).toBeGreaterThan(10);
      }
    });
  });

  describe("Page Header AI-First Messaging", () => {
    it("should render the Stack page", () => {
      render(<StackPage />);
      expect(screen.getByText("Tech Stack")).toBeDefined();
    });

    it("should mention AI-first development in page description", () => {
      render(<StackPage />);

      // Look for AI-first or AI-assisted or similar terminology in the description
      const descriptions = screen.getAllByText(
        /AI-first|AI-assisted|AI development/i,
      );
      expect(descriptions.length).toBeGreaterThan(0);
      expect(descriptions[0]).toBeDefined();
    });

    it("should maintain professional tone in header", () => {
      render(<StackPage />);

      // Verify header text exists and is properly formatted
      const headers = screen.getAllByText("Tech Stack");
      expect(headers.length).toBeGreaterThan(0);
      expect(headers[0]).toBeDefined();
      expect(headers[0].tagName).toBe("H1");
    });
  });

  describe("Acceptance Criteria", () => {
    it("Stack page includes AI development tools", () => {
      const aiToolIds = ["claude-code", "github-copilot", "chatgpt"];
      const foundTools = stackItems.filter((item) =>
        aiToolIds.includes(item.id),
      );

      expect(foundTools.length).toBeGreaterThanOrEqual(3);
    });

    it("AI tools are categorized appropriately as Dev Tools", () => {
      const claudeCode = stackItems.find((item) => item.id === "claude-code");
      const copilot = stackItems.find((item) => item.id === "github-copilot");
      const chatgpt = stackItems.find((item) => item.id === "chatgpt");

      expect(claudeCode?.category).toBe("devtool");
      expect(copilot?.category).toBe("devtool");
      expect(chatgpt?.category).toBe("devtool");
    });

    it("Each AI tool has proficiency level and context", () => {
      const aiToolIds = ["claude-code", "github-copilot", "chatgpt"];
      const aiTools = stackItems.filter((item) => aiToolIds.includes(item.id));

      for (const tool of aiTools) {
        expect(tool.proficiency).toBeDefined();
        expect(tool.context).toBeDefined();
        expect(tool.description).toBeDefined();
      }
    });

    it("Page description mentions AI-first development approach", () => {
      render(<StackPage />);

      // This should find text mentioning AI-first or similar in the page
      const aiFirstMentions = screen.getAllByText(
        /AI-first|AI-assisted|AI.*development/i,
      );
      expect(aiFirstMentions.length).toBeGreaterThan(0);
      expect(aiFirstMentions[0]).toBeDefined();
    });
  });
});
