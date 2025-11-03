"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext"; // Nosso hook de autenticação (usando o alias '@')
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

// --- FUNÇÃO ATUALIZADA ---
// Agora ela aceita o email como fallback e procura por nome_completo
const getInitials = (name, fullName, email) => {
  const displayName = fullName || name; // Prioriza nome_completo
  if (displayName) {
    const names = displayName.split(" ");
    const initials = names.map((n) => n[0]).join("");
    // Garante que pegamos 2 iniciais se houver 2 nomes, ou 1 se for um nome só
    return initials.length > 1
      ? `${initials[0]}${initials[initials.length - 1]}`
      : initials[0];
  }
  if (email) {
    // Se não tem nome, pega as 2 primeiras letras do email
    return email.substring(0, 2).toUpperCase();
  }
  return "U"; // Fallback final
};

export function UserNav() {
  const { user, logoutContext } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logoutContext();
    router.push("/login");
  };

  if (!user) {
    return (
      <Button
        variant="ghost"
        className="relative h-8 w-8 rounded-full"
        disabled
      >
        <Avatar className="h-8 w-8">
          <AvatarFallback>?</AvatarFallback>
        </Avatar>
      </Button>
    );
  }

  // Define o nome de exibição: usa user.nome_completo, depois user.nome, e por último user.email
  const displayName = user.nome_completo || user.nome;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            {/* <AvatarImage src={user.imageUrl || ""} alt={displayName} /> */}

            {/* --- AVATAR ATUALIZADO --- */}
            <AvatarFallback>
              {getInitials(user.nome, user.nome_completo, user.email)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            {/* --- LABEL ATUALIZADA --- */}
            <p className="text-sm font-medium leading-none">{displayName}</p>

            {/* Mostra o email só se o nome de exibição for diferente do email */}
            {displayName !== user.email && (
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Perfil</DropdownMenuItem>
        <DropdownMenuItem>Configurações</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={handleLogout}
          className="cursor-pointer text-red-500 focus:text-red-500"
        >
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
