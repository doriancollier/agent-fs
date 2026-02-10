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
