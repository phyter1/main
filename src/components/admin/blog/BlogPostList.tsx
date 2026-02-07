"use client";

/**
 * BlogPostList Component
 *
 * Admin component for displaying and managing blog posts with:
 * - Table view with all post columns (title, status, category, views, updated date)
 * - Status filtering (draft, published, archived)
 * - Category filtering
 * - Title search
 * - Pagination (20 posts per page)
 * - Row actions (edit, delete)
 * - Bulk actions (publish, archive, delete)
 */

import { Pencil, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { BlogCategory, BlogPost, BlogStatus } from "@/data/blog-mock";

interface BlogPostListProps {
  posts: BlogPost[];
  categories: BlogCategory[];
  onEdit?: (post: BlogPost) => void;
  onDelete?: (post: BlogPost) => void;
  onBulkPublish?: (posts: BlogPost[]) => void;
  onBulkArchive?: (posts: BlogPost[]) => void;
  onBulkDelete?: (posts: BlogPost[]) => void;
}

const POSTS_PER_PAGE = 20;

export function BlogPostList({
  posts,
  categories,
  onEdit,
  onDelete,
  onBulkPublish,
  onBulkArchive,
  onBulkDelete,
}: BlogPostListProps) {
  const [statusFilter, setStatusFilter] = useState<BlogStatus | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPosts, setSelectedPosts] = useState<Set<BlogPost>>(new Set());

  // Filter posts based on all criteria
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      // Status filter
      if (statusFilter !== "all" && post.status !== statusFilter) {
        return false;
      }

      // Category filter
      if (categoryFilter !== "all" && post.category !== categoryFilter) {
        return false;
      }

      // Search filter (case-insensitive title search)
      if (
        searchQuery &&
        !post.title.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      return true;
    });
  }, [posts, statusFilter, categoryFilter, searchQuery]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const paginatedPosts = filteredPosts.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, []);

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPosts(new Set(paginatedPosts));
    } else {
      setSelectedPosts(new Set());
    }
  };

  const handleSelectPost = (post: BlogPost, checked: boolean) => {
    const newSelected = new Set(selectedPosts);
    if (checked) {
      newSelected.add(post);
    } else {
      newSelected.delete(post);
    }
    setSelectedPosts(newSelected);
  };

  const isAllSelected =
    paginatedPosts.length > 0 &&
    paginatedPosts.every((post) => selectedPosts.has(post));

  // Bulk action handlers
  const handleBulkAction = (action: (posts: BlogPost[]) => void) => {
    const selectedArray = Array.from(selectedPosts);
    action(selectedArray);
    setSelectedPosts(new Set()); // Clear selection after action
  };

  // Format helpers
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const getStatusBadgeVariant = (
    status: BlogStatus,
  ): "default" | "secondary" | "destructive" => {
    switch (status) {
      case "published":
        return "default";
      case "draft":
        return "secondary";
      case "archived":
        return "destructive";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: BlogStatus) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Get category name from slug
  const getCategoryName = (slug: string) => {
    const category = categories.find((cat) => cat.slug === slug);
    return category ? category.name : slug;
  };

  return (
    <div className="space-y-4">
      {/* Filters and Search */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 gap-2">
          <Input
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
            aria-label="Search posts"
          />
        </div>

        <div className="flex gap-2">
          <Select
            value={statusFilter}
            onValueChange={(value) =>
              setStatusFilter(value as BlogStatus | "all")
            }
          >
            <SelectTrigger className="w-[150px]" aria-label="Filter by status">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger
              className="w-[150px]"
              aria-label="Filter by category"
            >
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.slug} value={category.slug}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedPosts.size > 0 && (
        <div className="flex items-center gap-2 rounded-md border bg-muted/50 p-3">
          <span className="text-sm text-muted-foreground">
            {selectedPosts.size} post{selectedPosts.size !== 1 ? "s" : ""}{" "}
            selected
          </span>
          <div className="ml-auto flex gap-2">
            {onBulkPublish && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkAction(onBulkPublish)}
              >
                Bulk Publish
              </Button>
            )}
            {onBulkArchive && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkAction(onBulkArchive)}
              >
                Bulk Archive
              </Button>
            )}
            {onBulkDelete && (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleBulkAction(onBulkDelete)}
              >
                Bulk Delete
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      {paginatedPosts.length === 0 ? (
        <div className="rounded-md border p-8 text-center">
          <p className="text-muted-foreground">
            {filteredPosts.length === 0 && searchQuery
              ? "No posts match your search criteria"
              : "No blog posts found"}
          </p>
        </div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all posts"
                  />
                </TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Views</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedPosts.map((post) => (
                <TableRow key={post.slug}>
                  <TableCell>
                    <Checkbox
                      checked={selectedPosts.has(post)}
                      onCheckedChange={(checked) =>
                        handleSelectPost(post, checked as boolean)
                      }
                      aria-label={`Select ${post.title}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium max-w-md truncate">
                    {post.title}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(post.status)}>
                      {getStatusLabel(post.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>{getCategoryName(post.category)}</TableCell>
                  <TableCell className="text-right">
                    {formatNumber(post.viewCount)}
                  </TableCell>
                  <TableCell>{formatDate(post.updatedAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {onEdit && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onEdit(post)}
                          aria-label="Edit post"
                        >
                          <Pencil className="size-4" />
                          Edit
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onDelete(post)}
                          aria-label="Delete post"
                        >
                          <Trash2 className="size-4" />
                          Delete
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
