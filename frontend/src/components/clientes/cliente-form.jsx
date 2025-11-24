"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { create as createCliente, update as updateCliente } from "@/services/clienteService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const formSchema = z
  .object({
    nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
    email: z.string().email("Email inválido.").optional().or(z.literal("")),
    telefone: z.string().optional().or(z.literal("")),
    endereco: z.string().optional().or(z.literal("")),
    foto: z.any().optional(), // Campo para a foto
    tipo_cliente: z.enum(["PF", "PJ"], {
      required_error: "Selecione o tipo de cliente.",
    }),
    cpf: z.string().optional().or(z.literal("")),
    cnpj: z.string().optional().or(z.literal("")),
    razao_social: z.string().optional().or(z.literal("")),
    nome_fantasia: z.string().optional().or(z.literal("")),
    inscricao_estadual: z.string().optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    // VALIDAÇÃO: Apenas verifica se os dados estão corretos
    if (data.tipo_cliente === "PF" && !data.cpf) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "CPF é obrigatório para Pessoa Física.",
        path: ["cpf"],
      });
    }
    if (data.tipo_cliente === "PJ" && !data.cnpj) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "CNPJ é obrigatório para Pessoa Jurídica.",
        path: ["cnpj"],
      });
    }
  });

export function ClienteForm({ open, setOpen, onSuccess, initialData = null }) {
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
        telefone: initialData.telefone ?? "",
        endereco: initialData.endereco ?? "",
        tipo_cliente: initialData.tipo_cliente ?? "PF",
        cpf: initialData.cpf ?? "",
        cnpj: initialData.cnpj ?? "",
        razao_social: initialData.razao_social ?? "",
        nome_fantasia: initialData.nome_fantasia ?? "",
        inscricao_estadual: initialData.inscricao_estadual ?? "",
      });
      
      // Configura o preview se o cliente já tiver foto
      if (initialData.foto) {
        setPreview(`http://localhost:3080/uploads/${initialData.foto}`);
      } else {
        setPreview(null);
      }
    } else {
      // Limpa o form se for cadastro novo
      form.reset({
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
      });
      setPreview(null);
    }
  }, [initialData, form, open]); // Adicionei 'open' para garantir reset ao abrir

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      form.setValue("foto", file); // Salva o arquivo no estado do formulário
      setPreview(URL.createObjectURL(file)); // Cria preview local para exibir na hora
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // PREPARAÇÃO DOS DADOS: Transforma tudo em FormData para enviar arquivos
      const formData = new FormData();

      // Campos comuns
      formData.append("nome", data.nome.trim());
      if (data.email) formData.append("email", data.email.trim());
      if (data.telefone) formData.append("telefone", data.telefone.trim());
      if (data.endereco) formData.append("endereco", data.endereco.trim());
      formData.append("tipo_cliente", data.tipo_cliente);

      // Campos específicos por tipo
      if (data.tipo_cliente === "PF") {
        if (data.cpf) formData.append("cpf", data.cpf.trim());
      } else {
        if (data.cnpj) formData.append("cnpj", data.cnpj.trim());
        if (data.razao_social) formData.append("razao_social", data.razao_social.trim());
        if (data.nome_fantasia) formData.append("nome_fantasia", data.nome_fantasia.trim());
        if (data.inscricao_estadual) formData.append("inscricao_estadual", data.inscricao_estadual.trim());
      }

      // Envio da foto (apenas se for um novo arquivo selecionado)
      if (data.foto instanceof File) {
        formData.append("foto", data.foto);
      }

      // Chamada à API
      if (initialData && (initialData.id ?? initialData.id_cliente)) {
        const id = initialData.id ?? initialData.id_cliente;
        await updateCliente(id, formData, token);
        toast.success("Cliente atualizado com sucesso!");
      } else {
        await createCliente(formData, token);
        toast.success("Cliente criado com sucesso!");
      }

      onSuccess?.();
      setOpen(false);
      
      // Pequeno delay para limpar o form visualmente após fechar
      setTimeout(() => {
        form.reset();
        setPreview(null);
      }, 200);

    } catch (err) {
      const errorMessage = err.message || "Erro ao salvar cliente.";
      console.error("Erro ao salvar cliente:", err);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Editar Cliente" : "Adicionar Cliente"}
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? "Altere os dados do cliente."
              : "Preencha os dados do novo cliente."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            {/* ÁREA DA FOTO */}
            <div className="flex flex-col items-center gap-4">
              <Avatar className="w-24 h-24">
                <AvatarImage src={preview} className="object-cover" />
                <AvatarFallback className="text-lg">
                  {initialData?.nome?.charAt(0).toUpperCase() || "F"}
                </AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-2">
                <Input 
                  type="file" 
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full max-w-xs cursor-pointer"
                />
              </div>
            </div>

            {/* Nome */}
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome completo ou fantasia" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="cliente@email.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Telefone */}
            <FormField
              control={form.control}
              name="telefone"
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

            {/* Endereço */}
            <FormField
              control={form.control}
              name="endereco"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço</FormLabel>
                  <FormControl>
                    <Input placeholder="Rua, nº, bairro, cidade" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tipo de Cliente */}
            <FormField
              control={form.control}
              name="tipo_cliente"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Cliente *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione PF ou PJ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PF">Pessoa Física</SelectItem>
                      <SelectItem value="PJ">Pessoa Jurídica</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* CPF */}
            {form.watch("tipo_cliente") === "PF" && (
              <div className="space-y-4 animate-in fade-in-0 zoom-in-95">
                <FormField
                  control={form.control}
                  name="cpf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF *</FormLabel>
                      <FormControl>
                        <Input placeholder="000.000.000-00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Campos PJ */}
            {form.watch("tipo_cliente") === "PJ" && (
              <div className="space-y-4 animate-in fade-in-0 zoom-in-95">
                <p className="text-sm font-medium text-muted-foreground pt-2">Dados da Empresa</p>
                <FormField
                  control={form.control}
                  name="cnpj"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CNPJ *</FormLabel>
                      <FormControl>
                        <Input placeholder="00.000.000/0001-00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="razao_social"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Razão Social</FormLabel>
                      <FormControl>
                        <Input placeholder="Razão Social da empresa" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nome_fantasia"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Fantasia</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nome Fantasia da empresa"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="inscricao_estadual"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Inscrição Estadual</FormLabel>
                      <FormControl>
                        <Input placeholder="Inscrição Estadual" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  setTimeout(() => {
                    form.reset();
                    setPreview(null);
                  }, 200);
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