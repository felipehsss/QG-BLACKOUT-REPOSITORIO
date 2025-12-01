'use client';

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Package, 
  Users, 
  Store, 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  ArrowRight,
  Truck,
  UserPlus,
  Tags
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
import { LojaForm } from "@/components/lojas/loja-form"; // <--- Novo Import

// Serviços
import { readAll as listarVendas } from "@/services/vendaService";
import { readAll as listarFuncionarios } from "@/services/funcionarioService";
import { readAll as listarLojas } from "@/services/lojaService";
import { readAll as listarProdutos } from "@/services/produtoService"; 
import { readAll as listarLancamentos } from "@/services/financeiroService";

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

  // Dados Brutos
  const [rawVendas, setRawVendas] = useState([]);
  const [rawFinanceiro, setRawFinanceiro] = useState([]);
  const [rawProdutos, setRawProdutos] = useState([]);
  const [rawLojas, setRawLojas] = useState([]);
  const [rawFuncionarios, setRawFuncionarios] = useState([]);

  const loadData = async () => {
    if (!token) return;
    try {
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
      setRawProdutos(Array.isArray(produtos) ? produtos : []);
      setRawFinanceiro(Array.isArray(financeiro) ? financeiro : []);
    } catch (err) {
      console.error("Erro no dashboard:", err);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && token) loadData();
  }, [token, authLoading]);

  // --- Lógica de Filtragem ---
  const dashboardData = useMemo(() => {
    const lojaId = lojaSelecionada?.id;
    const isGlobal = !lojaId || lojaSelecionada?.plan === "Matriz" || lojaSelecionada?.tipo === "Matriz"; 

    const vendasFiltradas = rawVendas.filter(v => isGlobal || v.loja_id === lojaId);
    const financeiroFiltrado = rawFinanceiro.filter(f => isGlobal || f.loja_id === lojaId);
    const funcionariosFiltrados = rawFuncionarios.filter(f => isGlobal || f.loja_id === lojaId);
    const lojasAtivas = isGlobal ? rawLojas.length : 1;

    const totalVendasValor = vendasFiltradas.reduce((acc, v) => acc + (Number(v.valor_total) || 0), 0);
    const totalVendasCount = vendasFiltradas.length;
    const totalFuncionariosCount = funcionariosFiltrados.length;
    const criticalStock = rawProdutos.filter(p => (Number(p.quantidade) || 0) < 5).length;

    // Chart Data
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dailyRevenueMap = {};
    
    financeiroFiltrado.forEach(lanc => {
      if (!lanc.data_movimento) return;
      const d = new Date(lanc.data_movimento);
      if (d < thirtyDaysAgo) return;
      const dateKey = d.toISOString().split('T')[0];
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
    }));

    // Recent Sales
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

    return { totalVendasValor, totalVendasCount, totalFuncionariosCount, lojasAtivas, criticalStock, chartData, recentSales, isGlobal };
  }, [lojaSelecionada, rawVendas, rawFinanceiro, rawFuncionarios, rawLojas, rawProdutos]);

  const handleCloseModal = () => setActiveModal(null);
  const handleSuccess = () => {
    handleCloseModal();
    loadData(); // Refresh data
  };

  if (authLoading) return <div className="flex h-screen items-center justify-center">Verificando acesso...</div>;
  
  return (
    <div className="space-y-6 p-6 max-w-[1600px] mx-auto">
      
      {/* 1. SEÇÃO DE AÇÕES RÁPIDAS (O NOVO HUB) */}
      <div className="flex flex-col gap-4">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard {dashboardData.isGlobal ? "- Rede" : `- ${lojaSelecionada.name}`}</h1>
            <p className="text-muted-foreground">Visão geral e ações rápidas.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {/* Botão de Venda */}
          <Button className="h-auto py-4 flex flex-col gap-2 bg-blue-600 hover:bg-blue-700" onClick={() => window.location.href = '/pdv'}>
            <ShoppingCart className="h-6 w-6" />
            <span className="text-xs font-semibold">Nova Venda</span>
          </Button>

          {/* Botões de Cadastros */}
          <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 border-dashed" onClick={() => setActiveModal('cliente')}>
            <UserPlus className="h-6 w-6 text-green-600" />
            <span className="text-xs font-semibold">Cliente</span>
          </Button>

          <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 border-dashed" onClick={() => setActiveModal('produto')}>
            <Package className="h-6 w-6 text-purple-600" />
            <span className="text-xs font-semibold">Produto</span>
          </Button>

          <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 border-dashed" onClick={() => setActiveModal('fornecedor')}>
            <Truck className="h-6 w-6 text-orange-600" />
            <span className="text-xs font-semibold">Fornecedor</span>
          </Button>

          <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 border-dashed" onClick={() => setActiveModal('funcionario')}>
            <Users className="h-6 w-6 text-blue-500" />
            <span className="text-xs font-semibold">Funcionário</span>
          </Button>

          {/* Botão de Nova Loja */}
          <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 border-dashed" onClick={() => setActiveModal('loja')}>
            <Store className="h-6 w-6 text-red-500" />
            <span className="text-xs font-semibold">Nova Loja</span>
          </Button>
        </div>
      </div>

      {/* 2. CARDS DE KPI (Resumo) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(dashboardData.totalVendasValor)}</div>
            <p className="text-xs text-muted-foreground">{dashboardData.totalVendasCount} vendas realizadas</p>
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
            <CardTitle className="text-sm font-medium">Equipe</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.totalFuncionariosCount}</div>
            <p className="text-xs text-muted-foreground">Colaboradores ativos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas Estoque</CardTitle>
            <Package className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{dashboardData.criticalStock}</div>
            <p className="text-xs text-muted-foreground">Itens críticos</p>
          </CardContent>
        </Card>
      </div>

      {/* 3. GRÁFICOS */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        <Card className="col-span-1 lg:col-span-4">
          <CardHeader><CardTitle>Fluxo de Caixa (30 dias)</CardTitle></CardHeader>
          <CardContent className="pl-0 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dashboardData.chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={12} axisLine={false} tickLine={false} />
                <YAxis fontSize={12} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${v/1000}k`} />
                <Tooltip formatter={(v) => formatCurrency(v)} />
                <Line type="monotone" dataKey="Receita" stroke="#16a34a" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Despesa" stroke="#dc2626" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-3">
          <CardHeader><CardTitle>Últimas Vendas</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.recentSales.map((v) => (
                <div key={v.venda_id} className="flex justify-between border-b pb-2 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{v.lojaNome}</p>
                    <p className="text-xs text-muted-foreground">{v.vendedorNome}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(v.valor_total)}</p>
                    <p className="text-xs text-muted-foreground">{formatDateShort(v.data_venda)}</p>
                  </div>
                </div>
              ))}
              {dashboardData.recentSales.length === 0 && <p className="text-center text-muted-foreground py-4">Nenhuma venda.</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* --- MODAL GLOBAL DO HUB --- */}
      <Dialog open={!!activeModal} onOpenChange={(open) => !open && handleCloseModal()}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
                {activeModal === 'funcionario' && "Novo Funcionário"}
                {activeModal === 'cliente' && "Novo Cliente"}
                {activeModal === 'produto' && "Novo Produto"}
                {activeModal === 'fornecedor' && "Novo Fornecedor"}
                {activeModal === 'loja' && "Nova Loja / Filial"}
            </DialogTitle>
            <DialogDescription>Preencha os dados abaixo.</DialogDescription>
          </DialogHeader>

          <div className="py-2">
            {activeModal === 'funcionario' && <FuncionarioForm onSuccess={handleSuccess} onCancel={handleCloseModal} />}
            {activeModal === 'cliente' && <ClienteForm onSuccess={handleSuccess} onCancel={handleCloseModal} />}
            {activeModal === 'fornecedor' && <FornecedorForm onSuccess={handleSuccess} onCancel={handleCloseModal} />}
            {activeModal === 'produto' && <ProdutoForm onSuccess={handleSuccess} onCancel={handleCloseModal} />}
            {activeModal === 'loja' && <LojaForm onSuccess={handleSuccess} onCancel={handleCloseModal} />}
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}