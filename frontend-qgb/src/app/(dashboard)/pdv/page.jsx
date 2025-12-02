"use client"

import { useMemo, useState, useEffect } from "react"
import { toast } from "sonner"
import {
  Card, CardHeader, CardTitle, CardContent
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Trash2, CheckCircle, User, Percent, XCircle, Search, FileText, PlusCircle, Loader2, Image as ImageIcon } from "lucide-react"
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem
} from "@/components/ui/select"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog"

// Contexto e Serviços
import { useAuth } from "@/contexts/AuthContext"
import * as clienteService from "@/services/clienteService"
import * as produtoService from "@/services/produtoService"
import * as vendaService from "@/services/vendaService"

// --- CONFIGURAÇÃO DA URL ---
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3080/api';
const BASE_URL = API_URL.replace('/api', ''); 

// Utilitários
const formatCPF = (value) => value.replace(/\D/g, "").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2").slice(0, 14)
const formatCNPJ = (value) => value.replace(/\D/g, "").replace(/^(\d{2})(\d)/, "$1.$2").replace(/^(\d{2}\.\d{3})(\d)/, "$1.$2").replace(/\.(\d{3})(\d)/, ".$1/$2").replace(/(\d{4})(\d)/, "$1-$2").slice(0, 18)

export default function PDVPage() {
  const { token, user } = useAuth()

  // --- Estados ---
  const [clientes, setClientes] = useState([])
  const [produtos, setProdutos] = useState([])
  
  const [cliente, setCliente] = useState({ id: null, nome: "", documento: "", tipo: "", telefone: "", email: "" })
  const [carrinho, setCarrinho] = useState([])
  const [descontoPercent, setDescontoPercent] = useState(0)

  const [showDesconto, setShowDesconto] = useState(false)
  const [showPagamento, setShowPagamento] = useState(false)
  const [loadingPagamento, setLoadingPagamento] = useState(false)
  
  const [metodoPagamento, setMetodoPagamento] = useState("")
  const [valorRecebido, setValorRecebido] = useState("")

  const [showRecibo, setShowRecibo] = useState(false)
  const [recibo, setRecibo] = useState(null)

  const [busca, setBusca] = useState("")
  const [showCadastroCliente, setShowCadastroCliente] = useState(false)
  const [loadingCadastro, setLoadingCadastro] = useState(false)
  
  const [showSelecionarCliente, setShowSelecionarCliente] = useState(false)
  const [novoCliente, setNovoCliente] = useState({ nome: "", documento: "", tipo: "", telefone: "", email: "" })
  const [buscaCliente, setBuscaCliente] = useState("")

  // --- Init ---
  useEffect(() => {
    if (token) {
      carregarProdutos()
      carregarClientes()
    }
  }, [token])

  const carregarProdutos = async () => {
    try {
      const res = await produtoService.readAll(token)
      const lista = Array.isArray(res) ? res : (res.data || [])
      
      const produtosFormatados = lista.map(p => ({
        ...p,
        id: p.produto_id || p.id || p._id,
        preco: Number(p.preco_venda || p.preco || 0),
        fotoUrl: p.foto ? `${BASE_URL}/uploads/${p.foto}` : null
      }))
      setProdutos(produtosFormatados)
    } catch (error) {
      console.error(error)
      toast.error("Erro ao carregar produtos.")
    }
  }

  const carregarClientes = async () => {
    try {
      const lista = await clienteService.readAll(token)
      const clientesFormatados = lista.map(c => ({
        ...c,
        id: c.id_cliente || c.id, // Ajuste para pegar o ID correto
        documento: c.cpf || c.cnpj || "" 
      }))
      setClientes(clientesFormatados)
    } catch (error) {
      console.error(error)
      toast.error("Erro ao carregar clientes.")
    }
  }

  // --- Cálculos ---
  const subtotal = carrinho.reduce((acc, p) => acc + (p.preco * p.quantidade), 0)
  const valorDesconto = (subtotal * descontoPercent) / 100
  const base = subtotal - valorDesconto
  const impostos = base * 0.06
  const totalComDesconto = base + impostos

  const troco = useMemo(() => {
    const recebido = parseFloat(valorRecebido || "0")
    return recebido > totalComDesconto ? recebido - totalComDesconto : 0
  }, [valorRecebido, totalComDesconto])

  // --- Ações ---
  const handleDocumentoChange = (value) => {
    const rawValue = value.replace(/\D/g, "")
    let formatted = value
    if (cliente.tipo === "PF" || (!cliente.tipo && rawValue.length <= 11)) {
       formatted = formatCPF(value)
    } else {
       formatted = formatCNPJ(value)
    }
    setCliente((prev) => ({ ...prev, documento: formatted }))

    const documentoLimpo = formatted.replace(/\D/g, "")
    if (documentoLimpo.length > 5) {
      const encontrado = clientes.find((c) => {
        const docC = (c.documento || "").replace(/\D/g, "")
        return docC === documentoLimpo
      })
      if (encontrado) {
        setCliente(encontrado)
        toast.success(`Cliente ${encontrado.nome} reconhecido!`)
      }
    }
  }

  const cadastrarCliente = async () => {
    if (!novoCliente.nome || !novoCliente.documento || !novoCliente.tipo) {
      toast.error("Preencha os campos obrigatórios.")
      return
    }
    setLoadingCadastro(true)
    try {
      const payload = {
        ...novoCliente,
        cpf: novoCliente.tipo === 'PF' ? novoCliente.documento.replace(/\D/g, "") : null,
        cnpj: novoCliente.tipo === 'PJ' ? novoCliente.documento.replace(/\D/g, "") : null,
        tipo_cliente: novoCliente.tipo
      }
      await clienteService.create(payload, token)
      toast.success("Cliente cadastrado!")
      await carregarClientes()
      setShowCadastroCliente(false)
      setNovoCliente({ nome: "", documento: "", tipo: "", telefone: "", email: "" })
    } catch (error) {
      console.error(error)
      toast.error("Erro ao cadastrar cliente.")
    } finally {
      setLoadingCadastro(false)
    }
  }

  const selecionarCliente = (c) => {
    setCliente(c)
    setShowSelecionarCliente(false)
    toast.success("Cliente selecionado.")
  }

  const adicionarProduto = (produto) => {
    setCarrinho((prev) => {
      const idx = prev.findIndex((p) => p.id === produto.id)
      if (idx >= 0) {
        const clone = [...prev]
        clone[idx] = { ...clone[idx], quantidade: clone[idx].quantidade + 1 }
        return clone
      }
      return [...prev, { ...produto, quantidade: 1 }]
    })
  }

  const removerProduto = (index) => setCarrinho((prev) => prev.filter((_, i) => i !== index))

  const alterarQuantidade = (index, qtd) => {
    if (qtd < 1 || Number.isNaN(qtd)) return
    setCarrinho((prev) => prev.map((item, i) => (i === index ? { ...item, quantidade: qtd } : item)))
  }

  const finalizarVenda = () => {
    if (carrinho.length === 0) {
      toast.warning("O carrinho está vazio.")
      return
    }
    setShowPagamento(true)
  }

  const confirmarPagamento = async () => {
    if (!metodoPagamento) {
      toast.warning("Selecione a forma de pagamento.")
      return
    }
    
    const valRecebidoNum = parseFloat(valorRecebido || "0")
    if (metodoPagamento === "Dinheiro") {
      if (isNaN(valRecebidoNum) || valRecebidoNum < totalComDesconto) {
        toast.error("Valor recebido insuficiente.")
        return
      }
    }

    setLoadingPagamento(true)

    try {
      const vendaPayload = {
        // IDs obrigatórios - Fallbacks seguros para evitar erro de BD
        loja_id: user?.loja_id || 1, 
        sessao_id: user?.sessao_id || 1, 
        funcionario_id: user?.id || user?.id_funcionario || 1,
        
        // Dados da venda
        cliente_id: cliente.id || null, // Envia null se não tiver ID selecionado
        valor_total: totalComDesconto,
        status_venda: "Concluída",
        
        // Itens mapeados
        itens: carrinho.map(item => ({
          produto_id: item.id,
          quantidade: item.quantidade,
          preco_unitario_momento: item.preco,
          subtotal: item.preco * item.quantidade
        })),

        // Pagamentos
        pagamentos: [
          {
            metodo_pagamento: metodoPagamento,
            valor_pago: metodoPagamento === "Dinheiro" ? valRecebidoNum : totalComDesconto
          }
        ]
      }

      const resVenda = await vendaService.create(vendaPayload, token)
      
      const idVenda = resVenda?.venda_id || resVenda?.id || (resVenda?.data && resVenda.data.id)

      const reciboData = {
        cliente,
        itens: carrinho,
        subtotal,
        descontoPercent,
        valorDesconto,
        impostos,
        total: totalComDesconto,
        metodoPagamento,
        valorRecebido: metodoPagamento === "Dinheiro" ? valRecebidoNum : totalComDesconto,
        troco: metodoPagamento === "Dinheiro" ? troco : 0,
        data: new Date().toLocaleString(),
        idTransacao: idVenda || "N/A",
      }

      setRecibo(reciboData)
      setShowPagamento(false)
      setShowRecibo(true)
      toast.success("Venda finalizada com sucesso!")
      
      // Resetar estado para nova venda
      setCarrinho([])
      setDescontoPercent(0)
      setMetodoPagamento("")
      setValorRecebido("")
      setCliente({ id: null, nome: "", documento: "", tipo: "", telefone: "", email: "" }) 

    } catch (error) {
      console.error("Erro ao finalizar venda:", error)
      toast.error(error.message || "Falha ao registrar venda.")
    } finally {
      setLoadingPagamento(false)
    }
  }

  const produtosFiltrados = useMemo(() => {
    const q = busca.trim().toLowerCase()
    return produtos.filter((p) => {
      const nome = (p.nome || "").toLowerCase()
      const codigo = (p.sku || p.codigo || "").toLowerCase()
      return nome.includes(q) || codigo.includes(q)
    })
  }, [produtos, busca])

  const clientesFiltrados = useMemo(() => {
    const q = buscaCliente.trim().toLowerCase()
    return clientes.filter((c) => {
      const nome = (c.nome || "").toLowerCase()
      const doc = (c.documento || "").toLowerCase()
      return nome.includes(q) || doc.includes(q)
    })
  }, [clientes, buscaCliente])

  return (
    <main className="p-4 md:p-6 space-y-6 max-w-[1600px] mx-auto h-[calc(100vh-80px)] flex flex-col">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Frente de Caixa (PDV)</h1>
          <p className="text-muted-foreground">Registrar vendas e emitir comprovantes</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => setShowCadastroCliente(true)}>
            <PlusCircle className="w-4 h-4 mr-2" /> Novo Cliente
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowSelecionarCliente(true)}>
            <User className="w-4 h-4 mr-2" /> Buscar Cliente
          </Button>
          <Button variant="destructive" size="sm" onClick={() => {
              setCarrinho([]); 
              setCliente({ id: null, nome: "", documento: "", tipo: "", telefone: "", email: "" });
              toast.info("Venda limpa.");
          }}>
            <XCircle className="w-4 h-4 mr-2" /> Limpar Venda
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Coluna da Esquerda */}
        <div className="lg:col-span-2 flex flex-col gap-6 min-h-0 overflow-y-auto pr-1 pb-2">
          
          {/* Card do Cliente */}
          <Card className="shrink-0">
            <CardHeader className="pb-3 pt-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base">Dados do Cliente</CardTitle>
                {cliente.id && (
                  <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={() => setCliente({ id: null, nome: "", documento: "", tipo: "", telefone: "", email: "" })}>
                    Remover
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
              <div className="space-y-1 sm:col-span-2">
                <Label className="text-xs text-muted-foreground">Nome</Label>
                <Input value={cliente.nome} onChange={(e) => setCliente({ ...cliente, nome: e.target.value })} placeholder="Consumidor Final" className="h-8" disabled={!!cliente.id} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">CPF/CNPJ</Label>
                <Input value={cliente.documento} onChange={(e) => handleDocumentoChange(e.target.value)} className="h-8" placeholder="000.000.000-00" disabled={!!cliente.id} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Tipo</Label>
                <Select value={cliente.tipo || undefined} onValueChange={(v) => setCliente({...cliente, tipo: v})} disabled={!!cliente.id}>
                  <SelectTrigger className="h-8"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent><SelectItem value="PF">Pessoa Física</SelectItem><SelectItem value="PJ">Pessoa Jurídica</SelectItem></SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Catálogo */}
          <div className="flex-1 flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar produto..." className="pl-9 bg-background" value={busca} onChange={(e) => setBusca(e.target.value)} />
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
              {produtosFiltrados.map((produto) => (
                <Card key={produto.id} className="cursor-pointer hover:border-primary/50 transition-all active:scale-95 flex flex-col justify-between overflow-hidden" onClick={() => adicionarProduto(produto)}>
                  <div className="aspect-square w-full bg-muted flex items-center justify-center overflow-hidden relative">
                    {produto.fotoUrl ? (
                      <img src={produto.fotoUrl} alt={produto.nome} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }} />
                    ) : null}
                    <div className="flex items-center justify-center w-full h-full text-muted-foreground/20 bg-muted absolute inset-0" style={{ display: produto.fotoUrl ? 'none' : 'flex' }}>
                      <ImageIcon className="w-10 h-10" />
                    </div>
                  </div>
                  <CardHeader className="p-3 pb-0">
                    <div className="flex justify-between items-start gap-2">
                      <span className="font-medium text-sm leading-tight line-clamp-2" title={produto.nome}>{produto.nome}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono truncate">{produto.sku || produto.codigo || "—"}</span>
                  </CardHeader>
                  <CardContent className="p-3 pt-2">
                    <div className="text-lg font-bold text-primary">R$ {produto.preco.toFixed(2)}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Coluna da Direita: Carrinho */}
        <div className="flex flex-col gap-4 h-full min-h-0">
          <Card className="flex-1 flex flex-col shadow-md border-primary/20 overflow-hidden">
            <CardHeader className="bg-muted/30 py-3 border-b">
              <CardTitle className="flex justify-between items-center text-base">
                <span>Carrinho</span>
                <span className="text-xs font-normal text-muted-foreground">{carrinho.length} itens</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-0">
              {carrinho.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8 gap-2">
                  <Search className="w-8 h-8 opacity-20" />
                  <p className="text-sm">Carrinho vazio</p>
                </div>
              ) : (
                <div className="divide-y">
                  {carrinho.map((item, index) => (
                    <div key={`${item.id}-${index}`} className="flex items-center gap-3 p-3 hover:bg-muted/20 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" title={item.nome}>{item.nome}</p>
                        <p className="text-xs text-muted-foreground">Unit: R$ {item.preco.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input type="number" className="h-7 w-12 text-center px-1 text-xs" min={1} value={item.quantidade} onChange={(e) => alterarQuantidade(index, parseInt(e.target.value) || 1)} />
                        <div className="text-right w-20"><p className="text-sm font-bold">R$ {(item.preco * item.quantidade).toFixed(2)}</p></div>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removerProduto(index)}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <div className="p-4 bg-muted/30 border-t space-y-3">
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>R$ {subtotal.toFixed(2)}</span></div>
                {descontoPercent > 0 && <div className="flex justify-between text-green-600"><span>Desconto ({descontoPercent}%)</span><span>- R$ {valorDesconto.toFixed(2)}</span></div>}
                <div className="flex justify-between text-muted-foreground"><span>Impostos (Est.)</span><span>R$ {impostos.toFixed(2)}</span></div>
              </div>
              <Separator />
              <div className="flex justify-between items-end"><span className="font-bold text-lg">Total</span><span className="font-bold text-2xl text-primary">R$ {totalComDesconto.toFixed(2)}</span></div>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Button variant="outline" onClick={() => setShowDesconto(true)}><Percent className="w-4 h-4 mr-2" /> Desconto</Button>
                <Button onClick={finalizarVenda} className="w-full" size="lg"><CheckCircle className="w-5 h-5 mr-2" /> Finalizar</Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Modais */}
      <Dialog open={showDesconto} onOpenChange={setShowDesconto}>
        <DialogContent className="max-w-xs">
          <DialogHeader><DialogTitle>Aplicar Desconto</DialogTitle></DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2"><Label>Porcentagem (%)</Label><Input type="number" min={0} max={100} autoFocus value={descontoPercent} onChange={(e) => setDescontoPercent(parseFloat(e.target.value) || 0)} /></div>
          </div>
          <DialogFooter><Button onClick={() => setShowDesconto(false)}>Confirmar</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showPagamento} onOpenChange={setShowPagamento}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Finalizar Pagamento</DialogTitle></DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="flex justify-between items-center bg-muted p-4 rounded-lg"><span className="font-medium">Total a Pagar</span><span className="text-2xl font-bold">R$ {totalComDesconto.toFixed(2)}</span></div>
            <div className="space-y-2"><Label>Forma de Pagamento</Label>
              <div className="grid grid-cols-2 gap-2">
                {['Dinheiro', 'Cartão de Crédito', 'Cartão de Débito', 'PIX'].map((metodo) => (
                  <Button key={metodo} variant={metodoPagamento === metodo ? "default" : "outline"} className="justify-start" onClick={() => setMetodoPagamento(metodo)}>{metodo}</Button>
                ))}
              </div>
            </div>
            {metodoPagamento === "Dinheiro" && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                <Label>Valor Recebido</Label>
                <Input className="pl-9 text-lg font-bold" type="number" placeholder="0.00" autoFocus value={valorRecebido} onChange={(e) => setValorRecebido(e.target.value)} />
                <div className={`text-right text-sm font-medium ${troco < 0 ? 'text-destructive' : 'text-green-600'}`}>{troco < 0 ? "Faltam R$ " + Math.abs(troco).toFixed(2) : "Troco: R$ " + troco.toFixed(2)}</div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPagamento(false)} disabled={loadingPagamento}>Voltar</Button>
            <Button onClick={confirmarPagamento} disabled={loadingPagamento || !metodoPagamento || (metodoPagamento === "Dinheiro" && troco < 0)}>
              {loadingPagamento && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Confirmar Venda
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showRecibo} onOpenChange={setShowRecibo}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="text-center">Recibo da Venda</DialogTitle></DialogHeader>
          {recibo && (
            <div className="border p-4 rounded-md bg-white text-black font-mono text-sm shadow-sm">
              <div className="text-center border-b pb-2 mb-2 border-dashed border-gray-300"><p className="font-bold">QG BLACKOUT</p><p className="text-xs">{recibo.data}</p><p className="text-xs">ID: {recibo.idTransacao}</p></div>
              <div className="mb-2"><p><strong>Cliente:</strong> {recibo.cliente.nome || "Não informado"}</p></div>
              <table className="w-full mb-2">
                <tbody>{recibo.itens.map((item, i) => (<tr key={i}><td className="align-top">{item.quantidade}x</td><td className="align-top px-1">{item.nome.substring(0, 18)}</td><td className="text-right align-top">{(item.preco * item.quantidade).toFixed(2)}</td></tr>))}</tbody>
              </table>
              <div className="border-t pt-2 border-dashed border-gray-300 space-y-1">
                <div className="flex justify-between"><span>Subtotal</span><span>{recibo.subtotal.toFixed(2)}</span></div>
                {recibo.valorDesconto > 0 && <div className="flex justify-between"><span>Desc.</span><span>-{recibo.valorDesconto.toFixed(2)}</span></div>}
                <div className="flex justify-between font-bold text-base mt-2"><span>TOTAL</span><span>{recibo.total.toFixed(2)}</span></div>
              </div>
              <div className="mt-4 text-center text-xs">Pagamento: {recibo.metodoPagamento}{recibo.troco > 0 && <span className="block">Troco: R$ {recibo.troco.toFixed(2)}</span>}</div>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0"><Button variant="outline" onClick={() => setShowRecibo(false)}>Fechar</Button><Button onClick={() => window.print()}>Imprimir</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showSelecionarCliente} onOpenChange={setShowSelecionarCliente}>
        <DialogContent className="max-w-md h-[500px] flex flex-col">
          <DialogHeader><DialogTitle>Selecionar Cliente</DialogTitle></DialogHeader>
          <div className="relative"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar..." className="pl-9" value={buscaCliente} onChange={(e) => setBuscaCliente(e.target.value)} /></div>
          <div className="flex-1 overflow-y-auto border rounded-md mt-2">
            {clientesFiltrados.map((c) => (
              <button key={c.id || c.documento} className="w-full text-left p-3 hover:bg-muted transition-colors flex justify-between items-center" onClick={() => selecionarCliente(c)}>
                <div><p className="font-medium text-sm">{c.nome}</p><p className="text-xs text-muted-foreground">{c.documento}</p></div>
                <CheckCircle className={`w-4 h-4 ${cliente.id === c.id ? "text-primary" : "text-transparent"}`} />
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showCadastroCliente} onOpenChange={setShowCadastroCliente}>
        <DialogContent>
          <DialogHeader><DialogTitle>Novo Cliente</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2"><Label>Nome *</Label><Input value={novoCliente.nome} onChange={(e) => setNovoCliente({...novoCliente, nome: e.target.value})} /></div>
            <div className="grid gap-2"><Label>Documento</Label><Input value={novoCliente.documento} onChange={(e) => setNovoCliente({...novoCliente, documento: e.target.value})} /></div>
            <div className="grid gap-2"><Label>Tipo</Label><Select value={novoCliente.tipo || undefined} onValueChange={(v) => setNovoCliente({...novoCliente, tipo: v})}><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent><SelectItem value="PF">Pessoa Física</SelectItem><SelectItem value="PJ">Pessoa Jurídica</SelectItem></SelectContent></Select></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowCadastroCliente(false)}>Cancelar</Button><Button onClick={cadastrarCliente} disabled={loadingCadastro}>Salvar</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}