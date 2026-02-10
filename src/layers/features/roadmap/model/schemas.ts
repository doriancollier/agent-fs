// src/layers/features/roadmap/model/schemas.ts

import { z } from 'zod'

export const roadmapItemTypeSchema = z.enum(['feature', 'bugfix', 'technical-debt', 'research', 'epic'])
export const moscowSchema = z.enum(['must-have', 'should-have', 'could-have', 'wont-have'])
export const statusSchema = z.enum(['not-started', 'in-progress', 'completed', 'on-hold'])
export const healthSchema = z.enum(['on-track', 'at-risk', 'off-track', 'blocked'])
export const timeHorizonSchema = z.enum(['now', 'next', 'later'])

export const linkedArtifactsSchema = z.object({
  specSlug: z.string().optional(),
  ideationPath: z.string().optional(),
  specPath: z.string().optional(),
  tasksPath: z.string().optional(),
  implementationPath: z.string().optional(),
})

export const ideationContextSchema = z.object({
  targetUsers: z.array(z.string()).optional(),
  painPoints: z.array(z.string()).optional(),
  successCriteria: z.array(z.string()).optional(),
  constraints: z.array(z.string()).optional(),
})

export const roadmapItemSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(3).max(200),
  description: z.string().max(2000).optional(),
  type: roadmapItemTypeSchema,
  moscow: moscowSchema,
  status: statusSchema,
  health: healthSchema,
  timeHorizon: timeHorizonSchema,
  effort: z.number().min(0).max(13).optional(),
  dependencies: z.array(z.string().uuid()).optional(),
  labels: z.array(z.string()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  linkedArtifacts: linkedArtifactsSchema.optional(),
  ideationContext: ideationContextSchema.optional(),
})

export const timeHorizonConfigSchema = z.object({
  label: z.string(),
  description: z.string(),
})

export const roadmapSchema = z.object({
  projectName: z.string(),
  projectSummary: z.string(),
  lastUpdated: z.string().datetime(),
  timeHorizons: z.object({
    now: timeHorizonConfigSchema,
    next: timeHorizonConfigSchema,
    later: timeHorizonConfigSchema,
  }),
  items: z.array(roadmapItemSchema),
})
