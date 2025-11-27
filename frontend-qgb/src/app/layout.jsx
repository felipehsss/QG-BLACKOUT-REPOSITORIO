import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { SiteHeader } from "@/components/site-header" // importa o header


export const metadata = {
  title: "QG Brightness Dashboard",
  description: "Painel administrativo da loja",
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={` antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SidebarProvider>
            {/* Flex container ocupando a tela inteira */}
            <div className="flex min-h-screen w-screen">
              {/* Sidebar fixa */}
              <AppSidebar />

              {/* Área principal */}
              <div className="flex flex-col flex-1">
                {/* Header no topo */}
                <SiteHeader />

                {/* Conteúdo da página ocupa o restante */}
                <main className="flex-1 p-6">
                  {children}
                </main>
              </div>
            </div>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}