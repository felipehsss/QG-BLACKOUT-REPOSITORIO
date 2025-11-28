"use client"

import * as React from "react"
import {
  LayoutDashboard,
  ShoppingCart,
  FileText,
  Settings,
  HelpCircle,
  ChartNoAxesColumn,
  GalleryVerticalEnd
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// Dados adaptados para o contexto do QGB
const data = {
  user: {
    name: "Vendedor",
    email: "vendedor@qgbrightness.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "QG Brightness",
      logo: GalleryVerticalEnd,
      plan: "Loja Física",
    },
  ],
  navMain: [
    {
      title: "Principal",
      url: "#",
      icon: LayoutDashboard,
      isActive: true,
      items: [
        {
          title: "Dashboard",
          url: "/",
        },
        {
          title: "PDV (Frente de Caixa)",
          url: "/pdv",
          icon: ShoppingCart, // Opcional: ícone específico se o NavMain suportar
        },
      ],
    },
    {
      title: "Relatórios",
      url: "#",
      icon: FileText,
      items: [
        {
          title: "Vendas da Loja",
          url: "/relatorios/vendas",
        },
        {
          title: "Fechamentos de Caixa",
          url: "/relatorios/caixas",
        },
      ],
    },
    {
      title: "Sistema",
      url: "#",
      icon: Settings,
      items: [
        {
          title: "Configurações",
          url: "/configuracoes",
        },
        {
          title: "Ajuda",
          url: "/ajuda",
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        {/* Adicionado o TeamSwitcher para manter o padrão visual do topo */}
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}