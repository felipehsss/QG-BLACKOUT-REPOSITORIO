"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

import * as lojaService from "@/services/lojaService"
import { useAuth } from "@/contexts/AuthContext"

const initialData = {
  nome: "",
  endereco: "",
  telefone: "",
  email: "",
  tipo: "Filial", // Padrão
  cnpj: ""
}

export function LojaForm({ open, onOpenChange, editData, onSuccess }) {
  const { token } = useAuth()
  const [formData, setFormData] = useState(initialData)
  const [loading, setLoading] = useState(false)

  // Carrega dados se for edição
  useEffect(() => {
    if (editData) {
      setFormData({
        nome: editData.nome || "",
        endereco: editData.endereco || "",
        telefone: editData.telefone || "",
        email: editData.email || "",
        tipo: editData.tipo || "Filial",
        cnpj: editData.cnpj || ""
      })
    } else {
      setFormData(initialData)
    }
  }, [editData, open])

  const handleChange = (e) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validação simples
      if (!formData.nome || !formData.tipo) {
        toast.error("Preencha os campos obrigatórios.")
        setLoading(false)
        return
      }

      if (editData) {
        // Atualizar
        await lojaService.update(editData.loja_id || editData.id, formData, token)
        toast.success("Loja atualizada com sucesso!")
      } else {
        // Criar
        await lojaService.create(formData, token)
        toast.success("Loja criada com sucesso!")
      }

      onSuccess() // Recarrega a tabela pai
      onOpenChange(false) // Fecha o modal
    } catch (error) {
      console.error(error)
      toast.error("Erro ao salvar loja. Verifique os dados.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[500px]">
        <SheetHeader>
          <SheetTitle>{editData ? "Editar Loja" : "Nova Loja"}</SheetTitle>
          <SheetDescription>
            Preencha os dados da unidade. Clique em salvar quando terminar.
          </SheetDescription>
        </SheetHeader>
        
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="nome">Nome da Loja *</Label>
            <Input id="nome" value={formData.nome} onChange={handleChange} placeholder="Ex: QG Centro" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
                <Label htmlFor="tipo">Tipo *</Label>
                <Select 
                  value={formData.tipo} 
                  onValueChange={(v) => setFormData(prev => ({ ...prev, tipo: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Matriz">Matriz</SelectItem>
                    <SelectItem value="Filial">Filial</SelectItem>
                  </SelectContent>
                </Select>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input id="cnpj" value={formData.cnpj} onChange={handleChange} placeholder="00.000.000/0000-00" />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" value={formData.email} onChange={handleChange} placeholder="contato@loja.com" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="telefone">Telefone</Label>
            <Input id="telefone" value={formData.telefone} onChange={handleChange} placeholder="(00) 0000-0000" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="endereco">Endereço Completo</Label>
            <Input id="endereco" value={formData.endereco} onChange={handleChange} placeholder="Rua, Número, Bairro..." />
          </div>

          <SheetFooter>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editData ? "Salvar Alterações" : "Cadastrar Loja"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}