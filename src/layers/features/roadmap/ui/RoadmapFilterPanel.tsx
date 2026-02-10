// src/layers/features/roadmap/ui/RoadmapFilterPanel.tsx
'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { X } from 'lucide-react'
import { TYPE_LABELS, MOSCOW_LABELS, STATUS_LABELS } from '../model/constants'
import type { RoadmapItemType, MoSCoW, Status } from '../model/types'

interface RoadmapFilterPanelProps {
  types: RoadmapItemType[]
  moscow: MoSCoW[]
  statuses: Status[]
  hideCompleted: boolean
  onTypesChange: (types: RoadmapItemType[]) => void
  onMoscowChange: (moscow: MoSCoW[]) => void
  onStatusesChange: (statuses: Status[]) => void
  onHideCompletedChange: (hideCompleted: boolean) => void
  onClearFilters?: () => void
}

export function RoadmapFilterPanel({
  types,
  moscow,
  statuses,
  hideCompleted,
  onTypesChange,
  onMoscowChange,
  onStatusesChange,
  onHideCompletedChange,
  onClearFilters,
}: RoadmapFilterPanelProps) {
  const toggleArrayValue = <T,>(array: T[], value: T): T[] => {
    return array.includes(value)
      ? array.filter((item) => item !== value)
      : [...array, value]
  }

  const hasActiveFilters = types.length > 0 || moscow.length > 0 || statuses.length > 0 || hideCompleted

  return (
    <div className="space-y-4">
      {/* Filter Groups */}
      <div className="flex flex-wrap gap-6">
        {/* Type Filter */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Type
          </Label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(TYPE_LABELS).map(([value, label]) => {
              const isSelected = types.includes(value as RoadmapItemType)
              return (
                <Badge
                  key={value}
                  variant={isSelected ? 'default' : 'outline'}
                  className="cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => onTypesChange(toggleArrayValue(types, value as RoadmapItemType))}
                >
                  {label}
                </Badge>
              )
            })}
          </div>
        </div>

        {/* MoSCoW Filter */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Priority
          </Label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(MOSCOW_LABELS).map(([value, label]) => {
              const isSelected = moscow.includes(value as MoSCoW)
              return (
                <Badge
                  key={value}
                  variant={isSelected ? 'default' : 'outline'}
                  className="cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => onMoscowChange(toggleArrayValue(moscow, value as MoSCoW))}
                >
                  {label}
                </Badge>
              )
            })}
          </div>
        </div>

        {/* Status Filter */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Status
          </Label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(STATUS_LABELS).map(([value, label]) => {
              const isSelected = statuses.includes(value as Status)
              return (
                <Badge
                  key={value}
                  variant={isSelected ? 'default' : 'outline'}
                  className="cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => onStatusesChange(toggleArrayValue(statuses, value as Status))}
                >
                  {label}
                </Badge>
              )
            })}
          </div>
        </div>
      </div>

      {/* Additional Controls */}
      <div className="flex items-center justify-between gap-4 pt-2 border-t">
        <div className="flex items-center gap-2">
          <Checkbox
            id="hide-completed"
            checked={hideCompleted}
            onCheckedChange={(checked) => onHideCompletedChange(checked === true)}
          />
          <Label htmlFor="hide-completed" className="cursor-pointer">
            Hide completed
          </Label>
        </div>

        {hasActiveFilters && onClearFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="gap-2"
          >
            <X className="size-4" />
            Clear filters
          </Button>
        )}
      </div>
    </div>
  )
}
