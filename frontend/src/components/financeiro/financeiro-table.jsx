"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function FinanceiroTable({ data = [] }) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Origem</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Valor</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((mov, idx) => {
            const key = mov.id ?? mov.financeiro_id ?? `mov-${idx}`;
            return (
              <TableRow key={key}>
                <TableCell>
                  {mov.data_movimento
                    ? new Date(mov.data_movimento).toLocaleDateString("pt-BR")
                    : "N/A"}
                </TableCell>
                <TableCell>{mov.tipo || "N/A"}</TableCell>
                <TableCell>{mov.origem || "N/A"}</TableCell>
                <TableCell>{mov.descricao || "N/A"}</TableCell>
                <TableCell>
                  {mov.valor != null
                    ? `R$ ${Number(mov.valor).toFixed(2).replace(".", ",")}`
                    : "N/A"}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
