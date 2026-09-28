import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { HeroBanner } from "@/components/home/hero-banner";
import { ProductRail } from "@/components/home/product-rail";
import { CategoryGrid } from "@/components/home/category-grid";
import { HowItWorks } from "@/components/home/how-it-works";
import { WhyUs } from "@/components/home/why-us";
import { Testimonials } from "@/components/home/testimonials";
import {
  getActiveBanner,
  getBestSellers,
  getCategories,
  getFeaturedReviews,
  getNewArrivals,
  getOnSale,
} from "@/lib/products";

/**
 * La home se regenera cada dos minutos. Las acciones del panel llaman a
 * `revalidatePath("/")`, así que un cambio de precio o de banner se ve de
 * inmediato; el plazo es solo la red de seguridad.
 */
export const revalidate = 120;

export default async function HomePage() {
  const [banner, bestSellers, newArrivals, onSale, categories, reviews] =
    await Promise.all([
      getActiveBanner(),
      getBestSellers(8),
      getNewArrivals(8),
      getOnSale(8),
      getCategories(),
      getFeaturedReviews(6),
    ]);

  return (
    <>
      <HeroBanner banner={banner} />

      <ProductRail
        eyebrow="Los más vendidos"
        title="Lo que más sale por la puerta"
        description="Los productos que más piden nuestros clientes mes a mes."
        href="/productos?orden=vendidos"
        products={bestSellers}
        priority
      />

      <CategoryGrid categories={categories} />

      {onSale.length > 0 && (
        <ProductRail
          eyebrow="Promociones activas"
          title="En oferta ahora mismo"
          description="Precios rebajados mientras dure el inventario."
          href="/productos?oferta=1"
          linkLabel="Ver todas las ofertas"
          products={onSale}
        />
      )}

      <HowItWorks />

      <ProductRail
        eyebrow="Lo más reciente"
        title="Recién llegado a la bodega"
        description="Lo último que sumamos al catálogo."
        href="/productos?orden=nuevos"
        products={newArrivals}
      />

      <WhyUs />

      <Testimonials reviews={reviews} />

      <section className="container-page pb-20">
        <div className="flex flex-col items-start gap-6 rounded-2xl bg-brand px-6 py-12 text-brand-foreground sm:items-center sm:px-10 sm:text-center lg:py-16">
          <p className="eyebrow text-white/80">¿Listo?</p>
          <h2 className="display-2 max-w-2xl text-balance">
            Tu próximo equipo, pagado en la puerta de tu casa
          </h2>
          <p className="max-w-lg text-base text-pretty text-white/80">
            Sin pasarela de pago, sin datos de tarjeta, sin letra pequeña.
          </p>
          <Link
            href="/productos"
            className="group mt-2 inline-flex h-13 items-center gap-2 rounded-full bg-white px-7 text-sm font-medium text-brand transition-all hover:bg-white/90 active:scale-[0.98]"
          >
            Ver el catálogo
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </section>
    </>
  );
}
