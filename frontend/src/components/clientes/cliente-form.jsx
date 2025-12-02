"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

// Schema de validação
const formSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  telefone: z.string().optional(),
  endereco: z.string().optional(),
  tipo_cliente: z.enum(["PF", "PJ"]),
  // Campos condicionais (validamos no submit ou deixamos opcionais aqui)
  cpf: z.string().optional(),
  cnpj: z.string().optional(),
  razao_social: z.string().optional(),
  nome_fantasia: z.string().optional(),
  inscricao_estadual: z.string().optional(),
});

export function ClienteForm({ open, setOpen, initialData, onSuccess }) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);

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

  // Monitora o tipo de cliente para renderização condicional
  const tipoCliente = form.watch("tipo_cliente");

  // Reseta o formulário quando abre/fecha ou muda os dados iniciais
  useEffect(() => {
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
      });
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
      });
    }
  }, [initialData, open, form]);

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      // Limpeza de dados baseada no tipo (para não enviar CPF se for PJ e vice-versa)
      const payload = { ...values };
      if (payload.tipo_cliente === "PF") {
        payload.cnpj = null;
        payload.razao_social = null;
        payload.nome_fantasia = null;
        payload.inscricao_estadual = null;
      } else {
        payload.cpf = null;
      }

      if (initialData) {
        // Editar
        const id = initialData.id ?? initialData.id_cliente;
        await updateCliente(id, payload, token);
        toast.success("Cliente atualizado com sucesso!");
      } else {
        // Criar
        await createCliente(payload, token);
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