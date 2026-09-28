import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { ProductForm } from "@/components/admin/product-form";
import { getAdminProduct, getAllCategories } from "@/lib/admin-queries";
import { parseSpecs } from "@/lib/products";
import { formatNumber } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [product, categories] = await Promise.all([
    getAdminProduct(id),
    getAllCategories(),
  ]);

  if (!product) notFound();

  return (
    <div className="space-y-6">
      <Link
        href="/admin/productos"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Productos
      </Link>

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-brand">Editar</p>
          <h1 className="mt-2 text-2xl font-medium tracking-[-0.03em] sm:text-3xl">
            {product.name}
          </h1>
        </div>

        <dl className="flex gap-6 text-sm">
          <div>
            <dt className="text-xs text-muted-foreground">Vendidos</dt>
            <dd className="tabular font-medium">
              {formatNumber(product.unitsSold)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Visitas</dt>
            <dd className="tabular font-medium">{formatNumber(product.views)}</dd>
          </div>
        </dl>
      </header>

      <ProductForm
        productId={product.id}
        productSlug={product.slug}
        categories={categories}
        initial={{
          name: product.name,
          slug: product.slug,
          summary: product.summary,
          description: product.description,
          price: product.price,
          compareAtPrice: product.compareAtPrice ?? "",
          sku: product.sku ?? "",
          brand: product.brand ?? "",
          stock: product.stock,
          categoryId: product.categoryId,
          active: product.active,
          featured: product.featured,
          bestSeller: product.bestSeller,
          isNew: product.isNew,
          badge: product.badge ?? "",
          specs: parseSpecs(product.specs),
          images: product.images.map((image) => ({
            url: image.url,
            alt: image.alt,
          })),
          variants: product.variants.map((variant) => ({
            group: variant.group,
            label: variant.label,
            value: variant.value,
            hex: variant.hex ?? "",
            priceDelta: variant.priceDelta,
            stock: variant.stock,
          })),
        }}
      />
    </div>
  );
}
