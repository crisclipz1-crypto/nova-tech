import { Truck } from "lucide-react";
import { cn } from "cn";

import { SHIPPING } from "@/lib/config";
import { formatPrice } from "@/lib/format";

/**
 * Barra de progreso hacia el envío gratis. Es el empujón más honesto que se le
 * puede dar a un carrito: dice exactamente cuánto falta y por qué.
 */
export function FreeShippingMeter({
  subtotal,
  className,
}: {
  subtotal: number;
  className?: string;
}) {
  const reached = subtotal >= SHIPPING.freeFrom;
  const progress = Math.min(100, (subtotal / SHIPPING.freeFrom) * 100);
  const missing = Math.max(0, SHIPPING.freeFrom - subtotal);

  return (
    <div className={cn("space-y-2", className)}>
      <p className="flex items-center gap-2 text-xs leading-relaxed">
        <Truck
          className={cn(
            "size-4 shrink-0 transition-colors",
            reached ? "text-success" : "text-muted-foreground"
          )}
        />
        {reached ? (
          <span className="font-medium text-success">
            ¡Listo! Tu envío es gratis.
          </span>
        ) : (
          <span className="text-muted-foreground">
            Te faltan{" "}
            <strong className="tabular font-medium text-foreground">
              {formatPrice(missing)}
            </strong>{" "}
            para el envío gratis
          </span>
        )}
      </p>

      <div
        className="h-1 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={SHIPPING.freeFrom}
        aria-valuenow={Math.min(subtotal, SHIPPING.freeFrom)}
        aria-label="Progreso hacia el envío gratis"
      >
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-500 ease-out",
            reached ? "bg-success" : "bg-brand"
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
