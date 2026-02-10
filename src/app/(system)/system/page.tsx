import Link from 'next/link'
import {
  ArrowRight,
  Sparkles,
  BookOpen,
  Shield,
  KeyRound,
  Play,
  CheckCircle2,
  Zap,
} from 'lucide-react'
import { baseConfig as siteConfig } from '@/config'

// CSS-based visual component for Autonomous Workflows
function WorkflowVisual() {
  return (
    <div className="relative w-full h-64 md:h-72 overflow-hidden">
      {/* Animated flow diagram */}
      <div className="absolute inset-0 flex items-center justify-center px-4">
        {/* Compact workflow pipeline */}
        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
          {/* Phase nodes */}
          {['Ideate', 'Specify', 'Build', 'Test', 'Ship'].map((phase, i) => (
            <div key={phase} className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
              <div
                className="relative group"
                style={{ animationDelay: `${i * 200}ms` }}
              >
                <div
                  className="w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg md:rounded-xl bg-gradient-to-br from-primary/20 to-primary/5
                            border border-primary/20 flex items-center justify-center
                            group-hover:from-primary/30 group-hover:to-primary/10 transition-all duration-300
                            shadow-soft"
                >
                  <span className="text-[10px] sm:text-xs md:text-sm font-medium text-primary">
                    {phase}
                  </span>
                </div>
                {/* Pulse effect */}
                <div
                  className="absolute inset-0 rounded-lg md:rounded-xl bg-primary/10 animate-ping opacity-0
                              group-hover:opacity-100"
                  style={{ animationDuration: '2s' }}
                />
              </div>
              {/* Connector arrow */}
              {i < 4 && (
                <ArrowRight className="size-3 sm:size-3.5 md:size-4 text-primary/40 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>
      {/* Background decoration */}
      <div className="absolute top-4 left-4 w-24 h-24 rounded-full bg-gradient-to-br from-primary/5 to-transparent blur-2xl" />
      <div className="absolute bottom-4 right-4 w-32 h-32 rounded-full bg-gradient-to-tl from-primary/5 to-transparent blur-2xl" />
    </div>
  )
}

// CSS-based visual component for Design System
function DesignVisual() {
  return (
    <div className="relative w-full h-64 md:h-80 overflow-hidden">
      {/* Color palette demonstration */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="grid grid-cols-4 gap-3 p-6">
          {/* Primary colors */}
          <div className="space-y-3">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl bg-primary shadow-soft" />
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl bg-primary/70 shadow-soft" />
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl bg-primary/40 shadow-soft" />
          </div>
          {/* Card preview */}
          <div className="col-span-3 space-y-3">
            <div
              className="h-24 md:h-32 rounded-xl bg-card border border-border shadow-elevated p-4
                          flex flex-col justify-between"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10" />
                <div className="h-3 w-20 rounded bg-foreground/10" />
              </div>
              <div className="space-y-2">
                <div className="h-2 w-full rounded bg-muted" />
                <div className="h-2 w-3/4 rounded bg-muted" />
              </div>
            </div>
            {/* Button variants */}
            <div className="flex gap-2">
              <div className="h-8 px-4 rounded-md bg-primary flex items-center">
                <div className="h-2 w-12 rounded bg-primary-foreground/50" />
              </div>
              <div className="h-8 px-4 rounded-md bg-secondary flex items-center">
                <div className="h-2 w-10 rounded bg-secondary-foreground/50" />
              </div>
              <div className="h-8 px-4 rounded-md border border-input flex items-center">
                <div className="h-2 w-8 rounded bg-foreground/30" />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Gradient orbs */}
      <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-gradient-to-br from-primary/10 to-transparent blur-3xl" />
      <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-gradient-to-tr from-primary/10 to-transparent blur-3xl" />
    </div>
  )
}

// CSS-based visual component for Guides
function GuidesVisual() {
  return (
    <div className="relative w-full h-64 md:h-80">
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Stacked document cards */}
        <div className="relative">
          {[2, 1, 0].map((i) => (
            <div
              key={i}
              className="absolute bg-card border border-border rounded-xl shadow-elevated
                        w-48 md:w-56 h-32 md:h-40 p-4 transition-all duration-300"
              style={{
                transform: `translateX(${i * 12}px) translateY(${i * 8}px) rotate(${i * -2}deg)`,
                zIndex: 3 - i,
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="size-4 text-primary" />
                <div className="h-2 w-16 rounded bg-foreground/20" />
              </div>
              <div className="space-y-2">
                <div className="h-2 w-full rounded bg-muted" />
                <div className="h-2 w-5/6 rounded bg-muted" />
                <div className="h-2 w-4/6 rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Guide count badge */}
      <div
        className="absolute top-8 right-8 md:right-16 bg-primary text-primary-foreground
                    px-3 py-1 rounded-full text-sm font-medium shadow-soft"
      >
        13+ Guides
      </div>
    </div>
  )
}

// CSS-based visual component for Authentication
function AuthVisual() {
  return (
    <div className="relative w-full h-64 md:h-80">
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Login form mockup */}
        <div className="bg-card border border-border rounded-xl shadow-elevated w-64 md:w-72 p-6">
          {/* Header */}
          <div className="flex items-center justify-center mb-6">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <KeyRound className="size-5 text-primary" />
            </div>
          </div>
          {/* Email input mockup */}
          <div className="space-y-4">
            <div className="h-10 rounded-md border border-input bg-background px-3 flex items-center">
              <span className="text-xs text-muted-foreground">
                you@example.com
              </span>
            </div>
            {/* OTP input mockup */}
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div
                  key={n}
                  className="w-8 h-10 rounded-md border border-input bg-background
                            flex items-center justify-center text-sm font-mono text-foreground/70"
                >
                  {n <= 4 ? '•' : ''}
                </div>
              ))}
            </div>
            {/* Button mockup */}
            <div className="h-10 rounded-md bg-primary flex items-center justify-center">
              <span className="text-xs text-primary-foreground font-medium">
                Verify Code
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* Security decorations */}
      <div className="absolute top-6 left-6 md:left-12">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Shield className="size-4 text-green-500" />
          <span>Secure</span>
        </div>
      </div>
    </div>
  )
}

// CSS-based visual component for Production Ready
function ProductionVisual() {
  return (
    <div className="relative w-full h-64 md:h-80">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="grid grid-cols-2 gap-4 md:gap-6">
          {/* TypeScript badge */}
          <div
            className="bg-card border border-border rounded-xl shadow-soft p-4
                        flex flex-col items-center gap-2"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <span className="text-blue-500 font-bold text-sm">TS</span>
            </div>
            <span className="text-xs text-muted-foreground">TypeScript</span>
          </div>
          {/* Zod badge */}
          <div
            className="bg-card border border-border rounded-xl shadow-soft p-4
                        flex flex-col items-center gap-2"
          >
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Zap className="size-5 text-purple-500" />
            </div>
            <span className="text-xs text-muted-foreground">Zod 4</span>
          </div>
          {/* Prisma badge */}
          <div
            className="bg-card border border-border rounded-xl shadow-soft p-4
                        flex flex-col items-center gap-2"
          >
            <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center">
              <span className="text-teal-500 font-bold text-sm">P7</span>
            </div>
            <span className="text-xs text-muted-foreground">Prisma 7</span>
          </div>
          {/* Tests badge */}
          <div
            className="bg-card border border-border rounded-xl shadow-soft p-4
                        flex flex-col items-center gap-2"
          >
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="size-5 text-green-500" />
            </div>
            <span className="text-xs text-muted-foreground">Tested</span>
          </div>
        </div>
      </div>
      {/* Decorative elements */}
      <div className="absolute top-4 right-4 flex items-center gap-1">
        <div className="w-2 h-2 rounded-full bg-green-500" />
        <span className="text-xs text-muted-foreground">Production</span>
      </div>
    </div>
  )
}

// Feature section component
function FeatureSection({
  title,
  description,
  features,
  learnMoreHref,
  learnMoreText = 'Learn more',
  visual,
  reversed = false,
}: {
  title: string
  description: string
  features: string[]
  learnMoreHref: string
  learnMoreText?: string
  visual: React.ReactNode
  reversed?: boolean
}) {
  return (
    <section className="py-16 md:py-24">
      <div className="container-wide">
        <div
          className={`grid md:grid-cols-2 gap-12 md:gap-16 items-center ${reversed ? 'md:[&>*:first-child]:order-2' : ''}`}
        >
          {/* Content */}
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              {title}
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {description}
            </p>
            <ul className="space-y-3">
              {features.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <CheckCircle2 className="size-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
            <Link
              href={learnMoreHref}
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80
                        font-medium transition-colors group"
            >
              {learnMoreText}
              <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          {/* Visual */}
          <div className="bg-muted/30 rounded-2xl border border-border/50">
            {visual}
          </div>
        </div>
      </div>
    </section>
  )
}

export default function SystemLandingPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="py-20 md:py-32 text-center relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />

        <div className="container-narrow space-y-8 relative">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Sparkles className="size-4" />
            <span>Next.js 16 + React 19 + Tailwind 4</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1]">
            Stop configuring.
            <br />
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Start building.
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            A production-ready Next.js boilerplate with authentication,
            database, styling, and AI-powered development workflows — all
            configured and ready to ship.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link
              href="/system/docs"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl
                        text-base font-semibold h-12 px-8 bg-primary text-primary-foreground
                        shadow-soft hover:bg-primary/90 transition-all hover:shadow-elevated"
            >
              Get Started
              <ArrowRight className="size-5" />
            </Link>
            <Link
              href={siteConfig.links.github ?? '#'}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl
                        text-base font-semibold h-12 px-8 bg-secondary text-secondary-foreground
                        hover:bg-secondary/80 transition-colors"
            >
              <Play className="size-4" />
              View Demo
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-green-500" />
              <span>TypeScript Strict</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-green-500" />
              <span>Fully Tested</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-green-500" />
              <span>Vercel Ready</span>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="container-wide">
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      {/* Autonomous AI Workflows Section */}
      <FeatureSection
        title="Autonomous AI Workflows"
        description="Let Claude Code handle your entire development lifecycle. From ideation to deployment, the built-in roadmap system orchestrates every phase automatically — so you can focus on building, not managing."
        features={[
          'Intelligent task selection with /roadmap:next finds your highest-impact work',
          'Autonomous execution with /roadmap:work runs ideation → spec → build → test → ship',
          'Resumable sessions — pick up exactly where you left off',
          'Self-correcting tests with automatic retry and fix loops',
          'Human approval checkpoints at strategic moments',
        ]}
        learnMoreHref="/system/guides/13-autonomous-roadmap-execution"
        learnMoreText="Explore the roadmap system"
        visual={<WorkflowVisual />}
      />

      {/* Calm Tech Design Section */}
      <FeatureSection
        title="Calm Tech Design System"
        description="A sophisticated, spacious design language that makes your interfaces feel effortless. Built with OKLCH colors and CSS custom properties, every aspect is customizable through simple variable overrides."
        features={[
          '20+ CSS variables for complete theme control',
          'OKLCH color system for perceptually uniform colors',
          'Geist Sans and Geist Mono typography',
          'Soft shadows and generous spacing throughout',
          'Dark mode with system preference detection',
        ]}
        learnMoreHref="/system/guides/08-styling-theming"
        learnMoreText="Customize your theme"
        visual={<DesignVisual />}
        reversed
      />

      {/* Comprehensive Guides Section */}
      <FeatureSection
        title="Comprehensive Developer Guides"
        description="13+ detailed guides covering every aspect of the stack. Written specifically for AI agent consumption, each guide provides patterns, examples, and troubleshooting for real-world scenarios."
        features={[
          'FSD architecture patterns and layer organization',
          'Database patterns with Prisma 7 and DAL conventions',
          'Form handling with React Hook Form + Zod 4',
          'Data fetching with TanStack Query 5',
          'Authentication flows and session management',
        ]}
        learnMoreHref="/system/guides"
        learnMoreText="Browse all guides"
        visual={<GuidesVisual />}
      />

      {/* Authentication Section */}
      <FeatureSection
        title="Passwordless Authentication"
        description="BetterAuth provides secure, user-friendly authentication out of the box. Email OTP removes password friction while maintaining security. Extensible to OAuth, magic links, and more."
        features={[
          'Email OTP with 6-digit codes (5-minute expiry)',
          '7-day sessions with automatic refresh',
          'Extensible for OAuth providers (Google, GitHub, etc.)',
          'Protected route groups with automatic redirects',
          'Type-safe session access in Server Components',
        ]}
        learnMoreHref="/system/guides/09-authentication"
        learnMoreText="Configure authentication"
        visual={<AuthVisual />}
        reversed
      />

      {/* Production Ready Section */}
      <FeatureSection
        title="Production-Ready Foundation"
        description="Every dependency is carefully selected and configured for production. TypeScript strict mode, Zod validation at runtime boundaries, Prisma 7 with type-safe queries, and comprehensive testing patterns."
        features={[
          'TypeScript 5.9+ with strict mode enabled',
          'Zod 4 validation for all runtime boundaries',
          'Prisma 7 with Data Access Layer patterns',
          'Vitest + Testing Library for unit and component tests',
          'ESLint + Prettier for consistent code style',
        ]}
        learnMoreHref="/system/docs"
        learnMoreText="View full documentation"
        visual={<ProductionVisual />}
      />

      {/* Final CTA Section */}
      <section className="py-20 md:py-32 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent" />

        <div className="container-narrow text-center relative">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            Ready to ship faster?
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-8">
            Stop wasting time on boilerplate. Start with a foundation that
            scales.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/system/docs"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl
                        text-base font-semibold h-12 px-8 bg-primary text-primary-foreground
                        shadow-soft hover:bg-primary/90 transition-all hover:shadow-elevated"
            >
              Start Building
              <ArrowRight className="size-5" />
            </Link>
            <Link
              href={siteConfig.links.github ?? '#'}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl
                        text-base font-semibold h-12 px-8 border border-input bg-background
                        hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              View on GitHub
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
