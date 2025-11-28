# Ryan Lowe - Portfolio

A modern, high-performance portfolio website showcasing professional and personal projects, built with cutting-edge web technologies.

**Live Site:** [ryan.phytertek.com](https://ryan.phytertek.com)

## ✨ Features

- **🎨 Beautiful UI/UX**: Custom animations, grain overlay effects, and cursor glow
- **🎯 Project Showcase**: Filterable portfolio with professional and personal projects
- **📊 Tech Stack Visualization**: Interactive technology stack with categorization
- **🏗️ Infrastructure Timeline**: Visual representation of infrastructure and DevOps work
- **⚡ Performance Optimized**: React 19 with React Compiler enabled
- **🌓 Modern Design System**: OKLCH color space with custom theming
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

### Additional Libraries
- **Lucide React** - Beautiful icon system
- **React Icons** - Comprehensive icon collection
- **XYFlow** - Interactive flow diagrams for infrastructure visualization
- **date-fns** - Modern date utility library

## 📁 Project Structure

```
src/
├── app/                      # Next.js App Router pages
│   ├── layout.tsx           # Root layout with metadata
│   ├── page.tsx             # Homepage with hero section
│   ├── about/               # About page
│   ├── projects/            # Projects showcase with filters
│   ├── stack/               # Tech stack visualization
│   ├── infrastructure/      # Infrastructure & DevOps timeline
│   └── globals.css          # Global styles and theme variables
├── components/
│   ├── effects/             # Visual effects (grain, glow, typewriter)
│   ├── layout/              # Navigation and footer
│   ├── sections/            # Page sections (Hero, etc.)
│   └── ui/                  # shadcn/ui components
├── data/
│   ├── projects.ts          # Project data with categories
│   ├── stack.ts             # Technology stack data
│   └── timeline.ts          # Infrastructure timeline data
├── hooks/
│   └── useReducedMotion.ts  # Accessibility hook
└── lib/
    ├── fonts.ts             # Font configuration
    └── utils.ts             # Utility functions (cn helper)
```

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

## 🎯 Key Features Explained

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

The application is optimized for production deployment:

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

## 📄 License

This project is private and proprietary. All rights reserved.

## 👤 Author

**Ryan Lowe**
- Website: [ryan.phytertek.com](https://ryan.phytertek.com)
- GitHub: [@phyter1](https://github.com/phyter1)
- LinkedIn: [linkedin.com/in/phytertek](https://linkedin.com/in/phytertek)
- Email: ryan.phyter.1@gmail.com

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
- Animations powered by [Framer Motion](https://www.framer.com/motion/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)

---

Built with ❤️ using modern web technologies
