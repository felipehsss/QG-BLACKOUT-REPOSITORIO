"use client"

import * as React from "react"

import {
  // Ícones que serão usados para a Filial
  IconShoppingCart, // Adicionando IconShoppingCart para PDV
  IconChartBar,
  IconDashboard,
  IconReport,
  
  // Ícones do seu layout original
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

// --- DADOS ATUALIZADOS PARA A FILIAL ---
const data = {
  user: {
    name: "Vendedor",
    email: "vendedor@qgbrightness.com",
    avatar: "/avatars/shadcn.jpg", // Mantenha ou troque o avatar
  },
  // Menu Principal: Operação e Dashboard
  navMain: [
    {
      title: "PDV (Frente de Caixa)",
      url: "/dashboard/pdv",
      icon: IconShoppingCart,
    },
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
  ],
  // Menu de Documentos: Relatórios da Loja
  documents: [
    {
      name: "Vendas da Loja",
      url: "/dashboard/relatorios/vendas",
      icon: IconChartBar,
    },
    {
      name: "Fechamentos de Caixa",
      url: "/dashboard/relatorios/caixa",
      icon: IconReport,
    },
  ],
  // Menu Secundário (Rodapé)
  navSecondary: [
    {
      title: "Configurações",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Ajuda",
      url: "#",
      icon: IconHelp,
    },
  ],
}

export function AppSidebar({
  ...props
}) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <a href="#">
                <IconInnerShadowTop className="!size-5" />
                {/* --- NOME DA EMPRESA ATUALIZADO --- */}
                <span className="text-base font-semibold">QG Brightness</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {/* --- OS COMPONENTES PERMANECEM OS MESMOS --- */}
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}