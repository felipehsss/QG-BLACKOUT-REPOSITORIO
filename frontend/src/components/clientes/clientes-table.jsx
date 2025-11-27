"use client";

import { useMemo, useState } from "react";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye, 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  FileText, 
  ShoppingBag // <--- Importado para o ícone de histórico
} from "lucide-react";
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { formatCPF, formatCNPJ, formatPhone } from "@/lib/utils";

export function ClientesTable({ data = [], onEdit, onDelete, onViewHistory }) {
  // Estado para controlar o cliente que está sendo visualizado (Detalhes)
  const [clienteSelecionado, setClienteSelecionado] = useState(null);

  const defaultOnEdit = (c) => console.log("Editar cliente:", c);
  const defaultOnDelete = (c) => {
    if (confirm(`Confirma exclusão de "${c.nome}" ?`)) console.log("Excluir:", c);
  };

  const chartConfig = {
    clientes: { label: "Clientes" },
    pf: { label: "Pessoa Física", color: "hsl(0 84.2% 60.2%)" },
    pj: { label: "Pessoa Jurídica", color: "hsl(var(--primary))" },
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

  // Função auxiliar para renderizar linhas de detalhes no modal local
  const DetailRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
      <div className="mt-1 bg-primary/10 p-2 rounded-full">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div>
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value || "Não informado"}</p>
      </div>
    </div>
  );

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
              <CardTitle className="text-sm font-medium">Distribuição</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col items-center justify-center p-0">
              <ChartContainer
                config={chartConfig}
                className="mx-auto aspect-square w-full max-w-[100px]"
              >
                <PieChart>
                  <Tooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
                  <Pie data={summary.chartData} dataKey="value" nameKey="name" innerRadius={25} strokeWidth={2}>
                    {summary.chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Tabela de Clientes */}
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Foto</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead className="hidden md:table-cell">Telefone</TableHead>
              <TableHead className="hidden lg:table-cell">Endereço</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="w-[50px] text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {data.length > 0 ? (
              data.map((cliente, idx) => {
                const key = cliente.id ?? cliente.id_cliente ?? `${cliente.nome ?? "cliente"}-${idx}`;
                const fotoUrl = cliente.foto ? `http://localhost:3080/uploads/${cliente.foto}` : null;

                return (
                  <TableRow key={key}>
                    {/* COLUNA DO AVATAR */}
                    <TableCell>
                      <Avatar>
                        <AvatarImage src={fotoUrl} alt={cliente.nome} className="object-cover" />
                        <AvatarFallback>{cliente.nome?.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </TableCell>

                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{cliente.nome}</span>
                        <span className="md:hidden text-xs text-muted-foreground">{cliente.email}</span>
                      </div>
                    </TableCell>
                    
                    <TableCell className="hidden md:table-cell">{cliente.email || "-"}</TableCell>
                    <TableCell className="hidden md:table-cell">{cliente.telefone ? formatPhone(cliente.telefone) : "-"}</TableCell>
                    <TableCell className="hidden lg:table-cell truncate max-w-[200px]" title={cliente.endereco}>
                      {cliente.endereco || "-"}
                    </TableCell>
                    
                    <TableCell>
                      {cliente.tipo_cliente === "PF" ? (
                        <Badge variant="secondary" className="whitespace-nowrap">Pessoa Física</Badge>
                      ) : (
                        <Badge variant="outline" className="whitespace-nowrap">Pessoa Jurídica</Badge>
                      )}
                    </TableCell>

                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Abrir menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          
                          {/* Botão Visualizar Detalhes */}
                          <DropdownMenuItem onClick={() => setClienteSelecionado(cliente)}>
                            <Eye className="mr-2 h-4 w-4" /> Visualizar
                          </DropdownMenuItem>

                          {/* Botão Ver Histórico - CHAMA A FUNÇÃO DA PÁGINA */}
                          <DropdownMenuItem onClick={() => onViewHistory && onViewHistory(cliente)}>
                            <ShoppingBag className="mr-2 h-4 w-4" /> Histórico
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          <DropdownMenuItem onClick={() => (onEdit ?? defaultOnEdit)(cliente)}>
                            <Edit className="mr-2 h-4 w-4" /> Editar
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem
                            onClick={() => (onDelete ?? defaultOnDelete)(cliente)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan="7" className="h-24 text-center text-muted-foreground">
                  Nenhum cliente cadastrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* MODAL DE VISUALIZAÇÃO (Card do Cliente - Dados Cadastrais) */}
      <Dialog open={!!clienteSelecionado} onOpenChange={(open) => !open && setClienteSelecionado(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detalhes do Cliente</DialogTitle>
            <DialogDescription>Informações completas do cadastro.</DialogDescription>
          </DialogHeader>
          
          {clienteSelecionado && (
            <div className="grid gap-6 py-4">
              {/* Cabeçalho do Card: Foto e Nome Principal */}
              <div className="flex flex-col items-center justify-center gap-3 pb-4 border-b">
                <Avatar className="h-24 w-24 border-4 border-muted">
                  <AvatarImage 
                    src={clienteSelecionado.foto ? `http://localhost:3080/uploads/${clienteSelecionado.foto}` : null} 
                    className="object-cover"
                  />
                  <AvatarFallback className="text-3xl">
                    {clienteSelecionado.nome?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-foreground">{clienteSelecionado.nome}</h3>
                  <Badge variant={clienteSelecionado.tipo_cliente === "PF" ? "secondary" : "outline"} className="mt-2">
                    {clienteSelecionado.tipo_cliente === "PF" ? "Pessoa Física" : "Pessoa Jurídica"}
                  </Badge>
                </div>
              </div>

              {/* Grid de Informações */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-4">
                   <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Contato</h4>
                   <DetailRow icon={Mail} label="Email" value={clienteSelecionado.email} />
                   <DetailRow icon={Phone} label="Telefone" value={formatPhone(clienteSelecionado.telefone) || "Não informado"} />
                   <DetailRow icon={MapPin} label="Endereço" value={clienteSelecionado.endereco} />
                </div>

                <div className="space-y-4">
                   <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Documentação</h4>
                   {clienteSelecionado.tipo_cliente === "PF" ? (
                     <DetailRow icon={FileText} label="CPF" value={formatCPF(clienteSelecionado.cpf) || "Não informado"} />
                   ) : (
                     <>
                       <DetailRow icon={FileText} label="CNPJ" value={formatCNPJ(clienteSelecionado.cnpj) || "Não informado"} />
                       <DetailRow icon={User} label="Razão Social" value={clienteSelecionado.razao_social} />
                       <DetailRow icon={User} label="Nome Fantasia" value={clienteSelecionado.nome_fantasia} />
                       <DetailRow icon={FileText} label="Inscrição Estadual" value={clienteSelecionado.inscricao_estadual} />
                     </>
                   )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}