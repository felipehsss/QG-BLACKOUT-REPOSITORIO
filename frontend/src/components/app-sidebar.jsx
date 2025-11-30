"use client"

import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal, PiggyBank, ChartLine,LayoutDashboard,
  Package,Truck,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "QG Blackout",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },

  ],
  navMain: [
    {
      title: "Principal",
      url: "/",
      icon: LayoutDashboard,
      items: [
        {
          title: "Dashboard",
          url: "/",
        },
      ],
    },
    {
      title: "Cadastros",
      url: "#",
      icon: SquareTerminal,
      isActive: false,
      items: [
        {
          title: "Clientes",
          url: "/cadastros/clientes",
        },
        {
          title: "Fornecedores",
          url: "/cadastros/fornecedores",
        },
        {
          title: "Produtos",
          url: "/cadastros/produtos",
        },
        {
          title: "Serviços",
          url: "/cadastros/servicos",
        },
        {
          title: "Funcionarios",
          url: "/cadastros/funcionarios",
        },
      ],
    },
    {
      title: "Gestão de Estoque",
      url: "#",
      icon: Package,
      items: [
        {
          title: "Estoque",
          url: "/produtos/estoque", // Rota para sua página de estoque
        },
        {
          title: "Requerimentos & Envios",
          url: "/produtos/requerimento", // Rota para sua página de requerimentos
        },
      ],
    },
    {
      title: "Financeiro",
      url: "#",
      icon: PiggyBank,
      items: [
        {
          title: "Contas a Pagar",
          url: "/financeiro/contas-a-pagar",
        },
        {
          title: "Fluxo de Caixa",
          url: "/financeiro/fluxo-caixa",
        },

      ],
    },
    {
      title: "Relatórios",
      url: "#",
      icon: ChartLine,
      items: [
        {
          title: "Vendas",
          url: "/relatorios/vendas",
        },


      ],
    },

    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
  ],

}

export function AppSidebar({
  ...props
}) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />

      </SidebarContent>
     
      <SidebarRail />
    </Sidebar>
  );
}
