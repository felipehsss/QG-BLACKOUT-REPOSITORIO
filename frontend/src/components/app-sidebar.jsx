"use client"

import * as React from "react"
import Image from "next/image"
import {
  GalleryVerticalEnd,
  PiggyBank, 
  ChartLine,
  LayoutDashboard,
  Package,
  SquareTerminal,
  Settings2,ShoppingCart
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

// ... (Mantenha seus dados 'data' exatamente como estavam) ...
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
          title: "Funcionarios",
          url: "/cadastros/funcionarios",
        },
        {
          title: "Lojas",
          url: "/cadastros/lojas",
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
          url: "/produtos/estoque", 
        },
        {
          title: "Requerimentos & Envios",
          url: "/produtos/requerimento", 
        },
      ],
    },
    {
      title: "Financeiro",
      url: "#",
      icon: PiggyBank,
      items: [
        {
          title: "Dashboard Financeiro",
          url: "/financeiro/dashboard",
        },
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
      title: "Compras",
      url: "#",
      icon: ShoppingCart,
      items: [
        {
          title: "Pedidos de Compra",
          url: "/compras",
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        {/* 1. LOGO DA EMPRESA - AJUSTADA PARA PREENCHER */}
        <div className="flex justify-center  group-data-[collapsible=icon]:hidden">
           {/* Aumentei a altura para h-24 (96px) e coloquei w-full.
              A imagem vai tentar preencher esse espaço mantendo a proporção.
           */}
           <div className="relative h-16 w-full"> 
             <Image 
                src="/logo/1.svg" 
                alt="QG Blackout"
                fill
                className="object-contain" // Garante que a logo apareça inteira
                priority
             />
           </div>
        </div>

        {/* 2. SELETOR DE FILIAL/TIME */}
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      
      <SidebarFooter>
        {/* <NavUser user={data.user} /> */}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}