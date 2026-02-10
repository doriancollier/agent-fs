# Add Authentication with BetterAuth

**Slug:** add-authentication-betterauth
**Author:** Claude Code
**Date:** 2025-12-22
**Branch:** preflight/add-authentication-betterauth
**Related:** N/A

---

## 1) Intent & Assumptions

- **Task brief:** Add user authentication to the Next.js 16 boilerplate application using BetterAuth, a modern TypeScript-first authentication library. This will replace the current single-user mode placeholder with proper authentication including sign-up, sign-in, and session management.

- **Assumptions:**
  - Using BetterAuth's Prisma adapter with existing SQLite database
  - **Email OTP (passwordless) authentication** as the primary method
  - Session-based authentication with secure cookie management (7-day sessions)
  - Integration with existing FSD architecture patterns
  - Will use BetterAuth's CLI for schema generation
  - **Email service required** for sending OTP codes (e.g., Resend, SendGrid)

- **Out of scope:**
  - Social OAuth providers (Google, GitHub, etc.) - can be added later
  - Password-based authentication (using OTP instead)
  - Two-factor authentication
  - Rate limiting (beyond BetterAuth defaults)

---

## 2) Pre-reading Log

| File | Takeaway |
|------|----------|
| `prisma/schema.prisma` | SQLite database with existing User model (id, email, name, createdAt, updatedAt). Uses Prisma 7 with custom output path. |
| `src/env.ts` | T3 Env validation with DATABASE_URL. Need to add BETTER_AUTH_SECRET and BETTER_AUTH_URL. |
| `src/app/providers.tsx` | Client providers setup with QueryClient and ThemeProvider. May need auth session provider. |
| `src/layers/shared/api/auth.ts` | Placeholder auth with getCurrentUser(), requireAuth(), getOrCreateDefaultUser(). This needs to be replaced with real BetterAuth integration. |
| `src/layers/shared/api/errors.ts` | Error classes (UnauthorizedError, NotFoundError, ValidationError) already exist. |
| `package.json` | Prisma 7.1.0, Next.js 16.1.0, React 19.2. No existing auth packages. |
| `developer-guides/03-database-prisma.md` | Snake_case naming convention for database (@map annotations). |

---

## 3) Codebase Map

### Primary Components/Modules

| Path | Role |
|------|------|
| `src/layers/shared/api/auth.ts` | Auth utilities - needs full replacement |
| `src/lib/prisma.ts` | Prisma singleton instance - used by BetterAuth adapter |
| `src/app/providers.tsx` | Client providers - may need session provider |
| `src/env.ts` | Environment validation - needs new auth vars |
| `prisma/schema.prisma` | Database schema - needs BetterAuth tables |

### Shared Dependencies

- **Theme/UI:** next-themes, Shadcn components
- **State:** TanStack Query for server state, Zustand for client state
- **Validation:** Zod 4.x
- **Forms:** React Hook Form + @hookform/resolvers

### Data Flow

```
User action → Auth Client → API Route (/api/auth/*) → BetterAuth → Prisma → SQLite
                                ↓
Server Components ← auth.api.getSession() ← headers()
```

### Feature Flags/Config

- No existing feature flags
- Auth will be controlled by presence of session

### Potential Blast Radius

| Area | Impact |
|------|--------|
| `src/layers/shared/api/auth.ts` | Full rewrite |
| `src/app/api/auth/` | New route handlers |
| `prisma/schema.prisma` | New models (session, account, verification) |
| `src/env.ts` | New environment variables |
| `src/lib/auth.ts` | New server auth config |
| `src/lib/auth-client.ts` | New client auth utilities |
| All DAL files using `getCurrentUser` | Update imports |

---

## 4) Root Cause Analysis

N/A - This is a new feature, not a bug fix.

---

## 5) Research

### BetterAuth Overview

BetterAuth is a modern, TypeScript-first authentication library designed for the JavaScript ecosystem. It offers:

- **Framework agnostic** with first-class Next.js support
- **Database agnostic** with adapters for Prisma, Drizzle, MongoDB, etc.
- **Plugin architecture** for extensibility (2FA, passkeys, organizations, etc.)
- **Built-in CSRF protection** and secure session management

### Potential Solutions

#### Option A: BetterAuth with Prisma Adapter (Recommended)

**Pros:**
- Native Prisma 7 support with custom output paths
- Automatic schema generation via CLI
- SQLite support out of the box
- TypeScript-first with excellent type safety
- Plugin system for future features (OAuth, 2FA, etc.)
- `nextCookies()` plugin handles cookie management in server actions
- Supports Next.js 16 proxy pattern

**Cons:**
- Newer library (less community resources than NextAuth)
- Need to manage schema changes manually after initial generation
- Some experimental features (joins)

#### Option B: NextAuth (Auth.js) v5

**Pros:**
- Mature ecosystem with extensive documentation
- Large community and plugin ecosystem
- Well-tested in production

**Cons:**
- More complex configuration
- Prisma adapter has some quirks
- Migration path from v4 to v5 is complex
- Less TypeScript-first design

#### Option C: Lucia Auth

**Pros:**
- Lightweight and flexible
- Good TypeScript support
- Direct database control

**Cons:**
- More manual setup required
- Less built-in features
- Smaller ecosystem

### Recommendation

**Option A: BetterAuth with Prisma Adapter**

BetterAuth is the best fit for this project because:

1. **Modern TypeScript design** aligns with project's type-safety focus
2. **Prisma 7 support** with custom output paths (matches our setup)
3. **SQLite compatibility** for local development
4. **Plugin architecture** allows incremental feature additions
5. **Next.js 16 support** including proxy pattern for middleware
6. **Clean API** that integrates well with server components and actions

### Implementation Architecture

```
src/
├── lib/
│   ├── auth.ts              # Server-side BetterAuth instance
│   └── auth-client.ts       # Client-side auth utilities
├── app/
│   └── api/
│       └── auth/
│           └── [...all]/
│               └── route.ts # BetterAuth route handler
├── layers/
│   └── shared/
│       └── api/
│           └── auth.ts      # getCurrentUser, requireAuth (updated)
└── prisma/
    └── schema.prisma        # + Session, Account, Verification models
```

---

## 6) Clarification & Decisions

### Questions Resolved

| Question | Decision |
|----------|----------|
| Authentication method | **Email OTP (6-digit code)** - Passwordless auth via email codes |
| Email verification | **No verification required** - Immediate access after OTP sign-in |
| Session duration | **7 days** - Good balance of security and convenience |
| Auth UI | **Include pre-built pages** - Sign-in/sign-up pages following Calm Tech design |

### Additional Requirements

**Email Service Needed:** Email OTP requires an email delivery service. Options:
- **Resend** (recommended) - Modern, developer-friendly, generous free tier
- **SendGrid** - Enterprise option with high deliverability
- **AWS SES** - Cost-effective for high volume

### Email OTP Flow

```
1. User enters email on sign-in page
2. System sends 6-digit OTP code to email
3. User enters code on verification page
4. System validates code, creates session
5. User is redirected to dashboard/home
```

### BetterAuth Email OTP Plugin

The implementation will use BetterAuth's `emailOTP` plugin:

```typescript
emailOTP({
  otpLength: 6,        // 6-digit codes
  expiresIn: 300,      // 5 minutes
  allowedAttempts: 3,  // Max retries before invalidation
  async sendVerificationOTP({ email, otp, type }) {
    // Send via email service
  }
})
```

---

## 7) Next Steps

This ideation document is ready for specification. Run:

```bash
/ideate-to-spec specs/add-authentication-betterauth/01-ideation.md
```

The specification will detail:
1. Database schema changes (BetterAuth tables)
2. Environment variable additions
3. BetterAuth configuration
4. Email service integration
5. Auth UI components (sign-in, OTP verification)
6. Session management utilities
7. Protected route patterns
