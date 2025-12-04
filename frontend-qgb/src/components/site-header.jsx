"use client" // Importante para usar o ThemeToggle e UserNav

import { useEffect, useState } from "react"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserNav } from "@/components/user-nav" // Importar o componente criado
import { useAuth } from "@/contexts/AuthContext"
import { readById as readLojaById } from "@/services/lojaService"
import { readById as readFuncionarioById } from "@/services/funcionarioService"

export function SiteHeader() {
  const { user, token } = useAuth()
  const [lojaNome, setLojaNome] = useState(null)

  useEffect(() => {
    let mounted = true
    async function loadLoja() {
      // Prioriza loja_id do usuário autenticado
      try {
        if (user?.loja_id && token) {
          const loja = await readLojaById(user.loja_id, token)
          if (mounted) setLojaNome(loja?.nome ?? loja?.nome_fantasia ?? String(user.loja_id))
          return
        }

        // Se não veio loja_id no payload de login, tentar buscar o funcionário completo
        if (user?.id && token) {
          const func = await readFuncionarioById(user.id, token)
          // func pode já trazer nome_loja se o backend fizer join
          if (mounted && func) {
            if (func.nome_loja) {
              setLojaNome(func.nome_loja)
              return
            }
            if (func.loja_id) {
              try {
                const loja = await readLojaById(func.loja_id, token)
                if (mounted) setLojaNome(loja?.nome ?? loja?.nome_fantasia ?? String(func.loja_id))
                return
              } catch (e) {
                console.warn('Erro ao buscar loja a partir do funcionário:', e)
              }
            }
          }
        }

        // Tentativas alternativas: alguns payloads podem incluir nome_loja direto
        if (user?.nome_loja) {
          setLojaNome(user.nome_loja)
          return
        }

        // Fallback para mostrar algo identificável
        setLojaNome(user?.nome_completo ?? user?.email ?? 'Filial')
      } catch (e) {
        console.error('Erro ao carregar dados da loja:', e)
        if (mounted) setLojaNome(user?.nome_completo ?? user?.email ?? 'Filial')
      }
    }
    loadLoja()
    return () => { mounted = false }
  }, [user, token])

  return (
    <header
      className="flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-16"
    >
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 h-4" />
        <h1 className="text-base font-medium"> {lojaNome ?? 'Filial'}</h1>

        <div className="ml-auto flex items-center gap-4">
          <ThemeToggle />
          <UserNav /> {/* Componente de Avatar adicionado aqui */}
        </div>
      </div>
    </header>
  );
}