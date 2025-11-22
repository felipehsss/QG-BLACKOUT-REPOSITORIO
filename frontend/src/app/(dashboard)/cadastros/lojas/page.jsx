"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { LojasTable } from "@/components/lojas/lojas-table"
import { LojaForm } from "@/components/lojas/loja-form"
import { readAll as readLojas, deleteRecord as deleteLoja } from "@/services/lojaService"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"

export default function LojasPage() {
  const { token } = useAuth()
  const [lojas, setLojas] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingLoja, setEditingLoja] = useState(null)

  const fetchLojas = async () => {
    if (!token) {
      setIsLoading(false)
      setError("Token não encontrado. Por favor, faça login.")
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const data = await readLojas(token)
      setLojas(data || [])
    } catch (err) {
      const errorMessage = err.message || "Erro ao carregar lojas."
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLojas()
  }, [token])

  const handleAdd = () => {
    setEditingLoja(null)
    setIsFormOpen(true)
  }

  const handleEdit = (loja) => {
    setEditingLoja(loja)
    setIsFormOpen(true)
  }

  const handleDelete = async (loja) => {
    if (!confirm(`Confirma exclusão da loja "${loja.nome || loja.nome_fantasia}"?`)) {
      return
    }

    try {
      const id = loja.id ?? loja.loja_id
      await deleteLoja(id, token)
      toast.success("Loja excluída com sucesso!")
      fetchLojas()
    } catch (err) {
      const errorMessage = err.message || "Erro ao excluir loja."
      toast.error(errorMessage)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Carregando lojas...</p>
      </div>
    )
  }

  if (error && lojas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12 text-center text-destructive">
        <h3 className="text-xl font-semibold">Erro ao carregar lojas</h3>
        <p className="text-muted-foreground">{error}</p>
        <Button variant="outline" onClick={fetchLojas}>
          Tentar Novamente
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gestão de Lojas</h1>
          <p className="text-muted-foreground">
            Cadastre e gerencie as filiais e matriz da sua empresa.
          </p>
        </div>
        <Button onClick={handleAdd}>Adicionar Loja</Button>
      </div>

      <LojasTable
        data={lojas}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <LojaForm
        open={isFormOpen}
        setOpen={setIsFormOpen}
        initialData={editingLoja}
        onSuccess={() => {
          fetchLojas()
          toast.success(editingLoja ? "Loja atualizada com sucesso!" : "Loja criada com sucesso!")
        }}
      />
    </div>
  )
}
