"use client";

/**
 * Category Management Page
 * Admin page for managing blog categories with CRUD operations
 */

import { CategoryManager } from "@/components/admin/blog/CategoryManager";

export default function CategoriesPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <CategoryManager />
    </div>
  );
}
