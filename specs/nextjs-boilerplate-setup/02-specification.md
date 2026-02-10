# Next.js 16 Production Boilerplate Specification

**Status:** Draft
**Authors:** Claude Code
**Date:** 2025-12-08
**Slug:** nextjs-boilerplate-setup
**Ideation:** [01-ideation.md](./01-ideation.md)

---

## Overview

Set up a production-ready Next.js 16 boilerplate application with a modern, comprehensive technology stack targeting Vercel serverless deployment. This boilerplate will serve as the foundation for building scalable web applications with best-in-class developer experience, type safety, and performance.

The stack includes Next.js 16.0.7 (with critical security patches), Prisma 7, Tailwind CSS v4, Shadcn UI, TanStack Query, React Hook Form, Zod 4, Motion, Zustand, and comprehensive developer documentation.

---

## Background/Problem Statement

Modern web development requires a sophisticated stack of tools that work together seamlessly. Setting up a new project with all these tools correctly configured is time-consuming and error-prone. Additionally, the ecosystem has undergone significant changes in late 2024/early 2025:

1. **Next.js 16** introduced breaking changes (async request APIs, middleware → proxy rename)
2. **Tailwind CSS v4** moved to CSS-first configuration
3. **Prisma 7** changed the client generator and requires explicit output paths
4. **Zod 4** has breaking API changes from v3

This boilerplate addresses these challenges by providing a correctly configured, production-ready starting point with comprehensive documentation explaining the modern patterns and breaking changes.

---

## Goals

- Create a fully functional Next.js 16 application with TypeScript
- Configure Prisma 7 with Neon.tech PostgreSQL for serverless deployment
- Set up Tailwind CSS v4 with CSS-first theme configuration
- Install and configure all Shadcn UI components
- Implement type-safe environment variables with T3 Env + Zod 4
- Configure TanStack Query for server-state management
- Set up React Hook Form with Zod validation and Shadcn Form components
- Configure Zustand for complex client state management
- Install utility libraries (lodash-es, usehooks-ts, Motion)
- Implement dark mode with manual toggle and persistence
- Create comprehensive developer guides for each technology
- Write CLAUDE.md for AI assistant context

---

## Non-Goals

- Authentication implementation (Auth.js, Clerk, etc.)
- Specific business logic or domain features
- CI/CD pipeline configuration
- Docker containerization
- Testing setup (Jest, Playwright, Vitest)
- Internationalization (i18n)
- Email services
- Payment processing
- Analytics/monitoring
- SEO optimization beyond basic meta tags

---

## Technical Dependencies

### Core Framework
| Package | Version | Purpose |
|---------|---------|---------|
| `next` | 16.0.7 | React framework with App Router |
| `react` | 19.2 | UI library |
| `react-dom` | 19.2 | React DOM renderer |
| `typescript` | ^5.1.0 | Type safety |

### Database
| Package | Version | Purpose |
|---------|---------|---------|
| `prisma` | 7.1.0 | Database ORM CLI |
| `@prisma/client` | 7.1.0 | Generated database client |

### Styling & UI
| Package | Version | Purpose |
|---------|---------|---------|
| `tailwindcss` | 4.0.0 | Utility-first CSS |
| `@tailwindcss/postcss` | latest | PostCSS plugin for Tailwind v4 |
| `postcss` | latest | CSS processing |
| `next-themes` | latest | Dark mode management |

### Environment & Validation
| Package | Version | Purpose |
|---------|---------|---------|
| `@t3-oss/env-nextjs` | 0.13.8 | Type-safe env vars |
| `zod` | ^4.1.0 | Schema validation |
| `jiti` | latest | TypeScript config loading |

### Data Fetching
| Package | Version | Purpose |
|---------|---------|---------|
| `@tanstack/react-query` | ^5.90.0 | Server state management |
| `@tanstack/react-query-devtools` | ^5.90.0 | DevTools (dev only) |

### Forms
| Package | Version | Purpose |
|---------|---------|---------|
| `react-hook-form` | ^7.68.0 | Form state management |
| `@hookform/resolvers` | ^5.2.0 | Validation resolvers |

### State Management
| Package | Version | Purpose |
|---------|---------|---------|
| `zustand` | ^5.0.0 | Client state management |

### Utilities
| Package | Version | Purpose |
|---------|---------|---------|
| `lodash-es` | ^4.17.21 | Utility functions (ESM) |
| `usehooks-ts` | ^3.1.0 | React hooks collection |
| `motion` | ^12.0.0 | Animation library |

### Type Definitions (Dev)
| Package | Version | Purpose |
|---------|---------|---------|
| `@types/node` | latest | Node.js types |
| `@types/react` | latest | React types |
| `@types/react-dom` | latest | React DOM types |
| `@types/lodash-es` | latest | lodash-es types |

---

## Detailed Design

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Next.js 16 App                           │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    App Router (src/app/)                  │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │  │
│  │  │   layout    │  │    page     │  │  api/route  │       │  │
│  │  │  (providers)│  │ (server/    │  │  (handlers) │       │  │
│  │  │             │  │  client)    │  │             │       │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘       │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                   │
│  ┌───────────────────────────┴───────────────────────────────┐  │
│  │                     Providers Layer                        │  │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐       │  │
│  │  │ QueryClient  │ │ ThemeProvider│ │   Zustand    │       │  │
│  │  │  Provider    │ │ (next-themes)│ │   Stores     │       │  │
│  │  └──────────────┘ └──────────────┘ └──────────────┘       │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                   │
│  ┌───────────────────────────┴───────────────────────────────┐  │
│  │                    Data Layer                              │  │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐       │  │
│  │  │   Prisma     │ │  TanStack    │ │    Zod       │       │  │
│  │  │  (Singleton) │ │   Query      │ │   Schemas    │       │  │
│  │  └──────────────┘ └──────────────┘ └──────────────┘       │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                   │
│  ┌───────────────────────────┴───────────────────────────────┐  │
│  │                    UI Layer                                │  │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐       │  │
│  │  │  Shadcn UI   │ │  Tailwind v4 │ │   Motion     │       │  │
│  │  │  Components  │ │   + @theme   │ │  Animations  │       │  │
│  │  └──────────────┘ └──────────────┘ └──────────────┘       │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Neon.tech PostgreSQL                        │
│                   (with connection pooling)                     │
└─────────────────────────────────────────────────────────────────┘
```

### File Structure

```
dunny/
├── .claude/                          # Existing Claude Code config
├── .env                              # Environment variables (gitignored)
├── .env.example                      # Template for env vars
├── .gitignore                        # Git ignore rules
├── CLAUDE.md                         # AI assistant context
├── README.md                         # Project documentation
├── components.json                   # Shadcn UI configuration
├── next.config.ts                    # Next.js configuration
├── package.json                      # Dependencies
├── pnpm-lock.yaml                    # Lock file
├── postcss.config.mjs                # PostCSS with Tailwind v4
├── tsconfig.json                     # TypeScript configuration
│
├── developer-guides/                 # Developer documentation
│   ├── 01-project-structure.md
│   ├── 02-environment-variables.md
│   ├── 03-database-prisma.md
│   ├── 04-forms-validation.md
│   ├── 05-data-fetching.md
│   ├── 06-state-management.md
│   ├── 07-animations.md
│   └── 08-styling-theming.md
│
├── prisma/
│   └── schema.prisma                 # Database schema
│
├── public/                           # Static assets
│   └── ...
│
├── specs/                            # Specifications
│   └── nextjs-boilerplate-setup/
│       ├── 01-ideation.md
│       └── 02-specification.md
│
└── src/
    ├── app/
    │   ├── layout.tsx                # Root layout with providers
    │   ├── page.tsx                  # Home page
    │   ├── globals.css               # Tailwind v4 + theme
    │   ├── providers.tsx             # Client providers
    │   ├── api/
    │   │   └── users/
    │   │       └── route.ts          # Example API route
    │   └── example/
    │       └── page.tsx              # Example form page
    │
    ├── components/
    │   ├── ui/                       # Shadcn components
    │   ├── theme-toggle.tsx          # Dark mode toggle
    │   └── example-form.tsx          # Example form component
    │
    ├── generated/
    │   └── prisma/                   # Prisma client output
    │
    ├── hooks/
    │   └── use-example.ts            # Example custom hook
    │
    ├── lib/
    │   ├── prisma.ts                 # Prisma singleton
    │   ├── query-client.ts           # TanStack Query config
    │   └── utils.ts                  # cn() utility
    │
    ├── schemas/
    │   └── user.ts                   # Example Zod schemas
    │
    ├── stores/
    │   └── example-store.ts          # Example Zustand store
    │
    └── env.ts                        # T3 Env configuration
```

### Key Configuration Files

#### next.config.ts

```typescript
import type { NextConfig } from 'next'
import { fileURLToPath } from 'node:url'
import createJiti from 'jiti'

// Validate env vars at build time
const jiti = createJiti(fileURLToPath(import.meta.url))
jiti('./src/env')

const nextConfig: NextConfig = {
  // Enable cache components (Next.js 16 feature)
  cacheComponents: true,
}

export default nextConfig
```

#### postcss.config.mjs

```javascript
/** @type {import('postcss-load-config').Config} */
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
```

#### src/app/globals.css

```css
@import 'tailwindcss';

@theme {
  /* Colors - Using oklch for modern color support */
  --color-background: oklch(100% 0 0);
  --color-foreground: oklch(10% 0 0);

  --color-card: oklch(100% 0 0);
  --color-card-foreground: oklch(10% 0 0);

  --color-popover: oklch(100% 0 0);
  --color-popover-foreground: oklch(10% 0 0);

  --color-primary: oklch(15% 0 0);
  --color-primary-foreground: oklch(98% 0 0);

  --color-secondary: oklch(96% 0 0);
  --color-secondary-foreground: oklch(15% 0 0);

  --color-muted: oklch(96% 0 0);
  --color-muted-foreground: oklch(45% 0 0);

  --color-accent: oklch(96% 0 0);
  --color-accent-foreground: oklch(15% 0 0);

  --color-destructive: oklch(55% 0.2 25);
  --color-destructive-foreground: oklch(98% 0 0);

  --color-border: oklch(90% 0 0);
  --color-input: oklch(90% 0 0);
  --color-ring: oklch(15% 0 0);

  /* Radius */
  --radius: 0.625rem;

  /* Fonts */
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}

.dark {
  --color-background: oklch(10% 0 0);
  --color-foreground: oklch(98% 0 0);

  --color-card: oklch(10% 0 0);
  --color-card-foreground: oklch(98% 0 0);

  --color-popover: oklch(10% 0 0);
  --color-popover-foreground: oklch(98% 0 0);

  --color-primary: oklch(98% 0 0);
  --color-primary-foreground: oklch(15% 0 0);

  --color-secondary: oklch(20% 0 0);
  --color-secondary-foreground: oklch(98% 0 0);

  --color-muted: oklch(20% 0 0);
  --color-muted-foreground: oklch(65% 0 0);

  --color-accent: oklch(20% 0 0);
  --color-accent-foreground: oklch(98% 0 0);

  --color-destructive: oklch(55% 0.2 25);
  --color-destructive-foreground: oklch(98% 0 0);

  --color-border: oklch(20% 0 0);
  --color-input: oklch(20% 0 0);
  --color-ring: oklch(85% 0 0);
}

@layer base {
  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground;
  }
}
```

#### src/env.ts

```typescript
import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    DIRECT_URL: z.string().url().optional(),
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url(),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
  // Skip validation in edge cases
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
})
```

#### prisma/schema.prisma

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

// Example model - extend as needed
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([email])
}
```

#### src/lib/prisma.ts

```typescript
import { PrismaClient } from '@/generated/prisma'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
```

#### src/app/providers.tsx

```typescript
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ThemeProvider } from 'next-themes'
import { useState, type ReactNode } from 'react'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
```

#### src/app/layout.tsx

```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from './providers'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'Next.js Boilerplate',
  description: 'Production-ready Next.js 16 boilerplate',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

#### src/stores/example-store.ts

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ExampleState {
  count: number
  increment: () => void
  decrement: () => void
  reset: () => void
}

export const useExampleStore = create<ExampleState>()(
  persist(
    (set) => ({
      count: 0,
      increment: () => set((state) => ({ count: state.count + 1 })),
      decrement: () => set((state) => ({ count: state.count - 1 })),
      reset: () => set({ count: 0 }),
    }),
    {
      name: 'example-storage',
    }
  )
)
```

#### src/schemas/user.ts

```typescript
import { z } from 'zod'

export const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
})

export type UserFormData = z.infer<typeof userSchema>

export const createUserSchema = userSchema
export const updateUserSchema = userSchema.partial()
```

#### src/components/example-form.tsx

```typescript
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { userSchema, type UserFormData } from '@/schemas/user'

export function ExampleForm() {
  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      email: '',
    },
  })

  function onSubmit(data: UserFormData) {
    console.log('Form submitted:', data)
    // Handle form submission
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormDescription>Your display name.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="john@example.com" {...field} />
                </FormControl>
                <FormDescription>Your email address.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit">Submit</Button>
        </form>
      </Form>
    </motion.div>
  )
}
```

#### src/components/theme-toggle.tsx

```typescript
'use client'

import { useTheme } from 'next-themes'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Moon, Sun } from 'lucide-react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      </motion.div>
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
```

### Breaking Changes Documentation

The following breaking changes must be documented in the developer guides:

#### Next.js 16 Breaking Changes

1. **Middleware → Proxy Rename**
   - File: `middleware.ts` → `proxy.ts`
   - Export: `middleware` function → `proxy` function
   - Same functionality, improved naming

2. **Async Request APIs**
   ```typescript
   // Next.js 15 and earlier
   export default function Page({ params, searchParams }) {
     const { slug } = params
     const { query } = searchParams
   }

   // Next.js 16
   export default async function Page(props) {
     const params = await props.params
     const searchParams = await props.searchParams
     const { slug } = params
     const { query } = searchParams
   }
   ```

3. **Minimum Requirements**
   - Node.js 20.9.0+ required
   - TypeScript 5.1.0+ required
   - React 19.2 required

#### Tailwind CSS v4 Breaking Changes

1. **Configuration Format**
   - No `tailwind.config.js` needed
   - Use `@theme` directive in CSS
   - Import: `@import "tailwindcss"` (single line)

2. **PostCSS Plugin**
   - Package: `@tailwindcss/postcss` (not `tailwindcss`)
   - No `autoprefixer` needed
   - No `postcss-import` needed

#### Prisma 7 Breaking Changes

1. **Generator Change**
   ```prisma
   // Old
   generator client {
     provider = "prisma-client-js"
   }

   // New
   generator client {
     provider = "prisma-client"
     output   = "../src/generated/prisma"  // Required
   }
   ```

2. **Import Path Change**
   ```typescript
   // Old
   import { PrismaClient } from '@prisma/client'

   // New
   import { PrismaClient } from '@/generated/prisma'
   ```

---

## User Experience

### Developer Experience

1. **Quick Start**: Single command to install dependencies and start development
2. **Type Safety**: Full TypeScript coverage with inferred types from Zod schemas
3. **Hot Reload**: Turbopack provides near-instant refresh (2-5x faster than Webpack)
4. **DevTools**: TanStack Query DevTools for debugging data fetching
5. **Theme**: Dark mode toggle with system preference support
6. **Documentation**: Comprehensive guides for each technology

### End User Experience

1. **Performance**: Optimized bundle sizes with tree-shaking and modern tooling
2. **Accessibility**: Shadcn components built on Radix UI primitives
3. **Responsiveness**: Tailwind CSS utility classes for responsive design
4. **Animations**: Smooth micro-interactions with Motion library

---

## Testing Strategy

> **Note**: Testing setup is explicitly out of scope for this boilerplate. This section documents the recommended approach for when testing is added.

### Recommended Testing Stack

- **Unit Tests**: Vitest (faster than Jest, native ESM support)
- **Component Tests**: React Testing Library
- **E2E Tests**: Playwright
- **API Tests**: MSW (Mock Service Worker)

### Test Organization

```
__tests__/
├── unit/
│   ├── schemas/
│   └── stores/
├── integration/
│   ├── api/
│   └── components/
└── e2e/
    └── flows/
```

---

## Performance Considerations

### Bundle Size Optimization

1. **Prisma 7**: 90% smaller bundle with Rust-free client
2. **lodash-es**: Tree-shakable ES modules
3. **Motion LazyMotion**: Optional code-splitting (not used in this setup per user preference)
4. **Next.js 16**: Automatic code splitting per route

### Runtime Performance

1. **TanStack Query**: Automatic caching reduces redundant fetches
2. **Zustand**: Minimal re-renders with selector pattern
3. **React 19**: Concurrent features for smoother UX
4. **Turbopack**: Faster development builds

### Database Performance

1. **Neon.tech**: Built-in connection pooling
2. **Prisma Singleton**: Prevents connection exhaustion in serverless
3. **Indexed Fields**: Email field indexed in User model

---

## Security Considerations

### Environment Variables

- Server-only variables never exposed to client
- T3 Env validates at build time, failing fast on misconfiguration
- `.env` files gitignored, `.env.example` committed

### Database Security

- Parameterized queries via Prisma (SQL injection prevention)
- Connection string stored in environment variable
- Direct URL for migrations separate from pooled URL

### Next.js Security

- CVE-2025-55182 patched in version 16.0.7
- CSRF protection via Server Actions
- Automatic header sanitization

---

## Documentation

### Files to Create

1. **CLAUDE.md**: AI assistant context with:
   - Project overview and stack
   - Directory structure explanation
   - Common commands
   - Conventions and patterns
   - Breaking changes notes

2. **README.md**: Project documentation with:
   - Quick start guide
   - Available scripts
   - Environment setup
   - Deployment instructions

3. **Developer Guides** (8 files):
   - `01-project-structure.md`: Directory layout and conventions
   - `02-environment-variables.md`: T3 Env usage and patterns
   - `03-database-prisma.md`: Prisma 7 setup and queries
   - `04-forms-validation.md`: React Hook Form + Zod + Shadcn
   - `05-data-fetching.md`: TanStack Query patterns
   - `06-state-management.md`: Zustand usage guidelines
   - `07-animations.md`: Motion library examples
   - `08-styling-theming.md`: Tailwind v4 and theming

---

## Implementation Phases

### Phase 1: Core Setup
1. Initialize Next.js 16 project with TypeScript and pnpm
2. Configure Tailwind CSS v4 with PostCSS
3. Set up T3 Env for environment variables
4. Initialize Prisma with PostgreSQL schema
5. Create base file structure

**Deliverables:**
- `package.json` with all dependencies
- `next.config.ts` with build-time env validation
- `postcss.config.mjs` with Tailwind v4 plugin
- `tsconfig.json` with path aliases
- `prisma/schema.prisma` with example model
- `src/env.ts` with typed environment
- `src/lib/prisma.ts` singleton
- `.env.example` template
- `.gitignore` with proper exclusions

### Phase 2: UI Foundation
1. Initialize Shadcn UI CLI
2. Install ALL Shadcn components
3. Configure dark mode with next-themes
4. Set up global styles and theme variables
5. Create theme toggle component

**Deliverables:**
- `components.json` Shadcn configuration
- `src/components/ui/*` all Shadcn components
- `src/app/globals.css` with `@theme` config
- `src/components/theme-toggle.tsx`
- `src/app/providers.tsx` with ThemeProvider

### Phase 3: Data Layer
1. Configure TanStack Query provider
2. Create query client configuration
3. Set up example API routes
4. Add DevTools in development

**Deliverables:**
- `src/lib/query-client.ts` configuration
- `src/app/providers.tsx` updated with QueryClientProvider
- `src/app/api/users/route.ts` example API route
- DevTools integration in providers

### Phase 4: Forms & Validation
1. Set up React Hook Form with Zod resolver
2. Create Zod schemas directory
3. Build example form with Shadcn Form components
4. Add validation error handling

**Deliverables:**
- `src/schemas/user.ts` example schema
- `src/components/example-form.tsx`
- `src/app/example/page.tsx` form demo page

### Phase 5: State & Utilities
1. Configure Zustand store example
2. Install usehooks-ts
3. Install lodash-es with types
4. Set up Motion for animations
5. Create example animated components

**Deliverables:**
- `src/stores/example-store.ts`
- `src/hooks/use-example.ts` custom hook example
- Animation integration in example components

### Phase 6: Documentation
1. Create CLAUDE.md with full project context
2. Write all 8 developer guides
3. Update README.md with complete docs

**Deliverables:**
- `CLAUDE.md`
- `README.md`
- `developer-guides/01-project-structure.md`
- `developer-guides/02-environment-variables.md`
- `developer-guides/03-database-prisma.md`
- `developer-guides/04-forms-validation.md`
- `developer-guides/05-data-fetching.md`
- `developer-guides/06-state-management.md`
- `developer-guides/07-animations.md`
- `developer-guides/08-styling-theming.md`

---

## Open Questions

1. **Neon.tech Configuration Details**
   - Should we document the Neon.tech dashboard setup process?
   - Are there specific Neon.tech features (branching, etc.) to configure?

2. **Example Complexity**
   - Should the example form include a submission API endpoint?
   - Should we include a complete CRUD example for the User model?

3. **Shadcn Theme Customization**
   - Should we use the default Shadcn theme or customize colors?
   - Any specific brand colors to incorporate?

---

## References

### Official Documentation
- [Next.js 16 Documentation](https://nextjs.org/docs)
- [Prisma 7 Documentation](https://www.prisma.io/docs)
- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs)
- [Shadcn UI Documentation](https://ui.shadcn.com/docs)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [React Hook Form Documentation](https://react-hook-form.com/)
- [Zod Documentation](https://zod.dev/)
- [Zustand Documentation](https://zustand.docs.pmnd.rs/)
- [Motion Documentation](https://motion.dev/docs)
- [T3 Env Documentation](https://env.t3.gg/)

### Related Resources
- [Neon.tech Documentation](https://neon.tech/docs)
- [usehooks-ts Documentation](https://usehooks-ts.com/)
- [lodash Documentation](https://lodash.com/docs)

### Ideation Document
- [01-ideation.md](./01-ideation.md) - Research findings and decision rationale

---

## Changelog

| Date | Author | Change |
|------|--------|--------|
| 2025-12-08 | Claude Code | Initial specification created |
