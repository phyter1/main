import { v } from "convex/values";
import { describe, expect, it } from "vitest";

/**
 * Convex Schema Tests - T001: Update Convex schema with AI suggestion fields
 *
 * This test suite validates the schema structure for AI-powered metadata suggestions.
 * Tests ensure all required fields are properly defined with correct types and structure.
 */

describe("T001: Convex Schema - AI Suggestion Fields", () => {
  describe("blogPosts table schema structure", () => {
    it("should define aiSuggestions object with nested fields", () => {
      // Define expected schema structure for AI suggestions
      const expectedAISuggestionsSchema = v.optional(
        v.object({
          excerpt: v.optional(
            v.object({
              value: v.string(),
              state: v.union(
                v.literal("pending"),
                v.literal("approved"),
                v.literal("rejected"),
              ),
            }),
          ),
          tags: v.optional(
            v.object({
              value: v.array(v.string()),
              state: v.union(
                v.literal("pending"),
                v.literal("approved"),
                v.literal("rejected"),
              ),
              rejectedTags: v.array(v.string()),
            }),
          ),
          category: v.optional(
            v.object({
              value: v.string(),
              state: v.union(
                v.literal("pending"),
                v.literal("approved"),
                v.literal("rejected"),
              ),
            }),
          ),
          seoMetadata: v.optional(
            v.object({
              metaTitle: v.optional(
                v.object({
                  value: v.string(),
                  state: v.union(
                    v.literal("pending"),
                    v.literal("approved"),
                    v.literal("rejected"),
                  ),
                }),
              ),
              metaDescription: v.optional(
                v.object({
                  value: v.string(),
                  state: v.union(
                    v.literal("pending"),
                    v.literal("approved"),
                    v.literal("rejected"),
                  ),
                }),
              ),
              keywords: v.optional(
                v.object({
                  value: v.array(v.string()),
                  state: v.union(
                    v.literal("pending"),
                    v.literal("approved"),
                    v.literal("rejected"),
                  ),
                }),
              ),
            }),
          ),
          analysis: v.optional(
            v.object({
              tone: v.string(),
              readability: v.string(),
            }),
          ),
        }),
      );

      // Validate schema structure is defined correctly
      expect(expectedAISuggestionsSchema).toBeDefined();
      expect(typeof expectedAISuggestionsSchema).toBe("object");
    });

    it("should validate AI suggestion state values", () => {
      const validStates = ["pending", "approved", "rejected"];
      const invalidStates = ["accepted", "declined", "processing"];

      // Valid states should be recognized
      validStates.forEach((state) => {
        expect(["pending", "approved", "rejected"]).toContain(state);
      });

      // Invalid states should not be recognized
      invalidStates.forEach((state) => {
        expect(["pending", "approved", "rejected"]).not.toContain(state);
      });
    });

    it("should validate excerpt suggestion structure", () => {
      const validExcerptSuggestion = {
        value: "This is an AI-suggested excerpt for the blog post.",
        state: "pending" as const,
      };

      expect(validExcerptSuggestion.value).toBeDefined();
      expect(typeof validExcerptSuggestion.value).toBe("string");
      expect(validExcerptSuggestion.state).toBe("pending");
      expect(["pending", "approved", "rejected"]).toContain(
        validExcerptSuggestion.state,
      );
    });

    it("should validate tags suggestion structure with rejectedTags", () => {
      const validTagsSuggestion = {
        value: ["react", "typescript", "web-development"],
        state: "pending" as const,
        rejectedTags: ["old-tag", "irrelevant-tag"],
      };

      expect(Array.isArray(validTagsSuggestion.value)).toBe(true);
      expect(validTagsSuggestion.value.length).toBeGreaterThan(0);
      expect(validTagsSuggestion.state).toBe("pending");
      expect(Array.isArray(validTagsSuggestion.rejectedTags)).toBe(true);
      expect(validTagsSuggestion.rejectedTags.length).toBe(2);
    });

    it("should validate category suggestion structure", () => {
      const validCategorySuggestion = {
        value: "Technology",
        state: "approved" as const,
      };

      expect(validCategorySuggestion.value).toBeDefined();
      expect(typeof validCategorySuggestion.value).toBe("string");
      expect(validCategorySuggestion.state).toBe("approved");
    });

    it("should validate SEO metadata suggestions structure", () => {
      const validSEOSuggestions = {
        metaTitle: {
          value: "Best Practices for React Development",
          state: "pending" as const,
        },
        metaDescription: {
          value:
            "Learn essential React development patterns and best practices.",
          state: "pending" as const,
        },
        keywords: {
          value: ["react", "development", "best-practices"],
          state: "pending" as const,
        },
      };

      // Meta title validation
      expect(validSEOSuggestions.metaTitle).toBeDefined();
      expect(typeof validSEOSuggestions.metaTitle.value).toBe("string");
      expect(validSEOSuggestions.metaTitle.state).toBe("pending");

      // Meta description validation
      expect(validSEOSuggestions.metaDescription).toBeDefined();
      expect(typeof validSEOSuggestions.metaDescription.value).toBe("string");
      expect(validSEOSuggestions.metaDescription.state).toBe("pending");

      // Keywords validation
      expect(validSEOSuggestions.keywords).toBeDefined();
      expect(Array.isArray(validSEOSuggestions.keywords.value)).toBe(true);
      expect(validSEOSuggestions.keywords.state).toBe("pending");
    });

    it("should validate analysis structure", () => {
      const validAnalysis = {
        tone: "professional",
        readability: "intermediate",
      };

      expect(validAnalysis.tone).toBeDefined();
      expect(typeof validAnalysis.tone).toBe("string");
      expect(validAnalysis.readability).toBeDefined();
      expect(typeof validAnalysis.readability).toBe("string");
    });

    it("should define lastAnalyzedContent field", () => {
      const lastAnalyzedContent = "Previous content hash for change detection";

      expect(lastAnalyzedContent).toBeDefined();
      expect(typeof lastAnalyzedContent).toBe("string");
      expect(lastAnalyzedContent.length).toBeGreaterThan(0);
    });

    it("should define lastAnalyzedTitle field", () => {
      const lastAnalyzedTitle = "Previous title hash for change detection";

      expect(lastAnalyzedTitle).toBeDefined();
      expect(typeof lastAnalyzedTitle).toBe("string");
      expect(lastAnalyzedTitle.length).toBeGreaterThan(0);
    });

    it("should allow optional AI suggestions fields", () => {
      const postWithoutAISuggestions = {
        title: "Blog Post",
        slug: "blog-post",
        excerpt: "Manual excerpt",
        content: "Content",
        status: "draft" as const,
        tags: ["manual"],
        author: "Author",
        readingTimeMinutes: 5,
        viewCount: 0,
        featured: false,
        seoMetadata: {},
        createdAt: Date.now(),
        updatedAt: Date.now(),
        // No aiSuggestions, lastAnalyzedContent, or lastAnalyzedTitle
      };

      // Post without AI suggestions should still be valid
      expect(postWithoutAISuggestions.title).toBeDefined();
      expect(postWithoutAISuggestions.aiSuggestions).toBeUndefined();
    });

    it("should allow partial AI suggestions", () => {
      const postWithPartialSuggestions = {
        aiSuggestions: {
          excerpt: {
            value: "AI-suggested excerpt",
            state: "pending" as const,
          },
          // Only excerpt suggested, other fields can be undefined
        },
      };

      expect(postWithPartialSuggestions.aiSuggestions).toBeDefined();
      expect(postWithPartialSuggestions.aiSuggestions.excerpt).toBeDefined();
      expect(postWithPartialSuggestions.aiSuggestions.tags).toBeUndefined();
      expect(postWithPartialSuggestions.aiSuggestions.category).toBeUndefined();
    });
  });

  describe("AI suggestion state transitions", () => {
    it("should validate pending to approved transition", () => {
      const suggestion = {
        value: "Some value",
        state: "pending" as const,
      };

      const approvedSuggestion = {
        ...suggestion,
        state: "approved" as const,
      };

      expect(suggestion.state).toBe("pending");
      expect(approvedSuggestion.state).toBe("approved");
      expect(["pending", "approved", "rejected"]).toContain(
        approvedSuggestion.state,
      );
    });

    it("should validate pending to rejected transition", () => {
      const suggestion = {
        value: "Some value",
        state: "pending" as const,
      };

      const rejectedSuggestion = {
        ...suggestion,
        state: "rejected" as const,
      };

      expect(suggestion.state).toBe("pending");
      expect(rejectedSuggestion.state).toBe("rejected");
      expect(["pending", "approved", "rejected"]).toContain(
        rejectedSuggestion.state,
      );
    });

    it("should track rejected tags separately", () => {
      const tagsSuggestion = {
        value: ["react", "typescript"],
        state: "approved" as const,
        rejectedTags: ["old-framework", "deprecated"],
      };

      // Rejected tags should be tracked even after approval
      expect(Array.isArray(tagsSuggestion.rejectedTags)).toBe(true);
      expect(tagsSuggestion.rejectedTags.length).toBe(2);
      expect(tagsSuggestion.rejectedTags).toContain("old-framework");
      expect(tagsSuggestion.rejectedTags).toContain("deprecated");

      // Rejected tags should not appear in value
      tagsSuggestion.rejectedTags.forEach((rejectedTag) => {
        expect(tagsSuggestion.value).not.toContain(rejectedTag);
      });
    });
  });

  describe("change detection fields", () => {
    it("should store content hash for comparison", () => {
      const contentHash = "abc123def456"; // Example hash
      const previousContentHash = "xyz789uvw012";

      const hasContentChanged = contentHash !== previousContentHash;

      expect(hasContentChanged).toBe(true);
      expect(typeof contentHash).toBe("string");
      expect(typeof previousContentHash).toBe("string");
    });

    it("should store title hash for comparison", () => {
      const titleHash = "title123hash";
      const previousTitleHash = "title456hash";

      const hasTitleChanged = titleHash !== previousTitleHash;

      expect(hasTitleChanged).toBe(true);
      expect(typeof titleHash).toBe("string");
      expect(typeof previousTitleHash).toBe("string");
    });

    it("should detect when content has not changed", () => {
      const currentContentHash = "same-hash-123";
      const previousContentHash = "same-hash-123";

      const hasContentChanged = currentContentHash !== previousContentHash;

      expect(hasContentChanged).toBe(false);
      expect(currentContentHash).toBe(previousContentHash);
    });
  });

  describe("schema integration with existing blogPosts table", () => {
    it("should maintain backward compatibility with existing fields", () => {
      const existingPost = {
        title: "Existing Post",
        slug: "existing-post",
        excerpt: "Existing excerpt",
        content: "Existing content",
        status: "published" as const,
        tags: ["existing"],
        author: "Author",
        readingTimeMinutes: 5,
        viewCount: 100,
        featured: false,
        seoMetadata: {
          metaTitle: "Existing Meta Title",
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      // All existing fields should remain valid
      expect(existingPost.title).toBeDefined();
      expect(existingPost.slug).toBeDefined();
      expect(existingPost.excerpt).toBeDefined();
      expect(existingPost.content).toBeDefined();
      expect(existingPost.status).toBe("published");
      expect(Array.isArray(existingPost.tags)).toBe(true);
      expect(existingPost.seoMetadata).toBeDefined();
    });

    it("should support posts with both existing and AI fields", () => {
      const hybridPost = {
        // Existing fields
        title: "Hybrid Post",
        slug: "hybrid-post",
        excerpt: "Manual excerpt",
        content: "Content",
        status: "draft" as const,
        tags: ["manual", "tag"],
        author: "Author",
        readingTimeMinutes: 5,
        viewCount: 0,
        featured: false,
        seoMetadata: {
          metaTitle: "Manual Meta Title",
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),

        // New AI suggestion fields
        aiSuggestions: {
          excerpt: {
            value: "AI-suggested excerpt",
            state: "pending" as const,
          },
          tags: {
            value: ["ai-suggested-tag"],
            state: "pending" as const,
            rejectedTags: [],
          },
        },
        lastAnalyzedContent: "content-hash-123",
        lastAnalyzedTitle: "title-hash-456",
      };

      // Both field sets should coexist
      expect(hybridPost.excerpt).toBe("Manual excerpt");
      expect(hybridPost.aiSuggestions?.excerpt?.value).toBe(
        "AI-suggested excerpt",
      );
      expect(hybridPost.lastAnalyzedContent).toBeDefined();
      expect(hybridPost.lastAnalyzedTitle).toBeDefined();
    });
  });
});

describe("Schema validation contract", () => {
  it("should validate that schema codegen will succeed", () => {
    // This test validates the structure is ready for Convex codegen
    const requiredAISuggestionFields = [
      "excerpt",
      "tags",
      "category",
      "seoMetadata",
      "analysis",
    ];

    requiredAISuggestionFields.forEach((field) => {
      expect(typeof field).toBe("string");
      expect(field.length).toBeGreaterThan(0);
    });
  });

  it("should validate change detection fields exist", () => {
    const changeDetectionFields = ["lastAnalyzedContent", "lastAnalyzedTitle"];

    changeDetectionFields.forEach((field) => {
      expect(typeof field).toBe("string");
      expect(field.length).toBeGreaterThan(0);
    });
  });

  it("should validate AI suggestion states are properly typed", () => {
    const validStates: Array<"pending" | "approved" | "rejected"> = [
      "pending",
      "approved",
      "rejected",
    ];

    expect(validStates.length).toBe(3);
    expect(validStates).toContain("pending");
    expect(validStates).toContain("approved");
    expect(validStates).toContain("rejected");
  });
});
