'use client';

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Package, Users, Store, TrendingUp, DollarSign, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

// Serviços
import { readAll as listarVendas } from "@/services/vendaService";
import { readAll as listarFuncionarios } from "@/services/funcionarioService";
import { readAll as listarLojas } from "@/services/lojaService";
import { readAll as listarProdutos } from "@/services/produtoService";
import { readAll as listarLancamentos } from "@/services/financeiroService";

// Novo componente
import { LojasTable } from "@/components/lojas/lojas-table";

// --- Funções Auxiliares ---
const formatCurrency = (value) => {
  let numericValue = 0;
  if (typeof value === 'number') numericValue = value;
  else if (typeof value === 'string') numericValue = parseFloat(value) || 0;

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numericValue);
};

const formatTime = (dateString) => {
  try {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Inválido';
  }
};

const formatDateShort = (dateString) => {
  try {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}`;
  } catch {
    return 'Inválido';
  }
};

// --- Componente Principal ---
export default function DashboardPage() {
  const [recentSales, setRecentSales] = useState([]);
  const [stockSummary, setStockSummary] = useState({ criticalCount: 0 });
  const [revenueData, setRevenueData] = useState([]);
  const [lojasData, setLojasData] = useState([]);
  const [produtosData, setProdutosData] = useState([]);

  const { token, isLoading: authLoading } = useAuth();
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (authLoading) {
      setDataLoading(true);
      return;
    }
    if (!token) {
      setDataLoading(false);
      setError("Token não encontrado. Por favor, faça login.");
      return;
    }

    async function fetchData() {
      try {
        setDataLoading(true);
        setError(null);

        const [
          vendasData,
          funcionariosData,
          lojasDataRaw,
          produtosData,
          lancamentosData,
        ] = await Promise.all([
          listarVendas(token),
          listarFuncionarios(token),
          listarLojas(token),
          listarProdutos(token),
          listarLancamentos(token),
        ]);

        // Estoque
        const criticalCount = (produtosData || []).filter(p => (p.quantidade || p.quantidade_estoque || 0) < 10).length;
        setStockSummary({ criticalCount });
        setProdutosData(produtosData || []);

        // Faturamento
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const safeLancamentosData = lancamentosData || [];

        const dailyRevenueMap = safeLancamentosData
          .filter(l => l.raw?.data_movimento && new Date(l.raw.data_movimento) >= thirtyDaysAgo)
          .reduce((acc, l) => {
            const date = l.raw.data_movimento.split('T')[0];
            const value = parseFloat(l.valor) || 0;

            if (!acc[date]) {
              acc[date] = { receita: 0, despesa: 0 };
            }

            // Corrigido: backend usa "Entrada" e "Saída"
            if (l.tipo?.toLowerCase() === 'entrada') {
              acc[date].receita += value;
            } else if (l.tipo?.toLowerCase() === 'saída') {
              acc[date].despesa += value;
            }

            return acc;
          }, {});


        const chartData = Object.keys(dailyRevenueMap)
          .map(date => ({
            name: formatDateShort(date),
            Faturamento: dailyRevenueMap[date],
            date,
          }))
          .sort((a, b) => new Date(a.date) - new Date(b.date));

        setRevenueData(chartData);

        // Vendas recentes
        const employeeMap = new Map(
          (funcionariosData || []).map(f => [f.funcionario_id ?? f.id, f.nome_completo])
        );

        // Lojas
        const storeMap = new Map(
          (lojasData || []).map(l => [l.loja_id ?? l.id_loja, l.nome_fantasia ?? l.nome])
        );

        // Vendas enriquecidas
        const richSales = (vendasData || [])
          .sort((a, b) => new Date(b.data_venda) - new Date(a.data_venda))
          .slice(0, 10)
          .map(venda => ({
            ...venda,
            vendedorNome: employeeMap.get(venda.funcionario_id) || "N/A",
            lojaNome: storeMap.get(venda.loja_id) || "N/A",
            status: venda.status_venda || "Concluída",
          }));
        setRecentSales(richSales);

        // Lojas
        setLojasData(lojasDataRaw || []);

      } catch (err) {
        const errorMessage = err.message || "Não foi possível carregar os dados.";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setDataLoading(false);
      }
    }


    fetchData();
  }, [token, authLoading]);

  if (error) {
    return <div className="flex items-center justify-center h-full text-red-600">{error}</div>;
  }

  if (authLoading || dataLoading) {
    return <div>Carregando...</div>;
  }

  // Calcular estatísticas adicionais
  const totalVendas = recentSales.length;
  const totalVendasValor = recentSales.reduce((acc, v) => acc + (parseFloat(v.valor_total) || 0), 0);
  const totalProdutos = produtosData.length;
  const totalLojas = lojasData.length;
  const totalFuncionarios = recentSales.length > 0 ? new Set(recentSales.filter(v => v.funcionario_id).map(v => v.funcionario_id)).size : 0;

  return (
    <div className="space-y-6">
      {/* KPIs Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Vendas (Hoje)</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVendas}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(totalVendasValor)} em vendas
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lojas Ativas</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLojas}</div>
            <p className="text-xs text-muted-foreground">
              Lojas cadastradas no sistema
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProdutos}</div>
            <p className={`text-xs ${stockSummary.criticalCount > 0 ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}>
              {stockSummary.criticalCount > 0 ? `${stockSummary.criticalCount} em nível crítico` : 'Todos os produtos OK'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendedores Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFuncionarios}</div>
            <p className="text-xs text-muted-foreground">
              Funcionários com vendas recentes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico e Ações Rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Fluxo Financeiro - Últimos 30 dias</CardTitle>
            <CardDescription>Receita, Despesa e Lucro líquido</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            {revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `R$${value / 1000}k`} />
                  <Tooltip formatter={(value, name) => [formatCurrency(value), name]} />
                  <Line type="monotone" dataKey="Receita" stroke="#16a34a" strokeWidth={2} />
                  <Line type="monotone" dataKey="Despesa" stroke="#dc2626" strokeWidth={2} />
                  <Line type="monotone" dataKey="Lucro" stroke="#2563eb" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">
                Nenhum dado financeiro encontrado nos últimos 30 dias.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ações rápidas e estoque */}
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Ações Rápidas</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <Button className="w-full">Nova Venda</Button>
                <Button variant="outline" className="w-full">Cadastrar Produto</Button>
                <Button variant="ghost" className="w-full">Abrir Caixa</Button>
                <Button variant="link" className="w-full">Gerar Relatório</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Vendas recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Vendas Recentes</CardTitle>
          <CardDescription>Últimas 10 vendas registradas</CardDescription>
        </CardHeader>
        <CardContent>
          {recentSales.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Horário</TableHead>
                  <TableHead>Filial</TableHead>
                  <TableHead>Vendedor</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentSales.map((venda, idx) => (
                  <TableRow key={venda.id_venda ?? idx}>
                    <TableCell>{formatTime(venda.data_venda)}</TableCell>
                    <TableCell>{venda.lojaNome}</TableCell>
                    <TableCell>{venda.vendedorNome}</TableCell>
                    <TableCell className="font-semibold">{formatCurrency(venda.valor_total)}</TableCell>
                    <TableCell>{venda.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex items-center justify-center p-12 text-muted-foreground">
              Nenhuma venda recente encontrada.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

