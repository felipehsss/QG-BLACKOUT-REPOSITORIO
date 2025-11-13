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
  create as createPerfil,
  update as updatePerfil,
} from "@/services/perfilService";
import { useAuth } from "@/contexts/AuthContext";

const formSchema = z.object({
  nome: z.string().min(3, "Nome obrigatório"),
  descricao: z.string().optional(),
});

export function PerfilForm({ open, setOpen, onSuccess, initialData = null }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token } = useAuth();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      descricao: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        nome: initialData.nome ?? "",
        descricao: initialData.descricao ?? "",
      });
    }
  }, [initialData, form]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        descricao: data.descricao?.trim() || null,
      };

      if (initialData && (initialData.id ?? initialData.perfil_id)) {
        const id = initialData.id ?? initialData.perfil_id;
        await updatePerfil(id, payload, token);
      } else {
        await createPerfil(payload, token);
      }

      onSuccess?.();
      setOpen(false);
      form.reset();
    } catch (err) {
      console.error("Erro ao salvar perfil:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Editar Perfil" : "Adicionar Perfil"}
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? "Altere os dados do perfil."
              : "Preencha os dados do novo perfil."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do perfil" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input placeholder="Descrição do perfil" {...field} />
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