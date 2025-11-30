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
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Edit, Trash2, Building2 } from "lucide-react";

export function LojasTable({ data = [], onEdit, onDelete }) {
  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>CNPJ</TableHead>
            <TableHead className="hidden md:table-cell">Telefone</TableHead>
            <TableHead className="hidden lg:table-cell">Endereço</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            data.map((loja) => (
              <TableRow key={loja.id || loja.loja_id}>
                <TableCell className="font-medium flex items-center gap-2">
                   <div className="p-2 bg-primary/10 rounded-full text-primary">
                      <Building2 className="h-4 w-4" />
                   </div>
                   {loja.nome}
                </TableCell>
                <TableCell>{loja.cnpj || "-"}</TableCell>
                <TableCell className="hidden md:table-cell">{loja.telefone || "-"}</TableCell>
                <TableCell className="hidden lg:table-cell truncate max-w-[200px]" title={loja.endereco}>
                    {loja.endereco || "-"}
                </TableCell>
                <TableCell>
                    {loja.is_matriz ? (
                        <Badge className="bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-100">Matriz</Badge>
                    ) : (
                        <Badge variant="outline">Filial</Badge>
                    )}
                </TableCell>
                <TableCell>
                    {loja.is_ativo ? (
                        <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">Ativa</Badge>
                    ) : (
                        <Badge variant="destructive">Inativa</Badge>
                    )}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Ações</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => onEdit(loja)}>
                        <Edit className="mr-2 h-4 w-4" /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => onDelete(loja.id || loja.loja_id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                Nenhuma loja encontrada.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}