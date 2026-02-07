# Deployment Checklist for phytertek.com

**Task**: T040 - Vercel deployment and final verification
**Domain**: phytertek.com
**Version**: 1.0
**Last Updated**: 2026-02-07

---

## Pre-Deployment Checklist

### 1. Code Readiness

- [ ] **All tests passing**
  ```bash
  bun test
  # Expected: All tests pass with >90% coverage
  ```

- [ ] **Build succeeds locally**
  ```bash
  bun build
  # Expected: Build completes without errors
  ```

- [ ] **Lint and format clean**
  ```bash
  bun lint
  bun format
  # Expected: No errors or warnings
  ```

- [ ] **Feature branch merged to main**
  ```bash
  git checkout main
  git pull origin main
  # Verify feature/blog-system is merged
  ```

### 2. Convex Backend Deployed

- [ ] **Convex production deployment complete**
  ```bash
  bun run convex:deploy
  # Expected: Production URL returned
  ```

- [ ] **Convex verification script passes**
  ```bash
  ./scripts/verify-convex-deployment.sh
  # Expected: All checks passed (20/20)
  ```

- [ ] **Convex dashboard verified**
  - Navigate to https://dashboard.convex.dev
  - Verify 6 tables exist: blogPosts, blogCategories, blogTags, promptVersions, testCases, testResults
  - Verify 15 indexes created across tables
  - Test at least one query function in Functions tab
  - Check Data tab shows correct schema

- [ ] **Production deploy key created**
  - Format: `prod:secret-name|token`
  - Stored securely (password manager or vault)
  - Ready for Vercel configuration

### 3. Environment Variables Prepared

- [ ] **Production environment variables documented**
  - See "Environment Variables" section below
  - All values ready for Vercel configuration
  - Secrets stored in secure location
  - No placeholder values remaining

- [ ] **API keys verified**
  - OPENAI_API_KEY tested and working
  - Has sufficient quota for production usage
  - Not a test/development key

- [ ] **Admin credentials strong**
  - ADMIN_PASSWORD: 16+ characters, mixed case, numbers, symbols
  - ADMIN_SESSION_SECRET: 64-character random string
  - Different from development credentials

---

## Vercel Environment Variables

### Required Variables (Production)

| Variable | Value Source | Environment | Sensitive |
|----------|--------------|-------------|-----------|
| `NEXT_PUBLIC_CONVEX_URL` | Convex production URL | Production | No |
| `CONVEX_DEPLOY_KEY` | Convex dashboard → Settings → Deploy Keys | Production | **Yes** |
| `OPENAI_API_KEY` | https://platform.openai.com/api-keys | Production | **Yes** |
| `ADMIN_PASSWORD` | Strong password (16+ chars) | Production | **Yes** |
| `ADMIN_SESSION_SECRET` | Generate: `openssl rand -base64 48` | Production | **Yes** |

### Optional Variables (Production)

| Variable | Default | Description | Recommended |
|----------|---------|-------------|-------------|
| `AI_MAX_REQUESTS_PER_MINUTE` | 10 | Rate limit for AI endpoints | 10-20 |
| `AI_MAX_TOKENS_PER_REQUEST` | 4096 | Token limit per AI request | 4096 |
| `ADMIN_MAX_REQUESTS_PER_MINUTE` | 5 | Rate limit for admin login | 5 |
| `NEXT_PUBLIC_APP_URL` | Auto | Production URL | `https://phytertek.com` |

### Configuration Steps in Vercel

1. Navigate to https://vercel.com/dashboard
2. Select project: `phyter1-main`
3. Go to **Settings** → **Environment Variables**
4. For each variable:
   - Click **Add New**
   - Enter **Name** (exact match from table)
   - Enter **Value** (no quotes needed)
   - Select **Environment**: Production (uncheck Preview/Development)
   - Check **Sensitive** checkbox for sensitive variables
   - Click **Save**
5. Verify all variables listed in table above
6. Trigger new deployment to apply changes

---

## Deployment Steps

### Step 1: Prepare Vercel Project

- [ ] **Vercel project exists**
  - Project name: `phyter1-main`
  - Connected to GitHub repository
  - Auto-deploy enabled for main branch

- [ ] **Domain configured**
  - phytertek.com added to project
  - DNS records configured:
    - A record or CNAME pointing to Vercel
    - Propagation complete (check with `dig phytertek.com`)
  - SSL certificate provisioned by Vercel

- [ ] **Build settings correct**
  - Framework Preset: Next.js
  - Build Command: `bun build`
  - Output Directory: `.next`
  - Install Command: `bun install`
  - Node Version: 18.x or higher

### Step 2: Configure Environment Variables

- [ ] **All production environment variables set** (see table above)
- [ ] **Sensitive variables marked encrypted**
- [ ] **No test/development values in production**
- [ ] **NEXT_PUBLIC_CONVEX_URL matches production Convex URL**
- [ ] **CONVEX_DEPLOY_KEY valid and tested**

### Step 3: Deploy to Production

- [ ] **Push to main branch**
  ```bash
  git checkout main
  git pull origin main
  # Verify latest code is on main
  git push origin main
  # Triggers automatic Vercel deployment
  ```

- [ ] **Monitor deployment**
  - Navigate to Vercel dashboard → Deployments
  - Watch build logs for errors
  - Deployment status: Success (green checkmark)
  - Deployment URL: phytertek.com

- [ ] **Deployment complete**
  - Build time: < 5 minutes (expected)
  - No build errors or warnings
  - Production URL accessible: https://phytertek.com

---

## Post-Deployment Verification

### Step 1: Basic Functionality

- [ ] **Homepage loads**
  - Navigate to https://phytertek.com
  - Page loads without errors
  - All sections visible (Hero, Projects, etc.)
  - No console errors in browser DevTools

- [ ] **Navigation works**
  - Test all nav links: About, Stack, Projects, Principles, Blog
  - All pages load correctly
  - Navigation smooth, no broken links
  - Mobile menu works on small screens

- [ ] **Admin login works**
  - Navigate to https://phytertek.com/admin/login
  - Enter admin password
  - Successfully logs in
  - Redirects to admin dashboard
  - No authentication errors

### Step 2: Blog System Verification

- [ ] **Create test blog post in admin**
  ```
  Admin workflow:
  1. Navigate to https://phytertek.com/admin/blog
  2. Click "New Post"
  3. Enter title: "Test Blog Post - Deployment Verification"
  4. Enter content: Sample markdown with code block and image
  5. Set category: Create "Test" category
  6. Add tags: "deployment", "verification"
  7. Save as draft (auto-save should work)
  8. Click "Publish"
  9. Verify publish succeeded
  ```

- [ ] **Verify post appears on public blog**
  - Navigate to https://phytertek.com/blog
  - Verify "Test Blog Post" appears in list
  - Click post to view full content
  - Verify post URL: https://phytertek.com/blog/test-blog-post-deployment-verification
  - Content renders correctly (markdown, code blocks, formatting)
  - Metadata correct (title, date, category, tags)

- [ ] **Test blog features**
  - Category page: https://phytertek.com/blog/category/test
  - Tag page: https://phytertek.com/blog/tag/deployment
  - RSS feed: https://phytertek.com/blog/rss.xml (should be valid XML)
  - Search functionality (if search component visible)
  - Share buttons work (Twitter, LinkedIn, copy link)

### Step 3: Admin Panel Verification

- [ ] **Blog dashboard accessible**
  - Navigate to https://phytertek.com/admin/blog
  - Dashboard loads with stats (total posts, drafts, published)
  - Post list displays test post
  - Filter by status works (All, Draft, Published)

- [ ] **Edit post functionality**
  - Click "Edit" on test post
  - Edit page loads with post content
  - Make minor change to content
  - Save changes
  - Verify changes appear on public page

- [ ] **Category management**
  - Navigate to https://phytertek.com/admin/blog/categories
  - "Test" category appears in list
  - Can create new category
  - Can edit category name/description
  - Post count accurate

### Step 4: Performance Verification

- [ ] **Run Lighthouse audit**
  ```
  Steps:
  1. Open https://phytertek.com in Chrome
  2. Open DevTools (F12)
  3. Go to Lighthouse tab
  4. Select "Desktop" mode
  5. Check: Performance, Accessibility, Best Practices, SEO
  6. Click "Analyze page load"
  7. Wait for audit to complete
  ```

  **Expected Lighthouse Scores (95+ target):**
  - Performance: ≥ 95
  - Accessibility: ≥ 95
  - Best Practices: ≥ 95
  - SEO: ≥ 95

  **Key Metrics:**
  - First Contentful Paint (FCP): < 1.5s
  - Largest Contentful Paint (LCP): < 2.5s
  - Time to Interactive (TTI): < 3.5s
  - Cumulative Layout Shift (CLS): < 0.1
  - Total Blocking Time (TBT): < 200ms

- [ ] **Lighthouse audit passes for blog pages**
  - Repeat Lighthouse audit for:
    - Blog listing: https://phytertek.com/blog
    - Individual post: https://phytertek.com/blog/test-blog-post-deployment-verification
    - Category page: https://phytertek.com/blog/category/test
  - All scores ≥ 95

### Step 5: SEO Validation

- [ ] **Metadata validates**
  ```
  Use tools:
  - Google Rich Results Test: https://search.google.com/test/rich-results
  - Facebook Sharing Debugger: https://developers.facebook.com/tools/debug/
  - Twitter Card Validator: https://cards-dev.twitter.com/validator
  ```

  Test URLs:
  - Homepage: https://phytertek.com
  - Blog post: https://phytertek.com/blog/test-blog-post-deployment-verification

  **Expected validation results:**
  - All Open Graph tags present (og:title, og:description, og:image, og:url)
  - Twitter Cards render correctly
  - JSON-LD structured data valid (Article schema for blog posts)
  - No warnings or errors in validators

- [ ] **Sitemap includes blog posts**
  - Navigate to https://phytertek.com/sitemap.xml
  - Verify sitemap is valid XML
  - Verify blog posts included in sitemap
  - Verify lastmod dates are recent
  - Submit sitemap to Google Search Console (manual step)

- [ ] **RSS feed validates**
  - Navigate to https://phytertek.com/blog/rss.xml
  - Feed loads as valid XML (not 404)
  - Use validator: https://validator.w3.org/feed/
  - Feed includes recent blog posts
  - All required RSS fields present (title, link, description, pubDate)

### Step 6: Error Checking

- [ ] **No console errors**
  - Open browser DevTools console
  - Navigate through all major pages:
    - Homepage
    - Blog listing
    - Blog post
    - Admin login
    - Admin dashboard
  - Verify no errors in console (warnings acceptable)
  - No Convex connection errors
  - No missing resource errors (404s)

- [ ] **No broken links**
  - Test all navigation links
  - Test all blog post links
  - Test category and tag links
  - Verify external links open in new tab
  - No 404 errors when clicking links

- [ ] **Images load correctly**
  - Verify cover images on blog posts
  - Verify images in blog content
  - Verify Open Graph images in social shares
  - No broken image placeholders

### Step 7: Responsive Design

- [ ] **Mobile responsiveness**
  - Test on real mobile device or DevTools mobile emulation
  - Test iPhone (iOS Safari)
  - Test Android (Chrome)
  - All pages render correctly
  - Navigation menu works (hamburger menu)
  - Blog content readable on mobile
  - No horizontal scrolling
  - Touch targets large enough (≥ 44px)

- [ ] **Tablet responsiveness**
  - Test on iPad or tablet emulation
  - Layout adjusts appropriately
  - Blog grid responsive (2 columns on tablet)
  - Admin interface usable on tablet

---

## Verification Script

Run the automated post-deployment verification script:

```bash
./scripts/verify-deployment.sh https://phytertek.com
```

**Expected output:**
```
=== Deployment Verification Results ===

Homepage: ✓ (200 OK, <2s)
Blog listing: ✓ (200 OK, <2s)
Blog post: ✓ (200 OK, <2s)
Admin login: ✓ (200 OK, <2s)
RSS feed: ✓ (Valid XML)
Sitemap: ✓ (Valid XML)

Performance:
  FCP: 0.8s ✓
  LCP: 1.2s ✓
  CLS: 0.02 ✓

SEO:
  Open Graph: ✓
  Twitter Cards: ✓
  JSON-LD: ✓

Checks passed: 15/15
Status: READY FOR PRODUCTION ✓
```

---

## Rollback Plan

If deployment fails or critical issues discovered:

### Immediate Rollback

1. **Revert to previous deployment**
   - Go to Vercel dashboard → Deployments
   - Find last working deployment
   - Click "..." menu → "Redeploy"
   - Confirm redeployment

2. **Verify rollback successful**
   - Test https://phytertek.com
   - Verify site working as before
   - Check admin access still works

### Code Rollback (if needed)

```bash
# Find last working commit
git log --oneline

# Revert to last working commit (creates new commit)
git revert <commit-hash>

# Or reset to last working commit (destructive)
git reset --hard <commit-hash>
git push origin main --force
```

### Post-Rollback Actions

- [ ] Document what failed
- [ ] Create GitHub issue with details
- [ ] Fix issue in feature branch
- [ ] Test thoroughly before redeploying
- [ ] Update this checklist with lessons learned

---

## Post-Launch Monitoring

### First 24 Hours

- [ ] **Monitor Vercel logs**
  - Go to Vercel dashboard → Project → Logs
  - Watch for errors or warnings
  - Check function execution times
  - Monitor error rate

- [ ] **Monitor Convex usage**
  - Go to https://dashboard.convex.dev
  - Navigate to Usage tab
  - Check API request volume
  - Monitor storage usage
  - Verify no rate limit hits

- [ ] **Check analytics**
  - Vercel Speed Insights enabled
  - Verify data collection working
  - Monitor real user metrics (RUM)
  - Check for performance regressions

### First Week

- [ ] **SEO submission**
  - Submit sitemap to Google Search Console
  - Submit to Bing Webmaster Tools
  - Verify indexing begins

- [ ] **Create first real blog post**
  - Write and publish actual content
  - Share on social media
  - Verify social sharing works
  - Monitor engagement

- [ ] **User feedback**
  - Collect feedback from early users
  - Monitor for reported issues
  - Track any usability problems
  - Prioritize fixes

---

## Success Criteria

Deployment is considered successful when:

- [ ] All items in "Post-Deployment Verification" checked
- [ ] Lighthouse scores ≥ 95 for all pages
- [ ] No console errors on any public page
- [ ] Admin panel fully functional
- [ ] Blog posts can be created, edited, published, and viewed
- [ ] All SEO metadata validates correctly
- [ ] RSS feed is valid and accessible
- [ ] Sitemap includes all pages
- [ ] No broken links or 404 errors
- [ ] Mobile and tablet views work correctly
- [ ] Verification script passes all checks (15/15)

---

## Known Issues and Workarounds

*Document any known issues discovered during deployment and their workarounds*

### Issue 1: Example Issue
**Problem**: Description of issue
**Workaround**: Temporary solution
**Fix**: Permanent fix planned in issue #XXX

---

## Contacts and Resources

### Support Contacts
- **Vercel Support**: https://vercel.com/support
- **Convex Support**: support@convex.dev or https://convex.dev/community
- **Domain Registrar**: (contact info for DNS issues)

### Documentation
- Vercel Deployment Docs: https://vercel.com/docs/deployments/overview
- Convex Deployment Guide: `docs/14-CONVEX-DEPLOYMENT.md`
- Blog System Documentation: `docs/13-BLOG-SYSTEM.md`
- Project README: `README.md`

### Dashboards
- Vercel Project: https://vercel.com/dashboard/phyter1-main
- Convex Dashboard: https://dashboard.convex.dev
- Google Search Console: https://search.google.com/search-console
- Vercel Speed Insights: https://vercel.com/dashboard/phyter1-main/analytics/speed

---

## Deployment Checklist Sign-Off

**Completed By**: _________________
**Date**: _________________
**Time**: _________________
**Production URL**: https://phytertek.com
**Deployment ID**: _________________
**Status**: [ ] Success  [ ] Failed  [ ] Rolled Back

**Notes**:
_____________________________________________________________________
_____________________________________________________________________
_____________________________________________________________________
