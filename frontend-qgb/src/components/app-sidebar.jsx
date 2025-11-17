"use client"

import * as React from "react"
import {
  IconShoppingCart,
  IconDashboard,
  IconChartBar,
  IconReport,
  IconSettings,
  IconHelp,
} from "@tabler/icons-react"

import { NavGroup } from "@/components/nav-group"
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

// --- DADOS ATUALIZADOS ---
const data = {
  user: {
    name: "Vendedor",
    email: "vendedor@qgbrightness.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "PDV (Frente de Caixa)",
      url: "/pdv",
      icon: IconShoppingCart,
    },
    {
      title: "Dashboard",
      url: "/",
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
      url: "/relatorios/caixas",
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
      {/* Cabeçalho */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="!p-0">
            <SidebarMenuButton asChild className="!h-auto !p-2">
              <a href="/dashboard">
                <span className="text-base font-semibold">QG Blackout</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Conteúdo */}
      <SidebarContent>
        {/* Grupo principal */}
        <NavGroup items={data.navMain} />

        {/* Grupo de relatórios */}
        <NavGroup items={data.documents} />

        {/* Grupo secundário */}
        <NavGroup items={data.navSecondary} />
      </SidebarContent>

      {/* Rodapé com usuário */}
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
