import { NextResponse } from 'next/server'

export function middleware(request) {
  // Pega o token dos cookies ou do header (dependendo de como você salva,
  // mas o AuthContext usa localStorage que não é acessível aqui diretamente.
  // Uma prática comum é verificar a existência de um cookie, mas para simplificar
  // vamos assumir que o fluxo validará no cliente ou você migrará para cookies.
  
  // NOTA: Como seu AuthContext usa localStorage, o middleware do servidor
  // não consegue ler. A proteção "forte" deve ser feita no cliente ou mudando para cookies.
  // Entretando, vamos fazer a proteção visual básica + redirecionamento.
  
  // Vamos pular a verificação de token no servidor por enquanto e focar no Client-Side
  // devido à sua implementação atual do AuthContext.
  
  return NextResponse.next()
}

// Configuração para não rodar em arquivos estáticos
export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
}