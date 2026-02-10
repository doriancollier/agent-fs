import { Suspense } from 'react'
import { OtpVerifyForm } from '@/layers/features/auth'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Verify Email',
  description: 'Enter your verification code',
}

function OtpVerifyFormWrapper() {
  return <OtpVerifyForm />
}

export default function VerifyPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold">Check your email</h1>
          <p className="text-muted-foreground">
            Enter the 6-digit code we sent you
          </p>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-soft">
          <Suspense fallback={<OtpVerifyFormSkeleton />}>
            <OtpVerifyFormWrapper />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

function OtpVerifyFormSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="text-center space-y-2">
        <div className="h-4 bg-muted rounded w-3/4 mx-auto" />
        <div className="h-4 bg-muted rounded w-1/2 mx-auto" />
      </div>
      <div className="flex justify-center gap-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="w-10 h-12 bg-muted rounded" />
        ))}
      </div>
    </div>
  )
}
