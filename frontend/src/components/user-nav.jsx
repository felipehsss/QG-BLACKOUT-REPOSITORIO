"use client";

import { useState } from "react"; // 1. Importar useState
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"; // 2. Importar componentes do Dialog
import { Label } from "@/components/ui/label"; // Opcional: para melhor estilização
import { Input } from "@/components/ui/input"; // Opcional: para exibir os dados
import { LogOut, User, Settings } from "lucide-react"; // Ícones sugeridos

const getInitials = (name, fullName, email) => {
  const displayName = fullName || name;
  if (displayName) {
    const names = displayName.split(" ");
    const initials = names.map((n) => n[0]).join("");
    return initials.length > 1
      ? `${initials[0]}${initials[initials.length - 1]}`
      : initials[0];
  }
  if (email) {
    return email.substring(0, 2).toUpperCase();
  }
  return "U";
};

export function UserNav() {
  const { user, logoutContext } = useAuth();
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false); // 3. Estado do Dialog

  const handleLogout = () => {
    logoutContext();
    router.push("/login");
  };

  if (!user) {
    return (
      <Button variant="ghost" className="relative h-8 w-8 rounded-full" disabled>
        <Avatar className="h-8 w-8">
          <AvatarFallback>?</AvatarFallback>
        </Avatar>
      </Button>
    );
  }

  const displayName = user.nome_completo || user.nome;

  return (
    <>
      {/* 4. Componente Dialog (Renderizado fora/junto ao menu para não fechar junto) */}
      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Perfil do Usuário</DialogTitle>
            <DialogDescription>
              Informações da sua conta atual.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2 items-center justify-center mb-4">
               <Avatar className="h-24 w-24">
                  <AvatarFallback className="text-2xl">
                    {getInitials(user.nome, user.nome_completo, user.email)}
                  </AvatarFallback>
                </Avatar>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nome
              </Label>
              <Input
                id="name"
                value={displayName || ""}
                className="col-span-3"
                readOnly
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                E-mail
              </Label>
              <Input
                id="email"
                value={user.email || ""}
                className="col-span-3"
                readOnly
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="id" className="text-right">
                ID
              </Label>
              <Input
                id="id"
                value={user.id || ""}
                className="col-span-3"
                readOnly
              />
            </div>

             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="perfil" className="text-right">
                Perfil ID
              </Label>
              <Input
                id="perfil"
                value={user.perfil_id || ""}
                className="col-span-3"
                readOnly
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setIsProfileOpen(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Menu Dropdown Existente */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                {getInitials(user.nome, user.nome_completo, user.email)}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{displayName}</p>
              {displayName !== user.email && (
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              )}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {/* 5. Item Perfil Atualizado */}
            <DropdownMenuItem 
              onSelect={(e) => {
                e.preventDefault(); // Impede o fechamento imediato se necessário, mas o state resolve
                setIsProfileOpen(true);
              }}
              className="cursor-pointer"
            >
              <User className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </DropdownMenuItem>
            
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={handleLogout}
            className="cursor-pointer text-red-500 focus:text-red-500"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sair</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}