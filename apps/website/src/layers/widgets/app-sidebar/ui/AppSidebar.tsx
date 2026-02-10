'use client'

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarRail,
  SidebarMenu,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { GitHubLink } from './GitHubLink'
import { NavMain } from './NavMain'
import { ThemeToggle } from './ThemeToggle'

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        {/* App name - collapses to icon */}
        <div className="flex h-14 items-center gap-2 px-4">
          <span className="font-semibold text-lg group-data-[collapsible=icon]:hidden">
            Boilerplate
          </span>
          <span className="font-semibold text-lg hidden group-data-[collapsible=icon]:block">
            B
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain />
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <GitHubLink />
          </SidebarMenuItem>
          <SidebarMenuItem>
            <ThemeToggle />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
