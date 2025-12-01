"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { MaskedInput } from "@/components/ui/masked-input";
import { cpfCnpjMask, phoneMask } from "../funcionarios/masks";

const formSchema = z.object({
  nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
  email: z.string().email("Email inválido.").optional().or(z.literal("")),
  telefone: z.string().optional().or(z.literal("")),
  cnpj: z.string().optional().or(z.literal("")),
  endereco: z.string().optional().or(z.literal("")),
});

export function FornecedorForm({ onSuccess, onCancel, initialData = null }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token } = useAuth();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { nome: "", email: "", telefone: "", cnpj: "", endereco: "" },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        nome: initialData.nome ?? initialData.razao_social ?? "",
        email: initialData.email ?? "",
        telefone: initialData.telefone ?? "",
        cnpj: initialData.cnpj ?? "",
        endereco: initialData.endereco ?? "",
      });
    } else {
      form.reset();
    }
  }, [initialData, form]);

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
        toast.success("Fornecedor atualizado!");
      } else {
        await createFornecedor(payload, token);
        toast.success("Fornecedor criado!");
      }
      onSuccess?.();
    } catch (err) {
      toast.error(err.message || "Erro ao salvar fornecedor.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="nome" render={({ field }) => (
          <FormItem>
            <FormLabel>Razão Social / Nome</FormLabel>
            <FormControl><Input placeholder="Nome da empresa" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="cnpj" render={({ field }) => (
            <FormItem>
                <FormLabel>CNPJ</FormLabel>
                <FormControl><MaskedInput placeholder="00.000.000/0001-00" {...field} mask={cpfCnpjMask} /></FormControl>
                <FormMessage />
            </FormItem>
            )} />

            <FormField control={form.control} name="telefone" render={({ field }) => (
            <FormItem>
                <FormLabel>Telefone</FormLabel>
                <FormControl><MaskedInput placeholder="(00) 00000-0000" {...field} mask={phoneMask} /></FormControl>
                <FormMessage />
            </FormItem>
            )} />
        </div>

        <FormField control={form.control} name="email" render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl><Input placeholder="contato@empresa.com" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="endereco" render={({ field }) => (
          <FormItem>
            <FormLabel>Endereço</FormLabel>
            <FormControl><Input placeholder="Rua, nº, bairro" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>Cancelar</Button>
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Salvando..." : "Salvar"}</Button>
        </div>
      </form>
    </Form>
  );
}