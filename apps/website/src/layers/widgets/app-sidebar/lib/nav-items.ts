import {
  LayoutDashboard,
  FileCode,
  BookOpen,
  Palette,
  Terminal,
} from 'lucide-react'

export const navItems = [
  {
    label: 'Home',
    href: '/system',
    icon: LayoutDashboard,
  },
  {
    label: 'Example',
    href: '/example',
    icon: FileCode,
  },
] as const

export const systemNavItems = [
  {
    label: 'Overview',
    href: '/system',
    icon: BookOpen,
  },
  {
    label: 'Design System',
    href: '/system/ui',
    icon: Palette,
  },
  {
    label: 'Claude Code',
    href: '/system/claude-code',
    icon: Terminal,
  },
] as const
