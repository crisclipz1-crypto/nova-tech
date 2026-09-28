import { cn } from "cn";

import { discountPercent, formatPrice } from "@/lib/format";

type PriceProps = {
  value: number;
  compareAt?: number | null;
  size?: "sm" | "md" | "lg";
  className?: string;
  /** Oculta el porcentaje cuando ya se muestra como badge sobre la imagen. */
  hidePercent?: boolean;
};

const SIZES = {
  sm: { price: "text-sm", compare: "text-xs", percent: "text-[10px]" },
  md: { price: "text-base", compare: "text-sm", percent: "text-[11px]" },
  lg: { price: "text-2xl sm:text-3xl", compare: "text-base", percent: "text-xs" },
};

export function Price({
  value,
  compareAt,
  size = "md",
  className,
  hidePercent,
}: PriceProps) {
  const percent = discountPercent(value, compareAt);
  const s = SIZES[size];

  return (
    <span className={cn("flex flex-wrap items-baseline gap-x-2 gap-y-1", className)}>
      <span className={cn("tabular font-medium", s.price)}>
        {formatPrice(value)}
      </span>

      {percent !== null && (
        <>
          <span
            className={cn("tabular text-muted-foreground line-through", s.compare)}
          >
            {formatPrice(compareAt!)}
          </span>
          {!hidePercent && (
            <span
              className={cn(
                "text-sale font-mono font-medium tracking-tight",
                s.percent
              )}
            >
              −{percent}%
            </span>
          )}
        </>
      )}
    </span>
  );
}
