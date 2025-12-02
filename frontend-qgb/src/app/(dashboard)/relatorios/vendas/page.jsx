"use client"

import { useState, useMemo, useEffect } from "react"
import { File, ListFilter, ChevronLeft, ChevronRight, Search, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle
} from "@/components/ui/card"
import {
  DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DateRangePicker } from "@/components/date-range-picker"
import { Input } from "@/components/ui/input"
import { isWithinInterval, parseISO, format } from "date-fns"
import { ptBR } from "date-fns/locale"

// Integração com Backend
import { useAuth } from "@/contexts/AuthContext"
import { getRelatorioVendas } from "@/services/vendaService"

export default function RelatorioVendas() {
  const { token } = useAuth()
  const [salesData, setSalesData] = useState([])
  const [loading, setLoading] = useState(true)
  
  const [statusFilter, setStatusFilter] = useState(["Concluída", "Pendente", "Cancelada"])
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(1)
  const pageSize = 10 

  // Padrão: Mês atual
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
  })

  // Buscar dados do backend
  useEffect(() => {
    async function fetchVendas() {
      if (!token) return;
      
      try {
        setLoading(true)
        const response = await getRelatorioVendas(token)
        
        if (response && response.vendas) {
          // Mapeamento dos dados vindos do SQL
          const formattedData = response.vendas.map(v => ({
            id: v.venda_id, 
            // Gera uma chave única pois o ID da venda repete para cada item
            uniqueKey: `${v.venda_id}-${v.produto_nome || Math.random()}`, 
            data: v.data_venda,
            cliente: v.cliente_nome || "Balcão",
            produto: v.produto_nome || "Item removido",
            // Proteção || 0 evita o erro NaN se o banco retornar null
            quantidade: Number(v.quantidade || 0), 
            valorUnitario: Number(v.valor_unitario || 0),
            valorTotal: Number(v.item_total || 0), 
            status: v.status_venda || "Concluída"
          }))
          setSalesData(formattedData)
        }
      } catch (error) {
        console.error("Erro ao buscar relatório de vendas:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchVendas()
  }, [token])

  // Lógica de Filtragem
  const vendasFiltradas = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    
    return salesData.filter((v) => {
      // Tratamento robusto de data
      let dataVenda = new Date()
      if (v.data) {
        // Tenta converter string ISO ou Date object
        const d = new Date(v.data)
        if (!isNaN(d)) dataVenda = d
      }

      const dentroDoPeriodo =
        dateRange?.from && dateRange?.to
          ? isWithinInterval(dataVenda, { start: dateRange.from, end: dateRange.to })
          : true
      
      const statusOK = statusFilter.includes(v.status)
      
      const buscaOK =
        term.length === 0 ||
        (v.cliente && v.cliente.toLowerCase().includes(term)) ||
        (v.produto && v.produto.toLowerCase().includes(term)) ||
        String(v.id).includes(term)

      return dentroDoPeriodo && statusOK && buscaOK
    })
  }, [dateRange, statusFilter, searchTerm, salesData])

  // Paginação
  const totalPages = Math.ceil(vendasFiltradas.length / pageSize) || 1
  const vendasPaginadas = vendasFiltradas.slice((page - 1) * pageSize, page * pageSize)

  // Cálculos de KPIs (Totais)
  // Usamos um Set para contar Vendas únicas (pois a lista contém itens)
  const uniqueSalesIds = new Set(vendasFiltradas.map(v => v.id))
  const totalVendasCount = uniqueSalesIds.size
  
  const valorTotalSum = vendasFiltradas.reduce((acc, v) => acc + (v.valorTotal || 0), 0)
  const ticketMedio = totalVendasCount > 0 ? valorTotalSum / totalVendasCount : 0

  // Agrupamento por Cliente
  const vendasPorCliente = useMemo(() => {
    const mapa = new Map()
    vendasFiltradas.forEach((v) => {
      const prev = mapa.get(v.cliente) || { vendasSet: new Set(), quantidade: 0, total: 0 }
      prev.vendasSet.add(v.id)
      mapa.set(v.cliente, {
        vendasSet: prev.vendasSet,
        quantidade: prev.quantidade + (v.quantidade || 0),
        total: prev.total + (v.valorTotal || 0),
      })
    })
    return Array.from(mapa.entries()).map(([cliente, dados]) => ({ 
      cliente, 
      vendas: dados.vendasSet.size,
      quantidade: dados.quantidade,
      total: dados.total 
    })).sort((a, b) => b.total - a.total)
  }, [vendasFiltradas])

  // Agrupamento por Produto
  const rankingProdutos = useMemo(() => {
    const mapa = new Map()
    vendasFiltradas.forEach((v) => {
      const prev = mapa.get(v.produto) || { vendasSet: new Set(), quantidade: 0, total: 0 }
      prev.vendasSet.add(v.id)
      mapa.set(v.produto, {
        vendasSet: prev.vendasSet,
        quantidade: prev.quantidade + (v.quantidade || 0),
        total: prev.total + (v.valorTotal || 0),
      })
    })
    return Array.from(mapa.entries()).map(([produto, dados]) => ({ 
      produto, 
      vendas: dados.vendasSet.size,
      quantidade: dados.quantidade,
      total: dados.total 
    })).sort((a, b) => b.total - a.total)
  }, [vendasFiltradas])

  // Exportar CSV
  const exportCSV = () => {
    const header = ["ID Venda", "Data", "Cliente", "Produto", "Qtd", "Vlr Unit", "Vlr Total", "Status"]
    const rows = vendasFiltradas.map(v => [
      v.id, 
      v.data ? format(new Date(v.data), "dd/MM/yyyy") : "", 
      v.cliente, 
      v.produto, 
      v.quantidade, 
      (v.valorUnitario || 0).toFixed(2).replace('.', ','), 
      (v.valorTotal || 0).toFixed(2).replace('.', ','), 
      v.status
    ])
    const csvContent = [header, ...rows].map(e => e.join(";")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", "relatorio_vendas.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const toggleStatus = (status) => {
    setStatusFilter((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    )
    setPage(1)
  }

  const prevPage = () => setPage((p) => Math.max(1, p - 1))
  const nextPage = () => setPage((p) => Math.min(totalPages, p + 1))

  return (
    <div className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Tabs defaultValue="detalhado">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <DateRangePicker
            initialDateFrom={dateRange.from}
            initialDateTo={dateRange.to}
            align="start"
            locale={ptBR}
            showCompare={false}
            onUpdate={({ range }) => {
              setDateRange(range)
              setPage(1)
            }}
          />
          <div className="flex items-center gap-2 w-full max-w-xs">
            <Input
              placeholder="Buscar por ID, cliente ou produto..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setPage(1)
              }}
            />
            <Search className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1">
                  <ListFilter className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Filtrar</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filtrar por Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {["Concluída", "Pendente", "Cancelada"].map((status) => (
                  <DropdownMenuCheckboxItem
                    key={status}
                    checked={statusFilter.includes(status)}
                    onCheckedChange={() => toggleStatus(status)}
                  >
                    {status}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button size="sm" variant="outline" className="h-8 gap-1" onClick={exportCSV}>
              <File className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Exportar CSV</span>
            </Button>
          </div>
        </div>

        {/* Tabs List */}
        <div className="flex items-center mt-4">
          <TabsList>
            <TabsTrigger value="detalhado">Detalhado</TabsTrigger>
            <TabsTrigger value="por-cliente">Por cliente</TabsTrigger>
            <TabsTrigger value="por-produto">Por produto</TabsTrigger>
          </TabsList>
        </div>

        {/* Tab: Detalhado */}
        <TabsContent value="detalhado">
          <Card>
            <CardHeader>
              <CardTitle>Relatório de Vendas</CardTitle>
              <CardDescription>Histórico detalhado de itens vendidos no período.</CardDescription>
            </CardHeader>
            <CardContent>
              {/* KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total de Vendas</CardTitle></CardHeader>
                  <CardContent className="text-2xl font-bold">{totalVendasCount}</CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Valor Total</CardTitle></CardHeader>
                  <CardContent className="text-2xl font-bold">
                    {valorTotalSum.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Ticket Médio</CardTitle></CardHeader>
                  <CardContent className="text-2xl font-bold">
                    {ticketMedio.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </CardContent>
                </Card>
              </div>

              {/* Tabela detalhada */}
              <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Venda</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead className="text-right">Qtd.</TableHead>
                    <TableHead className="text-right">Vlr. Unit.</TableHead>
                    <TableHead className="text-right">Vlr. Total</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Carregando vendas...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : vendasPaginadas.length > 0 ? (
                    vendasPaginadas.map((venda) => (
                      <TableRow key={venda.uniqueKey}>
                        <TableCell className="font-medium">#{venda.id}</TableCell>
                        <TableCell>
                          {venda.data ? format(new Date(venda.data), "dd/MM/yyyy") : "-"}
                        </TableCell>
                        <TableCell>{venda.cliente}</TableCell>
                        <TableCell>{venda.produto}</TableCell>
                        <TableCell className="text-right">{venda.quantidade}</TableCell>
                        <TableCell className="text-right">
                          {(venda.valorUnitario || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {(venda.valorTotal || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                            venda.status === 'Concluída' ? 'bg-green-50 text-green-700 ring-green-600/20' : 
                            venda.status === 'Cancelada' ? 'bg-red-50 text-red-700 ring-red-600/20' : 
                            'bg-yellow-50 text-yellow-800 ring-yellow-600/20'
                          }`}>
                            {venda.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        Nenhum resultado encontrado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              </div>
            </CardContent>

            <CardFooter className="flex justify-between items-center py-4">
              <div className="text-xs text-muted-foreground">
                Mostrando <strong>{vendasPaginadas.length}</strong> de <strong>{vendasFiltradas.length}</strong> itens
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={prevPage} disabled={page === 1}>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Anterior
                </Button>
                <span className="text-sm text-muted-foreground">
                  Página {page} de {totalPages}
                </span>
                <Button variant="outline" size="sm" onClick={nextPage} disabled={page >= totalPages}>
                  Próxima
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Tab: Por cliente */}
        <TabsContent value="por-cliente">
          <Card>
            <CardHeader>
              <CardTitle>Vendas por cliente</CardTitle>
              <CardDescription>Volume de compras por cliente no período.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead className="text-right">Qtd. Itens</TableHead>
                    <TableHead className="text-right">Qtd. Vendas</TableHead>
                    <TableHead className="text-right">Total Gasto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendasPorCliente.map((row) => (
                    <TableRow key={row.cliente}>
                      <TableCell className="font-medium">{row.cliente}</TableCell>
                      <TableCell className="text-right">{row.quantidade}</TableCell>
                      <TableCell className="text-right">{row.vendas}</TableCell>
                      <TableCell className="text-right">
                        {(row.total || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </TableCell>
                    </TableRow>
                  ))}
                  {vendasPorCliente.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">Nenhum dado disponível.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Por produto */}
        <TabsContent value="por-produto">
          <Card>
            <CardHeader>
              <CardTitle>Ranking de produtos</CardTitle>
              <CardDescription>Performance de vendas por produto.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead className="text-right">Itens Vendidos</TableHead>
                    <TableHead className="text-right">Vendas (Presença)</TableHead>
                    <TableHead className="text-right">Total Faturado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rankingProdutos.map((row) => (
                    <TableRow key={row.produto}>
                      <TableCell className="font-medium">{row.produto}</TableCell>
                      <TableCell className="text-right">{row.quantidade}</TableCell>
                      <TableCell className="text-right">{row.vendas}</TableCell>
                      <TableCell className="text-right">
                        {(row.total || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </TableCell>
                    </TableRow>
                  ))}
                  {rankingProdutos.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">Nenhum dado disponível.</TableCell>
                    </TableRow>
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