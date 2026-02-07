# Blog System Documentation

**Comprehensive guide to the blog system architecture, admin workflows, content creation, deployment, and troubleshooting**

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Technology Stack](#technology-stack)
3. [Admin Guide](#admin-guide)
4. [Content Guidelines](#content-guidelines)
5. [Deployment Instructions](#deployment-instructions)
6. [API Documentation](#api-documentation)
7. [Component Documentation](#component-documentation)
8. [Troubleshooting](#troubleshooting)
9. [Future Enhancements](#future-enhancements)

---

## Architecture Overview

The blog system is a modern, full-featured publishing platform built with Next.js 16 App Router, Convex backend, and MDX content rendering. It integrates seamlessly with the existing admin system and supports advanced SEO features, content management workflows, and performance optimizations.

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                          Blog System                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌───────────────┐         ┌───────────────┐                   │
│  │  Public Blog  │         │  Admin Panel  │                   │
│  │    Pages      │         │               │                   │
│  ├───────────────┤         ├───────────────┤                   │
│  │ /blog         │         │ /admin/blog   │                   │
│  │ /blog/[slug]  │◄────────┤ /new          │                   │
│  │ /category/*   │         │ /edit/[id]    │                   │
│  │ /tag/*        │         │ /categories   │                   │
│  │ /rss.xml      │         │               │                   │
│  └───────┬───────┘         └───────┬───────┘                   │
│          │                         │                            │
│          │                         │                            │
│  ┌───────▼─────────────────────────▼───────┐                   │
│  │         Convex Backend                  │                   │
│  ├─────────────────────────────────────────┤                   │
│  │ • blogPosts table                       │                   │
│  │ • blogCategories table                  │                   │
│  │ • blogTags table                        │                   │
│  │ • Full-text search index                │                   │
│  │ • Query functions (T006)                │                   │
│  │ • Mutation functions (T007, T008)       │                   │
│  └─────────────────────────────────────────┘                   │
│                                                                  │
│  ┌─────────────────────────────────────────┐                   │
│  │      MDX/Markdown Rendering              │                   │
│  ├─────────────────────────────────────────┤                   │
│  │ • GitHub Flavored Markdown (GFM)        │                   │
│  │ • Syntax highlighting (rehype-highlight)│                   │
│  │ • Auto-linked headings (rehype-slug)    │                   │
│  │ • Math support (remark-math)            │                   │
│  │ • Custom component overrides            │                   │
│  └─────────────────────────────────────────┘                   │
│                                                                  │
│  ┌─────────────────────────────────────────┐                   │
│  │          SEO & Performance               │                   │
│  ├─────────────────────────────────────────┤                   │
│  │ • Dynamic metadata generation (T032)    │                   │
│  │ • OpenGraph tags                        │                   │
│  │ • Twitter Cards                         │                   │
│  │ • JSON-LD structured data               │                   │
│  │ • Sitemap generation (T033)             │                   │
│  │ • ISR caching (T034)                    │                   │
│  │ • RSS feed                              │                   │
│  └─────────────────────────────────────────┘                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

**Content Creation Flow:**
```
Admin creates post → Draft saved to Convex → Editor with live preview →
Publish action → Post status changes → Appears on public blog →
Search engines index via sitemap
```

**Public Viewing Flow:**
```
User visits /blog/[slug] → Next.js SSR with ISR → Convex query for post →
MDX content rendered → View count incremented → Related posts loaded →
Metadata sent to social platforms
```

### Key Features

1. **Full-Featured Admin Interface**
   - Rich text editor with MDX support and live preview
   - Auto-save functionality (every 30 seconds)
   - Category and tag management
   - Bulk operations (publish, archive, delete)
   - Search and filtering capabilities
   - Statistics dashboard

2. **Public Blog Pages**
   - Blog listing with featured posts
   - Individual post pages with rich content
   - Category and tag archive pages
   - Live search functionality
   - Pagination (20 posts per page)
   - Responsive sidebar with categories/tags

3. **Content Management**
   - Draft/Published/Archived status workflow
   - URL-safe slug generation
   - Reading time estimation (200 words/min)
   - View count tracking
   - Featured post highlighting
   - Cover image support

4. **SEO Optimization**
   - Dynamic metadata generation
   - OpenGraph tags for social sharing
   - Twitter Card tags
   - Canonical URLs
   - Article structured data (JSON-LD)
   - Sitemap generation
   - RSS feed (last 50 posts)

5. **Performance**
   - Incremental Static Regeneration (ISR)
   - Blog listing: 60-second revalidation
   - Blog posts: 1-hour revalidation
   - Static generation for published posts
   - Optimized database indexes
   - Efficient pagination

---

## Technology Stack

### Core Technologies

**Frontend:**
- Next.js 16 with App Router
- React 19.2.0 with React Compiler
- TypeScript with strict mode
- Tailwind CSS 4 for styling
- Framer Motion for animations
- shadcn/ui components (new-york style)

**Backend:**
- Convex (serverless database and API)
- Real-time data synchronization
- Full-text search capabilities
- Automatic schema validation

**Content Rendering:**
- MDX (Markdown with JSX)
- react-markdown for rendering
- remark-gfm for GitHub Flavored Markdown
- remark-math for mathematical expressions
- rehype-highlight for syntax highlighting
- rehype-slug for heading IDs
- rehype-autolink-headings for anchor links

**Development Tools:**
- Bun as package manager and runtime
- Biome for linting and formatting
- Git hooks for code quality
- Sequential test execution script

### Dependencies

**MDX and Markdown Processing:**
```json
{
  "@mdx-js/loader": "^3.1.0",
  "@mdx-js/react": "^3.1.0",
  "@next/mdx": "^15.1.5",
  "react-markdown": "^9.0.2",
  "remark-gfm": "^4.0.0",
  "remark-math": "^6.0.0",
  "rehype-highlight": "^7.0.1",
  "rehype-slug": "^6.0.0",
  "rehype-autolink-headings": "^7.1.0"
}
```

**Rich Text Editor:**
```json
{
  "@tiptap/react": "^2.10.4",
  "@tiptap/starter-kit": "^2.10.4",
  "@tiptap/extension-link": "^2.10.4"
}
```

**Utilities:**
```json
{
  "date-fns": "^4.1.0",
  "zod": "^3.24.1"
}
```

### Database Schema (Convex)

**blogPosts Table:**
```typescript
{
  _id: Id<"blogPosts">,
  _creationTime: number,
  title: string,
  slug: string,              // Unique, indexed
  excerpt: string,
  content: string,           // MDX/Markdown format
  coverImageUrl?: string,
  status: "draft" | "published" | "archived",
  categoryId?: Id<"blogCategories">,
  tags: string[],
  author: string,
  readingTimeMinutes: number,
  viewCount: number,
  featured: boolean,
  seoMetadata: {
    metaTitle?: string,
    metaDescription?: string,
    ogImage?: string,
    keywords?: string[]
  },
  publishedAt?: number,
  createdAt: number,
  updatedAt: number
}
```

**Indexes:**
- `by_status` - Filter posts by status
- `by_slug` - Retrieve posts by slug (unique lookups)
- `by_published_date` - Sort published posts chronologically
- `by_category` - Filter posts by category
- `by_featured` - Retrieve featured posts
- `search_posts` - Full-text search on title field

**blogCategories Table:**
```typescript
{
  _id: Id<"blogCategories">,
  _creationTime: number,
  name: string,
  slug: string,              // Unique, indexed
  description: string,
  postCount: number,
  createdAt: number,
  updatedAt: number
}
```

**blogTags Table:**
```typescript
{
  _id: Id<"blogTags">,
  _creationTime: number,
  name: string,
  slug: string,              // Unique, indexed
  postCount: number,
  createdAt: number,
  updatedAt: number
}
```

---

## Admin Guide

### Accessing the Admin Panel

1. Navigate to `/admin/login`
2. Enter your admin password (configured in `ADMIN_PASSWORD` environment variable)
3. Click "Login" to authenticate
4. Navigate to `/admin/blog` to access blog management

**Session Details:**
- Sessions last 24 hours of inactivity
- Automatic logout on session expiration
- Rate limiting: 5 login attempts per minute per IP

### Dashboard Overview

The blog dashboard (`/admin/blog`) displays:

**Statistics Cards:**
- Total Posts: All posts in the system
- Drafts: Unpublished draft posts
- Published: Live published posts

**Quick Actions:**
- "New Post" button to create a new blog post

**Post List:**
- Table view of all posts with:
  - Title
  - Status (Draft/Published/Archived)
  - Category
  - View count
  - Last updated date
  - Actions (Edit, Delete)

### Creating a New Blog Post

1. **Navigate to New Post Page**
   - Click "New Post" button on dashboard
   - Or navigate to `/admin/blog/new`

2. **Fill in Post Details**

   **Title:**
   - Required field
   - Automatically generates URL-safe slug
   - Example: "Getting Started with React" → `getting-started-with-react`

   **Excerpt:**
   - Short summary (150-200 characters recommended)
   - Displayed in post listings and search results
   - Used as default meta description for SEO

   **Content:**
   - Write in Markdown or MDX format
   - Live preview available in side-by-side view
   - Supports GitHub Flavored Markdown (GFM):
     - Tables
     - Task lists (- [ ] and - [x])
     - Strikethrough (~~text~~)
     - Autolinks
   - Syntax highlighting for code blocks
   - Math equations via remark-math

3. **Add Metadata**

   **Cover Image:**
   - Optional
   - Provide URL to image
   - Recommended size: 1200x630px for optimal social sharing
   - Displayed at top of post and in post listings

   **Category:**
   - Select from existing categories or create new
   - Used for organizing and filtering posts
   - Generates category archive pages

   **Tags:**
   - Add multiple tags (comma-separated or click to add)
   - Used for cross-referencing related content
   - Generates tag archive pages

   **Featured Post:**
   - Checkbox to mark post as featured
   - Featured posts appear in special section on blog homepage

4. **Configure SEO Metadata**

   **Meta Title:**
   - Optional (defaults to post title)
   - 50-60 characters recommended
   - Used for `<title>` tag and OpenGraph

   **Meta Description:**
   - Optional (defaults to excerpt)
   - 150-160 characters recommended
   - Used for meta description and OpenGraph

   **OG Image:**
   - Optional (defaults to cover image)
   - Custom image URL for social media sharing
   - 1200x630px recommended

   **Keywords:**
   - Optional
   - Array of keywords for SEO
   - Used in meta keywords tag

5. **Save and Publish**

   **Auto-Save:**
   - Posts automatically save every 30 seconds
   - Manual save available via "Save Draft" button
   - Auto-save indicator shows last save time

   **Save Draft:**
   - Saves post with status "draft"
   - Not visible on public blog
   - Can continue editing later

   **Publish:**
   - Changes status to "published"
   - Sets `publishedAt` timestamp
   - Immediately visible on public blog
   - Included in sitemap and RSS feed
   - Search engines can index

### Editing an Existing Post

1. **Access Edit Page**
   - Click "Edit" on post in dashboard list
   - Or navigate to `/admin/blog/edit/[post-id]`

2. **Modify Content**
   - All fields editable except slug (change with caution)
   - Changes auto-save every 30 seconds
   - Preview updates in real-time

3. **Change Status**
   - **Unpublish:** "Unpublish" button changes status to draft
   - **Republish:** "Publish" button changes draft back to published
   - **Archive:** "Archive" button soft-deletes post (status: archived)

4. **Delete Post**
   - Click "Delete" button
   - Confirmation dialog appears
   - Performs soft delete (status changes to "archived")
   - Archived posts not visible but preserved in database
   - Can be restored by changing status back to draft/published

### Managing Categories

1. **Navigate to Categories Page**
   - `/admin/blog/categories`

2. **Create Category**
   - Enter category name
   - Enter description
   - Slug auto-generated from name
   - Click "Create Category"

3. **Edit Category**
   - Click edit icon next to category
   - Modify name or description
   - Slug regenerates if name changes
   - Click "Save" to update

4. **Delete Category**
   - Click delete icon next to category
   - Confirmation dialog appears
   - **Warning:** Posts with this category remain but category link breaks
   - Recommended: Reassign posts to different category before deletion

5. **Post Count Updates**
   - Post counts update automatically when posts are published/unpublished
   - Manual recalculation available via `updatePostCounts` mutation

### Bulk Operations

1. **Select Multiple Posts**
   - Checkboxes in post list table
   - Select individual posts or use "Select All"

2. **Available Actions**
   - **Bulk Publish:** Publish all selected draft posts
   - **Bulk Archive:** Archive all selected posts
   - **Bulk Delete:** Delete all selected posts (with confirmation)

3. **Confirmation**
   - Confirmation dialog shows number of affected posts
   - Action applies to all selected posts simultaneously

### Content Workflow

**Recommended Workflow:**

1. **Draft Creation:**
   - Create new post as draft
   - Write content with live preview
   - Add metadata and categories
   - Save frequently (auto-save active)

2. **Review:**
   - Preview post in editor
   - Check formatting and styling
   - Verify links and images
   - Validate SEO metadata

3. **Publish:**
   - Click "Publish" when ready
   - Post immediately visible on public blog
   - Share on social media (use OG preview to verify)

4. **Iterate:**
   - Monitor view counts
   - Edit post as needed (updates reflected via ISR)
   - Unpublish if major revisions needed

5. **Archive:**
   - Archive outdated content
   - Archived posts removed from public view
   - Can be restored if needed

---

## Content Guidelines

### Writing Style

**Tone:**
- Professional yet approachable
- Technical accuracy without unnecessary jargon
- Direct and concise
- Action-oriented (focus on "how" and "why")

**Structure:**
- Clear headings and subheadings (H2, H3 hierarchy)
- Short paragraphs (3-5 sentences)
- Bullet points for lists
- Code examples with syntax highlighting
- Visual diagrams when helpful

**Best Practices:**
- Start with TL;DR or summary
- Use real-world examples
- Provide actionable takeaways
- Link to related content
- Include references and sources

### SEO Best Practices

**Title Optimization:**
- 50-60 characters for optimal display in search results
- Include primary keyword near the beginning
- Make it compelling and click-worthy
- Examples:
  - Good: "TDD in React: A Practical Guide with Examples"
  - Bad: "React Testing"

**Meta Description:**
- 150-160 characters for optimal display
- Include primary and secondary keywords naturally
- Compelling call-to-action
- Summarize the value proposition
- Examples:
  - Good: "Learn test-driven development in React with practical examples, best practices, and real-world patterns. Improve code quality and confidence."
  - Bad: "This post is about React testing"

**Heading Hierarchy:**
- Use H2 for main sections
- Use H3 for subsections
- Use H4 for sub-subsections
- Never skip heading levels
- Include keywords in headings naturally

**Internal Linking:**
- Link to related blog posts
- Link to relevant project pages
- Use descriptive anchor text (not "click here")
- Examples:
  - Good: "See our [complete guide to Next.js performance](/blog/nextjs-performance)"
  - Bad: "Click [here](/blog/nextjs-performance) for more info"

**Image Optimization:**
- Use descriptive alt text with keywords
- Optimize file sizes (use WebP when possible)
- Use 1200x630px for social sharing images
- Include captions when helpful

**Content Structure:**
- Front-load important information
- Use short sentences and paragraphs
- Break up text with headings, lists, images
- Include a clear conclusion with next steps

**Keywords:**
- Research primary and secondary keywords
- Use keywords naturally in:
  - Title
  - Meta description
  - H2 and H3 headings
  - First paragraph
  - Throughout content (avoid keyword stuffing)
  - Image alt text

### Markdown/MDX Guidelines

**Basic Formatting:**

```markdown
# H1 Heading (Page Title - Auto-Generated from Post Title)

## H2 Main Section

### H3 Subsection

#### H4 Sub-Subsection

**Bold text** for emphasis
*Italic text* for subtle emphasis
~~Strikethrough~~ for corrections

[Link text](https://example.com)
![Image alt text](https://example.com/image.jpg)
```

**Code Blocks:**

````markdown
Inline code: `const x = 42;`

Code block with syntax highlighting:
```typescript
interface BlogPost {
  title: string;
  content: string;
}

const post: BlogPost = {
  title: "Example",
  content: "Content here"
};
```
````

**Lists:**

```markdown
Unordered list:
- First item
- Second item
  - Nested item
  - Another nested item

Ordered list:
1. First step
2. Second step
3. Third step

Task list (GFM):
- [x] Completed task
- [ ] Pending task
- [ ] Another pending task
```

**Tables (GFM):**

```markdown
| Feature | Supported | Notes |
|---------|-----------|-------|
| Tables | ✅ | Full GFM support |
| Syntax Highlighting | ✅ | Auto-detected |
| Math | ✅ | Via remark-math |
```

**Blockquotes:**

```markdown
> This is a blockquote.
> It can span multiple lines.
>
> And multiple paragraphs.
```

**Horizontal Rule:**

```markdown
---
```

**Math (via remark-math):**

```markdown
Inline math: $E = mc^2$

Block math:
$$
\int_{a}^{b} f(x) dx
$$
```

### Content Length Guidelines

**Blog Posts:**
- Minimum: 500 words (better SEO)
- Optimal: 1000-2000 words (comprehensive coverage)
- Long-form: 2000+ words (in-depth guides)

**Excerpts:**
- 150-200 characters
- Complete sentences
- Compelling summary

**Meta Descriptions:**
- 150-160 characters (optimal for search results display)
- Include call-to-action
- Primary keyword placement

### Content Security

**Sanitization:**
All user-provided content is sanitized via `sanitizeMarkdown()` function to prevent XSS attacks:

- `<script>` tags removed
- `<iframe>` tags removed
- `<object>` and `<embed>` tags removed
- Event handlers (`onclick`, `onerror`, etc.) removed
- `javascript:` protocol removed from links

**Safe Elements:**
The following HTML elements are preserved for formatting:
- `<strong>`, `<em>`, `<code>`, `<pre>`
- `<a>` (with sanitized `href`)
- `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>`
- `<ul>`, `<ol>`, `<li>`
- `<blockquote>`, `<h1>` through `<h6>`

**Image Security:**
- External images loaded with `loading="lazy"`
- External links open with `target="_blank"` and `rel="noopener noreferrer"`
- No inline JavaScript in `src` attributes

---

## Deployment Instructions

### Environment Variables

Create or update `.env.local` file with the following variables:

```bash
# Convex - Database for blog data storage
# Get your URL from: https://dashboard.convex.dev
# For local development, run: bunx convex dev
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# Convex Deploy Key (Production only)
# Create at: https://dashboard.convex.dev/project/settings#production-deploy-keys
# Not needed for local development
CONVEX_DEPLOY_KEY=prod:secret-name|token

# Admin Authentication
# WARNING: Change these defaults in production!
ADMIN_PASSWORD=your_secure_password_here
ADMIN_SESSION_SECRET=random_64_char_secret_for_session_encryption

# Optional: Admin rate limiting
ADMIN_MAX_REQUESTS_PER_MINUTE=5

# Next.js Configuration
NEXT_PUBLIC_APP_URL=https://phytertek.com
```

**Security Notes:**
- Never commit actual credentials to version control
- Use strong passwords (16+ characters, mixed case, numbers, symbols)
- Generate session secret with: `openssl rand -base64 48`
- Rotate credentials quarterly

### Local Development Setup

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd phyter1-main
   ```

2. **Install Dependencies**
   ```bash
   bun install
   ```

3. **Configure Environment Variables**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your credentials
   ```

4. **Start Convex Development Server**
   ```bash
   bunx convex dev
   ```
   - Opens browser for authentication
   - Creates local Convex deployment
   - Generates `NEXT_PUBLIC_CONVEX_URL` automatically
   - Updates `.env.local` with dev URL

5. **Start Next.js Development Server**
   ```bash
   bun dev
   ```
   - Application available at `http://localhost:3000`
   - Blog at `http://localhost:3000/blog`
   - Admin at `http://localhost:3000/admin/blog`

6. **Verify Setup**
   - Navigate to `/admin/login`
   - Login with `ADMIN_PASSWORD`
   - Create test blog post
   - Verify post appears on `/blog`

### Deploying Convex Schema and Functions

**First-Time Deployment:**

1. **Create Convex Project**
   ```bash
   bunx convex dev
   ```
   - Follow prompts to create project
   - Note the production URL

2. **Deploy to Production**
   ```bash
   bunx convex deploy --prod
   ```
   - Pushes schema to production Convex instance
   - Deploys all query and mutation functions
   - Verifies deployment success

3. **Verify Deployment**
   - Open Convex dashboard: https://dashboard.convex.dev
   - Navigate to your project
   - Check "Data" tab for tables:
     - `blogPosts`
     - `blogCategories`
     - `blogTags`
   - Check "Functions" tab for deployed functions
   - Test queries in dashboard console

**Subsequent Deployments:**

```bash
bunx convex deploy --prod
```

**Environment-Specific Deployments:**

```bash
# Development
bunx convex deploy --dev

# Staging (if configured)
bunx convex deploy --staging

# Production
bunx convex deploy --prod
```

### Vercel Deployment

**Prerequisites:**
- Vercel account
- GitHub repository
- Convex production deployment

**Initial Setup:**

1. **Connect Repository**
   - Navigate to https://vercel.com
   - Click "New Project"
   - Import Git repository
   - Select repository

2. **Configure Build Settings**
   - Framework Preset: Next.js
   - Build Command: `bun run build`
   - Output Directory: `.next`
   - Install Command: `bun install`

3. **Environment Variables**
   Add the following in Vercel project settings:
   ```
   NEXT_PUBLIC_CONVEX_URL=https://your-prod-deployment.convex.cloud
   ADMIN_PASSWORD=<production-password>
   ADMIN_SESSION_SECRET=<production-secret>
   ADMIN_MAX_REQUESTS_PER_MINUTE=5
   NEXT_PUBLIC_APP_URL=https://phytertek.com
   ```

4. **Deploy**
   - Click "Deploy"
   - Vercel builds and deploys automatically
   - Monitor build logs for errors

5. **Verify Deployment**
   - Visit deployed URL
   - Navigate to `/blog`
   - Login to `/admin/login`
   - Create test post
   - Verify SEO metadata with tools:
     - https://cards-dev.twitter.com/validator
     - https://developers.facebook.com/tools/debug/
     - https://search.google.com/test/rich-results

**Continuous Deployment:**

- Push to `main` branch triggers automatic deployment
- Pull requests create preview deployments
- Environment variables persist across deployments

### Custom Domain Setup

1. **Add Domain in Vercel**
   - Project Settings → Domains
   - Add domain: `phytertek.com`
   - Add `www.phytertek.com` (optional)

2. **Configure DNS**
   Update DNS records with your provider:
   ```
   Type  Name  Value
   A     @     76.76.21.21
   CNAME www   cname.vercel-dns.com
   ```

3. **SSL Certificate**
   - Vercel automatically provisions SSL
   - Wait for DNS propagation (up to 48 hours)
   - Verify HTTPS works

4. **Canonical URLs**
   - Update `NEXT_PUBLIC_APP_URL` to production domain
   - Redeploy to apply changes
   - Canonical URLs automatically update

### Post-Deployment Verification

**Checklist:**

- [ ] Blog listing page loads (`/blog`)
- [ ] Individual posts accessible (`/blog/[slug]`)
- [ ] Category pages work (`/blog/category/[slug]`)
- [ ] Tag pages work (`/blog/tag/[slug]`)
- [ ] RSS feed accessible (`/blog/rss.xml`)
- [ ] Sitemap includes blog posts (`/sitemap.xml`)
- [ ] Admin login works (`/admin/login`)
- [ ] Admin dashboard accessible (`/admin/blog`)
- [ ] Post creation/editing functional
- [ ] Category management works
- [ ] SEO metadata validates:
  - Twitter Card Validator
  - Facebook Sharing Debugger
  - Google Rich Results Test
- [ ] Lighthouse score 95+ (Performance, Accessibility, Best Practices, SEO)
- [ ] No console errors
- [ ] ISR revalidation working (check via response headers)

**Performance Testing:**

```bash
# Run Lighthouse audit
bunx lighthouse https://phytertek.com/blog --view

# Check ISR headers
curl -I https://phytertek.com/blog
# Should include: Cache-Control: s-maxage=60, stale-while-revalidate
```

### Rollback Procedure

**If Deployment Issues Occur:**

1. **Rollback Vercel Deployment**
   - Vercel Dashboard → Deployments
   - Find last working deployment
   - Click "..." → "Promote to Production"

2. **Rollback Convex Schema** (if needed)
   - Convex doesn't support automatic rollback
   - Restore from backup if available
   - Or manually revert schema changes via dashboard

3. **Verify Rollback**
   - Check site functionality
   - Test critical paths
   - Monitor error logs

---

## API Documentation

### Convex Query Functions (T006)

All query functions are located in `convex/blog.ts` and exposed via `api.blog.*`.

#### `listPosts`

List blog posts with optional filtering and pagination.

**Arguments:**
```typescript
{
  status?: "draft" | "published" | "archived",
  category?: string,  // Category ID
  limit?: number,     // Default: 20
  offset?: number     // Default: 0
}
```

**Returns:**
```typescript
{
  posts: BlogPost[],
  total: number,
  hasMore: boolean
}
```

**Example:**
```typescript
const result = await ctx.db.query(api.blog.listPosts, {
  status: "published",
  limit: 20,
  offset: 0
});
```

**Notes:**
- Posts sorted by `publishedAt` (desc) for published, `updatedAt` (desc) for drafts
- Uses `by_status` index for efficient filtering
- Pagination applied in-memory (consider cursor-based for large datasets)

#### `getPostBySlug`

Retrieve a single blog post by its slug.

**Arguments:**
```typescript
{
  slug: string
}
```

**Returns:**
```typescript
BlogPost | null
```

**Example:**
```typescript
const post = await ctx.db.query(api.blog.getPostBySlug, {
  slug: "getting-started-with-react"
});
```

**Notes:**
- Returns `null` if post not found
- Uses `by_slug` index for O(1) lookup
- Does NOT increment view count (use `incrementViewCount` separately)

#### `getPostById`

Retrieve a single blog post by its Convex ID.

**Arguments:**
```typescript
{
  id: Id<"blogPosts">
}
```

**Returns:**
```typescript
BlogPost | null
```

**Example:**
```typescript
const post = await ctx.db.query(api.blog.getPostById, {
  id: "j97abc123..."
});
```

**Notes:**
- Used for admin edit pages
- Direct document lookup (very efficient)

#### `getFeaturedPosts`

Get all featured published posts.

**Arguments:** None

**Returns:**
```typescript
BlogPost[]
```

**Example:**
```typescript
const featured = await ctx.db.query(api.blog.getFeaturedPosts);
```

**Notes:**
- Only returns published posts with `featured: true`
- Sorted by `publishedAt` (desc)
- Uses `by_featured` compound index

#### `searchPosts`

Full-text search across blog post titles.

**Arguments:**
```typescript
{
  searchQuery: string,
  status?: "draft" | "published" | "archived"  // Default: "published"
}
```

**Returns:**
```typescript
BlogPost[]
```

**Example:**
```typescript
const results = await ctx.db.query(api.blog.searchPosts, {
  searchQuery: "react typescript",
  status: "published"
});
```

**Notes:**
- Uses `search_posts` index for efficient full-text search
- Searches `title` field only (content search not currently supported)
- Results ranked by relevance

#### `getPostsByTag`

Get all posts with a specific tag.

**Arguments:**
```typescript
{
  tag: string,
  status?: "draft" | "published" | "archived"  // Default: "published"
}
```

**Returns:**
```typescript
BlogPost[]
```

**Example:**
```typescript
const posts = await ctx.db.query(api.blog.getPostsByTag, {
  tag: "typescript",
  status: "published"
});
```

**Notes:**
- Filters posts where `tags` array includes specified tag
- Sorted by `publishedAt` (desc) for published posts
- Case-sensitive tag matching

#### `getCategories`

Get all blog categories with post counts.

**Arguments:** None

**Returns:**
```typescript
BlogCategory[]
```

**Example:**
```typescript
const categories = await ctx.db.query(api.blog.getCategories);
```

**Notes:**
- Returns all categories
- Sorted by `postCount` (desc)
- Post counts updated via `updatePostCounts` mutation

#### `getTags`

Get all blog tags with post counts.

**Arguments:** None

**Returns:**
```typescript
BlogTag[]
```

**Example:**
```typescript
const tags = await ctx.db.query(api.blog.getTags);
```

**Notes:**
- Returns all tags
- Sorted by `postCount` (desc)
- Post counts updated via `updatePostCounts` mutation

#### `validateSlugUnique`

Check if a slug is available (not in use by another post).

**Arguments:**
```typescript
{
  slug: string,
  excludePostId?: Id<"blogPosts">
}
```

**Returns:**
```typescript
boolean  // true if available, false if in use
```

**Example:**
```typescript
const isAvailable = await ctx.db.query(api.blog.validateSlugUnique, {
  slug: "my-new-post",
  excludePostId: currentPostId  // Exclude current post when editing
});
```

**Notes:**
- Used for client-side validation during post creation/editing
- `excludePostId` prevents false positives when editing existing post

### Convex Mutation Functions (T007, T008)

#### `createPost`

Create a new blog post as a draft.

**Arguments:**
```typescript
{
  title: string,
  slug: string,
  excerpt: string,
  content: string,
  coverImageUrl?: string,
  categoryId?: Id<"blogCategories">,
  tags: string[],
  author: string,
  readingTimeMinutes: number,
  featured?: boolean,
  seoMetadata: {
    metaTitle?: string,
    metaDescription?: string,
    ogImage?: string,
    keywords?: string[]
  }
}
```

**Returns:**
```typescript
Id<"blogPosts">  // ID of created post
```

**Example:**
```typescript
const postId = await ctx.db.mutation(api.blog.createPost, {
  title: "Getting Started with React",
  slug: "getting-started-with-react",
  excerpt: "Learn React basics in this comprehensive guide.",
  content: "# Introduction\n\nReact is...",
  author: "Ryan Lowe",
  readingTimeMinutes: 5,
  tags: ["react", "javascript"],
  seoMetadata: {}
});
```

**Notes:**
- Automatically sets `status: "draft"`
- Validates slug uniqueness (throws error if duplicate)
- Sets `viewCount: 0` and timestamps
- `publishedAt` is `undefined` for drafts

#### `updatePost`

Update an existing blog post.

**Arguments:**
```typescript
{
  id: Id<"blogPosts">,
  title?: string,
  slug?: string,
  excerpt?: string,
  content?: string,
  coverImageUrl?: string,
  categoryId?: Id<"blogCategories">,
  tags?: string[],
  author?: string,
  readingTimeMinutes?: number,
  featured?: boolean,
  seoMetadata?: {
    metaTitle?: string,
    metaDescription?: string,
    ogImage?: string,
    keywords?: string[]
  }
}
```

**Returns:**
```typescript
Id<"blogPosts">  // ID of updated post
```

**Example:**
```typescript
await ctx.db.mutation(api.blog.updatePost, {
  id: postId,
  title: "Updated Title",
  content: "Updated content..."
});
```

**Notes:**
- Partial updates allowed (only provide fields to change)
- Validates slug uniqueness if slug is updated
- Automatically updates `updatedAt` timestamp
- Cannot change `status` (use `publishPost`/`unpublishPost` instead)

#### `publishPost`

Publish a draft post.

**Arguments:**
```typescript
{
  id: Id<"blogPosts">
}
```

**Returns:**
```typescript
Id<"blogPosts">
```

**Example:**
```typescript
await ctx.db.mutation(api.blog.publishPost, { id: postId });
```

**Notes:**
- Changes `status` from "draft" to "published"
- Sets `publishedAt` to current timestamp (preserves original if republishing)
- Updates `updatedAt`
- Throws error if post is already published or archived

#### `unpublishPost`

Unpublish a published post (revert to draft).

**Arguments:**
```typescript
{
  id: Id<"blogPosts">
}
```

**Returns:**
```typescript
Id<"blogPosts">
```

**Example:**
```typescript
await ctx.db.mutation(api.blog.unpublishPost, { id: postId });
```

**Notes:**
- Changes `status` from "published" to "draft"
- Preserves original `publishedAt` timestamp
- Updates `updatedAt`
- Throws error if post is not published

#### `deletePost`

Soft delete a post (archive).

**Arguments:**
```typescript
{
  id: Id<"blogPosts">
}
```

**Returns:**
```typescript
Id<"blogPosts">
```

**Example:**
```typescript
await ctx.db.mutation(api.blog.deletePost, { id: postId });
```

**Notes:**
- Changes `status` to "archived" (soft delete)
- Post preserved in database but not visible
- Can be restored by changing status back to "draft" or "published"
- Updates `updatedAt`

#### `incrementViewCount`

Atomically increment view count for a post.

**Arguments:**
```typescript
{
  id: Id<"blogPosts">
}
```

**Returns:**
```typescript
number  // New view count
```

**Example:**
```typescript
const newCount = await ctx.db.mutation(api.blog.incrementViewCount, {
  id: postId
});
```

**Notes:**
- Called when user views a post page
- Atomic operation (safe for concurrent requests)
- Returns updated view count

#### `createCategory`

Create a new blog category.

**Arguments:**
```typescript
{
  name: string,
  description: string
}
```

**Returns:**
```typescript
Id<"blogCategories">
```

**Example:**
```typescript
const categoryId = await ctx.db.mutation(api.blog.createCategory, {
  name: "Technology",
  description: "Posts about technology and software development"
});
```

**Notes:**
- Auto-generates slug from name
- Validates slug uniqueness
- Initializes `postCount: 0`
- Sets timestamps

#### `updateCategory`

Update an existing category.

**Arguments:**
```typescript
{
  id: Id<"blogCategories">,
  name?: string,
  description?: string
}
```

**Returns:**
```typescript
void
```

**Example:**
```typescript
await ctx.db.mutation(api.blog.updateCategory, {
  id: categoryId,
  name: "Updated Name"
});
```

**Notes:**
- Regenerates slug if name changes
- Validates new slug uniqueness
- Updates `updatedAt` timestamp

#### `deleteCategory`

Delete a category.

**Arguments:**
```typescript
{
  id: Id<"blogCategories">
}
```

**Returns:**
```typescript
void
```

**Example:**
```typescript
await ctx.db.mutation(api.blog.deleteCategory, { id: categoryId });
```

**Notes:**
- Hard delete (category removed from database)
- Posts referencing this category remain but link breaks
- Recommended: Reassign posts to different category before deletion

#### `createTag`

Create a new blog tag.

**Arguments:**
```typescript
{
  name: string
}
```

**Returns:**
```typescript
Id<"blogTags">
```

**Example:**
```typescript
const tagId = await ctx.db.mutation(api.blog.createTag, {
  name: "TypeScript"
});
```

**Notes:**
- Auto-generates slug from name
- Validates slug uniqueness
- Initializes `postCount: 0`

#### `deleteTag`

Delete a tag.

**Arguments:**
```typescript
{
  id: Id<"blogTags">
}
```

**Returns:**
```typescript
void
```

**Example:**
```typescript
await ctx.db.mutation(api.blog.deleteTag, { id: tagId });
```

**Notes:**
- Hard delete (tag removed from database)
- Posts with this tag remain but tag reference breaks
- Recommended: Remove tag from posts before deletion

#### `updatePostCounts`

Recalculate post counts for all categories and tags.

**Arguments:** None

**Returns:**
```typescript
void
```

**Example:**
```typescript
await ctx.db.mutation(api.blog.updatePostCounts);
```

**Notes:**
- Counts all published posts per category/tag
- Updates `postCount` field for all categories and tags
- Should be called periodically or after bulk operations
- Relatively expensive operation (iterates all posts)

### Next.js API Routes

The blog system uses Convex for backend operations, so traditional Next.js API routes are not needed for blog functionality. Admin operations (login, session management) use separate admin API routes documented in the Admin section of CLAUDE.md.

---

## Component Documentation

### Public Blog Components

#### `BlogCard`

Displays a blog post preview card in listing pages.

**Location:** `src/components/blog/BlogCard.tsx`

**Props:**
```typescript
{
  post: BlogPost,
  variant?: "default" | "featured",
  className?: string,
  variants?: Variants  // Framer Motion variants
}
```

**Features:**
- Cover image display (or placeholder if none)
- Post title and excerpt
- Category badge
- Published date and reading time
- Hover effects and animations
- Responsive design
- Featured variant with enhanced styling

**Usage:**
```tsx
<BlogCard
  post={post}
  variant="featured"
  variants={itemVariants}
/>
```

#### `BlogContent`

Renders MDX/Markdown content with full GFM support.

**Location:** `src/components/blog/BlogContent.tsx`

**Props:**
```typescript
{
  content: string,
  className?: string
}
```

**Features:**
- GitHub Flavored Markdown (tables, task lists, strikethrough, autolinks)
- Syntax highlighting for code blocks (via rehype-highlight)
- Auto-linked headings with anchor links (via rehype-slug)
- Math rendering (via remark-math)
- Responsive images with lazy loading
- Custom styling for all markdown elements
- Dark mode support

**Usage:**
```tsx
<BlogContent content={post.content} />
```

**Supported Markdown Elements:**
- Headings (H1-H6) with auto-generated IDs
- Paragraphs with relaxed line height
- Links (external links open in new tab)
- Images (lazy loading, responsive)
- Code (inline and blocks with syntax highlighting)
- Lists (ordered, unordered, task lists)
- Tables (responsive with scroll)
- Blockquotes
- Horizontal rules

#### `BlogHeader`

Displays blog post header with title, metadata, and cover image.

**Location:** `src/components/blog/BlogHeader.tsx`

**Props:**
```typescript
{
  post: BlogPost,
  className?: string
}
```

**Features:**
- Post title (H1)
- Author and published date
- Reading time estimate
- Category and tags display
- Cover image with proper sizing
- Responsive layout
- Semantic HTML (article structure)

**Usage:**
```tsx
<BlogHeader post={post} />
```

#### `BlogSidebar`

Sidebar component with categories, tags, and recent posts.

**Location:** `src/components/blog/BlogSidebar.tsx`

**Props:**
```typescript
{
  className?: string
}
```

**Features:**
- Categories list with post counts
- Tag cloud with clickable tags
- Recent posts list (5 most recent)
- RSS feed link
- Responsive (collapses on mobile)
- Navigation to category/tag archive pages

**Usage:**
```tsx
<BlogSidebar className="lg:w-80" />
```

**Data Loading:**
Uses Convex `useQuery` hooks:
- `api.blog.getCategories`
- `api.blog.getTags`
- `api.blog.listPosts` (recent posts)

#### `BlogSearch`

Live search component with debouncing and keyboard navigation.

**Location:** `src/components/blog/BlogSearch.tsx`

**Props:**
```typescript
{
  className?: string
}
```

**Features:**
- Search input with debouncing (300ms)
- Live search results dropdown
- Keyboard navigation (arrow keys, enter, escape)
- Click result navigates to post
- Loading state during search
- Highlights search terms in results
- Accessible (ARIA labels)

**Usage:**
```tsx
<BlogSearch className="max-w-2xl" />
```

**Data Loading:**
Uses Convex `useQuery` with debounced search query.

#### `ShareButtons`

Social media sharing buttons for blog posts.

**Location:** `src/components/blog/ShareButtons.tsx`

**Props:**
```typescript
{
  post: BlogPost,
  className?: string
}
```

**Features:**
- Twitter share button
- LinkedIn share button
- Copy link button (uses Clipboard API)
- Email share button
- Proper URL encoding for all platforms
- Copy confirmation feedback (toast/visual)

**Usage:**
```tsx
<ShareButtons post={post} />
```

**Share URLs:**
- Twitter: `https://twitter.com/intent/tweet?text={title}&url={url}`
- LinkedIn: `https://www.linkedin.com/sharing/share-offsite/?url={url}`
- Email: `mailto:?subject={title}&body={url}`

#### `TableOfContents`

Auto-generated table of contents from post headings.

**Location:** `src/components/blog/TableOfContents.tsx`

**Props:**
```typescript
{
  content: string,
  className?: string
}
```

**Features:**
- Auto-generates TOC from H2/H3 headings in content
- Clickable links to sections
- Active section highlighting on scroll
- Sticky positioning on desktop
- Hidden on mobile or short posts
- Smooth scroll to sections
- Indentation for heading hierarchy

**Usage:**
```tsx
<TableOfContents content={post.content} />
```

**Implementation:**
Parses markdown content, extracts headings with IDs (via rehype-slug), builds hierarchical TOC structure, tracks active section via Intersection Observer.

### Admin Blog Components

#### `BlogPostEditor`

Rich text editor with MDX support and live preview.

**Location:** `src/components/admin/blog/BlogPostEditor.tsx`

**Props:**
```typescript
{
  initialContent?: string,
  onChange: (content: string) => void,
  className?: string
}
```

**Features:**
- Tiptap rich text editor
- MDX support
- Live preview panel (side-by-side)
- Auto-save every 30 seconds
- Character/word count display
- Markdown toolbar (bold, italic, code, headings, lists, links)
- "use client" directive (client-side component)

**Usage:**
```tsx
<BlogPostEditor
  initialContent={post?.content}
  onChange={(content) => setContent(content)}
/>
```

#### `BlogPostMetadata`

Metadata editor for SEO, categories, and tags.

**Location:** `src/components/admin/blog/BlogPostMetadata.tsx`

**Props:**
```typescript
{
  post?: BlogPost,
  categories: BlogCategory[],
  tags: BlogTag[],
  onChange: (metadata: Partial<BlogPost>) => void,
  className?: string
}
```

**Features:**
- SEO metadata fields (metaTitle, metaDescription, ogImage)
- Cover image URL input with preview
- Category dropdown (with create option)
- Tag input with autocomplete and creation
- Slug field with auto-generation from title
- Featured post checkbox
- All fields properly controlled

**Usage:**
```tsx
<BlogPostMetadata
  post={post}
  categories={categories}
  tags={tags}
  onChange={(metadata) => updatePost(metadata)}
/>
```

#### `BlogPostList`

Table view of all blog posts with filtering and bulk actions.

**Location:** `src/components/admin/blog/BlogPostList.tsx`

**Props:**
```typescript
{
  posts: BlogPost[],
  categories: BlogCategory[],
  onEdit: (post: BlogPost) => void,
  onDelete: (post: BlogPost) => void,
  onBulkPublish: (posts: BlogPost[]) => void,
  onBulkArchive: (posts: BlogPost[]) => void,
  onBulkDelete: (posts: BlogPost[]) => void,
  className?: string
}
```

**Features:**
- Table displaying posts (title, status, category, views, updated date)
- Filter by status dropdown (All, Draft, Published, Archived)
- Filter by category dropdown
- Search by title
- Pagination controls (20 posts per page)
- Edit/delete actions per row
- Bulk selection with checkboxes
- Bulk actions (publish, archive, delete)

**Usage:**
```tsx
<BlogPostList
  posts={posts}
  categories={categories}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onBulkPublish={handleBulkPublish}
  onBulkArchive={handleBulkArchive}
  onBulkDelete={handleBulkDelete}
/>
```

#### `CategoryManager`

Category management component with CRUD operations.

**Location:** `src/components/admin/blog/CategoryManager.tsx`

**Props:**
```typescript
{
  className?: string
}
```

**Features:**
- List all categories with post counts
- Create new category form
- Edit category inline
- Delete category with confirmation
- Reorder categories (up/down buttons)
- Shows post count per category
- Real-time updates via Convex

**Usage:**
```tsx
<CategoryManager />
```

**Data Loading:**
Uses Convex `useQuery(api.blog.getCategories)` and mutation hooks.

#### `ImageUploader`

Image upload component with drag-and-drop and preview.

**Location:** `src/components/admin/blog/ImageUploader.tsx`

**Props:**
```typescript
{
  onUpload: (url: string) => void,
  currentImage?: string,
  className?: string
}
```

**Features:**
- File upload with drag-and-drop
- URL input option
- Image preview display
- Upload progress indicator
- Image validation (size: max 5MB, format: jpg/png/gif/webp)
- Integration with upload service (configured via env variable)
- Error handling for failed uploads

**Usage:**
```tsx
<ImageUploader
  onUpload={(url) => setCoverImage(url)}
  currentImage={post?.coverImage}
/>
```

**Note:** Currently supports URL input. File upload integration requires configuring `UPLOAD_SERVICE_URL` environment variable and implementing upload API route.

#### `MarkdownPreview`

Preview component for markdown/MDX content with styling.

**Location:** `src/components/admin/blog/MarkdownPreview.tsx`

**Props:**
```typescript
{
  content: string,
  className?: string
}
```

**Features:**
- Renders MDX content with proper styling
- Syntax highlighting for code blocks
- Auto-linked headings
- Table of contents generation (optional)
- Responsive layout
- Dark mode support
- Matches public blog post styling exactly

**Usage:**
```tsx
<MarkdownPreview content={content} />
```

**Implementation:**
Uses same rendering logic as `BlogContent` component to ensure preview matches final output.

---

## Troubleshooting

### Common Issues

#### Posts Not Appearing on Public Blog

**Symptoms:**
- Post created in admin but not visible on `/blog`
- Post shows in admin dashboard but not public listing

**Diagnosis:**
1. Check post status: Must be "published" to appear
2. Check `publishedAt` timestamp: Should be set when published
3. Check Convex query filters: Ensure `status: "published"` filter is applied

**Solution:**
```typescript
// Verify post status
const post = await ctx.db.query(api.blog.getPostById, { id });
console.log(post.status, post.publishedAt);

// If status is "draft", publish it
await ctx.db.mutation(api.blog.publishPost, { id });
```

#### Slug Conflicts

**Symptoms:**
- Error: "Slug 'x' is already in use" when creating/editing post
- Unable to save post with desired slug

**Diagnosis:**
1. Check for duplicate slugs in database
2. Check if editing post but slug unchanged (should be allowed)

**Solution:**
```typescript
// Query for existing post with slug
const existing = await ctx.db.query(api.blog.listPosts).then(
  result => result.posts.find(p => p.slug === targetSlug)
);

// If found, either:
// 1. Change slug to something unique
// 2. Delete/archive the existing post
// 3. If editing same post, ensure excludePostId is passed
```

#### MDX Rendering Issues

**Symptoms:**
- Content not rendering correctly
- Syntax highlighting not working
- Tables or task lists not displaying

**Diagnosis:**
1. Check MDX syntax in content
2. Verify rehype/remark plugins are loaded
3. Check for JavaScript errors in console
4. Verify GFM features are properly formatted

**Solution:**

**Check plugin configuration in `next.config.ts`:**
```typescript
const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: ["remark-gfm", "remark-math"],
    rehypePlugins: ["rehype-highlight", "rehype-slug", "rehype-autolink-headings"],
  },
});
```

**Verify content formatting:**
```markdown
# Correct table syntax (GFM)
| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |

# Correct task list syntax
- [x] Completed task
- [ ] Pending task

# Correct code block syntax
```typescript
const x = 42;
```
```

#### View Count Not Incrementing

**Symptoms:**
- View count stays at 0 after viewing post
- View count doesn't increase on page visits

**Diagnosis:**
1. Check if `incrementViewCount` mutation is called
2. Verify mutation has correct post ID
3. Check for JavaScript errors preventing mutation

**Solution:**

**Ensure mutation is called on post page load:**
```typescript
// In BlogPostClient component
useEffect(() => {
  if (post?._id) {
    // Increment view count when post loads
    ctx.db.mutation(api.blog.incrementViewCount, {
      id: post._id
    }).catch(err => console.error('Failed to increment view count:', err));
  }
}, [post?._id]);
```

#### SEO Metadata Not Appearing

**Symptoms:**
- Social media preview shows default/incorrect metadata
- Search results show wrong title/description
- OpenGraph tags missing in page source

**Diagnosis:**
1. Check if `generateMetadata` function is implemented
2. Verify metadata is returned correctly
3. Inspect page source for meta tags
4. Test with social media card validators

**Solution:**

**Verify metadata generation:**
```typescript
// In app/blog/[slug]/page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const { slug } = await params;
  const post = await preloadQuery(api.blog.getPostBySlug, { slug });

  if (!post) {
    return { title: "Post Not Found" };
  }

  return generateBlogMetadata(post);  // Uses blog-metadata.ts
}
```

**Test metadata:**
- View page source: `view-source:https://phytertek.com/blog/[slug]`
- Twitter Card Validator: https://cards-dev.twitter.com/validator
- Facebook Debugger: https://developers.facebook.com/tools/debug/
- LinkedIn Inspector: https://www.linkedin.com/post-inspector/

#### ISR Not Working

**Symptoms:**
- Content updates not appearing on live site
- Old content still showing after publishing new post
- No cache headers in response

**Diagnosis:**
1. Check `revalidate` export in page component
2. Verify Vercel deployment settings
3. Check response headers for cache-control
4. Confirm ISR is enabled in Next.js config

**Solution:**

**Add revalidate export to pages:**
```typescript
// Blog listing page
export const revalidate = 60;  // 1 minute

// Individual post page
export const revalidate = 3600;  // 1 hour
```

**Verify cache headers:**
```bash
curl -I https://phytertek.com/blog
# Should include: Cache-Control: s-maxage=60, stale-while-revalidate
```

**Force revalidation:**
- Redeploy application to clear cache
- Use Vercel's Purge Cache feature
- Wait for revalidation period to pass

#### Search Not Finding Posts

**Symptoms:**
- Search query returns no results
- Posts not appearing in search despite matching query

**Diagnosis:**
1. Verify search index exists in Convex schema
2. Check if search is querying correct field
3. Verify post status filter (only searches published by default)
4. Check search query syntax

**Solution:**

**Verify search index in schema:**
```typescript
// convex/schema.ts
searchIndex("search_posts", {
  searchField: "title",
  filterFields: ["status", "categoryId"],
})
```

**Test search query:**
```typescript
const results = await ctx.db.query(api.blog.searchPosts, {
  searchQuery: "react",
  status: "published"  // Default filter
});
console.log(results.length, 'results found');
```

**Note:** Current search only indexes `title` field. To search content, add content to `searchField` or implement custom search logic.

#### Admin Auto-Save Not Working

**Symptoms:**
- Changes lost when navigating away
- No auto-save indicator visible
- Manual save works but auto-save doesn't

**Diagnosis:**
1. Check auto-save interval (default: 30 seconds)
2. Verify no JavaScript errors blocking auto-save
3. Check network tab for save requests
4. Verify Convex mutation is being called

**Solution:**

**Verify auto-save implementation:**
```typescript
// In BlogPostEditor component
useEffect(() => {
  const autoSaveTimer = setInterval(() => {
    if (hasChanges) {
      handleSave();  // Call save mutation
      setLastSaved(new Date());
    }
  }, 30000);  // 30 seconds

  return () => clearInterval(autoSaveTimer);
}, [hasChanges, handleSave]);
```

**Debug auto-save:**
```typescript
// Add logging to save handler
const handleSave = async () => {
  console.log('Auto-save triggered');
  try {
    await ctx.db.mutation(api.blog.updatePost, { id, content });
    console.log('Auto-save successful');
  } catch (error) {
    console.error('Auto-save failed:', error);
  }
};
```

### Performance Issues

#### Slow Page Load Times

**Diagnosis:**
1. Run Lighthouse audit
2. Check for large images without optimization
3. Verify ISR/SSG is working
4. Check database query performance
5. Analyze bundle size

**Solution:**

**Optimize images:**
- Use Next.js Image component: `<Image src={...} width={1200} height={630} />`
- Compress images before upload
- Use WebP format when possible
- Implement lazy loading: `loading="lazy"`

**Optimize database queries:**
```typescript
// Use indexes for efficient queries
.withIndex("by_status", q => q.eq("status", "published"))

// Limit results for pagination
{ limit: 20, offset: 0 }

// Avoid loading all posts at once
```

**Reduce bundle size:**
```bash
# Analyze bundle
bunx @next/bundle-analyzer

# Remove unused dependencies
bun remove <unused-package>

# Use dynamic imports for large components
const LargeComponent = dynamic(() => import('./LargeComponent'));
```

#### High Memory Usage

**Diagnosis:**
1. Check for memory leaks in components
2. Verify cleanup in useEffect hooks
3. Check for large data structures in state
4. Monitor memory usage over time

**Solution:**

**Cleanup event listeners and timers:**
```typescript
useEffect(() => {
  const timer = setInterval(() => { /* ... */ }, 1000);

  return () => clearInterval(timer);  // Cleanup
}, []);
```

**Paginate large data sets:**
```typescript
// Instead of loading all posts
const allPosts = await ctx.db.query(api.blog.listPosts);

// Load page at a time
const page = await ctx.db.query(api.blog.listPosts, {
  limit: 20,
  offset: (page - 1) * 20
});
```

### Deployment Issues

#### Convex Deployment Failures

**Symptoms:**
- `bunx convex deploy` fails with errors
- Schema validation errors
- Function deployment errors

**Diagnosis:**
1. Check schema syntax errors
2. Verify all function types are correct
3. Check for breaking schema changes
4. Review deployment logs

**Solution:**

**Validate schema locally:**
```bash
bunx convex dev
# Fix any schema errors that appear
```

**Check for breaking changes:**
- Adding required fields to existing tables (add as optional first)
- Changing field types (migrate data first)
- Removing indexes still in use

**Rollback if needed:**
```bash
# Revert to previous schema
git checkout <previous-commit> convex/schema.ts

# Redeploy
bunx convex deploy --prod
```

#### Vercel Build Failures

**Symptoms:**
- Build fails on Vercel but works locally
- Type errors in production build
- Missing dependencies

**Diagnosis:**
1. Review build logs in Vercel dashboard
2. Check for environment variable issues
3. Verify all dependencies installed
4. Check Next.js version compatibility

**Solution:**

**Match local and production environments:**
```bash
# Use same Node version as Vercel
nvm use 20  # Or version specified in .nvmrc

# Clean build locally
rm -rf .next
bun run build
```

**Fix type errors:**
```typescript
// Add proper types to resolve build errors
const post: BlogPost | null = await query(...);

// Add type guards
if (!post) return null;
```

**Check dependencies:**
```bash
# Ensure all deps are in package.json (not just devDependencies)
bun add <package>  # Not bun add -d
```

### Error Messages

#### "Slug is already in use"

**Cause:** Attempting to create/update post with slug that already exists.

**Solution:**
1. Check existing posts for slug conflicts
2. Modify slug to be unique
3. If editing, ensure `excludePostId` is passed to validation

#### "Post not found"

**Cause:** Attempting to access post that doesn't exist or was deleted.

**Solution:**
1. Verify post ID is correct
2. Check if post was archived/deleted
3. Use `getPostById` to confirm post exists

#### "Cannot publish archived post"

**Cause:** Attempting to publish a post with status "archived".

**Solution:**
1. Change status to "draft" first
2. Then publish

```typescript
await ctx.db.mutation(api.blog.updatePost, {
  id,
  status: "draft"
});
await ctx.db.mutation(api.blog.publishPost, { id });
```

#### "Invalid slug format"

**Cause:** Slug contains invalid characters or format.

**Solution:**
Use `generateSlug()` utility to create valid slug:
```typescript
import { generateSlug } from '@/lib/blog-utils';

const slug = generateSlug(title);
// "Getting Started!" -> "getting-started"
```

Valid slug format:
- Lowercase letters only
- Numbers allowed
- Hyphens allowed (not at start/end, no consecutive hyphens)
- Max 200 characters

### Getting Help

**Resources:**
- Project documentation: `/docs` directory
- Convex documentation: https://docs.convex.dev
- Next.js documentation: https://nextjs.org/docs
- MDX documentation: https://mdxjs.com

**Support Channels:**
- GitHub Issues (for bugs and feature requests)
- Project README.md (setup and quick start)
- CLAUDE.md (development guidelines and conventions)

**Debugging Tools:**
- Browser DevTools (Network, Console, Performance tabs)
- React DevTools browser extension
- Convex Dashboard for database inspection
- Lighthouse for performance audits
- SEO validators for metadata testing

---

## Future Enhancements

### Planned Features

#### Content Management Enhancements

**1. Draft Preview Links**
- Generate shareable preview URLs for draft posts
- Allow non-admin users to view drafts via unique token
- Time-limited preview access
- Useful for getting feedback before publishing

**2. Post Scheduling**
- Schedule posts for future publication
- Automatic publishing at specified time
- Cron job or scheduled Convex function
- Draft → Scheduled → Published workflow

**3. Content Versioning**
- Save post history on each edit
- Compare versions side-by-side
- Rollback to previous versions
- Audit trail for all changes

**4. Multi-Author Support**
- Multiple admin users with different permissions
- Author profiles with bio and avatar
- Author-specific post filtering
- Byline and author pages

**5. Comment System**
- Reader comments on posts
- Moderation queue
- Threaded discussions
- Spam filtering
- Email notifications

#### SEO and Discovery

**6. Advanced SEO Features**
- Auto-generate meta descriptions from content
- SEO score/analysis per post
- Keyword density tracking
- Internal link suggestions
- Broken link detection

**7. Content Search Enhancements**
- Full-text search across content (not just titles)
- Search result highlighting
- Advanced filtering (date range, tags, categories)
- Search analytics
- Popular searches tracking

**8. Related Posts Algorithm**
- ML-based content similarity
- Tag/category based recommendations
- "You might also like" section
- Reading history tracking
- Personalized recommendations

**9. Schema.org Enhancements**
- BlogPosting schema
- Author schema (Person)
- Organization schema
- Breadcrumb schema
- FAQ schema for Q&A posts

#### Performance and Analytics

**10. Analytics Integration**
- Post view tracking (beyond basic count)
- Reader engagement metrics
- Time on page
- Scroll depth tracking
- Popular content reports
- Traffic sources

**11. Image Optimization**
- Automatic image resizing
- WebP conversion
- CDN integration
- Lazy loading
- Responsive images

**12. Content Delivery Network (CDN)**
- Static asset caching
- Global edge distribution
- Faster page loads worldwide
- Reduced server load

**13. Advanced Caching Strategies**
- Edge caching for common queries
- Stale-while-revalidate optimization
- Cache warming for popular content
- Selective cache purging

#### Content Features

**14. Series/Collection Support**
- Group related posts into series
- Automatic "Next in series" links
- Series landing pages
- Progress tracking through series

**15. Content Types**
- Text posts (current)
- Video posts
- Podcast episodes
- Link posts (link blogs)
- Photo galleries

**16. Rich Media Embedding**
- YouTube embeds
- Twitter embeds
- CodePen embeds
- GitHub Gists
- Interactive demos

**17. Newsletter Integration**
- Email newsletter signup
- Automatic email on new posts
- Email templates
- Subscriber management
- Mailchimp/SendGrid integration

#### Internationalization

**18. Multi-Language Support**
- Translate posts to multiple languages
- Language selector
- Localized URLs
- hreflang tags for SEO
- Right-to-left language support

**19. Localized Content**
- Region-specific content
- Currency formatting
- Date/time formatting
- Localized images and examples

#### Admin Experience

**20. Bulk Import/Export**
- Import posts from other platforms (Medium, WordPress, etc.)
- Export posts to Markdown/JSON
- Backup and restore functionality
- Migration tools

**21. Media Library**
- Centralized image management
- Image search and filtering
- Bulk upload
- Image editing (crop, resize, filters)
- Usage tracking

**22. Editorial Workflow**
- Draft → Review → Approved → Published
- Editor roles and permissions
- Revision requests
- Editorial comments
- Approval notifications

**23. Template System**
- Post templates for common formats
- Reusable content blocks
- Template library
- Custom layouts per category

### Technical Improvements

**24. Real-Time Collaboration**
- Multiple editors on same post
- Live cursor positions
- Conflict resolution
- Change notifications

**25. Progressive Web App (PWA)**
- Offline reading
- Install to home screen
- Push notifications
- Background sync

**26. A/B Testing**
- Test different titles/excerpts
- Track performance metrics
- Automatic winner selection
- Conversion optimization

**27. Content Recommendations Engine**
- Machine learning based suggestions
- Personalized content feeds
- Reading time optimization
- Engagement prediction

**28. GraphQL API**
- Alternative to Convex queries
- Client-side caching
- Flexible query structure
- Third-party integrations

**29. Webhooks**
- Notify external services on publish
- Integration with automation tools
- Custom event triggers
- Real-time updates

**30. Advanced Search**
- Elasticsearch integration
- Fuzzy search
- Autocomplete suggestions
- Search filters and facets
- Relevance tuning

### Community Features

**31. Guest Authors**
- External contributor submissions
- Review and approval workflow
- Guest author profiles
- Byline credits

**32. Reader Reactions**
- Emoji reactions (like, love, insightful, etc.)
- Reaction analytics
- Popular reactions tracking
- Social proof

**33. Social Sharing Analytics**
- Track share counts per platform
- Viral content identification
- Share link tracking
- Social engagement metrics

**34. Reading Lists**
- Save posts for later
- Create custom reading lists
- Share reading lists
- Reading progress tracking

### Content Moderation

**35. Spam Protection**
- Akismet integration
- Comment spam filtering
- Rate limiting
- Captcha for forms

**36. Content Flagging**
- Report inappropriate content
- Moderation queue
- Automated content analysis
- Community guidelines enforcement

---

## Conclusion

This blog system provides a robust, feature-rich publishing platform with:

- Modern architecture using Next.js 16 and Convex
- Comprehensive admin interface for content management
- Advanced SEO features for discoverability
- Performance optimizations with ISR and caching
- Full MDX/Markdown support with GFM features
- Responsive design and dark mode support

The system is designed to scale with your content needs while maintaining excellent performance and user experience. With the planned future enhancements, the platform will continue to evolve with modern blogging needs.

For questions, issues, or feature requests, please refer to the project repository's issue tracker or contact the development team.

**Happy blogging!**
