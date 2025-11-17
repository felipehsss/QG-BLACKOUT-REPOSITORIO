import { File, ListFilter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DateRangePicker } from "@/components/date-range-picker";// Assumindo que você tem ou criará este componente

// --- Dados Mockados ---
// Em uma aplicação real, estes dados viriam de uma API
const mockSalesData = [
  {
    id: "VND001",
    data: "2025-10-15",
    cliente: "Cliente Exemplo A",
    produto: "Produto X",
    quantidade: 2,
    valorUnitario: 50.0,
    valorTotal: 100.0,
    status: "Concluída",
  },
  {
    id: "VND002",
    data: "2025-10-16",
    cliente: "Cliente Exemplo B",
    produto: "Produto Y",
    quantidade: 1,
    valorUnitario: 120.0,
    valorTotal: 120.0,
    status: "Concluída",
  },
  {
    id: "VND003",
    data: "2025-10-16",
    cliente: "Cliente Exemplo A",
    produto: "Produto Z",
    quantidade: 5,
    valorUnitario: 10.0,
    valorTotal: 50.0,
    status: "Pendente",
  },
  // ... mais dados
];

// --- Componente da Página ---
export default function RelatorioVendas() {
  // Estado para controlar o período do DateRangePicker (exemplo)
  // const [dateRange, setDateRange] = useState({ from: new Date(...), to: new Date(...) });

  // Funções para buscar dados, aplicar filtros, etc. iriam aqui

  return (
    <div className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      {/* Usando Tabs para talvez separar tipos de relatórios ou visualizações */}
      <Tabs defaultValue="todas">
        <div className="flex items-center">
          {/* Componente de seleção de data (Date Range Picker) */}
          <DateRangePicker
            // onUpdate={({ range }) => setDateRange(range)} // Exemplo de como atualizar o estado
            initialDateFrom={new Date(2025, 9, 1)} // Exemplo: 1 de Outubro de 2025
            initialDateTo={new Date(2025, 9, 20)} // Exemplo: 20 de Outubro de 2025
            align="start"
            locale="pt-BR" // Ajuste conforme necessário
            showCompare={false}
          />
          {/* <TabsList className="ml-auto"> // Descomente se precisar de abas
            <TabsTrigger value="todas">Todas</TabsTrigger>
            <TabsTrigger value="concluidas">Concluídas</TabsTrigger>
            <TabsTrigger value="pendentes">Pendentes</TabsTrigger>
          </TabsList> */}
          <div className="ml-auto flex items-center gap-2">
            {/* Botão de Filtros (Exemplo) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1">
                  <ListFilter className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Filtrar
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filtrar por Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem checked>
                  Concluída
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>Pendente</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>Cancelada</DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {/* Botão de Exportar */}
            <Button size="sm" variant="outline" className="h-8 gap-1">
              <File className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Exportar CSV
              </span>
            </Button>
          </div>
        </div>
        {/* Conteúdo principal dentro de um Card */}
        <TabsContent value="todas">
          <Card>
            <CardHeader>
              <CardTitle>Relatório de Vendas</CardTitle>
              <CardDescription>
                Visualize o histórico detalhado de vendas no período selecionado.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Venda</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead className="text-right">Qtd.</TableHead>
                    <TableHead className="text-right">Vlr. Unit.</TableHead>
                    <TableHead className="text-right">Vlr. Total</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockSalesData.map((venda) => (
                    <TableRow key={venda.id}>
                      <TableCell className="font-medium">{venda.id}</TableCell>
                      <TableCell>{venda.data}</TableCell>
                      <TableCell>{venda.cliente}</TableCell>
                      <TableCell>{venda.produto}</TableCell>
                      <TableCell className="text-right">
                        {venda.quantidade}
                      </TableCell>
                      <TableCell className="text-right">
                        {venda.valorUnitario.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        {venda.valorTotal.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </TableCell>
                      <TableCell>{venda.status}</TableCell>
                    </TableRow>
                  ))}
                  {/* Linha de exemplo para quando não há dados */}
                  {mockSalesData.length === 0 && (
                     <TableRow>
                       <TableCell colSpan={8} className="h-24 text-center">
                         Nenhum resultado encontrado.
                       </TableCell>
                     </TableRow>
                   )}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <div className="text-xs text-muted-foreground">
                Mostrando <strong>1-{mockSalesData.length}</strong> de{" "}
                <strong>{mockSalesData.length}</strong> vendas
              </div>
              {/* Adicionar paginação aqui se necessário */}
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}