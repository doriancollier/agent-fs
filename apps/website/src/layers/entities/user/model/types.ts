import { z } from 'zod'

export const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1), // Required by BetterAuth
})

export type CreateUserInput = z.infer<typeof createUserSchema>

export interface User {
  id: string
  email: string
  name: string // Required by BetterAuth
  createdAt: Date
  updatedAt: Date
}
