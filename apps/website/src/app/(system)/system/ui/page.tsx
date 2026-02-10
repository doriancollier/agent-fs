import Link from 'next/link'
import { Palette, Layers, Grid3X3, ArrowRight } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

const sections = [
  {
    title: 'Foundations',
    description: 'Typography, colors, spacing, shadows, and icons that form the visual language.',
    href: '/system/ui/foundations',
    icon: Palette,
  },
  {
    title: 'Components',
    description: '53 UI components organized by category: Actions, Forms, Feedback, Overlay, Navigation, Data Display, and Layout.',
    href: '/system/ui/components',
    icon: Layers,
  },
  {
    title: 'Patterns',
    description: 'Common UI compositions: data tables, forms, card layouts, empty states, and loading states.',
    href: '/system/ui/patterns',
    icon: Grid3X3,
  },
]

export default function DesignSystemOverview() {
  return (
    <div className="space-y-12">
      {/* Hero */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Design System</h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          A visual reference for the <strong>Calm Tech</strong> design language.
          Sophisticated, spacious, effortless.
        </p>
      </div>

      {/* Philosophy */}
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <h2>Calm Tech Philosophy</h2>
        <p>
          Our interfaces follow the &quot;Calm Tech&quot; design language — technology that respects
          attention and reduces cognitive load. Key principles:
        </p>
        <ul>
          <li><strong>Clarity over decoration</strong> — Every element earns its place</li>
          <li><strong>Soft depth over flat</strong> — Subtle shadows create hierarchy</li>
          <li><strong>Generous space</strong> — Breathing room makes content shine</li>
          <li><strong>Micro-delight</strong> — Thoughtful, restrained animations</li>
        </ul>
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-2xl font-semibold mb-6">Explore</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {sections.map((section) => (
            <Link key={section.href} href={section.href} className="group">
              <Card className="h-full transition-shadow hover:shadow-elevated">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-primary/10">
                      <section.icon className="size-5 text-primary" />
                    </div>
                    <CardTitle className="group-hover:text-primary transition-colors">
                      {section.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">
                    {section.description}
                  </CardDescription>
                  <div className="mt-4 flex items-center text-sm text-primary font-medium">
                    Explore
                    <ArrowRight className="ml-1 size-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="rounded-xl border bg-muted/50 p-6">
        <h3 className="font-semibold mb-2">At a Glance</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-3xl font-bold">53</div>
            <div className="text-sm text-muted-foreground">Components</div>
          </div>
          <div>
            <div className="text-3xl font-bold">6</div>
            <div className="text-sm text-muted-foreground">Foundation Sections</div>
          </div>
          <div>
            <div className="text-3xl font-bold">5</div>
            <div className="text-sm text-muted-foreground">Pattern Examples</div>
          </div>
        </div>
      </div>
    </div>
  )
}
