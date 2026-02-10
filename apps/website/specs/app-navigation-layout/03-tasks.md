# Task Breakdown: App Navigation and Layout Structure

Generated: 2025-12-09
Source: specs/app-navigation-layout/02-specification.md

## Overview

This task breakdown implements a sidebar-based navigation shell for the Dunny application using the existing Shadcn sidebar component. The implementation distributes content across three MVP pages (Dashboard, Transactions, Accounts) while establishing a new widgets layer in the FSD architecture.

## Implementation Summary

| Metric | Value |
|--------|-------|
| Total Tasks | 17 |
| Phases | 5 |
| Estimated Parallel Opportunities | 6 |
| Critical Path | Phase 1 → Phase 3 → Phase 4 |

## Dependency Graph

```
Phase 1: Core Navigation Widget
  [1.1] Create directory structure ─┐
  [1.2] Implement nav-items.ts ────┼─→ [1.4] Implement NavMain.tsx
  [1.3] Implement AppSidebar.tsx ──┘         │
  [1.5] Implement MobileHeader.tsx ──────────┤
  [1.6] Create widget exports ───────────────┘

Phase 2: Widget Migration (parallel with Phase 1)
  [2.1] Create accounts-section widget ─┬─→ [2.3] Delete original files
  [2.2] Create transactions-section ────┘

Phase 3: Layout Integration (depends on Phase 1)
  [3.1] Modify root layout ─────→ [3.2] Test layout integration

Phase 4: Page Creation (depends on Phase 2 & 3)
  [4.1] Create transactions page ─┬─→ [4.3] Verify all imports
  [4.2] Create accounts page ─────┤
  [4.4] Modify dashboard page ────┘

Phase 5: Testing & Polish (depends on Phase 4)
  [5.1] Write unit tests ─────────┬─→ [5.4] Manual responsive testing
  [5.2] Write integration tests ──┤
  [5.3] Write E2E tests ──────────┘
```

---

## Phase 1: Core Navigation Widget

### Task 1.1: Create app-sidebar directory structure
**Description**: Set up the FSD widgets layer directory structure for the app-sidebar widget
**Size**: Small
**Priority**: High
**Dependencies**: None
**Can run parallel with**: Task 2.1, Task 2.2

**Technical Requirements**:
- Create new `widgets` layer under `src/layers/`
- Follow FSD naming conventions
- Include ui/, lib/ subdirectories

**Implementation Steps**:
1. Create directory: `src/layers/widgets/app-sidebar/ui/`
2. Create directory: `src/layers/widgets/app-sidebar/lib/`
3. Create placeholder index.ts for exports

**Files to create**:
```
src/layers/widgets/app-sidebar/
├── ui/
│   └── .gitkeep (temporary)
├── lib/
│   └── .gitkeep (temporary)
└── index.ts
```

**Acceptance Criteria**:
- [ ] Directory structure exists at `src/layers/widgets/app-sidebar/`
- [ ] Contains ui/ and lib/ subdirectories
- [ ] index.ts file created with placeholder exports
- [ ] No TypeScript errors

---

### Task 1.2: Implement nav-items.ts configuration
**Description**: Create the navigation items configuration with icons and routes
**Size**: Small
**Priority**: High
**Dependencies**: Task 1.1
**Can run parallel with**: Task 1.3, Task 1.5

**Technical Requirements**:
- Static configuration array with label, href, and icon
- Use lucide-react icons: LayoutDashboard, Receipt, Building2
- Type-safe with `as const` assertion

**Implementation**:
```typescript
// src/layers/widgets/app-sidebar/lib/nav-items.ts
import { LayoutDashboard, Receipt, Building2 } from 'lucide-react'

export const navItems = [
  {
    label: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    label: 'Transactions',
    href: '/transactions',
    icon: Receipt,
  },
  {
    label: 'Accounts',
    href: '/accounts',
    icon: Building2,
  },
] as const
```

**Acceptance Criteria**:
- [ ] File exists at `src/layers/widgets/app-sidebar/lib/nav-items.ts`
- [ ] Exports `navItems` constant array with 3 items
- [ ] Each item has label, href, and icon properties
- [ ] Icons imported from lucide-react
- [ ] No TypeScript errors

---

### Task 1.3: Implement AppSidebar.tsx component
**Description**: Create the main sidebar shell component with header, content, footer, and rail
**Size**: Medium
**Priority**: High
**Dependencies**: Task 1.1
**Can run parallel with**: Task 1.2, Task 1.5

**Technical Requirements**:
- Use 'use client' directive
- Import Shadcn sidebar primitives from @/components/ui/sidebar
- Configure collapsible="icon" mode
- Header shows "Dunny" (full) / "D" (collapsed)
- Include SidebarRail for collapse control

**Implementation**:
```tsx
// src/layers/widgets/app-sidebar/ui/AppSidebar.tsx
'use client'

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarRail,
} from '@/components/ui/sidebar'
import { NavMain } from './NavMain'

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        {/* App name - collapses to icon */}
        <div className="flex h-14 items-center gap-2 px-4">
          <span className="font-semibold text-lg group-data-[collapsible=icon]:hidden">
            Dunny
          </span>
          <span className="font-semibold text-lg hidden group-data-[collapsible=icon]:block">
            D
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain />
      </SidebarContent>
      <SidebarFooter>
        {/* Reserved for future: user menu, settings */}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
```

**Key Implementation Notes**:
- `collapsible="icon"` enables collapse to 48px icon-only mode
- `group-data-[collapsible=icon]:` classes control visibility in collapsed state
- SidebarRail provides the draggable edge for collapse
- NavMain component handles the actual navigation items

**Acceptance Criteria**:
- [ ] Component renders without errors
- [ ] Shows "Dunny" text when expanded
- [ ] Shows "D" when collapsed (icon mode)
- [ ] Has border-b on header
- [ ] Includes SidebarRail for collapse control
- [ ] No TypeScript errors

---

### Task 1.4: Implement NavMain.tsx component
**Description**: Create the navigation menu component with active state and mobile auto-close
**Size**: Medium
**Priority**: High
**Dependencies**: Task 1.2, Task 1.3
**Can run parallel with**: None

**Technical Requirements**:
- Use 'use client' directive
- Use usePathname() for active state detection
- Use useSidebar() to access setOpenMobile
- useEffect to auto-close mobile drawer on navigation
- Map over navItems configuration
- Pass isActive and tooltip props to SidebarMenuButton

**Implementation**:
```tsx
// src/layers/widgets/app-sidebar/ui/NavMain.tsx
'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from '@/components/ui/sidebar'
import { navItems } from '../lib/nav-items'

export function NavMain() {
  const pathname = usePathname()
  const { setOpenMobile } = useSidebar()

  // Auto-close mobile drawer on navigation
  useEffect(() => {
    setOpenMobile(false)
  }, [pathname, setOpenMobile])

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={item.label}
              >
                <Link href={item.href}>
                  <item.icon className="size-4" />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
```

**Key Implementation Notes**:
- `isActive={pathname === item.href}` applies active styling via Shadcn
- `tooltip={item.label}` shows tooltip when sidebar is collapsed
- `asChild` passes all props to Link child component
- `size-4` is Tailwind shorthand for width and height of 1rem
- useEffect with pathname dependency closes mobile drawer on each navigation

**Acceptance Criteria**:
- [ ] Renders all 3 navigation items
- [ ] Dashboard shows active when pathname is "/"
- [ ] Transactions shows active when pathname is "/transactions"
- [ ] Accounts shows active when pathname is "/accounts"
- [ ] Icons render at correct size (size-4)
- [ ] Tooltips appear when sidebar is collapsed
- [ ] Mobile drawer auto-closes on navigation
- [ ] No TypeScript errors

---

### Task 1.5: Implement MobileHeader.tsx component
**Description**: Create the mobile-only header with sidebar trigger
**Size**: Small
**Priority**: High
**Dependencies**: Task 1.1
**Can run parallel with**: Task 1.2, Task 1.3

**Technical Requirements**:
- Use 'use client' directive
- Only visible on mobile (md:hidden)
- Include SidebarTrigger for hamburger menu
- Show app name after separator

**Implementation**:
```tsx
// src/layers/widgets/app-sidebar/ui/MobileHeader.tsx
'use client'

import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'

export function MobileHeader() {
  return (
    <header className="flex h-14 items-center gap-2 border-b px-4 md:hidden">
      <SidebarTrigger className="-ml-2" />
      <Separator orientation="vertical" className="h-6" />
      <span className="font-semibold">Dunny</span>
    </header>
  )
}
```

**Key Implementation Notes**:
- `md:hidden` hides on screens >= 768px
- `h-14` matches sidebar header height (56px)
- `-ml-2` provides visual alignment for trigger button
- Separator provides visual division between trigger and title

**Acceptance Criteria**:
- [ ] Component only visible below 768px viewport
- [ ] Hidden on desktop (md:hidden)
- [ ] Shows hamburger trigger icon
- [ ] Shows "Dunny" text after separator
- [ ] Height matches sidebar header (h-14)
- [ ] No TypeScript errors

---

### Task 1.6: Create widget index.ts exports
**Description**: Create public API exports for the app-sidebar widget
**Size**: Small
**Priority**: High
**Dependencies**: Task 1.3, Task 1.4, Task 1.5
**Can run parallel with**: None

**Technical Requirements**:
- Export AppSidebar and MobileHeader components
- NavMain is internal (not exported)
- nav-items is internal (not exported)

**Implementation**:
```typescript
// src/layers/widgets/app-sidebar/index.ts
export { AppSidebar } from './ui/AppSidebar'
export { MobileHeader } from './ui/MobileHeader'
```

**Acceptance Criteria**:
- [ ] File exists at `src/layers/widgets/app-sidebar/index.ts`
- [ ] Exports AppSidebar component
- [ ] Exports MobileHeader component
- [ ] Does NOT export NavMain (internal)
- [ ] Does NOT export navItems (internal)
- [ ] No TypeScript errors

---

## Phase 2: Widget Migration

### Task 2.1: Create accounts-section widget
**Description**: Move accounts-list.tsx to widgets layer with FSD structure
**Size**: Medium
**Priority**: Medium
**Dependencies**: None
**Can run parallel with**: Task 1.1, Task 1.2, Task 1.3, Task 2.2

**Technical Requirements**:
- Create new widget directory structure
- Move and rename component
- Update all internal imports
- Create index.ts exports

**Implementation Steps**:
1. Create directory: `src/layers/widgets/accounts-section/ui/`
2. Copy `src/app/accounts-list.tsx` to `src/layers/widgets/accounts-section/ui/AccountsSection.tsx`
3. Rename component from `AccountsList` to `AccountsSection`
4. Update any internal import paths if needed
5. Create index.ts with exports

**Files to create**:
```
src/layers/widgets/accounts-section/
├── ui/
│   └── AccountsSection.tsx
└── index.ts
```

**index.ts content**:
```typescript
// src/layers/widgets/accounts-section/index.ts
export { AccountsSection } from './ui/AccountsSection'
```

**Component changes**:
- Rename export from `AccountsList` to `AccountsSection`
- Function name: `export function AccountsSection()`
- Keep all existing functionality intact

**Acceptance Criteria**:
- [ ] Widget directory structure created
- [ ] AccountsSection.tsx exists and compiles
- [ ] Component renamed from AccountsList to AccountsSection
- [ ] index.ts exports AccountsSection
- [ ] All existing functionality preserved
- [ ] No TypeScript errors

---

### Task 2.2: Create transactions-section widget
**Description**: Move transactions-list.tsx to widgets layer with FSD structure
**Size**: Medium
**Priority**: Medium
**Dependencies**: None
**Can run parallel with**: Task 1.1, Task 1.2, Task 1.3, Task 2.1

**Technical Requirements**:
- Create new widget directory structure
- Move and rename component
- Update all internal imports
- Create index.ts exports

**Implementation Steps**:
1. Create directory: `src/layers/widgets/transactions-section/ui/`
2. Copy `src/app/transactions-list.tsx` to `src/layers/widgets/transactions-section/ui/TransactionsSection.tsx`
3. Rename component from `TransactionsList` to `TransactionsSection`
4. Update any internal import paths if needed
5. Create index.ts with exports

**Files to create**:
```
src/layers/widgets/transactions-section/
├── ui/
│   └── TransactionsSection.tsx
└── index.ts
```

**index.ts content**:
```typescript
// src/layers/widgets/transactions-section/index.ts
export { TransactionsSection } from './ui/TransactionsSection'
```

**Component changes**:
- Rename export from `TransactionsList` to `TransactionsSection`
- Function name: `export function TransactionsSection()`
- Keep all existing functionality intact

**Acceptance Criteria**:
- [ ] Widget directory structure created
- [ ] TransactionsSection.tsx exists and compiles
- [ ] Component renamed from TransactionsList to TransactionsSection
- [ ] index.ts exports TransactionsSection
- [ ] All existing functionality preserved
- [ ] No TypeScript errors

---

### Task 2.3: Delete original app-level list files
**Description**: Remove the original accounts-list.tsx and transactions-list.tsx from app/
**Size**: Small
**Priority**: Medium
**Dependencies**: Task 2.1, Task 2.2, Task 4.3
**Can run parallel with**: None

**Technical Requirements**:
- Only delete after widgets are created and pages updated
- Verify no remaining imports reference old paths

**Implementation Steps**:
1. Verify `src/app/accounts-list.tsx` is no longer imported anywhere
2. Verify `src/app/transactions-list.tsx` is no longer imported anywhere
3. Delete `src/app/accounts-list.tsx`
4. Delete `src/app/transactions-list.tsx`

**Verification commands**:
```bash
# Check for remaining imports before deleting
grep -r "from.*app/accounts-list" src/
grep -r "from.*app/transactions-list" src/
```

**Acceptance Criteria**:
- [ ] No imports reference `app/accounts-list`
- [ ] No imports reference `app/transactions-list`
- [ ] `src/app/accounts-list.tsx` deleted
- [ ] `src/app/transactions-list.tsx` deleted
- [ ] Build completes without errors

---

## Phase 3: Layout Integration

### Task 3.1: Modify root layout with SidebarProvider
**Description**: Update the root layout to wrap the app with sidebar infrastructure
**Size**: Large
**Priority**: High
**Dependencies**: Task 1.6
**Can run parallel with**: None

**Technical Requirements**:
- Import SidebarProvider and SidebarInset from Shadcn
- Import AppSidebar and MobileHeader from widgets
- Read cookie for default sidebar state
- Wrap children with proper structure

**Implementation**:
```tsx
// src/app/layout.tsx
import type { Metadata, Viewport } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Providers } from './providers'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar, MobileHeader } from '@/layers/widgets/app-sidebar'
import { cookies } from 'next/headers'
import './globals.css'

export const metadata: Metadata = {
  title: 'Dunny - Personal Finance Manager',
  description: 'A sleek, modern personal finance management app',
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafafa' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
  width: 'device-width',
  initialScale: 1,
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get('sidebar_state')?.value === 'true'

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}
      >
        <Providers>
          <SidebarProvider defaultOpen={defaultOpen}>
            <AppSidebar />
            <SidebarInset>
              <MobileHeader />
              <main className="flex-1">{children}</main>
            </SidebarInset>
          </SidebarProvider>
        </Providers>
      </body>
    </html>
  )
}
```

**Key Implementation Notes**:
- `cookies()` is async in Next.js 16 - must await
- `defaultOpen` prevents hydration mismatch by reading server-side
- `SidebarInset` is the main content area that adjusts for sidebar width
- `flex-1` on main allows it to fill available space
- AppSidebar renders the actual sidebar UI
- MobileHeader provides mobile navigation trigger

**Acceptance Criteria**:
- [ ] Layout compiles without errors
- [ ] SidebarProvider wraps the app
- [ ] AppSidebar renders in the sidebar position
- [ ] MobileHeader appears inside SidebarInset
- [ ] Children render in main element
- [ ] Cookie reading for default state works
- [ ] No hydration mismatch errors
- [ ] Build completes successfully

---

### Task 3.2: Verify layout integration
**Description**: Test that the layout correctly renders with sidebar on all pages
**Size**: Small
**Priority**: High
**Dependencies**: Task 3.1
**Can run parallel with**: None

**Verification Steps**:
1. Run dev server: `pnpm dev`
2. Navigate to `/` - verify sidebar appears
3. Toggle sidebar collapse - verify it works
4. Resize to mobile - verify drawer behavior
5. Check console for hydration warnings
6. Test keyboard shortcut (Cmd+B / Ctrl+B)

**Acceptance Criteria**:
- [ ] Sidebar visible on desktop at /
- [ ] Sidebar collapses to icon mode
- [ ] Mobile drawer opens/closes
- [ ] No console errors or warnings
- [ ] Keyboard shortcut works
- [ ] State persists on page refresh (cookie)

---

## Phase 4: Page Creation

### Task 4.1: Create transactions page
**Description**: Create the dedicated transactions page using TransactionsSection widget
**Size**: Small
**Priority**: High
**Dependencies**: Task 2.2, Task 3.1
**Can run parallel with**: Task 4.2

**Technical Requirements**:
- Server component (no 'use client')
- Import TransactionsSection from widgets
- Use container-default for consistent width
- Include page header with title and description

**Implementation**:
```tsx
// src/app/transactions/page.tsx
import { TransactionsSection } from '@/layers/widgets/transactions-section'

export default function TransactionsPage() {
  return (
    <div className="container-default py-8 space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Transactions</h1>
        <p className="text-muted-foreground">
          View and manage your transaction history
        </p>
      </div>

      <TransactionsSection />
    </div>
  )
}
```

**Key Implementation Notes**:
- `container-default` is a custom utility (56rem max-width)
- `py-8` provides vertical padding
- `space-y-8` creates consistent vertical rhythm
- `tracking-tight` for heading typography

**Acceptance Criteria**:
- [ ] Page exists at `/transactions`
- [ ] Shows "Transactions" heading
- [ ] Shows description text
- [ ] TransactionsSection widget renders
- [ ] Navigation active state correct
- [ ] No TypeScript errors

---

### Task 4.2: Create accounts page
**Description**: Create the dedicated accounts page using AccountsSection widget
**Size**: Small
**Priority**: High
**Dependencies**: Task 2.1, Task 3.1
**Can run parallel with**: Task 4.1

**Technical Requirements**:
- Server component (no 'use client')
- Import AccountsSection from widgets
- Import PlaidLinkButton and SyncButton for actions
- Use container-default for consistent width
- Include page header with title, description, and action buttons

**Implementation**:
```tsx
// src/app/accounts/page.tsx
import { PlaidLinkButton } from '@/layers/features/plaid-link/ui/PlaidLinkButton'
import { SyncButton } from '@/layers/features/plaid-sync/ui/SyncButton'
import { AccountsSection } from '@/layers/widgets/accounts-section'

export default function AccountsPage() {
  return (
    <div className="container-default py-8 space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Accounts</h1>
          <p className="text-muted-foreground">
            Manage your connected bank accounts
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <PlaidLinkButton />
          <SyncButton />
        </div>
      </div>

      <AccountsSection />
    </div>
  )
}
```

**Key Implementation Notes**:
- Header layout uses flexbox with justify-between
- `flex-wrap gap-4` handles responsive wrapping
- Action buttons positioned top-right on desktop
- Buttons wrap below title on narrow screens

**Acceptance Criteria**:
- [ ] Page exists at `/accounts`
- [ ] Shows "Accounts" heading
- [ ] Shows description text
- [ ] PlaidLinkButton renders
- [ ] SyncButton renders
- [ ] AccountsSection widget renders
- [ ] Navigation active state correct
- [ ] Responsive layout works
- [ ] No TypeScript errors

---

### Task 4.3: Verify all imports resolve correctly
**Description**: Ensure all imports across new pages and widgets resolve without errors
**Size**: Small
**Priority**: High
**Dependencies**: Task 4.1, Task 4.2
**Can run parallel with**: None

**Verification Steps**:
1. Run TypeScript check: `pnpm tsc --noEmit`
2. Run build: `pnpm build`
3. Check for any import errors
4. Verify dev server starts without errors

**Acceptance Criteria**:
- [ ] `pnpm tsc --noEmit` passes
- [ ] `pnpm build` completes successfully
- [ ] No import resolution errors
- [ ] Dev server starts without errors

---

### Task 4.4: Modify dashboard page
**Description**: Update the home page to be Dashboard-focused with summary and quick actions
**Size**: Medium
**Priority**: High
**Dependencies**: Task 3.1
**Can run parallel with**: Task 4.1, Task 4.2

**Technical Requirements**:
- Remove AccountsList and TransactionsList imports
- Keep ThemeToggle, PlaidLinkButton, SyncButton, AlertBanner, MonthlySummaryCard
- Create focused dashboard layout with sections

**Implementation**:
```tsx
// src/app/page.tsx
import { ThemeToggle } from '@/components/theme-toggle'
import { PlaidLinkButton } from '@/layers/features/plaid-link/ui/PlaidLinkButton'
import { SyncButton } from '@/layers/features/plaid-sync/ui/SyncButton'
import { AlertBanner } from '@/layers/features/alerts/ui/AlertBanner'
import { MonthlySummaryCard } from '@/layers/features/monthly-summary'

export default function DashboardPage() {
  return (
    <div className="container-default py-8 space-y-8">
      <AlertBanner />

      {/* Page header with theme toggle */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your financial activity
          </p>
        </div>
        <ThemeToggle />
      </div>

      {/* Monthly Summary - Primary focus */}
      <section>
        <MonthlySummaryCard />
      </section>

      {/* Quick actions */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <PlaidLinkButton />
          <SyncButton />
        </div>
      </section>
    </div>
  )
}
```

**Key Implementation Notes**:
- AlertBanner at top for visibility
- ThemeToggle in header row for accessibility
- MonthlySummaryCard as primary content
- Quick Actions section for common operations
- Removed AccountsList and TransactionsList (now on dedicated pages)

**Acceptance Criteria**:
- [ ] Page renders at /
- [ ] AlertBanner displays when alerts exist
- [ ] Dashboard heading and description visible
- [ ] ThemeToggle in header row
- [ ] MonthlySummaryCard renders
- [ ] Quick Actions section with PlaidLinkButton and SyncButton
- [ ] No TypeScript errors
- [ ] AccountsList and TransactionsList NOT present

---

## Phase 5: Testing & Polish

### Task 5.1: Write unit tests for navigation components
**Description**: Create unit tests for NavMain and AppSidebar components
**Size**: Medium
**Priority**: Medium
**Dependencies**: Task 1.6
**Can run parallel with**: Task 5.2, Task 5.3

**Technical Requirements**:
- Use Vitest and React Testing Library
- Mock usePathname for active state tests
- Mock useSidebar for mobile close tests
- Test all three navigation items render

**Test file: NavMain.test.tsx**
```typescript
// __tests__/layers/widgets/app-sidebar/ui/NavMain.test.tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NavMain } from '@/layers/widgets/app-sidebar/ui/NavMain'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}))

// Mock useSidebar
vi.mock('@/components/ui/sidebar', async () => {
  const actual = await vi.importActual('@/components/ui/sidebar')
  return {
    ...actual,
    useSidebar: vi.fn(() => ({
      setOpenMobile: vi.fn(),
    })),
  }
})

import { usePathname } from 'next/navigation'

describe('NavMain', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all navigation items', () => {
    vi.mocked(usePathname).mockReturnValue('/')

    render(<NavMain />)

    expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /transactions/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /accounts/i })).toBeInTheDocument()
  })

  it('marks Dashboard as active when pathname is "/"', () => {
    vi.mocked(usePathname).mockReturnValue('/')

    render(<NavMain />)

    const dashboardLink = screen.getByRole('link', { name: /dashboard/i })
    expect(dashboardLink.closest('[data-active="true"]')).toBeInTheDocument()
  })

  it('marks Transactions as active when pathname is "/transactions"', () => {
    vi.mocked(usePathname).mockReturnValue('/transactions')

    render(<NavMain />)

    const transactionsLink = screen.getByRole('link', { name: /transactions/i })
    expect(transactionsLink.closest('[data-active="true"]')).toBeInTheDocument()
  })

  it('marks Accounts as active when pathname is "/accounts"', () => {
    vi.mocked(usePathname).mockReturnValue('/accounts')

    render(<NavMain />)

    const accountsLink = screen.getByRole('link', { name: /accounts/i })
    expect(accountsLink.closest('[data-active="true"]')).toBeInTheDocument()
  })
})
```

**Test file: AppSidebar.test.tsx**
```typescript
// __tests__/layers/widgets/app-sidebar/ui/AppSidebar.test.tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { AppSidebar } from '@/layers/widgets/app-sidebar/ui/AppSidebar'

// Mock useSidebar and child components
vi.mock('@/components/ui/sidebar', async () => {
  const actual = await vi.importActual('@/components/ui/sidebar')
  return {
    ...actual,
    useSidebar: vi.fn(() => ({
      setOpenMobile: vi.fn(),
    })),
  }
})

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/'),
}))

describe('AppSidebar', () => {
  it('renders with header showing app name', () => {
    render(<AppSidebar />)

    expect(screen.getByText('Dunny')).toBeInTheDocument()
  })

  it('renders with collapsed icon "D"', () => {
    render(<AppSidebar />)

    expect(screen.getByText('D')).toBeInTheDocument()
  })
})
```

**Acceptance Criteria**:
- [ ] NavMain.test.tsx created and passes
- [ ] AppSidebar.test.tsx created and passes
- [ ] All navigation items tested
- [ ] Active state logic tested for all 3 routes
- [ ] Tests run with `pnpm test`

---

### Task 5.2: Write integration test for navigation flow
**Description**: Test end-to-end navigation between pages
**Size**: Medium
**Priority**: Medium
**Dependencies**: Task 4.3
**Can run parallel with**: Task 5.1, Task 5.3

**Technical Requirements**:
- Test navigation from Dashboard to Transactions
- Test navigation from Dashboard to Accounts
- Verify URL changes correctly
- Test active state updates

**Test file: Navigation.test.tsx**
```typescript
// __tests__/app/Navigation.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'

// Note: This test requires proper router mocking
// For full integration, consider using next/jest setup or E2E tests

describe('App Navigation', () => {
  it('navigates from Dashboard to Transactions', async () => {
    const user = userEvent.setup()
    // Implementation depends on test setup
    // This may need E2E testing for full coverage
  })

  it('navigates from Dashboard to Accounts', async () => {
    const user = userEvent.setup()
    // Implementation depends on test setup
  })
})
```

**Note**: Full integration testing of Next.js navigation often requires E2E tests with Playwright. Consider Task 5.3 for comprehensive navigation testing.

**Acceptance Criteria**:
- [ ] Test file created
- [ ] Navigation flow documented
- [ ] Tests pass or are marked as E2E candidates

---

### Task 5.3: Write E2E tests for navigation
**Description**: Create Playwright E2E tests for navigation and responsive behavior
**Size**: Large
**Priority**: Medium
**Dependencies**: Task 4.3
**Can run parallel with**: Task 5.1, Task 5.2

**Technical Requirements**:
- Test desktop sidebar navigation
- Test mobile drawer behavior
- Test keyboard shortcut (Cmd+B)
- Test cookie persistence

**Test file: navigation.spec.ts**
```typescript
// e2e/navigation.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Navigation E2E', () => {
  test('desktop sidebar navigation works', async ({ page }) => {
    await page.goto('/')

    // Verify sidebar is visible
    await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible()

    // Navigate to Transactions
    await page.click('text=Transactions')
    await expect(page).toHaveURL('/transactions')

    // Navigate to Accounts
    await page.click('text=Accounts')
    await expect(page).toHaveURL('/accounts')

    // Navigate back to Dashboard
    await page.click('text=Dashboard')
    await expect(page).toHaveURL('/')
  })

  test('mobile drawer opens and closes', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Sidebar should be hidden initially
    await expect(page.getByRole('link', { name: 'Dashboard' })).not.toBeVisible()

    // Click hamburger trigger
    await page.click('[data-sidebar="trigger"]')

    // Drawer should open
    await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible()

    // Click a nav item
    await page.click('text=Transactions')

    // Drawer should auto-close
    await expect(page).toHaveURL('/transactions')
    // Give time for drawer to close
    await page.waitForTimeout(300)
    await expect(page.getByRole('link', { name: 'Dashboard' })).not.toBeVisible()
  })

  test('keyboard shortcut toggles sidebar', async ({ page }) => {
    await page.goto('/')

    // Sidebar should be expanded initially
    await expect(page.locator('[data-state="expanded"]')).toBeVisible()

    // Press Cmd+B (Mac) or Ctrl+B (Windows/Linux)
    await page.keyboard.press('Meta+b')

    // Sidebar should be collapsed
    await expect(page.locator('[data-state="collapsed"]')).toBeVisible()

    // Press again to expand
    await page.keyboard.press('Meta+b')

    // Sidebar should be expanded again
    await expect(page.locator('[data-state="expanded"]')).toBeVisible()
  })

  test('sidebar state persists via cookie', async ({ page, context }) => {
    await page.goto('/')

    // Collapse sidebar
    await page.keyboard.press('Meta+b')
    await expect(page.locator('[data-state="collapsed"]')).toBeVisible()

    // Reload page
    await page.reload()

    // Should still be collapsed (cookie persistence)
    await expect(page.locator('[data-state="collapsed"]')).toBeVisible()
  })
})
```

**Acceptance Criteria**:
- [ ] E2E test file created
- [ ] Desktop navigation test passes
- [ ] Mobile drawer test passes
- [ ] Keyboard shortcut test passes
- [ ] Cookie persistence test passes
- [ ] All E2E tests run with `pnpm test:e2e`

---

### Task 5.4: Manual responsive testing
**Description**: Manually verify responsive behavior across breakpoints
**Size**: Small
**Priority**: Medium
**Dependencies**: Task 4.3
**Can run parallel with**: Task 5.1, Task 5.2, Task 5.3

**Testing Checklist**:

**Desktop (>= 768px)**:
- [ ] Sidebar visible and expanded by default
- [ ] Can collapse sidebar via rail or Cmd+B
- [ ] Collapsed sidebar shows icons only
- [ ] Tooltips appear on hover in collapsed mode
- [ ] Navigation active states correct
- [ ] Content area adjusts to sidebar width

**Mobile (< 768px)**:
- [ ] Sidebar hidden by default
- [ ] Mobile header visible with hamburger
- [ ] Clicking hamburger opens drawer
- [ ] Drawer slides in from left
- [ ] Navigation works from drawer
- [ ] Drawer auto-closes on navigation
- [ ] Can close drawer via overlay click
- [ ] Can close drawer via swipe (if supported)

**Breakpoint Transitions**:
- [ ] Resizing from mobile to desktop shows sidebar
- [ ] Resizing from desktop to mobile hides sidebar
- [ ] No layout jumps during transition

**Acceptance Criteria**:
- [ ] All desktop checklist items verified
- [ ] All mobile checklist items verified
- [ ] All transition items verified
- [ ] No visual bugs observed

---

## Execution Strategy

### Recommended Execution Order

1. **Start in parallel**: Tasks 1.1, 2.1, 2.2 (structure creation)
2. **After 1.1**: Tasks 1.2, 1.3, 1.5 (component stubs)
3. **After 1.2, 1.3**: Task 1.4 (NavMain depends on nav-items and AppSidebar structure)
4. **After 1.4, 1.5**: Task 1.6 (exports)
5. **After 1.6**: Task 3.1 (layout integration)
6. **After 3.1**: Task 3.2 (verify layout)
7. **After 2.1, 2.2, 3.1**: Tasks 4.1, 4.2, 4.4 (pages, can be parallel)
8. **After 4.1, 4.2**: Task 4.3 (verify imports)
9. **After 4.3**: Task 2.3 (delete old files)
10. **After all**: Phase 5 tests (can be parallel)

### Critical Path

Task 1.1 → Task 1.2 → Task 1.4 → Task 1.6 → Task 3.1 → Task 4.4 → Task 4.3

### Risk Mitigation

1. **Risk**: Shadcn sidebar primitives may need customization
   **Mitigation**: Review Shadcn docs thoroughly before implementation

2. **Risk**: Cookie handling for SSR/client sync
   **Mitigation**: Follow Next.js 16 async cookies() pattern exactly

3. **Risk**: Mobile drawer behavior inconsistent
   **Mitigation**: Test on real mobile devices, not just browser simulation

---

## Documentation Updates Required

After implementation:

1. **CLAUDE.md**: Add widgets layer to directory structure section
2. **developer-guides/01-project-structure.md**: Document widgets layer pattern and when to use it
