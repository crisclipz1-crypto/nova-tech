import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { ProductForm } from "@/components/admin/product-form";
import { EMPTY_PRODUCT } from "@/types/product-form";
import { getAllCategories } from "@/lib/admin-queries";

export const dynamic = "force-dynamic";

export const metadata = { title: "Nuevo producto" };

export default async function NewProductPage() {
  const categories = await getAllCategories();

  return (
    <div className="space-y-6">
      <Link
        href="/admin/productos"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Productos
      </Link>

      <header>
        <p className="eyebrow text-brand">Nuevo</p>
        <h1 className="mt-2 text-2xl font-medium tracking-[-0.03em] sm:text-3xl">
          Crear producto
        </h1>
      </header>

      <ProductForm
        initial={{
          ...EMPTY_PRODUCT,
          categoryId: categories[0]?.id ?? "",
        }}
        categories={categories}
      />
    </div>
  );
}
