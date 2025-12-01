"use client" // Importante para usar o ThemeToggle e UserNav

import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserNav } from "@/components/user-nav" // Importar o componente criado

export function SiteHeader() {
  return (
    <header
      className="flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-16"
    >
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 h-4" />
        <h1 className="text-base font-medium">QG Brightness - Filial</h1>
        
        <div className="ml-auto flex items-center gap-4">
          <ThemeToggle />
          <UserNav /> {/* Componente de Avatar adicionado aqui */}
        </div>
      </div>
    </header>
  );
}