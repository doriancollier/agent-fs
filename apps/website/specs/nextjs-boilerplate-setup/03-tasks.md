# Task Breakdown: Next.js 16 Production Boilerplate

**Generated:** 2025-12-08
**Source:** specs/nextjs-boilerplate-setup/02-specification.md
**Mode:** Full (first-time decomposition)
**Last Decompose:** 2025-12-08

---

## Overview

This task breakdown decomposes the Next.js 16 production boilerplate specification into 24 actionable tasks across 6 phases. The implementation creates a complete, production-ready starting point with modern tooling.

---

## Phase 1: Core Setup (6 tasks)

### Task 1.1: Initialize Next.js 16 Project with pnpm
**Description:** Create new Next.js 16 project with TypeScript and pnpm
**Size:** Medium
**Priority:** High
**Dependencies:** None
**Can run parallel with:** None (foundation task)

**Technical Requirements:**
- Use pnpm as package manager
- Next.js 16.0.7 with security patch
- React 19.2, TypeScript 5.1+
- App Router with src/ directory structure
- Turbopack enabled by default

**Implementation Steps:**
1. Run `pnpm create next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"`
2. Update package.json to pin exact versions:
   ```json
   {
     "dependencies": {
       "next": "16.0.7",
       "react": "19.2",
       "react-dom": "19.2"
     }
   }
   ```
3. Run `pnpm install` to update lock file
4. Verify with `pnpm dev` that Turbopack starts

**Acceptance Criteria:**
- [ ] Project initializes without errors
- [ ] `pnpm dev` starts with Turbopack
- [ ] TypeScript configured with strict mode
- [ ] src/ directory structure in place

---

### Task 1.2: Configure Tailwind CSS v4 with PostCSS
**Description:** Set up Tailwind CSS v4 with CSS-first configuration
**Size:** Medium
**Priority:** High
**Dependencies:** Task 1.1
**Can run parallel with:** None

**Technical Requirements:**
- Tailwind CSS 4.0.0
- @tailwindcss/postcss plugin (not tailwindcss itself)
- CSS-first @theme configuration
- No tailwind.config.js needed

**Implementation Steps:**
1. Install packages:
   ```bash
   pnpm add tailwindcss@4.0.0 @tailwindcss/postcss postcss
   ```

2. Create `postcss.config.mjs`:
   ```javascript
   /** @type {import('postcss-load-config').Config} */
   export default {
     plugins: {
       '@tailwindcss/postcss': {},
     },
   }
   ```

3. Delete `tailwind.config.ts` if created by Next.js

4. Update `src/app/globals.css`:
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

**Acceptance Criteria:**
- [ ] Tailwind v4 compiles without errors
- [ ] @theme directive applies correctly
- [ ] Dark mode class toggles work
- [ ] No tailwind.config.js file exists

---

### Task 1.3: Set up T3 Env for Environment Variables
**Description:** Configure type-safe environment variables with T3 Env and Zod 4
**Size:** Medium
**Priority:** High
**Dependencies:** Task 1.1
**Can run parallel with:** Task 1.2

**Technical Requirements:**
- @t3-oss/env-nextjs 0.13.8
- Zod 4.x for schema validation
- Build-time validation via jiti
- Server/client separation

**Implementation Steps:**
1. Install packages:
   ```bash
   pnpm add @t3-oss/env-nextjs zod jiti
   ```

2. Create `src/env.ts`:
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

3. Update `next.config.ts`:
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

4. Create `.env.example`:
   ```
   # Database (Neon.tech PostgreSQL)
   DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
   DIRECT_URL="postgresql://user:password@host/database?sslmode=require"

   # Application
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

5. Create `.env` with actual values (gitignored)

**Acceptance Criteria:**
- [ ] Build fails if required env vars missing
- [ ] Server vars not exposed to client
- [ ] Type inference works for env object
- [ ] .env.example committed to repo

---

### Task 1.4: Initialize Prisma with PostgreSQL Schema
**Description:** Set up Prisma 7 with Neon.tech PostgreSQL configuration
**Size:** Medium
**Priority:** High
**Dependencies:** Task 1.3
**Can run parallel with:** None

**Technical Requirements:**
- Prisma 7.1.0 with new prisma-client generator
- Output to src/generated/prisma/
- Rust-free client (engineType = "client")
- Support for Neon.tech connection pooling

**Implementation Steps:**
1. Install Prisma:
   ```bash
   pnpm add prisma@7.1.0
   pnpm add -D @prisma/client@7.1.0
   ```

2. Initialize Prisma:
   ```bash
   pnpm prisma init
   ```

3. Update `prisma/schema.prisma`:
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

4. Create `src/lib/prisma.ts`:
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

5. Generate Prisma client:
   ```bash
   pnpm prisma generate
   ```

6. Add postinstall script to package.json:
   ```json
   {
     "scripts": {
       "postinstall": "prisma generate"
     }
   }
   ```

**Acceptance Criteria:**
- [ ] Prisma client generates to src/generated/prisma
- [ ] Singleton pattern prevents connection exhaustion
- [ ] Import path uses @/generated/prisma
- [ ] postinstall script runs prisma generate

---

### Task 1.5: Create Base File Structure
**Description:** Set up the complete directory structure and base files
**Size:** Small
**Priority:** High
**Dependencies:** Task 1.1
**Can run parallel with:** Task 1.2, 1.3

**Technical Requirements:**
- Create all required directories
- Set up path aliases in tsconfig.json
- Configure .gitignore properly

**Implementation Steps:**
1. Create directories:
   ```bash
   mkdir -p src/components/ui
   mkdir -p src/hooks
   mkdir -p src/lib
   mkdir -p src/schemas
   mkdir -p src/stores
   mkdir -p src/generated
   mkdir -p developer-guides
   mkdir -p public
   ```

2. Update `tsconfig.json` paths:
   ```json
   {
     "compilerOptions": {
       "paths": {
         "@/*": ["./src/*"]
       }
     }
   }
   ```

3. Create `src/lib/utils.ts` (for Shadcn cn utility):
   ```typescript
   import { type ClassValue, clsx } from 'clsx'
   import { twMerge } from 'tailwind-merge'

   export function cn(...inputs: ClassValue[]) {
     return twMerge(clsx(inputs))
   }
   ```

4. Install clsx and tailwind-merge:
   ```bash
   pnpm add clsx tailwind-merge
   ```

5. Update `.gitignore`:
   ```
   # dependencies
   node_modules
   .pnpm-store

   # next.js
   .next/
   out/

   # environment
   .env
   .env*.local

   # prisma
   src/generated/

   # misc
   .DS_Store
   *.pem
   *.log

   # vercel
   .vercel

   # typescript
   *.tsbuildinfo
   next-env.d.ts
   ```

**Acceptance Criteria:**
- [ ] All directories created
- [ ] Path aliases resolve correctly
- [ ] .gitignore excludes sensitive files
- [ ] cn() utility available

---

### Task 1.6: Create Root Layout with Font Configuration
**Description:** Set up the root layout.tsx with Inter font and basic structure
**Size:** Small
**Priority:** High
**Dependencies:** Task 1.2
**Can run parallel with:** Task 1.4

**Technical Requirements:**
- Inter font from next/font/google
- CSS variable for font-sans
- suppressHydrationWarning on html tag (for themes)
- Providers wrapper ready

**Implementation Steps:**
1. Update `src/app/layout.tsx`:
   ```typescript
   import type { Metadata } from 'next'
   import { Inter } from 'next/font/google'
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
           {children}
         </body>
       </html>
     )
   }
   ```

2. Create basic `src/app/page.tsx`:
   ```typescript
   export default function Home() {
     return (
       <main className="flex min-h-screen flex-col items-center justify-center p-24">
         <h1 className="text-4xl font-bold">Next.js 16 Boilerplate</h1>
         <p className="mt-4 text-muted-foreground">
           Production-ready starting point
         </p>
       </main>
     )
   }
   ```

**Acceptance Criteria:**
- [ ] Inter font loads correctly
- [ ] Font CSS variable applied
- [ ] suppressHydrationWarning set
- [ ] Home page renders

---

## Phase 2: UI Foundation (5 tasks)

### Task 2.1: Initialize Shadcn UI CLI
**Description:** Set up Shadcn UI with proper configuration for Tailwind v4
**Size:** Small
**Priority:** High
**Dependencies:** Task 1.2, 1.5
**Can run parallel with:** None

**Technical Requirements:**
- Shadcn CLI 3.0
- New York style
- CSS variables mode
- Tailwind v4 compatibility

**Implementation Steps:**
1. Run Shadcn init:
   ```bash
   pnpm dlx shadcn@latest init
   ```

2. When prompted, select:
   - Style: New York
   - Base color: Zinc
   - CSS variables: Yes

3. Verify `components.json` created:
   ```json
   {
     "$schema": "https://ui.shadcn.com/schema.json",
     "style": "new-york",
     "rsc": true,
     "tsx": true,
     "tailwind": {
       "config": "",
       "css": "src/app/globals.css",
       "baseColor": "zinc",
       "cssVariables": true
     },
     "aliases": {
       "components": "@/components",
       "utils": "@/lib/utils",
       "ui": "@/components/ui",
       "lib": "@/lib",
       "hooks": "@/hooks"
     }
   }
   ```

**Acceptance Criteria:**
- [ ] components.json created with correct config
- [ ] Aliases match project structure
- [ ] CSS variables mode enabled

---

### Task 2.2: Install ALL Shadcn Components
**Description:** Install the complete Shadcn UI component library
**Size:** Large
**Priority:** High
**Dependencies:** Task 2.1
**Can run parallel with:** None

**Technical Requirements:**
- Install all 50+ components
- Verify no conflicts
- All components in src/components/ui/

**Implementation Steps:**
1. Install all components:
   ```bash
   pnpm dlx shadcn@latest add -a
   ```

2. This installs all components including:
   - Accordion, Alert, Alert Dialog, Aspect Ratio, Avatar
   - Badge, Breadcrumb, Button
   - Calendar, Card, Carousel, Checkbox, Collapsible, Command, Context Menu
   - Dialog, Drawer, Dropdown Menu
   - Form, Hover Card, Input, Input OTP
   - Label, Menubar, Navigation Menu
   - Pagination, Popover, Progress
   - Radio Group, Resizable
   - Scroll Area, Select, Separator, Sheet, Sidebar, Skeleton, Slider, Sonner, Switch
   - Table, Tabs, Textarea, Toast, Toggle, Toggle Group, Tooltip

3. Install required dependencies (if not already):
   ```bash
   pnpm add lucide-react @radix-ui/react-icons
   ```

**Acceptance Criteria:**
- [ ] All components installed in src/components/ui/
- [ ] No TypeScript errors in components
- [ ] Components import correctly

---

### Task 2.3: Configure Dark Mode with next-themes
**Description:** Set up dark mode with manual toggle and localStorage persistence
**Size:** Medium
**Priority:** High
**Dependencies:** Task 2.1
**Can run parallel with:** Task 2.2

**Technical Requirements:**
- next-themes for theme management
- Manual toggle (not just system preference)
- Persistence via localStorage
- No flash on page load

**Implementation Steps:**
1. Install next-themes:
   ```bash
   pnpm add next-themes
   ```

2. Create `src/app/providers.tsx`:
   ```typescript
   'use client'

   import { ThemeProvider } from 'next-themes'
   import { type ReactNode } from 'react'

   interface ProvidersProps {
     children: ReactNode
   }

   export function Providers({ children }: ProvidersProps) {
     return (
       <ThemeProvider
         attribute="class"
         defaultTheme="system"
         enableSystem
         disableTransitionOnChange
       >
         {children}
       </ThemeProvider>
     )
   }
   ```

3. Update `src/app/layout.tsx` to use Providers:
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

**Acceptance Criteria:**
- [ ] Theme persists across page reloads
- [ ] No flash of wrong theme on load
- [ ] System preference respected by default
- [ ] Manual toggle overrides system

---

### Task 2.4: Create Theme Toggle Component
**Description:** Build the theme toggle button with icons and animation
**Size:** Small
**Priority:** Medium
**Dependencies:** Task 2.2, 2.3
**Can run parallel with:** None

**Technical Requirements:**
- Use Shadcn Button component
- Sun/Moon icons from lucide-react
- Smooth icon transition
- Accessible with sr-only label

**Implementation Steps:**
1. Create `src/components/theme-toggle.tsx`:
   ```typescript
   'use client'

   import { useTheme } from 'next-themes'
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
         <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
         <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
         <span className="sr-only">Toggle theme</span>
       </Button>
     )
   }
   ```

2. Add ThemeToggle to home page for testing:
   ```typescript
   import { ThemeToggle } from '@/components/theme-toggle'

   export default function Home() {
     return (
       <main className="flex min-h-screen flex-col items-center justify-center p-24">
         <div className="absolute top-4 right-4">
           <ThemeToggle />
         </div>
         <h1 className="text-4xl font-bold">Next.js 16 Boilerplate</h1>
         <p className="mt-4 text-muted-foreground">
           Production-ready starting point
         </p>
       </main>
     )
   }
   ```

**Acceptance Criteria:**
- [ ] Theme toggles on click
- [ ] Icons animate smoothly
- [ ] Screen reader label present
- [ ] Works in both light and dark modes

---

### Task 2.5: Finalize Global Styles and Theme
**Description:** Complete the global CSS with all Shadcn theme variables
**Size:** Small
**Priority:** Medium
**Dependencies:** Task 2.2
**Can run parallel with:** Task 2.4

**Technical Requirements:**
- All Shadcn CSS variables defined
- Chart colors for data visualization
- Sidebar colors if using sidebar component
- Proper layer ordering

**Implementation Steps:**
1. Ensure `src/app/globals.css` has all required variables (already done in Task 1.2)

2. Add any additional variables needed by installed components

3. Test that all components render correctly in both themes

**Acceptance Criteria:**
- [ ] All Shadcn components styled correctly
- [ ] No missing CSS variables
- [ ] Consistent appearance in light/dark modes

---

## Phase 3: Data Layer (4 tasks)

### Task 3.1: Configure TanStack Query Provider
**Description:** Set up TanStack Query with proper SSR configuration
**Size:** Medium
**Priority:** High
**Dependencies:** Task 2.3
**Can run parallel with:** None

**Technical Requirements:**
- TanStack Query 5.90.12
- QueryClient created per-request (useState pattern)
- DevTools in development only
- Appropriate staleTime for SSR

**Implementation Steps:**
1. Install TanStack Query:
   ```bash
   pnpm add @tanstack/react-query
   pnpm add -D @tanstack/react-query-devtools
   ```

2. Update `src/app/providers.tsx`:
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

**Acceptance Criteria:**
- [ ] QueryClient created with useState pattern
- [ ] DevTools visible in development
- [ ] DevTools hidden in production
- [ ] Proper staleTime configured

---

### Task 3.2: Create Query Client Configuration
**Description:** Set up reusable query client configuration
**Size:** Small
**Priority:** Medium
**Dependencies:** Task 3.1
**Can run parallel with:** Task 3.3

**Technical Requirements:**
- Centralized query client config
- Type-safe query key factories
- Reusable query options

**Implementation Steps:**
1. Create `src/lib/query-client.ts`:
   ```typescript
   import { QueryClient } from '@tanstack/react-query'

   export function makeQueryClient() {
     return new QueryClient({
       defaultOptions: {
         queries: {
           staleTime: 60 * 1000,
           refetchOnWindowFocus: false,
         },
       },
     })
   }

   // Query key factories for type-safe keys
   export const queryKeys = {
     users: {
       all: ['users'] as const,
       list: () => [...queryKeys.users.all, 'list'] as const,
       detail: (id: string) => [...queryKeys.users.all, 'detail', id] as const,
     },
   } as const
   ```

**Acceptance Criteria:**
- [ ] Query client factory exported
- [ ] Query keys are type-safe
- [ ] Keys follow consistent pattern

---

### Task 3.3: Set up Example API Route
**Description:** Create an example API route demonstrating Prisma usage
**Size:** Medium
**Priority:** Medium
**Dependencies:** Task 1.4
**Can run parallel with:** Task 3.2

**Technical Requirements:**
- Next.js 16 async API patterns
- Prisma integration
- Proper error handling
- JSON response

**Implementation Steps:**
1. Create `src/app/api/users/route.ts`:
   ```typescript
   import { NextResponse } from 'next/server'
   import { prisma } from '@/lib/prisma'

   export async function GET() {
     try {
       const users = await prisma.user.findMany({
         orderBy: { createdAt: 'desc' },
         take: 10,
       })

       return NextResponse.json(users)
     } catch (error) {
       console.error('Failed to fetch users:', error)
       return NextResponse.json(
         { error: 'Failed to fetch users' },
         { status: 500 }
       )
     }
   }

   export async function POST(request: Request) {
     try {
       const body = await request.json()

       const user = await prisma.user.create({
         data: {
           email: body.email,
           name: body.name,
         },
       })

       return NextResponse.json(user, { status: 201 })
     } catch (error) {
       console.error('Failed to create user:', error)
       return NextResponse.json(
         { error: 'Failed to create user' },
         { status: 500 }
       )
     }
   }
   ```

**Acceptance Criteria:**
- [ ] GET returns users list
- [ ] POST creates new user
- [ ] Errors handled gracefully
- [ ] Prisma singleton used

---

### Task 3.4: Add TanStack Query DevTools Integration
**Description:** Ensure DevTools are properly integrated and accessible
**Size:** Small
**Priority:** Low
**Dependencies:** Task 3.1
**Can run parallel with:** Task 3.3

**Technical Requirements:**
- DevTools only in development
- Accessible via floating button
- Correct position (bottom-right)

**Implementation Steps:**
1. Verify DevTools in providers.tsx (already done in 3.1)

2. Test that DevTools:
   - Show in development mode
   - Hide in production mode
   - Display query cache correctly

**Acceptance Criteria:**
- [ ] DevTools accessible in development
- [ ] Hidden in production build
- [ ] Shows query cache state

---

## Phase 4: Forms & Validation (3 tasks)

### Task 4.1: Set up React Hook Form with Zod Resolver
**Description:** Configure React Hook Form with Zod 4 integration
**Size:** Medium
**Priority:** High
**Dependencies:** Task 1.3
**Can run parallel with:** None

**Technical Requirements:**
- React Hook Form 7.68.0
- @hookform/resolvers 5.2.2
- Zod 4.x integration
- Type inference from schemas

**Implementation Steps:**
1. Install packages:
   ```bash
   pnpm add react-hook-form @hookform/resolvers
   ```

2. Create `src/schemas/user.ts`:
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

**Acceptance Criteria:**
- [ ] Schemas defined with Zod 4
- [ ] Type inference works correctly
- [ ] Partial schemas for updates

---

### Task 4.2: Build Example Form with Shadcn Components
**Description:** Create a complete example form demonstrating integration
**Size:** Medium
**Priority:** High
**Dependencies:** Task 4.1, Task 2.2
**Can run parallel with:** None

**Technical Requirements:**
- React Hook Form integration
- Shadcn Form components
- Zod validation
- Error display

**Implementation Steps:**
1. Create `src/components/example-form.tsx`:
   ```typescript
   'use client'

   import { useForm } from 'react-hook-form'
   import { zodResolver } from '@hookform/resolvers/zod'
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
     )
   }
   ```

**Acceptance Criteria:**
- [ ] Form renders correctly
- [ ] Validation errors display
- [ ] Submit handler called with valid data
- [ ] TypeScript types inferred

---

### Task 4.3: Create Example Form Page
**Description:** Add a page to demonstrate the example form
**Size:** Small
**Priority:** Medium
**Dependencies:** Task 4.2
**Can run parallel with:** None

**Technical Requirements:**
- Page at /example route
- Card wrapper for form
- Clear layout

**Implementation Steps:**
1. Create `src/app/example/page.tsx`:
   ```typescript
   import { ExampleForm } from '@/components/example-form'
   import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

   export default function ExamplePage() {
     return (
       <main className="flex min-h-screen flex-col items-center justify-center p-24">
         <Card className="w-full max-w-md">
           <CardHeader>
             <CardTitle>Example Form</CardTitle>
             <CardDescription>
               Demonstrates React Hook Form + Zod + Shadcn integration
             </CardDescription>
           </CardHeader>
           <CardContent>
             <ExampleForm />
           </CardContent>
         </Card>
       </main>
     )
   }
   ```

**Acceptance Criteria:**
- [ ] Page accessible at /example
- [ ] Form renders in card
- [ ] Layout is centered and responsive

---

## Phase 5: State & Utilities (4 tasks)

### Task 5.1: Configure Zustand Store Example
**Description:** Set up an example Zustand store with persistence
**Size:** Medium
**Priority:** Medium
**Dependencies:** Task 1.1
**Can run parallel with:** Task 5.2, 5.3

**Technical Requirements:**
- Zustand 5.0.8
- Persist middleware
- TypeScript types
- 'use client' aware

**Implementation Steps:**
1. Install Zustand:
   ```bash
   pnpm add zustand
   ```

2. Create `src/stores/example-store.ts`:
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

**Acceptance Criteria:**
- [ ] Store created with persist middleware
- [ ] State persists across page reloads
- [ ] TypeScript types work correctly

---

### Task 5.2: Install usehooks-ts
**Description:** Add usehooks-ts for common React hooks
**Size:** Small
**Priority:** Medium
**Dependencies:** Task 1.1
**Can run parallel with:** Task 5.1, 5.3

**Technical Requirements:**
- usehooks-ts 3.1.1
- Tree-shakable imports

**Implementation Steps:**
1. Install package:
   ```bash
   pnpm add usehooks-ts
   ```

2. Create example hook usage `src/hooks/use-example.ts`:
   ```typescript
   'use client'

   import { useLocalStorage, useMediaQuery, useDebounceValue } from 'usehooks-ts'

   // Re-export commonly used hooks for convenience
   export { useLocalStorage, useMediaQuery, useDebounceValue }

   // Example custom hook combining usehooks-ts
   export function useIsMobile() {
     return useMediaQuery('(max-width: 768px)')
   }
   ```

**Acceptance Criteria:**
- [ ] usehooks-ts installed
- [ ] Example hooks work correctly
- [ ] Tree-shaking works

---

### Task 5.3: Install lodash-es with Types
**Description:** Add lodash-es for utility functions
**Size:** Small
**Priority:** Medium
**Dependencies:** Task 1.1
**Can run parallel with:** Task 5.1, 5.2

**Technical Requirements:**
- lodash-es 4.17.21 (ES modules)
- @types/lodash-es for TypeScript
- Tree-shakable imports

**Implementation Steps:**
1. Install packages:
   ```bash
   pnpm add lodash-es
   pnpm add -D @types/lodash-es
   ```

2. Example usage (no file needed, just verify imports work):
   ```typescript
   import { debounce, throttle, isEqual } from 'lodash-es'
   ```

**Acceptance Criteria:**
- [ ] lodash-es installed
- [ ] TypeScript types available
- [ ] Tree-shaking works

---

### Task 5.4: Set up Motion for Animations
**Description:** Configure Motion library for animations
**Size:** Medium
**Priority:** Medium
**Dependencies:** Task 2.4
**Can run parallel with:** None

**Technical Requirements:**
- Motion 12.x (full library)
- motion/react for components
- Example animated component

**Implementation Steps:**
1. Install Motion:
   ```bash
   pnpm add motion
   ```

2. Update `src/components/theme-toggle.tsx` with animation:
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

3. Update `src/components/example-form.tsx` with entrance animation:
   ```typescript
   // Add at the top
   import { motion } from 'motion/react'

   // Wrap the form return with motion.div
   return (
     <motion.div
       initial={{ opacity: 0, y: 20 }}
       animate={{ opacity: 1, y: 0 }}
       transition={{ duration: 0.3 }}
     >
       <Form {...form}>
         {/* ... rest of form */}
       </Form>
     </motion.div>
   )
   ```

**Acceptance Criteria:**
- [ ] Motion installed and working
- [ ] Theme toggle has animation
- [ ] Example form has entrance animation
- [ ] No hydration mismatches

---

## Phase 6: Documentation (6 tasks)

### Task 6.1: Create CLAUDE.md
**Description:** Write comprehensive AI assistant context file
**Size:** Large
**Priority:** High
**Dependencies:** All previous phases
**Can run parallel with:** None

**Technical Requirements:**
- Project overview
- Stack description
- Common commands
- Conventions
- Breaking changes notes

**Implementation Steps:**
Create `CLAUDE.md` with comprehensive project context covering:
- Project overview and purpose
- Full technology stack with versions
- Directory structure explanation
- Common pnpm commands
- Code conventions and patterns
- Breaking changes from Next.js 16, Tailwind v4, Prisma 7
- File naming conventions
- Import patterns

**Acceptance Criteria:**
- [ ] Covers all major technologies
- [ ] Explains breaking changes
- [ ] Lists common commands
- [ ] Documents conventions

---

### Task 6.2: Write Project Structure Guide
**Description:** Create developer guide for project structure
**Size:** Medium
**Priority:** High
**Dependencies:** All previous phases
**Can run parallel with:** Task 6.3, 6.4

Create `developer-guides/01-project-structure.md` covering directory layout, file conventions, and organization patterns.

---

### Task 6.3: Write Environment Variables Guide
**Description:** Create developer guide for T3 Env usage
**Size:** Medium
**Priority:** High
**Dependencies:** Task 1.3
**Can run parallel with:** Task 6.2, 6.4

Create `developer-guides/02-environment-variables.md` covering T3 Env patterns, adding new variables, and build-time validation.

---

### Task 6.4: Write Database & Prisma Guide
**Description:** Create developer guide for Prisma 7 usage
**Size:** Medium
**Priority:** High
**Dependencies:** Task 1.4
**Can run parallel with:** Task 6.2, 6.3

Create `developer-guides/03-database-prisma.md` covering Prisma 7 changes, schema patterns, and Neon.tech setup.

---

### Task 6.5: Write Remaining Developer Guides
**Description:** Create the remaining 5 developer guides
**Size:** Large
**Priority:** Medium
**Dependencies:** All previous phases
**Can run parallel with:** None

Create the following guides:
- `developer-guides/04-forms-validation.md`
- `developer-guides/05-data-fetching.md`
- `developer-guides/06-state-management.md`
- `developer-guides/07-animations.md`
- `developer-guides/08-styling-theming.md`

---

### Task 6.6: Update README.md
**Description:** Create comprehensive project README
**Size:** Medium
**Priority:** High
**Dependencies:** All previous phases
**Can run parallel with:** None

Create `README.md` with:
- Quick start guide
- Prerequisites (Node 20.9+, pnpm)
- Installation steps
- Available scripts
- Environment setup
- Deployment instructions
- Links to developer guides

**Acceptance Criteria:**
- [ ] Clear quick start section
- [ ] All scripts documented
- [ ] Environment setup explained
- [ ] Links to guides work

---

## Task Summary

| Phase | Tasks | Priority | Description |
|-------|-------|----------|-------------|
| 1 | 6 | High | Core project setup |
| 2 | 5 | High | UI foundation with Shadcn |
| 3 | 4 | High | Data layer configuration |
| 4 | 3 | High | Forms and validation |
| 5 | 4 | Medium | State and utilities |
| 6 | 6 | High | Documentation |

**Total Tasks:** 28

### Parallel Execution Opportunities

- **Phase 1:** Tasks 1.2, 1.3, 1.5 can run in parallel after 1.1
- **Phase 2:** Tasks 2.3, 2.4, 2.5 can partially overlap
- **Phase 3:** Tasks 3.2, 3.3 can run in parallel
- **Phase 5:** Tasks 5.1, 5.2, 5.3 can all run in parallel
- **Phase 6:** Tasks 6.2, 6.3, 6.4 can run in parallel

### Critical Path

1.1 → 1.2 → 2.1 → 2.2 → 4.2 → 5.4 → 6.1

### Execution Recommendations

1. Complete Phase 1 first (foundation)
2. Phase 2 enables forms and state work
3. Phases 3, 4, 5 can partially overlap
4. Phase 6 should be last (needs working code to document)
