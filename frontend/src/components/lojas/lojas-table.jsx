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
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";

export function LojasTable({ data = [], onEdit, onDelete }) {
  const defaultOnEdit = (l) => console.log("Editar loja:", l);
  const defaultOnDelete = (l) => {
    if (confirm(`Confirma exclusão da loja "${l.nome}" ?`)) {
      console.log("Excluir:", l);
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>CNPJ</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Endereço</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[50px] text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            data.map((loja, idx) => {
            const key =
              loja.id ??
              loja.loja_id ??
              `${loja.nome ?? "loja"}-${idx}`;

            return (
              <TableRow key={key}>
                <TableCell className="font-medium">{loja.nome || loja.nome_fantasia || "N/A"}</TableCell>
                <TableCell>{loja.cnpj || "N/A"}</TableCell>
                <TableCell>
                  {loja.is_matriz ? (
                    <Badge variant="outline">Matriz</Badge>
                  ) : (
                    <Badge variant="secondary">Filial</Badge>
                  )}
                </TableCell>
                <TableCell>{loja.endereco || "N/A"}</TableCell>
                <TableCell>{loja.email || "N/A"}</TableCell>
                <TableCell>{loja.telefone || "N/A"}</TableCell>
                <TableCell>
                  <Badge variant={loja.is_ativo !== false ? "default" : "destructive"}>
                    {loja.is_ativo !== false ? "Ativa" : "Inativa"}
                  </Badge>
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
                        onClick={() => (onEdit ?? defaultOnEdit)(loja)}
                        className="flex items-center gap-2"
                      >
                        <Edit className="h-4 w-4" /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => (onDelete ?? defaultOnDelete)(loja)}
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
              <TableCell colSpan={8} className="h-24 text-center">
                Nenhuma loja cadastrada.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
