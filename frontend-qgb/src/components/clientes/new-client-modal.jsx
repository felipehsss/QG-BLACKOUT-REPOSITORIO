"use client"

import React, { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { create as createCliente } from "@/services/clienteService"
import { toast } from "sonner"

export default function NewClientModal({ open, onOpenChange }) {
  const { token } = useAuth()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ nome: "", telefone: "", email: "", endereco: "" })

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((s) => ({ ...s, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      await createCliente(form, token)
      toast.success("Cliente criado com sucesso")
      onOpenChange(false)
    } catch (err) {
      console.error("Erro ao criar cliente:", err)
      toast.error("Não foi possível criar o cliente")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={!!open} onOpenChange={(v) => onOpenChange(v)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Cliente</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input name="nome" placeholder="Nome completo" value={form.nome} onChange={handleChange} required />
          <Input name="telefone" placeholder="Telefone" value={form.telefone} onChange={handleChange} />
          <Input name="email" placeholder="E-mail" value={form.email} onChange={handleChange} />
          <Input name="endereco" placeholder="Endereço" value={form.endereco} onChange={handleChange} />

          <DialogFooter className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
