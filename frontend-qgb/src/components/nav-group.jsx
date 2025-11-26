"use client"

import { usePathname } from "next/navigation"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"

export function NavGroup({ items, ...props }) {
  const pathname = usePathname()

  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const title = item.title ?? item.name

            // Caso tenha submenus
            if (item.sub) {
              return (
                <SidebarMenuSub key={title}>
                  <SidebarMenuButton>
                    {item.icon && <item.icon />}
                    <span className="truncate">{title}</span>
                  </SidebarMenuButton>

                  {item.sub.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.title}>
                      <SidebarMenuSubButton
                        asChild
                        isActive={pathname === subItem.url}
                      >
                        <a href={subItem.url}>
                          {subItem.icon && <subItem.icon />}
                          <span>{subItem.title}</span>
                        </a>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              )
            }

            // Sem submenu
            return (
              <SidebarMenuItem key={title}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.url}
                >
                  <a href={item.url}>
                    {item.icon && <item.icon />}
                    <span className="truncate">{title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
