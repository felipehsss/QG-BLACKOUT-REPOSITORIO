"use client"

import { useState } from "react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Trash2, CheckCircle, User, Percent, Receipt, XCircle } from "lucide-react"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { toast } from "sonner"

const produtosMock = [
  { id: 1, nome: "Pastilha de Freio", preco: 89.9 },
  { id: 2, nome: "Filtro de Óleo", preco: 29.9 },
  { id: 3, nome: "Amortecedor Dianteiro", preco: 249.9 },
  { id: 4, nome: "Bateria 60Ah", preco: 399.9 },
  { id: 5, nome: "Correia Dentada", preco: 119.9 },
  { id: 6, nome: "Velas de Ignição", preco: 59.9 },
]

export default function PDVPage() {
  const [cliente, setCliente] = useState({ nome: "", documento: "", tipo: "" })
  const [carrinho, setCarrinho] = useState([])

  const adicionarProduto = (produto) => {
    setCarrinho((prev) => [...prev, produto])
  }

  const removerProduto = (index) => {
    setCarrinho((prev) => prev.filter((_, i) => i !== index))
  }

  const subtotal = carrinho.reduce((acc, p) => acc + p.preco, 0)
  const impostos = subtotal * 0.06
  const total = subtotal + impostos

  const finalizarVenda = () => {
    if (!cliente.nome || !cliente.documento || !cliente.tipo) {
      toast.error("Preencha os dados do cliente.")
      return
    }
    if (carrinho.length === 0) {
      toast.error("Adicione ao menos um produto.")
      return
    }
    toast.success("Venda finalizada com sucesso!")
    setCarrinho([])
    setCliente({ nome: "", documento: "", tipo: "" })
  }

  return (
    <main className="p-6 space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">PDV - Peças Automotivas</h1>
          <p className="text-muted-foreground">Venda rápida e eficiente de peças.</p>
        </div>
        <Button variant="outline">Fechar Sessão</Button>
      </div>

      {/* Formulário de cliente */}
      <Card>
        <CardHeader>
          <CardTitle>Cliente</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome</Label>
            <Input
              id="nome"
              value={cliente.nome}
              onChange={(e) => setCliente({ ...cliente, nome: e.target.value })}
              placeholder="Nome completo"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="documento">CPF/CNPJ</Label>
            <Input
              id="documento"
              value={cliente.documento}
              onChange={(e) => setCliente({ ...cliente, documento: e.target.value })}
              placeholder="000.000.000-00"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo</Label>
            <Select onValueChange={(value) => setCliente({ ...cliente, tipo: value })}>
              <SelectTrigger>
                <SelectValue placeholder="PF ou PJ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PF">Pessoa Física</SelectItem>
                <SelectItem value="PJ">Pessoa Jurídica</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Layout lateralizado */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Catálogo de produtos */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold">Catálogo de Peças</h2>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {produtosMock.map((produto) => (
              <Card key={produto.id}>
                <CardHeader>
                  <CardTitle>{produto.nome}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-semibold">R$ {produto.preco.toFixed(2)}</p>
                  <Button variant="default" className="mt-2 w-full" onClick={() => adicionarProduto(produto)}>
                    Adicionar
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Carrinho */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Carrinho</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {carrinho.length === 0 ? (
                <p className="text-muted-foreground">Nenhum item adicionado.</p>
              ) : (
                carrinho.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{item.nome}</p>
                      <p className="text-sm text-muted-foreground">1 unidade</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="font-semibold">R$ {item.preco.toFixed(2)}</p>
                      <Button variant="ghost" size="icon" onClick={() => removerProduto(index)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}

              <Separator />

              <div className="grid grid-cols-2 gap-2 text-sm">
                <p>Subtotal:</p>
                <p className="text-right">R$ {subtotal.toFixed(2)}</p>
                <p>Impostos (6%):</p>
                <p className="text-right">R$ {impostos.toFixed(2)}</p>
                <p className="font-bold">Total:</p>
                <p className="text-right font-bold text-green-600">R$ {total.toFixed(2)}</p>
              </div>

              <Button variant="default" className="w-full flex items-center gap-2" onClick={finalizarVenda}>
                <CheckCircle className="w-5 h-5" />
                Finalizar Venda
              </Button>
            </CardContent>
          </Card>

          {/* Painel de ações extra */}
          <Card>
            <CardHeader>
              <CardTitle>Ações</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Button variant="outline" className="w-full flex gap-2">
                <User className="w-4 h-4" />
                Selecionar Cliente
              </Button>
              <Button variant="outline" className="w-full flex gap-2">
                <Percent className="w-4 h-4" />
                Aplicar Desconto
              </Button>
              <Button variant="outline" className="w-full flex gap-2">
                <Receipt className="w-4 h-4" />
                Emitir Nota
              </Button>
              <Button variant="destructive" className="w-full flex gap-2">
                <XCircle className="w-4 h-4" />
                Cancelar Venda
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
