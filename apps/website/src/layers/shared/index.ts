// Shared layer public API
// Re-export utilities
export { cn, makeQueryClient, queryKeys } from './lib'

// Re-export auth utilities
export { getCurrentUser, requireAuth, requireAuthOrRedirect, getSession } from './api'
export type { User, Session } from './api'

// Re-export error types
export { UnauthorizedError, NotFoundError, ValidationError } from './api'
