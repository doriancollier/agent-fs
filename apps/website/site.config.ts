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
    github: 'https://github.com/doriancollier/dorkian-next-stack',
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
