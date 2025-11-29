// frontend-qgb/src/app/(dashboard)/produtos/estoque/page.jsx
"use client"

import { useEffect, useState, useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableCell, TableBody } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, Pencil, Search, Loader2, PackagePlus, AlertCircle, Truck, ClipboardCheck, History } from "lucide-react"
import { toast } from "sonner"

// Hooks e Serviços
import { useAuth } from "@/contexts/AuthContext"
import { getEstoqueCompleto, darEntradaEstoque, ajustarEstoque } from "@/services/estoqueService"
import { readAll as getProdutos } from "@/services/produtoService"
import { readAll as getLojas } from "@/services/lojaService"

export default function EstoqueUnificadoPage() {
  const { token } = useAuth()
  const [estoque, setEstoque] = useState([])
  const [loading, setLoading] = useState(true)

  // Estados Tab 1 (Gestão)
  const [busca, setBusca] = useState("")
  const [modalEntradaOpen, setModalEntradaOpen] = useState(false)
  const [modalAjusteOpen, setModalAjusteOpen] = useState(false)
  const [itemSelecionado, setItemSelecionado] = useState(null)
  const [quantidadeInput, setQuantidadeInput] = useState("")
  const [produtosList, setProdutosList] = useState([])
  const [lojasList, setLojasList] = useState([])
  const [novoItem, setNovoItem] = useState({ produto_id: "", loja_id: "", quantidade: "" })

  // Estados Tab 2 (Requerimentos)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [modalReqOpen, setModalReqOpen] = useState(false)
  const [observacaoReq, setObservacaoReq] = useState("")
  const [historicoReq, setHistoricoReq] = useState([])

  // --- CARREGAMENTO DE DADOS (Compartilhado) ---
  const fetchDados = async () => {
    if (!token) return
    setLoading(true)
    try {
      const dados = await getEstoqueCompleto(token)
      setEstoque(Array.isArray(dados) ? dados : (dados?.data || []))
    } catch (error) {
      console.error("Erro ao buscar estoque", error)
      toast.error("Erro ao atualizar dados do estoque.")
    } finally {
      setLoading(false)
    }
  }

  const fetchAuxiliares = async () => {
    if (!token || produtosList.length > 0) return
    try {
      const [p, l] = await Promise.all([getProdutos(token), getLojas(token)])
      setProdutosList(p || [])
      setLojasList(l || [])
    } catch (error) {
      toast.error("Erro ao carregar listas auxiliares.")
    }
  }

  useEffect(() => {
    fetchDados()
  }, [token])

  // --- LÓGICA TAB 1: FILTROS E AÇÕES ---
  const estoqueFiltrado = useMemo(() => {
    const termo = busca.toLowerCase()
    return estoque.filter(item => 
      (item.produto_nome || "").toLowerCase().includes(termo) ||
      (item.sku || "").toLowerCase().includes(termo) ||
      (item.loja_nome || "").toLowerCase().includes(termo)
    )
  }, [estoque, busca])

  const handleDarEntrada = async () => {
    try {
      let payload = {}
      if (itemSelecionado) {
        if (!quantidadeInput || Number(quantidadeInput) <= 0) return toast.warning("Qtd inválida.")
        payload = { produto_id: itemSelecionado.produto_id, loja_id: itemSelecionado.loja_id, quantidade: Number(quantidadeInput) }
      } else {
        if (!novoItem.produto_id || !novoItem.loja_id || !novoItem.quantidade) return toast.warning("Preencha tudo.")
        payload = { ...novoItem, quantidade: Number(novoItem.quantidade) }
      }
      await darEntradaEstoque(payload, token)
      toast.success("Entrada realizada!")
      setModalEntradaOpen(false)
      setItemSelecionado(null)
      setNovoItem({ produto_id: "", loja_id: "", quantidade: "" })
      setQuantidadeInput("")
      fetchDados()
    } catch (error) {
      toast.error("Erro ao dar entrada.")
    }
  }

  const handleAjustar = async () => {
    if (!itemSelecionado || quantidadeInput === "") return
    try {
      await ajustarEstoque(itemSelecionado.estoque_id, { quantidade: Number(quantidadeInput) }, token)
      toast.success("Ajuste realizado!")
      setModalAjusteOpen(false)
      setItemSelecionado(null)
      fetchDados()
    } catch (error) {
      toast.error("Erro ao ajustar.")
    }
  }

  // --- LÓGICA TAB 2: REQUERIMENTOS ---
  const itensCriticos = useMemo(() => {
    return estoque.filter(p => Number(p.quantidade) <= 1)
  }, [estoque])

  const toggleSelection = (id) => {
    const newSet = new Set(selectedIds)
    if (newSet.has(id)) newSet.delete(id)
    else newSet.add(id)
    setSelectedIds(newSet)
  }

  const toggleAll = () => {
    if (selectedIds.size === itensCriticos.length) setSelectedIds(new Set())
    else setSelectedIds(new Set(itensCriticos.map(i => i.estoque_id)))
  }

  const handleEnviarRequisicao = () => {
    const novoPedido = {
      id: Date.now(),
      data: new Date().toLocaleString(),
      qtdItens: selectedIds.size,
      status: "Pendente",
      obs: observacaoReq || "Sem observações"
    }
    setHistoricoReq([novoPedido, ...historicoReq])
    toast.success("Requisição gerada!")
    setSelectedIds(new Set())
    setModalReqOpen(false)
    setObservacaoReq("")
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Controle de Estoque</h1>
          <p className="text-muted-foreground">Gerencie saldos, entradas e solicitações de compra.</p>
        </div>
        <div className="flex gap-2">
           {/* Botão Global de Novo Item */}
           <Button onClick={() => { fetchAuxiliares(); setItemSelecionado(null); setModalEntradaOpen(true) }}>
            <PackagePlus className="mr-2 h-4 w-4" /> Novo Item
          </Button>
        </div>
      </div>

      <Tabs defaultValue="saldo" className="space-y-4">
        <TabsList>
          <TabsTrigger value="saldo">Saldo e Movimentação</TabsTrigger>
          <TabsTrigger value="requerimentos" className="relative">
            Requerimentos
            {itensCriticos.length > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]">
                {itensCriticos.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* --- CONTEÚDO TAB 1: SALDO --- */}
        <TabsContent value="saldo" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Visão Geral</CardTitle>
              <div className="relative mt-2">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Filtrar por produto, código ou loja..." 
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-8 max-w-md" 
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead>Loja</TableHead>
                    <TableHead className="text-right">Qtd</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={6} className="h-24 text-center"><Loader2 className="animate-spin mx-auto" /></TableCell></TableRow>
                  ) : estoqueFiltrado.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Nenhum item encontrado.</TableCell></TableRow>
                  ) : (
                    estoqueFiltrado.map((item) => (
                      <TableRow key={item.estoque_id}>
                        <TableCell className="font-mono text-xs">{item.sku || "-"}</TableCell>
                        <TableCell className="font-medium">{item.produto_nome}</TableCell>
                        <TableCell>{item.loja_nome}</TableCell>
                        <TableCell className="text-right font-bold">{item.quantidade}</TableCell>
                        <TableCell className="text-center">
                          {Number(item.quantidade) <= 0 ? <Badge variant="destructive">Esgotado</Badge> : 
                           Number(item.quantidade) < 5 ? <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Baixo</Badge> : 
                           <Badge variant="outline" className="text-green-600 border-green-200">OK</Badge>}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button size="icon" variant="ghost" title="Adicionar" onClick={() => { setItemSelecionado(item); setQuantidadeInput(""); setModalEntradaOpen(true) }}>
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" title="Ajustar" onClick={() => { setItemSelecionado(item); setQuantidadeInput(item.quantidade); setModalAjusteOpen(true) }}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- CONTEÚDO TAB 2: REQUERIMENTOS --- */}
        <TabsContent value="requerimentos" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-l-4 border-l-red-500 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Itens Críticos</CardTitle>
                <AlertCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{itensCriticos.length}</div>
                <p className="text-xs text-muted-foreground">Estoque zerado ou &le; 1</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Requisições Hoje</CardTitle>
                <Truck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{historicoReq.length}</div>
                <p className="text-xs text-muted-foreground">Pedidos gerados</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Gerar Pedido de Reposição</CardTitle>
                <CardDescription>Selecione os itens abaixo para criar uma lista de compras ou transferência.</CardDescription>
              </div>
              <Button disabled={selectedIds.size === 0} onClick={() => setModalReqOpen(true)}>
                <ClipboardCheck className="mr-2 h-4 w-4" /> Processar ({selectedIds.size})
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]"><Checkbox checked={itensCriticos.length > 0 && selectedIds.size === itensCriticos.length} onCheckedChange={toggleAll} /></TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead>Loja</TableHead>
                    <TableHead className="text-right">Atual</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {itensCriticos.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-6 text-muted-foreground">Tudo certo! Nenhum item crítico.</TableCell></TableRow>
                  ) : (
                    itensCriticos.map(item => (
                      <TableRow key={item.estoque_id}>
                        <TableCell><Checkbox checked={selectedIds.has(item.estoque_id)} onCheckedChange={() => toggleSelection(item.estoque_id)} /></TableCell>
                        <TableCell><div className="font-medium">{item.produto_nome}</div><div className="text-xs text-muted-foreground">{item.sku}</div></TableCell>
                        <TableCell>{item.loja_nome}</TableCell>
                        <TableCell className="text-right font-bold text-red-600">{item.quantidade}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Histórico Simples */}
          {historicoReq.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-sm font-medium flex items-center gap-2"><History className="h-4 w-4"/> Histórico Recente</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {historicoReq.map(h => (
                    <li key={h.id} className="text-sm border-b pb-2 last:border-0 flex justify-between">
                      <span>{h.data} - <strong>{h.qtdItens} itens</strong> ({h.obs})</span>
                      <Badge variant="secondary">{h.status}</Badge>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* --- MODAIS --- */}
      
      {/* Modal Entrada */}
      <Dialog open={modalEntradaOpen} onOpenChange={setModalEntradaOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Dar Entrada</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            {!itemSelecionado && (
              <div className="grid gap-4">
                <Select onValueChange={(v) => setNovoItem({...novoItem, produto_id: v})}>
                  <SelectTrigger><SelectValue placeholder="Selecione o Produto" /></SelectTrigger>
                  <SelectContent>{produtosList.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.nome}</SelectItem>)}</SelectContent>
                </Select>
                <Select onValueChange={(v) => setNovoItem({...novoItem, loja_id: v})}>
                  <SelectTrigger><SelectValue placeholder="Selecione a Loja" /></SelectTrigger>
                  <SelectContent>{lojasList.map(l => <SelectItem key={l.id} value={String(l.id)}>{l.nome}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            )}
            {itemSelecionado && <p className="text-sm text-muted-foreground">Adicionando para: <strong>{itemSelecionado.produto_nome}</strong></p>}
            <Input type="number" placeholder="Quantidade" value={itemSelecionado ? quantidadeInput : novoItem.quantidade} onChange={(e) => itemSelecionado ? setQuantidadeInput(e.target.value) : setNovoItem({...novoItem, quantidade: e.target.value})} />
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setModalEntradaOpen(false)}>Cancelar</Button><Button onClick={handleDarEntrada}>Salvar</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Ajuste */}
      <Dialog open={modalAjusteOpen} onOpenChange={setModalAjusteOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Ajuste Manual (Balanço)</DialogTitle></DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-sm text-red-500">Isso alterará o estoque total para o valor digitado.</p>
            <Input type="number" placeholder="Nova Quantidade Total" value={quantidadeInput} onChange={(e) => setQuantidadeInput(e.target.value)} />
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setModalAjusteOpen(false)}>Cancelar</Button><Button variant="destructive" onClick={handleAjustar}>Confirmar</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Requisição */}
      <Dialog open={modalReqOpen} onOpenChange={setModalReqOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Confirmar Requisição</DialogTitle></DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-sm">Gerando pedido para <strong>{selectedIds.size} itens</strong>.</p>
            <Textarea placeholder="Observações (ex: Urgente, para Loja Centro)" value={observacaoReq} onChange={(e) => setObservacaoReq(e.target.value)} />
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setModalReqOpen(false)}>Cancelar</Button><Button onClick={handleEnviarRequisicao}>Gerar Pedido</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}