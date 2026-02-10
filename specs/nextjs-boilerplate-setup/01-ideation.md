# Next.js Boilerplate Setup

**Slug:** nextjs-boilerplate-setup
**Author:** Claude Code
**Date:** 2025-12-08
**Branch:** preflight/nextjs-boilerplate-setup
**Related:** N/A (greenfield project)

---

## 1) Intent & Assumptions

**Task brief:** Set up a production-ready Next.js boilerplate application with the latest stable versions of Next.js 16, Prisma 7, Tailwind CSS v4, Shadcn UI, and a comprehensive set of supporting libraries including T3 Env, Zod, React Query, React Hook Form, Motion, Zustand, usehooks-ts, and lodash. The boilerplate should include developer guides and a CLAUDE.md file.

**Assumptions:**
- This is a greenfield project with no existing codebase
- Targeting deployment on Vercel (serverless environment)
- PostgreSQL will be the database of choice
- TypeScript is required
- App Router is the routing paradigm (not Pages Router)
- Dark mode support is expected
- Forms will use Shadcn's Form components with react-hook-form and Zod validation
- The project will use pnpm as the package manager (handles React 19 peer deps better than npm)

**Out of scope:**
- Authentication implementation (Auth.js, Clerk, etc.)
- Specific business logic or domain features
- CI/CD pipeline configuration
- Docker containerization
- Testing setup (Jest, Playwright, etc.)
- Internationalization (i18n)
- Email services
- Payment processing
- Analytics/monitoring

---

## 2) Pre-reading Log

- `.claude/README.md`: Contains workflow commands for ideation, spec creation, and execution. Uses claudeflow package with ClaudeKit integration.
- No existing package.json, tsconfig.json, or Next.js configuration files found
- No developer-guides/ directory exists yet
- No existing specs to reference

---

## 3) Codebase Map

- **Primary components/modules:** N/A (greenfield)
- **Shared dependencies:** N/A (greenfield)
- **Data flow:** N/A (greenfield)
- **Feature flags/config:** Will use T3 Env for environment variable management
- **Potential blast radius:** N/A (greenfield)

---

## 4) Root Cause Analysis

N/A - This is a new feature (boilerplate setup), not a bug fix.

---

## 5) Research Findings

### Stack Version Summary

| Library | Latest Version | Key Notes |
|---------|---------------|-----------|
| Next.js | **16.0.7** | CRITICAL: Security patch for CVE-2025-55182. Middleware renamed to Proxy. Async APIs required. |
| Prisma | **7.1.0** | New `prisma-client` generator (ESM-first). Output path required. 90% smaller bundles. |
| Tailwind CSS | **4.0.0** | CSS-first config via `@theme`. No `tailwind.config.js` needed. PostCSS plugin moved to `@tailwindcss/postcss`. |
| Shadcn UI | **CLI 3.0** | 50+ components. New `<Field />` component for forms. Tailwind v4 compatible. |
| T3 Env | **0.13.8** | Standard Schema support. Zod 3.24+ required. `experimental__runtimeEnv` for simplified client vars. |
| Zod | **4.1.13** | 14x faster string parsing. `@zod/mini` for smaller bundles. Breaking: error customization API changes. |
| TanStack Query | **5.90.12** | `useSuspenseQuery` for SSR. `gcTime` replaces `cacheTime`. React 18.2+ required. |
| React Hook Form | **7.68.0** | New `FormStateSubscribe` component. Better Next.js 16 Server Actions support. |
| @hookform/resolvers | **5.2.2** | Auto type inference from Zod schemas. |
| Motion | **12.23.25** | Rebranded from Framer Motion. Works with React, Vue, and vanilla JS. |
| Zustand | **5.0.8** | Use per-request stores in Next.js. Mark components with `'use client'`. |
| usehooks-ts | **3.1.1** | 33 hooks. Fully tree-shakable. |
| lodash-es | **4.17.21** | Use `lodash-es` for tree-shaking. |

### Critical Breaking Changes & Migration Notes

#### Next.js 16 Breaking Changes

1. **Middleware → Proxy Rename**
   - Rename `middleware.ts` → `proxy.ts`
   - Rename exported function from `middleware` to `proxy`
   - Same functionality, better naming clarity

2. **Async Request APIs (CRITICAL)**
   - `params`, `searchParams`, `cookies()`, `headers()`, `draftMode()` are now async
   - Must use `await` to access these values:
   ```typescript
   // OLD (Next.js 15 and earlier)
   export default function Page({ params }) {
     const { slug } = params
   }

   // NEW (Next.js 16)
   export default async function Page(props) {
     const { slug } = await props.params
   }
   ```

3. **Minimum Requirements**
   - Node.js 20.9.0+ (Node 18 no longer supported)
   - TypeScript 5.1.0+
   - React 19.2

4. **New Features**
   - Cache Components with `"use cache"` directive
   - Turbopack now default (2-5x faster builds)
   - React Compiler support (opt-in)

#### Tailwind CSS v4 Breaking Changes

1. **Configuration Format**
   - No more `tailwind.config.js` - use CSS-first `@theme` directive
   - Import syntax: `@import "tailwindcss"` (single line, replaces 3 `@tailwind` directives)

2. **PostCSS Setup**
   - New package: `@tailwindcss/postcss` (not `tailwindcss` itself)
   - No more `autoprefixer` or `postcss-import` needed

3. **Automatic Content Detection**
   - No more `content` array configuration needed

#### Prisma 7 Breaking Changes

1. **New Generator**
   ```prisma
   generator client {
     provider = "prisma-client"  // Changed from "prisma-client-js"
     output   = "./generated/prisma"  // NOW REQUIRED
   }
   ```

2. **Import Path Changes**
   ```typescript
   // OLD
   import { PrismaClient } from '@prisma/client'

   // NEW
   import { PrismaClient } from './generated/prisma'
   ```

3. **Rust-Free Client**
   - Set `engineType = "client"` for smaller bundles in serverless

### Potential Solutions

#### Solution 1: Full Latest Stack (Recommended)

**Pros:**
- All latest features and performance improvements
- Best long-term maintainability
- Smallest bundle sizes (Prisma 90% smaller, Tailwind 20% smaller)
- Future-proof architecture

**Cons:**
- Some libraries are very new (potential undiscovered bugs)
- Less community resources/tutorials available
- May require more troubleshooting

**Stack:**
- Next.js 16.0.7
- Prisma 7.1.0
- Tailwind CSS 4.0.0
- Shadcn UI (latest CLI 3.0)
- Zod 4.1.13
- TanStack Query 5.90.12
- React Hook Form 7.68.0
- Motion 12.x
- Zustand 5.0.8

#### Solution 2: Conservative Latest Stack

**Pros:**
- More battle-tested versions
- More community resources available
- Fewer potential compatibility issues

**Cons:**
- Miss out on latest features
- Larger bundle sizes
- Will need migration later

**Stack:**
- Next.js 15.5.7 (latest patched 15.x)
- Prisma 6.x
- Tailwind CSS 3.4.x
- Zod 3.24.x (with Standard Schema)

#### Solution 3: Hybrid Approach

Use latest stable for core framework (Next.js 16) but conservative versions for less critical libraries.

### Recommendation

**Solution 1 (Full Latest Stack)** is recommended because:
1. Next.js 16.0.7 contains a critical security patch (CVE-2025-55182)
2. Prisma 7's bundle size reduction is significant for serverless
3. Tailwind v4's CSS-first approach is cleaner and faster
4. The libraries have been stable for several months now
5. Better to start fresh than migrate later

---

## 6) Clarifications Needed

1. **Package Manager Preference**
   - pnpm (recommended - handles React 19 peer deps gracefully)
   - npm (requires `--legacy-peer-deps` flag)
   - yarn
   - bun

2. **Source Directory Structure**
   - Use `src/` directory (recommended for larger projects)
   - Use root-level `app/` directory

3. **Prisma Connection Strategy**
   - Prisma Accelerate (managed, global pooling, caching - additional cost)
   - Self-managed PgBouncer
   - Prisma Postgres (managed database + pooling)
   - Direct connection (for development/simple apps)

4. **Shadcn UI Components to Install**
   - Install all components (`npx shadcn@latest add -a`)
   - Install only commonly used subset
   - Install on-demand as needed

5. **Zod Version**
   - Zod 4.x (latest, some breaking changes from v3)
   - Zod 3.24+ (more stable, Standard Schema support)

6. **Dark Mode Implementation**
   - System preference only (`prefers-color-scheme`)
   - Manual toggle with persistence (recommended)
   - Both system + manual override

7. **Motion Library Scope**
   - Full Motion library (more features, larger bundle)
   - Motion with LazyMotion (code-split, smaller initial bundle)

8. **Developer Guides Format**
   - Single comprehensive README.md
   - Separate guides per topic (forms, data-fetching, state, etc.)
   - Both README + topic-specific guides

---

## 7) Proposed File Structure

```
dunny/
├── .claude/                    # Existing Claude Code config
├── .env                        # Environment variables (gitignored)
├── .env.example               # Template for env vars
├── .gitignore
├── CLAUDE.md                  # AI assistant context file
├── README.md                  # Project documentation
├── components.json            # Shadcn UI configuration
├── next.config.ts             # Next.js configuration
├── package.json
├── pnpm-lock.yaml
├── postcss.config.mjs         # PostCSS with Tailwind v4
├── tsconfig.json
├── developer-guides/
│   ├── 01-project-structure.md
│   ├── 02-environment-variables.md
│   ├── 03-database-prisma.md
│   ├── 04-forms-validation.md
│   ├── 05-data-fetching.md
│   ├── 06-state-management.md
│   ├── 07-animations.md
│   └── 08-styling-theming.md
├── prisma/
│   └── schema.prisma
├── public/
│   └── ...
├── specs/                     # Existing specs directory
│   └── nextjs-boilerplate-setup/
│       └── 01-ideation.md     # This file
└── src/
    ├── app/
    │   ├── layout.tsx         # Root layout with providers
    │   ├── page.tsx           # Home page
    │   ├── globals.css        # Tailwind v4 + theme
    │   ├── providers.tsx      # Client providers (Query, Theme)
    │   └── api/
    │       └── ...            # API routes
    ├── components/
    │   ├── ui/                # Shadcn components
    │   └── ...                # Custom components
    ├── generated/
    │   └── prisma/            # Prisma client output
    ├── hooks/
    │   └── ...                # Custom hooks
    ├── lib/
    │   ├── prisma.ts          # Prisma singleton
    │   ├── utils.ts           # cn() utility from Shadcn
    │   └── ...
    ├── schemas/
    │   └── ...                # Zod schemas
    ├── stores/
    │   └── ...                # Zustand stores
    └── env.ts                 # T3 Env configuration
```

---

## 8) Implementation Phases

### Phase 1: Core Setup
1. Initialize Next.js 16 project with TypeScript
2. Configure Tailwind CSS v4 with PostCSS
3. Set up T3 Env for environment variables
4. Initialize Prisma with PostgreSQL schema

### Phase 2: UI Foundation
1. Initialize Shadcn UI
2. Install core components (Button, Card, Form, Input, etc.)
3. Configure dark mode with next-themes
4. Set up global styles and theme

### Phase 3: Data Layer
1. Configure TanStack Query provider
2. Set up Prisma singleton for serverless
3. Create example API routes

### Phase 4: Forms & Validation
1. Set up React Hook Form with Zod resolver
2. Create example form with Shadcn Form components
3. Add validation schemas

### Phase 5: State & Utilities
1. Configure Zustand for state management
2. Install usehooks-ts
3. Install lodash-es
4. Set up Motion for animations

### Phase 6: Documentation
1. Create CLAUDE.md with project context
2. Write developer guides
3. Update README.md

---

## 9) Dependencies to Install

```bash
# Core
pnpm add next@16.0.7 react@19.2 react-dom@19.2

# Database
pnpm add prisma@7.1.0 @prisma/client@7.1.0

# Styling
pnpm add tailwindcss@4.0.0 @tailwindcss/postcss postcss

# Environment
pnpm add @t3-oss/env-nextjs zod

# Data Fetching
pnpm add @tanstack/react-query

# Forms
pnpm add react-hook-form @hookform/resolvers

# State Management
pnpm add zustand

# Utilities
pnpm add lodash-es usehooks-ts

# Animation
pnpm add motion

# Theme
pnpm add next-themes

# Dev Dependencies
pnpm add -D typescript @types/node @types/react @types/react-dom @types/lodash-es
pnpm add -D @tanstack/react-query-devtools
```

---

## 10) Key Configuration Files

### next.config.ts
```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Enable cache components
  cacheComponents: true,
}

export default nextConfig
```

### postcss.config.mjs
```javascript
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  }
}
```

### src/app/globals.css
```css
@import "tailwindcss";

@theme {
  --color-background: oklch(100% 0 0);
  --color-foreground: oklch(10% 0 0);
  --color-primary: oklch(55% 0.2 250);
  --color-primary-foreground: oklch(98% 0 0);
  /* ... additional theme variables */
}

.dark {
  --color-background: oklch(10% 0 0);
  --color-foreground: oklch(98% 0 0);
}
```

### src/env.ts
```typescript
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    NODE_ENV: z.enum(["development", "test", "production"]),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url(),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
});
```

### prisma/schema.prisma
```prisma
generator client {
  provider   = "prisma-client"
  output     = "../src/generated/prisma"
  engineType = "client"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// Example model
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

---

## 11) Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Peer dependency conflicts | Medium | Low | Use pnpm, carefully manage versions |
| Next.js 16 undiscovered bugs | Low | Medium | Pin exact versions, monitor GitHub issues |
| Tailwind v4 plugin incompatibilities | Medium | Low | Use only official/updated plugins |
| Prisma connection exhaustion | Medium | High | Implement singleton pattern, use pooling |
| Bundle size regression | Low | Medium | Monitor with bundle analyzer |

---

## 12) Success Criteria

1. Application starts without errors (`pnpm dev`)
2. All environment variables validated at build time
3. Prisma client generates successfully
4. Shadcn components render correctly
5. Dark mode toggle works
6. Example form with validation works
7. TanStack Query devtools accessible in development
8. No TypeScript errors
9. Developer guides are clear and comprehensive
10. CLAUDE.md provides sufficient context for AI assistance
