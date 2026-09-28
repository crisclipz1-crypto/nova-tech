import { BadgeCheck, BanknoteArrowDown, MessageCircle, Truck } from "lucide-react";

const REASONS = [
  {
    icon: BanknoteArrowDown,
    title: "Pago contra entrega, siempre",
    body: "No pedimos tarjeta, ni transferencia, ni datos bancarios. Abres la caja delante del mensajero y pagas en efectivo solo si todo está bien.",
  },
  {
    icon: Truck,
    title: "Llega en 1 a 3 días hábiles",
    body: "Despachamos el mismo día si confirmas antes de las 2 p.m. Cubrimos las 32 regiones del país y el envío es gratis desde $200.000.",
  },
  {
    icon: BadgeCheck,
    title: "Producto original con garantía",
    body: "Todo sale sellado y con 12 meses de garantía. Si algo falla, lo recogemos nosotros: no te toca ir a ninguna parte.",
  },
  {
    icon: MessageCircle,
    title: "Te responde una persona",
    body: "Escribes por WhatsApp y te contesta alguien del equipo, no un bot. Antes de comprar, durante el envío y después.",
  },
];

export function WhyUs() {
  return (
    <section className="bg-brand-muted py-16 sm:py-20">
      <div className="container-page">
        <div className="max-w-2xl">
          <p className="eyebrow text-brand">Por qué elegirnos</p>
          <h2 className="display-2 mt-3 text-balance">
            Comprar tecnología en línea no tiene por qué dar miedo
          </h2>
          <p className="mt-4 text-base leading-relaxed text-pretty text-muted-foreground">
            El riesgo de pagar antes y no recibir nada es real. Por eso lo
            quitamos de la ecuación: aquí el dinero cambia de manos cuando el
            producto ya está en las tuyas.
          </p>
        </div>

        {/* El fondo azul se ve a través de los huecos de 1px de la rejilla y
            hace de línea divisoria, sin necesidad de bordes. */}
        <ul className="mt-12 grid gap-px overflow-hidden rounded-xl bg-brand-soft sm:grid-cols-2">
          {REASONS.map(({ icon: Icon, title, body }) => (
            <li
              key={title}
              className="group bg-background p-6 transition-colors hover:bg-brand-muted/60 sm:p-8"
            >
              <Icon className="size-5 text-brand transition-transform duration-300 group-hover:-translate-y-0.5" />
              <h3 className="mt-4 text-lg font-medium tracking-[-0.02em]">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {body}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
