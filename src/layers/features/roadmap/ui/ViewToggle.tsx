'use client'

import * as React from 'react'
import { Calendar, Layers, Target } from 'lucide-react'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import type { ViewMode } from '../lib/use-roadmap-filters'

interface ViewToggleProps {
  value: ViewMode
  onValueChange: (value: ViewMode) => void
}

export function ViewToggle({ value, onValueChange }: ViewToggleProps) {
  return (
    <ToggleGroup
      value={[value]}
      onValueChange={(newValue) => {
        if (newValue.length > 0) {
          onValueChange(newValue[0] as ViewMode)
        }
      }}
      variant="outline"
      aria-label="View mode toggle"
    >
      <ToggleGroupItem
        value="timeline"
        aria-label="Timeline view (Now/Next/Later)"
        title="Timeline view (Now/Next/Later)"
      >
        <Calendar className="size-4" />
        <span className="sr-only sm:not-sr-only sm:ml-2">Timeline</span>
      </ToggleGroupItem>
      <ToggleGroupItem
        value="status"
        aria-label="Status view"
        title="Status view"
      >
        <Layers className="size-4" />
        <span className="sr-only sm:not-sr-only sm:ml-2">Status</span>
      </ToggleGroupItem>
      <ToggleGroupItem
        value="priority"
        aria-label="Priority view (MoSCoW)"
        title="Priority view (MoSCoW)"
      >
        <Target className="size-4" />
        <span className="sr-only sm:not-sr-only sm:ml-2">Priority</span>
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
