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
import { Trash2, CheckCircle, User, Percent, XCircle, Search, FileText, PlusCircle, Loader2 } from "lucide-react"
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
import * as pagamentoVendaService from "@/services/pagamentoVendaService"

// Utilitários CPF/CNPJ
const formatCPF = (value) =>
  value.replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
    .slice(0, 14)

const formatCNPJ = (value) =>
  value.replace(/\D/g, "")
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2}\.\d{3})(\d)/, "$1.$2")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2")
    .slice(0, 18)

export default function PDVPage() {
  const { token } = useAuth()

  // Estado de Dados
  const [clientes, setClientes] = useState([])
  const [produtos, setProdutos] = useState([])
  
  // Estado do Fluxo
  const [cliente, setCliente] = useState({ id: null, nome: "", documento: "", tipo: "", telefone: "", email: "" })
  const [carrinho, setCarrinho] = useState([])
  const [descontoPercent, setDescontoPercent] = useState(0)

  // Modais e Controles
  const [showDesconto, setShowDesconto] = useState(false)
  const [showPagamento, setShowPagamento] = useState(false)
  const [loadingPagamento, setLoadingPagamento] = useState(false)
  
  const [metodoPagamento, setMetodoPagamento] = useState("")
  const [valorRecebido, setValorRecebido] = useState("")

  const [showRecibo, setShowRecibo] = useState(false)
  const [recibo, setRecibo] = useState(null)

  const [showNota, setShowNota] = useState(false)
  const [notaFiscal, setNotaFiscal] = useState(null)

  const [busca, setBusca] = useState("")

  const [showCadastroCliente, setShowCadastroCliente] = useState(false)
  const [loadingCadastro, setLoadingCadastro] = useState(false)
  
  const [showSelecionarCliente, setShowSelecionarCliente] = useState(false)
  const [novoCliente, setNovoCliente] = useState({ nome: "", documento: "", tipo: "", telefone: "", email: "" })
  const [buscaCliente, setBuscaCliente] = useState("")

  // Carregar Dados Iniciais
  useEffect(() => {
    if (token) {
      carregarProdutos()
      carregarClientes()
    }
  }, [token])

  const carregarProdutos = async () => {
    try {
      const res = await produtoService.readAll(token)
      // Ajuste para garantir que a resposta seja um array e normalize o preço
      const lista = Array.isArray(res) ? res : (res.data || [])
      
      const produtosFormatados = lista.map(p => ({
        ...p,
        id: p.id_produto || p.id,
        // Garante que o preço seja numérico. Tenta preco_venda, depois preco, depois 0
        preco: Number(p.preco_venda || p.preco || 0) 
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
      // O service clienteService já normaliza os dados (id, nome, documento, etc)
      // Mas vamos garantir que o campo 'documento' esteja preenchido com CPF ou CNPJ
      const clientesFormatados = lista.map(c => ({
        ...c,
        documento: c.cpf || c.cnpj || ""
      }))
      setClientes(clientesFormatados)
    } catch (error) {
      console.error(error)
      toast.error("Erro ao carregar clientes.")
    }
  }

  // Totais
  const subtotal = carrinho.reduce((acc, p) => acc + p.preco * p.quantidade, 0)
  const valorDesconto = (subtotal * descontoPercent) / 100
  const base = subtotal - valorDesconto
  const impostos = base * 0.06 // Exemplo fixo de imposto
  const totalComDesconto = base + impostos

  const troco = useMemo(() => {
    const recebido = parseFloat(valorRecebido || "0")
    return recebido > totalComDesconto ? recebido - totalComDesconto : 0
  }, [valorRecebido, totalComDesconto])

  // Documento com reconhecimento
  const handleDocumentoChange = (value) => {
    // Aplica formatação visual apenas
    const rawValue = value.replace(/\D/g, "")
    let formatted = value

    if (cliente.tipo === "PF" || (!cliente.tipo && rawValue.length <= 11)) {
       formatted = formatCPF(value)
    } else {
       formatted = formatCNPJ(value)
    }

    setCliente((prev) => ({ ...prev, documento: formatted }))

    // Tenta encontrar cliente na lista já carregada
    // Remove formatação para comparar se necessário, mas aqui comparamos formatado se o service retornou formatado
    // Como normalizamos no useEffect, vamos comparar com flexibilidade
    const documentoLimpo = formatted.replace(/\D/g, "")
    
    const encontrado = clientes.find((c) => {
      const docC = (c.documento || "").replace(/\D/g, "")
      return docC === documentoLimpo && docC.length > 0
    })

    if (encontrado) {
      setCliente(encontrado)
      toast.success("Cliente reconhecido automaticamente!")
    }
  }

  // Cadastro de cliente via API
  const cadastrarCliente = async () => {
    if (!novoCliente.nome || !novoCliente.documento || !novoCliente.tipo) {
      toast.error("Preencha os campos obrigatórios (Nome, Tipo, Documento).")
      return
    }

    setLoadingCadastro(true)
    try {
      // Prepara payload conforme esperado pelo clienteService
      const payload = {
        ...novoCliente,
        // Limpa formatação para envio se a API esperar números puros
        cpf: novoCliente.tipo === 'PF' ? novoCliente.documento.replace(/\D/g, "") : null,
        cnpj: novoCliente.tipo === 'PJ' ? novoCliente.documento.replace(/\D/g, "") : null,
        tipo_cliente: novoCliente.tipo
      }

      await clienteService.create(payload, token)
      
      toast.success("Cliente cadastrado com sucesso!")
      await carregarClientes() // Recarrega a lista
      setShowCadastroCliente(false)
      setNovoCliente({ nome: "", documento: "", tipo: "", telefone: "", email: "" })
    } catch (error) {
      console.error(error)
      toast.error("Erro ao cadastrar cliente.")
    } finally {
      setLoadingCadastro(false)
    }
  }

  // Seleção de cliente
  const selecionarCliente = (c) => {
    setCliente(c)
    setShowSelecionarCliente(false)
    toast.success(`Cliente ${c.nome} selecionado!`)
  }

  // Carrinho
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

  // Fluxo de Venda
  const finalizarVenda = () => {
    if (!cliente.nome) { // Validação básica se cliente foi selecionado/preenchido
      toast.error("Selecione ou identifique um cliente.")
      return
    }
    if (carrinho.length === 0) {
      toast.error("Adicione ao menos um produto.")
      return
    }
    setShowPagamento(true)
  }

  const confirmarPagamento = async () => {
    if (!metodoPagamento) {
      toast.error("Selecione um método de pagamento.")
      return
    }
    
    // Validação de dinheiro
    const valRecebidoNum = parseFloat(valorRecebido || "0")
    if (metodoPagamento === "Dinheiro") {
      if (isNaN(valRecebidoNum) || valRecebidoNum < totalComDesconto) {
        toast.error("Valor recebido insuficiente.")
        return
      }
    }

    setLoadingPagamento(true)

    try {
      // 1. Criar a Venda
      const vendaPayload = {
        id_cliente: cliente.id, // Se for cliente avulso não cadastrado, a API precisa aceitar nulo ou tratar isso
        status: "concluida", // Ou 'pendente' dependendo da regra de negócio
        valor_total: totalComDesconto,
        desconto: valorDesconto,
        itens: carrinho.map(item => ({
          id_produto: item.id,
          quantidade: item.quantidade,
          preco_unitario: item.preco,
          subtotal: item.preco * item.quantidade
        }))
      }

      const resVenda = await vendaService.create(vendaPayload, token)
      // Ajuste: verificar como a API retorna o ID. Normalmente resVenda.id, resVenda.data.id ou resVenda.insertId
      const idVenda = resVenda.id || resVenda.id_venda || (resVenda.data && resVenda.data.id)

      if (!idVenda) {
        throw new Error("Falha ao obter ID da venda criada.")
      }

      // 2. Registrar o Pagamento
      // Se a API de Venda já não registra o pagamento automaticamente no create
      const pagamentoPayload = {
        id_venda: idVenda,
        valor: metodoPagamento === "Dinheiro" ? totalComDesconto : totalComDesconto, // Registra o valor da venda, não o recebido (troco é visual)
        forma_pagamento: metodoPagamento,
        data_pagamento: new Date().toISOString()
      }

      await pagamentoVendaService.create(pagamentoPayload, token)

      // 3. Sucesso e Recibo
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
        idTransacao: idVenda, // Usa o ID real da venda
      }

      setRecibo(reciboData)
      setShowPagamento(false)
      setShowRecibo(true)
      toast.success("Venda realizada com sucesso!")
      
      // Limpa estado
      setCarrinho([])
      setDescontoPercent(0)
      setMetodoPagamento("")
      setValorRecebido("")
      setCliente({ id: null, nome: "", documento: "", tipo: "", telefone: "", email: "" }) // Opcional: limpar cliente

    } catch (error) {
      console.error(error)
      toast.error("Erro ao processar venda. Tente novamente.")
    } finally {
      setLoadingPagamento(false)
    }
  }

  // Emissão de nota (Simulada - backend geralmente faz isso)
  const emitirNota = () => {
    if (!recibo) {
      toast.error("Finalize a venda para emitir a nota.")
      return
    }
    const nf = {
      chave: `NFe-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
      cliente: recibo.cliente,
      itens: recibo.itens,
      total: recibo.total,
      impostos: recibo.impostos,
      desconto: recibo.valorDesconto,
      dataEmissao: new Date().toLocaleString(),
      idTransacao: recibo.idTransacao,
    }
    setNotaFiscal(nf)
    setShowNota(true)
    toast.success("Nota emitida (simulação visual).")
  }

  const cancelarVenda = () => {
    setCarrinho([])
    setCliente({ id: null, nome: "", documento: "", tipo: "", telefone: "", email: "" })
    setDescontoPercent(0)
    setMetodoPagamento("")
    setValorRecebido("")
    setRecibo(null)
    setNotaFiscal(null)
    setShowRecibo(false)
    setShowNota(false)
    toast.info("Sessão limpa.")
  }

  // Catálogo filtrado
  const produtosFiltrados = produtos.filter((p) => {
    const q = busca.trim().toLowerCase()
    return (p.nome || "").toLowerCase().includes(q) || (p.codigo || "").toLowerCase().includes(q)
  })

  // Clientes filtrados para seleção
  const clientesFiltrados = clientes.filter((c) => {
    const q = buscaCliente.trim().toLowerCase()
    return (
      (c.nome || "").toLowerCase().includes(q) ||
      (c.documento || "").toLowerCase().includes(q) ||
      (c.email || "").toLowerCase().includes(q)
    )
  })

  return (
    <main className="p-6 space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">PDV - QG Blackout</h1>
          <p className="text-muted-foreground">Frente de caixa</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowCadastroCliente(true)}>
            <PlusCircle className="w-4 h-4 mr-2" /> Cadastrar cliente
          </Button>
          <Button variant="outline" onClick={() => setShowSelecionarCliente(true)}>
            <User className="w-4 h-4 mr-2" /> Selecionar cliente
          </Button>
          <Button variant="outline" onClick={cancelarVenda}>
            <XCircle className="w-4 h-4 mr-2" /> Limpar Tela
          </Button>
        </div>
      </div>

      {/* Cliente */}
      <Card>
        <CardHeader><CardTitle>Cliente</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-5">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="nome">Nome</Label>
            <Input
              id="nome"
              value={cliente.nome}
              onChange={(e) => setCliente({ ...cliente, nome: e.target.value })}
              placeholder="Nome completo"
              disabled={!!cliente.id} // Trava edição se selecionado da lista, destrava se limpar
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo</Label>
            <Select
              value={cliente.tipo || undefined}
              onValueChange={(value) => {
                const doc = value === "PF" ? formatCPF(cliente.documento) :
                            value === "PJ" ? formatCNPJ(cliente.documento) : cliente.documento
                setCliente({ ...cliente, tipo: value, documento: doc })
              }}
              disabled={!!cliente.id}
            >
              <SelectTrigger><SelectValue placeholder="PF ou PJ" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="PF">Pessoa Física</SelectItem>
                <SelectItem value="PJ">Pessoa Jurídica</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="documento">CPF/CNPJ</Label>
            <Input
              id="documento"
              value={cliente.documento}
              onChange={(e) => handleDocumentoChange(e.target.value)}
              placeholder={cliente.tipo === "PJ" ? "00.000.000/0001-00" : "000.000.000-00"}
              disabled={!!cliente.id}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone</Label>
            <Input
              id="telefone"
              value={cliente.telefone || ""}
              onChange={(e) => setCliente({ ...cliente, telefone: e.target.value })}
              placeholder="(11) 90000-0000"
              disabled={!!cliente.id}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              value={cliente.email || ""}
              onChange={(e) => setCliente({ ...cliente, email: e.target.value })}
              placeholder="email@exemplo.com"
              disabled={!!cliente.id}
            />
          </div>
          {cliente.id && (
             <div className="md:col-span-5 flex justify-end">
                <Button variant="ghost" size="sm" onClick={() => setCliente({ id: null, nome: "", documento: "", tipo: "", telefone: "", email: "" })}>
                   Limpar seleção de cliente
                </Button>
             </div>
          )}
        </CardContent>
      </Card>

      {/* Layout lateralizado */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Catálogo */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Buscar produto por nome ou código..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
            <Search className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {produtosFiltrados.map((produto) => (
              <Card key={produto.id} className="cursor-pointer hover:border-primary transition-colors" onClick={() => adicionarProduto(produto)}>
                <CardHeader className="pb-2">
                  <CardTitle className="flex flex-col gap-1">
                    <span className="text-base truncate" title={produto.nome}>{produto.nome}</span>
                    <span className="text-xs text-muted-foreground font-normal">{produto.codigo || "S/ Cód"}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-semibold">R$ {produto.preco.toFixed(2)}</p>
                  <Button className="mt-2 w-full" size="sm">
                    Adicionar
                  </Button>
                </CardContent>
              </Card>
            ))}
            {produtosFiltrados.length === 0 && (
              <div className="col-span-full py-8 text-center text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
                 Nenhum produto encontrado.
              </div>
            )}
          </div>
        </div>

        {/* Carrinho + Ações */}
        <div className="space-y-4">
          {/* Carrinho */}
          <Card className="flex flex-col h-[calc(100vh-200px)] lg:h-auto lg:min-h-[500px]">
            <CardHeader><CardTitle>Carrinho</CardTitle></CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
              <div className="flex-1 overflow-auto space-y-4 pr-2 max-h-[300px]">
                {carrinho.length === 0 ? (
                  <p className="text-muted-foreground text-center py-10">Carrinho vazio.</p>
                ) : (
                  carrinho.map((item, index) => (
                    <div key={`${item.id}-${index}`} className="flex items-start justify-between border-b pb-2 last:border-0">
                      <div className="space-y-1">
                        <p className="font-medium text-sm line-clamp-1" title={item.nome}>{item.nome}</p>
                        <div className="flex items-center gap-2">
                          <Label className="text-xs">Qtd</Label>
                          <Input
                            type="number"
                            min={1}
                            value={item.quantidade}
                            onChange={(e) => alterarQuantidade(index, parseInt(e.target.value || "1"))}
                            className="w-16 h-7 text-xs"
                          />
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <p className="font-semibold text-sm">R$ {(item.preco * item.quantidade).toFixed(2)}</p>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removerProduto(index)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-2 text-sm">
                <p>Subtotal:</p><p className="text-right">R$ {subtotal.toFixed(2)}</p>
                <p>Desconto ({descontoPercent}%):</p><p className="text-right text-destructive">- R$ {valorDesconto.toFixed(2)}</p>
                <p>Impostos (Est.):</p><p className="text-right text-muted-foreground">R$ {impostos.toFixed(2)}</p>
                <p className="font-bold text-lg mt-2">Total:</p>
                <p className="text-right font-bold text-lg mt-2 text-green-600">R$ {totalComDesconto.toFixed(2)}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-auto pt-4">
                <Button variant="outline" className="w-full flex gap-2" onClick={() => setShowDesconto(true)}>
                  <Percent className="w-4 h-4" /> Desconto
                </Button>
                <Button className="w-full flex items-center gap-2" onClick={finalizarVenda}>
                  <CheckCircle className="w-5 h-5" /> Finalizar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Ações Rápidas */}
          <Card>
            <CardHeader className="py-4"><CardTitle className="text-base">Ações Rápidas</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 pb-4">
              <Button variant="secondary" size="sm" onClick={() => setShowSelecionarCliente(true)}>
                <User className="w-4 h-4 mr-2" /> Clientes
              </Button>
              <Button variant="secondary" size="sm" onClick={emitirNota}>
                <FileText className="w-4 h-4 mr-2" /> Nota Fiscal
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal de desconto */}
      <Dialog open={showDesconto} onOpenChange={setShowDesconto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aplicar desconto</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Label htmlFor="desconto">Desconto (%)</Label>
            <Input
              id="desconto"
              type="number"
              min={0}
              max={100}
              value={descontoPercent}
              onChange={(e) => setDescontoPercent(parseFloat(e.target.value || "0"))}
            />
            <p className="text-sm text-muted-foreground">Valor de desconto: R$ {valorDesconto.toFixed(2)}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDesconto(false)}>Cancelar</Button>
            <Button onClick={() => setShowDesconto(false)}>Aplicar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de pagamento */}
      <Dialog open={showPagamento} onOpenChange={setShowPagamento}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Realizar Pagamento</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Método de Pagamento</Label>
              <Select value={metodoPagamento || undefined} onValueChange={setMetodoPagamento}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PIX">PIX</SelectItem>
                  <SelectItem value="Cartão de Crédito">Cartão de Crédito</SelectItem>
                  <SelectItem value="Cartão de Débito">Cartão de Débito</SelectItem>
                  <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {metodoPagamento === "Dinheiro" && (
              <div className="space-y-2">
                <Label htmlFor="recebido">Valor entregue pelo cliente</Label>
                <Input
                  id="recebido"
                  type="number"
                  min={0}
                  value={valorRecebido}
                  onChange={(e) => setValorRecebido(e.target.value)}
                  placeholder="0,00"
                />
                <div className={`text-sm font-medium ${troco < 0 ? 'text-destructive' : 'text-green-600'}`}>
                   {troco >= 0 ? `Troco: R$ ${troco.toFixed(2)}` : "Valor insuficiente"}
                </div>
              </div>
            )}

            <Separator />

            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total a Pagar:</span>
              <span>R$ {totalComDesconto.toFixed(2)}</span>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPagamento(false)} disabled={loadingPagamento}>
               Voltar
            </Button>
            <Button onClick={confirmarPagamento} disabled={loadingPagamento}>
              {loadingPagamento && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmar Pagamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Recibo */}
      <Dialog open={showRecibo} onOpenChange={setShowRecibo}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Recibo da Venda</DialogTitle>
          </DialogHeader>

          {recibo ? (
            <div className="space-y-4 text-sm font-mono border p-4 rounded bg-slate-50">
              <div className="text-center pb-2 border-b border-dashed">
                <p className="font-bold uppercase">QG Blackout</p>
                <p>Recibo de Venda</p>
                <p className="text-xs text-muted-foreground">{recibo.data}</p>
                <p className="text-xs text-muted-foreground">ID: {recibo.idTransacao}</p>
              </div>

              <div>
                <p className="font-bold">Cliente:</p>
                <p>{recibo.cliente.nome || "Consumidor Final"}</p>
                <p>{recibo.cliente.documento}</p>
              </div>

              <div className="border-b border-dashed pb-2">
                <p className="font-bold mb-1">Itens:</p>
                {recibo.itens.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span>{item.quantidade}x {item.nome.substring(0, 20)}</span>
                    <span>{(item.preco * item.quantidade).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-1 pt-2">
                <div className="flex justify-between"><span>Subtotal:</span><span>{recibo.subtotal.toFixed(2)}</span></div>
                {recibo.valorDesconto > 0 && (
                   <div className="flex justify-between"><span>Desconto:</span><span>-{recibo.valorDesconto.toFixed(2)}</span></div>
                )}
                <div className="flex justify-between font-bold text-base mt-2 pt-2 border-t border-dashed">
                   <span>TOTAL:</span><span>R$ {recibo.total.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="pt-2 text-xs text-center border-t border-dashed mt-2">
                 Pagamento via {recibo.metodoPagamento}
                 {recibo.metodoPagamento === "Dinheiro" && (
                    <span> (Troco: {recibo.troco.toFixed(2)})</span>
                 )}
              </div>
            </div>
          ) : null}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRecibo(false)}>Fechar</Button>
            <Button onClick={() => window.print()}>Imprimir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Nota Fiscal (Visualização simulada) */}
      <Dialog open={showNota} onOpenChange={setShowNota}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nota Fiscal Eletrônica</DialogTitle>
          </DialogHeader>
          {notaFiscal && (
            <div className="space-y-4 border p-4 rounded text-sm">
               <div className="text-center">
                  <h3 className="font-bold">DANFE Simplificado</h3>
                  <p className="text-xs break-all">{notaFiscal.chave}</p>
               </div>
               <Separator />
               <div className="grid grid-cols-2 gap-2">
                  <div>
                     <span className="font-bold block">Emitente</span>
                     QG Blackout LTDA
                  </div>
                  <div>
                     <span className="font-bold block">Destinatário</span>
                     {notaFiscal.cliente.nome}<br/>
                     {notaFiscal.cliente.documento}
                  </div>
               </div>
               <Separator />
               <div>
                  <div className="flex justify-between font-bold bg-muted p-1">
                     <span>Valor Total</span>
                     <span>R$ {notaFiscal.total.toFixed(2)}</span>
                  </div>
               </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNota(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cadastro de cliente */}
      <Dialog open={showCadastroCliente} onOpenChange={setShowCadastroCliente}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cadastrar cliente</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Label>Nome *</Label>
            <Input value={novoCliente.nome} onChange={(e)=>setNovoCliente({...novoCliente,nome:e.target.value})} placeholder="Nome completo" />

            <Label>Tipo *</Label>
            <Select value={novoCliente.tipo || undefined} onValueChange={(v)=>setNovoCliente({...novoCliente,tipo:v})}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="PF">Pessoa Física</SelectItem>
                <SelectItem value="PJ">Pessoa Jurídica</SelectItem>
              </SelectContent>
            </Select>

            <Label>CPF/CNPJ *</Label>
            <Input
              value={novoCliente.documento}
              onChange={(e)=>{
                const val = e.target.value
                const fmt = novoCliente.tipo === "PF" ? formatCPF(val) : novoCliente.tipo === "PJ" ? formatCNPJ(val) : val
                setNovoCliente({...novoCliente, documento: fmt})
              }}
              placeholder="Digite apenas números"
            />

            <Label>Telefone</Label>
            <Input value={novoCliente.telefone} onChange={(e)=>setNovoCliente({...novoCliente,telefone:e.target.value})} placeholder="(11) 90000-0000" />

            <Label>E-mail</Label>
            <Input value={novoCliente.email} onChange={(e)=>setNovoCliente({...novoCliente,email:e.target.value})} placeholder="email@exemplo.com" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=>setShowCadastroCliente(false)} disabled={loadingCadastro}>Cancelar</Button>
            <Button onClick={cadastrarCliente} disabled={loadingCadastro}>
               {loadingCadastro && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
               Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Selecionar cliente */}
      <Dialog open={showSelecionarCliente} onOpenChange={setShowSelecionarCliente}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Selecionar cliente</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Input placeholder="Buscar por nome, CPF/CNPJ..." value={buscaCliente} onChange={(e)=>setBuscaCliente(e.target.value)} />
              <Search className="w-5 h-5 text-muted-foreground" />
            </div>

            <div className="space-y-2 max-h-72 overflow-auto">
              {clientesFiltrados.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhum cliente encontrado.</p>
              )}
              {clientesFiltrados.map((c)=>(
                <div key={c.id || c.documento} className="flex items-center justify-between border rounded p-3 hover:bg-accent cursor-pointer" onClick={()=>selecionarCliente(c)}>
                  <div className="text-sm">
                    <p className="font-medium">{c.nome}</p>
                    <p className="text-muted-foreground text-xs">{c.documento} • {c.tipo}</p>
                  </div>
                  <Button size="sm" variant="ghost">Selecionar</Button>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={()=>setShowSelecionarCliente(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}