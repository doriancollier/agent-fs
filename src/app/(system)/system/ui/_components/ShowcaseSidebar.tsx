'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface NavItem {
  title: string
  href: string
  items?: { title: string; href: string }[]
}

const navigation: NavItem[] = [
  {
    title: "Overview",
    href: "/system/ui",
  },
  {
    title: "Foundations",
    href: "/system/ui/foundations",
    items: [
      { title: "Typography", href: "/system/ui/foundations#typography" },
      { title: "Colors", href: "/system/ui/foundations#colors" },
      { title: "Spacing", href: "/system/ui/foundations#spacing" },
      { title: "Shadows", href: "/system/ui/foundations#shadows" },
      { title: "Border Radius", href: "/system/ui/foundations#radius" },
      { title: "Icons", href: "/system/ui/foundations#icons" },
    ],
  },
  {
    title: "Components",
    href: "/system/ui/components",
    items: [
      { title: "Actions", href: "/system/ui/components#actions" },
      { title: "Forms", href: "/system/ui/components#forms" },
      { title: "Feedback", href: "/system/ui/components#feedback" },
      { title: "Overlay", href: "/system/ui/components#overlay" },
      { title: "Navigation", href: "/system/ui/components#navigation" },
      { title: "Data Display", href: "/system/ui/components#data-display" },
      { title: "Layout", href: "/system/ui/components#layout" },
    ],
  },
  {
    title: "Patterns",
    href: "/system/ui/patterns",
    items: [
      { title: "Data Table", href: "/system/ui/patterns#data-table" },
      { title: "Form Pattern", href: "/system/ui/patterns#form-pattern" },
      { title: "Card Layouts", href: "/system/ui/patterns#card-layouts" },
      { title: "Empty States", href: "/system/ui/patterns#empty-states" },
      { title: "Loading States", href: "/system/ui/patterns#loading-states" },
    ],
  },
]

export function ShowcaseSidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = React.useState(false)
  const [activeHash, setActiveHash] = React.useState('')

  // Scroll spy effect
  React.useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('[data-section]')
      let current = ''

      sections.forEach((section) => {
        const rect = section.getBoundingClientRect()
        if (rect.top <= 100) {
          current = section.id
        }
      })

      setActiveHash(current ? `#${current}` : '')
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isActive = (href: string) => {
    if (href.includes('#')) {
      const [path, hash] = href.split('#')
      return pathname === path && activeHash === `#${hash}`
    }
    return pathname === href && !activeHash
  }

  const isParentActive = (item: NavItem) => {
    if (pathname === item.href) return true
    if (item.items) {
      return item.items.some(sub => {
        const [path] = sub.href.split('#')
        return pathname === path
      })
    }
    return false
  }

  return (
    <>
      {/* Mobile hamburger */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
      >
        {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-background border-r transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <nav className="h-full overflow-y-auto py-8 px-4">
          <div className="mb-8 px-2">
            <h2 className="text-lg font-semibold">Design System</h2>
          </div>

          <ul className="space-y-1">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "block px-2 py-1.5 rounded-md text-sm transition-colors",
                    isParentActive(item)
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  {item.title}
                </Link>

                {item.items && isParentActive(item) && (
                  <ul className="ml-4 mt-1 space-y-1">
                    {item.items.map((subitem) => (
                      <li key={subitem.href}>
                        <Link
                          href={subitem.href}
                          className={cn(
                            "block px-2 py-1 rounded-md text-sm transition-colors",
                            isActive(subitem.href)
                              ? "text-foreground font-medium"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                          onClick={() => setIsOpen(false)}
                        >
                          {subitem.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  )
}
