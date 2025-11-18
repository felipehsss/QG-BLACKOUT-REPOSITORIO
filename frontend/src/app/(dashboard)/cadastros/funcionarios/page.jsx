import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Building2 } from "lucide-react"

export default function FuncionariosPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Gestão de Funcionários
          </h1>
          <p className="text-muted-foreground">
            Gerencie os funcionários e seus níveis de acesso ao sistema.
          </p>
        </div>
        <Button>Adicionar Funcionário</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Funcionários</CardTitle>
          <CardDescription>
            Em breve: uma tabela para visualizar e editar os funcionários.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-muted-foreground/30 p-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Building2 className="h-8 w-8 text-muted-foreground" /> {/* Ícone pode ser trocado por Users2 */}
            </div>
            <h3 className="text-xl font-bold tracking-tight">
              Nenhum funcionário cadastrado
            </h3>
            <p className="text-sm text-muted-foreground">
              Comece adicionando o primeiro funcionário da sua equipe.
            </p>
            <Button className="mt-4">Adicionar Funcionário</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}