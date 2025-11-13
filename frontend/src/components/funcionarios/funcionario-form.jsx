"use client";

import { useState, useEffect } from "react";
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
import {
  create as createFuncionario,
  update as updateFuncionario,
} from "@/services/funcionarioService";
import { useAuth } from "@/contexts/AuthContext";

const formSchema = z.object({
  nome_completo: z.string().min(3, "Nome obrigatório"),
  cpf: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  telefone_contato: z.string().optional(),
  data_admissao: z.string().optional(),
  is_ativo: z.boolean().default(true),
});

export function FuncionarioForm({ open, setOpen, onSuccess, initialData = null }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token } = useAuth();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome_completo: "",
      cpf: "",
      email: "",
      telefone_contato: "",
      data_admissao: "",
      is_ativo: true,
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        nome_completo: initialData.nome_completo ?? "",
        cpf: initialData.cpf ?? "",
        email: initialData.email ?? "",
        telefone_contato: initialData.telefone_contato ?? "",
        data_admissao: initialData.data_admissao?.slice(0, 10) ?? "",
        is_ativo: initialData.is_ativo ?? true,
      });
    }
  }, [initialData, form]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        data_admissao: data.data_admissao || null,
      };

      if (initialData && (initialData.id ?? initialData.funcionario_id)) {
        const id = initialData.id ?? initialData.funcionario_id;
        await updateFuncionario(id, payload, token);
      } else {
        await createFuncionario(payload, token);
      }

      onSuccess?.();
      setOpen(false);
      form.reset();
    } catch (err) {
      console.error("Erro ao salvar funcionário:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

    return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Editar Funcionário" : "Adicionar Funcionário"}
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? "Altere os dados do funcionário."
              : "Preencha os dados do novo funcionário."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome_completo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cpf"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CPF</FormLabel>
                  <FormControl>
                    <Input placeholder="000.000.000-00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="funcionario@email.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="telefone_contato"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input placeholder="(11) 99999-9999" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="data_admissao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Admissão</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Se quiser alternar com checkbox, troque por um Switch/Checkbox do seu UI */}
            <FormField
              control={form.control}
              name="is_ativo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status (Ativo?)</FormLabel>
                  <FormControl>
                    <Input
                      type="checkbox"
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  setTimeout(() => form.reset(), 200);
                }}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Salvando..."
                  : initialData
                  ? "Salvar alterações"
                  : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
