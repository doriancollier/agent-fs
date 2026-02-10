# Design System Showcase

**Status:** Draft
**Authors:** Claude Code
**Date:** 2025-12-22
**Slug:** design-system-showcase

---

## Overview

Build a visual design system showcase at `/system/ui` that serves as a reference for humans and AI coding agents. The showcase demonstrates all 53 Shadcn UI components, typography hierarchy, color palette, and UI patterns through interactive visual demos.

**Key Insight:** This is a visual-only showcase - no code display is needed because AI agents will read actual source files for code examples. The focus is on demonstrating how components look and behave.

---

## Background/Problem Statement

The project has 53+ UI components in `src/components/ui/` built on the Calm Tech design system, but there's no centralized way to:

1. **See all components** - Developers must read source files to understand what's available
2. **Understand design tokens** - Colors, typography, and spacing are defined in CSS but not visually documented
3. **Demo interactions** - Interactive components (dialogs, accordions) require building test pages
4. **Onboard new developers/AI agents** - No visual reference for the design language

A showcase page solves this by providing a living reference that stays in sync with actual components.

---

## Goals

- Demonstrate all 53 UI components with interactive examples
- Visualize the complete design token system (colors, typography, spacing, shadows, radii)
- Provide pattern examples for common UI compositions (data tables, forms, cards)
- Support theme switching to show light/dark mode behavior
- Enable quick navigation via sidebar with scroll spy
- Serve as visual reference for both humans and AI coding agents

---

## Non-Goals

- **No code display** - AI agents read source files directly
- **No live code editing** - Static visual demos only
- **No search functionality** - Simple sidebar navigation is sufficient
- **No prop documentation** - TypeScript types serve as documentation
- **No authentication** - Public access to showcase
- **No print/export** - Web-only viewing

---

## Technical Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| `next` | 16.x | App Router for routing |
| `next-themes` | 0.4.x | Theme switching |
| `lucide-react` | 0.468.x | Icons |
| `@base-ui/react` | 1.x | Component primitives |
| `class-variance-authority` | 0.7.x | Variant styling |

All components already exist in `src/components/ui/` - no new dependencies needed.

---

## Detailed Design

### Route Structure

```
src/app/system/ui/
├── layout.tsx              # Shared layout with sidebar + theme toggle
├── page.tsx                # Overview with quick links
├── foundations/
│   └── page.tsx            # Typography, Colors, Spacing, Shadows, Radii, Icons
├── components/
│   └── page.tsx            # All 53 components by category
└── patterns/
    └── page.tsx            # Data tables, forms, cards, states
```

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Layout (layout.tsx)                       │
│  ┌──────────────┐  ┌─────────────────────────────────────────┐  │
│  │   Sidebar    │  │              Main Content               │  │
│  │              │  │  ┌─────────────────────────────────────┐│  │
│  │ • Overview   │  │  │ Header (Theme Toggle)               ││  │
│  │ • Foundations│  │  ├─────────────────────────────────────┤│  │
│  │ • Components │  │  │                                     ││  │
│  │ • Patterns   │  │  │ Page Content (children)             ││  │
│  │              │  │  │                                     ││  │
│  │ Scroll Spy   │  │  │ - Section anchors                   ││  │
│  │ Active State │  │  │ - Component demos                   ││  │
│  │              │  │  │ - Interactive elements              ││  │
│  └──────────────┘  │  └─────────────────────────────────────┘│  │
│                    └─────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### File Organization

```
src/app/system/ui/
├── layout.tsx              # ShowcaseLayout with sidebar
├── page.tsx                # Overview page
├── foundations/page.tsx    # Foundations showcase
├── components/page.tsx     # Components showcase
├── patterns/page.tsx       # Patterns showcase
└── _components/            # Showcase-specific helpers
    ├── ShowcaseSidebar.tsx # Navigation sidebar
    ├── ShowcaseHeader.tsx  # Header with theme toggle
    ├── ComponentSection.tsx # Section wrapper with anchor
    ├── ComponentGrid.tsx   # Grid for variant demos
    ├── ColorSwatch.tsx     # Color display component
    ├── TypeScale.tsx       # Typography visualization
    └── SpacingScale.tsx    # Spacing ruler
```

### Helper Component Specifications

#### 1. ShowcaseSidebar

```tsx
// Navigation sidebar with scroll spy
interface ShowcaseSidebarProps {
  sections: {
    title: string
    href: string
    items?: { title: string; href: string }[]
  }[]
}
```

Features:
- Collapsible on mobile
- Scroll spy for active section highlighting
- Anchor links within pages (e.g., `#typography`, `#colors`)

#### 2. ComponentSection

```tsx
// Wrapper for each section with anchor link
interface ComponentSectionProps {
  id: string           // Anchor ID
  title: string        // Section heading
  description?: string // Optional description
  children: ReactNode  // Section content
}
```

Renders:
- `h2` with anchor link
- Optional description text
- Content with consistent spacing

#### 3. ComponentGrid

```tsx
// Grid layout for showing variants
interface ComponentGridProps {
  cols?: 2 | 3 | 4      // Column count (default: 3)
  gap?: 'sm' | 'md' | 'lg' // Gap size (default: 'md')
  children: ReactNode
}
```

#### 4. ColorSwatch

```tsx
// Color display with values
interface ColorSwatchProps {
  name: string          // Token name (e.g., "primary")
  cssVar: string        // CSS variable (e.g., "--primary")
  description?: string  // Usage description
}
```

Displays:
- Color preview square
- Token name
- OKLCH value from CSS variable
- Computed hex value

#### 5. TypeScale

```tsx
// Typography hierarchy visualization
// No props - reads from design tokens
```

Shows:
- All heading levels (h1-h4)
- Body text sizes
- Font weights
- Code font (Geist Mono)

#### 6. SpacingScale

```tsx
// Visual spacing ruler
// No props - reads from Tailwind spacing scale
```

Shows:
- Spacing values with visual bars
- Pixel values
- Tailwind class names

### Page Specifications

#### Overview Page (`/system/ui`)

Content:
- Hero section with title "Design System"
- Brief intro to Calm Tech philosophy
- Quick link cards to each section
- Component count summary

#### Foundations Page (`/system/ui/foundations`)

Sections:
1. **Typography** (`#typography`)
   - Heading scale (h1-h4) with actual rendered examples
   - Body text (base, sm, xs)
   - Font weights (400, 500, 600, 700)
   - Code text (Geist Mono)
   - Line heights and letter spacing

2. **Colors** (`#colors`)
   - Core palette: background, foreground, card, popover
   - Action colors: primary, secondary, accent
   - Semantic colors: destructive, success, warning, info
   - Muted colors: muted, muted-foreground
   - Border/input colors
   - Chart colors (1-5)
   - Sidebar colors

3. **Spacing** (`#spacing`)
   - 8pt grid visualization
   - Spacing scale (0.5-24 in Tailwind units)
   - Common spacing patterns

4. **Shadows** (`#shadows`)
   - shadow-xs through shadow-xl
   - Custom utilities: shadow-soft, shadow-elevated, shadow-floating, shadow-modal
   - Applied to card examples

5. **Border Radius** (`#radius`)
   - radius-sm through radius-2xl
   - radius-full (pill)
   - Applied to button/card examples

6. **Icons** (`#icons`)
   - Common Lucide icons at different sizes (16, 20, 24, 32)
   - Icon naming convention

#### Components Page (`/system/ui/components`)

Categories with anchor sections:

1. **Actions** (`#actions`)
   - Button: all variants (default, destructive, outline, secondary, ghost, link)
   - Button: all sizes (sm, default, lg, icon, icon-sm, icon-lg)
   - ButtonGroup
   - Toggle, ToggleGroup

2. **Forms** (`#forms`)
   - Input (with states: default, focus, error, disabled)
   - Textarea
   - Select (with SelectItem examples)
   - Checkbox
   - RadioGroup
   - Switch
   - Slider (single and range)
   - Label
   - Form (complete example with validation feedback)

3. **Feedback** (`#feedback`)
   - Alert (all variants: default, destructive, success, warning, info)
   - Progress (with value examples)
   - Skeleton (various shapes)
   - Spinner

4. **Overlay** (`#overlay`)
   - Dialog (interactive open/close)
   - AlertDialog (interactive)
   - Sheet (sides: top, right, bottom, left)
   - Popover (interactive)
   - Tooltip (hover demo)
   - HoverCard (hover demo)
   - DropdownMenu (interactive)
   - ContextMenu (right-click demo)
   - Command (search palette demo)

5. **Navigation** (`#navigation`)
   - Tabs (interactive switching)
   - Accordion (interactive expand/collapse)
   - NavigationMenu
   - Breadcrumb
   - Pagination

6. **Data Display** (`#data-display`)
   - Table (with headers, rows, hover)
   - Card (all slots: Header, Title, Description, Action, Content, Footer)
   - Badge (all variants)
   - Avatar (with fallback)
   - Separator (horizontal and vertical)
   - Kbd (keyboard shortcut display)

7. **Layout** (`#layout`)
   - ScrollArea (with scrollable content)
   - AspectRatio (16:9, 4:3, 1:1 examples)
   - Collapsible (interactive)
   - Resizable (interactive panels)

#### Patterns Page (`/system/ui/patterns`)

Sections:

1. **Data Table** (`#data-table`)
   - Table with sortable headers (visual only)
   - Row hover states
   - Pagination component
   - Empty state example

2. **Form Pattern** (`#form-pattern`)
   - Complete form with:
     - Text inputs
     - Select dropdown
     - Checkbox/radio
     - Form validation feedback
     - Submit button

3. **Card Layouts** (`#card-layouts`)
   - Grid of cards (2, 3, 4 columns)
   - Card with image
   - Card with action buttons
   - Interactive card (hover effect)

4. **Empty States** (`#empty-states`)
   - Empty component usage
   - With icon, title, description, action

5. **Loading States** (`#loading-states`)
   - Skeleton patterns (card, list, form)
   - Spinner usage
   - Loading button state

### Layout Implementation

```tsx
// src/app/system/ui/layout.tsx
export default function ShowcaseLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <ShowcaseSidebar />
      <div className="flex-1">
        <ShowcaseHeader />
        <main className="container-wide py-8">
          {children}
        </main>
      </div>
    </div>
  )
}
```

### Navigation Structure

```typescript
const navigation = [
  {
    title: "Overview",
    href: "/system/ui",
  },
  {
    title: "Foundations",
    href: "/system/ui/foundations",
    items: [
      { title: "Typography", href: "/system/ui/foundations#typography" },
      { title: "Colors", href: "/system/ui/foundations#colors" },
      { title: "Spacing", href: "/system/ui/foundations#spacing" },
      { title: "Shadows", href: "/system/ui/foundations#shadows" },
      { title: "Border Radius", href: "/system/ui/foundations#radius" },
      { title: "Icons", href: "/system/ui/foundations#icons" },
    ],
  },
  {
    title: "Components",
    href: "/system/ui/components",
    items: [
      { title: "Actions", href: "/system/ui/components#actions" },
      { title: "Forms", href: "/system/ui/components#forms" },
      { title: "Feedback", href: "/system/ui/components#feedback" },
      { title: "Overlay", href: "/system/ui/components#overlay" },
      { title: "Navigation", href: "/system/ui/components#navigation" },
      { title: "Data Display", href: "/system/ui/components#data-display" },
      { title: "Layout", href: "/system/ui/components#layout" },
    ],
  },
  {
    title: "Patterns",
    href: "/system/ui/patterns",
    items: [
      { title: "Data Table", href: "/system/ui/patterns#data-table" },
      { title: "Form Pattern", href: "/system/ui/patterns#form-pattern" },
      { title: "Card Layouts", href: "/system/ui/patterns#card-layouts" },
      { title: "Empty States", href: "/system/ui/patterns#empty-states" },
      { title: "Loading States", href: "/system/ui/patterns#loading-states" },
    ],
  },
]
```

---

## User Experience

### Navigation Flow

1. User lands on `/system/ui` overview page
2. Clicks section in sidebar (e.g., "Foundations")
3. Page scrolls to section; sidebar highlights active item
4. User can click subsection (e.g., "Colors") for anchor navigation
5. Theme toggle in header allows light/dark comparison

### Interaction Patterns

- **Interactive components** (dialogs, accordions): Users click to see behavior
- **Hover components** (tooltips, hover cards): Users hover to see behavior
- **Context menu**: Right-click demo area to trigger
- **Forms**: Show validation states inline (not functional submit)

### Responsive Behavior

- **Desktop** (≥1024px): Fixed sidebar, full content area
- **Tablet** (768-1023px): Collapsible sidebar, narrower content
- **Mobile** (<768px): Hidden sidebar with hamburger trigger, stacked content

---

## Testing Strategy

### Manual Testing Checklist

1. **Route verification**
   - [ ] `/system/ui` renders overview
   - [ ] `/system/ui/foundations` renders all sections
   - [ ] `/system/ui/components` renders all component categories
   - [ ] `/system/ui/patterns` renders all patterns

2. **Navigation testing**
   - [ ] Sidebar links navigate correctly
   - [ ] Anchor links scroll to sections
   - [ ] Active state highlights current section
   - [ ] Mobile sidebar opens/closes

3. **Theme testing**
   - [ ] Theme toggle switches between light/dark
   - [ ] All components render correctly in both themes
   - [ ] Color swatches show correct values for each theme

4. **Component demos**
   - [ ] Interactive components respond to clicks
   - [ ] Hover states work correctly
   - [ ] All 53 components are displayed

### Visual Regression Testing (Future)

When adding visual regression testing:
- Capture screenshots of each section
- Compare against baseline on theme changes
- Test responsive breakpoints

---

## Performance Considerations

### Optimizations

1. **Server Components** - All static sections render on server
2. **Client Islands** - Only interactive components use 'use client'
3. **Code Splitting** - Each page is a separate route segment
4. **Lazy Loading** - Consider for overlay component demos

### Expected Performance

- Initial load: < 1s (mostly static content)
- Route transitions: Instant (client-side navigation)
- Interaction response: < 100ms

---

## Security Considerations

- **Public access** - No sensitive data exposed
- **No forms submit** - Demo forms don't post data
- **No external requests** - All content is local

---

## Documentation

### What This Creates

This showcase **is** the documentation. No additional docs needed because:
- Visual examples demonstrate usage
- AI agents read source files for code patterns
- TypeScript types provide prop documentation

### Updates Required

When new components are added to `src/components/ui/`:
1. Add demo to appropriate category in `/system/ui/components`
2. Update navigation if new category needed

---

## Implementation Phases

### Phase 1: Foundation

**Files to create:**
- `src/app/system/ui/layout.tsx`
- `src/app/system/ui/page.tsx`
- `src/app/system/ui/_components/ShowcaseSidebar.tsx`
- `src/app/system/ui/_components/ShowcaseHeader.tsx`
- `src/app/system/ui/_components/ComponentSection.tsx`

**Deliverables:**
- Working layout with sidebar navigation
- Theme toggle functionality
- Overview page with quick links

### Phase 2: Foundations

**Files to create:**
- `src/app/system/ui/foundations/page.tsx`
- `src/app/system/ui/_components/ColorSwatch.tsx`
- `src/app/system/ui/_components/TypeScale.tsx`
- `src/app/system/ui/_components/SpacingScale.tsx`

**Deliverables:**
- Typography section with all text styles
- Color palette with swatches
- Spacing and shadows visualization
- Border radius examples

### Phase 3: Components

**Files to create:**
- `src/app/system/ui/components/page.tsx`
- `src/app/system/ui/_components/ComponentGrid.tsx`

**Deliverables:**
- All 53 components demonstrated
- Organized by category
- Interactive demos for overlays

### Phase 4: Patterns

**Files to create:**
- `src/app/system/ui/patterns/page.tsx`

**Deliverables:**
- Data table pattern
- Form pattern with validation
- Card layout examples
- Empty and loading states

---

## Open Questions

*None - all clarifications resolved during ideation-to-spec process.*

---

## References

- [Ideation Document](./01-ideation.md)
- [Design System Specification](../../docs/DESIGN_SYSTEM.md)
- [Styling Guide](../../developer-guides/08-styling-theming.md)
- [Component Rules](../../.claude/rules/components.md)
