---
slug: template-layout-restructure
---

# Specification: Template Layout Restructure

**Feature Slug:** template-layout-restructure
**Author:** Claude Code
**Date:** 2026-02-01
**Status:** Ready for Implementation

---

## Overview

Restructure the application layout architecture to make the root layout minimal and easily replaceable, while moving the sidebar and complex UI into a dedicated `(system)` route group. This enables template users to quickly customize their homepage by simply deleting the redirect, without affecting the system dashboard functionality.

### Goals

1. **Minimal root layout** - Only HTML structure, providers, and global styles
2. **System route group** - Contains sidebar and all template documentation/demo pages
3. **Clear separation** - Template users can delete `(system)` route group entirely
4. **Homepage redirect** - Root page redirects to `/system` until customized

### Non-Goals

- Changing authentication flows
- Modifying system dashboard functionality
- Creating new features
- Changing the design system showcase (`/system/ui`) - it keeps its own layout

---

## Technical Design

### Architecture Overview

**Current State:**
```
app/layout.tsx (SidebarProvider + AppSidebar + MobileHeader)
├── All routes get sidebar wrapper
└── No separation between system and public content
```

**Target State:**
```
app/layout.tsx (MINIMAL: HTML + Providers + CookieConsent only)
├── app/page.tsx → redirect('/system')
├── app/(system)/layout.tsx (SidebarProvider + AppSidebar + MobileHeader)
│   └── app/(system)/system/* (all system pages)
├── app/(public)/layout.tsx (footer only, no sidebar)
│   └── cookies, privacy, terms pages
├── app/(authenticated)/layout.tsx (unchanged)
│   └── dashboard
└── app/(auth)/* (unchanged)
```

### File Changes

#### 1. Create System Route Group Layout

**New file:** `src/app/(system)/layout.tsx`

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

#### 2. Move System Pages

**Move directory:** `src/app/system/` → `src/app/(system)/system/`

This preserves the `/system` URL path while placing pages under the new route group layout.

Files to move:
- `src/app/system/page.tsx` → `src/app/(system)/system/page.tsx`
- `src/app/system/claude-code/` → `src/app/(system)/system/claude-code/`
- `src/app/system/ui/` → `src/app/(system)/system/ui/` (with its own layout)

#### 3. Move Example Page

**Move:** `src/app/example/` → `src/app/(system)/example/`

This moves the example page into the system route group so it gets the sidebar.

#### 4. Simplify Root Layout

**Modify:** `src/app/layout.tsx`

Remove:
- SidebarProvider import and wrapper
- AppSidebar import and component
- MobileHeader import and component
- SidebarInset wrapper
- sidebar_state cookie handling

Keep:
- HTML structure (`<html>`, `<body>`)
- Providers wrapper
- CookieConsentBanner
- Font imports
- globals.css import
- Metadata and viewport exports

**Target structure:**
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

#### 5. Update Homepage

**Modify:** `src/app/(public)/page.tsx`

Replace entire content with redirect:

```typescript
import { redirect } from 'next/navigation'

// TEMPLATE NOTE: Replace this redirect with your own homepage content.
// Delete this file and create your own app/page.tsx or app/(public)/page.tsx
// to build your custom homepage.
export default function HomePage() {
  redirect('/system')
}
```

#### 6. Update Public Layout

**Modify:** `src/app/(public)/layout.tsx`

Ensure it works without SidebarProvider context. The current implementation only uses PublicFooter, so it should work as-is. Verify no sidebar dependencies.

#### 7. Update Navigation Items

**Modify:** `src/layers/widgets/app-sidebar/lib/nav-items.ts`

Update the Home link to point to `/system` since the homepage now redirects:

```typescript
export const navItems: NavItem[] = [
  {
    title: 'Home',
    url: '/system',  // Changed from '/'
    icon: Home,
  },
  // ... rest unchanged
]
```

---

## Implementation Phases

### Phase 1: Create System Route Group (Low Risk)

1. Create `src/app/(system)/layout.tsx` with sidebar
2. Move `src/app/system/` to `src/app/(system)/system/`
3. Move `src/app/example/` to `src/app/(system)/example/` (if exists)
4. Verify `/system` and `/system/ui` still work

**Verification:**
- Navigate to `/system` - should show system overview with sidebar
- Navigate to `/system/ui` - should show design system with its own sidebar
- Navigate to `/system/claude-code` - should show Claude Code docs

### Phase 2: Simplify Root Layout (Medium Risk)

1. Remove sidebar-related imports from root layout
2. Remove SidebarProvider wrapper
3. Remove AppSidebar and MobileHeader components
4. Keep only essential structure

**Verification:**
- App still loads without errors
- No missing context errors in console

### Phase 3: Update Homepage (Low Risk)

1. Replace homepage content with redirect
2. Add template guidance comments

**Verification:**
- Navigate to `/` - should redirect to `/system`
- URL bar shows `/system` after redirect

### Phase 4: Update Navigation (Low Risk)

1. Update nav-items.ts Home link
2. Verify navigation works from system pages

**Verification:**
- Click "Home" in sidebar - stays on `/system`
- All navigation links work correctly

### Phase 5: Verify Public Routes (Low Risk)

1. Check `/privacy`, `/terms`, `/cookies` pages
2. Ensure they have footer but no sidebar
3. Verify no console errors

**Verification:**
- Public pages render correctly
- Footer appears, no sidebar
- No hydration errors

---

## File Summary

| Action | File Path | Description |
|--------|-----------|-------------|
| CREATE | `src/app/(system)/layout.tsx` | System layout with sidebar |
| MOVE | `src/app/system/` → `src/app/(system)/system/` | Move system pages |
| MOVE | `src/app/example/` → `src/app/(system)/example/` | Move example page |
| MODIFY | `src/app/layout.tsx` | Remove sidebar, make minimal |
| MODIFY | `src/app/(public)/page.tsx` | Replace with redirect |
| MODIFY | `src/layers/widgets/app-sidebar/lib/nav-items.ts` | Update Home link |

---

## Acceptance Criteria

### Functional Requirements

- [ ] Root layout contains only HTML structure, Providers, and CookieConsentBanner
- [ ] Homepage (`/`) redirects to `/system`
- [ ] System pages (`/system/*`) display with AppSidebar
- [ ] Design system (`/system/ui/*`) displays with its own ShowcaseSidebar
- [ ] Public pages (`/privacy`, `/terms`, `/cookies`) display without sidebar
- [ ] Authenticated pages (`/dashboard`) work unchanged
- [ ] Auth pages (`/sign-in`, `/verify`) work unchanged

### Non-Regression Requirements

- [ ] All existing routes remain accessible at same URLs
- [ ] No console errors on any page
- [ ] Mobile navigation works on system pages
- [ ] Theme toggle works everywhere
- [ ] Cookie consent banner appears on all pages

### Template Usability

- [ ] Deleting `src/app/(public)/page.tsx` allows custom homepage
- [ ] Deleting `src/app/(system)/` removes all system content cleanly
- [ ] Clear comments guide template customization

---

## Testing Plan

### Manual Testing

1. **Homepage redirect:** Visit `/` → verify redirect to `/system`
2. **System pages:** Navigate all `/system/*` routes, verify sidebar
3. **Design system:** Navigate `/system/ui/*`, verify custom sidebar
4. **Public pages:** Visit `/privacy`, `/terms`, `/cookies`, verify no sidebar
5. **Auth flow:** Sign in/out, verify works unchanged
6. **Mobile:** Test responsive behavior on system and public pages
7. **Theme:** Toggle theme on various pages

### Edge Cases

- Direct navigation to `/system/ui` (should use ShowcaseLayout, not AppSidebar)
- Browser back/forward through redirects
- Opening links in new tabs

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Route group nesting breaks `/system/ui` layout | Low | High | Test design system pages after each phase |
| Missing provider context in some routes | Medium | Medium | Verify no console errors after root layout changes |
| Navigation links break | Low | Low | Update nav-items.ts, test all links |

---

## Open Questions

None - all clarifications resolved in ideation phase.

---

## Dependencies

- No external dependencies
- No database changes
- No API changes

---

## Rollback Plan

If issues arise:
1. Revert file moves (`git checkout -- src/app/system/`)
2. Restore original root layout
3. Restore original homepage

The changes are isolated to layout structure with no data implications.
