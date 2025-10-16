"use client"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

export function NavMain({ items }) {
  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) =>
            item.sub ? (
              <SidebarMenuSub key={item.title}>
                <SidebarMenuSubButton>
                  <span>{item.title}</span>
                </SidebarMenuSubButton>
                <SidebarMenu>
                  {item.sub.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.title} asChild>
                      <a href={subItem.url}>
                        <span>{subItem.title}</span>
                      </a>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenu>
              </SidebarMenuSub>
            ) : (
              <SidebarMenuItem key={item.title} asChild>
                <a href={item.url}>
                  <span>{item.title}</span>
                </a>
              </SidebarMenuItem>
            )
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}