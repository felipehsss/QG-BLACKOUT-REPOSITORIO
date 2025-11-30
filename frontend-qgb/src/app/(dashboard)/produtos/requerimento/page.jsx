"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableCell, TableBody } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2, Send, AlertTriangle } from "lucide-react"
import { toast } from "sonner"

// Serviços e Contexto
import { useAuth } from "@/contexts/AuthContext"
import * as produtoService from "@/services/produtoService"
import * as estoqueService from "@/services/estoqueService"

export default function RequerimentoPage() {
  const { token, user } = useAuth()
  
  const [loading, setLoading] = useState(true)
  const [produtosBaixos, setProdutosBaixos] = useState([])
  const [selecionados, setSelecionados] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [observacao, setObservacao] = useState("")
  const [historico, setHistorico] = useState([])

  // --- Carrega e Filtra ---
  useEffect(() => {
    if (token) carregarDados()
  }, [token])

  const carregarDados = async () => {
    setLoading(true)
    try {
      // 1. Carrega produtos e estoque passando o token
      const [resProdutos, resEstoque] = await Promise.all([
        produtoService.readAll(token),
        estoqueService.getEstoqueCompleto(token).catch(() => [])
      ])

      const listaProdutos = Array.isArray(resProdutos) ? resProdutos : (resProdutos.data || [])
      const listaEstoque = Array.isArray(resEstoque) ? resEstoque : []
      
      // Pega a loja do usuário logado (ou 1 como fallback)
      const lojaId = user?.loja_id || 1

      // 2. Processa e mescla os dados
      const dados = listaProdutos.map(p => {
        const pId = p.id || p.produto_id || p._id
        // Encontra o estoque específico deste produto nesta loja
        const est = listaEstoque.find(e => e.produto_id === pId && e.loja_id === lojaId)
        
        return {
          id: pId,
          codigo: p.sku || "S/N",
          nome: p.nome,
          fornecedor: p.nome_fornecedor || "Padrão",
          quantidade: est ? Number(est.quantidade) : 0,
          minimo: 5 // Regra fixa: estoque abaixo de 5 pede reposição
        }
      }).filter(p => p.quantidade < p.minimo) // Filtra apenas os críticos

      setProdutosBaixos(dados)
    } catch (error) {
      console.error(error)
      toast.error("Erro ao carregar dados para requisição.")
    } finally {
      setLoading(false)
    }
  }

  // --- Lógica de Seleção ---
  const toggleSelecao = (id) => {
    setSelecionados(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const selecionarTodos = () => {
    if (selecionados.length === produtosBaixos.length) {
      setSelecionados([])
    } else {
      setSelecionados(produtosBaixos.map(p => p.id))
    }
  }

  const enviarPedido = () => {
    if (selecionados.length === 0) return

    // Simulando envio para API de Compras/Pedidos (Backend ainda não tem essa rota específica)
    const novoPedido = {
      id: Math.floor(Math.random() * 10000),
      data: new Date().toLocaleString("pt-BR"),
      itens: produtosBaixos.filter(p => selecionados.includes(p.id)),
      obs: observacao,
      status: "Pendente"
    }

    setHistorico([novoPedido, ...historico])
    setSelecionados([])
    setObservacao("")
    setShowModal(false)
    toast.success("Requerimento enviado para compras!")
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Requerimento de Compras</h1>
          <p className="text-muted-foreground">Itens abaixo do estoque mínimo ({produtosBaixos.length})</p>
        </div>
        <Button onClick={() => setShowModal(true)} disabled={selecionados.length === 0}>
          <Send className="w-4 h-4 mr-2" /> Gerar Pedido ({selecionados.length})
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Sugestões de Reposição</CardTitle>
            <Button variant="ghost" size="sm" onClick={selecionarTodos} disabled={produtosBaixos.length === 0}>
                {selecionados.length > 0 && selecionados.length === produtosBaixos.length ? "Desmarcar Todos" : "Marcar Todos"}
            </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="border-t">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead className="w-[50px] text-center"></TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead className="text-right">Atual</TableHead>
                    <TableHead className="text-right">Mínimo</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {loading ? (
                    <TableRow><TableCell colSpan={6} className="h-32 text-center"><Loader2 className="animate-spin mx-auto w-8 h-8 text-primary"/></TableCell></TableRow>
                ) : produtosBaixos.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="h-32 text-center text-muted-foreground">Estoque saudável. Nenhum item em falta.</TableCell></TableRow>
                ) : (
                    produtosBaixos.map(p => (
                    <TableRow key={p.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => toggleSelecao(p.id)}>
                        <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                        <input 
                            type="checkbox" 
                            className="h-4 w-4 accent-primary cursor-pointer"
                            checked={selecionados.includes(p.id)} 
                            onChange={() => toggleSelecao(p.id)} 
                        />
                        </TableCell>
                        <TableCell>
                        <span className="font-medium block">{p.nome}</span>
                        <span className="text-xs text-muted-foreground font-mono">{p.codigo}</span>
                        </TableCell>
                        <TableCell className="text-sm">{p.fornecedor}</TableCell>
                        <TableCell className="text-right font-bold text-destructive">{p.quantidade}</TableCell>
                        <TableCell className="text-right text-muted-foreground">{p.minimo}</TableCell>
                        <TableCell className="text-center">
                        {p.quantidade <= 0 ? <Badge variant="destructive">Zerado</Badge> : <Badge variant="secondary" className="bg-orange-100 text-orange-800 hover:bg-orange-200">Baixo</Badge>}
                        </TableCell>
                    </TableRow>
                    ))
                )}
                </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Histórico Local de Pedidos */}
      {historico.length > 0 && (
        <div className="space-y-4 pt-4">
          <Separator />
          <h2 className="text-lg font-semibold">Histórico da Sessão</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {historico.map(pedido => (
              <Card key={pedido.id} className="bg-muted/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex justify-between items-center">
                    <span>Pedido #{pedido.id}</span>
                    <Badge className="bg-blue-600 hover:bg-blue-700">Enviado</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground mb-3">{pedido.data}</p>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Itens:</p>
                    <ul className="list-disc list-inside text-xs text-muted-foreground max-h-20 overflow-y-auto">
                        {pedido.itens.map(i => (
                        <li key={i.id}>{i.nome} ({i.quantidade}/{i.minimo})</li>
                        ))}
                    </ul>
                  </div>
                  {pedido.obs && (
                      <div className="mt-3 p-2 bg-background border rounded text-xs italic text-muted-foreground">
                          "{pedido.obs}"
                      </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Modal Confirmar */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Confirmar Requerimento</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
             <div className="bg-yellow-50 p-3 rounded border border-yellow-200 flex gap-3 items-start">
                <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                    <p className="font-semibold">Atenção</p>
                    <p>Este pedido será encaminhado para o setor de compras da matriz para análise e cotação.</p>
                </div>
             </div>
             
             <div className="space-y-2">
                <Label>Itens Selecionados ({selecionados.length})</Label>
                <div className="max-h-[150px] overflow-y-auto border rounded p-2 text-sm bg-muted/20">
                    <ul className="space-y-1">
                        {produtosBaixos.filter(p => selecionados.includes(p.id)).map(p => (
                            <li key={p.id} className="flex justify-between text-xs">
                                <span>{p.nome}</span>
                                <span className="text-muted-foreground">Atual: {p.quantidade}</span>
                            </li>
                        ))}
                    </ul>
                </div>
             </div>

             <div className="space-y-2">
                <Label htmlFor="obs">Observações</Label>
                <Textarea 
                  id="obs"
                  placeholder="Ex: Urgência para o cliente X, preferência por marca Y..." 
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                  className="resize-none"
                />
             </div>
          </div>
          <DialogFooter>
             <Button variant="ghost" onClick={() => setShowModal(false)}>Cancelar</Button>
             <Button onClick={enviarPedido} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : <Send className="w-4 h-4 mr-2" />} 
                Enviar Pedido
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}