"use client";

/**
 * CategoryManager Component
 *
 * Admin interface for managing blog categories with:
 * - List all categories with post counts
 * - Create new category form
 * - Inline editing
 * - Delete with confirmation
 * - Reorder categories (up/down buttons)
 * - Post count display
 */

import { useMutation, useQuery } from "convex/react";
import { ChevronDown, ChevronUp, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";

interface CategoryFormData {
  name: string;
  description: string;
}

interface EditingCategory extends CategoryFormData {
  id: Id<"blogCategories">;
}

export function CategoryManager() {
  // Generate unique IDs for form elements
  const nameId = useId();
  const descId = useId();

  // Fetch categories from Convex
  const categories = useQuery(api.blog.getCategories);

  // Mutations
  const createCategory = useMutation(api.blog.createCategory);
  const updateCategory = useMutation(api.blog.updateCategory);
  const deleteCategory = useMutation(api.blog.deleteCategory);

  // Form state
  const [newCategory, setNewCategory] = useState<CategoryFormData>({
    name: "",
    description: "",
  });

  // Edit state
  const [editingCategory, setEditingCategory] =
    useState<EditingCategory | null>(null);

  // Delete confirmation state
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    id: Id<"blogCategories">;
    name: string;
    postCount: number;
  } | null>(null);

  // Reorder state (local only, not persisted to backend)
  const [orderedCategories, setOrderedCategories] = useState<
    typeof categories | undefined
  >(undefined);

  // Error state
  const [error, setError] = useState<string | null>(null);

  // Validation state
  const [validationError, setValidationError] = useState<string | null>(null);

  // Update ordered categories when categories change
  useEffect(() => {
    if (categories && !orderedCategories) {
      setOrderedCategories(categories);
    }
  }, [categories, orderedCategories]);

  // Use ordered categories if available, otherwise use fetched categories
  const displayCategories = orderedCategories || categories;

  // Handle create category
  const handleCreate = async () => {
    setValidationError(null);
    setError(null);

    // Validate required fields
    if (!newCategory.name.trim()) {
      setValidationError("Name is required");
      return;
    }

    if (!newCategory.description.trim()) {
      setValidationError("Description is required");
      return;
    }

    try {
      await createCategory({
        name: newCategory.name.trim(),
        description: newCategory.description.trim(),
      });

      // Clear form on success
      setNewCategory({ name: "", description: "" });
      setValidationError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create category",
      );
    }
  };

  // Handle edit category
  const handleEdit = (
    id: Id<"blogCategories">,
    name: string,
    description: string,
  ) => {
    setEditingCategory({ id, name, description });
    setValidationError(null);
    setError(null);
  };

  // Handle save edited category
  const handleSave = async () => {
    if (!editingCategory) return;

    setValidationError(null);
    setError(null);

    // Validate required fields
    if (!editingCategory.name.trim()) {
      setValidationError("Name is required");
      return;
    }

    if (!editingCategory.description.trim()) {
      setValidationError("Description is required");
      return;
    }

    try {
      await updateCategory({
        id: editingCategory.id,
        name: editingCategory.name.trim(),
        description: editingCategory.description.trim(),
      });

      setEditingCategory(null);
      setValidationError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update category",
      );
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingCategory(null);
    setValidationError(null);
    setError(null);
  };

  // Handle delete category
  const handleDelete = (
    id: Id<"blogCategories">,
    name: string,
    postCount: number,
  ) => {
    setDeleteConfirmation({ id, name, postCount });
    setError(null);
  };

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    if (!deleteConfirmation) return;

    try {
      await deleteCategory({ id: deleteConfirmation.id });
      setDeleteConfirmation(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete category",
      );
      setDeleteConfirmation(null);
    }
  };

  // Handle cancel delete
  const handleCancelDelete = () => {
    setDeleteConfirmation(null);
  };

  // Handle move category up
  const handleMoveUp = (index: number) => {
    if (!displayCategories || index === 0) return;

    const newOrder = [...displayCategories];
    [newOrder[index - 1], newOrder[index]] = [
      newOrder[index],
      newOrder[index - 1],
    ];
    setOrderedCategories(newOrder);
  };

  // Handle move category down
  const handleMoveDown = (index: number) => {
    if (!displayCategories || index === displayCategories.length - 1) return;

    const newOrder = [...displayCategories];
    [newOrder[index], newOrder[index + 1]] = [
      newOrder[index + 1],
      newOrder[index],
    ];
    setOrderedCategories(newOrder);
  };

  // Loading state
  if (categories === undefined) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Loading categories...
          </p>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (categories.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Category Management</CardTitle>
            <CardDescription>Create and manage blog categories</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground py-8">
              No categories yet. Create your first category below.
            </p>
          </CardContent>
        </Card>

        {/* Create Category Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="size-5" />
              Create Category
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive" role="alert">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {validationError && (
              <Alert variant="destructive" role="alert">
                <AlertDescription>{validationError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor={nameId}>Category Name</Label>
              <Input
                id={nameId}
                placeholder="Enter category name"
                value={newCategory.name}
                onChange={(e) =>
                  setNewCategory({ ...newCategory, name: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={descId}>Description</Label>
              <Textarea
                id={descId}
                placeholder="Enter category description"
                value={newCategory.description}
                onChange={(e) =>
                  setNewCategory({
                    ...newCategory,
                    description: e.target.value,
                  })
                }
                rows={3}
              />
            </div>

            <Button onClick={handleCreate} className="w-full">
              <Plus className="mr-2 size-4" />
              Create Category
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Category List */}
      <Card>
        <CardHeader>
          <CardTitle>Category Management</CardTitle>
          <CardDescription>
            Manage your blog categories and their organization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive" role="alert">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            {displayCategories.map((category, index) => {
              const isEditing = editingCategory?.id === category._id;

              return (
                <Card key={category._id}>
                  <CardContent className="pt-6">
                    {isEditing ? (
                      // Edit mode
                      <div className="space-y-4">
                        {validationError && (
                          <Alert variant="destructive" role="alert">
                            <AlertDescription>
                              {validationError}
                            </AlertDescription>
                          </Alert>
                        )}

                        <div className="space-y-2">
                          <Label htmlFor={`edit-name-${category._id}`}>
                            Category Name
                          </Label>
                          <Input
                            id={`edit-name-${category._id}`}
                            value={editingCategory.name}
                            onChange={(e) =>
                              setEditingCategory({
                                ...editingCategory,
                                name: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`edit-desc-${category._id}`}>
                            Description
                          </Label>
                          <Textarea
                            id={`edit-desc-${category._id}`}
                            value={editingCategory.description}
                            onChange={(e) =>
                              setEditingCategory({
                                ...editingCategory,
                                description: e.target.value,
                              })
                            }
                            rows={2}
                          />
                        </div>

                        <div className="flex gap-2">
                          <Button onClick={handleSave} size="sm">
                            Save
                          </Button>
                          <Button
                            onClick={handleCancelEdit}
                            size="sm"
                            variant="outline"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // Display mode
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{category.name}</h3>
                            <span className="text-sm text-muted-foreground">
                              {category.postCount}{" "}
                              {category.postCount === 1 ? "post" : "posts"}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {category.description}
                          </p>
                        </div>

                        <div className="flex items-center gap-1">
                          {/* Reorder buttons */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMoveUp(index)}
                            disabled={index === 0}
                            aria-label="Move up"
                          >
                            <ChevronUp className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMoveDown(index)}
                            disabled={index === displayCategories.length - 1}
                            aria-label="Move down"
                          >
                            <ChevronDown className="size-4" />
                          </Button>

                          {/* Edit button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleEdit(
                                category._id,
                                category.name,
                                category.description,
                              )
                            }
                            aria-label="Edit"
                          >
                            <Pencil className="size-4" />
                          </Button>

                          {/* Delete button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleDelete(
                                category._id,
                                category.name,
                                category.postCount,
                              )
                            }
                            aria-label="Delete"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Create Category Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="size-5" />
            Create Category
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={nameId}>Category Name</Label>
            <Input
              id={nameId}
              placeholder="Enter category name"
              value={newCategory.name}
              onChange={(e) =>
                setNewCategory({ ...newCategory, name: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={descId}>Description</Label>
            <Textarea
              id={descId}
              placeholder="Enter category description"
              value={newCategory.description}
              onChange={(e) =>
                setNewCategory({ ...newCategory, description: e.target.value })
              }
              rows={3}
            />
          </div>

          <Button onClick={handleCreate} className="w-full">
            <Plus className="mr-2 size-4" />
            Create Category
          </Button>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteConfirmation !== null}
        onOpenChange={(open) => !open && handleCancelDelete()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteConfirmation && (
                <>
                  You are about to delete the category "
                  <strong>{deleteConfirmation.name}</strong>".
                  {deleteConfirmation.postCount > 0 && (
                    <span className="block mt-2 text-destructive font-semibold">
                      Warning: This category has {deleteConfirmation.postCount}{" "}
                      {deleteConfirmation.postCount === 1 ? "post" : "posts"}.
                    </span>
                  )}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
