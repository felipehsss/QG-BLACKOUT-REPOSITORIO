"use client";

import { useMemo, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { MoreHorizontal, Edit, Trash2, Eye, Mail, Phone, MapPin, Calendar, UserCheck, Briefcase, Banknote } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
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

  const summary = useMemo(() => {
    const total = data.length;
    const ativos = data.filter(f => f.is_ativo).length;
    const inativos = total - ativos;

    return {
      total,
      ativos,
      inativos,
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

  const formatCurrency = (value) => {
    if (!value) return "R$ 0,00";
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Resumo e Gráficos */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4 flex flex-col justify-center">
           <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Funcionários</CardTitle></CardHeader>
           <CardContent><div className="text-2xl font-bold">{summary.total}</div></CardContent>
        </Card>
        <Card className="p-4 flex flex-col justify-center">
           <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Ativos</CardTitle></CardHeader>
           <CardContent><div className="text-2xl font-bold text-green-600">{summary.ativos}</div></CardContent>
        </Card>
        <Card className="p-4 flex flex-col justify-center">
           <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Inativos</CardTitle></CardHeader>
           <CardContent><div className="text-2xl font-bold text-destructive">{summary.inativos}</div></CardContent>
        </Card>
        
        {summary.chartData.length > 0 && (
          <Card className="p-4 flex flex-col justify-center">
            <CardHeader className="items-center pb-0"><CardTitle className="text-sm font-medium">Status</CardTitle></CardHeader>
            <CardContent className="flex flex-1 items-center justify-center p-0">
               <ChartContainer config={chartConfig} className="mx-auto aspect-square w-full max-w-[100px]">
                 <PieChart>
                    <Tooltip content={<ChartTooltipContent hideLabel />} />
                    <Pie data={summary.chartData} dataKey="value" nameKey="name" innerRadius={25} strokeWidth={2}>
                       {summary.chartData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                    </Pie>
                 </PieChart>
               </ChartContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Tabela */}
      <div className="rounded-md border bg-card">
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
                    <TableCell className="font-medium">{func.nome_completo}</TableCell>
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
                            <Badge variant={selectedFuncionario.is_ativo ? "default" : "destructive"} className="mt-2">
                                {selectedFuncionario.is_ativo ? "Colaborador Ativo" : "Inativo"}
                            </Badge>
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
                            {/* Visualização do Salário */}
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