# Roadmap Feature

FSD-compliant feature module for roadmap functionality integration.

## Directory Structure

```
roadmap/
├── index.ts              # Public API (barrel export)
├── model/                # Types, schemas, constants
│   ├── types.ts         # TypeScript types
│   ├── schemas.ts       # Zod validation schemas
│   ├── constants.ts     # Color mappings, formatters
│   └── index.ts         # Model exports
├── lib/                  # Utilities and hooks
│   ├── use-roadmap-filters.ts  # URL state management hook
│   └── index.ts         # Lib exports
└── ui/                   # React components
    ├── DependencyPill.tsx  # Dependency badge component
    └── index.ts         # UI exports
```

## Usage

Import from the feature barrel export:

```typescript
import {
  // Types
  type RoadmapItem,
  type Status,
  type MoSCoW,
  
  // Schemas
  roadmapItemSchema,
  
  // Constants & Formatters
  STATUS_COLORS,
  formatStatus,
  
  // Hooks
  useRoadmapFilters,
  
  // Components
  DependencyPill,
} from '@/layers/features/roadmap'
```

## Integration with Standalone Roadmap

This feature layer provides TypeScript types and React components for the standalone roadmap system (in `/roadmap` directory).

The roadmap data is accessed via:
```typescript
import { roadmap, getItemById } from '@/roadmap/roadmap'
```

## Key Components

### DependencyPill

Displays a dependency badge with status indicator.

```tsx
<DependencyPill dependencyId="uuid-of-dependency" />
```

### useRoadmapFilters

Hook for managing roadmap view filters via URL state.

```tsx
const { filters, setFilters, setView, toggleHideCompleted } = useRoadmapFilters()
```

## FSD Layer Rules

This is a **feature** layer module, which means:

✅ **Can import from:**
- `@/layers/shared/*` (shared utilities)
- `@/layers/entities/*` (domain entities)
- `@/components/ui/*` (UI primitives)
- `@/lib/*` (low-level utilities)
- `@/roadmap/*` (standalone roadmap data)

❌ **Cannot import from:**
- Other features (`@/layers/features/*`)
- Widgets (`@/layers/widgets/*`)
- App layer (`@/app/*`)

## Development

Run type checking:
```bash
pnpm typecheck
```
