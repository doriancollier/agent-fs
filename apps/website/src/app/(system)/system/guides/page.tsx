import fs from 'fs/promises'
import path from 'path'
import Link from 'next/link'
import { BookOpen, ArrowRight, Star } from 'lucide-react'

const GUIDES_DIR = path.join(process.cwd(), 'developer-guides')

// Guide metadata - maps filename to description
const guideDescriptions: Record<string, { title: string; description: string; featured?: boolean }> = {
  '01-project-structure': {
    title: 'Project Structure',
    description: 'FSD architecture, file naming, directory layout',
  },
  '02-environment-variables': {
    title: 'Environment Variables',
    description: 'T3 Env configuration, adding new variables',
  },
  '03-database-prisma': {
    title: 'Database & Prisma',
    description: 'Prisma 7, DAL patterns, naming conventions',
  },
  '04-forms-validation': {
    title: 'Forms & Validation',
    description: 'React Hook Form + Zod + Shadcn Form',
  },
  '05-data-fetching': {
    title: 'Data Fetching',
    description: 'TanStack Query patterns, mutations',
  },
  '06-state-management': {
    title: 'State Management',
    description: 'Zustand vs TanStack Query decision guide',
  },
  '07-animations': {
    title: 'Animations',
    description: 'Motion library patterns',
  },
  '08-styling-theming': {
    title: 'Styling & Theming',
    description: 'Tailwind v4, dark mode, Shadcn',
  },
  '09-authentication': {
    title: 'Authentication',
    description: 'BetterAuth with Email OTP, session management',
  },
  '10-metadata-seo': {
    title: 'Metadata & SEO',
    description: 'Metadata API, favicons, Open Graph',
  },
  '11-parallel-execution': {
    title: 'Parallel Execution',
    description: 'Background agents, concurrent tasks',
  },
  '12-site-configuration': {
    title: 'Site Configuration',
    description: 'Site-wide settings and customization',
  },
  '13-autonomous-roadmap-execution': {
    title: 'Autonomous Execution',
    description: 'Full workflow automation with Claude Code',
    featured: true,
  },
  'INDEX': {
    title: 'Guide Index',
    description: 'Coverage map and documentation overview',
  },
}

export const metadata = {
  title: 'Developer Guides | System',
  description: 'Detailed implementation patterns and documentation',
}

export const dynamic = 'force-static'

export default async function GuidesIndexPage() {
  const files = await fs.readdir(GUIDES_DIR)
  const guides = files
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const slug = f.replace('.md', '')
      const info = guideDescriptions[slug] || {
        title: slug.replace(/^\d+-/, '').replace(/-/g, ' '),
        description: 'Developer guide',
      }
      return { slug, ...info }
    })
    .sort((a, b) => a.slug.localeCompare(b.slug))

  // Separate featured guides
  const featuredGuides = guides.filter((g) => g.featured)
  const regularGuides = guides.filter((g) => !g.featured && g.slug !== 'INDEX')
  const indexGuide = guides.find((g) => g.slug === 'INDEX')

  return (
    <div className="container-default py-8 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <BookOpen className="size-4" />
          <span>Template Documentation</span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">Developer Guides</h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Detailed implementation patterns in{' '}
          <code className="text-sm bg-muted px-1.5 py-0.5 rounded">developer-guides/</code>
        </p>
      </div>

      {/* Featured Guides */}
      {featuredGuides.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-medium flex items-center gap-2">
            <Star className="size-4 text-primary" />
            Featured
          </h2>
          <div className="grid gap-4">
            {featuredGuides.map((guide) => (
              <Link
                key={guide.slug}
                href={`/system/guides/${guide.slug}`}
                className="group flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 p-6 transition-colors hover:bg-primary/10"
              >
                <div className="space-y-1">
                  <h3 className="font-medium text-lg group-hover:text-primary transition-colors">
                    {guide.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{guide.description}</p>
                </div>
                <ArrowRight className="size-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* All Guides */}
      <div className="space-y-4">
        <h2 className="text-lg font-medium">All Guides</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {regularGuides.map((guide) => (
            <Link
              key={guide.slug}
              href={`/system/guides/${guide.slug}`}
              className="group flex items-start gap-3 rounded-lg border bg-card p-4 transition-colors hover:bg-accent"
            >
              <BookOpen className="size-4 mt-0.5 shrink-0 text-muted-foreground" />
              <div className="min-w-0">
                <p className="font-medium text-sm group-hover:text-primary transition-colors">
                  {guide.title}
                </p>
                <p className="text-xs text-muted-foreground truncate">{guide.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Index Guide */}
      {indexGuide && (
        <div className="space-y-4">
          <h2 className="text-lg font-medium">Reference</h2>
          <Link
            href={`/system/guides/${indexGuide.slug}`}
            className="group flex items-center justify-between rounded-lg border bg-muted/50 border-dashed p-4 transition-colors hover:bg-muted"
          >
            <div className="space-y-1">
              <h3 className="font-medium text-sm group-hover:text-primary transition-colors">
                {indexGuide.title}
              </h3>
              <p className="text-xs text-muted-foreground">{indexGuide.description}</p>
            </div>
            <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </Link>
        </div>
      )}
    </div>
  )
}
