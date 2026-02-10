'use client'

import { useTheme } from 'next-themes'
import posthog from 'posthog-js'
import { Moon, Sun } from 'lucide-react'
import { SidebarMenuButton } from '@/components/ui/sidebar'

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme()

  const handleToggle = () => {
    const newTheme = resolvedTheme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)

    // Track theme change
    posthog.capture('theme_toggled', {
      from_theme: resolvedTheme,
      to_theme: newTheme,
    })
  }

  return (
    <SidebarMenuButton onClick={handleToggle} tooltip="Toggle theme">
      <Sun className="size-4 scale-100 dark:scale-0" />
      <Moon className="absolute size-4 scale-0 dark:scale-100" />
      <span className="group-data-[collapsible=icon]:hidden">Toggle theme</span>
    </SidebarMenuButton>
  )
}
