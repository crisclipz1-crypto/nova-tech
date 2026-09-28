"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { cn } from "cn";

type GalleryImage = { id: string; url: string; alt: string };

/**
 * Galería responsiva con dos presentaciones distintas del mismo contenido:
 * en móvil un carrusel con `scroll-snap` (el gesto natural del teléfono) y en
 * escritorio una imagen grande con tiras de miniaturas. Intentar servir un
 * único DOM para ambos obliga a pelearse con el scroll; separarlos sale más
 * barato y cada uno queda idiomático.
 */
export function ProductGallery({
  images,
  productName,
}: {
  images: GalleryImage[];
  productName: string;
}) {
  const [active, setActive] = useState(0);
  const [slide, setSlide] = useState(0);
  const scroller = useRef<HTMLDivElement>(null);

  if (images.length === 0) {
    return (
      <div className="grid aspect-square place-items-center rounded-2xl bg-surface text-sm text-muted-foreground">
        Sin imagen
      </div>
    );
  }

  function onScroll() {
    const node = scroller.current;
    if (!node) return;
    setSlide(Math.round(node.scrollLeft / node.clientWidth));
  }

  return (
    <>
      {/* Móvil */}
      <div className="lg:hidden">
        <div
          ref={scroller}
          onScroll={onScroll}
          className="no-scrollbar -mx-5 flex snap-x snap-mandatory overflow-x-auto"
        >
          {images.map((image, index) => (
            <div
              key={image.id}
              className="relative aspect-square w-full shrink-0 snap-center px-5"
            >
              <div className="relative size-full overflow-hidden rounded-2xl bg-surface">
                <Image
                  src={image.url}
                  alt={image.alt || `${productName} — imagen ${index + 1}`}
                  fill
                  priority={index === 0}
                  sizes="100vw"
                  className="object-cover"
                />
              </div>
            </div>
          ))}
        </div>

        {images.length > 1 && (
          <div className="mt-3 flex justify-center gap-1.5">
            {images.map((image, index) => (
              <button
                key={image.id}
                type="button"
                onClick={() => {
                  const node = scroller.current;
                  node?.scrollTo({
                    left: index * node.clientWidth,
                    behavior: "smooth",
                  });
                }}
                aria-label={`Ver imagen ${index + 1}`}
                aria-current={index === slide}
                className={cn(
                  "h-1 rounded-full transition-all duration-300",
                  index === slide ? "w-6 bg-foreground" : "w-1.5 bg-border"
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Escritorio */}
      <div className="hidden gap-4 lg:flex">
        {images.length > 1 && (
          <div className="flex w-20 shrink-0 flex-col gap-3">
            {images.map((image, index) => (
              <button
                key={image.id}
                type="button"
                onMouseEnter={() => setActive(index)}
                onFocus={() => setActive(index)}
                onClick={() => setActive(index)}
                aria-label={`Ver imagen ${index + 1} de ${productName}`}
                aria-current={index === active}
                className={cn(
                  "relative aspect-square overflow-hidden rounded-lg bg-surface ring-offset-2 transition-all",
                  index === active
                    ? "ring-2 ring-foreground"
                    : "opacity-60 hover:opacity-100"
                )}
              >
                <Image
                  src={image.url}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}

        <div className="relative aspect-square flex-1 overflow-hidden rounded-2xl bg-surface">
          {images.map((image, index) => (
            <Image
              key={image.id}
              src={image.url}
              alt={image.alt || productName}
              fill
              priority={index === 0}
              sizes="(max-width: 1024px) 100vw, 45vw"
              className={cn(
                "object-cover transition-opacity duration-300",
                index === active ? "opacity-100" : "opacity-0"
              )}
            />
          ))}
        </div>
      </div>
    </>
  );
}
