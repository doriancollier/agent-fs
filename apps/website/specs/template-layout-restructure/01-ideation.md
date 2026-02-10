---
slug: template-layout-restructure
---

# Template Layout Restructure

**Slug:** template-layout-restructure
**Author:** Claude Code
**Date:** 2026-02-01
**Branch:** preflight/template-layout-restructure
**Related:** N/A

---

## 1) Intent & Assumptions

**Task brief:** Restructure the application so that main layouts are minimal/replaceable, the current homepage either displays or redirects to `/system`, and the sidebar is moved into the system layout. This enables template users to easily customize their homepage while preserving the system dashboard.

**Assumptions:**
- The `/system` route group should contain all system-specific UI (sidebar, dashboard)
- Template users will replace the public homepage and layout with their own content
- The system pages should remain fully functional when accessed via `/system`
- A full page reload when navigating from `/` to `/system` is acceptable
- The existing authentication flow should not be affected

**Out of scope:**
- Changing authentication flows
- Modifying the actual system dashboard functionality
- Creating new system features
- Changing the design system showcase (`/system/ui`) - it already has its own layout

---

## 2) Pre-reading Log

- `src/app/layout.tsx`: Root layout with SidebarProvider wrapping everything. Renders AppSidebar and SidebarInset containing MobileHeader and main children. Handles sidebar state from cookies.
- `src/app/providers.tsx`: Client provider wrapping QueryClient, ThemeProvider, and ReactQueryDevtools.
- `src/app/(public)/layout.tsx`: Public route group layout rendering PublicFooter with flexible main content area.
- `src/app/(public)/page.tsx`: Homepage (/) with welcome, quick start, and tech stack cards. Links to `/system` and `/system/ui`.
- `src/app/(authenticated)/layout.tsx`: Protected layout checking session, redirecting to `/sign-in` if not authenticated.
- `src/app/system/ui/layout.tsx`: Design system showcase layout with ShowcaseSidebar and ShowcaseHeader components.
- `src/layers/widgets/app-sidebar/`: Contains AppSidebar, MobileHeader, NavMain, and nav-items definitions.
- `src/layers/widgets/app-sidebar/lib/nav-items.ts`: Navigation configuration with navItems (Home, Example) and systemNavItems.
- `src/layers/widgets/app-sidebar/ui/NavMain.tsx`: Main navigation component with collapsible "Template" group.
- `src/app/system/ui/_components/ShowcaseSidebar.tsx`: Custom sidebar for design system showcase with scroll spy navigation.

---

## 3) Codebase Map

**Current Layout Hierarchy:**

```
Root (src/app/layout.tsx) ← Contains SidebarProvider + AppSidebar (PROBLEM: too much here)
├── (public) route group (src/app/(public)/layout.tsx)
│   └── / (homepage) - currently wrapped in sidebar
│
├── (authenticated) route group (src/app/(authenticated)/layout.tsx)
│   └── /dashboard (protected page)
│
├── (auth) route group [implicit, no layout file found]
│   ├── /sign-in
│   └── /verify
│
├── /system route [NOT a route group, regular directory]
│   ├── /system page.tsx
│   ├── /system/claude-code page.tsx
│   └── /system/ui/ [has custom layout!]
│       ├── layout.tsx (ShowcaseLayout with ShowcaseSidebar)
│       └── pages...
│
└── /api route group (implicit)
```

**Primary Components/Modules:**
- `src/app/layout.tsx` - Root layout with sidebar (needs to be minimal)
- `src/app/(public)/layout.tsx` - Public layout with footer
- `src/app/(public)/page.tsx` - Homepage (will redirect to /system)
- `src/layers/widgets/app-sidebar/` - Sidebar widget (needs to move to system layout)

**Shared Dependencies:**
- `src/lib/utils.ts` - cn utility for class merging
- `src/app/providers.tsx` - Query client, theme provider
- `@/components/ui/sidebar` - Shadcn sidebar components

**Data Flow:**
Root Layout → SidebarProvider → AppSidebar → NavMain → Navigation Items

**Potential Blast Radius:**
- Direct: 3 files (root layout, public layout, homepage)
- Indirect: System pages may need layout adjustments
- New files: System route group layout

---

## 4) Root Cause Analysis

N/A - This is a restructuring task, not a bug fix.

---

## 5) Research

### Potential Solutions

**1. Redirect Homepage to /system (Recommended)**

Server-side redirect from `/` to `/system`:

```typescript
// app/page.tsx (or app/(public)/page.tsx)
import { redirect } from 'next/navigation'

export default function HomePage() {
  redirect('/system')
}
```

**Pros:**
- Simplest implementation (3 lines of code)
- Clear separation - homepage is just a redirect
- Easy to replace - users can delete the redirect and build their own homepage
- SEO-friendly - 307 redirect is understood by search engines

**Cons:**
- Full page reload if `/system` uses a different root layout
- Extra HTTP round-trip (307 redirect response)
- URL changes - users see `/system` instead of `/`

**Complexity:** Low

---

**2. Render System Page Component Directly**

Import and render the system page component in homepage:

```typescript
// app/page.tsx
import SystemPage from '@/app/system/page'

export default function HomePage() {
  return <SystemPage />
}
```

**Pros:**
- No URL change - stays at `/`
- No HTTP redirect overhead
- Can share component between routes

**Cons:**
- Sidebar won't show without manual inclusion (layout doesn't apply)
- Code duplication if you need sidebar on homepage
- Confusing for template users - two routes showing same content
- Maintenance burden - changes to `/system` must consider homepage impact

**Complexity:** Medium (needs careful layout handling)

---

**3. Conditional Rendering with Client Navigation**

Client-side redirect using router.push():

```typescript
'use client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function HomePage() {
  const router = useRouter()
  useEffect(() => { router.push('/system') }, [router])
  return <div>Loading...</div>
}
```

**Pros:**
- Client-side navigation - potentially smoother
- Can show loading state during navigation

**Cons:**
- Flash of loading content before redirect
- Not SEO-friendly - crawlers see loading state
- Requires client component - no server-side optimization
- Unnecessary complexity for a simple redirect

**Complexity:** Medium-High

---

### Industry Best Practices

**Route Groups for Layout Separation:**
- Use `(system)` route group for admin/dashboard UI
- Use `(public)` route group for marketing/landing pages
- Root layout should be minimal (HTML, providers, globals only)

**Template Customization Pattern:**
Modern Next.js boilerplates focus on "delete to customize":
1. Delete entire route groups (`(system)`, `(marketing)`)
2. Replace homepage with own content
3. Keep core infrastructure (auth, DB, forms) intact

### Recommendation

**Recommended Approach:** Option 1 (Redirect to /system) with minimal root layout and route-group-specific layouts

**Rationale:**
1. Maximum flexibility - Users can delete the entire `(system)` route group
2. Clear separation - Root layout is truly minimal
3. Easy to understand - Simple redirect makes intention obvious
4. Low complexity - Minimal code, fewer edge cases
5. Template-friendly - Clear comments guide customization

---

## 6) Clarification

1. **System route group naming**: Should we use `(system)` as a route group (URL stays `/system`) or rename to something else? Current proposal keeps `/system` as the URL path.

2. **Authentication for system routes**: Should the system layout require authentication? Currently the `/system` pages appear to be public. The `(authenticated)` group is separate with `/dashboard`.

3. **Existing /example route**: There's a `/example` route in the nav items. Should this move into the system route group or stay separate?

4. **Cookie consent banner placement**: The CookieConsentBanner is currently in the root layout. Should it stay in root (appears everywhere) or move to specific layouts?

5. **Mobile header behavior**: The MobileHeader is currently in the root layout's SidebarInset. When moving sidebar to system layout, should mobile header also move, or should there be a different mobile experience for public pages?

---

## 7) Proposed File Structure

```
app/
├── layout.tsx                    # MINIMAL: HTML, providers, globals only
├── page.tsx                      # Redirects to /system (or delete for custom homepage)
├── providers.tsx                 # Client providers (theme, query, auth)
├── globals.css                   # Global styles
│
├── (system)/                     # NEW: System route group with sidebar
│   ├── layout.tsx               # System layout with AppSidebar
│   └── system/                  # Actual /system path
│       ├── page.tsx            # System overview
│       ├── claude-code/
│       │   └── page.tsx
│       └── ui/                  # Design system (keeps its own layout)
│           ├── layout.tsx      # ShowcaseLayout
│           └── [pages...]
│
├── (public)/                     # Public routes (optional, for future use)
│   ├── layout.tsx               # Public layout with footer only
│   ├── cookies/
│   ├── privacy/
│   └── terms/
│
├── (authenticated)/              # Protected routes
│   ├── layout.tsx               # Auth check
│   └── dashboard/
│
├── (auth)/                       # Auth pages
│   ├── sign-in/
│   └── verify/
│
└── api/                          # API routes (unchanged)
```

**Key Changes:**
1. Root layout becomes minimal (no sidebar)
2. New `(system)` route group with sidebar in its layout
3. Homepage redirects to `/system`
4. Public routes keep footer-only layout
5. Design system `/system/ui` keeps its custom layout

---

## 8) Implementation Steps

### Phase 1: Create System Route Group
1. Create `app/(system)/layout.tsx` with SidebarProvider and AppSidebar
2. Move system pages into `app/(system)/system/` directory
3. Ensure design system layout (`/system/ui`) still works

### Phase 2: Simplify Root Layout
1. Remove SidebarProvider, AppSidebar, MobileHeader from root layout
2. Keep only: HTML structure, Providers, CookieConsentBanner, globals.css

### Phase 3: Update Homepage
1. Replace current homepage with redirect to `/system`
2. Add clear comment for template users

### Phase 4: Update Public Layout
1. Ensure public layout works without sidebar context
2. Keep footer, remove any sidebar dependencies

### Phase 5: Verify & Test
1. Verify all navigation works
2. Verify authentication flow unaffected
3. Verify design system showcase works
4. Test mobile experience
