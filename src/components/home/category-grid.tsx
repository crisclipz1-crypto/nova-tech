import Image from "next/image";
import Link from "next/link";
import {
  Cable,
  Headphones,
  House,
  Laptop,
  type LucideIcon,
  Package,
  Smartphone,
  Watch,
} from "lucide-react";

import { padCount } from "@/lib/format";

/**
 * Los iconos se guardan en la base de datos por nombre. Se resuelven contra
 * este mapa explícito en vez de indexar todo `lucide-react`: así el bundle solo
 * incluye los seis iconos que se usan.
 */
const ICONS: Record<string, LucideIcon> = {
  Headphones,
  Laptop,
  Smartphone,
  Watch,
  Cable,
  House,
};

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  icon: string | null;
  _count: { products: number };
};

export function CategoryGrid({ categories }: { categories: Category[] }) {
  if (categories.length === 0) return null;

  return (
    <section className="container-page py-12 sm:py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-brand">Categorías</p>
          <h2 className="display-2 mt-3">Busca por lo que necesitas</h2>
        </div>
        <Link
          href="/productos"
          className="link-underline text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          Ver catálogo completo
        </Link>
      </div>

      <ul className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {categories.map((category) => {
          const Icon = ICONS[category.icon ?? ""] ?? Package;

          return (
            <li key={category.id}>
              <Link
                href={`/productos?categoria=${category.slug}`}
                className="group relative flex aspect-[4/3] flex-col justify-end overflow-hidden rounded-xl bg-surface p-4 sm:aspect-[16/10] sm:p-5"
              >
                {category.image && (
                  <Image
                    src={category.image}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                )}
                {/* Degradado de abajo a arriba: el texto se lee sobre
                    cualquier foto sin tener que oscurecerla entera. */}
                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent"
                />

                <Icon className="absolute top-4 left-4 size-5 text-white/85 sm:top-5 sm:left-5" />

                <div className="relative">
                  <p className="flex items-baseline gap-2 text-base font-medium text-white sm:text-lg">
                    {category.name}
                    <span className="tabular font-mono text-[10px] text-white/60">
                      {padCount(category._count.products)}
                    </span>
                  </p>
                  {category.description && (
                    <p className="mt-0.5 line-clamp-1 text-xs text-white/70">
                      {category.description}
                    </p>
                  )}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
