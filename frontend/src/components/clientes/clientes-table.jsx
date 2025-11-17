"use client";

import { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";

export function ClientesTable({ data = [], onEdit, onDelete }) {
  const defaultOnEdit = (c) => console.log("Editar cliente:", c);
  const defaultOnDelete = (c) => {
    if (confirm(`Confirma exclusão de "${c.nome}" ?`)) console.log("Excluir:", c);
  };

  const chartConfig = {
    clientes: {
      label: "Clientes",
    },
    pf: {
      label: "Pessoa Física",
      color: "hsl(0 84.2% 60.2%)", // Vermelho
    },
    pj: {
      label: "Pessoa Jurídica",
      color: "hsl(var(--primary))", // Cor primária do sistema
    },
  };

  const summary = useMemo(() => {
    const pfCount = data.filter((c) => c.tipo_cliente === "PF").length;
    const pjCount = data.filter((c) => c.tipo_cliente === "PJ").length;
    return {
      total: data.length,
      pf: pfCount,
      pj: pjCount,
      chartData: [
        { name: "pf", value: pfCount, fill: chartConfig.pf.color },
        { name: "pj", value: pjCount, fill: chartConfig.pj.color },
      ].filter((item) => item.value > 0),
    };
  }, [data]);

  return (
    <div className="space-y-6">
      {/* Seção de Resumo e Gráfico */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4 flex flex-col justify-center">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.total}</div>
          </CardContent>
        </Card>
        <Card className="p-4 flex flex-col justify-center">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pessoas Físicas (PF)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.pf}</div>
          </CardContent>
        </Card>
        <Card className="p-4 flex flex-col justify-center">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pessoas Jurídicas (PJ)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.pj}</div>
          </CardContent>
        </Card>
        {summary.chartData.length > 0 && (
          <Card className="p-4 flex flex-col justify-center">
            <CardHeader className="items-center pb-0">
              <CardTitle className="text-sm font-medium">Distribuição de Clientes</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col items-center justify-center p-0">
              <ChartContainer
                config={chartConfig}
                className="mx-auto aspect-square w-full max-w-[150px]"
              >
                <PieChart>
                  <Tooltip
                    content={<ChartTooltipContent nameKey="name" hideLabel />}
                  />
                  <Pie data={summary.chartData} dataKey="value" nameKey="name" innerRadius={25} strokeWidth={2}>
                    {summary.chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Tabela de Clientes */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Endereço</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="w-[50px] text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {data.length > 0 ? (
              data.map((cliente, idx) => {
                const key =
                  cliente.id ??
                  cliente.id_cliente ??
                  `${cliente.nome ?? "cliente"}-${idx}`;

                return (
                  <TableRow key={key}>
                    <TableCell className="font-medium">{cliente.nome}</TableCell>
                    <TableCell>{cliente.email || "N/A"}</TableCell>
                    <TableCell>{cliente.telefone || "N/A"}</TableCell>
                    <TableCell>{cliente.endereco || "N/A"}</TableCell>
                    <TableCell>
                      {cliente.tipo_cliente === "PF" && (
                        <Badge variant="secondary">Pessoa Física</Badge>
                      )}
                      {cliente.tipo_cliente === "PJ" && (
                        <Badge variant="outline">Pessoa Jurídica</Badge>
                      )}
                      {!cliente.tipo_cliente && "N/A"}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Abrir menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem
                            onClick={() => (onEdit ?? defaultOnEdit)(cliente)}
                            className="flex items-center gap-2"
                          >
                            <Edit className="h-4 w-4" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => (onDelete ?? defaultOnDelete)(cliente)}
                            className="flex items-center gap-2 text-destructive"
                          >
                            <Trash2 className="h-4 w-4" /> Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan="6" className="h-24 text-center">
                  Nenhum cliente cadastrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
