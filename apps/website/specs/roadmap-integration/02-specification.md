---
slug: roadmap-integration
---

# Specification: Roadmap Integration into Next.js Application

**Status:** Draft
**Authors:** Claude Code
**Date:** 2026-02-01
**Spec Location:** `specs/roadmap-integration/02-specification.md`

---

## Overview

Integrate the standalone roadmap visualization (currently a vanilla HTML/CSS/JS application served by a Python HTTP server) into the main Next.js application as a fully-featured React implementation. The roadmap will be accessible at `/roadmap`, work correctly in both development and Vercel production deployment, and maintain compatibility with existing Python CLI tools.

---

## Background/Problem Statement

The current roadmap system exists as a completely separate application:
- Requires starting a separate Python HTTP server (`python3 -m http.server 8765`)
- Uses vanilla JavaScript with no type safety
- Has its own CSS that duplicates the Calm Tech design system
- Cannot benefit from Next.js features (SEO, Server Components, caching)
- Creates friction in the development workflow (two servers to manage)

**Core Problem:** The roadmap is disconnected from the main application, requiring manual server management and preventing unified deployment.

**Goal:** A single `pnpm dev` command should serve the entire application including the roadmap, and deployment to Vercel should work without additional configuration.

---

## Goals

- Roadmap accessible at `/roadmap` route in both development and production
- Full React rewrite using the same tech stack as the main app (Next.js 16, React 19, Tailwind v4, Shadcn UI)
- All three view modes functional: Timeline, Status, Priority
- Health dashboard with accurate metrics and warnings
- Filtering by type, MoSCoW, status, and hide-completed toggle
- Item detail modal with full information and spec links
- Theme support respecting system preference
- Python CLI scripts continue working unchanged
- Successful deployment to Vercel with read-only filesystem

---

## Non-Goals

- Authentication/authorization for roadmap access (public page)
- Real-time collaborative editing
- Database migration (keeping file-based JSON storage)
- Mobile app support
- Admin interface for editing roadmap items in the browser
- Drag-and-drop reordering of items
- Converting Python scripts to TypeScript

---

## Technical Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.x | App Router, Server Components |
| React | 19.x | UI components |
| Tailwind CSS | 4.x | Styling |
| Shadcn UI | Latest | Component library (Dialog, Card, Badge, Select, Checkbox) |
| Zod | 4.x | Schema validation |
| Lucide React | Latest | Icons |
| next-themes | Latest | Theme management (already installed) |

No new dependencies required beyond what's already in the project.

---

## Detailed Design

### Architecture

```
src/
├── app/
│   └── (public)/
│       └── roadmap/
│           └── page.tsx              # Server Component, imports data
├── layers/
│   ├── features/
│   │   └── roadmap/
│   │       ├── ui/
│   │       │   ├── RoadmapPage.tsx           # Main client component
│   │       │   ├── RoadmapHeader.tsx         # Project info + controls
│   │       │   ├── HealthDashboard.tsx       # 4-metric dashboard
│   │       │   ├── RoadmapFilters.tsx        # Filter controls
│   │       │   ├── ViewToggle.tsx            # Timeline/Status/Priority
│   │       │   ├── TimelineView.tsx          # Now/Next/Later columns
│   │       │   ├── StatusView.tsx            # Status-based columns
│   │       │   ├── PriorityView.tsx          # MoSCoW grouped list
│   │       │   ├── RoadmapCard.tsx           # Item card component
│   │       │   ├── RoadmapModal.tsx          # Item detail modal
│   │       │   ├── DependencyPill.tsx        # Dependency indicator
│   │       │   └── index.ts
│   │       ├── model/
│   │       │   ├── types.ts                  # TypeScript types
│   │       │   ├── schemas.ts                # Zod schemas
│   │       │   └── constants.ts              # Enums, color maps
│   │       ├── lib/
│   │       │   └── roadmap-utils.ts          # Helper functions
│   │       └── index.ts
│   └── entities/
│       └── roadmap-item/
│           ├── model/
│           │   └── types.ts                  # RoadmapItem type (re-export)
│           └── index.ts
roadmap/
├── roadmap.json                      # Source of truth (unchanged)
├── roadmap.ts                        # NEW: TypeScript wrapper
├── schema.json                       # Validation schema (unchanged)
└── scripts/                          # Python utilities (unchanged)
```

### Data Model

Based on the existing `schema.json`, the complete TypeScript types:

```typescript
// src/layers/features/roadmap/model/types.ts

export type RoadmapItemType = 'feature' | 'bugfix' | 'technical-debt' | 'research' | 'epic'
export type MoSCoW = 'must-have' | 'should-have' | 'could-have' | 'wont-have'
export type Status = 'not-started' | 'in-progress' | 'completed' | 'on-hold'
export type Health = 'on-track' | 'at-risk' | 'off-track' | 'blocked'
export type TimeHorizon = 'now' | 'next' | 'later'

export interface LinkedArtifacts {
  specSlug?: string
  ideationPath?: string
  specPath?: string
  tasksPath?: string
  implementationPath?: string
}

export interface IdeationContext {
  targetUsers?: string[]
  painPoints?: string[]
  successCriteria?: string[]
  constraints?: string[]
}

export interface RoadmapItem {
  id: string                    // UUID v4
  title: string                 // 3-200 chars
  description?: string          // max 2000 chars
  type: RoadmapItemType
  moscow: MoSCoW
  status: Status
  health: Health
  timeHorizon: TimeHorizon
  effort?: number               // 1-13 Fibonacci
  dependencies?: string[]       // Array of item UUIDs
  labels?: string[]
  createdAt: string            // ISO 8601
  updatedAt: string            // ISO 8601
  linkedArtifacts?: LinkedArtifacts
  ideationContext?: IdeationContext
}

export interface TimeHorizonConfig {
  label: string
  description: string
}

export interface Roadmap {
  projectName: string
  projectSummary: string
  lastUpdated: string
  timeHorizons: {
    now: TimeHorizonConfig
    next: TimeHorizonConfig
    later: TimeHorizonConfig
  }
  items: RoadmapItem[]
}
```

### Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        BUILD TIME                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  roadmap/roadmap.json ──import──> roadmap/roadmap.ts            │
│         ↑                              │                         │
│         │                              │ typed export            │
│  Python scripts                        ↓                         │
│  (write JSON)              Next.js bundler (build)              │
│                                        │                         │
│                                        ↓                         │
│                            Static bundle with data               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        RUNTIME                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Browser request: /roadmap                                       │
│         │                                                        │
│         ↓                                                        │
│  Server Component (page.tsx)                                     │
│         │ imports roadmap data (already bundled)                 │
│         ↓                                                        │
│  Pass data as props to Client Component                          │
│         │                                                        │
│         ↓                                                        │
│  RoadmapPage (Client Component)                                  │
│         │ useState for view, filters                             │
│         ↓                                                        │
│  Render views, handle interactions                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### TypeScript Wrapper for JSON

```typescript
// roadmap/roadmap.ts
import roadmapJson from './roadmap.json'
import type { Roadmap } from '@/layers/features/roadmap/model/types'

// Type assertion with runtime validation in development
export const roadmap: Roadmap = roadmapJson as Roadmap

// Re-export for convenience
export type { Roadmap, RoadmapItem } from '@/layers/features/roadmap/model/types'
```

### Component Hierarchy

```
page.tsx (Server Component)
└── RoadmapPage (Client Component - 'use client')
    ├── RoadmapHeader
    │   ├── Project name, summary, last updated
    │   └── Theme toggle button
    ├── HealthDashboard
    │   ├── Must-Have % card (with warning)
    │   ├── Total Items card
    │   ├── In Progress card
    │   └── At Risk/Blocked card
    ├── RoadmapFilters
    │   ├── Type select
    │   ├── MoSCoW select
    │   ├── Status select
    │   └── Hide completed checkbox
    ├── ViewToggle
    │   └── Timeline | Status | Priority buttons
    ├── [View Component] (one of:)
    │   ├── TimelineView → columns by timeHorizon
    │   ├── StatusView → columns by status
    │   └── PriorityView → grouped by moscow
    │       └── RoadmapCard (for each item)
    │           ├── Title, description
    │           ├── Status badge
    │           ├── MoSCoW badge
    │           ├── Type badge
    │           ├── Health indicator
    │           ├── Effort points
    │           ├── DependencyPill (for each dep)
    │           ├── Label tags
    │           └── Spec links
    └── RoadmapModal (conditional)
        ├── All card content expanded
        ├── Full description
        ├── Metadata (health, horizon, dates, UUID)
        ├── Dependencies section
        ├── Ideation context
        └── "Start Ideation" button
```

### Styling Strategy

Use Tailwind CSS with the existing Calm Tech design system. Map the current CSS custom properties to Tailwind:

| Current CSS Variable | Tailwind Equivalent |
|---------------------|---------------------|
| `--foreground` | `text-foreground` |
| `--background` | `bg-background` |
| `--muted` | `bg-muted`, `text-muted-foreground` |
| `--destructive` | `text-destructive`, `bg-destructive` |
| `--success` | Custom: `text-success` |
| `--warning` | Custom: `text-warning` |
| `--info` | Custom: `text-info` |

Badge color mapping:

```typescript
// src/layers/features/roadmap/model/constants.ts

export const STATUS_COLORS: Record<Status, string> = {
  'not-started': 'bg-muted text-muted-foreground',
  'in-progress': 'bg-info/10 text-info border-info',
  'completed': 'bg-success/10 text-success border-success',
  'on-hold': 'bg-warning/10 text-warning border-warning',
}

export const MOSCOW_COLORS: Record<MoSCoW, string> = {
  'must-have': 'bg-destructive/10 text-destructive border-destructive',
  'should-have': 'bg-warning/10 text-warning border-warning',
  'could-have': 'bg-info/10 text-info border-info',
  'wont-have': 'bg-muted text-muted-foreground border-border',
}

export const HEALTH_COLORS: Record<Health, string> = {
  'on-track': 'text-success',
  'at-risk': 'text-warning',
  'off-track': 'text-destructive',
  'blocked': 'text-destructive',
}
```

### Key Component Implementations

#### RoadmapPage (Main Client Component)

```typescript
'use client'

import { useState, useMemo } from 'react'
import type { Roadmap, RoadmapItem } from '../model/types'

interface RoadmapPageProps {
  roadmap: Roadmap
}

type ViewMode = 'timeline' | 'status' | 'priority'

interface Filters {
  type: string
  moscow: string
  status: string
  hideCompleted: boolean
}

export function RoadmapPage({ roadmap }: RoadmapPageProps) {
  const [view, setView] = useState<ViewMode>('timeline')
  const [filters, setFilters] = useState<Filters>({
    type: '',
    moscow: '',
    status: '',
    hideCompleted: false,
  })
  const [selectedItem, setSelectedItem] = useState<RoadmapItem | null>(null)

  const filteredItems = useMemo(() => {
    return roadmap.items.filter(item => {
      if (filters.type && item.type !== filters.type) return false
      if (filters.moscow && item.moscow !== filters.moscow) return false
      if (filters.status && item.status !== filters.status) return false
      if (filters.hideCompleted && item.status === 'completed') return false
      return true
    })
  }, [roadmap.items, filters])

  return (
    <div className="container-default py-8">
      <RoadmapHeader roadmap={roadmap} />
      <HealthDashboard items={roadmap.items} />
      <div className="flex flex-col sm:flex-row gap-4 my-6">
        <RoadmapFilters filters={filters} onChange={setFilters} />
        <ViewToggle view={view} onChange={setView} />
      </div>
      {view === 'timeline' && (
        <TimelineView
          items={filteredItems}
          timeHorizons={roadmap.timeHorizons}
          onItemClick={setSelectedItem}
        />
      )}
      {view === 'status' && (
        <StatusView items={filteredItems} onItemClick={setSelectedItem} />
      )}
      {view === 'priority' && (
        <PriorityView items={filteredItems} onItemClick={setSelectedItem} />
      )}
      <RoadmapModal
        item={selectedItem}
        allItems={roadmap.items}
        onClose={() => setSelectedItem(null)}
      />
    </div>
  )
}
```

#### HealthDashboard

```typescript
interface HealthDashboardProps {
  items: RoadmapItem[]
}

export function HealthDashboard({ items }: HealthDashboardProps) {
  const metrics = useMemo(() => {
    const totalEffort = items.reduce((sum, item) => sum + (item.effort || 0), 0)
    const mustHaveEffort = items
      .filter(item => item.moscow === 'must-have')
      .reduce((sum, item) => sum + (item.effort || 0), 0)

    const mustHavePercent = totalEffort > 0
      ? Math.round((mustHaveEffort / totalEffort) * 100)
      : 0

    return {
      mustHavePercent,
      totalItems: items.length,
      inProgress: items.filter(i => i.status === 'in-progress').length,
      atRisk: items.filter(i =>
        i.health === 'at-risk' ||
        i.health === 'off-track' ||
        i.health === 'blocked'
      ).length,
    }
  }, [items])

  const isOverThreshold = metrics.mustHavePercent > 60

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold">
            <span className={isOverThreshold ? 'text-destructive' : ''}>
              {metrics.mustHavePercent}%
            </span>
          </div>
          <p className="text-sm text-muted-foreground">Must-Have</p>
          {isOverThreshold && (
            <p className="text-xs text-destructive mt-1">
              Exceeds 60% threshold
            </p>
          )}
        </CardContent>
      </Card>
      {/* Similar cards for other metrics */}
    </div>
  )
}
```

#### RoadmapCard

```typescript
interface RoadmapCardProps {
  item: RoadmapItem
  allItems: RoadmapItem[]
  onClick: () => void
}

export function RoadmapCard({ item, allItems, onClick }: RoadmapCardProps) {
  const copyIdeateCommand = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(`/ideate --roadmap-id ${item.id}`)
    // Toast notification
  }

  return (
    <Card
      className="cursor-pointer hover:shadow-elevated transition-shadow"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">{item.title}</CardTitle>
          <Badge className={STATUS_COLORS[item.status]}>
            {formatStatus(item.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {item.description && (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {item.description}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className={MOSCOW_COLORS[item.moscow]}>
            {formatMoSCoW(item.moscow)}
          </Badge>
          <Badge variant="outline">{formatType(item.type)}</Badge>
          {item.effort && (
            <span className="text-sm text-muted-foreground">
              {item.effort} pts
            </span>
          )}
        </div>
        {item.dependencies && item.dependencies.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {item.dependencies.map(depId => {
              const dep = allItems.find(i => i.id === depId)
              return dep ? (
                <DependencyPill key={depId} item={dep} />
              ) : null
            })}
          </div>
        )}
        {item.labels && item.labels.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {item.labels.map(label => (
              <Badge key={label} variant="secondary" className="text-xs">
                {label}
              </Badge>
            ))}
          </div>
        )}
        {item.linkedArtifacts?.specSlug && (
          <div className="flex gap-2 text-xs">
            {item.linkedArtifacts.ideationPath && (
              <a className="text-info hover:underline">Ideation</a>
            )}
            {item.linkedArtifacts.specPath && (
              <a className="text-info hover:underline">Spec</a>
            )}
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={copyIdeateCommand}
          className="w-full mt-2"
        >
          <Copy className="w-4 h-4 mr-2" />
          Copy /ideate command
        </Button>
      </CardContent>
    </Card>
  )
}
```

---

## User Experience

### Navigation
- Users navigate to `/roadmap` from the main navigation or direct URL
- Page loads with Timeline view as default
- View persists in URL query params for shareability (optional enhancement)

### Interactions
1. **View switching** - Click Timeline/Status/Priority tabs to change grouping
2. **Filtering** - Use dropdowns and checkbox to filter items
3. **Item details** - Click any card to open detail modal
4. **Copy command** - Click "Copy /ideate command" button to copy CLI command
5. **Theme toggle** - Switch between light/dark mode

### Empty States
- No items: "No roadmap items yet. Use `/roadmap:add` to create one."
- No matches: "No items match the current filters."

### Loading States
- Initial load: Server-rendered, no loading state needed
- Theme toggle: Instant, no loading state

---

## Testing Strategy

### Unit Tests

```typescript
// __tests__/features/roadmap/health-dashboard.test.tsx
describe('HealthDashboard', () => {
  // Purpose: Verify must-have percentage calculation is accurate
  it('calculates must-have percentage correctly', () => {
    const items = [
      { moscow: 'must-have', effort: 5 },
      { moscow: 'should-have', effort: 5 },
    ]
    // Expected: 50%
  })

  // Purpose: Verify warning appears when threshold exceeded
  it('shows warning when must-have exceeds 60%', () => {
    const items = [
      { moscow: 'must-have', effort: 7 },
      { moscow: 'should-have', effort: 3 },
    ]
    // Expected: Warning visible
  })

  // Purpose: Verify handles items without effort gracefully
  it('handles items without effort values', () => {
    const items = [
      { moscow: 'must-have' }, // no effort
    ]
    // Expected: No crash, shows 0% or handles gracefully
  })
})
```

### Integration Tests

```typescript
// __tests__/features/roadmap/filtering.test.tsx
describe('Roadmap Filtering', () => {
  // Purpose: Verify filter combinations work correctly
  it('filters items by multiple criteria', () => {
    // Given items with various types, statuses, moscow values
    // When filter by type=feature AND moscow=must-have
    // Then only matching items shown
  })

  // Purpose: Verify hide completed works across all views
  it('hides completed items in all views', () => {
    // Given mix of completed and non-completed items
    // When hide completed checked
    // Then completed items hidden in timeline, status, and priority views
  })
})
```

### E2E Tests (Optional)

```typescript
// e2e/roadmap.spec.ts
describe('Roadmap Page', () => {
  // Purpose: Verify page loads and is accessible
  it('loads roadmap page successfully', async () => {
    await page.goto('/roadmap')
    await expect(page.locator('h1')).toContainText('Roadmap')
  })

  // Purpose: Verify view switching works
  it('switches between views', async () => {
    await page.click('text=Status')
    await expect(page.locator('.status-view')).toBeVisible()
  })

  // Purpose: Verify modal opens and closes
  it('opens item detail modal', async () => {
    await page.click('.roadmap-card:first-child')
    await expect(page.locator('[role="dialog"]')).toBeVisible()
  })
})
```

---

## Performance Considerations

### Build-time Optimization
- Roadmap data bundled at build time (no runtime file reads)
- Server Component for initial HTML (fast Time to First Byte)
- Client Component hydration for interactivity

### Runtime Optimization
- `useMemo` for filtered items (avoid recalculation on every render)
- Event delegation for card clicks (if many items)
- No network requests after initial load

### Bundle Size
- Roadmap data is small (<50KB expected)
- Shadcn components tree-shakeable
- Icons loaded on-demand from Lucide

---

## Security Considerations

### Data Security
- Roadmap is public data, no sensitive information
- No user input stored server-side
- No authentication required

### XSS Prevention
- React automatically escapes content
- No `dangerouslySetInnerHTML` used
- Markdown rendering (if added) should use sanitizer

### CSRF
- No mutations, so CSRF not applicable

---

## Documentation

### Developer Guide Updates
- Add section to `developer-guides/01-project-structure.md` about roadmap feature location
- Update `CLAUDE.md` with new roadmap commands if any change

### Inline Documentation
- JSDoc comments on exported types
- Component prop documentation
- Helper function documentation

---

## Implementation Phases

### Phase 1: Foundation
1. Create TypeScript types and Zod schemas from schema.json
2. Create `roadmap/roadmap.ts` TypeScript wrapper
3. Set up feature directory structure
4. Create basic page route with data loading
5. Add URL query param state for view mode and filters (nuqs or useSearchParams)

### Phase 2: Core Components
1. RoadmapHeader component
2. HealthDashboard component
3. RoadmapCard component
4. ViewToggle component
5. Basic TimelineView (just cards in columns)

### Phase 3: Views & Filtering
1. StatusView component
2. PriorityView component
3. RoadmapFilters component
4. Filter logic integration

### Phase 4: Modal & Polish
1. RoadmapModal component with full details
2. DependencyPill component
3. Copy /ideate command functionality
4. Empty states
5. Responsive refinements

### Phase 5: Verification
1. Verify Python scripts still work
2. Verify `/roadmap:*` commands still work
3. Test Vercel deployment
4. Cross-browser testing

---

## Open Questions (All Resolved)

1. ~~**URL State Persistence**~~ (RESOLVED)
   **Answer:** Include in Phase 1 — view mode and filters will be persisted in URL query params for shareable links and back button support.

2. ~~**Markdown Rendering in Modal**~~ (RESOLVED)
   **Answer:** Link to spec files only — users click links to view specs. No inline markdown rendering needed for MVP.

3. ~~**Real-time Refresh**~~ (RESOLVED)
   **Answer:** No auto-refresh — data is bundled at build time, changes require redeploy anyway.

---

## References

- **Ideation Document:** `specs/roadmap-integration/01-ideation.md`
- **Existing Schema:** `roadmap/schema.json`
- **Existing Implementation:** `roadmap/scripts.js`, `roadmap/styles.css`
- **FSD Architecture:** `developer-guides/01-project-structure.md`
- **Shadcn UI:** https://ui.shadcn.com/docs
- **Next.js App Router:** https://nextjs.org/docs/app
