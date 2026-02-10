# useRoadmapFilters Hook

Client-side hook for managing roadmap view state via URL query parameters. Enables shareable URLs and browser back/forward navigation.

## Usage

```tsx
'use client'

import { useRoadmapFilters } from '@/layers/features/roadmap/lib'

function RoadmapPage() {
  const { filters, setFilters, setView, toggleHideCompleted, clearFilters } = useRoadmapFilters()

  return (
    <div>
      {/* View mode selector */}
      <select value={filters.view} onChange={(e) => setView(e.target.value as ViewMode)}>
        <option value="timeline">Timeline</option>
        <option value="status">Status</option>
        <option value="priority">Priority</option>
      </select>

      {/* Type filter */}
      <button onClick={() => setFilters({ 
        types: filters.types.includes('feature') 
          ? filters.types.filter(t => t !== 'feature')
          : [...filters.types, 'feature']
      })}>
        Toggle Feature
      </button>

      {/* Hide completed toggle */}
      <button onClick={toggleHideCompleted}>
        {filters.hideCompleted ? 'Show Completed' : 'Hide Completed'}
      </button>

      {/* Clear all filters */}
      <button onClick={clearFilters}>Reset</button>
    </div>
  )
}
```

## API

### Return Value

```typescript
{
  filters: RoadmapFilters           // Current filter state
  setFilters: (updates) => void     // Update multiple filters
  setView: (view) => void           // Update view mode only
  toggleHideCompleted: () => void   // Toggle completed visibility
  clearFilters: () => void          // Reset to defaults
}
```

### Types

```typescript
type ViewMode = 'timeline' | 'status' | 'priority'

interface RoadmapFilters {
  view: ViewMode
  types: RoadmapItemType[]
  moscow: MoSCoW[]
  statuses: Status[]
  hideCompleted: boolean
}
```

## URL Format

```
/roadmap?view=status&types=feature,epic&moscow=must-have&statuses=in-progress&hideCompleted=true
```

## Default Values

When no query parameters are present:
- `view`: `'timeline'`
- `types`: `[]`
- `moscow`: `[]`
- `statuses`: `[]`
- `hideCompleted`: `false`

## Features

- **URL Persistence**: All filter state stored in URL query parameters
- **Shareable URLs**: Copy URL to share filtered view
- **Browser Navigation**: Back/forward buttons navigate filter history
- **No Scroll**: Filter changes don't scroll page (scroll: false)
- **Clean URLs**: Default values omitted from URL
