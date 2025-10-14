import {
  Card,
  CardBody,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, DollarSign, ReceiptText, AlertCircle } from "lucide-react"

// --- DADOS DE EXEMPLO MELHORADOS ---
// No futuro, isso virá do seu backend.
// O valor agora é um número para permitir cálculos.
const contas = [
  {
    id: "CTA-001",
    descricao: "Aluguel da Loja - Mês de Julho",
    valor: 2500.00,
    vencimento: "10/07/2024",
    categoria: "Aluguel",
    status: "Pendente",
    dataPagamento: null,
  },
  {
    id: "CTA-002",
    descricao: "Compra de matéria-prima - Fornecedor X",
    valor: 1200.50,
    vencimento: "05/07/2024",
    categoria: "Fornecedores",
    status: "Atrasada",
    dataPagamento: null,
  },
  {
    id: "CTA-003",
    descricao: "Pagamento de Salários - Junho",
    valor: 8750.00,
    vencimento: "05/07/2024",
    categoria: "Salários",
    status: "Paga",
    dataPagamento: "2024-07-05",
  },
  {
    id: "CTA-004",
    descricao: "Impostos Federais - SIMPLES Nacional",
    valor: 680.00,
    vencimento: "20/07/2024",
    categoria: "Impostos",
    status: "Pendente",
    dataPagamento: null,
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

// Retorna a variante do Badge com base no status
function getBadgeVariant(status) {
  switch (status) {
    case "Paga":
      return "default"; // Verde (padrão do tema)
    case "Atrasada":
      return "destructive"; // Vermelho
    case "Pendente":
    default:
      return "outline"; // Neutro
  }
}

export default function ContasAPagarPage() {
  // --- CÁLCULOS PARA OS CARDS DE RESUMO ---
  const totalAPagar = contas
    .filter(c => c.status === 'Pendente' || c.status === 'Atrasada')
    .reduce((acc, conta) => acc + conta.valor, 0);

  const totalPagoMes = contas
    .filter(c => c.status === 'Paga' && new Date(c.dataPagamento).getMonth() === new Date().getMonth())
    .reduce((acc, conta) => acc + conta.valor, 0);

  const contasVencidas = contas.filter(c => c.status === 'Atrasada').length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gestão de Contas a Pagar</h1>
          <p className="text-muted-foreground">
            Acompanhe e gerencie as despesas da sua operação.
          </p>
        </div>
        <Button>Adicionar Conta</Button>
      </div>

      {/* --- CARDS DE RESUMO (KPIs) --- */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total a Pagar</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalAPagar)}</div>
            <p className="text-xs text-muted-foreground">Soma de contas pendentes e atrasadas.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pago no Mês</CardTitle>
            <ReceiptText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPagoMes)}</div>
            <p className="text-xs text-muted-foreground">Total pago no mês corrente.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contas Vencidas</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contasVencidas}</div>
            <p className="text-xs text-muted-foreground">Contas com pagamento atrasado.</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Contas</CardTitle>
          <CardDescription>
            A lista completa de todas as contas a pagar registradas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>
                  <span className="sr-only">Ações</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contas.map((conta) => (
                <TableRow key={conta.id}>
                  <TableCell className="font-medium">{conta.descricao}</TableCell>
                  <TableCell>
                    <Badge variant={getBadgeVariant(conta.status)}>
                      {conta.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{conta.categoria}</TableCell>
                  <TableCell>{conta.vencimento}</TableCell>
                  <TableCell className="text-right">{formatCurrency(conta.valor)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem>Editar</DropdownMenuItem>
                        <DropdownMenuItem>Marcar como Paga</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">Excluir</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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