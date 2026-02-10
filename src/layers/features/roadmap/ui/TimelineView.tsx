'use client'

import * as React from 'react'
import type { RoadmapItem, TimeHorizon } from '../model/types'
import { RoadmapCard } from './RoadmapCard'
import { formatTimeHorizon } from '../model/constants'

interface TimelineViewProps {
  items: RoadmapItem[]
  onItemClick: (item: RoadmapItem) => void
}

export function TimelineView({ items, onItemClick }: TimelineViewProps) {
  const columns: TimeHorizon[] = ['now', 'next', 'later']

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {columns.map((horizon) => {
        const columnItems = items.filter((item) => item.timeHorizon === horizon)

        return (
          <div key={horizon} className="space-y-4">
            {/* Column Header */}
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">{formatTimeHorizon(horizon)}</h3>
              <p className="text-sm text-muted-foreground">
                {columnItems.length} {columnItems.length === 1 ? 'item' : 'items'}
              </p>
            </div>

            {/* Column Cards */}
            <div className="space-y-3">
              {columnItems.length > 0 ? (
                columnItems.map((item) => (
                  <RoadmapCard
                    key={item.id}
                    item={item}
                    onClick={() => onItemClick(item)}
                  />
                ))
              ) : (
                <div className="rounded-xl border-2 border-dashed border-muted p-6 text-center text-sm text-muted-foreground">
                  No items in this horizon
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
