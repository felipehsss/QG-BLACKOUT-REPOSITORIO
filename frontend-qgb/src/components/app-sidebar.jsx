"use client"

import * as React from "react"
import {
  IconShoppingCart,
  IconChartBar,
  IconDashboard,
  IconReport,
  IconHelp,
  IconInnerShadowTop,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "Vendedor",
    email: "vendedor@qgbrightness.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "PDV (Frente de Caixa)",
      url: "/pdv", // ✅ corrigido
      icon: IconShoppingCart,
    },
    {
      title: "Dashboard",
      url: "/", // ✅ rota inicial
      icon: IconDashboard,
    },
  ],
  documents: [
    {
      name: "Vendas da Loja",
      url: "/relatorios/vendas",
      icon: IconChartBar,
    },
    {
      name: "Fechamentos de Caixa",
      url: "/relatorios/caixa",
      icon: IconReport,
    },
  ],
  navSecondary: [
    {
      title: "Configurações",
      url: "/configuracoes",
      icon: IconSettings,
    },
    {
      title: "Ajuda",
      url: "/ajuda",
      icon: IconHelp,
    },
  ],
}

export function AppSidebar(props) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <a href="/">
                <IconInnerShadowTop className="!size-5" />
                {/* ✅ removido "Quick Create", agora só nome da empresa */}
                <span className="text-base font-semibold">QG Brightness</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
