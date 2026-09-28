import Link from "next/link";
import { BadgeCheck } from "lucide-react";

import { Stars } from "@/components/shared/stars";
import { initials } from "@/lib/format";

type Testimonial = {
  id: string;
  authorName: string;
  city: string | null;
  rating: number;
  title: string | null;
  body: string;
  verified: boolean;
  product: { name: string; slug: string } | null;
};

export function Testimonials({ reviews }: { reviews: Testimonial[] }) {
  if (reviews.length === 0) return null;

  const average =
    Math.round(
      (reviews.reduce((sum, review) => sum + review.rating, 0) /
        reviews.length) *
        10
    ) / 10;

  return (
    <section className="container-page py-16 sm:py-20">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-xl">
          <p className="eyebrow text-brand">Lo que dicen los clientes</p>
          <h2 className="display-2 mt-3 text-balance">
            {reviews.length > 0 && (
              <>
                <span className="tabular">{average}</span> de 5 en compras
                verificadas
              </>
            )}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <Stars value={average} size={18} />
          <span className="text-sm text-muted-foreground">
            Reseñas de pedidos entregados
          </span>
        </div>
      </div>

      {/* Mosaico irregular: en escritorio las reseñas se acomodan en columnas
          y cada una conserva su alto natural, que es como se leen mejor. */}
      <div className="mt-10 gap-4 sm:columns-2 lg:columns-3">
        {reviews.map((review) => (
          <figure
            key={review.id}
            className="mb-4 break-inside-avoid rounded-xl border p-5 transition-colors hover:border-foreground/25"
          >
            <div className="flex items-center justify-between gap-3">
              <Stars value={review.rating} />
              {review.verified && (
                <span className="flex items-center gap-1 font-mono text-[10px] tracking-[0.1em] text-success uppercase">
                  <BadgeCheck className="size-3" />
                  Verificada
                </span>
              )}
            </div>

            <blockquote className="mt-3">
              {review.title && (
                <p className="text-[15px] font-medium">{review.title}</p>
              )}
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {review.body}
              </p>
            </blockquote>

            <figcaption className="mt-4 flex items-center gap-2.5 border-t pt-4">
              <span
                aria-hidden
                className="grid size-8 shrink-0 place-items-center rounded-full bg-surface font-mono text-[11px] font-medium"
              >
                {initials(review.authorName)}
              </span>
              <span className="min-w-0 flex-1 text-xs">
                <span className="block truncate font-medium">
                  {review.authorName}
                </span>
                <span className="block truncate text-muted-foreground">
                  {review.city}
                  {review.product && (
                    <>
                      {" · "}
                      <Link
                        href={`/productos/${review.product.slug}`}
                        className="hover:text-foreground hover:underline"
                      >
                        {review.product.name}
                      </Link>
                    </>
                  )}
                </span>
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
