// src/layers/features/roadmap/lib/use-roadmap-filters.ts
'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useCallback, useMemo } from 'react'
import type { RoadmapItemType, MoSCoW, Status } from '../model/types'

export type ViewMode = 'timeline' | 'status' | 'priority'

export interface RoadmapFilters {
  view: ViewMode
  types: RoadmapItemType[]
  moscow: MoSCoW[]
  statuses: Status[]
  hideCompleted: boolean
}

const DEFAULT_FILTERS: RoadmapFilters = {
  view: 'timeline',
  types: [],
  moscow: [],
  statuses: [],
  hideCompleted: false,
}

export function useRoadmapFilters() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  // Parse filters from URL
  const filters = useMemo((): RoadmapFilters => {
    const view = (searchParams.get('view') as ViewMode) || DEFAULT_FILTERS.view
    const types = searchParams.get('types')?.split(',').filter(Boolean) as RoadmapItemType[] || []
    const moscow = searchParams.get('moscow')?.split(',').filter(Boolean) as MoSCoW[] || []
    const statuses = searchParams.get('statuses')?.split(',').filter(Boolean) as Status[] || []
    const hideCompleted = searchParams.get('hideCompleted') === 'true'

    return { view, types, moscow, statuses, hideCompleted }
  }, [searchParams])

  // Update URL with new filters
  const setFilters = useCallback((updates: Partial<RoadmapFilters>) => {
    const newFilters = { ...filters, ...updates }
    const params = new URLSearchParams()

    if (newFilters.view !== DEFAULT_FILTERS.view) {
      params.set('view', newFilters.view)
    }
    if (newFilters.types.length > 0) {
      params.set('types', newFilters.types.join(','))
    }
    if (newFilters.moscow.length > 0) {
      params.set('moscow', newFilters.moscow.join(','))
    }
    if (newFilters.statuses.length > 0) {
      params.set('statuses', newFilters.statuses.join(','))
    }
    if (newFilters.hideCompleted) {
      params.set('hideCompleted', 'true')
    }

    const queryString = params.toString()
    router.push(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false })
  }, [filters, router, pathname])

  // Convenience methods
  const setView = useCallback((view: ViewMode) => setFilters({ view }), [setFilters])
  const toggleHideCompleted = useCallback(() => setFilters({ hideCompleted: !filters.hideCompleted }), [filters.hideCompleted, setFilters])
  const clearFilters = useCallback(() => setFilters(DEFAULT_FILTERS), [setFilters])

  return {
    filters,
    setFilters,
    setView,
    toggleHideCompleted,
    clearFilters,
  }
}
