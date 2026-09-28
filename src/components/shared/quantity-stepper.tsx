"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "cn";

type QuantityStepperProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max: number;
  size?: "sm" | "md";
  label?: string;
  className?: string;
};

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max,
  size = "md",
  label = "Cantidad",
  className,
}: QuantityStepperProps) {
  const compact = size === "sm";

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-border",
        compact ? "h-8" : "h-11",
        className
      )}
      role="group"
      aria-label={label}
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label="Quitar una unidad"
        className={cn(
          "grid aspect-square h-full place-items-center rounded-full transition-colors",
          "hover:bg-muted disabled:pointer-events-none disabled:opacity-30"
        )}
      >
        <Minus className={compact ? "size-3.5" : "size-4"} />
      </button>

      <span
        className={cn(
          "tabular grid place-items-center text-center font-medium",
          compact ? "min-w-7 text-xs" : "min-w-9 text-sm"
        )}
        aria-live="polite"
      >
        {value}
      </span>

      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="Añadir una unidad"
        className={cn(
          "grid aspect-square h-full place-items-center rounded-full transition-colors",
          "hover:bg-muted disabled:pointer-events-none disabled:opacity-30"
        )}
      >
        <Plus className={compact ? "size-3.5" : "size-4"} />
      </button>
    </div>
  );
}
