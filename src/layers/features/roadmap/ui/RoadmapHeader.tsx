import * as React from 'react'
import { Map } from 'lucide-react'
import { getRoadmapMetadata } from '../../../../../roadmap/roadmap'
import { formatDate } from '../model/constants'

export function RoadmapHeader() {
  const { projectName, projectSummary, lastUpdated } = getRoadmapMetadata()

  return (
    <header className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Map className="size-4" />
        <span>Product Roadmap</span>
      </div>
      <h1 className="text-3xl font-semibold tracking-tight">{projectName}</h1>
      {projectSummary && (
        <p className="text-muted-foreground text-lg">{projectSummary}</p>
      )}
      <p className="text-sm text-muted-foreground">
        Last updated: {formatDate(lastUpdated)}
      </p>
    </header>
  )
}
