import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Package } from "lucide-react"

export default function ProdutosPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Gestão de Produtos
          </h1>
          <p className="text-muted-foreground">
            Cadastre e organize os produtos vendidos em suas lojas.
          </p>
        </div>
        <Button>Adicionar Produto</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Produtos</CardTitle>
          <CardDescription>
            Em breve: uma tabela para visualizar e editar os produtos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-muted-foreground/30 p-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold tracking-tight">
              Nenhum produto cadastrado
            </h3>
            <p className="text-sm text-muted-foreground">
              Comece adicionando seu primeiro produto.
            </p>
            <Button className="mt-4">Adicionar Produto</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}