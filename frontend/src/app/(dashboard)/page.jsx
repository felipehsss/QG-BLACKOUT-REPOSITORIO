'use client';

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { AlertCircle, Package, Users, Store, TrendingUp, DollarSign, ShoppingCart, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from "recharts";

// Serviços
import { readAll as listarVendas } from "@/services/vendaService";
import { readAll as listarFuncionarios } from "@/services/funcionarioService";
import { readAll as listarLojas } from "@/services/lojaService";
import { readAll as listarProdutos } from "@/services/produtoService"; // Ou estoqueService se tiver
import { readAll as listarLancamentos } from "@/services/financeiroService";

// --- Funções Auxiliares ---
const formatCurrency = (value) => {
  const numericValue = Number(value) || 0;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numericValue);
};

const formatDateShort = (dateString) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  } catch {
    return '-';
  }
};

// --- Componente Principal ---
export default function DashboardPage() {
  // Pegamos 'lojaSelecionada' do contexto para saber o que filtrar
  const { token, isLoading: authLoading, lojaSelecionada } = useAuth();

  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dados Brutos (Todos)
  const [rawVendas, setRawVendas] = useState([]);
  const [rawFinanceiro, setRawFinanceiro] = useState([]);
  const [rawProdutos, setRawProdutos] = useState([]);
  const [rawLojas, setRawLojas] = useState([]);
  const [rawFuncionarios, setRawFuncionarios] = useState([]);

  // Carregamento Inicial dos Dados
  useEffect(() => {
    if (authLoading || !token) return;

    async function fetchData() {
      try {
        setDataLoading(true);
        setError(null);

        // Busca tudo (O Admin tem permissão para ver tudo)
        const [vendas, funcionarios, lojas, produtos, financeiro] = await Promise.all([
          listarVendas(token).catch(() => []),
          listarFuncionarios(token).catch(() => []),
          listarLojas(token).catch(() => []),
          listarProdutos(token).catch(() => []),
          listarLancamentos(token).catch(() => []),
        ]);

        setRawVendas(Array.isArray(vendas) ? vendas : []);
        setRawFuncionarios(Array.isArray(funcionarios) ? funcionarios : []);
        setRawLojas(Array.isArray(lojas) ? lojas : []);
        setRawProdutos(Array.isArray(produtos) ? produtos : []); // Nota: idealmente usar estoqueService para qtd exata por loja
        setRawFinanceiro(Array.isArray(financeiro) ? financeiro : []);

      } catch (err) {
        console.error("Erro no dashboard:", err);
        setError("Falha ao carregar dados. Verifique a conexão.");
        toast.error("Erro ao atualizar dashboard.");
      } finally {
        setDataLoading(false);
      }
    }

    fetchData();
  }, [token, authLoading]);

  // --- Lógica de Filtragem e Cálculo (Memoized) ---
  // Isso roda automaticamente sempre que 'lojaSelecionada' ou os dados mudam
  const dashboardData = useMemo(() => {
    const lojaId = lojaSelecionada?.id;
    const isGlobal = !lojaId || lojaSelecionada?.plan === "Matriz" || lojaSelecionada?.tipo === "Matriz"; // Ajuste conforme seu objeto de loja

    // 1. Filtrar Vendas
    const vendasFiltradas = rawVendas.filter(v => isGlobal || v.loja_id === lojaId);
    
    // 2. Filtrar Financeiro
    const financeiroFiltrado = rawFinanceiro.filter(f => isGlobal || f.loja_id === lojaId);

    // 3. Filtrar Funcionários (Assumindo que funcionário tem loja_id)
    const funcionariosFiltrados = rawFuncionarios.filter(f => isGlobal || f.loja_id === lojaId);

    // 4. Filtrar Lojas (Para contagem)
    const lojasAtivas = isGlobal ? rawLojas.length : 1;

    // 5. Calcular Totais
    const totalVendasValor = vendasFiltradas.reduce((acc, v) => acc + (Number(v.valor_total) || 0), 0);
    const totalVendasCount = vendasFiltradas.length;
    const totalFuncionariosCount = funcionariosFiltrados.length;

    // 6. Produtos (Estoque Crítico)
    // Se a API de produtos for global, o filtro por loja é difícil sem a tabela de estoque. 
    // Vamos assumir global ou filtrar se houver loja_id no produto (raro, geralmente é na tabela estoque).
    // Aqui usamos a contagem bruta global ou tentamos filtrar se possível.
    const criticalStock = rawProdutos.filter(p => (Number(p.quantidade) || 0) < 5).length;

    // 7. Preparar Gráfico (Financeiro - Últimos 30 dias)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyRevenueMap = {};
    
    financeiroFiltrado.forEach(lanc => {
      if (!lanc.data_movimento) return;
      const d = new Date(lanc.data_movimento);
      if (d < thirtyDaysAgo) return;

      const dateKey = d.toISOString().split('T')[0]; // YYYY-MM-DD
      const val = Number(lanc.valor) || 0;
      const tipo = (lanc.tipo || "").toLowerCase();

      if (!dailyRevenueMap[dateKey]) dailyRevenueMap[dateKey] = { receita: 0, despesa: 0 };

      if (tipo === 'entrada' || tipo === 'receita') dailyRevenueMap[dateKey].receita += val;
      else if (tipo === 'saída' || tipo === 'saida' || tipo === 'despesa') dailyRevenueMap[dateKey].despesa += val;
    });

    const chartData = Object.keys(dailyRevenueMap).sort().map(dateKey => ({
      name: formatDateShort(dateKey),
      date: dateKey,
      Receita: dailyRevenueMap[dateKey].receita,
      Despesa: dailyRevenueMap[dateKey].despesa,
      Lucro: dailyRevenueMap[dateKey].receita - dailyRevenueMap[dateKey].despesa
    }));

    // 8. Vendas Recentes (Enriquecidas)
    // Mapeamento para nomes rápidos
    const lojaMap = new Map(rawLojas.map(l => [l.loja_id, l.nome_fantasia || l.nome]));
    const funcMap = new Map(rawFuncionarios.map(f => [f.funcionario_id, f.nome_completo]));

    const recentSales = [...vendasFiltradas]
      .sort((a, b) => new Date(b.data_venda) - new Date(a.data_venda))
      .slice(0, 5)
      .map(v => ({
        ...v,
        lojaNome: lojaMap.get(v.loja_id) || "N/A",
        vendedorNome: funcMap.get(v.funcionario_id) || "N/A"
      }));

    return {
      totalVendasValor,
      totalVendasCount,
      totalFuncionariosCount,
      lojasAtivas,
      criticalStock,
      chartData,
      recentSales,
      isGlobal
    };

  }, [lojaSelecionada, rawVendas, rawFinanceiro, rawFuncionarios, rawLojas, rawProdutos]);


  // --- Renderização ---

  if (authLoading) return <div className="flex h-screen items-center justify-center">Verificando acesso...</div>;
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-destructive gap-4">
        <AlertCircle className="h-12 w-12" />
        <p className="text-lg font-medium">{error}</p>
        <Button onClick={() => window.location.reload()}>Recarregar Página</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-[1600px] mx-auto">
      {/* Cabeçalho Dinâmico */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Dashboard {dashboardData.isGlobal ? "- Rede Completa" : `- ${lojaSelecionada.name}`}
          </h1>
          <p className="text-muted-foreground">
            {dashboardData.isGlobal 
              ? "Visão consolidada de todas as filiais." 
              : "Visualizando métricas exclusivas desta unidade."}
          </p>
        </div>
        <div className="flex items-center gap-2">
            {/* Botões de ação rápida globais */}
            <Button>
                <TrendingUp className="mr-2 h-4 w-4" /> Relatório Completo
            </Button>
        </div>
      </div>

      {/* Cards de KPI */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(dashboardData.totalVendasValor)}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardData.totalVendasCount} vendas realizadas
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lojas Ativas</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.lojasAtivas}</div>
            <p className="text-xs text-muted-foreground">Unidades operacionais</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos Críticos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.criticalStock}</div>
            <p className="text-xs text-muted-foreground text-orange-600 font-medium">
              Abaixo do estoque mínimo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Equipe</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.totalFuncionariosCount}</div>
            <p className="text-xs text-muted-foreground">Colaboradores registrados</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico e Lista */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        
        {/* Gráfico Principal */}
        <Card className="col-span-1 lg:col-span-4">
          <CardHeader>
            <CardTitle>Fluxo de Caixa</CardTitle>
            <CardDescription>Receitas e Despesas dos últimos 30 dias</CardDescription>
          </CardHeader>
          <CardContent className="pl-0">
            <div className="h-[350px] w-full">
              {dashboardData.chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dashboardData.chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis 
                        dataKey="name" 
                        stroke="#888888" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false} 
                        minTickGap={30}
                    />
                    <YAxis 
                        stroke="#888888" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false} 
                        tickFormatter={(val) => `R$${val/1000}k`} 
                    />
                    <Tooltip 
                        contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px" }}
                        formatter={(val) => formatCurrency(val)}
                    />
                    <Legend verticalAlign="top" height={36}/>
                    <Line type="monotone" dataKey="Receita" stroke="#16a34a" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="Despesa" stroke="#dc2626" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  <TrendingUp className="h-8 w-8 mr-2 opacity-50" />
                  <p>Sem dados financeiros para o período.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Últimas Vendas */}
        <Card className="col-span-1 lg:col-span-3">
          <CardHeader>
            <CardTitle>Últimas Vendas</CardTitle>
            <CardDescription>
               {dashboardData.recentSales.length} registros mais recentes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {dashboardData.recentSales.length > 0 ? (
                dashboardData.recentSales.map((venda) => (
                  <div key={venda.venda_id || Math.random()} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {venda.lojaNome}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {venda.vendedorNome}
                      </p>
                    </div>
                    <div className="text-right">
                        <div className="font-bold">{formatCurrency(venda.valor_total)}</div>
                        <div className="text-xs text-muted-foreground">{formatDateShort(venda.data_venda)}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                   <ShoppingCart className="mx-auto h-8 w-8 opacity-50 mb-2" />
                   Nenhuma venda registrada.
                </div>
              )}
            </div>
            {dashboardData.recentSales.length > 0 && (
                <Button variant="ghost" className="w-full mt-4" size="sm">
                    Ver todas <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}