'use client'

import * as React from 'react'
import { Copy, FileText, Lightbulb, ListTodo } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { DependencyPill } from './DependencyPill'
import type { RoadmapItem } from '../model/types'
import {
  formatStatus,
  formatHealth,
  formatMoSCoW,
  formatType,
  formatTimeHorizon,
  formatDate,
  STATUS_COLORS,
  HEALTH_COLORS,
  MOSCOW_COLORS,
} from '../model/constants'

interface RoadmapModalProps {
  item: RoadmapItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RoadmapModal({ item, open, onOpenChange }: RoadmapModalProps) {
  const handleCopyCommand = React.useCallback(() => {
    if (!item) return

    const command = `/ideate --roadmap-id ${item.id}`
    navigator.clipboard.writeText(command).then(() => {
      toast.success('Command copied to clipboard', {
        description: command,
      })
    })
  }, [item])

  if (!item) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl leading-tight pr-8">
            {item.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Badges row */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{formatType(item.type)}</Badge>
            <Badge className={STATUS_COLORS[item.status]}>
              {formatStatus(item.status)}
            </Badge>
            <Badge className={MOSCOW_COLORS[item.moscow]}>
              {formatMoSCoW(item.moscow)}
            </Badge>
            <Badge variant="outline">
              <span
                className={cn(
                  'size-1.5 rounded-full mr-1.5',
                  getHealthDotColor(item.health)
                )}
              />
              <span className={HEALTH_COLORS[item.health]}>
                {formatHealth(item.health)}
              </span>
            </Badge>
            <Badge variant="outline">{formatTimeHorizon(item.timeHorizon)}</Badge>
            {item.effort && (
              <Badge variant="outline">Effort: {item.effort}</Badge>
            )}
          </div>

          {/* Description */}
          {item.description && (
            <div>
              <h4 className="font-medium mb-2 text-sm">Description</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </div>
          )}

          {/* Dependencies */}
          {item.dependencies && item.dependencies.length > 0 && (
            <div>
              <h4 className="font-medium mb-2 text-sm">Dependencies</h4>
              <div className="flex flex-wrap gap-2">
                {item.dependencies.map((depId) => (
                  <DependencyPill key={depId} dependencyId={depId} />
                ))}
              </div>
            </div>
          )}

          {/* Labels */}
          {item.labels && item.labels.length > 0 && (
            <div>
              <h4 className="font-medium mb-2 text-sm">Labels</h4>
              <div className="flex flex-wrap gap-2">
                {item.labels.map((label) => (
                  <Badge key={label} variant="secondary">
                    {label}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Linked Artifacts */}
          {item.linkedArtifacts &&
            (item.linkedArtifacts.ideationPath ||
              item.linkedArtifacts.specPath ||
              item.linkedArtifacts.tasksPath) && (
              <div>
                <h4 className="font-medium mb-2 text-sm">Linked Specs</h4>
                <div className="space-y-2">
                  {item.linkedArtifacts.ideationPath && (
                    <div className="flex items-center gap-2 text-sm">
                      <Lightbulb className="size-4 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground break-all">
                        {item.linkedArtifacts.ideationPath}
                      </span>
                    </div>
                  )}
                  {item.linkedArtifacts.specPath && (
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="size-4 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground break-all">
                        {item.linkedArtifacts.specPath}
                      </span>
                    </div>
                  )}
                  {item.linkedArtifacts.tasksPath && (
                    <div className="flex items-center gap-2 text-sm">
                      <ListTodo className="size-4 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground break-all">
                        {item.linkedArtifacts.tasksPath}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

          {/* Ideation Context */}
          {item.ideationContext && (
            <div>
              <h4 className="font-medium mb-2 text-sm">Ideation Context</h4>
              <div className="space-y-3 text-sm">
                {item.ideationContext.targetUsers &&
                  item.ideationContext.targetUsers.length > 0 && (
                    <div>
                      <span className="text-muted-foreground font-medium">
                        Target Users:
                      </span>
                      <ul className="list-disc list-inside mt-1 space-y-0.5 text-muted-foreground">
                        {item.ideationContext.targetUsers.map((user, idx) => (
                          <li key={idx}>{user}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                {item.ideationContext.painPoints &&
                  item.ideationContext.painPoints.length > 0 && (
                    <div>
                      <span className="text-muted-foreground font-medium">
                        Pain Points:
                      </span>
                      <ul className="list-disc list-inside mt-1 space-y-0.5 text-muted-foreground">
                        {item.ideationContext.painPoints.map((point, idx) => (
                          <li key={idx}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                {item.ideationContext.successCriteria &&
                  item.ideationContext.successCriteria.length > 0 && (
                    <div>
                      <span className="text-muted-foreground font-medium">
                        Success Criteria:
                      </span>
                      <ul className="list-disc list-inside mt-1 space-y-0.5 text-muted-foreground">
                        {item.ideationContext.successCriteria.map((criteria, idx) => (
                          <li key={idx}>{criteria}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                {item.ideationContext.constraints &&
                  item.ideationContext.constraints.length > 0 && (
                    <div>
                      <span className="text-muted-foreground font-medium">
                        Constraints:
                      </span>
                      <ul className="list-disc list-inside mt-1 space-y-0.5 text-muted-foreground">
                        {item.ideationContext.constraints.map((constraint, idx) => (
                          <li key={idx}>{constraint}</li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="pt-4 border-t text-xs text-muted-foreground space-y-1">
            <div>Created: {formatDate(item.createdAt)}</div>
            <div>Updated: {formatDate(item.updatedAt)}</div>
          </div>

          {/* Start Ideation Button */}
          {item.status !== 'completed' && (
            <Button onClick={handleCopyCommand} className="w-full">
              <Copy className="size-4 mr-2" />
              Copy Ideation Command
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function getHealthDotColor(health: RoadmapItem['health']): string {
  return {
    'on-track': 'bg-success',
    'at-risk': 'bg-warning',
    'off-track': 'bg-destructive',
    blocked: 'bg-destructive',
  }[health]
}
