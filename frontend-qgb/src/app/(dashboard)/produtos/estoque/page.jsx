"use client"

import { useState, useMemo } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableCell, TableBody } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Download, Plus, Pencil, Package } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

// Mock inicial
const estoqueMock = [
  { id: 1, nome: "Notebook Dell", categoria: "Eletrônicos", quantidade: 12, minimo: 5, preco: 3500 },
  { id: 2, nome: "Camiseta Preta", categoria: "Roupas", quantidade: 3, minimo: 10, preco: 50 },
  { id: 3, nome: "Shampoo", categoria: "Cosméticos", quantidade: 0, minimo: 5, preco: 25 },
  { id: 4, nome: "Arroz 5kg", categoria: "Alimentos", quantidade: 20, minimo: 10, preco: 30 },
]

export default function EstoquePage() {
  const [produtos, setProdutos] = useState(estoqueMock)
  const [busca, setBusca] = useState("")
  const [showNovoProduto, setShowNovoProduto] = useState(false)
  const [novoProduto, setNovoProduto] = useState({ nome: "", categoria: "", quantidade: 0, minimo: 0, preco: 0 })
  const [editProduto, setEditProduto] = useState(null)

  const produtosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    if (!termo) return produtos
    return produtos.filter(p =>
      p.nome.toLowerCase().includes(termo) ||
      p.categoria.toLowerCase().includes(termo)
    )
  }, [busca, produtos])

  const resumo = useMemo(() => {
    const total = produtos.reduce((acc, p) => acc + p.quantidade, 0)
    const emFalta = produtos.filter(p => p.quantidade === 0).length
    const abaixoMinimo = produtos.filter(p => p.quantidade > 0 && p.quantidade < p.minimo).length
    return { total, emFalta, abaixoMinimo }
  }, [produtos])

  const statusBadge = (p) => {
    if (p.quantidade === 0) return <Badge className="bg-red-600">❌ Em falta</Badge>
    if (p.quantidade < p.minimo) return <Badge className="bg-yellow-500">⚠️ Abaixo</Badge>
    return <Badge className="bg-green-600">✅ OK</Badge>
  }

  return (
    <div className="p-6 space-y-8">
      {/* Resumo com gradiente */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-xl rounded-xl">
          <CardHeader className="flex items-center gap-3">
            <Package className="w-6 h-6" />
            <CardTitle>Total em estoque</CardTitle>
          </CardHeader>
          <CardContent className="text-4xl font-extrabold">{resumo.total}</CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-red-500 to-red-700 text-white shadow-xl rounded-xl">
          <CardHeader><CardTitle>Produtos em falta</CardTitle></CardHeader>
          <CardContent className="text-4xl font-extrabold">{resumo.emFalta}</CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black shadow-xl rounded-xl">
          <CardHeader><CardTitle>Abaixo do mínimo</CardTitle></CardHeader>
          <CardContent className="text-4xl font-extrabold">{resumo.abaixoMinimo}</CardContent>
        </Card>
      </div>

      {/* Barra de busca + ações */}
      <div className="flex justify-between items-center">
        <Input
          placeholder="🔍 Buscar produto..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex gap-2">
          <Button variant="outline"><Download className="w-4 h-4" /> Exportar</Button>
          <Button onClick={() => setShowNovoProduto(true)}><Plus className="w-4 h-4" /> Novo Produto</Button>
        </div>
      </div>

      {/* Tabela com ícones e badges */}
      <Card>
        <CardHeader><CardTitle>📦 Estoque Atual</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Qtd</TableHead>
                <TableHead>Mínimo</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {produtosFiltrados.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.nome}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">
                        {p.categoria === "Alimentos" ? "🍎" :
                         p.categoria === "Roupas" ? "👕" :
                         p.categoria === "Cosméticos" ? "🧴" : "💻"}
                      </span>
                      {p.categoria}
                    </div>
                  </TableCell>
                  <TableCell>{p.quantidade}</TableCell>
                  <TableCell>{p.minimo}</TableCell>
                  <TableCell>{p.preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</TableCell>
                  <TableCell>{statusBadge(p)}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" onClick={() => setEditProduto(p)}>
                      <Pencil className="w-4 h-4" /> Editar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal Novo Produto estilo wizard */}
      <Dialog open={showNovoProduto} onOpenChange={setShowNovoProduto}>
        <DialogContent>
          <DialogHeader><DialogTitle>Adicionar Produto</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <h3 className="font-semibold">📝 Informações básicas</h3>
            <Input placeholder="Nome" value={novoProduto.nome} onChange={(e) => setNovoProduto({ ...novoProduto, nome: e.target.value })} />
            <Input placeholder="Categoria" value={novoProduto.categoria} onChange={(e) => setNovoProduto({ ...novoProduto, categoria: e.target.value })} />

            <h3 className="font-semibold">📦 Estoque</h3>
            <div className="grid grid-cols-2 gap-2">
              <Input type="number" placeholder="Quantidade" value={novoProduto.quantidade} onChange={(e) => setNovoProduto({ ...novoProduto, quantidade: e.target.value })} />
              <Input type="number" placeholder="Mínimo" value={novoProduto.minimo} onChange={(e) => setNovoProduto({ ...novoProduto, minimo: e.target.value })} />
            </div>

            <h3 className="font-semibold">💰 Preço</h3>
            <Input type="number" placeholder="Preço (R$)" value={novoProduto.preco} onChange={(e) => setNovoProduto({ ...novoProduto, preco: e.target.value })} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNovoProduto(false)}>Cancelar</Button>
            <Button>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
