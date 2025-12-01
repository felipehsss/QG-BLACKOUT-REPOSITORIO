"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  CalendarClock,
  DollarSign,
  Loader2,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";

// Componentes UI (Shadcn)
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// Gráficos
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  CartesianGrid
} from "recharts";

// Serviços
import { 
  readAll as listarContas, 
  deleteRecord as deletarConta, 
  marcarComoPago 
} from "@/services/contaPagarService";
import { readAll as listarFornecedores } from "@/services/fornecedorService";
import { readAll as listarLojas } from "@/services/lojaService";

// Componentes Internos
import { ContasPagarTable } from "@/components/financeiro/contas-pagar-table";
import { ContaPagarForm } from "@/components/financeiro/conta-pagar-form";

// --- Utilitários ---
const formatCurrency = (val) => 
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

// Cores baseadas no tema (CSS Variables) para o Recharts
const getThemeColor = (variable) => {
  if (typeof window !== "undefined") {
    return `hsl(${getComputedStyle(document.documentElement).getPropertyValue(variable)})`;
  }
  return "#000"; // Fallback
};

export default function ContasAPagarPage() {
  const { token } = useAuth();
  
  // Dados
  const [contas, setContas] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [lojas, setLojas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");

  // Modal
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingConta, setEditingConta] = useState(null);

  // Cores dinâmicas para gráficos
  const [chartColors, setChartColors] = useState({
    primary: "#000",
    destructive: "#ef4444",
    success: "#22c55e",
    warning: "#eab308",
    muted: "#94a3b8"
  });

  useEffect(() => {
    // Carrega cores do tema atual para os gráficos
    setChartColors({
      primary: getThemeColor("--primary"),
      destructive: getThemeColor("--destructive"),
      success: "hsl(142.1 76.2% 36.3%)", // Green-600
      warning: "hsl(47.9 95.8% 53.1%)",  // Yellow-500
      muted: getThemeColor("--muted-foreground")
    });
  }, []);

  // --- Helper para tratar respostas da API ---
  const normalizeData = (res) => Array.isArray(res) ? res : (res?.data || []);

  // --- Carregamento de Dados ---
  const fetchData = async () => {
    if (!token) return;
    
    try {
      setIsLoading(true);
      const [contasRes, fornecedoresRes, lojasRes] = await Promise.all([
        listarContas(token),
        listarFornecedores(token),
        listarLojas(token)
      ]);

      const listaFornecedores = normalizeData(fornecedoresRes);
      const listaLojas = normalizeData(lojasRes);
      const listaContas = normalizeData(contasRes);

      // Mapeamento Robusto (Lida com String vs Number e Estrutura dos Services)
      // O service retorna { id, nome } já normalizado
      const fornecedorMap = new Map();
      listaFornecedores.forEach(f => {
        fornecedorMap.set(String(f.id), f.nome); // Chave como string
        fornecedorMap.set(Number(f.id), f.nome); // Chave como number (garantia)
      });

      const lojaMap = new Map();
      listaLojas.forEach(l => {
        lojaMap.set(String(l.id), l.nome);
        lojaMap.set(Number(l.id), l.nome);
      });

      const contasEnriquecidas = listaContas.map(c => {
        // Lógica de Vencimento
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        
        // Ajuste de fuso horário simples para data YYYY-MM-DD
        const dataVenc = c.data_vencimento ? new Date(c.data_vencimento) : null;
        
        const isVencido = c.status === 'Pendente' && dataVenc && dataVenc < hoje;

        return {
          ...c,
          // Busca no mapa ou usa o próprio ID se não achar (fallback melhor que 'Desconhecido')
          fornecedor_nome: fornecedorMap.get(c.fornecedor_id) || "Fornecedor Removido",
          loja_nome: lojaMap.get(c.loja_id) || "Loja Externa",
          status_real: isVencido ? 'Vencido' : c.status
        };
      });

      setContas(contasEnriquecidas);
      setFornecedores(listaFornecedores);
      setLojas(listaLojas);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar dados financeiros.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // --- Lógica de Filtro ---
  const filteredData = useMemo(() => {
    return contas.filter(conta => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        (conta.descricao || "").toLowerCase().includes(searchLower) ||
        (conta.fornecedor_nome || "").toLowerCase().includes(searchLower);
      
      const matchesStatus = statusFilter === "todos" 
        ? true 
        : (statusFilter === 'Vencido' ? conta.status_real === 'Vencido' : conta.status === statusFilter);

      return matchesSearch && matchesStatus;
    });
  }, [contas, searchTerm, statusFilter]);

  // --- KPIs e Gráficos ---
  const kpis = useMemo(() => {
    const totalPendente = contas
      .filter(c => c.status_real === 'Pendente')
      .reduce((acc, c) => acc + Number(c.valor), 0);
      
    const totalVencido = contas
      .filter(c => c.status_real === 'Vencido')
      .reduce((acc, c) => acc + Number(c.valor), 0);

    const totalPago = contas
      .filter(c => c.status === 'Pago')
      .reduce((acc, c) => acc + Number(c.valor), 0);

    return { totalPendente, totalVencido, totalPago, totalGeral: totalPendente + totalVencido + totalPago };
  }, [contas]);

  const chartsData = useMemo(() => {
    // 1. Distribuição por Status
    const statusCount = contas.reduce((acc, curr) => {
      const st = curr.status_real || 'Pendente';
      if (!acc[st]) acc[st] = 0;
      acc[st] += Number(curr.valor);
      return acc;
    }, {});
    
    const pieData = Object.keys(statusCount).map(key => ({
      name: key,
      value: statusCount[key]
    }));

    // 2. Top 5 Fornecedores (Gastos)
    const fornecedorGastos = contas.reduce((acc, curr) => {
      const nome = curr.fornecedor_nome;
      if (!acc[nome]) acc[nome] = 0;
      acc[nome] += Number(curr.valor);
      return acc;
    }, {});

    const barData = Object.keys(fornecedorGastos)
      .map(key => ({ name: key, valor: fornecedorGastos[key] }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 5);

    // 3. Fluxo de Vencimentos
    const timelineMap = contas.reduce((acc, curr) => {
      if(!curr.data_vencimento) return acc;
      const data = new Date(curr.data_vencimento).toISOString().split('T')[0];
      if (!acc[data]) acc[data] = 0;
      acc[data] += Number(curr.valor);
      return acc;
    }, {});

    const areaData = Object.keys(timelineMap)
      .map(date => ({ 
        date, 
        valor: timelineMap[date], 
        displayDate: new Date(date).toLocaleDateString('pt-BR', {day:'2-digit', month:'2-digit'}) 
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    return { pieData, barData, areaData };
  }, [contas]);

  // --- Handlers ---
  const handleDelete = async (conta) => {
    // eslint-disable-next-line no-restricted-globals
    if (!confirm("Tem certeza que deseja excluir esta conta?")) return;
    try {
      await deletarConta(conta.conta_pagar_id, token);
      toast.success("Conta excluída.");
      fetchData();
    } catch (err) {
      toast.error("Erro ao excluir conta.");
    }
  };

  const handlePagar = async (conta) => {
    // eslint-disable-next-line no-restricted-globals
    if (!confirm(`Confirmar pagamento de ${formatCurrency(conta.valor)}?`)) return;
    try {
      await marcarComoPago(conta.conta_pagar_id, token);
      toast.success("Conta paga com sucesso!");
      fetchData();
    } catch (err) {
      toast.error("Erro ao atualizar status.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-muted-foreground text-sm">Carregando financeiro...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 p-8 max-w-[1600px] mx-auto">
      
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Contas a Pagar
          </h1>
          <p className="text-muted-foreground mt-1">
            Controle de despesas, vencimentos e fornecedores.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => { setEditingConta(null); setIsFormOpen(true); }} className="bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" /> Nova Conta
          </Button>
        </div>
      </div>

      <Separator />

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">A Pagar (Pendente)</CardTitle>
            <CalendarClock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{formatCurrency(kpis.totalPendente)}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <ArrowUpRight className="w-3 h-3 mr-1"/> Previsão de saída
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Vencido</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{formatCurrency(kpis.totalVencido)}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <AlertCircle className="w-3 h-3 mr-1"/> Atenção necessária
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pago</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(kpis.totalPago)}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <ArrowDownRight className="w-3 h-3 mr-1"/> Total liquidado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Geral</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(kpis.totalGeral)}</div>
            <p className="text-xs text-muted-foreground mt-1">Volume total registrado</p>
          </CardContent>
        </Card>
      </div>

      {/* Seção de Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        
        {/* Gráfico 1: Barras - Top Fornecedores */}
        <Card className="col-span-1 lg:col-span-4">
          <CardHeader>
            <CardTitle>Maiores Credores</CardTitle>
            <CardDescription>Top 5 fornecedores por volume financeiro</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {chartsData.barData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartsData.barData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={120} 
                    tick={{fontSize: 12, fill: "hsl(var(--muted-foreground))"}} 
                    interval={0}
                  />
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)}
                    cursor={{fill: 'hsl(var(--muted)/0.3)'}}
                    contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--popover))', color: 'hsl(var(--popover-foreground))' }}
                  />
                  <Bar dataKey="valor" fill={chartColors.primary} radius={[0, 4, 4, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground text-sm">Sem dados suficientes</div>
            )}
          </CardContent>
        </Card>

        {/* Gráfico 2: Donut - Status */}
        <Card className="col-span-1 lg:col-span-3">
          <CardHeader>
            <CardTitle>Status das Contas</CardTitle>
            <CardDescription>Distribuição por situação</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {chartsData.pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartsData.pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="hsl(var(--background))"
                    strokeWidth={2}
                  >
                    {chartsData.pieData.map((entry, index) => {
                      let color = chartColors.muted;
                      if(entry.name === 'Pago') color = chartColors.success;
                      if(entry.name === 'Pendente') color = chartColors.warning;
                      if(entry.name === 'Vencido') color = chartColors.destructive;
                      return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)} 
                    contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--popover))' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle"/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground text-sm">Sem dados suficientes</div>
            )}
          </CardContent>
        </Card>

        {/* Gráfico 3: Área - Cronograma de Vencimentos */}
        <Card className="col-span-1 lg:col-span-7">
          <CardHeader>
            <CardTitle>Fluxo de Vencimentos</CardTitle>
            <CardDescription>Valores a pagar previstos por data</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px]">
            {chartsData.areaData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartsData.areaData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartColors.primary} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={chartColors.primary} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="displayDate" 
                    tick={{fontSize: 12, fill: "hsl(var(--muted-foreground))"}} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    tickFormatter={(val) => `R$${(val/1000).toFixed(0)}k`} 
                    tick={{fontSize: 12, fill: "hsl(var(--muted-foreground))"}} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)} 
                    contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--popover))' }}
                  />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <Area type="monotone" dataKey="valor" stroke={chartColors.primary} fillOpacity={1} fill="url(#colorValor)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground text-sm">Sem dados de vencimento</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Dados */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle>Registros</CardTitle>
              <CardDescription>Lista completa de obrigações.</CardDescription>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Filtrar por fornecedor..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="Pendente">Pendente</SelectItem>
                  <SelectItem value="Pago">Pago</SelectItem>
                  <SelectItem value="Vencido">Vencido</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ContasPagarTable 
            data={filteredData}
            onEdit={(conta) => { setEditingConta(conta); setIsFormOpen(true); }}
            onDelete={handleDelete}
            onPagar={handlePagar}
          />
        </CardContent>
      </Card>

      {/* Formulário Modal */}
      <ContaPagarForm 
        open={isFormOpen}
        setOpen={setIsFormOpen}
        initialData={editingConta}
        onSuccess={() => { setIsFormOpen(false); fetchData(); }}
        lojas={lojas}
        fornecedores={fornecedores}
      />
    </div>
  );
}