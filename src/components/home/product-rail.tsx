"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "cn";

import { ProductCard } from "@/components/shared/product-card";
import type { ProductCardData } from "@/types/catalog";

type ProductRailProps = {
  eyebrow: string;
  title: string;
  description?: string;
  href: string;
  linkLabel?: string;
  products: ProductCardData[];
  priority?: boolean;
};

/**
 * Carrusel horizontal con scroll nativo y `scroll-snap`.
 *
 * Se prefiere el scroll del navegador a una librería de carrusel: en móvil el
 * gesto ya es el correcto, funciona sin JavaScript y el teclado lo recorre
 * solo. Las flechas de escritorio son un extra encima, y se ocultan cuando no
 * hay nada más hacia ese lado.
 */
export function ProductRail({
  eyebrow,
  title,
  description,
  href,
  linkLabel = "Ver todo",
  products,
  priority = false,
}: ProductRailProps) {
  const scroller = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const sync = useCallback(() => {
    const node = scroller.current;
    if (!node) return;
    setCanScrollLeft(node.scrollLeft > 8);
    setCanScrollRight(
      node.scrollLeft + node.clientWidth < node.scrollWidth - 8
    );
  }, []);

  useEffect(() => {
    sync();
    const node = scroller.current;
    if (!node) return;

    const observer = new ResizeObserver(sync);
    observer.observe(node);
    return () => observer.disconnect();
  }, [sync, products.length]);

  function scrollBy(direction: 1 | -1) {
    const node = scroller.current;
    if (!node) return;
    node.scrollBy({
      left: direction * Math.min(node.clientWidth * 0.8, 600),
      behavior: "smooth",
    });
  }

  if (products.length === 0) return null;

  return (
    <section className="py-12 sm:py-16">
      <div className="container-page">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-xl">
            <p className="eyebrow text-brand">{eyebrow}</p>
            <h2 className="display-2 mt-3">{title}</h2>
            {description && (
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={href}
              className="link-underline text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {linkLabel}
            </Link>

            <div className="ml-2 hidden items-center gap-1 sm:flex">
              <button
                type="button"
                onClick={() => scrollBy(-1)}
                disabled={!canScrollLeft}
                aria-label="Desplazar a la izquierda"
                className={cn(
                  "grid size-9 place-items-center rounded-full border transition-all",
                  "hover:border-foreground disabled:pointer-events-none disabled:opacity-25"
                )}
              >
                <ArrowLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollBy(1)}
                disabled={!canScrollRight}
                aria-label="Desplazar a la derecha"
                className={cn(
                  "grid size-9 place-items-center rounded-full border transition-all",
                  "hover:border-foreground disabled:pointer-events-none disabled:opacity-25"
                )}
              >
                <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* El contenedor sangra hasta el borde para que la última tarjeta se vea
          cortada: es la señal de que hay más contenido a la derecha. */}
      <div
        ref={scroller}
        onScroll={sync}
        className="no-scrollbar mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-5 pb-2 sm:gap-5 sm:px-8 lg:px-12"
      >
        {products.map((product, index) => (
          <div key={product.id} className="snap-start">
            <ProductCard
              product={product}
              variant="rail"
              priority={priority && index < 2}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
