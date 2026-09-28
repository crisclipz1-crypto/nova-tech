"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, SlidersHorizontal } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  CatalogFilters,
  type FilterCategory,
} from "@/components/catalog/catalog-filters";

const SORTS = [
  { value: "relevancia", label: "Relevancia" },
  { value: "precio-asc", label: "Precio: de menor a mayor" },
  { value: "precio-desc", label: "Precio: de mayor a menor" },
  { value: "nuevos", label: "Más recientes" },
  { value: "vendidos", label: "Más vendidos" },
];

export function CatalogToolbar({
  total,
  categories,
  priceRange,
  activeFilters,
}: {
  total: number;
  categories: FilterCategory[];
  priceRange: { min: number; max: number };
  activeFilters: number;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);

  function setSort(value: string) {
    const next = new URLSearchParams(params.toString());
    if (value === "relevancia") next.delete("orden");
    else next.set("orden", value);
    next.delete("pagina");
    router.push(`/productos?${next.toString()}`, { scroll: false });
  }

  return (
    <>
      <div className="sticky top-14 z-30 -mx-5 mb-6 flex items-center justify-between gap-3 border-b bg-background/90 px-5 py-3 backdrop-blur-md sm:-mx-8 sm:top-16 sm:px-8 lg:mx-0 lg:border-0 lg:bg-transparent lg:px-0 lg:backdrop-blur-none">
        <p className="text-sm text-muted-foreground">
          <span className="tabular font-medium text-foreground">{total}</span>{" "}
          {total === 1 ? "producto" : "productos"}
        </p>

        <div className="flex items-center gap-2">
          {/* Select nativo a propósito: en móvil abre la rueda del sistema,
              que es más rápida y accesible que cualquier menú a medida. */}
          <div className="relative">
            <select
              value={params.get("orden") ?? "relevancia"}
              onChange={(event) => setSort(event.target.value)}
              aria-label="Ordenar productos"
              className="h-9 appearance-none rounded-full border bg-background py-0 pr-8 pl-3.5 text-sm transition-colors outline-none hover:border-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {SORTS.map((sort) => (
                <option key={sort.value} value={sort.value}>
                  {sort.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
          </div>

          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className="flex h-9 items-center gap-2 rounded-full border px-3.5 text-sm transition-colors hover:border-foreground lg:hidden"
          >
            <SlidersHorizontal className="size-3.5" />
            Filtros
            {activeFilters > 0 && (
              <span className="tabular grid size-4 place-items-center rounded-full bg-foreground font-mono text-[9px] text-background">
                {activeFilters}
              </span>
            )}
          </button>
        </div>
      </div>

      <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
        <SheetContent side="bottom" className="max-h-[85dvh] gap-0 rounded-t-2xl p-0">
          <div className="border-b px-5 py-4">
            <SheetTitle>Filtros</SheetTitle>
            <SheetDescription className="text-xs">
              Se aplican al instante
            </SheetDescription>
          </div>
          <div className="overflow-y-auto px-5 py-6">
            <CatalogFilters
              categories={categories}
              priceRange={priceRange}
              onApplied={() => setFiltersOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
