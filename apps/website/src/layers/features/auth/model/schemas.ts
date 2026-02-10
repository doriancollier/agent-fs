import { z } from 'zod'

export const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

export const otpSchema = z.object({
  otp: z.string().length(6, 'Please enter all 6 digits'),
})

export type SignInValues = z.infer<typeof signInSchema>
export type OtpValues = z.infer<typeof otpSchema>
