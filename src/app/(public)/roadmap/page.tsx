import { Suspense } from 'react'
import { RoadmapVisualization } from '@/layers/features/roadmap/ui'

export const metadata = {
  title: 'Roadmap',
  description: 'Product roadmap and feature planning',
}

export default function RoadmapPage() {
  return (
    <Suspense fallback={<RoadmapSkeleton />}>
      <RoadmapVisualization />
    </Suspense>
  )
}

function RoadmapSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Header skeleton */}
      <div className="space-y-2 border-b pb-6">
        <div className="h-9 w-64 rounded bg-muted" />
        <div className="h-6 w-96 rounded bg-muted" />
        <div className="h-4 w-40 rounded bg-muted" />
      </div>

      <div className="container-default py-8 space-y-8">
        {/* Health dashboard skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 rounded-xl border bg-card p-6">
              <div className="h-4 w-24 rounded bg-muted" />
              <div className="mt-2 h-8 w-16 rounded bg-muted" />
            </div>
          ))}
        </div>

        {/* View toggle skeleton */}
        <div className="h-10 w-72 rounded bg-muted" />

        {/* Cards skeleton */}
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((col) => (
            <div key={col} className="space-y-4">
              <div className="h-6 w-24 rounded bg-muted" />
              <div className="space-y-3">
                {[1, 2, 3].map((card) => (
                  <div
                    key={card}
                    className="h-32 rounded-xl border bg-card p-4 space-y-2"
                  >
                    <div className="h-5 w-3/4 rounded bg-muted" />
                    <div className="h-4 w-full rounded bg-muted" />
                    <div className="flex gap-2 mt-auto">
                      <div className="h-5 w-16 rounded bg-muted" />
                      <div className="h-5 w-16 rounded bg-muted" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
