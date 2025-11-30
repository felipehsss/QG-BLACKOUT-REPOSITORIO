"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { create as createCliente, update as updateCliente } from "@/services/clienteService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { formatCPF, formatCNPJ, formatPhone } from "@/lib/utils";

const formSchema = z
  .object({
    nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
    email: z.string().email("Email inválido.").optional().or(z.literal("")),
    telefone: z.string().optional().or(z.literal("")),
    endereco: z.string().optional().or(z.literal("")),
    foto: z.any().optional(),
    tipo_cliente: z.enum(["PF", "PJ"]),
    cpf: z.string().optional(),
    cnpj: z.string().optional(),
    razao_social: z.string().optional(),
    nome_fantasia: z.string().optional(),
    inscricao_estadual: z.string().optional(),
  });

export function ClienteForm({ onSuccess, onCancel, initialData = null }) {
  const [preview, setPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token } = useAuth();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      email: "",
      telefone: "",
      endereco: "",
      tipo_cliente: "PF",
      cpf: "",
      cnpj: "",
      razao_social: "",
      nome_fantasia: "",
      inscricao_estadual: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        nome: initialData.nome ?? "",
        email: initialData.email ?? "",
        telefone: initialData.telefone ? formatPhone(initialData.telefone) : "",
        endereco: initialData.endereco ?? "",
        tipo_cliente: initialData.tipo_cliente ?? "PF",
        cpf: initialData.cpf ? formatCPF(initialData.cpf) : "",
        cnpj: initialData.cnpj ? formatCNPJ(initialData.cnpj) : "",
        razao_social: initialData.razao_social ?? "",
        nome_fantasia: initialData.nome_fantasia ?? "",
        inscricao_estadual: initialData.inscricao_estadual ?? "",
        foto: undefined,
      });
      setPreview(initialData.foto ? `http://localhost:3080/uploads/${initialData.foto}` : null);
    } else {
      form.reset();
      setPreview(null);
    }
  }, [initialData, form]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      form.setValue("foto", file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("nome", data.nome.trim());
      if (data.email) formData.append("email", data.email.trim());
      if (data.telefone) formData.append("telefone", data.telefone.replace(/\D/g, ""));
      if (data.endereco) formData.append("endereco", data.endereco.trim());
      formData.append("tipo_cliente", data.tipo_cliente);

      if (data.tipo_cliente === "PF") {
        if (data.cpf) formData.append("cpf", data.cpf.replace(/\D/g, ""));
      } else {
        if (data.cnpj) formData.append("cnpj", data.cnpj.replace(/\D/g, ""));
        if (data.razao_social) formData.append("razao_social", data.razao_social);
        if (data.nome_fantasia) formData.append("nome_fantasia", data.nome_fantasia);
        if (data.inscricao_estadual) formData.append("inscricao_estadual", data.inscricao_estadual);
      }

      if (data.foto instanceof File) {
        formData.append("foto", data.foto);
      }

      if (initialData && (initialData.id ?? initialData.id_cliente)) {
        const id = initialData.id ?? initialData.id_cliente;
        await updateCliente(id, formData, token);
        toast.success("Cliente atualizado!");
      } else {
        await createCliente(formData, token);
        toast.success("Cliente criado!");
      }

      onSuccess?.();
    } catch (err) {
      toast.error(err.message || "Erro ao salvar cliente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        
        <div className="flex flex-col items-center gap-4">
          <Avatar className="w-24 h-24">
            <AvatarImage src={preview} className="object-cover" />
            <AvatarFallback>{initialData?.nome?.charAt(0) || "C"}</AvatarFallback>
          </Avatar>
          <Input type="file" accept="image/*" onChange={handleFileChange} className="w-full max-w-xs" />
        </div>

        <FormField control={form.control} name="nome" render={({ field }) => (
          <FormItem>
            <FormLabel>Nome *</FormLabel>
            <FormControl><Input placeholder="Nome completo" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="telefone" render={({ field }) => (
            <FormItem>
                <FormLabel>Telefone</FormLabel>
                <FormControl><MaskedInput placeholder="(11) 99999-9999" mask={formatPhone} {...field} /></FormControl>
                <FormMessage />
            </FormItem>
            )} />
            
            <FormField control={form.control} name="tipo_cliente" render={({ field }) => (
            <FormItem>
                <FormLabel>Tipo</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="PF">Pessoa Física</SelectItem>
                    <SelectItem value="PJ">Pessoa Jurídica</SelectItem>
                </SelectContent>
                </Select>
                <FormMessage />
            </FormItem>
            )} />
        </div>

        {form.watch("tipo_cliente") === "PF" && (
            <FormField control={form.control} name="cpf" render={({ field }) => (
            <FormItem>
                <FormLabel>CPF</FormLabel>
                <FormControl><MaskedInput placeholder="000.000.000-00" mask={formatCPF} {...field} /></FormControl>
                <FormMessage />
            </FormItem>
            )} />
        )}

        {form.watch("tipo_cliente") === "PJ" && (
            <FormField control={form.control} name="cnpj" render={({ field }) => (
            <FormItem>
                <FormLabel>CNPJ</FormLabel>
                <FormControl><MaskedInput placeholder="00.000.000/0001-00" mask={formatCNPJ} {...field} /></FormControl>
                <FormMessage />
            </FormItem>
            )} />
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>Cancelar</Button>
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Salvando..." : "Salvar"}</Button>
        </div>
      </form>
    </Form>
  );
}