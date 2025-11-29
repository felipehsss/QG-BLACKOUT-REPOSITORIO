"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  TrendingDown, 
  AlertCircle, 
  CheckCircle2, 
  CalendarClock,
  DollarSign
} from "lucide-react";

// Componentes UI
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

// Serviços e Componentes Internos
import { 
  readAll as listarContas, 
  deleteRecord as deletarConta, 
  marcarComoPago 
} from "@/services/contaPagarService";
import { readAll as listarFornecedores } from "@/services/fornecedorService";
import { readAll as listarLojas } from "@/services/lojaService";

import { ContasPagarTable } from "@/components/financeiro/contas-pagar-table";
import { ContaPagarForm } from "@/components/financeiro/conta-pagar-form";

// --- Utilitários ---
const formatCurrency = (val) => 
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
const STATUS_COLORS = {
  'Pendente': '#fbbf24', // Amber
  'Pago': '#22c55e',     // Green
  'Vencido': '#ef4444',  // Red
  'Cancelado': '#94a3b8' // Slate
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

  // --- Carregamento de Dados ---
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [contasRes, fornecedoresRes, lojasRes] = await Promise.all([
        listarContas(token),
        listarFornecedores(token),
        listarLojas(token)
      ]);

      // Mapeamento para garantir que temos nomes em vez de apenas IDs
      const fornecedorMap = new Map(fornecedoresRes.map(f => [f.fornecedor_id, f.nome || f.razao_social]));
      const lojaMap = new Map(lojasRes.map(l => [l.loja_id, l.nome || l.nome_fantasia]));

      const contasEnriquecidas = (Array.isArray(contasRes) ? contasRes : []).map(c => ({
        ...c,
        fornecedor_nome: fornecedorMap.get(c.fornecedor_id) || 'Desconhecido',
        loja_nome: lojaMap.get(c.loja_id) || 'N/A',
        // Calcula status dinâmico se estiver pendente mas data passou
        status_real: (c.status === 'Pendente' && new Date(c.data_vencimento) < new Date().setHours(0,0,0,0)) 
          ? 'Vencido' 
          : c.status
      }));

      setContas(contasEnriquecidas);
      setFornecedores(fornecedoresRes);
      setLojas(lojasRes);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar dados financeiros.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  // --- Lógica de Filtro e Dados Derivados ---
  const filteredData = useMemo(() => {
    return contas.filter(conta => {
      const matchesSearch = 
        conta.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conta.fornecedor_nome?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "todos" 
        ? true 
        : (statusFilter === 'Vencido' ? conta.status_real === 'Vencido' : conta.status === statusFilter);

      return matchesSearch && matchesStatus;
    });
  }, [contas, searchTerm, statusFilter]);

  // --- KPIs e Gráficos (Memoizados) ---
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

    // 3. Linha do Tempo (Vencimentos)
    // Agrupa por data (YYYY-MM-DD)
    const timelineMap = contas.reduce((acc, curr) => {
      if(!curr.data_vencimento) return acc;
      const data = curr.data_vencimento.split('T')[0];
      if (!acc[data]) acc[data] = 0;
      acc[data] += Number(curr.valor);
      return acc;
    }, {});

    const areaData = Object.keys(timelineMap)
      .map(date => ({ date, valor: timelineMap[date], displayDate: new Date(date).toLocaleDateString('pt-BR', {day:'2-digit', month:'2-digit'}) }))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-15); // Últimos 15 registros de data para não poluir

    return { pieData, barData, areaData };
  }, [contas]);

  // --- Handlers ---
  const handleDelete = async (conta) => {
    if (!confirm("Tem certeza que deseja excluir esta conta?")) return;
    try {
      await deletarConta(conta.conta_pagar_id, token);
      toast.success("Conta excluída com sucesso.");
      fetchData();
    } catch (err) {
      toast.error("Erro ao excluir conta.");
    }
  };

  const handlePagar = async (conta) => {
    if (!confirm(`Confirmar pagamento de ${formatCurrency(conta.valor)}?`)) return;
    try {
      await marcarComoPago(conta.conta_pagar_id, token);
      toast.success("Conta marcada como paga!");
      fetchData();
    } catch (err) {
      toast.error("Erro ao atualizar status.");
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <DollarSign className="h-8 w-8 text-primary" /> Contas a Pagar
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestão completa de despesas e obrigações financeiras.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => { setEditingConta(null); setIsFormOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> Nova Conta
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">A Pagar (Pendente)</CardTitle>
            <CalendarClock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(kpis.totalPendente)}</div>
            <p className="text-xs text-muted-foreground">Previsão de saída</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencido</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(kpis.totalVencido)}</div>
            <p className="text-xs text-muted-foreground">Requer atenção imediata</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pago</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(kpis.totalPago)}</div>
            <p className="text-xs text-muted-foreground">Total liquidado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Geral</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(kpis.totalGeral)}</div>
            <p className="text-xs text-muted-foreground">Volume total registrado</p>
          </CardContent>
        </Card>
      </div>

      {/* Seção de Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        
        {/* Gráfico 1: Barras - Top Fornecedores */}
        <Card className="col-span-1 lg:col-span-4">
          <CardHeader>
            <CardTitle>Top Gastos por Fornecedor</CardTitle>
            <CardDescription>Onde o dinheiro está sendo alocado</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartsData.barData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
                <Tooltip 
                  formatter={(value) => formatCurrency(value)}
                  cursor={{fill: 'transparent'}}
                />
                <Bar dataKey="valor" fill="#8884d8" radius={[0, 4, 4, 0]}>
                  {chartsData.barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico 2: Donut - Status */}
        <Card className="col-span-1 lg:col-span-3">
          <CardHeader>
            <CardTitle>Composição por Status</CardTitle>
            <CardDescription>Distribuição do valor monetário</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartsData.pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartsData.pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || '#8884d8'} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico 3: Área - Cronograma de Vencimentos */}
        <Card className="col-span-1 lg:col-span-7">
          <CardHeader>
            <CardTitle>Fluxo de Vencimentos</CardTitle>
            <CardDescription>Valores a pagar por data de vencimento</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartsData.areaData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="displayDate" />
                <YAxis tickFormatter={(val) => `R$${val/1000}k`} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <Area type="monotone" dataKey="valor" stroke="#ef4444" fillOpacity={1} fill="url(#colorValor)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Dados */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle>Listagem de Contas</CardTitle>
              <CardDescription>Gerencie os registros individuais abaixo.</CardDescription>
            </div>
            
            {/* Filtros da Tabela */}
            <div className="flex gap-2 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar fornecedor ou descrição..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
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