"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableCell, TableBody } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Loader2, Package, Building2, Download, RefreshCw } from "lucide-react"
import { toast } from "sonner"

// Contexto e Serviços
import { useAuth } from "@/contexts/AuthContext"
import * as estoqueService from "@/services/estoqueService"
// Se você tiver um service de lojas, importe aqui. Caso contrário, extrairemos as lojas do próprio estoque.

export default function EstoqueMatrizPage() {
  const { token } = useAuth()
  
  const [estoque, setEstoque] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Filtros
  const [busca, setBusca] = useState("")
  const [filtroLoja, setFiltroLoja] = useState("todas")

  // Carregar Dados
  useEffect(() => {
    if (token) {
      carregarEstoque()
    }
  }, [token])

  const carregarEstoque = async () => {
    setLoading(true)
    try {
      // getEstoqueCompleto retorna o JOIN com lojas e produtos
      const dados = await estoqueService.getEstoqueCompleto(token)
      setEstoque(Array.isArray(dados) ? dados : [])
    } catch (error) {
      console.error(error)
      toast.error("Erro ao carregar estoque da rede.")
    } finally {
      setLoading(false)
    }
  }

  // Extrair lista de lojas única baseada nos dados retornados
  const lojas = useMemo(() => {
    const nomes = estoque.map(item => item.loja_nome).filter(Boolean)
    return Array.from(new Set(nomes))
  }, [estoque])

  // Filtragem
  const estoqueFiltrado = useMemo(() => {
    const termo = busca.toLowerCase()
    return estoque.filter(item => {
      const matchNome = (item.produto_nome || "").toLowerCase().includes(termo)
      const matchSku = (item.sku || "").toLowerCase().includes(termo)
      const matchLoja = filtroLoja === "todas" || item.loja_nome === filtroLoja
      
      return (matchNome || matchSku) && matchLoja
    })
  }, [estoque, busca, filtroLoja])

  // Resumo
  const resumo = useMemo(() => {
    const totalItens = estoqueFiltrado.reduce((acc, item) => acc + Number(item.quantidade), 0)
    const valorEstimado = 0 // Se o endpoint trouxer preço, podemos calcular: qtd * custo
    const lojasAtivas = new Set(estoqueFiltrado.map(i => i.loja_nome)).size
    return { totalItens, lojasAtivas }
  }, [estoqueFiltrado])

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Visão Geral de Estoque</h1>
          <p className="text-muted-foreground">Monitoramento de estoque de todas as filiais.</p>
        </div>
        <Button variant="outline" onClick={carregarEstoque} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Peças (Visível)</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resumo.totalItens}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lojas Monitoradas</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resumo.lojasAtivas}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Tabela */}
      <Card>
        <CardHeader>
          <CardTitle>Inventário da Rede</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar por produto ou SKU..." 
                className="pl-9" 
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
            <Select value={filtroLoja} onValueChange={setFiltroLoja}>
              <SelectTrigger className="w-full md:w-[250px]">
                <SelectValue placeholder="Filtrar por Loja" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as Lojas</SelectItem>
                {lojas.map(loja => (
                  <SelectItem key={loja} value={loja}>{loja}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="secondary">
              <Download className="w-4 h-4 mr-2" /> Exportar CSV
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Loja</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead className="text-right">Quantidade</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : estoqueFiltrado.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      Nenhum registro encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  estoqueFiltrado.map((item) => (
                    <TableRow key={item.estoque_id}>
                      <TableCell className="font-medium">{item.loja_nome}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{item.sku}</TableCell>
                      <TableCell>{item.produto_nome}</TableCell>
                      <TableCell className="text-right font-bold text-base">
                        {item.quantidade}
                      </TableCell>
                      <TableCell className="text-center">
                        {item.quantidade <= 0 ? (
                          <Badge variant="destructive">Zerado</Badge>
                        ) : item.quantidade < 5 ? (
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Baixo</Badge>
                        ) : (
                          <Badge variant="outline" className="text-green-600 border-green-600">Normal</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}