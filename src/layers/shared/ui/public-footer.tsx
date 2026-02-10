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
