import type { Metadata, Viewport } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Providers } from './providers'
import { CookieConsentBanner } from '@/layers/widgets/cookie-consent'
import { getSiteConfig } from '@/config'
import './globals.css'

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
    twitter: config.seo.twitterCard
      ? { card: config.seo.twitterCard }
      : undefined,
  }
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafafa' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>
          {children}
          <CookieConsentBanner />
        </Providers>
      </body>
    </html>
  )
}
