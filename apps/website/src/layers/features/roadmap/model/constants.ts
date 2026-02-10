// src/layers/features/roadmap/model/constants.ts

import type { Status, Health, MoSCoW, RoadmapItemType, TimeHorizon } from './types'

// Color mappings for badges (using Tailwind classes)
export const STATUS_COLORS: Record<Status, string> = {
  'not-started': 'bg-muted text-muted-foreground',
  'in-progress': 'bg-info/20 text-info',
  'completed': 'bg-success/20 text-success',
  'on-hold': 'bg-warning/20 text-warning',
}

export const HEALTH_COLORS: Record<Health, string> = {
  'on-track': 'text-success',
  'at-risk': 'text-warning',
  'off-track': 'text-destructive',
  'blocked': 'text-destructive',
}

export const MOSCOW_COLORS: Record<MoSCoW, string> = {
  'must-have': 'bg-destructive/20 text-destructive',
  'should-have': 'bg-warning/20 text-warning',
  'could-have': 'bg-info/20 text-info',
  'wont-have': 'bg-muted text-muted-foreground',
}

export const TYPE_ICONS: Record<RoadmapItemType, string> = {
  'feature': 'Sparkles',
  'bugfix': 'Bug',
  'technical-debt': 'Wrench',
  'research': 'Search',
  'epic': 'Layers',
}

// Display formatters
export function formatStatus(status: Status): string {
  return {
    'not-started': 'Not Started',
    'in-progress': 'In Progress',
    'completed': 'Completed',
    'on-hold': 'On Hold',
  }[status]
}

export function formatHealth(health: Health): string {
  return {
    'on-track': 'On Track',
    'at-risk': 'At Risk',
    'off-track': 'Off Track',
    'blocked': 'Blocked',
  }[health]
}

export function formatMoSCoW(moscow: MoSCoW): string {
  return {
    'must-have': 'Must Have',
    'should-have': 'Should Have',
    'could-have': 'Could Have',
    'wont-have': "Won't Have",
  }[moscow]
}

export function formatType(type: RoadmapItemType): string {
  return {
    'feature': 'Feature',
    'bugfix': 'Bug Fix',
    'technical-debt': 'Tech Debt',
    'research': 'Research',
    'epic': 'Epic',
  }[type]
}

export function formatTimeHorizon(horizon: TimeHorizon): string {
  return {
    'now': 'Now',
    'next': 'Next',
    'later': 'Later',
  }[horizon]
}

export function formatDate(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Effort values (Fibonacci)
export const EFFORT_VALUES = [1, 2, 3, 5, 8, 13] as const

// Label mappings for filters
export const TYPE_LABELS: Record<RoadmapItemType, string> = {
  feature: 'Feature',
  bugfix: 'Bug Fix',
  'technical-debt': 'Tech Debt',
  research: 'Research',
  epic: 'Epic',
}

export const MOSCOW_LABELS: Record<MoSCoW, string> = {
  'must-have': 'Must Have',
  'should-have': 'Should Have',
  'could-have': 'Could Have',
  'wont-have': "Won't Have",
}

export const STATUS_LABELS: Record<Status, string> = {
  'not-started': 'Not Started',
  'in-progress': 'In Progress',
  completed: 'Completed',
  'on-hold': 'On Hold',
}
