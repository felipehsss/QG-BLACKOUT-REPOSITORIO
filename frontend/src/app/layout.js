import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext"; // Importe o AuthProvider
import { Toaster } from "@/components/ui/sonner"; // Importe o Toaster

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "QG Blackout",
  description: "Sistema de gestão",
};

/**
 * Este é o Layout Raiz (Root Layout).
 * Ele se aplica a TODAS as páginas (incluindo /login).
 * Ele NÃO deve conter a Sidebar ou o Header do dashboard.
 * Ele deve conter apenas os provedores globais.
 */
export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* O AuthProvider envolve TUDO para que o app saiba
              se o usuário está logado em qualquer página. */}
          <AuthProvider>
            {children}
          </AuthProvider>
          
          {/* Componente para mostrar as notificações (toasts) */}
          <Toaster richColors /> 
        </ThemeProvider>
      </body>
    </html>
  );
}