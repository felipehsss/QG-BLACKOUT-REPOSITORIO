"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableCell, TableBody } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Plus, Download, UserPlus, Package, DollarSign } from "lucide-react"
import {
  BarChart, Bar,
  LineChart, Line,
  PieChart, Pie, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from "recharts"

// --- Dados mockados (estáticos) ---
const vendasData = [
  { dia: "Seg", valor: 1200 },
  { dia: "Ter", valor: 980 },
  { dia: "Qua", valor: 1500 },
  { dia: "Qui", valor: 800 },
  { dia: "Sex", valor: 1700 },
  { dia: "Sáb", valor: 2200 },
  { dia: "Dom", valor: 900 },
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
  { name: "Roupas", value: 300 },
  { name: "Alimentos", value: 300 },
  { name: "Cosméticos", value: 200 },
]

const cores = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"]

const desempenhoData = [
  { subject: "Atendimento", A: 120, fullMark: 150 },
  { subject: "Entrega", A: 98, fullMark: 150 },
  { subject: "Qualidade", A: 130, fullMark: 150 },
  { subject: "Preço", A: 90, fullMark: 150 },
  { subject: "Variedade", A: 110, fullMark: 150 },
]

const pedidosRecentes = [
  { id: "#001", cliente: "Maria Silva", status: "Pago", valor: "R$ 250,00" },
  { id: "#002", cliente: "João Santos", status: "Aguardando", valor: "R$ 120,00" },
  { id: "#003", cliente: "Ana Costa", status: "Pago", valor: "R$ 340,00" },
]

export default function DashboardPage() {
  return (
    <main className="p-6 space-y-8">
      {/* Header com título e botões */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Bem-vindo ao painel principal da QG Brightness.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="default" className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Nova Venda
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <UserPlus className="w-4 h-4" /> Novo Cliente
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Package className="w-4 h-4" /> Novo Produto
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" /> Registrar Pagamento
          </Button>
          <Button variant="secondary" className="flex items-center gap-2">
            <Download className="w-4 h-4" /> Exportar Relatórios
          </Button>
        </div>
      </div>

      {/* Indicadores rápidos */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>📈 Vendas do Dia</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">R$ 1.250,00</p>
            <p className="text-sm text-muted-foreground">+15% em relação a ontem</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>🛒 Pedidos em Andamento</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">8</p>
            <p className="text-sm text-muted-foreground">2 aguardando pagamento</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>💰 Caixa Atual</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">R$ 3.400,00</p>
            <p className="text-sm text-muted-foreground">Última atualização: 14h</p>
          </CardContent>
        </Card>
      </div>

      {/* Primeira linha de gráficos */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>📊 Vendas Semanais</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vendasData}>
                <XAxis dataKey="dia" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="valor" fill="#3b82f6" radius={[4, 4, 0, 0]} />
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
                <Line type="monotone" dataKey="pedidos" stroke="#10b981" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Segunda linha de gráficos */}
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
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de últimos pedidos */}
      <Card>
        <CardHeader><CardTitle>📋 Últimos Pedidos</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pedidosRecentes.map((pedido) => (
                <TableRow key={pedido.id}>
                  <TableCell>{pedido.id}</TableCell>
                  <TableCell>{pedido.cliente}</TableCell>
                  <TableCell>{pedido.status}</TableCell>
                  <TableCell>{pedido.valor}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  )
}