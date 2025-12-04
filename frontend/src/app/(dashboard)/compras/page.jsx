"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableCell, TableBody } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, ShoppingCart, PackageOpen, Truck, Trash2, Loader2, ArrowDownToLine, AlertCircle } from "lucide-react"
import { toast } from "sonner"

// Serviços e Contexto
import { useAuth } from "@/contexts/AuthContext"
import * as produtoService from "@/services/produtoService"
import * as fornecedorService from "@/services/fornecedorService"
import * as compraService from "@/services/compraService"
import * as produtoFornecedorService from "@/services/produtoFornecedorService"
import { getEstoqueCompleto } from "@/services/estoqueService"
import { getSolicitacoes } from "@/services/solicitacaoService"

export default function ComprasPage() {
  const { token, user } = useAuth()
  
  // --- Estados de Dados ---
  const [compras, setCompras] = useState([])
  const [produtos, setProdutos] = useState([])
  const [fornecedores, setFornecedores] = useState([])
  const [estoqueMatriz, setEstoqueMatriz] = useState([])
  const [solicitacoesPendentes, setSolicitacoesPendentes] = useState([])
  
  // --- Estados do Formulário ---
  const [carrinho, setCarrinho] = useState([])
  const [fornecedorSel, setFornecedorSel] = useState("")
  const [produtoSel, setProdutoSel] = useState("")
  const [qtd, setQtd] = useState(1)
  const [custo, setCusto] = useState("") 
  const [obs, setObs] = useState("")
  
  // --- UI ---
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [loadingPreco, setLoadingPreco] = useState(false)
  const [activeTab, setActiveTab] = useState("novo")

  // 1. Carregar Dados
  useEffect(() => {
    if (token) carregarDadosCompletos()
  }, [token])

  // 2. Busca Preço Automático
  useEffect(() => {
    const buscarPreco = async () => {
      if (fornecedorSel && produtoSel) {
        setLoadingPreco(true)
        try {
          const res = await produtoFornecedorService.getPrecoCusto(fornecedorSel, produtoSel, token)
          if (res && res.preco !== undefined) {
            setCusto(res.preco)
            if (Number(res.preco) > 0) {
                toast.success(`Preço de custo: R$ ${Number(res.preco).toFixed(2)}`)
            }
          } else {
            setCusto("") 
          }
        } catch (error) {
          console.error("Erro ao buscar preço", error)
        } finally {
          setLoadingPreco(false)
        }
      }
    }
    buscarPreco()
  }, [fornecedorSel, produtoSel, token])

  const carregarDadosCompletos = async () => {
    setLoadingData(true)
    try {
      const [pRes, fRes, comprasRes, estRes, solRes] = await Promise.all([
        produtoService.readAll(token),
        fornecedorService.readAll(token),
        compraService.getCompras(token),
        getEstoqueCompleto(token),
        getSolicitacoes(token)
      ])
      
      setProdutos(Array.isArray(pRes) ? pRes : [])
      setFornecedores(Array.isArray(fRes) ? fRes : [])
      setCompras(Array.isArray(comprasRes) ? comprasRes : [])
      
      const matrizData = Array.isArray(estRes) 
        ? estRes.filter(e => e.loja_id === 1 || (e.loja_nome && e.loja_nome.toLowerCase().includes('matriz')))
        : []
      setEstoqueMatriz(matrizData)

      const solData = Array.isArray(solRes) 
        ? solRes.filter(s => s.status === 'Pendente')
        : []
      setSolicitacoesPendentes(solData)

    } catch (e) {
      console.error(e)
      toast.error("Erro ao carregar dados.")
    } finally {
      setLoadingData(false)
    }
  }

  // --- LÓGICA DE SUGESTÕES CORRIGIDA ---
  const sugestoesCompra = useMemo(() => {
    const demandaMap = {} 
    solicitacoesPendentes.forEach(req => {
      req.itens?.forEach(item => {
        demandaMap[item.produto_id] = (demandaMap[item.produto_id] || 0) + Number(item.quantidade_solicitada)
      })
    })

    // Mapeia o que JÁ FOI COMPRADO mas ainda não chegou (Status 'Pendente')
    const comprasPendentesMap = {}
    compras.forEach(compra => {
        if (compra.status === 'Pendente') {
            compra.itens?.forEach(item => {
                // Verifica se item.produto_id existe, caso contrário tenta mapear
                const pId = item.produto_id || item.id
                if (pId) {
                    comprasPendentesMap[pId] = (comprasPendentesMap[pId] || 0) + Number(item.quantidade)
                }
            })
        }
    })

    const sugestoes = produtos.map(prod => {
      const id = prod.produto_id || prod.id
      const estoqueItem = estoqueMatriz.find(e => e.produto_id === id || e.produto?.produto_id === id)
      
      const qtdFisica = estoqueItem ? Number(estoqueItem.quantidade) : 0
      const qtdDemanda = demandaMap[id] || 0
      const qtdComprada = comprasPendentesMap[id] || 0

      // Saldo Projetado = (O que tenho + O que vai chegar) - O que preciso entregar
      const saldoProjetado = (qtdFisica + qtdComprada) - qtdDemanda
      
      // CORREÇÃO AQUI: Se o saldo projetado for menor que o mínimo (5), sugere compra.
      // Isso evita sugerir compra se você já comprou o suficiente (qtdComprada alta).
      const estoqueMinimo = 5;

      if (saldoProjetado < estoqueMinimo) {
        // O quanto falta para atingir o mínimo + cobrir a demanda
        const deficit = estoqueMinimo - saldoProjetado;
        
        return {
          ...prod,
          qtdFisica,
          qtdDemanda,
          qtdComprada,
          saldo: saldoProjetado,
          precisaComprar: deficit > 0 ? deficit : 0
        }
      }
      return null
    }).filter(Boolean)

    return sugestoes.sort((a, b) => a.saldo - b.saldo)
  }, [produtos, estoqueMatriz, solicitacoesPendentes, compras])

  // --- Ações ---

  const selecionarSugestao = (item) => {
    if (!fornecedorSel) {
        toast.warning("Selecione um Fornecedor primeiro!", {
            description: "Precisamos saber de quem você vai comprar para definir o custo."
        })
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
    }

    setProdutoSel(String(item.produto_id || item.id))
    
    // Sugere comprar exatamente o necessário para ficar positivo + margem
    const qtdSugerida = item.precisaComprar > 0 ? item.precisaComprar : 10
    setQtd(qtdSugerida)

    toast.info("Produto selecionado!", {
        description: `Sugerimos comprar ${qtdSugerida} unidades.`
    })
  }

  const adicionarAoCarrinho = () => {
    if (!produtoSel || Number(qtd) <= 0 || Number(custo) <= 0) {
      toast.warning("Verifique os dados.", { description: "Produto, quantidade e custo são obrigatórios." })
      return
    }
    const prodObj = produtos.find(p => String(p.produto_id || p.id) === String(produtoSel))
    const novoItem = {
      produto_id: produtoSel,
      nome: prodObj?.nome || "Item",
      sku: prodObj?.sku || "S/N",
      quantidade: Number(qtd),
      custo: Number(custo),
      total: Number(qtd) * Number(custo)
    }
    setCarrinho([...carrinho, novoItem])
    setQtd(1)
    // setCusto("") // Mantém custo para facilitar
    setProdutoSel("")
  }

  const removerDoCarrinho = (index) => {
    const novo = [...carrinho]
    novo.splice(index, 1)
    setCarrinho(novo)
  }

  const finalizarPedido = async () => {
    if (!fornecedorSel) return toast.error("Selecione um fornecedor.")
    if (carrinho.length === 0) return toast.error("Carrinho vazio.")

    setLoading(true)
    try {
      const payload = {
        fornecedor_id: fornecedorSel,
        loja_id: user?.loja_id || 1, 
        observacao: obs,
        total: carrinho.reduce((acc, item) => acc + item.total, 0),
        itens: carrinho
      }
      
      await compraService.createCompra(payload, token)
      toast.success("Pedido criado!", { description: "As sugestões foram atualizadas." })
      
      setCarrinho([])
      setFornecedorSel("")
      setObs("")
      
      // Recarrega tudo para atualizar a lista de sugestões imediatamente
      await carregarDadosCompletos()
    } catch (error) {
      console.error(error)
      toast.error("Erro ao criar pedido.")
    } finally {
      setLoading(false)
    }
  }

  const receberMercadoria = async (id) => {
    setLoading(true)
    try {
      await compraService.receberCompra(id, token)
      toast.success("Estoque atualizado!")
      carregarDadosCompletos()
    } catch (error) {
      toast.error("Erro ao receber.")
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    switch(status) {
      case "Pendente": return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 hover:bg-yellow-100">Aguardando</Badge>
      case "Entregue": return <Badge className="bg-green-600 dark:bg-green-900/50 dark:text-green-400 hover:bg-green-700">Recebido</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto font-sans">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Compras & Abastecimento</h1>
          <p className="text-muted-foreground">Gestão de pedidos e reposição de estoque da Matriz.</p>
        </div>
        <Button variant="outline" onClick={carregarDadosCompletos} disabled={loadingData}>
          {loadingData ? <Loader2 className="w-4 h-4 animate-spin"/> : <ShoppingCart className="w-4 h-4 mr-2"/>} 
          Atualizar Dados
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="novo">Novo Pedido</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="novo" className="mt-4 space-y-6">
          
          {/* SUGESTÕES INTELIGENTES */}
          {sugestoesCompra.length > 0 && (
            <Card className="border-l-4 border-l-amber-500 bg-muted/20 dark:bg-amber-950/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                  Produtos Críticos (Necessitam Compra)
                </CardTitle>
                <CardDescription>
                  O sistema identificou itens com saldo projetado (Físico + Compras - Demanda) abaixo de 5 unidades.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border bg-card">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produto</TableHead>
                        <TableHead className="text-center">Físico</TableHead>
                        <TableHead className="text-center text-blue-600">Já Comprado</TableHead>
                        <TableHead className="text-center text-amber-600">Demanda</TableHead>
                        <TableHead className="text-center">Saldo Projetado</TableHead>
                        <TableHead className="text-right">Ação</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sugestoesCompra.slice(0, 5).map((item) => (
                        <TableRow key={item.produto_id}>
                          <TableCell className="font-medium">
                            {item.nome}
                            <div className="text-xs text-muted-foreground">{item.sku}</div>
                          </TableCell>
                          <TableCell className="text-center text-muted-foreground">{item.qtdFisica}</TableCell>
                          <TableCell className="text-center font-bold text-blue-600 dark:text-blue-400">
                            {item.qtdComprada > 0 ? `+${item.qtdComprada}` : "-"}
                          </TableCell>
                          <TableCell className="text-center font-bold text-amber-600 dark:text-amber-400">
                             {item.qtdDemanda > 0 ? `-${item.qtdDemanda}` : "-"}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant={item.saldo < 5 ? "destructive" : "outline"} className={item.saldo >= 5 ? "text-green-600 border-green-600" : ""}>
                              {item.saldo}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="secondary" onClick={() => selecionarSugestao(item)}>
                              <Plus className="w-3 h-3 mr-1"/> Comprar
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid lg:grid-cols-3 gap-6">
            {/* FORMULÁRIO */}
            <Card className="lg:col-span-1 h-fit border-t-4 border-t-green-600 dark:border-t-green-500">
              <CardHeader><CardTitle>Montar Pedido</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>1. Selecione o Fornecedor</Label>
                  <Select value={fornecedorSel} onValueChange={setFornecedorSel}>
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>
                      {fornecedores.map(f => (
                        <SelectItem key={f.fornecedor_id || f.id} value={String(f.fornecedor_id || f.id)}>{f.razao_social || f.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>2. Escolha o Produto</Label>
                  <Select value={produtoSel} onValueChange={setProdutoSel} disabled={!fornecedorSel}>
                    <SelectTrigger><SelectValue placeholder={fornecedorSel ? "Busque o produto..." : "Selecione fornecedor antes"} /></SelectTrigger>
                    <SelectContent>
                      {produtos.map(p => (
                        <SelectItem key={p.produto_id || p.id} value={String(p.produto_id || p.id)}>{p.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Qtd</Label>
                    <Input type="number" min="1" value={qtd} onChange={e => setQtd(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex justify-between">Custo {loadingPreco && <Loader2 className="w-3 h-3 animate-spin"/>}</Label>
                    <Input type="number" placeholder="0.00" value={custo} onChange={e => setCusto(e.target.value)} />
                  </div>
                </div>

                <Button className="w-full" onClick={adicionarAoCarrinho} disabled={!produtoSel}>
                  <Plus className="w-4 h-4 mr-2"/> Incluir no Pedido
                </Button>
              </CardContent>
            </Card>

            {/* CARRINHO */}
            <Card className="lg:col-span-2 flex flex-col">
              <CardHeader className="flex flex-row justify-between pb-2">
                <CardTitle>Itens no Carrinho</CardTitle>
                <div className="text-xl font-bold text-green-600 dark:text-green-400">
                  {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(carrinho.reduce((a, i) => a + i.total, 0))}
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="rounded-md border flex-1 mb-4 min-h-[150px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produto</TableHead>
                        <TableHead className="text-right">Qtd</TableHead>
                        <TableHead className="text-right">Custo Unit.</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {carrinho.map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">{item.nome}</TableCell>
                          <TableCell className="text-right">{item.quantidade}</TableCell>
                          <TableCell className="text-right">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(item.custo)}</TableCell>
                          <TableCell className="text-right font-bold">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(item.total)}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" onClick={() => removerDoCarrinho(idx)} className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20">
                              <Trash2 className="w-4 h-4"/>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {carrinho.length === 0 && <TableRow><TableCell colSpan={5} className="text-center h-24 text-muted-foreground">Carrinho vazio.</TableCell></TableRow>}
                    </TableBody>
                  </Table>
                </div>
                <div className="flex gap-3 pt-4 border-t justify-end">
                  <Input className="max-w-xs" placeholder="Observação (ex: Urgente)..." value={obs} onChange={e => setObs(e.target.value)} />
                  <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={finalizarPedido} disabled={carrinho.length === 0 || loading}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Truck className="w-4 h-4 mr-2"/>} Confirmar Pedido
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="historico" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Pedidos Realizados</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {compras.map(c => (
                    <TableRow key={c.pedido_compra_id}>
                      <TableCell className="font-mono">#{c.pedido_compra_id}</TableCell>
                      <TableCell>{c.fornecedor_nome || "N/A"}</TableCell>
                      <TableCell>{new Date(c.data_pedido).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell>{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(c.valor_total_estimado)}</TableCell>
                      <TableCell>{getStatusBadge(c.status)}</TableCell>
                      <TableCell className="text-right">
                        {c.status === "Pendente" && (
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => receberMercadoria(c.pedido_compra_id)}>
                            <PackageOpen className="w-4 h-4 mr-2"/> Receber
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {compras.length === 0 && <TableRow><TableCell colSpan={6} className="text-center h-24 text-muted-foreground">Sem histórico.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}