import Image from "next/image";
import Link from "next/link";
import { PackagePlus, PackageSearch, Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { ProductRowActions } from "@/components/admin/product-row-actions";
import { getAdminProducts, getAllCategories } from "@/lib/admin-queries";
import { discountPercent, formatNumber, formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata = { title: "Productos" };

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; categoria?: string }>;
}) {
  const { q, categoria } = await searchParams;

  const categories = await getAllCategories();
  const category = categories.find((item) => item.slug === categoria);

  const products = await getAdminProducts({
    query: q?.trim() || undefined,
    categoryId: category?.id,
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-brand">Catálogo</p>
          <h1 className="mt-2 text-2xl font-medium tracking-[-0.03em] sm:text-3xl">
            {products.length}{" "}
            {products.length === 1 ? "producto" : "productos"}
          </h1>
        </div>

        <Link
          href="/admin/productos/nuevo"
          className="inline-flex h-10 items-center gap-2 rounded-full bg-foreground px-4 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
        >
          <PackagePlus className="size-4" />
          Nuevo producto
        </Link>
      </header>

      <div className="space-y-3">
        <form action="/admin/productos" className="relative">
          {categoria && (
            <input type="hidden" name="categoria" value={categoria} />
          )}
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Buscar por nombre, SKU o slug…"
            className="h-11 pl-10"
          />
        </form>

        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <Link
            href={q ? `/admin/productos?q=${encodeURIComponent(q)}` : "/admin/productos"}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
              !categoria
                ? "border-foreground bg-foreground text-background"
                : "hover:border-foreground"
            }`}
          >
            Todas
          </Link>
          {categories.map((item) => (
            <Link
              key={item.id}
              href={`/admin/productos?categoria=${item.slug}${
                q ? `&q=${encodeURIComponent(q)}` : ""
              }`}
              className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                categoria === item.slug
                  ? "border-foreground bg-foreground text-background"
                  : "hover:border-foreground"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-20 text-center">
          <PackageSearch className="size-6 text-muted-foreground" />
          <p className="text-sm font-medium">No hay productos con estos filtros</p>
          <Link
            href="/admin/productos/nuevo"
            className="text-sm text-muted-foreground underline underline-offset-4"
          >
            Crear el primero
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border">
          <table className="w-full text-sm">
            <thead className="hidden border-b bg-surface sm:table-header-group">
              <tr className="text-left">
                <th className="px-4 py-3 font-medium">Producto</th>
                <th className="px-4 py-3 font-medium">Categoría</th>
                <th className="px-4 py-3 text-right font-medium">Precio</th>
                <th className="px-4 py-3 text-right font-medium">Stock</th>
                <th className="px-4 py-3 text-right font-medium">Vendidos</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>

            <tbody className="divide-y">
              {products.map((product) => {
                const percent = discountPercent(
                  product.price,
                  product.compareAtPrice
                );

                return (
                  <tr
                    key={product.id}
                    className="flex flex-wrap items-center gap-y-2 px-4 py-3 transition-colors hover:bg-muted/40 sm:table-row sm:px-0 sm:py-0"
                  >
                    <td className="flex min-w-0 flex-1 items-center gap-3 sm:table-cell sm:px-4 sm:py-3">
                      <span className="flex items-center gap-3">
                        <span className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-surface">
                          {product.images[0] && (
                            <Image
                              src={product.images[0].url}
                              alt=""
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          )}
                        </span>

                        <span className="min-w-0">
                          <Link
                            href={`/admin/productos/${product.id}`}
                            className="block truncate font-medium hover:underline"
                          >
                            {product.name}
                          </Link>
                          <span className="mt-0.5 flex flex-wrap items-center gap-1.5">
                            {!product.active && (
                              <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                                Oculto
                              </span>
                            )}
                            {product.bestSeller && (
                              <span className="rounded-full bg-foreground px-1.5 py-0.5 text-[10px] text-background">
                                Top
                              </span>
                            )}
                            {product.isNew && (
                              <span className="rounded-full bg-brand-muted px-1.5 py-0.5 text-[10px] text-brand">
                                Nuevo
                              </span>
                            )}
                            {product._count.variants > 0 && (
                              <span className="text-[10px] text-muted-foreground">
                                {product._count.variants} variantes
                              </span>
                            )}
                          </span>
                        </span>
                      </span>
                    </td>

                    <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                      {product.category.name}
                    </td>

                    <td className="tabular px-4 py-3 text-right sm:table-cell">
                      <span className="font-medium">
                        {formatPrice(product.price)}
                      </span>
                      {percent !== null && (
                        <span className="block text-[11px] text-sale">
                          −{percent}%
                        </span>
                      )}
                    </td>

                    <td className="tabular hidden px-4 py-3 text-right sm:table-cell">
                      <span
                        className={
                          product.stock <= 5
                            ? "font-medium text-sale"
                            : "text-muted-foreground"
                        }
                      >
                        {product.stock}
                      </span>
                    </td>

                    <td className="tabular hidden px-4 py-3 text-right text-muted-foreground sm:table-cell">
                      {formatNumber(product.unitsSold)}
                    </td>

                    <td className="px-4 py-3 sm:table-cell">
                      <ProductRowActions
                        productId={product.id}
                        active={product.active}
                        hasOrders={product._count.orderItems > 0}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
