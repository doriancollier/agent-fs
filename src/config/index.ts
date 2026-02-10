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
