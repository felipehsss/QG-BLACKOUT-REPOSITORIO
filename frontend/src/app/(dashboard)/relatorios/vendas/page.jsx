"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const vendas = [
  {
    venda_id: 1001,
    cliente_nome: "Cliente Exemplo 1",
    data_venda: "2023-10-27T10:00:00Z",
    valor_total: "250.75",
  },
  {
    venda_id: 1002,
    cliente_nome: "Cliente Exemplo 2",
    data_venda: "2023-10-27T11:30:00Z",
    valor_total: "150.00",
  },
  {
    venda_id: 1003,
    cliente_nome: "Cliente N/A",
    data_venda: "2023-10-26T15:00:00Z",
    valor_total: "80.50",
  },
  {
    venda_id: 1004,
    cliente_nome: "Cliente Exemplo 3",
    data_venda: "2023-10-25T09:00:00Z",
    valor_total: "320.00",
  },
  {
    venda_id: 1005,
    cliente_nome: "Cliente Exemplo 4",
    data_venda: "2023-10-24T14:00:00Z",
    valor_total: "95.20",
  },
  {
    venda_id: 1006,
    cliente_nome: "Cliente Exemplo 5",
    data_venda: "2023-10-23T18:00:00Z",
    valor_total: "500.00",
  },
  {
    venda_id: 1007,
    cliente_nome: "Cliente N/A",
    data_venda: "2023-10-22T12:00:00Z",
    valor_total: "45.00",
  },
];

export default function RelatorioVendasPage() {
  const [date, setDate] = useState({
    from: new Date(2023, 9, 20), // Mês é 0-indexado, então 9 é Outubro
    to: new Date(2023, 9, 30),
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredVendas = useMemo(() => {
    if (!date?.from || !date?.to) {
      return vendas;
    }

    return vendas.filter((venda) => {
      const dataVenda = new Date(venda.data_venda);
      return dataVenda >= date.from && dataVenda <= date.to;
    });
  }, [date, vendas]);

  const paginatedVendas = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredVendas.slice(startIndex, endIndex);
  }, [filteredVendas, currentPage, itemsPerPage]);

  const summary = useMemo(() => {
    const totalVendas = filteredVendas.length;
    const valorTotal = filteredVendas.reduce((acc, venda) => {
      return acc + parseFloat(venda.valor_total);
    }, 0);

    return { totalVendas, valorTotal };
  }, [filteredVendas]);

  const totalPages = Math.ceil(filteredVendas.length / itemsPerPage);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-y-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Relatório de Vendas</CardTitle>
            <CardDescription>Lista das vendas realizadas no período selecionado.</CardDescription>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal md:w-[300px]",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd, y", { locale: ptBR })} -{" "}
                      {format(date.to, "LLL dd, y", { locale: ptBR })}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y", { locale: ptBR })
                  )
                ) : (
                  <span>Escolha um período</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
        </div>
        <Separator className="mt-4" />
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Total de Vendas</span>
            <span className="text-2xl font-bold">{summary.totalVendas}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Valor Total</span>
            <span className="text-2xl font-bold">
              {summary.valorTotal.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID Venda</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedVendas.length > 0 ? (
              paginatedVendas.map((venda) => (
                <TableRow key={venda.venda_id}>
                  <TableCell className="font-medium">{venda.venda_id}</TableCell>
                  <TableCell>{venda.cliente_nome || "N/A"}</TableCell>
                  <TableCell>
                    {new Date(venda.data_venda).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell className="text-right">
                    {parseFloat(venda.valor_total).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan="4" className="text-center">
                  Nenhuma venda encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
      {totalPages > 1 && (
        <CardFooter className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Página {currentPage} de {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Próxima
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}