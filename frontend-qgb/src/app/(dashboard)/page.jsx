"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableCell, TableBody } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Download, UserPlus, Package, DollarSign } from "lucide-react"
import {
  BarChart, Bar,
  LineChart, Line,
  PieChart, Pie, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from "recharts"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { DateRangePicker } from "@/components/date-range-picker"
import { parseISO, isWithinInterval } from "date-fns"

// --- Dados mockados com datas ---
const vendasData = [
  { dia: "Seg", valor: 1200, data: "2025-11-10" },
  { dia: "Ter", valor: 980,  data: "2025-11-11" },
  { dia: "Qua", valor: 1500, data: "2025-11-12" },
  { dia: "Qui", valor: 800,  data: "2025-11-13" },
  { dia: "Sex", valor: 1700, data: "2025-11-14" },
  { dia: "Sáb", valor: 2200, data: "2025-11-15" },
  { dia: "Dom", valor: 900,  data: "2025-11-16" },
]

const pedidosMensais = [
  { mes: "Jan", pedidos: 40 },
  { mes: "Fev", pedidos: 55 },
  { mes: "Mar", pedidos: 70 },
  { mes: "Abr", pedidos: 60 },
  { mes: "Mai", pedidos: 90 },
]

const categoriasData = [
  { name: "Eletrônicos", value: 400 },
  { name: "Roupas",      value: 300 },
  { name: "Alimentos",   value: 300 },
  { name: "Cosméticos",  value: 200 },
]

const cores = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"]

const desempenhoData = [
  { subject: "Atendimento", A: 120, fullMark: 150 },
  { subject: "Entrega",     A: 98,  fullMark: 150 },
  { subject: "Qualidade",   A: 130, fullMark: 150 },
  { subject: "Preço",       A: 90,  fullMark: 150 },
  { subject: "Variedade",   A: 110, fullMark: 150 },
]

const pedidosRecentesBase = [
  { id: "#001", cliente: "Maria Silva", status: "Pago",       valor: "R$ 250,00", data: "2025-11-15" },
  { id: "#002", cliente: "João Santos", status: "Aguardando", valor: "R$ 120,00", data: "2025-11-16" },
  { id: "#003", cliente: "Ana Costa",   status: "Pago",       valor: "R$ 340,00", data: "2025-11-16" },
]

export default function DashboardPage() {
  const router = useRouter()

  // Filtro de período
  const [dateRange, setDateRange] = useState({
    from: new Date(2025, 10, 10), // 10 Nov
    to:   new Date(2025, 10, 16), // 16 Nov
  })

  // Busca na tabela de pedidos
  const [buscaPedido, setBuscaPedido] = useState("")

  // Modais e forms
  const [openModal, setOpenModal] = useState(null)
  const [formVenda,     setFormVenda]     = useState({ cliente: "", valor: "" })
  const [formCliente,   setFormCliente]   = useState({ nome: "", email: "" })
  const [formProduto,   setFormProduto]   = useState({ nome: "", preco: "" })
  const [formPagamento, setFormPagamento] = useState({ pedidoId: "", valor: "" })

  // Filtrar vendas por período
  const vendasFiltradas = useMemo(() => {
    return vendasData.filter(v =>
      isWithinInterval(parseISO(v.data), { start: dateRange.from, end: dateRange.to })
    )
  }, [dateRange])

  // Filtrar pedidos por período e busca
  const pedidosFiltrados = useMemo(() => {
    const porPeriodo = pedidosRecentesBase.filter(p =>
      isWithinInterval(parseISO(p.data), { start: dateRange.from, end: dateRange.to })
    )
    const termo = buscaPedido.trim().toLowerCase()
    if (!termo) return porPeriodo
    return porPeriodo.filter(p =>
      p.id.toLowerCase().includes(termo) ||
      p.cliente.toLowerCase().includes(termo) ||
      p.status.toLowerCase().includes(termo)
    )
  }, [dateRange, buscaPedido])

  // KPIs dinâmicos a partir dos dados filtrados
  const vendasHoje = vendasFiltradas.length > 0 ? vendasFiltradas[0].valor : 0
  const pedidosEmAndamento = pedidosFiltrados.length
  const caixaAtual = pedidosFiltrados.reduce((acc, p) => {
    const num = Number(p.valor.replace("R$ ", "").replace(/\./g, "").replace(",", "."))
    return acc + (isNaN(num) ? 0 : num)
  }, 0)

  // Exportar CSV de pedidos filtrados
  const exportCSV = () => {
    const header = ["ID", "Cliente", "Status", "Valor", "Data"]
    const rows = pedidosFiltrados.map(p => [p.id, p.cliente, p.status, p.valor, p.data])
    const csvContent = [header, ...rows].map(e => e.join(";")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", "relatorio_pedidos.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Navegação para fluxos reais
  const goPdv        = () => router.push("/pdv")
  const goNovoCli    = () => router.push("/clientes/novo")
  const goNovoProd   = () => router.push("/produtos/novo")
  const goPagamentos = () => router.push("/relatorios/pagamentos")

  // Handlers dos modais (mock simples)
  const confirmarVenda = () => {
    setOpenModal(null)
    setFormVenda({ cliente: "", valor: "" })
  }
  const confirmarCliente = () => {
    setOpenModal(null)
    setFormCliente({ nome: "", email: "" })
  }
  const confirmarProduto = () => {
    setOpenModal(null)
    setFormProduto({ nome: "", preco: "" })
  }
  const confirmarPagamento = () => {
    setOpenModal(null)
    setFormPagamento({ pedidoId: "", valor: "" })
  }

  return (
    <main className="p-6 space-y-8">
      {/* Header com filtro de período */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Bem-vindo ao painel principal da QG Brightness.</p>
        </div>
        <DateRangePicker
          initialDateFrom={dateRange.from}
          initialDateTo={dateRange.to}
          align="start"
          locale="pt-BR"
          showCompare={false}
          onUpdate={({ range }) => setDateRange(range)}
        />
      </div>

      {/* Ações rápidas */}
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => setOpenModal("venda")} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nova Venda
        </Button>
        <Button variant="outline" onClick={() => setOpenModal("cliente")} className="flex items-center gap-2">
          <UserPlus className="w-4 h-4" /> Novo Cliente
        </Button>
        <Button variant="outline" onClick={() => setOpenModal("produto")} className="flex items-center gap-2">
          <Package className="w-4 h-4" /> Novo Produto
        </Button>
        <Button variant="outline" onClick={() => setOpenModal("pagamento")} className="flex items-center gap-2">
          <DollarSign className="w-4 h-4" /> Registrar Pagamento
        </Button>
        <Button variant="secondary" onClick={exportCSV} className="flex items-center gap-2">
          <Download className="w-4 h-4" /> Exportar Relatórios
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>📈 Vendas do Dia</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">R$ {vendasHoje.toLocaleString("pt-BR")},00</p>
            <p className="text-sm text-muted-foreground">+15% em relação a ontem</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>🛒 Pedidos em Andamento</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{pedidosEmAndamento}</p>
            <p className="text-sm text-muted-foreground">2 aguardando pagamento</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>💰 Caixa Atual</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">R$ {caixaAtual.toLocaleString("pt-BR")}</p>
            <p className="text-sm text-muted-foreground">Última atualização: 14h</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos linha 1 */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>📊 Vendas Semanais</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vendasFiltradas}>
                <XAxis dataKey="dia" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="valor" name="Vendas" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>📈 Pedidos Mensais</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={pedidosMensais}>
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="pedidos" name="Pedidos" stroke="#10b981" strokeWidth={3} dot />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos linha 2 */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>🥧 Vendas por Categoria</CardTitle></CardHeader>
          <CardContent className="h-72 flex justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoriasData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label>
                  {categoriasData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={cores[index % cores.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>🎯 Avaliação de Desempenho</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={desempenhoData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis />
                <Radar name="Loja" dataKey="A" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
                <Tooltip />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de últimos pedidos com busca */}
      <Card>
        <CardHeader><CardTitle>📋 Últimos Pedidos</CardTitle></CardHeader>
        <CardContent>
          <div className="flex justify-between mb-3">
            <Input
              placeholder="Buscar por ID, cliente ou status..."
              value={buscaPedido}
              onChange={(e) => setBuscaPedido(e.target.value)}
              className="max-w-xs"
            />
            <div className="flex gap-2">
              <Button variant="outline" onClick={goPdv}>Ir para PDV</Button>
              <Button variant="outline" onClick={goPagamentos}>Pagamentos</Button>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pedidosFiltrados.map((pedido) => (
                <TableRow key={pedido.id}>
                  <TableCell>{pedido.id}</TableCell>
                  <TableCell>{pedido.cliente}</TableCell>
                  <TableCell className={pedido.status === "Pago" ? "text-green-600" : "text-yellow-600"}>
                    {pedido.status}
                  </TableCell>
                  <TableCell>{pedido.valor}</TableCell>
                  <TableCell>{pedido.data}</TableCell>
                </TableRow>
              ))}
              {pedidosFiltrados.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Nenhum pedido no período ou com esse termo.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modais funcionais (mock) */}
      <Dialog open={openModal === "venda"} onOpenChange={(o) => setOpenModal(o ? "venda" : null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nova Venda</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Cliente" value={formVenda.cliente} onChange={(e) => setFormVenda({ ...formVenda, cliente: e.target.value })} />
            <Input type="number" placeholder="Valor (R$)" value={formVenda.valor} onChange={(e) => setFormVenda({ ...formVenda, valor: e.target.value })} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenModal(null)}>Cancelar</Button>
            <Button onClick={confirmarVenda}>Confirmar</Button>
            <Button variant="secondary" onClick={goPdv}>Ir para PDV</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openModal === "cliente"} onOpenChange={(o) => setOpenModal(o ? "cliente" : null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Novo Cliente</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Nome" value={formCliente.nome} onChange={(e) => setFormCliente({ ...formCliente, nome: e.target.value })} />
            <Input type="email" placeholder="Email" value={formCliente.email} onChange={(e) => setFormCliente({ ...formCliente, email: e.target.value })} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenModal(null)}>Cancelar</Button>
            <Button onClick={confirmarCliente}>Salvar</Button>
            <Button variant="secondary" onClick={goNovoCli}>Ir para cadastro</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openModal === "produto"} onOpenChange={(o) => setOpenModal(o ? "produto" : null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Novo Produto</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Nome" value={formProduto.nome} onChange={(e) => setFormProduto({ ...formProduto, nome: e.target.value })} />
            <Input type="number" placeholder="Preço (R$)" value={formProduto.preco} onChange={(e) => setFormProduto({ ...formProduto, preco: e.target.value })} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenModal(null)}>Cancelar</Button>
            <Button onClick={confirmarProduto}>Salvar</Button>
            <Button variant="secondary" onClick={goNovoProd}>Ir para cadastro</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openModal === "pagamento"} onOpenChange={(o) => setOpenModal(o ? "pagamento" : null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Registrar Pagamento</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="ID do pedido (#001)" value={formPagamento.pedidoId} onChange={(e) => setFormPagamento({ ...formPagamento, pedidoId: e.target.value })} />
            <Input type="number" placeholder="Valor (R$)" value={formPagamento.valor} onChange={(e) => setFormPagamento({ ...formPagamento, valor: e.target.value })} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenModal(null)}>Cancelar</Button>
            <Button onClick={confirmarPagamento}>Confirmar</Button>
            <Button variant="secondary" onClick={goPagamentos}>Ir para pagamentos</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
