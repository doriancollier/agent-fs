# App Navigation and Layout Structure

**Slug:** app-navigation-layout
**Author:** Claude Code
**Date:** 2025-12-09
**Branch:** preflight/app-navigation-layout
**Roadmap ID:** 550e8400-e29b-41d4-a716-446655440020
**Related:** Roadmap item "App navigation and layout structure"

---

## 1) Intent & Assumptions

**Task Brief:**
Create the navigation shell and page structure to support all MVP features. Establish routes for Dashboard (/), Transactions (/transactions), and Accounts (/accounts). Add a persistent navigation sidebar or header. Features not yet implemented should show placeholder pages. This unblocks parallel feature development by giving each feature a proper home.

**Target Users:** All users navigating between app sections

**Pain Points Addressed:**
- Single page getting cluttered with too much content
- No clear home for transaction list
- Account management mixed with insights

**Assumptions:**
- The app will use the existing Shadcn sidebar component (already installed)
- Navigation needs to work on both desktop (sidebar) and mobile (drawer pattern)
- MVP scope limits to exactly 3 pages: Dashboard, Transactions, Accounts
- Existing components on the current home page should be redistributed to appropriate pages
- The navigation component will be part of the root layout to persist across pages
- No authentication/protected routes in this phase

**Out of Scope:**
- Additional pages beyond the 3 MVP routes
- User settings or profile pages
- Breadcrumb navigation
- Deep linking or complex routing patterns
- Authentication/protected routes
- Nested navigation or submenus

**Success Criteria:**
- Clear navigation between 3 main areas
- Each MVP feature has a designated location
- Placeholder pages for unbuilt features
- Mobile-responsive navigation pattern

**Constraints:**
- MVP scope: 3 pages max
- Must support mobile navigation pattern

---

## 2) Pre-reading Log

| File | Takeaway |
|------|----------|
| `src/app/layout.tsx` | Root layout with GeistSans/Mono fonts, Providers wrapper, no navigation currently |
| `src/app/page.tsx` | Current home page has header, AlertBanner, MonthlySummaryCard, PlaidLinkButton, SyncButton, AccountsList, TransactionsList - all on one page |
| `src/app/providers.tsx` | Client providers: QueryClient, ThemeProvider - navigation state could live here |
| `src/components/ui/sidebar.tsx` | Full Shadcn sidebar component already installed (730 lines) with SidebarProvider, mobile drawer support, keyboard shortcuts |
| `src/components/ui/sheet.tsx` | Sheet component for mobile drawer, used by sidebar internally |
| `src/hooks/use-mobile.ts` | `useIsMobile()` hook at 768px breakpoint - used by sidebar |
| `src/app/globals.css` | Sidebar CSS variables already defined (--sidebar, --sidebar-foreground, etc.) |
| `src/app/accounts-list.tsx` | Client component using TanStack Query, displays AccountCard components |
| `src/app/transactions-list.tsx` | Client component with infinite scroll, displays transaction table with detail modal |
| `developer-guides/08-styling-theming.md` | Calm Tech design philosophy, breakpoints at md:768px |
| `CLAUDE.md` | FSD architecture: app -> widgets -> features -> entities -> shared |

---

## 3) Codebase Map

**Primary Components/Modules:**
| Path | Role |
|------|------|
| `src/app/layout.tsx` | Root layout - will wrap with SidebarProvider |
| `src/app/page.tsx` | Home/Dashboard - redistribute content |
| `src/components/ui/sidebar.tsx` | Shadcn sidebar with mobile support |
| `src/app/accounts-list.tsx` | Account listing - move to /accounts |
| `src/app/transactions-list.tsx` | Transaction listing - move to /transactions |

**Shared Dependencies:**
| Dependency | Usage |
|------------|-------|
| `ThemeProvider` | Dark mode toggle in sidebar |
| `QueryClientProvider` | Data fetching in all pages |
| `useIsMobile()` | Sidebar responsive behavior |
| `cn()` | Conditional class merging |

**Data Flow:**
```
Layout (SidebarProvider)
  -> Sidebar (navigation)
  -> SidebarInset (main content)
    -> Page content (Dashboard | Transactions | Accounts)
      -> Client components with TanStack Query
```

**Feature Flags/Config:**
- None currently; navigation could add route-based feature flags later

**Potential Blast Radius:**
- `src/app/layout.tsx` - Major change (wrap with sidebar)
- `src/app/page.tsx` - Significant change (redistribute content)
- New files: `src/app/transactions/page.tsx`, `src/app/accounts/page.tsx`
- May need to move `accounts-list.tsx` and `transactions-list.tsx` to features layer

---

## 4) Root Cause Analysis

*Not applicable - this is a new feature, not a bug fix.*

---

## 5) Research

### Potential Solutions

#### Option A: Sidebar Navigation with Shadcn Sidebar (Recommended)

**Description:** Use the existing Shadcn sidebar component to create a persistent left sidebar on desktop that converts to a mobile drawer.

**Pros:**
- Already installed in codebase (no new dependencies)
- Built-in responsive behavior (desktop sidebar, mobile drawer)
- Cookie-based state persistence across sessions
- Keyboard shortcuts (Cmd+B/Ctrl+B) out of the box
- Composable architecture with 15+ sub-components
- Sidebar CSS variables already defined in globals.css
- Users scan left-side content 80% of the time (UX research)
- Better scalability for adding future features

**Cons:**
- More complex initial setup than header nav
- Takes horizontal space on narrow screens
- Slight learning curve for sub-component composition

**Bundle Impact:** Already included (~15KB gzipped)

#### Option B: Top Header Navigation

**Description:** Add navigation links to the existing header bar.

**Pros:**
- Simpler implementation
- Familiar pattern for users
- Doesn't consume horizontal space

**Cons:**
- Less scalable for additional routes
- Needs separate mobile menu implementation
- Current header is simple; would need redesign
- Not ideal for dashboard applications

**Bundle Impact:** Minimal additional code

#### Option C: Hybrid (Sidebar + Header)

**Description:** Sidebar for main navigation, header for secondary actions/search.

**Pros:**
- Maximum flexibility
- Separates navigation from actions
- Scales well for complex apps

**Cons:**
- Overkill for 3 routes
- More complex to implement
- May feel heavy for MVP

### Recommendation

**Option A: Sidebar Navigation with Shadcn Sidebar**

Rationale:
1. **Already installed** - No new dependencies, sidebar.tsx is ready
2. **CSS tokens ready** - globals.css has sidebar color variables
3. **Mobile support built-in** - Uses Sheet component for drawer
4. **UX research supports** - Sidebar is preferred for dashboard apps
5. **Scalable** - Easy to add more routes later
6. **State management included** - SidebarProvider handles open/close state

### Implementation Approach

```
src/
├── app/
│   ├── layout.tsx           # Wrap with SidebarProvider
│   ├── page.tsx             # Dashboard (MonthlySummary, overview)
│   ├── transactions/
│   │   └── page.tsx         # Transactions page
│   └── accounts/
│       └── page.tsx         # Accounts page
└── layers/
    └── widgets/
        └── app-sidebar/
            ├── ui/
            │   └── AppSidebar.tsx   # Navigation sidebar
            └── index.ts
```

### Mobile Pattern

The Shadcn sidebar automatically:
- Shows as permanent sidebar on md+ screens
- Shows as drawer overlay on mobile
- Uses Sheet component with swipe support
- Closes automatically after route selection (with minor addition)

---

## 6) Clarification

1. **Navigation visual style:** Should the sidebar be always expanded, or collapsible to icon-only mode on desktop?
   - Options: Always expanded | Collapsible to icons | Floating (overlay)

2. **Page content distribution:**
   - **Dashboard (/)**: Keep MonthlySummaryCard + quick actions (PlaidLink, Sync)?
   - **Transactions (/transactions)**: Full TransactionsList with filters?
   - **Accounts (/accounts)**: Full AccountsList with management actions?

3. **App branding in sidebar:** Should the sidebar header show "Dunny" logo/text and/or user avatar?

4. **Active state indicator:** How should the active route be highlighted? (Background color, left border, bold text?)

5. **Mobile trigger location:** Where should the hamburger menu button appear on mobile? (Top-left header, floating button?)

---

## 7) Next Steps

After clarification, proceed with `/ideate-to-spec` to generate a detailed specification, then:

1. Create AppSidebar widget in FSD structure
2. Update root layout with SidebarProvider + Sidebar + SidebarInset
3. Create /transactions and /accounts route directories
4. Redistribute components from current page.tsx to appropriate routes
5. Add active state styling to nav items
6. Test mobile drawer behavior
