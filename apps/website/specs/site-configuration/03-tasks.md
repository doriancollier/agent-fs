# Task Breakdown: Site Configuration System

**Generated:** 2026-02-01
**Source:** specs/site-configuration/02-specification.md
**Last Decompose:** 2026-02-01

## Overview

Create a centralized site configuration system that allows template users to customize their application by editing a single `site.config.ts` file at the project root. The configuration controls site identity, contact emails, social links, feature toggles (including cookie banner), and SEO defaults.

## Phase 1: Core Configuration Infrastructure

### Task 1.1: Create Type Definitions

**Description**: Create TypeScript interface for site configuration
**Size**: Small
**Priority**: High
**Dependencies**: None
**Can run parallel with**: None (foundation task)

**Technical Requirements**:
- Create `src/config/types.ts` with complete `SiteConfig` interface
- All fields documented with JSDoc comments
- Optional fields properly typed with `?` modifier
- Type-safe nested objects for contact, links, features, seo

**Implementation**:

Create file `src/config/types.ts`:

```typescript
// src/config/types.ts

export interface SiteConfig {
  /** Site/company name - displayed in footer, legal pages, metadata */
  name: string

  /** Site description - used in metadata */
  description: string

  /** Base URL - used for canonical URLs, OG tags, sitemap */
  url: string

  /** Contact information */
  contact: {
    /** General contact email */
    email?: string
    /** Privacy-related inquiries */
    privacyEmail?: string
    /** Legal inquiries */
    legalEmail?: string
  }

  /** Social media links */
  links: {
    twitter?: string
    github?: string
    linkedin?: string
  }

  /** Feature toggles */
  features: {
    /** Show cookie consent banner */
    cookieBanner: boolean
    /** Enable analytics tracking (PostHog) */
    analytics: boolean
    /** Legal pages visibility */
    legalPages: {
      privacy: boolean
      terms: boolean
      cookies: boolean
    }
  }

  /** SEO configuration */
  seo: {
    /** Default Open Graph image URL */
    ogImage?: string
    /** Twitter card type */
    twitterCard?: 'summary' | 'summary_large_image'
  }
}
```

**Acceptance Criteria**:
- [ ] File created at `src/config/types.ts`
- [ ] All properties have JSDoc comments explaining their purpose
- [ ] TypeScript compiles without errors (`pnpm typecheck`)
- [ ] Optional properties use `?` modifier correctly
- [ ] Interface can be imported from other files

---

### Task 1.2: Create Config Loader with Environment Override

**Description**: Create config loader that merges config file with environment variable overrides
**Size**: Medium
**Priority**: High
**Dependencies**: Task 1.1 (type definitions)
**Can run parallel with**: None

**Technical Requirements**:
- Create `src/config/index.ts` with `getSiteConfig()` function
- Environment variables override config file values
- Boolean parsing for `NEXT_PUBLIC_*_ENABLED` variables
- Re-export types and base config for convenience

**Implementation**:

Create file `src/config/index.ts`:

```typescript
// src/config/index.ts
import { siteConfig as baseConfig } from '../../site.config'
import type { SiteConfig } from './types'

/**
 * Get site configuration with environment variable overrides.
 *
 * Environment variables take precedence over config file values:
 * - NEXT_PUBLIC_SITE_NAME → name
 * - NEXT_PUBLIC_SITE_URL → url
 * - NEXT_PUBLIC_SITE_DESCRIPTION → description
 * - NEXT_PUBLIC_ANALYTICS_ENABLED → features.analytics
 * - NEXT_PUBLIC_COOKIE_BANNER_ENABLED → features.cookieBanner
 */
export function getSiteConfig(): SiteConfig {
  return {
    ...baseConfig,
    name: process.env.NEXT_PUBLIC_SITE_NAME ?? baseConfig.name,
    url: process.env.NEXT_PUBLIC_SITE_URL ?? baseConfig.url,
    description: process.env.NEXT_PUBLIC_SITE_DESCRIPTION ?? baseConfig.description,
    features: {
      ...baseConfig.features,
      cookieBanner: parseBooleanEnv(
        process.env.NEXT_PUBLIC_COOKIE_BANNER_ENABLED,
        baseConfig.features.cookieBanner
      ),
      analytics: parseBooleanEnv(
        process.env.NEXT_PUBLIC_ANALYTICS_ENABLED,
        baseConfig.features.analytics
      ),
    },
  }
}

function parseBooleanEnv(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback
  return value.toLowerCase() === 'true'
}

// Re-export for convenience
export type { SiteConfig } from './types'
export { siteConfig as baseConfig } from '../../site.config'
```

**Acceptance Criteria**:
- [ ] File created at `src/config/index.ts`
- [ ] `getSiteConfig()` returns complete config object
- [ ] Environment variables override config values when set
- [ ] `parseBooleanEnv` handles `undefined`, `'true'`, `'false'` (case-insensitive)
- [ ] Types and base config are re-exported
- [ ] TypeScript compiles without errors

---

### Task 1.3: Create Root Configuration File

**Description**: Create the user-facing configuration file at project root
**Size**: Small
**Priority**: High
**Dependencies**: Task 1.1 (type definitions)
**Can run parallel with**: Task 1.2 (config loader)

**Technical Requirements**:
- Create `site.config.ts` at project root (alongside `next.config.ts`)
- Include all configuration options with sensible defaults
- Well-commented for discoverability
- Easy for template users to customize

**Implementation**:

Create file `site.config.ts` at project root:

```typescript
// site.config.ts
import type { SiteConfig } from '@/config/types'

export const siteConfig: SiteConfig = {
  // Site Identity
  name: 'Your Company',
  description: 'Your app description',
  url: 'https://yourcompany.com',

  // Contact Emails
  contact: {
    email: 'hello@yourcompany.com',
    privacyEmail: 'privacy@yourcompany.com',
    legalEmail: 'legal@yourcompany.com',
  },

  // Social Links (optional)
  links: {
    twitter: undefined,
    github: undefined,
    linkedin: undefined,
  },

  // Feature Toggles
  features: {
    cookieBanner: true,
    analytics: true,
    legalPages: {
      privacy: true,
      terms: true,
      cookies: true,
    },
  },

  // SEO Defaults
  seo: {
    ogImage: undefined,
    twitterCard: 'summary_large_image',
  },
}
```

**Acceptance Criteria**:
- [ ] File created at project root as `site.config.ts`
- [ ] All SiteConfig properties are defined
- [ ] TypeScript provides autocomplete when editing
- [ ] File follows existing project code style
- [ ] Comments explain each section's purpose

---

## Phase 2: Cookie Banner Integration

### Task 2.1: Update Cookie Banner to Respect Config

**Description**: Modify CookieConsentBanner to check `features.cookieBanner` before rendering
**Size**: Small
**Priority**: High
**Dependencies**: Task 1.2 (config loader ready)
**Can run parallel with**: None

**Technical Requirements**:
- Import `getSiteConfig` from `@/config`
- Check `config.features.cookieBanner` before rendering
- Return `null` early if cookie banner is disabled
- Preserve all existing functionality when enabled

**File to Modify**: `src/layers/widgets/cookie-consent/CookieConsentBanner.tsx`

**Current Implementation** (lines 37-131):
```typescript
export function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    // Check if user has already made a choice
    const consent = getStoredConsent()
    if (consent === null) {
      // Small delay to prevent flash on page load
      const timer = setTimeout(() => setIsVisible(true), 500)
      return () => clearTimeout(timer)
    }
  }, [])
  // ... rest of component
```

**Updated Implementation**:

Add import at top of file:
```typescript
import { getSiteConfig } from '@/config'
```

Update component to check config at the start:
```typescript
export function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  // Check if cookie banner is enabled in config
  const config = getSiteConfig()

  useEffect(() => {
    // If cookie banner is disabled, don't show it
    if (!config.features.cookieBanner) return

    // Check if user has already made a choice
    const consent = getStoredConsent()
    if (consent === null) {
      // Small delay to prevent flash on page load
      const timer = setTimeout(() => setIsVisible(true), 500)
      return () => clearTimeout(timer)
    }
  }, [config.features.cookieBanner])

  // Early return if banner is disabled via config
  if (!config.features.cookieBanner) return null

  if (!isVisible) return null

  // ... rest of component unchanged
```

**Acceptance Criteria**:
- [ ] Import added for `getSiteConfig`
- [ ] Config check added at component start
- [ ] Returns `null` when `features.cookieBanner` is `false`
- [ ] Banner functions normally when `features.cookieBanner` is `true`
- [ ] No TypeScript errors
- [ ] Manual test: `features.cookieBanner: false` → banner never appears
- [ ] Manual test: `features.cookieBanner: true` → banner appears as before

---

## Phase 3: Component Updates

### Task 3.1: Update Root Layout Metadata

**Description**: Update layout.tsx to use config for metadata generation
**Size**: Medium
**Priority**: Medium
**Dependencies**: Task 1.2 (config loader ready)
**Can run parallel with**: Task 3.2, 3.3, 3.4

**Technical Requirements**:
- Import `getSiteConfig` from `@/config`
- Replace hardcoded metadata with dynamic values from config
- Use `generateMetadata` async function pattern
- Include title template, description, metadataBase, openGraph, twitter

**File to Modify**: `src/app/layout.tsx`

**Current Implementation** (lines 8-11):
```typescript
export const metadata: Metadata = {
  title: 'Next.js Boilerplate',
  description: 'A production-ready Next.js 16 boilerplate with modern tooling',
}
```

**Updated Implementation**:

Replace static `metadata` export with `generateMetadata` function:

```typescript
import { getSiteConfig } from '@/config'

export async function generateMetadata(): Promise<Metadata> {
  const config = getSiteConfig()
  return {
    title: {
      default: config.name,
      template: `%s | ${config.name}`,
    },
    description: config.description,
    metadataBase: new URL(config.url),
    openGraph: {
      siteName: config.name,
      images: config.seo.ogImage ? [config.seo.ogImage] : undefined,
    },
    twitter: {
      card: config.seo.twitterCard,
    },
  }
}
```

**Acceptance Criteria**:
- [ ] `generateMetadata` function replaces static `metadata` export
- [ ] Site name from config appears in browser tab
- [ ] Title template works (e.g., "Privacy Policy | Your Company")
- [ ] metadataBase set correctly for canonical URLs
- [ ] OpenGraph siteName uses config.name
- [ ] Twitter card type uses config.seo.twitterCard
- [ ] No TypeScript errors

---

### Task 3.2: Update PublicFooter Component

**Description**: Update footer to use config for company name and conditional legal links
**Size**: Medium
**Priority**: Medium
**Dependencies**: Task 1.2 (config loader ready)
**Can run parallel with**: Task 3.1, 3.3, 3.4

**Technical Requirements**:
- Import `getSiteConfig` from `@/config`
- Replace hardcoded "Your Company" with `config.name`
- Conditionally render legal page links based on `config.features.legalPages`
- Conditionally render social links if defined in `config.links`

**File to Modify**: `src/layers/shared/ui/public-footer.tsx`

**Current Implementation**:
```typescript
import Link from 'next/link'

export function PublicFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t bg-muted/30">
      <div className="container-default py-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          {/* Brand / Copyright */}
          <div className="space-y-1">
            <p className="text-sm font-medium">Your Company</p>
            <p className="text-xs text-muted-foreground">
              © {currentYear} Your Company. All rights reserved.
            </p>
          </div>

          {/* Legal Links */}
          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            <Link
              href="/privacy"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Terms of Service
            </Link>
            <Link
              href="/cookies"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Cookie Policy
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
```

**Updated Implementation**:

```typescript
import Link from 'next/link'
import { getSiteConfig } from '@/config'

export function PublicFooter() {
  const config = getSiteConfig()
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t bg-muted/30">
      <div className="container-default py-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          {/* Brand / Copyright */}
          <div className="space-y-1">
            <p className="text-sm font-medium">{config.name}</p>
            <p className="text-xs text-muted-foreground">
              © {currentYear} {config.name}. All rights reserved.
            </p>
          </div>

          {/* Legal Links */}
          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            {config.features.legalPages.privacy && (
              <Link
                href="/privacy"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Privacy Policy
              </Link>
            )}
            {config.features.legalPages.terms && (
              <Link
                href="/terms"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Terms of Service
              </Link>
            )}
            {config.features.legalPages.cookies && (
              <Link
                href="/cookies"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Cookie Policy
              </Link>
            )}
          </nav>

          {/* Social Links (if any defined) */}
          {(config.links.twitter || config.links.github || config.links.linkedin) && (
            <nav className="flex gap-4">
              {config.links.twitter && (
                <a
                  href={config.links.twitter}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter"
                >
                  Twitter
                </a>
              )}
              {config.links.github && (
                <a
                  href={config.links.github}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                >
                  GitHub
                </a>
              )}
              {config.links.linkedin && (
                <a
                  href={config.links.linkedin}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                >
                  LinkedIn
                </a>
              )}
            </nav>
          )}
        </div>
      </div>
    </footer>
  )
}
```

**Acceptance Criteria**:
- [ ] Import added for `getSiteConfig`
- [ ] Company name from config replaces hardcoded "Your Company"
- [ ] Legal links conditionally render based on `features.legalPages.*`
- [ ] Social links conditionally render when defined
- [ ] Social links have `target="_blank"` and `rel="noopener noreferrer"`
- [ ] No TypeScript errors
- [ ] Manual test: Toggle `features.legalPages.privacy: false` → privacy link hidden

---

### Task 3.3: Update Privacy Page

**Description**: Update privacy page to use config for company name and contact email
**Size**: Small
**Priority**: Medium
**Dependencies**: Task 1.2 (config loader ready)
**Can run parallel with**: Task 3.1, 3.2, 3.4

**Technical Requirements**:
- Import `getSiteConfig` from `@/config`
- Replace all instances of "Your Company" with `config.name`
- Replace hardcoded `privacy@yourcompany.com` with `config.contact.privacyEmail`
- Preserve existing page structure and content

**File to Modify**: `src/app/(public)/privacy/page.tsx`

**Changes Required**:

1. Add import at top:
```typescript
import { getSiteConfig } from '@/config'
```

2. Get config at component start:
```typescript
export default function PrivacyPolicyPage() {
  const config = getSiteConfig()
```

3. Replace "Your Company" with `{config.name}` (multiple locations):
   - Line 22: `Your Company (&quot;we&quot;...` → `{config.name} (&quot;we&quot;...`

4. Replace email at end:
```typescript
<a href={`mailto:${config.contact.privacyEmail ?? 'privacy@example.com'}`} className="text-primary hover:underline">
  {config.contact.privacyEmail ?? 'privacy@example.com'}
</a>
```

**Acceptance Criteria**:
- [ ] Import added for `getSiteConfig`
- [ ] All instances of "Your Company" replaced with config.name
- [ ] Privacy email uses `config.contact.privacyEmail` with fallback
- [ ] Page renders correctly with custom config values
- [ ] No TypeScript errors

---

### Task 3.4: Update Terms Page

**Description**: Update terms page to use config for company name and contact email
**Size**: Small
**Priority**: Medium
**Dependencies**: Task 1.2 (config loader ready)
**Can run parallel with**: Task 3.1, 3.2, 3.3

**Technical Requirements**:
- Import `getSiteConfig` from `@/config`
- Replace all instances of "Your Company" with `config.name`
- Replace hardcoded `legal@yourcompany.com` with `config.contact.legalEmail`
- Preserve existing page structure and content

**File to Modify**: `src/app/(public)/terms/page.tsx`

**Changes Required**:

1. Add import at top:
```typescript
import { getSiteConfig } from '@/config'
```

2. Get config at component start:
```typescript
export default function TermsOfServicePage() {
  const config = getSiteConfig()
```

3. Replace "Your Company" with `{config.name}` in these sections:
   - Description of Service section (line 31): "Your Company provides..."
   - Intellectual Property section (line 71): "owned by Your Company"
   - Limitation of Liability section (line 122): "Your Company, its directors..."
   - Indemnification section (line 132): "Your Company and its affiliates"

4. Replace email at end:
```typescript
<a href={`mailto:${config.contact.legalEmail ?? 'legal@example.com'}`} className="text-primary hover:underline">
  {config.contact.legalEmail ?? 'legal@example.com'}
</a>
```

**Acceptance Criteria**:
- [ ] Import added for `getSiteConfig`
- [ ] All instances of "Your Company" replaced with config.name
- [ ] Legal email uses `config.contact.legalEmail` with fallback
- [ ] Page renders correctly with custom config values
- [ ] No TypeScript errors

---

## Phase 4: Documentation

### Task 4.1: Create Site Configuration Developer Guide

**Description**: Create comprehensive documentation for the configuration system
**Size**: Medium
**Priority**: Medium
**Dependencies**: All Phase 1-3 tasks
**Can run parallel with**: Task 4.2

**Technical Requirements**:
- Create `developer-guides/12-site-configuration.md`
- Follow AI-optimized format used by other guides
- Include: overview, configuration structure, environment overrides, feature toggles, integration examples, adding new options

**Implementation**:

Create file `developer-guides/12-site-configuration.md`:

```markdown
# Site Configuration

## Quick Reference

| Config Location | Purpose |
|-----------------|---------|
| `site.config.ts` | Root configuration file |
| `src/config/types.ts` | TypeScript interface |
| `src/config/index.ts` | Config loader with env override |

| Environment Variable | Config Override | Type |
|---------------------|-----------------|------|
| `NEXT_PUBLIC_SITE_NAME` | `name` | string |
| `NEXT_PUBLIC_SITE_URL` | `url` | string |
| `NEXT_PUBLIC_SITE_DESCRIPTION` | `description` | string |
| `NEXT_PUBLIC_COOKIE_BANNER_ENABLED` | `features.cookieBanner` | boolean |
| `NEXT_PUBLIC_ANALYTICS_ENABLED` | `features.analytics` | boolean |

## Configuration Structure

### Complete Interface

\`\`\`typescript
interface SiteConfig {
  // Site Identity
  name: string              // Company/site name
  description: string       // Site description for metadata
  url: string              // Base URL for canonical links

  // Contact Information
  contact: {
    email?: string          // General contact
    privacyEmail?: string   // Privacy inquiries
    legalEmail?: string     // Legal inquiries
  }

  // Social Links
  links: {
    twitter?: string
    github?: string
    linkedin?: string
  }

  // Feature Toggles
  features: {
    cookieBanner: boolean   // Show/hide cookie consent banner
    analytics: boolean      // Enable PostHog analytics
    legalPages: {
      privacy: boolean      // Show privacy link in footer
      terms: boolean        // Show terms link in footer
      cookies: boolean      // Show cookies link in footer
    }
  }

  // SEO Configuration
  seo: {
    ogImage?: string        // Default Open Graph image
    twitterCard?: 'summary' | 'summary_large_image'
  }
}
\`\`\`

## Usage Patterns

### Reading Configuration

\`\`\`typescript
import { getSiteConfig } from '@/config'

// In a component or page
const config = getSiteConfig()
console.log(config.name)  // "Your Company"
\`\`\`

### Conditional Rendering

\`\`\`typescript
const config = getSiteConfig()

// Feature toggle pattern
if (!config.features.cookieBanner) return null

// Conditional links
{config.features.legalPages.privacy && <Link href="/privacy">Privacy</Link>}
\`\`\`

### Environment Override

Environment variables take precedence over config file values:

\`\`\`bash
# .env.local
NEXT_PUBLIC_SITE_NAME=Production Site
NEXT_PUBLIC_COOKIE_BANNER_ENABLED=false
\`\`\`

## Feature Toggles Reference

| Toggle | Default | Effect |
|--------|---------|--------|
| `features.cookieBanner` | `true` | Show/hide cookie consent banner |
| `features.analytics` | `true` | Enable/disable PostHog tracking |
| `features.legalPages.privacy` | `true` | Show/hide privacy link in footer |
| `features.legalPages.terms` | `true` | Show/hide terms link in footer |
| `features.legalPages.cookies` | `true` | Show/hide cookies link in footer |

## Adding New Configuration Options

1. **Add to interface** (`src/config/types.ts`):
\`\`\`typescript
export interface SiteConfig {
  // ... existing fields
  newOption: string
}
\`\`\`

2. **Add to config file** (`site.config.ts`):
\`\`\`typescript
export const siteConfig: SiteConfig = {
  // ... existing values
  newOption: 'default value',
}
\`\`\`

3. **Add env override** (optional, `src/config/index.ts`):
\`\`\`typescript
export function getSiteConfig(): SiteConfig {
  return {
    ...baseConfig,
    newOption: process.env.NEXT_PUBLIC_NEW_OPTION ?? baseConfig.newOption,
  }
}
\`\`\`

4. **Use in components**:
\`\`\`typescript
const config = getSiteConfig()
// Use config.newOption
\`\`\`

## Anti-Patterns

| Don't | Do Instead |
|-------|------------|
| Import from `../../site.config` directly | Use `getSiteConfig()` from `@/config` |
| Hardcode site name in components | Use `config.name` |
| Check env vars directly in components | Let config loader handle env overrides |

## Troubleshooting

### Config Changes Not Reflected

**Symptom**: Changed `site.config.ts` but pages show old values

**Cause**: Next.js caching

**Solution**: Restart dev server or clear `.next` cache

### Environment Override Not Working

**Symptom**: Set env var but config value unchanged

**Checklist**:
1. Variable starts with `NEXT_PUBLIC_`?
2. Variable in `.env.local` (not `.env`)?
3. Dev server restarted after adding env var?
4. Boolean values are exactly `'true'` or `'false'`?

### TypeScript Errors in Config

**Symptom**: Type errors when editing `site.config.ts`

**Solution**: Ensure all required fields are present. Run `pnpm typecheck` to see specific errors.
```

**Acceptance Criteria**:
- [ ] File created at `developer-guides/12-site-configuration.md`
- [ ] Quick Reference table at top
- [ ] Complete interface documented
- [ ] Usage patterns with code examples
- [ ] Environment override documentation
- [ ] Feature toggles reference table
- [ ] Adding new options guide
- [ ] Anti-patterns section
- [ ] Troubleshooting section

---

### Task 4.2: Update INDEX.md with Guide 12 Entry

**Description**: Add entry for site configuration guide to the documentation index
**Size**: Small
**Priority**: Medium
**Dependencies**: Task 4.1
**Can run parallel with**: None

**Technical Requirements**:
- Add guide 12 to Guide Coverage Map table
- Add pattern matching rules to YAML section
- Add maintenance tracking entry

**File to Modify**: `developer-guides/INDEX.md`

**Changes Required**:

1. Add to Guide Coverage Map table (after line 23):
```markdown
| [12-site-configuration.md](./12-site-configuration.md) | Site configuration, feature toggles, env overrides | `site.config.ts`, `src/config/**` |
```

2. Add to Pattern Matching Reference YAML section (after the 11-parallel-execution.md section):
```yaml
# Guide: 12-site-configuration.md
patterns:
  - "site.config.ts"
  - "src/config/**"
keywords:
  - "siteConfig"
  - "getSiteConfig"
  - "SiteConfig"
  - "cookieBanner"
  - "legalPages"
  - "site configuration"
  - "feature toggle"
```

3. Add to Maintenance Tracking table:
```markdown
| 12-site-configuration.md | 2026-02-01 | Claude | Created: Site configuration system, feature toggles, env overrides |
```

**Acceptance Criteria**:
- [ ] Guide 12 added to coverage map table
- [ ] Pattern matching YAML added
- [ ] Maintenance tracking entry added
- [ ] All patterns are valid globs

---

## Summary

### Task Count by Phase

| Phase | Tasks | Can Parallelize |
|-------|-------|-----------------|
| Phase 1: Core Infrastructure | 3 | Task 1.2 & 1.3 after 1.1 |
| Phase 2: Cookie Banner | 1 | None |
| Phase 3: Component Updates | 4 | All 4 tasks can run parallel |
| Phase 4: Documentation | 2 | Task 4.1 & 4.2 sequential |
| **Total** | **10** | |

### Dependency Graph

```
Task 1.1 (types)
    ├── Task 1.2 (loader)
    │       └── Task 2.1 (cookie banner)
    │       └── Task 3.1 (layout) ─┐
    │       └── Task 3.2 (footer) ─┼── All parallel
    │       └── Task 3.3 (privacy)─┤
    │       └── Task 3.4 (terms) ──┘
    │               └── Task 4.1 (guide)
    │                       └── Task 4.2 (index)
    └── Task 1.3 (config file) [parallel with 1.2]
```

### Critical Path

1. Task 1.1 → Task 1.2 → Task 2.1 → Task 3.1-3.4 → Task 4.1 → Task 4.2

### Parallel Execution Opportunities

- **Batch 1**: Task 1.1 (foundation)
- **Batch 2**: Tasks 1.2 + 1.3 (can run in parallel after 1.1)
- **Batch 3**: Task 2.1 (cookie banner, needs 1.2)
- **Batch 4**: Tasks 3.1 + 3.2 + 3.3 + 3.4 (all component updates, needs 1.2)
- **Batch 5**: Task 4.1 (documentation, needs all above)
- **Batch 6**: Task 4.2 (index update, needs 4.1)
