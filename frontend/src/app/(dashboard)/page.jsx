'use client';

import React, { useState, useEffect } from "react";
// Importar o hook de autenticação
import { useAuth } from "@/contexts/AuthContext"; 
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Loader2 } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

// Importando as funções 'readAll' corretas dos seus serviços
import { readAll as listarVendas } from "@/services/vendaService";
import { readAll as listarFuncionarios } from "@/services/funcionarioService";
import { readAll as listarLojas } from "@/services/lojaService";
import { readAll as listarProdutos } from "@/services/produtoService";
import { readAll as listarLancamentos } from "@/services/financeiroService";

// --- Funções Auxiliares ---

/**
 * Formata um valor numérico como moeda BRL.
 * @param {number | string} value O valor a ser formatado.
 * @returns {string} A string formatada.
 */
const formatCurrency = (value) => {
  let numericValue = 0;
  if (typeof value === 'number') {
    numericValue = value;
  } else if (typeof value === 'string') {
    numericValue = parseFloat(value) || 0;
  }
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numericValue);
};

/**
 * Formata uma string de data/hora para Hora:Minuto.
 * @param {string} dateString A string de data/hora.
 * @returns {string} A hora formatada.
 */
const formatTime = (dateString) => {
  try {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (e) {
    console.warn("formatTime error:", e, dateString);
    return 'Inválido';
  }
};

/**
 * Formata uma string de data 'YYYY-MM-DD' para 'DD/MM'.
 * @param {string} dateString A string de data.
 * @returns {string} A data formatada.
 */
const formatDateShort = (dateString) => {
   try {
    // A string vem como 'YYYY-MM-DD'
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}`;
  } catch (e) {
    console.warn("formatDateShort error:", e, dateString);
    return 'Inválido';
  }
}

// --- Componente Principal ---

export default function DashboardPage() {
  const [recentSales, setRecentSales] = useState([]);
  const [stockSummary, setStockSummary] = useState({ criticalCount: 0 });
  const [revenueData, setRevenueData] = useState([]);
  
  // Pegar o token do Contexto de Autenticação
  // Apanha o 'token' e o 'loading' do AuthContext
  const { token, loading: authLoading } = useAuth(); 
  
  // 'loading' agora rastreia o fetch
  const [dataLoading, setDataLoading] = useState(true); 
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // --- GUARDA PRINCIPAL ---
    // Não faz nada se o AuthContext ainda estiver a carregar (authLoading)
    if (authLoading) {
      setDataLoading(true); // Mostra o skeleton enquanto o auth carrega
      return; 
    }
    
    // Se o AuthContext carregou mas não temos token
    if (!token) {
      setDataLoading(false);
      setError("Token não encontrado. Por favor, faça login.");
      return;
    }

    // Se chegámos aqui, o authLoading é 'false' e temos um 'token'.
    // Podemos fazer o fetch dos dados.

    async function fetchData() {
      try {
        setDataLoading(true);
        setError(null);

        // 1. Buscar todos os dados em paralelo, AGORA ENVIANDO O TOKEN
        const [
          vendasData,       // RAW
          funcionariosData, // NORMALIZED
          lojasData,      // RAW
          produtosData,   // RAW
          lancamentosData, // NORMALIZED
        ] = await Promise.all([
          listarVendas(token),
          listarFuncionarios(token),
          listarLojas(token),
          listarProdutos(token),
          listarLancamentos(token),
        ]);

        // 2. Processar Resumo de Estoque (usa dados RAW de produtos)
        const safeProdutosData = produtosData || [];
        const criticalCount = safeProdutosData.filter(p => (p.quantidade || 0) < 10).length;
        setStockSummary({ criticalCount });

        // 3. Processar Gráfico de Faturamento (usa dados NORMALIZED de lançamentos)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const safeLancamentosData = lancamentosData || [];

        // O normalize do financeiroService não expõe 'data_movimento',
        // então acessamos o objeto 'raw' que ele convenientemente inclui.
        // A data no 'raw' é 'data_movimento'
        const dailyRevenueMap = safeLancamentosData
          .filter(l => 
            l.tipo === 'receita' && 
            l.raw && 
            l.raw.data_movimento && // Garante que existe
            new Date(l.raw.data_movimento) >= thirtyDaysAgo
          )
          .reduce((acc, l) => {
            const date = l.raw.data_movimento.split('T')[0]; // Agrupa por 'YYYY-MM-DD'
            const value = parseFloat(l.valor) || 0;
            if (!acc[date]) {
              acc[date] = 0;
            }
            acc[date] += value;
            return acc;
          }, {});

        const chartData = Object.keys(dailyRevenueMap)
          .map(date => ({
            name: formatDateShort(date), // Formata para DD/MM
            Faturamento: dailyRevenueMap[date],
            date: date, // Manter data original para ordenação
          }))
          .sort((a, b) => new Date(a.date) - new Date(b.date)); // Ordena por data

        setRevenueData(chartData);

        // 4. Processar Vendas Recentes (enriquecer com nomes)
        
        // Usando os campos 'id' e 'nome_completo' normalizados do funcionarioService
        const safeFuncionariosData = funcionariosData || [];
        const employeeMap = new Map(
          safeFuncionariosData.map(f => [f.id, f.nome_completo]) // f.id é o funcionario_id
        );

        // lojaService não normaliza, então usamos os campos raw
        const safeLojasData = lojasData || [];
        const storeMap = new Map(
          safeLojasData.map(l => [l.id_loja, l.nome_fantasia])
        );

        // vendaService não normaliza, então usamos os campos raw
        const safeVendasData = vendasData || [];
        const richSales = safeVendasData
          .sort((a, b) => new Date(b.data_venda) - new Date(a.data_venda)) // Ordena mais novas primeiro
          .slice(0, 10) // Pega apenas as 10 últimas
          .map(venda => ({
            ...venda,
            vendedorNome: employeeMap.get(venda.id_funcionario) || 'N/A', // Mapeia venda.id_funcionario para f.id
            lojaNome: storeMap.get(venda.id_loja) || 'N/A',
            status: venda.status || 'Concluída' // Garante um status padrão
          }));

        setRecentSales(richSales);

      } catch (err) {
        console.error("Erro ao buscar dados do dashboard:", err);
        if (err.status === 401 || err.status === 403) {
           setError("Não autorizado. A sua sessão pode ter expirado. Tente fazer login novamente.");
        } else {
           setError(err.message || "Não foi possível carregar os dados.");
        }
      } finally {
        setDataLoading(false);
      }
    }

    fetchData();
  // Agora depende do 'token' e do 'authLoading'.
  // Vai re-executar quando 'authLoading' for de true para false e quando o token mudar.
  }, [token, authLoading]); 

  // --- Renderização ---

  // Estado de erro
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-red-600">
        <AlertCircle className="w-16 h-16 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Erro ao carregar o Dashboard</h2>
        <p className="text-center">{error}</p>
        <p className="text-sm text-slate-500 mt-2">Verifique a consola (F12) para mais detalhes.</p>
      </div>
    );
  }

  // Estado de loading (authLoading OU dataLoading)
  if (authLoading || dataLoading) {
     return (
        <>
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Card 1 Skeleton */}
            <Card className="col-span-1 lg:col-span-2">
            <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
            </CardHeader>
            <CardContent className="h-64">
                <Skeleton className="w-full h-full" />
            </CardContent>
            </Card>

            {/* Ações e Estoque Skeletons */}
            <div className="space-y-4">
            <Card>
                <CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-32" />
                </CardContent> 
            </Card>
            <Card>
                <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
                <CardContent>
                <Skeleton className="h-5 w-3/4 mb-3" />
                <Skeleton className="h-4 w-1/2" />
                </CardContent>
            </Card>
            </div>

            {/* Tabela Skeleton */}
            <div className="lg:col-span-3">
            <Card>
                <CardHeader>
                <Skeleton className="h-6 w-1/4" />
                <Skeleton className="h-4 w-1/3 mt-2" />
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead><Skeleton className="h-5 w-16" /></TableHead>
                        <TableHead><Skeleton className="h-5 w-24" /></TableHead>
                        <TableHead><Skeleton className="h-5 w-24" /></TableHead>
                        <TableHead><Skeleton className="h-5 w-20" /></TableHead>
                        <TableHead><Skeleton className="h-5 w-20" /></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Array.from({ length: 5 }).map((_, index) => (
                        <TableRow key={index}>
                          <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
            </Card>
            </div>
        </section>
        </>
     )
  }

  // Renderização de Sucesso (com dados)
  return (
    <>
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* CARD 1: Gráfico de Faturamento */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Faturamento - Últimos 30 dias</CardTitle>
            <CardDescription>Visão consolidada por dia, por todas as filiais.</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
             {revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={revenueData}
                  margin={{ top: 5, right: 20, left: -20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${value / 1000}k`} />
                  <Tooltip formatter={(value) => [formatCurrency(value), 'Faturamento']} />
                  <Line
                    type="monotone"
                    dataKey="Faturamento"
                    stroke="#16a34a" 
                    strokeWidth={2}
                    dot={{ r: 4, fill: "#16a34a" }}
                    activeDot={{ r: 6, fill: "#16a34a" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">
                Nenhum dado de faturamento encontrado nos últimos 30 dias.
              </div>
            )}
          </CardContent>
        </Card>

        {/* AÇÕES RÁPIDAS E ESTOQUE */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
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
            <CardHeader>
              <CardTitle>Resumo Estoque</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-sm text-slate-600">
                  <span className="font-bold text-base text-red-600">{stockSummary.criticalCount}</span> produtos em nível crítico
                </div>
              <div className="mt-3 text-xs text-slate-400">Itens com 10 ou menos unidades.</div>
            </CardContent>
          </Card>
        </div>

        {/* TABELA: Vendas Recentes */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Vendas Recentes</CardTitle>
              <CardDescription>Últimas 10 vendas das filiais.</CardDescription>
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
                  {recentSales.length > 0 ? (
                    // Dados Reais
                    recentSales.map((venda) => (
                      <TableRow key={venda.id_venda}>
                        <TableCell>{formatTime(venda.data_venda)}</TableCell>
                        <TableCell>{venda.lojaNome}</TableCell>
                        <TableCell>{venda.vendedorNome}</TableCell>
                        <TableCell>{formatCurrency(venda.valor_total)}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              venda.status === 'Concluída'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800' // Assume 'Estornado' ou outro status
                            }`}
                          >
                            {venda.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    // Estado Vazio
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-slate-500">
                        Nenhuma venda recente encontrada.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}