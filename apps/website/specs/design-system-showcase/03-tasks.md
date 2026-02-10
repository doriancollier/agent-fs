# Task Breakdown: Design System Showcase

**Generated:** 2025-12-22
**Source:** specs/design-system-showcase/02-specification.md
**Slug:** design-system-showcase
**Last Decompose:** 2025-12-22

---

## Overview

Build a visual design system showcase at `/system/ui` that demonstrates all 53 Shadcn UI components, typography hierarchy, color palette, and UI patterns through interactive visual demos. This is a visual-only showcase - no code display is needed.

**Total Tasks:** 22
**Phases:** 4
**Parallel Opportunities:** Tasks within each phase can largely run in parallel

---

## Phase 1: Foundation (5 tasks)

Core layout infrastructure, navigation, and shared components.

### Task 1.1: Create ShowcaseLayout with Sidebar Structure

**Description:** Build the root layout component that provides the sidebar + main content structure for all showcase pages.

**Size:** Medium
**Priority:** High
**Dependencies:** None
**Can run parallel with:** None (foundation task)

**Technical Requirements:**
- Create `src/app/system/ui/layout.tsx` as Server Component
- Flex layout with fixed sidebar on left, scrollable main content on right
- Use existing container utilities from globals.css (`container-wide`)
- Mobile-responsive: sidebar collapses below 768px

**Files to create:**
- `src/app/system/ui/layout.tsx`

**Implementation:**

```tsx
// src/app/system/ui/layout.tsx
import { ShowcaseSidebar } from './_components/ShowcaseSidebar'
import { ShowcaseHeader } from './_components/ShowcaseHeader'

export default function ShowcaseLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <ShowcaseSidebar />
      <div className="flex-1 flex flex-col">
        <ShowcaseHeader />
        <main className="flex-1 container-wide py-8">
          {children}
        </main>
      </div>
    </div>
  )
}
```

**Acceptance Criteria:**
- [ ] Layout renders with sidebar and main content areas
- [ ] Children render in main content area
- [ ] Layout works on desktop (≥1024px) and mobile (<768px)
- [ ] Uses design system tokens (no hardcoded values)

---

### Task 1.2: Build ShowcaseSidebar with Navigation

**Description:** Create the navigation sidebar with collapsible sections, scroll spy for active states, and mobile hamburger menu.

**Size:** Large
**Priority:** High
**Dependencies:** Task 1.1
**Can run parallel with:** Task 1.3

**Technical Requirements:**
- Client Component (needs useState, usePathname, scroll spy)
- Collapsible on mobile with hamburger trigger
- Scroll spy to highlight active section based on scroll position
- Navigation structure from spec with nested items
- Use `next/link` for client-side navigation
- Active state styling uses design tokens

**Files to create:**
- `src/app/system/ui/_components/ShowcaseSidebar.tsx`

**Implementation:**

```tsx
// src/app/system/ui/_components/ShowcaseSidebar.tsx
'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface NavItem {
  title: string
  href: string
  items?: { title: string; href: string }[]
}

const navigation: NavItem[] = [
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

export function ShowcaseSidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = React.useState(false)
  const [activeHash, setActiveHash] = React.useState('')

  // Scroll spy effect
  React.useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('[data-section]')
      let current = ''

      sections.forEach((section) => {
        const rect = section.getBoundingClientRect()
        if (rect.top <= 100) {
          current = section.id
        }
      })

      setActiveHash(current ? `#${current}` : '')
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isActive = (href: string) => {
    if (href.includes('#')) {
      const [path, hash] = href.split('#')
      return pathname === path && activeHash === `#${hash}`
    }
    return pathname === href
  }

  return (
    <>
      {/* Mobile hamburger */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
      >
        {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-background border-r transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <nav className="h-full overflow-y-auto py-8 px-4">
          <div className="mb-8 px-2">
            <h2 className="text-lg font-semibold">Design System</h2>
          </div>

          <ul className="space-y-1">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "block px-2 py-1.5 rounded-md text-sm transition-colors",
                    isActive(item.href)
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  {item.title}
                </Link>

                {item.items && (
                  <ul className="ml-4 mt-1 space-y-1">
                    {item.items.map((subitem) => (
                      <li key={subitem.href}>
                        <Link
                          href={subitem.href}
                          className={cn(
                            "block px-2 py-1 rounded-md text-sm transition-colors",
                            isActive(subitem.href)
                              ? "text-foreground font-medium"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                          onClick={() => setIsOpen(false)}
                        >
                          {subitem.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
```

**Acceptance Criteria:**
- [ ] Sidebar displays all navigation items from spec
- [ ] Active page is highlighted
- [ ] Scroll spy highlights current section when scrolling
- [ ] Mobile: hamburger button shows/hides sidebar
- [ ] Mobile: clicking overlay closes sidebar
- [ ] Links navigate correctly with client-side transitions

---

### Task 1.3: Build ShowcaseHeader with Theme Toggle

**Description:** Create the header component with theme toggle for light/dark mode switching.

**Size:** Small
**Priority:** High
**Dependencies:** Task 1.1
**Can run parallel with:** Task 1.2

**Technical Requirements:**
- Client Component (needs useTheme from next-themes)
- Theme toggle button with sun/moon icons
- Clean header design with title
- Sticky positioning for desktop

**Files to create:**
- `src/app/system/ui/_components/ShowcaseHeader.tsx`

**Implementation:**

```tsx
// src/app/system/ui/_components/ShowcaseHeader.tsx
'use client'

import * as React from 'react'
import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ShowcaseHeader() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container-wide flex h-14 items-center justify-between">
        <div className="flex items-center gap-4 pl-12 lg:pl-0">
          <h1 className="text-lg font-semibold">Design System Showcase</h1>
        </div>

        <div className="flex items-center gap-2">
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <Sun className="size-5" />
              ) : (
                <Moon className="size-5" />
              )}
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
```

**Acceptance Criteria:**
- [ ] Header renders with title
- [ ] Theme toggle switches between light and dark modes
- [ ] No hydration mismatch (mounted check)
- [ ] Header is sticky on scroll
- [ ] Proper spacing for mobile hamburger button

---

### Task 1.4: Create ComponentSection Helper

**Description:** Build a reusable section wrapper component that provides consistent heading, description, and anchor link structure for all showcase sections.

**Size:** Small
**Priority:** High
**Dependencies:** None
**Can run parallel with:** Task 1.2, 1.3

**Technical Requirements:**
- Server Component (no client interactivity)
- Renders h2 with anchor ID
- Optional description paragraph
- Consistent spacing using design tokens
- `data-section` attribute for scroll spy

**Files to create:**
- `src/app/system/ui/_components/ComponentSection.tsx`

**Implementation:**

```tsx
// src/app/system/ui/_components/ComponentSection.tsx
import * as React from 'react'
import { cn } from '@/lib/utils'

interface ComponentSectionProps {
  id: string
  title: string
  description?: string
  className?: string
  children: React.ReactNode
}

export function ComponentSection({
  id,
  title,
  description,
  className,
  children,
}: ComponentSectionProps) {
  return (
    <section
      id={id}
      data-section
      className={cn("scroll-mt-20 py-8 first:pt-0", className)}
    >
      <div className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight">
          <a
            href={`#${id}`}
            className="hover:underline underline-offset-4"
          >
            {title}
          </a>
        </h2>
        {description && (
          <p className="mt-2 text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {children}
    </section>
  )
}
```

**Acceptance Criteria:**
- [ ] Section renders with h2 heading containing anchor link
- [ ] Optional description renders when provided
- [ ] `data-section` attribute present for scroll spy
- [ ] Proper scroll margin (`scroll-mt-20`) for fixed header
- [ ] Consistent spacing between sections

---

### Task 1.5: Create Overview Page

**Description:** Build the overview/index page at `/system/ui` with hero section, Calm Tech philosophy intro, and quick link cards to each section.

**Size:** Medium
**Priority:** High
**Dependencies:** Task 1.1, 1.4
**Can run parallel with:** None (needs layout first)

**Technical Requirements:**
- Server Component
- Hero section with "Design System" title
- Brief intro to Calm Tech philosophy
- Grid of quick link cards to Foundations, Components, Patterns
- Component count summary (53 components)
- Use Card component from UI library

**Files to create:**
- `src/app/system/ui/page.tsx`

**Implementation:**

```tsx
// src/app/system/ui/page.tsx
import Link from 'next/link'
import { Palette, Layers, Grid3X3, ArrowRight } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

const sections = [
  {
    title: 'Foundations',
    description: 'Typography, colors, spacing, shadows, and icons that form the visual language.',
    href: '/system/ui/foundations',
    icon: Palette,
  },
  {
    title: 'Components',
    description: '53 UI components organized by category: Actions, Forms, Feedback, Overlay, Navigation, Data Display, and Layout.',
    href: '/system/ui/components',
    icon: Layers,
  },
  {
    title: 'Patterns',
    description: 'Common UI compositions: data tables, forms, card layouts, empty states, and loading states.',
    href: '/system/ui/patterns',
    icon: Grid3X3,
  },
]

export default function DesignSystemOverview() {
  return (
    <div className="space-y-12">
      {/* Hero */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Design System</h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          A visual reference for the <strong>Calm Tech</strong> design language.
          Sophisticated, spacious, effortless.
        </p>
      </div>

      {/* Philosophy */}
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <h2>Calm Tech Philosophy</h2>
        <p>
          Our interfaces follow the "Calm Tech" design language — technology that respects
          attention and reduces cognitive load. Key principles:
        </p>
        <ul>
          <li><strong>Clarity over decoration</strong> — Every element earns its place</li>
          <li><strong>Soft depth over flat</strong> — Subtle shadows create hierarchy</li>
          <li><strong>Generous space</strong> — Breathing room makes content shine</li>
          <li><strong>Micro-delight</strong> — Thoughtful, restrained animations</li>
        </ul>
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-2xl font-semibold mb-6">Explore</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {sections.map((section) => (
            <Link key={section.href} href={section.href} className="group">
              <Card className="h-full transition-shadow hover:shadow-elevated">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-primary/10">
                      <section.icon className="size-5 text-primary" />
                    </div>
                    <CardTitle className="group-hover:text-primary transition-colors">
                      {section.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">
                    {section.description}
                  </CardDescription>
                  <div className="mt-4 flex items-center text-sm text-primary font-medium">
                    Explore
                    <ArrowRight className="ml-1 size-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="rounded-xl border bg-muted/50 p-6">
        <h3 className="font-semibold mb-2">At a Glance</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-3xl font-bold">53</div>
            <div className="text-sm text-muted-foreground">Components</div>
          </div>
          <div>
            <div className="text-3xl font-bold">6</div>
            <div className="text-sm text-muted-foreground">Foundation Sections</div>
          </div>
          <div>
            <div className="text-3xl font-bold">5</div>
            <div className="text-sm text-muted-foreground">Pattern Examples</div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

**Acceptance Criteria:**
- [ ] Overview page renders at `/system/ui`
- [ ] Hero section displays with title and description
- [ ] Calm Tech philosophy section is readable
- [ ] Quick link cards navigate to correct sections
- [ ] Summary shows component count
- [ ] Cards have hover effects

---

## Phase 2: Foundations Page (5 tasks)

Typography, colors, spacing, shadows, and icons visualization.

### Task 2.1: Create ColorSwatch Component

**Description:** Build a color display component that shows color preview, token name, CSS variable, and computed values.

**Size:** Medium
**Priority:** High
**Dependencies:** Task 1.4
**Can run parallel with:** Task 2.2, 2.3

**Technical Requirements:**
- Client Component (needs to read computed CSS values)
- Display color preview square
- Show token name and CSS variable
- Show OKLCH value and computed hex
- Support both light and dark themes

**Files to create:**
- `src/app/system/ui/_components/ColorSwatch.tsx`

**Implementation:**

```tsx
// src/app/system/ui/_components/ColorSwatch.tsx
'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface ColorSwatchProps {
  name: string
  cssVar: string
  description?: string
  className?: string
}

export function ColorSwatch({ name, cssVar, description, className }: ColorSwatchProps) {
  const [computedColor, setComputedColor] = React.useState<string>('')
  const swatchRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (swatchRef.current) {
      const style = getComputedStyle(swatchRef.current)
      setComputedColor(style.backgroundColor)
    }
  }, [])

  return (
    <div className={cn("flex items-start gap-3", className)}>
      <div
        ref={swatchRef}
        className="size-12 rounded-md border shadow-sm shrink-0"
        style={{ backgroundColor: `var(${cssVar})` }}
      />
      <div className="min-w-0">
        <div className="font-medium text-sm">{name}</div>
        <div className="text-xs text-muted-foreground font-mono">{cssVar}</div>
        {description && (
          <div className="text-xs text-muted-foreground mt-1">{description}</div>
        )}
        {computedColor && (
          <div className="text-xs text-muted-foreground font-mono mt-1">
            {computedColor}
          </div>
        )}
      </div>
    </div>
  )
}

// Grouped color display for palette sections
interface ColorGroupProps {
  title: string
  colors: Array<{ name: string; cssVar: string; description?: string }>
}

export function ColorGroup({ title, colors }: ColorGroupProps) {
  return (
    <div>
      <h4 className="text-sm font-medium mb-3">{title}</h4>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {colors.map((color) => (
          <ColorSwatch key={color.cssVar} {...color} />
        ))}
      </div>
    </div>
  )
}
```

**Acceptance Criteria:**
- [ ] Swatch displays color preview from CSS variable
- [ ] Token name and CSS variable are shown
- [ ] Computed color value displays
- [ ] Works in both light and dark themes
- [ ] Grid layout for multiple swatches

---

### Task 2.2: Create TypeScale Component

**Description:** Build a typography visualization component that displays all heading levels, body text sizes, font weights, and code styles.

**Size:** Medium
**Priority:** High
**Dependencies:** Task 1.4
**Can run parallel with:** Task 2.1, 2.3

**Technical Requirements:**
- Server Component (static content)
- Display h1-h4 heading examples
- Show body text at different sizes (base, sm, xs)
- Demonstrate font weights (400, 500, 600, 700)
- Show Geist Mono for code
- Include line-height and letter-spacing examples

**Files to create:**
- `src/app/system/ui/_components/TypeScale.tsx`

**Implementation:**

```tsx
// src/app/system/ui/_components/TypeScale.tsx
import { cn } from '@/lib/utils'

export function TypeScale() {
  return (
    <div className="space-y-8">
      {/* Headings */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-muted-foreground">Headings</h4>
        <div className="space-y-4 border-l-2 pl-4">
          <div>
            <span className="text-xs text-muted-foreground font-mono">h1 - 2.441rem / 39px</span>
            <h1 className="text-4xl font-bold tracking-tight">The quick brown fox</h1>
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-mono">h2 - 1.953rem / 31px</span>
            <h2 className="text-3xl font-semibold tracking-tight">The quick brown fox</h2>
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-mono">h3 - 1.563rem / 25px</span>
            <h3 className="text-2xl font-semibold">The quick brown fox</h3>
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-mono">h4 - 1.25rem / 20px</span>
            <h4 className="text-xl font-medium">The quick brown fox</h4>
          </div>
        </div>
      </div>

      {/* Body Text */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-muted-foreground">Body Text</h4>
        <div className="space-y-3 border-l-2 pl-4">
          <div>
            <span className="text-xs text-muted-foreground font-mono">text-base - 1rem / 16px</span>
            <p className="text-base">The quick brown fox jumps over the lazy dog.</p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-mono">text-sm - 0.875rem / 14px</span>
            <p className="text-sm">The quick brown fox jumps over the lazy dog.</p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-mono">text-xs - 0.75rem / 12px</span>
            <p className="text-xs">The quick brown fox jumps over the lazy dog.</p>
          </div>
        </div>
      </div>

      {/* Font Weights */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-muted-foreground">Font Weights</h4>
        <div className="space-y-2 border-l-2 pl-4">
          <p className="font-normal"><span className="text-xs text-muted-foreground font-mono mr-4">400</span>Normal weight text</p>
          <p className="font-medium"><span className="text-xs text-muted-foreground font-mono mr-4">500</span>Medium weight text</p>
          <p className="font-semibold"><span className="text-xs text-muted-foreground font-mono mr-4">600</span>Semibold weight text</p>
          <p className="font-bold"><span className="text-xs text-muted-foreground font-mono mr-4">700</span>Bold weight text</p>
        </div>
      </div>

      {/* Code */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-muted-foreground">Code (Geist Mono)</h4>
        <div className="border-l-2 pl-4">
          <code className="px-1.5 py-0.5 rounded bg-muted font-mono text-sm">
            const example = "Geist Mono"
          </code>
          <pre className="mt-2 p-4 rounded-lg bg-muted overflow-x-auto">
            <code className="font-mono text-sm">{`function greet(name: string) {
  return \`Hello, \${name}!\`
}`}</code>
          </pre>
        </div>
      </div>
    </div>
  )
}
```

**Acceptance Criteria:**
- [ ] All heading levels displayed (h1-h4)
- [ ] Font sizes shown with pixel values
- [ ] Body text sizes demonstrated
- [ ] Font weights 400-700 shown
- [ ] Code font (Geist Mono) demonstrated
- [ ] Clean, scannable layout

---

### Task 2.3: Create SpacingScale Component

**Description:** Build a visual spacing ruler component that displays the 8pt grid system with visual bars, pixel values, and Tailwind class names.

**Size:** Small
**Priority:** Medium
**Dependencies:** Task 1.4
**Can run parallel with:** Task 2.1, 2.2

**Technical Requirements:**
- Server Component (static content)
- Visual bars showing spacing values
- Display pixel values and Tailwind classes
- Cover spacing scale from 0.5 to 24

**Files to create:**
- `src/app/system/ui/_components/SpacingScale.tsx`

**Implementation:**

```tsx
// src/app/system/ui/_components/SpacingScale.tsx
const spacingScale = [
  { class: '0.5', px: 2 },
  { class: '1', px: 4 },
  { class: '1.5', px: 6 },
  { class: '2', px: 8 },
  { class: '3', px: 12 },
  { class: '4', px: 16 },
  { class: '5', px: 20 },
  { class: '6', px: 24 },
  { class: '8', px: 32 },
  { class: '10', px: 40 },
  { class: '12', px: 48 },
  { class: '16', px: 64 },
  { class: '20', px: 80 },
  { class: '24', px: 96 },
]

export function SpacingScale() {
  return (
    <div className="space-y-1">
      {spacingScale.map(({ class: cls, px }) => (
        <div key={cls} className="flex items-center gap-4">
          <div className="w-16 text-right">
            <span className="text-xs font-mono text-muted-foreground">{cls}</span>
          </div>
          <div
            className="h-4 bg-primary rounded-sm"
            style={{ width: `${px}px` }}
          />
          <span className="text-xs text-muted-foreground">{px}px</span>
        </div>
      ))}
    </div>
  )
}
```

**Acceptance Criteria:**
- [ ] All spacing values from 0.5-24 displayed
- [ ] Visual bars proportional to spacing value
- [ ] Tailwind class names shown
- [ ] Pixel values displayed
- [ ] 8pt grid system clearly demonstrated

---

### Task 2.4: Create ShadowScale and RadiusScale Components

**Description:** Build components to visualize shadow levels and border radius values with applied examples.

**Size:** Small
**Priority:** Medium
**Dependencies:** Task 1.4
**Can run parallel with:** Task 2.1, 2.2, 2.3

**Technical Requirements:**
- Server Component (static content)
- Shadow scale: xs through xl plus custom utilities
- Radius scale: sm through 2xl plus full
- Applied to card/button examples

**Files to create:**
- Add to `src/app/system/ui/_components/` (can be in foundations page directly)

**Implementation:**

```tsx
// Shadow examples - can be inline in foundations page
const shadows = [
  { name: 'shadow-xs', class: 'shadow-xs' },
  { name: 'shadow-sm', class: 'shadow-sm' },
  { name: 'shadow', class: 'shadow' },
  { name: 'shadow-md', class: 'shadow-md' },
  { name: 'shadow-lg', class: 'shadow-lg' },
  { name: 'shadow-xl', class: 'shadow-xl' },
  { name: 'shadow-soft', class: 'shadow-soft' },
  { name: 'shadow-elevated', class: 'shadow-elevated' },
  { name: 'shadow-floating', class: 'shadow-floating' },
  { name: 'shadow-modal', class: 'shadow-modal' },
]

// Radius examples
const radii = [
  { name: 'rounded-sm', class: 'rounded-sm' },
  { name: 'rounded', class: 'rounded' },
  { name: 'rounded-md', class: 'rounded-md' },
  { name: 'rounded-lg', class: 'rounded-lg' },
  { name: 'rounded-xl', class: 'rounded-xl' },
  { name: 'rounded-2xl', class: 'rounded-2xl' },
  { name: 'rounded-full', class: 'rounded-full' },
]
```

**Acceptance Criteria:**
- [ ] All shadow levels visualized on cards
- [ ] Custom shadow utilities shown (soft, elevated, floating, modal)
- [ ] Border radius values applied to examples
- [ ] Clear visual distinction between levels

---

### Task 2.5: Build Foundations Page

**Description:** Assemble the complete Foundations page with all sections: Typography, Colors, Spacing, Shadows, Border Radius, and Icons.

**Size:** Large
**Priority:** High
**Dependencies:** Task 2.1, 2.2, 2.3, 2.4
**Can run parallel with:** None (needs helper components)

**Technical Requirements:**
- Server Component with Client Component islands
- All 6 sections with anchor IDs
- Use ComponentSection wrapper
- Full color palette from globals.css
- Lucide icons at multiple sizes

**Files to create:**
- `src/app/system/ui/foundations/page.tsx`

**Implementation:**

```tsx
// src/app/system/ui/foundations/page.tsx
import {
  Home, Settings, User, Search, Bell, Heart, Star,
  Mail, Calendar, Clock, Check, X, Plus, Minus,
  ChevronRight, ChevronDown, ArrowRight, ArrowLeft
} from 'lucide-react'
import { ComponentSection } from '../_components/ComponentSection'
import { ColorSwatch, ColorGroup } from '../_components/ColorSwatch'
import { TypeScale } from '../_components/TypeScale'
import { SpacingScale } from '../_components/SpacingScale'
import { cn } from '@/lib/utils'

const coreColors = [
  { name: 'Background', cssVar: '--background' },
  { name: 'Foreground', cssVar: '--foreground' },
  { name: 'Card', cssVar: '--card' },
  { name: 'Card Foreground', cssVar: '--card-foreground' },
  { name: 'Popover', cssVar: '--popover' },
  { name: 'Popover Foreground', cssVar: '--popover-foreground' },
]

const actionColors = [
  { name: 'Primary', cssVar: '--primary' },
  { name: 'Primary Foreground', cssVar: '--primary-foreground' },
  { name: 'Secondary', cssVar: '--secondary' },
  { name: 'Secondary Foreground', cssVar: '--secondary-foreground' },
  { name: 'Accent', cssVar: '--accent' },
  { name: 'Accent Foreground', cssVar: '--accent-foreground' },
]

const semanticColors = [
  { name: 'Destructive', cssVar: '--destructive' },
  { name: 'Success', cssVar: '--success' },
  { name: 'Warning', cssVar: '--warning' },
  { name: 'Info', cssVar: '--info' },
]

const utilityColors = [
  { name: 'Muted', cssVar: '--muted' },
  { name: 'Muted Foreground', cssVar: '--muted-foreground' },
  { name: 'Border', cssVar: '--border' },
  { name: 'Input', cssVar: '--input' },
  { name: 'Ring', cssVar: '--ring' },
]

const shadows = [
  { name: 'shadow-xs', class: 'shadow-xs' },
  { name: 'shadow-sm', class: 'shadow-sm' },
  { name: 'shadow', class: 'shadow' },
  { name: 'shadow-md', class: 'shadow-md' },
  { name: 'shadow-lg', class: 'shadow-lg' },
  { name: 'shadow-xl', class: 'shadow-xl' },
  { name: 'shadow-soft', class: 'shadow-soft' },
  { name: 'shadow-elevated', class: 'shadow-elevated' },
  { name: 'shadow-floating', class: 'shadow-floating' },
  { name: 'shadow-modal', class: 'shadow-modal' },
]

const radii = [
  { name: 'rounded-sm', class: 'rounded-sm', desc: '4px' },
  { name: 'rounded', class: 'rounded', desc: '6px' },
  { name: 'rounded-md', class: 'rounded-md', desc: '10px' },
  { name: 'rounded-lg', class: 'rounded-lg', desc: '12px' },
  { name: 'rounded-xl', class: 'rounded-xl', desc: '16px' },
  { name: 'rounded-2xl', class: 'rounded-2xl', desc: '20px' },
  { name: 'rounded-full', class: 'rounded-full', desc: '9999px' },
]

const commonIcons = [
  { Icon: Home, name: 'Home' },
  { Icon: Settings, name: 'Settings' },
  { Icon: User, name: 'User' },
  { Icon: Search, name: 'Search' },
  { Icon: Bell, name: 'Bell' },
  { Icon: Heart, name: 'Heart' },
  { Icon: Star, name: 'Star' },
  { Icon: Mail, name: 'Mail' },
  { Icon: Calendar, name: 'Calendar' },
  { Icon: Clock, name: 'Clock' },
  { Icon: Check, name: 'Check' },
  { Icon: X, name: 'X' },
  { Icon: Plus, name: 'Plus' },
  { Icon: Minus, name: 'Minus' },
  { Icon: ChevronRight, name: 'ChevronRight' },
  { Icon: ChevronDown, name: 'ChevronDown' },
  { Icon: ArrowRight, name: 'ArrowRight' },
  { Icon: ArrowLeft, name: 'ArrowLeft' },
]

export default function FoundationsPage() {
  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Foundations</h1>
        <p className="mt-2 text-muted-foreground">
          The building blocks of our design system: typography, colors, spacing, and visual effects.
        </p>
      </div>

      {/* Typography */}
      <ComponentSection
        id="typography"
        title="Typography"
        description="Type scale based on Major Third ratio (1.25). Geist Sans for UI, Geist Mono for code."
      >
        <TypeScale />
      </ComponentSection>

      {/* Colors */}
      <ComponentSection
        id="colors"
        title="Colors"
        description="OKLCH color space for perceptual uniformity. All colors adapt to light/dark themes."
      >
        <div className="space-y-8">
          <ColorGroup title="Core" colors={coreColors} />
          <ColorGroup title="Action" colors={actionColors} />
          <ColorGroup title="Semantic" colors={semanticColors} />
          <ColorGroup title="Utility" colors={utilityColors} />
        </div>
      </ComponentSection>

      {/* Spacing */}
      <ComponentSection
        id="spacing"
        title="Spacing"
        description="8pt grid system. Spacing values are multiples of 4px for consistency."
      >
        <SpacingScale />
      </ComponentSection>

      {/* Shadows */}
      <ComponentSection
        id="shadows"
        title="Shadows"
        description="Soft shadows for depth hierarchy. Custom utilities for specific use cases."
      >
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {shadows.map(({ name, class: cls }) => (
            <div key={name} className="text-center">
              <div className={cn("h-20 rounded-lg bg-card border", cls)} />
              <span className="text-xs font-mono text-muted-foreground mt-2 block">{name}</span>
            </div>
          ))}
        </div>
      </ComponentSection>

      {/* Border Radius */}
      <ComponentSection
        id="radius"
        title="Border Radius"
        description="Consistent rounding for a softer, approachable feel."
      >
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {radii.map(({ name, class: cls, desc }) => (
            <div key={name} className="text-center">
              <div className={cn("h-20 bg-primary", cls)} />
              <span className="text-xs font-mono text-muted-foreground mt-2 block">{name}</span>
              <span className="text-xs text-muted-foreground">{desc}</span>
            </div>
          ))}
        </div>
      </ComponentSection>

      {/* Icons */}
      <ComponentSection
        id="icons"
        title="Icons"
        description="Lucide React icons at various sizes. Consistent stroke width and sizing."
      >
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-medium mb-3">Size 16px</h4>
            <div className="flex flex-wrap gap-4">
              {commonIcons.slice(0, 10).map(({ Icon, name }) => (
                <div key={name} className="flex flex-col items-center gap-1">
                  <Icon className="size-4" />
                  <span className="text-xs text-muted-foreground">{name}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-3">Size 20px (default)</h4>
            <div className="flex flex-wrap gap-4">
              {commonIcons.slice(0, 10).map(({ Icon, name }) => (
                <div key={name} className="flex flex-col items-center gap-1">
                  <Icon className="size-5" />
                  <span className="text-xs text-muted-foreground">{name}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-3">Size 24px</h4>
            <div className="flex flex-wrap gap-4">
              {commonIcons.slice(0, 10).map(({ Icon, name }) => (
                <div key={name} className="flex flex-col items-center gap-1">
                  <Icon className="size-6" />
                  <span className="text-xs text-muted-foreground">{name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ComponentSection>
    </div>
  )
}
```

**Acceptance Criteria:**
- [ ] All 6 sections render with correct anchor IDs
- [ ] Typography section shows all text styles
- [ ] Colors section shows complete palette
- [ ] Spacing scale is visually clear
- [ ] Shadows show progression and custom utilities
- [ ] Border radius examples are applied correctly
- [ ] Icons display at multiple sizes
- [ ] Theme toggle changes all color values

---

## Phase 3: Components Page (7 tasks)

All 53 components organized by category with interactive demos.

### Task 3.1: Create ComponentGrid Helper

**Description:** Build a grid layout component for displaying component variants in organized columns.

**Size:** Small
**Priority:** High
**Dependencies:** None
**Can run parallel with:** Task 3.2-3.7

**Technical Requirements:**
- Server Component
- Configurable column count (2, 3, 4)
- Configurable gap size (sm, md, lg)
- Responsive behavior

**Files to create:**
- `src/app/system/ui/_components/ComponentGrid.tsx`

**Implementation:**

```tsx
// src/app/system/ui/_components/ComponentGrid.tsx
import * as React from 'react'
import { cn } from '@/lib/utils'

interface ComponentGridProps {
  cols?: 2 | 3 | 4
  gap?: 'sm' | 'md' | 'lg'
  className?: string
  children: React.ReactNode
}

const colsMap = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
}

const gapMap = {
  sm: 'gap-3',
  md: 'gap-4',
  lg: 'gap-6',
}

export function ComponentGrid({
  cols = 3,
  gap = 'md',
  className,
  children,
}: ComponentGridProps) {
  return (
    <div className={cn('grid', colsMap[cols], gapMap[gap], className)}>
      {children}
    </div>
  )
}

// Demo wrapper for individual component examples
interface DemoProps {
  title?: string
  className?: string
  children: React.ReactNode
}

export function Demo({ title, className, children }: DemoProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {title && (
        <span className="text-xs font-medium text-muted-foreground">{title}</span>
      )}
      <div className="flex flex-wrap items-center gap-2">
        {children}
      </div>
    </div>
  )
}
```

**Acceptance Criteria:**
- [ ] Grid renders with configurable columns
- [ ] Gap sizes apply correctly
- [ ] Responsive on mobile (stacks to 1 column)
- [ ] Demo component labels variants clearly

---

### Task 3.2: Build Actions Components Section

**Description:** Create demos for Button, ButtonGroup, Toggle, and ToggleGroup components.

**Size:** Medium
**Priority:** High
**Dependencies:** Task 3.1
**Can run parallel with:** Task 3.3-3.7

**Technical Requirements:**
- Show all Button variants: default, destructive, outline, secondary, ghost, link
- Show all Button sizes: sm, default, lg, icon variants
- Demo ButtonGroup with multiple buttons
- Interactive Toggle and ToggleGroup

**Components to demo:**
- Button (all variants/sizes)
- ButtonGroup
- Toggle
- ToggleGroup

**Implementation outline:**

```tsx
// Actions section for components page
<ComponentSection id="actions" title="Actions">
  <div className="space-y-8">
    {/* Button Variants */}
    <div>
      <h4 className="text-sm font-medium mb-3">Button Variants</h4>
      <div className="flex flex-wrap gap-2">
        <Button>Default</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">Link</Button>
      </div>
    </div>

    {/* Button Sizes */}
    <div>
      <h4 className="text-sm font-medium mb-3">Button Sizes</h4>
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm">Small</Button>
        <Button>Default</Button>
        <Button size="lg">Large</Button>
        <Button size="icon"><Plus className="size-4" /></Button>
      </div>
    </div>

    {/* ButtonGroup */}
    {/* Toggle/ToggleGroup with interactive state */}
  </div>
</ComponentSection>
```

**Acceptance Criteria:**
- [ ] All 6 button variants displayed
- [ ] All button sizes shown with visual difference
- [ ] ButtonGroup renders correctly
- [ ] Toggle is interactive (can be toggled)
- [ ] ToggleGroup shows single/multiple selection modes

---

### Task 3.3: Build Forms Components Section

**Description:** Create demos for all form-related components with various states.

**Size:** Large
**Priority:** High
**Dependencies:** Task 3.1
**Can run parallel with:** Task 3.2, 3.4-3.7

**Components to demo:**
- Input (default, focus, error, disabled states)
- Textarea
- Select with SelectItem
- Checkbox
- RadioGroup
- Switch
- Slider (single and range)
- Label
- Form (complete example with validation)

**Acceptance Criteria:**
- [ ] Input shows all states (normal, disabled, error)
- [ ] Textarea with resize behavior
- [ ] Select is interactive with options
- [ ] Checkbox/RadioGroup/Switch are interactive
- [ ] Slider works (single value and range)
- [ ] Form example shows validation feedback

---

### Task 3.4: Build Feedback Components Section

**Description:** Create demos for Alert, Progress, Skeleton, and Spinner components.

**Size:** Medium
**Priority:** High
**Dependencies:** Task 3.1
**Can run parallel with:** Task 3.2-3.3, 3.5-3.7

**Components to demo:**
- Alert (all variants: default, destructive, success, warning, info)
- Progress (with various values)
- Skeleton (various shapes)
- Spinner

**Acceptance Criteria:**
- [ ] All Alert variants displayed
- [ ] Progress shows different completion states
- [ ] Skeleton shapes demonstrated (text, avatar, card)
- [ ] Spinner animates

---

### Task 3.5: Build Overlay Components Section

**Description:** Create interactive demos for Dialog, Sheet, Popover, Tooltip, HoverCard, DropdownMenu, ContextMenu, and Command.

**Size:** Large
**Priority:** High
**Dependencies:** Task 3.1
**Can run parallel with:** Task 3.2-3.4, 3.6-3.7

**Technical Requirements:**
- All components need 'use client' for interactivity
- Dialog/AlertDialog with open/close triggers
- Sheet showing all 4 sides
- Popover/Tooltip/HoverCard with hover triggers
- DropdownMenu/ContextMenu with interactive menus
- Command palette demo

**Components to demo:**
- Dialog (interactive)
- AlertDialog (interactive)
- Sheet (top, right, bottom, left)
- Popover (interactive)
- Tooltip (hover)
- HoverCard (hover)
- DropdownMenu (interactive)
- ContextMenu (right-click)
- Command (search palette)

**Acceptance Criteria:**
- [ ] Dialog opens and closes
- [ ] AlertDialog shows confirmation pattern
- [ ] Sheet opens from all 4 sides
- [ ] Popover opens on click
- [ ] Tooltip shows on hover
- [ ] HoverCard shows on hover with content
- [ ] DropdownMenu shows menu items
- [ ] ContextMenu triggers on right-click
- [ ] Command palette is searchable

---

### Task 3.6: Build Navigation & Data Display Components Sections

**Description:** Create demos for navigation and data display components.

**Size:** Large
**Priority:** High
**Dependencies:** Task 3.1
**Can run parallel with:** Task 3.2-3.5, 3.7

**Components to demo (Navigation):**
- Tabs (interactive switching)
- Accordion (interactive expand/collapse)
- NavigationMenu
- Breadcrumb
- Pagination

**Components to demo (Data Display):**
- Table (with sample data)
- Card (all slots)
- Badge (all variants)
- Avatar (with fallback)
- Separator (horizontal/vertical)
- Kbd

**Acceptance Criteria:**
- [ ] Tabs switch between panels
- [ ] Accordion expands/collapses
- [ ] NavigationMenu shows navigation pattern
- [ ] Breadcrumb shows hierarchy
- [ ] Pagination is navigable
- [ ] Table renders with headers and rows
- [ ] Card shows all slot combinations
- [ ] Badge variants displayed
- [ ] Avatar shows image and fallback
- [ ] Kbd shows keyboard shortcuts

---

### Task 3.7: Build Layout Components Section and Assemble Components Page

**Description:** Create Layout component demos and assemble the complete Components page.

**Size:** Large
**Priority:** High
**Dependencies:** Task 3.1-3.6
**Can run parallel with:** None (final assembly)

**Components to demo (Layout):**
- ScrollArea (with scrollable content)
- AspectRatio (16:9, 4:3, 1:1)
- Collapsible (interactive)
- Resizable (interactive panels)

**Files to create:**
- `src/app/system/ui/components/page.tsx`

**Acceptance Criteria:**
- [ ] All 7 component categories displayed
- [ ] 53 components total demonstrated
- [ ] All interactive components work
- [ ] Anchor navigation works for each section
- [ ] Page loads without errors
- [ ] Both light and dark themes work

---

## Phase 4: Patterns Page (5 tasks)

Common UI compositions and patterns.

### Task 4.1: Build Data Table Pattern

**Description:** Create a data table pattern showing table with headers, row hover, pagination, and empty state.

**Size:** Medium
**Priority:** Medium
**Dependencies:** Phase 3 complete
**Can run parallel with:** Task 4.2-4.5

**Technical Requirements:**
- Sample data for table rows
- Sortable column headers (visual only)
- Row hover states
- Pagination component integration
- Empty state variation

**Acceptance Criteria:**
- [ ] Table renders with sample data
- [ ] Column headers show sort indicators
- [ ] Row hover effect works
- [ ] Pagination displays and is interactive
- [ ] Empty state example shown

---

### Task 4.2: Build Form Pattern

**Description:** Create a complete form pattern with various inputs, validation feedback, and submit button.

**Size:** Medium
**Priority:** Medium
**Dependencies:** Phase 3 complete
**Can run parallel with:** Task 4.1, 4.3-4.5

**Technical Requirements:**
- Text inputs with labels
- Select dropdown
- Checkbox and radio options
- Validation error display
- Submit button with loading state

**Acceptance Criteria:**
- [ ] Form layout is clean and accessible
- [ ] Validation errors display correctly
- [ ] All input types included
- [ ] Submit button shows loading state option

---

### Task 4.3: Build Card Layouts Pattern

**Description:** Create card layout examples showing grid arrangements and card variations.

**Size:** Medium
**Priority:** Medium
**Dependencies:** Phase 3 complete
**Can run parallel with:** Task 4.1-4.2, 4.4-4.5

**Technical Requirements:**
- Grid layouts (2, 3, 4 columns)
- Card with image
- Card with action buttons
- Interactive card (hover lift)

**Acceptance Criteria:**
- [ ] Grid layouts at different column counts
- [ ] Cards with images render correctly
- [ ] Action button cards work
- [ ] Hover effects on interactive cards

---

### Task 4.4: Build Empty and Loading States Patterns

**Description:** Create empty state and loading state pattern examples.

**Size:** Small
**Priority:** Medium
**Dependencies:** Phase 3 complete
**Can run parallel with:** Task 4.1-4.3, 4.5

**Technical Requirements:**
- Empty component with icon, title, description, action
- Skeleton patterns (card, list, form)
- Spinner usage patterns
- Loading button state

**Acceptance Criteria:**
- [ ] Empty state with all elements
- [ ] Skeleton patterns for common layouts
- [ ] Spinner examples
- [ ] Button loading state

---

### Task 4.5: Assemble Patterns Page

**Description:** Combine all pattern sections into the complete Patterns page.

**Size:** Medium
**Priority:** High
**Dependencies:** Task 4.1-4.4
**Can run parallel with:** None (final assembly)

**Files to create:**
- `src/app/system/ui/patterns/page.tsx`

**Acceptance Criteria:**
- [ ] All 5 pattern sections display
- [ ] Anchor navigation works
- [ ] Patterns demonstrate real-world usage
- [ ] Page loads without errors

---

## Dependency Graph

```
Phase 1: Foundation
┌─────────┐
│ Task 1.1│ Layout
└────┬────┘
     │
     ├──────────────┬──────────────┐
     ▼              ▼              ▼
┌─────────┐   ┌─────────┐   ┌─────────┐
│ Task 1.2│   │ Task 1.3│   │ Task 1.4│
│ Sidebar │   │ Header  │   │ Section │
└────┬────┘   └────┬────┘   └────┬────┘
     │              │              │
     └──────────────┼──────────────┘
                    ▼
              ┌─────────┐
              │ Task 1.5│ Overview Page
              └─────────┘

Phase 2: Foundations
┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐
│ Task 2.1│   │ Task 2.2│   │ Task 2.3│   │ Task 2.4│
│ Color   │   │ Type    │   │ Spacing │   │ Shadows │
└────┬────┘   └────┬────┘   └────┬────┘   └────┬────┘
     │              │              │              │
     └──────────────┴──────────────┴──────────────┘
                           │
                           ▼
                     ┌─────────┐
                     │ Task 2.5│ Foundations Page
                     └─────────┘

Phase 3: Components
┌─────────┐
│ Task 3.1│ ComponentGrid
└────┬────┘
     │
     ├────────────┬────────────┬────────────┬────────────┬────────────┐
     ▼            ▼            ▼            ▼            ▼            ▼
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│ Task 3.2│ │ Task 3.3│ │ Task 3.4│ │ Task 3.5│ │ Task 3.6│ │ Task 3.7│
│ Actions │ │ Forms   │ │ Feedback│ │ Overlay │ │ Nav/Data│ │ Layout  │
└────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘
     │            │            │            │            │            │
     └────────────┴────────────┴────────────┴────────────┴────────────┘
                                     │
                                     ▼
                               Components Page (Task 3.7)

Phase 4: Patterns
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│ Task 4.1│ │ Task 4.2│ │ Task 4.3│ │ Task 4.4│
│ Table   │ │ Form    │ │ Cards   │ │ States  │
└────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘
     │            │            │            │
     └────────────┴────────────┴────────────┘
                        │
                        ▼
                  ┌─────────┐
                  │ Task 4.5│ Patterns Page
                  └─────────┘
```

---

## Execution Strategy

### Recommended Order

1. **Phase 1** (Foundation) - Must complete first
   - Start with Task 1.1 (Layout)
   - Then parallel: Task 1.2, 1.3, 1.4
   - Then Task 1.5 (Overview)

2. **Phase 2** (Foundations) - Can start after Phase 1 core
   - Parallel: Task 2.1, 2.2, 2.3, 2.4
   - Then Task 2.5 (Foundations Page)

3. **Phase 3** (Components) - Can start after Phase 1
   - Start with Task 3.1 (ComponentGrid)
   - Then parallel: Task 3.2-3.6
   - Then Task 3.7 (Components Page assembly)

4. **Phase 4** (Patterns) - Can start after Phase 3
   - Parallel: Task 4.1-4.4
   - Then Task 4.5 (Patterns Page)

### Parallel Opportunities

| Phase | Parallel Tasks |
|-------|----------------|
| 1 | 1.2, 1.3, 1.4 |
| 2 | 2.1, 2.2, 2.3, 2.4 |
| 3 | 3.2, 3.3, 3.4, 3.5, 3.6 |
| 4 | 4.1, 4.2, 4.3, 4.4 |

### Risk Assessment

| Risk | Mitigation |
|------|------------|
| Component import errors | Test each component individually before assembly |
| Theme toggle issues | Use mounted check to prevent hydration mismatch |
| Scroll spy not working | Test with multiple sections, adjust threshold |
| Mobile sidebar overlapping | Use proper z-index and overlay |
| Performance with 53 components | Use Server Components where possible, lazy load overlays |

---

## Summary

| Metric | Value |
|--------|-------|
| Total Tasks | 22 |
| Phase 1 | 5 tasks |
| Phase 2 | 5 tasks |
| Phase 3 | 7 tasks |
| Phase 4 | 5 tasks |
| Files to Create | ~15 |
| Components to Demo | 53 |
