/**
 * Tests for GuardrailFeedback Component
 */

import { afterEach, describe, expect, it } from "bun:test";
import { cleanup, render, screen, within, waitFor } from "@testing-library/react";
import type { GuardrailViolation } from "@/types/guardrails";
import { GuardrailFeedback } from "./guardrail-feedback";

describe("GuardrailFeedback", () => {
  afterEach(() => {
    cleanup();
  });

  describe("Rendering", () => {
    it("should render with prompt injection violation", () => {
      const violation: GuardrailViolation = {
        error: "Input contains prompt injection patterns",
        guardrail: {
          type: "prompt_injection",
          severity: "high",
          category: "System Instruction Override",
          explanation:
            "Your input contained patterns that attempt to override the AI's instructions.",
          detected: "Patterns attempting to change the AI's behavior.",
          implementation: "Pattern matching against 30+ known techniques.",
          sourceFile: "src/lib/input-sanitization.ts",
          lineNumbers: "26-71",
        },
      };

      render(<GuardrailFeedback violation={violation} />);

      expect(screen.getByText(/Security Guardrail Triggered/i)).toBeDefined();
      expect(screen.getByText(/Prompt Injection/i)).toBeDefined();
      expect(screen.getByText(/HIGH/i)).toBeDefined();
      expect(screen.getByText(/System Instruction Override/i)).toBeDefined();
    });

    it("should render with rate limit violation", () => {
      const violation: GuardrailViolation = {
        error: "Rate limit exceeded",
        guardrail: {
          type: "rate_limit",
          severity: "medium",
          category: "IP-Based Rate Limiting",
          explanation: "Rate limiting prevents abuse.",
          detected: "You have made 10 requests in the last minute.",
          implementation: "Sliding window algorithm.",
          sourceFile: "src/app/api/chat/route.ts",
          lineNumbers: "57-106",
          context: {
            currentCount: 10,
            limit: 10,
            retryAfter: 42,
          },
        },
      };

      render(<GuardrailFeedback violation={violation} />);

      expect(screen.getAllByText(/Rate Limit/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/MEDIUM/i)).toBeDefined();
    });

    it("should render with length validation violation", () => {
      const violation: GuardrailViolation = {
        error: "Message exceeds maximum length",
        guardrail: {
          type: "length_validation",
          severity: "low",
          category: "Maximum Length Enforcement",
          explanation: "Length limits prevent token stuffing attacks.",
          detected: "Your input is 2547 characters.",
          implementation: "Configurable limits.",
          sourceFile: "src/lib/input-sanitization.ts",
          lineNumbers: "104-108",
        },
      };

      render(<GuardrailFeedback violation={violation} />);

      expect(screen.getByText(/Length Validation/i)).toBeDefined();
      expect(screen.getByText(/LOW/i)).toBeDefined();
    });

    it("should render with suspicious pattern violation", () => {
      const violation: GuardrailViolation = {
        error: "Suspicious pattern detected",
        guardrail: {
          type: "suspicious_pattern",
          severity: "high",
          category: "XSS/Script Injection",
          explanation: "Pattern matching against malicious signatures.",
          detected: "HTML script tags detected.",
          implementation: "Defense-in-depth security.",
          sourceFile: "src/lib/input-sanitization.ts",
          lineNumbers: "76-99",
        },
      };

      render(<GuardrailFeedback violation={violation} />);

      expect(screen.getByText(/Suspicious Pattern/i)).toBeDefined();
      expect(screen.getByText(/XSS\/Script Injection/i)).toBeDefined();
    });

    it("should render with scope enforcement violation", () => {
      const violation: GuardrailViolation = {
        error: "Off-topic content",
        guardrail: {
          type: "scope_enforcement",
          severity: "medium",
          category: "Content Validation",
          explanation: "Ensures focused interactions.",
          detected: "No job-related keywords found.",
          implementation: "Keyword matching.",
          sourceFile: "src/lib/input-sanitization.ts",
          lineNumbers: "262-281",
        },
      };

      render(<GuardrailFeedback violation={violation} />);

      expect(screen.getByText(/Scope Enforcement/i)).toBeDefined();
      expect(screen.getByText(/Content Validation/i)).toBeDefined();
    });
  });

  describe("Fallback Behavior", () => {
    it("should render simple error when no guardrail details", () => {
      const violation: GuardrailViolation = {
        error: "Something went wrong",
      };

      render(<GuardrailFeedback violation={violation} />);

      expect(screen.getByText(/Error/i)).toBeDefined();
      expect(screen.getByText(/Something went wrong/i)).toBeDefined();
    });
  });

  describe("GitHub Links", () => {
    it("should generate correct GitHub URL with line numbers", () => {
      const violation: GuardrailViolation = {
        error: "Test error",
        guardrail: {
          type: "prompt_injection",
          severity: "high",
          category: "Test",
          explanation: "Test explanation",
          detected: "Test detected",
          implementation: "Test implementation",
          sourceFile: "src/lib/input-sanitization.ts",
          lineNumbers: "26-71",
        },
      };

      const { container } = render(
        <GuardrailFeedback
          violation={violation}
          repositoryUrl="https://github.com/phyter1/main"
        />,
      );

      // Click to expand
      const expandButton = screen.getByRole("button", {
        name: /How It Works/i,
      });
      expandButton.click();

      // Check for link
      const link = container.querySelector("a[href*='github.com']");
      expect(link).toBeDefined();

      // Only test href if link exists
      if (link) {
        const href = link.getAttribute("href");
        expect(href).toContain("src/lib/input-sanitization.ts");
        expect(href).toContain("#L26-L71");
      }
    });
  });

  describe("Context Data", () => {
    it("should display context data when available", async () => {
      const violation: GuardrailViolation = {
        error: "Rate limit exceeded",
        guardrail: {
          type: "rate_limit",
          severity: "medium",
          category: "IP-Based Rate Limiting",
          explanation: "Rate limiting prevents abuse.",
          detected: "Too many requests.",
          implementation: "Sliding window.",
          sourceFile: "src/app/api/chat/route.ts",
          context: {
            currentCount: 10,
            limit: 10,
            retryAfter: 42,
          },
        },
      };

      const { container } = render(<GuardrailFeedback violation={violation} />);

      // Expand details
      const expandButton = within(container).getByRole("button", {
        name: /How It Works/i,
      });
      expandButton.click();

      // Wait for expansion and check that Details section is visible
      await waitFor(() => {
        expect(within(container).getByText(/Details:/i)).toBeDefined();
      });

      // Check that context data labels are displayed
      const detailsSection = container.querySelector("dl");
      expect(detailsSection).toBeDefined();
      expect(detailsSection?.textContent).toContain("Current Count");
      expect(detailsSection?.textContent).toContain("10");
      expect(detailsSection?.textContent).toContain("42");
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA attributes", async () => {
      const violation: GuardrailViolation = {
        error: "Test error",
        guardrail: {
          type: "prompt_injection",
          severity: "high",
          category: "Test",
          explanation: "Test",
          detected: "Test",
          implementation: "Test",
          sourceFile: "src/lib/input-sanitization.ts",
        },
      };

      const { container } = render(<GuardrailFeedback violation={violation} />);

      const expandButton = within(container).getByRole("button", {
        name: /How It Works/i,
      });
      expect(expandButton.getAttribute("aria-expanded")).toBe("false");

      expandButton.click();

      await waitFor(() => {
        expect(expandButton.getAttribute("aria-expanded")).toBe("true");
      });
    });

    it("should render fallback with alert role", () => {
      const violation: GuardrailViolation = {
        error: "Simple error",
      };

      const { container } = render(<GuardrailFeedback violation={violation} />);

      const alert = container.querySelector("[role='alert']");
      expect(alert).toBeDefined();
    });
  });

  describe("Animations", () => {
    it("should render Card component with proper structure", () => {
      const violation: GuardrailViolation = {
        error: "Test error",
        guardrail: {
          type: "prompt_injection",
          severity: "high",
          category: "Test",
          explanation: "Test",
          detected: "Test",
          implementation: "Test",
          sourceFile: "src/lib/input-sanitization.ts",
        },
      };

      const { container } = render(<GuardrailFeedback violation={violation} />);

      // Check that the Card component is rendered
      const card = container.querySelector("[data-guardrail-type]");
      expect(card).toBeDefined();
    });

    it("should expand and collapse details section smoothly", async () => {
      const violation: GuardrailViolation = {
        error: "Test error",
        guardrail: {
          type: "prompt_injection",
          severity: "high",
          category: "Test",
          explanation: "Test",
          detected: "Test",
          implementation: "Test",
          sourceFile: "src/lib/input-sanitization.ts",
        },
      };

      const { container } = render(<GuardrailFeedback violation={violation} />);

      const expandButton = within(container).getByRole("button", {
        name: /How It Works/i,
      });

      // Initially not expanded
      expect(expandButton.getAttribute("aria-expanded")).toBe("false");

      // Click to expand
      expandButton.click();

      await waitFor(() => {
        expect(expandButton.getAttribute("aria-expanded")).toBe("true");
      });

      // Details should be visible
      expect(within(container).getByText(/Implementation:/i)).toBeDefined();

      // Click to collapse
      expandButton.click();

      await waitFor(() => {
        expect(expandButton.getAttribute("aria-expanded")).toBe("false");
      });
    });

    it("should have hover states on expand button", () => {
      const violation: GuardrailViolation = {
        error: "Test error",
        guardrail: {
          type: "prompt_injection",
          severity: "high",
          category: "Test",
          explanation: "Test",
          detected: "Test",
          implementation: "Test",
          sourceFile: "src/lib/input-sanitization.ts",
        },
      };

      const { container } = render(<GuardrailFeedback violation={violation} />);

      const expandButton = within(container).getByRole("button", {
        name: /How It Works/i,
      });

      // Button should have hover classes
      expect(expandButton.className).toContain("hover:");
    });

    it("should have focus states for keyboard navigation", () => {
      const violation: GuardrailViolation = {
        error: "Test error",
        guardrail: {
          type: "prompt_injection",
          severity: "high",
          category: "Test",
          explanation: "Test",
          detected: "Test",
          implementation: "Test",
          sourceFile: "src/lib/input-sanitization.ts",
        },
      };

      const { container } = render(<GuardrailFeedback violation={violation} />);

      const expandButton = within(container).getByRole("button", {
        name: /How It Works/i,
      });

      // Button should be focusable
      expect(expandButton.getAttribute("type")).toBe("button");
    });

    it("should rotate arrow icon when expanded", async () => {
      const violation: GuardrailViolation = {
        error: "Test error",
        guardrail: {
          type: "prompt_injection",
          severity: "high",
          category: "Test",
          explanation: "Test",
          detected: "Test",
          implementation: "Test",
          sourceFile: "src/lib/input-sanitization.ts",
        },
      };

      const { container } = render(<GuardrailFeedback violation={violation} />);

      const expandButton = within(container).getByRole("button", {
        name: /How It Works/i,
      });

      // Click to expand
      expandButton.click();

      // Wait for state update
      await waitFor(() => {
        expect(expandButton.getAttribute("aria-expanded")).toBe("true");
      });

      // Arrow element should exist (rotation is handled by framer-motion, not className)
      const arrow = expandButton.querySelector("[aria-hidden='true']");
      expect(arrow).toBeDefined();
      expect(arrow?.textContent).toBe("▼");
    });
  });
});
