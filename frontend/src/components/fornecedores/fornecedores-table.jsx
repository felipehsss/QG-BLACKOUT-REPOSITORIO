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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";

export function FornecedoresTable({ data = [], onEdit, onDelete }) {
  const defaultOnEdit = (f) => console.log("Editar:", f);
  const defaultOnDelete = (f) => {
    if (confirm(`Confirma exclusão de "${f.nome ?? f.razao_social}" ?`)) console.log("Excluir:", f);
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
            <TableHead className="w-[50px] text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.map((fornecedor, idx) => {
            const key =
              fornecedor.id ??
              fornecedor.fornecedor_id ??
              fornecedor._id ??
              `${(fornecedor.razao_social ?? fornecedor.nome ?? "fornecedor").replace(/\s+/g, "-")}-${idx}`;

            const nome = fornecedor.nome ?? fornecedor.razao_social ?? "Sem nome";
            const email = fornecedor.email ?? "N/A";
            const telefone = fornecedor.telefone ?? "N/A";
            const endereco = fornecedor.endereco ?? "N/A";

            return (
              <TableRow key={key}>
                <TableCell className="font-medium">{nome}</TableCell>
                <TableCell>{email}</TableCell>
                <TableCell>{telefone}</TableCell>
                <TableCell>{endereco}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Abrir menu</span>
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem onClick={() => (onEdit ?? defaultOnEdit)(fornecedor)} className="flex items-center gap-2">
                        <Edit className="h-4 w-4" /> Editar
                      </DropdownMenuItem>

                      <DropdownMenuItem onClick={() => (onDelete ?? defaultOnDelete)(fornecedor)} className="flex items-center gap-2 text-destructive">
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
