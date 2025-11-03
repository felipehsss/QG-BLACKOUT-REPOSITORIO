"use client";

// Usando caminhos relativos para evitar erros de compilação
import { SidebarProvider } from "../../components/ui/sidebar";
import { AppSidebar } from "../../components/app-sidebar";
import { SiteHeader } from "../../components/site-header";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
// Usando caminho relativo para evitar erros de compilação
import { useAuth } from "../../contexts/AuthContext"; 

/**
 * Este é o Layout do Dashboard.
 * Ele se aplica a todas as rotas dentro da pasta (dashboard),
 * como /dashboard, /dashboard/cadastros, etc.
 * Ele NÃO se aplica à página /login.
 */
export default function DashboardLayout({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // 4. Lógica de Proteção de Rota
  useEffect(() => {
    // Se o AuthContext terminou de carregar E o usuário NÃO está autenticado
    if (!isLoading && !isAuthenticated) {
      router.replace("/login"); // Volta para o login
    }
  }, [isAuthenticated, isLoading, router]); // Roda sempre que esses valores mudarem

  // 5. Mostra um loading enquanto o AuthContext verifica o token
  // ou se o usuário não está logado (e está prestes a ser redirecionado)
  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        Carregando...
      </div>
    );
  }

  // 6. Se estiver logado, mostra o layout do dashboard
  return (
    // O SidebarProvider é necessário para o AppSidebar funcionar
    <SidebarProvider>
      <div className="grid min-h-screen w-full grid-cols-[280px_1fr]">
        <AppSidebar />
        <div className="flex flex-col">
          <SiteHeader />
          <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}