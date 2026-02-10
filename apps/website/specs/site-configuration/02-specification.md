---
slug: site-configuration
---

# Specification: Site Configuration System

**Slug:** site-configuration
**Author:** Claude Code
**Date:** 2026-02-01
**Status:** Draft
**Ideation:** [01-ideation.md](./01-ideation.md)

---

## Overview

Create a centralized site configuration system that allows template users to easily customize their application by editing a single `site.config.ts` file at the project root. The configuration controls site identity (name, description, URL), contact emails, social links, feature toggles (cookie banner, analytics, legal pages), and SEO defaults.

**Primary Goal:** Enable toggling the cookie banner on/off via configuration, plus provide a single location for all site-wide customization.

**Key Decisions (from ideation):**
1. Config location: `site.config.ts` at project root (maximum discoverability)
2. Validation: TypeScript only (no Zod runtime validation)
3. Field requirements: All optional with sensible defaults
4. Env integration: Environment variables override config values when present
5. Cookie banner: Enable/disable toggle only (no message customization in v1)
6. Footer links: Visibility toggles only (no custom URLs)

---

## Technical Design

### Configuration File Structure

**Location:** `/site.config.ts` (project root, alongside `next.config.ts`)

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

### Type Definitions

**Location:** `/src/config/types.ts`

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

### Config Loader with Environment Override

**Location:** `/src/config/index.ts`

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

### Component Integration

#### 1. Cookie Banner (`src/layers/widgets/cookie-consent/CookieConsentBanner.tsx`)

**Current:** Always renders
**Updated:** Check `getSiteConfig().features.cookieBanner` before rendering

```typescript
// Add at component start
const config = getSiteConfig()
if (!config.features.cookieBanner) return null
```

#### 2. Root Layout (`src/app/layout.tsx`)

**Current:** Hardcoded metadata, unconditional banner render
**Updated:** Use config for metadata, conditional banner

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

#### 3. Public Footer (`src/layers/shared/ui/public-footer.tsx`)

**Current:** Hardcoded "Your Company" and static links
**Updated:** Read from config, conditionally show links

```typescript
import { getSiteConfig } from '@/config'

export function PublicFooter() {
  const config = getSiteConfig()

  return (
    <footer>
      <p>© {new Date().getFullYear()} {config.name}</p>
      <nav>
        {config.features.legalPages.privacy && <Link href="/privacy">Privacy</Link>}
        {config.features.legalPages.terms && <Link href="/terms">Terms</Link>}
        {config.features.legalPages.cookies && <Link href="/cookies">Cookies</Link>}
      </nav>
      {/* Social links */}
      {config.links.twitter && <a href={config.links.twitter}>Twitter</a>}
      {config.links.github && <a href={config.links.github}>GitHub</a>}
    </footer>
  )
}
```

#### 4. Privacy Page (`src/app/(public)/privacy/page.tsx`)

**Current:** Hardcoded "Your Company" and email
**Updated:** Read from config

```typescript
import { getSiteConfig } from '@/config'

export default function PrivacyPage() {
  const config = getSiteConfig()

  // Use config.name instead of "Your Company"
  // Use config.contact.privacyEmail instead of hardcoded email
}
```

#### 5. Terms Page (`src/app/(public)/terms/page.tsx`)

Same pattern as Privacy page, using `config.name` and `config.contact.legalEmail`.

### Documentation

**Location:** `/developer-guides/12-site-configuration.md`

The guide should include:
1. Overview of the configuration system
2. Configuration file location and structure
3. Available settings with descriptions and types
4. Environment variable overrides
5. Feature toggles reference table
6. Integration examples (how components use config)
7. Adding new configuration options

**Update INDEX.md:** Add entry for guide 12 with patterns:
- `site.config.ts`
- `src/config/**`

---

## Implementation Phases

### Phase 1: Core Configuration Infrastructure

1. Create type definitions (`src/config/types.ts`)
2. Create config loader with env override (`src/config/index.ts`)
3. Create root config file (`site.config.ts`)
4. Add TypeScript path alias if needed

### Phase 2: Cookie Banner Integration

1. Update `CookieConsentBanner.tsx` to check config
2. Verify banner respects `features.cookieBanner` toggle
3. Test with config enabled/disabled

### Phase 3: Component Updates

1. Update `layout.tsx` metadata to use config
2. Update `PublicFooter` to use config for name and conditional links
3. Update `privacy/page.tsx` to use config
4. Update `terms/page.tsx` to use config

### Phase 4: Documentation

1. Create `developer-guides/12-site-configuration.md`
2. Update `developer-guides/INDEX.md` with new guide entry
3. Update main `CLAUDE.md` if needed

---

## Files to Create

| File | Purpose |
|------|---------|
| `site.config.ts` | Root configuration file |
| `src/config/types.ts` | TypeScript type definitions |
| `src/config/index.ts` | Config loader with env override |
| `developer-guides/12-site-configuration.md` | Configuration documentation |

## Files to Modify

| File | Changes |
|------|---------|
| `src/layers/widgets/cookie-consent/CookieConsentBanner.tsx` | Add config check before rendering |
| `src/app/layout.tsx` | Use config for metadata |
| `src/layers/shared/ui/public-footer.tsx` | Use config for name, conditional links |
| `src/app/(public)/privacy/page.tsx` | Use config for company name and email |
| `src/app/(public)/terms/page.tsx` | Use config for company name and email |
| `developer-guides/INDEX.md` | Add guide 12 entry |
| `tsconfig.json` | Add `@/config` path alias (if not covered by existing aliases) |

---

## Acceptance Criteria

### Functional Requirements

- [ ] `site.config.ts` exists at project root with all configuration options
- [ ] Setting `features.cookieBanner: false` hides the cookie consent banner
- [ ] Setting `features.legalPages.privacy: false` hides privacy link in footer
- [ ] Company name in footer and legal pages reflects `name` config value
- [ ] Contact emails in legal pages reflect `contact.*Email` config values
- [ ] Environment variables override config values when set
- [ ] TypeScript provides autocomplete and type checking for all config options

### Non-Regression Requirements

- [ ] Cookie banner still functions correctly when enabled (localStorage, PostHog events)
- [ ] Legal pages still render correctly with their full content
- [ ] Footer links still work when visible
- [ ] Site metadata still appears correctly in browser tabs and OG tags
- [ ] No TypeScript errors introduced
- [ ] No runtime errors on page load

### Documentation Requirements

- [ ] Developer guide 12 created with comprehensive configuration reference
- [ ] INDEX.md updated with guide 12 patterns
- [ ] Each configuration option documented with type and default value
- [ ] Environment variable overrides documented

---

## Testing Strategy

### Manual Testing Checklist

1. **Cookie Banner Toggle:**
   - Set `features.cookieBanner: true` → banner appears on first visit
   - Set `features.cookieBanner: false` → banner never appears
   - Set `NEXT_PUBLIC_COOKIE_BANNER_ENABLED=false` → env overrides config

2. **Company Name:**
   - Change `name` in config → footer and legal pages reflect change
   - Set `NEXT_PUBLIC_SITE_NAME` → env overrides config

3. **Legal Pages Visibility:**
   - Toggle each `legalPages.*` setting → footer links appear/disappear
   - Direct URL to disabled page still works (just not linked)

4. **Social Links:**
   - Add `links.twitter` → Twitter link appears in footer
   - Remove `links.twitter` → no Twitter link in footer

---

## Out of Scope (Deferred)

- Cookie banner message/button customization
- Custom URLs for footer links (external legal pages)
- Runtime configuration (admin UI)
- Database-backed settings
- Per-user configuration preferences
- Zod runtime validation
- Theme/color customization via config

---

## Dependencies

- None (uses existing TypeScript, no new packages)

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking existing functionality | Low | Medium | Thorough testing of all affected components |
| TypeScript path resolution issues | Low | Low | Use existing `@/` alias pattern |
| Env var parsing edge cases | Low | Low | Use explicit boolean parsing function |

---

## Open Questions

None - all clarifications resolved during ideation-to-spec process.
