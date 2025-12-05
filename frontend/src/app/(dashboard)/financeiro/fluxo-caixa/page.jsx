"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge";
import { ArrowUpCircle, ArrowDownCircle, DollarSign, TrendingUp, TrendingDown, Loader2, Wallet } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { getFluxoCaixa } from "@/services/financeiroService";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/date-range-picker";

const hoje = new Date();
const trintaDiasAtras = new Date(new Date().setDate(hoje.getDate() - 30));

// --- FUNÇÕES AUXILIARES ---

function formatCurrency(value) {
  if (typeof value !== 'number') {
    return "R$ 0,00";
  }
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDate(dateString) {
  if (!dateString) return "-";
  // Usar date-fns para um tratamento de datas mais robusto
  return format(parseISO(dateString), "dd/MM/yyyy", { locale: ptBR });
}

// Componente de formulário embutido para evitar problemas de import
function TransacaoForm({ onSave }) {
  const hoje = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({ data_movimento: hoje, descricao: '', tipo: 'Entrada', origem: '', valor: '' });

  const handleChange = (k) => (e) => setForm(prev => ({ ...prev, [k]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const valorNum = Number(String(form.valor).replace(',', '.')) || 0;
    if (!form.descricao) return;
    onSave({
      data_movimento: form.data_movimento,
      descricao: form.descricao,
      tipo: form.tipo,
      origem: form.origem || 'Manual',
      valor: valorNum,
    });
    setForm({ data_movimento: hoje, descricao: '', tipo: 'Entrada', origem: '', valor: '' });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-2 md:grid-cols-5">
      <div>
        <label className="text-sm">Data</label>
        <input className="w-full rounded-md border p-2" type="date" value={form.data_movimento} onChange={handleChange('data_movimento')} />
      </div>
      <div>
        <label className="text-sm">Descrição</label>
        <input className="w-full rounded-md border p-2" value={form.descricao} onChange={handleChange('descricao')} placeholder="Ex: Compra de estoque" />
      </div>
      <div>
        <label className="text-sm">Tipo</label>
        <select className="w-full rounded-md border p-2" value={form.tipo} onChange={handleChange('tipo')}>
          <option>Entrada</option>
          <option>Saída</option>
        </select>
      </div>
      <div>
        <label className="text-sm">Origem</label>
        <input className="w-full rounded-md border p-2" value={form.origem} onChange={handleChange('origem')} placeholder="Caixa, Fornecedor..." />
      </div>
      <div className="flex items-end">
        <div className="w-full">
          <label className="text-sm">Valor</label>
          <input className="w-full rounded-md border p-2" value={form.valor} onChange={handleChange('valor')} placeholder="0.00" />
        </div>
        <div className="ml-2 mt-2">
          <button className="inline-flex items-center rounded bg-primary px-3 py-1 text-white" type="submit">Salvar</button>
        </div>
      </div>
    </form>
  );
}

export default function FluxoCaixaPage() {
  const { token } = useAuth();
  const [data, setData] = useState({ transacoes: [], saldoInicial: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [localTransacoes, setLocalTransacoes] = useState([]);
  const [dateRange, setDateRange] = useState({ from: trintaDiasAtras, to: hoje });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { transacoes, saldoInicial } = data;

  // Calcular totals localmente a partir das transações para garantir que sempre tenhamos valores
  const totalEntradasCalculado = transacoes.reduce((sum, t) => {
    const valor = Number(t.valor ?? 0);
    return t.tipo === 'Entrada' ? sum + valor : sum;
  }, 0);

  const totalSaidasCalculado = transacoes.reduce((sum, t) => {
    const valor = Number(t.valor ?? 0);
    return t.tipo === 'Saída' || t.tipo === 'Saida' ? sum + valor : sum;
  }, 0);

  // Saldo final calculado: pode usar saldoInicial + entradas - saídas
  const saldoFinalCalculado = saldoInicial + totalEntradasCalculado - totalSaidasCalculado;

  const fetchFluxoCaixa = async () => {
    if (!token || !dateRange.from || !dateRange.to) return;
    setIsLoading(true);
    setErrorMessage('');
    try {
      const from = dateRange.from.toISOString().split('T')[0];
      const to = dateRange.to.toISOString().split('T')[0];
      const result = await getFluxoCaixa(from, to, token);
      // Se a API responder com sucesso, usamos os dados e limpamos fallback local
      setData(result);
      setLocalTransacoes([]);
    } catch (error) {
      console.error("Erro ao buscar fluxo de caixa:", error);
      // Mensagem amigável (se for erro SQL exibido pelo backend, mostramos mensagem curta)
      setErrorMessage(error.message || 'Erro ao buscar fluxo de caixa. Usando registros locais.');

      // Tentar carregar transações salvas localmente como fallback
      try {
        const raw = localStorage.getItem('fluxoCaixa:transacoes');
        const saved = raw ? JSON.parse(raw) : [];
        setLocalTransacoes(saved);
        // saldoInicial local pode ser 0 — mantemos o data.transacoes vindo do backend vazio
        setData({ transacoes: saved || [], saldoInicial: 0 });
      } catch (e) {
        setData({ transacoes: [], saldoInicial: 0 });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFluxoCaixa();
  }, [token, dateRange]);

  // --- PREPARAÇÃO DOS DADOS PARA A TABELA COM SALDO ---
  let saldoAcumulado = saldoInicial;
  const transacoesComSaldo = transacoes
    .sort((a, b) => new Date(a.data) - new Date(b.data)) // Garante a ordem cronológica
    .map(t => {
      const valor = Number(t.valor ?? 0);
      if (t.tipo === 'Entrada') {
        saldoAcumulado += valor;
      } else {
        saldoAcumulado -= valor;
      }
      return { ...t, saldo: saldoAcumulado };
    });

  // Paginação
  const totalCount = transacoesComSaldo.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalCount);
  const visibleTransacoes = transacoesComSaldo.slice(startIndex, endIndex);

  useEffect(() => {
    // Ajustar página caso o tamanho total mude
    if (currentPage > totalPages) setCurrentPage(1);
  }, [totalPages]);

  return (
    <div className="flex flex-col gap-4">
      {errorMessage && (
        <div className="rounded-md border border-yellow-400 bg-yellow-50 p-3 text-sm text-yellow-800">
          {errorMessage}
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Fluxo de Caixa</h1>
          <p className="text-muted-foreground">
            Visualize as entradas e saídas financeiras do seu negócio.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DateRangePicker
            date={dateRange}
            setDate={setDateRange}
          />
          <Button onClick={fetchFluxoCaixa} disabled={isLoading}>Atualizar</Button>
        </div>
      </div>
      
      {/* Formulário rápido para registrar Entradas / Saídas localmente */}
      <Card>
        <CardHeader>
          <CardTitle>Registrar Movimentação (Local)</CardTitle>
          <CardDescription>Registre aqui despesas e receitas localmente (salvo no navegador).</CardDescription>
        </CardHeader>
        <CardContent>
          <TransacaoForm
            onSave={(nova) => {
              // atribuir um id temporário se não houver
              const registro = { financeiro_id: `local-${Date.now()}`, ...nova };
              const atual = [registro, ...localTransacoes];
              try { localStorage.setItem('fluxoCaixa:transacoes', JSON.stringify(atual)); } catch (e) { console.warn('localStorage indisponível'); }
              setLocalTransacoes(atual);
              setData(prev => ({ ...prev, transacoes: atual }));
            }}
          />
        </CardContent>
      </Card>
      
      {/* --- CARDS DE RESUMO (KPIs) --- */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Inicial</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(saldoInicial)}</div>
            <p className="text-xs text-muted-foreground">Saldo no início do período.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Entradas</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{formatCurrency(totalEntradasCalculado)}</div>
            <p className="text-xs text-muted-foreground">Soma de todas as receitas.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Saídas</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{formatCurrency(totalSaidasCalculado)}</div>
            <p className="text-xs text-muted-foreground">Soma de todas as despesas.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Final</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${saldoFinalCalculado >= 0 ? 'text-blue-500' : 'text-destructive'}`}>
              {formatCurrency(saldoFinalCalculado)}
            </div>
            <p className="text-xs text-muted-foreground">Balanço do período.</p>
          </CardContent>
        </Card>
      </div>

      {/* --- TABELA DE TRANSAÇÕES --- */}
      <Card>
        <CardHeader>
          <CardTitle>Extrato de Transações</CardTitle>
          <CardDescription>
            Lista detalhada de todas as movimentações financeiras.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : transacoesComSaldo.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Origem</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="text-right">Saldo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleTransacoes.map((t) => (
                  <TableRow key={t.financeiro_id}>
                    <TableCell>{formatDate(t.data_movimento)}</TableCell>
                    <TableCell className="font-medium">{t.descricao}</TableCell>
                    <TableCell>
                      <Badge variant={t.tipo === 'Entrada' ? 'default' : 'destructive'}>
                        {t.tipo === 'Entrada' ? <ArrowUpCircle className="mr-1 h-3 w-3" /> : <ArrowDownCircle className="mr-1 h-3 w-3" />}
                        {t.tipo}
                      </Badge>
                    </TableCell>
                    <TableCell>{t.origem}</TableCell>
                    <TableCell className={`text-right font-semibold ${t.tipo === 'Entrada' ? 'text-green-500' : 'text-destructive'}`}>
                      {t.tipo === 'Saída' && '- '}{formatCurrency(t.valor)}
                    </TableCell>
                    <TableCell className={`text-right ${t.saldo >= 0 ? '' : 'text-destructive'}`}>
                      {formatCurrency(t.saldo)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-muted-foreground/30 p-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Wallet className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold tracking-tight">Nenhuma transação encontrada</h3>
              <p className="text-sm text-muted-foreground">
                Não há movimentações financeiras para o período selecionado.
              </p>
            </div>
          )}
        </CardContent>
        {/* Controles de paginação */}
        <div className="flex items-center justify-between border-t p-3">
          <div className="flex items-center gap-2">
            <label className="text-sm">Linhas por página:</label>
            <select className="rounded border p-1" value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}>
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-sm text-muted-foreground">{startIndex + 1} - {endIndex} de {totalCount}</div>
            <button className="rounded border px-2 py-1" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Anterior</button>
            <button className="rounded border px-2 py-1" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Próxima</button>
          </div>
        </div>
      </Card>
    </div>
  )
}