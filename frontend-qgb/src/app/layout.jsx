import { Inter } from "next/font/google"; // 1. Mude a importação para Inter
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/site-header";

// 2. Configure a fonte Inter
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "QG Brightness Dashboard",
  description: "Painel administrativo da loja",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        // 3. Aplique a classe da fonte aqui
        className={`${inter.className} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SidebarProvider>
            <div className="flex min-h-screen w-screen">
              <AppSidebar />
              <div className="flex flex-col flex-1">
                <SiteHeader />
                <main className="flex-1 p-6">
                  {children}
                </main>
              </div>
            </div>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}