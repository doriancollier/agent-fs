'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { RoadmapCard } from './RoadmapCard'
import { MOSCOW_COLORS, formatMoSCoW } from '../model/constants'
import type { RoadmapItem, MoSCoW } from '../model/types'

interface PriorityViewProps {
  items: RoadmapItem[]
  onItemClick: (item: RoadmapItem) => void
}

const MOSCOW_ORDER: MoSCoW[] = ['must-have', 'should-have', 'could-have', 'wont-have']

const MOSCOW_DOT_COLORS: Record<MoSCoW, string> = {
  'must-have': 'bg-destructive',
  'should-have': 'bg-warning',
  'could-have': 'bg-info',
  'wont-have': 'bg-muted-foreground',
}

export function PriorityView({ items, onItemClick }: PriorityViewProps) {
  return (
    <div className="space-y-8">
      {MOSCOW_ORDER.map((priority) => {
        const groupItems = items.filter((item) => item.moscow === priority)
        if (groupItems.length === 0) return null

        return (
          <section key={priority} className="space-y-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <span
                className={cn('size-3 rounded-full', MOSCOW_DOT_COLORS[priority])}
                aria-hidden="true"
              />
              {formatMoSCoW(priority)}
              <span className="text-muted-foreground font-normal text-sm">
                ({groupItems.length})
              </span>
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {groupItems.map((item) => (
                <RoadmapCard
                  key={item.id}
                  item={item}
                  onClick={() => onItemClick(item)}
                />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
