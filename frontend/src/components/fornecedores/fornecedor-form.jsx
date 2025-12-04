"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MaskedInput } from "@/components/ui/masked-input";

import { create as createFornecedor, update as updateFornecedor } from "@/services/fornecedorService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { cpfCnpjMask, phoneMask } from "../funcionarios/masks";

// 1. Removido 'endereco' do schema de validação
const formSchema = z.object({
  nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
  email: z.string().email("Email inválido.").optional().or(z.literal("")),
  telefone: z.string().optional().or(z.literal("")),
  cnpj: z.string().optional().or(z.literal("")),
});

export function FornecedorForm({ open, setOpen, onSuccess, initialData = null }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token } = useAuth();

  // 2. Removido 'endereco' dos valores padrão
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { nome: "", email: "", telefone: "", cnpj: "" },
  });

  // 3. Removido 'endereco' do reset (edição e criação)
  useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset({
          nome: initialData.nome ?? initialData.razao_social ?? "",
          email: initialData.email ?? "",
          telefone: initialData.telefone ?? "",
          cnpj: initialData.cnpj ?? "",
        });
      } else {
        form.reset({
          nome: "",
          email: "",
          telefone: "",
          cnpj: "",
        });
      }
    }
  }, [initialData, open, form]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // 4. Removido 'endereco' do payload enviado para a API
      const payload = {
        razao_social: data.nome,
        email: data.email?.trim() || null,
        telefone: data.telefone?.trim() || null,
        cnpj: data.cnpj?.trim() || null,
      };

      if (initialData && (initialData.id ?? initialData.fornecedor_id)) {
        const id = initialData.id ?? initialData.fornecedor_id;
        await updateFornecedor(id, payload, token);
        toast.success("Fornecedor atualizado!");
      } else {
        await createFornecedor(payload, token);
        toast.success("Fornecedor criado!");
      }
      
      // Fecha o modal e chama o callback de sucesso
      setOpen(false);
      onSuccess?.();
    } catch (err) {
      toast.error(err.message || "Erro ao salvar fornecedor.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Editar Fornecedor" : "Novo Fornecedor"}
          </DialogTitle>
          <DialogDescription>
            Preencha os dados do fornecedor abaixo. Clique em salvar quando terminar.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Razão Social / Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome da empresa" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cnpj"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CNPJ</FormLabel>
                    <FormControl>
                      <MaskedInput 
                        placeholder="00.000.000/0001-00" 
                        {...field} 
                        mask={cpfCnpjMask} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="telefone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <MaskedInput 
                        placeholder="(00) 00000-0000" 
                        {...field} 
                        mask={phoneMask} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="contato@empresa.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 5. Campo de endereço removido do JSX */}

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)} 
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}