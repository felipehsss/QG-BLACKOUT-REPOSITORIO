"use client"

import * as React from "react"
import { ChevronsUpDown, Building2, Check } from "lucide-react" // Ícone de check é legal
import { useAuth } from "@/contexts/AuthContext" // Importar contexto
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function TeamSwitcher() {
  const { lojaSelecionada, listaLojas, mudarLoja } = useAuth()

  // Se ainda não carregou, não mostra nada ou mostra um esqueleto
  if (!lojaSelecionada) return null

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Building2 className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{lojaSelecionada.name}</span>
                <span className="truncate text-xs">{lojaSelecionada.plan}</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg" align="start" side="bottom" sideOffset={4}>
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Visualizar Loja
            </DropdownMenuLabel>
            {listaLojas.map((loja) => (
              <DropdownMenuItem key={loja.id} onClick={() => mudarLoja(loja)} className="gap-2 p-2 cursor-pointer">
                <div className="flex size-6 items-center justify-center rounded-sm border">
                  <Building2 className="size-4 shrink-0" />
                </div>
                {loja.name}
                {loja.id === lojaSelecionada.id && <Check className="ml-auto h-4 w-4" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}