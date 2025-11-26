"use client";

import React from "react";
import { Input } from "@/components/ui/input";

export const MaskedInput = React.forwardRef(
  ({ mask, onChange, ...props }, ref) => {
    const handleChange = (e) => {
      const formattedValue = mask(e.target.value);
      
      const customEvent = {
        target: { ...e.target, value: formattedValue },
      };
      onChange(customEvent);
    };

    return <Input {...props} onChange={handleChange} ref={ref} />;
  }
);