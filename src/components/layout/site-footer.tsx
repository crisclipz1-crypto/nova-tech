import Link from "next/link";
// lucide-react v1 retiró los iconos de marca (Instagram, TikTok…), así que se
// usan equivalentes genéricos con su etiqueta accesible correspondiente.
import { Camera, MessageCircle, Music2 } from "lucide-react";

import { SITE, WHATSAPP_DISPLAY } from "@/lib/config";
import { whatsAppInquiry } from "@/lib/orders";

const COLUMNS = [
  {
    title: "Tienda",
    links: [
      { label: "Catálogo completo", href: "/productos" },
      { label: "Ofertas", href: "/productos?oferta=1" },
      { label: "Novedades", href: "/productos?orden=nuevos" },
      { label: "Más vendidos", href: "/productos?orden=vendidos" },
    ],
  },
  {
    title: "Ayuda",
    links: [
      { label: "Cómo funciona", href: "/como-funciona" },
      { label: "Envíos y cobertura", href: "/como-funciona#envios" },
      { label: "Garantía", href: "/como-funciona#garantia" },
      { label: "Cambios y devoluciones", href: "/como-funciona#devoluciones" },
    ],
  },
];

export function SiteFooter({
  categories,
}: {
  categories: { name: string; slug: string }[];
}) {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t bg-surface">
      <div className="container-page py-14 sm:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,1fr)] lg:gap-8">
          <div className="max-w-sm">
            <p className="font-mono text-base font-medium tracking-[-0.02em]">
              {SITE.name}
              <sup className="ml-0.5 text-[9px] text-brand">®</sup>
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {SITE.description}
            </p>

            <a
              href={whatsAppInquiry(
                `Hola ${SITE.name}, tengo una pregunta sobre un producto.`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2.5 text-sm transition-colors hover:border-foreground"
            >
              <MessageCircle className="size-4 text-success" />
              <span className="tabular">{WHATSAPP_DISPLAY}</span>
            </a>

            <div className="mt-5 flex items-center gap-1">
              <a
                href={SITE.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="grid size-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
              >
                <Camera className="size-[18px]" />
              </a>
              <a
                href={SITE.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="grid size-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
              >
                <Music2 className="size-[18px]" />
              </a>
            </div>
          </div>

          {COLUMNS.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <p className="eyebrow mb-4 text-muted-foreground">{column.title}</p>
              <ul className="space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="link-underline text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <nav aria-label="Categorías">
            <p className="eyebrow mb-4 text-muted-foreground">Categorías</p>
            <ul className="space-y-2.5">
              {categories.map((category) => (
                <li key={category.slug}>
                  <Link
                    href={`/productos?categoria=${category.slug}`}
                    className="link-underline text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            © {year} {SITE.legalName}. Todos los derechos reservados.
          </p>
          <p className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
            Solo pago contra entrega · No pedimos datos bancarios
          </p>
        </div>
      </div>
    </footer>
  );
}
