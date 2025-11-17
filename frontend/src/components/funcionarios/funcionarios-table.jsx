"use client";

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
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";

export function FuncionariosTable({ data = [], onEdit, onDelete }) {
  const defaultOnEdit = (f) => console.log("Editar funcionário:", f);
  const defaultOnDelete = (f) => {
    if (confirm(`Confirma exclusão de "${f.nome_completo}" ?`)) {
      console.log("Excluir:", f);
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>CPF</TableHead>
            <TableHead>Data Admissão</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[50px] text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((func, idx) => {
            const key =
              func.id ??
              func.funcionario_id ??
              `${func.nome_completo ?? "func"}-${idx}`;

            return (
              <TableRow key={key}>
                <TableCell className="font-medium">{func.nome_completo}</TableCell>
                <TableCell>{func.email || "N/A"}</TableCell>
                <TableCell>{func.telefone_contato || "N/A"}</TableCell>
                <TableCell>{func.cpf || "N/A"}</TableCell>
                <TableCell>
                  {func.data_admissao
                    ? new Date(func.data_admissao).toLocaleDateString("pt-BR")
                    : "N/A"}
                </TableCell>
                <TableCell>{func.is_ativo ? "Ativo" : "Inativo"}</TableCell>
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
                        onClick={() => (onEdit ?? defaultOnEdit)(func)}
                        className="flex items-center gap-2"
                      >
                        <Edit className="h-4 w-4" /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => (onDelete ?? defaultOnDelete)(func)}
                        className="flex items-center gap-2 text-destructive"
                      >
                        <Trash2 className="h-4 w-4" /> Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
