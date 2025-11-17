import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Caixas() {
  return (
    <div className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Caixas</CardTitle>
          <CardDescription>
            Aqui você pode gerenciar os caixas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Conteúdo da página de Caixas.</p>
        </CardContent>
      </Card>
    </div>
  );
}