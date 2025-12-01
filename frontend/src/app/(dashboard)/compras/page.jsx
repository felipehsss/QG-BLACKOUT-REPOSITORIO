"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableCell, TableBody } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, ShoppingCart, PackageOpen, Truck, Trash2, Loader2 } from "lucide-react"
import { toast } from "sonner"

// Serviços e Contexto
import { useAuth } from "@/contexts/AuthContext"
import * as produtoService from "@/services/produtoService"
import * as fornecedorService from "@/services/fornecedorService"
import * as compraService from "@/services/compraService"
import * as produtoFornecedorService from "@/services/produtoFornecedorService"

export default function ComprasPage() {
  const { token, user } = useAuth()
  
  // --- Estados de Dados ---
  const [compras, setCompras] = useState([])
  const [produtos, setProdutos] = useState([])
  const [fornecedores, setFornecedores] = useState([])
  
  // --- Estados do Formulário ---
  const [carrinho, setCarrinho] = useState([])
  const [fornecedorSel, setFornecedorSel] = useState("")
  const [produtoSel, setProdutoSel] = useState("")
  const [qtd, setQtd] = useState(1)
  const [custo, setCusto] = useState("") // String para facilitar digitação
  const [obs, setObs] = useState("")
  
  // --- Estados de UI ---
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [loadingPreco, setLoadingPreco] = useState(false)

  // 1. Carregar dados iniciais (Produtos, Fornecedores, Histórico)
  useEffect(() => {
    if (token) {
      carregarDadosIniciais()
      carregarHistorico()
    }
  }, [token])

  // 2. Efeito "Inteligente": Busca preço quando Fornecedor e Produto são selecionados
  useEffect(() => {
    const buscarPrecoAutomatico = async () => {
      // Só busca se ambos estiverem selecionados
      if (fornecedorSel && produtoSel) {
        setLoadingPreco(true);
        try {
          const res = await produtoFornecedorService.getPrecoCusto(fornecedorSel, produtoSel, token);
          
          if (res && res.preco !== undefined) {
            setCusto(res.preco); // Preenche o input
            
            // Feedback visual sutil
            if (Number(res.preco) > 0) {
                toast.success(`Preço sugerido: R$ ${Number(res.preco).toFixed(2)}`, { duration: 2000 });
            } else {
                toast.info("Nenhum custo histórico encontrado. Insira manualmente.");
            }
          }
        } catch (error) {
          console.error("Erro ao buscar preço sugerido", error);
        } finally {
          setLoadingPreco(false);
        }
      }
    };

    buscarPrecoAutomatico();
  }, [fornecedorSel, produtoSel, token]);


  const carregarDadosIniciais = async () => {
    setLoadingData(true)
    try {
      const [pRes, fRes] = await Promise.all([
        produtoService.readAll(token),
        fornecedorService.readAll(token)
      ])
      
      // Garante que são arrays
      setProdutos(Array.isArray(pRes) ? pRes : (pRes.data || []))
      setFornecedores(Array.isArray(fRes) ? fRes : (fRes.data || []))
    } catch (e) {
      console.error(e)
      toast.error("Erro ao carregar cadastros.")
    } finally {
      setLoadingData(false)
    }
  }

  const carregarHistorico = async () => {
    try {
      const data = await compraService.getCompras(token)
      setCompras(Array.isArray(data) ? data : [])
    } catch (e) { console.error(e) }
  }

  // --- Lógica do Carrinho ---
  const adicionarAoCarrinho = () => {
    if (!produtoSel || Number(qtd) <= 0 || Number(custo) <= 0) {
      toast.warning("Preencha produto, quantidade e custo corretamente.")
      return
    }

    // Encontra o objeto completo do produto para exibir nome/sku
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
    
    // Reseta campos do item para facilitar a próxima inserção
    setQtd(1)
    setCusto("") 
    setProdutoSel("")
  }

  const removerDoCarrinho = (index) => {
    const novo = [...carrinho]
    novo.splice(index, 1)
    setCarrinho(novo)
  }

  const totalPedido = carrinho.reduce((acc, item) => acc + item.total, 0)

  // --- Ações Principais ---
  const finalizarPedido = async () => {
    if (!fornecedorSel) return toast.error("Selecione um fornecedor.")
    if (carrinho.length === 0) return toast.error("Carrinho vazio.")

    setLoading(true)
    try {
      const payload = {
        fornecedor_id: fornecedorSel,
        loja_id: user?.loja_id || 1, // Fallback para Matriz
        observacao: obs,
        total: totalPedido,
        itens: carrinho
      }
      
      await compraService.createCompra(payload, token)
      toast.success("Pedido enviado ao fornecedor!")
      
      // Limpa tudo
      setCarrinho([])
      setFornecedorSel("")
      setObs("")
      carregarHistorico()
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
      toast.success("Entrada confirmada! Estoque atualizado.")
      carregarHistorico()
    } catch (error) {
      toast.error("Erro ao receber mercadoria.")
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    switch(status) {
      case "Pendente": return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Aguardando</Badge>
      case "Entregue": return <Badge className="bg-green-600 hover:bg-green-700">Recebido</Badge>
      default: return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Compras e Recebimento</h1>
        <p className="text-muted-foreground">Gerencie pedidos de compra para a Matriz.</p>
      </div>

      <Tabs defaultValue="novo" className="w-full">
        <TabsList>
          <TabsTrigger value="novo"><ShoppingCart className="w-4 h-4 mr-2"/> Novo Pedido</TabsTrigger>
          <TabsTrigger value="historico"><Truck className="w-4 h-4 mr-2"/> Histórico</TabsTrigger>
        </TabsList>

        {/* ABA 1: NOVO PEDIDO */}
        <TabsContent value="novo" className="space-y-4 mt-4">
          <div className="grid lg:grid-cols-3 gap-6">
            
            {/* Formulário */}
            <Card className="lg:col-span-1 h-fit">
              <CardHeader><CardTitle>Dados do Pedido</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                
                <div className="space-y-2">
                  <Label>Fornecedor</Label>
                  <Select value={fornecedorSel} onValueChange={setFornecedorSel}>
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>
                      {fornecedores.map(f => (
                        <SelectItem key={f.id} value={String(f.id)}>{f.nome} {f.cnpj ? `(${f.cnpj})` : ""}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="border-t pt-4 space-y-4">
                  <div className="space-y-2">
                    <Label>Produto</Label>
                    <Select value={produtoSel} onValueChange={setProdutoSel} disabled={!fornecedorSel}>
                      <SelectTrigger><SelectValue placeholder={fornecedorSel ? "Busque o produto..." : "Selecione o fornecedor primeiro"} /></SelectTrigger>
                      <SelectContent>
                        {produtos.map(p => (
                          <SelectItem key={p.produto_id || p.id} value={String(p.produto_id || p.id)}>
                            {p.nome} <span className="text-xs text-muted-foreground">({p.sku})</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Quantidade</Label>
                      <Input type="number" min="1" value={qtd} onChange={e => setQtd(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex justify-between">
                        Custo Unit. 
                        {loadingPreco && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground"/>}
                      </Label>
                      <Input 
                        type="number" 
                        min="0" 
                        step="0.01" 
                        placeholder="0.00" 
                        value={custo} 
                        onChange={e => setCusto(e.target.value)} 
                      />
                    </div>
                  </div>

                  <Button variant="secondary" className="w-full" onClick={adicionarAoCarrinho} disabled={!produtoSel}>
                    <Plus className="w-4 h-4 mr-2"/> Adicionar Item
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Carrinho */}
            <Card className="lg:col-span-2 flex flex-col">
              <CardHeader className="flex flex-row justify-between pb-2">
                <CardTitle>Itens no Carrinho</CardTitle>
                <div className="text-xl font-bold text-green-700">Total: {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalPedido)}</div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="border rounded-md flex-1 mb-4 min-h-[200px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produto</TableHead>
                        <TableHead className="text-right">Qtd</TableHead>
                        <TableHead className="text-right">Custo</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {carrinho.map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell>
                            <div className="font-medium">{item.nome}</div>
                            <div className="text-xs text-muted-foreground">{item.sku}</div>
                          </TableCell>
                          <TableCell className="text-right">{item.quantidade}</TableCell>
                          <TableCell className="text-right">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(item.custo)}</TableCell>
                          <TableCell className="text-right font-bold">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(item.total)}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50" onClick={() => removerDoCarrinho(idx)}><Trash2 className="w-4 h-4"/></Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {carrinho.length === 0 && (
                        <TableRow><TableCell colSpan={5} className="text-center h-32 text-muted-foreground">Carrinho vazio.</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                
                <div className="flex gap-3 justify-end items-end pt-4 border-t">
                  <div className="w-full max-w-sm space-y-1">
                    <Label>Observações</Label>
                    <Input placeholder="Ex: Urgência na entrega..." value={obs} onChange={e => setObs(e.target.value)} />
                  </div>
                  <Button className="bg-green-600 hover:bg-green-700 min-w-[200px]" onClick={finalizarPedido} disabled={loading || carrinho.length === 0}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : <Truck className="w-4 h-4 mr-2"/>} 
                    Confirmar Pedido
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ABA 2: HISTÓRICO */}
        <TabsContent value="historico" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Histórico de Pedidos</CardTitle><CardDescription>Gerencie o recebimento das mercadorias.</CardDescription></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Itens</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {compras.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center h-24 text-muted-foreground">Nenhum pedido encontrado.</TableCell></TableRow>
                  ) : (
                    compras.map(c => (
                      <TableRow key={c.pedido_compra_id}>
                        <TableCell className="font-mono">#{c.pedido_compra_id}</TableCell>
                        <TableCell>{c.fornecedor_nome}</TableCell>
                        <TableCell>{new Date(c.data_pedido).toLocaleDateString("pt-BR")}</TableCell>
                        <TableCell><Badge variant="outline">{c.qtd_itens || 0}</Badge></TableCell>
                        <TableCell>{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(c.valor_total_estimado)}</TableCell>
                        <TableCell>{getStatusBadge(c.status)}</TableCell>
                        <TableCell className="text-right">
                          {c.status === "Pendente" && (
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => receberMercadoria(c.pedido_compra_id)} disabled={loading}>
                              <PackageOpen className="w-4 h-4 mr-2" /> Dar Entrada
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}