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
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Edit, Trash2, CheckCircle2 } from "lucide-react";

export function ContasPagarTable({ data = [], onEdit, onDelete, onPagar }) {
  
  const formatCurrency = (val) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      // Ajusta fuso horário simples cortando o tempo
      const datePart = dateString.includes('T') ? dateString.split('T')[0] : dateString;
      const [year, month, day] = datePart.split('-');
      return `${day}/${month}/${year}`;
    } catch {
      return dateString;
    }
  };

  const getStatusBadge = (status, vencimento) => {
    // Lógica simples para status visual
    if (status === 'Pago') return <Badge className="bg-green-600 hover:bg-green-700">Pago</Badge>;
    
    const isVencido = new Date(vencimento) < new Date().setHours(0,0,0,0);
    if (isVencido) return <Badge variant="destructive">Vencido</Badge>;
    
    return <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-200">Pendente</Badge>;
  };

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Descrição</TableHead>
            <TableHead>Fornecedor</TableHead>
            <TableHead>Loja</TableHead>
            <TableHead>Vencimento</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                Nenhuma conta encontrada.
              </TableCell>
            </TableRow>
          ) : (
            data.map((conta) => (
              <TableRow key={conta.conta_pagar_id || conta.id}>
                <TableCell className="font-medium">{conta.descricao}</TableCell>
                <TableCell>{conta.fornecedor_nome || '-'}</TableCell>
                <TableCell>{conta.loja_nome || '-'}</TableCell>
                <TableCell>{formatDate(conta.data_vencimento)}</TableCell>
                <TableCell className="font-semibold">{formatCurrency(conta.valor)}</TableCell>
                <TableCell>{getStatusBadge(conta.status, conta.data_vencimento)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Ações</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => onPagar(conta)} disabled={conta.status === 'Pago'}>
                        <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" /> Baixar (Pagar)
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onEdit(conta)}>
                        <Edit className="mr-2 h-4 w-4" /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDelete(conta)} className="text-destructive focus:text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" /> Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}