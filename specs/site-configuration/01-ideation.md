# Site Configuration System

**Slug:** site-configuration
**Author:** Claude Code
**Date:** 2026-02-01
**Branch:** preflight/site-configuration
**Related:** N/A

---

## 1) Intent & Assumptions

- **Task brief:** Create a site configuration system that allows toggling features like the cookie banner on/off, identify other commonly-needed configuration options for template users, determine where the configuration file should live and how it should work, and create documentation for this configuration.
- **Assumptions:**
  - The app is a boilerplate/template meant for others to customize
  - Configuration should be developer-friendly with TypeScript support
  - Documentation should follow existing project patterns (developer-guides/)
  - Configuration should be static (compile-time) rather than runtime/database-backed
- **Out of scope:**
  - Runtime configuration changes (admin UI)
  - Database-backed settings
  - Per-user configuration preferences

## 2) Pre-reading Log

| File | Key Takeaway |
|------|--------------|
| `src/layers/widgets/cookie-consent/CookieConsentBanner.tsx` | Cookie banner uses localStorage, integrates with PostHog, always renders in layout |
| `src/app/layout.tsx` | CookieConsentBanner rendered unconditionally at line 34 |
| `src/app/providers.tsx` | Client providers (QueryClient, ThemeProvider) - no site config present |
| `src/env.ts` | T3 Env configuration exists, but only for environment variables |
| `developer-guides/INDEX.md` | 11 guides exist, no site configuration guide - guide 12 available |
| `src/layers/shared/ui/public-footer.tsx` | Footer hardcodes "Your Company" and static links |
| `src/app/(public)/privacy/page.tsx` | Privacy page hardcodes "Your Company" and email |
| `src/app/(public)/terms/page.tsx` | Terms page hardcodes "Your Company" and email |
| `README.md` | Project documentation exists but no site config docs |
| `developer-guides/10-metadata-seo.md` | Metadata patterns exist but separate from site config |

## 3) Codebase Map

### Configuration Status

| Aspect | Current State |
|--------|---------------|
| Site configuration file | Does NOT exist |
| Configuration pattern | Only environment variables (T3 Env in `src/env.ts`) |
| Feature flags | None implemented |

### Hardcoded Values Found

| Location | Hardcoded Value |
|----------|-----------------|
| `src/layers/shared/ui/public-footer.tsx` | "Your Company", copyright year |
| `src/app/(public)/privacy/page.tsx` | "Your Company", `privacy@yourcompany.com` |
| `src/app/(public)/terms/page.tsx` | "Your Company", `legal@yourcompany.com` |
| `src/layers/widgets/cookie-consent/CookieConsentBanner.tsx` | Banner message text, button labels |
| `src/app/layout.tsx` | Site metadata (could be unified) |

### Primary Components/Modules

| Component | Path | Role |
|-----------|------|------|
| CookieConsentBanner | `src/layers/widgets/cookie-consent/` | Renders cookie consent UI, manages localStorage |
| PublicFooter | `src/layers/shared/ui/public-footer.tsx` | Footer with hardcoded company name and links |
| PrivacyPage | `src/app/(public)/privacy/page.tsx` | Privacy policy with hardcoded "Your Company" |
| TermsPage | `src/app/(public)/terms/page.tsx` | Terms with hardcoded company name and emails |
| Root Layout | `src/app/layout.tsx` | Renders cookie banner unconditionally |
| Providers | `src/app/providers.tsx` | QueryClient, ThemeProvider setup |
| T3 Env | `src/env.ts` | Environment variable validation |

### Data Flow (Cookie Banner)

```
Root layout → CookieConsentBanner → checks localStorage → shows/hides banner
                                 → on accept/decline → stores in localStorage + PostHog event
```

### Potential Blast Radius

| Area | Files Affected |
|------|----------------|
| Cookie Banner Toggle | `layout.tsx`, `CookieConsentBanner.tsx` |
| Company Name | `public-footer.tsx`, `privacy/page.tsx`, `terms/page.tsx` |
| Contact Emails | `privacy/page.tsx`, `terms/page.tsx` |
| Site Metadata | `layout.tsx`, potentially all pages with custom metadata |

## 4) Root Cause Analysis

N/A - This is a feature request, not a bug fix.

## 5) Research

### Configuration File Patterns in Next.js Projects

**Industry Standard: `config/site.ts` pattern** (used by shadcn/taxonomy)

```typescript
// config/site.ts
import { SiteConfig } from "types"

export const siteConfig: SiteConfig = {
  name: "Taxonomy",
  description: "An open source application...",
  url: "https://tx.shadcn.com",
  ogImage: "https://tx.shadcn.com/og.jpg",
  links: {
    twitter: "https://twitter.com/shadcn",
    github: "https://github.com/shadcn/taxonomy",
  },
}
```

**Extended Pattern: `site.config.ts` with feature toggles** (used by nextjs-notion-starter-kit)

Includes:
- Site identity (name, domain, author, description)
- Social links (twitter, github, linkedin, etc.)
- Visual defaults (icons, cover images)
- **Feature toggles** (`isPreviewImageSupportEnabled`, `isRedisEnabled`)
- Navigation configuration

### Potential Solutions

#### 1. Single Config File (`src/config/site.ts`)

**Description:** All site configuration in one typed file at `src/config/site.ts`

**Pros:**
- Simple, single source of truth
- Easy to find and modify
- Type-safe with TypeScript
- Follows shadcn/taxonomy pattern (familiar to Shadcn users)
- Good for templates/boilerplates

**Cons:**
- File can grow large with many settings
- No separation of concerns

**Complexity:** Low

#### 2. Segmented Config Files (`src/config/*.ts`)

**Description:** Separate files for different concerns: `site.ts`, `features.ts`, `social.ts`

**Pros:**
- Better organization
- Easier to navigate specific settings
- Changes are more isolated

**Cons:**
- More files to manage
- Import complexity
- Overkill for a boilerplate

**Complexity:** Medium

#### 3. Environment-Only Configuration

**Description:** All settings via `NEXT_PUBLIC_*` environment variables

**Pros:**
- Easy deployment customization
- No code changes needed for different environments

**Cons:**
- No type safety for complex objects
- Verbose for many settings
- Poor developer experience
- Not suitable for structured data (objects, arrays)

**Complexity:** Low (but limited)

### Recommendation

**Recommended Approach:** Single Config File (`src/config/site.ts`)

**Rationale:**
1. Follows established patterns (shadcn/taxonomy)
2. Type-safe and developer-friendly
3. Appropriate complexity for a boilerplate
4. Easy to extend as needed
5. Clear single location for customization

### Suggested Configuration Structure

```typescript
// src/config/site.ts
import { z } from 'zod'

const siteConfigSchema = z.object({
  // Site Identity
  name: z.string(),
  description: z.string(),
  url: z.string().url(),

  // Contact
  contact: z.object({
    email: z.string().email().optional(),
    privacyEmail: z.string().email().optional(),
    legalEmail: z.string().email().optional(),
  }),

  // Social Links
  links: z.object({
    twitter: z.string().url().optional(),
    github: z.string().url().optional(),
    linkedin: z.string().url().optional(),
  }),

  // Feature Toggles
  features: z.object({
    cookieBanner: z.object({
      enabled: z.boolean(),
      message: z.string().optional(),
    }),
    analytics: z.object({
      enabled: z.boolean(),
      posthogKey: z.string().optional(),
    }),
    legalPages: z.object({
      privacyEnabled: z.boolean(),
      termsEnabled: z.boolean(),
      cookiesEnabled: z.boolean(),
    }),
  }),

  // SEO Defaults
  seo: z.object({
    ogImage: z.string().url().optional(),
    twitterCard: z.enum(['summary', 'summary_large_image']).optional(),
  }),
})

export type SiteConfig = z.infer<typeof siteConfigSchema>

export const siteConfig: SiteConfig = {
  name: 'Your Company',
  description: 'Your app description',
  url: 'https://yourcompany.com',

  contact: {
    email: 'hello@yourcompany.com',
    privacyEmail: 'privacy@yourcompany.com',
    legalEmail: 'legal@yourcompany.com',
  },

  links: {
    twitter: undefined,
    github: undefined,
    linkedin: undefined,
  },

  features: {
    cookieBanner: {
      enabled: true,
      message: undefined, // Uses default message
    },
    analytics: {
      enabled: true,
      posthogKey: undefined, // Falls back to env var
    },
    legalPages: {
      privacyEnabled: true,
      termsEnabled: true,
      cookiesEnabled: true,
    },
  },

  seo: {
    ogImage: undefined,
    twitterCard: 'summary_large_image',
  },
}
```

### Recommended Configurable Features

| Category | Setting | Purpose | Priority |
|----------|---------|---------|----------|
| **Features** | `cookieBanner.enabled` | Toggle cookie banner on/off | High |
| **Features** | `analytics.enabled` | Toggle analytics tracking | High |
| **Features** | `legalPages.*Enabled` | Toggle legal pages visibility | Medium |
| **Identity** | `name` | Company/site name | High |
| **Identity** | `description` | SEO description | High |
| **Identity** | `url` | Base URL | High |
| **Contact** | `*Email` | Contact emails for legal pages | Medium |
| **Links** | `twitter`, `github`, etc. | Social links for footer | Low |
| **SEO** | `ogImage` | Default OG image | Medium |

### Documentation Location

**Recommended:** Create `developer-guides/12-site-configuration.md`

This follows the existing guide numbering and INDEX.md pattern. The guide should cover:

1. Overview of configuration system
2. Configuration file location and structure
3. Available settings with descriptions
4. Feature toggles reference
5. How to add new configuration options
6. Integration with components (how components read config)

## 6) Clarification

1. **Configuration Location**: Should the config file live at `src/config/site.ts` (following FSD's shared layer would be `src/layers/shared/config/site.ts`)? Or at root level for easier discovery?

2. **Schema Validation**: Should we use Zod for runtime validation of the config, or is TypeScript compile-time checking sufficient for a static config file?

3. **Default Values vs Required**: Should all fields be optional with sensible defaults, or should some (like `name`, `url`) be required to force users to customize?

4. **Environment Variable Integration**: Should some config values (like `url`, analytics keys) fall back to environment variables, or keep config completely separate from env?

5. **Cookie Banner Customization Depth**: Beyond enable/disable, should the config allow customizing the banner message, button labels, and link URL? Or keep it simple for v1?

6. **Footer Links Configuration**: Should the footer links (Privacy, Terms, Cookies) be configurable to support custom URLs, or just visibility toggles?

---

## Next Steps

1. Review this ideation document
2. Answer clarification questions above
3. Run: `/ideate-to-spec specs/site-configuration/01-ideation.md`

---

## Sources

- [shadcn-ui/taxonomy](https://github.com/shadcn-ui/taxonomy) - Configuration pattern reference
- [nextjs-notion-starter-kit](https://github.com/transitive-bullshit/nextjs-notion-starter-kit) - Feature toggle patterns
- [PostHog Next.js Cookie Banner Tutorial](https://posthog.com/tutorials/nextjs-cookie-banner) - Cookie consent implementation
- [Next.js Configuration Docs](https://nextjs.org/docs/app/api-reference/config/next-config-js) - Official configuration reference
