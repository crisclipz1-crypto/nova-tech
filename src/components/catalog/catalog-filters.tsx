"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Check, RotateCcw } from "lucide-react";
import { cn } from "cn";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { formatPrice, padCount } from "@/lib/format";

export type FilterCategory = { name: string; slug: string; count: number };

type CatalogFiltersProps = {
  categories: FilterCategory[];
  priceRange: { min: number; max: number };
  /** Se llama tras aplicar un filtro para poder cerrar el panel en móvil. */
  onApplied?: () => void;
};

export function CatalogFilters({
  categories,
  priceRange,
  onApplied,
}: CatalogFiltersProps) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  const [min, setMin] = useState(params.get("min") ?? "");
  const [max, setMax] = useState(params.get("max") ?? "");

  const currentCategory = params.get("categoria");
  const onlyOffers = params.get("oferta") === "1";
  const includeSoldOut = params.get("stock") === "todos";

  /**
   * Toda la configuración del catálogo vive en la URL: así los filtros se
   * pueden compartir, quedan en el historial y el servidor renderiza la página
   * ya filtrada sin un segundo viaje.
   */
  function apply(changes: Record<string, string | null>) {
    const next = new URLSearchParams(params.toString());

    for (const [key, value] of Object.entries(changes)) {
      if (value === null || value === "") next.delete(key);
      else next.set(key, value);
    }
    // Cualquier cambio de filtro vuelve a la primera página.
    next.delete("pagina");

    startTransition(() => {
      router.push(`/productos?${next.toString()}`, { scroll: false });
      onApplied?.();
    });
  }

  const activeCount = [
    currentCategory,
    onlyOffers ? "1" : null,
    includeSoldOut ? "1" : null,
    params.get("min"),
    params.get("max"),
    params.get("q"),
  ].filter(Boolean).length;

  // Atajos calculados sobre el rango real del catálogo, no valores inventados.
  const steps = [
    { label: `Hasta ${formatPrice(200000)}`, min: null, max: "200000" },
    { label: `${formatPrice(200000)} – ${formatPrice(800000)}`, min: "200000", max: "800000" },
    { label: `Más de ${formatPrice(800000)}`, min: "800000", max: null },
  ];

  return (
    <div className={cn("space-y-8", pending && "opacity-60")}>
      <section>
        <div className="flex items-center justify-between">
          <h3 className="eyebrow text-muted-foreground">Categoría</h3>
          {activeCount > 0 && (
            <button
              type="button"
              onClick={() => {
                setMin("");
                setMax("");
                apply({
                  categoria: null,
                  oferta: null,
                  stock: null,
                  min: null,
                  max: null,
                  q: null,
                });
              }}
              className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <RotateCcw className="size-3" />
              Limpiar ({activeCount})
            </button>
          )}
        </div>

        <ul className="mt-3 space-y-0.5">
          <li>
            <button
              type="button"
              onClick={() => apply({ categoria: null })}
              className={cn(
                "flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-sm transition-colors",
                !currentCategory ? "bg-muted font-medium" : "hover:bg-muted/60"
              )}
            >
              Todas
              {!currentCategory && <Check className="size-3.5" />}
            </button>
          </li>
          {categories.map((category) => {
            const active = currentCategory === category.slug;
            return (
              <li key={category.slug}>
                <button
                  type="button"
                  onClick={() =>
                    apply({ categoria: active ? null : category.slug })
                  }
                  className={cn(
                    "flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-sm transition-colors",
                    active ? "bg-muted font-medium" : "hover:bg-muted/60"
                  )}
                >
                  <span className="truncate">{category.name}</span>
                  {active ? (
                    <Check className="size-3.5 shrink-0" />
                  ) : (
                    <span className="tabular shrink-0 font-mono text-[10px] text-muted-foreground">
                      {padCount(category.count)}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <h3 className="eyebrow text-muted-foreground">Precio</h3>

        <div className="mt-3 flex flex-wrap gap-2">
          {steps.map((step) => {
            const active =
              (params.get("min") ?? "") === (step.min ?? "") &&
              (params.get("max") ?? "") === (step.max ?? "");
            return (
              <button
                key={step.label}
                type="button"
                onClick={() => {
                  setMin(step.min ?? "");
                  setMax(step.max ?? "");
                  apply({ min: step.min, max: step.max });
                }}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs transition-colors",
                  active
                    ? "border-foreground bg-foreground text-background"
                    : "hover:border-foreground"
                )}
              >
                {step.label}
              </button>
            );
          })}
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            apply({ min: min || null, max: max || null });
          }}
          className="mt-3 flex items-center gap-2"
        >
          <Input
            type="number"
            inputMode="numeric"
            value={min}
            onChange={(event) => setMin(event.target.value)}
            placeholder={String(priceRange.min)}
            aria-label="Precio mínimo"
            className="h-9"
            min={0}
          />
          <span className="text-muted-foreground">–</span>
          <Input
            type="number"
            inputMode="numeric"
            value={max}
            onChange={(event) => setMax(event.target.value)}
            placeholder={String(priceRange.max)}
            aria-label="Precio máximo"
            className="h-9"
            min={0}
          />
          <Button type="submit" variant="outline" size="sm" className="h-9 shrink-0">
            Ir
          </Button>
        </form>
      </section>

      <section className="space-y-4">
        <h3 className="eyebrow text-muted-foreground">Disponibilidad</h3>

        <label className="flex cursor-pointer items-center justify-between gap-3 text-sm">
          <span>Solo en oferta</span>
          <Switch
            checked={onlyOffers}
            onCheckedChange={(checked) =>
              apply({ oferta: checked ? "1" : null })
            }
          />
        </label>

        <label className="flex cursor-pointer items-center justify-between gap-3 text-sm">
          <span>
            Mostrar agotados
            <span className="mt-0.5 block text-xs text-muted-foreground">
              Por defecto solo verás lo que hay en bodega
            </span>
          </span>
          <Switch
            checked={includeSoldOut}
            onCheckedChange={(checked) =>
              apply({ stock: checked ? "todos" : null })
            }
          />
        </label>
      </section>
    </div>
  );
}
