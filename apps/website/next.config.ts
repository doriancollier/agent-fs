import type { NextConfig } from 'next'
import { fileURLToPath } from 'node:url'
import createJiti from 'jiti'

// Validate env vars at build time
const jiti = createJiti(fileURLToPath(import.meta.url))
jiti('./src/env')

const nextConfig: NextConfig = {
  // Transpile Base UI packages for better Turbopack + pnpm compatibility
  transpilePackages: ['@base-ui/react', '@base-ui/utils'],

  // PostHog reverse proxy configuration
  // This routes analytics requests through your domain to avoid ad blockers
  async rewrites() {
    return [
      {
        source: '/ingest/static/:path*',
        destination: 'https://us-assets.i.posthog.com/static/:path*',
      },
      {
        source: '/ingest/:path*',
        destination: 'https://us.i.posthog.com/:path*',
      },
    ]
  },
  // Required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,
}

export default nextConfig
