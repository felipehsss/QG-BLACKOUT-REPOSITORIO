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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { create as createFuncionario, update as updateFuncionario } from "@/services/funcionarioService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// Schema Zod
const formSchema = z.object({
  nome_completo: z.string().min(3, "Nome obrigatório"),
  email: z.string().email("Email inválido"),
  cpf: z.string().optional(),
  telefone_contato: z.string().optional(),
  data_admissao: z.string().optional(),
  // Campos numéricos que no form podem vir como string
  loja_id: z.string().or(z.number()).transform(v => Number(v)),
  perfil_id: z.string().or(z.number()).transform(v => Number(v)),
  // Senha opcional na edição
  senha: z.string().optional(),
  is_ativo: z.boolean().default(true),
  foto: z.any().optional(),
});

export function FuncionarioForm({ open, setOpen, onSuccess, initialData = null }) {
  const [preview, setPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token } = useAuth();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome_completo: "",
      email: "",
      cpf: "",
      telefone_contato: "",
      data_admissao: "",
      loja_id: "1",   // Valor padrão (pode melhorar buscando lojas)
      perfil_id: "3", // Valor padrão (Vendedor)
      senha: "",
      is_ativo: true,
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        nome_completo: initialData.nome_completo ?? "",
        email: initialData.email ?? "",
        cpf: initialData.cpf ?? "",
        telefone_contato: initialData.telefone_contato ?? "",
        data_admissao: initialData.data_admissao ? initialData.data_admissao.split('T')[0] : "",
        loja_id: initialData.loja_id ?? "1",
        perfil_id: initialData.perfil_id ?? "3",
        senha: "", // Senha vazia na edição
        is_ativo: Boolean(initialData.is_ativo),
      });
      
      if (initialData.foto) {
        setPreview(`http://localhost:3080/uploads/${initialData.foto}`);
      } else {
        setPreview(null);
      }
    } else {
      form.reset();
      setPreview(null);
    }
  }, [initialData, form, open]);

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
      formData.append("nome_completo", data.nome_completo);
      formData.append("email", data.email);
      if (data.cpf) formData.append("cpf", data.cpf);
      if (data.telefone_contato) formData.append("telefone_contato", data.telefone_contato);
      if (data.data_admissao) formData.append("data_admissao", data.data_admissao);
      
      formData.append("loja_id", data.loja_id);
      formData.append("perfil_id", data.perfil_id);
      formData.append("is_ativo", data.is_ativo);

      if (data.senha) {
        formData.append("senha", data.senha);
      }

      if (data.foto instanceof File) {
        formData.append("foto", data.foto);
      }

      if (initialData && (initialData.id ?? initialData.funcionario_id)) {
        const id = initialData.id ?? initialData.funcionario_id;
        await updateFuncionario(id, formData, token);
        toast.success("Funcionário atualizado!");
      } else {
        if(!data.senha) {
            toast.error("Senha é obrigatória para novos funcionários.");
            setIsSubmitting(false);
            return;
        }
        await createFuncionario(formData, token);
        toast.success("Funcionário criado!");
      }

      onSuccess?.();
      setOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar funcionário.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? "Editar Funcionário" : "Novo Funcionário"}</DialogTitle>
          <DialogDescription>Preencha os dados abaixo.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            {/* FOTO */}
            <div className="flex flex-col items-center gap-4">
              <Avatar className="w-24 h-24 border">
                <AvatarImage src={preview} className="object-cover" />
                <AvatarFallback>{initialData?.nome_completo?.charAt(0) || "F"}</AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-2">
                 <Input type="file" accept="image/*" onChange={handleFileChange} className="w-full max-w-xs cursor-pointer" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="nome_completo" render={({ field }) => (
                    <FormItem>
                    <FormLabel>Nome Completo *</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )} />
                
                <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )} />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="cpf" render={({ field }) => (
                    <FormItem>
                    <FormLabel>CPF</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )} />
                
                <FormField control={form.control} name="telefone_contato" render={({ field }) => (
                    <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )} />
            </div>

             {/* IDs (Idealmente seriam Selects buscando do banco) */}
            <div className="grid grid-cols-2 gap-4">
                 <FormField control={form.control} name="loja_id" render={({ field }) => (
                    <FormItem>
                    <FormLabel>ID da Loja</FormLabel>
                    <FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="perfil_id" render={({ field }) => (
                    <FormItem>
                    <FormLabel>ID do Perfil (1=Adm, 3=Vend)</FormLabel>
                    <FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )} />
            </div>

            <div className="grid grid-cols-2 gap-4">
                 <FormField control={form.control} name="data_admissao" render={({ field }) => (
                    <FormItem>
                    <FormLabel>Data Admissão</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )} />
                
                <FormField control={form.control} name="senha" render={({ field }) => (
                    <FormItem>
                    <FormLabel>Senha {initialData ? "(Deixe em branco para manter)" : "*"}</FormLabel>
                    <FormControl><Input type="password" {...field} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )} />
            </div>

            <FormField control={form.control} name="is_ativo" render={({ field }) => (
                <div className="flex items-center space-x-2 mt-2">
                  <Input 
                    type="checkbox" 
                    className="h-4 w-4"
                    checked={field.value} 
                    onChange={e => field.onChange(e.target.checked)} 
                  />
                  <FormLabel className="pb-2">Funcionário Ativo?</FormLabel>
                </div>
            )} />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Salvando..." : "Salvar"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}