"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ExternalLink,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  ReceiptText,
  Star,
  X,
} from "lucide-react";
import { cn } from "cn";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { logout } from "@/app/admin/actions";
import { SITE } from "@/lib/config";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/pedidos", label: "Pedidos", icon: ReceiptText },
  { href: "/admin/productos", label: "Productos", icon: Package },
  { href: "/admin/banners", label: "Banners", icon: ImageIcon },
  { href: "/admin/resenas", label: "Reseñas", icon: Star },
];

export function AdminNav({
  user,
  pendingOrders,
}: {
  user: { name?: string | null; email?: string | null };
  pendingOrders: number;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Mismo ajuste en render que en la cabecera de la tienda: cerrar el menú al
  // cambiar de ruta sin pasar por un efecto.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  const items = (
    <nav className="flex-1">
      <ul className="space-y-0.5">
        {LINKS.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);

          return (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                  active
                    ? "bg-brand text-brand-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="size-4 shrink-0" />
                <span className="flex-1">{label}</span>
                {href === "/admin/pedidos" && pendingOrders > 0 && (
                  <span
                    className={cn(
                      "tabular grid min-w-5 place-items-center rounded-full px-1.5 font-mono text-[10px]",
                      active
                        ? "bg-background/20 text-background"
                        : "bg-brand text-brand-foreground"
                    )}
                  >
                    {pendingOrders}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );

  const footer = (
    <div className="space-y-3 border-t pt-4">
      <Link
        href="/"
        target="_blank"
        className="flex items-center gap-2 px-3 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <ExternalLink className="size-3.5" />
        Ver la tienda
      </Link>

      <div className="px-3">
        <p className="truncate text-sm font-medium">{user.name}</p>
        <p className="truncate text-xs text-muted-foreground">{user.email}</p>
      </div>

      <form action={logout}>
        <button
          type="submit"
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <LogOut className="size-4" />
          Cerrar sesión
        </button>
      </form>
    </div>
  );

  return (
    <>
      {/* Barra superior — solo móvil y tablet */}
      <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b bg-background/90 px-4 backdrop-blur-md lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Abrir menú del panel"
          className="-ml-2 grid size-10 place-items-center rounded-full transition-colors hover:bg-muted"
        >
          <Menu className="size-5" />
        </button>

        <p className="font-mono text-sm font-medium">
          {SITE.name}
          <span className="ml-2 text-xs text-muted-foreground">Panel</span>
        </p>

        {pendingOrders > 0 && (
          <Link
            href="/admin/pedidos?estado=PENDIENTE"
            className="tabular ml-auto rounded-full bg-brand px-2.5 py-1 font-mono text-[10px] text-brand-foreground"
          >
            {pendingOrders} pendientes
          </Link>
        )}
      </header>

      {/* Barra lateral — escritorio */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r bg-surface px-3 py-5 lg:flex">
        <Link href="/admin" className="mb-6 block px-3">
          <span className="font-mono text-[15px] font-medium tracking-[-0.02em]">
            {SITE.name}
            <sup className="ml-0.5 text-[9px] text-brand">®</sup>
          </span>
          <span className="mt-0.5 block font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
            Panel interno
          </span>
        </Link>

        {items}
        {footer}
      </aside>

      {/* Menú móvil */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="left"
          showCloseButton={false}
          className="flex w-[80%] flex-col gap-0 p-0 sm:max-w-xs"
        >
          <div className="flex items-center justify-between border-b px-4 py-4">
            <SheetTitle className="font-mono text-sm font-medium">
              {SITE.name} · Panel
            </SheetTitle>
            <SheetDescription className="sr-only">
              Navegación del panel de administración
            </SheetDescription>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Cerrar menú"
              className="-mr-2 grid size-9 place-items-center rounded-full transition-colors hover:bg-muted"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="flex flex-1 flex-col px-3 py-4">
            {items}
            {footer}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
