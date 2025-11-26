"use client"

import { useMemo, useState } from "react"
import { toast } from "sonner"
import {
  Card, CardHeader, CardTitle, CardContent
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Trash2, CheckCircle, User, Percent, XCircle, Search, FileText, PlusCircle } from "lucide-react"
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem
} from "@/components/ui/select"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog"

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

// Mock clientes
const clientesMock = [
  { nome: "João da Silva", documento: "123.456.789-00", tipo: "PF", telefone: "11 99999-0000", email: "joao@email.com" },
  { nome: "Oficina Mecânica LTDA", documento: "12.345.678/0001-99", tipo: "PJ", telefone: "11 88888-1111", email: "contato@oficina.com" },
]

// Mock produtos
const produtosMock = [
  { id: 1, nome: "Pastilha de Freio", preco: 89.9, codigo: "PF-001" },
  { id: 2, nome: "Filtro de Óleo", preco: 29.9, codigo: "FO-002" },
  { id: 3, nome: "Amortecedor Dianteiro", preco: 249.9, codigo: "AD-003" },
  { id: 4, nome: "Bateria 60Ah", preco: 399.9, codigo: "BT-004" },
  { id: 5, nome: "Correia Dentada", preco: 119.9, codigo: "CD-005" },
  { id: 6, nome: "Velas de Ignição", preco: 59.9, codigo: "VI-006" },
]

export default function PDVPage() {
  // Estado
  const [clientes, setClientes] = useState(clientesMock)
  const [cliente, setCliente] = useState({ nome: "", documento: "", tipo: "", telefone: "", email: "" })

  const [carrinho, setCarrinho] = useState([])
  const [descontoPercent, setDescontoPercent] = useState(0)

  const [showDesconto, setShowDesconto] = useState(false)
  const [showPagamento, setShowPagamento] = useState(false)
  const [metodoPagamento, setMetodoPagamento] = useState("")
  const [valorRecebido, setValorRecebido] = useState("")

  const [showRecibo, setShowRecibo] = useState(false)
  const [recibo, setRecibo] = useState(null)

  const [showNota, setShowNota] = useState(false)
  const [notaFiscal, setNotaFiscal] = useState(null)

  const [busca, setBusca] = useState("")

  const [showCadastroCliente, setShowCadastroCliente] = useState(false)
  const [showSelecionarCliente, setShowSelecionarCliente] = useState(false)
  const [novoCliente, setNovoCliente] = useState({ nome: "", documento: "", tipo: "", telefone: "", email: "" })
  const [buscaCliente, setBuscaCliente] = useState("")

  // Totais
  const subtotal = carrinho.reduce((acc, p) => acc + p.preco * p.quantidade, 0)
  const valorDesconto = (subtotal * descontoPercent) / 100
  const base = subtotal - valorDesconto
  const impostos = base * 0.06
  const totalComDesconto = base + impostos

  const troco = useMemo(() => {
    const recebido = parseFloat(valorRecebido || "0")
    return recebido > totalComDesconto ? recebido - totalComDesconto : 0
  }, [valorRecebido, totalComDesconto])

  // Documento com reconhecimento
  const handleDocumentoChange = (value) => {
    const formatted =
      cliente.tipo === "PF" ? formatCPF(value) :
      cliente.tipo === "PJ" ? formatCNPJ(value) : value

    setCliente((prev) => ({ ...prev, documento: formatted }))

    const encontrado = clientes.find((c) => c.documento === formatted)
    if (encontrado) {
      setCliente(encontrado)
      toast.success("Cliente reconhecido automaticamente!")
    }
  }

  // Cadastro de cliente
  const cadastrarCliente = () => {
    if (!novoCliente.nome || !novoCliente.documento || !novoCliente.tipo) {
      toast.error("Preencha os campos obrigatórios.")
      return
    }
    // Formatar documento ao salvar
    const docFmt = novoCliente.tipo === "PF" ? formatCPF(novoCliente.documento) : formatCNPJ(novoCliente.documento)
    const clienteSalvar = { ...novoCliente, documento: docFmt }
    setClientes((prev) => [...prev, clienteSalvar])
    setShowCadastroCliente(false)
    setNovoCliente({ nome: "", documento: "", tipo: "", telefone: "", email: "" })
    toast.success("Cliente cadastrado com sucesso!")
  }

  // Seleção de cliente
  const selecionarCliente = (c) => {
    setCliente(c)
    setShowSelecionarCliente(false)
    toast.success("Cliente selecionado!")
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

  // Fluxo
  const finalizarVenda = () => {
    if (!cliente.nome || !cliente.documento || !cliente.tipo) {
      toast.error("Preencha os dados do cliente.")
      return
    }
    if (carrinho.length === 0) {
      toast.error("Adicione ao menos um produto.")
      return
    }
    setShowPagamento(true)
  }

  const confirmarPagamento = () => {
    if (!metodoPagamento) {
      toast.error("Selecione um método de pagamento.")
      return
    }
    if (metodoPagamento === "Dinheiro") {
      const recebido = parseFloat(valorRecebido || "0")
      if (isNaN(recebido) || recebido < totalComDesconto) {
        toast.error("Valor recebido insuficiente.")
        return
      }
    }

    const reciboData = {
      cliente,
      itens: carrinho,
      subtotal,
      descontoPercent,
      valorDesconto,
      impostos,
      total: totalComDesconto,
      metodoPagamento,
      valorRecebido: metodoPagamento === "Dinheiro" ? parseFloat(valorRecebido || "0") : totalComDesconto,
      troco: metodoPagamento === "Dinheiro" ? troco : 0,
      data: new Date().toLocaleString(),
      idTransacao: Math.random().toString(36).slice(2, 10).toUpperCase(),
    }

    setRecibo(reciboData)
    setShowPagamento(false)
    setShowRecibo(true)
    toast.success("Venda finalizada com sucesso!")
    setCarrinho([])
    setDescontoPercent(0)
    setMetodoPagamento("")
    setValorRecebido("")
  }

  // Emissão de nota (simulada)
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
    toast.success("Nota emitida (simulação).")
  }

  const cancelarVenda = () => {
    setCarrinho([])
    setCliente({ nome: "", documento: "", tipo: "", telefone: "", email: "" })
    setDescontoPercent(0)
    setMetodoPagamento("")
    setValorRecebido("")
    setRecibo(null)
    setNotaFiscal(null)
    setShowRecibo(false)
    setShowNota(false)
    toast.success("Venda cancelada.")
  }

  // Catálogo filtrado
  const produtosFiltrados = produtosMock.filter((p) => {
    const q = busca.trim().toLowerCase()
    return p.nome.toLowerCase().includes(q) || p.codigo.toLowerCase().includes(q)
  })

  // Clientes filtrados para seleção
  const clientesFiltrados = clientes.filter((c) => {
    const q = buscaCliente.trim().toLowerCase()
    return (
      c.nome.toLowerCase().includes(q) ||
      c.documento.toLowerCase().includes(q) ||
      (c.email || "").toLowerCase().includes(q)
    )
  })

  return (
    <main className="p-6 space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">PDV - Peças Automotivas</h1>
          <p className="text-muted-foreground">Venda rápida e eficiente de peças.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowCadastroCliente(true)}>
            <PlusCircle className="w-4 h-4 mr-2" /> Cadastrar cliente
          </Button>
          <Button variant="outline" onClick={() => setShowSelecionarCliente(true)}>
            <User className="w-4 h-4 mr-2" /> Selecionar cliente
          </Button>
          <Button variant="outline" onClick={cancelarVenda}>
            <XCircle className="w-4 h-4 mr-2" /> Fechar sessão
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
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone</Label>
            <Input
              id="telefone"
              value={cliente.telefone || ""}
              onChange={(e) => setCliente({ ...cliente, telefone: e.target.value })}
              placeholder="(11) 90000-0000"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              value={cliente.email || ""}
              onChange={(e) => setCliente({ ...cliente, email: e.target.value })}
              placeholder="email@exemplo.com"
            />
          </div>
        </CardContent>
      </Card>

      {/* Layout lateralizado */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Catálogo */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Buscar por nome ou código..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
            <Search className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {produtosFiltrados.map((produto) => (
              <Card key={produto.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{produto.nome}</span>
                    <span className="text-xs text-muted-foreground">{produto.codigo}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-semibold">R$ {produto.preco.toFixed(2)}</p>
                  <Button className="mt-2 w-full" onClick={() => adicionarProduto(produto)}>
                    Adicionar
                  </Button>
                </CardContent>
              </Card>
            ))}
            {produtosFiltrados.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhuma peça encontrada.</p>
            )}
          </div>
        </div>

        {/* Carrinho + Ações */}
        <div className="space-y-4">
          {/* Carrinho */}
          <Card>
            <CardHeader><CardTitle>Carrinho</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {carrinho.length === 0 ? (
                <p className="text-muted-foreground">Nenhum item adicionado.</p>
              ) : (
                carrinho.map((item, index) => (
                  <div key={`${item.id}-${index}`} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">{item.nome}</p>
                      <div className="flex items-center gap-2">
                        <Label className="text-xs">Qtd</Label>
                        <Input
                          type="number"
                          min={1}
                          value={item.quantidade}
                          onChange={(e) => alterarQuantidade(index, parseInt(e.target.value || "1"))}
                          className="w-20 h-8"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="font-semibold">R$ {(item.preco * item.quantidade).toFixed(2)}</p>
                      <Button variant="ghost" size="icon" onClick={() => removerProduto(index)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}

              <Separator />

              <div className="grid grid-cols-2 gap-2 text-sm">
                <p>Subtotal:</p><p className="text-right">R$ {subtotal.toFixed(2)}</p>
                <p>Desconto ({descontoPercent}%):</p><p className="text-right">- R$ {valorDesconto.toFixed(2)}</p>
                <p>Impostos (6%):</p><p className="text-right">R$ {impostos.toFixed(2)}</p>
                <p className="font-bold">Total:</p>
                <p className="text-right font-bold text-green-600">R$ {totalComDesconto.toFixed(2)}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="w-full flex gap-2" onClick={() => setShowDesconto(true)}>
                  <Percent className="w-4 h-4" /> Aplicar Desconto
                </Button>
                <Button className="w-full flex items-center gap-2" onClick={finalizarVenda}>
                  <CheckCircle className="w-5 h-5" /> Finalizar Venda
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Ações */}
          <Card>
            <CardHeader><CardTitle>Ações</CardTitle></CardHeader>
            <CardContent className="grid gap-3">
              <Button variant="outline" className="w-full flex gap-2" onClick={() => setShowSelecionarCliente(true)}>
                <User className="w-4 h-4" /> Selecionar Cliente
              </Button>
              <Button variant="outline" className="w-full flex gap-2" onClick={emitirNota}>
                <FileText className="w-4 h-4" /> Emitir Nota
              </Button>
              <Button variant="destructive" className="w-full flex gap-2" onClick={cancelarVenda}>
                <XCircle className="w-4 h-4" /> Cancelar Venda
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
            <DialogTitle>Pagamento</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Método</Label>
              <Select value={metodoPagamento || undefined} onValueChange={setMetodoPagamento}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
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
                <Label htmlFor="recebido">Valor recebido</Label>
                <Input
                  id="recebido"
                  type="number"
                  min={0}
                  value={valorRecebido}
                  onChange={(e) => setValorRecebido(e.target.value)}
                  placeholder="0,00"
                />
                <p className="text-sm">Troco: R$ {troco.toFixed(2)}</p>
              </div>
            )}

            <Separator />

            <div className="grid grid-cols-2 gap-2 text-sm">
              <p>Total a pagar:</p>
              <p className="text-right font-semibold">R$ {totalComDesconto.toFixed(2)}</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPagamento(false)}>Voltar</Button>
            <Button onClick={confirmarPagamento}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Recibo */}
      <Dialog open={showRecibo} onOpenChange={setShowRecibo}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Recibo da Venda</DialogTitle>
          </DialogHeader>

          {recibo ? (
            <div className="space-y-4">
              <div>
                <p className="font-medium">Cliente</p>
                <p className="text-sm text-muted-foreground">
                  {recibo.cliente.nome || "—"} • {recibo.cliente.documento || "—"} • {recibo.cliente.tipo || "—"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{recibo.data}</p>
                <p className="text-xs text-muted-foreground">ID: {recibo.idTransacao}</p>
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="font-medium">Itens</p>
                {recibo.itens.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.nome} x{item.quantidade}</span>
                    <span>R$ {(item.preco * item.quantidade).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span>Subtotal</span><span>R$ {recibo.subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Desconto ({recibo.descontoPercent}%)</span><span>- R$ {recibo.valorDesconto.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Impostos (6%)</span><span>R$ {recibo.impostos.toFixed(2)}</span></div>
                <div className="flex justify-between font-semibold"><span>Total</span><span>R$ {recibo.total.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Método</span><span>{recibo.metodoPagamento}</span></div>
                {recibo.metodoPagamento === "Dinheiro" && (
                  <>
                    <div className="flex justify-between"><span>Recebido</span><span>R$ {recibo.valorRecebido.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Troco</span><span>R$ {recibo.troco.toFixed(2)}</span></div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Finalize uma venda para ver o recibo.</p>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRecibo(false)}>Fechar</Button>
            <Button onClick={() => window.print()}>Imprimir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Nota Fiscal (simulada) */}
      <Dialog open={showNota} onOpenChange={setShowNota}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nota Fiscal</DialogTitle>
          </DialogHeader>

          {notaFiscal ? (
            <div className="space-y-4">
              <div>
                <p className="font-medium">Chave</p>
                <p className="text-sm">{notaFiscal.chave}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Emissão: {notaFiscal.dataEmissao} • Transação: {notaFiscal.idTransacao}
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="font-medium">Destinatário</p>
                <p className="text-sm text-muted-foreground">
                  {notaFiscal.cliente.nome} • {notaFiscal.cliente.documento} • {notaFiscal.cliente.tipo}
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="font-medium">Itens</p>
                {notaFiscal.itens.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.nome} x{item.quantidade}</span>
                    <span>R$ {(item.preco * item.quantidade).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span>Total</span><span>R$ {notaFiscal.total.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Impostos</span><span>R$ {notaFiscal.impostos.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Desconto</span><span>R$ {notaFiscal.desconto.toFixed(2)}</span></div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Finalize uma venda para emitir a nota.</p>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNota(false)}>Fechar</Button>
            <Button onClick={() => window.print()}>Imprimir</Button>
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
            <Label>Nome</Label>
            <Input value={novoCliente.nome} onChange={(e)=>setNovoCliente({...novoCliente,nome:e.target.value})} placeholder="Nome completo" />

            <Label>Tipo</Label>
            <Select value={novoCliente.tipo || undefined} onValueChange={(v)=>setNovoCliente({...novoCliente,tipo:v})}>
              <SelectTrigger><SelectValue placeholder="PF ou PJ" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="PF">Pessoa Física</SelectItem>
                <SelectItem value="PJ">Pessoa Jurídica</SelectItem>
              </SelectContent>
            </Select>

            <Label>CPF/CNPJ</Label>
            <Input
              value={novoCliente.documento}
              onChange={(e)=>{
                const val = e.target.value
                const fmt = novoCliente.tipo === "PF" ? formatCPF(val) : novoCliente.tipo === "PJ" ? formatCNPJ(val) : val
                setNovoCliente({...novoCliente, documento: fmt})
              }}
              placeholder={novoCliente.tipo === "PJ" ? "00.000.000/0001-00" : "000.000.000-00"}
            />

            <Label>Telefone</Label>
            <Input value={novoCliente.telefone} onChange={(e)=>setNovoCliente({...novoCliente,telefone:e.target.value})} placeholder="(11) 90000-0000" />

            <Label>E-mail</Label>
            <Input value={novoCliente.email} onChange={(e)=>setNovoCliente({...novoCliente,email:e.target.value})} placeholder="email@exemplo.com" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=>setShowCadastroCliente(false)}>Cancelar</Button>
            <Button onClick={cadastrarCliente}>Salvar</Button>
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
              <Input placeholder="Buscar por nome, CPF/CNPJ ou e-mail..." value={buscaCliente} onChange={(e)=>setBuscaCliente(e.target.value)} />
              <Search className="w-5 h-5 text-muted-foreground" />
            </div>

            <div className="space-y-2 max-h-72 overflow-auto">
              {clientesFiltrados.length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhum cliente encontrado.</p>
              )}
              {clientesFiltrados.map((c)=>(
                <div key={c.documento} className="flex items-center justify-between border rounded p-2">
                  <div className="text-sm">
                    <p className="font-medium">{c.nome}</p>
                    <p className="text-muted-foreground">{c.documento} • {c.tipo}</p>
                    {c.email && <p className="text-muted-foreground">{c.email}</p>}
                    {c.telefone && <p className="text-muted-foreground">{c.telefone}</p>}
                  </div>
                  <Button size="sm" onClick={()=>selecionarCliente(c)}>Selecionar</Button>
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
