import * as React from 'react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { getItemById } from '../../../../../roadmap/roadmap'
import type { Status } from '../model/types'

interface DependencyPillProps {
  dependencyId: string
  className?: string
}

export function DependencyPill({ dependencyId, className }: DependencyPillProps) {
  const dependencyItem = getItemById(dependencyId)

  if (!dependencyItem) {
    return (
      <Badge variant="outline" className={cn('gap-1.5', className)}>
        <span className="size-1.5 rounded-full bg-muted-foreground" />
        <span className="text-muted-foreground">Unknown dependency</span>
      </Badge>
    )
  }

  const statusDotColor = getStatusDotColor(dependencyItem.status)

  return (
    <Badge variant="outline" className={cn('gap-1.5', className)}>
      <span className={cn('size-1.5 rounded-full', statusDotColor)} />
      <span>{dependencyItem.title}</span>
    </Badge>
  )
}

function getStatusDotColor(status: Status): string {
  return {
    'not-started': 'bg-muted-foreground',
    'in-progress': 'bg-info',
    'completed': 'bg-success',
    'on-hold': 'bg-warning',
  }[status]
}
