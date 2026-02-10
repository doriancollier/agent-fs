# Specification: Add BetterAuth Authentication with Email OTP

**Status:** Draft
**Author:** Claude Code
**Date:** 2025-12-22
**Slug:** add-authentication-betterauth

---

## Overview

Add passwordless authentication to the Next.js 16 application using BetterAuth with the emailOTP plugin. Users authenticate by entering their email address, receiving a 6-digit OTP code (logged to console in development), and entering the code to create a session. This replaces the current single-user placeholder with production-ready authentication infrastructure.

## Background/Problem Statement

The current application uses a "single-user mode" placeholder (`src/layers/shared/api/auth.ts`) that:
- Returns the first user in the database as the "current user"
- Creates a default user on first access
- Has no real authentication, sessions, or security

This is unsuitable for any multi-user scenario and provides no actual security. The application needs proper authentication that:
- Verifies user identity before granting access
- Manages sessions with proper expiration
- Integrates with the existing FSD architecture
- Provides a foundation for future auth enhancements (OAuth, 2FA)

## Goals

- Implement passwordless Email OTP authentication via BetterAuth
- Create sign-in and OTP verification UI pages following Calm Tech design
- Establish directory-based route protection via `(authenticated)/` route group
- Maintain backward compatibility with existing DAL patterns (`getCurrentUser`, `requireAuth`)
- Enable console logging for OTP codes in development (easy to swap for real email later)
- Support 7-day session persistence

## Non-Goals

- Social OAuth providers (Google, GitHub) - deferred to future spec
- Password-based authentication - using OTP instead
- Email verification flows beyond OTP - OTP inherently verifies email
- Password reset flows - no passwords to reset
- Two-factor authentication - OTP is the primary factor
- Real email delivery (Resend, SendGrid) - using console.log for development
- Rate limiting beyond BetterAuth defaults
- Admin/role-based access control

## Technical Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| better-auth | ^1.3.x | Core authentication library |
| @better-auth/cli | latest | Schema generation CLI |

**Existing Dependencies Used:**
- Prisma 7.1.0 with SQLite (existing)
- Next.js 16.1.0 App Router (existing)
- React 19.2 (existing)
- Zod 4.x (existing)
- TanStack Query 5.90+ (existing)

**Documentation References:**
- [BetterAuth Installation](https://www.better-auth.com/docs/installation)
- [BetterAuth Next.js Integration](https://www.better-auth.com/docs/integrations/next)
- [BetterAuth Prisma Adapter](https://www.better-auth.com/docs/adapters/prisma)
- [BetterAuth Email OTP Plugin](https://www.better-auth.com/docs/plugins/email-otp)

## Detailed Design

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
├─────────────────────────────────────────────────────────────────┤
│  src/lib/auth-client.ts                                         │
│  ├── createAuthClient() with emailOTPClient plugin              │
│  ├── authClient.emailOtp.sendVerificationOtp()                  │
│  ├── authClient.signIn.emailOtp()                               │
│  ├── authClient.signOut()                                       │
│  └── authClient.useSession() hook                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API Route Handler                           │
├─────────────────────────────────────────────────────────────────┤
│  src/app/api/auth/[...all]/route.ts                             │
│  └── toNextJsHandler(auth) - handles all /api/auth/* requests   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Server Auth Instance                        │
├─────────────────────────────────────────────────────────────────┤
│  src/lib/auth.ts                                                │
│  ├── betterAuth() with prismaAdapter                            │
│  ├── emailOTP plugin (console.log OTP codes)                    │
│  ├── nextCookies plugin (server action support)                 │
│  └── auth.api.getSession() for server components                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Database Layer                           │
├─────────────────────────────────────────────────────────────────┤
│  Prisma + SQLite                                                │
│  ├── User (extended with emailVerified, image)                  │
│  ├── Session (new)                                              │
│  ├── Account (new)                                              │
│  └── Verification (new)                                         │
└─────────────────────────────────────────────────────────────────┘
```

### File Organization

```
src/
├── lib/
│   ├── auth.ts                    # NEW: Server BetterAuth instance
│   ├── auth-client.ts             # NEW: Client auth utilities
│   └── prisma.ts                  # EXISTING: Prisma singleton
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── [...all]/
│   │           └── route.ts       # NEW: BetterAuth route handler
│   ├── (authenticated)/           # NEW: Protected route group
│   │   ├── layout.tsx             # NEW: Auth-checking layout
│   │   └── dashboard/
│   │       └── page.tsx           # NEW: Example protected page
│   ├── (auth)/                    # NEW: Auth pages route group
│   │   ├── sign-in/
│   │   │   └── page.tsx           # NEW: Re-exports from features
│   │   └── verify/
│   │       └── page.tsx           # NEW: Re-exports from features
│   ├── layout.tsx                 # EXISTING: Root layout
│   ├── page.tsx                   # EXISTING: Public landing
│   └── providers.tsx              # EXISTING: Query + Theme
├── layers/
│   ├── features/
│   │   └── auth/                  # NEW: Auth feature
│   │       ├── ui/
│   │       │   ├── SignInForm.tsx
│   │       │   ├── OtpVerifyForm.tsx
│   │       │   ├── SignOutButton.tsx
│   │       │   └── index.ts
│   │       ├── model/
│   │       │   ├── schemas.ts     # Zod schemas
│   │       │   └── types.ts
│   │       └── index.ts
│   └── shared/
│       └── api/
│           └── auth.ts            # MODIFY: Update to use BetterAuth
├── env.ts                         # MODIFY: Add auth env vars
└── generated/
    └── prisma/                    # Prisma client output
```

### Implementation Details

#### 1. Environment Variables (`src/env.ts`)

```typescript
// Add to server config
BETTER_AUTH_SECRET: z.string().min(32),
BETTER_AUTH_URL: z.string().url().optional(),
```

**Required `.env` additions:**
```bash
BETTER_AUTH_SECRET="your-32-character-or-longer-secret-key"
BETTER_AUTH_URL="http://localhost:3000"  # Optional, defaults to NEXT_PUBLIC_APP_URL
```

#### 2. Server Auth Configuration (`src/lib/auth.ts`)

```typescript
import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { emailOTP } from "better-auth/plugins"
import { nextCookies } from "better-auth/next-js"
import { prisma } from "./prisma"
import { env } from "@/env"

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL ?? env.NEXT_PUBLIC_APP_URL,

  database: prismaAdapter(prisma, {
    provider: "sqlite",
  }),

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days in seconds
    updateAge: 60 * 60 * 24,     // Update session daily
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minute cache
    },
  },

  plugins: [
    nextCookies(), // Required for server actions
    emailOTP({
      otpLength: 6,
      expiresIn: 300,        // 5 minutes
      allowedAttempts: 3,
      async sendVerificationOTP({ email, otp, type }) {
        // Development: Log to console
        console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  OTP Code for ${email}
  Type: ${type}
  Code: ${otp}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        `)
        // TODO: Replace with real email service (Resend)
      },
    }),
  ],
})

// Export type for client inference
export type Auth = typeof auth
```

#### 3. Client Auth Configuration (`src/lib/auth-client.ts`)

```typescript
import { createAuthClient } from "better-auth/react"
import { emailOTPClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
  plugins: [emailOTPClient()],
})

// Export commonly used methods
export const {
  useSession,
  signOut,
} = authClient
```

#### 4. API Route Handler (`src/app/api/auth/[...all]/route.ts`)

```typescript
import { auth } from "@/lib/auth"
import { toNextJsHandler } from "better-auth/next-js"

export const { GET, POST } = toNextJsHandler(auth)
```

#### 5. Updated Shared Auth Utilities (`src/layers/shared/api/auth.ts`)

```typescript
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { UnauthorizedError } from "./errors"

export type User = {
  id: string
  email: string
  name: string | null
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
 * Get the current authenticated user session
 * Returns null if not authenticated
 */
export async function getCurrentUser(): Promise<User | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  return session?.user ?? null
}

/**
 * Require authentication - throws if no valid session
 * Use in DAL functions and server actions
 */
export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser()

  if (!user) {
    throw new UnauthorizedError("Authentication required")
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
    redirect("/sign-in")
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
```

#### 6. Authenticated Layout (`src/app/(authenticated)/layout.tsx`)

```typescript
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import type { ReactNode } from "react"

interface AuthenticatedLayoutProps {
  children: ReactNode
}

export default async function AuthenticatedLayout({
  children
}: AuthenticatedLayoutProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/sign-in")
  }

  return <>{children}</>
}
```

#### 7. Database Schema Changes

Run `npx @better-auth/cli@latest generate` to generate the schema, then manually adjust to match project conventions (snake_case mapping).

**Expected Prisma schema additions:**

```prisma
model User {
  id            String    @id @default(uuid())
  email         String    @unique
  name          String?
  emailVerified Boolean   @default(false) @map("email_verified")
  image         String?
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  sessions      Session[]
  accounts      Account[]

  @@index([email])
  @@map("users")
}

model Session {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  token     String   @unique
  expiresAt DateTime @map("expires_at")
  ipAddress String?  @map("ip_address")
  userAgent String?  @map("user_agent")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([token])
  @@map("sessions")
}

model Account {
  id                   String    @id @default(uuid())
  userId               String    @map("user_id")
  accountId            String    @map("account_id")
  providerId           String    @map("provider_id")
  accessToken          String?   @map("access_token")
  refreshToken         String?   @map("refresh_token")
  accessTokenExpiresAt DateTime? @map("access_token_expires_at")
  refreshTokenExpiresAt DateTime? @map("refresh_token_expires_at")
  scope                String?
  idToken              String?   @map("id_token")
  password             String?
  createdAt            DateTime  @default(now()) @map("created_at")
  updatedAt            DateTime  @updatedAt @map("updated_at")

  user                 User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("accounts")
}

model Verification {
  id         String   @id @default(uuid())
  identifier String
  value      String
  expiresAt  DateTime @map("expires_at")
  createdAt  DateTime @default(now()) @map("created_at")
  updatedAt  DateTime @updatedAt @map("updated_at")

  @@index([identifier])
  @@map("verifications")
}
```

#### 8. Auth Feature UI Components

**Sign-In Form (`src/layers/features/auth/ui/SignInForm.tsx`):**

```typescript
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/layers/shared/ui/button"
import { Input } from "@/layers/shared/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/layers/shared/ui/form"

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
})

type SignInValues = z.infer<typeof signInSchema>

export function SignInForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "" },
  })

  async function onSubmit(values: SignInValues) {
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email: values.email,
        type: "sign-in",
      })

      if (error) {
        setError(error.message ?? "Failed to send verification code")
        return
      }

      // Redirect to verify page with email
      const params = new URLSearchParams({ email: values.email })
      router.push(`/verify?${params.toString()}`)
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email address</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Sending code..." : "Continue with email"}
        </Button>
      </form>
    </Form>
  )
}
```

**OTP Verify Form (`src/layers/features/auth/ui/OtpVerifyForm.tsx`):**

```typescript
"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/layers/shared/ui/button"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/layers/shared/ui/input-otp"

export function OtpVerifyForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email") ?? ""

  const [otp, setOtp] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Redirect if no email
  useEffect(() => {
    if (!email) {
      router.replace("/sign-in")
    }
  }, [email, router])

  async function handleVerify() {
    if (otp.length !== 6) return

    setIsLoading(true)
    setError(null)

    try {
      const { error } = await authClient.signIn.emailOtp({
        email,
        otp,
      })

      if (error) {
        setError(error.message ?? "Invalid verification code")
        setOtp("")
        return
      }

      // Success - redirect to dashboard
      router.push("/dashboard")
      router.refresh()
    } catch (err) {
      setError("An unexpected error occurred")
      setOtp("")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleResend() {
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "sign-in",
      })

      if (error) {
        setError(error.message ?? "Failed to resend code")
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-submit when OTP is complete
  useEffect(() => {
    if (otp.length === 6) {
      handleVerify()
    }
  }, [otp])

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <p className="text-muted-foreground">
          We sent a verification code to
        </p>
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

      {error && (
        <p className="text-sm text-destructive text-center">{error}</p>
      )}

      <div className="text-center">
        <Button
          variant="link"
          onClick={handleResend}
          disabled={isLoading}
        >
          Didn't receive a code? Resend
        </Button>
      </div>
    </div>
  )
}
```

**Sign Out Button (`src/layers/features/auth/ui/SignOutButton.tsx`):**

```typescript
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signOut } from "@/lib/auth-client"
import { Button } from "@/layers/shared/ui/button"

interface SignOutButtonProps {
  className?: string
}

export function SignOutButton({ className }: SignOutButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  async function handleSignOut() {
    setIsLoading(true)
    try {
      await signOut()
      router.push("/")
      router.refresh()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="ghost"
      onClick={handleSignOut}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? "Signing out..." : "Sign out"}
    </Button>
  )
}
```

### User Experience

#### Sign-In Flow

```
1. User visits /sign-in
   └── Sees email input form with Calm Tech styling

2. User enters email and clicks "Continue with email"
   └── Loading state shown on button
   └── OTP code logged to server console (dev mode)

3. User redirected to /verify?email=user@example.com
   └── 6-digit OTP input displayed
   └── Email shown for confirmation

4. User enters OTP (auto-submits on completion)
   └── If valid: Session created, redirect to /dashboard
   └── If invalid: Error shown, input cleared, can retry
   └── If too many attempts: Must request new code

5. User can click "Resend" to get new code
```

#### Protected Route Access

```
1. User visits /dashboard (or any route under (authenticated)/)

2. Layout checks session via auth.api.getSession()
   └── If valid session: Render page content
   └── If no session: Redirect to /sign-in

3. After sign-in, user returns to originally requested page
```

#### Sign-Out Flow

```
1. User clicks "Sign out" button
   └── authClient.signOut() called
   └── Session cookie cleared
   └── Redirect to /
```

## Testing Strategy

### Unit Tests

```typescript
// src/layers/features/auth/ui/__tests__/SignInForm.test.tsx
describe("SignInForm", () => {
  it("validates email format before submission", async () => {
    // Purpose: Ensures invalid emails are rejected client-side
    // This prevents unnecessary API calls and improves UX
  })

  it("shows loading state during OTP request", async () => {
    // Purpose: Verifies UI feedback during async operation
    // Prevents double-submissions and confusion
  })

  it("displays error message on failed OTP send", async () => {
    // Purpose: Ensures errors are communicated to users
    // Users need to know what went wrong
  })

  it("redirects to verify page with email param on success", async () => {
    // Purpose: Validates the sign-in → verify flow works
    // Critical path for authentication
  })
})

// src/layers/features/auth/ui/__tests__/OtpVerifyForm.test.tsx
describe("OtpVerifyForm", () => {
  it("redirects to sign-in if no email in URL params", async () => {
    // Purpose: Prevents direct access to verify page without context
    // Security: Can't verify without knowing the email
  })

  it("auto-submits when 6 digits entered", async () => {
    // Purpose: Verifies UX optimization works correctly
    // Users shouldn't need to click submit after entering code
  })

  it("clears OTP and shows error on invalid code", async () => {
    // Purpose: Ensures proper error recovery
    // Users need clear feedback and ability to retry
  })

  it("allows resending verification code", async () => {
    // Purpose: Validates resend flow works
    // Users may not receive or mistype code
  })
})
```

### Integration Tests

```typescript
// __tests__/integration/auth-flow.test.ts
describe("Authentication Flow", () => {
  it("completes full sign-in → verify → dashboard flow", async () => {
    // Purpose: End-to-end validation of happy path
    // Most critical test - validates entire auth works
  })

  it("protects (authenticated) routes from unauthenticated access", async () => {
    // Purpose: Validates security boundary
    // Critical: Ensures protected routes actually require auth
  })

  it("maintains session across page refreshes", async () => {
    // Purpose: Validates session persistence
    // Users shouldn't have to re-auth on every page load
  })

  it("clears session on sign-out", async () => {
    // Purpose: Validates sign-out actually works
    // Security: Must properly terminate sessions
  })
})
```

### Mocking Strategies

```typescript
// Mock BetterAuth client for component tests
vi.mock("@/lib/auth-client", () => ({
  authClient: {
    emailOtp: {
      sendVerificationOtp: vi.fn(),
    },
    signIn: {
      emailOtp: vi.fn(),
    },
  },
  signOut: vi.fn(),
  useSession: vi.fn(() => ({ data: null, isPending: false })),
}))

// Mock auth.api.getSession for server component tests
vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}))
```

## Performance Considerations

| Aspect | Impact | Mitigation |
|--------|--------|------------|
| Session validation on every authenticated page | Database query per request | Enable `cookieCache` (5 min) to reduce DB calls |
| OTP generation | Minimal - in-memory | None needed |
| Prisma cold start | First query slower | Connection pooling (existing pattern) |

**Cookie Cache Configuration:**
```typescript
session: {
  cookieCache: {
    enabled: true,
    maxAge: 60 * 5, // 5 minutes
  },
}
```

This caches session data in a signed cookie, reducing database lookups for repeated requests within the cache window.

## Security Considerations

| Concern | Mitigation |
|---------|------------|
| CSRF attacks | BetterAuth includes built-in CSRF protection via tokens |
| Session hijacking | Secure, HttpOnly, SameSite=Lax cookies by default |
| OTP brute force | 3 attempt limit, 5 minute expiration |
| Timing attacks | OTP sending is async (console.log won't block) |
| Session fixation | New session token generated on each sign-in |
| XSS | No auth data exposed to client-side JavaScript |

**Production Recommendations (future):**
- Enable HTTPS-only cookies in production
- Implement rate limiting on OTP endpoints
- Add IP-based anomaly detection
- Use encrypted OTP storage (`storeOTP: "encrypted"`)

## Documentation

### Files to Update

| File | Changes |
|------|---------|
| `README.md` | Add auth setup instructions, env var requirements |
| `developer-guides/03-database-prisma.md` | Document new auth models |
| `.env.example` | Add `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL` |

### New Documentation: `developer-guides/09-authentication.md`

A comprehensive developer guide for authentication is a **required deliverable**. This guide ensures long-term maintainability and smooth onboarding for new developers.

#### Guide Structure

```markdown
# Authentication

## Overview
- BetterAuth + Email OTP architecture
- How sessions work (7-day duration, cookie-based)
- Key files and their responsibilities

## Server-Side Authentication

### Checking Authentication in Server Components
- `getCurrentUser()` - returns user or null
- `requireAuth()` - throws if not authenticated (for DAL functions)
- `requireAuthOrRedirect()` - redirects to /sign-in (for pages)
- `getSession()` - returns full session with metadata

### Example: Protected Server Component
```typescript
import { requireAuthOrRedirect } from "@/layers/shared/api"

export default async function SettingsPage() {
  const { user } = await requireAuthOrRedirect()
  return <h1>Settings for {user.name}</h1>
}
```

## Client-Side Authentication

### The useSession Hook
- When to use (client components needing user data)
- Loading states and error handling
- Reactivity (auto-updates on auth changes)

### Example: User Menu Component
```typescript
"use client"
import { useSession, signOut } from "@/lib/auth-client"

export function UserMenu() {
  const { data: session, isPending } = useSession()
  if (isPending) return <Skeleton />
  if (!session) return <SignInButton />
  return <DropdownMenu>...</DropdownMenu>
}
```

## The (authenticated)/ Route Group Pattern

### How It Works
- All pages under `src/app/(authenticated)/` require authentication
- The layout at `(authenticated)/layout.tsx` checks session
- Unauthenticated users are redirected to `/sign-in`
- No auth code needed in individual pages

### Adding a New Protected Page
1. Create page under `src/app/(authenticated)/your-page/page.tsx`
2. That's it - auth is automatic via the layout

### Why This Pattern?
- Single point of auth enforcement
- Impossible to forget auth checks
- Clean URLs (no `/app/` or `/authenticated/` prefix)
- Easy to understand: "everything in this folder needs auth"

## Authentication Flow

### Sign-In Flow
1. User visits `/sign-in`
2. Enters email → OTP sent (check server console in dev)
3. Redirected to `/verify?email=...`
4. Enters 6-digit code
5. Session created → redirected to `/dashboard`

### Sign-Out Flow
1. Call `signOut()` from auth client
2. Session cookie cleared
3. Redirect to `/` or desired page

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `BETTER_AUTH_SECRET` | Yes | 32+ character secret for signing tokens |
| `BETTER_AUTH_URL` | No | Base URL (defaults to NEXT_PUBLIC_APP_URL) |

## Common Patterns

### Sign Out Button
```typescript
import { SignOutButton } from "@/layers/features/auth"
<SignOutButton />
```

### Conditional Rendering Based on Auth
```typescript
const { data: session } = useSession()
{session ? <AuthenticatedContent /> : <GuestContent />}
```

### Accessing User in DAL Functions
```typescript
export async function getUserPosts(): Promise<Post[]> {
  const user = await requireAuth()
  return prisma.post.findMany({ where: { authorId: user.id } })
}
```

## Future Extensibility

### Adding OAuth Providers (Google, GitHub)
- Install provider plugin
- Add credentials to env
- Update auth config
- Add social sign-in buttons

### Adding Two-Factor Authentication
- Enable 2FA plugin in BetterAuth
- Add TOTP setup UI
- Update sign-in flow

### Switching to Real Email (Resend)
- Install resend package
- Update sendVerificationOTP in auth.ts
- Add RESEND_API_KEY to env
```

#### Why This Guide Matters

| Concern | How the Guide Addresses It |
|---------|---------------------------|
| **Non-obvious patterns** | Explains `(authenticated)/` route group clearly |
| **Server vs Client** | Distinguishes when to use each approach |
| **Common questions** | "How do I protect a route?" answered directly |
| **Onboarding** | Single source of truth for new developers |
| **Future-proofing** | Documents extensibility paths |

## Implementation Phases

### Phase 1: Core Infrastructure

1. Install `better-auth` package
2. Add environment variables to `src/env.ts`
3. Create `src/lib/auth.ts` with BetterAuth configuration
4. Create `src/lib/auth-client.ts` with client setup
5. Create API route handler at `src/app/api/auth/[...all]/route.ts`
6. Run BetterAuth CLI to generate schema
7. Adjust schema to match project conventions (snake_case)
8. Run Prisma migration
9. Update `src/layers/shared/api/auth.ts` with new utilities

### Phase 2: Route Protection

1. Create `src/app/(authenticated)/layout.tsx`
2. Create `src/app/(authenticated)/dashboard/page.tsx` as example
3. Verify redirect works for unauthenticated users

### Phase 3: Auth UI Feature

1. Create `src/layers/features/auth/` structure
2. Implement `SignInForm` component
3. Implement `OtpVerifyForm` component
4. Implement `SignOutButton` component
5. Create `src/app/(auth)/sign-in/page.tsx`
6. Create `src/app/(auth)/verify/page.tsx`
7. Apply Calm Tech styling to all components

### Phase 4: Integration & Polish

1. Add sign-out button to dashboard/navigation
2. Update existing DAL functions if needed
3. Test complete flow
4. Update `.env.example` with auth variables
5. Update `README.md` with auth setup instructions

### Phase 5: Documentation

1. Create `developer-guides/09-authentication.md` following the structure above
2. Update `developer-guides/03-database-prisma.md` with auth models
3. Review and verify all code examples in the guide work correctly

## Resolved Questions

1. ~~**User Entity Update Strategy**~~ (RESOLVED)
   **Answer:** Merge with BetterAuth defaults - replace existing User entity entirely
   **Rationale:** The existing User entity is unused. We can adopt BetterAuth's schema completely, avoiding any synchronization issues.

2. ~~**Session Provider**~~ (RESOLVED)
   **Answer:** Start without a SessionProvider
   **Rationale:** BetterAuth's built-in `useSession()` hook handles reactive state internally via nanostores. A provider can be added later if needed for server-side prefetching or session data transformation.

3. ~~**Email Field on Existing Users**~~ (RESOLVED)
   **Answer:** No migration needed - no existing users in database
   **Rationale:** The database is fresh with no real user data, so we can simply replace the User model with BetterAuth's schema.

## References

- [Ideation Document](./01-ideation.md)
- [BetterAuth Documentation](https://www.better-auth.com/docs)
- [BetterAuth GitHub](https://github.com/better-auth/better-auth)
- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [Project CLAUDE.md](../../CLAUDE.md)
