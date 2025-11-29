// frontend-qgb/src/app/(dashboard)/produtos/requerimento/page.jsx
"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableCell, TableBody } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AlertCircle, Truck, ClipboardCheck, History } from "lucide-react"
import { toast } from "sonner"

import { getEstoqueCompleto } from "@/services/estoqueService"

export default function RequerimentoPage() {
  const [estoque, setEstoque] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Itens selecionados para pedir (Set de IDs)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [modalOpen, setModalOpen] = useState(false)
  const [observacao, setObservacao] = useState("")
  
  // Histórico local (mockado pois não há backend para isso ainda)
  const [historico, setHistorico] = useState([
    { id: 1, data: "2024-11-28 10:00", qtdItens: 3, status: "Enviado", obs: "Urgente filial 1" }
  ])

  useEffect(() => {
    async function load() {
      try {
        const dados = await getEstoqueCompleto()
        setEstoque(dados || [])
      } catch (e) {
        toast.error("Erro ao carregar dados.")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Identifica itens críticos (Qtd <= 1 neste exemplo, ou 0)
  const itensCriticos = useMemo(() => {
    return estoque.filter(p => Number(p.quantidade) <= 1)
  }, [estoque])

  const itensSelecionadosObj = useMemo(() => {
    return itensCriticos.filter(p => selectedIds.has(p.estoque_id))
  }, [itensCriticos, selectedIds])

  const toggleSelection = (id) => {
    const newSet = new Set(selectedIds)
    if (newSet.has(id)) newSet.delete(id)
    else newSet.add(id)
    setSelectedIds(newSet)
  }

  const toggleAll = () => {
    if (selectedIds.size === itensCriticos.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(itensCriticos.map(i => i.estoque_id)))
    }
  }

  const handleEnviarRequisicao = () => {
    // Simula envio ao backend
    const novoPedido = {
      id: Date.now(),
      data: new Date().toLocaleString(),
      qtdItens: selectedIds.size,
      status: "Pendente",
      obs: observacao || "Sem observações"
    }
    
    setHistorico([novoPedido, ...historico])
    toast.success("Requisição de suprimento gerada com sucesso!")
    setSelectedIds(new Set())
    setModalOpen(false)
    setObservacao("")
  }

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Truck className="h-6 w-6" /> Controle de Requerimentos e Envios
      </h1>

      {/* Painel de Alerta */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-l-4 border-l-red-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" /> Ruptura de Estoque
            </CardTitle>
            <CardDescription>Itens com estoque zerado ou crítico (≤ 1)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{itensCriticos.length}</div>
            <p className="text-sm text-muted-foreground">Produtos precisam de reposição</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" /> Envios Recentes
            </CardTitle>
            <CardDescription>Últimas requisições processadas</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[80px]">
              <ul className="space-y-2 text-sm">
                {historico.map(h => (
                  <li key={h.id} className="flex justify-between border-b pb-1">
                    <span>{h.data}</span>
                    <Badge variant="secondary">{h.status}</Badge>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Seleção */}
      <Card>
        <CardHeader>
          <CardTitle>Gerar Requisição de Compra / Transferência</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {selectedIds.size} itens selecionados
            </div>
            <Button 
              disabled={selectedIds.size === 0} 
              onClick={() => setModalOpen(true)}
            >
              <ClipboardCheck className="mr-2 h-4 w-4" /> Processar Selecionados
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox 
                    checked={itensCriticos.length > 0 && selectedIds.size === itensCriticos.length}
                    onCheckedChange={toggleAll}
                  />
                </TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Loja</TableHead>
                <TableHead className="text-right">Estoque Atual</TableHead>
                <TableHead>Situação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {itensCriticos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                    Estoque saudável! Nenhum item crítico no momento.
                  </TableCell>
                </TableRow>
              ) : (
                itensCriticos.map(item => (
                  <TableRow key={item.estoque_id}>
                    <TableCell>
                      <Checkbox 
                        checked={selectedIds.has(item.estoque_id)}
                        onCheckedChange={() => toggleSelection(item.estoque_id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{item.produto_nome}</div>
                      <div className="text-xs text-muted-foreground">SKU: {item.sku}</div>
                    </TableCell>
                    <TableCell>{item.loja_nome}</TableCell>
                    <TableCell className="text-right font-bold text-red-600">
                      {item.quantidade}
                    </TableCell>
                    <TableCell>
                      {item.quantidade == 0 ? <Badge variant="destructive">Zerado</Badge> : <Badge variant="outline">Baixo</Badge>}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal Confirmar Envio */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Confirmar Requisição</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm">Você está gerando uma solicitação para <strong>{selectedIds.size} itens</strong>.</p>
            
            <ScrollArea className="h-[150px] border rounded p-2 bg-muted/50">
              <ul className="text-sm space-y-1">
                {itensSelecionadosObj.map(i => (
                  <li key={i.estoque_id} className="flex justify-between">
                    <span>{i.produto_nome}</span>
                    <span className="text-muted-foreground">{i.loja_nome} (Qtd: {i.quantidade})</span>
                  </li>
                ))}
              </ul>
            </ScrollArea>

            <div className="space-y-2">
              <label className="text-sm font-medium">Observações / Destino</label>
              <Textarea 
                placeholder="Ex: Enviar urgência para Loja Centro via transportadora X..."
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleEnviarRequisicao}>Gerar Pedido</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}