# Task Breakdown: Roadmap Integration into Next.js Application

Generated: 2026-02-01
Source: specs/roadmap-integration/02-specification.md
Last Decompose: 2026-02-01

## Overview

Integrate the standalone roadmap visualization (vanilla HTML/CSS/JS) into the main Next.js application as a fully-featured React implementation. The roadmap will be accessible at `/roadmap`, work in both development and Vercel production, and maintain compatibility with existing Python CLI tools.

## Implementation Phases

- **Phase 1: Foundation** (4 tasks) - Types, schemas, directory structure, data wrapper
- **Phase 2: Core Components** (5 tasks) - Header, health dashboard, card, view toggle, timeline view
- **Phase 3: Views & Filtering** (4 tasks) - Status view, priority view, filters, filter integration
- **Phase 4: Modal & Polish** (5 tasks) - Modal, dependency pills, copy command, empty states, responsive
- **Phase 5: Verification** (3 tasks) - CLI compatibility, Vercel deployment, documentation

---

## Phase 1: Foundation

### Task 1.1: Create TypeScript types and Zod schemas

**Description**: Define all TypeScript types and Zod schemas for roadmap data based on the existing schema.json.

**Size**: Medium
**Priority**: High
**Dependencies**: None
**Can run parallel with**: None (foundation task)

**Technical Requirements**:
- Create types file at `src/layers/features/roadmap/model/types.ts`
- Create schemas file at `src/layers/features/roadmap/model/schemas.ts`
- Types must match existing schema.json exactly
- Include all enums: RoadmapItemType, MoSCoW, Status, Health, TimeHorizon
- Include all interfaces: LinkedArtifacts, IdeationContext, RoadmapItem, TimeHorizonConfig, Roadmap

**Implementation**:

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

```typescript
// src/layers/features/roadmap/model/schemas.ts

import { z } from 'zod/v4'

export const roadmapItemTypeSchema = z.enum(['feature', 'bugfix', 'technical-debt', 'research', 'epic'])
export const moscowSchema = z.enum(['must-have', 'should-have', 'could-have', 'wont-have'])
export const statusSchema = z.enum(['not-started', 'in-progress', 'completed', 'on-hold'])
export const healthSchema = z.enum(['on-track', 'at-risk', 'off-track', 'blocked'])
export const timeHorizonSchema = z.enum(['now', 'next', 'later'])

export const linkedArtifactsSchema = z.object({
  specSlug: z.string().optional(),
  ideationPath: z.string().optional(),
  specPath: z.string().optional(),
  tasksPath: z.string().optional(),
  implementationPath: z.string().optional(),
})

export const ideationContextSchema = z.object({
  targetUsers: z.array(z.string()).optional(),
  painPoints: z.array(z.string()).optional(),
  successCriteria: z.array(z.string()).optional(),
  constraints: z.array(z.string()).optional(),
})

export const roadmapItemSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(3).max(200),
  description: z.string().max(2000).optional(),
  type: roadmapItemTypeSchema,
  moscow: moscowSchema,
  status: statusSchema,
  health: healthSchema,
  timeHorizon: timeHorizonSchema,
  effort: z.number().min(0).max(13).optional(),
  dependencies: z.array(z.string().uuid()).optional(),
  labels: z.array(z.string()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  linkedArtifacts: linkedArtifactsSchema.optional(),
  ideationContext: ideationContextSchema.optional(),
})

export const timeHorizonConfigSchema = z.object({
  label: z.string(),
  description: z.string(),
})

export const roadmapSchema = z.object({
  projectName: z.string().min(1).max(100),
  projectSummary: z.string().max(500),
  lastUpdated: z.string().datetime(),
  timeHorizons: z.object({
    now: timeHorizonConfigSchema,
    next: timeHorizonConfigSchema,
    later: timeHorizonConfigSchema,
  }),
  items: z.array(roadmapItemSchema),
})
```

**Acceptance Criteria**:
- [ ] types.ts exports all type definitions matching schema.json
- [ ] schemas.ts exports Zod schemas for validation
- [ ] Types compile without errors
- [ ] Schema validation matches existing schema.json constraints (UUID v4 pattern, min/max lengths)

---

### Task 1.2: Create constants and color mappings

**Description**: Create constants file with status colors, MoSCoW colors, health colors, and formatting utilities.

**Size**: Small
**Priority**: High
**Dependencies**: Task 1.1
**Can run parallel with**: Task 1.3, Task 1.4

**Technical Requirements**:
- Create constants file at `src/layers/features/roadmap/model/constants.ts`
- Map colors using existing Tailwind CSS variables from globals.css
- Include formatting functions for display text

**Implementation**:

```typescript
// src/layers/features/roadmap/model/constants.ts

import type { Status, MoSCoW, Health, RoadmapItemType, TimeHorizon } from './types'

export const STATUS_COLORS: Record<Status, string> = {
  'not-started': 'bg-muted text-muted-foreground',
  'in-progress': 'bg-info/10 text-info border-info/30',
  'completed': 'bg-success/10 text-success border-success/30',
  'on-hold': 'bg-warning/10 text-warning border-warning/30',
}

export const MOSCOW_COLORS: Record<MoSCoW, string> = {
  'must-have': 'bg-destructive/10 text-destructive border-destructive/30',
  'should-have': 'bg-warning/10 text-warning border-warning/30',
  'could-have': 'bg-info/10 text-info border-info/30',
  'wont-have': 'bg-muted text-muted-foreground border-border',
}

export const HEALTH_COLORS: Record<Health, string> = {
  'on-track': 'text-success',
  'at-risk': 'text-warning',
  'off-track': 'text-destructive',
  'blocked': 'text-destructive',
}

export const TYPE_ICONS: Record<RoadmapItemType, string> = {
  'feature': 'Sparkles',
  'bugfix': 'Bug',
  'technical-debt': 'Wrench',
  'research': 'Search',
  'epic': 'Layers',
}

export const HEALTH_ICONS: Record<Health, string> = {
  'on-track': 'CheckCircle2',
  'at-risk': 'AlertTriangle',
  'off-track': 'XCircle',
  'blocked': 'Ban',
}

// Formatting functions
export function formatStatus(status: Status): string {
  return status.split('-').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}

export function formatMoSCoW(moscow: MoSCoW): string {
  const mapping: Record<MoSCoW, string> = {
    'must-have': 'Must Have',
    'should-have': 'Should Have',
    'could-have': 'Could Have',
    'wont-have': "Won't Have",
  }
  return mapping[moscow]
}

export function formatType(type: RoadmapItemType): string {
  const mapping: Record<RoadmapItemType, string> = {
    'feature': 'Feature',
    'bugfix': 'Bug Fix',
    'technical-debt': 'Tech Debt',
    'research': 'Research',
    'epic': 'Epic',
  }
  return mapping[type]
}

export function formatTimeHorizon(horizon: TimeHorizon): string {
  const mapping: Record<TimeHorizon, string> = {
    'now': 'Now',
    'next': 'Next',
    'later': 'Later',
  }
  return mapping[horizon]
}

export function formatHealth(health: Health): string {
  return health.split('-').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}
```

**Acceptance Criteria**:
- [ ] All color constants use existing Tailwind CSS variables
- [ ] Color mappings work with light and dark themes
- [ ] Formatting functions return human-readable text
- [ ] All enum values have corresponding colors/formats

---

### Task 1.3: Create TypeScript wrapper for roadmap.json

**Description**: Create a TypeScript wrapper that imports roadmap.json with proper typing.

**Size**: Small
**Priority**: High
**Dependencies**: Task 1.1
**Can run parallel with**: Task 1.2, Task 1.4

**Technical Requirements**:
- Create wrapper at `roadmap/roadmap.ts`
- Import JSON with type assertion
- Enable JSON imports in tsconfig.json if needed
- Re-export types for convenience

**Implementation**:

```typescript
// roadmap/roadmap.ts

import roadmapJson from './roadmap.json'
import type { Roadmap, RoadmapItem } from '@/layers/features/roadmap/model/types'

// Type assertion - JSON is validated by Python scripts
export const roadmap: Roadmap = roadmapJson as Roadmap

// Re-export types for convenience
export type { Roadmap, RoadmapItem } from '@/layers/features/roadmap/model/types'
```

Also ensure tsconfig.json has:
```json
{
  "compilerOptions": {
    "resolveJsonModule": true,
    "esModuleInterop": true
  }
}
```

**Acceptance Criteria**:
- [ ] roadmap.ts successfully imports roadmap.json
- [ ] Export is properly typed as Roadmap
- [ ] Import works from Next.js pages/components
- [ ] No TypeScript errors

---

### Task 1.4: Set up feature directory structure and page route

**Description**: Create the FSD-compliant directory structure and basic page route.

**Size**: Medium
**Priority**: High
**Dependencies**: Task 1.1
**Can run parallel with**: Task 1.2, Task 1.3

**Technical Requirements**:
- Create directory structure matching FSD architecture
- Create server component page at `src/app/(public)/roadmap/page.tsx`
- Add basic metadata for SEO
- Import roadmap data and pass to client component (placeholder)

**Implementation**:

Create directories:
```
src/layers/features/roadmap/
├── ui/
│   └── index.ts
├── model/
│   ├── types.ts
│   ├── schemas.ts
│   └── constants.ts
├── lib/
│   └── roadmap-utils.ts
└── index.ts
```

```typescript
// src/layers/features/roadmap/index.ts
export * from './model/types'
export * from './model/constants'
// UI components will be added as they're created
```

```typescript
// src/layers/features/roadmap/lib/roadmap-utils.ts

import type { RoadmapItem, TimeHorizon, Status, MoSCoW } from '../model/types'

/**
 * Group items by a specific field
 */
export function groupItemsBy<K extends keyof RoadmapItem>(
  items: RoadmapItem[],
  key: K
): Map<RoadmapItem[K], RoadmapItem[]> {
  const groups = new Map<RoadmapItem[K], RoadmapItem[]>()

  for (const item of items) {
    const value = item[key]
    const existing = groups.get(value) ?? []
    groups.set(value, [...existing, item])
  }

  return groups
}

/**
 * Get items grouped by time horizon in order: now, next, later
 */
export function getItemsByTimeHorizon(items: RoadmapItem[]): {
  now: RoadmapItem[]
  next: RoadmapItem[]
  later: RoadmapItem[]
} {
  return {
    now: items.filter(i => i.timeHorizon === 'now'),
    next: items.filter(i => i.timeHorizon === 'next'),
    later: items.filter(i => i.timeHorizon === 'later'),
  }
}

/**
 * Get items grouped by status
 */
export function getItemsByStatus(items: RoadmapItem[]): {
  'not-started': RoadmapItem[]
  'in-progress': RoadmapItem[]
  'completed': RoadmapItem[]
  'on-hold': RoadmapItem[]
} {
  return {
    'not-started': items.filter(i => i.status === 'not-started'),
    'in-progress': items.filter(i => i.status === 'in-progress'),
    'completed': items.filter(i => i.status === 'completed'),
    'on-hold': items.filter(i => i.status === 'on-hold'),
  }
}

/**
 * Get items grouped by MoSCoW priority
 */
export function getItemsByMoSCoW(items: RoadmapItem[]): {
  'must-have': RoadmapItem[]
  'should-have': RoadmapItem[]
  'could-have': RoadmapItem[]
  'wont-have': RoadmapItem[]
} {
  return {
    'must-have': items.filter(i => i.moscow === 'must-have'),
    'should-have': items.filter(i => i.moscow === 'should-have'),
    'could-have': items.filter(i => i.moscow === 'could-have'),
    'wont-have': items.filter(i => i.moscow === 'wont-have'),
  }
}

/**
 * Calculate total effort for a set of items
 */
export function calculateTotalEffort(items: RoadmapItem[]): number {
  return items.reduce((sum, item) => sum + (item.effort ?? 0), 0)
}

/**
 * Find an item by ID
 */
export function findItemById(items: RoadmapItem[], id: string): RoadmapItem | undefined {
  return items.find(item => item.id === id)
}

/**
 * Get all dependencies for an item
 */
export function getItemDependencies(item: RoadmapItem, allItems: RoadmapItem[]): RoadmapItem[] {
  if (!item.dependencies || item.dependencies.length === 0) {
    return []
  }
  return item.dependencies
    .map(depId => findItemById(allItems, depId))
    .filter((dep): dep is RoadmapItem => dep !== undefined)
}
```

```typescript
// src/app/(public)/roadmap/page.tsx

import type { Metadata } from 'next'
import { roadmap } from '@/../roadmap/roadmap'

export const metadata: Metadata = {
  title: 'Roadmap | Next.js Boilerplate',
  description: 'Product roadmap and feature planning for the Next.js Boilerplate project.',
}

export default function RoadmapPage() {
  return (
    <main className="min-h-screen">
      {/* RoadmapPage client component will be added in Phase 2 */}
      <div className="container-default py-8">
        <h1 className="text-3xl font-bold">{roadmap.projectName} Roadmap</h1>
        <p className="text-muted-foreground mt-2">{roadmap.projectSummary}</p>
        <p className="text-sm text-muted-foreground mt-4">
          {roadmap.items.length} items loaded. Full visualization coming soon.
        </p>
      </div>
    </main>
  )
}
```

**Acceptance Criteria**:
- [ ] Directory structure created following FSD architecture
- [ ] Page accessible at `/roadmap` in development
- [ ] Metadata renders correctly
- [ ] Roadmap data loads without errors
- [ ] Index files properly export modules

---

### Task 1.5: Add URL state management with nuqs

**Description**: Set up URL state management for view mode and filters using nuqs for shareable links.

**Size**: Small
**Priority**: Medium
**Dependencies**: Task 1.4
**Can run parallel with**: Phase 2 tasks

**Technical Requirements**:
- Install nuqs if not already installed
- Create URL state parsers for view mode and filters
- Integrate with NuqsAdapter in providers

**Implementation**:

```bash
pnpm add nuqs
```

```typescript
// src/layers/features/roadmap/lib/url-state.ts

import { parseAsString, parseAsBoolean, createParser } from 'nuqs'

// View mode parser
export const viewParser = parseAsString.withDefault('timeline')

// Filter parsers
export const typeFilterParser = parseAsString.withDefault('')
export const moscowFilterParser = parseAsString.withDefault('')
export const statusFilterParser = parseAsString.withDefault('')
export const hideCompletedParser = parseAsBoolean.withDefault(false)

// Combined hook will be used in RoadmapPage component
```

Update providers to include NuqsAdapter:

```typescript
// src/app/providers.tsx - add NuqsAdapter wrapping
import { NuqsAdapter } from 'nuqs/adapters/next/app'

// Wrap children with NuqsAdapter
```

**Acceptance Criteria**:
- [ ] nuqs installed and configured
- [ ] View mode persists in URL (e.g., `/roadmap?view=status`)
- [ ] Filters persist in URL (e.g., `/roadmap?type=feature&moscow=must-have`)
- [ ] Back button works correctly
- [ ] Links are shareable with state

---

## Phase 2: Core Components

### Task 2.1: Create RoadmapHeader component

**Description**: Create the header component showing project info and theme toggle.

**Size**: Small
**Priority**: High
**Dependencies**: Task 1.4
**Can run parallel with**: Task 2.2, Task 2.3

**Technical Requirements**:
- Display project name, summary, last updated date
- Include theme toggle button (use existing next-themes)
- Responsive design

**Implementation**:

```typescript
// src/layers/features/roadmap/ui/RoadmapHeader.tsx
'use client'

import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Roadmap } from '../model/types'

interface RoadmapHeaderProps {
  roadmap: Roadmap
}

export function RoadmapHeader({ roadmap }: RoadmapHeaderProps) {
  const { theme, setTheme } = useTheme()

  const formattedDate = new Date(roadmap.lastUpdated).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {roadmap.projectName} Roadmap
        </h1>
        <p className="text-muted-foreground mt-1">
          {roadmap.projectSummary}
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Last updated: {formattedDate}
        </p>
      </div>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        aria-label="Toggle theme"
      >
        <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      </Button>
    </header>
  )
}
```

**Acceptance Criteria**:
- [ ] Displays project name as h1
- [ ] Shows project summary
- [ ] Shows formatted last updated date
- [ ] Theme toggle works
- [ ] Responsive layout (stacks on mobile)

---

### Task 2.2: Create HealthDashboard component

**Description**: Create the 4-metric health dashboard showing must-have %, total items, in-progress, and at-risk counts.

**Size**: Medium
**Priority**: High
**Dependencies**: Task 1.4
**Can run parallel with**: Task 2.1, Task 2.3

**Technical Requirements**:
- Calculate must-have percentage by effort
- Show warning when exceeds 60% threshold
- Display total items, in-progress count, at-risk/blocked count
- Use Card components

**Implementation**:

```typescript
// src/layers/features/roadmap/ui/HealthDashboard.tsx
'use client'

import { useMemo } from 'react'
import { AlertTriangle, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { RoadmapItem } from '../model/types'
import { calculateTotalEffort } from '../lib/roadmap-utils'

interface HealthDashboardProps {
  items: RoadmapItem[]
}

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  warning?: boolean
  warningMessage?: string
}

function MetricCard({ title, value, subtitle, icon, warning, warningMessage }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className={`text-2xl font-bold mt-1 ${warning ? 'text-destructive' : ''}`}>
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
            {warning && warningMessage && (
              <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {warningMessage}
              </p>
            )}
          </div>
          <div className="text-muted-foreground">{icon}</div>
        </div>
      </CardContent>
    </Card>
  )
}

export function HealthDashboard({ items }: HealthDashboardProps) {
  const metrics = useMemo(() => {
    const totalEffort = calculateTotalEffort(items)
    const mustHaveItems = items.filter(item => item.moscow === 'must-have')
    const mustHaveEffort = calculateTotalEffort(mustHaveItems)

    const mustHavePercent = totalEffort > 0
      ? Math.round((mustHaveEffort / totalEffort) * 100)
      : 0

    const inProgressCount = items.filter(i => i.status === 'in-progress').length
    const atRiskCount = items.filter(i =>
      i.health === 'at-risk' ||
      i.health === 'off-track' ||
      i.health === 'blocked'
    ).length

    return {
      mustHavePercent,
      totalItems: items.length,
      inProgress: inProgressCount,
      atRisk: atRiskCount,
      isOverThreshold: mustHavePercent > 60,
    }
  }, [items])

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
      <MetricCard
        title="Must-Have"
        value={`${metrics.mustHavePercent}%`}
        subtitle="of total effort"
        icon={<AlertCircle className="h-5 w-5" />}
        warning={metrics.isOverThreshold}
        warningMessage="Exceeds 60% threshold"
      />
      <MetricCard
        title="Total Items"
        value={metrics.totalItems}
        icon={<CheckCircle2 className="h-5 w-5" />}
      />
      <MetricCard
        title="In Progress"
        value={metrics.inProgress}
        icon={<Clock className="h-5 w-5" />}
      />
      <MetricCard
        title="At Risk"
        value={metrics.atRisk}
        subtitle={metrics.atRisk > 0 ? 'needs attention' : 'all healthy'}
        icon={<AlertTriangle className="h-5 w-5" />}
        warning={metrics.atRisk > 0}
      />
    </div>
  )
}
```

**Acceptance Criteria**:
- [ ] Calculates must-have percentage correctly (by effort, not count)
- [ ] Shows warning when must-have exceeds 60%
- [ ] Displays accurate total items count
- [ ] Shows correct in-progress count
- [ ] Shows at-risk + off-track + blocked count
- [ ] Handles items without effort values gracefully (0% if no effort)
- [ ] Responsive 2x2 grid on mobile, 4 columns on desktop

---

### Task 2.3: Create RoadmapCard component

**Description**: Create the card component for displaying individual roadmap items.

**Size**: Large
**Priority**: High
**Dependencies**: Task 1.2, Task 1.4
**Can run parallel with**: Task 2.1, Task 2.2

**Technical Requirements**:
- Display title, description (truncated), status badge, MoSCoW badge, type badge
- Show health indicator, effort points
- Display dependency pills (placeholder for now)
- Show labels
- Show spec links if available
- "Copy /ideate command" button
- Clickable to open modal

**Implementation**:

```typescript
// src/layers/features/roadmap/ui/RoadmapCard.tsx
'use client'

import { Copy, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { RoadmapItem } from '../model/types'
import {
  STATUS_COLORS,
  MOSCOW_COLORS,
  HEALTH_COLORS,
  formatStatus,
  formatMoSCoW,
  formatType,
  formatHealth,
} from '../model/constants'
import { DependencyPill } from './DependencyPill'

interface RoadmapCardProps {
  item: RoadmapItem
  allItems: RoadmapItem[]
  onClick: () => void
}

export function RoadmapCard({ item, allItems, onClick }: RoadmapCardProps) {
  const copyIdeateCommand = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(`/ideate --roadmap-id ${item.id}`)
    toast.success('Command copied to clipboard')
  }

  const healthColorClass = HEALTH_COLORS[item.health]

  return (
    <Card
      className="cursor-pointer hover:shadow-elevated transition-shadow"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base font-semibold leading-tight">
            {item.title}
          </CardTitle>
          <Badge className={`shrink-0 ${STATUS_COLORS[item.status]}`}>
            {formatStatus(item.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {item.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {item.description}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className={MOSCOW_COLORS[item.moscow]}>
            {formatMoSCoW(item.moscow)}
          </Badge>
          <Badge variant="outline">
            {formatType(item.type)}
          </Badge>
          {item.effort !== undefined && item.effort > 0 && (
            <Badge variant="secondary">
              {item.effort} pts
            </Badge>
          )}
          <span className={`text-sm flex items-center gap-1 ${healthColorClass}`}>
            {formatHealth(item.health)}
          </span>
        </div>

        {item.dependencies && item.dependencies.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
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
          <div className="flex gap-3 text-xs">
            {item.linkedArtifacts.ideationPath && (
              <span className="text-info flex items-center gap-1">
                <ExternalLink className="h-3 w-3" />
                Ideation
              </span>
            )}
            {item.linkedArtifacts.specPath && (
              <span className="text-info flex items-center gap-1">
                <ExternalLink className="h-3 w-3" />
                Spec
              </span>
            )}
            {item.linkedArtifacts.tasksPath && (
              <span className="text-info flex items-center gap-1">
                <ExternalLink className="h-3 w-3" />
                Tasks
              </span>
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

**Acceptance Criteria**:
- [ ] Displays title and truncated description
- [ ] Shows status badge with correct color
- [ ] Shows MoSCoW badge with correct color
- [ ] Shows type badge
- [ ] Shows effort points if present
- [ ] Shows health indicator with correct color
- [ ] Shows dependency pills (using placeholder if DependencyPill not ready)
- [ ] Shows labels
- [ ] Shows spec links if linkedArtifacts present
- [ ] Copy command button works (copies to clipboard)
- [ ] Card is clickable
- [ ] Hover state shows elevated shadow

---

### Task 2.4: Create ViewToggle component

**Description**: Create the view toggle button group for switching between Timeline, Status, and Priority views.

**Size**: Small
**Priority**: High
**Dependencies**: Task 1.4
**Can run parallel with**: Task 2.1, Task 2.2, Task 2.3

**Technical Requirements**:
- Three buttons: Timeline, Status, Priority
- Active state styling
- Use ButtonGroup or ToggleGroup component

**Implementation**:

```typescript
// src/layers/features/roadmap/ui/ViewToggle.tsx
'use client'

import { LayoutGrid, CheckSquare, ListOrdered } from 'lucide-react'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

export type ViewMode = 'timeline' | 'status' | 'priority'

interface ViewToggleProps {
  view: ViewMode
  onChange: (view: ViewMode) => void
}

export function ViewToggle({ view, onChange }: ViewToggleProps) {
  return (
    <ToggleGroup
      type="single"
      value={view}
      onValueChange={(value) => {
        if (value) onChange(value as ViewMode)
      }}
      className="justify-start"
    >
      <ToggleGroupItem value="timeline" aria-label="Timeline view">
        <LayoutGrid className="h-4 w-4 mr-2" />
        Timeline
      </ToggleGroupItem>
      <ToggleGroupItem value="status" aria-label="Status view">
        <CheckSquare className="h-4 w-4 mr-2" />
        Status
      </ToggleGroupItem>
      <ToggleGroupItem value="priority" aria-label="Priority view">
        <ListOrdered className="h-4 w-4 mr-2" />
        Priority
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
```

**Acceptance Criteria**:
- [ ] Three view options displayed
- [ ] Active view visually highlighted
- [ ] Click changes view
- [ ] Keyboard accessible
- [ ] Icons visible

---

### Task 2.5: Create TimelineView component

**Description**: Create the timeline view showing items in Now/Next/Later columns.

**Size**: Medium
**Priority**: High
**Dependencies**: Task 2.3, Task 1.4
**Can run parallel with**: None (needs RoadmapCard)

**Technical Requirements**:
- Three columns: Now, Next, Later
- Each column shows items with that timeHorizon
- Use RoadmapCard for each item
- Responsive: stack on mobile, 3-column on desktop
- Show time horizon label and description

**Implementation**:

```typescript
// src/layers/features/roadmap/ui/TimelineView.tsx
'use client'

import type { RoadmapItem, Roadmap } from '../model/types'
import { getItemsByTimeHorizon } from '../lib/roadmap-utils'
import { RoadmapCard } from './RoadmapCard'

interface TimelineViewProps {
  items: RoadmapItem[]
  timeHorizons: Roadmap['timeHorizons']
  allItems: RoadmapItem[]
  onItemClick: (item: RoadmapItem) => void
}

interface ColumnProps {
  title: string
  description: string
  items: RoadmapItem[]
  allItems: RoadmapItem[]
  onItemClick: (item: RoadmapItem) => void
}

function Column({ title, description, items, allItems, onItemClick }: ColumnProps) {
  return (
    <div className="flex-1 min-w-0">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {items.length} {items.length === 1 ? 'item' : 'items'}
        </p>
      </div>
      <div className="space-y-4">
        {items.map(item => (
          <RoadmapCard
            key={item.id}
            item={item}
            allItems={allItems}
            onClick={() => onItemClick(item)}
          />
        ))}
        {items.length === 0 && (
          <p className="text-sm text-muted-foreground italic py-8 text-center">
            No items in this time horizon
          </p>
        )}
      </div>
    </div>
  )
}

export function TimelineView({ items, timeHorizons, allItems, onItemClick }: TimelineViewProps) {
  const grouped = getItemsByTimeHorizon(items)

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Column
        title={timeHorizons.now.label}
        description={timeHorizons.now.description}
        items={grouped.now}
        allItems={allItems}
        onItemClick={onItemClick}
      />
      <Column
        title={timeHorizons.next.label}
        description={timeHorizons.next.description}
        items={grouped.next}
        allItems={allItems}
        onItemClick={onItemClick}
      />
      <Column
        title={timeHorizons.later.label}
        description={timeHorizons.later.description}
        items={grouped.later}
        allItems={allItems}
        onItemClick={onItemClick}
      />
    </div>
  )
}
```

**Acceptance Criteria**:
- [ ] Three columns displayed (Now, Next, Later)
- [ ] Items grouped correctly by timeHorizon
- [ ] Column headers show label and description from config
- [ ] Shows item count per column
- [ ] Empty state message when no items in column
- [ ] Responsive: stacks on mobile
- [ ] Cards are clickable

---

## Phase 3: Views & Filtering

### Task 3.1: Create StatusView component

**Description**: Create the status view showing items grouped by status columns.

**Size**: Medium
**Priority**: High
**Dependencies**: Task 2.3
**Can run parallel with**: Task 3.2

**Technical Requirements**:
- Four columns: Not Started, In Progress, Completed, On Hold
- Order: not-started, in-progress, completed, on-hold
- Use RoadmapCard for each item
- Responsive layout

**Implementation**:

```typescript
// src/layers/features/roadmap/ui/StatusView.tsx
'use client'

import type { RoadmapItem, Status } from '../model/types'
import { getItemsByStatus } from '../lib/roadmap-utils'
import { formatStatus, STATUS_COLORS } from '../model/constants'
import { RoadmapCard } from './RoadmapCard'

interface StatusViewProps {
  items: RoadmapItem[]
  allItems: RoadmapItem[]
  onItemClick: (item: RoadmapItem) => void
}

const STATUS_ORDER: Status[] = ['not-started', 'in-progress', 'completed', 'on-hold']

interface ColumnProps {
  status: Status
  items: RoadmapItem[]
  allItems: RoadmapItem[]
  onItemClick: (item: RoadmapItem) => void
}

function Column({ status, items, allItems, onItemClick }: ColumnProps) {
  return (
    <div className="flex-1 min-w-0">
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">{formatStatus(status)}</h2>
          <span className={`text-sm px-2 py-0.5 rounded ${STATUS_COLORS[status]}`}>
            {items.length}
          </span>
        </div>
      </div>
      <div className="space-y-4">
        {items.map(item => (
          <RoadmapCard
            key={item.id}
            item={item}
            allItems={allItems}
            onClick={() => onItemClick(item)}
          />
        ))}
        {items.length === 0 && (
          <p className="text-sm text-muted-foreground italic py-8 text-center">
            No items with this status
          </p>
        )}
      </div>
    </div>
  )
}

export function StatusView({ items, allItems, onItemClick }: StatusViewProps) {
  const grouped = getItemsByStatus(items)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {STATUS_ORDER.map(status => (
        <Column
          key={status}
          status={status}
          items={grouped[status]}
          allItems={allItems}
          onItemClick={onItemClick}
        />
      ))}
    </div>
  )
}
```

**Acceptance Criteria**:
- [ ] Four columns in correct order
- [ ] Items grouped correctly by status
- [ ] Column headers show status name and count
- [ ] Empty state message when no items
- [ ] Responsive: 1 column mobile, 2 tablet, 4 desktop

---

### Task 3.2: Create PriorityView component

**Description**: Create the priority view showing items grouped by MoSCoW priority as a list.

**Size**: Medium
**Priority**: High
**Dependencies**: Task 2.3
**Can run parallel with**: Task 3.1

**Technical Requirements**:
- Four sections: Must Have, Should Have, Could Have, Won't Have
- Vertical list layout (not columns)
- Collapsible sections (optional)
- Use RoadmapCard for each item

**Implementation**:

```typescript
// src/layers/features/roadmap/ui/PriorityView.tsx
'use client'

import type { RoadmapItem, MoSCoW } from '../model/types'
import { getItemsByMoSCoW, calculateTotalEffort } from '../lib/roadmap-utils'
import { formatMoSCoW, MOSCOW_COLORS } from '../model/constants'
import { RoadmapCard } from './RoadmapCard'

interface PriorityViewProps {
  items: RoadmapItem[]
  allItems: RoadmapItem[]
  onItemClick: (item: RoadmapItem) => void
}

const MOSCOW_ORDER: MoSCoW[] = ['must-have', 'should-have', 'could-have', 'wont-have']

interface SectionProps {
  moscow: MoSCoW
  items: RoadmapItem[]
  allItems: RoadmapItem[]
  onItemClick: (item: RoadmapItem) => void
}

function Section({ moscow, items, allItems, onItemClick }: SectionProps) {
  const totalEffort = calculateTotalEffort(items)

  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-xl font-semibold">{formatMoSCoW(moscow)}</h2>
        <span className={`text-sm px-2 py-0.5 rounded border ${MOSCOW_COLORS[moscow]}`}>
          {items.length} items
        </span>
        {totalEffort > 0 && (
          <span className="text-sm text-muted-foreground">
            {totalEffort} pts total
          </span>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(item => (
          <RoadmapCard
            key={item.id}
            item={item}
            allItems={allItems}
            onClick={() => onItemClick(item)}
          />
        ))}
        {items.length === 0 && (
          <p className="text-sm text-muted-foreground italic py-4">
            No items with this priority
          </p>
        )}
      </div>
    </div>
  )
}

export function PriorityView({ items, allItems, onItemClick }: PriorityViewProps) {
  const grouped = getItemsByMoSCoW(items)

  return (
    <div>
      {MOSCOW_ORDER.map(moscow => (
        <Section
          key={moscow}
          moscow={moscow}
          items={grouped[moscow]}
          allItems={allItems}
          onItemClick={onItemClick}
        />
      ))}
    </div>
  )
}
```

**Acceptance Criteria**:
- [ ] Four sections in MoSCoW order
- [ ] Items grouped correctly by priority
- [ ] Section headers show priority name, item count, total effort
- [ ] Empty state message when no items
- [ ] Cards in responsive grid within each section

---

### Task 3.3: Create RoadmapFilters component

**Description**: Create the filter controls for type, MoSCoW, status, and hide-completed toggle.

**Size**: Medium
**Priority**: High
**Dependencies**: Task 1.2
**Can run parallel with**: Task 3.1, Task 3.2

**Technical Requirements**:
- Four filter controls: Type dropdown, MoSCoW dropdown, Status dropdown, Hide Completed checkbox
- "All" option for each dropdown
- Clear filters button

**Implementation**:

```typescript
// src/layers/features/roadmap/ui/RoadmapFilters.tsx
'use client'

import { X } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import type { RoadmapItemType, MoSCoW, Status } from '../model/types'
import { formatType, formatMoSCoW, formatStatus } from '../model/constants'

export interface FilterState {
  type: string
  moscow: string
  status: string
  hideCompleted: boolean
}

interface RoadmapFiltersProps {
  filters: FilterState
  onChange: (filters: FilterState) => void
}

const TYPES: RoadmapItemType[] = ['feature', 'bugfix', 'technical-debt', 'research', 'epic']
const MOSCOW_VALUES: MoSCoW[] = ['must-have', 'should-have', 'could-have', 'wont-have']
const STATUSES: Status[] = ['not-started', 'in-progress', 'completed', 'on-hold']

export function RoadmapFilters({ filters, onChange }: RoadmapFiltersProps) {
  const hasActiveFilters =
    filters.type || filters.moscow || filters.status || filters.hideCompleted

  const clearFilters = () => {
    onChange({
      type: '',
      moscow: '',
      status: '',
      hideCompleted: false,
    })
  }

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    onChange({ ...filters, [key]: value })
  }

  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="space-y-1.5">
        <Label htmlFor="type-filter" className="text-xs">Type</Label>
        <Select
          value={filters.type || 'all'}
          onValueChange={(v) => updateFilter('type', v === 'all' ? '' : v)}
        >
          <SelectTrigger id="type-filter" className="w-[140px]">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {TYPES.map(type => (
              <SelectItem key={type} value={type}>
                {formatType(type)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="moscow-filter" className="text-xs">Priority</Label>
        <Select
          value={filters.moscow || 'all'}
          onValueChange={(v) => updateFilter('moscow', v === 'all' ? '' : v)}
        >
          <SelectTrigger id="moscow-filter" className="w-[140px]">
            <SelectValue placeholder="All priorities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            {MOSCOW_VALUES.map(moscow => (
              <SelectItem key={moscow} value={moscow}>
                {formatMoSCoW(moscow)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="status-filter" className="text-xs">Status</Label>
        <Select
          value={filters.status || 'all'}
          onValueChange={(v) => updateFilter('status', v === 'all' ? '' : v)}
        >
          <SelectTrigger id="status-filter" className="w-[140px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUSES.map(status => (
              <SelectItem key={status} value={status}>
                {formatStatus(status)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2 pb-0.5">
        <Checkbox
          id="hide-completed"
          checked={filters.hideCompleted}
          onCheckedChange={(checked) => updateFilter('hideCompleted', checked === true)}
        />
        <Label htmlFor="hide-completed" className="text-sm cursor-pointer">
          Hide completed
        </Label>
      </div>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="text-muted-foreground"
        >
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  )
}
```

**Acceptance Criteria**:
- [ ] Type dropdown with all types + "All" option
- [ ] MoSCoW dropdown with all priorities + "All" option
- [ ] Status dropdown with all statuses + "All" option
- [ ] Hide completed checkbox
- [ ] Clear filters button appears when filters active
- [ ] Labels for accessibility

---

### Task 3.4: Integrate filters and views in RoadmapPage

**Description**: Create the main RoadmapPage client component that orchestrates all sub-components.

**Size**: Medium
**Priority**: High
**Dependencies**: Task 2.1, Task 2.2, Task 2.4, Task 2.5, Task 3.1, Task 3.2, Task 3.3
**Can run parallel with**: None (integration task)

**Technical Requirements**:
- Manage view state and filter state
- Filter items before passing to views
- Pass correct props to all components
- Handle item click to open modal

**Implementation**:

```typescript
// src/layers/features/roadmap/ui/RoadmapPage.tsx
'use client'

import { useState, useMemo } from 'react'
import type { Roadmap, RoadmapItem } from '../model/types'
import { RoadmapHeader } from './RoadmapHeader'
import { HealthDashboard } from './HealthDashboard'
import { RoadmapFilters, type FilterState } from './RoadmapFilters'
import { ViewToggle, type ViewMode } from './ViewToggle'
import { TimelineView } from './TimelineView'
import { StatusView } from './StatusView'
import { PriorityView } from './PriorityView'
import { RoadmapModal } from './RoadmapModal'

interface RoadmapPageProps {
  roadmap: Roadmap
}

export function RoadmapPage({ roadmap }: RoadmapPageProps) {
  const [view, setView] = useState<ViewMode>('timeline')
  const [filters, setFilters] = useState<FilterState>({
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

      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 my-6">
        <RoadmapFilters filters={filters} onChange={setFilters} />
        <ViewToggle view={view} onChange={setView} />
      </div>

      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {roadmap.items.length === 0
              ? 'No roadmap items yet. Use /roadmap:add to create one.'
              : 'No items match the current filters.'}
          </p>
        </div>
      ) : (
        <>
          {view === 'timeline' && (
            <TimelineView
              items={filteredItems}
              timeHorizons={roadmap.timeHorizons}
              allItems={roadmap.items}
              onItemClick={setSelectedItem}
            />
          )}
          {view === 'status' && (
            <StatusView
              items={filteredItems}
              allItems={roadmap.items}
              onItemClick={setSelectedItem}
            />
          )}
          {view === 'priority' && (
            <PriorityView
              items={filteredItems}
              allItems={roadmap.items}
              onItemClick={setSelectedItem}
            />
          )}
        </>
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

Update the page.tsx to use RoadmapPage:

```typescript
// src/app/(public)/roadmap/page.tsx

import type { Metadata } from 'next'
import { roadmap } from '@/../roadmap/roadmap'
import { RoadmapPage } from '@/layers/features/roadmap/ui/RoadmapPage'

export const metadata: Metadata = {
  title: 'Roadmap | Next.js Boilerplate',
  description: 'Product roadmap and feature planning for the Next.js Boilerplate project.',
}

export default function Page() {
  return <RoadmapPage roadmap={roadmap} />
}
```

**Acceptance Criteria**:
- [ ] View switching works correctly
- [ ] Filters correctly filter items
- [ ] Multiple filters combine (AND logic)
- [ ] Hide completed works across all views
- [ ] Empty state shows appropriate message
- [ ] Item click opens modal
- [ ] Health dashboard always shows full roadmap stats (not filtered)

---

## Phase 4: Modal & Polish

### Task 4.1: Create RoadmapModal component

**Description**: Create the detail modal showing full item information.

**Size**: Large
**Priority**: High
**Dependencies**: Task 1.2, Task 2.3
**Can run parallel with**: Task 4.2

**Technical Requirements**:
- Show all item details expanded
- Full description (not truncated)
- All metadata: health, horizon, dates, UUID
- Dependencies section
- Ideation context if present
- "Start Ideation" button that copies command
- Close on backdrop click or X button

**Implementation**:

```typescript
// src/layers/features/roadmap/ui/RoadmapModal.tsx
'use client'

import { Copy, ExternalLink, X } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import type { RoadmapItem } from '../model/types'
import {
  STATUS_COLORS,
  MOSCOW_COLORS,
  HEALTH_COLORS,
  formatStatus,
  formatMoSCoW,
  formatType,
  formatHealth,
  formatTimeHorizon,
} from '../model/constants'
import { DependencyPill } from './DependencyPill'
import { getItemDependencies } from '../lib/roadmap-utils'

interface RoadmapModalProps {
  item: RoadmapItem | null
  allItems: RoadmapItem[]
  onClose: () => void
}

export function RoadmapModal({ item, allItems, onClose }: RoadmapModalProps) {
  if (!item) return null

  const dependencies = getItemDependencies(item, allItems)

  const copyIdeateCommand = () => {
    navigator.clipboard.writeText(`/ideate --roadmap-id ${item.id}`)
    toast.success('Command copied to clipboard')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <Dialog open={!!item} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4 pr-8">
            <DialogTitle className="text-xl">{item.title}</DialogTitle>
            <Badge className={STATUS_COLORS[item.status]}>
              {formatStatus(item.status)}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className={MOSCOW_COLORS[item.moscow]}>
              {formatMoSCoW(item.moscow)}
            </Badge>
            <Badge variant="outline">{formatType(item.type)}</Badge>
            <Badge variant="outline">{formatTimeHorizon(item.timeHorizon)}</Badge>
            {item.effort !== undefined && item.effort > 0 && (
              <Badge variant="secondary">{item.effort} story points</Badge>
            )}
            <Badge variant="outline" className={HEALTH_COLORS[item.health]}>
              {formatHealth(item.health)}
            </Badge>
          </div>

          {/* Description */}
          {item.description && (
            <div>
              <h3 className="text-sm font-medium mb-2">Description</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {item.description}
              </p>
            </div>
          )}

          {/* Labels */}
          {item.labels && item.labels.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">Labels</h3>
              <div className="flex flex-wrap gap-1">
                {item.labels.map(label => (
                  <Badge key={label} variant="secondary">
                    {label}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Dependencies */}
          {dependencies.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">Dependencies</h3>
              <div className="flex flex-wrap gap-2">
                {dependencies.map(dep => (
                  <DependencyPill key={dep.id} item={dep} />
                ))}
              </div>
            </div>
          )}

          {/* Linked Artifacts */}
          {item.linkedArtifacts?.specSlug && (
            <div>
              <h3 className="text-sm font-medium mb-2">Linked Documents</h3>
              <div className="flex flex-wrap gap-3">
                {item.linkedArtifacts.ideationPath && (
                  <span className="text-sm text-info flex items-center gap-1">
                    <ExternalLink className="h-3 w-3" />
                    {item.linkedArtifacts.ideationPath}
                  </span>
                )}
                {item.linkedArtifacts.specPath && (
                  <span className="text-sm text-info flex items-center gap-1">
                    <ExternalLink className="h-3 w-3" />
                    {item.linkedArtifacts.specPath}
                  </span>
                )}
                {item.linkedArtifacts.tasksPath && (
                  <span className="text-sm text-info flex items-center gap-1">
                    <ExternalLink className="h-3 w-3" />
                    {item.linkedArtifacts.tasksPath}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Ideation Context */}
          {item.ideationContext && (
            <div>
              <h3 className="text-sm font-medium mb-2">Ideation Context</h3>
              <div className="space-y-3 text-sm">
                {item.ideationContext.targetUsers && item.ideationContext.targetUsers.length > 0 && (
                  <div>
                    <span className="font-medium">Target Users: </span>
                    <span className="text-muted-foreground">
                      {item.ideationContext.targetUsers.join(', ')}
                    </span>
                  </div>
                )}
                {item.ideationContext.painPoints && item.ideationContext.painPoints.length > 0 && (
                  <div>
                    <span className="font-medium">Pain Points: </span>
                    <ul className="list-disc list-inside text-muted-foreground mt-1">
                      {item.ideationContext.painPoints.map((point, i) => (
                        <li key={i}>{point}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {item.ideationContext.successCriteria && item.ideationContext.successCriteria.length > 0 && (
                  <div>
                    <span className="font-medium">Success Criteria: </span>
                    <ul className="list-disc list-inside text-muted-foreground mt-1">
                      {item.ideationContext.successCriteria.map((criterion, i) => (
                        <li key={i}>{criterion}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {item.ideationContext.constraints && item.ideationContext.constraints.length > 0 && (
                  <div>
                    <span className="font-medium">Constraints: </span>
                    <ul className="list-disc list-inside text-muted-foreground mt-1">
                      {item.ideationContext.constraints.map((constraint, i) => (
                        <li key={i}>{constraint}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          <Separator />

          {/* Metadata */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p><span className="font-medium">ID:</span> {item.id}</p>
            <p><span className="font-medium">Created:</span> {formatDate(item.createdAt)}</p>
            <p><span className="font-medium">Updated:</span> {formatDate(item.updatedAt)}</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button onClick={copyIdeateCommand} className="flex-1">
              <Copy className="h-4 w-4 mr-2" />
              Start Ideation
            </Button>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

**Acceptance Criteria**:
- [ ] Modal opens when item is selected
- [ ] Shows full title
- [ ] Shows all badges (status, MoSCoW, type, time horizon, effort, health)
- [ ] Shows full description (not truncated)
- [ ] Shows labels
- [ ] Shows dependencies as pills
- [ ] Shows linked artifacts paths
- [ ] Shows ideation context if present
- [ ] Shows metadata (ID, created, updated)
- [ ] "Start Ideation" button copies command
- [ ] Close button works
- [ ] Backdrop click closes modal

---

### Task 4.2: Create DependencyPill component

**Description**: Create the small pill component showing a dependency with status indicator.

**Size**: Small
**Priority**: Medium
**Dependencies**: Task 1.2
**Can run parallel with**: Task 4.1

**Technical Requirements**:
- Show dependency title (truncated)
- Color dot indicating status
- Tooltip with full title on hover

**Implementation**:

```typescript
// src/layers/features/roadmap/ui/DependencyPill.tsx
'use client'

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { RoadmapItem } from '../model/types'
import { STATUS_COLORS, formatStatus } from '../model/constants'

interface DependencyPillProps {
  item: RoadmapItem
}

const STATUS_DOT_COLORS: Record<string, string> = {
  'not-started': 'bg-muted-foreground',
  'in-progress': 'bg-info',
  'completed': 'bg-success',
  'on-hold': 'bg-warning',
}

export function DependencyPill({ item }: DependencyPillProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-muted text-xs text-muted-foreground cursor-default">
          <span
            className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT_COLORS[item.status]}`}
            aria-hidden="true"
          />
          <span className="max-w-[120px] truncate">{item.title}</span>
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <p className="font-medium">{item.title}</p>
        <p className="text-xs text-muted-foreground">{formatStatus(item.status)}</p>
      </TooltipContent>
    </Tooltip>
  )
}
```

**Acceptance Criteria**:
- [ ] Shows truncated title (max ~120px)
- [ ] Shows colored status dot
- [ ] Tooltip shows full title and status on hover
- [ ] Pill has rounded background

---

### Task 4.3: Add toast notifications for copy actions

**Description**: Ensure toast notifications appear when copying commands.

**Size**: Small
**Priority**: Medium
**Dependencies**: Task 2.3, Task 4.1
**Can run parallel with**: Task 4.4

**Technical Requirements**:
- Toast appears when copying /ideate command
- Toast shows success message
- Auto-dismiss after short delay

**Implementation**:

Already implemented in Task 2.3 and Task 4.1 using `toast.success()` from sonner.

Ensure Toaster is in the providers:

```typescript
// Check src/app/providers.tsx or layout.tsx includes:
import { Toaster } from '@/components/ui/sonner'

// And renders <Toaster /> in the tree
```

**Acceptance Criteria**:
- [ ] Toast appears when clicking "Copy /ideate command"
- [ ] Toast shows "Command copied to clipboard"
- [ ] Toast auto-dismisses

---

### Task 4.4: Add empty states

**Description**: Add proper empty state messages for all scenarios.

**Size**: Small
**Priority**: Medium
**Dependencies**: Task 3.4
**Can run parallel with**: Task 4.3

**Technical Requirements**:
- "No roadmap items yet" when roadmap is empty
- "No items match filters" when filters exclude all items
- Per-column empty states in views

**Implementation**:

Already implemented in Task 3.4 (RoadmapPage) and Task 2.5/3.1/3.2 (views).

Verify the messages are:
- Empty roadmap: "No roadmap items yet. Use /roadmap:add to create one."
- No filter matches: "No items match the current filters."
- Empty column: "No items in this time horizon" / "No items with this status" / "No items with this priority"

**Acceptance Criteria**:
- [ ] Empty roadmap shows helpful message
- [ ] Empty filter result shows filter-specific message
- [ ] Empty columns show appropriate messages

---

### Task 4.5: Responsive refinements and polish

**Description**: Ensure all components work well across screen sizes and add final polish.

**Size**: Medium
**Priority**: Medium
**Dependencies**: All previous tasks
**Can run parallel with**: None (polish task)

**Technical Requirements**:
- Mobile: Single column layout
- Tablet: 2-column layout where appropriate
- Desktop: Full multi-column layouts
- Smooth transitions
- Keyboard navigation works
- Focus states visible

**Implementation**:

Review and adjust breakpoints in all components:

```typescript
// Responsive patterns already used:
// - grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 (StatusView)
// - grid-cols-1 md:grid-cols-3 (TimelineView)
// - flex-col sm:flex-row (RoadmapFilters)

// Additional polish:
// - Add focus-visible states to cards
// - Ensure modal is scrollable on small screens
// - Test touch interactions on mobile
```

**Acceptance Criteria**:
- [ ] Mobile layout works (single column, stacked filters)
- [ ] Tablet layout works (2 columns, filters row)
- [ ] Desktop layout works (3-4 columns)
- [ ] Cards have proper hover/focus states
- [ ] Modal scrolls on small screens
- [ ] All interactive elements keyboard accessible

---

## Phase 5: Verification

### Task 5.1: Verify Python CLI scripts compatibility

**Description**: Ensure all existing Python scripts continue to work unchanged.

**Size**: Small
**Priority**: High
**Dependencies**: Phase 4 complete
**Can run parallel with**: Task 5.2

**Technical Requirements**:
- All scripts in `roadmap/scripts/` work
- Scripts can read and write to roadmap.json
- No changes needed to Python code

**Implementation**:

Manual testing checklist:

```bash
# Test each script
python3 roadmap/scripts/find_by_title.py "test"
python3 roadmap/scripts/slugify.py "Test Feature"
python3 roadmap/scripts/update_status.py <existing-id> in-progress
python3 roadmap/scripts/link_spec.py <existing-id> test-feature
python3 roadmap/scripts/link_all_specs.py --dry-run

# Test validation
python3 .claude/skills/managing-roadmap-moscow/scripts/validate_roadmap.py
```

**Acceptance Criteria**:
- [ ] find_by_title.py works
- [ ] slugify.py works
- [ ] update_status.py works
- [ ] link_spec.py works
- [ ] link_all_specs.py works
- [ ] validate_roadmap.py works
- [ ] No Python code changes needed

---

### Task 5.2: Verify Vercel deployment

**Description**: Test that the roadmap page deploys correctly to Vercel.

**Size**: Medium
**Priority**: High
**Dependencies**: Phase 4 complete
**Can run parallel with**: Task 5.1

**Technical Requirements**:
- Build succeeds with `pnpm build`
- Page renders correctly after deployment
- No file system access errors (roadmap.json bundled at build time)

**Implementation**:

```bash
# Local production build test
pnpm build
pnpm start
# Navigate to http://localhost:3000/roadmap

# Deploy to Vercel preview
# (triggered by PR or manual deploy)
```

Verify:
- Build logs show no errors
- Page loads without errors
- All features work (views, filters, modal)
- Theme toggle works

**Acceptance Criteria**:
- [ ] `pnpm build` succeeds
- [ ] Production preview works locally
- [ ] Vercel deployment succeeds
- [ ] Page loads on Vercel URL
- [ ] All features functional in production

---

### Task 5.3: Update documentation

**Description**: Update CLAUDE.md and developer guides with roadmap feature information.

**Size**: Small
**Priority**: Medium
**Dependencies**: Phase 4 complete
**Can run parallel with**: Task 5.1, Task 5.2

**Technical Requirements**:
- Update developer-guides/01-project-structure.md with roadmap feature location
- Update CLAUDE.md if any commands changed
- Add JSDoc comments to key exports

**Implementation**:

Add to `developer-guides/01-project-structure.md`:

```markdown
### Roadmap Feature

The roadmap visualization lives at `/roadmap` and is implemented as a feature in the FSD architecture:

```
src/layers/features/roadmap/
├── ui/               # React components (RoadmapPage, views, cards, modal)
├── model/            # Types, schemas, constants
├── lib/              # Utility functions
└── index.ts          # Public exports
```

Data source: `roadmap/roadmap.json` (managed by Python scripts)
```

**Acceptance Criteria**:
- [ ] Project structure guide updated
- [ ] Feature location documented
- [ ] Any command changes documented in CLAUDE.md
- [ ] Key exports have JSDoc comments

---

## Summary

| Phase | Tasks | Dependencies |
|-------|-------|--------------|
| Phase 1: Foundation | 5 tasks | None |
| Phase 2: Core Components | 5 tasks | Phase 1 |
| Phase 3: Views & Filtering | 4 tasks | Phase 2 |
| Phase 4: Modal & Polish | 5 tasks | Phase 3 |
| Phase 5: Verification | 3 tasks | Phase 4 |

**Total: 22 tasks**

## Parallel Execution Opportunities

- **Phase 1**: Tasks 1.2, 1.3, 1.4 can run in parallel after 1.1
- **Phase 2**: Tasks 2.1, 2.2, 2.3, 2.4 can run in parallel
- **Phase 3**: Tasks 3.1, 3.2, 3.3 can run in parallel
- **Phase 4**: Tasks 4.1, 4.2 can run in parallel
- **Phase 5**: Tasks 5.1, 5.2, 5.3 can run in parallel

**Critical path**: 1.1 → 1.4 → 2.3 → 2.5 → 3.4 → 4.1 → 5.2
