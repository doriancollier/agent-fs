# Design System Guide

> A comprehensive design language for building sleek, modern, minimal interfaces that feel ahead of their time.

## Design Philosophy

Our design system embraces **"Calm Tech"** — interfaces that feel sophisticated, spacious, and effortless. We prioritize:

1. **Clarity over decoration** — Every element earns its place
2. **Soft depth over flat** — Subtle shadows and layers create hierarchy without noise
3. **Generous space** — Breathing room makes content shine
4. **Micro-delight** — Thoughtful animations that feel tactile and responsive

---

## Typography

### Font Stack

| Role | Font | Fallback |
|------|------|----------|
| **Primary** | Geist Sans | system-ui, -apple-system, sans-serif |
| **Monospace** | Geist Mono | ui-monospace, monospace |

Geist is a modern geometric sans-serif that embodies Swiss typography principles with contemporary polish. It's designed for digital interfaces with excellent screen rendering.

### Type Scale

We use a **Major Third (1.25)** scale for harmonious visual rhythm:

| Name | Size | Line Height | Weight | Usage |
|------|------|-------------|--------|-------|
| `xs` | 11px | 16px | 400 | Labels, badges, metadata |
| `sm` | 13px | 20px | 400 | Secondary text, captions |
| `base` | 15px | 24px | 400 | Body text, inputs |
| `lg` | 17px | 26px | 500 | Emphasized body, card titles |
| `xl` | 20px | 28px | 600 | Section headings |
| `2xl` | 24px | 32px | 600 | Page section titles |
| `3xl` | 30px | 36px | 700 | Page titles |
| `4xl` | 36px | 40px | 700 | Hero headings |
| `5xl` | 48px | 48px | 800 | Display text |

### Font Weights

| Weight | Value | Usage |
|--------|-------|-------|
| Regular | 400 | Body text |
| Medium | 500 | Emphasized text, labels |
| Semibold | 600 | Headings, buttons |
| Bold | 700 | Page titles |
| Extrabold | 800 | Display, hero text |

### Typography Rules

- **Never use font weights below 400** for body text
- **Increase letter-spacing slightly (-0.01em to 0.02em)** for large display text
- **Use tabular numbers** for data tables and financial figures
- **Line length** should be 60-75 characters for optimal readability

---

## Color System

### Design Principles

1. **No pure black or white** — Use rich, slightly tinted neutrals
2. **Desaturated accents** — Vibrant but not harsh
3. **Consistent contrast ratios** — WCAG AA minimum (4.5:1 for text)

### Light Mode Palette

| Token | Value | OKLCH | Usage |
|-------|-------|-------|-------|
| `--background` | `#fafafa` | `oklch(0.985 0.002 240)` | Page background |
| `--foreground` | `#0f0f10` | `oklch(0.13 0.004 260)` | Primary text |
| `--card` | `#ffffff` | `oklch(1 0 0)` | Card surfaces |
| `--card-foreground` | `#0f0f10` | `oklch(0.13 0.004 260)` | Card text |
| `--muted` | `#f4f4f5` | `oklch(0.967 0.002 260)` | Muted backgrounds |
| `--muted-foreground` | `#71717a` | `oklch(0.553 0.013 260)` | Secondary text |
| `--border` | `#e4e4e7` | `oklch(0.915 0.004 260)` | Subtle borders |
| `--input` | `#e4e4e7` | `oklch(0.915 0.004 260)` | Input borders |
| `--primary` | `#18181b` | `oklch(0.21 0.006 260)` | Primary actions |
| `--primary-foreground` | `#fafafa` | `oklch(0.985 0.002 240)` | Primary text on dark |
| `--secondary` | `#f4f4f5` | `oklch(0.967 0.002 260)` | Secondary buttons |
| `--secondary-foreground` | `#18181b` | `oklch(0.21 0.006 260)` | Secondary button text |
| `--accent` | `#f4f4f5` | `oklch(0.967 0.002 260)` | Hover states |
| `--accent-foreground` | `#18181b` | `oklch(0.21 0.006 260)` | Accent text |
| `--destructive` | `#dc2626` | `oklch(0.577 0.22 25)` | Error, destructive |
| `--ring` | `#a1a1aa` | `oklch(0.705 0.012 260)` | Focus rings |

### Dark Mode Palette

| Token | Value | OKLCH | Usage |
|-------|-------|-------|-------|
| `--background` | `#09090b` | `oklch(0.098 0.005 260)` | Page background |
| `--foreground` | `#fafafa` | `oklch(0.985 0.002 240)` | Primary text |
| `--card` | `#131316` | `oklch(0.145 0.005 260)` | Card surfaces |
| `--card-foreground` | `#fafafa` | `oklch(0.985 0.002 240)` | Card text |
| `--muted` | `#1c1c1f` | `oklch(0.185 0.005 260)` | Muted backgrounds |
| `--muted-foreground` | `#a1a1aa` | `oklch(0.705 0.012 260)` | Secondary text |
| `--border` | `#27272a` | `oklch(0.242 0.005 260)` | Subtle borders |
| `--input` | `#27272a` | `oklch(0.242 0.005 260)` | Input borders |
| `--primary` | `#fafafa` | `oklch(0.985 0.002 240)` | Primary actions |
| `--primary-foreground` | `#18181b` | `oklch(0.21 0.006 260)` | Primary text on light |
| `--secondary` | `#27272a` | `oklch(0.242 0.005 260)` | Secondary buttons |
| `--secondary-foreground` | `#fafafa` | `oklch(0.985 0.002 240)` | Secondary button text |
| `--accent` | `#27272a` | `oklch(0.242 0.005 260)` | Hover states |
| `--accent-foreground` | `#fafafa` | `oklch(0.985 0.002 240)` | Accent text |
| `--destructive` | `#f87171` | `oklch(0.704 0.17 20)` | Error, destructive |
| `--ring` | `#52525b` | `oklch(0.442 0.01 260)` | Focus rings |

### Semantic Colors

| Purpose | Light | Dark |
|---------|-------|------|
| Success | `#16a34a` | `#22c55e` |
| Warning | `#d97706` | `#fbbf24` |
| Info | `#2563eb` | `#60a5fa` |

---

## Spacing & Layout

### Spacing Scale (8px base)

| Token | Value | Usage |
|-------|-------|-------|
| `0.5` | 2px | Micro spacing, icon gaps |
| `1` | 4px | Tight spacing |
| `1.5` | 6px | Compact elements |
| `2` | 8px | Default small gap |
| `2.5` | 10px | Input padding |
| `3` | 12px | Button padding |
| `4` | 16px | Card padding, section gaps |
| `5` | 20px | Medium spacing |
| `6` | 24px | Large gaps |
| `8` | 32px | Section spacing |
| `10` | 40px | Major sections |
| `12` | 48px | Page sections |
| `16` | 64px | Large page sections |
| `20` | 80px | Hero spacing |
| `24` | 96px | Maximum spacing |

### Container Widths

| Name | Width | Usage |
|------|-------|-------|
| `sm` | 640px | Narrow content, forms |
| `md` | 768px | Default content |
| `lg` | 1024px | Wide content |
| `xl` | 1280px | Full-width layouts |
| `2xl` | 1400px | Maximum width |

### Grid System

- Use **CSS Grid** for page layouts
- Use **Flexbox** for component layouts
- Default gap: `16px` (4 in Tailwind)
- Card grids: `24px` gap (6 in Tailwind)

---

## Border Radius

Our design uses **generous, soft corners** for a friendly, modern feel:

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 8px | Small elements, badges, chips |
| `--radius-md` | 10px | Buttons, inputs |
| `--radius-lg` | 12px | Default radius |
| `--radius-xl` | 16px | Cards, modals |
| `--radius-2xl` | 20px | Large cards, panels |
| `--radius-full` | 9999px | Pills, avatars |

### Rules

- **Cards**: Always use `radius-xl` (16px)
- **Buttons**: Use `radius-md` (10px)
- **Inputs**: Match button radius (`radius-md`)
- **Badges/chips**: Use `radius-full` for pill shape
- **Modals/dialogs**: Use `radius-xl` (16px)

---

## Shadows

Shadows create depth and hierarchy. We use soft, diffused shadows:

### Light Mode Shadows

```css
--shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.03);
--shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.06), 0 4px 6px -4px rgb(0 0 0 / 0.06);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.07), 0 8px 10px -6px rgb(0 0 0 / 0.07);
```

### Dark Mode Shadows

Dark mode uses inset glows and subtle ring effects instead of drop shadows:

```css
--shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.4);
--shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.5), 0 1px 2px -1px rgb(0 0 0 / 0.5);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.5), 0 2px 4px -2px rgb(0 0 0 / 0.5);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.5), 0 4px 6px -4px rgb(0 0 0 / 0.5);
```

### Usage

| Shadow | Usage |
|--------|-------|
| `xs` | Inputs in rest state |
| `sm` | Cards, buttons on hover |
| `md` | Elevated cards, dropdowns |
| `lg` | Modals, dialogs |
| `xl` | Popovers, sheets |

---

## Components

### Buttons

#### Sizes

| Size | Height | Padding | Font Size |
|------|--------|---------|-----------|
| `sm` | 32px | 12px 16px | 13px |
| `default` | 40px | 12px 20px | 14px |
| `lg` | 48px | 14px 28px | 15px |
| `icon` | 40px | - | - |

#### Variants

| Variant | Usage |
|---------|-------|
| `default` | Primary actions |
| `secondary` | Secondary actions |
| `outline` | Tertiary actions |
| `ghost` | Subtle actions, toolbars |
| `destructive` | Delete, remove actions |
| `link` | Inline text links |

#### Button Rules

- Minimum touch target: 44x44px
- Always use `font-medium` (500)
- Icon + text: 8px gap
- Hover: Subtle background shift
- Active: Scale down slightly (0.98)
- Loading: Show spinner, disable interaction

### Cards

- Background: `--card`
- Border: `1px solid --border`
- Radius: `16px`
- Padding: `24px`
- Shadow: `shadow-sm` (light), none or subtle glow (dark)
- Gap between card elements: `16px`

### Inputs

- Height: `40px` (matches default button)
- Padding: `10px 14px`
- Border: `1px solid --input`
- Radius: `10px`
- Focus: `2px ring` with `--ring` color
- Placeholder: `--muted-foreground`

### Tables

- Header: `font-medium`, `--muted-foreground`
- Rows: Subtle hover state
- Borders: Horizontal only, `--border`
- Cell padding: `12px 16px`
- Use `tabular-nums` for number columns

---

## Animations & Transitions

### Duration Scale

| Token | Value | Usage |
|-------|-------|-------|
| `fast` | 100ms | Micro-interactions (opacity, color) |
| `normal` | 150ms | Standard transitions |
| `slow` | 200ms | Layout shifts |
| `slower` | 300ms | Modal enter/exit |

### Easing

| Curve | Value | Usage |
|-------|-------|-------|
| `ease-out` | `cubic-bezier(0, 0, 0.2, 1)` | Enter animations |
| `ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | Exit animations |
| `ease-in-out` | `cubic-bezier(0.4, 0, 0.2, 1)` | Symmetric animations |
| `spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Bouncy interactions |

### Default Transition

```css
transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
```

### Micro-Interactions

- **Button hover**: Background color shift, subtle lift
- **Button active**: Scale 0.98, remove shadow
- **Card hover**: Slight shadow increase
- **Focus**: Ring appears with fade-in
- **Loading**: Spinner or skeleton pulse

---

## Iconography

### Icon Sizes

| Size | Value | Usage |
|------|-------|-------|
| `xs` | 12px | Inline with small text |
| `sm` | 14px | Inline with body text |
| `md` | 16px | Default, buttons |
| `lg` | 20px | Emphasis |
| `xl` | 24px | Large buttons, navigation |
| `2xl` | 32px | Feature icons |

### Rules

- Use **Lucide** icons consistently
- Match icon stroke width to font weight context
- Icons in buttons: Same color as text
- Decorative icons: Use `--muted-foreground`

---

## Accessibility

### Color Contrast

- Body text: Minimum 4.5:1
- Large text (18px+): Minimum 3:1
- Interactive elements: Minimum 3:1
- Focus indicators: Minimum 3:1

### Focus States

- Always visible focus ring
- Ring width: 2px
- Ring offset: 2px
- Ring color: `--ring`

### Motion

- Respect `prefers-reduced-motion`
- Provide alternatives to animation-based feedback

---

## Dark Mode Guidelines

1. **Don't just invert** — Dark backgrounds should be rich, not pure black
2. **Reduce contrast slightly** — `#fafafa` on `#09090b`, not pure white on black
3. **Desaturate colors** — Bright colors vibrate; use softer variants
4. **Reduce shadow intensity** — Or use subtle glows instead
5. **Increase border visibility** — Borders help define edges in dark mode

---

## Implementation Checklist

- [ ] Geist font installed and configured
- [ ] CSS variables updated in globals.css
- [ ] Button component updated with new sizes
- [ ] Card component updated with new radius
- [ ] Input component updated with new styles
- [ ] Focus states using new ring color
- [ ] Shadow utilities defined
- [ ] Animation utilities defined
- [ ] Dark mode tested thoroughly

---

## References

- [UI/UX Design Trends 2026](https://www.index.dev/blog/ui-ux-design-trends)
- [Figma Best Fonts for Websites](https://www.figma.com/resource-library/best-fonts-for-websites/)
- [Dark Mode Best Practices](https://atmos.style/blog/dark-mode-ui-best-practices)
- [Button Design Trends 2025](https://www.accio.com/business/trending_button)
