"use client"

import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2, Check, AlertTriangle } from "lucide-react"

const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

export function ContasPagarTable({ data, onEdit, onDelete, onPagar }) {
  const getStatusBadge = (status, statusReal) => {
    if (statusReal === 'Vencido') return <Badge variant="destructive" className="gap-1"><AlertTriangle className="w-3 h-3"/> Vencido</Badge>;
    if (status === 'Pago') return <Badge className="bg-green-600 hover:bg-green-700 gap-1"><Check className="w-3 h-3"/> Pago</Badge>;
    return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pendente</Badge>;
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Descrição</TableHead>
            <TableHead>Fornecedor</TableHead>
            <TableHead>Vencimento</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Loja</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((conta) => (
            // CORREÇÃO: Usar 'conta.id' em vez de 'conta.conta_pagar_id'
            <TableRow key={conta.id}>
              <TableCell className="font-medium">{conta.descricao}</TableCell>
              <TableCell>{conta.fornecedor_nome}</TableCell>
              <TableCell>
                {conta.data_vencimento 
                  ? new Date(conta.data_vencimento).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) 
                  : '-'}
              </TableCell>
              <TableCell className="font-mono">{formatCurrency(conta.valor)}</TableCell>
              <TableCell>{conta.loja_nome}</TableCell>
              <TableCell>{getStatusBadge(conta.status, conta.status_real)}</TableCell>
              <TableCell className="text-right flex justify-end gap-2">
                {conta.status === 'Pendente' && (
                  <Button variant="ghost" size="icon" className="text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => onPagar(conta)} title="Pagar">
                    <Check className="w-4 h-4"/>
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => onEdit(conta)}>
                  <Pencil className="w-4 h-4"/>
                </Button>
                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => onDelete(conta)}>
                  <Trash2 className="w-4 h-4"/>
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {data.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">Nenhuma conta encontrada.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}