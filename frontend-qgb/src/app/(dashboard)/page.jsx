"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableCell, TableBody } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Download, UserPlus, Package, DollarSign, Wrench, Loader2 } from "lucide-react"
import {
  BarChart, Bar,
  LineChart, Line,
  PieChart, Pie, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from "recharts"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import NewClientModal from "@/components/clientes/new-client-modal"
import { parseISO, isWithinInterval, format, subDays, isSameDay, eachDayOfInterval, eachMonthOfInterval, startOfMonth, endOfMonth } from "date-fns"
import { ptBR } from "date-fns/locale"

import { useAuth } from "@/contexts/AuthContext"
import { readAll as readVendas, getRelatorioVendas } from "@/services/vendaService"
import { toast } from "sonner"

// Cores para charts
const cores = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"]


export default function DashboardPage() {
  const router = useRouter()
  const { user, token } = useAuth()

  // Estados de Dados
  const [vendas, setVendas] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Filtro de período (Padrão: Últimos 30 dias para garantir que dados apareçam)
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 30), 
    to:   new Date(),
  })

  // Busca na tabela de pedidos
  const [buscaPedido, setBuscaPedido] = useState("")
  const [openModal, setOpenModal] = useState(null)
  // Paginação da tabela de pedidos
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  
  // --- CARREGAMENTO DE DADOS ---
  useEffect(() => {
    async function fetchData() {
      if (!token) return // Se não tiver token, nem tenta
      
      try {
        setIsLoading(true)
        const todasVendas = await readVendas(token)
        
        // CORREÇÃO: Fallback seguro para ID da Loja (Usa 1 se o usuário não tiver id definido)
        const lojaIdUsuario = user?.loja_id ? Number(user.loja_id) : 1;

        const minhasVendas = Array.isArray(todasVendas) 
          ? todasVendas.filter(v => Number(v.loja_id) === lojaIdUsuario)
          : []

        console.log("Vendas carregadas:", minhasVendas); // Debug no console
        setVendas(minhasVendas)
      } catch (error) {
        console.error("Erro ao carregar dashboard:", error)
        toast.error("Não foi possível carregar os dados de vendas.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [token, user])

  // Buscar relatório com itens para compor categorias/itens por receita
  const [relatorioItens, setRelatorioItens] = useState([])
  const [relatorioLoading, setRelatorioLoading] = useState(true)
  const [relatorioError, setRelatorioError] = useState(null)
  useEffect(() => {
    async function fetchRelatorio() {
      if (!token) return
      setRelatorioLoading(true)
      setRelatorioError(null)
      try {
        const res = await getRelatorioVendas(token)
        // API pode retornar { vendas: [...] } ou array direto
        const arr = Array.isArray(res) ? res : (res?.vendas ?? res?.data ?? [])
        setRelatorioItens(arr)
      } catch (e) {
        console.error("Erro ao carregar relatório de vendas:", e)
        setRelatorioError(e)
      } finally {
        setRelatorioLoading(false)
      }
    }
    fetchRelatorio()
  }, [token])

  // --- PROCESSAMENTO DE DADOS (MEMO) ---

  // 1. Filtrar vendas pelo período
  const vendasFiltradasPorData = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return vendas;
    
    const start = new Date(dateRange.from);
    start.setHours(0,0,0,0);
    
    const end = new Date(dateRange.to);
    end.setHours(23, 59, 59, 999);

    return vendas.filter(v => {
      if (!v.data_venda) return false;
      const dataVenda = new Date(v.data_venda);
      return isWithinInterval(dataVenda, { start, end });
    });
  }, [vendas, dateRange]);

  const pedidosTabela = useMemo(() => {
    const termo = buscaPedido.trim().toLowerCase()
    
    // Ordena por data decrescente
    let lista = [...vendasFiltradasPorData].sort((a, b) => new Date(b.data_venda) - new Date(a.data_venda))

    if (!termo) return lista;

    return lista.filter(p =>
      String(p.venda_id).includes(termo) ||
      String(p.status_venda).toLowerCase().includes(termo) ||
      // Correção da busca (placeholder se tiver nome do cliente no futuro)
      (p.cliente_nome && p.cliente_nome.toLowerCase().includes(termo))
    )
  }, [vendasFiltradasPorData, buscaPedido])

  // Resetar página quando os resultados mudam
  useEffect(() => {
    setCurrentPage(1)
  }, [pedidosTabela, rowsPerPage])

  const totalPages = Math.max(1, Math.ceil(pedidosTabela.length / rowsPerPage))
  const paginatedPedidos = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage
    return pedidosTabela.slice(start, start + rowsPerPage)
  }, [pedidosTabela, currentPage, rowsPerPage])

  // 2. KPIs
  const kpis = useMemo(() => {
    const hoje = new Date();
    
    const vendasHojeArr = vendas.filter(v => isSameDay(new Date(v.data_venda), hoje));
    const totalVendasHoje = vendasHojeArr.reduce((acc, v) => acc + Number(v.valor_total), 0);
    
    const metaDiaria = 5000; 
    const atingimento = totalVendasHoje > 0 ? ((totalVendasHoje / metaDiaria) * 100).toFixed(0) : 0;

    const totalCaixaPeriodo = vendasFiltradasPorData.reduce((acc, v) => acc + Number(v.valor_total), 0);

    return {
      hoje: totalVendasHoje,
      atingimento,
      qtdPedidos: vendasFiltradasPorData.length,
      caixaTotal: totalCaixaPeriodo
    }
  }, [vendas, vendasFiltradasPorData]);

  // 3. Gráfico Diário
  const chartDataDiario = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return [];

    // Limita para não quebrar se o intervalo for muito grande, pega os dados filtrados
    const diasComVendas = {};
    
    // Agrupa valores por dia
    vendasFiltradasPorData.forEach(v => {
        const diaKey = format(new Date(v.data_venda), 'yyyy-MM-dd');
        diasComVendas[diaKey] = (diasComVendas[diaKey] || 0) + Number(v.valor_total);
    });

    // Gera o array para o gráfico preenchendo dias vazios
    try {
        const diasIntervalo = eachDayOfInterval({ start: dateRange.from, end: dateRange.to });
        return diasIntervalo.map(dia => {
            const diaFormatado = format(dia, 'yyyy-MM-dd');
            const nomeDia = format(dia, 'dd/MM', { locale: ptBR });
            
            return {
                dia: nomeDia,
                valor: diasComVendas[diaFormatado] || 0,
                fullDate: diaFormatado
            };
        });
    } catch(e) {
        return [];
    }
  }, [vendasFiltradasPorData, dateRange]);

  // 4. Gráfico Mensal
  const chartDataMensal = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return []

    try {
      const meses = eachMonthOfInterval({ start: startOfMonth(dateRange.from), end: endOfMonth(dateRange.to) })

      return meses.map(mes => {
        const mesKey = format(mes, 'yyyy-MM')
        const vendasNoMes = vendas.filter(v => format(new Date(v.data_venda), 'yyyy-MM') === mesKey)
        const pedidos = vendasNoMes.length
        const faturamento = vendasNoMes.reduce((acc, v) => acc + Number(v.valor_total || 0), 0)

        const nomeMes = format(mes, 'MMM', { locale: ptBR })
        return {
          mes: nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1),
          pedidos,
          faturamento
        }
      })
    } catch (e) {
      return []
    }
  }, [vendas, dateRange])

  // Categorias / Top produtos por receita (usando relatório de itens)
  const categoriasData = useMemo(() => {
    if (!relatorioItens || relatorioItens.length === 0) return []
    if (!dateRange?.from || !dateRange?.to) return []

    const start = new Date(dateRange.from); start.setHours(0,0,0,0)
    const end = new Date(dateRange.to); end.setHours(23,59,59,999)

    const grouped = {}
    relatorioItens.forEach(item => {
      if (!item.data_venda) return
      const d = new Date(item.data_venda)
      if (d < start || d > end) return
      const key = item.produto_nome || 'Outros'
      const valor = Number(item.item_total ?? item.subtotal ?? 0)
      grouped[key] = (grouped[key] || 0) + (isNaN(valor) ? 0 : valor)
    })

    const arr = Object.keys(grouped).map(k => ({ name: k, value: grouped[k] }))
    arr.sort((a,b) => b.value - a.value)
    return arr.slice(0, 6)
  }, [relatorioItens, dateRange])

  // --- Desempenho: métricas derivadas dos dados de vendas (Radar) ---
  const desempenhoData = useMemo(() => {
    try {
      const faturamento = vendasFiltradasPorData.reduce((acc, v) => acc + Number(v.valor_total || 0), 0)
      const pedidos = vendasFiltradasPorData.length
      const ticketMedio = pedidos > 0 ? faturamento / pedidos : 0

      // clientes únicos
      const clientesSet = new Set()
      vendasFiltradasPorData.forEach(v => {
        const cid = v.cliente_id ?? v.cliente?.id ?? v.cliente?.cliente_id ?? v.cliente_id
        if (cid) clientesSet.add(String(cid))
      })
      const clientesUnicos = clientesSet.size

      // produtos vendidos (soma de quantidades no relatório de itens)
      let produtosVendidos = 0
      if (Array.isArray(relatorioItens)) {
        const start = new Date(dateRange.from); start.setHours(0,0,0,0)
        const end = new Date(dateRange.to); end.setHours(23,59,59,999)
        relatorioItens.forEach(it => {
          try {
            const d = new Date(it.data_venda)
            if (d >= start && d <= end) {
              produtosVendidos += Number(it.quantidade ?? it.qtd ?? 0)
            }
          } catch (e) { /* ignore */ }
        })
      }

      // Normaliza para escala do Radar (0-150) usando metas razoáveis
      const scale = (value, target) => {
        if (!target || target <= 0) return 0
        return Math.min(150, Math.round((value / target) * 150))
      }

      // Metas (ajustáveis conforme necessidade)
      const metas = { ticket: 800, pedidos: 120, clientes: 80, produtos: 300 }

      return [
        { subject: "Ticket Médio", A: scale(ticketMedio, metas.ticket), fullMark: 150 },
        { subject: "Pedidos", A: scale(pedidos, metas.pedidos), fullMark: 150 },
        { subject: "Clientes Únicos", A: scale(clientesUnicos, metas.clientes), fullMark: 150 },
        { subject: "Produtos Vendidos", A: scale(produtosVendidos, metas.produtos), fullMark: 150 },
      ]
    } catch (e) {
      return [
        { subject: "Ticket Médio", A: 50, fullMark: 150 },
        { subject: "Pedidos", A: 50, fullMark: 150 },
        { subject: "Clientes Únicos", A: 50, fullMark: 150 },
        { subject: "Produtos Vendidos", A: 50, fullMark: 150 },
      ]
    }
  }, [vendasFiltradasPorData, relatorioItens, dateRange])


  const formatCurrency = (val) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);
  const formatDate = (dateStr) => format(new Date(dateStr), "dd/MM/yyyy HH:mm");

  const exportCSV = () => {
    const header = ["ID Venda", "Status", "Valor Total", "Data"];
    const rows = pedidosTabela.map(p => [
      p.venda_id, 
      p.status_venda, 
      Number(p.valor_total).toFixed(2).replace('.', ','), 
      format(new Date(p.data_venda), 'dd/MM/yyyy HH:mm:ss')
    ]);
    
    const csvContent = [header, ...rows].map(e => e.join(";")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `vendas_loja_${user?.loja_id || 'geral'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const goPdv        = () => router.push("/pdv")
  const goNovoCli    = () => setOpenModal("novoCliente")
  const goNovoProd   = () => router.push("/cadastros/produtos")
  const goPagamentos = () => router.push("/financeiro/contas-a-pagar")

  // Se não estiver carregando e não tiver usuário, exibe loading ou redireciona
  if (!user && !isLoading) return null; 

  return (
    <main className="p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard - Loja {user?.loja_id || 1}</h1>
          <p className="text-muted-foreground">Visão geral das vendas e estoque da QG Brightness.</p>
        </div>
      </div>

      {/* Ações rápidas */}
      <div className="flex flex-wrap gap-2">
        <Button onClick={goPdv} className="flex items-center gap-2">
          <Wrench className="w-4 h-4" /> Nova Venda (PDV)
        </Button>
        <Button variant="outline" onClick={goNovoCli} className="flex items-center gap-2">
          <UserPlus className="w-4 h-4" /> Novo Cliente
        </Button>
        <Button variant="outline" onClick={goNovoProd} className="flex items-center gap-2">
          <Package className="w-4 h-4" /> Gerenciar Estoque
        </Button>
        <Button variant="outline" onClick={goPagamentos} className="flex items-center gap-2">
          <DollarSign className="w-4 h-4" /> Financeiro
        </Button>
        <Button variant="secondary" onClick={exportCSV} className="flex items-center gap-2">
          <Download className="w-4 h-4" /> Exportar CSV
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Vendas de Hoje</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? <Loader2 className="animate-spin h-6 w-6" /> : (
              <>
                <p className="text-2xl font-bold">{formatCurrency(kpis.hoje)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Meta diária (est.): {kpis.atingimento}% atingido
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Pedidos (30 dias)</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? <Loader2 className="animate-spin h-6 w-6" /> : (
              <>
                <p className="text-2xl font-bold">{kpis.qtdPedidos}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Vendas no período visualizado
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Faturamento (30 dias)</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? <Loader2 className="animate-spin h-6 w-6" /> : (
              <>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(kpis.caixaTotal)}</p>
                <p className="text-xs text-muted-foreground mt-1">Total bruto apurado</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Gráficos linha 1 */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Vendas no Período (Diário)</CardTitle></CardHeader>
          <CardContent className="h-72">
            { (isLoading || relatorioLoading) ? (
              <div className="h-72 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartDataDiario}>
                  <XAxis dataKey="dia" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis 
                    tickFormatter={(value) => `R$${(value / 1000).toFixed(0)}k`} 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                  />
                  <Tooltip 
                    formatter={(value) => [formatCurrency(value), "Vendas"]} 
                    labelFormatter={(label, payload) => payload[0]?.payload.fullDate ? format(new Date(payload[0].payload.fullDate), "dd 'de' MMMM") : label}
                  />
                  <Bar dataKey="valor" name="Faturamento" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Evolução de Pedidos (Mensal)</CardTitle></CardHeader>
          <CardContent className="h-72">
            {(isLoading || relatorioLoading) ? (
              <div className="h-72 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartDataMensal}>
                  <XAxis dataKey="mes" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis 
                    tickFormatter={(value) => `R$${(value).toLocaleString('pt-BR')}`} 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                  />
                  <Tooltip formatter={(value) => [formatCurrency(value), 'Faturamento']} />
                  <Line type="monotone" dataKey="faturamento" name="Faturamento" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Gráficos linha 2 */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Categorias (Estimativa)</CardTitle></CardHeader>
          <CardContent className="h-72 flex justify-center">
            {(isLoading || relatorioLoading) ? (
              <div className="h-72 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : relatorioError ? (
              <div className="h-72 flex items-center justify-center text-sm text-red-600">Erro ao carregar dados do relatório.</div>
            ) : categoriasData.length === 0 ? (
              <div className="h-72 flex items-center justify-center text-sm text-muted-foreground">Nenhum dado disponível para o período selecionado.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoriasData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" paddingAngle={5}>
                    {categoriasData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={cores[index % cores.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [formatCurrency(value), 'Receita']} />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Métricas de Qualidade</CardTitle></CardHeader>
          <CardContent className="h-72">
              {(isLoading || relatorioLoading) ? (
                <div className="h-72 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={desempenhoData} outerRadius={90}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" fontSize={12} />
                    <PolarRadiusAxis angle={30} domain={[0, 150]} />
                    <Radar name="Loja Atual" dataKey="A" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.5} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              )}
          </CardContent>
        </Card>
      </div>

      {/* Tabela de últimos pedidos */}
      <Card>
        <CardHeader><CardTitle>Últimas Vendas Realizadas</CardTitle></CardHeader>
        <CardContent>
          <div className="flex justify-between mb-3">
            <Input
              placeholder="Buscar ID ou Status..."
              value={buscaPedido}
              onChange={(e) => setBuscaPedido(e.target.value)}
              className="max-w-xs"
            />
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID Venda</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Valor Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : pedidosTabela.length > 0 ? (
                  paginatedPedidos.map((pedido) => (
                    <TableRow key={pedido.venda_id}>
                      <TableCell className="font-medium">#{pedido.venda_id}</TableCell>
                      <TableCell>{formatDate(pedido.data_venda)}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          pedido.status_venda === 'Concluída' ? 'bg-green-100 text-green-800' : 
                          pedido.status_venda === 'Cancelada' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {pedido.status_venda}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {formatCurrency(pedido.valor_total)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                      Nenhuma venda encontrada no período.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            {/* Paginação */}
            <div className="flex items-center justify-between p-3">
              <div className="text-sm text-muted-foreground">
                {pedidosTabela.length === 0 ? (
                  <span>Nenhum registro</span>
                ) : (
                  <span>
                    Mostrando {(pedidosTabela.length === 0) ? 0 : ( (currentPage - 1) * rowsPerPage + 1 )} - {Math.min(currentPage * rowsPerPage, pedidosTabela.length)} de {pedidosTabela.length}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm text-muted-foreground">Linhas:</label>
                <select value={rowsPerPage} onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }} className="border rounded px-2 py-1 text-sm">
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>

                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                  Anterior
                </Button>
                <div className="text-sm">{currentPage} / {totalPages}</div>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                  Próximo
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
''
      {/* Modais */}
      <NewClientModal open={openModal === "novoCliente"} onOpenChange={(v) => setOpenModal(v ? "novoCliente" : null)} />

      <Dialog open={openModal === "aviso"} onOpenChange={() => setOpenModal(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Em desenvolvimento</DialogTitle></DialogHeader>
          <p>Esta funcionalidade estará disponível em breve.</p>
          <DialogFooter><Button onClick={() => setOpenModal(null)}>Ok</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}