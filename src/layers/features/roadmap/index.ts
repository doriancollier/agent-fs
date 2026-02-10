/**
 * Roadmap Feature
 *
 * A visual roadmap management system using MoSCoW prioritization.
 * Displays project items in Timeline (Now/Next/Later), Status, and Priority views.
 *
 * @example
 * ```tsx
 * // In a page component
 * import { RoadmapVisualization } from '@/layers/features/roadmap'
 *
 * export default function RoadmapPage() {
 *   return <RoadmapVisualization />
 * }
 * ```
 *
 * @see `roadmap/roadmap.json` - Data source managed by Python scripts
 * @see `roadmap/roadmap.ts` - TypeScript wrapper with types
 */

// Model exports (types, schemas, constants)
export * from './model'

// Lib exports (hooks, utilities)
export * from './lib'

// UI exports (components)
export * from './ui'
