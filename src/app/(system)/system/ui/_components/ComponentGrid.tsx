import * as React from 'react'
import { cn } from '@/lib/utils'

interface ComponentGridProps {
  cols?: 2 | 3 | 4
  gap?: 'sm' | 'md' | 'lg'
  className?: string
  children: React.ReactNode
}

const colsMap = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
}

const gapMap = {
  sm: 'gap-3',
  md: 'gap-4',
  lg: 'gap-6',
}

export function ComponentGrid({
  cols = 3,
  gap = 'md',
  className,
  children,
}: ComponentGridProps) {
  return (
    <div className={cn('grid', colsMap[cols], gapMap[gap], className)}>
      {children}
    </div>
  )
}

// Demo wrapper for individual component examples
interface DemoProps {
  title?: string
  className?: string
  children: React.ReactNode
}

export function Demo({ title, className, children }: DemoProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {title && (
        <span className="text-xs font-medium text-muted-foreground">{title}</span>
      )}
      <div className="flex flex-wrap items-center gap-2">
        {children}
      </div>
    </div>
  )
}
