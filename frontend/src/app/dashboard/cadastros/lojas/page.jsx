import { Button } from "@/components/ui/button"
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
import { MoreHorizontal } from "lucide-react"

async function getLojas() {
  // TODO: Buscar dados da API
  return [
    {
      id: "LOJA-001",
      nome: "Loja Matriz - Centro",
      cnpj: "12.345.678/0001-99",
      isMatriz: true,
      status: "Ativa",
    },
    {
      id: "LOJA-002",
      nome: "Filial - Shopping Norte",
      cnpj: "12.345.678/0002-80",
      isMatriz: false,
      status: "Ativa",
    },
    {
      id: "LOJA-003",
      nome: "Filial - Bairro Sul (Inativa)",
      cnpj: "12.345.678/0003-60",
      isMatriz: false,
      status: "Inativa",
    },
  ]
}

export default async function LojasPage() {
  const lojas = await getLojas()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gestão de Lojas</h1>
          <p className="text-muted-foreground">
            Cadastre e gerencie as filiais e matriz da sua empresa.
          </p>
        </div>
        <Button>Adicionar Loja</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lojas Cadastradas</CardTitle>
          <CardDescription>
            Lista de todas as lojas registradas no sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lojas.map((loja) => (
                <TableRow key={loja.id}>
                  <TableCell className="font-medium">{loja.nome}</TableCell>
                  <TableCell>{loja.cnpj}</TableCell>
                  <TableCell>
                    {loja.isMatriz ? <Badge variant="outline">Matriz</Badge> : <Badge variant="secondary">Filial</Badge>}
                  </TableCell>
                  <TableCell>
                    <Badge variant={loja.status === 'Ativa' ? 'default' : 'destructive'}>{loja.status}</Badge>
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