---
roadmapId: 550e8400-e29b-41d4-a716-446655440020
slug: app-navigation-layout
---

# App Navigation and Layout Structure

## Status

**Draft** - Ready for implementation

## Authors

- Claude Code (2025-12-09)

## Overview

Implement a navigation shell using the existing Shadcn sidebar component to provide persistent navigation across the application. This establishes the foundational routing structure with three MVP pages (Dashboard, Transactions, Accounts) and enables parallel feature development by giving each feature a proper home.

## Background/Problem Statement

The current application has all content on a single page (`src/app/page.tsx`), which includes:
- Monthly summary card
- Alert banner
- Plaid link and sync buttons
- Accounts list
- Transactions list

**Problems:**
1. **Cluttered single page** - All features compete for attention on one screen
2. **No clear information hierarchy** - Transaction list and account management are mixed with insights
3. **Poor scalability** - Adding new features would further bloat the page
4. **No navigation structure** - Users cannot bookmark or share specific views

**Solution:** Create a sidebar-based navigation shell that distributes content across dedicated pages while maintaining a consistent layout.

## Goals

- Establish clear navigation between 3 main application areas
- Create dedicated pages for Dashboard, Transactions, and Accounts
- Implement responsive navigation (sidebar on desktop, drawer on mobile)
- Enable sidebar collapse to icon-only mode for more content space
- Follow FSD architecture with a new `widgets` layer for the sidebar
- Maintain the Calm Tech design language throughout

## Non-Goals

- Additional pages beyond the 3 MVP routes
- User authentication or protected routes
- User settings or profile pages
- Nested navigation or submenus
- Breadcrumb navigation
- Deep linking with query parameters
- Search functionality in navigation

## Technical Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| `@/components/ui/sidebar` | Installed | Shadcn sidebar with 20+ sub-components |
| `@/components/ui/sheet` | Installed | Mobile drawer support |
| `next/link` | 16.x | Client-side navigation |
| `next/navigation` | 16.x | `usePathname()` for active state |
| `lucide-react` | Installed | Navigation icons |
| `@/hooks/use-mobile` | Installed | Mobile breakpoint detection |

All dependencies are already installed. No new packages required.

## Detailed Design

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Root Layout                               │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    SidebarProvider                         │  │
│  │  ┌──────────┐  ┌─────────────────────────────────────┐   │  │
│  │  │ Sidebar  │  │           SidebarInset              │   │  │
│  │  │          │  │  ┌───────────────────────────────┐  │   │  │
│  │  │ - Header │  │  │    Mobile Header (md:hidden)  │  │   │  │
│  │  │ - Nav    │  │  ├───────────────────────────────┤  │   │  │
│  │  │ - Footer │  │  │                               │  │   │  │
│  │  │          │  │  │      Page Content             │  │   │  │
│  │  │          │  │  │   (Dashboard|Transactions|    │  │   │  │
│  │  │          │  │  │    Accounts)                  │  │   │  │
│  │  │          │  │  │                               │  │   │  │
│  │  └──────────┘  │  └───────────────────────────────┘  │   │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### File Structure

```
src/
├── app/
│   ├── layout.tsx              # Modified: wrap with SidebarProvider
│   ├── page.tsx                # Modified: Dashboard content only
│   ├── transactions/
│   │   └── page.tsx            # New: Transactions page
│   ├── accounts/
│   │   └── page.tsx            # New: Accounts page
│   ├── accounts-list.tsx       # Deleted: moved to widgets
│   └── transactions-list.tsx   # Deleted: moved to widgets
└── layers/
    └── widgets/
        ├── app-sidebar/
        │   ├── ui/
        │   │   ├── AppSidebar.tsx      # Main sidebar component
        │   │   ├── NavMain.tsx         # Navigation menu items
        │   │   └── MobileHeader.tsx    # Mobile header with trigger
        │   ├── lib/
        │   │   └── nav-items.ts        # Navigation configuration
        │   └── index.ts                # Public exports
        ├── accounts-section/
        │   ├── ui/
        │   │   └── AccountsSection.tsx # Moved from app/accounts-list.tsx
        │   └── index.ts
        └── transactions-section/
            ├── ui/
            │   └── TransactionsSection.tsx # Moved from app/transactions-list.tsx
            └── index.ts
```

### Component Specifications

#### 1. AppSidebar Widget (`src/layers/widgets/app-sidebar/`)

**AppSidebar.tsx:**
```tsx
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

**NavMain.tsx:**
```tsx
'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Receipt, Building2 } from 'lucide-react'
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

**nav-items.ts:**
```typescript
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

**MobileHeader.tsx:**
```tsx
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

#### 2. Root Layout Modification

**layout.tsx (modified):**
```tsx
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

#### 3. Page Content Distribution

**Dashboard (/) - `src/app/page.tsx`:**
```tsx
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

**Transactions (/transactions) - `src/app/transactions/page.tsx`:**
```tsx
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

**Accounts (/accounts) - `src/app/accounts/page.tsx`:**
```tsx
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

### Responsive Behavior

| Breakpoint | Sidebar Behavior | Header Behavior |
|------------|------------------|-----------------|
| < 768px (mobile) | Hidden, opens as drawer via Sheet | Mobile header with hamburger trigger visible |
| >= 768px (desktop) | Visible, collapsible to icon-only (48px) | Mobile header hidden |

**Sidebar States:**
- **Expanded:** 16rem (256px) width, full labels visible
- **Collapsed:** 3rem (48px) width, icons only with tooltips
- **Mobile:** Sheet overlay, swipe to close

### Navigation Active State

The `SidebarMenuButton` component accepts an `isActive` prop which applies:
- Background color: `bg-sidebar-accent`
- Text color: `text-sidebar-accent-foreground`
- Font weight: `font-medium`

Active state is determined by comparing `usePathname()` against each nav item's `href`.

### Keyboard Shortcuts

Built into Shadcn sidebar:
- **Cmd+B / Ctrl+B:** Toggle sidebar expanded/collapsed state

### State Persistence

Sidebar open/close state persists via cookie:
- Cookie name: `sidebar_state`
- Max age: 7 days
- Read on server in layout.tsx to avoid hydration mismatch

## User Experience

### Navigation Flow

1. **Desktop users** see persistent left sidebar with three navigation items
2. **Clicking a nav item** navigates to the corresponding page with visual active state
3. **Collapsing sidebar** (via rail or Cmd+B) reduces to icon-only mode with tooltips
4. **Mobile users** see a minimal header with hamburger menu
5. **Opening mobile menu** slides in a drawer from the left
6. **Selecting a nav item on mobile** navigates and auto-closes drawer

### Visual Hierarchy

```
┌─────────────────────────────────────────┐
│ [D] Dunny                    [Collapse] │  <- Sidebar Header
├─────────────────────────────────────────┤
│ [icon] Dashboard         <- Active      │
│ [icon] Transactions                     │  <- Nav Items
│ [icon] Accounts                         │
├─────────────────────────────────────────┤
│                                         │  <- Footer (reserved)
└─────────────────────────────────────────┘
```

## Testing Strategy

### Unit Tests

**NavMain.test.tsx:**
```typescript
// Purpose: Verify navigation items render correctly and active states work
describe('NavMain', () => {
  it('renders all navigation items', () => {
    // Verify Dashboard, Transactions, Accounts links exist
  })

  it('marks Dashboard as active when pathname is "/"', () => {
    // Mock usePathname to return '/'
    // Verify isActive prop is true for Dashboard
  })

  it('marks Transactions as active when pathname is "/transactions"', () => {
    // Mock usePathname to return '/transactions'
    // Verify isActive prop is true for Transactions
  })
})
```

**AppSidebar.test.tsx:**
```typescript
// Purpose: Verify sidebar structure and collapsible behavior
describe('AppSidebar', () => {
  it('renders with header showing app name', () => {
    // Verify "Dunny" text is present
  })

  it('passes collapsible="icon" to Sidebar component', () => {
    // Verify correct prop is passed
  })
})
```

### Integration Tests

**Navigation.test.tsx:**
```typescript
// Purpose: Verify end-to-end navigation between pages
describe('App Navigation', () => {
  it('navigates from Dashboard to Transactions', async () => {
    // Render with router
    // Click Transactions nav item
    // Verify URL changed to /transactions
  })

  it('navigates from Dashboard to Accounts', async () => {
    // Render with router
    // Click Accounts nav item
    // Verify URL changed to /accounts
  })

  it('persists sidebar state in cookie', async () => {
    // Toggle sidebar
    // Verify cookie is set
    // Reload and verify state persists
  })
})
```

### E2E Tests (Playwright)

**navigation.spec.ts:**
```typescript
// Purpose: Verify real browser navigation and responsive behavior
describe('Navigation E2E', () => {
  test('desktop sidebar navigation works', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible()
    await page.click('text=Transactions')
    await expect(page).toHaveURL('/transactions')
  })

  test('mobile drawer opens and closes', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    // Sidebar should be hidden
    await expect(page.getByRole('link', { name: 'Dashboard' })).not.toBeVisible()
    // Click hamburger
    await page.click('[data-sidebar="trigger"]')
    // Drawer should open
    await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible()
  })

  test('keyboard shortcut toggles sidebar', async ({ page }) => {
    await page.goto('/')
    // Sidebar should be expanded
    await expect(page.locator('[data-state="expanded"]')).toBeVisible()
    // Press Cmd+B
    await page.keyboard.press('Meta+b')
    // Sidebar should be collapsed
    await expect(page.locator('[data-state="collapsed"]')).toBeVisible()
  })
})
```

## Performance Considerations

### Bundle Impact

| Addition | Size | Notes |
|----------|------|-------|
| AppSidebar widget | ~2KB | New component code |
| nav-items.ts | <1KB | Static configuration |
| Route pages | ~1KB each | Minimal, mostly imports |

**Total additional:** ~5KB (negligible)

### Navigation Performance

- **Next.js Link prefetching:** Enabled by default, pages prefetch on hover
- **Layout persistence:** Sidebar doesn't re-render on navigation (layout deduplication)
- **No additional data fetching:** Navigation is purely client-side

### Hydration

- **Sidebar state read from cookie on server** to match client state
- **No hydration mismatch** due to server-side cookie reading in layout

## Security Considerations

- **No sensitive data in navigation** - Only static route labels and icons
- **No authentication yet** - All routes publicly accessible (per constraints)
- **Cookie security:** Sidebar state cookie is non-sensitive, path-restricted

## Documentation

### Files to Update

1. **CLAUDE.md** - Add widgets layer to directory structure
2. **developer-guides/01-project-structure.md** - Document widgets layer pattern

### New Documentation

None required - implementation follows existing FSD patterns.

## Implementation Phases

### Phase 1: Core Navigation Widget

1. Create `src/layers/widgets/app-sidebar/` directory structure
2. Implement `AppSidebar.tsx` with header and navigation
3. Implement `NavMain.tsx` with three nav items and auto-close on mobile
4. Implement `MobileHeader.tsx` with sidebar trigger
5. Create `lib/nav-items.ts` configuration
6. Create `index.ts` exports

### Phase 2: Widget Migration

1. Create `src/layers/widgets/accounts-section/` directory
2. Move `src/app/accounts-list.tsx` to `widgets/accounts-section/ui/AccountsSection.tsx`
3. Create `src/layers/widgets/transactions-section/` directory
4. Move `src/app/transactions-list.tsx` to `widgets/transactions-section/ui/TransactionsSection.tsx`
5. Create index.ts exports for both widgets
6. Delete original files from app/

### Phase 3: Layout Integration

1. Modify `src/app/layout.tsx` to wrap with SidebarProvider
2. Add AppSidebar and SidebarInset structure
3. Add MobileHeader inside SidebarInset
4. Handle cookie reading for default sidebar state

### Phase 4: Page Creation

1. Create `src/app/transactions/page.tsx` using TransactionsSection widget
2. Create `src/app/accounts/page.tsx` using AccountsSection widget
3. Modify `src/app/page.tsx` to be Dashboard only
4. Verify all imports resolve correctly

### Phase 5: Testing & Polish

1. Write unit tests for NavMain and AppSidebar
2. Write integration test for navigation flow
3. Test responsive behavior manually
4. Verify keyboard shortcut works
5. Test cookie persistence
6. Test mobile drawer auto-close behavior

## Open Questions

1. ~~**Should mobile drawer auto-close on navigation?**~~ (RESOLVED)
   **Answer:** Yes, auto-close for better mobile UX
   **Rationale:** Better user experience - drawer closes after selection so user sees the new page immediately

   Original context preserved:
   - Default Shadcn behavior does NOT auto-close
   - Implementation: Listen to pathname changes in NavMain, call `setOpenMobile(false)`

2. ~~**Should we move accounts-list.tsx and transactions-list.tsx to widgets layer?**~~ (RESOLVED)
   **Answer:** Yes, move to widgets layer
   **Rationale:** Better FSD architecture alignment, worth the additional scope

   Original context preserved:
   - Currently at app level, will be moved to `widgets/accounts-section/` and `widgets/transactions-section/`

## References

- [Shadcn Sidebar Documentation](https://ui.shadcn.com/docs/components/sidebar)
- [Next.js App Router Layouts](https://nextjs.org/docs/app/building-your-application/routing/layouts-and-templates)
- [FSD Architecture](https://feature-sliced.design/)
- Ideation document: `specs/app-navigation-layout/01-ideation.md`
- Roadmap item: `550e8400-e29b-41d4-a716-446655440020`
