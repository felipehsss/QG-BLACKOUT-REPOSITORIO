"use client"

import { useMemo, useState, useEffect } from "react"
// ... imports de UI ...
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableCell, TableBody } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Download, Plus, Pencil, Trash2, Eye, Minus, PlusCircle, Search, Loader2, Image as ImageIcon } from "lucide-react"
import { toast } from "sonner"
import { Label } from "@/components/ui/label"

import { useAuth } from "@/contexts/AuthContext"
import * as produtoService from "@/services/produtoService"
import * as estoqueService from "@/services/estoqueService"
import * as fornecedorService from "@/services/fornecedorService"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3080/api';
const BASE_URL = API_URL.replace('/api', '');

export default function EstoquePage() {
  const { token, user } = useAuth()
  
  const [produtos, setProdutos] = useState([])
  const [fornecedores, setFornecedores] = useState([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState("")
  const [filtroCategoria, setFiltroCategoria] = useState("todas")
  const [filtroFornecedor, setFiltroFornecedor] = useState("todos")
  
  const [detalhesProduto, setDetalhesProduto] = useState(null)
  const [editProduto, setEditProduto] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [loadingAction, setLoadingAction] = useState(false)

  useEffect(() => {
    if (token) {
      carregarDados()
    }
  }, [token])

  const carregarDados = async () => {
    setLoading(true)
    try {
      // Passando o TOKEN corretamente aqui
      const [resProdutos, resEstoque, resFornecedores] = await Promise.all([
        produtoService.readAll(token),
        estoqueService.getEstoqueCompleto(token).catch(() => []), 
        fornecedorService.readAll ? fornecedorService.readAll(token).catch(() => []) : Promise.resolve([])
      ])

      const listaProdutos = Array.isArray(resProdutos) ? resProdutos : (resProdutos.data || [])
      const listaEstoque = Array.isArray(resEstoque) ? resEstoque : []
      
      if (Array.isArray(resFornecedores) && resFornecedores.length > 0) {
         setFornecedores(resFornecedores)
      }

      const lojaId = user?.loja_id || 1
      const dadosMesclados = listaProdutos.map(p => {
        const pId = p.id || p.produto_id || p._id
        const est = listaEstoque.find(e => e.produto_id === pId && e.loja_id === lojaId)
        
        return {
          ...p,
          id: pId,
          quantidade: est ? Number(est.quantidade) : 0,
          minimo: 5, 
          preco: Number(p.preco_venda || p.preco || 0),
          fotoUrl: p.foto ? `${BASE_URL}/uploads/${p.foto}` : null,
          codigo: p.sku || "S/N",
          categoria: p.categoria || "Geral",
          fornecedor: p.nome_fornecedor || "Não informado",
          marca: p.marca || ""
        }
      })

      setProdutos(dadosMesclados)
    } catch (error) {
      console.error(error)
      toast.error("Erro ao carregar estoque.")
    } finally {
      setLoading(false)
    }
  }

  const ajustarEstoque = async (produto, delta) => {
    try {
      // Passando o TOKEN corretamente
      await estoqueService.darEntradaEstoque({
        produto_id: produto.id,
        loja_id: user?.loja_id || 1,
        quantidade: delta 
      }, token)

      toast.success(`Estoque ${delta > 0 ? 'adicionado' : 'reduzido'}.`)
      carregarDados() 
    } catch (error) {
      toast.error("Erro ao ajustar estoque.")
    }
  }

  const salvarProduto = async () => {
    if (!editProduto.nome || !editProduto.sku || !editProduto.preco) {
      toast.error("Preencha Nome, SKU e Preço.")
      return
    }
    setLoadingAction(true)
    try {
      const payload = {
        ...editProduto,
        preco_venda: editProduto.preco,
      }

      if (editProduto._novo) {
        await produtoService.create(payload, token)
        toast.success("Produto criado!")
      } else {
        await produtoService.update(editProduto.id, payload, token)
        toast.success("Produto atualizado!")
      }
      setEditProduto(null)
      carregarDados()
    } catch (error) {
      toast.error("Erro ao salvar.")
    } finally {
      setLoadingAction(false)
    }
  }

  const confirmarExclusao = async () => {
    if (!deleteId) return
    setLoadingAction(true)
    try {
      await produtoService.deleteRecord(deleteId, token)
      toast.success("Produto removido.")
      carregarDados()
      setDeleteId(null)
    } catch (error) {
      toast.error("Erro ao excluir.")
    } finally {
      setLoadingAction(false)
    }
  }

  const exportCSV = () => {
    const header = ["Código", "Produto", "Categoria", "Fornecedor", "Qtd", "Preço"]
    const rows = produtosFiltrados.map(p => [
      p.codigo, p.nome, p.categoria, p.fornecedor, p.quantidade, p.preco.toFixed(2).replace('.', ',')
    ])
    const csvContent = [header, ...rows].map(e => e.join(";")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `estoque.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const categorias = useMemo(() => Array.from(new Set(produtos.map(p => p.categoria).filter(Boolean))), [produtos])
  const listaFornecedores = useMemo(() => {
     if (fornecedores.length > 0) return fornecedores.map(f => f.nome_fantasia || f.nome);
     return Array.from(new Set(produtos.map(p => p.fornecedor).filter(f => f !== "Não informado")))
  }, [produtos, fornecedores])

  const produtosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return produtos.filter(p => {
      const matchBusca = !termo || (p.nome || "").toLowerCase().includes(termo) || (p.codigo || "").toLowerCase().includes(termo)
      const matchCat = filtroCategoria === "todas" || p.categoria === filtroCategoria
      const matchForn = filtroFornecedor === "todos" || p.fornecedor === filtroFornecedor
      return matchBusca && matchCat && matchForn
    })
  }, [produtos, busca, filtroCategoria, filtroFornecedor])

  const StatusBadge = ({ p }) => {
    if (p.quantidade <= 0) return <Badge variant="destructive">Falta</Badge>
    if (p.quantidade < p.minimo) return <Badge className="bg-amber-500 hover:bg-amber-600">Baixo</Badge>
    return <Badge variant="outline" className="text-green-600 border-green-600">OK</Badge>
  }

  return (
    <div className="p-6 space-y-8 h-[calc(100vh-80px)] overflow-y-auto">
      {/* ... (Resto do JSX permanece igual, a lógica já foi corrigida acima) ... */}
      {/* Vou renderizar apenas o início para confirmar a estrutura, o restante é visual */}
       <Card>
        <CardHeader><CardTitle>Gerenciar Estoque</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative w-full md:w-64">
               <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
               <Input placeholder="Buscar produto..." value={busca} onChange={(e) => setBusca(e.target.value)} className="pl-9" />
            </div>
            <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Categoria" /></SelectTrigger>
              <SelectContent><SelectItem value="todas">Todas Categorias</SelectItem>{categorias.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={filtroFornecedor} onValueChange={setFiltroFornecedor}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Fornecedor" /></SelectTrigger>
              <SelectContent><SelectItem value="todos">Todos Fornecedores</SelectItem>{listaFornecedores.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportCSV}><Download className="w-4 h-4 mr-2" /> CSV</Button>
            
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">Foto</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead className="text-right">Estoque</TableHead>
                <TableHead className="text-right">Mín</TableHead>
                <TableHead className="text-right">Preço</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={9} className="h-24 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></TableCell></TableRow>
              ) : produtosFiltrados.length === 0 ? (
                <TableRow><TableCell colSpan={9} className="h-24 text-center text-muted-foreground">Nenhum registro.</TableCell></TableRow>
              ) : (
                produtosFiltrados.map((p) => (
                  <TableRow key={p.id} className="group">
                    <TableCell>
                      <div className="h-9 w-9 rounded border bg-muted flex items-center justify-center overflow-hidden">
                        {p.fotoUrl ? <img src={p.fotoUrl} alt="" className="h-full w-full object-cover" /> : <ImageIcon className="w-4 h-4 opacity-20" />}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{p.codigo}</TableCell>
                    <TableCell className="font-medium">{p.nome}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{p.fornecedor}</TableCell>
                    <TableCell className="text-right font-bold">{p.quantidade}</TableCell>
                    <TableCell className="text-right text-muted-foreground text-xs">{p.minimo}</TableCell>
                    <TableCell className="text-right">{p.preco.toFixed(2)}</TableCell>
                    <TableCell className="text-center"><StatusBadge p={p} /></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setDetalhesProduto(p)}><Eye className="w-4 h-4" /></Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-green-600" onClick={() => ajustarEstoque(p, 1)}><PlusCircle className="w-4 h-4" /></Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-orange-600" onClick={() => ajustarEstoque(p, -1)}><Minus className="w-4 h-4" /></Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditProduto({...p, sku: p.codigo, preco: p.preco})}><Pencil className="w-4 h-4" /></Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => setDeleteId(p.id)}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Modais de Detalhes, Edição e Exclusão devem ser mantidos aqui no final do componente, iguais ao exemplo anterior */}
       <Dialog open={!!detalhesProduto} onOpenChange={() => setDetalhesProduto(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{detalhesProduto?.nome}</DialogTitle></DialogHeader>
          {detalhesProduto && (
             <div className="flex gap-4">
                <div className="w-32 h-32 bg-muted rounded flex items-center justify-center overflow-hidden border">
                   {detalhesProduto.fotoUrl ? <img src={detalhesProduto.fotoUrl} className="w-full h-full object-cover" /> : <ImageIcon className="w-12 h-12 opacity-20" />}
                </div>
                <div className="space-y-1 text-sm flex-1">
                   <p><strong>Código:</strong> {detalhesProduto.codigo}</p>
                   <p><strong>Categoria:</strong> {detalhesProduto.categoria}</p>
                   <p><strong>Fornecedor:</strong> {detalhesProduto.fornecedor}</p>
                   <Separator className="my-2"/>
                   <div className="flex justify-between">
                      <span>Estoque: <strong>{detalhesProduto.quantidade}</strong></span>
                      <span>Preço: <strong>R$ {detalhesProduto.preco.toFixed(2)}</strong></span>
                   </div>
                </div>
             </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!editProduto} onOpenChange={() => setEditProduto(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editProduto?._novo ? "Novo Produto" : "Editar Produto"}</DialogTitle></DialogHeader>
          {editProduto && (
             <div className="grid gap-4 py-4">
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>SKU *</Label><Input value={editProduto.sku} onChange={e=>setEditProduto({...editProduto, sku:e.target.value})} /></div>
                  <div className="space-y-2"><Label>Categoria</Label><Input value={editProduto.categoria} onChange={e=>setEditProduto({...editProduto, categoria:e.target.value})} /></div>
               </div>
               <div className="space-y-2"><Label>Nome *</Label><Input value={editProduto.nome} onChange={e=>setEditProduto({...editProduto, nome:e.target.value})} /></div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Marca</Label><Input value={editProduto.marca || ""} onChange={e=>setEditProduto({...editProduto, marca:e.target.value})} /></div>
                  <div className="space-y-2"><Label>Preço Venda *</Label><Input type="number" value={editProduto.preco} onChange={e=>setEditProduto({...editProduto, preco:e.target.value})} /></div>
               </div>
             </div>
          )}
          <DialogFooter>
             <Button variant="outline" onClick={() => setEditProduto(null)}>Cancelar</Button>
             <Button onClick={salvarProduto} disabled={loadingAction}>{loadingAction ? "Salvando..." : "Salvar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="max-w-sm">
           <DialogHeader><DialogTitle>Excluir?</DialogTitle></DialogHeader>
           <p>Tem certeza? Isso pode afetar o histórico de vendas.</p>
           <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteId(null)}>Não</Button>
              <Button variant="destructive" onClick={confirmarExclusao}>Sim, Excluir</Button>
           </DialogFooter>
        </DialogContent>
      </Dialog>z
    </div>
  )
}