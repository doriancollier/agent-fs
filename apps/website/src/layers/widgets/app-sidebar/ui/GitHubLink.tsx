'use client'

import Link from 'next/link'
import { Github } from 'lucide-react'
import { SidebarMenuButton } from '@/components/ui/sidebar'
import { baseConfig as siteConfig } from '@/config'

export function GitHubLink() {
  const githubUrl = siteConfig.links.github

  if (!githubUrl) return null

  return (
    <SidebarMenuButton render={<Link href={githubUrl} target="_blank" />} tooltip="View on GitHub">
      <Github className="size-4" />
      <span className="group-data-[collapsible=icon]:hidden">GitHub</span>
    </SidebarMenuButton>
  )
}
