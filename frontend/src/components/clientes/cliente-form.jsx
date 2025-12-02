"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2, Upload, X, User, ImageIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { create as createCliente, update as updateCliente } from "@/services/clienteService";
import { useAuth } from "@/contexts/AuthContext";

// URL Base para montar o caminho da imagem existente
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3080/api';
const BASE_URL = API_URL.replace('/api', '');

// Schema de validação
const formSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  telefone: z.string().optional(),
  endereco: z.string().optional(),
  tipo_cliente: z.enum(["PF", "PJ"]),
  cpf: z.string().optional(),
  cnpj: z.string().optional(),
  razao_social: z.string().optional(),
  nome_fantasia: z.string().optional(),
  inscricao_estadual: z.string().optional(),
  foto: z.any().optional(), // Aceita arquivo ou null
});

export function ClienteForm({ open, setOpen, initialData, onSuccess }) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

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
      foto: null,
    },
  });

  // Monitora campos para lógica condicional
  const tipoCliente = form.watch("tipo_cliente");
  const fotoValue = form.watch("foto");

  // Resetar form ao abrir/fechar
  useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset({
          nome: initialData.nome || "",
          email: initialData.email || "",
          telefone: initialData.telefone || "",
          endereco: initialData.endereco || "",
          tipo_cliente: initialData.tipo_cliente || "PF",
          cpf: initialData.cpf || "",
          cnpj: initialData.cnpj || "",
          razao_social: initialData.razao_social || "",
          nome_fantasia: initialData.nome_fantasia || "",
          inscricao_estadual: initialData.inscricao_estadual || "",
          foto: null, // Arquivo novo começa vazio
        });
        // Configurar preview se existir foto no banco
        if (initialData.foto) {
          setPreview(`${BASE_URL}/uploads/${initialData.foto}`);
        } else {
          setPreview(null);
        }
      } else {
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
          foto: null,
        });
        setPreview(null);
      }
    }
  }, [initialData, open, form]);

  // Manipulador de arquivo
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("foto", file);
      const url = URL.createObjectURL(file);
      setPreview(url);
    }
  };

  // Remover imagem selecionada
  const handleRemoveImage = () => {
    form.setValue("foto", null);
    // Se estamos editando e tinha foto original, volta o preview pra ela? 
    // Ou define null para remover? Aqui vamos definir null (remover).
    // Obs: Para remover do banco, o backend precisa tratar uma flag específica ou null.
    setPreview(null); 
  };

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      // Construir FormData para envio de arquivo
      const formData = new FormData();
      
      formData.append("nome", values.nome);
      if (values.email) formData.append("email", values.email);
      if (values.telefone) formData.append("telefone", values.telefone);
      if (values.endereco) formData.append("endereco", values.endereco);
      formData.append("tipo_cliente", values.tipo_cliente);

      if (values.tipo_cliente === "PF") {
        if (values.cpf) formData.append("cpf", values.cpf);
      } else {
        if (values.cnpj) formData.append("cnpj", values.cnpj);
        if (values.razao_social) formData.append("razao_social", values.razao_social);
        if (values.nome_fantasia) formData.append("nome_fantasia", values.nome_fantasia);
        if (values.inscricao_estadual) formData.append("inscricao_estadual", values.inscricao_estadual);
      }

      // Se houver um arquivo novo selecionado
      if (values.foto instanceof File) {
        formData.append("foto", values.foto);
      }

      if (initialData) {
        // Editar
        const id = initialData.id ?? initialData.id_cliente;
        await updateCliente(id, formData, token);
        toast.success("Cliente atualizado com sucesso!");
      } else {
        // Criar
        await createCliente(formData, token);
        toast.success("Cliente cadastrado com sucesso!");
      }
      
      setOpen(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Erro ao salvar cliente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Editar Cliente" : "Novo Cliente"}
          </DialogTitle>
          <DialogDescription>
            Preencha os dados abaixo. Clique em salvar quando terminar.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            {/* Área de Upload de Foto */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <Avatar className="w-24 h-24 border-2 border-dashed border-muted-foreground/50">
                  <AvatarImage src={preview} className="object-cover" />
                  <AvatarFallback className="bg-muted">
                    <ImageIcon className="w-8 h-8 text-muted-foreground opacity-50" />
                  </AvatarFallback>
                </Avatar>
                
                <div className="absolute -bottom-2 -right-2 flex gap-1">
                  <label 
                    htmlFor="foto-upload" 
                    className="bg-primary text-primary-foreground rounded-full p-1.5 cursor-pointer hover:bg-primary/90 shadow-sm"
                    title="Alterar foto"
                  >
                    <Upload className="w-4 h-4" />
                    <input 
                      id="foto-upload" 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleFileChange} 
                    />
                  </label>
                  
                  {(preview || fotoValue) && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="bg-destructive text-destructive-foreground rounded-full p-1.5 cursor-pointer hover:bg-destructive/90 shadow-sm"
                      title="Remover foto"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Tipo de Cliente */}
            <FormField
              control={form.control}
              name="tipo_cliente"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Cliente</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="PF">Pessoa Física (CPF)</SelectItem>
                      <SelectItem value="PJ">Pessoa Jurídica (CNPJ)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nome Principal */}
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Nome Completo / Responsável</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do cliente" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Condicional PF */}
              {tipoCliente === "PF" && (
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
              )}

              {/* Condicional PJ */}
              {tipoCliente === "PJ" && (
                <>
                  <FormField
                    control={form.control}
                    name="cnpj"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CNPJ</FormLabel>
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
                          <Input placeholder="Empresa Ltda" {...field} />
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
                          <Input placeholder="Nome da Loja" {...field} />
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
                          <Input placeholder="IE..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="cliente@email.com" {...field} />
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
                      <Input placeholder="(00) 00000-0000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="endereco"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço</FormLabel>
                  <FormControl>
                    <Input placeholder="Rua, Número, Bairro..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}