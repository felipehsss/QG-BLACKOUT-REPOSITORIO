"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"; // Verifique se usa Label ou FieldLabel no seu UI kit
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { loginService } from "@/services/authService";

export function LoginForm({ className, ...props }) {
  const router = useRouter();
  const { loginContext } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Chama o serviço de API
      // OBS: Verifique no backend se o campo esperado é "senha" ou "password"
      // Baseado em códigos anteriores, costuma ser "senha" em alguns controllers seus
      const response = await loginService({ email, senha: password });

      // Ajuste conforme o retorno exato do seu backend (ex: response.data ou response)
      const data = response.data || response;

      if (data.token && data.user) {
        // 2. Salva no contexto e localStorage
        loginContext(data.user, data.token);
        
        toast.success("Login realizado com sucesso!");
        
        // 3. Redireciona para o dashboard
        router.push("/"); 
      } else {
        throw new Error("Token não recebido");
      }
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.error || "Falha ao fazer login. Verifique suas credenciais.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">QG Brightness</CardTitle>
          <CardDescription>
            Entre com seu email e senha
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@exemplo.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Senha</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Entrando..." : "Login"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}