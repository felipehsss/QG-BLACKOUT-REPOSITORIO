"use client";

import React from "react";
import { Input } from "@/components/ui/input";

export const MaskedInput = React.forwardRef(
  ({ mask, onChange, ...props }, ref) => {
    const handleChange = (e) => {
      // Aplica a máscara ao valor digitado
      const formattedValue = mask(e.target.value);
      
      // Cria um novo evento para passar o valor formatado para o react-hook-form
      const customEvent = {
        target: { ...e.target, value: formattedValue },
      };
      onChange(customEvent);
    };

    return <Input {...props} onChange={handleChange} ref={ref} />;
  }
);