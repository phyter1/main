"use client";

/**
 * BlogSearch Component (T026)
 *
 * Live search component for blog posts with:
 * - Debounced search input (300ms)
 * - Live search results dropdown
 * - Keyboard navigation (arrow keys, enter, escape)
 * - Click navigation to post pages
 * - Search term highlighting in results
 * - Loading states and empty states
 * - Full accessibility support
 */

import { useQuery } from "convex/react";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  buildCategoryMap,
  type ConvexBlogPost,
  transformConvexPosts,
} from "@/lib/blog-transforms";
import { api } from "../../../convex/_generated/api";

interface BlogSearchProps {
  className?: string;
}

export function BlogSearch({ className = "" }: BlogSearchProps) {
  const router = useRouter();
  const searchResultsId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Search state
  const [searchInput, setSearchInput] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Query categories for transformation
  const categories = useQuery(api.blog.getCategories);

  // Query search results
  const rawSearchResults = useQuery(
    api.blog.searchPosts,
    debouncedQuery.trim().length > 0
      ? { searchQuery: debouncedQuery.trim() }
      : "skip",
  );

  // Transform search results to BlogPost type
  const searchResults = useMemo(() => {
    if (!rawSearchResults || !categories) return undefined;
    const categoryMap = buildCategoryMap(categories);
    return transformConvexPosts(
      rawSearchResults as unknown as ConvexBlogPost[],
      categoryMap,
    );
  }, [rawSearchResults, categories]);

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchInput);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Open dropdown when results are available
  useEffect(() => {
    if (searchResults && debouncedQuery.trim().length > 0) {
      setIsOpen(true);
      setSelectedIndex(-1); // Reset selection when results change
    } else if (searchResults === null || debouncedQuery.trim().length === 0) {
      setIsOpen(false);
    }
  }, [searchResults, debouncedQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClear = useCallback(() => {
    setSearchInput("");
    setDebouncedQuery("");
    setIsOpen(false);
    inputRef.current?.focus();
  }, []);

  const handleNavigateToPost = useCallback(
    (slug: string) => {
      router.push(`/blog/${slug}`);
      setIsOpen(false);
      setSearchInput("");
      setDebouncedQuery("");
    },
    [router],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (!isOpen || !searchResults || searchResults.length === 0) {
        if (event.key === "Escape") {
          setIsOpen(false);
        }
        return;
      }

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          setSelectedIndex((prev) =>
            prev < searchResults.length - 1 ? prev + 1 : 0,
          );
          break;

        case "ArrowUp":
          event.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : searchResults.length - 1,
          );
          break;

        case "Enter":
          event.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
            handleNavigateToPost(searchResults[selectedIndex].slug);
          }
          break;

        case "Escape":
          event.preventDefault();
          setIsOpen(false);
          setSelectedIndex(-1);
          break;
      }
    },
    [isOpen, searchResults, selectedIndex, handleNavigateToPost],
  );

  const highlightSearchTerms = useCallback((text: string, query: string) => {
    if (!query.trim()) return <span>{text}</span>;

    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return (
      <span>
        {parts.map((part, index) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <mark
              key={`${index}-${part}`}
              data-testid="highlight"
              className="bg-yellow-200 dark:bg-yellow-800 font-semibold"
            >
              {part}
            </mark>
          ) : (
            <span key={`${index}-${part}`}>{part}</span>
          ),
        )}
      </span>
    );
  }, []);

  // Determine loading state
  const isLoading =
    searchResults === undefined && debouncedQuery.trim().length > 0;
  const hasResults = searchResults && searchResults.length > 0;
  const showNoResults =
    searchResults &&
    searchResults.length === 0 &&
    debouncedQuery.trim().length > 0;

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
          role="img"
          aria-hidden="true"
        />
        <Input
          ref={inputRef}
          type="search"
          aria-label="Search blog posts"
          aria-autocomplete="list"
          aria-controls={isOpen ? searchResultsId : undefined}
          aria-expanded={isOpen}
          placeholder="Search posts..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="pl-9 pr-9"
        />
        {searchInput && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            aria-label="Clear search"
            className="absolute right-1 top-1/2 -translate-y-1/2 size-7 p-0"
          >
            <X className="size-4" />
          </Button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          id={searchResultsId}
          role="listbox"
          aria-label="Search results"
          className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-lg shadow-lg max-h-96 overflow-y-auto z-50"
        >
          {/* Loading State */}
          {isLoading && (
            <div className="p-4 text-center text-muted-foreground">
              Searching...
            </div>
          )}

          {/* No Results */}
          {showNoResults && (
            <div className="p-4 text-center text-muted-foreground">
              No posts found for "{debouncedQuery}"
            </div>
          )}

          {/* Results List */}
          {hasResults &&
            searchResults.map((post, index) => (
              <div
                key={post._id}
                role="option"
                aria-selected={selectedIndex === index}
                onClick={() => handleNavigateToPost(post.slug)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleNavigateToPost(post.slug);
                  }
                }}
                className={`
									p-4 border-b border-border last:border-b-0 cursor-pointer
									hover:bg-muted/50 transition-colors
									${selectedIndex === index ? "bg-muted" : ""}
								`}
                tabIndex={0}
              >
                {/* Post Title */}
                <h3 className="font-semibold text-lg mb-1">
                  {highlightSearchTerms(post.title, debouncedQuery)}
                </h3>

                {/* Post Excerpt */}
                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                  {post.excerpt}
                </p>

                {/* Post Metadata */}
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <span className="font-medium">{post.category}</span>
                  </span>
                  <span>•</span>
                  <span>{post.readingTime} min read</span>
                  {post.featured && (
                    <>
                      <span>•</span>
                      <span className="text-primary font-medium">Featured</span>
                    </>
                  )}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
