"use client"

import { useState, useMemo } from "react"
import { File, ListFilter, ChevronLeft, ChevronRight, Search } from "lucide-react"
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
import { isWithinInterval, parseISO } from "date-fns"

// --- Dados Mockados ---
const mockSalesData = [
  { id: "VND001", data: "2025-10-15", cliente: "Cliente Exemplo A", produto: "Produto X", quantidade: 2, valorUnitario: 50.0, valorTotal: 100.0, status: "Concluída" },
  { id: "VND002", data: "2025-10-16", cliente: "Cliente Exemplo B", produto: "Produto Y", quantidade: 1, valorUnitario: 120.0, valorTotal: 120.0, status: "Concluída" },
  { id: "VND003", data: "2025-10-16", cliente: "Cliente Exemplo A", produto: "Produto Z", quantidade: 5, valorUnitario: 10.0, valorTotal: 50.0, status: "Pendente" },
  { id: "VND004", data: "2025-10-17", cliente: "Cliente Exemplo C", produto: "Produto W", quantidade: 3, valorUnitario: 80.0, valorTotal: 240.0, status: "Cancelada" },
  { id: "VND005", data: "2025-10-18", cliente: "Cliente Exemplo D", produto: "Produto X", quantidade: 4, valorUnitario: 50.0, valorTotal: 200.0, status: "Concluída" },
  { id: "VND006", data: "2025-10-18", cliente: "Cliente Exemplo E", produto: "Produto Y", quantidade: 2, valorUnitario: 120.0, valorTotal: 240.0, status: "Pendente" },
  { id: "VND007", data: "2025-10-19", cliente: "Cliente Exemplo F", produto: "Produto Z", quantidade: 10, valorUnitario: 10.0, valorTotal: 100.0, status: "Concluída" },
]

export default function RelatorioVendas() {
  const [statusFilter, setStatusFilter] = useState(["Concluída", "Pendente", "Cancelada"])
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(1)
  const pageSize = 5

  const [dateRange, setDateRange] = useState({
    from: new Date(2025, 9, 1),
    to: new Date(2025, 9, 31),
  })

  // Filtragem combinada
  const vendasFiltradas = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    return mockSalesData.filter((v) => {
      const dataVenda = parseISO(v.data)
      const dentroDoPeriodo =
        dateRange?.from && dateRange?.to
          ? isWithinInterval(dataVenda, { start: dateRange.from, end: dateRange.to })
          : true
      const statusOK = statusFilter.includes(v.status)
      const buscaOK =
        term.length === 0 ||
        v.cliente.toLowerCase().includes(term) ||
        v.produto.toLowerCase().includes(term) ||
        v.id.toLowerCase().includes(term)
      return dentroDoPeriodo && statusOK && buscaOK
    })
  }, [dateRange, statusFilter, searchTerm])

  // Paginação detalhado
  const totalPages = Math.ceil(vendasFiltradas.length / pageSize) || 1
  const vendasPaginadas = vendasFiltradas.slice((page - 1) * pageSize, page * pageSize)

  // KPIs globais
  const totalVendas = vendasFiltradas.length
  const valorTotal = vendasFiltradas.reduce((acc, v) => acc + v.valorTotal, 0)
  const ticketMedio = totalVendas > 0 ? valorTotal / totalVendas : 0

  // Agrupamento por cliente
  const vendasPorCliente = useMemo(() => {
    const mapa = new Map()
    vendasFiltradas.forEach((v) => {
      const prev = mapa.get(v.cliente) || { vendas: 0, quantidade: 0, total: 0 }
      mapa.set(v.cliente, {
        vendas: prev.vendas + 1,
        quantidade: prev.quantidade + v.quantidade,
        total: prev.total + v.valorTotal,
      })
    })
    return Array.from(mapa.entries()).map(([cliente, dados]) => ({ cliente, ...dados }))
      .sort((a, b) => b.total - a.total)
  }, [vendasFiltradas])

  // Ranking de produtos
  const rankingProdutos = useMemo(() => {
    const mapa = new Map()
    vendasFiltradas.forEach((v) => {
      const prev = mapa.get(v.produto) || { vendas: 0, quantidade: 0, total: 0 }
      mapa.set(v.produto, {
        vendas: prev.vendas + 1,
        quantidade: prev.quantidade + v.quantidade,
        total: prev.total + v.valorTotal,
      })
    })
    return Array.from(mapa.entries()).map(([produto, dados]) => ({ produto, ...dados }))
      .sort((a, b) => b.total - a.total)
  }, [vendasFiltradas])

  // Exportar CSV (respeita filtros atuais)
  const exportCSV = () => {
    const header = ["ID", "Data", "Cliente", "Produto", "Qtd", "Vlr Unit", "Vlr Total", "Status"]
    const rows = vendasFiltradas.map(v => [
      v.id, v.data, v.cliente, v.produto, v.quantidade, v.valorUnitario, v.valorTotal, v.status
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
        <div className="flex items-center gap-2">
          <DateRangePicker
            initialDateFrom={dateRange.from}
            initialDateTo={dateRange.to}
            align="start"
            locale="pt-BR"
            showCompare={false}
            onUpdate={({ range }) => {
              setDateRange(range)
              setPage(1)
            }}
          />
          <div className="flex items-center gap-2 ml-2 w-full max-w-xs">
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
              <CardDescription>Histórico detalhado de vendas no período selecionado.</CardDescription>
            </CardHeader>
            <CardContent>
              {/* KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <Card>
                  <CardHeader><CardTitle className="text-sm">Total de Vendas</CardTitle></CardHeader>
                  <CardContent className="text-2xl font-semibold">{totalVendas}</CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-sm">Valor Total</CardTitle></CardHeader>
                  <CardContent className="text-2xl font-semibold">
                    {valorTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-sm">Ticket Médio</CardTitle></CardHeader>
                  <CardContent className="text-2xl font-semibold">
                    {ticketMedio.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </CardContent>
                </Card>
              </div>

              {/* Tabela detalhada */}
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
                  {vendasPaginadas.map((venda) => (
                    <TableRow key={venda.id}>
                      <TableCell className="font-medium">{venda.id}</TableCell>
                      <TableCell>{venda.data}</TableCell>
                      <TableCell>{venda.cliente}</TableCell>
                      <TableCell>{venda.produto}</TableCell>
                      <TableCell className="text-right">{venda.quantidade}</TableCell>
                      <TableCell className="text-right">
                        {venda.valorUnitario.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </TableCell>
                      <TableCell className="text-right">
                        {venda.valorTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </TableCell>
                      <TableCell>{venda.status}</TableCell>
                    </TableRow>
                  ))}
                  {vendasPaginadas.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        Nenhum resultado encontrado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>

            <CardFooter className="flex justify-between items-center">
              <div className="text-xs text-muted-foreground">
                Mostrando{" "}
                <strong>
                  {vendasPaginadas.length > 0 ? (page - 1) * pageSize + 1 : 0}
                  -
                  {Math.min(page * pageSize, vendasFiltradas.length)}
                </strong>{" "}
                de <strong>{vendasFiltradas.length}</strong> vendas
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={prevPage} disabled={page === 1}>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Anterior
                </Button>
                <span className="text-sm text-muted-foreground">
                  Página {page} de {Math.ceil(vendasFiltradas.length / pageSize) || 1}
                </span>
                <Button variant="outline" size="sm" onClick={nextPage} disabled={page >= (Math.ceil(vendasFiltradas.length / pageSize) || 1)}>
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
              <CardDescription>Subtotal por cliente no período e filtros aplicados.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead className="text-right">Qtd. Itens</TableHead>
                    <TableHead className="text-right">Qtd. Vendas</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendasPorCliente.map((row) => (
                    <TableRow key={row.cliente}>
                      <TableCell className="font-medium">{row.cliente}</TableCell>
                      <TableCell className="text-right">{row.quantidade}</TableCell>
                      <TableCell className="text-right">{row.vendas}</TableCell>
                      <TableCell className="text-right">
                        {row.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </TableCell>
                    </TableRow>
                  ))}
                  {vendasPorCliente.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        Nenhum resultado encontrado.
                      </TableCell>
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
              <CardDescription>Produtos mais vendidos por valor e quantidade.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead className="text-right">Qtd. Itens</TableHead>
                    <TableHead className="text-right">Qtd. Vendas</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rankingProdutos.map((row) => (
                    <TableRow key={row.produto}>
                      <TableCell className="font-medium">{row.produto}</TableCell>
                      <TableCell className="text-right">{row.quantidade}</TableCell>
                      <TableCell className="text-right">{row.vendas}</TableCell>
                      <TableCell className="text-right">
                        {row.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </TableCell>
                    </TableRow>
                  ))}
                  {rankingProdutos.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        Nenhum resultado encontrado.
                      </TableCell>
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
