"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableCell, TableBody } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Loader2, Send, AlertTriangle, Clock, Truck, Check, X, MapPin, Package, RefreshCw } from "lucide-react"
import { toast } from "sonner"

// Serviços e Contexto
import { useAuth } from "@/contexts/AuthContext"
import * as produtoService from "@/services/produtoService"
import * as estoqueService from "@/services/estoqueService"
import * as solicitacaoService from "@/services/solicitacaoService"

// --- Componente Visual da Timeline ---
const TimelineStatus = ({ status }) => {
  const steps = [
    { id: 'Pendente', label: 'Solicitado', icon: Clock },
    { id: 'Em Trânsito', label: 'Em Trânsito', icon: Truck },
    { id: 'Concluída', label: 'Entregue', icon: MapPin },
  ];

  const currentIndex = steps.findIndex(s => s.id === status);
  if(status === 'Rejeitada') return <Badge variant="destructive">Pedido Recusado</Badge>;

  return (
    <div className="flex items-center gap-2">
      {steps.map((step, index) => {
        const isActive = index <= currentIndex || (status === 'Concluída');
        return (
          <div key={step.id} className={`flex items-center ${isActive ? 'text-primary' : 'text-muted-foreground/30'}`}>
            <step.icon className="w-4 h-4 mr-1" />
            {index < steps.length - 1 && <div className={`h-0.5 w-4 mx-1 ${isActive ? 'bg-primary' : 'bg-muted'}`} />}
          </div>
        )
      })}
    </div>
  )
}

export default function RequerimentoPage() {
  const { token, user } = useAuth()
  
  const [loading, setLoading] = useState(true)
  const [produtosBaixos, setProdutosBaixos] = useState([])
  const [historico, setHistorico] = useState([])
  
  // Controle de Seleção e Modal
  const [selecionados, setSelecionados] = useState([]) // Array de IDs
  const [quantidadesPedido, setQuantidadesPedido] = useState({}) // Objeto { id_produto: qtd }
  const [showModal, setShowModal] = useState(false)
  const [observacao, setObservacao] = useState("")
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (token) {
      carregarEstoqueCritico()
      carregarHistorico()
    }
  }, [token])

  // 1. Carrega produtos que precisam de reposição
  const carregarEstoqueCritico = async () => {
    setLoading(true)
    try {
      const [resProdutos, resEstoque] = await Promise.all([
        produtoService.readAll(token),
        estoqueService.getEstoqueCompleto(token).catch(() => [])
      ])

      const listaProdutos = Array.isArray(resProdutos) ? resProdutos : (resProdutos.data || [])
      const listaEstoque = Array.isArray(resEstoque) ? resEstoque : []
      const lojaId = user?.loja_id || 1

      const dados = listaProdutos.map(p => {
        const pId = p.id || p.produto_id || p._id
        const est = listaEstoque.find(e => e.produto_id === pId && e.loja_id === lojaId)
        const qtdAtual = est ? Number(est.quantidade) : 0
        const minimo = 10 // Regra de negócio (pode vir do banco depois)

        return {
          id: pId,
          codigo: p.sku || "S/N",
          nome: p.nome,
          fornecedor: p.nome_fornecedor || "Padrão",
          quantidade: qtdAtual,
          minimo: minimo,
          sugerido: Math.max(0, minimo - qtdAtual + 5) // Sugere repor até passar um pouco do mínimo
        }
      }).filter(p => p.quantidade < p.minimo)

      setProdutosBaixos(dados)
      
      // Inicializa quantidades sugeridas
      const inits = {}
      dados.forEach(d => inits[d.id] = d.sugerido)
      setQuantidadesPedido(prev => ({...inits, ...prev}))

    } catch (error) {
      console.error(error)
      toast.error("Erro ao verificar estoque.")
    } finally {
      setLoading(false)
    }
  }

  // 2. Carrega histórico de pedidos (Real do Backend)
  const carregarHistorico = async () => {
    try {
      const dados = await solicitacaoService.getSolicitacoes(token);
      setHistorico(dados);
    } catch (error) {
      console.error("Erro ao carregar histórico", error);
    }
  }

  // --- Manipuladores ---
  const toggleSelecao = (id) => {
    setSelecionados(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const handleQtdChange = (id, val) => {
    setQuantidadesPedido(prev => ({...prev, [id]: Number(val)}))
  }

  const handleCheckIn = async (id) => {
    try {
        await solicitacaoService.receberSolicitacao(id, token);
        toast.success("Recebimento confirmado! Estoque atualizado.");
        carregarHistorico();
        carregarEstoqueCritico(); // Atualiza a lista de críticos pois o estoque subiu
    } catch (error) {
        toast.error("Erro ao confirmar recebimento.");
    }
  }

  // --- Envio Real para o Backend ---
  const enviarPedido = async () => {
    if (selecionados.length === 0) return
    setSending(true)

    try {
      const itensPayload = produtosBaixos
        .filter(p => selecionados.includes(p.id))
        .map(p => ({
            produto_id: p.id,
            quantidade: quantidadesPedido[p.id] || 1
        }));

      const payload = {
        loja_id: user?.loja_id || 2, // Se não tiver loja no user, assume filial 2 para teste
        observacao: observacao,
        itens: itensPayload
      }

      await solicitacaoService.createSolicitacao(payload, token);
      
      toast.success("Requerimento enviado com sucesso!");
      setSelecionados([]);
      setObservacao("");
      setShowModal(false);
      
      // Atualiza as listas
      carregarHistorico();
      // Opcional: remover da lista de críticos visualmente ou recarregar
      carregarEstoqueCritico();

    } catch (error) {
      console.error(error);
      toast.error("Erro ao enviar pedido.");
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Central de Reposição</h1>
          <p className="text-muted-foreground">Gerencie o abastecimento da sua loja.</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" onClick={() => {carregarEstoqueCritico(); carregarHistorico();}}>
                <RefreshCw className="w-4 h-4 mr-2" /> Atualizar
            </Button>
            <Button onClick={() => setShowModal(true)} disabled={selecionados.length === 0}>
                <Send className="w-4 h-4 mr-2" /> Solicitar ({selecionados.length})
            </Button>
        </div>
      </div>

      <Tabs defaultValue="critico" className="w-full">
        <TabsList>
          <TabsTrigger value="critico">Estoque Crítico <Badge variant="secondary" className="ml-2">{produtosBaixos.length}</Badge></TabsTrigger>
          <TabsTrigger value="historico">Meus Pedidos <Badge variant="secondary" className="ml-2">{historico.length}</Badge></TabsTrigger>
        </TabsList>

        {/* ABA 1: Criar Pedido */}
        <TabsContent value="critico" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Itens Sugeridos para Reposição</CardTitle><CardDescription>Baseado no estoque mínimo configurado (10 un).</CardDescription></CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead className="w-[50px] text-center">Sel.</TableHead>
                        <TableHead>Produto</TableHead>
                        <TableHead>Fornecedor</TableHead>
                        <TableHead className="text-right">Estoque Atual</TableHead>
                        <TableHead className="text-right">Qtd. Solicitada</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {loading ? (
                        <TableRow><TableCell colSpan={6} className="h-32 text-center"><Loader2 className="animate-spin mx-auto w-8 h-8 text-primary"/></TableCell></TableRow>
                    ) : produtosBaixos.length === 0 ? (
                        <TableRow><TableCell colSpan={6} className="h-32 text-center text-muted-foreground flex flex-col items-center justify-center"><Check className="w-10 h-10 mb-2 text-green-500"/>Estoque saudável.</TableCell></TableRow>
                    ) : (
                        produtosBaixos.map(p => (
                        <TableRow key={p.id} className={selecionados.includes(p.id) ? "bg-muted/50" : ""}>
                            <TableCell className="text-center">
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
                            <TableCell className="text-right w-[120px]">
                                <Input 
                                    type="number" 
                                    className="h-8 w-20 ml-auto" 
                                    value={quantidadesPedido[p.id]} 
                                    onChange={(e) => handleCheckIn(p.id, e.target.value) /* Bug fix: só atualiza state local */}
                                    onInput={(e) => handleQtdChange(p.id, e.target.value)}
                                    disabled={!selecionados.includes(p.id)}
                                />
                            </TableCell>
                            <TableCell className="text-center">
                                <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-200">Crítico</Badge>
                            </TableCell>
                        </TableRow>
                        ))
                    )}
                    </TableBody>
                </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA 2: Histórico / Rastreamento */}
        <TabsContent value="historico" className="mt-4">
            <Card>
                <CardHeader>
                    <CardTitle>Histórico e Rastreamento</CardTitle>
                    <CardDescription>Acompanhe o status logístico das suas solicitações.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Data</TableHead>
                                <TableHead>Status Logístico</TableHead>
                                <TableHead>Itens</TableHead>
                                <TableHead className="text-right">Ação</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {historico.map((req) => (
                                <TableRow key={req.solicitacao_id}>
                                    <TableCell className="font-mono">#{req.solicitacao_id}</TableCell>
                                    <TableCell>{new Date(req.data_solicitacao).toLocaleString('pt-BR')}</TableCell>
                                    <TableCell>
                                        <TimelineStatus status={req.status} />
                                        <span className="text-xs text-muted-foreground ml-2">({req.status})</span>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{req.qtd_itens || (req.itens?.length) || 0} itens</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {req.status === 'Em Trânsito' && (
                                            <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleCheckIn(req.solicitacao_id)}>
                                                <Package className="w-4 h-4 mr-2" /> Receber
                                            </Button>
                                        )}
                                        {req.status === 'Concluída' && (
                                            <span className="text-green-600 font-medium text-xs flex items-center justify-end">
                                                <Check className="w-3 h-3 mr-1" /> Finalizado
                                            </span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {historico.length === 0 && (
                                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Nenhum pedido realizado.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de Confirmação de Envio */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Confirmar Pedido à Matriz</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
             <div className="bg-blue-50 p-3 rounded border border-blue-200 flex gap-3 items-start">
                <Truck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                    <p className="font-semibold">Processo de Transferência</p>
                    <p>Ao confirmar, a matriz receberá o pedido. O estoque só será atualizado na sua loja quando você confirmar o recebimento.</p>
                </div>
             </div>
             
             <div className="space-y-2">
                <Label>Resumo do Pedido</Label>
                <div className="max-h-[200px] overflow-y-auto border rounded p-2 text-sm bg-muted/20">
                    <ul className="space-y-1">
                        {produtosBaixos.filter(p => selecionados.includes(p.id)).map(p => (
                            <li key={p.id} className="flex justify-between text-xs border-b border-dashed pb-1 last:border-0">
                                <span>{p.nome}</span>
                                <span className="font-bold">x{quantidadesPedido[p.id]}</span>
                            </li>
                        ))}
                    </ul>
                </div>
             </div>

             <div className="space-y-2">
                <Label htmlFor="obs">Observações</Label>
                <Textarea 
                  id="obs"
                  placeholder="Ex: Cliente aguardando..." 
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                />
             </div>
          </div>
          <DialogFooter>
             <Button variant="ghost" onClick={() => setShowModal(false)}>Cancelar</Button>
             <Button onClick={enviarPedido} disabled={sending} className="bg-blue-600 hover:bg-blue-700">
                {sending ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : <Send className="w-4 h-4 mr-2" />} 
                Enviar Solicitação
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}