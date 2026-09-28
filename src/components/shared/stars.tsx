import { Star } from "lucide-react";
import { cn } from "cn";

type StarsProps = {
  /** Valor de 0 a 5; admite medios (4,5). */
  value: number;
  size?: number;
  className?: string;
  /** Texto accesible; si se omite se genera a partir del valor. */
  label?: string;
};

/**
 * Las medias estrellas se dibujan superponiendo una estrella rellena recortada
 * con `clip-path` sobre la vacía: un solo icono, sin SVG a medida.
 */
export function Stars({ value, size = 14, className, label }: StarsProps) {
  const clamped = Math.max(0, Math.min(5, value));

  return (
    <span
      className={cn("inline-flex items-center gap-0.5", className)}
      role="img"
      aria-label={label ?? `${clamped} de 5 estrellas`}
    >
      {Array.from({ length: 5 }, (_, index) => {
        const fill = Math.max(0, Math.min(1, clamped - index));
        return (
          <span
            key={index}
            className="relative inline-block"
            style={{ width: size, height: size }}
          >
            <Star
              size={size}
              className="absolute inset-0 text-muted-foreground/35"
              strokeWidth={1.5}
            />
            {fill > 0 && (
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ clipPath: `inset(0 ${(1 - fill) * 100}% 0 0)` }}
              >
                <Star
                  size={size}
                  className="fill-amber-400 text-amber-400"
                  strokeWidth={1.5}
                />
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
}
