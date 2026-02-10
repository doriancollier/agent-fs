import {
  Home, Settings, User, Search, Bell, Heart, Star,
  Mail, Calendar, Clock, Check, X, Plus, Minus,
  ChevronRight, ChevronDown, ArrowRight, ArrowLeft
} from 'lucide-react'
import { ComponentSection } from '../_components/ComponentSection'
import { ColorGroup } from '../_components/ColorSwatch'
import { TypeScale } from '../_components/TypeScale'
import { SpacingScale } from '../_components/SpacingScale'
import { cn } from '@/lib/utils'

const coreColors = [
  { name: 'Background', cssVar: '--background' },
  { name: 'Foreground', cssVar: '--foreground' },
  { name: 'Card', cssVar: '--card' },
  { name: 'Card Foreground', cssVar: '--card-foreground' },
  { name: 'Popover', cssVar: '--popover' },
  { name: 'Popover Foreground', cssVar: '--popover-foreground' },
]

const actionColors = [
  { name: 'Primary', cssVar: '--primary' },
  { name: 'Primary Foreground', cssVar: '--primary-foreground' },
  { name: 'Secondary', cssVar: '--secondary' },
  { name: 'Secondary Foreground', cssVar: '--secondary-foreground' },
  { name: 'Accent', cssVar: '--accent' },
  { name: 'Accent Foreground', cssVar: '--accent-foreground' },
]

const semanticColors = [
  { name: 'Destructive', cssVar: '--destructive' },
  { name: 'Success', cssVar: '--success' },
  { name: 'Warning', cssVar: '--warning' },
  { name: 'Info', cssVar: '--info' },
]

const utilityColors = [
  { name: 'Muted', cssVar: '--muted' },
  { name: 'Muted Foreground', cssVar: '--muted-foreground' },
  { name: 'Border', cssVar: '--border' },
  { name: 'Input', cssVar: '--input' },
  { name: 'Ring', cssVar: '--ring' },
]

const shadows = [
  { name: 'shadow-xs', class: 'shadow-xs' },
  { name: 'shadow-sm', class: 'shadow-sm' },
  { name: 'shadow', class: 'shadow' },
  { name: 'shadow-md', class: 'shadow-md' },
  { name: 'shadow-lg', class: 'shadow-lg' },
  { name: 'shadow-xl', class: 'shadow-xl' },
  { name: 'shadow-soft', class: 'shadow-soft' },
  { name: 'shadow-elevated', class: 'shadow-elevated' },
  { name: 'shadow-floating', class: 'shadow-floating' },
  { name: 'shadow-modal', class: 'shadow-modal' },
]

const radii = [
  { name: 'rounded-sm', class: 'rounded-sm', desc: '4px' },
  { name: 'rounded', class: 'rounded', desc: '6px' },
  { name: 'rounded-md', class: 'rounded-md', desc: '10px' },
  { name: 'rounded-lg', class: 'rounded-lg', desc: '12px' },
  { name: 'rounded-xl', class: 'rounded-xl', desc: '16px' },
  { name: 'rounded-2xl', class: 'rounded-2xl', desc: '20px' },
  { name: 'rounded-full', class: 'rounded-full', desc: '9999px' },
]

const commonIcons = [
  { Icon: Home, name: 'Home' },
  { Icon: Settings, name: 'Settings' },
  { Icon: User, name: 'User' },
  { Icon: Search, name: 'Search' },
  { Icon: Bell, name: 'Bell' },
  { Icon: Heart, name: 'Heart' },
  { Icon: Star, name: 'Star' },
  { Icon: Mail, name: 'Mail' },
  { Icon: Calendar, name: 'Calendar' },
  { Icon: Clock, name: 'Clock' },
  { Icon: Check, name: 'Check' },
  { Icon: X, name: 'X' },
  { Icon: Plus, name: 'Plus' },
  { Icon: Minus, name: 'Minus' },
  { Icon: ChevronRight, name: 'ChevronRight' },
  { Icon: ChevronDown, name: 'ChevronDown' },
  { Icon: ArrowRight, name: 'ArrowRight' },
  { Icon: ArrowLeft, name: 'ArrowLeft' },
]

export default function FoundationsPage() {
  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Foundations</h1>
        <p className="mt-2 text-muted-foreground">
          The building blocks of our design system: typography, colors, spacing, and visual effects.
        </p>
      </div>

      {/* Typography */}
      <ComponentSection
        id="typography"
        title="Typography"
        description="Type scale based on Major Third ratio (1.25). Geist Sans for UI, Geist Mono for code."
      >
        <TypeScale />
      </ComponentSection>

      {/* Colors */}
      <ComponentSection
        id="colors"
        title="Colors"
        description="OKLCH color space for perceptual uniformity. All colors adapt to light/dark themes."
      >
        <div className="space-y-8">
          <ColorGroup title="Core" colors={coreColors} />
          <ColorGroup title="Action" colors={actionColors} />
          <ColorGroup title="Semantic" colors={semanticColors} />
          <ColorGroup title="Utility" colors={utilityColors} />
        </div>
      </ComponentSection>

      {/* Spacing */}
      <ComponentSection
        id="spacing"
        title="Spacing"
        description="8pt grid system. Spacing values are multiples of 4px for consistency."
      >
        <SpacingScale />
      </ComponentSection>

      {/* Shadows */}
      <ComponentSection
        id="shadows"
        title="Shadows"
        description="Soft shadows for depth hierarchy. Custom utilities for specific use cases."
      >
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {shadows.map(({ name, class: cls }) => (
            <div key={name} className="text-center">
              <div className={cn("h-20 rounded-lg bg-card border", cls)} />
              <span className="text-xs font-mono text-muted-foreground mt-2 block">{name}</span>
            </div>
          ))}
        </div>
      </ComponentSection>

      {/* Border Radius */}
      <ComponentSection
        id="radius"
        title="Border Radius"
        description="Consistent rounding for a softer, approachable feel."
      >
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {radii.map(({ name, class: cls, desc }) => (
            <div key={name} className="text-center">
              <div className={cn("h-20 bg-primary", cls)} />
              <span className="text-xs font-mono text-muted-foreground mt-2 block">{name}</span>
              <span className="text-xs text-muted-foreground">{desc}</span>
            </div>
          ))}
        </div>
      </ComponentSection>

      {/* Icons */}
      <ComponentSection
        id="icons"
        title="Icons"
        description="Lucide React icons at various sizes. Consistent stroke width and sizing."
      >
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-medium mb-3">Size 16px</h4>
            <div className="flex flex-wrap gap-4">
              {commonIcons.slice(0, 10).map(({ Icon, name }) => (
                <div key={name} className="flex flex-col items-center gap-1">
                  <Icon className="size-4" />
                  <span className="text-xs text-muted-foreground">{name}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-3">Size 20px (default)</h4>
            <div className="flex flex-wrap gap-4">
              {commonIcons.slice(0, 10).map(({ Icon, name }) => (
                <div key={name} className="flex flex-col items-center gap-1">
                  <Icon className="size-5" />
                  <span className="text-xs text-muted-foreground">{name}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-3">Size 24px</h4>
            <div className="flex flex-wrap gap-4">
              {commonIcons.slice(0, 10).map(({ Icon, name }) => (
                <div key={name} className="flex flex-col items-center gap-1">
                  <Icon className="size-6" />
                  <span className="text-xs text-muted-foreground">{name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ComponentSection>
    </div>
  )
}
