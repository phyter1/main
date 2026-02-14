# T009: Blog Metadata Prompt Implementation

## Overview

Task T009 adds the "blog-metadata" prompt type to the Convex promptVersions table. This prompt provides comprehensive guidelines for AI-powered blog metadata suggestions including tags, categories, SEO fields, tone, and readability analysis.

## Changes Made

### 1. Schema Updates (`convex/schema.ts`)
- Added `"blog-metadata"` as a valid agent type in the `promptVersions` table
- Updated the `agentType` union to include: `"chat"`, `"fit-assessment"`, and `"blog-metadata"`

### 2. Validator Updates (`convex/validators.ts`)
- Updated `AgentTypeSchema` to include `"blog-metadata"`
- Maintains type safety across the codebase

### 3. Prompts Functions (`convex/prompts.ts`)
- Updated all existing functions to support the new agent type:
  - `saveVersion` mutation
  - `listVersions` query
  - `getActiveVersion` query
  - `setActive` mutation

- Added new mutation: `initializeBlogMetadataPrompt`
  - Creates the initial blog-metadata prompt
  - Idempotent (won't create duplicates)
  - Marks the prompt as active
  - Includes comprehensive guidelines for all metadata fields

### 4. Test Coverage (`convex/prompts.test.ts`)
- Created comprehensive test suite with 14 tests
- Validates prompt structure and content
- Tests idempotency and integration
- All tests passing ✅

## Prompt Content

The blog-metadata prompt includes:

### Placeholders
- `{existingTags}` - Context of existing blog tags for consistency
- `{existingCategories}` - Context of existing categories
- `{recentPosts}` - Sample posts for style learning

### Guidelines for 8 Metadata Fields
1. **Tags**: 3-5 relevant tags (prefer existing for consistency)
2. **Category**: Single most appropriate category
3. **Meta Title**: SEO-optimized, 50-60 characters
4. **Meta Description**: SEO-optimized, 150-160 characters
5. **Keywords**: 5-8 SEO keywords/phrases
6. **Excerpt**: Concise summary, 150-200 characters
7. **Tone**: Writing style analysis (e.g., "Technical and professional")
8. **Readability**: Reading level estimate (e.g., "College level")

### Quality Standards
- Be specific and actionable
- Maintain consistency with existing content patterns
- Prioritize user experience and discoverability
- Balance SEO optimization with natural language
- Ensure relevance to actual content

## Usage

### Initializing the Prompt

To initialize the blog-metadata prompt in your Convex database:

1. **Via Convex Dashboard:**
   - Open Convex Dashboard
   - Navigate to Functions
   - Run mutation: `prompts.initializeBlogMetadataPrompt({})`
   - Should return: `{ success: true, message: "Blog metadata prompt initialized successfully", promptId: "..." }`

2. **Via Code (First-time Setup):**
   ```typescript
   import { useMutation } from "convex/react";
   import { api } from "@/convex/_generated/api";
   
   const initPrompt = useMutation(api.prompts.initializeBlogMetadataPrompt);
   
   // Call once during setup
   await initPrompt();
   ```

### Querying the Active Prompt

```typescript
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const activePrompt = useQuery(api.prompts.getActiveVersion, {
  agentType: "blog-metadata"
});

// Use in API route for metadata suggestion
const promptText = activePrompt?.prompt;
```

### Using in API Routes

Example from `/api/admin/blog/suggest-metadata/route.ts`:

```typescript
import { generateObject } from "ai";
import { createAnthropicClient } from "@/lib/ai-config";

// In POST handler:
const activePrompt = await ctx.runQuery(api.prompts.getActiveVersion, {
  agentType: "blog-metadata"
});

if (!activePrompt) {
  throw new Error("Blog metadata prompt not found");
}

// Replace placeholders with actual context
const systemPrompt = activePrompt.prompt
  .replace("{existingTags}", existingTags.join(", "))
  .replace("{existingCategories}", existingCategories.join(", "))
  .replace("{recentPosts}", recentPostsSummary);

// Use in AI generation
const result = await generateObject({
  model: createAnthropicClient(),
  system: systemPrompt,
  prompt: `Analyze this blog post...`,
  schema: MetadataSuggestionsSchema
});
```

## Verification

### Manual Verification via Convex Dashboard

1. **Check Prompt Exists:**
   - Query: `prompts.listVersions({ agentType: "blog-metadata" })`
   - Should return array with one prompt

2. **Verify Active Status:**
   - Query: `prompts.getActiveVersion({ agentType: "blog-metadata" })`
   - Should return the prompt with `isActive: true`

3. **Check Prompt Content:**
   - Verify prompt includes all placeholders: `{existingTags}`, `{existingCategories}`, `{recentPosts}`
   - Verify all 8 metadata field guidelines are present
   - Verify quality standards section exists

### Automated Tests

Run the test suite:
```bash
bun test convex/prompts.test.ts
```

Expected output:
- 14 tests passing
- 50 expect() calls
- All assertions green ✅

## Integration with Issue #46

This task (T009) is part of the larger AI-powered metadata suggestion system (Issue #46):

- **Depends on**: T001 (Schema updates) ✅
- **Required by**: T007 (API route for metadata suggestions)

The prompt created here will be used by the `/api/admin/blog/suggest-metadata` endpoint to generate intelligent metadata suggestions based on blog content.

## Next Steps

After T009 completion:
1. **T007**: Create API route that uses this prompt
2. **T010**: Add queries for existing tags and categories (to fill placeholders)
3. Test end-to-end metadata suggestion flow

## Files Modified

- `convex/schema.ts` - Added "blog-metadata" agent type
- `convex/validators.ts` - Updated AgentTypeSchema
- `convex/prompts.ts` - Updated all functions + added initialization mutation
- `convex/prompts.test.ts` - Created test suite (14 tests)

## Acceptance Criteria ✅

- [x] Prompt type "blog-metadata" created in promptVersions table
- [x] System prompt includes guidelines for tags, category, SEO fields, tone, readability
- [x] Prompt includes placeholders for {existingTags}, {existingCategories}, {recentPosts}
- [x] Version marked as active
- [x] Prompt follows structure from issue specification
- [x] Manual verification possible via Convex dashboard
- [x] All tests passing

## Notes

- **Idempotency**: The `initializeBlogMetadataPrompt` mutation is safe to call multiple times - it will not create duplicate prompts
- **Token Count**: Approximate token count is 650 tokens (actual may vary slightly)
- **Versioning**: Future updates to the prompt should use the `saveVersion` mutation with a new description
- **Testing**: While manual verification is specified in T009, automated tests provide additional confidence
