"use client"

import * as React from "react"
import {
  IconBuilding,
  IconChartBar,
  IconDashboard,
  IconListDetails,
  IconPackage,
  IconReport,
  IconTruck,
  IconUsers,
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

// --- DADOS ATUALIZADOS PARA A SEDE ---
const data = {
  user: {
    name: "Admin",
    email: "admin@qgblackout.com",
    avatar: "/avatars/shadcn.jpg", // Mantenha ou troque o avatar
  },
  // Itens de menu unificados
  menuItems: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Lojas",
      url: "/dashboard/cadastros/lojas",
      icon: IconBuilding,
    },
    {
      title: "Usuários",
      url: "/dashboard/cadastros/usuarios",
      icon: IconUsers,
    },
    {
      title: "Produtos",
      url: "/dashboard/cadastros/produtos",
      icon: IconPackage,
    },
    {
      title: "Fornecedores",
      url: "/dashboard/cadastros/fornecedores",
      icon: IconTruck,
    },
    {
      name: "Fluxo de Caixa",
      url: "/dashboard/financeiro/fluxo-caixa",
      icon: IconChartBar,
    },
    {
      name: "Contas a Pagar",
      url: "/dashboard/financeiro/contas-a-pagar",
      icon: IconListDetails,
    },
    {
      name: "Relatório de Vendas",
      url: "/dashboard/relatorios/vendas",
      icon: IconReport,
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
          <SidebarMenuItem className="!p-0">
            <SidebarMenuButton asChild className="!h-auto !p-2">
              <a href="/dashboard">
                {/* --- NOME DA EMPRESA ATUALIZADO --- */}
                <span className="text-base font-semibold">QG Blackout</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavGroup items={data.menuItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}