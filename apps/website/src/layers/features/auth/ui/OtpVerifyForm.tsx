'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import posthog from 'posthog-js'
import { authClient } from '@/lib/auth-client'
import {
  Button,
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/layers/shared/ui'

export function OtpVerifyForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') ?? ''

  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Redirect if no email
  useEffect(() => {
    if (!email) {
      router.replace('/sign-in')
    }
  }, [email, router])

  const handleVerify = useCallback(async () => {
    if (otp.length !== 6) return

    setIsLoading(true)
    setError(null)

    // Track OTP verification attempt
    posthog.capture('otp_verification_started', {
      email_domain: email.split('@')[1],
    })

    try {
      const { error, data } = await authClient.signIn.emailOtp({
        email,
        otp,
      })

      if (error) {
        // Track verification failure
        posthog.capture('otp_verification_failed', {
          error_message: error.message,
        })
        setError(error.message ?? 'Invalid verification code')
        setOtp('')
        return
      }

      // Track successful verification
      posthog.capture('otp_verification_succeeded', {
        email_domain: email.split('@')[1],
      })

      // Identify the user in PostHog after successful sign-in
      if (data?.user) {
        posthog.identify(data.user.id, {
          email: data.user.email,
          name: data.user.name,
        })
      }

      // Success - redirect to dashboard
      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      // Capture exception for error tracking
      posthog.captureException(err)
      setError('An unexpected error occurred')
      setOtp('')
    } finally {
      setIsLoading(false)
    }
  }, [otp, email, router])

  async function handleResend() {
    setIsLoading(true)
    setError(null)

    // Track resend request
    posthog.capture('otp_resend_requested', {
      email_domain: email.split('@')[1],
    })

    try {
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: 'sign-in',
      })

      if (error) {
        setError(error.message ?? 'Failed to resend code')
      }
    } catch (err) {
      posthog.captureException(err)
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-submit when OTP is complete
  useEffect(() => {
    if (otp.length === 6) {
      handleVerify()
    }
  }, [otp, handleVerify])

  if (!email) {
    return null // Will redirect
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <p className="text-muted-foreground">We sent a verification code to</p>
        <p className="font-medium">{email}</p>
      </div>

      <div className="flex justify-center">
        <InputOTP
          maxLength={6}
          value={otp}
          onChange={setOtp}
          disabled={isLoading}
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </div>

      {error && <p className="text-sm text-destructive text-center">{error}</p>}

      <div className="text-center">
        <Button variant="link" onClick={handleResend} disabled={isLoading}>
          Didn&apos;t receive a code? Resend
        </Button>
      </div>
    </div>
  )
}
