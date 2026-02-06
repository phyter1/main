import { describe, expect, it } from "bun:test";
import { render } from "@testing-library/react";
import { Button } from "./button";

describe("Button Component", () => {
  describe("Variant: vibrant", () => {
    it("should render vibrant variant with correct classes", () => {
      const { container } = render(<Button variant="vibrant">Click Me</Button>);

      const button = container.querySelector("button");
      expect(button).toBeDefined();
      expect(button?.getAttribute("data-variant")).toBe("vibrant");
      expect(button?.className).toContain("bg-primary-vibrant");
      expect(button?.className).toContain("text-primary-vibrant-foreground");
    });

    it("should have hover effect with shadow and opacity change", () => {
      const { container } = render(<Button variant="vibrant">Hover Me</Button>);

      const button = container.querySelector("button");
      expect(button?.className).toContain("hover:bg-primary-vibrant/90");
      expect(button?.className).toContain("hover:shadow-lg");
    });

    it("should have transition animation classes", () => {
      const { container } = render(<Button variant="vibrant">Animate</Button>);

      const button = container.querySelector("button");
      expect(button?.className).toContain("transition-all");
      expect(button?.className).toContain("duration-200");
    });

    it("should render children content correctly", () => {
      const { container } = render(
        <Button variant="vibrant">View My Work</Button>,
      );

      const button = container.querySelector("button");
      expect(button?.textContent).toBe("View My Work");
    });

    it("should work with different sizes", () => {
      const { container: defaultContainer } = render(
        <Button variant="vibrant" size="default">
          Default
        </Button>,
      );
      const { container: lgContainer } = render(
        <Button variant="vibrant" size="lg">
          Large
        </Button>,
      );
      const { container: smContainer } = render(
        <Button variant="vibrant" size="sm">
          Small
        </Button>,
      );

      const defaultButton = defaultContainer.querySelector("button");
      const lgButton = lgContainer.querySelector("button");
      const smButton = smContainer.querySelector("button");

      expect(defaultButton?.className).toContain("h-9");
      expect(lgButton?.className).toContain("h-10");
      expect(smButton?.className).toContain("h-8");
    });
  });

  describe("Variant: default", () => {
    it("should render default variant with primary colors", () => {
      const { container } = render(<Button>Default Button</Button>);

      const button = container.querySelector("button");
      expect(button?.className).toContain("bg-primary");
      expect(button?.className).toContain("text-primary-foreground");
    });
  });

  describe("Variant: destructive", () => {
    it("should render destructive variant with destructive colors", () => {
      const { container } = render(
        <Button variant="destructive">Delete</Button>,
      );

      const button = container.querySelector("button");
      expect(button?.className).toContain("bg-destructive");
    });
  });

  describe("Variant: outline", () => {
    it("should render outline variant with border", () => {
      const { container } = render(<Button variant="outline">Outline</Button>);

      const button = container.querySelector("button");
      expect(button?.className).toContain("border");
      expect(button?.className).toContain("bg-background");
    });
  });

  describe("Variant: secondary", () => {
    it("should render secondary variant with secondary colors", () => {
      const { container } = render(
        <Button variant="secondary">Secondary</Button>,
      );

      const button = container.querySelector("button");
      expect(button?.className).toContain("bg-secondary");
      expect(button?.className).toContain("text-secondary-foreground");
    });
  });

  describe("Variant: ghost", () => {
    it("should render ghost variant with transparent background", () => {
      const { container } = render(<Button variant="ghost">Ghost</Button>);

      const button = container.querySelector("button");
      expect(button?.className).toContain("hover:bg-accent");
    });
  });

  describe("Variant: link", () => {
    it("should render link variant with underline", () => {
      const { container } = render(<Button variant="link">Link</Button>);

      const button = container.querySelector("button");
      expect(button?.className).toContain("text-primary");
      expect(button?.className).toContain("underline-offset-4");
    });
  });

  describe("asChild prop", () => {
    it("should render as child element when asChild is true", () => {
      const { container } = render(
        <Button variant="vibrant" asChild>
          <a href="/projects">View Projects</a>
        </Button>,
      );

      const link = container.querySelector("a");
      expect(link).toBeDefined();
      expect(link?.href).toContain("/projects");
      expect(link?.className).toContain("bg-primary-vibrant");
    });
  });

  describe("disabled state", () => {
    it("should have disabled styles when disabled", () => {
      const { container } = render(
        <Button variant="vibrant" disabled>
          Disabled
        </Button>,
      );

      const button = container.querySelector("button");
      expect(button?.disabled).toBe(true);
      expect(button?.className).toContain("disabled:pointer-events-none");
      expect(button?.className).toContain("disabled:opacity-50");
    });
  });

  describe("Light and Dark mode compatibility", () => {
    it("should render without errors in light mode (default)", () => {
      const { container } = render(
        <Button variant="vibrant">Light Mode</Button>,
      );

      const button = container.querySelector("button");
      expect(button).toBeDefined();
      expect(button?.className).toContain("bg-primary-vibrant");
    });

    it("should have dark mode compatible classes", () => {
      const { container } = render(
        <div className="dark">
          <Button variant="vibrant">Dark Mode</Button>
        </div>,
      );

      const button = container.querySelector("button");
      expect(button).toBeDefined();
      // Dark mode uses same primary-vibrant color (which has different values in dark mode CSS)
      expect(button?.className).toContain("bg-primary-vibrant");
    });
  });

  describe("Data attributes", () => {
    it("should have correct data-variant attribute", () => {
      const { container } = render(<Button variant="vibrant">Test</Button>);

      const button = container.querySelector("button");
      expect(button?.getAttribute("data-variant")).toBe("vibrant");
    });

    it("should have correct data-size attribute", () => {
      const { container } = render(<Button size="lg">Test</Button>);

      const button = container.querySelector("button");
      expect(button?.getAttribute("data-size")).toBe("lg");
    });

    it("should have data-slot attribute", () => {
      const { container } = render(<Button>Test</Button>);

      const button = container.querySelector("button");
      expect(button?.getAttribute("data-slot")).toBe("button");
    });
  });
});
