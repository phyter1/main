/**
 * CategoryManager Component Tests
 *
 * Tests for the blog category management interface including:
 * - Category listing with post counts
 * - Create new category form
 * - Inline editing
 * - Delete with confirmation
 * - Category reordering
 * - CRUD operation validation
 */

import { describe, it, expect, beforeEach, afterEach, mock } from "bun:test";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import type { Id } from "@/convex/_generated/dataModel";

// Mock Convex React hooks
const mockUseQuery = mock(() => []);
const mockUseMutation = mock(() => mock(() => Promise.resolve()));

mock.module("convex/react", () => ({
  useQuery: mockUseQuery,
  useMutation: mockUseMutation,
}));

// Now we can import the component
import { CategoryManager } from "./CategoryManager";

describe("CategoryManager", () => {
  // Mock category data
  const mockCategories = [
    {
      _id: "cat1" as Id<"blogCategories">,
      _creationTime: Date.now(),
      name: "Technology",
      slug: "technology",
      description: "Tech articles",
      postCount: 5,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      _id: "cat2" as Id<"blogCategories">,
      _creationTime: Date.now(),
      name: "Design",
      slug: "design",
      description: "Design articles",
      postCount: 3,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      _id: "cat3" as Id<"blogCategories">,
      _creationTime: Date.now(),
      name: "Business",
      slug: "business",
      description: "Business articles",
      postCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  ];

  beforeEach(() => {
    // Reset mocks before each test
    mockUseQuery.mockReturnValue(mockCategories);
    mockUseMutation.mockReturnValue(mock(() => Promise.resolve()));
  });

  afterEach(() => {
    mock.restore();
  });

  describe("Category Listing", () => {
    it("should render all categories with post counts", () => {
      render(<CategoryManager />);

      expect(screen.getByText("Technology")).toBeDefined();
      expect(screen.getByText("Design")).toBeDefined();
      expect(screen.getByText("Business")).toBeDefined();

      // Check post counts are displayed
      expect(screen.getByText("5 posts")).toBeDefined();
      expect(screen.getByText("3 posts")).toBeDefined();
      expect(screen.getByText("0 posts")).toBeDefined();
    });

    it("should display category descriptions", () => {
      render(<CategoryManager />);

      expect(screen.getByText("Tech articles")).toBeDefined();
      expect(screen.getByText("Design articles")).toBeDefined();
      expect(screen.getByText("Business articles")).toBeDefined();
    });

    it("should show loading state when categories are loading", () => {
      mockUseQuery.mockReturnValue(undefined);

      render(<CategoryManager />);

      expect(screen.getByText(/loading/i)).toBeDefined();
    });

    it("should show empty state when no categories exist", () => {
      mockUseQuery.mockReturnValue([]);

      render(<CategoryManager />);

      expect(screen.getByText(/no categories/i)).toBeDefined();
    });
  });

  describe("Create Category", () => {
    it("should render create category form", () => {
      render(<CategoryManager />);

      expect(screen.getByPlaceholderText(/category name/i)).toBeDefined();
      expect(screen.getByPlaceholderText(/description/i)).toBeDefined();
      expect(screen.getByRole("button", { name: /create/i })).toBeDefined();
    });

    it("should create new category on form submit", async () => {
      const mockCreate = mock(() => Promise.resolve("new-cat-id"));
      mockUseMutation.mockReturnValue(mockCreate);

      render(<CategoryManager />);

      const nameInput = screen.getByPlaceholderText(/category name/i);
      const descInput = screen.getByPlaceholderText(/description/i);
      const createButton = screen.getByRole("button", { name: /create/i });

      fireEvent.change(nameInput, { target: { value: "New Category" } });
      fireEvent.change(descInput, {
        target: { value: "New category description" },
      });
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(mockCreate).toHaveBeenCalledWith({
          name: "New Category",
          description: "New category description",
        });
      });
    });

    it("should clear form after successful creation", async () => {
      const mockCreate = mock(() => Promise.resolve("new-cat-id"));
      mockUseMutation.mockReturnValue(mockCreate);

      render(<CategoryManager />);

      const nameInput = screen.getByPlaceholderText(
        /category name/i,
      ) as HTMLInputElement;
      const descInput = screen.getByPlaceholderText(
        /description/i,
      ) as HTMLInputElement;
      const createButton = screen.getByRole("button", { name: /create/i });

      fireEvent.change(nameInput, { target: { value: "Test Category" } });
      fireEvent.change(descInput, { target: { value: "Test description" } });
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(nameInput.value).toBe("");
        expect(descInput.value).toBe("");
      });
    });

    it("should validate required fields before creation", async () => {
      render(<CategoryManager />);

      const createButton = screen.getByRole("button", { name: /create/i });
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(screen.getByText(/name is required/i)).toBeDefined();
      });
    });

    it("should validate description field before creation", async () => {
      render(<CategoryManager />);

      const nameInput = screen.getByPlaceholderText(/category name/i);
      const createButton = screen.getByRole("button", { name: /create/i });

      fireEvent.change(nameInput, { target: { value: "Test" } });
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(screen.getByText(/description is required/i)).toBeDefined();
      });
    });

    it("should show error message on creation failure", async () => {
      const mockCreate = mock(() =>
        Promise.reject(new Error("Duplicate slug")),
      );
      mockUseMutation.mockReturnValue(mockCreate);

      render(<CategoryManager />);

      const nameInput = screen.getByPlaceholderText(/category name/i);
      const descInput = screen.getByPlaceholderText(/description/i);
      const createButton = screen.getByRole("button", { name: /create/i });

      fireEvent.change(nameInput, { target: { value: "Test" } });
      fireEvent.change(descInput, { target: { value: "Test desc" } });
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(screen.getByText(/duplicate slug/i)).toBeDefined();
      });
    });
  });

  describe("Edit Category", () => {
    it("should enter edit mode when edit button clicked", () => {
      render(<CategoryManager />);

      const editButtons = screen.getAllByRole("button", { name: /edit/i });
      fireEvent.click(editButtons[0]);

      expect(screen.getByDisplayValue("Technology")).toBeDefined();
      expect(screen.getByDisplayValue("Tech articles")).toBeDefined();
    });

    it("should save edited category", async () => {
      const mockUpdate = mock(() => Promise.resolve());
      mockUseMutation.mockReturnValue(mockUpdate);

      render(<CategoryManager />);

      const editButtons = screen.getAllByRole("button", { name: /edit/i });
      fireEvent.click(editButtons[0]);

      const nameInput = screen.getByDisplayValue("Technology");
      fireEvent.change(nameInput, { target: { value: "Tech Updated" } });

      const saveButton = screen.getByRole("button", { name: /save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockUpdate).toHaveBeenCalledWith({
          id: "cat1",
          name: "Tech Updated",
          description: "Tech articles",
        });
      });
    });

    it("should cancel edit mode when cancel button clicked", () => {
      render(<CategoryManager />);

      const editButtons = screen.getAllByRole("button", { name: /edit/i });
      fireEvent.click(editButtons[0]);

      const nameInput = screen.getByDisplayValue("Technology");
      fireEvent.change(nameInput, { target: { value: "Changed" } });

      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      fireEvent.click(cancelButton);

      expect(screen.queryByDisplayValue("Changed")).toBeNull();
      expect(screen.getByText("Technology")).toBeDefined();
    });

    it("should validate edited category name", async () => {
      render(<CategoryManager />);

      const editButtons = screen.getAllByRole("button", { name: /edit/i });
      fireEvent.click(editButtons[0]);

      const nameInput = screen.getByDisplayValue("Technology");
      fireEvent.change(nameInput, { target: { value: "" } });

      const saveButton = screen.getByRole("button", { name: /save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/name is required/i)).toBeDefined();
      });
    });

    it("should show error message on update failure", async () => {
      const mockUpdate = mock(() => Promise.reject(new Error("Update failed")));
      mockUseMutation.mockReturnValue(mockUpdate);

      render(<CategoryManager />);

      const editButtons = screen.getAllByRole("button", { name: /edit/i });
      fireEvent.click(editButtons[0]);

      const saveButton = screen.getByRole("button", { name: /save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/update failed/i)).toBeDefined();
      });
    });
  });

  describe("Delete Category", () => {
    it("should show confirmation dialog when delete clicked", () => {
      render(<CategoryManager />);

      const deleteButtons = screen.getAllByRole("button", { name: /delete/i });
      fireEvent.click(deleteButtons[2]); // Click delete on "Business" category

      expect(
        screen.getByText(/are you sure you want to delete/i),
      ).toBeDefined();
      expect(screen.getByText(/business/i)).toBeDefined();
    });

    it("should delete category on confirmation", async () => {
      const mockDelete = mock(() => Promise.resolve());
      mockUseMutation.mockReturnValue(mockDelete);

      render(<CategoryManager />);

      const deleteButtons = screen.getAllByRole("button", { name: /delete/i });
      fireEvent.click(deleteButtons[2]);

      const confirmButton = screen.getByRole("button", { name: /confirm/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockDelete).toHaveBeenCalledWith({
          id: "cat3",
        });
      });
    });

    it("should cancel delete on cancel button", () => {
      render(<CategoryManager />);

      const deleteButtons = screen.getAllByRole("button", { name: /delete/i });
      fireEvent.click(deleteButtons[2]);

      const cancelButton = screen.getByRole("button", {
        name: /cancel|no/i,
      });
      fireEvent.click(cancelButton);

      expect(screen.queryByText(/are you sure you want to delete/i)).toBeNull();
    });

    it("should warn when deleting category with posts", () => {
      render(<CategoryManager />);

      const deleteButtons = screen.getAllByRole("button", { name: /delete/i });
      fireEvent.click(deleteButtons[0]); // Technology has 5 posts

      expect(screen.getByText(/5 posts/i)).toBeDefined();
      expect(screen.getByText(/warning/i)).toBeDefined();
    });

    it("should show error message on delete failure", async () => {
      const mockDelete = mock(() => Promise.reject(new Error("Delete failed")));
      mockUseMutation.mockReturnValue(mockDelete);

      render(<CategoryManager />);

      const deleteButtons = screen.getAllByRole("button", { name: /delete/i });
      fireEvent.click(deleteButtons[2]);

      const confirmButton = screen.getByRole("button", { name: /confirm/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText(/delete failed/i)).toBeDefined();
      });
    });
  });

  describe("Reorder Categories", () => {
    it("should show up/down buttons for reordering", () => {
      render(<CategoryManager />);

      const upButtons = screen.getAllByRole("button", { name: /move up/i });
      const downButtons = screen.getAllByRole("button", {
        name: /move down/i,
      });

      expect(upButtons.length).toBeGreaterThan(0);
      expect(downButtons.length).toBeGreaterThan(0);
    });

    it("should disable move up button for first category", () => {
      render(<CategoryManager />);

      const upButtons = screen.getAllByRole("button", { name: /move up/i });
      expect(upButtons[0]).toHaveProperty("disabled", true);
    });

    it("should disable move down button for last category", () => {
      render(<CategoryManager />);

      const downButtons = screen.getAllByRole("button", {
        name: /move down/i,
      });
      expect(downButtons[downButtons.length - 1]).toHaveProperty(
        "disabled",
        true,
      );
    });

    it("should move category up when up button clicked", () => {
      render(<CategoryManager />);

      const upButtons = screen.getAllByRole("button", { name: /move up/i });
      fireEvent.click(upButtons[1]); // Move "Design" up

      const categoryNames = screen
        .getAllByRole("heading", { level: 3 })
        .map((h) => h.textContent);

      expect(categoryNames[0]).toBe("Design");
      expect(categoryNames[1]).toBe("Technology");
    });

    it("should move category down when down button clicked", () => {
      render(<CategoryManager />);

      const downButtons = screen.getAllByRole("button", {
        name: /move down/i,
      });
      fireEvent.click(downButtons[0]); // Move "Technology" down

      const categoryNames = screen
        .getAllByRole("heading", { level: 3 })
        .map((h) => h.textContent);

      expect(categoryNames[0]).toBe("Design");
      expect(categoryNames[1]).toBe("Technology");
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels", () => {
      render(<CategoryManager />);

      expect(screen.getByLabelText(/category name/i)).toBeDefined();
      expect(screen.getByLabelText(/description/i)).toBeDefined();
    });

    it("should support keyboard navigation", () => {
      render(<CategoryManager />);

      const nameInput = screen.getByPlaceholderText(/category name/i);
      nameInput.focus();

      expect(document.activeElement).toBe(nameInput);
    });

    it("should announce errors to screen readers", async () => {
      render(<CategoryManager />);

      const createButton = screen.getByRole("button", { name: /create/i });
      fireEvent.click(createButton);

      await waitFor(() => {
        const errorMessage = screen.getByText(/name is required/i);
        expect(errorMessage).toHaveAttribute("role", "alert");
      });
    });
  });
});
