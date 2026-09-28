import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { after } from "next/server";
import {
  BadgeCheck,
  BanknoteArrowDown,
  ChevronRight,
  RotateCcw,
  Truck,
} from "lucide-react";

import { ProductGallery } from "@/components/product/product-gallery";
import { ProductPurchase } from "@/components/product/product-purchase";
import { ProductCard } from "@/components/shared/product-card";
import { Stars } from "@/components/shared/stars";
import {
  getProductBySlug,
  getRelatedProducts,
  parseSpecs,
  ratingOf,
  trackProductView,
} from "@/lib/products";
import { whatsAppInquiry } from "@/lib/orders";
import { SITE } from "@/lib/config";
import { formatDate, initials } from "@/lib/format";

const TRUST = [
  { icon: BanknoteArrowDown, title: "Pago contra entrega", body: "Pagas en efectivo al recibir" },
  { icon: Truck, title: "Envío 1–3 días", body: "Gratis desde $200.000" },
  { icon: BadgeCheck, title: "Garantía 12 meses", body: "Producto original sellado" },
  { icon: RotateCcw, title: "Devolución en la puerta", body: "Si no te convence, no lo recibes" },
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) return { title: "Producto no encontrado" };

  return {
    title: product.name,
    description: product.summary,
    openGraph: {
      title: `${product.name} · ${SITE.name}`,
      description: product.summary,
      images: product.images[0] ? [{ url: product.images[0].url }] : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  // `after` ejecuta esto una vez enviada la respuesta: el contador del panel se
  // actualiza sin que la persona espere una escritura extra en la base.
  after(() => trackProductView(product.id));

  const related = await getRelatedProducts(product.categoryId, product.id);
  const specs = parseSpecs(product.specs);
  const rating = ratingOf(product.reviews);

  const whatsAppHref = whatsAppInquiry(
    `Hola ${SITE.name}, quiero saber más sobre el ${product.name}.`
  );

  return (
    <div className="container-page py-6 sm:py-10">
      <nav aria-label="Ruta de navegación" className="mb-6">
        <ol className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
          <li>
            <Link href="/" className="hover:text-foreground">
              Inicio
            </Link>
          </li>
          <ChevronRight className="size-3" aria-hidden />
          <li>
            <Link href="/productos" className="hover:text-foreground">
              Catálogo
            </Link>
          </li>
          <ChevronRight className="size-3" aria-hidden />
          <li>
            <Link
              href={`/productos?categoria=${product.category.slug}`}
              className="hover:text-foreground"
            >
              {product.category.name}
            </Link>
          </li>
          <ChevronRight className="size-3" aria-hidden />
          <li className="truncate text-foreground">{product.name}</li>
        </ol>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        <ProductGallery images={product.images} productName={product.name} />

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/productos?categoria=${product.category.slug}`}
              className="eyebrow text-brand"
            >
              {product.category.name}
            </Link>
            {product.badge && (
              <span className="rounded-full bg-brand px-2.5 py-1 font-mono text-[10px] tracking-[0.1em] text-brand-foreground uppercase">
                {product.badge}
              </span>
            )}
          </div>

          <h1 className="mt-3 text-3xl font-medium tracking-[-0.035em] text-balance sm:text-4xl">
            {product.name}
          </h1>

          {rating.count > 0 && (
            <a
              href="#resenas"
              className="mt-3 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <Stars value={rating.average} />
              <span className="tabular">{rating.average}</span>
              <span>
                ({rating.count} {rating.count === 1 ? "reseña" : "reseñas"})
              </span>
            </a>
          )}

          <p className="mt-4 text-base leading-relaxed text-pretty text-muted-foreground">
            {product.summary}
          </p>

          <div className="mt-8">
            <ProductPurchase
              product={{
                id: product.id,
                slug: product.slug,
                name: product.name,
                price: product.price,
                compareAtPrice: product.compareAtPrice,
                stock: product.stock,
                image: product.images[0]?.url ?? null,
              }}
              variants={product.variants}
              whatsAppHref={whatsAppHref}
            />
          </div>

          <ul className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-brand-soft">
            {TRUST.map(({ icon: Icon, title, body }) => (
              <li key={title} className="bg-brand-muted p-4">
                <Icon className="size-4 text-brand" />
                <p className="mt-2 text-[13px] font-medium">{title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{body}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Descripción y ficha técnica */}
      <section className="mt-16 grid gap-10 border-t pt-12 lg:grid-cols-2 lg:gap-14">
        <div>
          <h2 className="eyebrow text-muted-foreground">Sobre el producto</h2>
          <div className="mt-4 space-y-4">
            {product.description.split("\n\n").map((paragraph, index) => (
              <p
                key={index}
                className="text-[15px] leading-relaxed text-pretty text-muted-foreground"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        {specs.length > 0 && (
          <div>
            <h2 className="eyebrow text-muted-foreground">Ficha técnica</h2>
            <dl className="mt-4 divide-y border-y">
              {specs.map((spec) => (
                <div
                  key={spec.label}
                  className="flex items-baseline justify-between gap-6 py-3"
                >
                  <dt className="shrink-0 text-sm text-muted-foreground">
                    {spec.label}
                  </dt>
                  <dd className="text-right text-sm font-medium">{spec.value}</dd>
                </div>
              ))}
            </dl>
            {product.sku && (
              <p className="mt-4 font-mono text-[11px] tracking-wide text-muted-foreground">
                SKU {product.sku}
              </p>
            )}
          </div>
        )}
      </section>

      {/* Reseñas */}
      {product.reviews.length > 0 && (
        <section id="resenas" className="mt-16 border-t pt-12">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="display-2">Reseñas de clientes</h2>
            <div className="flex items-center gap-3">
              <Stars value={rating.average} size={18} />
              <span className="text-sm text-muted-foreground">
                <span className="tabular font-medium text-foreground">
                  {rating.average}
                </span>{" "}
                de 5 · {rating.count}{" "}
                {rating.count === 1 ? "reseña" : "reseñas"}
              </span>
            </div>
          </div>

          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {product.reviews.map((review) => (
              <li key={review.id} className="rounded-xl border p-5">
                <div className="flex items-center justify-between gap-3">
                  <Stars value={review.rating} />
                  {review.verified && (
                    <span className="flex items-center gap-1 font-mono text-[10px] tracking-[0.1em] text-success uppercase">
                      <BadgeCheck className="size-3" />
                      Compra verificada
                    </span>
                  )}
                </div>

                {review.title && (
                  <p className="mt-3 text-[15px] font-medium">{review.title}</p>
                )}
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {review.body}
                </p>

                <div className="mt-4 flex items-center gap-2.5 border-t pt-4 text-xs">
                  <span
                    aria-hidden
                    className="grid size-7 place-items-center rounded-full bg-surface font-mono text-[10px] font-medium"
                  >
                    {initials(review.authorName)}
                  </span>
                  <span className="font-medium">{review.authorName}</span>
                  <span className="text-muted-foreground">
                    {review.city && `${review.city} · `}
                    {formatDate(review.createdAt)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {related.length > 0 && (
        <section className="mt-16 border-t pt-12">
          <h2 className="display-2">También te puede servir</h2>
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-5 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
