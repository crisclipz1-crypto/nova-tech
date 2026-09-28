"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, Search, X } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatPrice } from "@/lib/format";
import type { SearchResult } from "@/types/catalog";

const SUGGESTIONS = [
  "audífonos",
  "portátil",
  "teclado",
  "reloj",
  "cargador",
  "cámara",
];

export function SearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const term = query.trim();

  // Búsqueda en vivo: se espera a que la persona deje de escribir y se aborta
  // la petición anterior, así los resultados nunca llegan desordenados.
  // El estado solo se toca dentro del temporizador, nunca en el cuerpo del
  // efecto: así no se encadena un render extra por cada tecla pulsada.
  useEffect(() => {
    if (term.length < 2) return;

    const controller = new AbortController();

    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(term)}`,
          { signal: controller.signal }
        );
        const data = await response.json();
        if (!controller.signal.aborted) {
          setResults(Array.isArray(data.results) ? data.results : []);
        }
      } catch (error) {
        if ((error as Error).name !== "AbortError") setResults([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 250);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [term]);

  // Al cerrar se vacía el buscador. El ajuste se hace durante el render
  // comparando con el estado anterior, que es lo que React recomienda para
  // sincronizar estado con una prop en vez de usar un efecto.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (!open) {
      setQuery("");
      setResults([]);
    }
  }

  // Mientras el término no llegue a dos caracteres no se muestra nada, aunque
  // queden resultados de una búsqueda anterior en el estado.
  const visibleResults = term.length >= 2 ? results : [];

  function goToCatalog(term: string) {
    onOpenChange(false);
    router.push(`/productos?q=${encodeURIComponent(term)}`);
  }

  const showEmpty = term.length >= 2 && !loading && visibleResults.length === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="top-0 max-h-[100dvh] w-full max-w-full translate-y-0 gap-0 rounded-none border-0 p-0 sm:top-[8vh] sm:max-w-2xl sm:rounded-2xl sm:border"
      >
        <DialogTitle className="sr-only">Buscar productos</DialogTitle>
        <DialogDescription className="sr-only">
          Escribe para ver resultados en tiempo real
        </DialogDescription>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (term.length >= 2) goToCatalog(term);
          }}
          className="flex items-center gap-3 border-b px-4 py-3.5"
        >
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Busca audífonos, portátiles, relojes…"
            aria-label="Buscar productos"
            className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
          />
          {loading && (
            <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />
          )}
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Cerrar buscador"
            className="grid size-7 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </form>

        <div className="max-h-[60vh] overflow-y-auto">
          {term.length < 2 && (
            <div className="px-4 py-5">
              <p className="eyebrow mb-3 text-muted-foreground">
                Búsquedas frecuentes
              </p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setQuery(suggestion)}
                    className="rounded-full border px-3 py-1.5 text-sm transition-colors hover:border-foreground hover:bg-muted"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {showEmpty && (
            <div className="px-4 py-10 text-center">
              <p className="text-sm font-medium">
                Nada para «{term}»
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Prueba con otra palabra o revisa el catálogo completo.
              </p>
            </div>
          )}

          {visibleResults.length > 0 && (
            <ul className="divide-y">
              {visibleResults.map((product) => (
                <li key={product.id}>
                  <Link
                    href={`/productos/${product.slug}`}
                    onClick={() => onOpenChange(false)}
                    className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/60"
                  >
                    <span className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-surface">
                      {product.images[0] && (
                        <Image
                          src={product.images[0].url}
                          alt=""
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">
                        {product.name}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {product.category.name}
                        {product.stock <= 0 && " · Agotado"}
                      </span>
                    </span>
                    <span className="tabular shrink-0 text-sm">
                      {formatPrice(product.price)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {term.length >= 2 && (
            <button
              type="button"
              onClick={() => goToCatalog(term)}
              className="flex w-full items-center justify-between border-t px-4 py-3.5 text-sm font-medium transition-colors hover:bg-muted/60"
            >
              Ver todos los resultados de «{term}»
              <ArrowRight className="size-4" />
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
