import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { UnauthorizedError } from './errors'

export type User = {
  id: string
  email: string
  name: string // Required by BetterAuth
  image: string | null
  emailVerified: boolean
  createdAt: Date
  updatedAt: Date
}

export type Session = {
  user: User
  session: {
    id: string
    userId: string
    token: string
    expiresAt: Date
    ipAddress: string | null
    userAgent: string | null
    createdAt: Date
    updatedAt: Date
  }
}

/**
 * Get the current authenticated user
 * Returns null if not authenticated
 */
export async function getCurrentUser(): Promise<User | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  return (session?.user as User) ?? null
}

/**
 * Require authentication - throws if no valid session
 * Use in DAL functions and server actions
 */
export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser()

  if (!user) {
    throw new UnauthorizedError('Authentication required')
  }

  return user
}

/**
 * Require authentication with redirect - for use in server components
 * Redirects to sign-in page if not authenticated
 */
export async function requireAuthOrRedirect(): Promise<Session> {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect('/sign-in')
  }

  return session as Session
}

/**
 * Get full session data (user + session metadata)
 */
export async function getSession(): Promise<Session | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  return session as Session | null
}
