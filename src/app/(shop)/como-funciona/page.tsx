import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BanknoteArrowDown,
  MapPin,
  MessageCircle,
  Package,
  RotateCcw,
  Truck,
} from "lucide-react";

import { SITE, SHIPPING, WHATSAPP_DISPLAY } from "@/lib/config";
import { formatPrice } from "@/lib/format";
import { whatsAppInquiry } from "@/lib/orders";
import { DEPARTMENTS } from "@/lib/colombia";

export const metadata: Metadata = {
  title: "Cómo funciona el pago contra entrega",
  description:
    "Pides, confirmamos por WhatsApp, recibes y pagas en efectivo. Envíos, garantía y devoluciones explicados.",
};

const STEPS = [
  {
    step: "01",
    icon: Package,
    title: "Haces el pedido",
    body: "Eliges los productos y dejas tus datos de entrega. No pedimos número de tarjeta, ni cuenta bancaria, ni pago adelantado de ningún tipo.",
  },
  {
    step: "02",
    icon: MessageCircle,
    title: "Confirmamos por WhatsApp",
    body: "Un miembro del equipo te escribe para verificar la dirección y decirte el día de entrega. Si confirmas antes de las 2:00 p.m., despachamos el mismo día.",
  },
  {
    step: "03",
    icon: Truck,
    title: "Te lo llevamos",
    body: "Entre 1 y 3 días hábiles según la ciudad. Te avisamos cuando el mensajero salga con tu pedido.",
  },
  {
    step: "04",
    icon: BanknoteArrowDown,
    title: "Revisas y pagas",
    body: "Abres la caja delante del mensajero y compruebas que todo esté bien. Solo entonces pagas en efectivo. Si algo no te convence, lo devuelves ahí mismo sin costo.",
  },
];

const FAQ = [
  {
    id: "envios",
    icon: MapPin,
    title: "Envíos y cobertura",
    items: [
      {
        q: "¿A dónde envían?",
        a: `A los ${DEPARTMENTS.length} departamentos de Colombia. En el checkout eliges tu departamento y municipio de una lista de cobertura confirmada.`,
      },
      {
        q: "¿Cuánto cuesta el envío?",
        a: `${formatPrice(SHIPPING.flatRate)} a cualquier destino. Es gratis en pedidos desde ${formatPrice(SHIPPING.freeFrom)}.`,
      },
      {
        q: "¿Cuánto demora?",
        a: "1 día hábil en las ciudades principales y 2 a 3 días en el resto del país. Los pedidos confirmados antes de las 2:00 p.m. salen el mismo día.",
      },
    ],
  },
  {
    id: "garantia",
    icon: BadgeCheck,
    title: "Garantía",
    items: [
      {
        q: "¿Qué cubre la garantía?",
        a: "12 meses contra defectos de fábrica en todos los productos. Todo sale sellado y original; no vendemos remanufacturados ni reacondicionados.",
      },
      {
        q: "¿Cómo la hago efectiva?",
        a: "Escríbenos por WhatsApp con tu número de pedido. Coordinamos la recogida del producto en tu dirección, sin costo para ti.",
      },
      {
        q: "¿Cuánto demora una garantía?",
        a: "Entre 5 y 15 días hábiles según el caso. Te mantenemos informado por WhatsApp durante todo el proceso.",
      },
    ],
  },
  {
    id: "devoluciones",
    icon: RotateCcw,
    title: "Cambios y devoluciones",
    items: [
      {
        q: "¿Puedo rechazar el pedido al recibirlo?",
        a: "Sí. Revisas el producto delante del mensajero y, si no es lo que esperabas, no lo recibes y no pagas nada. Esa es toda la ventaja del pago contra entrega.",
      },
      {
        q: "¿Y si ya lo recibí y pagué?",
        a: "Tienes 5 días calendario para solicitar el cambio, siempre que el producto esté sin uso y con su empaque original. Escríbenos por WhatsApp y coordinamos la recogida.",
      },
      {
        q: "¿Devuelven el dinero?",
        a: "Sí, por el mismo medio que prefieras (transferencia o efectivo), una vez recibimos el producto de vuelta y verificamos su estado.",
      },
    ],
  },
];

export default function HowItWorksPage() {
  return (
    <div className="pb-20">
      <section className="border-b border-brand-soft bg-brand-muted">
        <div className="container-page py-14 sm:py-20">
          <div className="max-w-2xl">
            <p className="eyebrow text-brand">Cómo funciona</p>
            <h1 className="display-1 mt-4 text-balance">
              Pagas cuando el producto ya es tuyo
            </h1>
            <p className="mt-5 text-base leading-relaxed text-pretty text-muted-foreground sm:text-lg">
              Comprar tecnología en línea da desconfianza, y con razón. Aquí no
              tienes que confiar en nosotros por adelantado: el dinero cambia de
              manos cuando el producto ya está en las tuyas.
            </p>
          </div>
        </div>
      </section>

      <section className="container-page py-14 sm:py-20">
        <ol className="grid gap-px overflow-hidden rounded-xl bg-border sm:grid-cols-2">
          {STEPS.map(({ step, icon: Icon, title, body }) => (
            <li key={step} className="bg-background p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <Icon className="size-5 text-brand" />
                <span className="tabular font-mono text-xs tracking-[0.18em] text-muted-foreground">
                  {step}
                </span>
              </div>
              <h2 className="mt-5 text-lg font-medium tracking-[-0.02em]">
                {title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {body}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {FAQ.map((section) => (
        <section
          key={section.id}
          id={section.id}
          className="container-page scroll-mt-24 border-t py-12 sm:py-16"
        >
          <div className="grid gap-8 lg:grid-cols-[300px_1fr] lg:gap-16">
            <div className="lg:sticky lg:top-24 lg:self-start">
              <section.icon className="size-5 text-brand" />
              <h2 className="display-2 mt-4">{section.title}</h2>
            </div>

            <dl className="divide-y border-t">
              {section.items.map((item) => (
                <div key={item.q} className="py-5">
                  <dt className="text-[15px] font-medium">{item.q}</dt>
                  <dd className="mt-2 text-sm leading-relaxed text-pretty text-muted-foreground">
                    {item.a}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      ))}

      <section className="container-page pt-8">
        <div className="flex flex-col items-start gap-5 rounded-2xl bg-brand px-6 py-12 text-brand-foreground sm:items-center sm:px-10 sm:text-center">
          <p className="eyebrow text-white/80">¿Te quedó alguna duda?</p>
          <h2 className="display-2 max-w-xl text-balance">
            Pregúntanos antes de comprar
          </h2>
          <p className="max-w-md text-base text-pretty text-white/80">
            Te responde una persona del equipo, normalmente en minutos.
          </p>

          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            <a
              href={whatsAppInquiry(
                `Hola ${SITE.name}, tengo una duda antes de comprar.`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-success px-6 text-sm font-medium text-white transition-colors hover:bg-success/90"
            >
              <MessageCircle className="size-4" />
              <span className="tabular">{WHATSAPP_DISPLAY}</span>
            </a>

            <Link
              href="/productos"
              className="group inline-flex h-12 items-center gap-2 rounded-full border border-white/35 px-6 text-sm transition-colors hover:border-white hover:bg-white/10"
            >
              Ver el catálogo
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
