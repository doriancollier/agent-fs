import * as React from 'react'
import { cn } from '@/lib/utils'

interface ComponentSectionProps {
  id: string
  title: string
  description?: string
  className?: string
  children: React.ReactNode
}

export function ComponentSection({
  id,
  title,
  description,
  className,
  children,
}: ComponentSectionProps) {
  return (
    <section
      id={id}
      data-section
      className={cn("scroll-mt-20 py-8 first:pt-0", className)}
    >
      <div className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight">
          <a
            href={`#${id}`}
            className="hover:underline underline-offset-4"
          >
            {title}
          </a>
        </h2>
        {description && (
          <p className="mt-2 text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {children}
    </section>
  )
}
