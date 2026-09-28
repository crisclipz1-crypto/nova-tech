import type { Metadata } from "next";
import Link from "next/link";
import { PackageSearch } from "lucide-react";

import { ProductCard } from "@/components/shared/product-card";
import { CatalogFilters } from "@/components/catalog/catalog-filters";
import { CatalogToolbar } from "@/components/catalog/catalog-toolbar";
import { Pagination } from "@/components/catalog/pagination";
import { getCatalog, getCategories } from "@/lib/products";
import { catalogParamsSchema } from "@/lib/validations";

export const metadata: Metadata = {
  title: "Catálogo",
  description:
    "Audio, cómputo, smartphones y accesorios con pago contra entrega en toda Colombia.",
};

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;

  // Los parámetros vienen de la URL, así que son entrada no confiable: Zod los
  // recorta y, con `.catch(undefined)`, descarta lo inválido sin romper nada.
  const params = catalogParamsSchema.parse(raw);

  const [{ products, total, page, pages, priceRange }, categories] =
    await Promise.all([getCatalog(params), getCategories()]);

  const filterCategories = categories.map((category) => ({
    name: category.name,
    slug: category.slug,
    count: category._count.products,
  }));

  const activeFilters = [
    params.categoria,
    params.oferta,
    params.stock === "todos" ? "1" : null,
    params.min,
    params.max,
    params.q,
  ].filter(Boolean).length;

  function buildHref(target: number) {
    const next = new URLSearchParams();
    for (const [key, value] of Object.entries(raw)) {
      if (typeof value === "string" && value) next.set(key, value);
    }
    if (target <= 1) next.delete("pagina");
    else next.set("pagina", String(target));
    const query = next.toString();
    return query ? `/productos?${query}` : "/productos";
  }

  const heading = params.q
    ? `Resultados para «${params.q}»`
    : params.oferta
      ? "En oferta"
      : (categories.find((c) => c.slug === params.categoria)?.name ??
        "Todo el catálogo");

  return (
    <div className="container-page py-8 sm:py-12">
      <header className="mb-8 max-w-2xl">
        <p className="eyebrow text-brand">Catálogo</p>
        <h1 className="display-2 mt-3 text-balance">{heading}</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Todo con pago contra entrega y garantía de 12 meses. Envío gratis
          desde $200.000.
        </p>
      </header>

      <div className="lg:grid lg:grid-cols-[240px_1fr] lg:gap-12">
        {/* Filtros fijos en escritorio; en móvil viven dentro del Sheet de la
            barra de herramientas. */}
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <CatalogFilters
              categories={filterCategories}
              priceRange={priceRange}
            />
          </div>
        </aside>

        <div className="min-w-0">
          <CatalogToolbar
            total={total}
            categories={filterCategories}
            priceRange={priceRange}
            activeFilters={activeFilters}
          />

          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed py-20 text-center">
              <PackageSearch className="size-7 text-muted-foreground" />
              <div className="space-y-1">
                <p className="font-medium">No encontramos nada con esos filtros</p>
                <p className="text-sm text-balance text-muted-foreground">
                  Prueba a quitar algún filtro o busca con otra palabra.
                </p>
              </div>
              <Link
                href="/productos"
                className="mt-1 inline-flex h-10 items-center rounded-full border px-5 text-sm transition-colors hover:border-foreground"
              >
                Ver todo el catálogo
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-5 sm:gap-y-10 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    priority={index < 4}
                  />
                ))}
              </div>

              <Pagination page={page} pages={pages} buildHref={buildHref} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
