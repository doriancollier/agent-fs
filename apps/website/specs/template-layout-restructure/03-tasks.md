# Tasks: Template Layout Restructure

**Feature Slug:** template-layout-restructure
**Generated:** 2026-02-01
**Total Tasks:** 7
**Phases:** 5

---

## Phase Overview

| Phase | Tasks | Risk Level | Parallel Execution |
|-------|-------|------------|-------------------|
| P1: Create System Route Group | 3 | Low | Tasks 1.1, 1.2, 1.3 can run in parallel after 1.1 |
| P2: Simplify Root Layout | 1 | Medium | Sequential (blocked by P1) |
| P3: Update Homepage | 1 | Low | Sequential (blocked by P2) |
| P4: Update Navigation | 1 | Low | Can parallel with P3 (blocked by P1 only) |
| P5: Verification | 1 | Low | Sequential (blocked by all) |

---

## Task Dependency Graph

```
P1.1 (Create system layout)
  │
  ├──► P1.2 (Move system pages) ──┬──► P2.1 (Simplify root layout)
  │                               │         │
  └──► P1.3 (Move example page) ──┘         │
                                            ▼
                               P3.1 (Update homepage)
                                            │
  P1.1 ──────────────────────► P4.1 (Update navigation)
                                            │
                                            ▼
                               P5.1 (Verification) ◄── All tasks
```

---

## Tasks

### Phase 1: Create System Route Group

#### Task 1.1: Create system route group layout

**Subject:** `[template-layout-restructure] [P1] Create system route group layout`
**Status:** pending
**Blocked By:** None

##### Objective

Create a new layout file for the `(system)` route group that contains the sidebar wrapper.

##### File to Create

`src/app/(system)/layout.tsx`

##### Complete Implementation

```typescript
import { cookies } from 'next/headers'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar, MobileHeader } from '@/layers/widgets/app-sidebar'

export default async function SystemLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get('sidebar_state')?.value === 'true'

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <SidebarInset>
        <MobileHeader />
        <main className="flex-1">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
```

##### Steps

1. Create directory `src/app/(system)/` if it doesn't exist
2. Create the `layout.tsx` file with the exact code above
3. Verify the file has no TypeScript errors

##### Acceptance Criteria

- [ ] File exists at `src/app/(system)/layout.tsx`
- [ ] Contains SidebarProvider, AppSidebar, MobileHeader, SidebarInset
- [ ] Reads `sidebar_state` cookie for default open state
- [ ] No TypeScript errors

---

#### Task 1.2: Move system pages to route group

**Subject:** `[template-layout-restructure] [P1] Move system pages to route group`
**Status:** pending
**Blocked By:** Task 1.1

##### Objective

Move the `src/app/system/` directory into the `(system)` route group to preserve the `/system` URL path while using the new layout.

##### Files to Move

| Source | Destination |
|--------|-------------|
| `src/app/system/page.tsx` | `src/app/(system)/system/page.tsx` |
| `src/app/system/claude-code/` | `src/app/(system)/system/claude-code/` |
| `src/app/system/ui/` | `src/app/(system)/system/ui/` |

##### Steps

1. Create directory `src/app/(system)/system/`
2. Move entire contents of `src/app/system/` to `src/app/(system)/system/`
3. Remove the now-empty `src/app/system/` directory
4. Verify no import paths need updating (all should use `@/` aliases)

##### Commands

```bash
# Move the directory
mv src/app/system src/app/\(system\)/system

# Verify structure
ls -la src/app/\(system\)/system/
```

##### Acceptance Criteria

- [ ] `src/app/(system)/system/page.tsx` exists
- [ ] `src/app/(system)/system/claude-code/page.tsx` exists
- [ ] `src/app/(system)/system/ui/layout.tsx` exists (design system's own layout)
- [ ] `src/app/(system)/system/ui/page.tsx` exists
- [ ] Original `src/app/system/` directory no longer exists
- [ ] All imports within moved files still resolve

---

#### Task 1.3: Move example page to route group

**Subject:** `[template-layout-restructure] [P1] Move example page to route group`
**Status:** pending
**Blocked By:** Task 1.1

##### Objective

Move the example page into the system route group so it gets the sidebar.

##### Source Check

First check if `src/app/example/` exists. If not, this task is N/A.

##### Files to Move (if exists)

| Source | Destination |
|--------|-------------|
| `src/app/example/` | `src/app/(system)/example/` |

##### Steps

1. Check if `src/app/example/` directory exists
2. If exists: move to `src/app/(system)/example/`
3. If not exists: mark task as N/A

##### Commands

```bash
# Check if exists
ls src/app/example/ 2>/dev/null || echo "Directory does not exist - N/A"

# If exists, move it
mv src/app/example src/app/\(system\)/example
```

##### Acceptance Criteria

- [ ] If example directory existed: now at `src/app/(system)/example/`
- [ ] If example directory did not exist: task marked N/A
- [ ] No orphaned files

---

### Phase 2: Simplify Root Layout

#### Task 2.1: Simplify root layout

**Subject:** `[template-layout-restructure] [P2] Simplify root layout`
**Status:** pending
**Blocked By:** Task 1.2, Task 1.3

##### Objective

Remove all sidebar-related code from the root layout, leaving only the essential HTML structure, providers, and global components.

##### File to Modify

`src/app/layout.tsx`

##### Current Code (to be replaced)

The file currently contains SidebarProvider, AppSidebar, MobileHeader, and SidebarInset wrappers.

##### Target Implementation

```typescript
import type { Metadata, Viewport } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Providers } from './providers'
import { CookieConsentBanner } from '@/layers/widgets/cookie-consent'
import './globals.css'

export const metadata: Metadata = {
  title: 'Next.js Boilerplate',
  description: 'A production-ready Next.js 16 boilerplate with modern tooling',
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafafa' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>
          {children}
          <CookieConsentBanner />
        </Providers>
      </body>
    </html>
  )
}
```

##### Changes Summary

**Remove:**
- `import { cookies } from 'next/headers'`
- `import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'`
- `import { AppSidebar, MobileHeader } from '@/layers/widgets/app-sidebar'`
- `const cookieStore = await cookies()` and related sidebar state
- `<SidebarProvider>` wrapper
- `<AppSidebar />` component
- `<SidebarInset>` wrapper
- `<MobileHeader />` component
- `<main className="flex-1">` wrapper (children rendered directly)
- `async` keyword from function (no longer needed)

**Keep:**
- Metadata and viewport exports
- Font imports (GeistSans, GeistMono)
- Providers import and wrapper
- CookieConsentBanner import and component
- globals.css import
- HTML/body structure

**Add/Modify:**
- Add font classes to `<html>` tag: `className={`${GeistSans.variable} ${GeistMono.variable}`}`
- Update body classes to: `"min-h-screen bg-background font-sans antialiased"`

##### Acceptance Criteria

- [ ] No sidebar-related imports remain
- [ ] No SidebarProvider, AppSidebar, MobileHeader, SidebarInset in JSX
- [ ] Function is no longer async (no await cookies)
- [ ] Font variables applied to html tag
- [ ] Providers wrapper preserved
- [ ] CookieConsentBanner preserved
- [ ] No TypeScript errors
- [ ] App loads without console errors

---

### Phase 3: Update Homepage

#### Task 3.1: Update homepage with redirect

**Subject:** `[template-layout-restructure] [P3] Update homepage with redirect`
**Status:** pending
**Blocked By:** Task 2.1

##### Objective

Replace the current homepage content with a simple redirect to `/system`, with clear comments for template users.

##### File to Modify

`src/app/(public)/page.tsx`

##### Target Implementation

```typescript
import { redirect } from 'next/navigation'

// TEMPLATE NOTE: Replace this redirect with your own homepage content.
// Delete this file and create your own app/page.tsx or app/(public)/page.tsx
// to build your custom homepage.
export default function HomePage() {
  redirect('/system')
}
```

##### Changes Summary

**Remove:**
- All existing imports (Link, Card components, icons, etc.)
- techStack array
- quickLinks array
- All JSX content

**Add:**
- `import { redirect } from 'next/navigation'`
- Template guidance comment
- Simple redirect function

##### Acceptance Criteria

- [ ] File contains only redirect import and component
- [ ] Template guidance comment present
- [ ] Visiting `/` redirects to `/system`
- [ ] No unused imports remain
- [ ] No TypeScript errors

---

### Phase 4: Update Navigation

#### Task 4.1: Update navigation items

**Subject:** `[template-layout-restructure] [P4] Update navigation items`
**Status:** pending
**Blocked By:** Task 1.1

##### Objective

Update the Home link in the sidebar navigation to point to `/system` instead of `/` since the homepage now redirects.

##### File to Modify

`src/layers/widgets/app-sidebar/lib/nav-items.ts`

##### Current Code

```typescript
export const navItems = [
  {
    label: 'Home',
    href: '/',
    icon: LayoutDashboard,
  },
  // ...
] as const
```

##### Target Code

```typescript
export const navItems = [
  {
    label: 'Home',
    href: '/system',  // Changed from '/'
    icon: LayoutDashboard,
  },
  // ...
] as const
```

##### Changes Summary

Change the `href` value for the Home nav item from `'/'` to `'/system'`.

##### Acceptance Criteria

- [ ] Home link in navItems points to `/system`
- [ ] Clicking "Home" in sidebar navigates to `/system` (no redirect loop)
- [ ] All other nav items unchanged
- [ ] No TypeScript errors

---

### Phase 5: Verification

#### Task 5.1: Verify all routes work

**Subject:** `[template-layout-restructure] [P5] Verify all routes work`
**Status:** pending
**Blocked By:** Task 2.1, Task 3.1, Task 4.1

##### Objective

Comprehensive verification that all routes work correctly after the restructure.

##### Verification Checklist

###### System Pages (should have AppSidebar)

- [ ] `/system` - System overview page loads with sidebar
- [ ] `/system/ui` - Design system loads with its own ShowcaseSidebar
- [ ] `/system/ui/components` - Component showcase works
- [ ] `/system/ui/foundations` - Foundations page works
- [ ] `/system/ui/patterns` - Patterns page works
- [ ] `/system/claude-code` - Claude Code docs load with sidebar
- [ ] `/example` - Example page loads with sidebar (if exists)

###### Public Pages (should NOT have sidebar)

- [ ] `/privacy` - Privacy page loads without sidebar, has footer
- [ ] `/terms` - Terms page loads without sidebar, has footer
- [ ] `/cookies` - Cookies page loads without sidebar, has footer

###### Auth Pages (should work unchanged)

- [ ] `/sign-in` - Sign-in page loads correctly
- [ ] `/verify` - Verify page loads correctly

###### Authenticated Pages (should work unchanged)

- [ ] `/dashboard` - Dashboard loads (when authenticated)

###### Homepage Redirect

- [ ] `/` - Redirects to `/system`
- [ ] URL bar shows `/system` after redirect

###### Cross-Cutting Concerns

- [ ] No console errors on any page
- [ ] Mobile navigation works on system pages
- [ ] Theme toggle works everywhere
- [ ] Cookie consent banner appears on all pages
- [ ] Browser back/forward works through redirect

##### Verification Commands

```bash
# Start dev server and check routes
pnpm dev

# Check for TypeScript errors
pnpm typecheck

# Check for lint errors
pnpm lint
```

##### Acceptance Criteria

- [ ] All checklist items pass
- [ ] No TypeScript errors
- [ ] No lint errors
- [ ] No console errors in browser

---

## Execution Notes

### Parallel Execution Opportunities

1. **Phase 1 parallelization:** After Task 1.1 completes, Tasks 1.2 and 1.3 can run in parallel
2. **Phase 3-4 parallelization:** Tasks 3.1 and 4.1 can potentially run in parallel since they modify different files (but 4.1 only needs P1, while 3.1 needs P2)

### Recommended Execution Order

```
Sequential execution:
1. Task 1.1 (Create system layout)
2. Task 1.2 + Task 1.3 (Move pages - can be parallel)
3. Task 2.1 (Simplify root layout)
4. Task 3.1 + Task 4.1 (Homepage + nav - can be parallel)
5. Task 5.1 (Verification)
```

### Rollback Strategy

If any phase fails:
1. Use `git checkout -- src/app/` to restore app directory
2. Specifically: `git checkout -- src/app/layout.tsx` for root layout
3. All changes are file-based with no data implications

---

## Summary

| Metric | Value |
|--------|-------|
| Total Tasks | 7 |
| Phases | 5 |
| Estimated Time | 30-45 minutes |
| Risk Level | Low-Medium |
| Files Created | 1 |
| Files Moved | 2-3 directories |
| Files Modified | 3 |
