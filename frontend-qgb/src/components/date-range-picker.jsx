"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { addDays, format, isValid } from "date-fns"; // Adiciona isValid
import { ptBR } from 'date-fns/locale';

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function DateRangePicker({
  className,
  initialDateFrom,
  initialDateTo,
  align = "end",
  locale = ptBR,
  onUpdate
}) {
  // Inicializa o estado de forma mais segura
  const [date, setDate] = React.useState(() => {
    // Verifica se initialDateFrom é uma data válida antes de usá-la
    const fromDate = initialDateFrom instanceof Date && isValid(initialDateFrom) ? initialDateFrom : undefined;
    if (!fromDate) {
      return undefined; // Começa como undefined se 'from' inicial não for válido
    }
    // Verifica se initialDateTo é uma data válida, senão calcula 7 dias a partir de fromDate
    const toDate = initialDateTo instanceof Date && isValid(initialDateTo) ? initialDateTo : addDays(fromDate, 7);

    return { from: fromDate, to: toDate };
  });

  const handleSelect = (selectedRange) => {
    setDate(selectedRange);
    if (onUpdate && selectedRange) {
      onUpdate({ range: selectedRange });
    }
  };

  // Função auxiliar para obter o texto a ser exibido no botão
  const getDisplayText = () => {
    // Verificações mais robustas
    if (!date || !(date.from instanceof Date) || !isValid(date.from)) {
      return <span>Selecione um período</span>;
    }

    try {
      const fromFormatted = format(date.from, "PPP", { locale });

      // Verifica se 'to' é uma data válida antes de formatar
      if (date.to instanceof Date && isValid(date.to)) {
        const toFormatted = format(date.to, "PPP", { locale });
        // Garante que 'from' venha antes de 'to' na exibição
        if (date.from <= date.to) {
            return <>{fromFormatted} - {toFormatted}</>;
        } else {
            // Caso raro onde a seleção pode ter invertido as datas temporariamente
            return <>{toFormatted} - {fromFormatted}</>;
        }
      }

      // Se 'to' não for válido ou não existir, mostra apenas 'from'
      return fromFormatted;
    } catch (error) {
      // Fallback para erros inesperados de formatação
      console.error("Erro ao formatar data:", error, date);
      return <span>Data inválida</span>;
    }
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              // A classe é aplicada se o estado inicial for undefined ou se 'from' for inválido
              (!date || !(date.from instanceof Date) || !isValid(date.from)) && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {getDisplayText()} {/* Usa a função auxiliar */}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align={align}>
          <Calendar
            initialFocus
            mode="range"
            // Passa undefined se date.from não for uma data válida
            defaultMonth={date?.from instanceof Date && isValid(date.from) ? date.from : undefined}
            selected={date}
            onSelect={handleSelect}
            numberOfMonths={2}
            locale={locale}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}