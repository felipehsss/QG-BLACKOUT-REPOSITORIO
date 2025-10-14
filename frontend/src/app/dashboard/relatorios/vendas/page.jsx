"use client"



import * as React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { MoreHorizontal, DollarSign, ShoppingCart, BarChart, XCircle, FileDown, Calendar as CalendarIcon, PackageSearch } from "lucide-react"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DateRangePicker } from "@/components/date-range-picker"
import { addDays } from "date-fns"


// --- DADOS DE EXEMPLO ---
// No futuro, isso virá do seu backend, baseado na tabela de vendas.
const vendas = [
  {
    id: "VDA-001",
    data: "2024-07-01T10:30:00",
    loja: "Matriz - Centro",
    funcionario: "Ana Silva",
    valorTotal: 1550.75,
    status: "Concluída",
  },
  {
    id: "VDA-002",
    data: "2024-07-01T14:15:00",
    loja: "Filial - Shopping",
    funcionario: "Carlos Souza",
    valorTotal: 850.00,
    status: "Concluída",
  },
  {
    id: "VDA-003",
    data: "2024-07-02T11:00:00",
    loja: "Matriz - Centro",
    funcionario: "Beatriz Costa",
    valorTotal: 2340.50,
    status: "Concluída",
  },
  {
    id: "VDA-004",
    data: "2024-07-03T16:45:00",
    loja: "Matriz - Centro",
    funcionario: "Ana Silva",
    valorTotal: 450.00,
    status: "Cancelada",
  },
  {
    id: "VDA-005",
    data: "2024-07-05T18:00:00",
    loja: "Filial - Shopping",
    funcionario: "Mariana Lima",
    valorTotal: 3120.00,
    status: "Concluída",
  },
  {
    id: "VDA-006",
    data: "2024-07-06T12:00:00",
    loja: "Matriz - Centro",
    funcionario: "Beatriz Costa",
    valorTotal: 1780.25,
    status: "Concluída",
  },
];

// --- FUNÇÕES AUXILIARES ---

const formatCurrency = (value) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("pt-BR", {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

const getBadgeVariant = (status) => {
  switch (status) {
    case "Concluída":
      return "default";
    case "Cancelada":
      return "destructive";
    default:
      return "outline";
  }
}

// --- COMPONENTES DA PÁGINA ---

function SalesKpiCard({ title, value, icon: Icon, description, format = "default" }) {
  const formattedValue = format === "currency" ? formatCurrency(value) : value;
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formattedValue}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function SalesKpiSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-24 mb-2" />
        <Skeleton className="h-3 w-48" />
      </CardContent>
    </Card>
  );
}

export default function RelatorioVendasPage() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [allVendas, setAllVendas] = React.useState([]);
  const [date, setDate] = React.useState({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  // Simula o carregamento dos dados do backend
  React.useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setAllVendas(vendas);
      setIsLoading(false);
    }, 1000); // Simula 1 segundo de delay da rede
  }, []);

  // Filtra as vendas com base no período selecionado
  const vendasFiltradas = React.useMemo(() => {
    if (!date?.from) return allVendas;
    const fromDate = new Date(date.from);
    fromDate.setHours(0, 0, 0, 0);

    const toDate = date.to ? new Date(date.to) : new Date(date.from);
    toDate.setHours(23, 59, 59, 999);

    return allVendas.filter(venda => {
      const vendaDate = new Date(venda.data);
      return vendaDate >= fromDate && vendaDate <= toDate;
    });
  }, [allVendas, date]);

  // Calcula os KPIs com base nas vendas filtradas
  const kpis = React.useMemo(() => {
    const vendasConcluidas = vendasFiltradas.filter(v => v.status === 'Concluída');
    const receitaTotal = vendasConcluidas.reduce((acc, v) => acc + v.valorTotal, 0);
    const totalVendas = vendasConcluidas.length;
    const ticketMedio = totalVendas > 0 ? receitaTotal / totalVendas : 0;
    const vendasCanceladas = vendasFiltradas.filter(v => v.status === 'Cancelada').length;

    return { receitaTotal, totalVendas, ticketMedio, vendasCanceladas };
  }, [vendasFiltradas]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Relatório de Vendas</h1>
          <p className="text-muted-foreground hidden md:block">
            Analise o desempenho de vendas da sua empresa.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <DateRangePicker date={date} setDate={setDate} />
          <Button>
            <FileDown className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* --- CARDS DE RESUMO (KPIs) --- */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <SalesKpiSkeleton />
          <SalesKpiSkeleton />
          <SalesKpiSkeleton />
          <SalesKpiSkeleton />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <SalesKpiCard title="Receita Total" value={kpis.receitaTotal} icon={DollarSign} description="Soma das vendas concluídas." format="currency" />
          <SalesKpiCard title="Ticket Médio" value={kpis.ticketMedio} icon={BarChart} description="Valor médio por venda." format="currency" />
          <SalesKpiCard title="Total de Vendas" value={`+${kpis.totalVendas}`} icon={ShoppingCart} description="Vendas concluídas no período." />
          <SalesKpiCard title="Vendas Canceladas" value={kpis.vendasCanceladas} icon={XCircle} description="Vendas que foram canceladas." />
        </div>
      )}

      {/* --- GRÁFICO --- */}
      <ChartAreaInteractive />

      {/* --- TABELA DE VENDAS --- */}
      <Card>
        <CardHeader className="px-7">
          <CardTitle>Detalhes das Vendas</CardTitle>
          <CardDescription>
            Lista de todas as vendas registradas no período selecionado.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3 mt-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : vendasFiltradas.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID da Venda</TableHead>
                  <TableHead className="hidden sm:table-cell">Data e Hora</TableHead>
                  <TableHead className="hidden sm:table-cell">Loja</TableHead>
                  <TableHead className="hidden md:table-cell">Funcionário</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Valor Total</TableHead>
                  <TableHead><span className="sr-only">Ações</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendasFiltradas.map((venda) => (
                  <TableRow key={venda.id}>
                    <TableCell className="font-medium">{venda.id}</TableCell>
                    <TableCell className="hidden sm:table-cell">{formatDateTime(venda.data)}</TableCell>
                    <TableCell className="hidden sm:table-cell">{venda.loja}</TableCell>
                    <TableCell className="hidden md:table-cell">{venda.funcionario}</TableCell>
                    <TableCell>
                      <Badge variant={getBadgeVariant(venda.status)}>{venda.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(venda.valorTotal)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuItem>Ver Detalhes</DropdownMenuItem>
                          <DropdownMenuItem>Cancelar Venda</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
              <PackageSearch className="h-16 w-16 text-muted-foreground" />
              <h3 className="text-xl font-semibold">Nenhuma venda encontrada</h3>
              <p className="text-muted-foreground">Não há vendas registradas para o período selecionado.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}