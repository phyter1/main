# Convex Backend Deployment Guide

**Document Version**: 1.0
**Last Updated**: 2026-02-07
**Related Tasks**: T039 (Deploy Convex schema and functions)

## Overview

This guide covers deployment of the Convex backend infrastructure for the blog system and admin workbench. The deployment includes schema definitions, query/mutation functions, and integration with the Next.js application.

## What Gets Deployed

### Database Schema (6 Tables)

1. **blogPosts** - Blog post content and metadata
   - 15 fields including title, slug, content, status, SEO metadata
   - 6 indexes: by_status, by_slug, by_published_date, by_category, by_featured, search_posts

2. **blogCategories** - Blog category taxonomy
   - 6 fields including name, slug, description, postCount
   - 2 indexes: by_slug, by_post_count

3. **blogTags** - Blog tag taxonomy
   - 5 fields including name, slug, postCount
   - 2 indexes: by_slug, by_post_count

4. **promptVersions** - AI agent prompt version control
   - 6 fields including agentType, prompt, description, isActive
   - 2 indexes: by_agent_type, by_active

5. **testCases** - Agent testing framework
   - 3 fields including agentType, question, criteria
   - 1 index: by_agent_type

6. **testResults** - Test execution results
   - 5 fields including testCaseId, passed, response, metrics
   - 1 index: by_test_case

**Total**: 6 tables, 15 indexes (including 1 search index)

### Functions (19 Total)

**Query Functions (7):**
- listPosts - List posts with filtering and pagination
- getPostBySlug - Retrieve post by slug
- getFeaturedPosts - Get featured published posts
- searchPosts - Full-text search on posts
- getPostsByTag - Filter posts by tag
- getCategories - Get all categories with post counts
- getTags - Get all tags with post counts

**Mutation Functions (12):**
- createPost - Create draft blog post
- updatePost - Update existing post
- publishPost - Publish draft post
- unpublishPost - Revert to draft
- deletePost - Archive post (soft delete)
- incrementViewCount - Atomic view counter
- createCategory - Create category with slug generation
- updateCategory - Update category
- deleteCategory - Remove category
- createTag - Create tag with slug generation
- deleteTag - Remove tag
- updatePostCounts - Recalculate category/tag counts

## Prerequisites

### Required Software
- Bun package manager (https://bun.sh)
- Node.js 18+ (for Convex CLI)
- Git (for version control)

### Required Accounts
- Convex account (https://dashboard.convex.dev)
- Email address verified in Convex

### Project Setup
- All dependencies installed: `bun install`
- On feature/blog-system branch (or main after PR merge)
- Working directory clean or committed

## Local Development Deployment

### Step 1: Initialize Convex Project

First-time setup creates project configuration:

```bash
# Ensure you're in project root
cd /path/to/phyter1-main

# Initialize Convex (interactive)
bunx convex dev
```

**What This Does:**
1. Prompts you to log in to Convex (opens browser)
2. Asks to create new project or link existing
3. Creates `convex.json` with project configuration
4. Deploys schema and functions to dev instance
5. Generates TypeScript types in `convex/_generated/`
6. Starts file watcher for auto-redeployment

**Example Output:**
```
✔ Saved credentials to ~/.convex/config.json
✔ Created new project: phyter1-main
✔ Created dev deployment: dev:creative-koala-123
✔ Watching for Convex function changes...
  Functions ready:
    - convex/blog.ts (19 functions)
    - convex/prompts.ts
    - convex/testCases.ts
  Tables created:
    - blogPosts
    - blogCategories
    - blogTags
    - promptVersions
    - testCases
    - testResults
✔ Deployment complete
✔ NEXT_PUBLIC_CONVEX_URL=https://creative-koala-123.convex.cloud
```

### Step 2: Configure Environment Variables

Set the Convex URL in your local environment:

```bash
# Create .env.local if it doesn't exist
cp .env.local.example .env.local

# Edit .env.local and update:
NEXT_PUBLIC_CONVEX_URL=https://creative-koala-123.convex.cloud
```

Replace `creative-koala-123` with your actual deployment subdomain from step 1.

### Step 3: Restart Next.js Development Server

```bash
# Stop current dev server (Ctrl+C)

# Start with new environment variables
bun dev
```

### Step 4: Verify Deployment

Run the automated verification script:

```bash
./scripts/verify-convex-deployment.sh
```

**Expected Output:**
```
=== Summary ===

Checks passed: 20
Checks failed: 0
Total checks: 20

✓ All critical checks passed!
```

### Step 5: Test in Convex Dashboard

1. Navigate to https://dashboard.convex.dev
2. Select your project (phyter1-main)
3. Go to **Data** tab
4. Verify tables exist: blogPosts, blogCategories, blogTags, etc.
5. Go to **Functions** tab
6. Test a function:

```typescript
// Function: blog:createCategory
// Args:
{
  "name": "Technology",
  "description": "Tech articles and tutorials"
}

// Expected result:
{
  "_id": "jd7x8y9z...",
  "_creationTime": 1707331200000
}
```

7. Go back to **Data** tab → blogCategories
8. Verify category was created with slug "technology"

### Step 6: Test in Application

```bash
# Ensure dev server is running
bun dev

# Navigate to http://localhost:3000/admin/blog
# Create a test blog post
# Verify it appears in the admin interface
```

## Production Deployment

### Step 1: Deploy to Production Instance

Create a permanent production deployment:

```bash
# Deploy to production
bun run convex:deploy
```

**What This Does:**
1. Authenticates with Convex
2. Creates/updates production deployment
3. Deploys schema and functions
4. Outputs production URL

**Example Output:**
```
✔ Deploying to production deployment: prod:phyter1-main
✔ Deployment complete
✔ Production URL: https://phyter1-main-prod.convex.cloud
```

### Step 2: Create Production Deploy Key

For CI/CD and Vercel deployments:

1. Go to https://dashboard.convex.dev
2. Select project → **Settings**
3. Scroll to **Production Deploy Keys**
4. Click **Create Deploy Key**
5. Copy the key (format: `prod:secret-name|token`)
6. **CRITICAL**: Store securely, shown only once

### Step 3: Configure Vercel Environment Variables

Navigate to Vercel project settings:

1. Go to https://vercel.com/dashboard
2. Select project (phyter1-main)
3. Settings → **Environment Variables**
4. Add these variables:

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| NEXT_PUBLIC_CONVEX_URL | https://phyter1-main-prod.convex.cloud | Production |
| CONVEX_DEPLOY_KEY | prod:secret-name\|token | Production (sensitive) |

**Important:**
- Mark CONVEX_DEPLOY_KEY as "Sensitive" in Vercel
- Use production URL for NEXT_PUBLIC_CONVEX_URL
- Don't use dev deployment URL in production

### Step 4: Deploy Vercel Application

```bash
# Commit any pending changes
git add .
git commit -m "feat(T039): configure Convex production deployment"

# Push to trigger Vercel deployment
git push origin main
```

Vercel will automatically deploy with new environment variables.

### Step 5: Verify Production Deployment

1. Wait for Vercel deployment to complete
2. Navigate to your production URL (e.g., https://phytertek.com)
3. Go to /admin/blog
4. Create a test blog post
5. Publish the post
6. Navigate to /blog
7. Verify post appears on public blog page
8. Check browser console - no Convex errors

## Verification Checklist

### Local Development ✓
- [ ] `bunx convex dev` runs without errors
- [ ] convex.json created with project configuration
- [ ] All 6 tables visible in Convex dashboard Data tab
- [ ] All 15 indexes created across tables
- [ ] All 19 functions visible in Functions tab
- [ ] Test query returns expected results
- [ ] Test mutation creates data successfully
- [ ] NEXT_PUBLIC_CONVEX_URL set in .env.local
- [ ] Next.js dev server connects to Convex
- [ ] No console errors about missing Convex URL
- [ ] Verification script passes all checks

### Production ✓
- [ ] `bun run convex:deploy` completes successfully
- [ ] Production deployment visible in Convex dashboard
- [ ] Production deploy key created and stored securely
- [ ] NEXT_PUBLIC_CONVEX_URL set in Vercel (production)
- [ ] CONVEX_DEPLOY_KEY set in Vercel (encrypted)
- [ ] Vercel deployment successful
- [ ] Production site connects to Convex backend
- [ ] Can create blog post in admin interface
- [ ] Blog posts visible on public /blog page
- [ ] No deployment errors in Vercel logs
- [ ] Lighthouse audit passes (95+ score)

## Troubleshooting

### "No CONVEX_DEPLOYMENT set"

**Problem:**
```
✖ No CONVEX_DEPLOYMENT set, run `npx convex dev` to configure a Convex project
```

**Cause:** Convex project not initialized

**Solution:**
```bash
# Initialize project
bunx convex dev

# Follow prompts to log in and create/link project
```

---

### "Invalid schema" Deployment Error

**Problem:**
```
✖ Schema validation failed: Invalid field type at blogPosts.status
```

**Cause:** Syntax error in convex/schema.ts

**Solution:**
1. Open convex/schema.ts
2. Check field definition at line mentioned in error
3. Verify correct Convex value type (v.string(), v.number(), etc.)
4. Ensure all imports are correct
5. Save and Convex will auto-redeploy

---

### Functions Not Appearing in Dashboard

**Problem:** Deployed but functions not visible in Functions tab

**Solution:**
1. Refresh dashboard page (hard refresh: Cmd+Shift+R)
2. Verify function is exported: `export const functionName = query/mutation`
3. Check file is in convex/ root directory (not subdirectory)
4. Review terminal output for deployment errors
5. Stop and restart `convex dev`

---

### "NEXT_PUBLIC_CONVEX_URL is not defined"

**Problem:** Next.js can't connect to Convex

**Solution:**
1. Verify .env.local exists and contains NEXT_PUBLIC_CONVEX_URL
2. Ensure URL format: `https://subdomain.convex.cloud`
3. Restart Next.js dev server after updating .env.local
4. Check browser console for actual error message
5. Verify URL matches deployment in Convex dashboard

---

### Production Deploy Key Not Working

**Problem:**
```
✖ Authentication failed: Invalid deploy key
```

**Solution:**
1. Verify entire key copied (starts with `prod:`)
2. Check for extra spaces or line breaks in Vercel variable
3. Ensure using production key (not dev key)
4. If key regenerated, old keys are invalidated
5. Create new deploy key in Convex dashboard if needed

---

### Search Index Not Returning Results

**Problem:** `searchPosts` query returns empty array

**Solution:**
1. Verify search_posts index exists in Data tab under blogPosts
2. Wait 1-2 minutes for index to build after first deployment
3. Test with published posts only (index filters by status)
4. Check index configuration in schema.ts:
   ```typescript
   .searchIndex("search_posts", {
     searchField: "title",
     filterFields: ["status", "categoryId"],
   })
   ```

---

### Rate Limiting or Quota Errors

**Problem:**
```
✖ Rate limit exceeded: Too many requests
```

**Solution:**
1. Check Convex dashboard → Usage tab
2. Review current plan limits
3. Upgrade plan if needed for production
4. Implement caching in Next.js to reduce queries
5. Use ISR (Incremental Static Regeneration) for blog pages

## Performance Optimization

### Database Query Optimization

**Use Indexes:**
All queries should use indexes defined in schema:

```typescript
// Good: Uses by_status index
const posts = await ctx.db
  .query("blogPosts")
  .withIndex("by_status", q => q.eq("status", "published"))
  .collect();

// Bad: Full table scan
const posts = await ctx.db
  .query("blogPosts")
  .filter(q => q.eq(q.field("status"), "published"))
  .collect();
```

**Pagination:**
Always use limit/offset for large result sets:

```typescript
const posts = await query
  .take(limit)   // Default 20
  .skip(offset); // Default 0
```

### Caching Strategy

**Next.js ISR:**
Configure revalidation times in blog pages:

```typescript
// src/app/blog/page.tsx
export const revalidate = 60; // Revalidate every 60 seconds

// src/app/blog/[slug]/page.tsx
export const revalidate = 3600; // Revalidate every hour
```

**Client-Side Caching:**
Convex client automatically caches query results. Use reactive queries for automatic updates.

## Monitoring and Maintenance

### Convex Dashboard Monitoring

1. **Logs Tab**
   - View function call logs
   - Filter by function name
   - Search error messages
   - Monitor response times

2. **Usage Tab**
   - Track API quota usage
   - Monitor storage usage
   - Review bandwidth consumption
   - Set up usage alerts

3. **Data Tab**
   - View table contents
   - Monitor row counts
   - Check index performance
   - Run ad-hoc queries

### Alerts and Notifications

Set up alerts in Convex dashboard:
- Error rate threshold exceeded
- Quota usage approaching limit
- Deployment failures
- Performance degradation

### Backup and Recovery

**Automatic Backups:**
Convex automatically backs up all data. No manual backup needed.

**Point-in-Time Recovery:**
Contact Convex support for point-in-time recovery if needed.

**Export Data:**
Use dashboard or CLI to export data for local backup:

```bash
bunx convex export --table blogPosts
```

## Security Best Practices

### Environment Variables
- Never commit .env.local to version control
- Use encrypted environment variables in Vercel
- Rotate CONVEX_DEPLOY_KEY quarterly
- Use different keys for staging and production
- Store production keys in secure vault

### Access Control
- Convex dashboard access via email authentication
- Deploy keys only in trusted CI/CD environments
- Regularly review team access in dashboard
- Remove access for departed team members
- Use least-privilege principle for deploy keys

### Data Validation
- All mutations use Zod schema validation
- Input sanitization in validators.ts
- SQL injection prevention (Convex is NoSQL, not vulnerable)
- XSS prevention in blog content rendering

## Advanced Topics

### Custom Deployment Workflows

**Staging Environment:**
```bash
# Create staging deployment
bunx convex deploy --stage staging

# Get staging URL
# Update .env.staging with staging URL
```

**Multiple Environments:**
Maintain separate deployments for:
- Development (dev:*)
- Staging (staging:*)
- Production (prod:*)

### Continuous Integration

**GitHub Actions Example:**
```yaml
name: Deploy Convex
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bunx convex deploy --prod
        env:
          CONVEX_DEPLOY_KEY: ${{ secrets.CONVEX_DEPLOY_KEY }}
```

### Schema Migrations

Convex handles schema changes automatically:

**Adding Fields:**
```typescript
// Safe: Add optional field
newField: v.optional(v.string())

// Breaking: Add required field (existing docs won't have it)
newField: v.string() // ❌ Will fail for existing documents
```

**Removing Fields:**
```typescript
// Safe: Remove field from schema
// Existing data remains in database but won't be accessible

// Migration: Update existing documents first
// Then remove from schema
```

## Time Estimates

| Task | Time |
|------|------|
| First-time local deployment | 10-15 minutes |
| Environment configuration | 5 minutes |
| Verification and testing | 10 minutes |
| Production deployment | 10 minutes |
| Vercel configuration | 5 minutes |
| **Total** | **40-45 minutes** |

## Next Steps

After successful deployment:

1. **Verify Functionality**
   - Run verification script: `./scripts/verify-convex-deployment.sh`
   - Test admin blog interface
   - Test public blog pages
   - Check browser console for errors

2. **Create Sample Data**
   - Create categories in admin
   - Create tags in admin
   - Write first blog post
   - Publish and verify on public site

3. **Performance Testing**
   - Run Lighthouse audit (target: 95+)
   - Test with multiple blog posts
   - Verify pagination works
   - Test search functionality

4. **Production Launch**
   - Deploy to Vercel production
   - Verify production URL works
   - Monitor Convex usage
   - Set up error alerts

## Resources

### Documentation
- Convex Docs: https://docs.convex.dev
- Convex Deployment: https://docs.convex.dev/production/deployment
- Convex Schema: https://docs.convex.dev/database/schemas
- Convex Functions: https://docs.convex.dev/functions

### Tools
- Convex Dashboard: https://dashboard.convex.dev
- Verification Script: `./scripts/verify-convex-deployment.sh`
- Convex CLI Reference: https://docs.convex.dev/cli

### Support
- Convex Discord: https://convex.dev/community
- Convex Support: support@convex.dev
- GitHub Issues: https://github.com/get-convex/convex-backend

## Appendix: File Structure

```
convex/
├── _generated/          # Auto-generated TypeScript types
│   ├── api.d.ts        # API type definitions
│   ├── server.d.ts     # Server type definitions
│   └── dataModel.d.ts  # Data model types
├── schema.ts           # Database schema (6 tables)
├── blog.ts             # Blog functions (19 functions)
├── prompts.ts          # Prompt management functions
├── testCases.ts        # Test case management
├── validators.ts       # Input validation schemas
└── tsconfig.json       # TypeScript config for Convex

scripts/
└── verify-convex-deployment.sh  # Automated verification

docs/
└── 14-CONVEX-DEPLOYMENT.md     # This document
```

## Changelog

### Version 1.0 (2026-02-07)
- Initial deployment guide created
- Local and production deployment procedures
- Verification checklist and troubleshooting
- Performance optimization guidelines
- Security best practices
