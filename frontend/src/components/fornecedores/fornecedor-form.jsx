"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
import { create as createFornecedor, update as updateFornecedor } from "@/services/fornecedorService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const formSchema = z.object({
  nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
  email: z.string().email("Por favor, insira um email válido.").optional().or(z.literal("")),
  telefone: z.string().optional().or(z.literal("")),
  cnpj: z.string().optional().or(z.literal("")),
  endereco: z.string().optional().or(z.literal("")),
});

export function FornecedorForm({ open, setOpen, onSuccess, initialData = null }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token } = useAuth();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      email: "",
      telefone: "",
      cnpj: "",
      endereco: "",
    },
  });

  // Sempre que initialData mudar ou o modal abrir, preencha os valores
  useEffect(() => {
    if (initialData) {
      form.reset({
        nome: initialData.nome ?? initialData.razao_social ?? "",
        email: initialData.email ?? "",
        telefone: initialData.telefone ?? "",
        cnpj: initialData.cnpj ?? "",
        endereco: initialData.endereco ?? "",
      });
    } else if (!open) {
      form.reset(); // garante limpar ao fechar
    } else {
      form.reset({
        nome: "",
        email: "",
        telefone: "",
        cnpj: "",
        endereco: "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData, open]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const payload = {
        razao_social: data.nome,
        email: data.email?.trim() || null,
        telefone: data.telefone?.trim() || null,
        cnpj: data.cnpj?.trim() || null,
        endereco: data.endereco?.trim() || null,
      };

      if (initialData && (initialData.id ?? initialData.fornecedor_id)) {
        const id = initialData.id ?? initialData.fornecedor_id;
        await updateFornecedor(id, payload, token);
        toast.success("Fornecedor atualizado com sucesso!");
      } else {
        await createFornecedor(payload, token);
        toast.success("Fornecedor criado com sucesso!");
      }

      onSuccess?.();
      setOpen(false);
      form.reset();
    } catch (err) {
      const errorMessage = err.message || "Erro ao salvar fornecedor.";
      console.error("Erro ao salvar fornecedor:", err);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{initialData ? "Editar Fornecedor" : "Adicionar Fornecedor"}</DialogTitle>
          <DialogDescription>{initialData ? "Altere os dados do fornecedor." : "Preencha os dados do novo fornecedor."}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="nome" render={({ field }) => (
              <FormItem>
                <FormLabel>Nome *</FormLabel>
                <FormControl><Input placeholder="Nome da empresa" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl><Input placeholder="contato@empresa.com" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="telefone" render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone</FormLabel>
                <FormControl><Input placeholder="(11) 99999-9999" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="cnpj" render={({ field }) => (
              <FormItem>
                <FormLabel>CNPJ</FormLabel>
                <FormControl><Input placeholder="00.000.000/0001-00" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="endereco" render={({ field }) => (
              <FormItem>
                <FormLabel>Endereço</FormLabel>
                <FormControl><Input placeholder="Rua, nº, bairro, cidade" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setOpen(false); setTimeout(() => form.reset(), 200); }} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Salvando..." : initialData ? "Salvar alterações" : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
