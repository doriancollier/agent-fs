// src/layers/features/roadmap/ui/RoadmapVisualization.tsx
'use client'

import * as React from 'react'
import type { RoadmapItem } from '../model/types'
import { useRoadmapFilters } from '../lib/use-roadmap-filters'
import { getRoadmapItems } from '@/roadmap/roadmap'
import { RoadmapHeader } from './RoadmapHeader'
import { HealthDashboard } from './HealthDashboard'
import { ViewToggle } from './ViewToggle'
import { RoadmapFilterPanel } from './RoadmapFilterPanel'
import { TimelineView } from './TimelineView'
import { StatusView } from './StatusView'
import { PriorityView } from './PriorityView'
import { RoadmapModal } from './RoadmapModal'

export function RoadmapVisualization() {
  const items = getRoadmapItems()
  const { filters, setFilters, setView, clearFilters } = useRoadmapFilters()
  const [selectedItem, setSelectedItem] = React.useState<RoadmapItem | null>(null)
  const [modalOpen, setModalOpen] = React.useState(false)

  // Apply filters to items
  const filteredItems = React.useMemo(() => {
    return items.filter((item) => {
      // Type filter
      if (filters.types.length > 0 && !filters.types.includes(item.type)) {
        return false
      }
      // MoSCoW filter
      if (filters.moscow.length > 0 && !filters.moscow.includes(item.moscow)) {
        return false
      }
      // Status filter
      if (filters.statuses.length > 0 && !filters.statuses.includes(item.status)) {
        return false
      }
      // Hide completed
      if (filters.hideCompleted && item.status === 'completed') {
        return false
      }
      return true
    })
  }, [items, filters])

  const handleItemClick = React.useCallback((item: RoadmapItem) => {
    setSelectedItem(item)
    setModalOpen(true)
  }, [])

  const handleModalOpenChange = React.useCallback((open: boolean) => {
    setModalOpen(open)
    if (!open) {
      setSelectedItem(null)
    }
  }, [])

  // Empty roadmap state
  if (items.length === 0) {
    return (
      <main className="w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <RoadmapHeader />
        <div className="text-center py-16">
          <p className="text-muted-foreground">
            No roadmap items yet. Use{' '}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">
              /roadmap:add
            </code>{' '}
            to create one.
          </p>
        </div>
      </main>
    )
  }

  return (
    <>
      <main className="w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <RoadmapHeader />
        <HealthDashboard />

        <div className="flex flex-col gap-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <ViewToggle value={filters.view} onValueChange={setView} />
          </div>

          <RoadmapFilterPanel
            types={filters.types}
            moscow={filters.moscow}
            statuses={filters.statuses}
            hideCompleted={filters.hideCompleted}
            onTypesChange={(types) => setFilters({ types })}
            onMoscowChange={(moscow) => setFilters({ moscow })}
            onStatusesChange={(statuses) => setFilters({ statuses })}
            onHideCompletedChange={(hideCompleted) => setFilters({ hideCompleted })}
            onClearFilters={clearFilters}
          />
        </div>

        {filteredItems.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">
              No items match the current filters.
            </p>
          </div>
        ) : (
          <>
            {filters.view === 'timeline' && (
              <TimelineView items={filteredItems} onItemClick={handleItemClick} />
            )}
            {filters.view === 'status' && (
              <StatusView items={filteredItems} onItemClick={handleItemClick} />
            )}
            {filters.view === 'priority' && (
              <PriorityView items={filteredItems} onItemClick={handleItemClick} />
            )}
          </>
        )}
      </main>

      <RoadmapModal
        item={selectedItem}
        open={modalOpen}
        onOpenChange={handleModalOpenChange}
      />
    </>
  )
}
