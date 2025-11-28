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
  Legend
} from "recharts";

// Serviços
import { readAll as listarVendas } from "@/services/vendaService";
import { readAll as listarFuncionarios } from "@/services/funcionarioService";
import { readAll as listarLojas } from "@/services/lojaService";
import { readAll as listarProdutos } from "@/services/produtoService";
import { readAll as listarLancamentos } from "@/services/financeiroService";

// Novo componente (se existir no seu projeto)
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
    // dateString espera formato YYYY-MM-DD ou ISO
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
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
      return;
    }
    if (!token) {
      setDataLoading(false);
      // O AuthContext geralmente redireciona, mas definimos erro por segurança
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
          produtosDataResponse,
          lancamentosData,
        ] = await Promise.all([
          listarVendas(token),
          listarFuncionarios(token),
          listarLojas(token),
          listarProdutos(token),
          listarLancamentos(token),
        ]);

        // Estoque
        const criticalCount = (produtosDataResponse || []).filter(p => (p.quantidade || p.quantidade_estoque || 0) < 10).length;
        setStockSummary({ criticalCount });
        setProdutosData(produtosDataResponse || []);

        // --- Lógica do Gráfico Financeiro Corrigida ---
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const safeLancamentosData = Array.isArray(lancamentosData) ? lancamentosData : [];

        const dailyRevenueMap = safeLancamentosData
          .filter(l => {
            if (!l.data_movimento) return false;
            const d = new Date(l.data_movimento);
            return d >= thirtyDaysAgo;
          })
          .reduce((acc, l) => {
            // Extrai apenas a parte da data YYYY-MM-DD
            const dateObj = new Date(l.data_movimento);
            const dateKey = dateObj.toISOString().split('T')[0]; 
            
            const value = parseFloat(l.valor) || 0;

            if (!acc[dateKey]) {
              acc[dateKey] = { receita: 0, despesa: 0 };
            }

            // Normaliza o tipo para comparação (o banco pode retornar "Entrada" ou "Saída")
            const tipo = l.tipo?.toLowerCase();

            if (tipo === 'entrada') {
              acc[dateKey].receita += value;
            } else if (tipo === 'saída' || tipo === 'saida') {
              acc[dateKey].despesa += value;
            }

            return acc;
          }, {});

        const chartData = Object.keys(dailyRevenueMap)
          .map(dateKey => ({
            name: formatDateShort(dateKey), // Label do Eixo X (DD/MM)
            date: dateKey,                  // Para ordenação correta
            Receita: dailyRevenueMap[dateKey].receita,
            Despesa: dailyRevenueMap[dateKey].despesa,
            Lucro: dailyRevenueMap[dateKey].receita - dailyRevenueMap[dateKey].despesa
          }))
          .sort((a, b) => new Date(a.date) - new Date(b.date));

        setRevenueData(chartData);
        // ---------------------------------------------

        // Vendas recentes (Enriquecimento de dados)
        const employeeMap = new Map(
          (funcionariosData || []).map(f => [f.funcionario_id ?? f.id, f.nome_completo])
        );

        const storeMap = new Map(
          (lojasDataRaw || []).map(l => [l.loja_id ?? l.id_loja, l.nome_fantasia ?? l.nome])
        );

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
        setLojasData(lojasDataRaw || []);

      } catch (err) {
        console.error("Erro no dashboard:", err);
        const errorMessage = err.message || "Não foi possível carregar os dados.";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setDataLoading(false);
      }
    }

    fetchData();
  }, [token, authLoading]);

  if (authLoading) return <div className="flex items-center justify-center h-screen">Carregando autenticação...</div>;
  if (dataLoading) return <div className="flex items-center justify-center h-screen">Carregando dashboard...</div>;
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-red-600">
        <AlertCircle className="h-10 w-10 mb-2" />
        <p>{error}</p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>Tentar Novamente</Button>
      </div>
    );
  }

  // Calcular estatísticas gerais
  const totalVendas = recentSales.length; // Nota: Isso mostra apenas as 10 recentes. Se quiser total real, use vendasData.length se disponível no escopo ou calcule na API.
  // Para o valor total, idealmente somaríamos todas as vendas, mas aqui usamos as recentes como exemplo ou o que veio da API
  const totalVendasValor = recentSales.reduce((acc, v) => acc + (parseFloat(v.valor_total) || 0), 0);
  
  const totalProdutos = produtosData.length;
  const totalLojas = lojasData.length;
  // Conta funcionarios unicos nas vendas recentes (apenas exemplo visual)
  const totalFuncionarios = recentSales.length > 0 ? new Set(recentSales.filter(v => v.funcionario_id).map(v => v.funcionario_id)).size : 0;

  return (
    <div className="space-y-6 p-6">
      {/* KPIs Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas Recentes</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVendas}</div>
            <p className="text-xs text-muted-foreground">
              Visualizando as últimas vendas
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
              {stockSummary.criticalCount > 0 ? `${stockSummary.criticalCount} em nível crítico` : 'Estoque saudável'}
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
              Nas vendas recentes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico e Ações Rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Fluxo Financeiro - Últimos 30 dias</CardTitle>
            <CardDescription>Comparativo de Receita vs Despesa vs Lucro</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            {revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(value) => `R$${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#fff", borderRadius: "8px", border: "1px solid #ddd" }}
                    formatter={(value) => [formatCurrency(value), ""]}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="Receita" stroke="#16a34a" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="Despesa" stroke="#dc2626" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="Lucro" stroke="#2563eb" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <TrendingUp className="h-10 w-10 mb-2 opacity-20" />
                <p>Nenhum dado financeiro encontrado nos últimos 30 dias.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ações rápidas */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                <Button className="w-full justify-start" variant="default">
                  <DollarSign className="mr-2 h-4 w-4" /> Nova Venda
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Package className="mr-2 h-4 w-4" /> Cadastrar Produto
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Store className="mr-2 h-4 w-4" /> Gerenciar Lojas
                </Button>
                <Button className="w-full justify-start" variant="ghost">
                  Ver Relatórios Completos
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Vendas recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Vendas Recentes</CardTitle>
          <CardDescription>Últimas 10 vendas registradas no sistema</CardDescription>
        </CardHeader>
        <CardContent>
          {recentSales.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Filial</TableHead>
                  <TableHead>Vendedor</TableHead>
                  <TableHead>Valor Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentSales.map((venda, idx) => (
                  <TableRow key={venda.id_venda ?? idx}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{formatDateShort(venda.data_venda)}</span>
                        <span className="text-xs text-muted-foreground">{formatTime(venda.data_venda)}</span>
                      </div>
                    </TableCell>
                    <TableCell>{venda.lojaNome}</TableCell>
                    <TableCell>{venda.vendedorNome}</TableCell>
                    <TableCell className="font-semibold text-green-600">
                      {formatCurrency(venda.valor_total)}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        venda.status === 'Cancelada' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {venda.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex items-center justify-center p-12 text-muted-foreground border-dashed border-2 rounded-md">
              Nenhuma venda recente encontrada.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}