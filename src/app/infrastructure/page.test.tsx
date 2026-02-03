import { describe, expect, it } from "bun:test";
import { render, screen } from "@testing-library/react";
import InfrastructurePage from "./page";

describe("InfrastructurePage - T006: AI Automation Context", () => {
  describe("Page Header AI Context", () => {
    it("should mention AI-assisted infrastructure management in header description", () => {
      render(<InfrastructurePage />);

      const description = screen.getByText(/AI-assisted infrastructure/i);
      expect(description).toBeTruthy();

      // Should mention AI-assisted or AI-powered in infrastructure context
      const pageContent = document.body.textContent;
      expect(pageContent).toMatch(/AI-assisted|AI-powered/i);
    });
  });

  describe("Automated Deployments AI Context", () => {
    it("should frame automated deployments in AI-first context", () => {
      render(<InfrastructurePage />);

      // Check for "Automated Deployments" section
      const automatedSection = screen.getAllByText(/Automated Deployments/i);
      expect(automatedSection.length).toBeGreaterThan(0);

      // Should mention AI or intelligent automation near deployment content
      const pageContent = document.body.textContent;
      expect(pageContent).toMatch(
        /AI-first|intelligent automation|AI-assisted/i,
      );
    });

    it("should maintain technical focus while adding AI perspective", () => {
      render(<InfrastructurePage />);

      // Should still have technical details like Coolify, Git, etc.
      const pageContent = document.body.textContent;
      expect(pageContent).toMatch(/Coolify/i);
      expect(pageContent).toMatch(/Git/i);
      expect(pageContent).toMatch(/zero-downtime/i);
    });
  });

  describe("Infrastructure Services AI Context", () => {
    it("should mention AI integration in Gitea service description", () => {
      render(<InfrastructurePage />);

      // Look for AI-related context near Gitea
      const pageContent = document.body.textContent;

      // Gitea should be present on the page
      expect(pageContent).toMatch(/Gitea/i);

      // Look for AI-assisted workflows in Gitea description
      expect(pageContent).toMatch(/AI-assisted development workflows/i);
    });
  });

  describe("Tech Lead Positioning Consistency", () => {
    it("should maintain consistent Tech Lead positioning with About page", () => {
      render(<InfrastructurePage />);

      const pageContent = document.body.textContent;

      // Should have leadership perspective without overwhelming technical content
      expect(pageContent).toMatch(/AI-assisted|AI-first/i);

      // But should still be primarily technical
      expect(pageContent).toMatch(/PostgreSQL/i);
      expect(pageContent).toMatch(/Redis/i);
      expect(pageContent).toMatch(/Docker/i);
    });
  });

  describe("Original Infrastructure Content Preserved", () => {
    it("should preserve all core services", () => {
      render(<InfrastructurePage />);

      const pageContent = document.body.textContent;
      expect(pageContent).toMatch(/PostgreSQL/i);
      expect(pageContent).toMatch(/Redis/i);
      expect(pageContent).toMatch(/MinIO/i);
      expect(pageContent).toMatch(/Soketi/i);
      expect(pageContent).toMatch(/Gitea/i);
      expect(pageContent).toMatch(/Umami/i);
      expect(pageContent).toMatch(/Bugsink/i);
    });

    it("should preserve infrastructure layers", () => {
      render(<InfrastructurePage />);

      const pageContent = document.body.textContent;
      expect(pageContent).toMatch(/Bare Metal Hosting/i);
      expect(pageContent).toMatch(/Application Platform/i);
    });

    it("should preserve deployed applications", () => {
      render(<InfrastructurePage />);

      const pageContent = document.body.textContent;
      expect(pageContent).toMatch(/Portfolio Site/i);
      expect(pageContent).toMatch(/Blackjack Game/i);
    });
  });
});
