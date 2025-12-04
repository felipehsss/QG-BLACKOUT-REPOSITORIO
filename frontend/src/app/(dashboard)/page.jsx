'use client';

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Package, 
  Users, 
  Store, 
  DollarSign, 
  Truck, 
  UserPlus, 
  EyeOff, 
  Eye,
  ShoppingCart,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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

// --- IMPORTAÇÃO DOS FORMULÁRIOS ---
import { FuncionarioForm } from "@/components/funcionarios/funcionario-form";
import { ClienteForm } from "@/components/clientes/cliente-form"; 
import { FornecedorForm } from "@/components/fornecedores/fornecedor-form";
import { ProdutoForm } from "@/components/produtos/produto-form"; 
import { LojaForm } from "@/components/lojas/loja-form"; 

// Serviços
import { readAll as listarVendas } from "@/services/vendaService";
import { readAll as listarFuncionarios } from "@/services/funcionarioService";
import { readAll as listarLojas } from "@/services/lojaService";
import { readAll as listarProdutos } from "@/services/produtoService"; 
import { readAll as listarLancamentos } from "@/services/financeiroService";
import { getSolicitacoes } from "@/services/solicitacaoService"; 
import { readAll as listarClientes } from "@/services/clienteService";

const formatCurrency = (value) => {
  const numericValue = Number(value) || 0;
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numericValue);
};

const formatDateShort = (dateString) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  } catch { return '-'; }
};

export default function DashboardPage() {
  const { token, isLoading: authLoading, lojaSelecionada } = useAuth();
  const [dataLoading, setDataLoading] = useState(true);
  const [activeModal, setActiveModal] = useState(null);
  const [revenueVisible, setRevenueVisible] = useState(false);

  // Dados Brutos
  const [rawVendas, setRawVendas] = useState([]);
  const [rawFinanceiro, setRawFinanceiro] = useState([]);
  const [rawProdutos, setRawProdutos] = useState([]);
  const [rawLojas, setRawLojas] = useState([]);
  const [rawFuncionarios, setRawFuncionarios] = useState([]);
  const [rawSolicitacoes, setRawSolicitacoes] = useState([]);
  const [rawClientes, setRawClientes] = useState([]);

  const loadData = async () => {
    if (!token) return;
    try {
      const [vendas, funcionarios, lojas, produtos, financeiro, solicitacoes, clientes] = await Promise.all([
        listarVendas(token).catch(() => []),
        listarFuncionarios(token).catch(() => []),
        listarLojas(token).catch(() => []),
        listarProdutos(token).catch(() => []),
        listarLancamentos(token).catch(() => []),
        getSolicitacoes(token).catch(() => []),
        listarClientes(token).catch(() => []),
      ]);

      setRawVendas(Array.isArray(vendas) ? vendas : []);
      setRawFuncionarios(Array.isArray(funcionarios) ? funcionarios : []);
      setRawLojas(Array.isArray(lojas) ? lojas : []);
      setRawProdutos(Array.isArray(produtos) ? produtos : []);
      setRawFinanceiro(Array.isArray(financeiro) ? financeiro : []);
      setRawSolicitacoes(Array.isArray(solicitacoes) ? solicitacoes : []);
      setRawClientes(Array.isArray(clientes) ? clientes : []);
    } catch (err) {
      console.error("Erro no dashboard:", err);
      toast.error('Erro ao carregar dados do dashboard');
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && token) loadData();
  }, [token, authLoading]);

  // --- Lógica de Filtragem e Métricas ---
  const dashboardData = useMemo(() => {
    const isGlobalContext = !lojaSelecionada?.id || 
                            lojaSelecionada?.plan === "Matriz" || 
                            lojaSelecionada?.tipo === "Matriz";

    const lojaId = lojaSelecionada?.id;

    // Filtros
    const vendasFiltradas = rawVendas.filter(v => isGlobalContext || String(v.loja_id) === String(lojaId));
    const financeiroFiltrado = rawFinanceiro.filter(f => isGlobalContext || String(f.loja_id) === String(lojaId));
    const funcionariosFiltrados = rawFuncionarios.filter(f => isGlobalContext || String(f.loja_id) === String(lojaId));
    const produtosFiltrados = rawProdutos.filter(p => isGlobalContext || String(p.loja_id) === String(lojaId));
    const clientesFiltrados = rawClientes.filter(c => isGlobalContext || String(c.loja_id) === String(lojaId));

    // Métricas
    const metrics = {
        totalVendasValor: vendasFiltradas.reduce((acc, v) => acc + (Number(v.valor_total) || 0), 0),
        totalVendasCount: vendasFiltradas.length,
        vendasHoje: vendasFiltradas.filter(v => (new Date(v.data_venda)).toISOString().split('T')[0] === new Date().toISOString().split('T')[0]).length,
        totalFuncionarios: funcionariosFiltrados.length,
        estoqueCritico: produtosFiltrados.filter(p => (Number(p.quantidade) || 0) < 5).length,
        lojasAtivas: isGlobalContext ? rawLojas.length : 1
    };

    // Tabela: Todas as Lojas
    const allStoresTable = rawLojas.map(l => ({
      id: l.loja_id || l.id,
      nome: l.nome_fantasia || l.nome,
      cidade: l.cidade || l.localidade || '-',
      plan: l.plan || l.tipo || '-',
      isCurrent: String(l.loja_id || l.id) === String(lojaId)
    }));

    // --- LÓGICA DO RANKING (Excluindo Matriz) ---
    const vendasPorLojaMap = {};
    const sourceVendasRanking = isGlobalContext ? rawVendas : vendasFiltradas;
    
    sourceVendasRanking.forEach(v => {
      const id = String(v.loja_id || 'unknown');
      vendasPorLojaMap[id] = vendasPorLojaMap[id] || { count: 0, valor: 0 };
      vendasPorLojaMap[id].count += 1;
      vendasPorLojaMap[id].valor += Number(v.valor_total) || 0;
    });

    const lojaMap = new Map(rawLojas.map(l => [String(l.loja_id || l.id || l._id), l]));

    const lojasRank = Object.keys(vendasPorLojaMap)
      .map(id => {
        const storeObj = lojaMap.get(id);
        const nome = storeObj ? (storeObj.nome_fantasia || storeObj.nome) : `Loja ${id}`;
        
        // Verifica se é matriz para excluir depois
        const isMatriz = storeObj && (
            storeObj.plan === 'Matriz' || 
            storeObj.tipo === 'Matriz' || 
            (storeObj.nome || '').toLowerCase().includes('matriz')
        );

        return {
            lojaId: id,
            nome: nome,
            isMatriz: isMatriz, 
            vendasCount: vendasPorLojaMap[id].count,
            vendasValor: vendasPorLojaMap[id].valor
        };
      })
      .filter(item => !item.isMatriz) // REMOVE A MATRIZ DO RANKING
      .sort((a,b) => b.vendasValor - a.vendasValor)
      .slice(0, 10);

    // Gráficos
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dailyMap = {};
    financeiroFiltrado.forEach(lanc => {
        if (!lanc.data_movimento) return;
        const d = new Date(lanc.data_movimento);
        if (d < thirtyDaysAgo) return;
        const dateKey = d.toISOString().split('T')[0];
        const val = Number(lanc.valor) || 0;
        const tipo = (lanc.tipo || "").toLowerCase();

        if (!dailyMap[dateKey]) dailyMap[dateKey] = { receita: 0, despesa: 0 };
        if (tipo === 'entrada' || tipo === 'receita') dailyMap[dateKey].receita += val;
        else if (tipo === 'saída' || tipo === 'saida' || tipo === 'despesa') dailyMap[dateKey].despesa += val;
    });

    const chartData = Object.keys(dailyMap).sort().map(dateKey => ({
        name: formatDateShort(dateKey),
        date: dateKey,
        Lucro: (dailyMap[dateKey].receita - dailyMap[dateKey].despesa) || 0,
        Despesa: dailyMap[dateKey].despesa || 0,
    }));

    // Novos Clientes
    const clientsMap = {};
    clientesFiltrados.forEach(c => {
        const rawDate = c.created_at || c.data_criacao || c.createdAt;
        if (!rawDate) return;
        const d = new Date(rawDate);
        if (d < thirtyDaysAgo) return;
        const key = d.toISOString().split('T')[0];
        clientsMap[key] = (clientsMap[key] || 0) + 1;
    });
    const clientsChartData = [];
    for (let i = 0; i < 30; i++) {
        const d = new Date();
        d.setDate(d.getDate() - (29 - i));
        const key = d.toISOString().split('T')[0];
        clientsChartData.push({ name: formatDateShort(key), newClients: clientsMap[key] || 0 });
    }

    // Listas Recentes
    const funcMap = new Map(rawFuncionarios.map(f => [f.funcionario_id, f.nome_completo]));

    const recentSales = [...vendasFiltradas]
      .sort((a, b) => new Date(b.data_venda) - new Date(a.data_venda))
      .slice(0, 10)
      .map(v => ({
        ...v,
        lojaNome: lojaMap.get(String(v.loja_id))?.nome || "N/A",
        vendedorNome: funcMap.get(v.funcionario_id) || "N/A"
      }));

    const recentSolicitacoes = [...rawSolicitacoes]
      .sort((a, b) => new Date(b.data_solicitacao) - new Date(a.data_solicitacao))
      .slice(0, 10)
      .map(s => ({
          id: s.solicitacao_id,
          lojaSolicitante: lojaMap.get(String(s.loja_solicitante_id))?.nome || `Loja ${s.loja_solicitante_id}`,
          status: s.status,
          data: s.data_solicitacao,
          itens: s.qtd_itens || 0
      }));

    const resumoGeral = {
        totalLojas: rawLojas.length,
        solicitacoesPendentes: rawSolicitacoes.filter(s => s.status === 'Pendente').length,
        itensCriticosGeral: rawProdutos.filter(p => (Number(p.quantidade) || 0) < 5).length
    };

    return { 
        isGlobal: isGlobalContext,
        metrics,
        allStoresTable,
        lojasRank,
        chartData,
        clientsChartData,
        recentSales,
        recentSolicitacoes,
        resumoGeral
    };
  }, [lojaSelecionada, rawVendas, rawFinanceiro, rawFuncionarios, rawLojas, rawProdutos, rawSolicitacoes, rawClientes]);

  // Handlers
  const handleCloseModal = () => setActiveModal(null);
  const handleSuccess = () => {
    toast.success("Operação realizada com sucesso!");
    handleCloseModal();
    loadData(); 
  };

  if (authLoading) return <div className="flex h-screen items-center justify-center">Carregando dashboard...</div>;

  // Verificando quais formulários são "Modais" e quais são "Forms Simples"
  const isSelfContainedModal = activeModal === 'cliente' || activeModal === 'fornecedor';

  return (
    <div className="space-y-6 p-6 max-w-[1600px] mx-auto">
      <style>{`
        .with-scroll::-webkit-scrollbar { height: 8px; width: 8px; }
        .with-scroll::-webkit-scrollbar-thumb { background: rgba(100,100,100,0.2); border-radius: 8px; }
        .with-scroll::-webkit-scrollbar-track { background: transparent; }
        .with-scroll { scrollbar-width: thin; scrollbar-color: rgba(100,100,100,0.2) transparent; }
      `}</style>

      {/* --- CABEÇALHO --- */}
      <div className="flex flex-col gap-4">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">
                Dashboard {dashboardData.isGlobal ? "- Rede" : `- ${lojaSelecionada?.name || 'Filial'}`}
            </h1>
            <p className="text-muted-foreground">
                {dashboardData.isGlobal 
                    ? "Visão geral da matriz e controle da rede." 
                    : "Visão operacional da unidade."}
            </p>
        </div>

        {/* HUB DE AÇÕES RÁPIDAS */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 border-dashed hover:bg-green-50 hover:border-green-200" onClick={() => setActiveModal('cliente')}>
            <UserPlus className="h-6 w-6 text-green-600" />
            <span className="text-xs font-semibold">Novo Cliente</span>
          </Button>

          <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 border-dashed hover:bg-purple-50 hover:border-purple-200" onClick={() => setActiveModal('produto')}>
            <Package className="h-6 w-6 text-purple-600" />
            <span className="text-xs font-semibold">Novo Produto</span>
          </Button>

          <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 border-dashed hover:bg-orange-50 hover:border-orange-200" onClick={() => setActiveModal('fornecedor')}>
            <Truck className="h-6 w-6 text-orange-600" />
            <span className="text-xs font-semibold">Novo Fornecedor</span>
          </Button>

          <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 border-dashed hover:bg-blue-50 hover:border-blue-200" onClick={() => setActiveModal('funcionario')}>
            <Users className="h-6 w-6 text-blue-500" />
            <span className="text-xs font-semibold">Novo Funcionário</span>
          </Button>

        
            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 border-dashed hover:bg-red-50 hover:border-red-200" onClick={() => setActiveModal('loja')}>
                <Store className="h-6 w-6 text-red-500" />
                <span className="text-xs font-semibold">Nova Loja</span>
            </Button>
        
        </div>
      </div>

      {/* --- CARDS DE MÉTRICAS (KPIs) --- */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="min-h-[140px]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mt-2">
              <div className="text-2xl font-bold">{revenueVisible ? formatCurrency(dashboardData.metrics.totalVendasValor) : 'R$ •••'}</div>
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setRevenueVisible(v => !v)}>
                {revenueVisible ? <EyeOff className="h-3 w-3"/> : <Eye className="h-3 w-3"/>}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{dashboardData.metrics.totalVendasCount} vendas no período</p>
          </CardContent>
        </Card>

        <Card className="min-h-[140px]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas Hoje</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mt-2">{dashboardData.metrics.vendasHoje}</div>
            <p className="text-xs text-muted-foreground mt-1">Registradas hoje</p>
          </CardContent>
        </Card>

        <Card className="min-h-[140px]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Equipe</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mt-2">{dashboardData.metrics.totalFuncionarios}</div>
            <p className="text-xs text-muted-foreground mt-1">Colaboradores ativos</p>
          </CardContent>
        </Card>

        <Card className="min-h-[140px]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas Estoque</CardTitle>
            <Package className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 mt-2">{dashboardData.metrics.estoqueCritico}</div>
            <p className="text-xs text-muted-foreground mt-1">Itens abaixo do mínimo</p>
          </CardContent>
        </Card>

        <Card className="min-h-[140px]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status Rede</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mt-2">{dashboardData.metrics.lojasAtivas}</div>
            <p className="text-xs text-muted-foreground mt-1">{dashboardData.isGlobal ? 'Lojas na rede' : 'Loja atual'}</p>
          </CardContent>
        </Card>
      </div>

      {/* --- GRÁFICOS E TABELAS PRINCIPAIS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-8 gap-6">
        
        {/* Gráfico Financeiro */}
        <Card className="col-span-1 lg:col-span-5 min-h-[400px]">
          <CardHeader>
            <CardTitle>Fluxo Financeiro (30 dias)</CardTitle>
            <CardDescription>Comparativo de lucro versus despesas operacionais.</CardDescription>
          </CardHeader>
          <CardContent className="pl-0 h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dashboardData.chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" fontSize={12} axisLine={false} tickLine={false} tickMargin={10} />
                <YAxis fontSize={12} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${v/1000}k`} />
                <Tooltip 
                    formatter={(v) => formatCurrency(v)} 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Legend verticalAlign="top" height={36}/>
                <Line type="monotone" dataKey="Lucro" stroke="#16a34a" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="Despesa" stroke="#dc2626" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tabelas Laterais */}
        <div className="col-span-1 lg:col-span-3 space-y-6">
          
          <Card className="flex flex-col h-[280px]">
            <CardHeader className="py-4 pb-2">
              <CardTitle className="text-base">Lojas da Rede</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
              <div className="with-scroll overflow-y-auto h-full px-6 pb-4">
                {dashboardData.allStoresTable.map(s => (
                  <div key={s.id} className={`flex justify-between items-center py-3 border-b last:border-0 ${s.isCurrent ? 'bg-blue-50 -mx-2 px-2 rounded' : ''}`}>
                    <div>
                      <p className={`text-sm font-medium ${s.isCurrent ? 'text-blue-700' : ''}`}>{s.nome}</p>
                      <p className="text-xs text-muted-foreground">{s.cidade} • {s.plan}</p>
                    </div>
                    {s.isCurrent && <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Atual</span>}
                  </div>
                ))}
                {dashboardData.allStoresTable.length === 0 && <p className="text-center text-sm text-muted-foreground py-4">Nenhuma loja encontrada.</p>}
              </div>
            </CardContent>
          </Card>

          <Card className="flex flex-col h-[280px]">
            <CardHeader className="py-4 pb-2">
              <CardTitle className="text-base">Ranking de Vendas</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
              <div className="with-scroll overflow-y-auto h-full px-6 pb-4">
                {dashboardData.lojasRank.length > 0 ? (
                    dashboardData.lojasRank.map((l, index) => (
                    <div key={l.lojaId} className="flex justify-between items-center py-3 border-b last:border-0">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-muted-foreground w-4">#{index+1}</span>
                            <div>
                                <p className="text-sm font-medium truncate max-w-[120px]">{l.nome}</p>
                                <p className="text-xs text-muted-foreground">{l.vendasCount} op.</p>
                            </div>
                        </div>
                        <div className="text-right">
                        <p className="font-bold text-sm">{formatCurrency(l.vendasValor)}</p>
                        </div>
                    </div>
                    ))
                ) : (
                    <p className="text-center text-sm text-muted-foreground py-4">Sem dados de vendas.</p>
                )}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* --- LINHA INFERIOR --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <Card className="h-[400px] flex flex-col">
          <CardHeader>
              <CardTitle>{dashboardData.isGlobal ? "Últimas Solicitações de Reposição" : "Últimas Vendas Realizadas"}</CardTitle>
              <CardDescription>{dashboardData.isGlobal ? "Pedidos de estoque das filiais" : "Transações recentes no PDV"}</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            <div className="with-scroll overflow-y-auto h-full px-6 pb-4">
              {dashboardData.isGlobal ? (
                  dashboardData.recentSolicitacoes.length > 0 ? (
                      dashboardData.recentSolicitacoes.map((s) => (
                          <div key={s.id} className="flex justify-between border-b py-3 last:border-0 items-center">
                              <div className="flex items-center gap-3">
                                  <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                                      <Truck className="h-4 w-4 text-orange-600" />
                                  </div>
                                  <div>
                                      <p className="text-sm font-medium">{s.lojaSolicitante}</p>
                                      <p className="text-xs text-muted-foreground">{s.itens} itens solicitados</p>
                                  </div>
                              </div>
                              <div className="text-right">
                                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                                      s.status === 'Pendente' ? 'bg-yellow-100 text-yellow-700' :
                                      s.status === 'Em Trânsito' ? 'bg-blue-100 text-blue-700' : 
                                      'bg-green-100 text-green-700'
                                  }`}>
                                      {s.status}
                                  </span>
                                  <p className="text-[10px] text-muted-foreground mt-1">{formatDateShort(s.data)}</p>
                              </div>
                          </div>
                      ))
                  ) : <p className="text-center text-muted-foreground py-8">Nenhuma solicitação recente.</p>
              ) : (
                  dashboardData.recentSales.length > 0 ? (
                      dashboardData.recentSales.map((v) => (
                          <div key={v.venda_id} className="flex justify-between border-b py-3 last:border-0 items-center">
                              <div className="flex items-center gap-3">
                                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                      <DollarSign className="h-4 w-4 text-green-600" />
                                  </div>
                                  <div>
                                      <p className="text-sm font-medium">{v.vendedorNome}</p>
                                      <p className="text-xs text-muted-foreground">ID: {v.venda_id}</p>
                                  </div>
                              </div>
                              <div className="text-right">
                                  <p className="font-bold text-sm">{formatCurrency(v.valor_total)}</p>
                                  <p className="text-[10px] text-muted-foreground">{formatDateShort(v.data_venda)}</p>
                              </div>
                          </div>
                      ))
                  ) : <p className="text-center text-muted-foreground py-8">Nenhuma venda recente.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Resumo da Rede (Geral)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="text-sm text-muted-foreground">Total de Lojas Cadastradas</span>
                            <span className="font-bold">{dashboardData.resumoGeral.totalLojas}</span>
                        </div>
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="text-sm text-muted-foreground">Solicitações de Estoque Pendentes</span>
                            <span className="font-bold text-yellow-600">{dashboardData.resumoGeral.solicitacoesPendentes}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Produtos com Estoque Crítico (Global)</span>
                            <span className="font-bold text-red-600">{dashboardData.resumoGeral.itensCriticosGeral}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="flex-1">
                <CardHeader>
                    <CardTitle>Novos Clientes (30 dias)</CardTitle>
                </CardHeader>
                <CardContent className="h-[200px] pl-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={dashboardData.clientsChartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                            <Tooltip />
                            <Line type="monotone" dataKey="newClients" stroke="#2563eb" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>

      </div>

      {/* --- CORREÇÃO AQUI: RENDERIZAR FORMS AUTÔNOMOS FORA DO DIALOG GENÉRICO --- */}
      
      {/* ClienteForm: Já possui Dialog, passamos 'open' */}
      {activeModal === 'cliente' && (
        <ClienteForm 
          open={true} 
          setOpen={(isOpen) => !isOpen && handleCloseModal()} 
          onSuccess={handleSuccess} 
        />
      )}

      {/* FornecedorForm: Já possui Dialog, passamos 'open' */}
      {activeModal === 'fornecedor' && (
        <FornecedorForm 
          open={true} 
          setOpen={(isOpen) => !isOpen && handleCloseModal()} 
          onSuccess={handleSuccess} 
        />
      )}

      {/* --- MODAL GENÉRICO PARA OUTROS FORMS (Que não são Modais embutidos) --- */}
      <Dialog 
        open={['funcionario', 'produto', 'loja'].includes(activeModal)} 
        onOpenChange={(open) => !open && handleCloseModal()}
      >
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
                {activeModal === 'funcionario' && "Novo Funcionário"}
                {activeModal === 'produto' && "Novo Produto"}
                {activeModal === 'loja' && "Nova Loja / Filial"}
            </DialogTitle>
            <DialogDescription>
                Preencha os dados abaixo para cadastrar um novo registro.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            {activeModal === 'funcionario' && (
                <FuncionarioForm onSuccess={handleSuccess} onCancel={handleCloseModal} />
            )}
            {/* Mantendo no genérico, assumindo padrão similar ao funcionário */}
            {activeModal === 'produto' && (
                <ProdutoForm onSuccess={handleSuccess} onCancel={handleCloseModal} />
            )}
            {activeModal === 'loja' && (
                <LojaForm onSuccess={handleSuccess} onCancel={handleCloseModal} />
            )}
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}