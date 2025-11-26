"use client"

import { useState } from "react"
import { format, isValid } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"

export function DateRangePicker({
  initialDateFrom = new Date(),
  initialDateTo = new Date(),
  locale = "pt-BR",
  onUpdate,
  align = "start",
  showCompare = false,
}) {
  // Estado inicial seguro
  const [date, setDate] = useState({
    from: initialDateFrom,
    to: initialDateTo,
  })

  // Função para exibir texto formatado
  const getDisplayText = () => {
    try {
      let fromFormatted = ""
      let toFormatted = ""

      if (date?.from instanceof Date && isValid(date.from)) {
        fromFormatted = format(date.from, "PPP", { locale })
      }

      if (date?.to instanceof Date && isValid(date.to)) {
        toFormatted = format(date.to, "PPP", { locale })
      }

      if (fromFormatted && toFormatted) return `${fromFormatted} - ${toFormatted}`
      if (fromFormatted) return fromFormatted
      return "Selecione um período"
    } catch (error) {
      return "Selecione um período"
    }
  }

  // Atualizar estado e notificar parent
  const handleSelect = (range) => {
    setDate(range)
    if (onUpdate) onUpdate({ range })
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id="date"
          variant="outline"
          className="w-[260px] justify-start text-left font-normal"
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {getDisplayText()}
        </Button>
      </PopoverTrigger>
      <PopoverContent align={align} className="w-auto p-0">
        <Calendar
          mode="range"
          selected={date}
          onSelect={handleSelect}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  )
}
