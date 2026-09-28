import Link from "next/link";
import { ArrowRight } from "lucide-react";

const STEPS = [
  {
    step: "01",
    title: "Eliges y pides",
    body: "Añades al carrito y dejas tus datos de entrega. No pedimos tarjeta en ningún momento.",
  },
  {
    step: "02",
    title: "Confirmamos por WhatsApp",
    body: "Te escribimos en minutos para verificar la dirección y decirte cuándo llega.",
  },
  {
    step: "03",
    title: "Recibes, revisas y pagas",
    body: "Abres la caja delante del mensajero. Si todo está bien, pagas en efectivo. Si no, lo devuelves ahí mismo.",
  },
];

export function HowItWorks() {
  return (
    <section className="bg-brand py-16 text-brand-foreground sm:py-20">
      <div className="container-page">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <p className="eyebrow text-white/80">Cómo funciona</p>
            <h2 className="display-2 mt-3 text-balance">
              Tres pasos y ni un solo dato bancario
            </h2>
          </div>
          <Link
            href="/como-funciona"
            className="group inline-flex items-center gap-2 text-sm text-white/85 transition-colors hover:text-white"
          >
            Ver el detalle
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <ol className="mt-12 grid gap-8 sm:grid-cols-3 sm:gap-6">
          {STEPS.map(({ step, title, body }) => (
            <li key={step} className="border-t border-white/25 pt-5">
              <p className="tabular font-mono text-xs tracking-[0.18em] text-white/80">
                {step}
              </p>
              <h3 className="mt-3 text-lg font-medium tracking-[-0.02em]">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-white/85">{body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
