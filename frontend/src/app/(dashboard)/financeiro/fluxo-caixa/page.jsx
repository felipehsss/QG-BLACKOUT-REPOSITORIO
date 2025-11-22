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

export default function FluxoCaixaPage() {
  const { token } = useAuth();
  const [data, setData] = useState({ transacoes: [], saldoInicial: 0, totalEntradas: 0, totalSaidas: 0, saldoFinal: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ from: trintaDiasAtras, to: hoje });

  const { transacoes, saldoInicial, totalEntradas, totalSaidas, saldoFinal } = data;

  const fetchFluxoCaixa = async () => {
    if (!token || !dateRange.from || !dateRange.to) return;
    setIsLoading(true);
    try {
      const from = dateRange.from.toISOString().split('T')[0];
      const to = dateRange.to.toISOString().split('T')[0];
      const result = await getFluxoCaixa(from, to, token);
      setData(result);
    } catch (error) {
      console.error("Erro ao buscar fluxo de caixa:", error);
      setData({ transacoes: [], saldoInicial: 0, totalEntradas: 0, totalSaidas: 0, saldoFinal: 0 });
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
      if (t.tipo === 'Entrada') {
        saldoAcumulado += t.valor;
      } else {
        saldoAcumulado -= t.valor;
      }
      return { ...t, saldo: saldoAcumulado };
    });

  return (
    <div className="flex flex-col gap-4">
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
            <div className="text-2xl font-bold text-green-500">{formatCurrency(totalEntradas)}</div>
            <p className="text-xs text-muted-foreground">Soma de todas as receitas.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Saídas</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{formatCurrency(totalSaidas)}</div>
            <p className="text-xs text-muted-foreground">Soma de todas as despesas.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Final</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${saldoFinal >= 0 ? 'text-blue-500' : 'text-destructive'}`}>
              {formatCurrency(saldoFinal)}
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
                {transacoesComSaldo.map((t) => (
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
      </Card>
    </div>
  )
}