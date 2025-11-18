"use client"

import { useMemo, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableCell, TableBody } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Download, Plus, Pencil, Trash2, Eye, Minus, PlusCircle } from "lucide-react"

// Mock inicial com detalhes extras
export const estoqueMock = [
  {
    id: 1,
    codigo: "AP-001",
    nome: "Filtro de Óleo",
    categoria: "Motor",
    quantidade: 15,
    minimo: 5,
    preco: 35,
    descricao: "Filtro de óleo compatível com motores 1.6 e 2.0",
    lote: "L2025-01",
    estado: "Novo",
    notaFiscal: "NF-12345",
    fornecedor: "Bosch",
    validade: "2026-05-10",
    localizacao: "Prateleira A1",
    foto: "/images/filtro-oleo.jpg",
    movimentacoes: [
      { tipo: "Entrada", qtd: 20, usuario: "Carlos", data: "2025-11-01" },
      { tipo: "Saída", qtd: 5, usuario: "Maria", data: "2025-11-10" },
    ],
  },
  {
    id: 2,
    codigo: "AP-002",
    nome: "Pastilha de Freio",
    categoria: "Freios",
    quantidade: 3,
    minimo: 10,
    preco: 120,
    descricao: "Pastilha de freio dianteira para veículos médios",
    lote: "L2025-02",
    estado: "Novo",
    notaFiscal: "NF-12346",
    fornecedor: "Cobreq",
    validade: "2026-01-20",
    localizacao: "Prateleira B3",
    foto: "/images/pastilha-freio.jpg",
    movimentacoes: [
      { tipo: "Entrada", qtd: 10, usuario: "João", data: "2025-10-15" },
      { tipo: "Saída", qtd: 7, usuario: "Ana", data: "2025-11-05" },
    ],
  },
  {
    id: 3,
    codigo: "AP-003",
    nome: "Amortecedor Dianteiro",
    categoria: "Suspensão",
    quantidade: 0,
    minimo: 2,
    preco: 450,
    descricao: "Amortecedor dianteiro para linha hatch 2015-2020",
    lote: "L2025-03",
    estado: "Novo",
    notaFiscal: "NF-12347",
    fornecedor: "Monroe",
    validade: "2027-03-01",
    localizacao: "Prateleira C2",
    foto: "/images/amortecedor.jpg",
    movimentacoes: [
      { tipo: "Entrada", qtd: 2, usuario: "Paulo", data: "2025-09-22" },
      { tipo: "Saída", qtd: 2, usuario: "Paulo", data: "2025-10-02" },
    ],
  },
]

export default function EstoquePage() {
  const [produtos, setProdutos] = useState(estoqueMock)
  const [busca, setBusca] = useState("")
  const [filtroCategoria, setFiltroCategoria] = useState("todas")
  const [filtroEstado, setFiltroEstado] = useState("todos")
  const [filtroFornecedor, setFiltroFornecedor] = useState("todos")

  const [detalhesProduto, setDetalhesProduto] = useState(null)
  const [editProduto, setEditProduto] = useState(null)
  const [deleteId, setDeleteId] = useState(null)

  // Filtros dinâmicos
  const categorias = useMemo(() => Array.from(new Set(produtos.map(p => p.categoria))), [produtos])
  const fornecedores = useMemo(() => Array.from(new Set(produtos.map(p => p.fornecedor))), [produtos])

  const produtosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return produtos.filter(p => {
      const matchBusca =
        !termo ||
        p.nome.toLowerCase().includes(termo) ||
        p.categoria.toLowerCase().includes(termo) ||
        p.codigo.toLowerCase().includes(termo)
      const matchCategoria = filtroCategoria === "todas" || p.categoria === filtroCategoria
      const matchEstado = filtroEstado === "todos" || p.estado === filtroEstado
      const matchFornecedor = filtroFornecedor === "todos" || p.fornecedor === filtroFornecedor
      return matchBusca && matchCategoria && matchEstado && matchFornecedor
    })
  }, [produtos, busca, filtroCategoria, filtroEstado, filtroFornecedor])

  // Resumo
  const resumo = useMemo(() => {
    const total = produtos.reduce((acc, p) => acc + (Number(p.quantidade) || 0), 0)
    const emFalta = produtos.filter((p) => Number(p.quantidade) === 0).length
    const abaixoMinimo = produtos.filter((p) => Number(p.quantidade) > 0 && Number(p.quantidade) < Number(p.minimo)).length
    return { total, emFalta, abaixoMinimo }
  }, [produtos])

  // Status visual
  const StatusBadge = ({ p }) => {
    if (Number(p.quantidade) === 0) return <Badge variant="destructive">Falta</Badge>
    if (Number(p.quantidade) < Number(p.minimo)) return <Badge variant="secondary">Abaixo</Badge>
    return <Badge variant="outline">OK</Badge>
  }

  // Exportação CSV
  const exportCSV = () => {
    const header = ["Código", "Nome", "Categoria", "Quantidade", "Mínimo", "Preço", "Estado", "Fornecedor", "Validade", "Lote", "NF", "Localização"]
    const rows = produtosFiltrados.map((p) => [
      p.codigo, p.nome, p.categoria, p.quantidade, p.minimo, p.preco, p.estado, p.fornecedor, p.validade, p.lote, p.notaFiscal, p.localizacao,
    ])
    const csvContent = [header, ...rows].map((e) => e.join(";")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", "estoque_autopecas.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Ajuste rápido de estoque
  const ajustarEstoque = (id, delta) => {
    setProdutos(prev =>
      prev.map(p => p.id === id ? { ...p, quantidade: Math.max(0, p.quantidade + delta) } : p)
    )
  }

  // Edição
  const salvarEdicao = () => {
    if (!editProduto) return
    const atual = {
      ...editProduto,
      quantidade: Number(editProduto.quantidade) || 0,
      minimo: Number(editProduto.minimo) || 0,
      preco: Number(editProduto.preco) || 0,
    }
    setProdutos(prev => prev.map(p => p.id === atual.id ? atual : p))
    setEditProduto(null)
  }

  // Exclusão
  const confirmarExclusao = () => {
    if (!deleteId) return
    setProdutos(prev => prev.filter(p => p.id !== deleteId))
    setDeleteId(null)
  }

  return (
    <div className="p-6 space-y-8">
      {/* Resumo */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Total em estoque</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">{resumo.total}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Peças em falta</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">{resumo.emFalta}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Abaixo do mínimo</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">{resumo.abaixoMinimo}</CardContent>
        </Card>
      </div>

      {/* Busca + filtros + ações */}
      <Card>
        <CardHeader><CardTitle>Filtros</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col md:flex-row gap-3">
            <Input
              placeholder="Buscar por código, nome ou categoria..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="md:max-w-xs"
            />
            <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Categoria" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                {categorias.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filtroEstado} onValueChange={setFiltroEstado}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Estado" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="Novo">Novo</SelectItem>
                <SelectItem value="Usado">Usado</SelectItem>
                <SelectItem value="Recondicionado">Recondicionado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filtroFornecedor} onValueChange={setFiltroFornecedor}>
              <SelectTrigger className="w-44"><SelectValue placeholder="Fornecedor" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {fornecedores.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportCSV}>
              <Download className="w-4 h-4" /> Exportar
            </Button>
            <Button onClick={() => setEditProduto({
              id: Math.max(0, ...produtos.map(p => p.id)) + 1,
              codigo: "",
              nome: "",
              categoria: "",
              quantidade: 0,
              minimo: 0,
              preco: 0,
              descricao: "",
              lote: "",
              estado: "Novo",
              notaFiscal: "",
              fornecedor: "",
              validade: "",
              localizacao: "",
              foto: "",
              movimentacoes: [],
              _novo: true, // flag para diferenciar criação
            })}>
              <Plus className="w-4 h-4" /> Nova peça
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardHeader><CardTitle>Estoque de autopeças</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Peça</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-right">Qtd</TableHead>
                <TableHead className="text-right">Mínimo</TableHead>
                <TableHead className="text-right">Preço</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {produtosFiltrados.map((p) => (
                <TableRow key={p.id} className="cursor-pointer" onClick={() => setDetalhesProduto(p)}>
                  <TableCell className="font-mono">{p.codigo}</TableCell>
                  <TableCell className="font-medium">{p.nome}</TableCell>
                  <TableCell>{p.categoria}</TableCell>
                  <TableCell className="text-right">{p.quantidade}</TableCell>
                  <TableCell className="text-right">{p.minimo}</TableCell>
                  <TableCell className="text-right">
                    {Number(p.preco).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </TableCell>
                  <TableCell><StatusBadge p={p} /></TableCell>
                  <TableCell className="text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                    <Button size="sm" variant="outline" onClick={() => setDetalhesProduto(p)}>
                      <Eye className="w-4 h-4" /> Detalhes
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => ajustarEstoque(p.id, +1)}>
                      <PlusCircle className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => ajustarEstoque(p.id, -1)}>
                      <Minus className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditProduto(p)}>
                      <Pencil className="w-4 h-4" /> Editar
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => setDeleteId(p.id)}>
                      <Trash2 className="w-4 h-4" /> Excluir
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {produtosFiltrados.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    Nenhuma peça encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal de detalhes */}
      <Dialog open={!!detalhesProduto} onOpenChange={(o) => setDetalhesProduto(o ? detalhesProduto : null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader><DialogTitle>Detalhes da peça</DialogTitle></DialogHeader>
          {detalhesProduto && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  {detalhesProduto.foto ? (
                    <img src={detalhesProduto.foto} alt={detalhesProduto.nome} className="w-full h-48 object-contain border rounded" />
                  ) : (
                    <div className="w-full h-48 border rounded flex items-center justify-center text-muted-foreground">
                      Sem foto
                    </div>
                  )}
                </div>
                <div className="md:col-span-2 space-y-2">
                  <p><strong>Código:</strong> {detalhesProduto.codigo}</p>
                  <p><strong>Nome:</strong> {detalhesProduto.nome}</p>
                  <p><strong>Categoria:</strong> {detalhesProduto.categoria}</p>
                  <p><strong>Descrição:</strong> {detalhesProduto.descricao || "-"}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <p><strong>Lote:</strong> {detalhesProduto.lote || "-"}</p>
                    <p><strong>Estado:</strong> {detalhesProduto.estado || "-"}</p>
                    <p><strong>Nota Fiscal:</strong> {detalhesProduto.notaFiscal || "-"}</p>
                    <p><strong>Fornecedor:</strong> {detalhesProduto.fornecedor || "-"}</p>
                    <p><strong>Validade:</strong> {detalhesProduto.validade || "-"}</p>
                    <p><strong>Localização:</strong> {detalhesProduto.localizacao || "-"}</p>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-3 gap-2">
                    <p><strong>Quantidade:</strong> {detalhesProduto.quantidade}</p>
                    <p><strong>Mínimo:</strong> {detalhesProduto.minimo}</p>
                    <p><strong>Preço:</strong> {Number(detalhesProduto.preco).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
                  </div>
                </div>
              </div>
              <div>
                <p className="font-semibold mb-2">Movimentações</p>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="text-right">Qtd</TableHead>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(detalhesProduto.movimentacoes || []).map((m, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{m.tipo}</TableCell>
                        <TableCell className="text-right">{m.qtd}</TableCell>
                        <TableCell>{m.usuario}</TableCell>
                        <TableCell>{m.data}</TableCell>
                      </TableRow>
                    ))}
                    {(!detalhesProduto.movimentacoes || detalhesProduto.movimentacoes.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                          Sem movimentações registradas.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetalhesProduto(null)}>Fechar</Button>
            <Button onClick={() => { setEditProduto(detalhesProduto); setDetalhesProduto(null) }}>Editar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de edição / criação */}
      <Dialog open={!!editProduto} onOpenChange={(o) => setEditProduto(o ? editProduto : null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader><DialogTitle>{editProduto?._novo ? "Nova peça" : "Editar peça"}</DialogTitle></DialogHeader>
          {editProduto && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold">Dados</p>
                <Separator className="my-2" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <Input placeholder="Código" value={editProduto.codigo} onChange={(e) => setEditProduto({ ...editProduto, codigo: e.target.value })} />
                  <Input placeholder="Nome" value={editProduto.nome} onChange={(e) => setEditProduto({ ...editProduto, nome: e.target.value })} />
                  <Input placeholder="Categoria" value={editProduto.categoria} onChange={(e) => setEditProduto({ ...editProduto, categoria: e.target.value })} />
                </div>
                <Input className="mt-2" placeholder="Descrição" value={editProduto.descricao || ""} onChange={(e) => setEditProduto({ ...editProduto, descricao: e.target.value })} />
              </div>
              <div>
                <p className="text-sm font-semibold">Estoque</p>
                <Separator className="my-2" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <Input type="number" placeholder="Quantidade" value={editProduto.quantidade} onChange={(e) => setEditProduto({ ...editProduto, quantidade: e.target.value })} />
                  <Input type="number" placeholder="Mínimo" value={editProduto.minimo} onChange={(e) => setEditProduto({ ...editProduto, minimo: e.target.value })} />
                  <Input type="number" placeholder="Preço unitário (R$)" value={editProduto.preco} onChange={(e) => setEditProduto({ ...editProduto, preco: e.target.value })} />
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold">Logística</p>
                <Separator className="my-2" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <Input placeholder="Lote" value={editProduto.lote || ""} onChange={(e) => setEditProduto({ ...editProduto, lote: e.target.value })} />
                  <Input placeholder="Estado (Novo/Usado/Recondicionado)" value={editProduto.estado || ""} onChange={(e) => setEditProduto({ ...editProduto, estado: e.target.value })} />
                  <Input placeholder="Nota Fiscal" value={editProduto.notaFiscal || ""} onChange={(e) => setEditProduto({ ...editProduto, notaFiscal: e.target.value })} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                  <Input placeholder="Fornecedor" value={editProduto.fornecedor || ""} onChange={(e) => setEditProduto({ ...editProduto, fornecedor: e.target.value })} />
                  <Input placeholder="Validade (YYYY-MM-DD)" value={editProduto.validade || ""} onChange={(e) => setEditProduto({ ...editProduto, validade: e.target.value })} />
                  <Input placeholder="Localização (ex: Prateleira A1)" value={editProduto.localizacao || ""} onChange={(e) => setEditProduto({ ...editProduto, localizacao: e.target.value })} />
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold">Foto</p>
                <Separator className="my-2" />
                <Input placeholder="URL da foto" value={editProduto.foto || ""} onChange={(e) => setEditProduto({ ...editProduto, foto: e.target.value })} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditProduto(null)}>Cancelar</Button>
            <Button onClick={() => {
              if (editProduto?._novo) {
                setProdutos(prev => [...prev, { ...editProduto, _novo: undefined }])
                setEditProduto(null)
              } else {
                salvarEdicao()
              }
            }}>
              {editProduto?._novo ? "Criar peça" : "Salvar alterações"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal confirmação de exclusão */}
      <Dialog open={deleteId != null} onOpenChange={(o) => setDeleteId(o ? deleteId : null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Excluir peça</DialogTitle></DialogHeader>
          <p>Tem certeza que deseja excluir esta peça do estoque? Esta ação não pode ser desfeita.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={confirmarExclusao}>Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
