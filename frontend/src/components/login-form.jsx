"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { loginService } from "@/services/authService"; // Importando seu serviço
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext"; // Importando o Contexto
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function LoginForm({ className, ...props }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null); // Adicionando estado de erro

  // Estados para controlar os campos de input
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const router = useRouter();
  const { loginContext } = useAuth(); // Pegando a função de login do Contexto

  // Este é o ÚNICO handler de submit que vamos usar
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // 1. Chamar o serviço de login
      const response = await loginService({ email, senha });

      // 2. Usar o loginContext para salvar o estado globalmente
      // O loginContext vai salvar no localStorage com as chaves corretas ("userToken" e "user")
      loginContext(response.user, response.token);

      toast.success("Login realizado com sucesso!");
      router.push("/"); // Redirecionar para o dashboard

    } catch (error) {
      console.error("Erro no login:", error);
      const errorMessage = error.response?.data?.message || error.message || "Credenciais inválidas";
      setError(errorMessage); // Definir a mensagem de erro para o usuário
      toast.error(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="border-none bg-transparent shadow-none">
        <CardHeader className="text-center">
          <CardTitle className="text-xl text-white">Bem-vindo de volta</CardTitle>
          <CardDescription className="text-gray-300">
            Faça login com sua conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Apontar o form para o nosso handler handleSubmit */}
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email" className="text-white">E-mail</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@exemplo.com"
                  required
                  value={email} // Conectar ao estado
                  onChange={(e) => setEmail(e.target.value)} // Conectar ao estado
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password" className="text-white">Senha</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto text-sm text-gray-300 underline-offset-4 hover:text-white hover:underline"
                  >
                    Esqueceu sua senha?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={senha} // Conectar ao estado
                  onChange={(e) => setSenha(e.target.value)} // Conectar ao estado
                />
              </Field>
              {/* Mostrar o erro para o usuário */}
              {error && (
                <p className="text-sm text-red-600 text-center">{error}</p>
              )}
              <Field>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Entrando..." : "Entrar"}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center text-gray-300">
        Ao clicar em entrar, você concorda com nossos{" "}
        <a href="#" className="hover:text-white">Termos de Serviço</a> e{" "}
        <a href="#" className="hover:text-white">Política de Privacidade</a>.
      </FieldDescription>
    </div>
  );
}
