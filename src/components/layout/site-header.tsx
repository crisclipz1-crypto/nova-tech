"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { cn } from "cn";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { SearchDialog } from "@/components/layout/search-dialog";
import { useCart } from "@/components/cart/cart-provider";
import { padCount } from "@/lib/format";
import { SITE } from "@/lib/config";

export type NavCategory = { name: string; slug: string; count: number };

const LINKS = [
  { href: "/productos", label: "Catálogo" },
  { href: "/productos?oferta=1", label: "Ofertas" },
  { href: "/como-funciona", label: "Cómo funciona" },
];

export function SiteHeader({ categories }: { categories: NavCategory[] }) {
  const pathname = usePathname();
  const { count, hydrated, setOpen: setCartOpen } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Cierra el menú al navegar: en móvil el Sheet quedaría abierto sobre la
  // página nueva. El ajuste se hace durante el render comparando con la ruta
  // anterior —no en un efecto— porque así React descarta el árbol antiguo sin
  // pintar un fotograma con el menú aún abierto.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setMenuOpen(false);
  }

  // ⌘K / Ctrl+K abre el buscador, como en cualquier herramienta moderna.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setSearchOpen((open) => !open);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-md supports-backdrop-filter:bg-background/70">
        <div className="container-page flex h-14 items-center gap-2 sm:h-16">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Abrir menú"
            className="-ml-2 grid size-10 place-items-center rounded-full transition-colors hover:bg-muted lg:hidden"
          >
            <Menu className="size-5" />
          </button>

          <Link
            href="/"
            className="shrink-0 font-mono text-[15px] font-medium tracking-[-0.02em] whitespace-nowrap sm:text-base"
          >
            {SITE.name}
            <sup className="ml-0.5 text-[9px] text-brand">®</sup>
          </Link>

          <nav className="ml-8 hidden items-center gap-7 lg:flex">
            {LINKS.map((link) => {
              const active =
                link.href === "/productos"
                  ? pathname === "/productos"
                  : pathname.startsWith(link.href.split("?")[0]!);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "link-underline text-sm transition-colors",
                    active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Buscar productos"
              className="grid size-10 place-items-center rounded-full transition-colors hover:bg-muted"
            >
              <Search className="size-[18px]" />
            </button>

            <button
              type="button"
              onClick={() => setCartOpen(true)}
              aria-label={`Abrir carrito, ${count} productos`}
              className="group relative -mr-2 flex h-10 items-center gap-2 rounded-full px-3 transition-colors hover:bg-muted"
            >
              <ShoppingBag className="size-[18px] transition-transform group-active:scale-90" />
              {/* Hasta hidratar no se conoce el carrito: se reserva el hueco
                  para que el número no empuje el layout al aparecer. */}
              <span
                className={cn(
                  "tabular font-mono text-xs transition-opacity",
                  hydrated ? "opacity-100" : "opacity-0",
                  count > 0 ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {padCount(count)}
              </span>
            </button>
          </div>
        </div>
      </header>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />

      {/* Menú móvil */}
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent
          side="left"
          showCloseButton={false}
          className="w-[86%] gap-0 p-0 sm:max-w-sm"
        >
          <div className="flex items-center justify-between border-b px-5 py-4">
            <SheetTitle className="font-mono text-[15px] font-medium">
              {SITE.name}
              <sup className="ml-0.5 text-[9px] text-brand">®</sup>
            </SheetTitle>
            <SheetDescription className="sr-only">
              Navegación principal de la tienda
            </SheetDescription>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Cerrar menú"
              className="-mr-2 grid size-9 place-items-center rounded-full transition-colors hover:bg-muted"
            >
              <X className="size-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-5 py-6">
            <ul className="space-y-1">
              {LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="block py-2.5 text-2xl font-medium tracking-[-0.03em]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <p className="eyebrow mt-9 mb-3 text-muted-foreground">Categorías</p>
            <ul className="space-y-0.5">
              {categories.map((category) => (
                <li key={category.slug}>
                  <Link
                    href={`/productos?categoria=${category.slug}`}
                    className="flex items-baseline justify-between gap-3 py-2 text-sm"
                  >
                    {category.name}
                    <span className="tabular font-mono text-[11px] text-muted-foreground">
                      {padCount(category.count)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="border-t px-5 py-4">
            <p className="text-xs leading-relaxed text-muted-foreground">
              Pago contra entrega en toda Colombia. Recibes, revisas y pagas en
              efectivo.
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
