'use client'

import * as React from 'react'
import { RoadmapCard } from './RoadmapCard'
import { formatStatus } from '../model/constants'
import type { RoadmapItem, Status } from '../model/types'

interface StatusViewProps {
  items: RoadmapItem[]
  onItemClick: (item: RoadmapItem) => void
}

const STATUS_ORDER: Status[] = ['not-started', 'in-progress', 'completed', 'on-hold']

export function StatusView({ items, onItemClick }: StatusViewProps) {
  // Group items by status
  const itemsByStatus = React.useMemo(() => {
    return STATUS_ORDER.reduce(
      (acc, status) => {
        acc[status] = items.filter((item) => item.status === status)
        return acc
      },
      {} as Record<Status, RoadmapItem[]>
    )
  }, [items])

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {STATUS_ORDER.map((status) => {
        const columnItems = itemsByStatus[status]

        return (
          <div key={status} className="space-y-4">
            {/* Column Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">
                {formatStatus(status)}
              </h3>
              <span className="text-xs text-muted-foreground">
                {columnItems.length}
              </span>
            </div>

            {/* Column Items */}
            <div className="space-y-3">
              {columnItems.length === 0 ? (
                <div className="rounded-xl border-2 border-dashed border-muted p-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    No items
                  </p>
                </div>
              ) : (
                columnItems.map((item) => (
                  <RoadmapCard
                    key={item.id}
                    item={item}
                    onClick={() => onItemClick(item)}
                  />
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
