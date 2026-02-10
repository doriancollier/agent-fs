# Task Breakdown: Add BetterAuth Authentication with Email OTP

**Generated:** 2025-12-22
**Source:** specs/add-authentication-betterauth/02-specification.md
**Slug:** add-authentication-betterauth
**Last Decompose:** 2025-12-22

---

## Overview

This task breakdown implements passwordless Email OTP authentication using BetterAuth for the Next.js 16 application. The implementation is organized into 5 phases covering infrastructure, route protection, UI components, integration, and documentation.

**Total Tasks:** 21
**Phases:** 5

---

## Phase 1: Core Infrastructure (7 tasks)

### Task 1.1: Install BetterAuth Package

**Description:** Install the better-auth package and verify compatibility with existing dependencies
**Size:** Small
**Priority:** High
**Dependencies:** None
**Can run parallel with:** None (must be first)

**Technical Requirements:**
- Install `better-auth` package (version ^1.3.x)
- The package includes all necessary components:
  - Server-side `betterAuth()` function
  - Client-side `createAuthClient()` function
  - Prisma adapter
  - Email OTP plugin
  - Next.js handler utilities

**Implementation Steps:**
1. Run: `pnpm add better-auth`
2. Verify no peer dependency conflicts
3. Check package is in dependencies section of package.json

**Acceptance Criteria:**
- [ ] `better-auth` package installed successfully
- [ ] No dependency conflicts reported
- [ ] Package appears in package.json dependencies

---

### Task 1.2: Add Authentication Environment Variables

**Description:** Add BETTER_AUTH_SECRET and BETTER_AUTH_URL to environment configuration with T3 Env validation
**Size:** Small
**Priority:** High
**Dependencies:** None
**Can run parallel with:** Task 1.1

**Technical Requirements:**
- Add server-side environment variables to `src/env.ts`
- BETTER_AUTH_SECRET must be at least 32 characters
- BETTER_AUTH_URL is optional (defaults to NEXT_PUBLIC_APP_URL)

**Implementation - Update `src/env.ts`:**

Find the `server` object in the T3 Env configuration and add:

```typescript
// In the server object, add these variables:
BETTER_AUTH_SECRET: z.string().min(32),
BETTER_AUTH_URL: z.string().url().optional(),
```

Also add to the `runtimeEnv` object:

```typescript
// In runtimeEnv, add:
BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
```

**Implementation - Update `.env.local`:**

```bash
# Authentication (BetterAuth)
BETTER_AUTH_SECRET="your-secret-key-must-be-at-least-32-characters-long"
BETTER_AUTH_URL="http://localhost:3000"
```

**Implementation - Update `.env.example`:**

```bash
# Authentication (BetterAuth)
# Generate a secure secret: openssl rand -base64 32
BETTER_AUTH_SECRET=""
BETTER_AUTH_URL="http://localhost:3000"
```

**Acceptance Criteria:**
- [ ] T3 Env validates BETTER_AUTH_SECRET is at least 32 characters
- [ ] T3 Env validates BETTER_AUTH_URL is a valid URL when provided
- [ ] Build fails if BETTER_AUTH_SECRET is missing or too short
- [ ] `.env.example` includes placeholder values with generation instructions

---

### Task 1.3: Create Server Auth Configuration

**Description:** Create the server-side BetterAuth instance with Prisma adapter and Email OTP plugin
**Size:** Medium
**Priority:** High
**Dependencies:** Task 1.1, Task 1.2
**Can run parallel with:** None

**Technical Requirements:**
- Create `src/lib/auth.ts` with complete BetterAuth configuration
- Use Prisma adapter configured for SQLite
- Configure Email OTP plugin with 6-digit codes, 5-minute expiry, 3 attempts
- Enable nextCookies plugin for server action support
- Configure 7-day session duration with cookie caching

**Implementation - Create `src/lib/auth.ts`:**

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

**Key Configuration Details:**
- `secret`: Used for signing tokens and cookies
- `baseURL`: Used for generating callback URLs
- `session.expiresIn`: 604800 seconds = 7 days
- `session.updateAge`: Session updated once per day on activity
- `session.cookieCache`: Reduces database lookups by caching session data
- `emailOTP.otpLength`: 6-digit codes for easy entry
- `emailOTP.expiresIn`: 300 seconds = 5 minutes
- `emailOTP.allowedAttempts`: 3 attempts before code is invalidated

**Acceptance Criteria:**
- [ ] File created at `src/lib/auth.ts`
- [ ] BetterAuth instance exports successfully
- [ ] No TypeScript errors
- [ ] Prisma adapter configured for SQLite
- [ ] Email OTP plugin logs codes to console
- [ ] Session duration is 7 days
- [ ] Cookie caching enabled for 5 minutes

---

### Task 1.4: Create Client Auth Configuration

**Description:** Create the client-side auth utilities with Email OTP client plugin
**Size:** Small
**Priority:** High
**Dependencies:** Task 1.1
**Can run parallel with:** Task 1.3

**Technical Requirements:**
- Create `src/lib/auth-client.ts` with client auth setup
- Include Email OTP client plugin
- Export commonly used methods (useSession, signOut)

**Implementation - Create `src/lib/auth-client.ts`:**

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

**Usage Notes:**
- `authClient.emailOtp.sendVerificationOtp({ email, type })` - Send OTP code
- `authClient.signIn.emailOtp({ email, otp })` - Verify OTP and sign in
- `useSession()` - React hook returning `{ data: session, isPending, error }`
- `signOut()` - Clear session and cookies

**Acceptance Criteria:**
- [ ] File created at `src/lib/auth-client.ts`
- [ ] authClient exports without errors
- [ ] useSession and signOut are exported
- [ ] No TypeScript errors

---

### Task 1.5: Create API Route Handler

**Description:** Create the catch-all API route that handles all BetterAuth requests
**Size:** Small
**Priority:** High
**Dependencies:** Task 1.3
**Can run parallel with:** None

**Technical Requirements:**
- Create route handler at `src/app/api/auth/[...all]/route.ts`
- Use BetterAuth's `toNextJsHandler` utility
- Export GET and POST handlers

**Implementation - Create directory and file:**

First create the directory structure: `src/app/api/auth/[...all]/`

Then create `src/app/api/auth/[...all]/route.ts`:

```typescript
import { auth } from "@/lib/auth"
import { toNextJsHandler } from "better-auth/next-js"

export const { GET, POST } = toNextJsHandler(auth)
```

**What This Handles:**
- POST /api/auth/sign-in - Sign in requests
- POST /api/auth/sign-up - Sign up requests
- POST /api/auth/sign-out - Sign out requests
- GET /api/auth/session - Get current session
- POST /api/auth/email-otp/send-verification-otp - Send OTP
- POST /api/auth/sign-in/email-otp - Verify OTP
- And other auth-related endpoints

**Acceptance Criteria:**
- [ ] Directory structure created: `src/app/api/auth/[...all]/`
- [ ] Route file created at `src/app/api/auth/[...all]/route.ts`
- [ ] GET and POST handlers exported
- [ ] No TypeScript errors
- [ ] Route responds to requests (test with curl or browser)

---

### Task 1.6: Generate and Adjust Database Schema

**Description:** Use BetterAuth CLI to generate Prisma schema, then adjust to match project conventions
**Size:** Medium
**Priority:** High
**Dependencies:** Task 1.1, Task 1.3
**Can run parallel with:** None

**Technical Requirements:**
- Run BetterAuth CLI to generate base schema
- Adjust generated schema to use snake_case @map annotations
- Preserve project conventions (uuid() for IDs, @@map for tables)
- Add indexes for performance

**Step 1 - Generate base schema:**

```bash
npx @better-auth/cli@latest generate --config src/lib/auth.ts
```

This will output schema additions. Copy them to `prisma/schema.prisma`.

**Step 2 - Adjust schema to match conventions:**

Replace the existing User model and add new models:

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
  id                    String    @id @default(uuid())
  userId                String    @map("user_id")
  accountId             String    @map("account_id")
  providerId            String    @map("provider_id")
  accessToken           String?   @map("access_token")
  refreshToken          String?   @map("refresh_token")
  accessTokenExpiresAt  DateTime? @map("access_token_expires_at")
  refreshTokenExpiresAt DateTime? @map("refresh_token_expires_at")
  scope                 String?
  idToken               String?   @map("id_token")
  password              String?
  createdAt             DateTime  @default(now()) @map("created_at")
  updatedAt             DateTime  @updatedAt @map("updated_at")

  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)

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

**Step 3 - Apply migration:**

```bash
pnpm prisma db push
pnpm prisma generate
```

**Acceptance Criteria:**
- [ ] BetterAuth CLI generates schema successfully
- [ ] Schema adjusted with snake_case @map annotations
- [ ] All models have uuid() default for id
- [ ] All tables use @@map for snake_case table names
- [ ] Foreign key indexes added
- [ ] `pnpm prisma db push` completes without errors
- [ ] `pnpm prisma generate` regenerates client
- [ ] No TypeScript errors after regeneration

---

### Task 1.7: Update Shared Auth Utilities

**Description:** Replace placeholder auth utilities with BetterAuth integration
**Size:** Medium
**Priority:** High
**Dependencies:** Task 1.3, Task 1.6
**Can run parallel with:** None

**Technical Requirements:**
- Rewrite `src/layers/shared/api/auth.ts` to use BetterAuth
- Maintain backward compatibility with existing function signatures
- Add new utility functions for common patterns
- Export User and Session types

**Implementation - Rewrite `src/layers/shared/api/auth.ts`:**

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
 * Get the current authenticated user
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

**Functions Removed:**
- `getOrCreateDefaultUser()` - No longer needed, real auth now

**Functions Preserved (with new implementation):**
- `getCurrentUser()` - Returns user or null
- `requireAuth()` - Throws UnauthorizedError if not authenticated

**Functions Added:**
- `requireAuthOrRedirect()` - For server components, redirects instead of throwing
- `getSession()` - Returns full session with metadata

**Acceptance Criteria:**
- [ ] File rewritten with BetterAuth integration
- [ ] `getCurrentUser()` returns user from BetterAuth session
- [ ] `requireAuth()` throws UnauthorizedError when not authenticated
- [ ] `requireAuthOrRedirect()` redirects to /sign-in when not authenticated
- [ ] `getSession()` returns full session data
- [ ] User and Session types exported
- [ ] No TypeScript errors
- [ ] Existing DAL imports continue to work

---

## Phase 2: Route Protection (2 tasks)

### Task 2.1: Create Authenticated Layout

**Description:** Create the layout component that protects all routes under the (authenticated) route group
**Size:** Small
**Priority:** High
**Dependencies:** Phase 1 complete
**Can run parallel with:** None

**Technical Requirements:**
- Create `src/app/(authenticated)/layout.tsx`
- Check session using `auth.api.getSession()`
- Redirect to /sign-in if no valid session
- Pass children through unchanged when authenticated

**Implementation - Create directory structure:**

```bash
mkdir -p src/app/\(authenticated\)
```

**Implementation - Create `src/app/(authenticated)/layout.tsx`:**

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

**How This Works:**
1. Any page under `src/app/(authenticated)/` will use this layout
2. Layout runs on the server before rendering any children
3. If no valid session, user is redirected to /sign-in
4. The `(authenticated)` folder name doesn't appear in URLs
5. Individual pages don't need auth checks - the layout handles it

**Acceptance Criteria:**
- [ ] Directory created: `src/app/(authenticated)/`
- [ ] Layout file created at `src/app/(authenticated)/layout.tsx`
- [ ] Layout checks session via auth.api.getSession()
- [ ] Unauthenticated users redirected to /sign-in
- [ ] Authenticated users see page content
- [ ] No TypeScript errors

---

### Task 2.2: Create Dashboard Page (Example Protected Page)

**Description:** Create an example protected page to demonstrate and test the auth flow
**Size:** Small
**Priority:** High
**Dependencies:** Task 2.1
**Can run parallel with:** None

**Technical Requirements:**
- Create `src/app/(authenticated)/dashboard/page.tsx`
- Display user information from session
- Include sign-out button placeholder (actual button comes in Phase 3)

**Implementation - Create directory and file:**

```bash
mkdir -p src/app/\(authenticated\)/dashboard
```

**Implementation - Create `src/app/(authenticated)/dashboard/page.tsx`:**

```typescript
import { requireAuthOrRedirect } from "@/layers/shared/api/auth"

export default async function DashboardPage() {
  const { user } = await requireAuthOrRedirect()

  return (
    <div className="container py-12">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back, {user.name ?? user.email}
          </p>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-soft">
          <h2 className="text-lg font-medium mb-4">Your Account</h2>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Email</dt>
              <dd className="font-medium">{user.email}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Name</dt>
              <dd className="font-medium">{user.name ?? "Not set"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Member since</dt>
              <dd className="font-medium">
                {new Date(user.createdAt).toLocaleDateString()}
              </dd>
            </div>
          </dl>
        </div>

        {/* Sign out button will be added in Phase 3 */}
        <p className="text-sm text-muted-foreground">
          Sign out functionality coming soon
        </p>
      </div>
    </div>
  )
}
```

**Testing This Page:**
1. Visit /dashboard without authentication → should redirect to /sign-in
2. Complete sign-in flow → should show dashboard with user info
3. User info should match the authenticated user

**Acceptance Criteria:**
- [ ] Directory created: `src/app/(authenticated)/dashboard/`
- [ ] Page file created at `src/app/(authenticated)/dashboard/page.tsx`
- [ ] Page displays user email and name
- [ ] Page uses requireAuthOrRedirect() for type-safe session access
- [ ] Unauthenticated users redirected to /sign-in
- [ ] Calm Tech styling applied (shadow-soft, rounded-xl, etc.)
- [ ] No TypeScript errors

---

## Phase 3: Auth UI Feature (7 tasks)

### Task 3.1: Create Auth Feature Structure

**Description:** Create the FSD-compliant directory structure for the auth feature
**Size:** Small
**Priority:** High
**Dependencies:** Phase 1 complete
**Can run parallel with:** Phase 2

**Technical Requirements:**
- Create directory structure following FSD patterns
- Create index.ts files for clean exports
- Set up placeholder files

**Implementation - Create directories:**

```bash
mkdir -p src/layers/features/auth/{ui,model}
```

**Implementation - Create `src/layers/features/auth/model/types.ts`:**

```typescript
export type AuthError = {
  message: string
  code?: string
}
```

**Implementation - Create `src/layers/features/auth/model/schemas.ts`:**

```typescript
import { z } from "zod"

export const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
})

export const otpSchema = z.object({
  otp: z.string().length(6, "Please enter all 6 digits"),
})

export type SignInValues = z.infer<typeof signInSchema>
export type OtpValues = z.infer<typeof otpSchema>
```

**Implementation - Create `src/layers/features/auth/ui/index.ts`:**

```typescript
export { SignInForm } from "./SignInForm"
export { OtpVerifyForm } from "./OtpVerifyForm"
export { SignOutButton } from "./SignOutButton"
```

**Implementation - Create `src/layers/features/auth/index.ts`:**

```typescript
// UI Components
export { SignInForm, OtpVerifyForm, SignOutButton } from "./ui"

// Types
export type { AuthError } from "./model/types"
export type { SignInValues, OtpValues } from "./model/schemas"

// Schemas (for validation)
export { signInSchema, otpSchema } from "./model/schemas"
```

**Acceptance Criteria:**
- [ ] Directory structure created: `src/layers/features/auth/`
- [ ] Model files created (types.ts, schemas.ts)
- [ ] UI index.ts created with component exports
- [ ] Main index.ts exports everything needed
- [ ] Zod schemas defined for form validation
- [ ] No TypeScript errors

---

### Task 3.2: Implement SignInForm Component

**Description:** Create the email input form for initiating the OTP sign-in flow
**Size:** Medium
**Priority:** High
**Dependencies:** Task 1.4, Task 3.1
**Can run parallel with:** None

**Technical Requirements:**
- Use React Hook Form with Zod resolver
- Call authClient.emailOtp.sendVerificationOtp()
- Handle loading and error states
- Redirect to /verify page with email param on success
- Follow Calm Tech design patterns

**Implementation - Create `src/layers/features/auth/ui/SignInForm.tsx`:**

```typescript
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/layers/shared/ui/button"
import { Input } from "@/layers/shared/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/layers/shared/ui/form"
import { signInSchema, type SignInValues } from "../model/schemas"

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

**Acceptance Criteria:**
- [ ] File created at `src/layers/features/auth/ui/SignInForm.tsx`
- [ ] Uses React Hook Form with zodResolver
- [ ] Validates email format before submission
- [ ] Shows loading state during OTP request
- [ ] Displays error message on failed OTP send
- [ ] Redirects to /verify with email param on success
- [ ] Button disabled while loading
- [ ] No TypeScript errors

---

### Task 3.3: Implement OtpVerifyForm Component

**Description:** Create the 6-digit OTP input form for completing sign-in
**Size:** Medium
**Priority:** High
**Dependencies:** Task 1.4, Task 3.1
**Can run parallel with:** Task 3.2

**Technical Requirements:**
- Use input-otp component for 6-digit code entry
- Auto-submit when all 6 digits entered
- Handle resend functionality
- Redirect to /dashboard on success
- Show email being verified
- Clear input and show error on invalid code

**Implementation - Create `src/layers/features/auth/ui/OtpVerifyForm.tsx`:**

```typescript
"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/layers/shared/ui/button"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/layers/shared/ui/input-otp"

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

  if (!email) {
    return null // Will redirect
  }

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

**Acceptance Criteria:**
- [ ] File created at `src/layers/features/auth/ui/OtpVerifyForm.tsx`
- [ ] Redirects to /sign-in if no email in URL params
- [ ] Displays email being verified
- [ ] Uses InputOTP component for 6-digit entry
- [ ] Auto-submits when 6 digits entered
- [ ] Shows error and clears input on invalid code
- [ ] Resend button sends new OTP
- [ ] Redirects to /dashboard on successful verification
- [ ] Calls router.refresh() after successful sign-in
- [ ] No TypeScript errors

---

### Task 3.4: Implement SignOutButton Component

**Description:** Create a reusable sign-out button component
**Size:** Small
**Priority:** High
**Dependencies:** Task 1.4, Task 3.1
**Can run parallel with:** Task 3.2, Task 3.3

**Technical Requirements:**
- Use authClient.signOut() from auth-client
- Show loading state during sign-out
- Redirect to home page after sign-out
- Accept className prop for styling flexibility

**Implementation - Create `src/layers/features/auth/ui/SignOutButton.tsx`:**

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

**Acceptance Criteria:**
- [ ] File created at `src/layers/features/auth/ui/SignOutButton.tsx`
- [ ] Uses signOut from auth-client
- [ ] Shows loading state during sign-out
- [ ] Redirects to "/" after sign-out
- [ ] Calls router.refresh() to clear cached data
- [ ] Accepts className prop
- [ ] Uses ghost variant by default
- [ ] No TypeScript errors

---

### Task 3.5: Create Sign-In Page

**Description:** Create the sign-in page that renders the SignInForm component
**Size:** Small
**Priority:** High
**Dependencies:** Task 3.2
**Can run parallel with:** None

**Technical Requirements:**
- Create under `(auth)` route group for clean URLs
- Render SignInForm component
- Apply Calm Tech styling with centered card layout

**Implementation - Create directories:**

```bash
mkdir -p src/app/\(auth\)/sign-in
```

**Implementation - Create `src/app/(auth)/sign-in/page.tsx`:**

```typescript
import { SignInForm } from "@/layers/features/auth"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your account",
}

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold">Welcome back</h1>
          <p className="text-muted-foreground">
            Enter your email to sign in to your account
          </p>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-soft">
          <SignInForm />
        </div>
      </div>
    </div>
  )
}
```

**Acceptance Criteria:**
- [ ] Directory created: `src/app/(auth)/sign-in/`
- [ ] Page file created at `src/app/(auth)/sign-in/page.tsx`
- [ ] Renders SignInForm component
- [ ] Centered layout with max-w-sm
- [ ] Card with Calm Tech styling (shadow-soft, rounded-xl)
- [ ] Page title and description set via metadata
- [ ] No TypeScript errors

---

### Task 3.6: Create OTP Verification Page

**Description:** Create the OTP verification page that renders the OtpVerifyForm component
**Size:** Small
**Priority:** High
**Dependencies:** Task 3.3
**Can run parallel with:** Task 3.5

**Technical Requirements:**
- Create under `(auth)` route group
- Render OtpVerifyForm in Suspense boundary (uses useSearchParams)
- Apply Calm Tech styling

**Implementation - Create directory:**

```bash
mkdir -p src/app/\(auth\)/verify
```

**Implementation - Create `src/app/(auth)/verify/page.tsx`:**

```typescript
import { Suspense } from "react"
import { OtpVerifyForm } from "@/layers/features/auth"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Verify Email",
  description: "Enter your verification code",
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
```

**Note on Suspense:**
- `useSearchParams()` requires Suspense boundary in Next.js 16
- The wrapper function ensures proper hydration
- Skeleton provides loading state feedback

**Acceptance Criteria:**
- [ ] Directory created: `src/app/(auth)/verify/`
- [ ] Page file created at `src/app/(auth)/verify/page.tsx`
- [ ] Renders OtpVerifyForm in Suspense boundary
- [ ] Loading skeleton shown during Suspense
- [ ] Centered layout matching sign-in page
- [ ] Card with Calm Tech styling
- [ ] Page title and description set via metadata
- [ ] No TypeScript errors

---

### Task 3.7: Add InputOTP Component (if needed)

**Description:** Ensure the InputOTP Shadcn component is installed
**Size:** Small
**Priority:** High
**Dependencies:** None
**Can run parallel with:** Any

**Technical Requirements:**
- Check if InputOTP component exists
- If not, add it using Shadcn CLI
- Verify component works with Base UI patterns

**Implementation Steps:**

1. Check if component exists:
```bash
ls src/layers/shared/ui/input-otp.tsx
```

2. If not found, add it:
```bash
npx shadcn@latest add input-otp
```

Note: The project uses Base UI via basecn. The input-otp component may need to come from the @basecn registry:

```bash
npx shadcn@latest add @basecn/input-otp
```

3. If there are issues, check the input-otp package is installed:
```bash
pnpm add input-otp
```

**Acceptance Criteria:**
- [ ] InputOTP component exists at `src/layers/shared/ui/input-otp.tsx`
- [ ] Component exports InputOTP, InputOTPGroup, InputOTPSlot
- [ ] Component renders without errors
- [ ] 6-slot OTP input works correctly

---

## Phase 4: Integration & Polish (3 tasks)

### Task 4.1: Add Sign Out to Dashboard

**Description:** Add the SignOutButton to the dashboard page
**Size:** Small
**Priority:** Medium
**Dependencies:** Task 2.2, Task 3.4
**Can run parallel with:** None

**Technical Requirements:**
- Import SignOutButton from auth feature
- Add to dashboard page in appropriate location
- Remove placeholder text about sign out

**Implementation - Update `src/app/(authenticated)/dashboard/page.tsx`:**

```typescript
import { requireAuthOrRedirect } from "@/layers/shared/api/auth"
import { SignOutButton } from "@/layers/features/auth"

export default async function DashboardPage() {
  const { user } = await requireAuthOrRedirect()

  return (
    <div className="container py-12">
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Welcome back, {user.name ?? user.email}
            </p>
          </div>
          <SignOutButton />
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-soft">
          <h2 className="text-lg font-medium mb-4">Your Account</h2>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Email</dt>
              <dd className="font-medium">{user.email}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Name</dt>
              <dd className="font-medium">{user.name ?? "Not set"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Member since</dt>
              <dd className="font-medium">
                {new Date(user.createdAt).toLocaleDateString()}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  )
}
```

**Acceptance Criteria:**
- [ ] SignOutButton imported from auth feature
- [ ] Button appears in dashboard header
- [ ] Placeholder text removed
- [ ] Sign out works and redirects to home
- [ ] No TypeScript errors

---

### Task 4.2: Test Complete Authentication Flow

**Description:** Manually test the full authentication flow end-to-end
**Size:** Small
**Priority:** High
**Dependencies:** All previous tasks
**Can run parallel with:** None

**Test Scenarios:**

1. **Sign-In Flow:**
   - Visit /sign-in
   - Enter valid email
   - Click "Continue with email"
   - Check server console for OTP code
   - Verify redirect to /verify?email=...

2. **OTP Verification:**
   - On /verify page, enter 6-digit code from console
   - Verify auto-submit triggers
   - Verify redirect to /dashboard
   - Verify user info displays correctly

3. **Invalid OTP:**
   - On /verify page, enter wrong code
   - Verify error message shows
   - Verify input clears
   - Verify can retry

4. **Resend OTP:**
   - On /verify page, click "Resend"
   - Check console for new OTP code
   - Verify new code works

5. **Protected Route Access:**
   - Open new incognito window
   - Visit /dashboard directly
   - Verify redirect to /sign-in

6. **Session Persistence:**
   - After sign-in, refresh page
   - Verify still authenticated
   - Close browser, reopen
   - Visit /dashboard
   - Verify still authenticated (within 7 days)

7. **Sign Out:**
   - On dashboard, click "Sign out"
   - Verify redirect to home
   - Visit /dashboard
   - Verify redirect to /sign-in

**Acceptance Criteria:**
- [ ] Sign-in form validates email
- [ ] OTP sends successfully (appears in console)
- [ ] OTP verification creates session
- [ ] Invalid OTP shows error and clears
- [ ] Resend sends new OTP
- [ ] Protected routes redirect when unauthenticated
- [ ] Session persists across page refreshes
- [ ] Sign out clears session

---

### Task 4.3: Update Configuration Files

**Description:** Update .env.example and verify no secrets are committed
**Size:** Small
**Priority:** Medium
**Dependencies:** Task 1.2
**Can run parallel with:** Any

**Implementation - Verify `.env.example` has auth variables:**

```bash
# Authentication (BetterAuth)
# Generate a secure secret: openssl rand -base64 32
BETTER_AUTH_SECRET=""
BETTER_AUTH_URL="http://localhost:3000"
```

**Implementation - Verify `.gitignore` includes sensitive files:**

Check that these patterns exist:
```
.env
.env.local
.env*.local
```

**Implementation - Verify no secrets in git:**

```bash
git diff --cached | grep -i "secret\|password\|key"
```

**Acceptance Criteria:**
- [ ] .env.example has BETTER_AUTH_SECRET with generation instructions
- [ ] .env.example has BETTER_AUTH_URL
- [ ] .gitignore includes .env.local
- [ ] No secrets committed to git

---

## Phase 5: Documentation (2 tasks)

### Task 5.1: Create Authentication Developer Guide

**Description:** Create comprehensive documentation for authentication patterns
**Size:** Large
**Priority:** High
**Dependencies:** All previous phases
**Can run parallel with:** None

**Technical Requirements:**
- Create `developer-guides/09-authentication.md`
- Document all auth utilities and their use cases
- Include code examples for common patterns
- Explain the (authenticated) route group pattern

**Implementation - Create `developer-guides/09-authentication.md`:**

```markdown
# Authentication

## Overview

This project uses BetterAuth with Email OTP (passwordless) authentication. Users sign in by entering their email, receiving a 6-digit code, and entering it to create a session.

**Key characteristics:**
- Passwordless authentication via 6-digit OTP codes
- 7-day session duration with automatic refresh
- Cookie-based session storage with 5-minute caching
- Built-in CSRF protection

**Key files:**
| File | Purpose |
|------|---------|
| `src/lib/auth.ts` | Server-side BetterAuth configuration |
| `src/lib/auth-client.ts` | Client-side auth utilities |
| `src/layers/shared/api/auth.ts` | Auth utilities for DAL and server components |
| `src/layers/features/auth/` | Auth UI components |
| `src/app/(authenticated)/` | Protected route group |

## Server-Side Authentication

### Available Functions

| Function | Returns | Use Case |
|----------|---------|----------|
| `getCurrentUser()` | `User \| null` | Check if user is authenticated |
| `requireAuth()` | `User` | DAL functions - throws if not authenticated |
| `requireAuthOrRedirect()` | `Session` | Server components - redirects if not authenticated |
| `getSession()` | `Session \| null` | Get full session with metadata |

### Checking Authentication in Server Components

```typescript
import { getCurrentUser } from "@/layers/shared/api/auth"

export default async function MyPage() {
  const user = await getCurrentUser()

  if (!user) {
    return <p>Please sign in</p>
  }

  return <p>Hello, {user.name}</p>
}
```

### Protected Server Components (with redirect)

```typescript
import { requireAuthOrRedirect } from "@/layers/shared/api/auth"

export default async function SettingsPage() {
  const { user } = await requireAuthOrRedirect()
  // User is guaranteed to exist here
  return <h1>Settings for {user.name}</h1>
}
```

### DAL Functions (throw on auth failure)

```typescript
import { requireAuth } from "@/layers/shared/api/auth"
import { prisma } from "@/lib/prisma"

export async function getUserPosts(): Promise<Post[]> {
  const user = await requireAuth() // Throws UnauthorizedError if not authenticated

  return prisma.post.findMany({
    where: { authorId: user.id }
  })
}
```

## Client-Side Authentication

### The useSession Hook

Use `useSession()` in client components that need reactive access to authentication state:

```typescript
"use client"

import { useSession, signOut } from "@/lib/auth-client"

export function UserMenu() {
  const { data: session, isPending, error } = useSession()

  if (isPending) {
    return <Skeleton />
  }

  if (!session) {
    return <SignInButton />
  }

  return (
    <DropdownMenu>
      <span>{session.user.email}</span>
      <button onClick={() => signOut()}>Sign out</button>
    </DropdownMenu>
  )
}
```

**Hook return values:**
- `data` - Session object with user and session info
- `isPending` - True while checking session status
- `error` - Error object if session check failed

### Sign Out

```typescript
import { signOut } from "@/lib/auth-client"

await signOut()
// Session cookie cleared, user signed out
```

## The (authenticated)/ Route Group Pattern

### How It Works

All pages under `src/app/(authenticated)/` automatically require authentication:

```
src/app/
├── (authenticated)/          # Protected route group
│   ├── layout.tsx           # Auth check happens here
│   ├── dashboard/
│   │   └── page.tsx         # No auth code needed
│   ├── settings/
│   │   └── page.tsx         # No auth code needed
│   └── profile/
│       └── page.tsx         # No auth code needed
├── (auth)/                   # Auth UI pages
│   ├── sign-in/
│   │   └── page.tsx
│   └── verify/
│       └── page.tsx
└── page.tsx                  # Public home page
```

The parentheses `()` in folder names create **route groups** - they organize routes without affecting URLs:
- `/dashboard` → `src/app/(authenticated)/dashboard/page.tsx`
- `/sign-in` → `src/app/(auth)/sign-in/page.tsx`

### The Layout Check

The layout at `(authenticated)/layout.tsx` runs before any child page:

```typescript
// src/app/(authenticated)/layout.tsx
export default async function AuthenticatedLayout({ children }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/sign-in")
  }

  return <>{children}</>
}
```

### Adding a New Protected Page

1. Create your page under `src/app/(authenticated)/`:

```typescript
// src/app/(authenticated)/my-feature/page.tsx
import { requireAuthOrRedirect } from "@/layers/shared/api/auth"

export default async function MyFeaturePage() {
  const { user } = await requireAuthOrRedirect()
  return <h1>My Feature for {user.name}</h1>
}
```

2. That's it! The layout handles authentication automatically.

### Why This Pattern?

| Benefit | Explanation |
|---------|-------------|
| **Single point of auth** | Auth check in one place, not scattered |
| **Impossible to forget** | Pages under the folder are automatically protected |
| **Clean URLs** | No `/authenticated/` or `/app/` prefix in URLs |
| **Easy to understand** | "Everything in this folder needs auth" |
| **Type-safe** | `requireAuthOrRedirect()` guarantees user exists |

## Authentication Flow

### Sign-In Flow

```
1. User visits /sign-in
   └── Sees email input form

2. User enters email, clicks "Continue with email"
   └── authClient.emailOtp.sendVerificationOtp() called
   └── OTP code logged to server console (dev mode)

3. User redirected to /verify?email=user@example.com
   └── 6-digit OTP input displayed

4. User enters OTP code
   └── Auto-submits when 6 digits entered
   └── authClient.signIn.emailOtp() called

5. If valid:
   └── Session cookie set
   └── Redirect to /dashboard

6. If invalid:
   └── Error shown, input cleared
   └── Can retry (3 attempts max)
```

### Sign-Out Flow

```
1. User clicks "Sign out" button
   └── signOut() called

2. Session cookie cleared
   └── Redirect to / (home page)

3. Protected routes now redirect to /sign-in
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `BETTER_AUTH_SECRET` | Yes | 32+ character secret for signing tokens |
| `BETTER_AUTH_URL` | No | Base URL (defaults to NEXT_PUBLIC_APP_URL) |

**Generate a secure secret:**
```bash
openssl rand -base64 32
```

## Common Patterns

### Sign Out Button

```typescript
import { SignOutButton } from "@/layers/features/auth"

<SignOutButton />
// or with custom styling
<SignOutButton className="text-red-500" />
```

### Conditional Rendering Based on Auth

```typescript
"use client"
import { useSession } from "@/lib/auth-client"

function Header() {
  const { data: session, isPending } = useSession()

  if (isPending) return <HeaderSkeleton />

  return (
    <header>
      {session ? (
        <UserMenu user={session.user} />
      ) : (
        <SignInButton />
      )}
    </header>
  )
}
```

### Server Component with Optional Auth

```typescript
import { getCurrentUser } from "@/layers/shared/api/auth"

export default async function HomePage() {
  const user = await getCurrentUser()

  return (
    <div>
      <h1>Welcome{user ? `, ${user.name}` : ""}</h1>
      {user ? (
        <Link href="/dashboard">Go to Dashboard</Link>
      ) : (
        <Link href="/sign-in">Sign In</Link>
      )}
    </div>
  )
}
```

## Debugging

### Check OTP Codes

In development, OTP codes are logged to the server console:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  OTP Code for user@example.com
  Type: sign-in
  Code: 123456
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Check Session State

Use Prisma Studio to inspect sessions:

```bash
pnpm prisma:studio
```

Look at the `sessions` table to see active sessions.

### Clear Sessions

To force sign-out all users (development):

```bash
# In Prisma Studio, delete all rows from sessions table
```

## Future Extensibility

### Adding OAuth Providers (Google, GitHub)

1. Install the OAuth plugin
2. Add provider credentials to env
3. Update auth.ts configuration
4. Add social sign-in buttons to UI

### Adding Two-Factor Authentication

1. Enable 2FA plugin in BetterAuth
2. Add TOTP setup UI component
3. Update sign-in flow to check 2FA status

### Switching to Real Email (Resend)

1. Install: `pnpm add resend`
2. Add `RESEND_API_KEY` to env.ts
3. Update `sendVerificationOTP` in auth.ts:

```typescript
async sendVerificationOTP({ email, otp, type }) {
  const resend = new Resend(env.RESEND_API_KEY)
  await resend.emails.send({
    from: "noreply@yourapp.com",
    to: email,
    subject: "Your verification code",
    text: `Your code is: ${otp}`,
  })
}
```
```

**Acceptance Criteria:**
- [ ] File created at `developer-guides/09-authentication.md`
- [ ] All auth utilities documented with examples
- [ ] (authenticated) route group pattern explained
- [ ] Authentication flow diagrams included
- [ ] Environment variables documented
- [ ] Common patterns with code examples
- [ ] Future extensibility section included
- [ ] Debugging tips included

---

### Task 5.2: Update Existing Documentation

**Description:** Update README.md and database guide with auth information
**Size:** Small
**Priority:** Medium
**Dependencies:** Task 5.1
**Can run parallel with:** None

**Technical Requirements:**
- Add auth setup section to README.md
- Update developer-guides/03-database-prisma.md with auth models

**Implementation - Add to README.md (after "Getting Started" section):**

```markdown
## Authentication

This project uses BetterAuth with Email OTP for passwordless authentication.

### Setup

1. Generate a secret:
   ```bash
   openssl rand -base64 32
   ```

2. Add to `.env.local`:
   ```bash
   BETTER_AUTH_SECRET="your-generated-secret"
   BETTER_AUTH_URL="http://localhost:3000"
   ```

3. Run database migrations:
   ```bash
   pnpm prisma db push
   ```

### Development

OTP codes are logged to the server console in development. Check the terminal running `pnpm dev` for codes.

See `developer-guides/09-authentication.md` for detailed documentation.
```

**Implementation - Update `developer-guides/03-database-prisma.md`:**

Add a section under "Models" or "Schema":

```markdown
## Authentication Models

BetterAuth adds the following models:

| Model | Purpose |
|-------|---------|
| `User` | User accounts with email, name, image |
| `Session` | Active login sessions (7-day expiry) |
| `Account` | OAuth provider connections (future) |
| `Verification` | OTP codes and verification tokens |

These models follow project conventions (snake_case via @map).
```

**Acceptance Criteria:**
- [ ] README.md has auth setup section
- [ ] README.md references the developer guide
- [ ] Database guide documents auth models
- [ ] No broken links

---

## Execution Strategy

### Dependency Graph

```
Phase 1 (Infrastructure)
├── Task 1.1 (Install) ───────────────┐
├── Task 1.2 (Env vars) ─────────────┼──→ Task 1.3 (Server auth)
│                                     │           │
├── Task 1.4 (Client auth) ──────────┘           │
│                                                 │
│                                     Task 1.5 (API route) ←──┘
│                                                 │
└─────────────────────────────────────→ Task 1.6 (Schema)
                                                  │
                                       Task 1.7 (Shared auth) ←──┘

Phase 2 (Route Protection)
Task 2.1 (Layout) ──→ Task 2.2 (Dashboard)

Phase 3 (Auth UI)
Task 3.1 (Structure) ──┬──→ Task 3.2 (SignInForm)
                       ├──→ Task 3.3 (OtpVerifyForm)
                       └──→ Task 3.4 (SignOutButton)
                                    │
Task 3.7 (InputOTP) ────────────────┘
                                    │
                       Task 3.5 (Sign-in page) ←── Task 3.2
                       Task 3.6 (Verify page) ←─── Task 3.3

Phase 4 (Integration)
Task 4.1 (Dashboard update) ←── Task 2.2, Task 3.4
Task 4.2 (Testing) ←── All previous
Task 4.3 (Config) ←── Task 1.2

Phase 5 (Documentation)
Task 5.1 (Developer guide) ←── All phases
Task 5.2 (Update docs) ←── Task 5.1
```

### Parallel Execution Opportunities

**Can run in parallel:**
- Task 1.1 + Task 1.2 (install + env vars)
- Task 1.3 + Task 1.4 (server + client auth)
- Task 3.2 + Task 3.3 + Task 3.4 (all UI components)
- Task 3.5 + Task 3.6 (both pages)

### Recommended Execution Order

1. **First batch:** 1.1, 1.2 (parallel)
2. **Second batch:** 1.3, 1.4 (parallel, after 1.1)
3. **Third batch:** 1.5 (after 1.3)
4. **Fourth batch:** 1.6 (after 1.3)
5. **Fifth batch:** 1.7 (after 1.6)
6. **Sixth batch:** 2.1, 3.1, 3.7 (parallel, after Phase 1)
7. **Seventh batch:** 2.2, 3.2, 3.3, 3.4 (parallel)
8. **Eighth batch:** 3.5, 3.6 (parallel)
9. **Ninth batch:** 4.1, 4.3 (parallel)
10. **Tenth batch:** 4.2 (full test)
11. **Final batch:** 5.1, then 5.2

---

## Summary

| Phase | Tasks | Priority Tasks |
|-------|-------|----------------|
| Phase 1: Core Infrastructure | 7 | 1.3, 1.6, 1.7 |
| Phase 2: Route Protection | 2 | 2.1 |
| Phase 3: Auth UI Feature | 7 | 3.2, 3.3 |
| Phase 4: Integration & Polish | 3 | 4.2 |
| Phase 5: Documentation | 2 | 5.1 |
| **Total** | **21** | |

**Critical Path:** 1.1 → 1.3 → 1.5 → 1.6 → 1.7 → 2.1 → 3.2 → 3.5 → 4.2
