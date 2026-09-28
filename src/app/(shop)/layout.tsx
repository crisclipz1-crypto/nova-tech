import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { CartSheet } from "@/components/cart/cart-sheet";
import { getCategories } from "@/lib/products";

/**
 * Cascarón de la tienda pública. El panel `/admin` vive fuera de este grupo y
 * tiene su propio layout, así que no arrastra cabecera ni pie.
 */
export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categories = await getCategories();

  const nav = categories.map((category) => ({
    name: category.name,
    slug: category.slug,
    count: category._count.products,
  }));

  return (
    <>
      <AnnouncementBar />
      <SiteHeader categories={nav} />
      <main className="flex-1">{children}</main>
      <SiteFooter categories={nav} />
      <CartSheet />
    </>
  );
}
