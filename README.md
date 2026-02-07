# Ryan Lowe - Portfolio

A modern, high-performance portfolio website showcasing professional and personal projects, built with cutting-edge web technologies and developed using AI-first, agentic development practices.

**Live Site:** [phytertek.com](https://rphytertek.com)

## ✨ Features

- **🤖 AI Chat Assistant**: Interactive AI-powered chat interface trained on professional experience and engineering philosophy
- **🎯 Job Fit Analyzer**: AI-powered job description analysis tool providing honest assessment of role alignment
- **📝 Blog System**: Full-featured blog with MDX support, admin interface, SEO optimization, and RSS feed
- **🛡️ Production-Grade Security**: Comprehensive guardrail system with educational feedback for prompt injection, rate limiting, and content validation
- **🎨 Beautiful UI/UX**: Custom animations, grain overlay effects, and cursor glow
- **🌓 Dark Mode Support**: Comprehensive theme system with light, dark, and system preference modes
- **📂 Project Showcase**: Filterable portfolio with professional and personal projects
- **📊 Tech Stack Visualization**: Interactive technology stack with AI development tools and categorization
- **📚 Engineering Principles**: Dedicated page showcasing principles from The Phoenix Project, The Unicorn Project, and The Goal, with focus on AI-first development and team leadership
- **👥 Agentic AI Leadership**: Showcasing experience leading teams of humans and autonomous AI agents
- **⚡ Performance Optimized**: React 19 with React Compiler enabled
- **🌈 Modern Design System**: OKLCH color space with custom theming
- **♿ Accessibility**: Reduced motion support and semantic HTML
- **📱 Fully Responsive**: Mobile-first design that works on all devices

## 🚀 Tech Stack

### Core Framework
- **Next.js 16** - App Router with React Server Components
- **React 19.2.0** - With React Compiler enabled for automatic optimization
- **TypeScript 5** - Full type safety across the codebase
- **Bun** - Fast JavaScript runtime and package manager

### Styling & UI
- **Tailwind CSS 4** - Latest version with modern CSS features
- **shadcn/ui** - High-quality, accessible component library (new-york style)
- **Framer Motion** - Smooth animations and transitions
- **OKLCH Color Space** - Perceptually uniform colors
- **Fira Sans & Fira Mono** - Custom font system with optimal loading

### Developer Experience
- **Biome** - Fast, modern linter and formatter (replaces ESLint + Prettier)
- **TypeScript Strict Mode** - Maximum type safety
- **Path Aliases** - Clean imports with `@/*` mapping

### Backend & Data
- **Convex** - Real-time backend with type-safe queries and mutations
- **Convex File Storage** - Cloud storage for blog images

### Content Management
- **MDX** - Markdown with JSX support for rich content
- **Tiptap** - Headless rich text editor with React integration
- **remark-gfm** - GitHub Flavored Markdown support
- **rehype-highlight** - Syntax highlighting for code blocks
- **rehype-slug** - Automatic heading IDs for anchor links

### Additional Libraries
- **Lucide React** - Beautiful icon system
- **React Icons** - Comprehensive icon collection
- **XYFlow** - Interactive flow diagrams for infrastructure visualization
- **date-fns** - Modern date utility library
- **Zod** - TypeScript-first schema validation

## 📁 Project Structure

```
src/
├── app/                      # Next.js App Router pages
│   ├── layout.tsx           # Root layout with metadata
│   ├── page.tsx             # Homepage with hero section
│   ├── about/               # About page
│   ├── blog/                # Blog pages
│   │   ├── page.tsx         # Blog listing page
│   │   ├── [slug]/          # Individual blog posts
│   │   ├── category/        # Category archive pages
│   │   ├── tag/             # Tag archive pages
│   │   └── rss.xml/         # RSS feed generation
│   ├── admin/               # Admin interface
│   │   ├── blog/            # Blog admin dashboard
│   │   │   ├── page.tsx     # Blog dashboard
│   │   │   ├── new/         # Create new post
│   │   │   ├── edit/        # Edit post
│   │   │   └── categories/  # Category management
│   │   └── login/           # Admin authentication
│   ├── principles/          # Engineering principles page
│   ├── projects/            # Projects showcase with filters
│   ├── stack/               # Tech stack visualization
│   └── globals.css          # Global styles and theme variables
├── components/
│   ├── blog/                # Blog components
│   │   ├── BlogCard.tsx     # Blog post card
│   │   ├── BlogContent.tsx  # MDX content renderer
│   │   ├── BlogHeader.tsx   # Post header
│   │   ├── BlogSearch.tsx   # Search component
│   │   ├── BlogSidebar.tsx  # Sidebar with categories/tags
│   │   └── ShareButtons.tsx # Social sharing buttons
│   ├── admin/               # Admin components
│   │   └── blog/            # Blog admin components
│   │       ├── BlogPostEditor.tsx   # Tiptap editor
│   │       ├── BlogPostMetadata.tsx # SEO metadata editor
│   │       └── CategoryManager.tsx  # Category management
│   ├── effects/             # Visual effects (grain, glow, typewriter)
│   ├── layout/              # Navigation and footer
│   ├── sections/            # Page sections (Hero, etc.)
│   └── ui/                  # shadcn/ui components
├── data/
│   ├── principles.ts        # Engineering principles from Phoenix/Unicorn/Goal
│   ├── projects.ts          # Project data with categories
│   ├── stack.ts             # Technology stack data
│   └── timeline.ts          # Infrastructure timeline data
├── hooks/
│   └── useReducedMotion.ts  # Accessibility hook
└── lib/
    ├── blog-utils.ts        # Blog utility functions
    ├── fonts.ts             # Font configuration
    └── utils.ts             # Utility functions (cn helper)
```

## 📚 Documentation

Comprehensive documentation is available in the `docs/` directory:

- **[Architecture](./docs/00-ARCHITECTURE.md)** - System architecture and design patterns
- **[Design System](./docs/01-DESIGN-SYSTEM.md)** - Colors, typography, and theming
- **[Components](./docs/02-COMPONENTS.md)** - Component library and usage
- **[Guardrail System](./docs/12-GUARDRAIL-SYSTEM.md)** - AI security with educational feedback
- **[Blog System](./docs/13-BLOG-SYSTEM.md)** - Blog architecture, admin guide, and content guidelines (coming soon)
- **[Security](./SECURITY.md)** - Security practices and vulnerability reporting

The guardrail documentation is particularly notable for its production-grade security implementation with transparent, educational user feedback. See `docs/12-GUARDRAIL-SYSTEM.md` for details on:
- Prompt injection detection (30+ attack patterns)
- Rate limiting and abuse prevention
- Length validation and token stuffing protection
- Suspicious pattern detection (XSS, SQL injection, etc.)
- Scope enforcement for appropriate content

## 🛠️ Getting Started

### Prerequisites

- [Bun](https://bun.sh) v1.0.0 or higher (recommended)
- Node.js 18+ (alternative)

### Installation

```bash
# Clone the repository
git clone https://github.com/phyter1/main.git
cd main

# Install dependencies
bun install
```

### Development

```bash
# Start development server (http://localhost:3000)
bun dev

# Build for production
bun build

# Start production server
bun start

# Lint code
bun lint

# Format code
bun format
```

### Testing

The project includes a comprehensive test suite with proper environment configuration.

#### Running Tests

```bash
# Run all tests
bun test

# Run all tests with bail on first failure
bun test:all

# Run specific test suites
bun test:lib          # Library and utility tests
bun test:components   # Component tests
bun test:api          # API route tests
bun test:pages        # Page component tests
bun test:integration  # Integration tests

# Run tests in watch mode
bun test:watch
```

#### Test Environment Setup

The test suite uses a dedicated `.env.test` file for test-specific environment variables. **This file is committed to the repository** and contains safe mock values for testing.

**Key Points:**
- `.env.test` - Committed to repository, contains mock/test values
- `.env.local` - **NOT committed**, contains real credentials for local development
- `.env.local.example` - Template for creating your `.env.local`

The test environment is automatically loaded by `test-setup.ts` before tests run.

**Environment Variables in .env.test:**
```bash
# Mock values for testing (NOT real credentials)
OPENAI_API_KEY=test_key_for_testing_only_sk_mock_1234567890
ADMIN_PASSWORD=TestPassword123!@#ForTests
ADMIN_SESSION_SECRET=test_session_secret_64_characters_long_for_testing_purposes_only_1234

# Mock Convex URL (NOT real Convex instance)
NEXT_PUBLIC_CONVEX_URL=https://test-convex-url.convex.cloud

# Test rate limiting
AI_MAX_REQUESTS_PER_MINUTE=1000
AI_MAX_TOKENS_PER_REQUEST=4096
```

**Why .env.test is committed:**
- Ensures consistent test environment across all developers
- Required for CI/CD pipeline reliability
- Contains only safe mock values (no real secrets or URLs)
- Tests use mocking for external services

**For local development:**
1. Copy `.env.local.example` to `.env.local`
2. Add your actual API keys and credentials
3. Never commit `.env.local` to version control

## 🎯 Key Features Explained

### Blog System

A comprehensive blog platform integrated with the portfolio, featuring:

**Content Management:**
- MDX-powered content with full Markdown support
- GitHub Flavored Markdown (GFM) including tables, task lists, and autolinks
- Tiptap rich text editor with live preview
- Syntax highlighting for code blocks with language detection
- Auto-save functionality to prevent content loss
- Category and tag organization

**Admin Interface:**
- Full-featured admin dashboard at `/admin/blog`
- Integrated with existing admin authentication system
- Create, edit, publish, and archive posts
- Category management with post counts
- Image upload with preview
- SEO metadata editor (title, description, Open Graph images)
- Slug auto-generation with custom override option

**Public Features:**
- Blog listing page with grid layout and featured posts section
- Individual post pages with responsive design
- Category and tag archive pages with filtering
- Full-text search with live results
- RSS feed generation at `/blog/rss.xml`
- Social sharing buttons (Twitter, LinkedIn, email, copy link)
- Automatic table of contents for long posts

**SEO Optimization:**
- Dynamic metadata generation (Open Graph, Twitter Cards)
- Automatic sitemap integration
- Structured data (JSON-LD) for blog posts
- Canonical URLs and proper heading hierarchy
- ISR (Incremental Static Regeneration) for optimal performance

**Technical Implementation:**
- Convex backend for real-time data synchronization
- Server-side rendering with Next.js App Router
- Type-safe queries and mutations with TypeScript
- Comprehensive test coverage (unit, integration, and component tests)
- Performance optimized with React Compiler

**Routes:**
- `/blog` - Main blog listing page
- `/blog/[slug]` - Individual blog posts
- `/blog/category/[slug]` - Category archive pages
- `/blog/tag/[slug]` - Tag archive pages
- `/blog/rss.xml` - RSS feed
- `/admin/blog` - Admin blog dashboard
- `/admin/blog/new` - Create new post
- `/admin/blog/edit/[id]` - Edit existing post
- `/admin/blog/categories` - Manage categories

### Engineering Principles Page

A comprehensive page documenting personal engineering principles inspired by foundational software engineering books:

- **The Phoenix Project** (Gene Kim) - The Three Ways
  - Systems Thinking: Optimize the entire value stream
  - Amplify Feedback Loops: Fast, continuous feedback
  - Culture of Experimentation: Learning from failure

- **The Unicorn Project** (Gene Kim) - The Five Ideals
  - Locality and Simplicity: Independent deployment, minimal dependencies
  - Focus, Flow, and Joy: Developer happiness and flow state
  - Improvement of Daily Work: Continuous technical debt reduction
  - Psychological Safety: Safe experimentation environment
  - Customer Focus: Distinguish core from context work

- **The Goal** (Eliyahu M. Goldratt) - Theory of Constraints
  - Five Focusing Steps for identifying and eliminating bottlenecks
  - Application to software delivery pipelines
  - Real-world examples from professional experience

Each principle includes personalized descriptions with practical applications from Hugo Health work, AI-assisted development practices, and modern tooling choices (Bun, Biome, TypeScript, Next.js).

### Project Categories
Projects are organized into two categories:
- **Professional**: Client work, enterprise projects, and professional consulting
- **Personal**: Side projects, open source contributions, and passion projects

Each project includes:
- Live demo links (when available)
- GitHub repository links
- Technology stack badges
- Status indicators (Live, In Progress, Archived)
- Featured project highlighting
- Detailed descriptions and metrics

### Visual Effects
- **Grain Overlay**: Subtle texture overlay for visual depth
- **Cursor Glow**: Interactive cursor effect (respects reduced motion)
- **TypeWriter Effects**: Animated text with rotating words
- **Smooth Transitions**: Framer Motion animations throughout

### Theming System
- CSS variables for easy customization
- OKLCH color space for perceptually uniform colors
- Custom radius system (sm, md, lg, xl)
- Dark mode support via Tailwind variants

## 🏗️ Code Quality

### Biome Configuration
- **Formatting**: 2-space indentation, auto-organize imports
- **Linting**: React and Next.js recommended rules
- **VCS Integration**: Git hooks for pre-commit checks
- **Special Rules**: Tailwind CSS compatibility

### TypeScript
- Strict mode enabled
- Module resolution: bundler
- Target: ES2017
- Full type coverage across the codebase

## 📦 Build & Deployment

The application is deployed on **Vercel** for optimal Next.js performance and simplified operations.

```bash
# Production build
bun build

# Output is in .next/ directory
# All pages are statically generated for optimal performance
```

### Build Optimizations
- React Compiler for automatic memoization
- Static page generation for all routes
- Optimized bundle splitting
- Tree-shaking for minimal bundle size
- Optimized font loading with `display: swap`

### Performance Monitoring with Speed Insights

The application includes **Vercel Speed Insights** for real-world performance monitoring, tracking Core Web Vitals (LCP, FID, CLS, TTFB) from actual users.

#### Setup Requirements

Speed Insights is already integrated in the codebase (`src/app/layout.tsx`) but requires activation in your Vercel dashboard:

1. Navigate to your project in the Vercel dashboard
2. Go to **Settings** → **Speed Insights**
3. Enable Speed Insights for your project
4. Deploy your application to production

#### Verification Steps

After deployment, verify Speed Insights is working correctly:

1. **Check Script Loading**
   - Visit your deployed site
   - Open browser DevTools → Network tab
   - Verify the script loads from: `/_vercel/speed-insights/script.js`
   - Status should be `200 OK`

2. **Verify Data Collection**
   - Navigate through your site pages
   - Return to Vercel dashboard → **Speed Insights**
   - Performance data should appear within 24 hours of traffic
   - View Core Web Vitals metrics by page

3. **Development Mode**
   - In local development (`bun dev`), Speed Insights runs in debug mode
   - Check browser console for Speed Insights debug logs
   - No data is sent to Vercel in development

#### What Gets Tracked

- **LCP (Largest Contentful Paint)**: How quickly main content loads
- **FID (First Input Delay)**: How quickly site responds to user interaction
- **CLS (Cumulative Layout Shift)**: Visual stability during page load
- **TTFB (Time to First Byte)**: Server response time

All metrics are privacy-compliant with no PII collection.

#### Troubleshooting

**Script not loading:**
- Verify Speed Insights is enabled in Vercel dashboard
- Check deployment completed successfully
- Confirm you're accessing the production URL (not preview or development)

**No data appearing:**
- Speed Insights requires actual user traffic
- Data typically appears within 24 hours
- Low-traffic sites may take longer to show meaningful data

**Console errors:**
- Ensure `@vercel/speed-insights` package is installed (`bun install`)
- Verify `<SpeedInsights />` component is in `src/app/layout.tsx`
- Check for browser extension conflicts (ad blockers may interfere)

## 🎨 Customization

### Adding Projects
Edit `src/data/projects.ts` to add new projects:

```typescript
{
  id: "unique-id",
  title: "Project Title",
  description: "Short description",
  longDescription: "Detailed description",
  technologies: ["Next.js", "React", "TypeScript"],
  links: {
    demo: "https://demo.com",
    github: "https://github.com/username/repo"
  },
  featured: true,
  status: "live",
  category: "personal", // or "professional"
  date: "2025-01",
  highlights: [
    "Key feature 1",
    "Key feature 2"
  ]
}
```

### Modifying Styles
- Global styles: `src/app/globals.css`
- Theme variables: CSS custom properties in `globals.css`
- Tailwind config: Uses Tailwind CSS 4 with postcss plugin

## 🛡️ Git Hooks

This project uses automated git hooks to enforce code quality gates before commits and pushes, aligning with the "No Shortcuts" development philosophy. Git hooks are scripts that run automatically at specific points in the git workflow, helping maintain code quality and prevent broken code from entering the repository.

### What Are Git Hooks?

Git hooks are automated quality checks that run when you perform git operations:

- **Pre-commit hook**: Runs before creating a commit (checks code quality)
- **Pre-push hook**: Runs before pushing to remote (validates tests)

These hooks are automatically installed when you run `bun install` via the `postinstall` script.

### Pre-Commit Hook

**What it checks:**
- **Biome lint**: Checks for code quality issues, unused variables, and potential bugs
- **Biome format**: Ensures consistent code formatting (2-space indentation, proper spacing)

**How it works:**
- Only checks **staged files** using `lint-staged` for fast execution
- Automatically fixes auto-fixable issues (formatting, import organization)
- Blocks commit if unfixable issues are found
- Runs: `bunx lint-staged`

**Example output:**
```bash
Running pre-commit checks...
✔ Preparing lint-staged...
✔ Running tasks for staged files...
✔ Applying modifications...
✔ Cleaning up...

✅ All pre-commit checks passed!
```

**On failure:**
```bash
❌ Pre-commit checks failed!
Please fix the issues above before committing.

# Fix the issues shown in the output, then try again
```

### Pre-Push Hook

**What it checks:**
- **Full test suite**: Runs all tests to ensure nothing is broken
- Validates all unit tests, integration tests, and component tests
- Blocks push if any tests fail

**How it works:**
- Runs complete test suite via `bun test`
- Ensures no failing tests reach the remote repository
- Prevents breaking changes from being shared with the team

**Example output:**
```bash
Running pre-push checks...

bun test v1.0.0

✓ src/lib/utils.test.ts > cn > combines class names
✓ src/lib/utils.test.ts > cn > handles conditional classes
... (all tests)

✅ All pre-push checks passed!
```

**On failure:**
```bash
❌ Pre-push checks failed!
Please fix the failing tests above before pushing.

# Fix the failing tests, then try again
```

### Automatic Installation

Git hooks are automatically installed when you run:

```bash
bun install
```

The `postinstall` script runs `simple-git-hooks` which:
1. Copies hook scripts from `.git-hooks/` to `.git/hooks/`
2. Makes them executable
3. Configures them to run on commit and push

**First-time setup:**
```bash
# Clone the repository
git clone https://github.com/phyter1/main.git
cd main

# Install dependencies (automatically installs hooks)
bun install

# Hooks are now active and will run on commit/push
```

### Bypassing Hooks (Use Sparingly)

You can bypass git hooks using the `--no-verify` flag:

```bash
# Skip pre-commit hook
git commit -m "message" --no-verify

# Skip pre-push hook
git push --no-verify
```

**⚠️ Warning: Use this flag sparingly and only when necessary**

Bypassing hooks defeats the purpose of automated quality gates and can lead to:
- Broken code in the repository
- Failing tests on main branch
- Inconsistent code formatting
- Technical debt accumulation

**Acceptable use cases:**
- Emergency hotfix where hooks are blocking critical fix
- Temporary work-in-progress commits on feature branch
- Known false positive in linting rules (file a bug after)

**Not acceptable use cases:**
- "I'll fix it later" (fix it now)
- "Moving too fast for tests" (slow down, write tests)
- "Linter is annoying" (linter is right, fix your code)

Following the "No Shortcuts" philosophy, fix the issues instead of bypassing the checks.

### Troubleshooting

#### Hooks Not Running

**Problem:** Committing without hooks executing

**Solutions:**
1. Verify hooks are installed:
   ```bash
   ls -la .git/hooks/pre-commit .git/hooks/pre-push
   # Should show executable files
   ```

2. Reinstall hooks manually:
   ```bash
   bunx simple-git-hooks
   ```

3. Check if hooks are executable:
   ```bash
   chmod +x .git/hooks/pre-commit .git/hooks/pre-push
   ```

#### Permission Errors

**Problem:** `permission denied` when running hooks

**Solution:**
```bash
# Make hook scripts executable
chmod +x .git-hooks/pre-commit .git-hooks/pre-push

# Reinstall hooks
bunx simple-git-hooks
```

#### Lint-Staged Errors

**Problem:** `lint-staged` command not found

**Solutions:**
1. Ensure `lint-staged` is installed:
   ```bash
   bun install
   ```

2. Run manually to diagnose:
   ```bash
   bunx lint-staged
   ```

#### Test Failures on Push

**Problem:** Pre-push hook fails with test errors

**Solutions:**
1. Run tests locally to see failures:
   ```bash
   bun test
   ```

2. Fix failing tests before pushing

3. Ensure test environment is configured (see Testing section)

4. If tests pass locally but fail in hook:
   - Check for environment variable issues
   - Ensure `.env.test` is present
   - Clear test cache: `rm -rf node_modules/.cache`

#### Skipping Hooks Temporarily

**Problem:** Need to bypass hooks for legitimate reason

**Solution:**
```bash
# Commit with hook bypass (use sparingly)
git commit -m "WIP: feature in progress" --no-verify

# Push with hook bypass (use very sparingly)
git push --no-verify
```

**Remember:** Document why you bypassed hooks and fix issues ASAP.

### Configuration

Hook configuration is defined in `package.json`:

```json
{
  "simple-git-hooks": {
    "pre-commit": ".git-hooks/pre-commit",
    "pre-push": ".git-hooks/pre-push"
  },
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": [
      "biome check --write --unsafe",
      "biome format --write"
    ]
  }
}
```

**Hook scripts location:** `.git-hooks/` directory
**Installed hooks location:** `.git/hooks/` directory (auto-generated)

### Philosophy: No Shortcuts

Git hooks embody the "No Shortcuts" development philosophy:

- **Quality gates prevent mistakes:** Catch issues before they become expensive
- **Automated enforcement:** Humans forget, computers don't
- **Fast feedback:** Find issues in seconds, not hours
- **Shared standards:** Everyone follows the same quality bar
- **Build discipline:** Good habits compound over time

Don't fight the hooks. Embrace them. They're saving you from yourself.

## 📄 License

This project is private and proprietary. All rights reserved.

## 👤 Author

**Ryan Lowe** - Tech Lead
- Website: [ryan.phytertek.com](https://ryan.phytertek.com)
- GitHub: [@phyter1](https://github.com/phyter1)
- LinkedIn: [linkedin.com/in/phytertek](https://linkedin.com/in/phytertek)
- Email: ryan.phyter.1@gmail.com

Leading AI-first development and building teams of humans and autonomous agents to deliver scalable, modern web applications.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
- Animations powered by [Framer Motion](https://www.framer.com/motion/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)

---

Built with ❤️ using modern web technologies
