'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  Sparkles,
  Bug,
  Wrench,
  Search,
  Layers,
  AlertCircle,
  CheckCircle,
  Clock,
  Pause,
} from 'lucide-react'
import {
  STATUS_COLORS,
  HEALTH_COLORS,
  MOSCOW_COLORS,
  formatStatus,
  formatHealth,
  formatMoSCoW,
  formatType,
} from '../model/constants'
import type { RoadmapItem, RoadmapItemType, Status, Health } from '../model/types'
import { DependencyPill } from './DependencyPill'

interface RoadmapCardProps {
  item: RoadmapItem
  onClick?: () => void
  className?: string
}

const TYPE_ICON_MAP: Record<RoadmapItemType, React.ComponentType<{ className?: string }>> = {
  feature: Sparkles,
  bugfix: Bug,
  'technical-debt': Wrench,
  research: Search,
  epic: Layers,
}

const STATUS_ICON_MAP: Record<Status, React.ComponentType<{ className?: string }>> = {
  'not-started': Clock,
  'in-progress': AlertCircle,
  completed: CheckCircle,
  'on-hold': Pause,
}

export function RoadmapCard({ item, onClick, className }: RoadmapCardProps) {
  const TypeIcon = TYPE_ICON_MAP[item.type]
  const StatusIcon = STATUS_ICON_MAP[item.status]
  const truncatedDescription =
    item.description && item.description.length > 120
      ? item.description.slice(0, 120) + '...'
      : item.description

  return (
    <Card
      className={cn(
        'cursor-pointer card-interactive transition-shadow',
        onClick && 'hover:shadow-elevated focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none',
        className
      )}
      onClick={onClick}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      } : undefined}
      role={onClick ? 'button' : undefined}
      aria-label={onClick ? `View details for ${item.title}` : undefined}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2 min-w-0">
            <TypeIcon className="size-4 shrink-0 mt-0.5 text-muted-foreground" />
            <CardTitle className="text-base leading-tight break-words">
              {item.title}
            </CardTitle>
          </div>
          {item.effort && (
            <Badge variant="outline" className="shrink-0">
              {item.effort}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {truncatedDescription && (
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
            {truncatedDescription}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Badge */}
          <Badge className={cn('gap-1.5', STATUS_COLORS[item.status])}>
            <StatusIcon className="size-3" />
            <span>{formatStatus(item.status)}</span>
          </Badge>

          {/* MoSCoW Badge */}
          <Badge className={MOSCOW_COLORS[item.moscow]}>
            {formatMoSCoW(item.moscow)}
          </Badge>

          {/* Health Indicator */}
          <div className="flex items-center gap-1.5 text-xs">
            <span
              className={cn(
                'size-1.5 rounded-full',
                getHealthDotColor(item.health)
              )}
            />
            <span className={cn('font-medium', HEALTH_COLORS[item.health])}>
              {formatHealth(item.health)}
            </span>
          </div>
        </div>

        {/* Labels */}
        {item.labels && item.labels.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {item.labels.map((label) => (
              <Badge key={label} variant="secondary" className="text-xs">
                {label}
              </Badge>
            ))}
          </div>
        )}

        {/* Dependencies */}
        {item.dependencies && item.dependencies.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground shrink-0">
              Dependencies:
            </span>
            <div className="flex flex-wrap gap-1.5 min-w-0">
              {item.dependencies.slice(0, 2).map((depId) => (
                <DependencyPill key={depId} dependencyId={depId} />
              ))}
              {item.dependencies.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{item.dependencies.length - 2} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Type indicator (subtle footer) */}
        <div className="pt-2 border-t text-xs text-muted-foreground">
          {formatType(item.type)}
        </div>
      </CardContent>
    </Card>
  )
}

function getHealthDotColor(health: Health): string {
  return {
    'on-track': 'bg-success',
    'at-risk': 'bg-warning',
    'off-track': 'bg-destructive',
    blocked: 'bg-destructive',
  }[health]
}
