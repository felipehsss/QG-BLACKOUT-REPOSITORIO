"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { 
  getDashboardKPIs, 
  getDashboardCategorias, 
  getDashboardFormasPagamento,
  getDashboardAnual 
} from "@/services/financeiroService";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DateRangePicker } from "@/components/date-range-picker";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
// CORREÇÃO: LabelList adicionado aos imports
import { 
  Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis, 
  Pie, PieChart, Label, Cell, LabelList 
} from "recharts";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from "@/components/ui/chart";
import { Loader2, TrendingUp, TrendingDown, Wallet, Calendar as CalendarIcon, CreditCard, PieChart as PieChartIcon } from "lucide-react";

export default function FinanceiroDashboard() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  
  // Data padrão: últimos 30 dias
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date()
  });

  const [kpis, setKpis] = useState({ total_entradas: 0, total_saidas: 0, saldo_periodo: 0 });
  const [pieData, setPieData] = useState([]); // Categorias (Saídas)
  const [paymentData, setPaymentData] = useState([]); // Formas de Pagamento (Entradas)
  const [areaData, setAreaData] = useState([]); // Evolução Anual

  // Cores do Tema Shadcn (Mapeamento CSS)
  const chartConfig = {
    entradas: { label: "Receitas", color: "hsl(var(--chart-2))" }, // Verde/Teal
    saidas: { label: "Despesas", color: "hsl(var(--chart-5))" },   // Vermelho/Laranja
    saldo: { label: "Saldo", color: "hsl(var(--primary))" },
    // Cores genéricas para categorias
    cat1: { color: "hsl(var(--chart-1))" },
    cat2: { color: "hsl(var(--chart-2))" },
    cat3: { color: "hsl(var(--chart-3))" },
    cat4: { color: "hsl(var(--chart-4))" },
    cat5: { color: "hsl(var(--chart-5))" },
  };

  const loadDashboard = async () => {
    if (!token || !dateRange?.from || !dateRange?.to) return;
    
    setLoading(true);
    try {
      const inicio = dateRange.from.toISOString().split('T')[0];
      const fim = dateRange.to.toISOString().split('T')[0];
      const anoAtual = new Date().getFullYear();

      const [kpiRes, catRes, payRes, anualRes] = await Promise.all([
        getDashboardKPIs(inicio, fim, token),
        getDashboardCategorias('Saída', inicio, fim, token),
        getDashboardFormasPagamento('Entrada', inicio, fim, token), // Entradas por forma de pgto
        getDashboardAnual(anoAtual, token)
      ]);

      setKpis(kpiRes || { total_entradas: 0, total_saidas: 0, saldo_periodo: 0 });
      
      // Formata dados Pie Chart com cores cíclicas
      const formattedPie = (catRes || []).map((item, index) => ({
        ...item,
        fill: `hsl(var(--chart-${(index % 5) + 1}))`
      }));
      setPieData(formattedPie);

      // Formata dados Bar Chart (Pagamentos)
      const formattedPay = (payRes || []).map((item, index) => ({
        ...item,
        fill: `hsl(var(--chart-${(index % 5) + 1}))`
      }));
      setPaymentData(formattedPay);

      setAreaData(anualRes || []);

    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [token]); 

  const formatMoney = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

  return (
    <div className="flex flex-col gap-6 p-6 animate-in fade-in duration-500">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Financeiro</h1>
          <p className="text-muted-foreground">Análise em tempo real do seu negócio.</p>
        </div>
        <div className="flex items-center gap-2 bg-card p-1 rounded-lg border shadow-sm">
          <DateRangePicker date={dateRange} setDate={setDateRange} />
          <Button onClick={loadDashboard} disabled={loading} size="icon" variant="ghost">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarIcon className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <Separator />

      {/* --- CARDS DE KPI (Indicadores) --- */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-l-4 border-l-emerald-500 shadow-md transition-all hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Receita Total</CardTitle>
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
              <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatMoney(kpis.total_entradas)}</div>
            <p className="text-xs text-muted-foreground mt-1">No período selecionado</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-rose-500 shadow-md transition-all hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Despesas</CardTitle>
            <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-full">
              <TrendingDown className="h-4 w-4 text-rose-600 dark:text-rose-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">{formatMoney(kpis.total_saidas)}</div>
            <p className="text-xs text-muted-foreground mt-1">No período selecionado</p>
          </CardContent>
        </Card>

        <Card className={`border-l-4 shadow-md transition-all hover:shadow-lg ${kpis.saldo_periodo < 0 ? 'border-l-orange-500' : 'border-l-blue-500'}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Lucro Líquido</CardTitle>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <Wallet className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${kpis.saldo_periodo < 0 ? 'text-orange-600' : 'text-blue-600 dark:text-blue-400'}`}>
              {formatMoney(kpis.saldo_periodo)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Balanço final do caixa</p>
          </CardContent>
        </Card>
      </div>

      {/* --- GRÁFICOS PRINCIPAIS --- */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        
        {/* 1. GRÁFICO DE ÁREA (Evolução Financeira) - "O Gráfico em Linha Realista" */}
        <Card className="col-span-4 lg:col-span-4 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Evolução do Fluxo de Caixa
            </CardTitle>
            <CardDescription>Comparativo mensal de entradas e saídas (Ano Atual).</CardDescription>
          </CardHeader>
          <CardContent className="pl-0">
            <ChartContainer config={chartConfig} className="aspect-[16/9] w-full max-h-[350px]">
              <AreaChart data={areaData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="fillEntradas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-entradas)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--color-entradas)" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="fillSaidas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-saidas)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--color-saidas)" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="mes" 
                  tickLine={false} 
                  axisLine={false} 
                  tickMargin={8}
                  tickFormatter={(val) => ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"][val-1]}
                />
                <YAxis 
                  tickFormatter={(val) => `R$ ${(val/1000).toFixed(0)}k`} 
                  axisLine={false}
                  tickLine={false}
                  width={60}
                />
                <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                <ChartLegend content={<ChartLegendContent />} />
                
                <Area 
                  type="monotone" 
                  dataKey="entradas" 
                  name="Receitas"
                  stroke="var(--color-entradas)" 
                  fill="url(#fillEntradas)" 
                  strokeWidth={3}
                />
                <Area 
                  type="monotone" 
                  dataKey="saidas" 
                  name="Despesas"
                  stroke="var(--color-saidas)" 
                  fill="url(#fillSaidas)" 
                  strokeWidth={3}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* 2. GRÁFICO DE ROSCA (Despesas por Categoria) */}
        <Card className="col-span-4 lg:col-span-3 shadow-md flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-primary" />
              Despesas por Categoria
            </CardTitle>
            <CardDescription>Onde seu dinheiro está sendo gasto.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            {pieData.length > 0 ? (
              <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[300px]">
                <PieChart>
                  <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                  <Pie
                    data={pieData}
                    dataKey="total"
                    nameKey="nome"
                    innerRadius={70}
                    outerRadius={100}
                    strokeWidth={2}
                    paddingAngle={2}
                  >
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                          return (
                            <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                              <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">
                                {pieData.length}
                              </tspan>
                              <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="fill-muted-foreground text-xs">
                                Categorias
                              </tspan>
                            </text>
                          )
                        }
                      }}
                    />
                  </Pie>
                  <ChartLegend content={<ChartLegendContent />} className="flex-wrap gap-2 mt-4" />
                </PieChart>
              </ChartContainer>
            ) : (
                <div className="flex h-[250px] items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
                    Sem dados de despesas
                </div>
            )}
          </CardContent>
        </Card>

        {/* 3. GRÁFICO DE BARRAS (Formas de Pagamento) */}
        <Card className="col-span-4 lg:col-span-7 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Receita por Método de Pagamento
            </CardTitle>
            <CardDescription>Entenda como seus clientes preferem pagar.</CardDescription>
          </CardHeader>
          <CardContent>
            {paymentData.length > 0 ? (
              <ChartContainer config={chartConfig} className="w-full max-h-[250px]">
                <BarChart layout="vertical" data={paymentData} margin={{ left: 0, right: 20 }}>
                  <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                  <YAxis 
                    dataKey="forma_pagamento" 
                    type="category" 
                    tickLine={false} 
                    axisLine={false}
                    width={100}
                    className="text-xs font-medium"
                  />
                  <XAxis type="number" hide />
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  <Bar dataKey="total" radius={[0, 4, 4, 0]} barSize={30}>
                    <LabelList dataKey="total" position="right" formatter={(val) => formatMoney(val)} className="fill-foreground text-xs" />
                    {paymentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="flex h-[150px] items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
                  Sem dados de pagamentos
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}