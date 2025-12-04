"use client"

import * as React from "react"
import {
  LayoutDashboard,
  ShoppingCart,
  FileText,
  Settings,
  HelpCircle,
  ChartNoAxesColumn,
  GalleryVerticalEnd,Package
} from "lucide-react"

import { NavMain } from "@/components/nav-main"

// TeamSwitcher removed per request: logo will be shown instead
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
      logo: "/logo/2.svg",
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
      title: "Produtos",
      url: "#",
      icon: Package,
      items: [
        {
          title: "Estoque",
          url: "/produtos/estoque",
        },
        {
          title: "Requerimento de Produtos",
          url: "/produtos/requerimento",
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
        {/* Exibe logo estática (centralizada e maior) conforme solicitado */}
        <div className="flex items-center justify-center px-2 py-4">
          <img src="/logo/2.svg" alt="QG Brightness" className="h-14 w-auto" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
    
      <SidebarRail />
    </Sidebar>
  )
}