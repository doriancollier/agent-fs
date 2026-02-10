# Design System Showcase

**Slug:** design-system-showcase
**Author:** Claude Code
**Date:** 2025-12-21
**Branch:** preflight/design-system-showcase
**Related:** N/A

---

## 1) Intent & Assumptions

- **Task brief:** Build a comprehensive design system showcase page (or series of pages) at `/system/ui` that demonstrates all Shadcn components, typography hierarchy, color palette, tables, search, pagination, and other UI patterns. The showcase should be well-organized and serve as internal documentation for the design system.

- **Assumptions:**
  - This is an internal documentation/showcase tool, not a public-facing marketing page
  - The showcase should use the existing Calm Tech design system tokens and patterns
  - All 50+ Shadcn UI components in `src/components/ui/` should be demonstrated
  - The showcase itself should exemplify the design system's principles (generous spacing, soft depth, clarity)
  - Server Components should be used where possible for performance
  - Navigation within the showcase should be intuitive (likely sidebar + anchor links)
  - The showcase will be accessible at `/system/ui` with sub-routes for different sections

- **Out of scope:**
  - Storybook or external documentation tooling
  - Live code editing/playground (code snippets shown as static examples)
  - Design token exports or Figma integration
  - Component prop documentation via JSDoc parsing
  - Search functionality across the showcase (may add later)
  - Mobile-first responsive testing tools

---

## 2) Pre-reading Log

- `docs/DESIGN_SYSTEM.md`: Complete design language spec - typography scale (Major Third 1.25), color system (OKLCH), spacing (8px base), border radius rules, shadow system, animation timing
- `developer-guides/08-styling-theming.md`: Tailwind v4 CSS-first config, dark mode via `class` strategy, cn() utility patterns
- `src/app/globals.css`: Full implementation of design tokens - colors, shadows, custom utilities (shadow-soft, glass, container-narrow, etc.)
- `src/components/ui/button.tsx`: Button variants (default, destructive, outline, secondary, ghost, link) and sizes (sm, default, lg, icon variants)
- `src/components/ui/card.tsx`: Card pattern with Header, Title, Description, Action, Content, Footer slots
- `src/components/ui/table.tsx`: Table components with hover states, rounded container, proper cell padding
- `src/components/ui/pagination.tsx`: Pagination with Previous/Next and ellipsis support
- `src/components/ui/input.tsx`: Input with focus ring styling, aria-invalid states
- `src/components/ui/badge.tsx`: Badge variants with render prop for composition
- `src/components/ui/dialog.tsx`: Base UI Dialog with Portal, Overlay, Close button
- `src/components/ui/tabs.tsx`: Base UI Tabs with trigger styling
- `src/components/ui/form.tsx`: React Hook Form integration with FormField, FormControl, FormMessage
- `src/components/ui/select.tsx`: Select with Positioner pattern, scroll arrows
- `src/components/ui/accordion.tsx`: Accordion with collapse/expand animations
- `src/components/ui/alert.tsx`: Alert variants (default, destructive, success, warning, info)
- `src/components/ui/progress.tsx`: Progress with Track, Indicator, Label, Value
- `src/components/ui/switch.tsx`: Switch toggle with thumb
- `src/components/ui/tooltip.tsx`: Tooltip with Positioner pattern and Arrow
- `src/components/ui/checkbox.tsx`: Checkbox with CheckIcon indicator
- `src/components/ui/radio-group.tsx`: RadioGroup with RadioGroupItem
- `src/components/ui/slider.tsx`: Slider with multi-thumb support

---

## 3) Codebase Map

- **Primary components/modules:**
  - `src/components/ui/` - 50+ Shadcn UI components built on Base UI primitives
  - `src/app/globals.css` - Design tokens and custom utilities
  - `docs/DESIGN_SYSTEM.md` - Design language specification

- **Shared dependencies:**
  - `@/lib/utils` - `cn()` class merging utility
  - `class-variance-authority` - Component variants (cva)
  - `@base-ui/react` - Unstyled component primitives
  - `lucide-react` - Icon library
  - `next-themes` - Theme switching (dark mode)

- **Data flow:**
  - Static content → Server Components render showcase sections
  - Theme toggle → Client Component uses `useTheme()` for dark/light mode demo
  - Client interactions (accordion, tabs, dialogs) → Client Components with Base UI

- **Feature flags/config:**
  - None specific - standard Next.js App Router setup

- **Potential blast radius:**
  - New route at `src/app/system/ui/` - isolated from existing pages
  - May import all UI components (intentional for showcase)
  - No changes to existing components needed

---

## 4) Root Cause Analysis

N/A - This is a new feature, not a bug fix.

---

## 5) Research

### Potential Solutions

**1. Single Long Page with Anchor Navigation**
- All sections on one page with sticky sidebar navigation
- Pros: Simple URL structure, fast to navigate between sections, single page load, easy Cmd+F search
- Cons: Heavy initial load with all components, hard to deep-link, poor for large libraries (50+ components)

**2. Multi-Page with Route Segments (Component-Per-Page)**
- Separate pages: `/system/ui/typography`, `/system/ui/colors`, `/system/ui/buttons`, etc.
- Pros: Fast page loads, deep linkable URLs, better SEO, works for any library size
- Cons: More files to maintain, requires good sidebar/search UX

**3. Hybrid: Grouped Route Segments**
- Group similar components: `/system/ui/foundations` (typography, colors, spacing), `/system/ui/components` (all components), `/system/ui/patterns` (tables, forms)
- Pros: Balances code splitting with navigation, logical grouping, manageable file count
- Cons: Moderate complexity

### Organization Patterns (from industry research)

| Design System | Navigation Pattern | Code Display | Key Insight |
|--------------|-------------------|--------------|-------------|
| Shadcn UI | Sidebar + separate pages | Copy-paste code | Emphasis on customization |
| Carbon Design | Foundation → Components → Patterns | Usage guidance + anatomy diagrams | "When to use" not just "how" |
| Material UI | Sidebar + tabs per component | Live editable demos | Aggressive categorization |
| Radix Themes | Sidebar + anchor sections | Minimal examples | Developer-focused |

### Industry Best Practices (from 60+ sources)

**Documentation Structure Per Component:**
1. Overview/Introduction (brief description + hero demo)
2. Installation/Setup (imports, dependencies)
3. Basic Example (simplest implementation + copy button)
4. Variants/States (visual grid of all options)
5. Props API (auto-generated from TypeScript)
6. Accessibility (keyboard nav, ARIA, screen reader notes)
7. Related Components (links to complementary components)

**Key Principles:**
- Start with high-impact, high-confusion components first
- Document the "why" not just the "how"
- Accessibility is non-negotiable (WCAG AA minimum)
- Make it interactive - live demos beat static images

### Key Sections to Include

1. **Foundations**
   - Typography (type scale, font families, weights, line heights)
   - Colors (palette swatches, semantic tokens, dark mode, WCAG compliance)
   - Spacing & Layout (8pt grid, spacing scale, container widths)
   - Shadows & Effects (elevation levels, glass utilities)
   - Border Radius (scale with visual examples)
   - Icons (Lucide usage patterns)

2. **Components** (grouped by function)
   - Actions: Button, ButtonGroup, Toggle, ToggleGroup
   - Forms: Input, Textarea, Select, Checkbox, Radio, Switch, Slider, Form
   - Feedback: Alert, Progress, Skeleton, Spinner, Sonner/Toast
   - Overlay: Dialog, Sheet, Popover, Tooltip, HoverCard, DropdownMenu
   - Navigation: Tabs, Accordion, NavigationMenu, Breadcrumb, Pagination
   - Data Display: Table, Card, Badge, Avatar, Separator
   - Layout: ScrollArea, AspectRatio, Collapsible, Resizable

3. **Patterns**
   - Data Table with sorting, filtering, pagination
   - Form with validation (React Hook Form + Zod)
   - Card layouts and grids
   - Empty states
   - Loading states

### Implementation Approach

**Recommended: Hybrid (Option 3) with TSX Pages (not MDX)**

Given this is an internal showcase and all content is component demos, using pure TSX pages is simpler than MDX:

```
/system/ui                     → Overview/index (intro + quick links)
/system/ui/foundations         → Typography, Colors, Spacing, Shadows (anchor sections)
/system/ui/components          → All components in categorized sections (anchor sections)
/system/ui/patterns            → Tables, Forms, Cards, States (anchor sections)
```

**Why TSX over MDX for this use case:**
- All content is React components (not prose documentation)
- No need for markdown parsing overhead
- Easier to maintain component demos inline
- Still get code splitting via route segments

**Key Features to Build:**
- `ComponentPreview` - Preview + Code tabs with copy button
- `ColorSwatch` - Color display with hex/oklch values + copy
- `TypeScale` - Typography hierarchy visualization
- `SpacingScale` - Visual spacing ruler
- Sidebar navigation with scroll spy
- Theme toggle (prominent, for demo purposes)

**Rationale:**
- Three logical groupings match how developers think about design systems
- Code splitting keeps pages performant
- Each page uses anchor links for sub-sections within long pages
- Sidebar navigation across all pages
- Server Components for static content, Client Components only where needed

---

## 6) Clarification

1. **Code snippet display:** Should we include copy-to-clipboard functionality for code examples, or keep it simpler with static code blocks?

2. **Theme toggle:** Should the showcase include a prominent theme toggle to demonstrate light/dark modes, or assume users have already set their preference?

3. **Component state demos:** For interactive components (dialogs, accordions, etc.), should we show them in all states (open, closed, loading), or just provide interactive demos users can click?

4. **Search functionality:** Is search within the showcase a must-have for v1, or can it be added later?

5. **Print/export:** Any need for print-friendly styles or the ability to export the design system documentation?

6. **Protected route:** Should `/system/ui` be publicly accessible or behind authentication (admin-only)?
