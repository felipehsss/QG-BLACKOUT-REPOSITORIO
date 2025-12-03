'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation'; // Hook de navegação do Next.js
import { useAuth } from '@/contexts/AuthContext';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  ArrowRight,
  Truck,
  Activity,
  Store,
  Calendar,
  Box,
  ClipboardList,
  Plus,
  AlertTriangle
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';

// Forms - Certifique-se que estes componentes existem e aceitam onSuccess/onCancel
import { FuncionarioForm } from '@/components/funcionarios/funcionario-form';
import { ClienteForm } from '@/components/clientes/cliente-form';
import { FornecedorForm } from '@/components/fornecedores/fornecedor-form';
import { ProdutoForm } from '@/components/produtos/produto-form';
import { LojaForm } from '@/components/lojas/loja-form';

// Services
import { readAll as listarVendas } from '@/services/vendaService';
import { readAll as listarFuncionarios } from '@/services/funcionarioService';
import { readAll as listarLojas } from '@/services/lojaService';
import { readAll as listarProdutos } from '@/services/produtoService';
import { getCompras as listarCompras } from '@/services/compraService'; // Corrigido: importação correta
import { getSolicitacoes } from '@/services/solicitacaoService';

// Utils
const formatCurrency = (value) => {
  const numericValue = Number(value) || 0;
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numericValue);
};

const COLORS = ['var(--primary)', 'var(--secondary)', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function DashboardMatrizPage() {
  const { token, isLoading: authLoading } = useAuth();
  const router = useRouter(); // Hook para navegação interna
  const [activeModal, setActiveModal] = useState(null);
  
  // Estado inicial dos dados
  const [data, setData] = useState({
    vendas: [],
    lojas: [],
    produtos: [],
    solicitacoes: [],
    compras: [],
    funcionarios: []
  });
  
  const [loading, setLoading] = useState(true);

  // Carregamento dos dados
  useEffect(() => {
    const loadAllData = async () => {
      if (!token) return;
      
      setLoading(true);
      try {
        // Promise.allSettled pode ser usado se quiser que a falha de um não pare os outros,
        // mas Promise.all é ok se assumirmos que os serviços tratam erro básico.
        // Adicionei .catch(() => []) individualmente para garantir que uma falha não quebre tudo.
        const [vendasRes, lojasRes, produtosRes, solicitacoesRes, comprasRes, funcionariosRes] = await Promise.all([
          listarVendas(token).catch(err => { console.error('Erro vendas:', err); return []; }),
          listarLojas(token).catch(err => { console.error('Erro lojas:', err); return []; }),
          listarProdutos(token).catch(err => { console.error('Erro produtos:', err); return []; }),
          getSolicitacoes(token).catch(err => { console.error('Erro solicitacoes:', err); return []; }),
          listarCompras(token).catch(err => { console.error('Erro compras:', err); return []; }),
          listarFuncionarios(token).catch(err => { console.error('Erro funcionarios:', err); return []; })
        ]);

        // Normalização básica: verifica se é array, se tem propriedade .data, etc.
        const unwrap = (res) => Array.isArray(res) ? res : (res?.data || []);

        setData({
          vendas: unwrap(vendasRes),
          lojas: unwrap(lojasRes),
          produtos: unwrap(produtosRes),
          solicitacoes: unwrap(solicitacoesRes),
          compras: unwrap(comprasRes),
          funcionarios: unwrap(funcionariosRes)
        });

      } catch (error) {
        console.error('Erro crítico ao carregar dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) loadAllData();
  }, [token, authLoading]);

  // Cálculos de Métricas (Memoized)
  const metrics = useMemo(() => {
    if (loading) return null;

    const today = new Date().toISOString().split('T')[0];

    // Métricas de Vendas
    const vendasHoje = data.vendas.filter(v => {
      if (!v.data_venda) return false;
      // Tenta suportar tanto ISO String quanto data simples se vier diferente
      return v.data_venda.startsWith(today); 
    });

    const faturamentoDia = vendasHoje.reduce((acc, v) => acc + Number(v.valor_total || 0), 0);
    const qtdVendasDia = vendasHoje.length;
    const ticketMedio = qtdVendasDia > 0 ? faturamentoDia / qtdVendasDia : 0;

    // Lojas e Performance
    const vendasPorLoja = {};
    vendasHoje.forEach(v => {
      const id = v.loja_id;
      if (id) {
        vendasPorLoja[id] = (vendasPorLoja[id] || 0) + Number(v.valor_total || 0);
      }
    });

    const topFilialId = Object.keys(vendasPorLoja).length 
      ? Object.keys(vendasPorLoja).reduce((a, b) => vendasPorLoja[a] > vendasPorLoja[b] ? a : b) 
      : null;
    
    // Encontrar objeto da loja
    const topFilial = data.lojas.find(l => String(l.loja_id || l.id) === String(topFilialId));

    // Status das Filiais
    const statusFiliais = data.lojas.map(loja => {
      const lojaId = loja.loja_id || loja.id;
      const vendasLoja = data.vendas.filter(v => String(v.loja_id) === String(lojaId));
      
      const vendasLojaHoje = vendasLoja.filter(v => v.data_venda && v.data_venda.startsWith(today));
      const totalHoje = vendasLojaHoje.reduce((acc, v) => acc + Number(v.valor_total || 0), 0);
      
      // Verifica se houve venda nas últimas 2 horas para considerar "Online"
      const lastSale = vendasLoja.length > 0 
        ? vendasLoja.reduce((latest, current) => new Date(latest.data_venda) > new Date(current.data_venda) ? latest : current)
        : null;
        
      const isOnline = lastSale 
        ? (new Date() - new Date(lastSale.data_venda)) < 7200000 // 2 horas
        : false;

      return { 
        ...loja, 
        totalHoje, 
        status: isOnline ? 'Online' : 'Offline', 
        ranking: 0 // Será preenchido abaixo
      };
    }).sort((a, b) => b.totalHoje - a.totalHoje);

    // Atribuir ranking
    statusFiliais.forEach((f, i) => f.ranking = i + 1);

    // Pendências e Estoque
    const solicitacoesPendentes = data.solicitacoes.filter(s => s.status === 'Pendente');
    const produtosCriticos = data.produtos.filter(p => Number(p.quantidade || 0) < 10).length;

    // Compras do Mês
    const comprasMes = data.compras.filter(c => {
      if (!c.data_compra) return false;
      const d = new Date(c.data_compra);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const totalComprasMes = comprasMes.reduce((acc, c) => acc + Number(c.total || 0), 0);

    // Dados para o Gráfico (Top 5)
    const rankingGeral = statusFiliais.slice(0, 5).map(f => ({ 
      name: f.nome_fantasia || f.nome || `Loja ${f.loja_id}`, 
      faturamento: f.totalHoje 
    }));

    return {
      faturamentoDia,
      qtdVendasDia,
      ticketMedio,
      topFilialName: topFilial?.nome_fantasia || topFilial?.nome || 'N/A',
      statusFiliais,
      solicitacoesPendentesCount: solicitacoesPendentes.length,
      produtosCriticos,
      totalComprasMes,
      rankingGeral,
      recentSolicitacoes: solicitacoesPendentes.slice(0, 5)
    };
  }, [data, loading]);

  const handleSuccess = () => {
    setActiveModal(null);
    window.location.reload(); // Recarrega para atualizar os dados
  };

  const handleCloseModal = () => setActiveModal(null);

  if (loading || !metrics) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background/60 p-6">
        <div className="flex flex-col items-center gap-3">
          <Activity className="h-9 w-9 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Carregando dados da Matriz...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 space-y-8 bg-background">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Painel da Matriz — QG BLACKOUT</h1>
          <p className="text-sm text-muted-foreground">Visão consolidada das filiais e controle centralizado de estoque e compras.</p>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={() => setActiveModal('produto')} className="shadow-sm">
            <Plus className="mr-2 h-4 w-4" /> Novo Produto
          </Button>
          <Button variant="ghost" onClick={() => setActiveModal('fornecedor')}>
            <Truck className="mr-2 h-4 w-4" /> Fornecedor
          </Button>
          <Button variant="ghost" onClick={() => setActiveModal('loja')}>
            <Store className="mr-2 h-4 w-4" /> Nova Filial
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl shadow-sm border border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-medium">Faturamento (Hoje)</CardTitle>
                <CardDescription className="text-xs">Consolidado — todas as filiais</CardDescription>
              </div>
              <div className="p-2 rounded-md bg-muted/40">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mt-2 text-2xl font-bold text-foreground">{formatCurrency(metrics.faturamentoDia)}</div>
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <TrendingUp className="h-4 w-4" /> Atualizado hoje
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm border border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-medium">Vendas (Hoje)</CardTitle>
                <CardDescription className="text-xs">Transações</CardDescription>
              </div>
              <div className="p-2 rounded-md bg-muted/40">
                <ShoppingCart className="h-5 w-5 text-foreground" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mt-2 text-2xl font-bold">{metrics.qtdVendasDia}</div>
            <div className="mt-3 text-xs text-muted-foreground">Total de vendas realizadas hoje</div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm border border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
                <CardDescription className="text-xs">Valor médio por venda</CardDescription>
              </div>
              <div className="p-2 rounded-md bg-muted/40">
                <Calendar className="h-5 w-5 text-foreground" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mt-2 text-2xl font-bold">{formatCurrency(metrics.ticketMedio)}</div>
            <div className="mt-3 text-xs text-muted-foreground">Indicador de performance</div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm border border-border bg-gradient-to-br from-muted/5 to-background">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-medium">Top Filial (Hoje)</CardTitle>
                <CardDescription className="text-xs">Maior faturamento</CardDescription>
              </div>
              <div className="p-2 rounded-md bg-muted/40">
                <Store className="h-5 w-5 text-foreground" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mt-2 text-lg font-semibold truncate">{metrics.topFilialName}</div>
            <div className="mt-3 text-xs text-muted-foreground">Parabéns à unidade líder do dia</div>
          </CardContent>
        </Card>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Network status + list */}
        <Card className="lg:col-span-2 rounded-2xl shadow-sm border border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Status da Rede</CardTitle>
                <CardDescription>Desempenho consolidado por filial</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => router.push('/cadastros/lojas')}>
                  Ver todas <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.statusFiliais.slice(0, 6).map((filial) => (
                <div key={filial.loja_id || filial.id} className="flex items-center justify-between p-3 rounded-lg hover:shadow-md transition">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-muted/40">
                      <span className="text-sm font-semibold">{filial.ranking}</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{filial.nome_fantasia || filial.nome}</p>
                      <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                        <span className={`inline-block h-2 w-2 rounded-full ${filial.status === 'Online' ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                        <span>{filial.status}</span>
                        <span className="mx-2">•</span>
                        <span>{formatCurrency(filial.totalHoje)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => router.push(`/lojas/${filial.loja_id || filial.id}`)}>
                      Detalhes
                    </Button>
                  </div>
                </div>
              ))}
              {metrics.statusFiliais.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">Nenhuma filial cadastrada.</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right column: alerts + quick actions */}
        <div className="space-y-4">
          <Card className="rounded-2xl shadow-sm border border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  <CardTitle className="text-sm">Alertas</CardTitle>
                </div>
                {metrics.solicitacoesPendentesCount > 0 && (
                  <Badge>{metrics.solicitacoesPendentesCount} Pend.</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metrics.produtosCriticos > 0 ? (
                  <div className="flex items-start gap-3 bg-muted/10 p-3 rounded-lg">
                    <div className="p-2 rounded-md bg-amber-100"><Box className="h-4 w-4 text-amber-600" /></div>
                    <div>
                      <p className="font-medium">{metrics.produtosCriticos} produtos em estoque crítico</p>
                      <p className="text-sm text-muted-foreground">Repor estoque na matriz para evitar ruptura</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg">
                    <Activity className="h-4 w-4" /> Tudo certo com os estoques
                  </div>
                )}

                {metrics.solicitacoesPendentesCount > 0 && (
                  <div className="flex items-start gap-3 bg-muted/10 p-3 rounded-lg">
                    <div className="p-2 rounded-md bg-blue-100"><ClipboardList className="h-4 w-4 text-blue-600" /></div>
                    <div>
                      <p className="font-medium">{metrics.solicitacoesPendentesCount} solicitações pendentes</p>
                      <p className="text-sm text-muted-foreground">Filiais aguardando reposição</p>
                      <div className="mt-2">
                        <Button size="sm" variant="outline" onClick={() => router.push('/produtos/requerimento')}>Resolver agora</Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm border border-border">
            <CardHeader>
              <CardTitle>Ações rápidas</CardTitle>
              <CardDescription>Atalhos para operações frequentes</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2">
              <Button className="justify-start" onClick={() => setActiveModal('produto')}>
                <ShoppingCart className="mr-2 h-4 w-4" /> Registrar compra
              </Button>
              <Button className="justify-start" variant="outline" onClick={() => router.push('/produtos/requerimento')}>
                <Truck className="mr-2 h-4 w-4" /> Enviar para filial
              </Button>
              <Button className="justify-start" variant="outline" onClick={() => router.push('/produtos/estoque')}>
                <Box className="mr-2 h-4 w-4" /> Consultar estoque
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Charts area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 rounded-2xl shadow-sm border border-border">
          <CardHeader>
            <CardTitle>Ranking de Faturamento (Hoje)</CardTitle>
            <CardDescription>Comparativo entre unidades</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px]">
            {metrics.rankingGeral.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={metrics.rankingGeral} margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--muted)" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={160} tick={{ fontSize: 12 }} />
                  <Tooltip
                    cursor={{ fill: 'rgba(0,0,0,0.03)' }}
                    contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 6px 20px rgba(0,0,0,0.08)' }}
                    formatter={(value) => [formatCurrency(value), 'Faturamento']}
                  />
                  <Bar dataKey="faturamento" radius={[6, 6, 6, 6]} barSize={18}>
                    {metrics.rankingGeral.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                Sem dados de vendas hoje.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm border border-border">
          <CardHeader>
            <CardTitle>Últimas Solicitações</CardTitle>
            <CardDescription>Pedidos de reposição das filiais</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.recentSolicitacoes.map((sol) => {
                const loja = data.lojas.find(l => (l.loja_id || l.id) === sol.loja_solicitante_id);
                return (
                  <div key={sol.solicitacao_id || sol.id} className="p-3 rounded-lg bg-muted/5 border border-muted/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{loja?.nome_fantasia || `Loja ${sol.loja_solicitante_id}`}</p>
                        <p className="text-sm text-muted-foreground">Solicitação de reposição</p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {sol.data_solicitacao ? new Date(sol.data_solicitacao).toLocaleDateString('pt-BR') : '-'}
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <Badge variant="secondary">{sol.status}</Badge>
                      <Button size="sm" variant="ghost" onClick={() => router.push('/produtos/requerimento')}>Abrir</Button>
                    </div>
                  </div>
                );
              })}

              {metrics.recentSolicitacoes.length === 0 && (
                <div className="text-center text-sm text-muted-foreground py-6">Nenhuma solicitação recente.</div>
              )}
            </div>
          </CardContent>
          <CardFooter className="text-center">
            <Button variant="link" onClick={() => router.push('/produtos/requerimento')}>Ver todas</Button>
          </CardFooter>
        </Card>
      </div>

      {/* Global Modal */}
      <Dialog open={!!activeModal} onOpenChange={(open) => !open && handleCloseModal()}>
        <DialogContent className="sm:max-w-[760px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {activeModal === 'funcionario' && 'Novo Funcionário'}
              {activeModal === 'cliente' && 'Novo Cliente'}
              {activeModal === 'produto' && 'Novo Produto'}
              {activeModal === 'fornecedor' && 'Novo Fornecedor'}
              {activeModal === 'loja' && 'Nova Loja / Filial'}
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