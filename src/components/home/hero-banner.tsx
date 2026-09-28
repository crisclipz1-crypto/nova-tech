import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, BanknoteArrowDown, Truck } from "lucide-react";
import { cn } from "cn";

import { bannerTheme } from "@/lib/config";

type HeroBannerProps = {
  banner: {
    eyebrow: string | null;
    title: string;
    subtitle: string | null;
    ctaLabel: string | null;
    ctaHref: string | null;
    image: string | null;
    theme: string;
  } | null;
};

/** Se usa si el panel no tiene ningún banner activo: la home nunca queda vacía. */
const FALLBACK = {
  eyebrow: "Pago contra entrega",
  title: "Tecnología que pagas cuando la tienes en la mano",
  subtitle:
    "Audio, cómputo y accesorios originales con garantía de 12 meses. Recibes, revisas y entonces pagas en efectivo.",
  ctaLabel: "Ver catálogo",
  ctaHref: "/productos",
  image: null,
  theme: "default",
};

const TRUST = [
  { icon: BanknoteArrowDown, text: "Pagas al recibir" },
  { icon: Truck, text: "Envío gratis desde $200.000" },
  { icon: BadgeCheck, text: "Garantía 12 meses" },
];

export function HeroBanner({ banner }: HeroBannerProps) {
  const data = banner ?? FALLBACK;
  const theme = bannerTheme(data.theme);
  const href = data.ctaHref || "/productos";

  return (
    <section className={cn("relative overflow-hidden", theme.wrapper)}>
      {/* Halo difuso que da profundidad sin necesitar una imagen de fondo. */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute -top-40 -right-24 size-[520px] rounded-full blur-3xl",
          theme.glow
        )}
      />

      <div className="container-page relative grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-24">
        <div className="animate-rise">
          {data.eyebrow && (
            <p className={cn("eyebrow mb-5", theme.eyebrow)}>{data.eyebrow}</p>
          )}

          <h1 className="display-1 text-balance">{data.title}</h1>

          {data.subtitle && (
            <p className="mt-6 max-w-lg text-base leading-relaxed text-pretty opacity-70 sm:text-lg">
              {data.subtitle}
            </p>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href={href}
              className={cn(
                "group inline-flex h-13 items-center gap-2 rounded-full px-7 text-sm font-medium transition-all active:scale-[0.98]",
                theme.cta
              )}
            >
              {data.ctaLabel || "Ver catálogo"}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>

            <Link
              href="/como-funciona"
              className="inline-flex h-13 items-center rounded-full border border-current/20 px-6 text-sm transition-colors hover:border-current/50"
            >
              Cómo funciona
            </Link>
          </div>

          <ul className="mt-10 flex flex-wrap gap-x-7 gap-y-3">
            {TRUST.map(({ icon: Icon, text }) => (
              <li
                key={text}
                className="flex items-center gap-2 text-xs opacity-70"
              >
                <Icon className="size-3.5 shrink-0" />
                {text}
              </li>
            ))}
          </ul>
        </div>

        {data.image && (
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl lg:aspect-[5/6]">
            <Image
              src={data.image}
              alt=""
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover"
            />
          </div>
        )}
      </div>
    </section>
  );
}
