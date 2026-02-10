// src/layers/features/roadmap/model/types.ts

export type RoadmapItemType = 'feature' | 'bugfix' | 'technical-debt' | 'research' | 'epic'
export type MoSCoW = 'must-have' | 'should-have' | 'could-have' | 'wont-have'
export type Status = 'not-started' | 'in-progress' | 'completed' | 'on-hold'
export type Health = 'on-track' | 'at-risk' | 'off-track' | 'blocked'
export type TimeHorizon = 'now' | 'next' | 'later'

export interface LinkedArtifacts {
  specSlug?: string
  ideationPath?: string
  specPath?: string
  tasksPath?: string
  implementationPath?: string
}

export interface IdeationContext {
  targetUsers?: string[]
  painPoints?: string[]
  successCriteria?: string[]
  constraints?: string[]
}

export interface RoadmapItem {
  id: string                    // UUID v4
  title: string                 // 3-200 chars
  description?: string          // max 2000 chars
  type: RoadmapItemType
  moscow: MoSCoW
  status: Status
  health: Health
  timeHorizon: TimeHorizon
  effort?: number               // 1-13 Fibonacci
  dependencies?: string[]       // Array of item UUIDs
  labels?: string[]
  createdAt: string            // ISO 8601
  updatedAt: string            // ISO 8601
  linkedArtifacts?: LinkedArtifacts
  ideationContext?: IdeationContext
}

export interface TimeHorizonConfig {
  label: string
  description: string
}

export interface Roadmap {
  projectName: string
  projectSummary: string
  lastUpdated: string
  timeHorizons: {
    now: TimeHorizonConfig
    next: TimeHorizonConfig
    later: TimeHorizonConfig
  }
  items: RoadmapItem[]
}
