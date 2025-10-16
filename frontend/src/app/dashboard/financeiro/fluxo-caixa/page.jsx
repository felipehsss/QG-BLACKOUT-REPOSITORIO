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
import { Badge } from "@/components/ui/badge"
import { ArrowUpCircle, ArrowDownCircle, DollarSign, TrendingUp, TrendingDown } from "lucide-react"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"

// --- DADOS DE EXEMPLO ---
// No futuro, isso virá do seu backend, combinando vendas, contas pagas, etc.
const transacoes = [
  {
    id: "TRN-001",
    data: "2024-07-01",
    descricao: "Venda no PDV - Sessão #123",
    valor: 1550.75,
    tipo: "Entrada",
    categoria: "Vendas",
  },
  {
    id: "TRN-002",
    data: "2024-07-01",
    descricao: "Pagamento Aluguel da Loja - Mês de Julho",
    valor: 2500.00,
    tipo: "Saída",
    categoria: "Aluguel",
  },
  {
    id: "TRN-003",
    data: "2024-07-02",
    descricao: "Venda no PDV - Sessão #124",
    valor: 2340.50,
    tipo: "Entrada",
    categoria: "Vendas",
  },
  {
    id: "TRN-004",
    data: "2024-07-03",
    descricao: "Compra de matéria-prima - Fornecedor X",
    valor: 1200.50,
    tipo: "Saída",
    categoria: "Fornecedores",
  },
  {
    id: "TRN-005",
    data: "2024-07-05",
    descricao: "Pagamento de Salários - Junho",
    valor: 8750.00,
    tipo: "Saída",
    categoria: "Salários",
  },
  {
    id: "TRN-006",
    data: "2024-07-05",
    descricao: "Venda no PDV - Sessão #125",
    valor: 3120.00,
    tipo: "Entrada",
    categoria: "Vendas",
  },
];

// --- FUNÇÕES AUXILIARES ---

// Formata um número para o padrão de moeda BRL
function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

// Formata uma string de data (YYYY-MM-DD) para DD/MM/YYYY
function formatDate(dateString) {
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
}

export default function FluxoCaixaPage() {
  // --- CÁLCULOS PARA OS CARDS DE RESUMO ---
  const saldoInicial = 5000.00; // Exemplo, poderia vir do fechamento do mês anterior

  const totalEntradas = transacoes
    .filter(t => t.tipo === 'Entrada')
    .reduce((acc, t) => acc + t.valor, 0);

  const totalSaidas = transacoes
    .filter(t => t.tipo === 'Saída')
    .reduce((acc, t) => acc + t.valor, 0);

  const saldoFinal = saldoInicial + totalEntradas - totalSaidas;

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
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Fluxo de Caixa</h1>
        <p className="text-muted-foreground">
          Visualize as entradas e saídas financeiras do seu negócio.
        </p>
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

      {/* --- GRÁFICO --- */}
      <ChartAreaInteractive />

      {/* --- TABELA DE TRANSAÇÕES --- */}
      <Card>
        <CardHeader>
          <CardTitle>Extrato de Transações</CardTitle>
          <CardDescription>
            Lista detalhada de todas as movimentações financeiras.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="text-right">Saldo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transacoesComSaldo.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>{formatDate(t.data)}</TableCell>
                  <TableCell className="font-medium">{t.descricao}</TableCell>
                  <TableCell>
                    <Badge variant={t.tipo === 'Entrada' ? 'default' : 'destructive'}>
                      {t.tipo === 'Entrada' ? <ArrowUpCircle className="mr-1 h-3 w-3" /> : <ArrowDownCircle className="mr-1 h-3 w-3" />}
                      {t.tipo}
                    </Badge>
                  </TableCell>
                  <TableCell>{t.categoria}</TableCell>
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
        </CardContent>
      </Card>
    </div>
  )
}