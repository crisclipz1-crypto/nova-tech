import Link from "next/link";
import { ArrowRight, SearchX } from "lucide-react";

import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { SiteFooter } from "@/components/layout/site-footer";
import { getCategories } from "@/lib/products";

/**
 * 404 global. Se monta fuera del grupo `(shop)`, así que arma su propia
 * cabecera mínima y su pie en vez de heredarlos.
 */
export default async function NotFound() {
  const categories = await getCategories().catch(() => []);

  return (
    <>
      <AnnouncementBar />

      <header className="border-b">
        <div className="container-page flex h-14 items-center sm:h-16">
          <Link href="/" className="font-mono text-[15px] font-medium">
            NOVA TECH
            <sup className="ml-0.5 text-[9px] text-brand">®</sup>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
          <p className="font-mono text-sm tracking-[0.2em] text-muted-foreground">
            404
          </p>

          <span className="mt-6 grid size-14 place-items-center rounded-full bg-surface">
            <SearchX className="size-6 text-muted-foreground" />
          </span>

          <h1 className="display-2 mt-6 text-balance">
            Esta página no existe
          </h1>
          <p className="mt-3 max-w-md text-base text-pretty text-muted-foreground">
            Puede que el producto ya no esté disponible o que el enlace tenga
            algún error. El catálogo completo sigue donde siempre.
          </p>

          <Link
            href="/productos"
            className="group mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-brand px-7 text-sm font-medium text-brand-foreground transition-all hover:bg-brand-hover"
          >
            Ver el catálogo
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>

          {categories.length > 0 && (
            <nav className="mt-10" aria-label="Categorías">
              <p className="eyebrow mb-4 text-muted-foreground">
                O empieza por aquí
              </p>
              <ul className="flex flex-wrap justify-center gap-2">
                {categories.map((category) => (
                  <li key={category.id}>
                    <Link
                      href={`/productos?categoria=${category.slug}`}
                      className="inline-flex rounded-full border px-4 py-2 text-sm transition-colors hover:border-foreground"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>
      </main>

      <SiteFooter categories={categories} />
    </>
  );
}
