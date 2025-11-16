'use client';

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
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

  const { token, loading: authLoading } = useAuth();
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
        const criticalCount = (produtosData || []).filter(p => (p.quantidade || 0) < 10).length;
        setStockSummary({ criticalCount });

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
        setError(err.message || "Não foi possível carregar os dados.");
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

  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Gráfico */}
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
            <div className="flex flex-wrap gap-2">
              <Button>Nova Venda</Button>
              <Button variant="outline">Cadastrar Produto</Button>
              <Button variant="ghost">Abrir Caixa</Button>
              <Button variant="link">Gerar Relatório</Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Resumo Estoque</CardTitle></CardHeader>
          <CardContent>
            <div className="text-sm text-slate-600">
              <span className="font-bold text-base text-red-600">{stockSummary.criticalCount}</span> produtos em nível crítico
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vendas recentes */}
      <div className="lg:col-span-3">
        <Card>
          <CardHeader>
            <CardTitle>Vendas Recentes</CardTitle>
            <CardDescription>Últimas 10 vendas</CardDescription>
          </CardHeader>
          <CardContent>
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
                    <TableCell>{formatCurrency(venda.valor_total)}</TableCell>
                    <TableCell>{venda.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Lojas */}
      <div className="lg:col-span-3">
        <Card>
          <CardHeader>
            <CardTitle>Lojas</CardTitle>
            <CardDescription>Lista de todas as lojas cadastradas</CardDescription>
          </CardHeader>
          <CardContent>
            <LojasTable
              data={lojasData}
              onEdit={(loja) => console.log("Editar loja:", loja)}
              onDelete={(loja) => console.log("Excluir loja:", loja)}
            />
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

