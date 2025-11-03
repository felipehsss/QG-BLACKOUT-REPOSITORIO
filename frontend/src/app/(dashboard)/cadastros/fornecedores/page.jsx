import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Truck } from "lucide-react"

export default function FornecedoresPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Gestão de Fornecedores
          </h1>
          <p className="text-muted-foreground">
            Mantenha um registro centralizado dos seus fornecedores.
          </p>
        </div>
        <Button>Adicionar Fornecedor</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fornecedores</CardTitle>
          <CardDescription>
            Em breve: uma tabela para visualizar e editar os fornecedores.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-muted-foreground/30 p-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Truck className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold tracking-tight">
              Nenhum fornecedor cadastrado
            </h3>
            <p className="text-sm text-muted-foreground">
              Comece adicionando seu primeiro fornecedor.
            </p>
            <Button className="mt-4">Adicionar Fornecedor</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}