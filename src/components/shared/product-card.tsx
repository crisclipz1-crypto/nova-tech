"use client";

import Image from "next/image";
import Link from "next/link";
import { Check, Plus, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { cn } from "cn";

import { Price } from "@/components/shared/price";
import { useCart } from "@/components/cart/cart-provider";
import { discountPercent } from "@/lib/format";
import type { ProductCardData } from "@/types/catalog";

type ProductCardProps = {
  product: ProductCardData;
  /** Tamaño fijo para los carruseles horizontales de la home. */
  variant?: "grid" | "rail";
  priority?: boolean;
};

export function ProductCard({
  product,
  variant = "grid",
  priority = false,
}: ProductCardProps) {
  const { add, lastAdded } = useCart();

  const percent = discountPercent(product.price, product.compareAtPrice);
  const soldOut = product.stock <= 0;
  const hasVariants = product._count.variants > 0;
  const justAdded = lastAdded === product.id;
  const [cover, hoverImage] = product.images;

  function quickAdd(event: React.MouseEvent) {
    event.preventDefault();
    const result = add({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: cover?.url ?? null,
      unitPrice: product.price,
      compareAtPrice: product.compareAtPrice,
      variants: [],
      stock: product.stock,
    });

    if (result.ok) {
      toast.success("Añadido al carrito", { description: product.name });
    } else {
      toast.error(result.message ?? "No se pudo añadir");
    }
  }

  return (
    <article
      className={cn(
        "group/card relative flex flex-col",
        variant === "rail" && "w-[240px] shrink-0 sm:w-[280px]"
      )}
    >
      <Link
        href={`/productos/${product.slug}`}
        className="flex flex-1 flex-col focus-visible:outline-none"
      >
        <div className="relative aspect-square overflow-hidden rounded-xl bg-surface">
          {cover ? (
            <>
              <Image
                src={cover.url}
                alt={cover.alt || product.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                priority={priority}
                className={cn(
                  "object-cover transition-all duration-500 ease-out",
                  hoverImage
                    ? "group-hover/card:opacity-0"
                    : "group-hover/card:scale-[1.04]",
                  soldOut && "opacity-45 grayscale"
                )}
              />
              {/* Segunda foto en cruce suave: muestra el producto desde otro
                  ángulo sin obligar a entrar al detalle. */}
              {hoverImage && (
                <Image
                  src={hoverImage.url}
                  alt=""
                  aria-hidden
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className={cn(
                    "scale-[1.04] object-cover opacity-0 transition-opacity duration-500 ease-out group-hover/card:opacity-100",
                    soldOut && "opacity-0 grayscale"
                  )}
                />
              )}
            </>
          ) : (
            <div className="grid h-full place-items-center text-xs text-muted-foreground">
              Sin imagen
            </div>
          )}

          {/* Etiquetas. Se limita a dos para no tapar el producto. */}
          <div className="pointer-events-none absolute top-2.5 left-2.5 flex flex-col items-start gap-1.5">
            {percent !== null && (
              <span className="rounded-full bg-sale px-2 py-0.5 font-mono text-[10px] font-medium tracking-tight text-white">
                −{percent}%
              </span>
            )}
            {product.isNew && percent === null && (
              <span className="rounded-full bg-brand px-2 py-0.5 font-mono text-[10px] font-medium tracking-[0.1em] text-brand-foreground uppercase">
                Nuevo
              </span>
            )}
            {product.bestSeller && (
              <span className="rounded-full bg-background/90 px-2 py-0.5 font-mono text-[10px] font-medium tracking-[0.1em] uppercase backdrop-blur-sm">
                Más vendido
              </span>
            )}
          </div>

          {soldOut && (
            <div className="absolute inset-x-2.5 bottom-2.5 rounded-lg bg-background/95 py-1.5 text-center font-mono text-[10px] tracking-[0.12em] uppercase backdrop-blur-sm">
              Agotado
            </div>
          )}

          {/* Añadir rápido. En móvil siempre visible (no hay hover); en
              escritorio aparece al acercarse a la tarjeta. */}
          {!soldOut && (
            <button
              type="button"
              onClick={hasVariants ? undefined : quickAdd}
              aria-label={
                hasVariants
                  ? `Elegir opciones de ${product.name}`
                  : `Añadir ${product.name} al carrito`
              }
              className={cn(
                "absolute right-2.5 bottom-2.5 grid size-9 place-items-center rounded-full border border-border/60 bg-background/95 text-foreground shadow-sm backdrop-blur-sm transition-all duration-300",
                "hover:scale-105 hover:border-foreground active:scale-95",
                "sm:translate-y-2 sm:opacity-0 sm:group-hover/card:translate-y-0 sm:group-hover/card:opacity-100 sm:focus-visible:translate-y-0 sm:focus-visible:opacity-100",
                justAdded && "border-brand bg-brand text-brand-foreground"
              )}
            >
              {justAdded ? (
                <Check className="size-4" />
              ) : hasVariants ? (
                <SlidersHorizontal className="size-4" />
              ) : (
                <Plus className="size-4" />
              )}
            </button>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-1 pt-3">
          <p className="eyebrow text-muted-foreground">{product.category.name}</p>
          <h3 className="text-[15px] leading-snug font-medium">
            <span className="link-underline">{product.name}</span>
          </h3>
          <p className="line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">
            {product.summary}
          </p>
          <Price
            value={product.price}
            compareAt={product.compareAtPrice}
            size="sm"
            hidePercent
            className="mt-auto pt-2"
          />
        </div>
      </Link>
    </article>
  );
}
