"use client";

import React from "react";
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
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";

export function FornecedoresTable({ data = [], onEdit, onDelete }) {
  const defaultOnEdit = (f) => console.log("Editar:", f);
  const defaultOnDelete = (f) => {
    if (confirm(`Confirma exclusão de "${f.nome ?? f.razao_social}" ?`)) console.log("Excluir:", f);
  };

  return (
    <div className="rounded-md border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="w-[30%]">Nome / Razão Social</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>Endereço</TableHead>
            <TableHead className="w-[50px] text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                Nenhum fornecedor encontrado.
              </TableCell>
            </TableRow>
          ) : (
            data.map((fornecedor, idx) => {
              const key =
                fornecedor.id ??
                fornecedor.fornecedor_id ??
                fornecedor._id ??
                idx;

              const nome = fornecedor.nome ?? fornecedor.razao_social ?? "Sem nome";
              const email = fornecedor.email || "-";
              const telefone = fornecedor.telefone || "-";
              const endereco = fornecedor.endereco || "-";

              return (
                <TableRow key={key} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium text-foreground">
                    {nome}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{email}</TableCell>
                  <TableCell>{telefone}</TableCell>
                  <TableCell className="max-w-[200px] truncate" title={endereco}>
                    {endereco}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Abrir menu</span>
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => (onEdit ?? defaultOnEdit)(fornecedor)}
                          className="cursor-pointer"
                        >
                          <Edit className="mr-2 h-4 w-4" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => (onDelete ?? defaultOnDelete)(fornecedor)}
                          className="text-destructive focus:text-destructive cursor-pointer"
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}