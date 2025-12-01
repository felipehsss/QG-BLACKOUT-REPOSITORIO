"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { CalendarIcon, Loader2, Save } from "lucide-react"

import { useAuth } from "@/contexts/AuthContext"
import { create as criarConta, update as atualizarConta } from "@/services/contaPagarService"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"

const formSchema = z.object({
  descricao: z.string().min(3, "Descrição muito curta"),
  valor: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Valor inválido",
  }),
  data_vencimento: z.date({ required_error: "Data obrigatória" }),
  fornecedor_id: z.string({ required_error: "Fornecedor obrigatório" }),
  loja_id: z.string({ required_error: "Loja obrigatória" }),
  categoria: z.string().min(1, "Categoria obrigatória"),
  status: z.enum(["Pendente", "Pago", "Atrasada"]).default("Pendente"),
})

export function ContaPagarForm({ 
  open, 
  setOpen, 
  initialData, 
  onSuccess, 
  lojas = [], 
  fornecedores = [] 
}) {
  const { token } = useAuth()
  const [loading, setLoading] = useState(false)

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      descricao: "",
      valor: "",
      data_vencimento: new Date(),
      fornecedor_id: "",
      loja_id: "",
      categoria: "Fornecedores",
      status: "Pendente"
    },
  })

  useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset({
          descricao: initialData.descricao,
          valor: String(initialData.valor),
          data_vencimento: initialData.data_vencimento ? new Date(initialData.data_vencimento) : new Date(),
          fornecedor_id: initialData.fornecedor_id ? String(initialData.fornecedor_id) : "",
          loja_id: initialData.loja_id ? String(initialData.loja_id) : "",
          categoria: initialData.categoria || "Outros",
          status: initialData.status || "Pendente"
        })
      } else {
        form.reset({
          descricao: "",
          valor: "",
          data_vencimento: new Date(),
          fornecedor_id: "",
          loja_id: "",
          categoria: "Fornecedores",
          status: "Pendente"
        })
      }
    }
  }, [initialData, open, form])

  const onSubmit = async (values) => {
    setLoading(true)
    try {
      const payload = {
        ...values,
        valor: parseFloat(values.valor),
        loja_id: Number(values.loja_id),
        fornecedor_id: Number(values.fornecedor_id),
        data_vencimento: format(values.data_vencimento, "yyyy-MM-dd"),
      }

      // CORREÇÃO: Usar .id, não .conta_pagar_id
      if (initialData?.id) {
        await atualizarConta(initialData.id, payload, token)
        toast.success("Conta atualizada!")
      } else {
        await criarConta(payload, token)
        toast.success("Conta criada!")
      }
      onSuccess()
    } catch (error) {
      console.error(error)
      toast.error("Erro ao salvar.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{initialData ? "Editar Conta" : "Nova Conta"}</DialogTitle>
          <DialogDescription>Detalhes da obrigação financeira.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="descricao"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Descrição</FormLabel>
                    <FormControl><Input placeholder="Ex: Compra de material" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="valor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor (R$)</FormLabel>
                    <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="categoria"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="Fornecedores">Fornecedores</SelectItem>
                        <SelectItem value="Aluguel">Aluguel</SelectItem>
                        <SelectItem value="Salários">Salários</SelectItem>
                        <SelectItem value="Impostos">Impostos</SelectItem>
                        <SelectItem value="Serviços">Serviços</SelectItem>
                        <SelectItem value="Outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fornecedor_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fornecedor</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {fornecedores.map((f) => (
                          <SelectItem key={String(f.id)} value={String(f.id)}>{f.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="loja_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loja</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {lojas.map((l) => (
                          <SelectItem key={String(l.id)} value={String(l.id)}>{l.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="data_vencimento"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Vencimento</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                            {field.value ? format(field.value, "dd/MM/yyyy") : <span>Selecione</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date("1900-01-01")}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="Pendente">Pendente</SelectItem>
                        <SelectItem value="Pago">Pago</SelectItem>
                        <SelectItem value="Atrasada">Atrasada</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={loading} className="bg-primary">{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>} Salvar</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}