
"use client"

import { useMemo, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableCell, TableBody } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Download, Plus } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

// --- Mock inicial ---
const pagamentosMock = [
  { id: "#P001", cliente: "Maria Silva", status: "Pago", valor: 250, data: "2025-11-15" },
  { id: "#P002", cliente: "João Santos", status: "Pendente", valor: 120, data: "2025-11-16" },
  { id: "#P003", cliente: "Ana Costa", status: "Pago", valor: 340, data: "2025-11-16" },
  { id: "#P004", cliente: "Carlos Lima", status: "Atrasado", valor: 500, data: "2025-11-14" },
]

export default function PagamentosPage() {
  const [pagamentos, setPagamentos] = useState(pagamentosMock)
  const [busca, setBusca] = useState("")
  const [showNovoPagamento, setShowNovoPagamento] = useState(false)
  const [novoPagamento, setNovoPagamento] = useState({ cliente: "", valor: "", status: "Pendente" })
  const [selected, setSelected] = useState(null)

  // Filtrar pagamentos pela busca
  const pagamentosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    if (!termo) return pagamentos
    return pagamentos.filter(p =>
      p.id.toLowerCase().includes(termo) ||
      p.cliente.toLowerCase().includes(termo) ||
      p.status.toLowerCase().includes(termo)
    )
  }, [busca, pagamentos])

  // Resumo financeiro
  const resumo = useMemo(() => {
    const total = pagamentosFiltrados.reduce((acc, p) => acc + p.valor, 0)
    const pagos = pagamentosFiltrados.filter(p => p.status === "Pago").length
    const pendentes = pagamentosFiltrados.filter(p => p.status === "Pendente").length
    const atrasados = pagamentosFiltrados.filter(p => p.status === "Atrasado").length
    return { total, pagos, pendentes, atrasados }
  }, [pagamentosFiltrados])

  // Exportar CSV
  const exportCSV = () => {
    const header = ["ID", "Cliente", "Status", "Valor", "Data"]
    const rows = pagamentosFiltrados.map(p => [p.id, p.cliente, p.status, p.valor, p.data])
    const csvContent = [header, ...rows].map(e => e.join(";")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", "relatorio_pagamentos.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Criar novo pagamento
  const criarPagamento = () => {
    if (!novoPagamento.cliente.trim() || !novoPagamento.valor) return
    const novo = {
      id: "#P" + String(pagamentos.length + 1).padStart(3, "0"),
      cliente: novoPagamento.cliente.trim(),
      status: novoPagamento.status,
      valor: parseFloat(novoPagamento.valor),
      data: new Date().toISOString().split("T")[0],
    }
    setPagamentos(prev => [...prev, novo])
    setNovoPagamento({ cliente: "", valor: "", status: "Pendente" })
    setShowNovoPagamento(false)
  }

  // Marcar pagamento como Pago
  const marcarComoPago = (id) => {
    setPagamentos(prev => prev.map(p => p.id === id ? { ...p, status: "Pago" } : p))
  }

  // Marcar pagamento como Atrasado
  const marcarComoAtrasado = (id) => {
    setPagamentos(prev => prev.map(p => p.id === id ? { ...p, status: "Atrasado" } : p))
  }

  const statusBadge = (status) => {
    if (status === "Pago") return <Badge className="bg-green-600 hover:bg-green-700">Pago</Badge>
    if (status === "Pendente") return <Badge className="bg-yellow-500 hover:bg-yellow-600">Pendente</Badge>
    return <Badge className="bg-red-600 hover:bg-red-700">Atrasado</Badge>
  }

  return (
    <div className="grid flex-1 gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader><CardTitle>Total nos registros</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">
            R$ {resumo.total.toLocaleString("pt-BR")}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Pagos</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold text-green-600">{resumo.pagos}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Pendentes + Atrasados</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold text-red-600">
            {resumo.pendentes + resumo.atrasados}
          </CardContent>
        </Card>
      </div>

      {/* Lista de pagamentos */}
      <Card>
        <CardHeader>
          <CardTitle>Pagamentos</CardTitle>
          <CardDescription>Histórico de pagamentos da loja.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between mb-4">
            <Input
              placeholder="Buscar por ID, cliente ou status..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="max-w-xs"
            />
            <div className="flex gap-2">
              <Button variant="outline" onClick={exportCSV}>
                <Download className="w-4 h-4" /> Exportar CSV
              </Button>
              <Button onClick={() => setShowNovoPagamento(true)}>
                <Plus className="w-4 h-4" /> Novo Pagamento
              </Button>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagamentosFiltrados.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.id}</TableCell>
                  <TableCell>{p.cliente}</TableCell>
                  <TableCell>{statusBadge(p.status)}</TableCell>
                  <TableCell className="text-right">
                    {p.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </TableCell>
                  <TableCell>{p.data}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button size="sm" variant="outline" onClick={() => setSelected(p)}>Detalhes</Button>
                    {p.status !== "Pago" && (
                      <Button size="sm" onClick={() => marcarComoPago(p.id)}>Marcar como pago</Button>
                    )}
                    {p.status === "Pendente" && (
                      <Button size="sm" variant="destructive" onClick={() => marcarComoAtrasado(p.id)}>Marcar atrasado</Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {pagamentosFiltrados.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    Nenhum pagamento encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal Detalhes */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detalhes do pagamento {selected?.id}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-3">
              <p><strong>Cliente:</strong> {selected.cliente}</p>
              <p><strong>Status:</strong> {selected.status}</p>
              <p><strong>Valor:</strong> {selected.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
              <p><strong>Data:</strong> {selected.data}</p>
              <Separator />
              <div className="flex justify-end gap-2">
                {selected.status !== "Pago" && (
                  <Button onClick={() => { marcarComoPago(selected.id); setSelected({ ...selected, status: "Pago" }) }}>
                    Marcar como pago
                  </Button>
                )}
                <Button variant="outline" onClick={() => setSelected(null)}>Fechar</Button>
              </div>
            </div>
          )}
          <DialogFooter />
        </DialogContent>
      </Dialog>

      {/* Modal Novo Pagamento */}
      <Dialog open={showNovoPagamento} onOpenChange={setShowNovoPagamento}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Pagamento</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Cliente"
              value={novoPagamento.cliente}
              onChange={(e) => setNovoPagamento({ ...novoPagamento, cliente: e.target.value })}
            />
            <Input
              type="number"
              placeholder="Valor (R$)"
              value={novoPagamento.valor}
              onChange={(e) => setNovoPagamento({ ...novoPagamento, valor: e.target.value })}
            />
            <select
              className="border rounded px-2 py-2 w-full"
              value={novoPagamento.status}
              onChange={(e) => setNovoPagamento({ ...novoPagamento, status: e.target.value })}
            >
              <option value="Pendente">Pendente</option>
              <option value="Pago">Pago</option>
              <option value="Atrasado">Atrasado</option>
            </select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNovoPagamento(false)}>Cancelar</Button>
            <Button onClick={criarPagamento}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
