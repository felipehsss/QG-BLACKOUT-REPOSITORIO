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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  create as createConta,
  update as updateConta,
} from "@/services/contaPagarService";
import { useAuth } from "@/contexts/AuthContext";

// Lista de Categorias Padrão (Isso deve bater com a lógica do seu Backend)
const CATEGORIAS = [
  "Fornecedores",
  "Salário",
  "Operacional", // Água, Luz, Aluguel
  "Impostos",
  "Marketing",
  "Manutenção",
  "Outros"
];

// Schema de validação
const formSchema = z.object({
  descricao: z.string().min(3, "Descrição obrigatória"),
  valor: z.coerce.number().min(0.01, "Informe um valor válido"),
  data_vencimento: z.string().min(1, "Informe a data de vencimento"),
  fornecedor_id: z.string().optional(), // Opcional pois pode ser conta de luz (sem fornecedor cadastrado)
  loja_id: z.string().min(1, "Selecione uma loja"),
  categoria: z.string().min(1, "Selecione uma categoria"), // <--- NOVO CAMPO
  status: z.enum(["Pendente", "Pago"]).default("Pendente"),
});

export function ContaPagarForm({ open, setOpen, onSuccess, initialData = null, fornecedores = [], lojas = [] }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token } = useAuth();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      descricao: "",
      valor: "",
      data_vencimento: "",
      fornecedor_id: "",
      loja_id: "",
      categoria: "", // <--- Default vazio
      status: "Pendente",
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        descricao: initialData.descricao || "",
        valor: initialData.valor || "",
        data_vencimento: initialData.data_vencimento ? initialData.data_vencimento.split('T')[0] : "",
        fornecedor_id: initialData.fornecedor_id ? String(initialData.fornecedor_id) : "0",
        loja_id: String(initialData.loja_id || ""),
        categoria: initialData.categoria || "", // <--- Carrega categoria existente
        status: initialData.status || "Pendente",
      });
    } else {
      form.reset({
        descricao: "",
        valor: "",
        data_vencimento: "",
        fornecedor_id: "",
        loja_id: "",
        categoria: "",
        status: "Pendente",
      });
    }
  }, [initialData, form, open]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        valor: parseFloat(data.valor),
        // Se fornecedor for vazio ou "0", envia null
        fornecedor_id: (data.fornecedor_id && data.fornecedor_id !== "0") ? parseInt(data.fornecedor_id) : null,
        loja_id: parseInt(data.loja_id),
      };

      if (initialData && initialData.conta_pagar_id) {
        await updateConta(initialData.conta_pagar_id, payload, token);
      } else {
        await createConta(payload, token);
      }

      onSuccess?.();
      setOpen(false);
      form.reset();
    } catch (err) {
      console.error("Erro ao salvar conta a pagar:", err);
      alert("Erro ao salvar. Verifique os dados.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Editar Conta" : "Nova Conta a Pagar"}
          </DialogTitle>
          <DialogDescription>
            Preencha os detalhes da conta para controle financeiro.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            <div className="grid grid-cols-2 gap-4">
              {/* Descrição */}
              <FormField
                control={form.control}
                name="descricao"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Boleto Aluguel, Compra de Estoque..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Valor */}
              <FormField
                control={form.control}
                name="valor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Vencimento */}
              <FormField
                control={form.control}
                name="data_vencimento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vencimento</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* --- CAMPO DE CATEGORIA (NOVO) --- */}
              <FormField
                control={form.control}
                name="categoria"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Classifique a despesa" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CATEGORIAS.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Loja */}
              <FormField
                control={form.control}
                name="loja_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loja</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {lojas.map((l) => (
                          <SelectItem key={l.loja_id} value={String(l.loja_id)}>
                            {l.nome_fantasia || l.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Fornecedor (Opcional) */}
              <FormField
                control={form.control}
                name="fornecedor_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fornecedor (Opcional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="0">Sem Fornecedor</SelectItem>
                        {fornecedores.map((f) => (
                          <SelectItem key={f.fornecedor_id} value={String(f.fornecedor_id)}>
                            {f.nome || f.razao_social}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Status */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Status atual" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Pendente">Pendente</SelectItem>
                        <SelectItem value="Pago">Pago</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}