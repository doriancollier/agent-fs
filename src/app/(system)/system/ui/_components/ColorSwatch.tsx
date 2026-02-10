'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface ColorSwatchProps {
  name: string
  cssVar: string
  description?: string
  className?: string
}

export function ColorSwatch({ name, cssVar, description, className }: ColorSwatchProps) {
  const [computedColor, setComputedColor] = React.useState<string>('')
  const swatchRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (swatchRef.current) {
      const style = getComputedStyle(swatchRef.current)
      setComputedColor(style.backgroundColor)
    }
  }, [])

  return (
    <div className={cn("flex items-start gap-3", className)}>
      <div
        ref={swatchRef}
        className="size-12 rounded-md border shadow-sm shrink-0"
        style={{ backgroundColor: `var(${cssVar})` }}
      />
      <div className="min-w-0">
        <div className="font-medium text-sm">{name}</div>
        <div className="text-xs text-muted-foreground font-mono">{cssVar}</div>
        {description && (
          <div className="text-xs text-muted-foreground mt-1">{description}</div>
        )}
        {computedColor && (
          <div className="text-xs text-muted-foreground font-mono mt-1">
            {computedColor}
          </div>
        )}
      </div>
    </div>
  )
}

// Grouped color display for palette sections
interface ColorGroupProps {
  title: string
  colors: Array<{ name: string; cssVar: string; description?: string }>
}

export function ColorGroup({ title, colors }: ColorGroupProps) {
  return (
    <div>
      <h4 className="text-sm font-medium mb-3">{title}</h4>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {colors.map((color) => (
          <ColorSwatch key={color.cssVar} {...color} />
        ))}
      </div>
    </div>
  )
}
