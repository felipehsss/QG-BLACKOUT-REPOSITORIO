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
import { MoreHorizontal, Edit, Trash2, Eye, Mail, Phone, Calendar, UserCheck, Briefcase, Banknote, Wallet, Calculator } from "lucide-react";
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart";

export function FuncionariosTable({ data = [], onEdit, onDelete }) {
  const [selectedFuncionario, setSelectedFuncionario] = useState(null);

  const defaultOnEdit = (f) => console.log("Editar", f);
  const defaultOnDelete = (f) => {
    if (confirm("Excluir?")) console.log("Excluir", f);
  };

  // Configuração do Gráfico
  const chartConfig = {
    ativos: { label: "Ativos", color: "hsl(var(--primary))" },
    inativos: { label: "Inativos", color: "hsl(0 84.2% 60.2%)" },
  };

  // Helper de formatação monetária
  const formatCurrency = (value) => {
    if (!value && value !== 0) return "R$ 0,00";
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const summary = useMemo(() => {
    const total = data.length;
    // Filtra apenas ativos para cálculo financeiro real
    const funcionariosAtivos = data.filter(f => f.is_ativo);
    const ativos = funcionariosAtivos.length;
    const inativos = total - ativos;

    // CÁLCULOS FINANCEIROS
    const totalFolha = funcionariosAtivos.reduce((acc, curr) => acc + (Number(curr.salario) || 0), 0);
    const mediaSalarial = ativos > 0 ? totalFolha / ativos : 0;

    return {
      total,
      ativos,
      inativos,
      totalFolha,
      mediaSalarial,
      chartData: [
        { name: "ativos", value: ativos, fill: chartConfig.ativos.color },
        { name: "inativos", value: inativos, fill: chartConfig.inativos.color },
      ].filter(i => i.value > 0),
    };
  }, [data]);

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

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6">
      {/* Resumo e Gráficos (DASHBOARD FINANCEIRO RH) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {/* Card 1: Total Pessoas */}
        <Card className="p-4 flex flex-col justify-center shadow-sm">
          <CardHeader className="pb-2 p-0"><CardTitle className="text-sm font-medium text-muted-foreground">Colaboradores</CardTitle></CardHeader>
          <CardContent className="p-0 pt-2"><div className="text-2xl font-bold">{summary.total}</div></CardContent>
        </Card>

        {/* Card 2: Custo Folha (NOVO) */}
        <Card className="p-4 flex flex-col justify-center shadow-sm border-l-4 border-l-primary">
          <CardHeader className="pb-2 p-0 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Folha Mensal</CardTitle>
            <Wallet className="h-4 w-4 text-primary opacity-70" />
          </CardHeader>
          <CardContent className="p-0 pt-2">
            <div className="text-2xl font-bold">{formatCurrency(summary.totalFolha)}</div>
            <p className="text-xs text-muted-foreground">Custo com ativos</p>
          </CardContent>
        </Card>

        {/* Card 3: Média Salarial (NOVO) */}
        <Card className="p-4 flex flex-col justify-center shadow-sm">
          <CardHeader className="pb-2 p-0 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Média Salarial</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground opacity-70" />
          </CardHeader>
          <CardContent className="p-0 pt-2">
            <div className="text-2xl font-bold">{formatCurrency(summary.mediaSalarial)}</div>
          </CardContent>
        </Card>

        {/* Card 4: Status (Pizza) */}
        <Card className="p-4 flex flex-col justify-center col-span-2 md:col-span-1 lg:col-span-2">
          <div className="flex items-center justify-between h-full">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Status da Equipe</p>
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  <span className="font-bold">{summary.ativos} Ativos</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-destructive/60" />
                  <span className="text-muted-foreground">{summary.inativos} Inativos</span>
                </div>
              </div>
            </div>
            {summary.chartData.length > 0 && (
              <div className="h-[60px] w-[60px]">
                <ChartContainer config={chartConfig} className="aspect-square w-full">
                  <PieChart>
                    <Tooltip content={<ChartTooltipContent hideLabel />} />
                    <Pie data={summary.chartData} dataKey="value" nameKey="name" innerRadius={20} strokeWidth={0}>
                      {summary.chartData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                    </Pie>
                  </PieChart>
                </ChartContainer>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Tabela */}
      <div className="rounded-md border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Foto</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead className="hidden md:table-cell">Cargo/Perfil</TableHead>
              <TableHead className="hidden lg:table-cell">Data Admissão</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px] text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length > 0 ? (
              data.map((func, idx) => {
                const key = func.funcionario_id || idx;
                const fotoUrl = func.foto ? `http://localhost:3080/uploads/${func.foto}` : null;

                return (
                  <TableRow key={key}>
                    <TableCell>
                      <Avatar>
                        <AvatarImage src={fotoUrl} className="object-cover" />
                        <AvatarFallback>{func.nome_completo?.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">
                      {func.nome_completo}
                      {/* Opcional: mostrar salário pequeno abaixo do nome apenas para admin 
                        <div className="text-xs text-muted-foreground md:hidden">{formatCurrency(func.salario)}</div>
                        */}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{func.email}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {func.perfil_id === 1 ? "Admin" : func.perfil_id === 2 ? "Gerente" : "Vendedor"}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">{formatDate(func.data_admissao)}</TableCell>
                    <TableCell>
                      {func.is_ativo ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Ativo</Badge>
                      ) : (
                        <Badge variant="destructive">Inativo</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => setSelectedFuncionario(func)}>
                            <Eye className="mr-2 h-4 w-4" /> Visualizar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => (onEdit ?? defaultOnEdit)(func)}>
                            <Edit className="mr-2 h-4 w-4" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={() => (onDelete ?? defaultOnDelete)(func.funcionario_id)}>
                            <Trash2 className="mr-2 h-4 w-4" /> Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow><TableCell colSpan="7" className="h-24 text-center">Nenhum funcionário encontrado.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal de Visualização */}
      <Dialog open={!!selectedFuncionario} onOpenChange={(o) => !o && setSelectedFuncionario(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detalhes do Funcionário</DialogTitle>
            <DialogDescription>Ficha completa do colaborador.</DialogDescription>
          </DialogHeader>
          {selectedFuncionario && (
            <div className="grid gap-6 py-4">
              <div className="flex flex-col items-center justify-center gap-3 pb-4 border-b">
                <Avatar className="h-24 w-24 border-4 border-muted">
                  <AvatarImage src={selectedFuncionario.foto ? `http://localhost:3080/uploads/${selectedFuncionario.foto}` : null} className="object-cover" />
                  <AvatarFallback className="text-3xl">{selectedFuncionario.nome_completo?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h3 className="text-xl font-semibold">{selectedFuncionario.nome_completo}</h3>
                  <div className="flex justify-center gap-2 mt-2">
                    <Badge variant={selectedFuncionario.is_ativo ? "default" : "destructive"}>
                      {selectedFuncionario.is_ativo ? "Colaborador Ativo" : "Inativo"}
                    </Badge>
                    {/* Badge de Salário no topo do card de detalhes */}
                    <Badge variant="secondary" className="font-mono">
                      {formatCurrency(selectedFuncionario.salario)}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-4">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pessoal</h4>
                  <DetailRow icon={Mail} label="Email" value={selectedFuncionario.email} />
                  <DetailRow icon={Phone} label="Telefone" value={selectedFuncionario.telefone_contato} />
                  <DetailRow icon={UserCheck} label="CPF" value={selectedFuncionario.cpf} />
                </div>
                <div className="space-y-4">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Corporativo</h4>
                  <DetailRow icon={Briefcase} label="Loja ID" value={selectedFuncionario.loja_id} />
                  <DetailRow icon={Briefcase} label="Perfil ID" value={selectedFuncionario.perfil_id} />
                  <DetailRow icon={Calendar} label="Admissão" value={formatDate(selectedFuncionario.data_admissao)} />
                  <DetailRow icon={Banknote} label="Salário Base" value={formatCurrency(selectedFuncionario.salario)} />
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}