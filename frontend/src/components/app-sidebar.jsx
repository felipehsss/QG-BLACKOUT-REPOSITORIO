"use client"

import * as React from "react"

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

// --- DADOS ATUALIZADOS PARA A SEDE ---
const data = {
  user: {
    name: "Admin",
    email: "admin@qgblackout.com",
    avatar: "/avatars/shadcn.jpg", // Mantenha ou troque o avatar
  },
  // Menu Principal: Dashboard e Cadastros
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
    },
    {
      title: "Cadastros",
      sub: [
        {
          title: "Lojas",
          url: "/dashboard/cadastros/lojas",
        },
        {
          title: "Usuários",
          url: "/dashboard/cadastros/usuarios",
        },
        {
          title: "Produtos",
          url: "/dashboard/cadastros/produtos",
        },
        {
          title: "Fornecedores",
          url: "/dashboard/cadastros/fornecedores",
        },
      ],
    },
  ],
  // Menu de Documentos: Financeiro e Relatórios
  documents: [
    {
      name: "Fluxo de Caixa",
      url: "/dashboard/financeiro/fluxo-caixa",
    },
    {
      name: "Contas a Pagar",
      url: "/dashboard/financeiro/contas-a-pagar",
    },
    {
      name: "Relatório de Vendas",
      url: "/dashboard/relatorios/vendas",
    },
  ],
  // Menu Secundário (Rodapé)
  navSecondary: [
    {
      title: "Configurações",
      url: "#",
    },
    {
      title: "Ajuda",
      url: "#",
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
              <a href="/dashboard">
                {/* --- NOME DA EMPRESA ATUALIZADO --- */}
                <span className="text-base font-semibold">QG Blackout</span>
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