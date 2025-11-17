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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, AlertCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton" // Importando o Skeleton

// Esta página agora é um Client Component ("use client")
// Isso é necessário porque a rota /api/lojas é protegida e precisamos
// buscar o token de autenticação do localStorage do navegador.
export default function LojasPage() {
  const [lojas, setLojas] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchLojas() {
      setIsLoading(true)
      setError(null)
      try {
        // 1. Buscar o token de autenticação do localStorage
        // (Estou assumindo que você salva o token com a chave 'qg_auth_token' após o login)
        const token = localStorage.getItem("qg_auth_token")

        if (!token) {
          throw new Error("Usuário não autenticado. Faça o login novamente.")
        }

        // 2. Fazer a chamada fetch para a API
        const response = await fetch("http://localhost:3080/api/lojas", {
          headers: {
            "Content-Type": "application/json",
            // 3. Enviar o token no cabeçalho de autorização
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            throw new Error("Sua sessão expirou. Faça o login novamente.")
          }
          throw new Error("Falha ao buscar os dados das lojas.")
        }

        const data = await response.json()
        setLojas(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLojas()
  }, []) // O array vazio [] garante que isso rode apenas uma vez (ao montar o componente)

  // Componente de Skeleton para a tabela
  const TableSkeleton = () => (
    <div className="space-y-3 mt-4">
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-full" />
    </div>
  )

  // Componente de Mensagem de Erro
  const ErrorMessage = ({ message }) => (
    <div className="flex flex-col items-center justify-center gap-4 py-12 text-center text-destructive">
      <AlertCircle className="h-16 w-16" />
      <h3 className="text-xl font-semibold">Ocorreu um Erro</h3>
      <p className="text-muted-foreground">{message}</p>
      <Button variant="outline" onClick={() => window.location.reload()}>
        Tentar Novamente
      </Button>
    </div>
  )

  // Componente de "Nenhum Resultado"
  const NoResults = () => (
     <TableRow>
        <TableCell colSpan={4} className="h-24 text-center">
          Nenhuma loja cadastrada.
        </TableCell>
      </TableRow>
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gestão de Lojas</h1>
          <p className="text-muted-foreground">
            Cadastre e gerencie as filiais e matriz da sua empresa.
          </p>
        </div>
        <Button>Adicionar Loja</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lojas Cadastradas</CardTitle>
          <CardDescription>
            Lista de todas as lojas registradas no sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton />
          ) : error ? (
            <ErrorMessage message={error} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>CNPJ</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lojas.length > 0 ? (
                  lojas.map((loja) => (
                    <TableRow key={loja.loja_id}>
                      {/* Corrigido para usar os nomes das colunas do banco de dados:
                        - loja.id -> loja.loja_id
                        - loja.isMatriz -> loja.is_matriz
                        - loja.status -> loja.is_ativo
                      */}
                      <TableCell className="font-medium">{loja.nome}</TableCell>
                      <TableCell>{loja.cnpj}</TableCell>
                      <TableCell>
                        {loja.is_matriz ? (
                          <Badge variant="outline">Matriz</Badge>
                        ) : (
                          <Badge variant="secondary">Filial</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={loja.is_ativo ? "default" : "destructive"}
                        >
                          {loja.is_ativo ? "Ativa" : "Inativa"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <NoResults />
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
