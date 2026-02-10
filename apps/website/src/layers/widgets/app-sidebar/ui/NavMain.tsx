'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Settings } from 'lucide-react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarSeparator,
  useSidebar,
} from '@/components/ui/sidebar'
import { navItems, systemNavItems } from '../lib/nav-items'

export function NavMain() {
  const pathname = usePathname()
  const { setOpenMobile } = useSidebar()
  const prevPathnameRef = useRef(pathname)

  // Keep System group open if we're on a system page
  const isOnSystemPage = pathname.startsWith('/system')
  const [systemOpen, setSystemOpen] = useState(isOnSystemPage)

  // Auto-close mobile drawer on navigation
  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      setOpenMobile(false)
      prevPathnameRef.current = pathname
    }
  }, [pathname, setOpenMobile])

  // Auto-open system group when navigating to a system page (deferred to avoid cascading)
  useEffect(() => {
    if (isOnSystemPage && !systemOpen) {
      // Use microtask to avoid synchronous setState in effect
      queueMicrotask(() => setSystemOpen(true))
    }
  }, [isOnSystemPage, systemOpen])

  return (
    <>
      {/* Main Navigation */}
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  render={<Link href={item.href} />}
                  isActive={pathname === item.href}
                  tooltip={item.label}
                >
                  <item.icon className="size-4" />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarSeparator />

      {/* System Navigation - Collapsible Group */}
      <SidebarGroup>
        <SidebarGroupLabel className="text-xs text-muted-foreground px-2">
          Template
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <Collapsible
              open={systemOpen}
              onOpenChange={setSystemOpen}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<CollapsibleTrigger />}
                  tooltip="System Documentation"
                  isActive={isOnSystemPage}
                >
                  <Settings className="size-4" />
                  <span>System</span>
                  <ChevronRight
                    className={`ml-auto size-4 transition-transform duration-200 ${
                      systemOpen ? 'rotate-90' : ''
                    }`}
                  />
                </SidebarMenuButton>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {systemNavItems.map((item) => (
                      <SidebarMenuSubItem key={item.href}>
                        <SidebarMenuSubButton
                          render={<Link href={item.href} />}
                          isActive={pathname === item.href || (item.href === '/system/ui' && pathname.startsWith('/system/ui/'))}
                        >
                          <item.icon className="size-3" />
                          <span>{item.label}</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  )
}
