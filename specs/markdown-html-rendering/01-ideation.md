# Markdown HTML Rendering

**Slug:** markdown-html-rendering
**Author:** Claude Code
**Date:** 2026-02-01
**Branch:** preflight/markdown-html-rendering
**Related:** N/A

---

## 1) Intent & Assumptions

- **Task brief:** Render developer-guides/*.md files as HTML pages accessible via `/system/guides/*` routes, working in both development and production builds.
- **Assumptions:**
  - Markdown files remain in `developer-guides/` at project root (not moved)
  - Pages integrate with existing `/system` documentation section styling
  - `react-markdown` and `remark-gfm` are already installed and should be leveraged
  - Static generation is acceptable (guides don't change at runtime)
- **Out of scope:**
  - Markdown editing or CMS functionality
  - Authentication/access control for guides
  - Moving or restructuring markdown files

## 2) Pre-reading Log

- `src/app/(system)/system/page.tsx`: Links to developer guides via direct hrefs (e.g., `/developer-guides/13-autonomous-roadmap-execution.md`) that open in new tabs — currently 404s because routes don't exist
- `package.json`: Already includes `react-markdown@^10.1.0` and `remark-gfm@^4.0.1`
- `src/app/(system)/system/guides/[slug]/`: Empty dynamic route directory created but not implemented
- `developer-guides/INDEX.md`: 14 markdown files (13 guides + 1 INDEX) with structured coverage map
- `src/layers/widgets/app-sidebar/lib/nav-items.ts`: Navigation items array with `systemNavItems` — needs "Developer Guides" section added
- `src/app/(system)/system/ui/layout.tsx`: Design system showcase layout pattern to follow
- `next.config.ts`: Standard Next.js config, no MDX configuration currently

## 3) Codebase Map

**Primary Components/Modules:**
- `/src/app/(system)/layout.tsx` - System routes layout using SidebarProvider with AppSidebar
- `/src/app/(system)/system/page.tsx` - Home page listing all system resources; links to guides (broken)
- `/src/app/(system)/system/ui/layout.tsx` - Design system showcase layout with ShowcaseSidebar
- `/src/app/(system)/system/claude-code/page.tsx` - Claude Code harness documentation (pattern to follow)
- `/src/layers/widgets/app-sidebar/lib/nav-items.ts` - Navigation items, needs "Developer Guides" section

**Shared Dependencies:**
- `react-markdown@^10.1.0` - Markdown to JSX conversion (installed)
- `remark-gfm@^4.0.1` - GitHub-flavored markdown (installed)
- `@base-ui/react` - Base UI component primitives
- `tailwindcss@^4.1.18` - CSS framework with Calm Tech design tokens
- `lucide-react` - Icon library

**Data Flow:**
```
File System (developer-guides/*.md)
  ↓ (read via fs.promises.readFile in server component)
Server Component (/system/guides/[slug]/page.tsx)
  ↓ (generateStaticParams for pre-rendering)
React Markdown Component (with remark-gfm plugin)
  ↓ (render AST to JSX with styling)
Styled HTML (using Tailwind classes)
```

**Route Structure (Current → Proposed):**
```
/system/                    → Overview page (update links)
/system/ui/                 → Design system showcase (unchanged)
/system/claude-code/        → Claude Code docs (unchanged)
/system/guides/             → NEW: Guides index page
/system/guides/[slug]       → NEW: Individual guide pages
```

**Markdown Files to Render (14 files):**
```
developer-guides/
├── 01-project-structure.md
├── 02-environment-variables.md
├── 03-database-prisma.md
├── 04-forms-validation.md
├── 05-data-fetching.md
├── 06-state-management.md
├── 07-animations.md
├── 08-styling-theming.md
├── 09-authentication.md
├── 10-metadata-seo.md
├── 11-parallel-execution.md
├── 12-site-configuration.md
├── 13-autonomous-roadmap-execution.md
└── INDEX.md
```

**Potential Blast Radius:**
- Direct: 4 new files (guide page, index page, layout, potentially lib utils)
- Updates: 2 files (system/page.tsx links, nav-items.ts)
- No breaking changes to existing functionality

## 4) Root Cause Analysis

N/A - This is a feature implementation, not a bug fix.

## 5) Research

### Potential Solutions

**1. Server Component with fs + react-markdown (Recommended)**
- **Description:** Use Next.js 16 server components to read markdown files from filesystem, render using already-installed react-markdown with remark-gfm, and pre-generate routes with generateStaticParams.
- **Pros:**
  - Uses already-installed dependencies (react-markdown, remark-gfm)
  - Simple implementation, no build configuration changes
  - Flexible for dynamic content sources in future
  - Works with generateStaticParams for static generation
  - Full control over styling and component rendering
- **Cons:**
  - Slightly larger client bundle (+42.6kB)
  - Need to install rehype plugins for syntax highlighting
- **Complexity:** Low
- **Maintenance:** Low

**2. @next/mdx with Build-time Compilation**
- **Description:** Configure @next/mdx to compile markdown files as MDX at build time.
- **Pros:**
  - Build-time compilation (zero runtime overhead)
  - Smallest client bundle (pre-compiled)
  - Official Next.js solution
- **Cons:**
  - Requires renaming all .md files to .mdx
  - Need to configure next.config.ts with MDX support
  - More complex setup
  - Requires mdx-components.tsx in root
- **Complexity:** Medium-High
- **Maintenance:** Medium

**3. Static Generation with gray-matter + remark**
- **Description:** Pre-process markdown files using remark/rehype pipeline directly.
- **Pros:**
  - Maximum performance (static HTML)
  - Full control over processing
  - Can extract frontmatter metadata
- **Cons:**
  - Requires multiple additional packages
  - More complex processing pipeline
  - Uses dangerouslySetInnerHTML
- **Complexity:** Medium
- **Maintenance:** Medium

### Recommendation

**Server Component with fs + react-markdown** is the recommended approach because:
1. Leverages already-installed dependencies (react-markdown, remark-gfm)
2. Requires no build configuration changes
3. Simple implementation with clear migration path to MDX if needed later
4. Performance is sufficient with generateStaticParams for static generation

### Additional Packages Needed

```bash
pnpm add @tailwindcss/typography rehype-slug rehype-autolink-headings rehype-highlight
```

### Implementation Pattern

```typescript
// app/system/guides/[slug]/page.tsx
import fs from 'fs/promises'
import path from 'path'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypeHighlight from 'rehype-highlight'

export async function generateStaticParams() {
  const files = await fs.readdir(path.join(process.cwd(), 'developer-guides'))
  return files.filter(f => f.endsWith('.md')).map(f => ({ slug: f.replace('.md', '') }))
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const content = await fs.readFile(
    path.join(process.cwd(), 'developer-guides', `${slug}.md`),
    'utf-8'
  )

  return (
    <div className="prose prose-lg dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug, rehypeHighlight]}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
```

### Styling Strategy

- Use `@tailwindcss/typography` plugin for base prose styles
- Customize via Tailwind config to match Calm Tech design system
- Apply dark mode with `dark:prose-invert`
- Override specific elements with custom components if needed

## 6) Clarifications

1. **URL slug format:** Should guides use the full filename (e.g., `01-project-structure`) or just the descriptive part (`project-structure`)? **Recommendation:** Use full filename to preserve ordering and avoid potential conflicts.

2. **Syntax highlighting theme:** Which Highlight.js theme should be used? **Recommendation:** `github-dark` for dark mode, matching VS Code familiarity.

3. **Table of contents:** Should each guide page include an auto-generated table of contents? **Recommendation:** Yes, using `remark-toc` plugin with `## Contents` heading in markdown.

4. **Guide index page (`/system/guides`):** Should this list all guides or redirect to the system overview? **Recommendation:** Create a dedicated index page listing all guides with descriptions from INDEX.md.

5. **Navigation integration:** Add "Developer Guides" section to sidebar, or keep it only on the system overview page? **Recommendation:** Add to sidebar for easy access while browsing the system docs.
