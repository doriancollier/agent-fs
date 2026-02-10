---
slug: roadmap-integration
---

# Roadmap Integration into Next.js Application

**Slug:** roadmap-integration
**Author:** Claude Code
**Date:** 2026-02-01
**Branch:** preflight/roadmap-integration
**Related:** N/A

---

## 1) Intent & Assumptions

**Task brief:** Integrate the standalone roadmap visualization (currently running as a separate Python HTTP server) into the main Next.js application. The roadmap should be accessible as a route in the app, work correctly in development, and function properly when deployed to Vercel.

**Assumptions:**
- The roadmap is public-facing (doesn't require authentication)
- Python scripts for roadmap management (`update_status.py`, `link_spec.py`, etc.) will continue to work from CLI
- The Claude Code commands (`/roadmap:*`) should continue to function
- The existing vanilla JS visualization can be adapted to React
- Updates to roadmap data will happen via git commits and deployments (matching existing workflow)

**Out of scope:**
- Adding authentication to the roadmap
- Real-time collaborative editing
- Database migration (Prisma/PostgreSQL) for roadmap storage
- Mobile app support

---

## 2) Pre-reading Log

- `roadmap/CLAUDE.md`: Clarifies standalone nature with vanilla HTML/CSS/JS (not React/Tailwind)
- `roadmap/roadmap.html`: Single-page app with modal interfaces, three view types (timeline, status, priority)
- `roadmap/scripts.js`: Vanilla IIFE pattern fetching `roadmap.json` with auto-refresh every 2 minutes
- `roadmap/roadmap.json`: Schema-validated JSON with items array, project metadata, timestamps (currently empty)
- `roadmap/schema.json`: JSON Schema v7 defining strict validation rules for all item types
- `roadmap/scripts/utils.py`: Project root discovery (git-based), roadmap path resolution, load/save JSON
- `src/app/layout.tsx`: Root layout using Providers for TanStack Query, auth, themes
- `src/app/(system)/layout.tsx`: Sidebar-based layout pattern using cookie state for persistence
- `next.config.ts`: Basic configuration with transpilePackages for Base UI, PostHog rewrites
- `developer-guides/01-project-structure.md`: FSD architecture with layer hierarchy and dependency rules
- `developer-guides/05-data-fetching.md`: Patterns for Server Components, TanStack Query, Server Actions, API Routes

---

## 3) Codebase Map

**Primary Components/Modules:**

| Component | Path | Role |
|-----------|------|------|
| Roadmap HTML | `roadmap/roadmap.html` | SPA entry point, DOM structure |
| Roadmap Logic | `roadmap/scripts.js` | IIFE-based data fetching, rendering, interactions |
| Roadmap Data | `roadmap/roadmap.json` | Source of truth for roadmap state |
| Validation Schema | `roadmap/schema.json` | JSON Schema for data validation |
| Python Utilities | `roadmap/scripts/*.py` | File I/O, git integration, status updates |
| Next.js Root | `src/app/layout.tsx` | Providers, fonts, global CSS |
| System Hub | `src/app/(system)/system/page.tsx` | Documentation entry point |
| API Example | `src/app/api/users/route.ts` | Pattern reference for HTTP handlers |

**Shared Dependencies:**
- `src/layers/shared/lib/query-client.ts` - TanStack Query client (if needed)
- `src/layers/shared/ui/*` - Shadcn/Base UI components
- `src/app/globals.css` - Calm Tech design system

**Data Flow (Current):**
```
User Browser
    ↓
roadmap.html (fetch with cache-bust)
    ↓
roadmap.json (served by Python HTTP server)
    ↓
scripts.js renders views
    ↓
Modal/interactions (all client-side)
```

**Data Flow (Target):**
```
User Browser
    ↓
Next.js /roadmap route (Server Component)
    ↓
Import roadmap.ts (TypeScript export, build-time bundled)
    ↓
React component renders visualization
    ↓
Client interactions (modals, filters, theme toggle)
```

**Potential Blast Radius:**
- Direct: 5-8 new files (route, components, data file)
- Indirect: Python scripts may need path updates
- Claude Code: `/roadmap:*` commands need verification

---

## 4) Root Cause Analysis

N/A - This is a feature integration, not a bug fix.

---

## 5) Research

### Vercel Filesystem Behavior

**Key Finding:** Vercel deployments run on a **read-only filesystem**. JSON files can be read at runtime using `process.cwd()`, but **cannot be written** in production.

- Write attempts result in `EROFS: read-only file system` error
- Files in `public/` are catalogued at build time only
- `/tmp` directory is available for temporary files but cleared between invocations

### Potential Solutions

**1. TypeScript Export (Recommended for this project)**
- Description: Convert `roadmap.json` to `roadmap.ts` with `export const roadmap = {...}`
- How it works: Data bundled at build time, imported synchronously
- Pros:
  - Zero runtime filesystem dependencies
  - Type-safe with TypeScript interfaces
  - Works identically in dev and production
  - No external services or costs
- Cons:
  - Requires rebuild to update data
  - Not suitable for user-editable content
- Complexity: Low
- Best for: Static roadmaps updated via git commits

**2. Runtime JSON Import**
- Description: Use direct `import roadmap from './roadmap.json'`
- How it works: Bundler processes JSON at build time
- Pros:
  - Clean separation of data and code
  - Easy to edit JSON without touching TypeScript
- Cons:
  - Less type-safe (need manual type definitions)
  - Dynamic imports with template literals can fail in production
- Complexity: Low
- Best for: Simple static data

**3. Runtime File Reading (Server Components)**
- Description: Use `fs.readFile()` with `process.cwd()` in Server Components
- Pros:
  - Files can be separate from code bundle
  - Good for large datasets
- Cons:
  - Async operations required
  - Still requires deployment for updates (read-only)
- Complexity: Medium
- Best for: Large datasets

**4. GitHub API Backend (Future option)**
- Description: Store `roadmap.json` in repo, use GitHub API for edits
- Pros:
  - Free, version-controlled, audit trail
  - Automatic deployment via webhook
- Cons:
  - 2-5 minute delay for changes to appear
  - Rate limits (5000 req/hour)
- Complexity: Medium-High
- Best for: Admin interfaces with version control needs

### Security Considerations
- Roadmap is public data, no sensitive information
- If adding admin interface, use `requireAuth()` in API routes
- Validate schema with Zod before any writes

### Performance Considerations
- TypeScript export is fastest (in-memory, no I/O)
- Roadmap data is small (<50KB expected), bundle impact negligible
- No caching needed for static imports

### Recommendation

**Recommended Approach:** TypeScript Export

**Rationale:**
- Matches existing workflow (git commits for updates)
- Zero complexity for Vercel deployment
- Type-safe, fast, reliable
- Python scripts can continue writing to `roadmap.json`, with a build step to sync to `.ts`

**Caveats:**
- Need build step to sync `roadmap.json` → `roadmap.ts` (or scripts write directly to `.ts`)
- Real-time edits not supported without rebuild

---

## 6) Clarification (Resolved)

| Question | Decision |
|----------|----------|
| **Route location** | `(public)/roadmap` — public-facing, simple discoverable URL |
| **Visualization** | Full React rewrite with Next.js, React, Tailwind — consistent with app, maintainable |
| **Data sync** | JSON + TS import — `roadmap.json` for Python scripts, `roadmap.ts` imports it for Next.js |
| **Python scripts** | Continue working unchanged — write to `roadmap.json`, Next.js reads via TS import |
| **Styling** | Tailwind + Shadcn — use existing Calm Tech design system for consistency |

---

## Proposed Implementation Approach

### Architecture (Confirmed)

```
src/
├── app/
│   ├── (public)/
│   │   └── roadmap/
│   │       └── page.tsx          # Server Component, imports roadmap data
├── layers/
│   ├── features/
│   │   └── roadmap/
│   │       ├── ui/
│   │       │   ├── RoadmapVisualization.tsx  # Main client component
│   │       │   ├── RoadmapCard.tsx           # Item card (Shadcn Card)
│   │       │   ├── RoadmapFilters.tsx        # Filter controls (Shadcn Select, Checkbox)
│   │       │   ├── RoadmapModal.tsx          # Detail modal (Shadcn Dialog)
│   │       │   ├── HealthDashboard.tsx       # Metrics display
│   │       │   └── ViewToggle.tsx            # Timeline/Status/Priority views
│   │       ├── model/
│   │       │   └── types.ts                  # TypeScript types, Zod schemas
│   │       └── index.ts
│   └── entities/
│       └── roadmap-item/
│           ├── model/
│           │   └── types.ts                  # RoadmapItem type
│           └── index.ts
roadmap/
├── roadmap.json                  # Source of truth (used by Python scripts)
├── roadmap.ts                    # TypeScript export (imports JSON, adds types)
└── scripts/                      # Python utilities (unchanged)
```

**Tech Stack:**
- Next.js 16 App Router (Server Components)
- React 19 (Client Components for interactivity)
- Tailwind CSS v4 + Shadcn UI (Calm Tech design system)
- TypeScript (strict types, Zod validation)
- Lucide React (icons)

### Data Flow

1. Python scripts write to `roadmap/roadmap.json`
2. `roadmap/roadmap.ts` imports and re-exports the JSON with TypeScript types
3. Next.js Server Component imports from `roadmap/roadmap.ts`
4. React components render the visualization
5. Changes require: edit JSON → commit → deploy

### Key Files to Create

1. `roadmap/roadmap.ts` - TypeScript wrapper for JSON data
2. `src/app/(public)/roadmap/page.tsx` - Route page
3. `src/layers/features/roadmap/ui/RoadmapVisualization.tsx` - Main visualization
4. `src/layers/features/roadmap/model/types.ts` - Zod schemas and types
5. Supporting UI components (Card, Filters, Modal, etc.)

### Migration Steps

1. Create TypeScript types based on `roadmap/schema.json`
2. Create `roadmap.ts` that imports and types the JSON
3. Build React components for visualization
4. Create Next.js route
5. Test in development
6. Deploy to Vercel and verify
7. Update documentation

---

## Next Steps

1. Review this ideation document
2. Answer clarification questions
3. Run: `/ideate-to-spec specs/roadmap-integration/01-ideation.md`
