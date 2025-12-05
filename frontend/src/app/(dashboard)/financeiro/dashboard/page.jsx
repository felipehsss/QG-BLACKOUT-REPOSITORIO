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
import { TrendingUp, TrendingDown, Wallet, CreditCard, PieChart as PieChartIcon } from "lucide-react";

// Paleta de cores vibrantes
const COLOR_PALETTE = [
  "#ef4444", "#f97316", "#eab308", "#10b981", "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899"
];

export default function FinanceiroDashboard() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date()
  });

  const [kpis, setKpis] = useState({ total_entradas: 0, total_saidas: 0, saldo_periodo: 0 });
  const [pieData, setPieData] = useState([]); 
  const [paymentData, setPaymentData] = useState([]); 
  const [areaData, setAreaData] = useState([]); 

  // Transforma chartConfig em state para aceitar categorias dinâmicas
  const [chartConfig, setChartConfig] = useState({
    entradas: { label: "Receitas", color: "#10b981" },
    saidas: { label: "Despesas", color: "#ef4444" },
    saldo: { label: "Saldo", color: "#3b82f6" },
  });

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
        getDashboardFormasPagamento('Entrada', inicio, fim, token),
        getDashboardAnual(anoAtual, token)
      ]);

      setKpis(kpiRes || { total_entradas: 0, total_saidas: 0, saldo_periodo: 0 });
      
      // --- CORREÇÃO DO GRÁFICO DE PIZZA (Despesas) ---
      const newConfig = { ...chartConfig };
      
      const formattedPie = (catRes || []).map((item, index) => {
        const color = COLOR_PALETTE[index % COLOR_PALETTE.length];
        const nomeCategoria = item.nome || "Sem Categoria";

        // Adiciona a categoria dinamicamente na configuração para a legenda funcionar
        newConfig[nomeCategoria] = {
            label: nomeCategoria,
            color: color
        };

        return {
            ...item,
            nome: nomeCategoria,
            // CORREÇÃO CRÍTICA: Converte string "3200.00" para número 3200.00
            total: Number(item.total || 0),
            fill: color
        };
      });
      
      setChartConfig(newConfig); // Atualiza config com as novas categorias
      setPieData(formattedPie);

      // --- Formatação Pagamentos ---
      const formattedPay = (payRes || []).map((item, index) => ({
        ...item,
        total: Number(item.total || 0), // Garante número aqui também
        fill: COLOR_PALETTE[(index + 3) % COLOR_PALETTE.length]
      }));
      setPaymentData(formattedPay);

      // --- Dados Anuais ---
      const dadosNormalizados = Array.from({ length: 12 }, (_, i) => {
        const mesIndex = i + 1;
        const dadoEncontrado = (anualRes || []).find(d => Number(d.mes) === mesIndex);
        
        return {
          mes: mesIndex,
          entradas: Number(dadoEncontrado?.entradas || 0),
          saidas: Number(dadoEncontrado?.saidas || 0)
        };
      });

      const chartAreaData = dadosNormalizados.map(d => ({
        mes: d.mes,
        entradas: d.entradas,
        saidas: -(Math.abs(d.saidas)) // Exibe despesas negativas no gráfico de área
      }));

      setAreaData(chartAreaData);

    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [token, dateRange]); 

  const formatMoney = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

  return (
    <div className="flex flex-col gap-6 p-6 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Financeiro</h1>
          <p className="text-muted-foreground">Análise em tempo real do seu negócio.</p>
        </div>
        <div className="flex items-center gap-2 bg-card p-1 rounded-lg border shadow-sm">
           <DateRangePicker 
             date={dateRange} 
             setDate={(newDate) => setDateRange(newDate)} 
           />
        </div>
      </div>

      <Separator />

      {/* KPIS */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-l-4 border-l-emerald-500 shadow-md">
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

        <Card className="border-l-4 border-l-red-500 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Despesas</CardTitle>
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
              <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{formatMoney(kpis.total_saidas)}</div>
            <p className="text-xs text-muted-foreground mt-1">No período selecionado</p>
          </CardContent>
        </Card>

        <Card className={`border-l-4 shadow-md ${kpis.saldo_periodo < 0 ? 'border-l-orange-500' : 'border-l-blue-500'}`}>
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        
        {/* GRÁFICO DE FLUXO DE CAIXA */}
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
                    <stop offset="5%" stopColor={chartConfig.entradas.color} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={chartConfig.entradas.color} stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="fillSaidas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartConfig.saidas.color} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={chartConfig.saidas.color} stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" />
                
                <XAxis 
                  dataKey="mes" 
                  tickLine={false} 
                  axisLine={false} 
                  tickMargin={8}
                  tick={{ fill: 'var(--muted-foreground)' }} 
                  tickFormatter={(val) => ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"][val-1]}
                />
                <YAxis 
                  tick={{ fill: 'var(--muted-foreground)' }}
                  tickFormatter={(val) => new Intl.NumberFormat('pt-BR', { notation: "compact", compactDisplay: "short", style: "currency", currency: "BRL" }).format(Math.abs(val))} 
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
                  stroke={chartConfig.entradas.color}
                  fill="url(#fillEntradas)" 
                  strokeWidth={3}
                />
                <Area 
                  type="monotone" 
                  dataKey="saidas" 
                  name="Despesas"
                  stroke={chartConfig.saidas.color}
                  fill="url(#fillSaidas)" 
                  strokeWidth={3}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* PIE CHART */}
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
                    innerRadius={65}
                    outerRadius={100}
                    strokeWidth={2}
                    paddingAngle={2}
                    stroke="var(--card)"
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
                <div className="flex h-[250px] items-center justify-center text-muted-foreground border-2 border-dashed border-muted rounded-lg m-4 flex-col text-center p-4">
                    <p>Sem dados de despesas</p>
                    <p className="text-xs mt-2">Verifique se a data selecionada (Nov 2025?) contém registros.</p>
                </div>
            )}
          </CardContent>
        </Card>

        {/* BAR CHART */}
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
              <ChartContainer config={chartConfig} className="w-full max-h-[300px]">
                <BarChart layout="vertical" data={paymentData} margin={{ left: 0, right: 40, top: 10, bottom: 10 }}>
                  <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="var(--border)" />
                  <YAxis 
                    dataKey="forma_pagamento" 
                    type="category" 
                    tickLine={false} 
                    axisLine={false}
                    width={120}
                    tick={{ fill: 'var(--foreground)', fontSize: 12, fontWeight: 500 }}
                  />
                  <XAxis type="number" hide />
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  <Bar dataKey="total" radius={[0, 4, 4, 0]} barSize={32}>
                    <LabelList 
                      dataKey="total" 
                      position="right" 
                      formatter={(val) => formatMoney(val)} 
                      className="fill-foreground text-xs font-bold" 
                    />
                    {paymentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="flex h-[150px] items-center justify-center text-muted-foreground border-2 border-dashed border-muted rounded-lg m-4">
                  Sem dados de pagamentos
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}