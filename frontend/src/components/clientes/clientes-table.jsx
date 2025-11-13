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

export function ClientesTable({ data = [], onEdit, onDelete }) {
  const defaultOnEdit = (c) => console.log("Editar cliente:", c);
  const defaultOnDelete = (c) => {
    if (confirm(`Confirma exclusão de "${c.nome}" ?`)) console.log("Excluir:", c);
  };

  return (
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
          {data.map((cliente, idx) => {
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
                <TableCell>{cliente.tipo_cliente || "N/A"}</TableCell>
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
          })}
        </TableBody>
      </Table>
    </div>
  );
}
