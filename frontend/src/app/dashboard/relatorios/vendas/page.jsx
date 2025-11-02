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
import { vendaService } from "@/services/vendaService"
import { toast } from "sonner"

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

  // Carrega os dados do backend
  React.useEffect(() => {
    const carregarVendas = async () => {
      setIsLoading(true);
      try {
        // Define os parâmetros de data para a requisição
        const params = {};
        if (date?.from) {
          params.inicio = date.from.toISOString();
        }
        if (date?.to) {
          params.fim = date.to.toISOString();
        }

        const vendasData = await vendaService.listar(params);
        
        // Transforma os dados do backend para o formato esperado pela UI
        const vendasFormatadas = vendasData.map((venda) => ({
          id: venda.venda_id?.toString() || venda.id?.toString() || "",
          data: venda.data_venda || venda.created_at || new Date().toISOString(),
          loja: venda.nome_loja || venda.loja || "N/A",
          funcionario: venda.nome_funcionario || venda.funcionario || "N/A",
          valorTotal: parseFloat(venda.valor_total || 0),
          status: venda.status_venda || venda.status || "Concluída",
        }));

        setAllVendas(vendasFormatadas);
      } catch (error) {
        console.error("Erro ao carregar vendas:", error);
        toast.error("Erro ao carregar vendas: " + (error.message || "Erro desconhecido"));
        setAllVendas([]);
      } finally {
        setIsLoading(false);
      }
    };

    carregarVendas();
  }, [date]);

  // As vendas já vêm filtradas do backend, então usamos diretamente
  const vendasFiltradas = allVendas;

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